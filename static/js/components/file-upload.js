/**
 * 文件上传组件
 * 专门用于产品分析页面的文件上传功能
 */

class FileUploadComponent {
  constructor(options = {}) {
    this.options = {
      containerSelector: '#drop-area',
      inputSelector: '#file-input',
      listSelector: '#file-list',
      submitSelector: '#submit-btn',
      uploadEndpoint: '/dataset/product-analysis/upload-file',
      allowedTypes: ['csv', 'xlsx', 'txt'],
      maxFileSize: 50 * 1024 * 1024, // 50MB
      allowMultiple: true,
      // 自定义文件分类规则
      rules: [
        {
          type: 'business_report',
          test: (filename, ext) => ext === 'csv' && (filename.includes('business') || filename.includes('业务'))
        },
        {
          type: 'payment_report',
          test: (filename, ext) => ext === 'csv' && (filename.includes('transaction') || filename.includes('付款') || filename.includes('payment'))
        },
        {
          type: 'ad_product_report',
          test: (filename, ext) => ext === 'xlsx' && (filename.includes('ad') || filename.includes('广告') || filename.includes('advertising'))
        }
      ],
      // 日报文件分类规则
      dailyRules: [
        {
          type: 'sales_report',
          test: (filename, ext) => ext === 'txt' && filename.startsWith('or')
        },
        {
          type: 'fba_report',
          test: (filename, ext) => ext === 'txt' && filename.includes('fba')
        },
        {
          type: 'ad_report',
          test: (filename, ext) => ext === 'xlsx'
        }
      ],
      // 文件类型显示名称
      fileNames: {
        'business_report': '业务报告',
        'payment_report': '付款报告',
        'ad_product_report': '广告报表',
        'sales_report': '所有订单',
        'fba_report': 'FBA库存',
        'ad_report': '广告报表'
      },
      // 文件类型提示
      fileTypeHints: {
        'business_report': '.csv格式',
        'payment_report': '.csv格式',
        'ad_product_report': '.xlsx格式',
        'sales_report': '.txt格式，包含"order"',
        'fba_report': '.txt格式，包含"fba"',
        'ad_report': '.xlsx格式'
      },
      // 是否为日报模式
      isDailyReport: false,
      ...options
    };
    
    // 根据模式初始化文件存储对象
    if (this.options.isDailyReport) {
      this.uploadedFiles = {
        sales_report: null,
        fba_report: null,
        ad_report: null
      };
    } else {
      this.uploadedFiles = {
        business_report: null,
        payment_report: null,
        ad_product_report: null
      };
    }
    
    this.init();
  }

  /**
   * 初始化文件上传组件
   */
  init() {
    this.cacheElements();
    this.setupEventListeners();
    this.setupFileTypes();
  }

  /**
   * 缓存DOM元素
   */
  cacheElements() {
    this.dropArea = DOM.find(this.options.containerSelector);
    this.fileInput = DOM.find(this.options.inputSelector);
    this.fileList = DOM.find(this.options.listSelector);
    this.submitBtn = DOM.find(this.options.submitSelector);
  }

