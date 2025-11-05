/**
 * 汇率处理组件
 * 负责USD和CNY之间的实时换算
 * 支持动态汇率更新和多种换算场景
 */

class ExchangeRateManager {
  constructor(options = {}) {
    this.defaultRate = options.defaultRate || 7.1; // 默认汇率
    this.currentRate = this.defaultRate;
    this.lastUpdated = null;
    this.autoUpdate = options.autoUpdate || false;
    this.updateInterval = options.updateInterval || 3600000; // 1小时更新一次
    this.updateEndpoint = options.updateEndpoint || '/api/exchange-rate';
    this.storageKey = options.storageKey || 'exchange_rate_data';
    
    // 绑定方法上下文
    this.convertUSDtoCNY = this.convertUSDtoCNY.bind(this);
    this.convertCNYtoUSD = this.convertCNYtoUSD.bind(this);
    this.formatCurrency = this.formatCurrency.bind(this);
    
    // 初始化
    this.init();
  }

  /**
   * 初始化汇率管理器
   */
  init() {
    // 从本地存储加载汇率数据
    this.loadFromStorage();
    
    // 如果启用自动更新，设置定时器
    if (this.autoUpdate) {
      this.setupAutoUpdate();
    }
    
    // 尝试从服务器获取最新汇率
    this.fetchLatestRate();
  }

  /**
   * 从本地存储加载汇率数据
   */
  loadFromStorage() {
    try {
      const data = Storage.get(this.storageKey);
      if (data && data.rate && data.timestamp) {
        // 检查数据是否过期（24小时）
        const now = Date.now();
        const dataAge = now - data.timestamp;
        const maxAge = 24 * 60 * 60 * 1000; // 24小时
        
        if (dataAge < maxAge) {
          this.currentRate = data.rate;
          this.lastUpdated = new Date(data.timestamp);
          console.log(`从本地存储加载汇率: ${this.currentRate}`);
        }
      }
    } catch (error) {
      console.warn('加载本地汇率数据失败:', error);
    }
  }

  /**
   * 保存汇率数据到本地存储
   */
  saveToStorage() {
    try {
      const data = {
        rate: this.currentRate,
        timestamp: Date.now()
      };
      Storage.set(this.storageKey, data);
    } catch (error) {
      console.warn('保存汇率数据到本地存储失败:', error);
    }
  }

  /**
   * 设置自动更新
   */
  setupAutoUpdate() {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
    }
    
