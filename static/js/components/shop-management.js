/**
 * 店铺管理组件
 * 处理店铺的增删改查操作
 */

class ShopManagementComponent {
  constructor(options = {}) {
    this.options = {
      addEndpoint: '/admin/shops/add',
      updateEndpoint: '/admin/shops/update',
      deleteEndpoint: '/admin/shops/delete',
      checkNameEndpoint: '/admin/shops/check-name',
      listEndpoint: '/admin/shops/list',
      embedParam: '?embed=true',
      ...options
    };
    
    this.shops = [];
    this.currentEditId = null;
    this.init();
  }

  /**
   * 初始化组件
   */
  init() {
    this.cacheElements();
    this.setupEventListeners();
    this.loadShops();
  }

  /**
   * 缓存DOM元素
   */
  cacheElements() {
    this.addForm = DOM.find('#add-shop-form');
    this.shopsTable = DOM.find('.shops-table tbody');
    this.shopsTotalCount = DOM.find('#shops-total-count');
    this.editModal = DOM.find('#edit-shop-modal');
    this.editForm = DOM.find('#edit-shop-form');
    this.messagesContainer = DOM.find('#user-management-messages');
  }

  /**
   * 设置事件监听器
   */
  setupEventListeners() {
    // 添加店铺表单
    if (this.addForm) {
      this.addForm.addEventListener('submit', this.handleAddShop.bind(this));
    }

    // 编辑店铺表单
    if (this.editForm) {
      this.editForm.addEventListener('submit', this.handleEditShop.bind(this));
    }

    // 模态框关闭
    this.setupModalEvents();

    // 使用事件委托处理表格中的按钮
    document.addEventListener('click', (e) => {
      const editBtn = e.target.closest('.edit-shop-btn');
      const deleteBtn = e.target.closest('.delete-shop-btn');

      if (editBtn) {
        this.handleEditClick(editBtn);
      } else if (deleteBtn) {
        this.handleDeleteClick(deleteBtn);
      }
    });
  }

  /**
   * 设置模态框事件
   */
  setupModalEvents() {
    const closeModal = this.closeModal.bind(this);
    
    // 关闭按钮
    const closeBtn = this.editModal?.querySelector('.close-modal');
    if (closeBtn) {
      closeBtn.addEventListener('click', closeModal);
    }

    // 取消按钮
    const cancelBtn = this.editModal?.querySelector('.cancel-edit');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', closeModal);
    }

