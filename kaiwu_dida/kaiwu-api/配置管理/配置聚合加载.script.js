import http;
import log;
import org.bson.Document;
import '@/common/getFormIdByCodes' as getFormIdByCodes;
import java.util.ArrayList;
import response;

// 接口名称：配置聚合加载
// 接口类型：POST
// 接口路径：/api/config/load-all
// 接口功能：一次性加载所有配置（全局初始化 + 指定页面配置）
// 
// 参数说明：
// - pageCodes (Array<String>): body.pageCodes 获取 - 需要加载的页面编码列表，可选
//
// 返回值：
// {
//   code: 0,
//   message: "加载成功",
//   data: {
//     activeProject: {...},           // 激活的项目配置
//     appConfigs: [...],              // 应用配置列表
//     pageConfigs: {...},             // 页面配置 (pageCode -> config)
//     dictData: {...}                 // 字典数据 (dictType -> options[])
//   }
// }
//
// 性能优化说明：
// - 原 kaiwu-dataservice 需要 40-50 次 HTTP API 调用
// - 本接口仅需 1 次 HTTP 调用，内部 4 次 MongoDB 查询
// - 功能配置和API路由直接从页面配置子表单获取，减少2次查询
// - 性能提升约 98%

try {
    // 获取真实表名（优化：去掉CM_yewugongneng和CM_APIluyou）
    var formMap = getFormIdByCodes([
        "CM_xiangmupeizhi",
        "CM_yingyongpeizhi",
        "CM_yemianpeizhi",
        "CM_shujuzidian"
    ]);

    var pageCodes = body.pageCodes || [];

    log.info('配置聚合加载接口被调用，页面编码：{}', pageCodes);

    var authorization = (header && header.Authorization) || (header && header.authorization);

    // ========== 1. 项目配置查询 ==========
    var activeProject = null;
    var projectRequestBody = {
        formId: formMap['CM_xiangmupeizhi'],
        conditionFilter: {
            conditionType: "and",
            conditions: [{
                field: "status",
                conditionOperator: "eq",
                conditionValues: ["启用"]
            }]
        },
        page: {
            current: 1,
            size: 1,
            pages: 0,
            total: 1
        },
        sorts: []
    };
    var projectResult = http.connect("http://kaiwu-form-engine-core:18666/formEngine/formData/query")
        .body(projectRequestBody)
        .header("Authorization", authorization)
        .post()
        .getBody();
    if (projectResult && projectResult.code == 200 && projectResult.result && projectResult.result.records && projectResult.result.records.size() > 0) {
        activeProject = projectResult.result.records.get(0);
    }

    log.info('项目配置查询完成，项目：{}', activeProject ? activeProject.projectName : '无');

    // ========== 2. 应用配置批量查询 ==========
    var appConfigCodes = [];
    if (activeProject && activeProject.appConfigList) {
        for (item in activeProject.appConfigList) {
            if (item.appConfigCode) {
                appConfigCodes.push(item.appConfigCode);
            }
        }
    }

    var appConfigs = [];
    if (appConfigCodes.length > 0) {
        var appRequestBody = {
            formId: formMap['CM_yingyongpeizhi'],
            conditionFilter: {
                conditionType: "and",
                conditions: [{
                        field: "appConfigCode",
                        conditionOperator: "eqa",
                        conditionValues: appConfigCodes
                    },
                    {
                        field: "appConfigStatus",
                        conditionOperator: "eq",
                        conditionValues: ["启用"]
                    }
                ]
            },
            page: {
                current: 1,
                size: 1000,
                pages: 0,
                total: 1
            },
            sorts: []
        };
        var appResult = http.connect("http://kaiwu-form-engine-core:18666/formEngine/formData/query")
            .body(appRequestBody)
            .header("Authorization", authorization)
            .post()
            .getBody();
        if (appResult && appResult.code == 200 && appResult.result && appResult.result.records) {
            appConfigs = appResult.result.records;
        }
    }

    log.info('应用配置查询完成，数量：{}', appConfigs.length);

    // 从应用配置中收集可用页面编码
    var availablePageCodes = [];
    for (appConfig in appConfigs) {
        if (appConfig.pageConfigList) {
            for (page in appConfig.pageConfigList) {
                if (page.instanceFormCode) {
                    availablePageCodes.push(page.instanceFormCode);
                }
            }
        }
    }

    // ========== 3. 页面配置批量查询 ==========
    var allPageCodes = [];
    for (code in pageCodes) {
        if (allPageCodes.indexOf(code) == -1) {
            allPageCodes.push(code);
        }
    }
    for (code in availablePageCodes) {
        if (allPageCodes.indexOf(code) == -1) {
            allPageCodes.push(code);
        }
    }

    var pageConfigs = [];

    if (allPageCodes.length > 0) {
        log.info("allPageCodes:{}", allPageCodes);
        var pageRequestBody = {
            formId: formMap['CM_yemianpeizhi'],
            conditionFilter: {
                conditionType: "and",
                conditions: [{
                        field: "instanceFormCode",
                        conditionOperator: "eqa",
                        conditionValues: allPageCodes
                    },
                    {
                        field: "formStatus",
                        conditionOperator: "eq",
                        conditionValues: ["启用"]
                    }
                ]
            },
            page: {
                current: 1,
                size: 1000,
                pages: 0,
                total: 1
            },
            sorts: []
        };
        var pageResult = http.connect("http://kaiwu-form-engine-core:18666/formEngine/formData/query")
            .body(pageRequestBody)
            .header("Authorization", authorization)
            .post()
            .getBody();
        if (pageResult && pageResult.code == 200 && pageResult.result && pageResult.result.records) {
            pageConfigs = pageResult.result.records;
        }
    }

    log.info('页面配置查询完成，数量：{}', pageConfigs.length);

    // ========== 4. 字典数据批量查询 ==========
    var dictTypes = [];
    for (page in pageConfigs) {
        if (page.dictTypeList) {
            for (item in page.dictTypeList) {
                if (item.dictType && dictTypes.indexOf(item.dictType) == -1) {
                    dictTypes.push(item.dictType);
                }
            }
        }
    }

    var dictData = {};
    if (dictTypes.length > 0) {
        log.info("dictTypes:{}",dictTypes);
        var dictRequestBody = {
            formId: formMap['CM_shujuzidian'],
            conditionFilter: {
                conditionType: "and",
                conditions: [{
                        field: "dictType",
                        conditionOperator: "eqa",
                        conditionValues: dictTypes
                    },
                    {
                        field: "isEnable",
                        conditionOperator: "eq",
                        conditionValues: ["启用"]
                    }
                ]
            },
            page: {
                current: 1,
                size: 1000,
                pages: 0,
                total: 1
            },
            sorts: []
        };
        var dictResult = http.connect("http://kaiwu-form-engine-core:18666/formEngine/formData/query")
            .body(dictRequestBody)
            .header("Authorization", authorization)
            .post()
            .getBody();

        var dictList = [];
        if (dictResult && dictResult.code == 200 && dictResult.result && dictResult.result.records) {
            dictList = dictResult.result.records;
        }

        for (dict in dictList) {
            var dictType = dict.dictType;
            if (!dictData[dictType]) {
                dictData[dictType] = [];
            }
            dictData[dictType].push({
                label: dict.dictItem,
                value: dict.dictItemCode,
                color: dict.color,
                icon: dict.icon,
                isDefault: dict.is_default == "是"
            });
        }
    }

    log.info('字典数据查询完成，类型数：{}', dictTypes.length);

    // ========== 5. 组装每个页面的完整配置（直接使用子表单数据） ==========
    var pageLoadedConfigs = {};
    var totalFuncCount = 0;
    var totalApiCount = 0;

    for (page in pageConfigs) {
        var pageCode = page.instanceFormCode;
        var baseFormCode = page.formCode || pageCode;
        var isInstance = pageCode != baseFormCode;

        // 直接从页面配置的子表单获取功能配置（过滤启用状态）
        var pageFuncs = [];
        if (page.funcConfigList) {
            for (func in page.funcConfigList) {
                if (func.funcStatus == "启用") {
                    pageFuncs.push({
                        funcCode: func.funcCode,
                        funcName: func.funcName,
                        funcStatus: func.funcStatus,
                        funcExpression: func.funcExpression,
                        expressionParams: func.expressionParams,
                        funcDesc: func.funcDesc,
                        formCode: func.funcConfigFormCode || baseFormCode
                    });
                }
            }
        }
        totalFuncCount = totalFuncCount + pageFuncs.length;

        // 直接从页面配置的子表单获取API路由配置（过滤启用状态）
        var pageApis = [];
        if (page.apiUrlCfgList) {
            for (api in page.apiUrlCfgList) {
                if (api.apiStatus == "启用") {
                    pageApis.push({
                        apiName: api.apiName,
                        apiUrl: api.apiUrl,
                        locationValue: api.locationValue,
                        apiJson: api.apiJson,
                        apiStatus: api.apiStatus,
                        description: api.description
                    });
                }
            }
        }
        totalApiCount = totalApiCount + pageApis.length;

        // 收集该页面的字典类型（过滤启用状态）
        var pageDictTypes = [];
        if (page.dictTypeList) {
            for (item in page.dictTypeList) {
                if (item.dictType && item.dicStatus == "启用") {
                    pageDictTypes.push(item.dictType);
                }
            }
        }

        pageLoadedConfigs[pageCode] = {
            formCode: pageCode,
            formName: page.instanceFormName || page.formName || pageCode,
            isInstance: isInstance,
            baseFormCode: isInstance ? baseFormCode : null,
            functions: pageFuncs,
            apiRoutes: pageApis,
            dictTypes: pageDictTypes
        };
    }

    // 统计页面配置数量
    var pageConfigCount = 0;
    for (key in pageLoadedConfigs) {
        pageConfigCount = pageConfigCount + 1;
    }

    log.info('页面配置组装完成，页面数：{}，功能数：{}，API数：{}', pageConfigCount, totalFuncCount, totalApiCount);

    // ========== 6. 返回响应 ==========
    return response.json({
        code: 0,
        message: '配置加载成功',
        data: {
            activeProject: activeProject,
            appConfigs: appConfigs,
            availablePageCodes: availablePageCodes,
            pageConfigs: pageLoadedConfigs,
            dictData: dictData,
            stats: {
                projectCount: activeProject ? 1 : 0,
                appConfigCount: appConfigs.length,
                pageConfigCount: pageConfigCount,
                funcConfigCount: totalFuncCount,
                apiConfigCount: totalApiCount,
                dictTypeCount: dictTypes.length,
                mongoQueries: 4
            }
        }
    });

} catch (e) {
    log.error('配置聚合加载出错', e);
    return response.json({
        code: -1,
        message: '配置加载失败：' + e.message,
        data: null
    });
}