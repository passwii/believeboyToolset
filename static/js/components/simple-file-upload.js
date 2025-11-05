/**
 * 简化版文件上传组件
 * 专门用于产品标签处理页面的PDF文件上传功能
 */

class SimpleFileUpload {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.container = document.getElementById(containerId);
        
        if (!this.container) {
            console.error(`容器元素 #${containerId} 未找到`);
            return;
        }
        
        // 默认配置
        this.options = {
            accept: '.pdf',
            maxSize: 20, // MB
            multiple: false,
            title: '文件上传',
            description: '拖拽文件到这里或点击选择',
            icon: 'fas fa-cloud-upload-alt',
            buttonText: '选择文件',
            onFileSelect: null,
            onUpload: null,
            ...options
        };
        
        this.selectedFiles = [];
        this.isUploading = false;
        
        this.init();
    }
    
    /**
     * 初始化组件
     */
    init() {
        this.createHTML();
        this.bindEvents();
    }
    
    /**
     * 创建HTML结构
     */
    createHTML() {
        this.container.innerHTML = `
            <div class="simple-file-upload">
                <div class="upload-title">
                    <i class="${this.options.icon}"></i>
                    <span>${this.options.title}</span>
                </div>
                <div class="upload-area" id="upload-area-${this.containerId}">
                    <i class="${this.options.icon} upload-icon"></i>
                    <p class="upload-description">${this.options.description}</p>
                    <button type="button" class="btn-select">
                        <i class="fas fa-folder-open"></i>
                        ${this.options.buttonText}
                    </button>
                    <input type="file" 
                           id="file-input-${this.containerId}" 
                           accept="${this.options.accept}"
                           ${this.options.multiple ? 'multiple' : ''}>
                </div>
                <div class="file-list" id="file-list-${this.containerId}"></div>
                <div class="upload-status" id="upload-status-${this.containerId}"></div>
            </div>
        `;
        
        // 缓存DOM元素
        this.uploadArea = document.getElementById(`upload-area-${this.containerId}`);
        this.fileInput = document.getElementById(`file-input-${this.containerId}`);
        this.fileList = document.getElementById(`file-list-${this.containerId}`);
        this.uploadStatus = document.getElementById(`upload-status-${this.containerId}`);
    }
    
    /**
     * 绑定事件
     */
    bindEvents() {
        // 点击上传区域
        this.uploadArea.addEventListener('click', () => {
            this.fileInput.click();
        });
        
        // 文件选择
        this.fileInput.addEventListener('change', (e) => {
            this.handleFileSelect(e.target.files);
        });
        
        // 阻止默认的拖拽行为
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            this.uploadArea.addEventListener(eventName, this.preventDefaults, false);
        });

        // 拖拽进入和悬停时的样式
        ['dragenter', 'dragover'].forEach(eventName => {
            this.uploadArea.addEventListener(eventName, this.highlight, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            this.uploadArea.addEventListener(eventName, this.unhighlight, false);
        });

        // 处理文件拖拽放下
        this.uploadArea.addEventListener('drop', this.handleDrop.bind(this), false);
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
        this.uploadArea.classList.add('dragover');
    }

    /**
     * 取消高亮
     */
    unhighlight() {
        this.uploadArea.classList.remove('dragover');
    }

    /**
     * 处理文件拖拽
     */
    handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        this.handleFileSelect(files);
    }
    
    /**
     * 处理文件选择
     */
    handleFileSelect(files) {
        if (files.length === 0) return;
        
        // 验证文件
        const validFiles = this.validateFiles(files);
        
        if (validFiles.length === 0) {
            this.showError('没有有效的文件');
            return;
        }
        
        // 如果不是多文件模式，替换现有文件
        if (!this.options.multiple) {
            this.selectedFiles = validFiles.slice(0, 1);
        } else {
            this.selectedFiles = [...this.selectedFiles, ...validFiles];
        }
        
        // 更新UI
        this.updateFileList();
        
        // 触发回调
        if (this.options.onFileSelect) {
            this.options.onFileSelect(this.selectedFiles);
        }
    }
    
    /**
     * 验证文件
     */
    validateFiles(files) {
        const validFiles = [];
        
        Array.from(files).forEach(file => {
            // 检查文件类型
            const acceptTypes = this.options.accept.split(',').map(type => type.trim());
            const fileExt = '.' + file.name.split('.').pop().toLowerCase();
            
            if (!acceptTypes.some(type => {
                if (type.startsWith('.')) {
                    return fileExt === type.toLowerCase();
                } else if (type.includes('/*')) {
                    const fileType = type.split('/')[0];
                    return file.type.startsWith(fileType);
                }
                return false;
            })) {
                this.showError(`文件 "${file.name}" 类型不支持`);
                return;
            }
            
            // 检查文件大小
            const maxSizeBytes = this.options.maxSize * 1024 * 1024;
            if (file.size > maxSizeBytes) {
                this.showError(`文件 "${file.name}" 大小超过限制 (${this.options.maxSize}MB)`);
                return;
            }
            
            validFiles.push(file);
        });
        
        return validFiles;
    }
    
    /**
     * 更新文件列表UI
     */
    updateFileList() {
        if (this.selectedFiles.length === 0) {
            this.fileList.innerHTML = '';
            return;
        }
        
        let html = '';
        this.selectedFiles.forEach((file, index) => {
            const fileSize = this.formatFileSize(file.size);
            const fileIcon = this.getFileIcon(file.name);
            
            html += `
                <div class="file-item" data-index="${index}">
                    <div class="file-info">
                        <i class="${fileIcon} file-icon"></i>
                        <div class="file-details">
                            <div class="file-name">${file.name}</div>
                            <div class="file-size">${fileSize}</div>
                        </div>
                    </div>
                    <button type="button" class="btn-remove" data-index="${index}">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
        });
        
        this.fileList.innerHTML = html;
        
        // 绑定删除按钮事件
        this.fileList.querySelectorAll('.btn-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const index = parseInt(btn.dataset.index);
                this.removeFile(index);
            });
        });
    }
    
    /**
     * 移除文件
     */
    removeFile(index) {
        this.selectedFiles.splice(index, 1);
        this.updateFileList();
        
        // 触发回调
        if (this.options.onFileSelect) {
            this.options.onFileSelect(this.selectedFiles);
        }
    }
    
    /**
     * 上传文件
     */
    async uploadFiles() {
        if (this.selectedFiles.length === 0 || this.isUploading) {
            return;
        }
        
        this.isUploading = true;
        this.showProgress();
        
        try {
            // 触发上传回调
            if (this.options.onUpload) {
                const result = await this.options.onUpload(this.selectedFiles);
                this.showSuccess('上传成功');
                return result;
            }
        } catch (error) {
            this.showError('上传失败: ' + error.message);
            throw error;
        } finally {
            this.isUploading = false;
        }
    }
    
    /**
     * 显示进度
     */
    showProgress() {
        this.uploadStatus.innerHTML = `
            <div class="progress-section">
                <div class="progress-bar">
                    <div class="progress-fill" id="progress-${this.containerId}"></div>
                </div>
                <div class="progress-text">上传中...</div>
            </div>
        `;
        
        // 模拟进度
        let progress = 0;
        const progressBar = document.getElementById(`progress-${this.containerId}`);
        const interval = setInterval(() => {
            progress += Math.random() * 30;
            if (progress > 90) progress = 90;
            progressBar.style.width = progress + '%';
            
            if (progress >= 90) {
                clearInterval(interval);
            }
        }, 300);
    }
    
    /**
     * 显示成功消息
     */
    showSuccess(message) {
        this.uploadStatus.innerHTML = `
            <div class="upload-success">
                <i class="fas fa-check-circle"></i>
                <span>${message}</span>
            </div>
        `;
        
        // 3秒后自动隐藏
        setTimeout(() => {
            this.uploadStatus.innerHTML = '';
        }, 3000);
    }
    
    /**
     * 显示错误消息
     */
    showError(message) {
        this.uploadStatus.innerHTML = `
            <div class="upload-error">
                <i class="fas fa-exclamation-triangle"></i>
                <span>${message}</span>
            </div>
        `;
        
        // 5秒后自动隐藏
        setTimeout(() => {
            this.uploadStatus.innerHTML = '';
        }, 5000);
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
     * 获取文件图标
     */
    getFileIcon(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        const iconMap = {
            'pdf': 'fas fa-file-pdf',
            'xlsx': 'fas fa-file-excel',
            'xls': 'fas fa-file-excel',
            'docx': 'fas fa-file-word',
            'doc': 'fas fa-file-word',
            'txt': 'fas fa-file-alt',
            'jpg': 'fas fa-file-image',
            'jpeg': 'fas fa-file-image',
            'png': 'fas fa-file-image',
            'gif': 'fas fa-file-image'
        };
        
        return iconMap[ext] || 'fas fa-file';
    }
    
    /**
     * 清除所有文件
     */
    clearFiles() {
        this.selectedFiles = [];
        this.updateFileList();
        this.uploadStatus.innerHTML = '';
        this.fileInput.value = '';
    }
    
    /**
     * 获取选中的文件
     */
    getSelectedFiles() {
        return [...this.selectedFiles];
    }
    
    /**
     * 销毁组件
     */
    destroy() {
        this.container.innerHTML = '';
        this.selectedFiles = [];
        this.isUploading = false;
    }
}

/**
 * 初始化简化文件上传组件
 * @param {string} containerId 容器ID
 * @param {object} options 配置选项
 * @returns {SimpleFileUpload} 组件实例
 */
function initSimpleFileUpload(containerId, options = {}) {
    return new SimpleFileUpload(containerId, options);
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        SimpleFileUpload,
        initSimpleFileUpload
    };
}

// 挂载到全局
if (typeof window !== 'undefined') {
    window.SimpleFileUpload = SimpleFileUpload;
    window.initSimpleFileUpload = initSimpleFileUpload;
}