/**
 * 导航管理模块
 * 处理侧边栏导航、用户下拉菜单、移动端菜单切换等功能
 */

class NavigationManager {
  constructor(app) {
    this.app = app;
    this.navItems = [];
    this.groupTitles = [];
    this.menuToggle = null;
  }

  /**
   * 初始化导航
   */
  init() {
    this.cacheElements();
    this.setupUserDropdown();
    this.setupMenuToggle();
    this.setupNavigation();
    this.setupMobileSidebar();
  }

  /**
   * 缓存DOM元素
   */
  cacheElements() {
    this.navItems = DOM.findAll('.nav-item');
    this.groupTitles = DOM.findAll('.group-title');

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

    userDropdownToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      userDropdown.classList.toggle('active');
    });

    document.addEventListener('click', () => {
      userDropdown.classList.remove('active');
    });

    const dropdownMenu = DOM.find('#user-dropdown-menu');
    if (dropdownMenu) {
      dropdownMenu.addEventListener('click', (e) => {
        e.stopPropagation();
        const changePasswordLink = e.target.closest('.dropdown-item[data-content="change-password"]');
        if (changePasswordLink) {
          e.preventDefault();
          this.app.loadContent('change-password');
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
   * 设置导航事件
   */
  setupNavigation() {
    this.groupTitles.forEach(title => {
      title.addEventListener('click', () => this.handleGroupTitleClick(title));
    });

    const navLinks = DOM.findAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        this.handleNavLinkClick(link);
      });
    });

    const featureItems = DOM.findAll('.feature-item');
    featureItems.forEach(item => {
      item.addEventListener('click', () => this.handleFeatureItemClick(item));
    });

    this.initializeSubmenus();
  }

  /**
   * 初始化子菜单
   */
  initializeSubmenus() {
    const submenus = DOM.findAll('.submenu');
    submenus.forEach(submenu => {
      submenu.classList.remove('expanded');
    });

    this.groupTitles.forEach(title => {
      title.classList.remove('expanded');
    });
  }

  /**
   * 处理大类标题点击
   */
  handleGroupTitleClick(title) {
    const isCurrentlyExpanded = title.classList.contains('expanded');

    this.groupTitles.forEach(otherTitle => {
      if (otherTitle !== title) {
        otherTitle.classList.remove('expanded');
        const otherSubmenu = otherTitle.nextElementSibling;
        if (otherSubmenu && otherSubmenu.classList.contains('submenu')) {
          otherSubmenu.classList.remove('expanded');
        }
      }
    });

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

    this.clearActiveStates();
    title.classList.add('active');
    this.closeMobileSidebar();
  }

  /**
   * 处理导航链接点击
   */
  handleNavLinkClick(link) {
    const contentType = link.getAttribute('data-content');
    if (!contentType) return;

    this.clearActiveStates();
    link.parentElement.classList.add('active');
    this.app.loadContent(contentType);
    this.closeMobileSidebar();
  }

  /**
   * 处理Feature卡片点击
   */
  handleFeatureItemClick(item) {
    const contentType = item.getAttribute('data-content');
    if (!contentType) return;

    this.clearActiveStates();
    item.classList.add('active');
    this.app.loadContent(contentType);
  }

  /**
   * 清除所有活动状态
   */
  clearActiveStates() {
    this.navItems.forEach(item => item.classList.remove('active'));
    this.groupTitles.forEach(title => title.classList.remove('active'));

    const featureItems = DOM.findAll('.feature-item');
    featureItems.forEach(item => item.classList.remove('active'));

    const categorySections = DOM.findAll('.category-section');
    categorySections.forEach(section => section.classList.remove('active'));

    const defaultSection = DOM.find('.default-section');
    if (defaultSection) {
      defaultSection.classList.remove('active');
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
   * 设置移动端侧边栏
   */
  setupMobileSidebar() {
    window.addEventListener('resize', debounce(() => {
      if (window.innerWidth > 768) {
        this.closeMobileSidebar();
      }
    }, 250));
  }

  /**
   * 获取URL
   */
  getUrl(contentType) {
    return ROUTE_CONFIG[contentType] || '#';
  }

  /**
   * 销毁导航管理器
   */
  destroy() {
    if (this.menuToggle && this.menuToggle.parentNode) {
      this.menuToggle.parentNode.removeChild(this.menuToggle);
    }
  }
}