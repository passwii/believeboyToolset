/**
 * 统一文件上传组件
 * 支持多种分析页面的文件上传和自动分类
 */

// 文件类型配置常量
const FILE_TYPES = {
  // 业务报告
  business_report: {
    name: '业务报告',
    extensions: ['csv'],
    hint: '.csv格式',
    contentType: 'text/csv',
    color: '#00d4ff',
    icon: 'fa-chart-line'
  },

  // 付款报告
  payment_report: {
    name: '付款报告',
    extensions: ['csv'],
    hint: '.csv格式',
    contentType: 'text/csv',
    color: '#00ff88',
    icon: 'fa-credit-card'
  },

  // 广告报表（日报和产品分析通用）
  ad_report: {
    name: '广告报表',
    extensions: ['xlsx'],
    hint: '.xlsx格式',
    contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    color: '#ffaa00',
    icon: 'fa-ad'
  },

  // FBA库存（日报和产品分析通用）
  fba_report: {
    name: 'FBA库存',
    extensions: ['txt'],
    hint: '.txt格式，内容包含"snapshot-date"',
    contentType: 'text/plain',
    color: '#00ff88',
    icon: 'fa-warehouse'
  },

  // 所有订单（日报）
  sales_report: {
    name: '所有订单',
    extensions: ['txt'],
    hint: '.txt格式，内容包含"amazon-order-id"',
    contentType: 'text/plain',
    color: '#00d4ff',
    icon: 'fa-shopping-cart'
  },

  // 优麦云报告
  yumai_report: {
    name: '优麦云报表',
    extensions: ['xlsx'],
    hint: '.xlsx格式',
    contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    color: '#00d4ff',
    icon: 'fa-chart-bar'
  }
};

// 页面配置
const PAGE_CONFIGS = {
  daily_report: {
    fileTypes: ['sales_report', 'fba_report', 'ad_report'],
    required: ['sales_report', 'fba_report', 'ad_report'],
    optional: [],
    uploadEndpoint: '/dataset/daily-report/upload-file',
    submitText: '生成日报'
  },

  monthly_report: {
    fileTypes: ['payment_report'],
    required: ['payment_report'],
    optional: [],
    uploadEndpoint: '/dataset/monthly-report/upload-file',
    submitText: '生成月报'
  },

  product_analysis: {
    fileTypes: ['business_report', 'payment_report', 'ad_report', 'fba_report'],
    required: ['business_report', 'payment_report', 'ad_report'],
    optional: ['fba_report'],
    uploadEndpoint: '/dataset/product-analysis/upload-file',
    submitText: '生成产品分析'
  },

  product_analysis_yumai: {
    fileTypes: ['yumai_report', 'fba_report'],
    required: ['yumai_report'],
    optional: ['fba_report'],
    uploadEndpoint: '/yumai-analysis/upload-file',
    submitText: '生成商品分析（优麦云）'
  }
};

// 文件类型检测规则
const FILE_TYPE_RULES = {
  sales_report: {
    contentTest: async (file, content) => {
      if (!file.name.toLowerCase().endsWith('.txt')) return false;
      const firstLine = content.split('\n')[0];
      return firstLine && firstLine.includes('amazon-order-id');
    },
    fallbackTest: (filename) => filename.startsWith('or')
  },

  fba_report: {
    contentTest: async (file, content) => {
      if (!file.name.toLowerCase().endsWith('.txt')) return false;
      const firstLine = content.split('\n')[0];
      return firstLine && firstLine.includes('snapshot-date');
    },
    fallbackTest: (filename) => filename.includes('fba') || filename.includes('inv')
  },

  ad_report: {
    contentTest: async (file) => {
      return file.name.toLowerCase().endsWith('.xlsx');
    },
    fallbackTest: (filename, ext) => {
      return ext === 'xlsx' && (
        filename.includes('ad') ||
        filename.includes('广告') ||
        filename.includes('advertising') ||
        filename.includes('推广')
      );
    }
  },

  business_report: {
    test: (filename, ext) => {
      return ext === 'csv' && (filename.includes('business') || filename.includes('业务'));
    }
  },

  payment_report: {
    test: (filename, ext) => {
      return ext === 'csv' && (
        filename.includes('transaction') ||
        filename.includes('付款') ||
        filename.includes('payment')
      );
    }
  },

  yumai_report: {
    test: (filename, ext) => ext === 'xlsx'
  }
};

