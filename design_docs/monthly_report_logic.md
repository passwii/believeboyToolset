# 月报计算逻辑设计文档

## 文档概述

本文档描述了业务工具平台中月报生成功能的计算逻辑。月报基于亚马逊的付款范围报告（Payment Range Report）生成，对收入、支出和其他类别进行详细分类计算。

## 数据源

月报的主要数据源为亚马逊的 **付款范围报告**（Payment Range Report），该报告为CSV格式，包含以下关键字段：
- `type`：交易类型（Order, Refund, Adjustment, Service Fee, FBA Inventory Fee 等）
- `description`：交易描述
- `product sales`：产品销售额
- `shipping credits`：运费抵免
- `promotional rebates`：促销返点
- `selling fees`：销售佣金
- `fba fees`：FBA配送费
- `total`：总额
- `quantity`：数量
- `sku`：SKU

## 计算逻辑分类

月报计算逻辑分为三个主要类别：

### 1. 收入 (Income)

#### 1.1 销售收入 (Sales)
- **FBA Product Sales**：`type` 为 `Order` 的 `product sales` 总和
- **FBA Inventory Credit**：`type` 为 `Liquidations` 的 `product sales` 总和（清算收入）
- **Promotional Rebates**：`type` 为 `Order` 的 `promotional rebates` 总和
- **Shipping Credits**：`type` 为 `Order` 的 `shipping credits` 总和（运费抵免）
- **Gift Wrap Credits**：`type` 为 `Order` 的 `gift wrap credits` 总和（礼品包装抵免）

**完整计算公式：**
```
销售收入 = FBA Product Sales + FBA Inventory Credit + Promotional Rebates + Shipping Credits + Gift Wrap Credits
```

**简化公式（任务描述）：**
```
销售收入 = FBA Product Sales + FBA Inventory Credit + Promotional Rebates
```

#### 1.2 退款收入 (Refund)
- **FBA Product Sale Refunds**：`type` 为 `Refund` 的 `product sales` 总和（退款中的产品销售额）
- **Shipping Credit Refunds**：`type` 为 `Refund` 的 `shipping credits` 总和
- **Promotional Rebate Refunds**：`type` 为 `Refund` 的 `promotional rebates` 总和
- **Other Refunds**：`type` 为 `Refund` 的 `other` 总和（其他退款）

**完整计算公式：**
```
退款收入 = FBA Product Sale Refunds + Shipping Credit Refunds + Promotional Rebate Refunds + Other Refunds
```

**简化公式（任务描述）：**
```
退款收入 = FBA Product Sale Refunds + Shipping Credit Refunds + Promotional Rebate Refunds
```

**注意：** 退款收入在报表中通常以负数表示（支出项），但作为收入类别下的子项，需要根据实际情况调整正负号。

### 2. 支出 (Expenses)

#### 2.1 平台费 (Platform Fees)
- **FBA Selling Fees**：`type` 为 `Order` 的 `selling fees` 总和（销售佣金）
- **Selling Fee Refunds**：`type` 为 `Refund` 的 `selling fees` 总和（退还的销售佣金）

**计算公式：**
```
平台费 = FBA Selling Fees + Selling Fee Refunds
```

#### 2.2 派送费 (Fulfillment Fees)
- **FBA Transaction Fees**：`type` 为 `Order` 的 `fba fees` 总和（FBA配送费）
- **FBA Transaction Fee Refunds**：`type` 为 `Refund` 的 `fba fees` 总和（退还的配送费）

**计算公式：**
```
派送费 = FBA Transaction Fees + FBA Transaction Fee Refunds
```

#### 2.3 广告费 (Advertising Fees)
- **Cost of Advertising**：`type` 为 `Service Fee` 且 `description` 为 `Cost of Advertising` 的 `total` 总和

**计算公式：**
```
广告费 = Cost of Advertising
```

#### 2.4 仓储费 (Storage Fees)
- **FBA Inventory and Inbound Services Fees**：`type` 为 `FBA Inventory Fee` 的 `total` 总和

