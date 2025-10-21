document.addEventListener('DOMContentLoaded', function() {
    const navItems = document.querySelectorAll('.nav-item');
    const navLinks = document.querySelectorAll('.nav-link');
    const groupTitles = document.querySelectorAll('.group-title');
    const categorySections = document.querySelectorAll('.category-section');
    const defaultSection = document.querySelector('.default-section');
    const dynamicSection = document.querySelector('.dynamic-section');
    
    // 用户下拉菜单功能
    const userDropdownToggle = document.getElementById('user-dropdown-toggle');
    const userDropdown = document.querySelector('.user-dropdown');
    
    // 点击用户信息区域切换下拉菜单
    if (userDropdownToggle) {
        userDropdownToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            userDropdown.classList.toggle('active');
        });
    }
    
    // 点击页面其他地方关闭下拉菜单
    document.addEventListener('click', function() {
        if (userDropdown) {
            userDropdown.classList.remove('active');
        }
    });
    
    // 阻止下拉菜单内部点击事件冒泡
    const dropdownMenu = document.getElementById('user-dropdown-menu');
    if (dropdownMenu) {
        dropdownMenu.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
    
    // 创建移动端菜单切换按钮
    const menuToggle = document.createElement('div');
    menuToggle.className = 'menu-toggle';
    menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
    document.body.appendChild(menuToggle);
    
    // 移动端菜单切换事件
    menuToggle.addEventListener('click', function() {
        const sidebar = document.querySelector('.cyber-sidebar');
        sidebar.classList.toggle('active');
        
        // 切换图标
        const icon = this.querySelector('i');
        if (sidebar.classList.contains('active')) {
            icon.className = 'fas fa-times';
        } else {
            icon.className = 'fas fa-bars';
        }
    });
    
    // 大类标题点击事件
    groupTitles.forEach(title => {
        title.addEventListener('click', function() {
            // 检查当前是否已展开
            const isCurrentlyExpanded = this.classList.contains('expanded');
            
            // 折叠所有其他大类
            groupTitles.forEach(otherTitle => {
                if (otherTitle !== this) {
                    otherTitle.classList.remove('expanded');
                    const otherSubmenu = otherTitle.nextElementSibling;
                    if (otherSubmenu && otherSubmenu.classList.contains('submenu')) {
                        otherSubmenu.classList.remove('expanded');
                    }
                }
            });
            
            // 切换当前大类的展开/收起状态
            const submenu = this.nextElementSibling;
            if (submenu && submenu.classList.contains('submenu')) {
                if (isCurrentlyExpanded) {
                    // 如果当前已展开，则折叠
                    this.classList.remove('expanded');
                    submenu.classList.remove('expanded');
                } else {
                    // 如果当前未展开，则展开
                    this.classList.add('expanded');
                    submenu.classList.add('expanded');
                }
            }
            
            // 移除所有活动类
            navItems.forEach(i => i.classList.remove('active'));
            groupTitles.forEach(t => t.classList.remove('active'));
            categorySections.forEach(section => section.classList.remove('active'));
            if (defaultSection) defaultSection.classList.remove('active');
            
            // 添加活动类到当前项
            this.classList.add('active');
            
            // 不再显示任何功能卡片区域，只保留左侧导航栏
            // 用户应直接点击左侧导航栏中的具体功能项进行操作
            
            // 移动端点击后关闭侧边栏
            if (window.innerWidth <= 768) {
                const sidebar = document.querySelector('.cyber-sidebar');
                sidebar.classList.remove('active');
                const icon = menuToggle.querySelector('i');
                icon.className = 'fas fa-bars';
            }
        });
    });
    
    // 导航项点击事件处理
    navLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            
            // 获取内容类型
            const contentType = this.getAttribute('data-content');
            
            // 移除所有活动类
            navItems.forEach(item => item.classList.remove('active'));
            navLinks.forEach(l => l.classList.remove('active'));
            groupTitles.forEach(title => title.classList.remove('active'));
            categorySections.forEach(section => section.classList.remove('active'));
            
            // 添加活动类到当前项
            this.parentElement.classList.add('active');
            
            // 隐藏默认内容区域
            if (defaultSection) {
                defaultSection.classList.remove('active');
            }
            
            // 显示动态内容区域
            if (dynamicSection) {
                dynamicSection.classList.add('active');
                
                // 根据内容类型加载相应的内容
                loadContent(contentType);
            }
            
            // 移动端点击后关闭侧边栏
            if (window.innerWidth <= 768) {
                const sidebar = document.querySelector('.cyber-sidebar');
                sidebar.classList.remove('active');
                const icon = menuToggle.querySelector('i');
                icon.className = 'fas fa-bars';
            }
        });
    });
    
    // 初始化所有子菜单为折叠状态
    const submenus = document.querySelectorAll('.submenu');
    submenus.forEach(submenu => {
        submenu.classList.remove('expanded');
    });
    
    // 初始化所有标题为非展开状态
    groupTitles.forEach(title => {
        title.classList.remove('expanded');
    });
    
    // 默认显示默认内容区域（日志和用户管理）
    if (defaultSection) {
        defaultSection.classList.add('active');
    } else {
        // 如果没有默认区域，则显示数据分析类别
        const dataAnalysisTitle = document.querySelector('.group-title[data-category="data-analysis"]');
        if (dataAnalysisTitle) {
            dataAnalysisTitle.click();
        } else if (groupTitles.length > 0) {
            // 如果没有找到数据分析项，则默认点击第一个类别
            groupTitles[0].click();
        }
    }
    
    // 添加点击事件处理程序到所有 href 为 # 的链接，但排除nav-item内的链接
    const links = document.querySelectorAll('a[href="#"]:not(.nav-item a)');
    links.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            // 创建一个科技感的提示
            showNotification('仅限内网使用', 'warning');
        });
    });
    
    // 通知函数
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `cyber-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <div class="notification-progress"></div>
        `;
        
        // 添加样式
        notification.style.cssText = `
            position: fixed;
            top: 90px;
            right: 20px;
            background: rgba(10, 10, 10, 0.9);
            backdrop-filter: blur(10px);
            border: 1px solid ${getNotificationColor(type)};
            border-radius: 10px;
            padding: 15px 20px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            min-width: 250px;
            box-shadow: 0 0 20px ${getNotificationColor(type)}40;
            transform: translateX(400px);
            transition: transform 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // 滑入动画
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        // 进度条动画
        const progressBar = notification.querySelector('.notification-progress');
        progressBar.style.cssText = `
            position: absolute;
            bottom: 0;
            left: 0;
            height: 3px;
            background: ${getNotificationColor(type)};
            width: 100%;
            transform-origin: left;
            animation: progressAnimation 3s linear forwards;
        `;
        
        // 添加进度条动画
        const style = document.createElement('style');
        style.textContent = `
            @keyframes progressAnimation {
                from { transform: scaleX(1); }
                to { transform: scaleX(0); }
            }
        `;
        document.head.appendChild(style);
        
        // 3秒后自动移除
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
                if (style.parentNode) {
                    document.head.removeChild(style);
                }
            }, 300);
        }, 3000);
    }
    
    function getNotificationIcon(type) {
        switch(type) {
            case 'success': return 'fa-check-circle';
            case 'warning': return 'fa-exclamation-triangle';
            case 'error': return 'fa-times-circle';
            default: return 'fa-info-circle';
        }
    }
    
    function getNotificationColor(type) {
        switch(type) {
            case 'success': return '#00ff88';
            case 'warning': return '#ffaa00';
            case 'error': return '#ff006e';
            default: return '#00d4ff';
        }
    }
    
    
    // 标题栏滚动效果
    let lastScrollTop = 0;
    const header = document.querySelector('.cyber-header');
    
    if (header) {
        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            if (scrollTop > lastScrollTop && scrollTop > 100) {
                // 向下滚动 - 隐藏标题栏
                header.style.transform = 'translateY(-100%)';
            } else {
                // 向上滚动 - 显示标题栏
                header.style.transform = 'translateY(0)';
            }
            
            lastScrollTop = scrollTop;
        });
        
        // 添加标题栏过渡动画
        header.style.transition = 'transform 0.3s ease';
    }
    
    // 用户头像动画
    const userAvatar = document.querySelector('.user-avatar');
    if (userAvatar) {
        userAvatar.addEventListener('mouseenter', function() {
            this.style.transform = 'rotate(360deg) scale(1.1)';
        });
        
        userAvatar.addEventListener('mouseleave', function() {
            this.style.transform = 'rotate(0) scale(1)';
        });
        
        userAvatar.style.transition = 'transform 0.5s ease';
    }
    
    // 添加键盘快捷键支持
    document.addEventListener('keydown', (e) => {
        // Alt + 数字键快速切换菜单
        if (e.altKey) {
            switch(e.key) {
                case '1':
                    const dataAnalysisTitle = document.querySelector('.group-title[data-category="data-analysis"]');
                    if (dataAnalysisTitle) dataAnalysisTitle.click();
                    break;
                case '2':
                    const templatesTitle = document.querySelector('.group-title[data-category="templates"]');
                    if (templatesTitle) templatesTitle.click();
                    break;
                case '3':
                    const toolsTitle = document.querySelector('.group-title[data-category="tools"]');
                    if (toolsTitle) toolsTitle.click();
                    break;
                case '4':
                    const adminTitle = document.querySelector('.group-title[data-category="admin"]');
                    if (adminTitle) adminTitle.click();
                    break;
                case '0':
                    // 显示默认内容
                    if (defaultSection) {
                        navItems.forEach(i => i.classList.remove('active'));
                        groupTitles.forEach(t => t.classList.remove('active'));
                        categorySections.forEach(section => section.classList.remove('active'));
                        defaultSection.classList.add('active');
                    }
                    break;
            }
        }
        
        // Ctrl + M 切换移动端菜单
        if (e.ctrlKey && e.key === 'm') {
            e.preventDefault();
            const sidebar = document.querySelector('.cyber-sidebar');
            if (sidebar) {
                sidebar.classList.toggle('active');
                const icon = menuToggle.querySelector('i');
                if (sidebar.classList.contains('active')) {
                    icon.className = 'fas fa-times';
                } else {
                    icon.className = 'fas fa-bars';
                }
            }
        }
    });
    
    // 加载内容的函数
    function loadContent(contentType) {
        if (!dynamicSection) return;
        
        // 显示加载指示器
        dynamicSection.innerHTML = `
            <div class="loading-container">
                <div class="loading-spinner">
                    <i class="fas fa-spinner fa-spin"></i>
                    <span>正在加载内容...</span>
                </div>
            </div>
        `;
        
        // 根据内容类型加载相应的内容
        let url;
        switch(contentType) {
            case 'daily-report':
                url = '/dataset/daily-report';
                break;
            case 'monthly-report':
                url = '/dataset/monthly-report';
                break;
            case 'product-analysis':
                url = '/dataset/product-analysis';
                break;
            case 'user-management':
                url = '/admin/users?embed=true';
                break;
            case 'log-management':
                url = '/admin/logs?embed=true';
                break;
            default:
                dynamicSection.innerHTML = '<div class="error-message">未知内容类型</div>';
                return;
        }
        
        // 发送AJAX请求获取内容
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('网络响应不正常');
                }
                return response.text();
            })
            .then(html => {
                dynamicSection.innerHTML = html;
                
                // 初始化页面功能
                initializePageContent(contentType);
            })
            .catch(error => {
                console.error('加载内容失败:', error);
                dynamicSection.innerHTML = `
                    <div class="error-container">
                        <i class="fas fa-exclamation-triangle"></i>
                        <h3>加载失败</h3>
                        <p>无法加载内容，请稍后重试</p>
                        <button class="retry-btn" onclick="loadContent('${contentType}')">重试</button>
                    </div>
                `;
            });
    }
    
    // 初始化页面内容的函数
    function initializePageContent(contentType) {
        // 处理日报页面
        if (contentType === 'daily-report') {
            initializeDailyReport();
        }
        // 处理月报页面
        else if (contentType === 'monthly-report') {
            initializeMonthlyReport();
        }
        // 处理产品分析页面
        else if (contentType === 'product-analysis') {
            initializeProductAnalysis();
        }
        // 处理用户管理页面
        else if (contentType === 'user-management') {
            initializeUserManagement();
        }
        // 处理日志管理页面
        else if (contentType === 'log-management') {
            initializeLogManagement();
        }
    }
    
    // 初始化日报页面
    function initializeDailyReport() {
        // 处理昨天按钮
        const yesterdayBtn = document.getElementById('yesterday-btn');
        if (yesterdayBtn) {
            yesterdayBtn.addEventListener('click', function() {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                
                // 格式化日期为 YYYY-MM-DD
                const year = yesterday.getFullYear();
                const month = String(yesterday.getMonth() + 1).padStart(2, '0');
                const day = String(yesterday.getDate()).padStart(2, '0');
                const formattedDate = `${year}-${month}-${day}`;
                
                const reportDateInput = document.getElementById('report_date');
                if (reportDateInput) {
                    reportDateInput.value = formattedDate;
                    console.log('设置昨天日期:', formattedDate);
                }
            });
        }
        
        // 处理表单提交
        const form = document.getElementById('daily-report-form');
        if (form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                
                // 创建FormData对象
                const formData = new FormData(this);
                
                // 显示加载指示器
                const formContainer = this.parentElement;
                const originalContent = formContainer.innerHTML;
                formContainer.innerHTML = `
                    <div class="loading-indicator">
                        <i class="fas fa-spinner fa-spin"></i>
                        <span>正在生成日报，请稍候...</span>
                    </div>
                `;
                
                // 发送AJAX请求
                fetch(this.action, {
                    method: 'POST',
                    body: formData
                })
                .then(response => {
                    if (response.ok) {
                        return response.blob();
                    } else {
                        throw new Error('生成日报失败');
                    }
                })
                .then(blob => {
                    // 创建下载链接
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'daily_report.xlsx';
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                    
                    // 恢复表单
                    formContainer.innerHTML = originalContent;
                    
                    // 重新初始化页面
                    initializeDailyReport();
                    
                    // 显示成功消息
                    showNotification('日报生成成功', 'success');
                })
                .catch(error => {
                    console.error('Error:', error);
                    formContainer.innerHTML = originalContent;
                    
                    // 重新初始化页面
                    initializeDailyReport();
                    
                    // 显示错误消息
                    showNotification('生成日报失败，请重试', 'error');
                });
            });
        }
    }
    
    // 初始化月报页面
    function initializeMonthlyReport() {
        // 处理表单提交
        const form = document.getElementById('monthly-report-form');
        if (form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                
                // 创建FormData对象
                const formData = new FormData(this);
                
                // 显示加载指示器
                const formContainer = this.parentElement;
                const originalContent = formContainer.innerHTML;
                formContainer.innerHTML = `
                    <div class="loading-indicator">
                        <i class="fas fa-spinner fa-spin"></i>
                        <span>正在生成月报，请稍候...</span>
                    </div>
                `;
                
                // 发送AJAX请求
                fetch(this.action, {
                    method: 'POST',
                    body: formData
                })
                .then(response => {
                    if (response.ok) {
                        return response.blob();
                    } else {
                        throw new Error('生成月报失败');
                    }
                })
                .then(blob => {
                    // 创建下载链接
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'monthly_report.xlsx';
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                    
                    // 恢复表单
                    formContainer.innerHTML = originalContent;
                    
                    // 重新初始化页面
                    initializeMonthlyReport();
                    
                    // 显示成功消息
                    showNotification('月报生成成功', 'success');
                })
                .catch(error => {
                    console.error('Error:', error);
                    formContainer.innerHTML = originalContent;
                    
                    // 重新初始化页面
                    initializeMonthlyReport();
                    
                    // 显示错误消息
                    showNotification('生成月报失败，请重试', 'error');
                });
            });
        }
    }
    
    // 初始化产品分析页面
    function initializeProductAnalysis() {
        const dropArea = document.getElementById('drop-area');
        const fileInput = document.getElementById('file-input');
        const form = document.getElementById('analysis-form');
        const submitBtn = document.getElementById('submit-btn');
        
        // 存储已上传的文件信息
        const uploadedFiles = {
            business_report: null,
            payment_report: null,
            ad_product_report: null
        };
        
        // 点击拖拽区域时触发文件选择
        if (dropArea) {
            dropArea.addEventListener('click', () => {
                fileInput.click();
            });
            
            // 阻止默认的拖拽行为
            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                dropArea.addEventListener(eventName, preventDefaults, false);
            });
            
            function preventDefaults(e) {
                e.preventDefault();
                e.stopPropagation();
            }
            
            // 拖拽进入和悬停时的样式
            ['dragenter', 'dragover'].forEach(eventName => {
                dropArea.addEventListener(eventName, highlight, false);
            });
            
            ['dragleave', 'drop'].forEach(eventName => {
                dropArea.addEventListener(eventName, unhighlight, false);
            });
            
            function highlight() {
                dropArea.classList.add('dragover');
            }
            
            function unhighlight() {
                dropArea.classList.remove('dragover');
            }
            
            // 处理文件拖拽放下
            dropArea.addEventListener('drop', handleDrop, false);
            
            function handleDrop(e) {
                const dt = e.dataTransfer;
                const files = dt.files;
                handleFiles(files);
            }
        }
        
        // 处理文件选择
        if (fileInput) {
            fileInput.addEventListener('change', function() {
                handleFiles(this.files);
            });
        }
        
        // 处理文件列表
        function handleFiles(files) {
            if (files.length === 0) return;
            
            // 检查文件类型
            const validFiles = Array.from(files).filter(file => {
                const ext = file.name.split('.').pop().toLowerCase();
                return ['csv', 'xlsx'].includes(ext);
            });
            
            if (validFiles.length === 0) {
                showNotification('请只上传 .csv 或 .xlsx 格式的文件', 'warning');
                return;
            }
            
            // 为每个文件确定类型并上传
            validFiles.forEach(file => {
                const fileType = determineFileType(file);
                if (fileType) {
                    uploadFile(file, fileType);
                }
            });
        }
        
        // 根据文件名和内容确定文件类型
        function determineFileType(file) {
            const filename = file.name.toLowerCase();
            const ext = filename.split('.').pop().toLowerCase();
            
            // 根据文件名关键词判断
            if (filename.includes('business') || filename.includes('业务')) {
                return 'business_report';
            }
            if (filename.includes('transaction') || filename.includes('付款') || filename.includes('payment')) {
                return 'payment_report';
            }
            if (filename.includes('ad') || filename.includes('广告') || filename.includes('advertising')) {
                return 'ad_product_report';
            }
            
            // 根据文件扩展名和上传状态判断
            if (ext === 'csv' && !uploadedFiles.business_report) {
                return 'business_report';
            }
            if (ext === 'csv' && !uploadedFiles.payment_report) {
                return 'payment_report';
            }
            if (ext === 'xlsx' && !uploadedFiles.ad_product_report) {
                return 'ad_product_report';
            }
            
            // 如果都已上传，让用户选择替换哪个
            if (ext === 'csv' && uploadedFiles.business_report && !uploadedFiles.payment_report) {
                return 'payment_report';
            }
            if (ext === 'csv' && uploadedFiles.business_report && uploadedFiles.payment_report) {
                return confirm(`文件 ${file.name} 可能是业务报告或付款报告，是否替换业务报告？`) ? 'business_report' : 'payment_report';
            }
            
            return null;
        }
        
        // 上传单个文件
        async function uploadFile(file, fileType) {
            const projectName = document.getElementById('project_name').value;
            if (!projectName) {
                showNotification('请先选择项目名称', 'warning');
                return;
            }
            
            if (dropArea) dropArea.classList.add('uploading');
            
            const formData = new FormData();
            formData.append('file', file);
            formData.append('project_name', projectName);
            formData.append('file_type', fileType);
            
            // 更新UI状态
            updateFileItemUI(file, fileType, 'uploading');
            
            try {
                const response = await fetch('/dataset/product-analysis/upload-file', {
                    method: 'POST',
                    body: formData
                });
                
                const result = await response.json();
                
                if (result.success) {
                    // 存储上传的文件路径
                    uploadedFiles[fileType] = result.file_path;
                    document.getElementById(`${fileType}_path`).value = result.file_path;
                    
                    // 更新UI为已上传状态
                    updateFileItemUI(file, fileType, 'uploaded');
                } else {
                    throw new Error(result.error || '上传失败');
                }
            } catch (error) {
                updateFileItemUI(file, fileType, 'error', error.message);
                console.error('上传失败:', error);
                showNotification(`上传失败: ${error.message}`, 'error');
            } finally {
                if (dropArea) dropArea.classList.remove('uploading');
                checkAllFilesUploaded();
            }
        }
        
        // 更新文件项UI
        function updateFileItemUI(file, fileType, status, errorMessage = '') {
            const fileItem = document.getElementById(`file-${fileType}`);
            if (!fileItem) return;
            
            const fileName = file ? file.name : getFileTypeName(fileType);
            const fileSize = file ? ` (${formatFileSize(file.size)})` : '';
            
            fileItem.className = `file-item ${status}`;
            
            const nameSpan = fileItem.querySelector('span:first-child');
            const progressSpan = fileItem.querySelector('.upload-progress');
            
            // 保留帮助图标
            const helpIcon = nameSpan.querySelector('.help-icon');
            const helpIconHTML = helpIcon ? helpIcon.outerHTML : '';
            
            if (status === 'uploading') {
                nameSpan.innerHTML = `${getFileTypeName(fileType)}: ${fileName}${fileSize}${helpIconHTML}`;
                progressSpan.textContent = '上传中...';
            } else if (status === 'uploaded') {
                nameSpan.innerHTML = `${getFileTypeName(fileType)}: ${fileName}${fileSize}${helpIconHTML}`;
                progressSpan.textContent = '✓ 已上传';
            } else if (status === 'error') {
                nameSpan.innerHTML = `${getFileTypeName(fileType)}: ${fileName}${fileSize}${helpIconHTML}`;
                progressSpan.textContent = `✗ 上传失败: ${errorMessage}`;
            } else if (status === 'empty') {
                nameSpan.innerHTML = `${getFileTypeName(fileType)}：等待上传（${fileType.includes('ad') ? '.xlsx' : '.csv'}格式）${helpIconHTML}`;
                progressSpan.textContent = '未上传';
            }
            
            // 添加或更新删除按钮
            let removeBtn = fileItem.querySelector('.remove-file');
            if (status === 'uploaded') {
                if (!removeBtn) {
                    removeBtn = document.createElement('button');
                    removeBtn.className = 'remove-file';
                    removeBtn.textContent = '×';
                    removeBtn.onclick = () => removeFile(fileType);
                    fileItem.appendChild(removeBtn);
                }
            } else if (removeBtn) {
                removeBtn.remove();
            }
        }
        
        function getFileTypeName(fileType) {
            const names = {
                'business_report': '业务报告',
                'payment_report': '付款报告',
                'ad_product_report': '广告报表'
            };
            return names[fileType] || fileType;
        }
        
        function removeFile(fileType) {
            uploadedFiles[fileType] = null;
            document.getElementById(`${fileType}_path`).value = '';
            
            // 重置UI为空状态
            updateFileItemUI(null, fileType, 'empty');
            
            checkAllFilesUploaded();
        }
        
        function checkAllFilesUploaded() {
            const allUploaded = uploadedFiles.business_report &&
                              uploadedFiles.payment_report &&
                              uploadedFiles.ad_product_report;
            
            if (submitBtn) {
                submitBtn.disabled = !allUploaded;
                
                if (allUploaded) {
                    submitBtn.textContent = '生成产品分析';
                } else {
                    submitBtn.textContent = '请等待所有文件上传完成';
                }
            }
        }
        
        // 格式化文件大小
        function formatFileSize(bytes) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        }
        
        // 表单提交时检查文件
        if (form) {
            form.addEventListener('submit', function formSubmitHandler(e) {
                if (!uploadedFiles.business_report || !uploadedFiles.payment_report || !uploadedFiles.ad_product_report) {
                    e.preventDefault();
                    showNotification('请确保所有文件都已上传完成', 'warning');
                    return;
                }
                
                e.preventDefault();
                
                // 创建FormData对象
                const formData = new FormData(this);
                
                // 显示加载指示器
                const formContainer = this.parentElement;
                const originalContent = formContainer.innerHTML;
                formContainer.innerHTML = `
                    <div class="loading-indicator">
                        <i class="fas fa-spinner fa-spin"></i>
                        <span>正在生成产品分析，请稍候...</span>
                    </div>
                `;
                
                // 发送AJAX请求
                fetch(this.action, {
                    method: 'POST',
                    body: formData
                })
                .then(response => {
                    if (response.ok) {
                        return response.blob();
                    } else {
                        throw new Error('生成产品分析失败');
                    }
                })
                .then(blob => {
                    // 创建下载链接
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'product_analysis.xlsx';
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                    
                    // 恢复表单
                    formContainer.innerHTML = originalContent;
                    
                    // 重新初始化页面
                    initializeProductAnalysis();
                    
                    // 显示成功消息
                    showNotification('产品分析生成成功', 'success');
                })
                .catch(error => {
                    console.error('Error:', error);
                    formContainer.innerHTML = originalContent;
                    
                    // 重新初始化页面
                    initializeProductAnalysis();
                    
                    // 显示错误消息
                    showNotification('生成产品分析失败，请重试', 'error');
                });
            });
        }
        
        // 项目名称改变时清空已上传的文件
        const projectNameSelect = document.getElementById('project_name');
        if (projectNameSelect) {
            projectNameSelect.addEventListener('change', function() {
                // 清空已上传的文件
                Object.keys(uploadedFiles).forEach(key => {
                    uploadedFiles[key] = null;
                    document.getElementById(`${key}_path`).value = '';
                    updateFileItemUI(null, key, 'empty');
                });
                
                if (submitBtn) submitBtn.disabled = true;
            });
        }
        
        // 上周按钮点击事件
        setTimeout(() => {
            const lastWeekBtn = document.getElementById('last-week-btn');
            console.log('查找上周按钮:', lastWeekBtn);
            if (lastWeekBtn) {
                // 清除可能存在的旧事件监听器
                const newBtn = lastWeekBtn.cloneNode(true);
                lastWeekBtn.parentNode.replaceChild(newBtn, lastWeekBtn);
                
                newBtn.addEventListener('click', function() {
                    console.log('上周按钮被点击');
                    try {
                        // 获取当前日期
                        const now = new Date();
                        
                        // 计算上周的开始日期（7天前）
                        const lastWeekStart = new Date(now);
                        lastWeekStart.setDate(now.getDate() - 7);
                        
                        // 计算上周的结束日期（昨天）
                        const lastWeekEnd = new Date(now);
                        lastWeekEnd.setDate(now.getDate() - 1);
                        
                        // 格式化日期为 YYYY-MM-DD
                        const startYear = lastWeekStart.getFullYear();
                        const startMonth = String(lastWeekStart.getMonth() + 1).padStart(2, '0');
                        const startDay = String(lastWeekStart.getDate()).padStart(2, '0');
                        const formattedStartDate = `${startYear}-${startMonth}-${startDay}`;
                        
                        const endYear = lastWeekEnd.getFullYear();
                        const endMonth = String(lastWeekEnd.getMonth() + 1).padStart(2, '0');
                        const endDay = String(lastWeekEnd.getDate()).padStart(2, '0');
                        const formattedEndDate = `${endYear}-${endMonth}-${endDay}`;
                        
                        // 设置日期输入框的值
                        const startDateInput = document.getElementById('report_start_date');
                        const endDateInput = document.getElementById('report_end_date');
                        
                        if (startDateInput && endDateInput) {
                            startDateInput.value = formattedStartDate;
                            endDateInput.value = formattedEndDate;
                            console.log('日期已设置:', formattedStartDate, '至', formattedEndDate);
                        } else {
                            console.error('找不到日期输入框');
                        }
                    } catch (error) {
                        console.error('设置日期时出错:', error);
                    }
                });
                
                console.log('上周按钮事件监听器已绑定');
            } else {
                console.error('找不到上周按钮');
            }
        }, 100);
    }
    
    // 初始化用户管理页面
    function initializeUserManagement() {
        // 处理添加用户表单
        const addUserForm = document.getElementById('add-user-form');
        if (addUserForm) {
            addUserForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const formData = new FormData(this);
                
                // 发送AJAX请求
                fetch('/admin/users/add', {
                    method: 'POST',
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    body: formData
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        showNotification('用户添加成功', 'success');
                        // 重新加载用户管理页面
                        loadContent('user-management');
                    } else {
                        showNotification(data.message || '添加用户失败', 'error');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    showNotification('添加用户失败，请重试', 'error');
                });
            });
        }
        
        // 处理删除用户按钮
        const deleteButtons = document.querySelectorAll('.delete-user-btn');
        deleteButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                
                const userId = this.getAttribute('data-user-id');
                const username = this.getAttribute('data-username');
                
                if (confirm(`确定要删除用户 ${username} 吗？此操作不可恢复！`)) {
                    fetch(`/admin/users/delete/${userId}`, {
                        method: 'POST',
                        headers: {
                            'X-Requested-With': 'XMLHttpRequest'
                        }
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            showNotification('用户删除成功', 'success');
                            // 重新加载用户管理页面
                            loadContent('user-management');
                        } else {
                            showNotification(data.message || '删除用户失败', 'error');
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        showNotification('删除用户失败，请重试', 'error');
                    });
                }
            });
        });
    }
    
    // 初始化日志管理页面
    function initializeLogManagement() {
        // 处理筛选表单
        const filterForm = document.getElementById('log-filter-form');
        if (filterForm) {
            filterForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const formData = new FormData(this);
                const params = new URLSearchParams(formData);
                
                // 重新加载日志管理页面，带上筛选参数
                fetch(`/admin/logs?${params.toString()}`)
                    .then(response => response.text())
                    .then(html => {
                        dynamicSection.innerHTML = html;
                        initializeLogManagement();
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        showNotification('加载日志失败，请重试', 'error');
                    });
            });
        }
        
        // 处理清理日志表单
        const clearLogsForm = document.getElementById('clear-logs-form');
        if (clearLogsForm) {
            clearLogsForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                if (confirm('确定要清理旧日志吗？此操作不可恢复！')) {
                    const formData = new FormData(this);
                    
                    fetch('/admin/logs/clear', {
                        method: 'POST',
                        headers: {
                            'X-Requested-With': 'XMLHttpRequest'
                        },
                        body: formData
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            showNotification(data.message || '日志清理成功', 'success');
                            // 重新加载日志管理页面
                            loadContent('log-management');
                        } else {
                            showNotification(data.message || '清理日志失败', 'error');
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        showNotification('清理日志失败，请重试', 'error');
                    });
                }
            });
        }
    }
    
});