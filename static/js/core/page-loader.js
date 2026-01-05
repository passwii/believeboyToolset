/**
 * 页面加载器模块
 * 负责加载页面内容和管理加载状态
 */

class PageLoader {
  constructor(dynamicSectionSelector = '.dynamic-section') {
    this.dynamicSection = null;
    this.dynamicSectionSelector = dynamicSectionSelector;
  }

  /**
   * 初始化
   */
  init() {
    this.dynamicSection = DOM.find(this.dynamicSectionSelector);
  }

  /**
   * 加载页面内容
   */
  async load(contentType) {
    if (!this.dynamicSection) return;

    this.showLoading(contentType);
    this.setActive();

    const url = this.getUrl(contentType);

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('网络响应不正常');
      }

      const html = await response.text();
      this.renderContent(html);

      return { success: true };
    } catch (error) {
      console.error('加载内容失败:', error);
      this.showError(contentType, error);
      return { success: false, error };
    }
  }

  /**
   * 显示加载状态
   */
  showLoading(contentType) {
    this.dynamicSection.innerHTML = `
      <div class="loading-container">
        <div class="loading-spinner">
          <i class="fas fa-spinner fa-spin"></i>
          <span>正在加载内容...</span>
        </div>
      </div>
    `;
  }

  /**
   * 渲染内容
   */
  renderContent(html) {
    this.dynamicSection.innerHTML = html;
  }

  /**
   * 设置活动状态
   */
  setActive() {
    this.dynamicSection.classList.add('active');
  }

  /**
   * 显示错误
   */
  showError(contentType, error) {
    this.dynamicSection.innerHTML = `
      <div class="error-container">
        <i class="fas fa-exclamation-triangle"></i>
        <h3>加载失败</h3>
        <p>无法加载内容，请稍后重试</p>
        <button class="retry-btn" onclick="window.app.loadContent('${contentType}')">重试</button>
      </div>
    `;
  }

  /**
   * 获取URL
   */
  getUrl(contentType) {
    return ROUTE_CONFIG[contentType] || '#';
  }

  /**
   * 重置
   */
  reset() {
    if (this.dynamicSection) {
      this.dynamicSection.innerHTML = '';
      this.dynamicSection.classList.remove('active');
    }
  }

  /**
   * 显示默认内容
   */
  showDefault(defaultSection) {
    this.dynamicSection.innerHTML = '';
    this.dynamicSection.classList.remove('active');
    if (defaultSection) {
      defaultSection.classList.add('active');
    }
  }
}