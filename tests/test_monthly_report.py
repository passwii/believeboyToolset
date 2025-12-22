from flask import Blueprint, render_template, request, send_file, redirect, flash, url_for
import os
import io
import datetime
import pandas as pd
from openpyxl.utils.dataframe import dataframe_to_rows
import shutil
from openpyxl import load_workbook
from openpyxl.styles import Font, NamedStyle
from openpyxl.styles import Border, Side, Alignment
from openpyxl.utils import get_column_letter

#tests\reports\【华洋11月】2025Nov1-2025Nov30CustomUnifiedTransaction.csv
payment_range_report_path = os.path.join('tests', 'reports', '【华洋11月】2025Nov1-2025Nov30CustomUnifiedTransaction.csv')

payment_range_report = pd.read_csv(payment_range_report_path, thousands=',', skiprows=7, encoding='utf-8')

PRR = payment_range_report
PRR.fillna(0, inplace=True)
PRR['quantity'] = PRR['quantity'].astype(int)


# DataFrame - Type 一级分类
Order = PRR.loc[PRR['type'].isin(['Order'])]
Refund = PRR.loc[PRR['type'].isin(['Refund'])]
Chargeback_Refund = PRR.loc[PRR['type'].isin(['Chargeback Refund'])]
Liquidation = PRR.loc[PRR['type'].isin(['Liquidations'])]
Adjustment = PRR.loc[PRR['type'].isin(['Adjustment'])]
Fee_Adjustment = PRR.loc[PRR['type'].isin(['Fee Adjustment'])]
Service_Fee = PRR.loc[PRR['type'].isin(['Service Fee'])]
FBA_Inventory_Reimbursement = PRR.loc[PRR['type'].isin(['FBA Inventory Reimbursement'])]
FBA_Inventory_Fee = PRR.loc[PRR['type'].isin(['FBA Inventory Fee'])]
Amazon_Fees = PRR.loc[PRR['type'].isin(['Amazon Fees'])]
# Fee Adjustment 亚马逊 返还 的派送费(产品发货尺寸, 重新测量的费用) 
Fee_Adjustment = PRR.loc[PRR['type'].isin(['Fee Adjustment'])]
LD = PRR.loc[PRR['type'].isin(['Deal Fee'])]
Debt = PRR.loc[PRR['type'].isin(['Debt'])]
FBA_Transaction_fees = PRR.loc[PRR['type'].isin(['FBA Transaction fees'])]


# DataFrame - fulfillment / Description 二级分类 
FBA_Order = Order.loc[Order['fulfillment'].isin(['Amazon'])]
FBM_Order = Order.loc[Order['fulfillment'].isin(['Seller'])]

FBA_Refund = Refund.loc[Refund['fulfillment'].isin(['Amazon'])]
FBM_Refund = Refund.loc[Refund['fulfillment'].isin(['Seller'])]

#Income赔偿
Adjustment_Income = Adjustment.loc[Adjustment['description'].isin(['FBA Inventory Reimbursement - Customer Return','FBA Inventory Reimbursement - Damaged:Warehouse'])]
#Expense赔偿
Adjustment_Expense = Adjustment.loc[Adjustment['description'].isin(['FBA Inventory Reimbursement - General Adjustment'])]

Advertising = Service_Fee.loc[Service_Fee['description'].isin(['Cost of Advertising'])]
Subscription = Service_Fee.loc[Service_Fee['description'].isin(['Subscription'])]
FBA_Inbound = Service_Fee.loc[Service_Fee['description'].isin(['FBA Inbound Placement Service Fee'])]
AGL_Selection = Service_Fee.loc[Service_Fee['description'].isin(['FBA International Freight', 'FBA International Freight Duties and Taxes Charge'])]

'''计算 Income (与PDF完全一致) '''
# 重新测量费的计算口径需要未来确认
Product_sales_non_FBA = round(FBM_Order['product sales'].sum(), 2)
Product_sale_refunds_non_FBA = round(FBM_Refund['product sales'].sum(), 2)
FBA_product_sales = round(FBA_Order['product sales'].sum(), 2)
FBA_product_sale_refunds = round(FBA_Refund['product sales'].sum(), 2)
Fee_Adjustment_fee = round(Fee_Adjustment.loc[Fee_Adjustment['description'].isin(['FBA Weight/Dimension Change'])]['total'].sum(), 2)
FBA_inventory_credit = round(Adjustment_Income['total'].sum(), 2) + Fee_Adjustment_fee
FBA_liquidation_proceeds = round(Liquidation['product sales'].sum(), 2)
Shipping_credits = round(Order['shipping credits'].sum(), 2)
Shipping_credit_refunds = round(Refund['shipping credits'].sum(), 2)
Gift_wrap_credits = round(Order['gift wrap credits'].sum(), 2)
Gift_wrap_credits_refunds = round(Refund['gift wrap credits'].sum(), 2)
Promotional_rebates = round(Order['promotional rebates'].sum(), 2)
Promotional_rebate_refunds = round(Refund['promotional rebates'].sum(), 2)
Chargebacks = round(Chargeback_Refund['total'].sum(), 2)

Income_total = round(Product_sales_non_FBA + Product_sale_refunds_non_FBA + FBA_product_sales + FBA_product_sale_refunds + FBA_inventory_credit + FBA_liquidation_proceeds + Shipping_credits + Shipping_credit_refunds + Gift_wrap_credits + Gift_wrap_credits_refunds + Promotional_rebates + Promotional_rebate_refunds + Chargebacks, 2)

