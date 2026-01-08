# 月报计算逻辑设计文档

## 文档概述

本文档描述了业务工具平台中月报生成功能的计算逻辑。月报基于亚马逊的付款范围报告（Payment Range Report）生成，对收入、支出和其他类别进行详细分类计算，并输出结构化的 Excel 文件。

## 数据源

月报的主要数据源为亚马逊的 **付款范围报告**（Payment Range Report），该报告为 CSV 格式，包含以下关键字段：

| 字段名 | 说明 |
|--------|------|
| `type` | 交易类型（Order, Refund, Adjustment, Service Fee, FBA Inventory Fee 等） |
| `description` | 交易描述 |
| `product sales` | 产品销售额 |
| `shipping credits` | 运费抵免 |
| `promotional rebates` | 促销返点 |
| `selling fees` | 销售佣金 |
| `fba fees` | FBA 配送费 |
| `total` | 总额 |
| `quantity` | 数量 |
| `sku` | SKU |
| `fulfillment` | 履约方式（Amazon / Seller） |

报告文件通常包含多行，每行代表一笔交易。月报处理程序会读取该 CSV，跳过前7行（表头说明），并解析各列数据。

## 计算逻辑分类

月报计算逻辑分为三个主要类别：**收入（Income）**、**支出（Expense）** 和 **其他辅助计算**。下面分别详细说明。

### 1. 收入（Income）

收入项目根据 `type` 和 `description` 进行筛选与汇总，具体计算方式如下：

| 收入项目（英文） | 收入项目（中文） | 计算公式（数据来源） | 说明 |
|------------------|------------------|----------------------|------|
| Product sales (non-FBA) | 销售额（非FBA） | `FBM_Order['product sales'].sum()` | 从 `type='Order'` 且 `fulfillment='Seller'` 的记录中汇总 |
| Product sale refunds (non-FBA) | 销售额退款（非FBA） | `FBM_Refund['product sales'].sum()` | 从 `type='Refund'` 且 `fulfillment='Seller'` 的记录中汇总 |
| FBA product sales | 销售额（FBA） | `FBA_Order['product sales'].sum()` | 从 `type='Order'` 且 `fulfillment='Amazon'` 的记录中汇总 |
| FBA product sale refunds | 销售额退款（FBA） | `FBA_Refund['product sales'].sum() + FBA_Refund['other'].sum()` | 包括产品销售额和其他费用退款 |
| FBA inventory credit | FBA库存赔偿 | `Adjustment_Income['total'].sum() + Fee_Adjustment_fee` | 调整类型中非“FBA Inventory Reimbursement - General Adjustment”的总额 + 重量/尺寸变更调整费 |
| FBA liquidation proceeds | FBA清算收入 | `Liquidation['product sales'].sum()` | 清算类型中的产品销售额 |
| Shipping credits | 运费收入 | `Order['shipping credits'].sum()` | 所有订单的运费抵免 |
| Shipping credit refunds | 运费退款 | `Refund['shipping credits'].sum()` | 所有退款的运费抵免 |
| Gift wrap credits | 礼品包装收入 | `Order['gift wrap credits'].sum()` | 所有订单的礼品包装抵免 |
| Gift wrap credit refunds | 礼品包装退款 | `Refund['gift wrap credits'].sum()` | 所有退款的礼品包装抵免 |
| Promotional rebates | 促销折扣 | `Order['promotional rebates'].sum()` | 所有订单的促销返点 |
| Promotional rebate refunds | 促销折扣退款 | `Refund['promotional rebates'].sum()` | 所有退款的促销返点 |
| A-to-z Guarantee claims | A-to-z保障索赔 | 0（目前未实现） | 预留字段 |
| Chargebacks | 拒付退款 | `Chargeback_Refund['total'].sum()` | 类型为“Chargeback Refund”的总额 |
| SAFE-T reimbursement | SAFE-T赔偿 | 0（目前未实现） | 预留字段 |
| **Total Income** | **合计销售额** | 上述所有收入项目之和 | |

### 2. 支出（Expense）

支出项目同样基于 `type` 和 `description` 筛选，计算方式如下：

