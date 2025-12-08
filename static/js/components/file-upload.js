/**
 * 文件上传组件
 * 专门用于产品分析页面的文件上传功能
 */

class FileUploadComponent {
  constructor(options = {}) {
    this.options = {
      containerSelector: '#drop-area',
      inputSelector: '#file',
      listSelector: '#file-list',
      submitSelector: '#submit-btn',
      uploadEndpoint: '/yumai-analysis/process',
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
          test: (filename, ext) => ext === 'xlsx' && (filename.includes('ad') || filename.includes('广告') || filename.includes('advertising') || filename.includes('推广'))
        },
        {
          type: 'inventory_report',
          contentTest: async (file, content) => {
            if (!file.name.toLowerCase().endsWith('.txt')) return false;
            const firstLine = content.split('\n')[0];
            return firstLine && firstLine.includes('snapshot-date');
          },
          test: (filename, ext) => ext === 'txt' && (filename.includes('inv') || filename.includes('fba'))
        },
        {
          type: 'product_analysis_yumai',
          test: (filename, ext) => ext === 'xlsx' && filename.includes('商品分析')
        }
      ],
      // 日报文件分类规则（基于文件内容）
      dailyRules: [
        {
          type: 'sales_report',
          contentTest: async (file, content) => {
            if (!file.name.toLowerCase().endsWith('.txt')) return false;
            const firstLine = content.split('\n')[0];
            return firstLine && firstLine.includes('amazon-order-id');
          },
          fallbackTest: (filename, ext) => ext === 'txt' && filename.startsWith('or')
        },
        {
          type: 'fba_report',
          contentTest: async (file, content) => {
            if (!file.name.toLowerCase().endsWith('.txt')) return false;
            const firstLine = content.split('\n')[0];
            return firstLine && firstLine.includes('snapshot-date');
          },
          fallbackTest: (filename, ext) => ext === 'txt' && filename.includes('fba')
        },
        {
          type: 'ad_report',
          contentTest: async (file, content) => {
            return file.name.toLowerCase().endsWith('.xlsx');
          },
          fallbackTest: (filename, ext) => ext === 'xlsx'
        }
      ],
      // 文件类型显示名称
      fileNames: {
        'business_report': '业务报告',
        'payment_report': '付款报告',
        'ad_product_report': '广告报表',
        'inventory_report': 'FBA库存',
        'sales_report': '所有订单',
        'fba_report': 'FBA库存',
        'ad_report': '广告报表',
        'product_analysis_yumai': '商品分析'
      },
      // 文件类型提示
      fileTypeHints: {
        'business_report': '.csv格式',
        'payment_report': '.csv格式',
        'ad_product_report': '.xlsx格式',
        'inventory_report': '.txt格式，内容包含"snapshot-date"',
        'sales_report': '.txt格式，内容包含"amazon-order-id"',
        'fba_report': '.txt格式，内容包含"snapshot-date"',
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
        ad_product_report: null,
        inventory_report: null,
        product_analysis_yumai: null
      };
    }
    
    // 设置必填文件类型（库存报告为可选）
    this.requiredFileTypes = this.options.requiredFileTypes || Object.keys(this.uploadedFiles).filter(type => type !== 'inventory_report');
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
   * 读取文件内容
   */
  async readFileContent(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        resolve(e.target.result);
      };
      
      reader.onerror = () => {
        reject(new Error('文件读取失败'));
      };
      
      // 根据文件类型选择读取方式
      if (file.name.toLowerCase().endsWith('.txt')) {
        reader.readAsText(file, 'UTF-8');
      } else if (file.name.toLowerCase().endsWith('.xlsx')) {
        // Excel文件需要特殊处理
        reader.readAsArrayBuffer(file);
      } else {
        reject(new Error('不支持的文件类型'));
      }
    });
  }

  /**
   * 根据文件名和内容确定文件类型
   */
  async determineFileType(file) {
    const filename = file.name.toLowerCase();
    const ext = filename.split('.').pop().toLowerCase();
    
    const rules = this.options.isDailyReport ? this.options.dailyRules : this.options.rules;

    for (const rule of rules) {
      // Flag to see if we should proceed to fallback test
      let continueToFallback = true;

      // 1. Prioritize content-based detection if it exists
      if (rule.contentTest) {
        try {
          this.updateFileItemUI(file, rule.type, 'analyzing');
          const content = await this.readFileContent(file);
          if (await rule.contentTest(file, content)) {
            if (!this.uploadedFiles[rule.type] || await this.confirmReplace(file, rule.type)) {
              return rule.type; // Success, exit function
            }
            // If user cancels replace, we shouldn't try the fallback test for this file type
            continueToFallback = false; 
          }
        } catch (error) {
          console.warn(`Content test for ${rule.type} failed, will try fallback. Error: ${error}`);
        }
      }

      // 2. If content test was not performed, or failed, try filename-based fallback
      if (continueToFallback) {
        const fallbackTest = rule.fallbackTest || rule.test;
        if (fallbackTest && fallbackTest(filename, ext)) {
           if (!this.uploadedFiles[rule.type] || await this.confirmReplace(file, rule.type)) {
              return rule.type; // Success, exit function
           }
        }
      }
    }
    
    // If no rule matched, show the manual selection dialog
    return await this.showFileTypeSelectionDialog(file);
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
    const buttonConfigs = {
      'sales_report': {text: '所有订单', className: 'sales', color: 'var(--neon-blue, #00d4ff)'},
      'fba_report': {text: 'FBA库存', className: 'fba', color: 'var(--success-color, #00ff88)'},
      'ad_report': {text: '广告报表', className: 'ad', color: 'var(--warning-color, #ffaa00)'},
      'business_report': {text: '业务报告', className: 'business', color: 'var(--neon-blue, #00d4ff)'},
      'payment_report': {text: '付款报告', className: 'payment', color: 'var(--success-color, #00ff88)'},
      'ad_product_report': {text: '广告报表', className: 'ad', color: 'var(--warning-color, #ffaa00)'},
      'inventory_report': {text: '库存报告 (可选)', className: 'inventory', color: '#6c757d'}
    };

    const availableTypes = Object.keys(this.uploadedFiles);
    const titleText = this.options.isDailyReport ? '请选择日报文件类型' : '请选择产品分析文件类型';

    return new Promise((resolve) => {
      // 创建模态对话框
      const modal = DOM.create('div', {
        className: 'file-type-modal'
      });
      
      const dialog = DOM.create('div', {
        className: 'file-type-dialog'
      });
      
      // 主题兼容样式
      modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
      `;
      
      dialog.style.cssText = `
        background: var(--bg-primary, #1a1a1a);
        border: 2px solid var(--border-color, #333);
        border-radius: 12px;
        padding: 30px;
        max-width: 500px;
        width: 90%;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        color: var(--text-primary, #ffffff);
      `;
      
      // 文件信息
      const fileInfo = DOM.create('div', {
        className: 'file-info'
      });
      fileInfo.style.cssText = `
        margin-bottom: 25px;
        padding: 20px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        border: 1px solid var(--border-color, #444);
      `;
      fileInfo.innerHTML = `
        <p style="margin: 8px 0; color: var(--text-primary, #ffffff);"><strong>文件名：</strong>${file.name}</p>
        <p style="margin: 8px 0; color: var(--text-primary, #ffffff);"><strong>文件大小：</strong>${StringUtils.formatFileSize(file.size)}</p>
        <p style="margin: 8px 0; color: var(--text-secondary, #aaa);"><strong>文件类型：</strong>无法自动识别，请手动选择</p>
      `;
      
      // 按钮容器
      const buttonContainer = DOM.create('div', {
        className: 'file-type-buttons'
      });
      buttonContainer.style.cssText = `
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        gap: 12px;
        margin-top: 20px;
      `;
      
      // 动态创建按钮，只显示未上传的文件类型
      const availableTypes = Object.keys(this.uploadedFiles).filter(type => !this.uploadedFiles[type]);
      
      availableTypes.forEach(type => {
        const config = buttonConfigs[type];
        if (config) {
          const btn = DOM.create('button', {
            className: `file-type-btn ${config.className}`
          }, config.text);
          btn.style.cssText = `
            padding: 15px 20px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            font-size: 14px;
            transition: all 0.3s ease;
            background: ${config.color};
            color: white;
          `;
          btn.addEventListener('mouseenter', () => {
            btn.style.transform = 'translateY(-2px)';
            btn.style.boxShadow = `0 6px 20px ${config.color}20`;
          });
          btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translateY(0)';
            btn.style.boxShadow = 'none';
          });
          btn.addEventListener('click', () => {
            document.body.removeChild(modal);
            resolve(type);
          });
          buttonContainer.appendChild(btn);
        }
      });
      
      
      const cancelBtn = DOM.create('button', {
        className: 'file-type-btn cancel'
      }, '取消');
      cancelBtn.style.cssText = `
        padding: 15px 20px;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 600;
        font-size: 14px;
        transition: all 0.3s ease;
        background: var(--error-color);
        color: white;
        grid-column: 1 / -1;
        margin-top: 10px;
      `;
      
      cancelBtn.addEventListener('mouseenter', () => {
        cancelBtn.style.transform = 'translateY(-2px)';
        cancelBtn.style.boxShadow = '0 6px 20px rgba(255, 0, 110, 0.4)';
      });
      
      cancelBtn.addEventListener('mouseleave', () => {
        cancelBtn.style.transform = 'translateY(0)';
        cancelBtn.style.boxShadow = 'none';
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
      
      // 创建标题
      const title = DOM.create('h3', {}, titleText);
      title.style.cssText = `
        margin-bottom: 20px;
        color: var(--text-primary, #ffffff);
        text-align: center;
        font-size: 18px;
        font-weight: 600;
      `;
      
      // 组装对话框
      buttonContainer.appendChild(cancelBtn);
      
      dialog.appendChild(title);
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
      const response = await fetch(this.options.uploadEndpoint, {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const blob = await response.blob();
        // 处理文件下载响应（如果需要）
        // 例如：触发文件下载或处理响应数据
        this.uploadedFiles[fileType] = URL.createObjectURL(blob);
        const pathInput = DOM.find(`#${fileType}_path`);
        if (pathInput) {
          pathInput.value = URL.createObjectURL(blob);
        }

        this.updateFileItemUI(file, fileType, 'uploaded');
        notify.success(`文件 "${file.name}" 上传成功`);
      } else {
        let errorMessage;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          try {
            const errorObj = await response.json();
            errorMessage = errorObj.error || '上传失败';
          } catch (e) {
            errorMessage = await response.text() || '上传失败';
          }
        } else {
          errorMessage = await response.text() || '上传失败';
        }
        throw new Error(errorMessage);
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
    } else if (status === 'analyzing') {
      nameSpan.innerHTML = `${this.getFileTypeName(fileType)}: 正在分析文件内容${helpIconHTML}`;
      progressSpan.textContent = '分析中...';
    } else if (status === 'empty') {
      const hint = this.options.fileTypeHints[fileType] || '';
      nameSpan.innerHTML = `${this.getFileTypeName(fileType)}：等待上传（${hint}）${helpIconHTML}`;
      progressSpan.textContent = '未上传';
    } else if (status === 'optional') {
      const hint = this.options.fileTypeHints[fileType] || '';
      nameSpan.innerHTML = `${this.getFileTypeName(fileType)}：等待上传（${hint}）${helpIconHTML}`;
      progressSpan.textContent = '未上传（可选）';
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
      // 库存报告为可选，不显示为empty状态
      if (fileType === 'inventory_report') {
        this.updateFileItemUI(null, fileType, 'optional');
      } else {
        this.updateFileItemUI(null, fileType, 'empty');
      }
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
    const allRequiredUploaded = this.requiredFileTypes.every(key => this.uploadedFiles[key]);

    if (this.submitBtn) {
      this.submitBtn.disabled = !allRequiredUploaded;

      if (allRequiredUploaded) {
        this.submitBtn.textContent = this.options.isDailyReport ? '生成日报' : '生成产品分析';
      } else {
        this.submitBtn.textContent = '请等待必填文件上传完成';
      }
    }

    // 如果必填文件都已上传，设置拖拽区域为completed状态
    if (allRequiredUploaded && this.dropArea) {
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
