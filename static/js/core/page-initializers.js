/**
 * 页面初始化器模块
 * 集中管理各个页面的初始化逻辑
 */

class PageInitializers {
  constructor(app) {
    this.app = app;
  }

  /**
   * 根据内容类型初始化页面
   */
  initPage(contentType) {
    const initializerMap = {
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

    const initializer = initializerMap[contentType];
    if (initializer && typeof initializer === 'function') {
      setTimeout(() => {
        try {
          initializer();
        } catch (error) {
          console.error(`初始化页面 ${contentType} 失败:`, error);
        }
      }, LOADING_CONFIG.contentInitDelay);
    }
  }

  /**
   * 初始化日报页面
   */
  initializeDailyReport() {
    console.log('初始化日报页面');

    // 检查必要的依赖
    console.log('FileUploadComponent 是否存在:', typeof FileUploadComponent);
    console.log('LOADING_CONFIG 是否存在:', typeof LOADING_CONFIG);

    this.initializeYesterdayButton('yesterday-btn', 'report_date');
    this.initializeDailyReportFileUpload();
    this.setupFormSubmission('daily-report-form', '日报');
  }

  /**
   * 初始化日报文件上传组件
   */
  initializeDailyReportFileUpload() {
    const tryInit = (retryCount = 1) => {
      console.log(`尝试初始化文件上传组件 (第${retryCount}次)`);

      try {
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
          console.warn('缺少必要的DOM元素，重试中...');
          if (retryCount < LOADING_CONFIG.retryCount) {
            setTimeout(() => tryInit(retryCount + 1), 1000);
          } else {
            console.error('达到最大重试次数，文件上传组件初始化失败');
          }
          return;
        }

        if (typeof FileUploadComponent !== 'undefined') {
          console.log('FileUploadComponent存在，开始创建实例...');
          this.app.components.fileUpload = new FileUploadComponent({
            containerSelector: '#drop-area',
            inputSelector: '#file-input',
            listSelector: '#file-list',
            submitSelector: '#submit-btn',
            pageType: 'daily_report',
            allowedTypes: ['txt', 'xlsx']
          });

          console.log('日报文件上传组件已初始化');
        } else {
          console.error('FileUploadComponent 未定义');
        }
      } catch (error) {
        console.error('文件上传组件初始化失败:', error);
        if (retryCount < LOADING_CONFIG.retryCount) {
          setTimeout(() => tryInit(retryCount + 1), 1000);
        }
      }
    };

    tryInit();
  }

  /**
   * 初始化月报页面
   */
  initializeMonthlyReport() {
    console.log('初始化月报页面');
    this.setupFormSubmission('monthly-report-form', '月报');
    this.initializeMonthlyReportFileUpload();
  }

  /**
   * 初始化月报文件上传组件
   */
  initializeMonthlyReportFileUpload() {
    const tryInit = (retryCount = 1) => {
      console.log(`尝试初始化月报文件上传组件 (第${retryCount}次)`);

      try {
        const dropArea = DOM.find('#drop-area');
        const fileInput = DOM.find('#file-input');
        const fileList = DOM.find('#file-list');
        const submitBtn = DOM.find('#submit-btn');

        console.log('月报DOM元素检查:', {
          dropArea: !!dropArea,
          fileInput: !!fileInput,
          fileList: !!fileList,
          submitBtn: !!submitBtn
        });

        if (!dropArea || !fileInput || !fileList || !submitBtn) {
          console.warn('月报缺少必要的DOM元素，重试中...');
          if (retryCount < LOADING_CONFIG.retryCount) {
            setTimeout(() => tryInit(retryCount + 1), 1000);
          } else {
            console.error('月报达到最大重试次数，文件上传组件初始化失败');
          }
          return;
        }

        if (typeof FileUploadComponent !== 'undefined') {
          console.log('月报FileUploadComponent存在，开始创建实例...');
          this.app.components.fileUpload = new FileUploadComponent({
            containerSelector: '#drop-area',
            inputSelector: '#file-input',
            listSelector: '#file-list',
            submitSelector: '#submit-btn',
            pageType: 'monthly_report',
            allowedTypes: ['csv']
          });

          console.log('月报文件上传组件已初始化');
        } else {
          console.error('FileUploadComponent 未定义');
        }
      } catch (error) {
        console.error('月报文件上传组件初始化失败:', error);
        if (retryCount < LOADING_CONFIG.retryCount) {
          setTimeout(() => tryInit(retryCount + 1), 1000);
        }
      }
    };

    tryInit();
  }

