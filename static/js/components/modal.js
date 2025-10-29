/**
 * 模态框组件
 * 统一管理模态框的创建、显示、隐藏等功能
 */

class ModalComponent {
  constructor(options = {}) {
    this.options = {
      closeOnEscape: true,
      closeOnBackdrop: true,
      animationDuration: 300,
      defaultSize: 'medium', // small, medium, large
      ...options
    };

    this.modals = new Map();
    this.activeModal = null;
    this.init();
  }

  /**
   * 初始化组件
   */
  init() {
    this.setupGlobalStyles();
    this.setupGlobalEvents();
  }

  /**
   * 设置全局样式
   */
  setupGlobalStyles() {
    if (DOM.exists('#modal-global-styles')) return;

    const styles = DOM.create('style', {
      id: 'modal-global-styles'
    });
    styles.textContent = `
      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
      }

      .modal-overlay.show {
        opacity: 1;
        visibility: visible;
      }

      .modal {
        background: rgba(26, 26, 46, 0.98);
        border: 1px solid rgba(0, 212, 255, 0.3);
        border-radius: 15px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        max-height: 90vh;
        max-width: 90vw;
        overflow: hidden;
        transform: scale(0.9) translateY(50px);
        transition: all 0.3s ease;
        backdrop-filter: blur(10px);
      }

      .modal-overlay.show .modal {
        transform: scale(1) translateY(0);
      }

      .modal-small {
        width: 400px;
      }

      .modal-medium {
        width: 600px;
      }

      .modal-large {
        width: 800px;
      }

      .modal-header {
        padding: 20px 25px;
        border-bottom: 1px solid rgba(0, 212, 255, 0.2);
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: rgba(0, 212, 255, 0.1);
      }

      .modal-title {
        margin: 0;
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--text-primary);
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .modal-title i {
        color: var(--neon-blue);
      }

      .modal-close {
        background: none;
        border: none;
        color: var(--text-secondary);
        font-size: 24px;
        cursor: pointer;
        padding: 5px;
        border-radius: 5px;
        transition: all 0.2s ease;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .modal-close:hover {
        background: rgba(255, 255, 255, 0.1);
        color: var(--neon-blue);
      }

      .modal-body {
        padding: 25px;
        max-height: 60vh;
        overflow-y: auto;
      }

      .modal-footer {
        padding: 20px 25px;
        border-top: 1px solid rgba(0, 212, 255, 0.2);
        display: flex;
        gap: 10px;
        justify-content: flex-end;
        background: rgba(255, 255, 255, 0.05);
      }

      .modal-btn {
        padding: 10px 20px;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }

      .modal-btn-primary {
        background: linear-gradient(135deg, var(--neon-blue) 0%, var(--neon-purple) 100%);
        color: white;
      }

      .modal-btn-primary:hover {
        transform: translateY(-1px);
        box-shadow: 0 3px 10px rgba(0, 212, 255, 0.3);
      }

      .modal-btn-secondary {
        background: rgba(255, 255, 255, 0.1);
        color: var(--text-primary);
        border: 1px solid rgba(0, 212, 255, 0.3);
      }

      .modal-btn-secondary:hover {
        background: rgba(255, 255, 255, 0.2);
        border-color: var(--neon-blue);
      }

      .modal-btn-danger {
        background: linear-gradient(135deg, #ff4757 0%, #ff4458 100%);
        color: white;
      }

      .modal-btn-danger:hover {
        transform: translateY(-1px);
        box-shadow: 0 3px 10px rgba(255, 71, 87, 0.3);
      }

      /* 响应式设计 */
      @media (max-width: 768px) {
        .modal-small,
        .modal-medium,
        .modal-large {
          width: 95vw;
          max-width: none;
        }

        .modal-header,
        .modal-body,
        .modal-footer {
          padding: 15px 20px;
        }

        .modal-footer {
          flex-direction: column;
        }

        .modal-btn {
          width: 100%;
          justify-content: center;
        }
      }

      /* 加载状态 */
      .modal-loading {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 40px;
        color: var(--text-secondary);
      }

      .modal-loading i {
        font-size: 2rem;
        animation: spin 1s linear infinite;
        color: var(--neon-blue);
      }

      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }

      /* 滚动条样式 */
      .modal-body::-webkit-scrollbar {
        width: 6px;
      }

      .modal-body::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 3px;
      }

      .modal-body::-webkit-scrollbar-thumb {
        background: rgba(0, 212, 255, 0.5);
        border-radius: 3px;
      }

      .modal-body::-webkit-scrollbar-thumb:hover {
        background: rgba(0, 212, 255, 0.7);
      }
    `;
    document.head.appendChild(styles);
  }

