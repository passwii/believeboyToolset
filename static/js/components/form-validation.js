/**
 * 表单验证组件
 * 统一管理表单验证功能
 */

class FormValidationComponent {
  constructor(options = {}) {
    this.options = {
      showErrorMessages: true,
      showSuccessMessages: false,
      validateOnBlur: true,
      validateOnInput: false,
      scrollToError: true,
      focusFirstError: true,
      ...options
    };

    this.validators = new Map();
    this.formValidation = new Map();
    this.init();
  }

  /**
   * 初始化组件
   */
  init() {
    this.setupDefaultValidators();
    this.setupGlobalStyles();
  }

  /**
   * 设置默认验证器
   */
  setupDefaultValidators() {
    // 必填验证
    this.validators.set('required', {
      validate: (value) => {
        if (typeof value === 'string') {
          return value.trim().length > 0;
        }
        return value != null;
      },
      message: '此字段为必填项'
    });

    // 邮箱验证
    this.validators.set('email', {
      validate: (value) => {
        if (!value) return true; // 可选字段
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
      },
      message: '请输入有效的邮箱地址'
    });

    // 手机号验证
    this.validators.set('phone', {
      validate: (value) => {
        if (!value) return true; // 可选字段
        const phoneRegex = /^1[3-9]\d{9}$/;
        return phoneRegex.test(value.replace(/\s+/g, ''));
      },
      message: '请输入有效的手机号码'
    });

    // URL验证
    this.validators.set('url', {
      validate: (value) => {
        if (!value) return true; // 可选字段
        try {
          new URL(value);
          return true;
        } catch {
          return false;
        }
      },
      message: '请输入有效的URL地址'
    });

    // 最小长度验证
    this.validators.set('minLength', {
      validate: (value, param) => {
        if (!value) return true; // 可选字段
        return value.length >= param;
      },
      message: (param) => `至少需要${param}个字符`
    });

    // 最大长度验证
    this.validators.set('maxLength', {
      validate: (value, param) => {
        if (!value) return true; // 可选字段
        return value.length <= param;
      },
      message: (param) => `不能超过${param}个字符`
    });

    // 数值范围验证
    this.validators.set('range', {
      validate: (value, param) => {
        if (!value && param.min === undefined) return true;
        const num = parseFloat(value);
        if (isNaN(num)) return false;
        if (param.min !== undefined && num < param.min) return false;
        if (param.max !== undefined && num > param.max) return false;
        return true;
      },
      message: (param) => {
        if (param.min !== undefined && param.max !== undefined) {
          return `请输入${param.min}到${param.max}之间的数值`;
        } else if (param.min !== undefined) {
          return `请输入不小于${param.min}的数值`;
        } else {
          return `请输入不大于${param.max}的数值`;
        }
      }
    });

    // 正则表达式验证
    this.validators.set('pattern', {
      validate: (value, pattern) => {
        if (!value) return true; // 可选字段
        return new RegExp(pattern).test(value);
      },
      message: '格式不正确'
    });

    // 自定义函数验证
    this.validators.set('custom', {
      validate: (value, func, element) => {
        if (!value) return true; // 可选字段
        return func(value, element);
      },
      message: '验证失败'
    });

    // 文件验证
    this.validators.set('fileType', {
      validate: (files, allowedTypes) => {
        if (!files || files.length === 0) return true;
        const file = files[0];
        const ext = file.name.split('.').pop().toLowerCase();
        return allowedTypes.includes(ext);
      },
      message: (param) => `仅支持${param.join(', ')}格式`
    });

    // 文件大小验证
    this.validators.set('fileSize', {
      validate: (files, maxSize) => {
        if (!files || files.length === 0) return true;
        const file = files[0];
        return file.size <= maxSize;
      },
      message: (param) => `文件大小不能超过${this.formatFileSize(param)}`
    });
  }