  /**
   * 初始化产品分析页面
   */
  initializeProductAnalysis() {
    console.log('初始化产品分析页面');

    const tryInit = (retryCount = 1) => {
      console.log(`尝试初始化产品分析文件上传组件 (第${retryCount}次)`);

      try {
        const dropArea = DOM.find('#drop-area');
        const fileInput = DOM.find('#file-input');
        const fileList = DOM.find('#file-list');
        const submitBtn = DOM.find('#submit-btn');

        console.log('产品分析DOM元素检查:', {
          dropArea: !!dropArea,
          fileInput: !!fileInput,
          fileList: !!fileList,
          submitBtn: !!submitBtn
        });

        if (!dropArea || !fileInput || !fileList || !submitBtn) {
          console.warn('产品分析缺少必要的DOM元素，重试中...');
          if (retryCount < LOADING_CONFIG.retryCount) {
            setTimeout(() => tryInit(retryCount + 1), 1000);
          } else {
            console.error('产品分析达到最大重试次数，文件上传组件初始化失败');
          }
          return;
        }

        if (typeof FileUploadComponent !== 'undefined') {
          console.log('产品分析FileUploadComponent存在，开始创建实例...');
          this.app.components.fileUpload = new FileUploadComponent({
            containerSelector: '#drop-area',
            inputSelector: '#file-input',
            listSelector: '#file-list',
            submitSelector: '#submit-btn',
            pageType: 'product_analysis',
            allowedTypes: ['csv', 'xlsx', 'txt']
          });

          console.log('产品分析文件上传组件已初始化');
        } else {
          console.error('FileUploadComponent 未定义');
        }

        this.initializeLastWeekButton();
        this.setupFormSubmission('analysis-form', '产品分析');
      } catch (error) {
        console.error('产品分析文件上传组件初始化失败:', error);
        if (retryCount < LOADING_CONFIG.retryCount) {
          setTimeout(() => tryInit(retryCount + 1), 1000);
        }
      }
    };

    tryInit();
  }

  /**
   * 初始化优麦云商品分析页面
   */
  initializeYumaiAnalysis() {
    console.log('初始化优麦云商品分析页面');

    try {
      if (typeof FileUploadComponent !== 'undefined') {
        this.app.components.fileUpload = new FileUploadComponent({
          containerSelector: '.file-upload-container',
          inputSelector: '#file-input',
          listSelector: '#file-list',
          submitSelector: '#submit-btn',
          pageType: 'product_analysis_yumai',
          allowedTypes: ['xlsx', 'txt']
        });
      }

      this.initializeLastWeekButton();
      this.initializeYesterdayButton('yesterday-btn', null, true);
      this.setupFormSubmission('yumai-analysis-form', '商品分析（优麦云）');
    } catch (error) {
      console.error('初始化优麦云商品分析页面失败:', error);
    }
  }

  /**
   * 初始化运营总览页面
   */
  initializeOperationsOverview() {
    console.log('初始化运营总览页面');
    this.initializeTimelineInteractions();
  }

  /**
   * 初始化时间轴交互
   */
  initializeTimelineInteractions() {
    const timelineMarkers = DOM.findAll('.timeline-marker');
    timelineMarkers.forEach(marker => {
      marker.addEventListener('click', (e) => this.handleTimelineMarkerClick(e.currentTarget));
    });

    const taskItems = DOM.findAll('.task-item');
    taskItems.forEach(item => {
      item.addEventListener('click', (e) => this.handleTaskItemClick(e.currentTarget));
    });

    this.animateProgressBar();
  }

