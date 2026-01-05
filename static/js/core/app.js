/**
 * 主应用类
 * 简化后的应用入口，职责更加清晰
 */

class Application {
  constructor() {
    this.isInitialized = false;
    this.currentSection = null;
    this.components = {};

    // 子模块
    this.navigation = null;
    this.pageLoader = null;
    this.pageInitializers = null;

    // 元素缓存
    this.defaultSection = null;

    this.init();
  }

  /**
   * 初始化应用
   */
  async init() {
    if (this.isInitialized) return;

    try {
      await this.waitForDOMReady();

      this.initializeComponents();
      this.initializeSubModules();
      this.setupEventListeners();
      this.initializeDefaultContent();

      this.isInitialized = true;
      console.log('应用初始化成功');
    } catch (error) {
      console.error('应用初始化失败:', error);
      notify.error('应用初始化失败');
    }
  }

  /**
   * 等待DOM准备就绪
   */
  waitForDOMReady() {
    return new Promise((resolve) => {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', resolve);
      } else {
        const checkElements = () => {
          const dynamicSection = DOM.find('.dynamic-section');
          const navItems = DOM.findAll('.nav-item');
          const groupTitles = DOM.findAll('.group-title');

          if (dynamicSection && (navItems.length > 0 || groupTitles.length > 0)) {
            console.log('DOM元素已准备就绪');
            resolve();
          } else {
            console.log('等待DOM元素加载...');
            setTimeout(checkElements, 100);
          }
        };

        checkElements();
      }
    });
  }

  /**
   * 初始化核心组件
   */
  initializeComponents() {
    this.defaultSection = DOM.find(DEFAULT_PAGE_CONFIG.defaultSection);
  }

  /**
   * 初始化子模块
   */
  initializeSubModules() {
    // 初始化导航管理器
    this.navigation = new NavigationManager(this);
    this.navigation.init();

    // 初始化页面加载器
    this.pageLoader = new PageLoader(DEFAULT_PAGE_CONFIG.dynamicSection);
    this.pageLoader.init();

    // 初始化页面初始化器
    this.pageInitializers = new PageInitializers(this);

    console.log('子模块初始化成功');
  }

  /**
   * 初始化默认内容
   */
  initializeDefaultContent() {
    if (this.defaultSection) {
      this.defaultSection.classList.add('active');
    } else {
      const dataAnalysisTitle = DOM.find('.group-title[data-category="data-analysis"]');
      if (dataAnalysisTitle) {
        dataAnalysisTitle.click();
      } else {
        const navLinks = DOM.findAll('.nav-link');
        if (navLinks.length > 0) {
          navLinks[0].click();
        }
      }
    }
  }

  /**
   * 加载内容
   */
  async loadContent(contentType) {
    const result = await this.pageLoader.load(contentType);

    if (result.success) {
      this.currentSection = contentType;
      this.pageInitializers.initPage(contentType);
      console.log(`页面内容已加载并初始化: ${contentType}`);
    }
  }

  /**
   * 设置事件监听器
   */
  setupEventListeners() {
    const links = DOM.findAll('a[href="#"]:not(.nav-item a):not(.dropdown-item)');
    links.forEach(link => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        notify.warning('仅限内网使用');
      });
    });
  }

  /**
   * 获取组件
   */
  getComponent(name) {
    return this.components[name] || null;
  }

  /**
   * 销毁应用
   */
  destroy() {
    if (this.navigation) {
      this.navigation.destroy();
    }

    if (this.pageLoader) {
      this.pageLoader.reset();
    }

    Object.values(this.components).forEach(component => {
      if (component && typeof component.destroy === 'function') {
        component.destroy();
      }
    });

    this.components = {};
    this.isInitialized = false;
  }

  /**
   * 刷新应用
   */
  refresh() {
    if (this.components.fileUpload) {
      this.components.fileUpload.reset();
    }
    if (this.components.shopManagement) {
      this.components.shopManagement.loadShops();
    }
    if (this.components.userManagement) {
      this.components.userManagement.loadUsers();
    }
    if (this.components.dashboard) {
      this.components.dashboard.loadStatistics();
    }
  }

  /**
   * 显示默认内容
   */
  showDefaultContent() {
    this.navigation.clearActiveStates();
    if (this.defaultSection) {
      this.defaultSection.classList.add('active');
    }
  }

  /**
   * 切换移动端菜单
   */
  toggleMobileMenu() {
    if (this.navigation) {
      const sidebar = DOM.find('.cyber-sidebar');
      if (sidebar) {
        sidebar.classList.toggle('active');

        const icon = this.navigation.menuToggle.querySelector('i');
        if (sidebar.classList.contains('active')) {
          icon.className = 'fas fa-times';
        } else {
          icon.className = 'fas fa-bars';
        }
      }
    }
  }
}

// 创建全局应用实例
let app = null;

function initApp() {
  if (!app) {
    app = new Application();
  }
  return app;
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    Application,
    initApp,
    getApp: () => app
  };
}

// 挂载到全局（保持向后兼容）
if (typeof window !== 'undefined') {
  window.Application = Application;
  window.initApp = initApp;
  window.app = app;

  // 挂载组件访问接口
  window.Components = {
    getFileUpload: () => app?.getComponent('fileUpload'),
    getShopManagement: () => app?.getComponent('shopManagement'),
    getUserManagement: () => app?.getComponent('userManagement'),
    getModal: () => app?.getComponent('modal'),
    getFormValidation: () => app?.getComponent('formValidation'),
    getDashboard: () => app?.getComponent('dashboard')
  };

  // 兼容旧版本的 getApp 函数
  window.getApp = () => app;
}