  /**
   * 设置全局样式
   */
  setupGlobalStyles() {
    if (DOM.exists('#form-validation-styles')) return;

    const styles = DOM.create('style', {
      id: 'form-validation-styles'
    });
    styles.textContent = `
      .form-field {
        margin-bottom: 20px;
      }

      .form-field.error .form-control,
      .form-field.error input,
      .form-field.error select,
      .form-field.error textarea {
        border-color: var(--error-color) !important;
        box-shadow: 0 0 5px rgba(255, 0, 110, 0.3) !important;
      }

      .form-field.success .form-control,
      .form-field.success input,
      .form-field.success select,
      .form-field.success textarea {
        border-color: var(--success-color);
        box-shadow: 0 0 5px rgba(0, 255, 136, 0.3);
      }

      .form-field .field-error {
        color: var(--error-color);
        font-size: 12px;
        margin-top: 5px;
        display: flex;
        align-items: center;
        gap: 5px;
      }

      .form-field .field-error i {
        font-size: 12px;
      }

      .form-field .field-success {
        color: var(--success-color);
        font-size: 12px;
        margin-top: 5px;
        display: flex;
        align-items: center;
        gap: 5px;
      }

      .form-field .field-success i {
        font-size: 12px;
      }

      .validation-summary {
        background: rgba(255, 0, 110, 0.1);
        border: 1px solid rgba(255, 0, 110, 0.3);
        border-radius: 8px;
        padding: 15px;
        margin-bottom: 20px;
        color: var(--text-primary);
      }

      .validation-summary ul {
        margin: 0;
        padding-left: 20px;
      }

      .validation-summary li {
        margin-bottom: 5px;
      }

      .validation-summary li:last-child {
        margin-bottom: 0;
      }

      .form-help {
        font-size: 12px;
        color: var(--text-secondary);
        margin-top: 5px;
      }

      .required-indicator {
        color: var(--error-color);
        margin-left: 3px;
      }

      .form-loading {
        position: relative;
        pointer-events: none;
        opacity: 0.7;
      }

      .form-loading::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 20px;
        height: 20px;
        margin: -10px 0 0 -10px;
        border: 2px solid var(--neon-blue);
        border-radius: 50%;
        border-top-color: transparent;
        animation: form-loading-spin 1s linear infinite;
      }

      @keyframes form-loading-spin {
        to {
          transform: rotate(360deg);
        }
      }
    `;
    document.head.appendChild(styles);
  }

  /**
   * 验证表单
   */
  validate(form, rules = {}) {
    if (!form) return { isValid: true, errors: [] };

    const errors = [];
    const fieldValidations = new Map();

    // 遍历所有规则
    for (const [fieldName, fieldRules] of Object.entries(rules)) {
      const field = form.querySelector(`[name="${fieldName}"]`) || 
                   form.querySelector(`#${fieldName}`);
      
      if (!field) continue;

      const fieldError = this.validateField(field, fieldRules);
      if (fieldError) {
        errors.push(fieldError);
        fieldValidations.set(fieldName, fieldError);
      }
    }

    // 显示验证结果
    this.showValidationResults(form, fieldValidations);

    // 滚动到第一个错误
    if (errors.length > 0 && this.options.scrollToError) {
      const firstErrorField = errors[0].field;
      this.scrollToField(firstErrorField);
    }

    // 聚焦第一个错误字段
    if (errors.length > 0 && this.options.focusFirstError) {
      errors[0].field.focus();
    }

    return {
      isValid: errors.length === 0,
      errors: errors,
      fieldValidations: fieldValidations
    };
  }

  /**
   * 验证单个字段
   */
  validateField(field, rules) {
    const value = this.getFieldValue(field);
    const fieldName = field.name || field.id;
    const fieldLabel = this.getFieldLabel(field);

    for (const [ruleName, ruleParams] of Object.entries(rules)) {
      const validator = this.validators.get(ruleName);
      if (!validator) continue;

      const isValid = validator.validate(value, ruleParams, field);
      if (!isValid) {
        const message = typeof validator.message === 'function' 
          ? validator.message(ruleParams) 
          : validator.message;

        return {
          field: field,
          fieldName: fieldName,
          fieldLabel: fieldLabel,
          rule: ruleName,
          message: message
        };
      }
    }

    return null;
  }

  /**
   * 获取字段值
   */
  getFieldValue(field) {
    if (field.type === 'checkbox') {
      return field.checked;
    } else if (field.type === 'radio') {
      const checked = field.form.querySelector(`input[name="${field.name}"]:checked`);
      return checked ? checked.value : null;
    } else if (field.type === 'file') {
      return field.files;
    } else {
      return field.value;
    }
  }

  /**
   * 获取字段标签
   */
  getFieldLabel(field) {
    const label = field.form.querySelector(`label[for="${field.id}"]`);
    if (label) {
      return label.textContent.replace(/\s*\*\s*$/, '').trim();
    }
    
    const label = field.closest('.form-group, .form-field')?.querySelector('label');
    if (label) {
      return label.textContent.replace(/\s*\*\s*$/, '').trim();
    }

    return field.name || field.id;
  }

