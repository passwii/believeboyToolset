# 月报计算逻辑设计文档

## 第一部分：文档概述、数据源、计算逻辑分类

### 文档概述

本文档描述了业务工具平台中月报生成功能的计算逻辑。月报基于亚马逊的付款范围报告（Payment Range Report）生成，对收入、支出和其他类别进行详细分类计算，并输出结构化的 Excel 文件。

### 数据源

月报的主要数据源为亚马逊的 **付款范围报告**（Payment Range Report），该报告为 CSV 格式。

**文件读取参数**：
- 跳过前7行（表头说明）
- 使用 `thousands=","` 处理千位分隔符
- 编码格式：UTF-8

**关键字段**：

| 字段名 | 说明 |
|--------|------|
| `type` | 交易类型（Order, Refund, Adjustment, Service Fee, FBA Inventory Fee 等） |
| `description` | 交易描述 |
| `fulfillment` | 履约方式（Amazon / Seller） |
| `sku` | SKU编号 |
| `quantity` | 数量 |
| `product sales` | 产品销售额 |
| `shipping credits` | 运费抵免 |
| `gift wrap credits` | 礼品包装抵免 |
| `promotional rebates` | 促销返点 |
| `selling fees` | 销售佣金 |
| `fba fees` | FBA 配送费 |
| `other` | 其他费用 |
| `other transaction fees` | 其他交易费用 |
| `total` | 总额 |

### 计算逻辑分类

月报计算逻辑采用 **一级分类（Type）** 和 **二级分类（Description/fulfillment）** 的方式进行数据筛选和汇总。

#### 一级分类（Type字段）

| Type类型 | 说明 |
|----------|------|
| Order | 订单 |
| Refund | 退款 |
| Adjustment | 调整 |
| Service Fee | 服务费 |
| FBA Inventory Fee | FBA库存费用 |
| FBA Customer Return Fee | FBA客户退货费（服装类目特殊退货收费） |
| Amazon Fees - Reversal | 亚马逊费用返还 |
| Chargeback Refund | 拒付退款 |
| Liquidations | 清算 |
| Amazon Fees | 亚马逊费用 |
| Fee Adjustment | 费用调整 |
| Deal Fee | 促销交易费 |
| Debt | 债务 |
| FBA Transaction fees | FBA交易费 |
| Blank（type=0） | 空白类型 |

#### 二级分类（Description/fulfillment字段）

**Order/Refund的二级分类（按fulfillment字段）**：
- FBA：`fulfillment='Amazon'`
- FBM：`fulfillment='Seller'`

**Adjustment的二级分类（按description字段）**：
- Adjustment_Income（赔偿收入）：排除 `FBA Inventory Reimbursement - General Adjustment` 和 `Non-subscription Fee Adjustment`
- Adjustment_Expense（赔偿支出）：包含 `FBA Inventory Reimbursement - General Adjustment` 和 `Non-subscription Fee Adjustment`

**Service Fee的二级分类（按description字段）**：
- Advertising：`Cost of Advertising`
- Subscription：`Subscription`
- FBA Inbound：`FBA Inbound Placement Service Fee`
- AGL_费用：`FBA International Freight Shipping Charge` 或 `FBA International Freight Duties and Taxes Charge`
- Service_Refund_for_Advertiser：`Refund for Advertiser`

**其他二级分类**：
- Amazon_Fees_and_Service_Fee_without_AD：`Amazon Fees` 和 `Service Fee`，排除 `Cost of Advertising` 和 `Refund for Advertiser`
- Price_Discount：`type=0` 且 `description` 以 `Price Discount` 开头

## 第二部分：分类条目计算

### 1. 收入（Income）计算

