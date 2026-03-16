import java.util.Arrays;
import log;
import org.apache.commons.collections.CollectionUtils
// let pageObj = {
//     pageSize: pageSize == 0 ? 10 : pageSize,
//     page: page  == 0 ? 1 : page,
//     data: [],
//     total: 0
// }
// var startIndex = (pageObj.page-1) * pageObj.pageSize;
var  customerIds;
if not_blank(customerId) {
    //1.查询服务商
    String query_sql_cooperation_byCId = "select path from identity.cooperation where customer_id= '" + customerId + "' and del_flag=0";
    var  cooperationPathResult = db.kw_identity.cache('query_sql_cooperation_byCId',3600000).select(query_sql_cooperation_byCId);// 使用缓存,有效期为1小时
    if(CollectionUtils.isNotEmpty(cooperationPathResult)&&not_blank(cooperationPathResult.get(0).path)){
        String query_sql_cooperation = "select id from identity.cooperation where path like '" + cooperationPathResult.get(0).path + "%' and del_flag=0";
        var  cooperationResult = db.kw_identity.select(query_sql_cooperation);
        if (CollectionUtils.isNotEmpty(cooperationResult)) {
            //2.查询企业
            var  cooperationIds = cooperationResult.map((item) => "'"+item.id+ "'");
            String base_sql_customer = "from identity.customer where  del_flag=0 and cooperation_org in (" + cooperationIds.join(",") + ")";
            if not_blank(customerName){
                base_sql_customer = base_sql_customer + " and name='" + customerName +"'";
            }
            String query_sql_customer = """
            select id,name,province,city,district,industry_type as industryType,0 as active,0 as total 
                ${base_sql_customer}
            """;
            var customerResult = db.kw_identity.select(query_sql_customer);
            if (CollectionUtils.isNotEmpty(customerResult)) {
                customerIds = customerResult.map((item) => "'"+item.name+ "'");
            }
        }
    }
}  
var customerStr = customerIds.join(','); 
//查询postgresql
var extendEntCondition = "";
if (extendEnt){
    String extendEntStr = extendEnt;
    extendEntArr = extendEntStr.split(",");
    for ( index,item in extendEntArr) {
        extendEntCondition = extendEntCondition + " or tn.title like '%"+ item +"%'";
    }
}
var sql = """
select t1.deviceCount from (
        select 1111 as tenant_id, count(d.name) as deviceCount, 0 as activeDeviceCount  from device as d,tenant as tn where d.tenant_id=tn.id AND (tn.title in ("""+customerStr+""")  """+extendEntCondition+""") and (d.additional_info IS NULL OR  json_extract_path_text(CAST(d.additional_info AS json), 'gateway') IS NULL OR  json_extract_path_text(CAST(d.additional_info AS json), 'gateway') = 'false') 
) t1 
"""
var customerDeviceCount =  db.postgresql_prod.select(sql)
var customerDeviceCountArr = [];
let resultList2={
    deviceCount:  0,
    entcount: 0,
    activedevicecount: 0,
    customerDeviceArr: [],
    districtDeviceArr: []
};
for ( index,item in customerDeviceCount) {
    resultList2.deviceCount = item.devicecount;
   
}
sql = """
select t1.tenant_id,t1.title, t1.deviceCount,COALESCE(t2.activeDeviceCount, 0) as activeDeviceCount from (
        select d.tenant_id,tn.title, count(d.name) as deviceCount, 0 as activeDeviceCount  from device as d,tenant as tn where d.tenant_id=tn.id AND (tn.title in ("""+customerStr+""")   """+extendEntCondition+""") and (d.additional_info IS NULL OR  json_extract_path_text(CAST(d.additional_info AS json), 'gateway') IS NULL OR  json_extract_path_text(CAST(d.additional_info AS json), 'gateway') = 'false') group by tn.title,d.tenant_id order by deviceCount desc
) t1 
left join(
    SELECT d.tenant_id,count(DISTINCT d.id) as activeDeviceCount FROM device d , attribute_kv atkv WHERE d.id = atkv.entity_id AND (
            (atkv.attribute_key = 'client_active' AND atkv.bool_v = TRUE AND atkv.attribute_type = 'CLIENT_SCOPE') 
            OR (atkv.attribute_key = 'active' AND atkv.bool_v = TRUE AND atkv.attribute_type = 'SERVER_SCOPE')
        ) AND  (
            d.additional_info IS NULL OR json_extract_path_text(CAST(d.additional_info AS json), 'gateway') IS NULL 
            OR json_extract_path_text(CAST(d.additional_info AS json), 'gateway') = 'false'
        ) group by d.tenant_id
) t2 on t1.tenant_id=t2.tenant_id;
"""
var customerDeviceCount =  db.postgresql_prod.select(sql)
resultList2.entcount = customerDeviceCount.size();
resultList2.customerDeviceArr = customerDeviceCount;
Integer activedevicecount = 0;
for ( index,item in customerDeviceCount) {
    activedevicecount = activedevicecount + item.activedevicecount;
   
}
resultList2.activedevicecount = activedevicecount;
return resultList2;