  /**
   * 设置事件监听器
   */
  setupEventListeners() {
    if (!this.dropArea || !this.fileInput) return;

    // 点击拖拽区域时触发文件选择
    this.dropArea.addEventListener('click', () => {
      this.fileInput.click();
    });

    // 阻止默认的拖拽行为
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      this.dropArea.addEventListener(eventName, this.preventDefaults, false);
    });

    // 拖拽进入和悬停时的样式
    ['dragenter', 'dragover'].forEach(eventName => {
      this.dropArea.addEventListener(eventName, this.highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      this.dropArea.addEventListener(eventName, this.unhighlight, false);
    });

    // 处理文件拖拽放下
    this.dropArea.addEventListener('drop', this.handleDrop.bind(this), false);

    // 处理文件选择
    this.fileInput.addEventListener('change', this.handleFileSelect.bind(this));

    // 设置文件项删除事件
    this.setupFileItemEvents();
  }

  /**
   * 阻止默认行为
   */
  preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  /**
   * 高亮拖拽区域
   */
  highlight() {
    this.dropArea.classList.add('dragover');
  }

  /**
   * 取消高亮
   */
  unhighlight() {
    this.dropArea.classList.remove('dragover');
  }

  /**
   * 处理文件拖拽
   */
  handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    this.handleFiles(files);
  }

  /**
   * 处理文件选择
   */
  handleFileSelect(e) {
    const files = e.target.files;
    this.handleFiles(files);
  }

  /**
   * 处理文件列表
   */
  async handleFiles(files) {
    if (files.length === 0) return;

    // 检查文件类型和大小
    const validFiles = Array.from(files).filter(file => {
      const ext = file.name.split('.').pop().toLowerCase();
      const isValidType = this.options.allowedTypes.includes(ext);
      const isValidSize = Validation.isValidFileSize(file, this.options.maxFileSize);
      
      if (!isValidType) {
        notify.warning(`文件 "${file.name}" 格式不支持，仅支持 ${this.options.allowedTypes.join(', ')} 格式`);
        return false;
      }
      
      if (!isValidSize) {
        notify.warning(`文件 "${file.name}" 过大，最大支持 ${StringUtils.formatFileSize(this.options.maxFileSize)}`);
        return false;
      }
      
      return true;
    });

    if (validFiles.length === 0) return;

    // 为每个文件确定类型并上传
    for (const file of validFiles) {
      const fileType = await this.determineFileType(file);
      if (fileType) {
        this.uploadFile(file, fileType);
      } else {
        notify.warning(`无法确定文件 "${file.name}" 的类型`);
      }
    }
  }

  /**
   * 根据文件名和内容确定文件类型
   */
  async determineFileType(file) {
    const filename = file.name.toLowerCase();
    const ext = filename.split('.').pop().toLowerCase();
    
    // 选择对应的规则集
    const rules = this.options.isDailyReport ? this.options.dailyRules : this.options.rules;
    
    // 尝试自动识别文件类型
    for (const rule of rules) {
      if (rule.test(filename, ext)) {
        // 检查该类型文件是否已上传
        if (!this.uploadedFiles[rule.type]) {
          return rule.type;
        }
        // 如果已上传，询问是否替换
        const shouldReplace = await this.confirmReplace(file, rule.type);
        if (shouldReplace) {
          return rule.type;
        }
      }
    }
    
    // 自动识别失败，显示手动选择对话框
    if (this.options.isDailyReport) {
      return await this.showFileTypeSelectionDialog(file);
    }
    
    return null;
  }

  /**
   * 确认是否替换已上传的文件
   */
  async confirmReplace(file, fileType) {
    const typeName = this.options.fileNames[fileType];
    return await notify.confirm(`文件 "${file.name}" 将替换已上传的${typeName}，是否继续？`);
  }

  /**
   * 显示文件类型选择对话框
   */
  async showFileTypeSelectionDialog(file) {
    return new Promise((resolve) => {
      // 创建模态对话框
      const modal = DOM.create('div', {
        className: 'file-type-modal'
      });
      
      const dialog = DOM.create('div', {
        className: 'file-type-dialog'
      });
      
      // 文件信息
      const fileInfo = DOM.create('div', {
        className: 'file-info'
      });
      fileInfo.innerHTML = `
        <p><strong>文件名：</strong>${file.name}</p>
        <p><strong>文件大小：</strong>${StringUtils.formatFileSize(file.size)}</p>
        <p><strong>文件类型：</strong>无法自动识别，请手动选择</p>
      `;
      
      // 按钮容器
      const buttonContainer = DOM.create('div', {
        className: 'file-type-buttons'
      });
      
      // 创建选择按钮
      const salesBtn = DOM.create('button', {
        className: 'file-type-btn sales'
      }, '所有订单');
      
      const fbaBtn = DOM.create('button', {
        className: 'file-type-btn fba'
      }, 'FBA库存');
      
      const adBtn = DOM.create('button', {
        className: 'file-type-btn ad'
      }, '广告报表');
      
      const cancelBtn = DOM.create('button', {
        className: 'file-type-btn cancel'
      }, '取消');
      
      // 绑定事件
      salesBtn.addEventListener('click', () => {
        document.body.removeChild(modal);
        resolve('sales_report');
      });
      
      fbaBtn.addEventListener('click', () => {
        document.body.removeChild(modal);
        resolve('fba_report');
      });
      
      adBtn.addEventListener('click', () => {
        document.body.removeChild(modal);
        resolve('ad_report');
      });
      
      cancelBtn.addEventListener('click', () => {
        document.body.removeChild(modal);
        resolve(null);
      });
      
      // 点击背景关闭
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          document.body.removeChild(modal);
          resolve(null);
        }
      });
      
      // 组装对话框
      buttonContainer.appendChild(salesBtn);
      buttonContainer.appendChild(fbaBtn);
      buttonContainer.appendChild(adBtn);
      buttonContainer.appendChild(cancelBtn);
      
      dialog.appendChild(DOM.create('h3', {}, '请选择文件类型'));
      dialog.appendChild(fileInfo);
      dialog.appendChild(buttonContainer);
      
      modal.appendChild(dialog);
      document.body.appendChild(modal);
    });
  }

  /**
   * 上传单个文件
   */
  async uploadFile(file, fileType) {
    const projectNameInput = DOM.find('#project_name');
    if (!projectNameInput || !projectNameInput.value) {
      notify.warning('请先选择项目名称');
      return;
    }

    if (this.dropArea) {
      this.dropArea.classList.add('uploading');
    }

    this.updateFileItemUI(file, fileType, 'uploading');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('project_name', projectNameInput.value);
    formData.append('file_type', fileType);

    try {
      const response = await api.post(this.options.uploadEndpoint, formData);
      
      if (response.success) {
        // 存储上传的文件路径
        this.uploadedFiles[fileType] = response.file_path;
        const pathInput = DOM.find(`#${fileType}_path`);
        if (pathInput) {
          pathInput.value = response.file_path;
        }

        this.updateFileItemUI(file, fileType, 'uploaded');
        notify.success(`文件 "${file.name}" 上传成功`);
      } else {
        throw new Error(response.error || '上传失败');
      }
    } catch (error) {
      console.error('上传失败:', error);
      this.updateFileItemUI(file, fileType, 'error', error.message);
      notify.error(`上传失败: ${error.message}`);
    } finally {
      if (this.dropArea) {
        this.dropArea.classList.remove('uploading');
      }
      this.checkAllFilesUploaded();
    }
  }

  /**
   * 更新文件项UI
   */
  updateFileItemUI(file, fileType, status, errorMessage = '') {
    const fileItem = DOM.find(`#file-${fileType}`);
    if (!fileItem) return;

    const fileName = file ? file.name : this.getFileTypeName(fileType);
    const fileSize = file ? ` (${StringUtils.formatFileSize(file.size)})` : '';

    fileItem.className = `file-item ${status}`;

    const nameSpan = fileItem.querySelector('span:first-child');
    const progressSpan = fileItem.querySelector('.upload-progress');

    // 保留帮助图标
    const helpIcon = nameSpan.querySelector('.help-icon');
    const helpIconHTML = helpIcon ? helpIcon.outerHTML : '';

    if (status === 'uploading') {
      nameSpan.innerHTML = `${this.getFileTypeName(fileType)}: ${fileName}${fileSize}${helpIconHTML}`;
      progressSpan.textContent = '上传中...';
    } else if (status === 'uploaded') {
      // 上传成功时只显示文件名，移除类型前缀和状态文字
      nameSpan.innerHTML = `${fileName}${fileSize}${helpIconHTML}`;
      progressSpan.textContent = '';
    } else if (status === 'error') {
      nameSpan.innerHTML = `${this.getFileTypeName(fileType)}: ${fileName}${fileSize}${helpIconHTML}`;
      progressSpan.textContent = `✗ 上传失败: ${errorMessage}`;
    } else if (status === 'empty') {
      const hint = this.options.fileTypeHints[fileType] || '';
      nameSpan.innerHTML = `${this.getFileTypeName(fileType)}：等待上传（${hint}）${helpIconHTML}`;
      progressSpan.textContent = '未上传';
    }

    // 添加或更新删除按钮 - 固定样式和位置
    let removeBtn = fileItem.querySelector('.remove-file');
    if (status === 'uploaded') {
      if (!removeBtn) {
        removeBtn = DOM.create('button', {
          className: 'remove-file fixed-remove-btn'
        }, '×');
        
        // 设置固定样式
        removeBtn.style.cssText = `
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: var(--error-color);
          color: white;
          border: none;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          z-index: 10;
        `;
        
        // 添加悬停效果
        removeBtn.addEventListener('mouseenter', () => {
          removeBtn.style.background = '#cc0055';
          removeBtn.style.transform = 'translateY(-50%) scale(1.1)';
        });
        
        removeBtn.addEventListener('mouseleave', () => {
          removeBtn.style.background = 'var(--error-color)';
          removeBtn.style.transform = 'translateY(-50%) scale(1)';
        });
        
        removeBtn.addEventListener('click', () => this.removeFile(fileType));
        fileItem.appendChild(removeBtn);
      }
    } else if (removeBtn) {
      removeBtn.remove();
    }
  }

  /**
   * 设置文件类型显示
   */
  setupFileTypes() {
    // 初始化所有文件项为空状态
    Object.keys(this.uploadedFiles).forEach(fileType => {
      this.updateFileItemUI(null, fileType, 'empty');
    });
  }

  /**
   * 获取文件类型名称
   */
  getFileTypeName(fileType) {
    return this.options.fileNames[fileType] || fileType;
  }

  /**
   * 设置文件项事件
   */
  setupFileItemEvents() {
    // 项目名称改变时清空已上传的文件
    const projectNameSelect = DOM.find('#project_name');
    if (projectNameSelect) {
      projectNameSelect.addEventListener('change', () => {
        this.clearAllFiles();
      });
    }
  }

  /**
   * 删除文件
   */
  removeFile(fileType) {
    this.uploadedFiles[fileType] = null;
    const pathInput = DOM.find(`#${fileType}_path`);
    if (pathInput) {
      pathInput.value = '';
    }

    // 重置UI为空状态
    this.updateFileItemUI(null, fileType, 'empty');

    this.checkAllFilesUploaded();
  }

  /**
   * 清空所有文件
   */
  clearAllFiles() {
    Object.keys(this.uploadedFiles).forEach(key => {
      this.uploadedFiles[key] = null;
      const pathInput = DOM.find(`#${key}_path`);
      if (pathInput) {
        pathInput.value = '';
      }
      this.updateFileItemUI(null, key, 'empty');
    });

    if (this.submitBtn) {
      this.submitBtn.disabled = true;
    }

    // 清空文件时移除completed状态
    if (this.dropArea) {
      this.dropArea.classList.remove('completed');
    }
  }

  /**
   * 检查所有文件是否已上传
   */
  checkAllFilesUploaded() {
    const fileKeys = Object.keys(this.uploadedFiles);
    const allUploaded = fileKeys.every(key => this.uploadedFiles[key]);

    if (this.submitBtn) {
      this.submitBtn.disabled = !allUploaded;

      if (allUploaded) {
        this.submitBtn.textContent = this.options.isDailyReport ? '生成日报' : '生成产品分析';
      } else {
        this.submitBtn.textContent = '请等待所有文件上传完成';
      }
    }

    // 如果所有文件都已上传，设置拖拽区域为completed状态
    if (allUploaded && this.dropArea) {
      this.dropArea.classList.add('completed');
    } else if (this.dropArea) {
      this.dropArea.classList.remove('completed');
    }
  }

  /**
   * 获取已上传的文件信息
   */
  getUploadedFiles() {
    return { ...this.uploadedFiles };
  }

  /**
   * 重置组件
   */
  reset() {
    this.clearAllFiles();
    if (this.fileInput) {
      this.fileInput.value = '';
    }
  }
}

