/**
 * 通知系统模块
 * 统一的通知和提示功能
 * 整合了原来cyber-tools.js和dashboard.js中的通知功能
 */

class NotificationManager {
  constructor() {
    this.notifications = new Map();
    this.container = null;
    this.init();
  }

  /**
   * 初始化通知系统
   */
  init() {
    this.createContainer();
    this.setupStyles();
  }

  /**
   * 创建通知容器
   */
  createContainer() {
    this.container = DOM.create('div', {
      id: 'notification-container',
      className: 'notification-container'
    });
    document.body.appendChild(this.container);
  }

  /**
   * 设置样式
   */
  setupStyles() {
    if (DOM.exists('#notification-styles')) return;

    const styles = DOM.create('style', {
      id: 'notification-styles'
    });
    styles.textContent = `
      .notification-container {
        position: fixed;
        top: 90px;
        right: 20px;
        z-index: 10000;
        pointer-events: none;
      }

      .notification {
        position: relative;
        background: rgba(10, 10, 10, 0.9);
        backdrop-filter: blur(10px);
        border: 1px solid var(--neon-blue);
        border-radius: 10px;
        padding: 15px 20px;
        color: var(--text-primary);
        font-weight: 500;
        min-width: 250px;
        max-width: 400px;
        margin-bottom: 10px;
        box-shadow: 0 0 20px rgba(0, 212, 255, 0.4);
        transform: translateX(400px);
        transition: all 0.3s ease;
        pointer-events: auto;
        overflow: hidden;
      }

      .notification.show {
        transform: translateX(0);
      }

      .notification-content {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .notification-icon {
        font-size: 18px;
        flex-shrink: 0;
      }

      .notification-message {
        flex: 1;
        line-height: 1.4;
      }

      .notification-close {
        position: absolute;
        top: 8px;
        right: 12px;
        background: none;
        border: none;
        color: var(--text-secondary);
        cursor: pointer;
        font-size: 16px;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: all 0.2s ease;
      }

      .notification-close:hover {
        background: rgba(255, 255, 255, 0.1);
        color: var(--text-primary);
      }

      .notification-success {
        border-color: var(--success-color);
        box-shadow: 0 0 20px rgba(0, 255, 136, 0.4);
      }

      .notification-success .notification-icon {
        color: var(--success-color);
      }

      .notification-warning {
        border-color: var(--warning-color);
        box-shadow: 0 0 20px rgba(255, 170, 0, 0.4);
      }

      .notification-warning .notification-icon {
        color: var(--warning-color);
      }

      .notification-error {
        border-color: var(--error-color);
        box-shadow: 0 0 20px rgba(255, 71, 87, 0.4);
      }

      .notification-error .notification-icon {
        color: var(--error-color);
      }

      .notification-progress {
        position: absolute;
        bottom: 0;
        left: 0;
        height: 3px;
        background: var(--neon-blue);
        width: 100%;
        transform-origin: left;
        animation: notificationProgress 3s linear forwards;
      }

      @keyframes notificationProgress {
        from { transform: scaleX(1); }
        to { transform: scaleX(0); }
      }

      .notification-success .notification-progress {
        background: var(--success-color);
      }

      .notification-warning .notification-progress {
        background: var(--warning-color);
      }

      .notification-error .notification-progress {
        background: var(--error-color);
      }

      @media (max-width: 768px) {
        .notification-container {
          right: 10px;
          left: 10px;
        }
        
        .notification {
          min-width: auto;
          max-width: none;
          transform: translateY(-100px);
        }
        
        .notification.show {
          transform: translateY(0);
        }
      }
    `;
    document.head.appendChild(styles);
  }

  /**
   * 更新通知位置，支持垂直堆叠
   */
  updateNotificationPositions() {
    const visibleNotifications = Array.from(this.container.children).filter(
      el => el.classList.contains('show')
    );
    
    visibleNotifications.forEach((notification, index) => {
      const translateY = index * 85; // 每个通知向下偏移85px
      const translateX = 400 - (index * 20); // 新通知向左偏移20px
      notification.style.transform = `translate(${translateX}px, ${translateY}px)`;
      notification.style.zIndex = 10000 + index;
    });
  }

