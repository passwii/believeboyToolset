document.addEventListener('DOMContentLoaded', function() {
    const navItems = document.querySelectorAll('.nav-item');
    const categorySections = document.querySelectorAll('.category-section');
    
    // 导航菜单点击事件
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            // 移除所有活动类
            navItems.forEach(i => i.classList.remove('active'));
            categorySections.forEach(section => section.classList.remove('active'));
            
            // 添加活动类到当前项
            this.classList.add('active');
            const category = this.getAttribute('data-category');
            const targetSection = document.getElementById(category);
            
            if (targetSection) {
                // 添加淡入效果
                setTimeout(() => {
                    targetSection.classList.add('active');
                }, 10);
            }
        });
    });
    
    // 默认显示数据分析类别
    const dataAnalysisItem = document.querySelector('.nav-item[data-category="data-analysis"]');
    if (dataAnalysisItem) {
        dataAnalysisItem.click();
    } else if (navItems.length > 0) {
        // 如果没有找到数据分析项，则默认点击第一个类别
        navItems[0].click();
    }
    
    // 添加点击事件处理程序到所有 href 为 # 的链接
    const links = document.querySelectorAll('a[href="#"]');
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
    
    // 添加页面加载动画
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'all 0.5s ease';
        
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 100 * index);
    });
    
    // 添加鼠标跟随效果
    document.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        
        const cards = document.querySelectorAll('.feature-card');
        cards.forEach(card => {
            const rect = card.getBoundingClientRect();
            const cardX = rect.left + rect.width / 2;
            const cardY = rect.top + rect.height / 2;
            
            const distance = Math.sqrt(Math.pow(mouseX - cardX, 2) + Math.pow(mouseY - cardY, 2));
            
            if (distance < 200) {
                const intensity = 1 - (distance / 200);
                card.style.boxShadow = `0 ${10 * intensity}px ${30 * intensity}px rgba(0, 212, 255, ${0.3 * intensity})`;
            } else {
                card.style.boxShadow = '';
            }
        });
    });
    
    // 添加点击波纹效果
    featureCards.forEach(card => {
        card.addEventListener('click', function(e) {
            const ripple = document.createElement('div');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                border-radius: 50%;
                background: rgba(0, 212, 255, 0.3);
                left: ${x}px;
                top: ${y}px;
                transform: scale(0);
                animation: rippleAnimation 0.6s ease-out;
                pointer-events: none;
            `;
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                if (ripple.parentNode) {
                    ripple.parentNode.removeChild(ripple);
                }
            }, 600);
        });
    });
    
    // 添加波纹动画
    const rippleStyle = document.createElement('style');
    rippleStyle.textContent = `
        @keyframes rippleAnimation {
            to {
                transform: scale(2);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(rippleStyle);
    
    // 导航栏滚动效果
    let lastScrollTop = 0;
    const navbar = document.querySelector('.cyber-navbar');
    
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            // 向下滚动 - 隐藏导航栏
            navbar.style.transform = 'translateY(-100%)';
        } else {
            // 向上滚动 - 显示导航栏
            navbar.style.transform = 'translateY(0)';
        }
        
        lastScrollTop = scrollTop;
    });
    
    // 添加导航栏过渡动画
    navbar.style.transition = 'transform 0.3s ease';
    
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
                    const dataAnalysisItem = document.querySelector('.nav-item[data-category="data-analysis"]');
                    if (dataAnalysisItem) dataAnalysisItem.click();
                    break;
                case '2':
                    const templatesItem = document.querySelector('.nav-item[data-category="templates"]');
                    if (templatesItem) templatesItem.click();
                    break;
                case '3':
                    const toolsItem = document.querySelector('.nav-item[data-category="tools"]');
                    if (toolsItem) toolsItem.click();
                    break;
                case '4':
                    const adminItem = document.querySelector('.nav-item[data-category="admin"]');
                    if (adminItem) adminItem.click();
                    break;
            }
        }
    });
});