| 收入项目 | 数据源字段 | 计算逻辑 | 说明 |
|----------|-----------|----------|------|
| Product sales (non-FBA) | FBM_Order.product sales | `FBM_Order['product sales'].sum()` | 非FBA订单销售额 |
| Product sale refunds (non-FBA) | FBM_Refund.product sales | `FBM_Refund['product sales'].sum()` | 非FBA退款销售额 |
| FBA product sales | FBA_Order.product sales | `FBA_Order['product sales'].sum()` | FBA订单销售额 |
| FBA product sale refunds | FBA_Refund.product sales + FBA_Refund.other | `FBA_Refund['product sales'].sum() + FBA_Refund['other'].sum()` | FBA退款销售额（含其他费用） |
| FBA inventory credit | Adjustment_Income.total | `Adjustment_Income['total'].sum()` | FBA库存赔偿收入 |
| FBA liquidation proceeds | Liquidation.product sales | `Liquidation['product sales'].sum()` | FBA清算收入 |
| Shipping credits | Order.shipping credits | `Order['shipping credits'].sum()` | 所有订单运费收入 |
| Shipping credit refunds | Refund.shipping credits | `Refund['shipping credits'].sum()` | 所有退款运费退款 |
| Gift wrap credits | Order.gift wrap credits | `Order['gift wrap credits'].sum()` | 所有订单礼品包装收入 |
| Gift wrap credit refunds | Refund.gift wrap credits | `Refund['gift wrap credits'].sum()` | 所有退款礼品包装退款 |
| Promotional rebates | Order.promotional rebates | `Order['promotional rebates'].sum()` | 所有订单促销折扣 |
| Promotional rebate refunds | Refund.promotional rebates | `Refund['promotional rebates'].sum()` | 所有退款促销折扣退款 |
| A-to-z Guarantee claims | - | 0 | A-to-z保障索赔（暂未实现） |
| Chargebacks | Chargeback_Refund.total | `Chargeback_Refund['total'].sum()` | 拒付退款 |
| SAFE-T reimbursement | - | 0 | SAFE-T赔偿（暂未实现） |
| **Total_Income** | - | 以上收入项目之和 | 合计销售额 |

### 2. 支出（Expense）计算

| 支出项目 | 数据源字段 | 计算逻辑 | 说明 |
|----------|-----------|----------|------|
| Seller fulfilled selling fees | FBM_Order.selling fees | `FBM_Order['selling fees'].sum()` | 非FBA销售佣金 |
| FBA selling fees | FBA_Order.selling fees | `FBA_Order['selling fees'].sum()` | FBA销售佣金 |
| Selling fee refunds | Refund.selling fees | `Refund['selling fees'].sum()` | 所有退款销售佣金 |
| FBA transaction fees | FBA_Order.fba fees + FBA_Transaction_fees.fba fees | `FBA_Order['fba fees'].sum() + FBA_Transaction_fees['fba fees'].sum()` | FBA派送费 |
| FBA transaction fee refunds | FBA_Refund.fba fees + Fee_Adjustment_fee | `FBA_Refund['fba fees'].sum() + Fee_Adjustment_fee` | FBA派送费退款（含测量费） |
| Other transaction fees | - | 0 | 其他交易费用（暂未实现） |
| Other transaction fee refunds | - | 0 | 其他交易费用退款（暂未实现） |
| FBA inventory and inbound services fees | FBA_Inventory_Fee.total + FBA_Customer_Return_Fee.total + AGL_Selection.total | `FBA_Inventory_Fee['total'].sum() + FBA_Customer_Return_Fee['total'].sum() + AGL_Selection['total'].sum()` | FBA仓储及入库服务费（含退货费和货运费） |
| Shipping label purchases | - | 0 | 购买配送标签（暂未实现） |
| Shipping label refunds | - | 0 | 配送标签退款（暂未实现） |
| Carrier shipping label adjustments | - | 0 | 承运商配送标签调整（暂未实现） |
| Service fees | Coupon_fee + Service_fees_without_ADs + Lightning_Deal_Fee + Service_Price_Discount + Coupon_Performance_Base_Fee | 见下方详细说明 | 服务费（不含广告） |
| Refund administration fees | - | 0 | 退款管理费（已合并到销售佣金退款） |
| Adjustments | Adjustment_Expense.total | `Adjustment_Expense['total'].sum()` | 调整项 |
| Cost of Advertising | Advertising.total | `Advertising['total'].sum()` | 广告成本 |
| Refund for Advertiser | Service_Refund_for_Advertiser.total | `Service_Refund_for_Advertiser['total'].sum()` | 广告商退款 |
| Liquidations fees | Liquidation.other transaction fees | `Liquidation['other transaction fees'].sum()` | 清算处理费 |
| Receivables | - | 0 | 应收账款（暂未实现） |
| Deductions | - | 0 | 扣款（暂未实现） |
| Amazon Shipping Charge Adjustments | - | 0 | 亚马逊配送运费调整（暂未实现） |
| **Total_Expense** | - | 以上支出项目之和 | 合计费用 |

