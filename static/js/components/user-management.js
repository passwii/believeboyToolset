/**
 * 用户管理组件
 * 处理用户的增删查操作
 */

class UserManagementComponent {
  constructor(options = {}) {
    this.options = {
      addEndpoint: '/admin/users/add',
      deleteEndpoint: '/admin/users/delete',
      listEndpoint: '/admin/users',
      checkUsernameEndpoint: '/admin/users/check-username',
      embedParam: '?embed=true',
      protectedUsername: 'damonrock', // 管理员用户名，不可删除
      ...options
    };
    
    this.users = [];
    this.init();
  }

  /**
   * 初始化组件
   */
  init() {
    this.cacheElements();
    this.setupEventListeners();
    this.loadUsers();
  }

  /**
   * 缓存DOM元素
   */
  cacheElements() {
    this.addForm = DOM.find('#add-user-form');
    this.userTable = DOM.find('.user-table tbody');
    this.messagesContainer = DOM.find('#user-management-messages');
  }

  /**
   * 设置事件监听器
   */
  setupEventListeners() {
    // 添加用户表单
    if (this.addForm) {
      this.addForm.addEventListener('submit', this.handleAddUser.bind(this));
    }

    // 使用事件委托处理删除按钮
    document.addEventListener('click', (e) => {
      const deleteBtn = e.target.closest('.delete-user-btn');
      if (deleteBtn) {
        this.handleDeleteClick(deleteBtn);
      }
    });
  }

  /**
   * 处理添加用户
   */
  async handleAddUser(e) {
    e.preventDefault();
    
    const formData = new FormData(this.addForm);
    const username = formData.get('username').trim();
    const password = formData.get('password');
    const chineseName = formData.get('chinese_name').trim();

    // 验证数据
    const validationErrors = this.validateUserData({ username, password, chinese_name: chineseName });
    if (validationErrors.length > 0) {
      notify.warning(validationErrors.join('，'));
      return;
    }

    try {
      // 检查用户名是否已存在
      const exists = await this.checkUsernameExists(username);
      if (exists) {
        notify.warning(`用户名 "${username}" 已存在，请使用其他用户名`);
        return;
      }

      const response = await api.post(this.options.addEndpoint + this.options.embedParam, formData);
      
      if (response.success) {
        notify.success('用户添加成功');
        this.addForm.reset();
        this.loadUsers();
      } else {
        notify.error(response.message || '添加用户失败');
      }
    } catch (error) {
      console.error('Error:', error);
      notify.error('添加用户失败，请重试');
    }
  }

  /**
   * 处理删除用户
   */
  async handleDeleteClick(btn) {
    const userId = btn.getAttribute('data-user-id');
    const username = btn.getAttribute('data-username');

    // 检查是否为受保护的用户
    if (username === this.options.protectedUsername) {
      notify.warning('管理员账户不可删除');
      return;
    }

    const confirmed = await notify.confirm(
      `确定要删除用户 "${username}" 吗？此操作不可恢复！`, 
      {
        title: '确认删除用户',
        confirmText: '删除',
        cancelText: '取消',
        type: 'error'
      }
    );

    if (!confirmed) return;

    try {
      const response = await api.post(`${this.options.deleteEndpoint}/${userId}${this.options.embedParam}`);
      
      if (response.success) {
        notify.success('用户删除成功');
        this.loadUsers();
      } else {
        notify.error(response.message || '删除用户失败');
      }
    } catch (error) {
      console.error('Error:', error);
      notify.error('删除用户失败，请重试');
    }
  }

  /**
   * 验证用户数据
   */
  validateUserData(data) {
    const errors = [];

    if (!data.username?.trim()) {
      errors.push('用户名不能为空');
    } else if (data.username.length < 3) {
      errors.push('用户名至少需要3个字符');
    } else if (data.username.length > 20) {
      errors.push('用户名不能超过20个字符');
    } else if (!/^[a-zA-Z0-9_]+$/.test(data.username)) {
      errors.push('用户名只能包含字母、数字和下划线');
    }

    if (!data.password) {
      errors.push('密码不能为空');
    } else if (data.password.length < 6) {
      errors.push('密码至少需要6个字符');
    }

    if (data.chinese_name && data.chinese_name.length > 50) {
      errors.push('中文姓名不能超过50个字符');
    }

    return errors;
  }

  /**
   * 检查用户名是否存在
   */
  async checkUsernameExists(username) {
    try {
      const params = new URLSearchParams({
        username: username,
        embed: 'true'
      });

      const response = await api.get(`${this.options.checkUsernameEndpoint}?${params.toString()}`);
      return response.exists;
    } catch (error) {
      console.error('Error checking username:', error);
      return false;
    }
  }