    this.updateTimer = setInterval(() => {
      this.fetchLatestRate();
    }, this.updateInterval);
  }

  /**
   * 从服务器获取最新汇率
   */
  async fetchLatestRate() {
    try {
      const response = await api.get(this.updateEndpoint);
      if (response && response.rate) {
        this.updateRate(response.rate);
        console.log(`从服务器获取最新汇率: ${this.currentRate}`);
      }
    } catch (error) {
      console.warn('获取最新汇率失败:', error);
      // 如果获取失败，可以使用备用API或保持当前汇率
      this.fetchFallbackRate();
    }
  }

  /**
   * 获取备用汇率（当主API失败时）
   */
  async fetchFallbackRate() {
    try {
      // 这里可以使用公开的汇率API作为备用
      // 例如：https://api.exchangerate-api.com/v4/latest/USD
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      const data = await response.json();
      
      if (data && data.rates && data.rates.CNY) {
        this.updateRate(data.rates.CNY);
        console.log(`从备用API获取汇率: ${this.currentRate}`);
      }
    } catch (error) {
      console.warn('获取备用汇率失败:', error);
    }
  }

  /**
   * 更新汇率
   * @param {number} newRate - 新汇率
   */
  updateRate(newRate) {
    if (typeof newRate !== 'number' || newRate <= 0) {
      console.warn('无效的汇率值:', newRate);
      return;
    }
    
    const oldRate = this.currentRate;
    this.currentRate = newRate;
    this.lastUpdated = new Date();
    
    // 保存到本地存储
    this.saveToStorage();
    
    // 触发汇率更新事件
    this.onRateUpdate(oldRate, newRate);
  }

  /**
   * 汇率更新回调
   * @param {number} oldRate - 旧汇率
   * @param {number} newRate - 新汇率
   */
  onRateUpdate(oldRate, newRate) {
    // 创建自定义事件
    const event = new CustomEvent('exchangeRateUpdate', {
      detail: {
        oldRate,
        newRate,
        timestamp: this.lastUpdated
      }
    });
    
    document.dispatchEvent(event);
    
    // 显示通知
    if (Math.abs(oldRate - newRate) > 0.01) {
      notify.info(`汇率已更新: ${oldRate.toFixed(4)} → ${newRate.toFixed(4)}`);
    }
  }

  /**
   * USD转CNY
   * @param {number} usd - USD金额
   * @param {number} precision - 精度，默认2位小数
   * @returns {number}
   */
  convertUSDtoCNY(usd, precision = 2) {
    if (typeof usd !== 'number' || isNaN(usd)) {
      return 0;
    }
    
    const cny = usd * this.currentRate;
    return precision !== undefined ? Number(cny.toFixed(precision)) : cny;
  }

  /**
   * CNY转USD
   * @param {number} cny - CNY金额
   * @param {number} precision - 精度，默认2位小数
   * @returns {number}
   */
  convertCNYtoUSD(cny, precision = 2) {
    if (typeof cny !== 'number' || isNaN(cny)) {
      return 0;
    }
    
    const usd = cny / this.currentRate;
    return precision !== undefined ? Number(usd.toFixed(precision)) : usd;
  }

  /**
   * 格式化货币显示
   * @param {number} amount - 金额
   * @param {string} currency - 货币类型 'USD' 或 'CNY'
   * @param {number} precision - 精度，默认2位小数
   * @returns {string}
   */
  formatCurrency(amount, currency = 'USD', precision = 2) {
    if (typeof amount !== 'number' || isNaN(amount)) {
      amount = 0;
    }
    
    const formattedAmount = amount.toFixed(precision);
    const symbol = currency.toUpperCase() === 'USD' ? '$' : '¥';
    
    return `${symbol}${formattedAmount}`;
  }

  /**
   * 创建货币输入组件
   * @param {Object} options - 配置选项
   * @returns {HTMLElement}
   */
  createCurrencyInput(options = {}) {
    const {
      id,
      value = 0,
      currency = 'USD',
      precision = 2,
      readonly = false,
      placeholder = '0.00',
      showConversion = true,
      onChange = null
    } = options;

    // 创建容器
    const container = DOM.create('div', {
      className: 'currency-input-component'
    });

    // 创建主输入框
    const input = DOM.create('input', {
      type: 'number',
      id: id,
      className: 'form-control currency-input-main',
      value: value,
      step: '0.01',
      min: '0',
      placeholder: placeholder,
      readonly: readonly
    });

    // 创建转换显示
    const conversionDisplay = DOM.create('span', {
      className: 'currency-conversion-display'
    });

    // 创建货币标签
    const currencyLabel = DOM.create('span', {
      className: 'currency-label',
      textContent: currency.toUpperCase()
    });

    // 组装组件
    container.appendChild(currencyLabel);
    container.appendChild(input);
    
    if (showConversion) {
      container.appendChild(conversionDisplay);
    }

    // 添加事件监听
    if (!readonly && onChange) {
      input.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value) || 0;
        onChange(value, currency);
        
        // 更新转换显示
        if (showConversion) {
          const convertedValue = currency === 'USD' 
            ? this.convertUSDtoCNY(value, precision)
            : this.convertCNYtoUSD(value, precision);
          const convertedCurrency = currency === 'USD' ? 'CNY' : 'USD';
          conversionDisplay.textContent = this.formatCurrency(convertedValue, convertedCurrency, precision);
        }
      });
    }

    // 初始更新转换显示
    if (showConversion) {
      const convertedValue = currency === 'USD' 
        ? this.convertUSDtoCNY(value, precision)
        : this.convertCNYtoUSD(value, precision);
      const convertedCurrency = currency === 'USD' ? 'CNY' : 'USD';
      conversionDisplay.textContent = this.formatCurrency(convertedValue, convertedCurrency, precision);
    }

    return container;
  }

  /**
   * 为现有输入框添加实时转换功能
   * @param {string|HTMLElement} inputElement - 输入框元素或选择器
   * @param {Object} options - 配置选项
   */
  enhanceInputWithConversion(inputElement, options = {}) {
    const {
      sourceCurrency = 'USD',
      targetDisplayId = null,
      precision = 2,
      onChange = null
    } = options;

    const input = typeof inputElement === 'string' 
      ? DOM.find(inputElement) 
      : inputElement;

    if (!input) {
      console.warn('找不到输入框元素:', inputElement);
      return;
    }

    // 创建或获取目标显示元素
    let targetDisplay = null;
    if (targetDisplayId) {
      targetDisplay = DOM.find(`#${targetDisplayId}`);
    }

    // 添加输入事件监听
    input.addEventListener('input', (e) => {
      const value = parseFloat(e.target.value) || 0;
      
      // 计算转换后的值
      const convertedValue = sourceCurrency === 'USD' 
        ? this.convertUSDtoCNY(value, precision)
        : this.convertCNYtoUSD(value, precision);
      
      // 更新显示
      if (targetDisplay) {
        const targetCurrency = sourceCurrency === 'USD' ? 'CNY' : 'USD';
        targetDisplay.textContent = this.formatCurrency(convertedValue, targetCurrency, precision);
      }
      
      // 调用自定义回调
      if (onChange) {
        onChange(value, convertedValue);
      }
    });

    // 初始更新
    const initialValue = parseFloat(input.value) || 0;
    const initialConvertedValue = sourceCurrency === 'USD' 
      ? this.convertUSDtoCNY(initialValue, precision)
      : this.convertCNYtoUSD(initialValue, precision);
    
    if (targetDisplay) {
      const targetCurrency = sourceCurrency === 'USD' ? 'CNY' : 'USD';
      targetDisplay.textContent = this.formatCurrency(initialConvertedValue, targetCurrency, precision);
    }
  }

  /**
   * 批量增强输入框
   * @param {Array} configs - 配置数组
   */
  enhanceMultipleInputs(configs) {
    configs.forEach(config => {
      this.enhanceInputWithConversion(config.inputElement, config.options);
    });
  }

  /**
   * 获取当前汇率信息
   * @returns {Object}
   */
  getRateInfo() {
    return {
      rate: this.currentRate,
      lastUpdated: this.lastUpdated,
      defaultRate: this.defaultRate
    };
  }

  /**
   * 重置为默认汇率
   */
  resetToDefault() {
    this.updateRate(this.defaultRate);
  }

  /**
   * 销毁组件
   */
  destroy() {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = null;
    }
  }
}

// 创建全局实例
const exchangeRateManager = new ExchangeRateManager({
  defaultRate: 7.1,
  autoUpdate: true,
  updateInterval: 3600000 // 1小时
});

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ExchangeRateManager,
    exchangeRateManager
  };
}

// 挂载到全局
if (typeof window !== 'undefined') {
  window.ExchangeRateManager = ExchangeRateManager;
  window.exchangeRateManager = exchangeRateManager;
}