  /**
   * 显示通知
   * @param {string} message - 消息内容
   * @param {string} type - 类型：info, success, warning, error
   * @param {Object} options - 选项
   */
  show(message, type = 'info', options = {}) {
    const {
      duration = 3000,
      persistent = false,
      closable = true,
      actions = []
    } = options;

    const id = StringUtils.random(8);
    const icon = this.getIcon(type);
    
    const notification = DOM.create('div', {
      className: `notification notification-${type}`,
      dataset: { id, type }
    });

    notification.innerHTML = `
      <div class="notification-content">
        <i class="notification-icon fas ${icon}"></i>
        <div class="notification-message">${message}</div>
        ${closable ? '<button class="notification-close" aria-label="关闭">&times;</button>' : ''}
      </div>
      ${!persistent ? '<div class="notification-progress"></div>' : ''}
    `;

    this.container.appendChild(notification);
    
    // 更新通知位置
    this.updateNotificationPositions();
    
    // 添加入场动画
    setTimeout(() => {
      notification.classList.add('show');
    }, 50);

    // 添加关闭事件
    if (closable) {
      const closeBtn = notification.querySelector('.notification-close');
      closeBtn.addEventListener('click', () => this.hide(id));
    }

    // 自动关闭
    if (!persistent && duration > 0) {
      setTimeout(() => {
        this.hide(id);
      }, duration);
    }

    // 添加操作按钮
    if (actions.length > 0) {
      const actionsContainer = DOM.create('div', {
        className: 'notification-actions',
        style: 'margin-top: 10px; display: flex; gap: 8px;'
      });

      actions.forEach(action => {
        const btn = DOM.create('button', {
          className: 'notification-action-btn',
          style: `
            padding: 4px 12px;
            border: 1px solid rgba(255, 255, 255, 0.3);
            background: transparent;
            color: var(--text-primary);
            border-radius: 4px;
            font-size: 12px;
            cursor: pointer;
            transition: all 0.2s ease;
          `
        }, action.text);

        btn.addEventListener('mouseenter', () => {
          btn.style.background = 'rgba(255, 255, 255, 0.1)';
        });

        btn.addEventListener('mouseleave', () => {
          btn.style.background = 'transparent';
        });

        btn.addEventListener('click', () => {
          if (action.handler) {
            action.handler();
          }
          this.hide(id);
        });

        actionsContainer.appendChild(btn);
      });

      notification.querySelector('.notification-content').appendChild(actionsContainer);
    }

    this.notifications.set(id, {
      element: notification,
      type,
      message,
      createdAt: Date.now()
    });

    return id;
  }

