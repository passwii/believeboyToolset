/**
 * 通用工具函数模块
 * 提取了原来分散在多个文件中的通用功能
 */

// DOM操作工具函数
const DOM = {
  /**
   * 选择单个元素
   * @param {string} selector - CSS选择器
   * @param {Element} scope - 作用域，默认为document
   * @returns {Element|null}
   */
  find(selector, scope = document) {
    return scope.querySelector(selector);
  },

  /**
   * 选择多个元素
   * @param {string} selector - CSS选择器
   * @param {Element} scope - 作用域，默认为document
   * @returns {NodeList}
   */
  findAll(selector, scope = document) {
    return scope.querySelectorAll(selector);
  },

  /**
   * 检查元素是否存在
   * @param {string} selector - CSS选择器
   * @param {Element} scope - 作用域，默认为document
   * @returns {boolean}
   */
  exists(selector, scope = document) {
    return this.find(selector, scope) !== null;
  },

  /**
   * 创建元素
   * @param {string} tag - 标签名
   * @param {Object} attributes - 属性对象
   * @param {string} content - 内容
   * @returns {Element}
   */
  create(tag, attributes = {}, content = '') {
    const element = document.createElement(tag);
    
    // 设置属性
    Object.entries(attributes).forEach(([key, value]) => {
      if (key === 'className') {
        element.className = value;
      } else if (key === 'dataset') {
        Object.entries(value).forEach(([dataKey, dataValue]) => {
          element.dataset[dataKey] = dataValue;
        });
      } else {
        element.setAttribute(key, value);
      }
    });
    
    // 设置内容
    if (content) {
      element.innerHTML = content;
    }
    
    return element;
  },

  /**
   * 添加事件监听器
   * @param {Element|string} element - 元素或选择器
   * @param {string} event - 事件名
   * @param {Function} handler - 事件处理函数
   * @param {Object} options - 选项
   */
  on(element, event, handler, options = {}) {
    const target = typeof element === 'string' ? this.find(element) : element;
    if (target) {
      target.addEventListener(event, handler, options);
    }
  },

  /**
   * 移除事件监听器
   * @param {Element|string} element - 元素或选择器
   * @param {string} event - 事件名
   * @param {Function} handler - 事件处理函数
   */
  off(element, event, handler) {
    const target = typeof element === 'string' ? this.find(element) : element;
    if (target) {
      target.removeEventListener(event, handler);
    }
  },

  /**
   * 显示元素
   * @param {Element|string} element - 元素或选择器
   */
  show(element) {
    const target = typeof element === 'string' ? this.find(element) : element;
    if (target) {
      target.style.display = '';
      target.classList.remove('hidden');
    }
  },

  /**
   * 隐藏元素
   * @param {Element|string} element - 元素或选择器
   */
  hide(element) {
    const target = typeof element === 'string' ? this.find(element) : element;
    if (target) {
      target.style.display = 'none';
      target.classList.add('hidden');
    }
  },

  /**
   * 切换元素显示状态
   * @param {Element|string} element - 元素或选择器
   */
  toggle(element) {
    const target = typeof element === 'string' ? this.find(element) : element;
    if (target) {
      if (target.style.display === 'none') {
        this.show(target);
      } else {
        this.hide(target);
      }
    }
  },

  /**
   * 添加CSS类
   * @param {Element|string} element - 元素或选择器
   * @param {string} className - 类名
   */
  addClass(element, className) {
    const target = typeof element === 'string' ? this.find(element) : element;
    if (target) {
      target.classList.add(className);
    }
  },

  /**
   * 移除CSS类
   * @param {Element|string} element - 元素或选择器
   * @param {string} className - 类名
   */
  removeClass(element, className) {
    const target = typeof element === 'string' ? this.find(element) : element;
    if (target) {
      target.classList.remove(className);
    }
  },

  /**
   * 切换CSS类
   * @param {Element|string} element - 元素或选择器
   * @param {string} className - 类名
   */
  toggleClass(element, className) {
    const target = typeof element === 'string' ? this.find(element) : element;
    if (target) {
      target.classList.toggle(className);
    }
  }
};

// 字符串工具函数
const StringUtils = {
  /**
   * 格式化文件大小
   * @param {number} bytes - 字节数
   * @returns {string}
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  /**
   * 格式化日期
   * @param {Date|string|number} date - 日期
   * @param {string} format - 格式字符串
   * @returns {string}
   */
  formatDate(date, format = 'YYYY-MM-DD') {
    const d = new Date(date);
    
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    
    return format
      .replace('YYYY', year)
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds);
  },

  /**
   * 截断字符串
   * @param {string} str - 字符串
   * @param {number} length - 最大长度
   * @param {string} suffix - 后缀
   * @returns {string}
   */
  truncate(str, length = 50, suffix = '...') {
    if (str.length <= length) return str;
    return str.substring(0, length) + suffix;
  },

  /**
   * 生成随机字符串
   * @param {number} length - 长度
   * @returns {string}
   */
  random(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
};