| 支出项目（英文） | 支出项目（中文） | 计算公式（数据来源） | 说明 |
|------------------|------------------|----------------------|------|
| Seller fulfilled selling fees | 卖家自配送销售佣金 | `FBM_Order['selling fees'].sum()` | 非FBA订单的销售佣金 |
| FBA selling fees | FBA销售佣金 | `FBA_Order['selling fees'].sum()` | FBA订单的销售佣金 |
| Selling fee refunds | 销售佣金退款 | `Refund['selling fees'].sum()` | 所有退款的销售佣金 |
| FBA transaction fees | FBA派送费 | `FBA_Order['fba fees'].sum() + FBA_Transaction_fees['fba fees'].sum()` | FBA订单的配送费 + FBA交易费用表中的配送费 |
| FBA transaction fee refunds | FBA派送费退款 | `FBA_Refund['fba fees'].sum()` | FBA退款的配送费 |
| Other transaction fees | 其他交易费用 | 0（目前未实现） | 预留字段 |
| Other transaction fee refunds | 其他交易费用退款 | 0（目前未实现） | 预留字段 |
| FBA inventory and inbound services fees | FBA库存和入库服务费 | `FBA_Inventory_Fee['total'].sum() + FBA_Customer_Return_Fee['total'].sum()` | 类型为“FBA Inventory Fee”和“FBA Customer Return Fee”（服装类目特殊退货收费）的总额 |
| Shipping label purchases | 购买配送标签 | 0（目前未实现） | 预留字段 |
| Shipping label refunds | 配送标签退款 | 0（目前未实现） | 预留字段 |
| Carrier shipping label adjustments | 承运商配送标签调整 | 0（目前未实现） | 预留字段 |
| Service fees | 服务费 | `Coupon_fee + Service_fees_without_ADs + Lightning_Deal_Fee + Service_Price_Discount` | 优惠券 + 一般服务费（不含广告）+ 闪电促销费 + 价格折扣 |
| Refund administration fees | 退款管理费 | 0（已合并在销售佣金退款中） | 实际计算时已并入销售佣金退款 |
| Adjustments | 调整项 | `Adjustment_Expense['total'].sum()` | 描述为“FBA Inventory Reimbursement - General Adjustment”的调整总额 |
| Cost of Advertising | 广告成本 | `Advertising['total'].sum()` | 描述为“Cost of Advertising”的服务费总额 |
| Refund for Advertiser | 广告商退款 | `Service_Refund_for_Advertiser['total'].sum()` | 描述为“Refund for Advertiser”的服务费总额 |
| Liquidations fees | 清算处理费 | `Liquidation['other transaction fees'].sum()` | 清算类型的其他交易费用 |
| Receivables | 应收账款 | 0（目前未实现） | 预留字段 |
| Deductions | 扣款 | 0（目前未实现） | 预留字段 |
| Amazon Shipping Charge Adjustments | 亚马逊配送运费调整 | 0（目前未实现） | 预留字段 |
| **Total Expense** | **合计费用** | 上述所有支出项目之和 | |

### 3. 其他辅助计算

- **销售SKU明细**：对 `Order` 按 `sku` 分组，汇总 `quantity`，按数量降序排列。
- **退款SKU明细**：对 `Refund` 按 `sku` 分组，汇总 `quantity`，按数量降序排列。
- **平台推广费用占比**：`广告成本 / 总收入`，以百分比表示。
- **信用卡扣费**：`Debt` 类型的 `total` 总和。

## 数据处理流程

### 步骤1：读取与预处理
1. 用户上传付款范围报告（CSV文件）。
2. 程序使用 `pandas.read_csv` 读取，跳过前7行，处理千位分隔符。
3. 缺失值填充为0，`quantity` 列转换为整型。

### 步骤2：分类筛选
根据 `type` 和 `description` 创建以下数据子集：

- **一级分类**：`Order`, `Refund`, `Adjustment`, `Service_Fee`, `FBA_Inventory_Fee`, `FBA_Customer_Return_Fee`, `Liquidation`, `Fee_Adjustment`, `FBA_Transaction_fees`, `Debt` 等。
- **二级分类**：
  - `FBA_Order` / `FBM_Order`：根据 `fulfillment` 区分。
  - `FBA_Refund` / `FBM_Refund`：同理。
  - `Advertising`：`Service_Fee` 中描述为 “Cost of Advertising” 的记录。
  - `Subscription`：描述为 “Subscription” 的记录。
  - `FBA_Inbound`：描述为 “FBA Inbound Placement Service Fee” 的记录。
  - `AGL_Selection`：描述包含 “FBA International Freight” 或 “FBA International Freight Duties and Taxes Charge” 的记录。
  - `Price_Discount`：`type` 为空白且描述以 “Price Discount” 开头的记录。
  - 等等。