  /**
   * 显示验证结果
   */
  showValidationResults(form, fieldValidations) {
    // 清除之前的验证状态
    this.clearValidationState(form);

    // 显示每个字段的验证结果
    for (const [fieldName, error] of fieldValidations.entries()) {
      const field = form.querySelector(`[name="${fieldName}"]`) || 
                   form.querySelector(`#${fieldName}`);
      
      if (field) {
        const fieldContainer = field.closest('.form-field, .form-group') || field.parentElement;
        
        if (error) {
          // 显示错误
          fieldContainer.classList.add('error');
          this.showFieldError(fieldContainer, error.message);
        } else {
          // 显示成功
          fieldContainer.classList.add('success');
          if (this.options.showSuccessMessages) {
            this.showFieldSuccess(fieldContainer, '验证通过');
          }
        }
      }
    }
  }

  /**
   * 显示字段错误
   */
  showFieldError(fieldContainer, message) {
    if (!this.options.showErrorMessages) return;

    // 移除之前的错误信息
    const existingError = fieldContainer.querySelector('.field-error');
    if (existingError) {
      existingError.remove();
    }

    const errorElement = DOM.create('div', {
      className: 'field-error'
    });
    errorElement.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;

    fieldContainer.appendChild(errorElement);
  }

  /**
   * 显示字段成功
   */
  showFieldSuccess(fieldContainer, message) {
    if (!this.options.showSuccessMessages) return;

    // 移除之前的成功信息
    const existingSuccess = fieldContainer.querySelector('.field-success');
    if (existingSuccess) {
      existingSuccess.remove();
    }

    const successElement = DOM.create('div', {
      className: 'field-success'
    });
    successElement.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;

    fieldContainer.appendChild(successElement);
  }

  /**
   * 清除验证状态
   */
  clearValidationState(form) {
    const fields = form.querySelectorAll('.form-field, .form-group');
    fields.forEach(fieldContainer => {
      fieldContainer.classList.remove('error', 'success');
      
      const errorElement = fieldContainer.querySelector('.field-error');
      const successElement = fieldContainer.querySelector('.field-success');
      
      if (errorElement) errorElement.remove();
      if (successElement) successElement.remove();
    });
  }

  /**
   * 滚动到字段
   */
  scrollToField(field) {
    field.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'nearest'
    });
  }

  /**
   * 为表单添加实时验证
   */
  attachRealTimeValidation(form, rules) {
    if (this.options.validateOnBlur) {
      this.addBlurValidation(form, rules);
    }

    if (this.options.validateOnInput) {
      this.addInputValidation(form, rules);
    }

    // 存储验证规则
    this.formValidation.set(form, rules);
  }

  /**
   * 添加失去焦点验证
   */
  addBlurValidation(form, rules) {
    for (const fieldName of Object.keys(rules)) {
      const field = form.querySelector(`[name="${fieldName}"]`) || 
                   form.querySelector(`#${fieldName}`);
      
      if (field) {
        field.addEventListener('blur', () => {
          const error = this.validateField(field, rules[fieldName]);
          const fieldContainer = field.closest('.form-field, .form-group') || field.parentElement;
          
          // 清除之前的验证状态
          fieldContainer.classList.remove('error', 'success');
          const errorElement = fieldContainer.querySelector('.field-error');
          const successElement = fieldContainer.querySelector('.field-success');
          
          if (errorElement) errorElement.remove();
          if (successElement) successElement.remove();

          // 显示新的验证结果
          if (error) {
            fieldContainer.classList.add('error');
            this.showFieldError(fieldContainer, error.message);
          } else if (this.options.showSuccessMessages) {
            fieldContainer.classList.add('success');
            this.showFieldSuccess(fieldContainer, '验证通过');
          }
        });
      }
    }
  }

  /**
   * 添加输入验证
   */
  addInputValidation(form, rules) {
    for (const fieldName of Object.keys(rules)) {
      const field = form.querySelector(`[name="${fieldName}"]`) || 
                   form.querySelector(`#${fieldName}`);
      
      if (field && this.shouldValidateOnInput(field)) {
        const debouncedValidate = debounce(() => {
          const error = this.validateField(field, rules[fieldName]);
          const fieldContainer = field.closest('.form-field, .form-group') || field.parentElement;
          
          // 清除之前的验证状态
          fieldContainer.classList.remove('error', 'success');
          const errorElement = fieldContainer.querySelector('.field-error');
          const successElement = fieldContainer.querySelector('.field-success');
          
          if (errorElement) errorElement.remove();
          if (successElement) successElement.remove();

          // 显示新的验证结果
          if (error) {
            fieldContainer.classList.add('error');
            this.showFieldError(fieldContainer, error.message);
          } else if (this.options.showSuccessMessages && field.value.trim()) {
            fieldContainer.classList.add('success');
            this.showFieldSuccess(fieldContainer, '验证通过');
          }
        }, 500);

        field.addEventListener('input', debouncedValidate);
      }
    }
  }

  /**
   * 检查是否应该在输入时验证
   */
  shouldValidateOnInput(field) {
    // 避免在某些字段类型上进行实时验证
    const skipTypes = ['checkbox', 'radio', 'file'];
    return !skipTypes.includes(field.type);
  }

  /**
   * 设置表单加载状态
   */
  setFormLoading(form, loading = true) {
    if (loading) {
      form.classList.add('form-loading');
      this.disableForm(form);
    } else {
      form.classList.remove('form-loading');
      this.enableForm(form);
    }
  }

  /**
   * 禁用表单
   */
  disableForm(form) {
    const elements = form.querySelectorAll('input, select, textarea, button');
    elements.forEach(el => el.disabled = true);
  }

  /**
   * 启用表单
   */
  enableForm(form) {
    const elements = form.querySelectorAll('input, select, textarea, button');
    elements.forEach(el => el.disabled = false);
  }

  /**
   * 添加验证器
   */
  addValidator(name, validator) {
    this.validators.set(name, validator);
  }

  /**
   * 移除验证器
   */
  removeValidator(name) {
    this.validators.delete(name);
  }

  /**
   * 获取字段验证规则
   */
  getFieldRules(form, fieldName) {
    const rules = this.formValidation.get(form);
    return rules ? rules[fieldName] : null;
  }

  /**
   * 手动验证字段
   */
  validateSingleField(form, fieldName) {
    const rules = this.getFieldRules(form, fieldName);
    if (!rules) return { isValid: true, error: null };

    const field = form.querySelector(`[name="${fieldName}"]`) || 
                 form.querySelector(`#${fieldName}`);
    
    if (!field) return { isValid: true, error: null };

    const error = this.validateField(field, rules);
    const fieldContainer = field.closest('.form-field, .form-group') || field.parentElement;

    // 清除之前的验证状态
    fieldContainer.classList.remove('error', 'success');
    const errorElement = fieldContainer.querySelector('.field-error');
    const successElement = fieldContainer.querySelector('.field-success');
    
    if (errorElement) errorElement.remove();
    if (successElement) successElement.remove();

    // 显示验证结果
    if (error) {
      fieldContainer.classList.add('error');
      this.showFieldError(fieldContainer, error.message);
      return { isValid: false, error };
    } else {
      fieldContainer.classList.add('success');
      if (this.options.showSuccessMessages) {
        this.showFieldSuccess(fieldContainer, '验证通过');
      }
      return { isValid: true, error: null };
    }
  }

  /**
   * 格式化文件大小
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * 销毁组件
   */
  destroy() {
    // 移除样式
    const styles = DOM.find('#form-validation-styles');
    if (styles) {
      styles.remove();
    }

    // 清理表单验证
    this.formValidation.clear();
  }
}

