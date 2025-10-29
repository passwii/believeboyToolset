/**
 * 主入口文件
 * 整合了原来cyber-tools.js的主要功能
 * 负责页面初始化、导航、事件绑定等
 */

class Application {
  constructor() {
    this.isInitialized = false;
    this.currentSection = null;
    this.navItems = [];
    this.groupTitles = [];
    this.defaultSection = null;
    this.dynamicSection = null;
    this.menuToggle = null;
    
    // 组件实例
    this.fileUploadComponent = null;
    this.shopManagementComponent = null;
    this.userManagementComponent = null;
    this.keyboardShortcutsComponent = null;
    this.modalComponent = null;
    this.formValidationComponent = null;
    this.dashboardComponent = null;
    
    this.init();
  }

  /**
   * 初始化应用
   */
  async init() {
    if (this.isInitialized) return;
    
    try {
      this.cacheElements();
      this.setupUserDropdown();
      this.setupMenuToggle();
      this.setupNavigation();
      this.initializeComponents();
      this.initializeDefaultContent();
      this.setupEventListeners();
      
      this.isInitialized = true;
      console.log('Application initialized successfully');
    } catch (error) {
      console.error('Failed to initialize application:', error);
      notify.error('应用初始化失败');
    }
  }

  /**
   * 缓存DOM元素
   */
  cacheElements() {
    this.navItems = DOM.findAll('.nav-item');
    this.groupTitles = DOM.findAll('.group-title');
    this.defaultSection = DOM.find('.default-section');
    this.dynamicSection = DOM.find('.dynamic-section');
    
    // 创建移动端菜单切换按钮
    this.menuToggle = DOM.create('div', {
      className: 'menu-toggle'
    });
    this.menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
    document.body.appendChild(this.menuToggle);
  }

