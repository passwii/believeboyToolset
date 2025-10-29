/**
 * API调用模块
 * 统一处理所有AJAX请求
 * 整合了原来多个文件中的API调用逻辑
 */

class ApiClient {
  constructor(options = {}) {
    this.baseURL = options.baseURL || '';
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      ...options.headers
    };
    this.timeout = options.timeout || 30000;
    this.retryCount = options.retryCount || 3;
    this.retryDelay = options.retryDelay || 1000;
  }

  /**
   * 发送HTTP请求
   * @param {string} url - 请求URL
   * @param {Object} options - 请求选项
   * @returns {Promise}
   */
  async request(url, options = {}) {
    const {
      method = 'GET',
      headers = {},
      body = null,
      data = null,
      timeout = this.timeout,
      retryCount = this.retryCount,
      retryDelay = this.retryDelay
    } = options;

    const requestURL = this.baseURL ? `${this.baseURL}${url}` : url;
    const requestHeaders = { ...this.defaultHeaders, ...headers };
    
    // 处理请求体
    let requestBody = body;
    if (data && method !== 'GET') {
      if (data instanceof FormData) {
        requestBody = data;
        delete requestHeaders['Content-Type']; // 让浏览器自动设置
      } else {
        requestBody = JSON.stringify(data);
      }
    }

    let lastError;
    
    // 重试机制
    for (let attempt = 0; attempt <= retryCount; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(requestURL, {
          method,
          headers: requestHeaders,
          body: requestBody,
          signal: controller.signal,
          credentials: 'same-origin'
        });

        clearTimeout(timeoutId);

        // 处理响应
        if (!response.ok) {
          const errorData = await this.parseErrorResponse(response);
          throw new ApiError(errorData.message || `HTTP ${response.status}`, {
            status: response.status,
            statusText: response.statusText,
            data: errorData
          });
        }

        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          const result = await response.json();
          return result;
        } else if (contentType && contentType.includes('text/')) {
          return await response.text();
        } else {
          return await response.blob();
        }

      } catch (error) {
        lastError = error;
        
        // 如果是最后一次尝试或网络错误，继续抛出
        if (attempt === retryCount || this.isNetworkError(error)) {
          throw error;
        }
        
        // 等待后重试
        if (retryDelay > 0) {
          await this.delay(retryDelay);
        }
      }
    }
    
    throw lastError;
  }

  /**
   * GET请求
   * @param {string} url - 请求URL
   * @param {Object} params - 查询参数
   * @param {Object} options - 其他选项
   */
  async get(url, params = {}, options = {}) {
    const queryString = new URLSearchParams(params).toString();
    const fullURL = queryString ? `${url}?${queryString}` : url;
    return this.request(fullURL, { ...options, method: 'GET' });
  }

  /**
   * POST请求
   * @param {string} url - 请求URL
   * @param {Object} data - 请求数据
   * @param {Object} options - 其他选项
   */
  async post(url, data = {}, options = {}) {
    return this.request(url, { ...options, method: 'POST', data });
  }

  /**
   * PUT请求
   * @param {string} url - 请求URL
   * @param {Object} data - 请求数据
   * @param {Object} options - 其他选项
   */
  async put(url, data = {}, options = {}) {
    return this.request(url, { ...options, method: 'PUT', data });
  }

  /**
   * PATCH请求
   * @param {string} url - 请求URL
   * @param {Object} data - 请求数据
   * @param {Object} options - 其他选项
   */
  async patch(url, data = {}, options = {}) {
    return this.request(url, { ...options, method: 'PATCH', data });
  }

  /**
   * DELETE请求
   * @param {string} url - 请求URL
   * @param {Object} options - 其他选项
   */
  async delete(url, options = {}) {
    return this.request(url, { ...options, method: 'DELETE' });
  }

  /**
   * 文件上传
   * @param {string} url - 请求URL
   * @param {File|FormData} file - 文件或表单数据
   * @param {Function} onProgress - 进度回调
   * @param {Object} options - 其他选项
   */
  async upload(url, file, onProgress = null, options = {}) {
    const formData = new FormData();
    
    if (file instanceof File) {
      formData.append('file', file);
    } else if (file instanceof FormData) {
      Object.entries(file).forEach(([key, value]) => {
        formData.append(key, value);
      });
    } else {
      throw new Error('Invalid file parameter');
    }

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      // 进度监听
      if (onProgress) {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 100);
            onProgress(progress);
          }
        });
      }

      // 成功回调
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (error) {
            resolve(xhr.responseText);
          }
        } else {
          reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
        }
      });

      // 错误回调
      xhr.addEventListener('error', () => {
        reject(new Error('Network error'));
      });

      // 超时回调
      xhr.addEventListener('timeout', () => {
        reject(new Error('Request timeout'));
      });

      xhr.open('POST', this.baseURL ? `${this.baseURL}${url}` : url);
      
      // 设置请求头
      Object.entries({ ...this.defaultHeaders, ...options.headers }).forEach(([key, value]) => {
        if (key !== 'Content-Type') { // 让浏览器自动设置Content-Type为multipart/form-data
          xhr.setRequestHeader(key, value);
        }
      });

      xhr.timeout = options.timeout || this.timeout;
      xhr.send(formData);
    });
  }

  /**
   * 下载文件
   * @param {string} url - 请求URL
   * @param {string} filename - 文件名
   * @param {Object} options - 其他选项
   */
  async download(url, filename, options = {}) {
    const response = await this.request(url, { ...options, method: 'GET' });
    
    if (response instanceof Blob) {
      const blob = response;
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = DOM.create('a', {
        href: downloadUrl,
        download: filename
      });
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // 清理
      window.URL.revokeObjectURL(downloadUrl);
    }
    
    return response;
  }

  /**
   * 解析错误响应
   * @param {Response} response - 响应对象
   * @returns {Object}
   */
  async parseErrorResponse(response) {
    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        const text = await response.text();
        return { message: text || response.statusText };
      }
    } catch (error) {
      return { message: response.statusText || 'Unknown error' };
    }
  }

  /**
   * 判断是否为网络错误
   * @param {Error} error - 错误对象
   * @returns {boolean}
   */
  isNetworkError(error) {
    return error.name === 'AbortError' || 
           error.name === 'TypeError' || 
           error.message.includes('fetch') ||
           error.message.includes('NetworkError');
  }

  /**
   * 延迟函数
   * @param {number} ms - 毫秒
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 设置默认请求头
   * @param {Object} headers - 请求头
   */
  setDefaultHeaders(headers) {
    this.defaultHeaders = { ...this.defaultHeaders, ...headers };
  }

  /**
   * 移除默认请求头
   * @param {string} key - 请求头键名
   */
  removeDefaultHeader(key) {
    delete this.defaultHeaders[key];
  }
}

