# 亚马逊定价测算计算器实现计划

## 概述
本文档详细描述了亚马逊定价测算计算器的实现方案，包括后端Python计算函数、前端界面设计和交互逻辑。

## 1. 后端Python计算函数设计

### 1.1 创建 `apps/pricing_calculator.py`

```python
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
```

### 1.2 在 `routes/toolset.py` 中添加路由

```python
@toolset_bp.route('/pricing-calculator')
@login_required
def pricing_calculator():
    """定价测算页面"""
    LogService.log(
        action="访问定价测算",
        resource="定价测算",
        log_type="user",
        level="info"
    )
    return render_template('tools/pricing-calculator.html')

@toolset_bp.route('/pricing-calculator/calculate', methods=['POST'])
@login_required
def calculate_pricing():
    """计算定价"""
    try:
        # 导入定价计算器
        from pricing_calculator import PricingCalculator
        
        # 获取表单数据
        data = request.get_json()
        
        # 创建计算器实例
        calculator = PricingCalculator()
        
        # 执行计算
        result = calculator.calculate_all(data)
        
        return jsonify({
            'success': True,
            'result': result
        })
        
    except Exception as e:
        print(f"定价计算失败: {e}")
        traceback.print_exc()
        return jsonify({
            'success': False,
            'message': f'计算失败: {str(e)}'
        })
```

## 2. 前端HTML模板设计

### 2.1 创建 `templates/tools/pricing-calculator.html`

