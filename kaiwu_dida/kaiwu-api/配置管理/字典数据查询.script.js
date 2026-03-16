import http;
import log;
import '@/common/getFormIdByCodes' as getFormIdByCodes;
import response;

// 接口名称：字典数据查询
// 接口类型：POST
// 接口路径：/api/config/dict/query
// 接口功能：批量查询字典数据
// 
// 参数说明：
// - dictTypes (Array<String>): body.dictTypes 获取 - 字典类型列表
//
// 返回值：
// {
//   code: 0,
//   data: {
//     "dictType1": [
//       { label: "选项1", value: "code1", color: "#fff", icon: "xxx" },
//       ...
//     ],
//     "dictType2": [...]
//   }
// }

try {
    var formMap = getFormIdByCodes(["CM_shujuzidian"]);
    
    var dictTypes = body.dictTypes || [];
    
    if (!dictTypes || dictTypes.length == 0) {
        return response.json({
            code: -1,
            message: '缺少必要参数：dictTypes',
            data: null
        });
    }
    
    log.info('字典数据查询接口被调用，类型数：{}', dictTypes.length);

    var authorization = (header && header.Authorization) || (header && header.authorization);

    // 批量查询字典数据
    var requestBody = {
        formId: formMap['CM_shujuzidian'],
        conditionFilter: {
            conditionType: "and",
            conditions: [{
                field: "dictType",
                conditionOperator: "eqa",
                conditionValues: dictTypes
            }, {
                field: "isEnable",
                conditionOperator: "eq",
                conditionValues: ["启用"]
            }]
        },
        page: {
            current: 1,
            size: 1000,
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
    
    var dictList = [];
    if (result && result.code == 200 && result.result && result.result.records) {
        dictList = result.result.records;
    }
    
    // 按字典类型分组
    var dictData = {};
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
            isDefault: dict.is_default == "是",
            remark: dict.remark
        });
    }
    
    // 确保所有请求的类型都有返回（即使为空数组）
    for (dictType in dictTypes) {
        if (!dictData[dictType]) {
            dictData[dictType] = [];
        }
    }
    
    // 统计返回的类型数
    var typeCount = 0;
    for (key in dictData) {
        typeCount = typeCount + 1;
    }
    
    log.info('字典数据查询完成，返回类型数：{}', typeCount);

    return response.json({
        code: 0,
        message: '字典数据查询成功',
        data: dictData
    });

} catch (e) {
    log.error('字典数据查询出错', e);
    return response.json({
        code: -1,
        message: '字典数据查询失败：' + e.message,
        data: null
    });
}