class FileUploadComponent {
  constructor(options = {}) {
    // 合并配置
    this.options = {
      containerSelector: '#drop-area',
      inputSelector: '#file',
      listSelector: '#file-list',
      submitSelector: '#submit-btn',
      pageType: null, // daily_report, monthly_report, product_analysis, product_analysis_yumai
      allowedTypes: ['csv', 'xlsx', 'txt'],
      maxFileSize: 50 * 1024 * 1024, // 50MB
      allowMultiple: true,
      ...options
    };

    // 获取页面配置
    this.pageConfig = this.options.pageType ? PAGE_CONFIGS[this.options.pageType] : null;

    // 如果没有指定页面类型，使用旧版本的兼容逻辑
    if (!this.pageConfig) {
      this.initLegacyMode();
    } else {
      this.initModernMode();
    }

    this.init();
  }

  /**
   * 初始化现代模式（推荐）
   */
  initModernMode() {
    this.uploadedFiles = {};
    this.pageConfig.fileTypes.forEach(type => {
      this.uploadedFiles[type] = null;
    });
    this.requiredFileTypes = this.pageConfig.required;
    this.uploadEndpoint = this.pageConfig.uploadEndpoint;
    this.submitText = this.pageConfig.submitText;
  }

  /**
   * 初始化旧版模式（向后兼容）
   */
  initLegacyMode() {
    // 判断是否为日报模式
    if (this.options.isDailyReport) {
      this.uploadedFiles = {
        sales_report: null,
        fba_report: null,
        ad_report: null
      };
      this.requiredFileTypes = ['sales_report', 'fba_report', 'ad_report'];
      this.uploadEndpoint = '/dataset/daily-report/upload-file';
      this.submitText = '生成日报';
    } else {
      this.uploadedFiles = {
        business_report: null,
        payment_report: null,
        ad_product_report: null,
        inventory_report: null
      };
      this.requiredFileTypes = ['business_report', 'payment_report', 'ad_product_report'];
      this.uploadEndpoint = '/yumai-analysis/process';
      this.submitText = '生成产品分析';
    }
  }

  /**
   * 初始化组件
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
    if (!this.fileInput) return;

    // 处理文件选择
    this.fileInput.addEventListener('change', this.handleFileSelect.bind(this));

    // 设置拖拽区域事件
    if (this.dropArea) {
      this.dropArea.addEventListener('dragover', this.preventDefaults.bind(this));
      this.dropArea.addEventListener('dragleave', this.unhighlight.bind(this));
      this.dropArea.addEventListener('dragenter', this.highlight.bind(this));
      this.dropArea.addEventListener('drop', this.handleDrop.bind(this));

      // 点击拖拽区域触发文件选择
      this.dropArea.addEventListener('click', () => {
        this.fileInput.click();
      });
    }

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
    e.preventDefault();
    e.stopPropagation();
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
    
    console.log(`[DEBUG] 文件识别: filename=${file.name}, ext=${ext}`);
    console.log(`[DEBUG] 当前页面需要的文件类型: ${Object.keys(this.uploadedFiles)}`);

    // 遍历所有已注册的文件类型规则
    for (const [type, rule] of Object.entries(FILE_TYPE_RULES)) {
      // 检查是否为当前页面需要的类型
      if (!this.uploadedFiles.hasOwnProperty(type)) {
        console.log(`[DEBUG] 跳过类型 ${type}: 不在当前页面需要的类型中`);
        continue;
      }

      let continueToFallback = true;

      // 1. 优先使用内容检测
      if (rule.contentTest) {
        try {
          // 只有当文件扩展名匹配时才进行内容检测和更新UI
          const fileExt = file.name.split('.').pop().toLowerCase();
          const expectedExts = FILE_TYPES[type]?.extensions || [];
          if (expectedExts.includes(fileExt)) {
            this.updateFileItemUI(file, type, 'analyzing');
            const content = await this.readFileContent(file);
            if (await rule.contentTest(file, content)) {
              console.log(`[DEBUG] 类型 ${type}: 内容检测通过`);
              if (!this.uploadedFiles[type] || await this.confirmReplace(file, type)) {
                return type;
              }
              continueToFallback = false;
            }
          } else {
            console.log(`[DEBUG] 跳过类型 ${type}: 文件扩展名 ${fileExt} 不匹配期望的 ${expectedExts.join(', ')}`);
          }
        } catch (error) {
          console.warn(`Content test for ${type} failed, will try fallback. Error: ${error}`);
        }
      }

      // 2. 尝试回退测试
      if (continueToFallback) {
        const fallbackTest = rule.fallbackTest || rule.test;
        if (fallbackTest) {
          const testResult = fallbackTest(filename, ext);
          console.log(`[DEBUG] 类型 ${type}: fallbackTest(${filename}, ${ext}) = ${testResult}`);
          if (testResult) {
            if (!this.uploadedFiles[type] || await this.confirmReplace(file, type)) {
              console.log(`[DEBUG] 返回类型: ${type}`);
              return type;
            }
          }
        }
      }
    }

    // 如果没有规则匹配，显示手动选择对话框
    console.log(`[DEBUG] 没有规则匹配，显示手动选择对话框`);
    return await this.showFileTypeSelectionDialog(file);
  }

  /**
   * 确认是否替换已上传的文件
   */
  async confirmReplace(file, fileType) {
    const fileConfig = FILE_TYPES[fileType];
    const typeName = fileConfig ? fileConfig.name : fileType;
    return await notify.confirm(`文件 "${file.name}" 将替换已上传的${typeName}，是否继续？`);
  }