// 表单验证工具函数
const FormValidation = {
  /**
   * 创建表单验证组件实例
   */
  create(options) {
    return new FormValidationComponent(options);
  },

  /**
   * 快速验证表单
   */
  validateForm(form, rules) {
    const validator = new FormValidationComponent();
    return validator.validate(form, rules);
  },

  /**
   * 常用验证规则预设
   */
  rules: {
    email: { email: true },
    phone: { phone: true },
    required: { required: true },
    url: { url: true },
    minLength: (length) => ({ minLength: length }),
    maxLength: (length) => ({ maxLength: length }),
    range: (min, max) => ({ range: { min, max } }),
    password: { 
      required: true, 
      minLength: 6,
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/
    },
    username: {
      required: true,
      minLength: 3,
      maxLength: 20,
      pattern: /^[a-zA-Z0-9_]+$/
    },
    file: {
      fileType: ['csv', 'xlsx'],
      fileSize: 10 * 1024 * 1024 // 10MB
    }
  },

  /**
   * 合并验证规则
   */
  mergeRules(...ruleSets) {
    return Object.assign({}, ...ruleSets);
  },

  /**
   * 条件验证规则
   */
  conditionalRule(condition, trueRule, falseRule = {}) {
    return {
      'custom': (value, func, element) => {
        const shouldValidate = condition(value, element);
        if (shouldValidate) {
          const validator = new FormValidationComponent();
          const result = validator.validateField(element, trueRule);
          return result === null;
        } else if (Object.keys(falseRule).length > 0) {
          const validator = new FormValidationComponent();
          const result = validator.validateField(element, falseRule);
          return result === null;
        }
        return true;
      }
    };
  }
};

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    FormValidationComponent,
    FormValidation
  };
}

// 挂载到全局
if (typeof window !== 'undefined') {
  window.FormValidationComponent = FormValidationComponent;
  window.FormValidation = FormValidation;
}