  /**
   * 隐藏通知
   * @param {string} id - 通知ID
   */
  hide(id) {
    const notificationData = this.notifications.get(id);
    if (!notificationData) return;

    const { element } = notificationData;
    
    element.classList.remove('show');
    
    setTimeout(() => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
      this.notifications.delete(id);
      // 重新排列剩余通知
      this.updateNotificationPositions();
    }, 300);
  }

  /**
   * 隐藏所有通知
   */
  hideAll() {
    this.notifications.forEach((_, id) => {
      this.hide(id);
    });
  }

  /**
   * 获取图标类名
   * @param {string} type - 通知类型
   * @returns {string}
   */
  getIcon(type) {
    const icons = {
      info: 'fa-info-circle',
      success: 'fa-check-circle',
      warning: 'fa-exclamation-triangle',
      error: 'fa-times-circle',
      loading: 'fa-spinner fa-spin'
    };
    return icons[type] || icons.info;
  }

  /**
   * 成功通知
   * @param {string} message - 消息
   * @param {Object} options - 选项
   */
  success(message, options = {}) {
    return this.show(message, 'success', options);
  }

  /**
   * 错误通知
   * @param {string} message - 消息
   * @param {Object} options - 选项
   */
  error(message, options = {}) {
    return this.show(message, 'error', options);
  }

  /**
   * 警告通知
   * @param {string} message - 消息
   * @param {Object} options - 选项
   */
  warning(message, options = {}) {
    return this.show(message, 'warning', options);
  }

  /**
   * 信息通知
   * @param {string} message - 消息
   * @param {Object} options - 选项
   */
  info(message, options = {}) {
    return this.show(message, 'info', options);
  }

  /**
   * 加载通知
   * @param {string} message - 消息
   * @param {Object} options - 选项
   */
  loading(message, options = {}) {
    return this.show(message, 'loading', {
      persistent: true,
      closable: false,
      ...options
    });
  }

  /**
   * 更新通知
   * @param {string} id - 通知ID
   * @param {string} message - 新消息
   * @param {string} type - 新类型
   */
  update(id, message, type = 'info') {
    const notificationData = this.notifications.get(id);
    if (!notificationData) return;

    const { element } = notificationData;
    
    // 更新消息
    const messageElement = element.querySelector('.notification-message');
    if (messageElement) {
      messageElement.textContent = message;
    }

    // 更新类型
    if (type !== notificationData.type) {
      element.className = `notification notification-${type}`;
      const iconElement = element.querySelector('.notification-icon');
      if (iconElement) {
        iconElement.className = `notification-icon fas ${this.getIcon(type)}`;
      }
      notificationData.type = type;
    }

    notificationData.message = message;
  }

  /**
   * 确认对话框
   * @param {string} message - 消息
   * @param {Object} options - 选项
   * @returns {Promise<boolean>}
   */
  confirm(message, options = {}) {
    const {
      title = '确认',
      confirmText = '确定',
      cancelText = '取消',
      type = 'warning'
    } = options;

    return new Promise((resolve) => {
      const id = this.show('', type, {
        persistent: true,
        closable: false
      });

      const notificationData = this.notifications.get(id);
      const { element } = notificationData;

      element.querySelector('.notification-message').innerHTML = `
        <div style="margin-bottom: 8px; font-weight: 600;">${title}</div>
        <div>${message}</div>
        <div style="margin-top: 15px; display: flex; gap: 8px; justify-content: flex-end;">
          <button class="notification-cancel" style="
            padding: 6px 16px;
            border: 1px solid rgba(255, 255, 255, 0.3);
            background: transparent;
            color: var(--text-primary);
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.2s ease;
          ">${cancelText}</button>
          <button class="notification-confirm" style="
            padding: 6px 16px;
            border: none;
            background: var(--error-color);
            color: var(--text-primary);
            border-radius: 4px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.2s ease;
          ">${confirmText}</button>
        </div>
      `;

      // 添加事件监听
      element.querySelector('.notification-cancel').addEventListener('click', () => {
        this.hide(id);
        resolve(false);
      });

      element.querySelector('.notification-confirm').addEventListener('click', () => {
        this.hide(id);
        resolve(true);
      });

      // 鼠标悬停效果
      const cancelBtn = element.querySelector('.notification-cancel');
      const confirmBtn = element.querySelector('.notification-confirm');

      [cancelBtn, confirmBtn].forEach(btn => {
        btn.addEventListener('mouseenter', () => {
          btn.style.transform = 'translateY(-1px)';
        });

        btn.addEventListener('mouseleave', () => {
          btn.style.transform = 'translateY(0)';
        });
      });
    });
  }

  /**
   * 提示输入对话框
   * @param {string} message - 提示消息
   * @param {Object} options - 选项
   * @returns {Promise<string|null>}
   */
  prompt(message, options = {}) {
    const {
      title = '输入',
      placeholder = '',
      defaultValue = '',
      confirmText = '确定',
      cancelText = '取消'
    } = options;

    return new Promise((resolve) => {
      const id = this.show('', 'info', {
        persistent: true,
        closable: false
      });

      const notificationData = this.notifications.get(id);
      const { element } = notificationData;

      element.querySelector('.notification-message').innerHTML = `
        <div style="margin-bottom: 8px; font-weight: 600;">${title}</div>
        <div style="margin-bottom: 15px;">${message}</div>
        <input type="text" class="notification-input" value="${defaultValue}" placeholder="${placeholder}" style="
          width: 100%;
          padding: 8px 12px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          background: rgba(255, 255, 255, 0.1);
          color: var(--text-primary);
          border-radius: 4px;
          margin-bottom: 15px;
          box-sizing: border-box;
        ">
        <div style="display: flex; gap: 8px; justify-content: flex-end;">
          <button class="notification-cancel" style="
            padding: 6px 16px;
            border: 1px solid rgba(255, 255, 255, 0.3);
            background: transparent;
            color: var(--text-primary);
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.2s ease;
          ">${cancelText}</button>
          <button class="notification-confirm" style="
            padding: 6px 16px;
            border: none;
            background: var(--neon-blue);
            color: var(--text-primary);
            border-radius: 4px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.2s ease;
          ">${confirmText}</button>
        </div>
      `;

      const input = element.querySelector('.notification-input');
      
      // 回车键提交
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          element.querySelector('.notification-confirm').click();
        } else if (e.key === 'Escape') {
          element.querySelector('.notification-cancel').click();
        }
      });

      // 自动聚焦
      setTimeout(() => input.focus(), 100);

      // 添加事件监听
      element.querySelector('.notification-cancel').addEventListener('click', () => {
        this.hide(id);
        resolve(null);
      });

      element.querySelector('.notification-confirm').addEventListener('click', () => {
        const value = input.value.trim();
        this.hide(id);
        resolve(value);
      });
    });
  }
}

// 创建全局通知管理器实例
const notifications = new NotificationManager();

// 导出通知函数，方便使用
const showNotification = (message, type = 'info', options = {}) => {
  return notifications.show(message, type, options);
};

const hideNotification = (id) => {
  notifications.hide(id);
};

const hideAllNotifications = () => {
  notifications.hideAll();
};

// 便捷方法
const notify = {
  success: (message, options) => notifications.success(message, options),
  error: (message, options) => notifications.error(message, options),
  warning: (message, options) => notifications.warning(message, options),
  info: (message, options) => notifications.info(message, options),
  loading: (message, options) => notifications.loading(message, options),
  confirm: (message, options) => notifications.confirm(message, options),
  prompt: (message, options) => notifications.prompt(message, options)
};

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    NotificationManager,
    notifications,
    showNotification,
    hideNotification,
    hideAllNotifications,
    notify
  };
}

// 挂载到全局
if (typeof window !== 'undefined') {
  window.Notifications = notifications;
  window.notify = notify;
  window.showNotification = showNotification;
}