// 文件上传工具函数
const FileUploadUtils = {
  /**
   * 创建文件上传组件实例
   */
  create(options) {
    return new FileUploadComponent(options);
  },

  /**
   * 验证文件类型
   */
  validateFileType(file, allowedTypes = ['csv', 'xlsx']) {
    const ext = file.name.split('.').pop().toLowerCase();
    return allowedTypes.includes(ext);
  },

  /**
   * 格式化文件大小
   */
  formatFileSize: StringUtils.formatFileSize,

  /**
   * 创建文件验证错误消息
   */
  createValidationMessage(file, allowedTypes, maxSize) {
    const messages = [];
    
    if (!this.validateFileType(file, allowedTypes)) {
      messages.push(`不支持的文件格式 "${file.name}"，仅支持 ${allowedTypes.join(', ')} 格式`);
    }
    
    if (!Validation.isValidFileSize(file, maxSize)) {
      messages.push(`文件 "${file.name}" 过大，最大支持 ${StringUtils.formatFileSize(maxSize)}`);
    }
    
    return messages;
  }
};

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    FileUploadComponent,
    FileUploadUtils
  };
}

// 挂载到全局
if (typeof window !== 'undefined') {
  window.FileUploadComponent = FileUploadComponent;
  window.FileUploadUtils = FileUploadUtils;
}