/**
 * API错误类
 */
class ApiError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = 'ApiError';
    this.details = details;
  }
}

/**
 * 通用API方法
 */
const api = new ApiClient();

/**
 * 认证相关API
 */
const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  changePassword: (data) => api.post('/auth/change-password', data),
  refreshToken: () => api.post('/auth/refresh')
};

/**
 * 用户管理API
 */
const userApi = {
  getUsers: (params = {}) => api.get('/admin/users', params),
  addUser: (userData) => api.post('/admin/users/add', userData),
  deleteUser: (userId) => api.post(`/admin/users/delete/${userId}`),
  getUser: (userId) => api.get(`/admin/users/${userId}`),
  updateUser: (userId, userData) => api.put(`/admin/users/${userId}`, userData)
};

/**
 * 店铺管理API
 */
const shopApi = {
  getShops: (params = {}) => api.get('/admin/shops', params),
  addShop: (shopData) => api.post('/admin/shops/add', shopData),
  updateShop: (shopId, shopData) => api.post(`/admin/shops/update/${shopId}`, shopData),
  deleteShop: (shopId) => api.post(`/admin/shops/delete/${shopId}`),
  checkShopName: (shopName, excludeId = null) => 
    api.get(`/admin/shops/check-name?shop_name=${encodeURIComponent(shopName)}${excludeId ? `&exclude_id=${excludeId}` : ''}`)
};

/**
 * 数据集分析API
 */
const datasetApi = {
  // 日报相关
  generateDailyReport: (formData) => api.upload('/dataset/daily-report', formData),
  
  // 月报相关
  generateMonthlyReport: (formData) => api.upload('/dataset/monthly-report', formData),
  
  // 产品分析相关
  uploadProductAnalysisFile: (formData, onProgress) => 
    api.upload('/dataset/product-analysis/upload-file', formData, onProgress),
  generateProductAnalysis: (formData) => api.upload('/dataset/product-analysis', formData),
  
  // 通用文件上传
  uploadFile: (url, file, onProgress = null) => 
    api.upload(url, file, onProgress)
};

/**
 * 日志管理API
 */
const logApi = {
  getLogs: (params = {}) => api.get('/admin/logs', params),
  clearLogs: (data) => api.post('/admin/logs/clear', data),
  getLogStats: () => api.get('/admin/logs/stats')
};

/**
 * 系统统计API
 */
const statsApi = {
  getStatistics: () => api.get('/api/statistics'),
  getReportStats: () => api.get('/api/statistics/reports'),
  getSystemStatus: () => api.get('/api/statistics/system')
};

/**
 * 更新日志API
 */
const updateLogApi = {
  getUpdateLogs: (params = {}) => api.get('/admin/update-log', params),
  getCommits: () => api.get('/admin/update-log/commits')
};

/**
 * 帮助文档API
 */
const helpApi = {
  getHelpContent: (type) => api.get(`/help/${type}`)
};

// 文件下载辅助函数
const downloadFile = async (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = DOM.create('a', {
    href: url,
    download: filename
  });
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // 清理
  window.URL.revokeObjectURL(url);
};

// 请求拦截器
api.interceptors = {
  request: {
    use: (beforeRequest) => {
      api._requestInterceptor = beforeRequest;
    }
  },
  response: {
    use: (beforeResponse) => {
      api._responseInterceptor = beforeResponse;
    }
  }
};

// 包装request方法以支持拦截器
const originalRequest = api.request.bind(api);
api.request = async (url, options = {}) => {
  // 请求拦截器
  if (api._requestInterceptor) {
    options = await api._requestInterceptor(url, options) || options;
  }
  
  try {
    const response = await originalRequest(url, options);
    
    // 响应拦截器
    if (api._responseInterceptor) {
      return await api._responseInterceptor(response) || response;
    }
    
    return response;
  } catch (error) {
    // 处理通用错误
    if (!(error instanceof ApiError)) {
      console.error('API Request failed:', error);
      notify.error('网络请求失败，请检查网络连接');
    }
    throw error;
  }
};

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ApiClient,
    ApiError,
    api,
    authApi,
    userApi,
    shopApi,
    datasetApi,
    logApi,
    statsApi,
    updateLogApi,
    helpApi,
    downloadFile
  };
}

// 挂载到全局
if (typeof window !== 'undefined') {
  window.ApiClient = ApiClient;
  window.ApiError = ApiError;
  window.api = api;
  window.authApi = authApi;
  window.userApi = userApi;
  window.shopApi = shopApi;
  window.datasetApi = datasetApi;
  window.logApi = logApi;
  window.statsApi = statsApi;
  window.updateLogApi = updateLogApi;
  window.helpApi = helpApi;
  window.downloadFile = downloadFile;
}