  /**
   * 设置用户下拉菜单
   */
  setupUserDropdown() {
    const userDropdownToggle = DOM.find('#user-dropdown-toggle');
    const userDropdown = DOM.find('.user-dropdown');
    
    if (!userDropdownToggle || !userDropdown) return;

    // 点击用户信息区域切换下拉菜单
    userDropdownToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      userDropdown.classList.toggle('active');
    });

    // 点击页面其他地方关闭下拉菜单
    document.addEventListener('click', () => {
      userDropdown.classList.remove('active');
    });

    // 阻止下拉菜单内部点击事件冒泡
    const dropdownMenu = DOM.find('#user-dropdown-menu');
    if (dropdownMenu) {
      dropdownMenu.addEventListener('click', (e) => {
        e.stopPropagation();
        
        // 处理更改密码链接点击
        const changePasswordLink = e.target.closest('.dropdown-item[data-content="change-password"]');
        if (changePasswordLink) {
          e.preventDefault();
          this.loadContent('change-password');
        }
      });
    }
  }

  /**
   * 设置菜单切换按钮
   */
  setupMenuToggle() {
    if (!this.menuToggle) return;

    this.menuToggle.addEventListener('click', () => {
      const sidebar = DOM.find('.cyber-sidebar');
      if (sidebar) {
        sidebar.classList.toggle('active');
        
        // 切换图标
        const icon = this.menuToggle.querySelector('i');
        if (sidebar.classList.contains('active')) {
          icon.className = 'fas fa-times';
        } else {
          icon.className = 'fas fa-bars';
        }
      }
    });
  }

  /**
   * 初始化组件
   */
  initializeComponents() {
    // 初始化模态框组件
    this.modalComponent = new ModalComponent();
    
    // 初始化键盘快捷键组件
    this.keyboardShortcutsComponent = new KeyboardShortcutsComponent({
      enabled: true,
      showTooltips: true
    });
    
    // 初始化表单验证组件
    this.formValidationComponent = new FormValidationComponent({
      showErrorMessages: true,
      showSuccessMessages: false,
      validateOnBlur: true,
      validateOnInput: false
    });
  }

  /**
   * 设置导航
   */
  setupNavigation() {
    // 大类标题点击事件
    this.groupTitles.forEach(title => {
      title.addEventListener('click', () => {
        this.handleGroupTitleClick(title);
      });
    });

    // 导航项点击事件处理
    const navLinks = DOM.findAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        this.handleNavLinkClick(link);
      });
    });

    // 初始化所有子菜单为折叠状态
    const submenus = DOM.findAll('.submenu');
    submenus.forEach(submenu => {
      submenu.classList.remove('expanded');
    });

    // 初始化所有标题为非展开状态
    this.groupTitles.forEach(title => {
      title.classList.remove('expanded');
    });
  }

  /**
   * 处理大类标题点击
   */
  handleGroupTitleClick(title) {
    // 检查当前是否已展开
    const isCurrentlyExpanded = title.classList.contains('expanded');
    
    // 折叠所有其他大类
    this.groupTitles.forEach(otherTitle => {
      if (otherTitle !== title) {
        otherTitle.classList.remove('expanded');
        const otherSubmenu = otherTitle.nextElementSibling;
        if (otherSubmenu && otherSubmenu.classList.contains('submenu')) {
          otherSubmenu.classList.remove('expanded');
        }
      }
    });
    
    // 切换当前大类的展开/收起状态
    const submenu = title.nextElementSibling;
    if (submenu && submenu.classList.contains('submenu')) {
      if (isCurrentlyExpanded) {
        title.classList.remove('expanded');
        submenu.classList.remove('expanded');
      } else {
        title.classList.add('expanded');
        submenu.classList.add('expanded');
      }
    }
    
    // 移除所有活动类
    this.clearActiveStates();
    
    // 添加活动类到当前项
    title.classList.add('active');
    
    // 移动端点击后关闭侧边栏
    this.closeMobileSidebar();
  }

  /**
   * 处理导航链接点击
   */
  handleNavLinkClick(link) {
    // 获取内容类型
    const contentType = link.getAttribute('data-content');
    
    if (!contentType) return;

    // 移除所有活动类
    this.clearActiveStates();
    
    // 添加活动类到当前项
    link.parentElement.classList.add('active');
    
    // 加载内容
    this.loadContent(contentType);
    
    // 移动端点击后关闭侧边栏
    this.closeMobileSidebar();
  }

  /**
   * 清除所有活动状态
   */
  clearActiveStates() {
    this.navItems.forEach(item => item.classList.remove('active'));
    this.groupTitles.forEach(title => title.classList.remove('active'));
    
    // 清除内容区域的活动状态
    const categorySections = DOM.findAll('.category-section');
    categorySections.forEach(section => section.classList.remove('active'));
    
    if (this.defaultSection) {
      this.defaultSection.classList.remove('active');
    }
  }

  /**
   * 关闭移动端侧边栏
   */
  closeMobileSidebar() {
    if (window.innerWidth <= 768) {
      const sidebar = DOM.find('.cyber-sidebar');
      if (sidebar) {
        sidebar.classList.remove('active');
        const icon = this.menuToggle.querySelector('i');
        icon.className = 'fas fa-bars';
      }
    }
  }

  /**
   * 加载内容
   */
  async loadContent(contentType) {
    if (!this.dynamicSection) return;
    
    // 显示加载指示器
    this.dynamicSection.innerHTML = `
      <div class="loading-container">
        <div class="loading-spinner">
          <i class="fas fa-spinner fa-spin"></i>
          <span>正在加载内容...</span>
        </div>
      </div>
    `;
    
    // 添加活动状态到动态内容区域
    this.dynamicSection.classList.add('active');
    
    // 根据内容类型确定URL
    const url = this.getContentUrl(contentType);
    
    try {
      // 发送AJAX请求获取内容
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('网络响应不正常');
      }
      
      const html = await response.text();
      this.dynamicSection.innerHTML = html;
      
      // 初始化页面功能
      this.initializePageContent(contentType);
      
      this.currentSection = contentType;
      
    } catch (error) {
      console.error('加载内容失败:', error);
      this.dynamicSection.innerHTML = `
        <div class="error-container">
          <i class="fas fa-exclamation-triangle"></i>
          <h3>加载失败</h3>
          <p>无法加载内容，请稍后重试</p>
          <button class="retry-btn" onclick="app.loadContent('${contentType}')">重试</button>
        </div>
      `;
    }
  }

  /**
   * 获取内容URL
   */
  getContentUrl(contentType) {
    const urlMap = {
      'daily-report': '/dataset/daily-report',
      'monthly-report': '/dataset/monthly-report',
      'product-analysis': '/dataset/product-analysis',
      'operations-nav': '/toolset/operations-nav',
      'shop-nav': '/toolset/shop-nav',
      'operations-info': '/admin/operations-info?embed=true',
      'user-management': '/admin/users?embed=true',
      'log-management': '/admin/logs',
      'update-log': '/admin/update-log?embed=true',
      'shop-management': '/admin/shops?embed=true',
      'change-password': '/admin/change-password?embed=true',
      'sku-cost-table': '/toolset/sku-cost-table?embed=true',
      'project-progress-table': '/toolset/project-progress-table?embed=true',
      'profit-calculation-table': '/toolset/profit-calculation-table?embed=true',
      'exchange-rate-display': '/toolset/exchange-rate-display?embed=true',
      'amazon-crawler': '/toolset/amazon-crawler?embed=true',
      'image-resizer': '/toolset/image-resizer?embed=true',
      'ai-panel': 'https://ai.believeboy.com'
    };
    
    return urlMap[contentType] || '#';
  }

  /**
   * 初始化页面内容
   */
  initializePageContent(contentType) {
    // 根据内容类型调用相应的初始化函数
    const initFunctions = {
      'daily-report': () => this.initializeDailyReport(),
      'monthly-report': () => this.initializeMonthlyReport(),
      'product-analysis': () => this.initializeProductAnalysis(),
      'operations-nav': () => this.initializeOperationsNav(),
      'shop-nav': () => this.initializeShopNav(),
      'operations-info': () => this.initializeOperationsInfo(),
      'user-management': () => this.initializeUserManagement(),
      'log-management': () => this.initializeLogManagement(),
      'update-log': () => this.initializeUpdateLog(),
      'shop-management': () => this.initializeShopManagement(),
      'change-password': () => this.initializeChangePassword()
    };
    
    const initFunction = initFunctions[contentType];
    if (initFunction && typeof initFunction === 'function') {
      initFunction();
    }
  }

  /**
   * 初始化默认内容
   */
  initializeDefaultContent() {
    if (this.defaultSection) {
      this.defaultSection.classList.add('active');
    } else {
      // 如果没有默认区域，则显示数据分析类别
      const dataAnalysisTitle = DOM.find('.group-title[data-category="data-analysis"]');
      if (dataAnalysisTitle) {
        dataAnalysisTitle.click();
      } else if (this.groupTitles.length > 0) {
        this.groupTitles[0].click();
      }
    }
  }

  /**
   * 初始化所有组件
   */
  initializeComponents() {
    try {
      // 初始化键盘快捷键组件
      if (typeof KeyboardShortcutsComponent !== 'undefined') {
        this.components.keyboardShortcuts = new KeyboardShortcutsComponent();
      }
      
      // 初始化模态框组件
      if (typeof ModalComponent !== 'undefined') {
        this.components.modal = new ModalComponent();
      }
      
      // 初始化表单验证组件
      if (typeof FormValidationComponent !== 'undefined') {
        this.components.formValidation = new FormValidationComponent();
      }
      
      console.log('All components initialized successfully');
    } catch (error) {
      console.error('Failed to initialize components:', error);
    }
  }

  /**
   * 设置键盘快捷键
   */
  setupKeyboardShortcuts() {
    // 使用组件中的键盘快捷键功能
    if (this.components.keyboardShortcuts) {
      this.components.keyboardShortcuts.bindToApplication();
    }
  }

  /**
   * 显示默认内容
   */
  showDefaultContent() {
    this.clearActiveStates();
    if (this.defaultSection) {
      this.defaultSection.classList.add('active');
    }
  }

  /**
   * 切换移动端菜单
   */
  toggleMobileMenu() {
    const sidebar = DOM.find('.cyber-sidebar');
    if (sidebar) {
      sidebar.classList.toggle('active');
      const icon = this.menuToggle.querySelector('i');
      if (sidebar.classList.contains('active')) {
        icon.className = 'fas fa-times';
      } else {
        icon.className = 'fas fa-bars';
      }
    }
  }

  /**
   * 设置事件监听器
   */
  setupEventListeners() {
    // 添加点击事件处理程序到所有 href 为 # 的链接，但排除nav-item内的链接和dropdown-item
    const links = DOM.findAll('a[href="#"]:not(.nav-item a):not(.dropdown-item)');
    links.forEach(link => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        notify.warning('仅限内网使用');
      });
    });

    // 窗口大小变化时重新调整
    window.addEventListener('resize', debounce(() => {
      // 移动端视图中关闭侧边栏
      if (window.innerWidth > 768) {
        this.closeMobileSidebar();
      }
    }, 250));
  }

  /**
   * 初始化日报页面
   */
  initializeDailyReport() {
    const yesterdayBtn = DOM.find('#yesterday-btn');
    if (yesterdayBtn) {
      yesterdayBtn.addEventListener('click', () => {
        const yesterday = TimeUtils.yesterday('YYYY-MM-DD');
        const reportDateInput = DOM.find('#report_date');
        if (reportDateInput) {
          reportDateInput.value = yesterday;
        }
      });
    }
    
    this.setupFormSubmission('daily-report-form', '日报');
  }

  /**
   * 初始化月报页面
   */
  initializeMonthlyReport() {
    this.setupFormSubmission('monthly-report-form', '月报');
  }

  /**
   * 初始化产品分析页面
   */
  initializeProductAnalysis() {
    try {
      // 初始化文件上传组件
      if (typeof FileUploadComponent !== 'undefined') {
        this.components.fileUpload = new FileUploadComponent({
          containerSelector: '#drop-area',
          inputSelector: '#file-input',
          listSelector: '#file-list',
          submitSelector: '#submit-btn'
        });
      }
      
      console.log('Product analysis page initialized');
    } catch (error) {
      console.error('Failed to initialize product analysis:', error);
    }
  }

  /**
   * 初始化运营导航页面
   */
  initializeOperationsNav() {
    console.log('运营导航页面已加载');
  }

  /**
   * 初始化店铺导航页面
   */
  initializeShopNav() {
    console.log('店铺导航页面已加载');
  }

  /**
   * 初始化运营信息页面
   */
  initializeOperationsInfo() {
    // 确保DOM完全加载后再初始化仪表板
    setTimeout(() => {
      try {
        // 初始化仪表板组件
        if (typeof Dashboard !== 'undefined') {
          this.components.dashboard = new Dashboard({
            autoRefresh: true,
            refreshInterval: 5 * 60 * 1000, // 5分钟
            apiEndpoint: '/api/statistics'
          });
          
          // 加载统计数据
          this.components.dashboard.loadStatistics();
        } else {
          // 使用原有的仪表板初始化方法
          const dashboard = getDashboard();
          if (dashboard) {
            dashboard.loadStatistics();
          }
        }
      } catch (error) {
        console.error('Failed to initialize dashboard:', error);
      }
    }, 50);
  }

  /**
   * 初始化用户管理页面
   */
  initializeUserManagement() {
    try {
      // 初始化用户管理组件
      if (typeof UserManagementComponent !== 'undefined') {
        this.components.userManagement = new UserManagementComponent({
          addEndpoint: '/admin/users/add',
          deleteEndpoint: '/admin/users/delete',
          listEndpoint: '/admin/users',
          checkUsernameEndpoint: '/admin/users/check-username'
        });
      }
      
      console.log('用户管理页面已加载');
    } catch (error) {
      console.error('Failed to initialize user management:', error);
    }
  }

  /**
   * 初始化日志管理页面
   */
  initializeLogManagement() {
    // 日志管理页面的初始化逻辑
    console.log('日志管理页面已加载');
  }

  /**
   * 初始化更新日志页面
   */
  initializeUpdateLog() {
    console.log('更新日志页面已加载');
  }

  /**
   * 初始化店铺管理页面
   */
  initializeShopManagement() {
    try {
      // 初始化店铺管理组件
      if (typeof ShopManagementComponent !== 'undefined') {
        this.components.shopManagement = new ShopManagementComponent({
          addEndpoint: '/admin/shops/add',
          updateEndpoint: '/admin/shops/update',
          deleteEndpoint: '/admin/shops/delete',
          checkNameEndpoint: '/admin/shops/check-name',
          listEndpoint: '/admin/shops/list'
        });
      }
      
      console.log('店铺管理页面已加载');
    } catch (error) {
      console.error('Failed to initialize shop management:', error);
    }
  }

  /**
   * 初始化更改密码页面
   */
  initializeChangePassword() {
    const form = DOM.find('.change-password-embed form');
    const newPassword = DOM.find('#new_password');
    const confirmPassword = DOM.find('#confirm_password');
    
    if (form && newPassword && confirmPassword) {
      form.addEventListener('submit', (e) => {
        if (newPassword.value !== confirmPassword.value) {
          e.preventDefault();
          
          // 创建错误消息
          const errorDiv = DOM.create('div', {
            className: 'flash-error'
          });
          errorDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> 两次输入的新密码不一致';
          
          // 插入到表单前面
          form.parentNode.insertBefore(errorDiv, form);
          
          // 滚动到错误消息
          errorDiv.scrollIntoView({ behavior: 'smooth' });
          
          // 3秒后移除错误消息
          setTimeout(() => {
            if (errorDiv.parentNode) {
              errorDiv.parentNode.removeChild(errorDiv);
            }
          }, 3000);
        }
      });
    }
  }

  /**
   * 设置表单提交处理
   */
  setupFormSubmission(formId, reportType) {
    const form = DOM.find(`#${formId}`);
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData(form);
      
      // 显示加载指示器
      const formContainer = form.parentElement;
      const originalContent = formContainer.innerHTML;
      formContainer.innerHTML = `
        <div class="loading-indicator">
          <i class="fas fa-spinner fa-spin"></i>
          <span>正在生成${reportType}，请稍候...</span>
        </div>
      `;
      
      try {
        const response = await fetch(form.action, {
          method: 'POST',
          body: formData
        });
        
        if (response.ok) {
          const blob = await response.blob();
          const filename = `${reportType.toLowerCase()}_${StringUtils.formatDate(new Date(), 'YYYY-MM-DD')}.xlsx`;
          
          await downloadFile(blob, filename);
          
          notify.success(`${reportType}生成成功`);
        } else {
          throw new Error(`生成${reportType}失败`);
        }
      } catch (error) {
        console.error('Error:', error);
        notify.error(`生成${reportType}失败，请重试`);
      } finally {
        // 恢复表单
        formContainer.innerHTML = originalContent;
        
        // 重新初始化页面
        const initFunction = this[`initialize${reportType.replace(/^\w/, c => c.toUpperCase())}Report`];
        if (initFunction) {
          initFunction.call(this);
        }
      }
    });
  }

  /**
   * 获取组件
   */
  getComponent(name) {
    return this.components[name] || null;
  }

  /**
   * 销毁所有组件
   */
  destroy() {
    Object.values(this.components).forEach(component => {
      if (component && typeof component.destroy === 'function') {
        component.destroy();
      }
    });
  }

  /**
   * 刷新组件
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
}

// 创建全局应用实例
let app = null;

// 初始化应用
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

// 挂载到全局
if (typeof window !== 'undefined') {
  window.Application = Application;
  window.initApp = initApp;
  window.getApp = () => app;
  
  // 挂载组件到全局，以便于调试和访问
  window.Components = {
    getFileUpload: () => app?.getComponent('fileUpload'),
    getShopManagement: () => app?.getComponent('shopManagement'),
    getUserManagement: () => app?.getComponent('userManagement'),
    getKeyboardShortcuts: () => app?.getComponent('keyboardShortcuts'),
    getModal: () => app?.getComponent('modal'),
    getFormValidation: () => app?.getComponent('formValidation'),
    getDashboard: () => app?.getComponent('dashboard')
  };
}