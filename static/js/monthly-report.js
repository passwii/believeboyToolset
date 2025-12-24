/**
 * 月报表单专用JavaScript模块
 * 处理月报表单的重置逻辑
 */

class MonthlyReportFormHandler {
  constructor() {
    this.form = null;
    this.isInitialized = false;
    this.init();
  }

  /**
   * 初始化月报表单处理器
   */
  init() {
    if (this.isInitialized) return;

    this.form = document.getElementById('monthly-report-form');
    if (!this.form) {
      console.warn('月报表单未找到');
      return;
    }

    this.bindEvents();
    this.isInitialized = true;
    console.log('月报表单处理器已初始化');
  }

  /**
   * 绑定事件监听器
   */
  bindEvents() {
    // 监听表单提交成功事件
    this.form.addEventListener('submit', (e) => {
      this.handleFormSubmit(e);
    });

    // 监听页面显示事件，确保每次进入页面时表单都是干净的
    window.addEventListener('pageshow', (event) => {
      if (event.persisted || (performance.navigation && performance.navigation.type === 2)) {
        // 页面从缓存恢复或重新加载时重置表单
        this.resetForm();
      }
    });

    // 监听导航事件，确保切换到其他页面再回来时表单是干净的
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        // 页面变为可见时检查表单状态
        this.checkAndResetFormIfNeeded();
      }
    });
  }

  /**
   * 处理表单提交
   */
  async handleFormSubmit(e) {
    // 这里可以添加额外的提交前验证逻辑
    console.log('月报表单提交处理中...');
  }

  /**
   * 重置月报表单
   */
  resetForm() {
    try {
      if (!this.form) return;

      // 重置项目名称选择框
      const projectNameSelect = document.getElementById('project_name');
      if (projectNameSelect) {
        projectNameSelect.value = '';
      }

      // 重置报表日期选择框
      const reportDateSelect = document.getElementById('report_date');
      if (reportDateSelect) {
        reportDateSelect.value = '';
      }

      // 重置文件输入框
      const fileInput = this.form.querySelector('input[type="file"]');
      if (fileInput) {
        // 清除文件选择
        fileInput.value = '';
        
        // 如果有文件列表，清空文件列表
        const fileList = this.form.querySelector('#file-list');
        if (fileList) {
          fileList.innerHTML = '';
        }
      }

      // 清除任何错误消息
      const errorMessages = this.form.querySelectorAll('.flash-error, .error-message, .alert');
      errorMessages.forEach(error => {
        if (error.parentNode) {
          error.parentNode.removeChild(error);
        }
      });

      // 清除通知消息
      const notifications = document.querySelectorAll('.notification, .flash-message');
      notifications.forEach(notification => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      });

      // 清除文件上传组件的状态（如果有）
      if (window.app && window.app.components && window.app.components.fileUpload) {
        try {
          window.app.components.fileUpload.reset();
        } catch (error) {
          console.warn('文件上传组件重置失败:', error);
        }
      }

      // 重新启用提交按钮
      const submitBtn = this.form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = false;
        // 恢复按钮文本为默认（如果按钮文本被改变）
        if (submitBtn.dataset.originalText) {
          submitBtn.innerHTML = submitBtn.dataset.originalText;
        }
      }

      console.log('月报表单已重置');
    } catch (error) {
      console.error('重置月报表单时出错:', error);
    }
  }

  /**
   * 检查并重置表单（如果需要）
   */
  checkAndResetFormIfNeeded() {
    try {
      if (!this.form) return;

      // 检查表单是否有值
      const projectNameSelect = document.getElementById('project_name');
      const reportDateSelect = document.getElementById('report_date');
      const fileInput = this.form.querySelector('input[type="file"]');

      const hasValues = (
        projectNameSelect && projectNameSelect.value !== '' ||
        reportDateSelect && reportDateSelect.value !== '' ||
        fileInput && fileInput.value !== ''
      );

      // 检查是否有文件列表内容
      const fileList = this.form.querySelector('#file-list');
      const hasFileListContent = fileList && fileList.innerHTML.trim() !== '';

      // 如果有值或文件列表有内容，则重置表单
      if (hasValues || hasFileListContent) {
        console.log('检测到表单有残留数据，正在重置...');
        this.resetForm();
      }
    } catch (error) {
      console.error('检查表单状态时出错:', error);
    }
  }

  /**
   * 手动触发表单重置（供外部调用）
   */
  static resetForm() {
    if (window.monthlyReportFormHandler) {
      window.monthlyReportFormHandler.resetForm();
    } else {
      console.warn('月报表单处理器未初始化');
    }
  }
}

// 创建全局实例
let monthlyReportFormHandler = null;

// 初始化函数
function initMonthlyReportFormHandler() {
  if (!monthlyReportFormHandler) {
    monthlyReportFormHandler = new MonthlyReportFormHandler();
    window.monthlyReportFormHandler = monthlyReportFormHandler;
  }
  return monthlyReportFormHandler;
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  initMonthlyReportFormHandler();
});

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    MonthlyReportFormHandler,
    initMonthlyReportFormHandler,
    getHandler: () => monthlyReportFormHandler
  };
}

// 挂载到全局
if (typeof window !== 'undefined') {
  window.MonthlyReportFormHandler = MonthlyReportFormHandler;
  window.initMonthlyReportFormHandler = initMonthlyReportFormHandler;
  window.getMonthlyReportFormHandler = () => monthlyReportFormHandler;
}