  /**
   * 显示文件类型选择对话框
   */
  async showFileTypeSelectionDialog(file) {
    const availableTypes = Object.keys(this.uploadedFiles).filter(type => !this.uploadedFiles[type]);

    return new Promise((resolve) => {
      const modal = DOM.create('div', { className: 'file-type-modal' });
      const dialog = DOM.create('div', { className: 'file-type-dialog' });

      // 设置样式
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
      const fileInfo = DOM.create('div', { className: 'file-info' });
      fileInfo.innerHTML = `
        <p style="margin: 8px 0; color: var(--text-primary, #ffffff);"><strong>文件名：</strong>${file.name}</p>
        <p style="margin: 8px 0; color: var(--text-primary, #ffffff);"><strong>文件大小：</strong>${StringUtils.formatFileSize(file.size)}</p>
        <p style="margin: 8px 0; color: var(--text-secondary, #aaa);"><strong>文件类型：</strong>无法自动识别，请手动选择</p>
      `;

      // 按钮容器
      const buttonContainer = DOM.create('div', { className: 'file-type-buttons' });
      buttonContainer.style.cssText = `
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        gap: 12px;
        margin-top: 20px;
      `;

      // 创建按钮
      availableTypes.forEach(type => {
        const config = FILE_TYPES[type];
        if (config) {
          const btn = DOM.create('button', {
            className: `file-type-btn`,
            style: `
              padding: 15px 20px;
              border: none;
              border-radius: 8px;
              cursor: pointer;
              font-weight: 600;
              font-size: 14px;
              transition: all 0.3s ease;
              background: ${config.color};
              color: white;
            `
          }, `${config.name}${config.optional ? ' (可选)' : ''}`);

          btn.addEventListener('mouseenter', () => {
            btn.style.transform = 'translateY(-2px)';
            btn.style.boxShadow = `0 6px 20px ${config.color}40`;
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

      // 取消按钮
      const cancelBtn = DOM.create('button', {
        className: 'file-type-btn cancel',
        style: `
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
        `
      }, '取消');

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
      const title = DOM.create('h3', {
        style: `
          margin-bottom: 20px;
          color: var(--text-primary, #ffffff);
          text-align: center;
          font-size: 18px;
          font-weight: 600;
        `
      }, '请选择文件类型');

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
      const response = await fetch(this.uploadEndpoint, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          this.uploadedFiles[fileType] = result.file_path;
          const pathInput = DOM.find(`#${fileType}_path`);
          if (pathInput) {
            pathInput.value = result.file_path;
          }
          this.updateFileItemUI(file, fileType, 'uploaded');
          notify.success(`文件 "${file.name}" 上传成功`);
        } else {
          throw new Error(result.error || '上传成功但服务器返回错误');
        }
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

    const fileConfig = FILE_TYPES[fileType];
    const fileName = file ? file.name : (fileConfig ? fileConfig.name : fileType);
    const fileSize = file ? ` (${StringUtils.formatFileSize(file.size)})` : '';

    fileItem.className = `file-item ${status}`;

    const nameSpan = fileItem.querySelector('span:first-child');
    const progressSpan = fileItem.querySelector('.upload-progress');

    // 保留帮助图标
    const helpIcon = nameSpan?.querySelector('.help-icon');
    const helpIconHTML = helpIcon ? helpIcon.outerHTML : '';

    if (!nameSpan) return;

    if (status === 'uploading') {
      nameSpan.innerHTML = `${fileName}${fileSize}${helpIconHTML}`;
      if (progressSpan) progressSpan.textContent = '上传中...';
    } else if (status === 'uploaded') {
      nameSpan.innerHTML = `${fileName}${fileSize}${helpIconHTML}`;
      if (progressSpan) progressSpan.textContent = '';
    } else if (status === 'error') {
      nameSpan.innerHTML = `${fileName}${fileSize}${helpIconHTML}`;
      if (progressSpan) progressSpan.textContent = `✗ 上传失败: ${errorMessage}`;
    } else if (status === 'analyzing') {
      nameSpan.innerHTML = `正在分析文件内容${helpIconHTML}`;
      if (progressSpan) progressSpan.textContent = '分析中...';
    } else if (status === 'empty') {
      const hint = fileConfig ? fileConfig.hint : '';
      nameSpan.innerHTML = `${fileConfig ? fileConfig.name : fileType}：等待上传（${hint}）${helpIconHTML}`;
      if (progressSpan) progressSpan.textContent = '未上传';
    } else if (status === 'optional') {
      const hint = fileConfig ? fileConfig.hint : '';
      nameSpan.innerHTML = `${fileConfig ? fileConfig.name : fileType}：等待上传（${hint}）${helpIconHTML}`;
      if (progressSpan) progressSpan.textContent = '未上传（可选）';
    }

    // 添加或更新删除按钮
    let removeBtn = fileItem.querySelector('.remove-file');
    if (status === 'uploaded') {
      if (!removeBtn) {
        removeBtn = DOM.create('button', {
          className: 'remove-file',
          style: `
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
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
          `
        }, '×');

        removeBtn.addEventListener('click', () => this.removeFile(fileType));
        removeBtn.addEventListener('mouseenter', () => {
          removeBtn.style.background = '#cc0055';
        });
        removeBtn.addEventListener('mouseleave', () => {
          removeBtn.style.background = 'var(--error-color)';
        });

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
    Object.keys(this.uploadedFiles).forEach(fileType => {
      const fileConfig = FILE_TYPES[fileType];
      const isOptional = this.pageConfig && this.pageConfig.optional && this.pageConfig.optional.includes(fileType);
      this.updateFileItemUI(null, fileType, isOptional ? 'optional' : 'empty');
    });
  }

  /**
   * 设置文件项事件
   */
  setupFileItemEvents() {
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

    const isOptional = this.pageConfig && this.pageConfig.optional && this.pageConfig.optional.includes(fileType);
    this.updateFileItemUI(null, fileType, isOptional ? 'optional' : 'empty');
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

      const isOptional = this.pageConfig && this.pageConfig.optional && this.pageConfig.optional.includes(key);
      this.updateFileItemUI(null, key, isOptional ? 'optional' : 'empty');
    });

    if (this.submitBtn) {
      this.submitBtn.disabled = true;
    }

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
        this.submitBtn.textContent = this.submitText;
      } else {
        this.submitBtn.textContent = '请等待必填文件上传完成';
      }
    }

    // 设置拖拽区域状态
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

  /**
   * 销毁组件
   */
  destroy() {
    if (this.fileInput) {
      this.fileInput.removeEventListener('change', this.handleFileSelect.bind(this));
    }

    if (this.dropArea) {
      this.dropArea.removeEventListener('dragover', this.preventDefaults.bind(this));
      this.dropArea.removeEventListener('dragleave', this.unhighlight.bind(this));
      this.dropArea.removeEventListener('dragenter', this.highlight.bind(this));
      this.dropArea.removeEventListener('drop', this.handleDrop.bind(this));
    }
  }
}

// 导出配置和类
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    FileUploadComponent,
    FILE_TYPES,
    PAGE_CONFIGS,
    FILE_TYPE_RULES
  };
}

// 挂载到全局
if (typeof window !== 'undefined') {
  window.FileUploadComponent = FileUploadComponent;
  window.FILE_TYPES = FILE_TYPES;
  window.PAGE_CONFIGS = PAGE_CONFIGS;
  window.FILE_TYPE_RULES = FILE_TYPE_RULES;
}