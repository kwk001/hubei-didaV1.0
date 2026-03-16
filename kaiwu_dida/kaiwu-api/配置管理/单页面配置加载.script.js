import http;
import log;
import org.bson.Document;
import '@/common/getFormIdByCodes' as getFormIdByCodes;
import response;

// 接口名称：单页面配置加载
// 接口类型：POST
// 接口路径：/api/config/page/load
// 接口功能：加载指定页面的完整配置（功能配置、API配置、字典数据）
// 
// 参数说明：
// - pageCode (String): body.pageCode 获取 - 页面编码（instanceFormCode）
//
// 返回值：
// {
//   code: 0,
//   message: "加载成功",
//   data: {
//     formCode: "xxx",
//     formName: "页面名称",
//     isInstance: true/false,
//     baseFormCode: "xxx",
//     functions: [...],
//     apiRoutes: [...],
//     dictTypes: [...],
//     dictData: {...}
//   }
// }
//
// 性能优化说明：
// - 功能配置、API路由、字典类型直接从页面配置子表单获取
// - 仅需 1 次 HTTP 调用
// - 子表单数据按状态过滤（启用）

try {
    var formMap = getFormIdByCodes([
        "CM_yemianpeizhi"
    ]);
    
    var pageCode = body.pageCode;
    
    if (!pageCode) {
        return response.json({
            code: -1,
            message: '缺少必要参数：pageCode',
            data: null
        });
    }
    
    log.info('单页面配置加载接口被调用，页面编码：{}', pageCode);

    var authorization = (header && header.Authorization) || (header && header.authorization);

    // ========== 1. 查询页面配置 ==========
    var requestBody = {
        formId: formMap['CM_yemianpeizhi'],
        conditionFilter: {
            conditionType: "and",
            conditions: [{
                field: "instanceFormCode",
                conditionOperator: "eq",
                conditionValues: [pageCode]
            }, {
                field: "formStatus",
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
    var result = http.connect("http://kaiwu-form-engine-core:18666/formEngine/formData/query")
        .body(requestBody)
        .header("Authorization", authorization)
        .post()
        .getBody();
    
    var pageConfig = null;
    if (result && result.code == 200 && result.result && result.result.records && result.result.records.size() > 0) {
        pageConfig = result.result.records.get(0);
    }
    
    if (!pageConfig) {
        return response.json({
            code: -1,
            message: '页面配置不存在或未启用：' + pageCode,
            data: null
        });
    }
    
    // 判断是否为实例页面
    var isInstance = pageConfig.instanceFormCode && 
                     pageConfig.instanceFormCode != pageConfig.formCode;
    var baseFormCode = pageConfig.formCode || pageCode;
    
    log.info('页面配置查询完成，是否实例页面：{}，基础页面：{}', isInstance, baseFormCode);

    // ========== 2. 从子表单获取功能配置（过滤启用状态）==========
    var mergedFuncs = [];
    if (pageConfig.funcConfigList) {
        for (func in pageConfig.funcConfigList) {
            if (func.funcStatus == "启用") {
                var funcItem = {};
                funcItem["funcCode"] = func.funcCode;
                funcItem["funcName"] = func.funcName;
                funcItem["funcStatus"] = func.funcStatus;
                funcItem["funcExpression"] = func.funcExpression;
                funcItem["expressionParams"] = func.expressionParams;
                funcItem["funcDesc"] = func.funcDesc;
                funcItem["formCode"] = func.funcConfigFormCode || baseFormCode;
                mergedFuncs.push(funcItem);
            }
        }
    }
    
    log.info('功能配置加载完成，数量：{}', mergedFuncs.length);

    // ========== 3. 从子表单获取API路由配置（过滤启用状态）==========
    var mergedApis = [];
    if (pageConfig.apiUrlCfgList) {
        for (api in pageConfig.apiUrlCfgList) {
            if (api.apiStatus == "启用") {
                var apiItem = {};
                apiItem["apiName"] = api.apiName;
                apiItem["apiUrl"] = api.apiUrl;
                apiItem["locationValue"] = api.locationValue;
                apiItem["apiJson"] = api.apiJson;
                apiItem["apiStatus"] = api.apiStatus;
                apiItem["description"] = api.description;
                mergedApis.push(apiItem);
            }
        }
    }
    
    log.info('API配置加载完成，数量：{}', mergedApis.length);

    // ========== 4. 从子表单获取字典数据（过滤启用状态，按类型分组）==========
    var dictTypes = [];
    var dictData = {};
    if (pageConfig.dictTypeList) {
        for (dictItem in pageConfig.dictTypeList) {
            if (dictItem.dicStatus == "启用" && dictItem.dictType) {
                // 收集字典类型
                if (dictTypes.indexOf(dictItem.dictType) == -1) {
                    dictTypes.push(dictItem.dictType);
                }
                // 按类型分组字典数据
                var dictType = dictItem.dictType;
                if (!dictData[dictType]) {
                    dictData[dictType] = [];
                }
                dictData[dictType].push({
                    label: dictItem.dictItem,
                    value: dictItem.dictItemCode,
                    parentDictType: dictItem.parentDictType
                });
            }
        }
    }
    
    log.info('字典数据加载完成，类型数：{}', dictTypes.length);

    // ========== 5. 返回响应 ==========
    return response.json({
        code: 0,
        message: '页面配置加载成功',
        data: {
            formCode: pageCode,
            formName: pageConfig.instanceFormName || pageConfig.formName || pageCode,
            isInstance: isInstance,
            baseFormCode: isInstance ? baseFormCode : null,
            functions: mergedFuncs,
            apiRoutes: mergedApis,
            dictTypes: dictTypes,
            dictData: dictData
        }
    });

} catch (e) {
    log.error('单页面配置加载出错', e);
    return response.json({
        code: -1,
        message: '页面配置加载失败：' + e.message,
        data: null
    });
}