```html
<!-- 定价测算工具 -->
<div class="container">
    <div class="tool-header">
        <h2><i class="fas fa-calculator"></i> 亚马逊定价测算</h2>
        <p>计算产品成本、费用和利润，帮助制定合理的定价策略</p>
    </div>
    
    <div class="main-layout">
        <!-- 左侧：成本和费用 -->
        <div class="left-section">
            <!-- 成本部分 -->
            <div class="cost-section">
                <h3><i class="fas fa-box"></i> 成本</h3>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">产品包装规格 (cm)</label>
                        <div class="input-group">
                            <input type="number" id="length" class="form-control" placeholder="长" step="0.1" min="0">
                            <input type="number" id="width" class="form-control" placeholder="宽" step="0.1" min="0">
                            <input type="number" id="height" class="form-control" placeholder="高" step="0.1" min="0">
                        </div>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">重量 (kg)</label>
                        <input type="number" id="actual_weight" class="form-control" placeholder="实际重量" step="0.1" min="0">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">商品成本 (CNY)</label>
                        <div class="currency-input">
                            <input type="number" id="product_cost_cny" class="form-control" placeholder="0.00" step="0.01" min="0">
                            <span class="currency-display" id="product_cost_usd_display">$0.00</span>
                        </div>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">运输成本 (CNY)</label>
                        <div class="currency-input">
                            <input type="text" id="shipping_cost_cny" class="form-control" readonly placeholder="自动计算">
                            <span class="currency-display" id="shipping_cost_usd_display">$0.00</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- 费用部分 -->
            <div class="fee-section">
                <h3><i class="fas fa-coins"></i> 费用</h3>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">平台费用 (USD) - 15%售价</label>
                        <div class="currency-input">
                            <input type="text" id="platform_fee_usd" class="form-control" readonly placeholder="自动计算">
                            <span class="currency-display" id="platform_fee_cny_display">¥0.00</span>
                        </div>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">派送费用 (USD)</label>
                        <div class="currency-input">
                            <input type="text" id="delivery_fee_usd" class="form-control" readonly placeholder="暂未实现">
                            <span class="currency-display" id="delivery_fee_cny_display">¥0.00</span>
                        </div>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">广告费用 (USD) - 15%售价</label>
                        <div class="currency-input">
                            <input type="text" id="advertising_fee_usd" class="form-control" readonly placeholder="自动计算">
                            <span class="currency-display" id="advertising_fee_cny_display">¥0.00</span>
                        </div>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">仓储费用 (USD) - 3%售价</label>
                        <div class="currency-input">
                            <input type="text" id="storage_fee_usd" class="form-control" readonly placeholder="自动计算">
                            <span class="currency-display" id="storage_fee_cny_display">¥0.00</span>
                        </div>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">其他费用 (USD) - 3%售价</label>
                        <div class="currency-input">
                            <input type="text" id="other_fee_usd" class="form-control" readonly placeholder="自动计算">
                            <span class="currency-display" id="other_fee_cny_display">¥0.00</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- 右侧：定价核算 -->
        <div class="right-section">
            <div class="pricing-section">
                <h3><i class="fas fa-chart-line"></i> 定价核算</h3>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">商品售价 (USD)</label>
                        <div class="currency-input">
                            <input type="number" id="selling_price_usd" class="form-control" placeholder="0.00" step="0.01" min="0">
                            <span class="currency-display" id="selling_price_cny_display">¥0.00</span>
                        </div>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">折扣促销 (USD)</label>
                        <div class="currency-input">
                            <input type="number" id="discount_usd" class="form-control" placeholder="0.00" step="0.01" min="0">
                            <span class="currency-display" id="discount_cny_display">¥0.00</span>
                        </div>
                    </div>
                </div>
                
                <div class="divider"></div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">总支出 (USD) = 成本 + 费用</label>
                        <div class="currency-input">
                            <input type="text" id="total_expense_usd" class="form-control" readonly placeholder="自动计算">
                            <span class="currency-display" id="total_expense_cny_display">¥0.00</span>
                        </div>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">成本小计 (USD)</label>
                        <div class="currency-input">
                            <input type="text" id="cost_subtotal_usd" class="form-control" readonly placeholder="自动计算">
                            <span class="currency-display" id="cost_subtotal_cny_display">¥0.00</span>
                        </div>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">费用小计 (USD)</label>
                        <div class="currency-input">
                            <input type="text" id="fee_subtotal_usd" class="form-control" readonly placeholder="自动计算">
                            <span class="currency-display" id="fee_subtotal_cny_display">¥0.00</span>
                        </div>
                    </div>
                </div>
                
                <div class="divider"></div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">毛利润 (USD) = 商品售价 - 折扣促销 - 总支出</label>
                        <div class="currency-input">
                            <input type="text" id="gross_profit_usd" class="form-control" readonly placeholder="自动计算">
                            <span class="currency-display" id="gross_profit_cny_display">¥0.00</span>
                        </div>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">毛利率</label>
                        <div class="margin-display">
                            <input type="text" id="profit_margin" class="form-control" readonly placeholder="0.00%">
                            <div class="margin-indicator" id="margin_indicator">
                                <div class="margin-bar"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <!-- 底部操作按钮 -->
    <div class="bottom-actions">
        <button type="button" id="calculate-btn" class="btn btn-primary">
            <i class="fas fa-calculator"></i>
            重新计算
        </button>
        <button type="button" id="reset-btn" class="btn btn-secondary">
            <i class="fas fa-refresh"></i>
            重置
        </button>
    </div>
</div>

<script>
// 定价测算页面脚本
(function() {
    let calculator = null;
    const EXCHANGE_RATE = 7.1; // 默认汇率
    
    // 初始化页面
    function initPage() {
        bindEvents();
        setupRealTimeCalculation();
    }
    
    // 绑定事件
    function bindEvents() {
        const calculateBtn = document.getElementById('calculate-btn');
        const resetBtn = document.getElementById('reset-btn');
        
        // 计算按钮
        calculateBtn.addEventListener('click', function() {
            performCalculation();
        });
        
        // 重置按钮
        resetBtn.addEventListener('click', function() {
            resetForm();
        });
    }
    
    // 设置实时计算
    function setupRealTimeCalculation() {
        // 监听所有输入框变化
        const inputs = document.querySelectorAll('input[type="number"]');
        inputs.forEach(input => {
            input.addEventListener('input', function() {
                // 延迟计算，避免频繁请求
                clearTimeout(calculator);
                calculator = setTimeout(performCalculation, 500);
            });
        });
    }
    
    // 执行计算
    async function performCalculation() {
        try {
            // 收集表单数据
            const formData = {
                length: parseFloat(document.getElementById('length').value) || 0,
                width: parseFloat(document.getElementById('width').value) || 0,
                height: parseFloat(document.getElementById('height').value) || 0,
                actual_weight: parseFloat(document.getElementById('actual_weight').value) || 0,
                product_cost_cny: parseFloat(document.getElementById('product_cost_cny').value) || 0,
                selling_price_usd: parseFloat(document.getElementById('selling_price_usd').value) || 0,
                discount_usd: parseFloat(document.getElementById('discount_usd').value) || 0
            };
            
            // 调用后端API
            const response = await fetch('/toolset/pricing-calculator/calculate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                updateUI(result.result);
            } else {
                console.error('计算失败:', result.message);
            }
        } catch (error) {
            console.error('计算错误:', error);
        }
    }
    
    // 更新UI
    function updateUI(result) {
        // 更新运输成本
        document.getElementById('shipping_cost_cny').value = result.shipping.shipping_cost_cny.toFixed(2);
        document.getElementById('shipping_cost_usd_display').textContent = `$${result.shipping.shipping_cost_usd.toFixed(2)}`;
        
        // 更新各项费用
        document.getElementById('platform_fee_usd').value = result.platform.platform_fee_usd.toFixed(2);
        document.getElementById('platform_fee_cny_display').textContent = `¥${result.platform.platform_fee_cny.toFixed(2)}`;
        
        document.getElementById('delivery_fee_usd').value = result.delivery.delivery_fee_usd.toFixed(2);
        document.getElementById('delivery_fee_cny_display').textContent = `¥${result.delivery.delivery_fee_cny.toFixed(2)}`;
        
        document.getElementById('advertising_fee_usd').value = result.advertising.advertising_fee_usd.toFixed(2);
        document.getElementById('advertising_fee_cny_display').textContent = `¥${result.advertising.advertising_fee_cny.toFixed(2)}`;
        
        document.getElementById('storage_fee_usd').value = result.storage.storage_fee_usd.toFixed(2);
        document.getElementById('storage_fee_cny_display').textContent = `¥${result.storage.storage_fee_cny.toFixed(2)}`;
        
        document.getElementById('other_fee_usd').value = result.other.other_fee_usd.toFixed(2);
        document.getElementById('other_fee_cny_display').textContent = `¥${result.other.other_fee_cny.toFixed(2)}`;
        
        // 更新总支出和小计
        document.getElementById('total_expense_usd').value = result.total_costs.total_expense_usd.toFixed(2);
        document.getElementById('total_expense_cny_display').textContent = `¥${result.total_costs.total_expense_cny.toFixed(2)}`;
        
        document.getElementById('cost_subtotal_usd').value = result.total_costs.cost_subtotal_usd.toFixed(2);
        document.getElementById('cost_subtotal_cny_display').textContent = `¥${result.total_costs.cost_subtotal_cny.toFixed(2)}`;
        
        document.getElementById('fee_subtotal_usd').value = result.total_costs.fee_subtotal_usd.toFixed(2);
        document.getElementById('fee_subtotal_cny_display').textContent = `¥${result.total_costs.fee_subtotal_cny.toFixed(2)}`;
        
        // 更新利润
        document.getElementById('gross_profit_usd').value = result.profit.gross_profit_usd.toFixed(2);
        document.getElementById('gross_profit_cny_display').textContent = `¥${result.profit.gross_profit_cny.toFixed(2)}`;
        
        document.getElementById('profit_margin').value = `${result.profit.profit_margin.toFixed(2)}%`;
        
        // 更新毛利率指示器
        updateMarginIndicator(result.profit.profit_margin);
    }
    
    // 更新毛利率指示器
    function updateMarginIndicator(margin) {
        const indicator = document.getElementById('margin_indicator');
        const bar = indicator.querySelector('.margin-bar');
        
        // 设置宽度
        bar.style.width = `${Math.min(Math.max(margin, 0), 100)}%`;
        
        // 设置颜色
        if (margin < 0) {
            bar.style.backgroundColor = '#ff4757'; // 红色
        } else if (margin < 10) {
            bar.style.backgroundColor = '#ffa502'; // 橙色
        } else if (margin < 20) {
            bar.style.backgroundColor = '#ffdd59'; // 黄色
        } else {
            bar.style.backgroundColor = '#00ff88'; // 绿色
        }
    }
    
    // 重置表单
    function resetForm() {
        const inputs = document.querySelectorAll('input');
        inputs.forEach(input => {
            if (input.type === 'number') {
                input.value = '';
            } else if (input.type === 'text' && input.hasAttribute('readonly')) {
                input.value = '';
            }
        });
        
        // 重置显示
        const displays = document.querySelectorAll('.currency-display');
        displays.forEach(display => {
            if (display.textContent.includes('$')) {
                display.textContent = '$0.00';
            } else if (display.textContent.includes('¥')) {
                display.textContent = '¥0.00';
            }
        });
        
        document.getElementById('profit_margin').value = '0.00%';
        updateMarginIndicator(0);
    }
    
    // 页面加载完成后初始化
    document.addEventListener('DOMContentLoaded', initPage);
})();
</script>

<style>
/* 定价测算页面样式 - 与现有工具风格保持一致 */
.main-layout {
    display: flex;
    gap: 30px;
    margin-bottom: 30px;
    min-height: 600px;
}

.left-section,
.right-section {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.left-section {
    gap: 20px;
}

.cost-section,
.fee-section,
.pricing-section {
    background: var(--bg-secondary, rgba(255, 255, 255, 0.05));
    border: 1px solid var(--border-color, rgba(0, 212, 255, 0.2));
    border-radius: 12px;
    padding: 20px;
    flex: 1;
}

.cost-section h3,
.fee-section h3,
.pricing-section h3 {
    color: var(--primary-color, #00d4ff);
    font-size: 16px;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 8px;
}

.form-row {
    margin-bottom: 15px;
}

.form-group {
    margin-bottom: 0;
}

.form-label {
    display: block;
    color: var(--text-primary, #ffffff);
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 8px;
}

.form-control {
    width: 100%;
    padding: 12px;
    border: 1px solid var(--border-color, rgba(0, 212, 255, 0.2));
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.05);
    color: var(--text-primary, #ffffff);
    font-size: 14px;
    transition: var(--transition, all 0.3s ease);
}

.form-control:focus {
    outline: none;
    border-color: var(--primary-color, #00d4ff);
    box-shadow: 0 0 0 2px rgba(0, 212, 255, 0.2);
}

.form-control[readonly] {
    background: rgba(255, 255, 255, 0.02);
    cursor: not-allowed;
}

.input-group {
    display: flex;
    gap: 10px;
}

.input-group .form-control {
    flex: 1;
}

.currency-input {
    display: flex;
    align-items: center;
    gap: 15px;
}

.currency-input .form-control {
    flex: 1;
}

.currency-display {
    min-width: 80px;
    text-align: right;
    font-weight: 600;
    color: var(--success-color, #00ff88);
}

.margin-display {
    display: flex;
    align-items: center;
    gap: 15px;
}

.margin-display .form-control {
    flex: 0 0 100px;
}

.margin-indicator {
    flex: 1;
    height: 8px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    overflow: hidden;
}

.margin-bar {
    height: 100%;
    width: 0%;
    background: var(--success-color, #00ff88);
    transition: width 0.3s ease, background-color 0.3s ease;
}

.divider {
    height: 1px;
    background: var(--border-color, rgba(0, 212, 255, 0.2));
    margin: 20px 0;
}

.bottom-actions {
    text-align: center;
    margin-bottom: 30px;
    padding: 20px;
    background: var(--bg-secondary, rgba(255, 255, 255, 0.05));
    border-radius: 12px;
}

.btn {
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: var(--transition, all 0.3s ease);
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin: 0 10px;
}

.btn-primary {
    background: linear-gradient(135deg, var(--primary-color, #00d4ff), var(--secondary-color, #6c5ce7));
    color: var(--text-primary, #ffffff);
}

.btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 212, 255, 0.3);
}

.btn-secondary {
    background: var(--bg-secondary, rgba(255, 255, 255, 0.1));
    border: 1px solid var(--border-color, rgba(255, 255, 255, 0.2));
    color: var(--text-primary, #ffffff);
}

.btn-secondary:hover {
    border-color: var(--primary-color, #00d4ff);
}

/* 响应式设计 */
@media (max-width: 768px) {
    .main-layout {
        flex-direction: column;
        gap: 20px;
    }
    
    .input-group {
        flex-direction: column;
        gap: 10px;
    }
    
    .currency-input,
    .margin-display {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
    }
    
    .currency-display {
        min-width: auto;
        text-align: left;
    }
    
    .margin-display .form-control {
        flex: 1;
    }
    
    .btn {
        margin: 5px;
        padding: 10px 20px;
    }
}
</style>
```