  /**
   * 处理时间轴标记点击
   */
  handleTimelineMarkerClick(marker) {
    const allMarkers = DOM.findAll('.timeline-marker');
    allMarkers.forEach(m => m.classList.remove('active'));
    marker.classList.add('active');

    const timelineItem = marker.closest('.timeline-item');
    const timelineSection = timelineItem?.querySelector('.timeline-section');

    if (timelineSection) {
      DOM.findAll('.timeline-section').forEach(section => {
        section.classList.remove('highlighted');
      });
      timelineSection.classList.add('highlighted');

      timelineSection.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }

  /**
   * 处理任务项点击
   */
  handleTaskItemClick(taskItem) {
    const taskName = taskItem.querySelector('.task-name')?.textContent;
    const taskStatus = taskItem.querySelector('.task-status')?.textContent;

    if (taskName && taskStatus) {
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

    notify.info(message);
  }

  /**
   * 动画化进度条
   */
  animateProgressBar() {
    const progressFill = DOM.find('.progress-fill');
    if (progressFill) {
      setTimeout(() => {
        progressFill.style.width = '15%';
      }, 500);
    }
  }

  /**
   * 初始化运营导航页面
   */
  initializeOperationsNav() {
    console.log('初始化运营导航页面');
  }

  /**
   * 初始化店铺导航页面
   */
  initializeShopNav() {
    console.log('初始化店铺导航页面');
  }

  /**
   * 初始化运营信息页面
   */
  initializeOperationsInfo() {
    console.log('初始化运营信息页面');

    setTimeout(() => {
      try {
        if (typeof Dashboard !== 'undefined') {
          this.app.components.dashboard = new Dashboard({
            autoRefresh: true,
            refreshInterval: 5 * 60 * 1000,
            apiEndpoint: '/api/statistics'
          });

          this.app.components.dashboard.loadStatistics();
        }
      } catch (error) {
        console.error('初始化仪表板失败:', error);
      }
    }, 50);
  }

  /**
   * 初始化用户管理页面
   */
  initializeUserManagement() {
    console.log('初始化用户管理页面');

    try {
      if (typeof UserManagementComponent !== 'undefined') {
        this.app.components.userManagement = new UserManagementComponent({
          addEndpoint: '/admin/users/add',
          deleteEndpoint: '/admin/users/delete',
          listEndpoint: '/admin/users',
          checkUsernameEndpoint: '/admin/users/check-username'
        });
      }
    } catch (error) {
      console.error('初始化用户管理页面失败:', error);
    }
  }

  /**
   * 初始化日志管理页面
   */
  initializeLogManagement() {
    console.log('初始化日志管理页面');
  }

  /**
   * 初始化更新日志页面
   */
  initializeUpdateLog() {
    console.log('初始化更新日志页面');
  }

  /**
   * 初始化店铺管理页面
   */
  initializeShopManagement() {
    console.log('初始化店铺管理页面');

    try {
      if (typeof ShopManagementComponent !== 'undefined') {
        this.app.components.shopManagement = new ShopManagementComponent({
          addEndpoint: '/admin/shops/add',
          updateEndpoint: '/admin/shops/update',
          deleteEndpoint: '/admin/shops/delete',
          checkNameEndpoint: '/admin/shops/check-name',
          listEndpoint: '/admin/shops/list'
        });
      }
    } catch (error) {
      console.error('初始化店铺管理页面失败:', error);
    }
  }

  /**
   * 初始化更改密码页面
   */
  initializeChangePassword() {
    console.log('初始化更改密码页面');

    const form = DOM.find('.change-password-embed form');
    const newPassword = DOM.find('#new_password');
    const confirmPassword = DOM.find('#confirm_password');

    if (form && newPassword && confirmPassword) {
      form.addEventListener('submit', (e) => {
        if (newPassword.value !== confirmPassword.value) {
          e.preventDefault();

          const errorDiv = DOM.create('div', {
            className: 'flash-error'
          });
          errorDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> 两次输入的新密码不一致';

          form.parentNode.insertBefore(errorDiv, form);
          errorDiv.scrollIntoView({ behavior: 'smooth' });

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
   * 初始化昨天按钮
   */
  initializeYesterdayButton(btnId, dateInputId = 'report_date', isRange = false) {
    setTimeout(() => {
      const yesterdayBtn = DOM.find(`#${btnId}`);
      console.log(`查找${btnId}:`, yesterdayBtn);

      if (yesterdayBtn) {
        const newBtn = yesterdayBtn.cloneNode(true);
        yesterdayBtn.parentNode.replaceChild(newBtn, yesterdayBtn);

        newBtn.addEventListener('click', () => {
          console.log(`${btnId}被点击`);

          try {
            const yesterday = TimeUtils.yesterday('YYYY-MM-DD');

            if (isRange) {
              const startDateInput = DOM.find('#report_start_date');
              const endDateInput = DOM.find('#report_end_date');

              if (startDateInput && endDateInput) {
                startDateInput.value = yesterday;
                endDateInput.value = yesterday;
                console.log('日期已设置为昨天:', yesterday);
              }
            } else {
              const reportDateInput = DOM.find(`#${dateInputId}`);
              if (reportDateInput) {
                reportDateInput.value = yesterday;
                console.log('日期已设置为昨天:', yesterday);
              }
            }
          } catch (error) {
            console.error('设置日期时出错:', error);
            notify.error('设置日期失败，请重试');
          }
        });

        console.log(`${btnId}事件监听器已绑定`);
      } else {
        console.error(`找不到${btnId}`);
      }
    }, 100);
  }

  /**
   * 初始化上周按钮
   */
  initializeLastWeekButton() {
    setTimeout(() => {
      const lastWeekBtn = DOM.find('#last-week-btn');
      console.log('查找上周按钮:', lastWeekBtn);

      if (lastWeekBtn) {
        const newBtn = lastWeekBtn.cloneNode(true);
        lastWeekBtn.parentNode.replaceChild(newBtn, lastWeekBtn);

        newBtn.addEventListener('click', () => {
          console.log('上周按钮被点击');

          try {
            const lastWeek = TimeUtils.lastWeek();

            const startDateInput = DOM.find('#report_start_date');
            const endDateInput = DOM.find('#report_end_date');

            if (startDateInput && endDateInput) {
              startDateInput.value = lastWeek.start;
              endDateInput.value = lastWeek.end;
              console.log('日期已设置:', lastWeek.start, '至', lastWeek.end);
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
   * 设置表单提交处理
   */
  setupFormSubmission(formId, reportType) {
    const form = DOM.find(`#${formId}`);
    if (!form) return;

    if (form.dataset.submissionHandlerAttached) {
      return;
    }
    form.dataset.submissionHandlerAttached = 'true';

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = new FormData(form);
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.innerHTML;

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

          if (this.app.components.fileUpload && typeof this.app.components.fileUpload.reset === 'function') {
            this.app.components.fileUpload.reset();
          }

          const shouldResetForm = response.headers.get('X-Form-Reset');
          if (shouldResetForm === 'true') {
            this.resetFormFields(form);
            if (window.monthlyReportFormHandler && typeof window.monthlyReportFormHandler.resetForm === 'function') {
              window.monthlyReportFormHandler.resetForm();
            }
          }

        } else {
          let errorMsg = `生成${reportType}失败`;
          try {
            const errorData = await response.json();
            if (errorData && errorData.error) {
              errorMsg = errorData.error;
            }
          } catch (err) {
            errorMsg = await response.text() || response.statusText;
          }
          throw new Error(errorMsg);
        }
      } catch (error) {
        console.error('Error:', error);
        notify.error(error.message || `生成${reportType}时发生未知错误`);
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnText;
        }
      }
    });
  }

  /**
   * 重置表单字段
   */
  resetFormFields(form) {
    if (!form) return;

    try {
      const projectNameSelect = form.querySelector('#project_name');
      if (projectNameSelect) {
        projectNameSelect.value = '';
      }

      const reportDateSelect = form.querySelector('#report_date');
      if (reportDateSelect) {
        reportDateSelect.value = '';
      }

      const fileInput = form.querySelector('input[type="file"]');
      if (fileInput) {
        fileInput.value = '';
        const fileList = form.querySelector('#file-list');
        if (fileList) {
          fileList.innerHTML = '';
        }
      }

      const errorMessages = form.querySelectorAll('.flash-error, .error-message');
      errorMessages.forEach(error => {
        if (error.parentNode) {
          error.parentNode.removeChild(error);
        }
      });

      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = false;
        if (submitBtn.dataset.originalText) {
          submitBtn.innerHTML = submitBtn.dataset.originalText;
        }
      }

      console.log('表单字段已重置');
    } catch (error) {
      console.error('重置表单字段时出错:', error);
    }
  }
}