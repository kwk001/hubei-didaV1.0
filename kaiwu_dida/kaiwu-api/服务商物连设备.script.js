import org.apache.commons.collections.CollectionUtils

/** 
 * 背景：ioc平台需要根据服务商以及区域维度来统计设备信息，由于服务商cooperation表及客户customer表在mysql中。设备数据在pg中，所以通过此接口实现数据组合
 * 1. 根据服务商path，在mysql中cooperation表查询出此服务商以及其下属服务商
 * 2. 根据1中查找到的服务商集合，在mysql中customer查询出服务商的下属企业，根据参数决定是否加上区域条件
 * 3. 根据2中查询到的企业id，查询pg库，通过relation_mapping查找出tb中租户与开物云企业的关系，通过device及attribute_kv表查询出设备的信息
 * 4. 根据3中查询的设备数据，进行数据聚合。
 * 
*/
var region_enum = ["city","district","province","field"];
var devices={
    deviceCount:{
        total:0,
        active:0,
        inactive:0
    }
};

if(ifnull(body.deviceActiveSort,0)>0){
    devices.deviceActiveSortList=[]; 
}
var deviceRegionLevel="province";
if(not_blank(body.deviceRegionLevel)){
    devices.deviceRegion={}
}
String customer_id = body.customerId;
int device_total=0;
int device_active=0;
if not_blank(customer_id) {
    //1.查询服务商
    String query_sql_cooperation_byCId = "select path from identity.cooperation where customer_id= '" + customer_id + "' and del_flag=0";
    var  cooperationPathResult = db.kw_identity.cache('query_sql_cooperation_byCId',3600000).select(query_sql_cooperation_byCId);// 使用缓存,有效期为1小时
    if(CollectionUtils.isNotEmpty(cooperationPathResult)&&not_blank(cooperationPathResult.get(0).path)){
        String query_sql_cooperation = "select id from identity.cooperation where path like '" + cooperationPathResult.get(0).path + "%' and del_flag=0";
        var  cooperationResult = db.kw_identity.select(query_sql_cooperation);
        if (CollectionUtils.isNotEmpty(cooperationResult)) {
            //2.查询企业
            var  cooperationIds = cooperationResult.map((item) => "'"+item.id+ "'");
            String query_sql_customer = "select id,name,province,city,district,industry_type as industryType,0 as active,0 as total from identity.customer where  del_flag=0 and cooperation_org in (" + cooperationIds.join(",") + ")";
            if (not_blank(body.province)) {
                query_sql_customer += " and province='" + body.province+"'";
                deviceRegionLevel="city";
            }
            if (not_blank(body.city)) {
                query_sql_customer += " and city='" + body.city+"'";
                deviceRegionLevel="district";
            }
            if (not_blank(body.district)) {
                query_sql_customer += " and district='" + body.district+"'";
                deviceRegionLevel="district";
            }
            var customerResult = db.kw_identity.select(query_sql_customer);
            if (CollectionUtils.isNotEmpty(customerResult)) {
                var  customerIds = customerResult.map((item) => "'"+item.id+ "'");
                var  common_filter_sql=customerIds.join(",")+")) and ( d.additional_info is null or  json_extract_path_text(cast(d.additional_info as json),'gateway') is null or  json_extract_path_text(cast(d.additional_info as json),'gateway') = 'false' )  group by rm.kw_id";
                //3.查询企业设备总数据
                String query_sql_device_total="""
                select count(distinct d.id) as num,rm.kw_id as customerid from device d,relation_mapping rm  where  
                (rm.tb_id =d.tenant_id and rm.kw_entity_type='CUSTOMER' and rm.tb_entity_type ='TENANT' and rm.kw_id in (
                """;
                query_sql_device_total+=common_filter_sql;
                var device_total_result=db.postgresql_prod.select(query_sql_device_total);
                if(CollectionUtils.isNotEmpty(device_total_result)){
                    var device_total_map=device_total_result.toMap(k => k.customerid, v => v.num);
                    //3.查询企业在线设备数据
                    String query_sql_device_active="""
                    select count(distinct d.id) as num,rm.kw_id as customerid from device d,relation_mapping rm,attribute_kv atkv where   d.id = atkv.entity_id
                    and (
                        (atkv.attribute_key = 'client_active' and atkv.bool_v = true and atkv.attribute_type = 'CLIENT_SCOPE')
                        or (atkv.attribute_key = 'active' and atkv.bool_v = true and atkv.attribute_type = 'SERVER_SCOPE')
                        )
                        and (rm.tb_id =d.tenant_id and rm.kw_entity_type='CUSTOMER' and rm.tb_entity_type ='TENANT' and rm.kw_id in (
                    """;
                    query_sql_device_active+=common_filter_sql;
                    var device_active_result=db.postgresql_prod.select(query_sql_device_active);
                    var device_active_map={};
                    if(CollectionUtils.isNotEmpty(device_active_result)){
                        device_active_map=device_active_result.toMap(k => k.customerid, v => v.num);
                    }
                    for(customer in customerResult){
                        var deviceTotal=ifnull(device_total_map.get(customer.id),0);
                        var deviceActive=ifnull(device_active_map.get(customer.id),0);
                        if(0<deviceTotal){
                            customer.total=deviceTotal;
                            device_total+=deviceTotal;
                        }
                        if(0<deviceActive){
                            customer.active=deviceActive;
                            device_active+=deviceActive;
                        }
                        if(is_blank(customer.province)){
                            customer.province="其他";
                        }
                        if(is_blank(customer.city)){
                            customer.city="其他";
                        }
                        if(is_blank(customer.district)){
                            customer.district="其他";
                        }
                    }
                }
                devices.deviceCount.total=device_total;
                devices.deviceCount.active=device_active;
                devices.deviceCount.inactive=(device_total-device_active);
                //是否有企业设备信息排行
                if(ifnull(body.deviceActiveSort,0)>0){
                    devices.deviceActiveSortList=customerResult.sort((a,b)=>b.active-a.active).limit(body.deviceActiveSort); 
                }
                //是否有区域设备
                if(not_blank(body.deviceRegionLevel)&&region_enum.some(e => e.equals(body.deviceRegionLevel))){
                    if(!"field".equals(body.deviceRegionLevel)){
                        deviceRegionLevel=body.deviceRegionLevel;
                    }
                    devices.deviceRegion=customerResult.group(item=>item[deviceRegionLevel],list=>{
                            active : list.map(v=>v.active).sum(),
                            total :  list.map(v=>v.total).sum(),
                            inactive: list.map(v=>v.total-v.active).sum(),
                            connectCustomerNum: list.filter(v=>v.total>0).size(),
                            registerCustomerNum: list.size()
                    })
                }
                
            }
        }
        return devices
    }
}


return devices