**计算公式：**
```
仓储费 = FBA Inventory and Inbound Services Fees
```

#### 2.5 服务及优惠券 (Service & Coupon Fees)
- **Service Fees**：`type` 为 `Service Fee` 且 `description` 不属于 `Cost of Advertising` 和 `Subscription` 的 `total` 总和
- **Subscription Fees**：`type` 为 `Service Fee` 且 `description` 为 `Subscription` 的 `total` 总和（订阅费）
- **Coupon Fees**：优惠券费用（从 `Service Fee` 和 `Deal Fee` 中提取）
- **Lightning Deal Fees**：`type` 为 `Deal Fee` 的 `total` 总和（闪电交易费）
- **Vine Fees**：`type` 为 `Service Fee` 且 `description` 为 `Vine` 的 `total` 总和（Vine计划费用）

**计算公式：**
```
服务及优惠券费用 = Service Fees + Subscription Fees + Coupon Fees + Lightning Deal Fees + Vine Fees
```

#### 2.6 亚马逊调整 (Amazon Adjustments)
- **Adjustments**：`type` 为 `Adjustment` 的 `total` 总和（赔偿、调整等）
- **Fee Adjustments**：`type` 为 `Fee Adjustment` 的 `total` 总和（费用调整）
- **FBA Inventory Reimbursement**：`type` 为 `Adjustment` 的 `total` 总和（库存赔偿）

**计算公式：**
```
亚马逊调整 = Adjustments + Fee Adjustments + FBA Inventory Reimbursement
```

### 3. 其他 (Others)

#### 3.1 税费 (Taxes)
- **Retrocharge Taxes**：`type` 为 `Order Retrocharge` 的 `total` 总和（追溯税费）
  - **Base Tax**：基础税
  - **Shipping Tax**：运费税
  - **Marketplace Facilitator Tax**：市场促进税

#### 3.2 信用卡扣款 (Credit Card Charges)
- **Debt Charges**：`type` 为 `Debt` 的 `total` 总和（信用卡扣款）

#### 3.3 AGL物流费用 (AGL Shipping Fees)
- **AGL Fees**：`type` 为 `Service Fee` 且 `description` 包含 `FBA International Freight` 或 `FBA International Freight Duties and Taxes Charge` 的 `total` 总和

## 特殊属性项目处理

在核对月报PDF后，需要特别关注以下特殊属性项目：

1. **FBA Liquidation Proceeds**：FBA清算收入
   - 来源：`type` 为 `Liquidations` 的 `product sales`
   - 处理：作为收入的一部分，但需要单独标识并汇报给凌志

2. **FBA Inventory Credit**：FBA库存抵免
   - 来源：`type` 为 `Liquidations` 的 `product sales`（与清算收入可能相同）
   - 处理：在收入中单独列示

3. **其他特殊调整项**：
   - 亚马逊赔偿 (FBA Inventory Reimbursement)
   - 费用调整 (Fee Adjustment)
   - 订阅费用 (Subscription)
   - Vine计划费用 (Vine)

**汇报流程：**
1. 生成月报后，检查PDF中是否有上述特殊属性项目
2. 如发现特殊项目，记录其金额和描述
3. 按需整理汇报材料，提交给凌志

## 计算流程

### 步骤1：数据加载与清洗
1. 读取付款范围报告CSV文件（跳过前7行表头）
2. 将空值填充为0
3. 将 `quantity` 字段转换为整数类型

### 步骤2：按交易类型分类
根据 `type` 字段将数据分为以下子集：
- `Order`：正常订单
- `Refund`：退款
- `Adjustment`：调整
- `Service Fee`：服务费
- `FBA Inventory Fee`：仓储费
- `Liquidations`：清算
- `Order Retrocharge`：追溯税费
- `Fee Adjustment`：费用调整
- `Deal Fee`：交易费
- `Debt`：信用卡扣款