**Service fees详细计算**：

| 子项 | 数据源 | 计算逻辑 |
|------|--------|----------|
| Coupon_fee | Amazon_Fees.total | `Amazon_Fees['total'].sum()` |
| Service_fees_without_ADs | Service_Fee（排除广告和货运费） | `Service_Fee[~Service_Fee.description.isin(['Cost of Advertising', 'Refund for Advertiser', 'FBA International Freight Shipping Charge', 'FBA International Freight Duties and Taxes Charge'])].total.sum()` |
| Lightning_Deal_Fee | Deal Fee | `LD['total'].sum()` |
| Service_Price_Discount | Price_Discount.total | `Price_Discount['total'].sum()` |
| Coupon_Performance_Base_Fee | Amazon_Fees_Reversal.total | `Amazon_Fees_Reversal['total'].sum()` |

### 3. PT4核算数据（国内核算逻辑）

PT4核算采用不同于亚马逊PDF的分类方式，更适合国内财务核算需求。

#### PT4收入分类

| 项目 | 计算逻辑 | 说明 |
|------|----------|------|
| 1-销售额（pt4_income_sales） | Product_sales_non_FBA + FBA_product_sales + Shipping_credits + Gift_wrap_credits + Promotional_rebates | 销售额（含运费、礼品包装、促销折扣） |
| 2-销售额退款（pt4_income_refund） | Product_sale_refunds_non_FBA + FBA_product_sale_refunds + Shipping_credit_refunds + Gift_wrap_credits_refunds + Promotional_rebate_refunds | 销售额退款（含运费、礼品包装、促销折扣退款） |
| 3-赔偿（pt4_income_adjustment） | FBA_inventory_credit + FBA_liquidation_proceeds | FBA库存赔偿 + 清算收入 |
| 4-其他收入（pt4_income_chargeback） | Chargebacks + A_to_z_Guarantee_claims + SAFE_T_reimbursement | 拒付退款 + A-to-z索赔 + SAFE-T赔偿 |
| **收入合计**（pt4_income_total） | 以上四项之和 | |

#### PT4支出分类

| 项目 | 计算逻辑 | 说明 |
|------|----------|------|
| 5-平台费（pt4_expense_selling_fee） | Seller_fulfilled_selling_fees + FBA_selling_fees + Selling_fee_refunds | 平台费（含退款管理费） |
| 6-派送费（pt4_expense_fba_fee） | FBA_transaction_fees + FBA_transaction_fee_refunds | FBA派送费（含退款） |
| 7-仓储费（pt4_expense_inventory_fee） | FBA_inventory_and_inbound_services_fees | FBA库存和入库服务费 |
| 8-服务费（pt4_service_fee） | Service_fees | 服务费（不含广告） |
| 9-广告费（pt4_expense_advertising） | Cost_of_Advertising + Refund_for_Advertiser | 广告费（含广告退款） |
| 10-其他费用（pt4_expense_other_fees） | Adjustments + Liquidations_fees + Other_transaction_fees + Other_transaction_fee_refunds + Receivables + Deductions + Amazon_Shipping_Charge_Adjustments + Shipping_label_purchases + Shipping_label_refunds + Carrier_shipping_label_adjustments | 其他费用 |
| **支出合计**（pt4_expense_total） | 以上六项之和 | |