  /**
   * 加载用户列表
   */
  async loadUsers() {
    try {
      const response = await api.get(this.options.listEndpoint + this.options.embedParam);
      
      if (response.success) {
        this.users = response.users || [];
        this.renderUsers();
      } else {
        notify.error('加载用户列表失败');
      }
    } catch (error) {
      console.error('Error loading users:', error);
      notify.error('加载用户列表失败，请重试');
    }
  }

  /**
   * 渲染用户列表
   */
  renderUsers() {
    if (!this.userTable) return;

    if (this.users.length === 0) {
      // 显示空状态
      this.userTable.innerHTML = `
        <tr>
          <td colspan="5" class="empty-state">
            <i class="fas fa-users"></i>
            <p>暂无用户数据</p>
          </td>
        </tr>
      `;
      return;
    }

    // 生成表格行
    this.userTable.innerHTML = this.users.map(user => {
      const isAdmin = user.username === this.options.protectedUsername;
      const isProtected = isAdmin;

      return `
        <tr>
          <td>${user.id}</td>
          <td>
            <strong>${this.escapeHtml(user.username)}</strong>
            ${isAdmin ? `
              <span class="admin-badge">
                <i class="fas fa-crown"></i> 管理员
              </span>
            ` : ''}
          </td>
          <td>${this.escapeHtml(user.chinese_name) || '未设置'}</td>
          <td>${this.formatDate(user.created_at)}</td>
          <td>
            <div class="actions">
              ${!isProtected ? `
                <button type="button"
                        class="btn btn-danger delete-user-btn"
                        data-user-id="${user.id}"
                        data-username="${this.escapeHtml(user.username)}"
                        title="删除用户">
                  <i class="fas fa-trash"></i> 删除
                </button>
              ` : `
                <span class="protected-badge">
                  <i class="fas fa-shield-alt"></i> 不可删除
                </span>
              `}
            </div>
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
   * 获取用户数据
   */
  getUsers() {
    return [...this.users];
  }

  /**
   * 根据ID获取用户
   */
  getUserById(id) {
    return this.users.find(user => user.id == id);
  }

  /**
   * 刷新用户列表
   */
  refresh() {
    this.loadUsers();
  }

  /**
   * 重置组件
   */
  reset() {
    this.users = [];
    if (this.addForm) this.addForm.reset();
  }

  /**
   * 销毁组件
   */
  destroy() {
    // 移除事件监听器
    if (this.addForm) {
      this.addForm.removeEventListener('submit', this.handleAddUser);
    }
    
    // 清理数据
    this.reset();
  }
}

// 用户管理工具函数
const UserManagement = {
  /**
   * 创建用户管理组件实例
   */
  create(options) {
    return new UserManagementComponent(options);
  },

  /**
   * 验证用户数据
   */
  validateUserData(data) {
    const component = new UserManagementComponent();
    return component.validateUserData(data);
  },

  /**
   * 检查用户名格式
   */
  isValidUsername(username) {
    return /^[a-zA-Z0-9_]{3,20}$/.test(username);
  },

  /**
   * 检查密码强度
   */
  checkPasswordStrength(password) {
    const errors = [];
    
    if (password.length < 6) {
      errors.push('密码至少需要6个字符');
    }
    
    if (password.length > 50) {
      errors.push('密码不能超过50个字符');
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors,
      strength: this.calculatePasswordStrength(password)
    };
  },

  /**
   * 计算密码强度
   */
  calculatePasswordStrength(password) {
    let score = 0;
    
    // 长度分数
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    
    // 字符类型分数
    if (/[a-z]/.test(password)) score += 1; // 小写字母
    if (/[A-Z]/.test(password)) score += 1; // 大写字母
    if (/[0-9]/.test(password)) score += 1; // 数字
    if (/[^a-zA-Z0-9]/.test(password)) score += 1; // 特殊字符
    
    if (score <= 2) return 'weak';
    if (score <= 4) return 'medium';
    return 'strong';
  },

  /**
   * 生成密码建议
   */
  generatePasswordSuggestion(length = 12) {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    const allChars = lowercase + uppercase + numbers + symbols;
    let password = '';
    
    // 确保包含每种字符类型
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    
    // 填充剩余长度
    for (let i = 4; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // 打乱字符顺序
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }
};

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    UserManagementComponent,
    UserManagement
  };
}

// 挂载到全局
if (typeof window !== 'undefined') {
  window.UserManagementComponent = UserManagementComponent;
  window.UserManagement = UserManagement;
}