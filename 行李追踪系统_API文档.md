# 行李全程追踪系统 API 文档

## 文档信息

- **版本**: v1.0.0
- **创建日期**: 2026-03-12
- **协议**: HTTPS
- **数据格式**: JSON
- **字符编码**: UTF-8

---

## 目录

1. [通用规范](#通用规范)
2. [认证授权](#认证授权)
3. [行李管理接口](#行李管理接口)
4. [航班管理接口](#航班管理接口)
5. [设备管理接口](#设备管理接口)
6. [预警管理接口](#预警管理接口)
7. [报表统计接口](#报表统计接口)
8. [外部系统接口](#外部系统接口)

---

## 通用规范

### 请求格式

```http
Content-Type: application/json
Authorization: Bearer {token}
X-Request-ID: {uuid}
```

### 响应格式

```json
{
  "code": 200,
  "message": "success",
  "data": {},
  "timestamp": 1709785600000,
  "requestId": "uuid"
}
```

### 状态码

| 状态码 | 说明 |
|-------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权 |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

### 分页参数

| 参数 | 类型 | 说明 | 默认值 |
|-----|------|------|-------|
| pageNum | int | 页码 | 1 |
| pageSize | int | 每页条数 | 20 |
| orderBy | string | 排序字段 | createTime |
| order | string | 排序方式(asc/desc) | desc |

### 分页响应

```json
{
  "code": 200,
  "data": {
    "list": [],
    "total": 100,
    "pageNum": 1,
    "pageSize": 20,
    "pages": 5
  }
}
```

---

## 认证授权

### 1. 用户登录

**接口地址**: `POST /api/v1/auth/login`

**请求参数**:

```json
{
  "username": "admin",
  "password": "encrypted_password",
  "captcha": "1234",
  "captchaKey": "uuid"
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 7200,
    "user": {
      "id": 1,
      "username": "admin",
      "realName": "系统管理员",
      "role": "ADMIN",
      "permissions": ["baggage:query", "baggage:manage"]
    }
  }
}
```

### 2. 刷新Token

**接口地址**: `POST /api/v1/auth/refresh`

**请求参数**:

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### 3. 用户登出

**接口地址**: `POST /api/v1/auth/logout`

---

## 行李管理接口

### 1. 行李查询

**接口地址**: `GET /api/v1/baggage`

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| baggageNo | string | 否 | 行李号 |
| flightNo | string | 否 | 航班号 |
| passengerName | string | 否 | 旅客姓名 |
| status | string | 否 | 状态 |
| startTime | string | 否 | 开始时间 |
| endTime | string | 否 | 结束时间 |

**响应示例**:

```json
{
  "code": 200,
  "data": {
    "list": [
      {
        "id": 1,
        "baggageNo": "B123456",
        "flightNo": "CA1234",
        "flightDate": "2026-03-12",
        "destination": "北京首都",
        "passengerName": "张三",
        "status": "SORTING",
        "statusName": "分拣中",
        "currentLocation": "分拣区A-03",
        "currentNode": "SORTING",
        "createTime": "2026-03-12T10:00:00",
        "updateTime": "2026-03-12T10:23:45",
        "rfidTag": "E200341502001080"
      }
    ],
    "total": 100
  }
}
```

### 2. 行李详情

**接口地址**: `GET /api/v1/baggage/{id}`

**响应示例**:

```json
{
  "code": 200,
  "data": {
    "id": 1,
    "baggageNo": "B123456",
    "flightNo": "CA1234",
    "flightDate": "2026-03-12",
    "destination": "北京首都",
    "passengerName": "张三",
    "passengerId": "110101199001011234",
    "seatNo": "12A",
    "status": "SORTING",
    "statusName": "分拣中",
    "currentLocation": "分拣区A-03",
    "currentNode": "SORTING",
    "rfidTag": "E200341502001080",
    "weight": 23.5,
    "size": "20寸",
    "specialType": null,
    "createTime": "2026-03-12T10:00:00",
    "updateTime": "2026-03-12T10:23:45",
    "tracks": [
      {
        "id": 1,
        "nodeCode": "CHECKIN",
        "nodeName": "值机柜台",
        "action": "值机托运",
        "location": "值机柜台A12",
        "operator": "值机员01",
        "deviceCode": "CK001",
        "trackTime": "2026-03-12T10:00:00",
        "remark": "正常托运"
      },
      {
        "id": 2,
        "nodeCode": "SECURITY",
        "nodeName": "安检通道",
        "action": "安检通过",
        "location": "安检通道A05",
        "operator": "安检员03",
        "deviceCode": "SC005",
        "trackTime": "2026-03-12T10:05:00",
        "remark": "安检正常"
      },
      {
        "id": 3,
        "nodeCode": "SORTING",
        "nodeName": "分拣系统",
        "action": "分拣中",
        "location": "分拣区A-03",
        "operator": null,
        "deviceCode": "RF003",
        "trackTime": "2026-03-12T10:15:00",
        "remark": "自动分拣"
      }
    ]
  }
}
```

### 3. 行李轨迹查询

**接口地址**: `GET /api/v1/baggage/{id}/tracks`

**响应示例**:

```json
{
  "code": 200,
  "data": [
    {
      "id": 1,
      "nodeCode": "CHECKIN",
      "nodeName": "值机柜台",
      "action": "值机托运",
      "location": "值机柜台A12",
      "operator": "值机员01",
      "deviceCode": "CK001",
      "deviceName": "值机柜台A12",
      "trackTime": "2026-03-12T10:00:00",
      "duration": 0,
      "remark": "正常托运",
      "images": []
    }
  ]
}
```

### 4. 行李状态更新

**接口地址**: `POST /api/v1/baggage/{id}/status`

**请求参数**:

```json
{
  "status": "LOADED",
  "location": "货舱B2",
  "operator": "装卸员01",
  "deviceCode": "LD002",
  "remark": "已装载"
}
```

### 5. 行李查找

**接口地址**: `POST /api/v1/baggage/search`

**请求参数**:

```json
{
  "baggageNo": "B123456",
  "flightNo": "CA1234",
  "passengerName": "张三"
}
```

**响应示例**:

```json
{
  "code": 200,
  "data": {
    "found": true,
    "baggage": {
      "id": 1,
      "baggageNo": "B123456",
      "currentLocation": "分拣区A-03",
      "status": "SORTING",
      "lastUpdateTime": "2026-03-12T10:23:45"
    },
    "suggestion": "行李正在分拣区A-03进行处理，预计10分钟后完成"
  }
}
```

---

## 航班管理接口

### 1. 航班列表

**接口地址**: `GET /api/v1/flights`

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| flightNo | string | 否 | 航班号 |
| flightDate | string | 否 | 航班日期 |
| destination | string | 否 | 目的地 |
| status | string | 否 | 状态 |

**响应示例**:

```json
{
  "code": 200,
  "data": {
    "list": [
      {
        "id": 1,
        "flightNo": "CA1234",
        "flightDate": "2026-03-12",
        "airline": "中国国际航空",
        "destination": "北京首都",
        "destinationCode": "PEK",
        "scheduledDeparture": "2026-03-12T11:00:00",
        "actualDeparture": null,
        "checkinCounter": "A01-A10",
        "baggageCarousel": "3",
        "gate": "A12",
        "status": "BOARDING",
        "statusName": "正在登机",
        "baggageCount": 156,
        "processedCount": 142
      }
    ],
    "total": 128
  }
}
```

### 2. 航班详情

**接口地址**: `GET /api/v1/flights/{id}`

### 3. 航班行李列表

**接口地址**: `GET /api/v1/flights/{id}/baggage`

### 4. 航班动态同步

**接口地址**: `POST /api/v1/flights/sync`

**请求参数**:

```json
{
  "flightNo": "CA1234",
  "flightDate": "2026-03-12",
  "status": "DELAYED",
  "actualDeparture": "2026-03-12T12:30:00",
  "delayReason": "天气原因"
}
```

---

## 设备管理接口

### 1. 设备列表

**接口地址**: `GET /api/v1/devices`

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| deviceType | string | 否 | 设备类型(RFID/PRINTER/SCANNER) |
| status | string | 否 | 状态 |
| location | string | 否 | 位置 |

**响应示例**:

```json
{
  "code": 200,
  "data": {
    "list": [
      {
        "id": 1,
        "deviceCode": "RF001",
        "deviceName": "RFID读写器-分拣区A01",
        "deviceType": "RFID",
        "deviceTypeName": "RFID读写器",
        "location": "分拣区A-01",
        "ipAddress": "192.168.1.101",
        "macAddress": "00:11:22:33:44:55",
        "status": "ONLINE",
        "statusName": "在线",
        "lastHeartbeat": "2026-03-12T10:30:00",
        "firmwareVersion": "v2.1.0",
        "createTime": "2026-01-01T00:00:00"
      }
    ],
    "total": 50
  }
}
```

### 2. 设备详情

**接口地址**: `GET /api/v1/devices/{id}`

### 3. 设备状态更新

**接口地址**: `POST /api/v1/devices/{id}/status`

**请求参数**:

```json
{
  "status": "OFFLINE",
  "reason": "网络故障"
}
```

### 4. 设备心跳

**接口地址**: `POST /api/v1/devices/{id}/heartbeat`

**请求参数**:

```json
{
  "timestamp": "2026-03-12T10:30:00",
  "status": "NORMAL",
  "data": {
    "readCount": 1234,
    "errorCount": 0
  }
}
```

### 5. 设备日志

**接口地址**: `GET /api/v1/devices/{id}/logs`

---

## 预警管理接口

### 1. 预警列表

**接口地址**: `GET /api/v1/alerts`

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| alertType | string | 否 | 预警类型 |
| level | string | 否 | 级别(LOW/MEDIUM/HIGH/CRITICAL) |
| status | string | 否 | 状态(UNHANDLED/HANDLING/HANDLED) |
| startTime | string | 否 | 开始时间 |
| endTime | string | 否 | 结束时间 |

**响应示例**:

```json
{
  "code": 200,
  "data": {
    "list": [
      {
        "id": 1,
        "alertNo": "ALT202603120001",
        "alertType": "TIMEOUT",
        "alertTypeName": "处理超时",
        "level": "HIGH",
        "levelName": "高",
        "title": "行李分拣超时",
        "content": "行李号 B123456 在分拣区停留超过30分钟",
        "baggageId": 1,
        "baggageNo": "B123456",
        "flightNo": "CA1234",
        "location": "分拣区A-03",
        "status": "UNHANDLED",
        "statusName": "未处理",
        "createTime": "2026-03-12T10:23:45",
        "handler": null,
        "handleTime": null,
        "handleResult": null
      }
    ],
    "total": 23
  }
}
```

### 2. 预警详情

**接口地址**: `GET /api/v1/alerts/{id}`

### 3. 处理预警

**接口地址**: `POST /api/v1/alerts/{id}/handle`

**请求参数**:

```json
{
  "handleResult": "已找到行李并重新分拣",
  "remark": "行李卡在传送带上，已清理"
}
```

### 4. 预警统计

**接口地址**: `GET /api/v1/alerts/statistics`

**响应示例**:

```json
{
  "code": 200,
  "data": {
    "total": 156,
    "unhandled": 23,
    "today": 12,
    "byType": {
      "TIMEOUT": 45,
      "DEVICE_FAULT": 23,
      "FLIGHT_DELAY": 34,
      "SORT_ERROR": 54
    },
    "byLevel": {
      "CRITICAL": 5,
      "HIGH": 34,
      "MEDIUM": 67,
      "LOW": 50
    }
  }
}
```

---

## 报表统计接口

### 1. 行李处理统计

**接口地址**: `GET /api/v1/statistics/baggage`

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| startDate | string | 是 | 开始日期 |
| endDate | string | 是 | 结束日期 |
| groupBy | string | 否 | 分组方式(day/hour) |

**响应示例**:

```json
{
  "code": 200,
  "data": {
    "total": 12456,
    "completed": 11892,
    "exception": 23,
    "avgProcessTime": 18.5,
    "trend": [
      {
        "date": "2026-03-12",
        "hour": 10,
        "total": 456,
        "completed": 432,
        "exception": 2
      }
    ],
    "byNode": {
      "CHECKIN": 12456,
      "SECURITY": 12450,
      "SORTING": 12380,
      "LOADING": 11900
    }
  }
}
```

### 2. 航班准点率统计

**接口地址**: `GET /api/v1/statistics/flight`

### 3. 设备运行统计

**接口地址**: `GET /api/v1/statistics/device`

### 4. 导出报表

**接口地址**: `POST /api/v1/statistics/export`

**请求参数**:

```json
{
  "reportType": "BAGGAGE_DAILY",
  "startDate": "2026-03-01",
  "endDate": "2026-03-12",
  "format": "EXCEL"
}
```

---

## 外部系统接口

### 1. 集成系统 - 航班计划同步

**接口地址**: `POST /api/v1/external/integration/flight-plan`

**请求参数**:

```json
{
  "flights": [
    {
      "flightNo": "CA1234",
      "flightDate": "2026-03-12",
      "airline": "CA",
      "destination": "PEK",
      "scheduledDeparture": "2026-03-12T11:00:00",
      "aircraftType": "B737",
      "checkinCounter": "A01-A10",
      "baggageCarousel": "3"
    }
  ]
}
```

### 2. 集成系统 - 航班动态同步

**接口地址**: `POST /api/v1/external/integration/flight-dynamic`

### 3. 集成系统 - 资源分配同步

**接口地址**: `POST /api/v1/external/integration/resource`

### 4. 离港系统 - 行李报文

**接口地址**: `POST /api/v1/external/dcs/baggage-message`

**请求参数**:

```json
{
  "messageType": "BPM",
  "flightNo": "CA1234",
  "flightDate": "2026-03-12",
  "baggage": [
    {
      "baggageNo": "B123456",
      "passengerName": "ZHANG/SAN",
      "seatNo": "12A",
      "destination": "PEK",
      "weight": 23.5,
      "tagNumber": "E200341502001080"
    }
  ]
}
```

### 5. 向集成系统推送行李保障进度

**接口地址**: `POST /api/v1/external/integration/baggage-progress`

**请求参数**:

```json
{
  "flightNo": "CA1234",
  "flightDate": "2026-03-12",
  "progress": {
    "checkinCompleted": true,
    "securityCompleted": true,
    "sortingCompleted": false,
    "loadingCompleted": false,
    "baggageCount": 156,
    "completedCount": 142
  }
}
```

---

## WebSocket 实时接口

### 连接地址

```
wss://api.example.com/ws/v1/baggage?token={token}
```

### 消息格式

```json
{
  "type": "BAGGAGE_UPDATE",
  "timestamp": 1709785600000,
  "data": {}
}
```

### 消息类型

| 类型 | 说明 |
|-----|------|
| BAGGAGE_UPDATE | 行李状态更新 |
| ALERT_NEW | 新预警 |
| DEVICE_STATUS | 设备状态变化 |
| FLIGHT_UPDATE | 航班动态更新 |

### 订阅主题

```json
{
  "action": "subscribe",
  "topics": ["baggage", "alert", "device"]
}
```

---

## 附录

### 行李状态枚举

| 状态码 | 说明 |
|-------|------|
| CHECKIN | 已值机 |
| SECURITY | 安检中 |
| SORTING | 分拣中 |
| LOADING | 装载中 |
| LOADED | 已装载 |
| TRANSPORT | 运输中 |
| UNLOADING | 卸载中 |
| UNLOADED | 已卸载 |
| DELIVERY | 提取中 |
| DELIVERED | 已提取 |

### 预警类型枚举

| 类型 | 说明 |
|-----|------|
| TIMEOUT | 处理超时 |
| DEVICE_FAULT | 设备故障 |
| FLIGHT_DELAY | 航班延误 |
| SORT_ERROR | 分拣错误 |
| SECURITY_EXCEPTION | 安检异常 |

### 设备类型枚举

| 类型 | 说明 |
|-----|------|
| RFID | RFID读写器 |
| PRINTER | 标签打印机 |
| SCANNER | 扫码设备 |
| SORTER | 分拣设备 |

---

## 更新日志

### v1.0.0 (2026-03-12)

- 初始版本发布
- 完成行李管理、航班管理、设备管理、预警管理、报表统计接口设计
- 完成外部系统集成接口设计