// 时间工具函数
const TimeUtils = {
  /**
   * 格式化相对时间
   * @param {Date|string|number} timestamp - 时间戳
   * @returns {string}
   */
  timeAgo(timestamp) {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return '刚刚';
    if (diffMins < 60) return `${diffMins}分钟前`;
    if (diffHours < 24) return `${diffHours}小时前`;
    if (diffDays < 7) return `${diffDays}天前`;
    
    return date.toLocaleDateString('zh-CN');
  },

  /**
   * 获取昨天的日期字符串
   * @param {string} format - 格式，默认为YYYY-MM-DD
   * @returns {string}
   */
  yesterday(format = 'YYYY-MM-DD') {
    // 获取用户浏览器本地时间的当前日期
    const now = new Date();
    // 直接创建昨天的日期对象
    const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    return StringUtils.formatDate(yesterday, format);
  },

  /**
   * 获取上周的日期范围
   * @returns {Object} {start: string, end: string}
   */
  lastWeek() {
    const now = new Date();
    const today = new Date(now);
    const dayOfWeek = today.getDay();
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const thisWeekMonday = new Date(today);
    thisWeekMonday.setDate(today.getDate() - daysToSubtract);
    
    const lastWeekStart = new Date(thisWeekMonday);
    lastWeekStart.setDate(thisWeekMonday.getDate() - 7);
    
    const lastWeekEnd = new Date(thisWeekMonday);
    lastWeekEnd.setDate(thisWeekMonday.getDate() - 1);
    
    return {
      start: StringUtils.formatDate(lastWeekStart, 'YYYY-MM-DD'),
      end: StringUtils.formatDate(lastWeekEnd, 'YYYY-MM-DD')
    };
  },

  /**
   * 获取本周的周一
   * @returns {Date}
   */
  thisWeekMonday() {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const monday = new Date(now);
    monday.setDate(now.getDate() - daysToSubtract);
    return monday;
  }
};

// 数据验证工具函数
const Validation = {
  /**
   * 验证邮箱格式
   * @param {string} email - 邮箱
   * @returns {boolean}
   */
  isEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * 验证手机号格式
   * @param {string} phone - 手机号
   * @returns {boolean}
   */
  isPhone(phone) {
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(phone);
  },

  /**
   * 验证URL格式
   * @param {string} url - URL
   * @returns {boolean}
   */
  isUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * 验证文件类型
   * @param {File} file - 文件对象
   * @param {Array} allowedTypes - 允许的类型数组
   * @returns {boolean}
   */
  isValidFileType(file, allowedTypes = []) {
    if (!allowedTypes.length) return true;
    
    const extension = file.name.split('.').pop().toLowerCase();
    return allowedTypes.includes(extension);
  },

  /**
   * 验证文件大小
   * @param {File} file - 文件对象
   * @param {number} maxSize - 最大大小（字节）
   * @returns {boolean}
   */
  isValidFileSize(file, maxSize = 5 * 1024 * 1024) {
    return file.size <= maxSize;
  }
};

// 数组工具函数
const ArrayUtils = {
  /**
   * 去重
   * @param {Array} array - 数组
   * @returns {Array}
   */
  unique(array) {
    return [...new Set(array)];
  },

  /**
   * 打乱数组
   * @param {Array} array - 数组
   * @returns {Array}
   */
  shuffle(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  },

  /**
   * 分组
   * @param {Array} array - 数组
   * @param {number} size - 每组大小
   * @returns {Array}
   */
  chunk(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  },

  /**
   * 查找最大值
   * @param {Array} array - 数组
   * @param {Function} iteratee - 迭代函数
   * @returns {*}
   */
  maxBy(array, iteratee) {
    if (!array.length) return undefined;
    
    let maxItem = array[0];
    let maxValue = iteratee(maxItem);
    
    for (let i = 1; i < array.length; i++) {
      const value = iteratee(array[i]);
      if (value > maxValue) {
        maxValue = value;
        maxItem = array[i];
      }
    }
    
    return maxItem;
  },

  /**
   * 查找最小值
   * @param {Array} array - 数组
   * @param {Function} iteratee - 迭代函数
   * @returns {*}
   */
  minBy(array, iteratee) {
    if (!array.length) return undefined;
    
    let minItem = array[0];
    let minValue = iteratee(minItem);
    
    for (let i = 1; i < array.length; i++) {
      const value = iteratee(array[i]);
      if (value < minValue) {
        minValue = value;
        minItem = array[i];
      }
    }
    
    return minItem;
  }
};

// 本地存储工具
const Storage = {
  /**
   * 设置本地存储
   * @param {string} key - 键
   * @param {*} value - 值
   */
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  },

  /**
   * 获取本地存储
   * @param {string} key - 键
   * @param {*} defaultValue - 默认值
   * @returns {*}
   */
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn('Failed to read from localStorage:', error);
      return defaultValue;
    }
  },

  /**
   * 删除本地存储
   * @param {string} key - 键
   */
  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Failed to remove from localStorage:', error);
    }
  },

  /**
   * 清空所有本地存储
   */
  clear() {
    try {
      localStorage.clear();
    } catch (error) {
      console.warn('Failed to clear localStorage:', error);
    }
  }
};

// 防抖函数
function debounce(func, wait, immediate = false) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func(...args);
  };
}

// 节流函数
function throttle(func, limit) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// 复制到剪贴板
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    // 降级方案
    const textArea = DOM.create('textarea', {
      style: 'position: fixed; left: -999999px; top: -999999px;'
    });
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    textArea.setSelectionRange(0, 99999);
    
    try {
      document.execCommand('copy');
      return true;
    } catch (err) {
      return false;
    } finally {
      textArea.remove();
    }
  }
}

// 导出工具函数
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    DOM,
    StringUtils,
    TimeUtils,
    Validation,
    ArrayUtils,
    Storage,
    debounce,
    throttle,
    copyToClipboard
  };
}

// 挂载到全局作用域
if (typeof window !== 'undefined') {
  window.DOM = DOM;
  window.StringUtils = StringUtils;
  window.TimeUtils = TimeUtils;
  window.Validation = Validation;
  window.ArrayUtils = ArrayUtils;
  window.Storage = Storage;
  window.debounce = debounce;
  window.throttle = throttle;
  window.copyToClipboard = copyToClipboard;
}