  /**
   * 设置全局事件
   */
  setupGlobalEvents() {
    // ESC键关闭模态框
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.activeModal && this.options.closeOnEscape) {
        this.close(this.activeModal.id);
      }
    });

    // 点击背景关闭模态框
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal-overlay') && this.activeModal && this.options.closeOnBackdrop) {
        this.close(this.activeModal.id);
      }
    });
  }

  /**
   * 创建模态框
   */
  create(options = {}) {
    const {
      id,
      title,
      content,
      size = this.options.defaultSize,
      closable = true,
      footer = null,
      cssClass = '',
      beforeShow = null,
      afterShow = null,
      beforeClose = null,
      afterClose = null
    } = options;

    if (!id) {
      throw new Error('Modal ID is required');
    }

    // 如果模态框已存在，先关闭
    if (this.modals.has(id)) {
      this.close(id);
    }

    // 创建遮罩层
    const overlay = DOM.create('div', {
      className: 'modal-overlay',
      dataset: { modalId: id }
    });

    // 创建模态框
    const modal = DOM.create('div', {
      className: `modal modal-${size} ${cssClass}`,
      dataset: { modalId: id }
    });

    // 创建头部
    if (title || closable) {
      const header = DOM.create('div', { className: 'modal-header' });
      
      if (title) {
        const titleElement = DOM.create('h3', { className: 'modal-title' });
        if (title.icon) {
          titleElement.innerHTML = `<i class="fas ${title.icon}"></i> ${title.text || title}`;
        } else {
          titleElement.textContent = title.text || title;
        }
        header.appendChild(titleElement);
      }

      if (closable) {
        const closeBtn = DOM.create('button', {
          className: 'modal-close',
          type: 'button'
        }, '&times;');
        closeBtn.addEventListener('click', () => this.close(id));
        header.appendChild(closeBtn);
      }

      modal.appendChild(header);
    }

    // 创建内容
    const body = DOM.create('div', { className: 'modal-body' });
    if (typeof content === 'string') {
      body.innerHTML = content;
    } else if (content instanceof HTMLElement) {
      body.appendChild(content);
    } else {
      body.textContent = String(content);
    }
    modal.appendChild(body);

    // 创建底部
    if (footer) {
      const footerElement = DOM.create('div', { className: 'modal-footer' });
      if (typeof footer === 'string') {
        footerElement.innerHTML = footer;
      } else if (Array.isArray(footer)) {
        footer.forEach(btn => {
          const button = DOM.create('button', {
            className: `modal-btn modal-btn-${btn.type || 'secondary'}`,
            type: 'button'
          }, btn.text);
          
          if (btn.icon) {
            button.innerHTML = `<i class="fas ${btn.icon}"></i> ${btn.text}`;
          }

          if (btn.onClick) {
            button.addEventListener('click', btn.onClick);
          }

          if (btn.cssClass) {
            button.classList.add(btn.cssClass);
          }

          footerElement.appendChild(button);
        });
      }
      modal.appendChild(footerElement);
    }

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // 存储模态框信息
    const modalInfo = {
      id,
      overlay,
      modal,
      options: {
        size,
        closable,
        beforeShow,
        afterShow,
        beforeClose,
        afterClose
      }
    };

    this.modals.set(id, modalInfo);

    return modalInfo;
  }

  /**
   * 显示模态框
   */
  async show(id, options = {}) {
    const modalInfo = this.modals.get(id);
    if (!modalInfo) {
      console.warn(`Modal with id "${id}" not found`);
      return;
    }

    const { overlay, modal, options: modalOptions } = modalInfo;

    // 执行beforeShow回调
    if (modalOptions.beforeShow) {
      const result = await modalOptions.beforeShow(modal, options);
      if (result === false) {
        return;
      }
    }

    // 显示模态框
    overlay.classList.add('show');
    this.activeModal = modalInfo;

    // 执行afterShow回调
    if (modalOptions.afterShow) {
      modalOptions.afterShow(modal, options);
    }
  }

  /**
   * 隐藏模态框
   */
  async close(id) {
    const modalInfo = this.modals.get(id);
    if (!modalInfo) {
      console.warn(`Modal with id "${id}" not found`);
      return;
    }

    const { overlay, modal, options: modalOptions } = modalInfo;

    // 执行beforeClose回调
    if (modalOptions.beforeClose) {
      const result = await modalOptions.beforeClose(modal);
      if (result === false) {
        return;
      }
    }

    // 隐藏模态框
    overlay.classList.remove('show');

    // 清理当前活跃模态框
    if (this.activeModal && this.activeModal.id === id) {
      this.activeModal = null;
    }

    // 延迟移除DOM元素
    setTimeout(() => {
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
      this.modals.delete(id);
    }, this.options.animationDuration);

    // 执行afterClose回调
    if (modalOptions.afterClose) {
      modalOptions.afterClose();
    }
  }

  /**
   * 关闭当前活跃的模态框
   */
  closeActive() {
    if (this.activeModal) {
      this.close(this.activeModal.id);
    }
  }

  /**
   * 更新模态框内容
   */
  updateContent(id, content) {
    const modalInfo = this.modals.get(id);
    if (!modalInfo) return;

    const body = modalInfo.modal.querySelector('.modal-body');
    if (body) {
      if (typeof content === 'string') {
        body.innerHTML = content;
      } else if (content instanceof HTMLElement) {
        body.innerHTML = '';
        body.appendChild(content);
      }
    }
  }

  /**
   * 设置加载状态
   */
  setLoading(id, loading = true) {
    const modalInfo = this.modals.get(id);
    if (!modalInfo) return;

    const body = modalInfo.modal.querySelector('.modal-body');
    if (!body) return;

    if (loading) {
      body.innerHTML = `
        <div class="modal-loading">
          <i class="fas fa-spinner"></i>
          <span>加载中...</span>
        </div>
      `;
    }
  }

  /**
   * 显示确认对话框
   */
  confirm(message, options = {}) {
    return new Promise((resolve) => {
      const id = `confirm-${Date.now()}`;
      const {
        title = '确认',
        confirmText = '确定',
        cancelText = '取消',
        type = 'warning',
        icon = 'fa-question-circle'
      } = options;

      this.create({
        id,
        title: { text: title, icon },
        content: message,
        size: 'small',
        footer: [
          {
            text: cancelText,
            type: 'secondary',
            onClick: () => {
              this.close(id);
              resolve(false);
            }
          },
          {
            text: confirmText,
            type: type === 'danger' ? 'danger' : 'primary',
            onClick: () => {
              this.close(id);
              resolve(true);
            }
          }
        ]
      });

      this.show(id);
    });
  }

  /**
   * 显示提示对话框
   */
  alert(message, options = {}) {
    return new Promise((resolve) => {
      const id = `alert-${Date.now()}`;
      const {
        title = '提示',
        buttonText = '确定',
        type = 'info',
        icon = 'fa-info-circle'
      } = options;

      this.create({
        id,
        title: { text: title, icon },
        content: message,
        size: 'small',
        footer: [
          {
            text: buttonText,
            type: 'primary',
            onClick: () => {
              this.close(id);
              resolve();
            }
          }
        ]
      });

      this.show(id);
    });
  }

  /**
   * 显示输入对话框
   */
  prompt(message, options = {}) {
    return new Promise((resolve) => {
      const id = `prompt-${Date.now()}`;
      const {
        title = '输入',
        placeholder = '',
        defaultValue = '',
        confirmText = '确定',
        cancelText = '取消',
        inputType = 'text'
      } = options;

      const inputElement = DOM.create('input', {
        type: inputType,
        placeholder,
        value: defaultValue,
        style: `
          width: 100%;
          padding: 10px 12px;
          border: 1px solid rgba(0, 212, 255, 0.3);
          border-radius: 6px;
          background: rgba(255, 255, 255, 0.1);
          color: var(--text-primary);
          font-size: 14px;
          margin-bottom: 15px;
          box-sizing: border-box;
        `
      });

      this.create({
        id,
        title: { text: title, icon: 'fa-edit' },
        content: inputElement,
        size: 'small',
        footer: [
          {
            text: cancelText,
            type: 'secondary',
            onClick: () => {
              this.close(id);
              resolve(null);
            }
          },
          {
            text: confirmText,
            type: 'primary',
            onClick: () => {
              const value = inputElement.value.trim();
              this.close(id);
              resolve(value);
            }
          }
        ],
        beforeShow: (modal) => {
          setTimeout(() => inputElement.focus(), 100);
        }
      });

      this.show(id);

      // 回车键提交
      inputElement.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const value = inputElement.value.trim();
          this.close(id);
          resolve(value);
        } else if (e.key === 'Escape') {
          this.close(id);
          resolve(null);
        }
      });
    });
  }

  /**
   * 检查模态框是否存在
   */
  exists(id) {
    return this.modals.has(id);
  }

  /**
   * 获取模态框信息
   */
  getModal(id) {
    return this.modals.get(id);
  }

  /**
   * 关闭所有模态框
   */
  closeAll() {
    const ids = Array.from(this.modals.keys());
    ids.forEach(id => this.close(id));
  }

  /**
   * 销毁组件
   */
  destroy() {
    this.closeAll();
    
    // 移除样式
    const styles = DOM.find('#modal-global-styles');
    if (styles) {
      styles.remove();
    }
  }
}

// 模态框工具函数
const Modal = {
  /**
   * 创建模态框实例
   */
  create(options) {
    return new ModalComponent(options);
  },

  /**
   * 快速创建确认对话框
   */
  confirm(message, options) {
    const modal = new ModalComponent();
    return modal.confirm(message, options);
  },

  /**
   * 快速创建提示对话框
   */
  alert(message, options) {
    const modal = new ModalComponent();
    return modal.alert(message, options);
  },

  /**
   * 快速创建输入对话框
   */
  prompt(message, options) {
    const modal = new ModalComponent();
    return modal.prompt(message, options);
  }
};

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ModalComponent,
    Modal
  };
}

// 挂载到全局
if (typeof window !== 'undefined') {
  window.ModalComponent = ModalComponent;
  window.Modal = Modal;
}