### 步骤3：计算各项金额
按照上述收入与支出表格逐项计算，结果保留两位小数。

### 步骤4：生成汇总表（报表总览）
创建 `pt3` DataFrame，包含三列（Income/收入、In金额（USD）、In源表）和（Expense/支出、Ex金额（USD）、Ex源表），并插入总计行。

### 步骤5：输出Excel文件
使用 `pd.ExcelWriter`（xlsxwriter引擎）将以下工作表写入单个Excel文件：

| 工作表名称 | 数据内容 |
|------------|----------|
| 报表总览 | 收入与支出汇总表（pt3） |
| 销售SKU明细 | 按SKU汇总的销售数量（pt1） |
| 退款SKU明细 | 按SKU汇总的退款数量（pt2） |
| 交易一览 | 原始付款范围报告（PRR） |
| 所有订单 | `Order` 数据集 |
| 所有退款 | `Refund` 数据集 |
| FBM 订单 | `FBM_Order` |
| FBM 退款 | `FBM_Refund` |
| FBA 订单 | `FBA_Order` |
| FBA 退款 | `FBA_Refund` |
| FBA库存赔偿 | `Adjustment_Income` |
| 其他赔偿 | `Adjustment_Expense` |
| 清算费用 | `Liquidation` |
| 拒付退款 | `Chargeback_Refund` |
| FBA仓储及入库服务费 | `FBA_Inventory_Fee` |
| 服务费（不含广告） | `Amazon_Fees_and_Service_Fee_without_AD` |
| 广告费 | `Advertising` |
| 广告退款 | `Service_Refund_for_Advertiser` |

### 步骤6：样式设置
调用 `reset_style` 函数：
- 设置单元格字体（等线，12号）、对齐方式（居中/左对齐）、边框（细黑线）。
- 冻结首行。
- 调整列宽与行高。
- 为“报表总览”和“交易一览”工作表标签着色。

### 步骤7：返回文件
将生成的Excel文件作为二进制流返回，供用户下载。

## 错误处理与日志记录

- **文件验证**：仅接受CSV格式文件，否则提示错误。
- **必要字段检查**：项目名称、报告日期、文件未提供时，返回提示。
- **异常捕获**：处理过程中任何异常均被捕获，记录错误日志并向用户显示友好错误信息。
- **日志记录**：使用 `LogService` 记录成功或失败的操作，包括项目、日期、文件名等细节。

## 附录：字段映射表（部分）

| 源数据字段 | 对应计算项目 | 备注 |
|------------|--------------|------|
| `type='Order', fulfillment='Seller'` | 非FBA销售额 | |
| `type='Order', fulfillment='Amazon'` | FBA销售额 | |
| `type='Refund', fulfillment='Seller'` | 非FBA销售额退款 | |
| `type='Refund', fulfillment='Amazon'` | FBA销售额退款 | |
| `type='Adjustment', description!='FBA Inventory Reimbursement - General Adjustment'` | FBA库存赔偿（收入） | |
| `type='Adjustment', description='FBA Inventory Reimbursement - General Adjustment'` | 调整项（支出） | |
| `type='Service Fee', description='Cost of Advertising'` | 广告成本 | |
| `type='Service Fee', description='Refund for Advertiser'` | 广告商退款 | |
| `type='Amazon Fees'` | 优惠券费用 | 计入服务费 |
| `type='Deal Fee'` | 闪电促销费 | 计入服务费 |
| `type='Liquidations'` | 清算收入（产品销售额）与清算处理费（其他交易费用） | |
| `type='FBA Customer Return Fee'` | FBA库存和入库服务费（支出） | 服装类目特殊退货收费 |

## 版本历史

| 版本 | 日期 | 修改说明 |
|------|------|----------|
| 1.0 | 2025-12-17 | 初始版本，基于 monthly_report.py 代码逻辑编写 |
| 2.0 | 2025-12-25 | 重构版本，完善计算细节与文档结构，增加字段映射表与处理流程 |
| 2.1 | 2025-12-25 | 更新FBA库存和入库服务费计算逻辑，包含FBA Customer Return Fee |
