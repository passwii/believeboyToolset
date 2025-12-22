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
      // 增加DOM准备检查，特别是在embed模式下
      await this.waitForDOMReady();

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
   * 等待DOM准备就绪
   */
  waitForDOMReady() {
    return new Promise((resolve) => {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', resolve);
      } else {
        // 如果DOM已经加载完成，检查关键元素是否存在
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
    // 初始化组件存储对象
    this.components = this.components || {};

    try {
      // 初始化键盘快捷键组件
      if (typeof KeyboardShortcutsComponent !== 'undefined') {
        this.components.keyboardShortcuts = new KeyboardShortcutsComponent({
          enabled: true,
          showTooltips: true
        });
      }

      // 初始化模态框组件
      if (typeof ModalComponent !== 'undefined') {
        this.components.modal = new ModalComponent();
      }

      // 初始化表单验证组件
      if (typeof FormValidationComponent !== 'undefined') {
        this.components.formValidation = new FormValidationComponent({
          showErrorMessages: true,
          showSuccessMessages: false,
          validateOnBlur: true,
          validateOnInput: false
        });
      }

      console.log('All components initialized successfully');
    } catch (error) {
      console.error('Failed to initialize components:', error);
    }
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

      // 增加延时确保DOM完全渲染后再初始化
      setTimeout(() => {
        try {
          this.initializePageContent(contentType);
          this.currentSection = contentType;
          console.log(`页面内容已加载并初始化: ${contentType}`);
        } catch (error) {
          console.error('页面内容初始化失败:', error);
        }
      }, 100); // 给DOM渲染时间

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
      'yumai-analysis': '/yumai-analysis',
      'operations-overview': '/toolset/operations-overview',
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
      'exchange-rate-display': '/toolset/exchange-rate-display',
      'amazon-crawler': '/toolset/amazon-crawler?embed=true',
      'image-resizer': '/toolset/image-resizer?embed=true',
      'research-analysis': '/toolset/research-analysis?embed=true',
      'excel-formula-remover': '/toolset/excel-formula-remover',
      'ai-panel': 'https://ai.believeboy.com',
      'img-believeboy': '/toolset/img-believeboy'
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
      'yumai-analysis': () => this.initializeYumaiAnalysis(),
      'operations-overview': () => this.initializeOperationsOverview(),
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

  // 注意：initializeComponents() 方法已在上面定义，避免重复

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
    // 增加延时确保DOM完全加载，特别是在embed模式下
    setTimeout(() => {
      console.log('开始初始化日报页面');

      // 昨天按钮使用延时和clone确保事件绑定，避免重复绑定问题
      const yesterdayBtn = DOM.find('#yesterday-btn');
      console.log('查找昨天按钮:', yesterdayBtn);

      if (yesterdayBtn) {
        // 清除可能存在的旧事件监听器
        const newBtn = yesterdayBtn.cloneNode(true);
        yesterdayBtn.parentNode.replaceChild(newBtn, yesterdayBtn);

        // 绑定新的事件监听器
        newBtn.addEventListener('click', () => {
          console.log('昨天按钮被点击');

          try {
            const yesterday = TimeUtils.yesterday('YYYY-MM-DD');
            const reportDateInput = DOM.find('#report_date');

            if (reportDateInput) {
              reportDateInput.value = yesterday;
              console.log('日期已设置为昨天:', yesterday);
            } else {
              console.error('找不到日期输入框');
            }
          } catch (error) {
            console.error('设置日期时出错:', error);
          }
        });

        console.log('昨天按钮事件监听器已绑定');
      } else {
        console.error('找不到昨天按钮');
      }

      // 初始化文件上传组件 - 增加更多检查和重试机制
      this.initializeDailyReportFileUpload();

      this.setupFormSubmission('daily-report-form', '日报');
    }, 200); // 增加延时时间
  }

  /**
   * 初始化日报文件上传组件 - 专门处理embed模式下的初始化问题
   */
  initializeDailyReportFileUpload() {
    const maxRetries = 3;
    let retryCount = 0;

    const tryInit = () => {
      retryCount++;
      console.log(`尝试初始化文件上传组件 (第${retryCount}次)`);

      try {
        // 检查必要的DOM元素是否存在
        const dropArea = DOM.find('#drop-area');
        const fileInput = DOM.find('#file-input');
        const fileList = DOM.find('#file-list');
        const submitBtn = DOM.find('#submit-btn');

        console.log('DOM元素检查:', {
          dropArea: !!dropArea,
          fileInput: !!fileInput,
          fileList: !!fileList,
          submitBtn: !!submitBtn
        });

        if (!dropArea || !fileInput || !fileList || !submitBtn) {
          if (retryCount < maxRetries) {
            console.log('DOM元素未完全加载，1秒后重试...');
            setTimeout(tryInit, 1000);
          } else {
            console.error('DOM元素加载失败，已达到最大重试次数');
          }
          return;
        }

        // 检查FileUploadComponent是否可用
        if (typeof FileUploadComponent === 'undefined') {
          console.error('FileUploadComponent未定义');
          return;
        }

        // 初始化文件上传组件
        this.components.fileUpload = new FileUploadComponent({
          containerSelector: '#drop-area',
          inputSelector: '#file-input',
          listSelector: '#file-list',
          submitSelector: '#submit-btn',
          uploadEndpoint: '/dataset/daily-report/upload-file',
          allowedTypes: ['txt', 'xlsx'],
          isDailyReport: true
        });

        console.log('日报文件上传组件已初始化');

        // 验证组件是否正确初始化
        if (this.components.fileUpload && this.components.fileUpload.options) {
          console.log('文件上传组件配置:', this.components.fileUpload.options);
        }

      } catch (error) {
        console.error('文件上传组件初始化失败:', error);

        if (retryCount < maxRetries) {
          console.log('初始化失败，1秒后重试...');
          setTimeout(tryInit, 1000);
        } else {
          console.error('文件上传组件初始化失败，已达到最大重试次数');
          // 显示用户友好的错误提示
          if (typeof notify !== 'undefined') {
            notify.error('文件上传功能初始化失败，请刷新页面重试');
          }
        }
      }
    };

    // 开始初始化
    tryInit();
  }

  /**
   * 初始化月报页面
   */
  initializeMonthlyReport() {
    // 设置表单提交处理
    this.setupFormSubmission('monthly-report-form', '月报');
    
    // 初始化月报特定的文件上传组件
    this.initializeMonthlyReportFileUpload();
  }

  /**
   * 初始化月报文件上传组件
   */
  initializeMonthlyReportFileUpload() {
    try {
      // 检查必要的DOM元素是否存在
      const dropArea = DOM.find('#drop-area');
      const fileInput = DOM.find('#file-input');
      const fileList = DOM.find('#file-list');
      const submitBtn = DOM.find('#submit-btn');

      console.log('月报页面DOM元素检查:', {
        dropArea: !!dropArea,
        fileInput: !!fileInput,
        fileList: !!fileList,
        submitBtn: !!submitBtn
      });

      if (dropArea && fileInput && fileList && submitBtn) {
        // 检查FileUploadComponent是否可用
        if (typeof FileUploadComponent !== 'undefined') {
          // 初始化文件上传组件
          this.components.fileUpload = new FileUploadComponent({
            containerSelector: '#drop-area',
            inputSelector: '#file-input',
            listSelector: '#file-list',
            submitSelector: '#submit-btn',
            uploadEndpoint: '/dataset/monthly-report/upload-file',
            allowedTypes: ['csv'],
            isDailyReport: false
          });

          console.log('月报文件上传组件已初始化');
        }
      }
    } catch (error) {
      console.error('月报文件上传组件初始化失败:', error);
    }
  }

  /**
   * 初始化产品分析页面
   */
  initializeProductAnalysis() {
    try {
      // 初始化文件上传组件
      if (typeof FileUploadComponent !== 'undefined') {
        this.components.fileUpload = new FileUploadComponent({
          containerSelector: '.file-upload-container',
          inputSelector: '#file-input',
          listSelector: '#file-list',
          submitSelector: '#submit-btn',
          uploadEndpoint: '/dataset/product-analysis/upload-file',
          allowedTypes: ['csv', 'xlsx', 'txt'],
          isDailyReport: false
        });
      }

      // 初始化上周按钮
      this.initializeLastWeekButton();

      // 设置表单提交处理
      this.setupFormSubmission('analysis-form', '产品分析');

      console.log('Product analysis page initialized');
    } catch (error) {
      console.error('Failed to initialize product analysis:', error);
    }
  }

  /**
   * 初始化优麦云商品分析页面
   */
  initializeYumaiAnalysis() {
    try {
      if (typeof FileUploadComponent !== 'undefined') {
        this.components.fileUpload = new FileUploadComponent({
          containerSelector: '.file-upload-container',
          inputSelector: '#file-input',
          listSelector: '#file-list',
          submitSelector: '#submit-btn',
          uploadEndpoint: '/yumai-analysis/upload-file',
          allowedTypes: ['xlsx', 'txt'],
          isDailyReport: false,
          
          // Custom configuration for Yumai Analysis
          uploadedFiles: {
            yumai_report: null,
            inventory_report: null,
          },
          requiredFileTypes: ['yumai_report'],
          rules: [
            {
              type: 'yumai_report',
              test: (filename, ext) => ext === 'xlsx'
            },
            {
              type: 'inventory_report',
              contentTest: async (file, content) => {
                if (!file.name.toLowerCase().endsWith('.txt')) return false;
                const firstLine = content.split('\n')[0];
                return firstLine && firstLine.includes('snapshot-date');
              },
              test: (filename, ext) => ext === 'txt' && (filename.includes('inv') || filename.includes('fba'))
            }
          ],
          fileNames: {
            'yumai_report': '优麦云报表',
            'inventory_report': 'FBA库存',
          },
          fileTypeHints: {
            'yumai_report': '.xlsx格式',
            'inventory_report': '.txt格式, 内容包含"snapshot-date"',
          }
        });
      }

      this.initializeLastWeekButton();
      this.initializeYesterdayButton();
      this.setupFormSubmission('yumai-analysis-form', '商品分析（优麦云）');

      console.log('Yumai analysis page initialized with custom multi-file support');
    } catch (error) {
      console.error('Failed to initialize yumai analysis:', error);
    }
  }

  /**
   * 初始化上周按钮
   */
  initializeLastWeekButton() {
    // 使用 setTimeout 确保 DOM 元素已经加载
    setTimeout(() => {
      const lastWeekBtn = DOM.find('#last-week-btn');
      console.log('查找上周按钮:', lastWeekBtn);

      if (lastWeekBtn) {
        // 清除可能存在的旧事件监听器
        const newBtn = lastWeekBtn.cloneNode(true);
        lastWeekBtn.parentNode.replaceChild(newBtn, lastWeekBtn);

        // 绑定新的事件监听器
        newBtn.addEventListener('click', () => {
          console.log('上周按钮被点击');

          try {
            // 使用 TimeUtils 计算上周日期范围
            const lastWeek = TimeUtils.lastWeek();

            // 设置日期输入框的值
            const startDateInput = DOM.find('#report_start_date');
            const endDateInput = DOM.find('#report_end_date');

            if (startDateInput && endDateInput) {
              startDateInput.value = lastWeek.start;
              endDateInput.value = lastWeek.end;
              console.log('日期已设置:', lastWeek.start, '至', lastWeek.end);
            } else {
              console.error('找不到日期输入框');
            }
          } catch (error) {
            console.error('设置日期时出错:', error);
            notify.error('设置日期失败，请重试');
          }
        });

        console.log('上周按钮事件监听器已绑定');
      } else {
        console.error('找不到上周按钮');
      }
    }, 100);
  }

  /**
   * 初始化昨天按钮
   */
  initializeYesterdayButton() {
    // 使用 setTimeout 确保 DOM 元素已经加载
    setTimeout(() => {
      const yesterdayBtn = DOM.find('#yesterday-btn');
      console.log('查找昨天按钮:', yesterdayBtn);

      if (yesterdayBtn) {
        // 清除可能存在的旧事件监听器
        const newBtn = yesterdayBtn.cloneNode(true);
        yesterdayBtn.parentNode.replaceChild(newBtn, yesterdayBtn);

        // 绑定新的事件监听器
        newBtn.addEventListener('click', () => {
          console.log('昨天按钮被点击');

          try {
            // 使用 TimeUtils 获取昨天的日期
            const yesterday = TimeUtils.yesterday('YYYY-MM-DD');

            // 设置日期输入框的值
            const startDateInput = DOM.find('#report_start_date');
            const endDateInput = DOM.find('#report_end_date');

            if (startDateInput && endDateInput) {
              startDateInput.value = yesterday;
              endDateInput.value = yesterday;
              console.log('日期已设置为昨天:', yesterday);
            } else {
              console.error('找不到日期输入框');
            }
          } catch (error) {
            console.error('设置日期时出错:', error);
            notify.error('设置日期失败，请重试');
          }
        });

        console.log('昨天按钮事件监听器已绑定');
      } else {
        console.error('找不到昨天按钮');
      }
    }, 100);
  }

  /**
   * 初始化运营总览页面
   */
  initializeOperationsOverview() {
    console.log('运营总览页面已加载');

    // 初始化时间轴交互效果
    this.initializeTimelineInteractions();
  }

  /**
   * 初始化时间轴交互
   */
  initializeTimelineInteractions() {
    // 时间轴标记点击事件
    const timelineMarkers = DOM.findAll('.timeline-marker');
    timelineMarkers.forEach(marker => {
      marker.addEventListener('click', (e) => {
        this.handleTimelineMarkerClick(e.currentTarget);
      });
    });

    // 任务项点击事件
    const taskItems = DOM.findAll('.task-item');
    taskItems.forEach(item => {
      item.addEventListener('click', (e) => {
        this.handleTaskItemClick(e.currentTarget);
      });
    });

    // 初始化进度条动画
    this.animateProgressBar();
  }

  /**
   * 处理时间轴标记点击
   */
  handleTimelineMarkerClick(marker) {
    // 移除所有标记的活动状态
    const allMarkers = DOM.findAll('.timeline-marker');
    allMarkers.forEach(m => m.classList.remove('active'));

    // 添加活动状态到当前标记
    marker.classList.add('active');

    // 获取对应的内容区域
    const timelineItem = marker.closest('.timeline-item');
    const timelineSection = timelineItem?.querySelector('.timeline-section');

    if (timelineSection) {
      // 高亮显示对应的内容区域
      DOM.findAll('.timeline-section').forEach(section => {
        section.classList.remove('highlighted');
      });
      timelineSection.classList.add('highlighted');

      // 滚动到对应区域
      timelineSection.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }

    // 播放点击音效（如果需要）
    this.playClickSound();
  }

  /**
   * 处理任务项点击
   */
  handleTaskItemClick(taskItem) {
    // 获取任务信息
    const taskName = taskItem.querySelector('.task-name')?.textContent;
    const taskStatus = taskItem.querySelector('.task-status')?.textContent;

    if (taskName && taskStatus) {
      // 显示任务详情
      this.showTaskDetails(taskName, taskStatus, taskItem);
    }
  }

  /**
   * 显示任务详情
   */
  showTaskDetails(taskName, taskStatus, taskElement) {
    const taskDescription = taskElement.querySelector('.task-description')?.textContent;
    const outputBadge = taskElement.querySelector('.output-badge')?.textContent;

    let message = `任务：${taskName}\n状态：${taskStatus}`;
    if (taskDescription) {
      message += `\n说明：${taskDescription}`;
    }
    if (outputBadge) {
      message += `\n输出：${outputBadge}`;
    }

    // 显示通知
    notify.info(message);
  }

  /**
   * 动画化进度条
   */
  animateProgressBar() {
    const progressFill = DOM.find('.progress-fill');
    if (progressFill) {
      // 模拟进度更新
      setTimeout(() => {
        progressFill.style.width = '15%';
      }, 500);
    }
  }

  /**
   * 播放点击音效
   */
  playClickSound() {
    // 如果需要音效，可以在这里添加
    // 这里只是示例，实际项目中可能需要音频文件
    console.log('Timeline marker clicked');
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

    // Prevent multiple listeners by attaching a flag
    if (form.dataset.submissionHandlerAttached) {
      return;
    }
    form.dataset.submissionHandlerAttached = 'true';

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = new FormData(form);
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.innerHTML;

      // Show loading state on the button
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> 正在生成${reportType}...`;
      }

      try {
        const response = await fetch(form.action, {
          method: 'POST',
          body: formData
        });

        if (response.ok) {
          const blob = await response.blob();
          const contentDisposition = response.headers.get('Content-Disposition');
          let filename = `${reportType.toLowerCase()}_${new Date().toISOString().split('T')[0]}.xlsx`;

          if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
            if (filenameMatch && filenameMatch[1]) {
              filename = filenameMatch[1].replace(/['"]/g, '');
            }
            const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/);
            if (utf8Match && utf8Match[1]) {
              filename = decodeURIComponent(utf8Match[1]);
            }
          }
          
          if (window.downloadFile) {
             await window.downloadFile(blob, filename);
          } else {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
          }

          notify.success(`${reportType}生成成功`);

          // On success, reset the component state for the next use.
          if (this.components.fileUpload && typeof this.components.fileUpload.reset === 'function') {
            this.components.fileUpload.reset();
          }

          // 检查响应头中的重置标志
          const shouldResetForm = response.headers.get('X-Form-Reset');
          if (shouldResetForm === 'true') {
            // 重置表单字段
            this.resetFormFields(form);
            
            // 如果有月报表单处理器，也调用其重置方法
            if (window.monthlyReportFormHandler && typeof window.monthlyReportFormHandler.resetForm === 'function') {
              window.monthlyReportFormHandler.resetForm();
            }
          }

        } else {
          let errorMsg = `生成${reportType}失败`;
          try {
            const errorData = await response.json();
            if(errorData && errorData.error) { errorMsg = errorData.error; }
          } catch(err) {
            errorMsg = await response.text() || response.statusText;
          }
          throw new Error(errorMsg);
        }
      } catch (error) {
        console.error('Error:', error);
        notify.error(error.message || `生成${reportType}时发生未知错误`);
      } finally {
        // Restore button state. The reset() call will handle disabling it.
        if (submitBtn) {
          if (!submitBtn.disabled) {
             submitBtn.disabled = false;
          }
          submitBtn.innerHTML = originalBtnText;
        }
      }
    });

    // 重置表单字段
    this.resetFormFields(form);
  }

  /**
   * 重置表单字段
   */
  resetFormFields(form) {
    if (!form) return;

    try {
      // 重置项目名称选择框
      const projectNameSelect = form.querySelector('#project_name');
      if (projectNameSelect) {
        projectNameSelect.value = '';
      }

      // 重置报表日期选择框
      const reportDateSelect = form.querySelector('#report_date');
      if (reportDateSelect) {
        reportDateSelect.value = '';
      }

      // 重置文件输入框
      const fileInput = form.querySelector('input[type="file"]');
      if (fileInput) {
        // 清除文件选择
        fileInput.value = '';
        
        // 如果有文件列表，清空文件列表
        const fileList = form.querySelector('#file-list');
        if (fileList) {
          fileList.innerHTML = '';
        }
      }

      // 清除任何错误消息
      const errorMessages = form.querySelectorAll('.flash-error, .error-message');
      errorMessages.forEach(error => {
        if (error.parentNode) {
          error.parentNode.removeChild(error);
        }
      });

      console.log('表单字段已重置');
    } catch (error) {
      console.error('重置表单字段时出错:', error);
    }
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