    // 点击模态框外部关闭
    if (this.editModal) {
      this.editModal.addEventListener('click', (e) => {
        if (e.target === this.editModal) {
          closeModal();
        }
      });
    }
  }

  /**
   * 处理添加店铺
   */
  async handleAddShop(e) {
    e.preventDefault();
    
    const formData = new FormData(this.addForm);
    const shopName = formData.get('shop_name').trim();

    if (!shopName) {
      notify.warning('请输入店铺名称');
      return;
    }

    try {
      // 检查店铺名称是否已存在
      const exists = await this.checkShopNameExists(shopName);
      if (exists) {
        notify.warning(`店铺名称 "${shopName}" 已存在，请使用其他名称`);
        return;
      }

      const response = await api.post(this.options.addEndpoint + this.options.embedParam, formData);
      
      if (response.success) {
        notify.success('店铺添加成功');
        this.addForm.reset();
        this.loadShops();
      } else {
        notify.error(response.message || '添加店铺失败');
      }
    } catch (error) {
      console.error('Error:', error);
      notify.error('添加店铺失败，请重试');
    }
  }

  /**
   * 处理编辑按钮点击
   */
  handleEditClick(btn) {
    const shopId = btn.getAttribute('data-shop-id');
    const shopName = btn.getAttribute('data-shop-name');
    const brandName = btn.getAttribute('data-brand-name');
    const shopUrl = btn.getAttribute('data-shop-url');
    const operator = btn.getAttribute('data-operator');
    const shopType = btn.getAttribute('data-shop-type');
    
    this.showEditModal({
      id: shopId,
      shop_name: shopName,
      brand_name: brandName,
      shop_url: shopUrl,
      operator: operator,
      shop_type: shopType
    });
  }

  /**
   * 显示编辑模态框
   */
  showEditModal(shop) {
    if (!this.editModal) return;

    this.currentEditId = shop.id;
    
    // 填充表单
    DOM.find('#edit_shop_id').value = shop.id;
    DOM.find('#edit_shop_name').value = shop.shop_name;
    DOM.find('#edit_shop_name').setAttribute('data-original-name', shop.shop_name);
    DOM.find('#edit_brand_name').value = shop.brand_name || '';
    DOM.find('#edit_shop_url').value = shop.shop_url;
    DOM.find('#edit_operator').value = shop.operator || '';
    DOM.find('#edit_shop_type').value = shop.shop_type || '自有';

    this.editModal.style.display = 'block';
  }

  /**
   * 关闭模态框
   */
  closeModal() {
    if (this.editModal) {
      this.editModal.style.display = 'none';
      this.currentEditId = null;
      this.editForm.reset();
    }
  }

  /**
   * 处理编辑店铺
   */
  async handleEditShop(e) {
    e.preventDefault();
    
    const formData = new FormData(this.editForm);
    const shopId = formData.get('shop_id');
    const shopName = formData.get('shop_name').trim();
    const originalShopName = DOM.find('#edit_shop_name').getAttribute('data-original-name') || '';

    if (!shopName) {
      notify.warning('请输入店铺名称');
      return;
    }

    // 如果店铺名称有变化，检查是否已存在
    if (shopName !== originalShopName) {
      try {
        const exists = await this.checkShopNameExists(shopName, shopId);
        if (exists) {
          notify.warning(`店铺名称 "${shopName}" 已存在，请使用其他名称`);
          return;
        }
      } catch (error) {
        console.error('检查店铺名称失败:', error);
      }
    }

    try {
      const response = await api.post(`${this.options.updateEndpoint}/${shopId}${this.options.embedParam}`, formData);
      
      if (response.success) {
        notify.success('店铺信息更新成功');
        this.closeModal();
        this.loadShops();
      } else {
        notify.error(response.message || '更新店铺信息失败');
      }
    } catch (error) {
      console.error('Error:', error);
      notify.error('更新店铺信息失败，请重试');
    }
  }

  /**
   * 处理删除按钮点击
   */
  async handleDeleteClick(btn) {
    const shopId = btn.getAttribute('data-shop-id');
    const shopName = btn.getAttribute('data-shop-name');

    const confirmed = await notify.confirm(`确定要删除店铺 "${shopName}" 吗？此操作不可恢复！`, {
      title: '确认删除',
      confirmText: '删除',
      cancelText: '取消',
      type: 'error'
    });

    if (!confirmed) return;

    try {
      const response = await api.post(`${this.options.deleteEndpoint}/${shopId}${this.options.embedParam}`);
      
      if (response.success) {
        notify.success('店铺删除成功');
        this.loadShops();
      } else {
        notify.error(response.message || '删除店铺失败');
      }
    } catch (error) {
      console.error('Error:', error);
      notify.error('删除店铺失败，请重试');
    }
  }

  /**
   * 检查店铺名称是否存在
   */
  async checkShopNameExists(shopName, excludeId = null) {
    try {
      const params = new URLSearchParams({
        shop_name: shopName,
        embed: 'true'
      });
      
      if (excludeId) {
        params.append('exclude_id', excludeId);
      }

      const response = await api.get(`${this.options.checkNameEndpoint}?${params.toString()}`);
      return response.exists;
    } catch (error) {
      console.error('Error checking shop name:', error);
      return false;
    }
  }

  /**
   * 加载店铺列表
   */
  async loadShops() {
    try {
      const response = await api.get(this.options.listEndpoint + this.options.embedParam);
      
      if (response.success) {
        this.shops = response.shops || [];
        this.renderShops();
      } else {
        notify.error('加载店铺列表失败');
      }
    } catch (error) {
      console.error('Error loading shops:', error);
      notify.error('加载店铺列表失败，请重试');
    }
  }

  /**
   * 渲染店铺列表
   */
  renderShops() {
    // 更新总数
    if (this.shopsTotalCount) {
      this.shopsTotalCount.textContent = this.shops.length;
    }

    if (!this.shopsTable) return;

    if (this.shops.length === 0) {
      // 显示空状态
      this.shopsTable.innerHTML = `
        <tr>
          <td colspan="7" class="empty-state">
            <i class="fas fa-store-slash"></i>
            <p>暂无店铺信息</p>
          </td>
        </tr>
      `;
      return;
    }

    // 生成表格行
    this.shopsTable.innerHTML = this.shops.map(shop => {
      const typeClass = shop.shop_type === '自有' ? 'own' : 'competitor';
      const displayUrl = shop.shop_url.length > 30 ? 
        shop.shop_url.substring(0, 30) + '...' : shop.shop_url;

      return `
        <tr class="shop-row" data-shop-id="${shop.id}">
          <td class="shop-name">${this.escapeHtml(shop.shop_name)}</td>
          <td class="brand-name">${this.escapeHtml(shop.brand_name) || '-'}</td>
          <td class="shop-url">
            <a href="${this.escapeHtml(shop.shop_url)}" target="_blank" 
               class="url-link" title="${this.escapeHtml(shop.shop_url)}">
              <i class="fas fa-external-link-alt"></i>
              <span class="url-text">${this.escapeHtml(displayUrl)}</span>
            </a>
          </td>
          <td class="operator">${this.escapeHtml(shop.operator) || '-'}</td>
          <td class="shop-type">
            <span class="type-badge ${typeClass}">
              ${this.escapeHtml(shop.shop_type) || '自有'}
            </span>
          </td>
          <td class="created-at">${this.formatDate(shop.created_at)}</td>
          <td class="actions">
            <button class="edit-shop-btn" data-shop-id="${shop.id}"
                    data-shop-name="${this.escapeHtml(shop.shop_name)}"
                    data-brand-name="${this.escapeHtml(shop.brand_name || '')}"
                    data-shop-url="${this.escapeHtml(shop.shop_url)}"
                    data-operator="${this.escapeHtml(shop.operator || '')}"
                    data-shop-type="${this.escapeHtml(shop.shop_type || '自有')}"
                    title="编辑">
              <i class="fas fa-edit"></i>
            </button>
            <button class="delete-shop-btn" data-shop-id="${shop.id}" 
                    data-shop-name="${this.escapeHtml(shop.shop_name)}" title="删除">
              <i class="fas fa-trash"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  /**
   * HTML转义
   */
  escapeHtml(text) {
    if (!text) return '';
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }

  /**
   * 格式化日期
   */
  formatDate(dateString) {
    if (!dateString) return '未知';
    
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  }

  /**
   * 获取店铺数据
   */
  getShops() {
    return [...this.shops];
  }

  /**
   * 重置组件
   */
  reset() {
    this.shops = [];
    this.currentEditId = null;
    if (this.addForm) this.addForm.reset();
    if (this.editForm) this.editForm.reset();
    this.closeModal();
  }

  /**
   * 销毁组件
   */
  destroy() {
    // 移除事件监听器
    if (this.addForm) {
      this.addForm.removeEventListener('submit', this.handleAddShop);
    }
    if (this.editForm) {
      this.editForm.removeEventListener('submit', this.handleEditShop);
    }
    
    // 清理数据
    this.reset();
  }
}

// 工厂函数
const ShopManagement = {
  /**
   * 创建店铺管理组件实例
   */
  create(options) {
    return new ShopManagementComponent(options);
  },

  /**
   * 验证店铺数据
   */
  validateShopData(data) {
    const errors = [];

    if (!data.shop_name?.trim()) {
      errors.push('店铺名称不能为空');
    }

    if (!data.shop_url?.trim()) {
      errors.push('店铺链接不能为空');
    } else if (!Validation.isUrl(data.shop_url)) {
      errors.push('店铺链接格式不正确');
    }

    if (data.brand_name && data.brand_name.length > 100) {
      errors.push('品牌名称不能超过100个字符');
    }

    if (data.operator && data.operator.length > 50) {
      errors.push('运营者姓名不能超过50个字符');
    }

    return errors;
  }
};

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ShopManagementComponent,
    ShopManagement
  };
}

// 挂载到全局
if (typeof window !== 'undefined') {
  window.ShopManagementComponent = ShopManagementComponent;
  window.ShopManagement = ShopManagement;
}