## 3. 导航菜单和主页面更新

### 3.1 在 `templates/index.html` 中添加导航菜单项

在工具分类下的子菜单中添加：

```html
<li class="nav-item">
    <a href="#" data-content="pricing-calculator" class="nav-link">
        <i class="fas fa-calculator"></i>
        <span>定价测算</span>
    </a>
</li>
```

### 3.2 在 `static/js/main.js` 中添加页面初始化函数

1. 在 `getContentUrl` 方法中添加URL映射：

```javascript
'pricing-calculator': '/toolset/pricing-calculator?embed=true',
```

2. 在 `initializePageContent` 方法中添加初始化函数：

```javascript
'pricing-calculator': () => this.initializePricingCalculator()
```

3. 添加初始化方法：

```javascript
/**
 * 初始化定价测算页面
 */
initializePricingCalculator() {
    console.log('定价测算页面已加载');
    // 页面脚本已在模板中定义，无需额外初始化
}
```

## 4. 实现步骤总结

1. 创建后端Python计算函数 (`apps/pricing_calculator.py`)
2. 在 `routes/toolset.py` 中添加路由
3. 创建前端HTML模板 (`templates/tools/pricing-calculator.html`)
4. 在导航菜单中添加定价测算工具入口
5. 在 `main.js` 中添加页面初始化函数
6. 测试所有功能并优化用户体验

## 5. 功能特点

- 实时计算：输入变化时自动计算
- 汇率转换：自动显示USD和CNY两种货币
- 毛利率指示器：可视化显示利润率
- 响应式设计：适配不同屏幕尺寸
- 预留接口：派送费用计算预留扩展接口
- 错误处理：完善的错误处理机制

## 6. 后续扩展计划

1. 派送费用计算函数实现
2. 汇率设置功能
3. 计算结果导出功能
4. 历史记录保存
5. 多产品对比功能