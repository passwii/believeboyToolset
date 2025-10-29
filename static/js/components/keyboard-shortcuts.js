/**
 * 键盘快捷键组件
 * 处理全局键盘快捷键功能
 */

class KeyboardShortcutsComponent {
  constructor(options = {}) {
    this.options = {
      enabled: true,
      showTooltips: true,
      ...options
    };

    // 快捷键定义
    this.shortcuts = new Map([
      // Alt + 数字键 1-5：快速导航
      ['Alt+1', { 
        action: () => this.navigateToSection('dashboard'), 
        description: '仪表板' 
      }],
      ['Alt+2', { 
        action: () => this.navigateToSection('daily-report'), 
        description: '日报' 
      }],
      ['Alt+3', { 
        action: () => this.navigateToSection('monthly-report'), 
        description: '月报' 
      }],
      ['Alt+4', { 
        action: () => this.navigateToSection('product-analysis'), 
        description: '产品分析' 
      }],
      ['Alt+5', { 
        action: () => this.navigateToSection('shop-management'), 
        description: '店铺管理' 
      }],

      // Ctrl + M：用户菜单
      ['Ctrl+M', { 
        action: () => this.toggleUserMenu(), 
        description: '用户菜单' 
      }],

      // Escape：关闭模态框
      ['Escape', { 
        action: () => this.closeCurrentModal(), 
        description: '关闭对话框' 
      }],

      // F1：帮助
      ['F1', { 
        action: () => this.showHelp(), 
        description: '显示帮助' 
      }],

      // Ctrl + /：显示快捷键帮助
      ['Control+/', { 
        action: () => this.showShortcutsHelp(), 
        description: '快捷键帮助' 
      }],
    ]);

    this.init();
  }

  /**
   * 初始化组件
   */
  init() {
    if (!this.options.enabled) return;
    
    this.setupEventListeners();
    this.createTooltips();
    this.bindToApplication();
  }

  /**
   * 设置事件监听器
   */
  setupEventListeners() {
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    
    // 防止在输入框中触发快捷键
    const ignoreSelectors = [
      'input', 'textarea', 'select', '[contenteditable="true"]'
    ];
    
    this.shouldIgnoreEvent = (target) => {
      return ignoreSelectors.some(selector => target.closest(selector));
    };
  }

  /**
   * 绑定到应用程序实例
   */
  bindToApplication() {
    if (typeof window.Application !== 'undefined' && window.Application.instance) {
      this.application = window.Application.instance;
      this.navigateToSection = (section) => {
        if (this.application.loadContent) {
          this.application.loadContent(section);
        }
      };
      this.toggleUserMenu = () => {
        const userDropdown = document.querySelector('.user-dropdown');
        if (userDropdown) {
          userDropdown.classList.toggle('active');
        }
      };
    }
  }

  /**
   * 处理键盘按键事件
   */
  handleKeyDown(e) {
    // 如果在输入框中，不处理快捷键
    if (this.shouldIgnoreEvent(e.target)) {
      return;
    }

    const key = this.getKeyString(e);
    const shortcut = this.shortcuts.get(key);
    
    if (shortcut) {
      e.preventDefault();
      shortcut.action();
      
      // 显示提示（可选）
      if (this.options.showTooltips) {
        this.showShortcutTooltip(shortcut.description);
      }
    }
  }

  /**
   * 获取按键字符串
   */
  getKeyString(e) {
    const parts = [];
    
    if (e.ctrlKey || e.metaKey) parts.push('Control');
    if (e.altKey) parts.push('Alt');
    if (e.shiftKey) parts.push('Shift');
    
    // 主键
    let mainKey = e.key;
    
    // 特殊键处理
    if (e.key === ' ') mainKey = 'Space';
    else if (e.key === 'Escape') mainKey = 'Escape';
    else if (e.key === 'F1') mainKey = 'F1';
    else if (e.key === '/') mainKey = '/';
    else if (e.key.length === 1) {
      mainKey = e.key.toUpperCase();
    }
    
    parts.push(mainKey);
    return parts.join('+');
  }

  /**
   * 导航到指定章节
   */
  navigateToSection(sectionName) {
    if (this.application && this.application.loadContent) {
      this.application.loadContent(sectionName);
      notify.info(`已切换到：${this.getSectionDisplayName(sectionName)}`);
    } else {
      // 备选方案：查找对应的链接
      const navLink = document.querySelector(`[data-content="${sectionName}"]`);
      if (navLink) {
        navLink.click();
      }
    }
  }

  /**
   * 获取章节显示名称
   */
  getSectionDisplayName(sectionName) {
    const names = {
      'dashboard': '仪表板',
      'daily-report': '日报',
      'monthly-report': '月报', 
      'product-analysis': '产品分析',
      'shop-management': '店铺管理',
      'user-management': '用户管理'
    };
    return names[sectionName] || sectionName;
  }

  /**
   * 切换用户菜单
   */
  toggleUserMenu() {
    const userDropdown = document.querySelector('.user-dropdown');
    if (userDropdown) {
      userDropdown.classList.toggle('active');
    }
  }

  /**
   * 关闭当前模态框
   */
  closeCurrentModal() {
    // 关闭所有打开的模态框
    const modals = document.querySelectorAll('.modal[style*="block"]');
    modals.forEach(modal => {
      modal.style.display = 'none';
    });
    
    // 关闭通知
    if (typeof notifications !== 'undefined') {
      notifications.hideAll();
    }
  }

  /**
   * 显示帮助
   */
  showHelp() {
    // 如果当前页面有对应的帮助链接，点击它
    const helpLink = document.querySelector('a[href*="help"]');
    if (helpLink) {
      window.open(helpLink.href, '_blank');
    } else {
      notify.info('帮助功能正在开发中...');
    }
  }