### 步骤3：各项计算
按照上述计算公式，逐项计算收入、支出和其他类别的金额。

### 步骤4：汇总与报表生成
1. 创建汇总表（报表总览），包含关键指标：
   - 合计销量
   - 退款数量
   - SP广告占比
   - 总销售额
   - 亚马逊退款
   - 亚马逊赔偿
   - 平台处理费
   - 仓储费
   - 平台推广费用
   - AMZ店铺其他费用
   - AMZ返还费用
   - 信用卡扣款

2. 生成详细工作表：
   - 总销售额
   - 销售明细
   - 亚马逊退款
   - 退货明细
   - 亚马逊赔偿
   - 平台处理费
   - 仓储费+移除或弃置费
   - 亚马逊AGL物流
   - 亚马逊平台推广费用
   - AMZ店铺其他费用-订阅
   - AMZ店铺其他费用-优惠券&活动
   - AMZ返还费用
   - 交易一览

### 步骤5：样式应用
使用预定义样式格式化Excel文件：
- 表头加粗、居中
- 数据区域添加边框
- 调整列宽和行高
- 设置数字格式

## 与现有代码的对应关系

当前 `apps/monthly_report.py` 中的实现与上述逻辑基本一致，但有以下注意事项：

1. **收入计算**：代码中的 `Order_sales` 对应 `FBA_product_sales + Shipping_credits + Promotional_rebates`，未包含 `Gift_wrap_credits` 和 `Liquidation_product_sales`（清算收入）。
2. **退款计算**：代码中的 `Refunds` 对应 `FBA_product_sale_refunds + Shipping_credits_refunds + Promotional_rebates_refunds + Refund_other`。
3. **平台处理费**：代码中的 `AMZnFBA` 对应 `FBA_selling_fees + FBA_transaction_fees`（未包含退款部分）。
4. **特殊项目**：代码已处理 `Liquidations`、`Adjustment`、`Fee Adjustment` 等特殊类型。

## 更新建议

根据新的计算逻辑分类，建议对代码进行以下更新：

1. 在收入计算中明确区分 `Sales` 和 `Refund` 子类别
2. 在支出计算中按平台费、派送费、广告费、仓储费、服务及优惠券、亚马逊调整进行分类
3. 添加特殊属性项目的标识和汇报功能
4. 优化报表输出格式，使其更符合财务分类习惯

## 验证方法

1. **数据完整性检查**：确保所有交易类型都被正确处理
2. **金额一致性**：核对报表总金额与原始数据总和是否一致
3. **特殊项目标识**：验证特殊属性项目是否被正确识别
4. **计算公式验证**：人工抽样计算验证关键指标的正确性

## 附录

### 交易类型映射表

| type | 中文描述 | 所属类别 |
|------|----------|----------|
| Order | 订单 | 收入-销售 |
| Refund | 退款 | 收入-退款（负值） |
| Adjustment | 调整 | 支出-亚马逊调整 |
| Service Fee | 服务费 | 支出-服务及优惠券 |
| FBA Inventory Fee | FBA库存费 | 支出-仓储费 |
| Liquidations | 清算 | 收入-销售（特殊） |
| Order Retrocharge | 订单追溯税费 | 其他-税费 |
| Fee Adjustment | 费用调整 | 支出-亚马逊调整 |
| Deal Fee | 促销活动费 | 支出-服务及优惠券 |
| Debt | 信用卡扣款 | 其他-信用卡扣款 |

### 关键字段说明

- `product sales`：产品销售额（正数表示收入，负数表示退款）
- `shipping credits`：运费抵免
- `promotional rebates`：促销返点
- `selling fees`：销售佣金（负数表示支出）
- `fba fees`：FBA配送费（负数表示支出）
- `total`：交易总额（正负取决于交易类型）
- `quantity`：数量（正数表示销售，负数表示退款）

---
**文档版本**：1.0  
**最后更新**：2025-12-17  
**维护者**：业务工具平台开发团队