#### PT4汇总数据

| 项目 | 计算逻辑 |
|------|----------|
| 亚马逊回款金额（amazon_pay_back） | pt4_income_total + pt4_expense_total |
| 信用卡扣款（AMZ_Card） | `Debt['total'].sum()` |
| 平台推广费用占比（spCount） | `abs(Cost_of_Advertising) / Income_total`（百分比格式） |

### 4. 其他辅助计算

| 计算项 | 计算逻辑 | 说明 |
|--------|----------|------|
| 销售SKU明细（pt1） | `Order.groupby('sku')['quantity'].sum()` | 按SKU汇总销售数量，降序排列 |
| 退款SKU明细（pt2） | `Refund.groupby('sku')['quantity'].sum()` | 按SKU汇总退款数量，降序排列 |
| 订单总数量（Order_QTY） | `Order['quantity'].sum()` | 所有订单总数量 |
| 退款总数量（Refund_QTY） | `Refund['quantity'].sum()` | 所有退款总数量 |

### 5. 输出Excel文件结构

生成的Excel文件包含以下工作表：

| 工作表名称 | 数据内容 |
|------------|----------|
| 总览草稿 | PT4核算数据（国内分类） |
| 报表核算 | PT3数据（亚马逊PDF格式） |
| 交易一览 | 原始付款范围报告（PRR） |
| 销售SKU明细 | pt1 |
| 退款SKU明细 | pt2 |
| 所有订单 | Order |
| 所有退款 | Refund |
| FBM 订单 | FBM_Order |
| FBM 退款 | FBM_Refund |
| FBA 订单 | FBA_Order |
| FBA 退款 | FBA_Refund |
| FBA库存赔偿 | Adjustment_Income |
| 其他赔偿 | Adjustment_Expense |
| 清算费用 | Liquidation |
| 拒付退款 | Chargeback_Refund |
| FBA仓储及入库服务费 | FBA_Inventory_Fee |
| 服务费（不含广告） | Amazon_Fees_and_Service_Fee_without_AD |
| 广告费 | Advertising |
| 广告退款 | Service_Refund_for_Advertiser |

### 6. 样式设置

调用 `reset_style` 函数进行样式统一：
- 字体：等线，12号
- 对齐：左对齐（数据行）、居中对齐（首行）
- 边框：细黑线
- 冻结首行
- 列宽：报表核算sheet使用自适应列宽（最小8，最大50），其他sheet使用固定列宽12
- 行高：首行15

### 7. 数据处理流程

1. **文件上传与验证**
   - 接收CSV格式文件
   - 验证项目名称和报告日期

2. **数据读取与预处理**
   - 使用pandas读取CSV（跳过前7行）
   - 处理千位分隔符
   - 缺失值填充为0
   - quantity转换为整型

3. **数据分类**
   - 按Type字段进行一级分类
   - 按Description/fulfillment字段进行二级分类

4. **金额计算**
   - 计算收入（Income）各项
   - 计算支出（Expense）各项
   - 计算PT4核算数据
   - 计算辅助数据

5. **生成Excel文件**
   - 创建多个工作表
   - 应用样式
   - 返回文件供下载

6. **日志记录**
   - 记录文件上传、生成成功/失败等操作

### 8. 错误处理

- 文件格式验证：仅支持CSV格式
- 必填项检查：项目名称、报告日期、文件路径
- 异常捕获：所有异常均被捕获并记录日志
- 用户友好提示：使用flash消息显示错误信息

## 版本历史

| 版本 | 日期 | 修改说明 |
|------|------|----------|
| 3.0 | 2026-01-08 | 重构文档结构，分为概述/分类/计算两部分，完善PT4核算逻辑 |