'''计算 Expense (与PDF完全一致) '''
Seller_fulfilled_selling_fees = round(FBM_Order['selling fees'].sum(), 2)
FBA_selling_fees = round(FBA_Order['selling fees'].sum(), 2)
Selling_fee_refunds = round(Refund['selling fees'].sum(), 2) #目前不确定是否是全部还是Order和Refund分别计算
FBA_transaction_fees = round(FBA_Order['fba fees'].sum(), 2) + round(FBA_Transaction_fees['fba fees'].sum(), 2)
FBA_transaction_fee_refunds = round(FBA_Refund['fba fees'].sum(), 2)
Other_transaction_fees = 0
Other_transaction_fee_refunds = 0
FBA_inventory_and_inbound_services_fees = round(FBA_Inventory_Fee['total'].sum(), 2)
Coupon_fee = round(Amazon_Fees['total'].sum(), 2)
Lightning_Deal_Fee = round(LD['total'].sum(), 2)
# 服务费去掉广告费用的综合 + 优惠券就是整体的PDF服务费计算
Service_fees_without_ADs = round(Service_Fee.loc[~Service_Fee['description'].isin(['Cost of Advertising'])]['total'].sum(), 2)
Service_fees = Coupon_fee + Service_fees_without_ADs + Lightning_Deal_Fee
# 退款管理费和佣金退款合并计算在PDF中是和佣金退款合并的，所以是0
Refund_administration_fees = 0
Adjustments = round(Adjustment_Expense['total'].sum(), 2)
Cost_of_Advertising = round(Advertising['total'].sum(), 2)
# Liquidation 清算费用
Liquidations_fees = round(Liquidation['other transaction fees'].sum(), 2)

Amazon_Shipping_Charge_Adjustments = 0

Expense_total = round(Seller_fulfilled_selling_fees + FBA_selling_fees + Selling_fee_refunds + FBA_transaction_fees + FBA_transaction_fee_refunds + Other_transaction_fees + Other_transaction_fee_refunds + FBA_inventory_and_inbound_services_fees + Service_fees + Adjustments + Cost_of_Advertising + Liquidations_fees + Amazon_Shipping_Charge_Adjustments, 2)

# 销售SKU明细
skuGroup = Order.groupby(['sku'], as_index=False).agg({'quantity': 'sum'})
Order_QTY = int(Order['quantity'].sum())

# 退款SKU明细
refund_skuGroup = Refund.groupby(['sku'], as_index=False).agg({'quantity': 'sum'})
Refund_QTY = int(Refund['quantity'].sum())

# 平台推广费用
spFee = Cost_of_Advertising
spCount = format(abs(spFee) / Income_total, '.2%')

# 信用卡扣费
AMZ_Card = round(Debt['total'].sum(), 2)

pt1 = skuGroup.sort_values(by='quantity', ascending=False, inplace=False)
pt2 = refund_skuGroup.sort_values(by='quantity', ascending=False, inplace=False)

pt3 = pd.DataFrame({
    'Income':['Product sales (non-FBA)', 'Product sale refunds (non-FBA) ', 'FBA product sales', 'FBA product sale refunds', 'FBA inventory credit', 'FBA liquidation proceeds', 'Shipping credits', 'Shipping credit refunds', 'Gift wrap credits', 'Gift wrap credit refunds', 'Promotional rebates', 'Promotional rebate refunds', 'Chargebacks', 'Total_Income'],
    '收入':['销售额（非FBA）', '销售额退款（非FBA）', '销售额（FBA）', '销售额退款（FBA）', 'FBA库存赔偿（FBA）', 'FBA清算收入', '运费收入', '运费退款', '礼品包装收入', '礼品包装退款', '促销折扣', '促销折扣退款', '拒付退款', '合计销售额'],
    'In金额（USD）':[Product_sales_non_FBA, Product_sale_refunds_non_FBA, FBA_product_sales, FBA_product_sale_refunds, FBA_inventory_credit, FBA_liquidation_proceeds, Shipping_credits, Shipping_credit_refunds, Gift_wrap_credits, Gift_wrap_credits_refunds, Promotional_rebates, Promotional_rebate_refunds, Chargebacks, Income_total],
    
    'Expense':['Seller-fulfilled selling fees', 'FBA selling fees', 'Selling fee refunds', 'FBA transaction fees', 'FBA transaction fee refunds', 'Other transaction fees', 'Other transaction fee refunds', 'FBA inventory and inbound services fees', 'Service fees', 'Adjustments', 'Cost of Advertising', 'Liquidations fees', 'Amazon Shipping Charge Adjustments','Total_Expense'],
    '支出':['卖家自配送销售佣金', 'FBA销售佣金', '销售佣金退款', 'FBA派送费用', 'FBA派送费退款', '其他交易费用', '其他交易费用退款', 'FBA仓储及入库服务费', '服务费', '赔偿', '广告费用', '清算费用', '亚马逊运费调整','合计费用'],
    'Ex金额（USD）':[Seller_fulfilled_selling_fees, FBA_selling_fees, Selling_fee_refunds, FBA_transaction_fees, FBA_transaction_fee_refunds, Other_transaction_fees, Other_transaction_fee_refunds, FBA_inventory_and_inbound_services_fees, Service_fees, Adjustments, Cost_of_Advertising, Liquidations_fees, Amazon_Shipping_Charge_Adjustments, Expense_total],
})

