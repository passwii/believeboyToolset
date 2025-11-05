"""
亚马逊定价测算计算器
包含运输成本、派送费用等计算逻辑
"""

class PricingCalculator:
    def __init__(self, exchange_rate=7.1):
        self.exchange_rate = exchange_rate  # 默认美元兑人民币汇率
    
    def calculate_shipping_cost(self, length, width, height, actual_weight):
        """
        计算运输成本
        实际重量kg和抛重kg，然后取大值x7CNY
        抛重计算=长宽高/6000
        """
        # 计算抛重
        dimensional_weight = (length * width * height) / 6000
        
        # 取实际重量和抛重的较大值
        chargeable_weight = max(actual_weight, dimensional_weight)
        
        # 运输成本 = 计费重量 × 7 CNY
        shipping_cost_cny = chargeable_weight * 7
        
        return {
            'dimensional_weight': round(dimensional_weight, 2),
            'chargeable_weight': round(chargeable_weight, 2),
            'shipping_cost_cny': round(shipping_cost_cny, 2),
            'shipping_cost_usd': round(shipping_cost_cny / self.exchange_rate, 2)
        }
    
    def calculate_delivery_fee(self, **kwargs):
        """
        计算派送费用
        暂时用空函数带入，输出0，后续再补充
        """
        # 预留接口，后续扩展
        return {
            'delivery_fee_usd': 0,
            'delivery_fee_cny': 0
        }
    
    def calculate_platform_fees(self, selling_price_usd):
        """
        计算平台费用 (15%售价)
        """
        platform_fee_usd = selling_price_usd * 0.15
        return {
            'platform_fee_usd': round(platform_fee_usd, 2),
            'platform_fee_cny': round(platform_fee_usd * self.exchange_rate, 2)
        }
    
    def calculate_advertising_fee(self, selling_price_usd):
        """
        计算广告费用 (15%售价)
        """
        advertising_fee_usd = selling_price_usd * 0.15
        return {
            'advertising_fee_usd': round(advertising_fee_usd, 2),
            'advertising_fee_cny': round(advertising_fee_usd * self.exchange_rate, 2)
        }
    
    def calculate_storage_fee(self, selling_price_usd):
        """
        计算仓储费用 (3%售价)
        """
        storage_fee_usd = selling_price_usd * 0.03
        return {
            'storage_fee_usd': round(storage_fee_usd, 2),
            'storage_fee_cny': round(storage_fee_usd * self.exchange_rate, 2)
        }
    
    def calculate_other_fees(self, selling_price_usd):
        """
        计算其他费用 (3%售价)
        """
        other_fee_usd = selling_price_usd * 0.03
        return {
            'other_fee_usd': round(other_fee_usd, 2),
            'other_fee_cny': round(other_fee_usd * self.exchange_rate, 2)
        }
    
    def calculate_total_costs(self, product_cost_cny, shipping_cost_cny, platform_fee_usd, 
                            delivery_fee_usd, advertising_fee_usd, storage_fee_usd, other_fee_usd):
        """
        计算总支出
        """
        # 成本小计 (CNY)
        cost_subtotal_cny = product_cost_cny + shipping_cost_cny
        cost_subtotal_usd = cost_subtotal_cny / self.exchange_rate
        
        # 费用小计 (USD)
        fee_subtotal_usd = platform_fee_usd + delivery_fee_usd + advertising_fee_usd + storage_fee_usd + other_fee_usd
        fee_subtotal_cny = fee_subtotal_usd * self.exchange_rate
        
        # 总支出
        total_expense_usd = cost_subtotal_usd + fee_subtotal_usd
        total_expense_cny = cost_subtotal_cny + fee_subtotal_cny
        
        return {
            'cost_subtotal_usd': round(cost_subtotal_usd, 2),
            'cost_subtotal_cny': round(cost_subtotal_cny, 2),
            'fee_subtotal_usd': round(fee_subtotal_usd, 2),
            'fee_subtotal_cny': round(fee_subtotal_cny, 2),
            'total_expense_usd': round(total_expense_usd, 2),
            'total_expense_cny': round(total_expense_cny, 2)
        }
    
    def calculate_profit(self, selling_price_usd, discount_usd, total_expense_usd):
        """
        计算毛利润和毛利率
        毛利润 = 商品售价 - 折扣促销 - 总支出
        毛利率 = 毛利润 / 商品售价
        """
        gross_profit_usd = selling_price_usd - discount_usd - total_expense_usd
        gross_profit_cny = gross_profit_usd * self.exchange_rate
        
        # 计算毛利率
        if selling_price_usd > 0:
            profit_margin = (gross_profit_usd / selling_price_usd) * 100
        else:
            profit_margin = 0
        
        return {
            'gross_profit_usd': round(gross_profit_usd, 2),
            'gross_profit_cny': round(gross_profit_cny, 2),
            'profit_margin': round(profit_margin, 2)
        }
    
    def calculate_all(self, data):
        """
        计算所有费用和利润
        data: 包含所有输入参数的字典
        """
        # 提取输入参数
        length = float(data.get('length', 0))
        width = float(data.get('width', 0))
        height = float(data.get('height', 0))
        actual_weight = float(data.get('actual_weight', 0))
        product_cost_cny = float(data.get('product_cost_cny', 0))
        selling_price_usd = float(data.get('selling_price_usd', 0))
        discount_usd = float(data.get('discount_usd', 0))
        
        # 计算各项费用
        shipping_result = self.calculate_shipping_cost(length, width, height, actual_weight)
        delivery_result = self.calculate_delivery_fee()
        platform_result = self.calculate_platform_fees(selling_price_usd)
        advertising_result = self.calculate_advertising_fee(selling_price_usd)
        storage_result = self.calculate_storage_fee(selling_price_usd)
        other_result = self.calculate_other_fees(selling_price_usd)
        
        # 计算总支出
        total_costs_result = self.calculate_total_costs(
            product_cost_cny, 
            shipping_result['shipping_cost_cny'],
            platform_result['platform_fee_usd'],
            delivery_result['delivery_fee_usd'],
            advertising_result['advertising_fee_usd'],
            storage_result['storage_fee_usd'],
            other_result['other_fee_usd']
        )
        
        # 计算利润
        profit_result = self.calculate_profit(
            selling_price_usd, 
            discount_usd, 
            total_costs_result['total_expense_usd']
        )
        
        # 返回完整结果
        return {
            'shipping': shipping_result,
            'delivery': delivery_result,
            'platform': platform_result,
            'advertising': advertising_result,
            'storage': storage_result,
            'other': other_result,
            'total_costs': total_costs_result,
            'profit': profit_result,
            'exchange_rate': self.exchange_rate
        }