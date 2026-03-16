import mongo
import java.util.Arrays;
import log;
import org.apache.commons.collections.CollectionUtils
import org.bson.Document;
import com.mongodb.client.model.Filters;
import org.bson.types.ObjectId;
import com.mongodb.client.result.UpdateResult;
import com.mongodb.client.AggregateIterable; 
try{
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
                String query_sql_customer = "select id,name,province,city,district,industry_type as industryType,0 as active,0 as total from identity.customer where  del_flag=0 and cooperation_org in (" + cooperationIds.join(",") + ")";
                if not_blank(customerName){
                    query_sql_customer = query_sql_customer + " and name='" + customerName +"'";
                }
                var customerResult = db.kw_identity.select(query_sql_customer);
                if (CollectionUtils.isNotEmpty(customerResult)) {
                    customerIds = customerResult.map((item) => "'"+item.name+ "'");
                }
            }
        }
    }  
    var customerStr = customerIds.join(','); 
    let pageObj = {
        pageSize: pageSize == 0 ? 10 : pageSize,
        page: page  == 0 ? 1 : page,
        data: [],
        total: 0
    }
    //查询postgresql
    var extendEntCondition = "";
    if (extendEnt){
        String extendEntStr = extendEnt;
        extendEntArr = extendEntStr.split(",");
        for ( index,item in extendEntArr) {
            extendEntCondition = extendEntCondition + " or tn.title like '%"+ item +"%'";
        }
    }
    var active = TRUE;
    var sql = """
    from (
    select tn.title, d.* from tenant as tn , device as d where d.tenant_id=tn.id
    AND (tn.title in ("""+customerStr+""")  """+extendEntCondition+""") 
    and (d.additional_info IS NULL OR  json_extract_path_text(CAST(d.additional_info AS json), 'gateway') IS NULL OR  json_extract_path_text(CAST(d.additional_info AS json), 'gateway') = 'false') 
    ) t1 left join (
        SELECT d.tenant_id,d.id, 1 as onlineStatus FROM device d , attribute_kv atkv WHERE d.id = atkv.entity_id AND (
                (atkv.attribute_key = 'client_active' AND atkv.bool_v = TRUE AND atkv.attribute_type = 'CLIENT_SCOPE') 
                OR (atkv.attribute_key = 'active' AND atkv.bool_v = TRUE AND atkv.attribute_type = 'SERVER_SCOPE')
            ) AND  (
                d.additional_info IS NULL OR json_extract_path_text(CAST(d.additional_info AS json), 'gateway') IS NULL 
                OR json_extract_path_text(CAST(d.additional_info AS json), 'gateway') = 'false'
            ) 
    ) t2 on t1.id=t2.id 
    left join attribute_kv t3 on t1.id=t3.entity_id and t3.attribute_key='lastActivityTime'
    where 1=1 
    """;
    if (tenantName!=null && tenantName!=""){
        sql = sql + "and t1.title = '" + tenantName + "'";
    }
    if (tenantId!=null && tenantId!=""){
        sql = sql + " and t1.tenant_id = '" + tenantId + "'";
    }
    if (deviceName!=null && deviceName!=""){
        sql = sql + " AND (LOWER(t1.search_text) LIKE LOWER(CONCAT('%', '"+ deviceName +"', '%'))  OR LOWER(t1.label) LIKE LOWER(CONCAT('%', '"+ deviceName +"', '%'))) "
    }
    

    var pageSql = "select t1.*,t2.*,t3.long_v as lastActivityTime " + sql;
    // var pageSql = "select * from tenant"
    pageSql = pageSql + " limit " + pageObj.pageSize + " OFFSET " + ((pageObj.page-1) * pageObj.pageSize);
    var customerDeviceList =  db.postgresql_prod.select(pageSql)
    var resultList2 = [];
    for ( index,item in customerDeviceList) {
        resultList2.add(item);
    
    }
    pageObj.data = resultList2;
    var totalSql = "select count(1) " + sql;
    pageObj.total =  db.postgresql_prod.select(totalSql).count
    return pageObj;
} catch (e) {
    log.error("查询失败", e)
    // return response.json({
    //     success: false,
    //     message: '查询失败'
    // });
}