  /**
   * 显示快捷键帮助
   */
  showShortcutsHelp() {
    const shortcutsList = Array.from(this.shortcuts.entries())
      .map(([key, shortcut]) => `${key} - ${shortcut.description}`)
      .join('
');

    notify.info(`键盘快捷键：
${shortcutsList}`, {
      persistent: true,
      duration: 0
    });
  }

  /**
   * 显示快捷键提示
   */
  showShortcutTooltip(description) {
    // 创建临时提示
    const tooltip = DOM.create('div', {
      className: 'shortcut-tooltip',
      style: `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        font-size: 14px;
        z-index: 10001;
        pointer-events: none;
        backdrop-filter: blur(5px);
        border: 1px solid rgba(0, 212, 255, 0.3);
      `
    }, description);

    document.body.appendChild(tooltip);

    // 1秒后移除
    setTimeout(() => {
      if (tooltip.parentNode) {
        tooltip.parentNode.removeChild(tooltip);
      }
    }, 1000);
  }

  /**
   * 创建工具提示
   */
  createTooltips() {
    if (!this.options.showTooltips) return;

    // 为导航链接添加快捷键提示
    const navItems = document.querySelectorAll('.nav-item a');
    navItems.forEach(item => {
      const content = item.getAttribute('data-content');
      if (content) {
        const shortcut = this.getShortcutForSection(content);
        if (shortcut) {
          item.title = `快捷键：${shortcut}`;
        }
      }
    });
  }

  /**
   * 获取章节对应的快捷键
   */
  getShortcutForSection(sectionName) {
    for (const [key, shortcut] of this.shortcuts.entries()) {
      if (shortcut.description.includes(this.getSectionDisplayName(sectionName))) {
        return key;
      }
    }
    return null;
  }

  /**
   * 添加新的快捷键
   */
  addShortcut(key, action, description) {
    this.shortcuts.set(key, { action, description });
  }

  /**
   * 移除快捷键
   */
  removeShortcut(key) {
    this.shortcuts.delete(key);
  }

  /**
   * 启用快捷键
   */
  enable() {
    this.options.enabled = true;
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  /**
   * 禁用快捷键
   */
  disable() {
    this.options.enabled = false;
    document.removeEventListener('keydown', this.handleKeyDown.bind(this));
  }

  /**
   * 获取所有快捷键
   */
  getAllShortcuts() {
    const result = {};
    this.shortcuts.forEach((value, key) => {
      result[key] = value.description;
    });
    return result;
  }

  /**
   * 检查按键是否冲突
   */
  checkConflicts(key) {
    const conflicts = [];
    this.shortcuts.forEach((shortcut, existingKey) => {
      if (existingKey === key) {
        conflicts.push(existingKey);
      }
    });
    return conflicts;
  }

  /**
   * 重置所有快捷键
   */
  reset() {
    this.shortcuts.clear();
    this.init();
  }

  /**
   * 销毁组件
   */
  destroy() {
    this.disable();
    
    // 移除工具提示
    const tooltips = document.querySelectorAll('.shortcut-tooltip');
    tooltips.forEach(tooltip => {
      if (tooltip.parentNode) {
        tooltip.parentNode.removeChild(tooltip);
      }
    });
  }
}

// 快捷键管理器
const KeyboardShortcuts = {
  /**
   * 创建快捷键组件实例
   */
  create(options) {
    return new KeyboardShortcutsComponent(options);
  },

  /**
   * 获取标准快捷键配置
   */
  getDefaultShortcuts() {
    return {
      'Alt+1': '仪表板',
      'Alt+2': '日报',
      'Alt+3': '月报',
      'Alt+4': '产品分析',
      'Alt+5': '店铺管理',
      'Ctrl+M': '用户菜单',
      'Escape': '关闭对话框',
      'F1': '帮助',
      'Ctrl+/': '快捷键帮助'
    };
  },

  /**
   * 检查按键组合是否有效
   */
  isValidKeyCombination(keyString) {
    // 基本的按键组合验证
    const validModifiers = ['Control', 'Alt', 'Shift'];
    const validKeys = [
      '1', '2', '3', '4', '5', '6', '7', '8', '9', '0',
      'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P',
      'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L',
      'Z', 'X', 'C', 'V', 'B', 'N', 'M',
      'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12',
      'Escape', 'Space', '/'
    ];

    const parts = keyString.split('+');
    if (parts.length < 2) return false;

    // 检查修饰键
    const modifiers = parts.slice(0, -1);
    const mainKey = parts[parts.length - 1];

    // 确保至少有一个修饰键
    const hasModifier = modifiers.some(mod => validModifiers.includes(mod));
    if (!hasModifier) return false;

    // 检查修饰键是否有效
    for (const modifier of modifiers) {
      if (!validModifiers.includes(modifier)) {
        return false;
      }
    }

    // 检查主键是否有效
    return validKeys.includes(mainKey);
  },

  /**
   * 格式化按键显示
   */
  formatKeyDisplay(keyString) {
    const displayMap = {
      'Control': 'Ctrl',
      'Alt': 'Alt',
      'Shift': 'Shift',
      ' ': 'Space',
      '/': '/'
    };

    return keyString.split('+').map(key => {
      return displayMap[key] || key;
    }).join(' + ');
  }
};

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    KeyboardShortcutsComponent,
    KeyboardShortcuts
  };
}

// 挂载到全局
if (typeof window !== 'undefined') {
  window.KeyboardShortcutsComponent = KeyboardShortcutsComponent;
  window.KeyboardShortcuts = KeyboardShortcuts;
}