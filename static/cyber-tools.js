document.addEventListener('DOMContentLoaded', function() {
    const navItems = document.querySelectorAll('.nav-item');
    const navLinks = document.querySelectorAll('.nav-link');
    const groupTitles = document.querySelectorAll('.group-title');
    const categorySections = document.querySelectorAll('.category-section');
    const defaultSection = document.querySelector('.default-section');
    const dynamicSection = document.querySelector('.dynamic-section');
    
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
                url = '/dataset/daily-report-content';
                break;
            case 'monthly-report':
                url = '/dataset/monthly-report-content';
                break;
            case 'product-analysis':
                url = '/dataset/product-analysis-content';
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
                
                // 重新初始化内容中的脚本
                const scripts = dynamicSection.querySelectorAll('script');
                scripts.forEach(script => {
                    const newScript = document.createElement('script');
                    newScript.textContent = script.textContent;
                    dynamicSection.appendChild(newScript);
                });
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
    
});