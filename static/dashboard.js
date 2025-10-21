/**
 * 仪表板交互逻辑
 */

class Dashboard {
    constructor() {
        this.statistics = null;
        this.charts = {};
        this.refreshInterval = null;
        this.init();
    }

    init() {
        this.loadStatistics();
        this.initEventListeners();
        this.startAutoRefresh();
    }

    /**
     * 加载统计数据
     */
    async loadStatistics() {
        try {
            this.showLoading();
            const response = await fetch('/api/statistics');
            const result = await response.json();
            
            if (result.success) {
                this.statistics = result.data;
                this.renderDashboard();
            } else {
                this.showError('加载统计数据失败: ' + result.error);
            }
        } catch (error) {
            console.error('加载统计数据失败:', error);
            this.showError('加载统计数据失败，请检查网络连接');
        } finally {
            this.hideLoading();
        }
    }

    /**
     * 渲染仪表板
     */
    renderDashboard() {
        if (!this.statistics) return;

        this.renderStatCards();
        this.renderTrendChart();
        this.renderPieChart();
        this.renderRecentActivities();
        this.renderSystemStatus();
    }

    /**
     * 渲染统计卡片
     */
    renderStatCards() {
        const stats = this.statistics.report_statistics;
        
        // 日报统计
        this.updateStatCard('daily', {
            today: stats.daily.today,
            week: stats.daily.week,
            month: stats.daily.month
        });
        
        // 月报统计
        this.updateStatCard('monthly', {
            month: stats.monthly.month,
            quarter: stats.monthly.quarter
        });
        
        // 产品分析统计
        this.updateStatCard('product-analysis', {
            week: stats.product_analysis.week,
            month: stats.product_analysis.month
        });
        
        // 总报告数
        const totalReports = stats.daily.month + stats.monthly.month + stats.product_analysis.month;
        this.updateStatCard('total', {
            total: totalReports
        });
    }

    /**
     * 更新统计卡片
     */
    updateStatCard(type, data) {
        let cardElement, valueElement, subtitleElement;
        
        switch(type) {
            case 'daily':
                cardElement = document.querySelector('[data-stat-type="daily"]');
                valueElement = cardElement?.querySelector('.stat-value');
                subtitleElement = cardElement?.querySelector('.stat-subtitle');
                if (valueElement) valueElement.textContent = data.today;
                if (subtitleElement) subtitleElement.textContent = `本周: ${data.week}, 本月: ${data.month}`;
                break;
                
            case 'monthly':
                cardElement = document.querySelector('[data-stat-type="monthly"]');
                valueElement = cardElement?.querySelector('.stat-value');
                subtitleElement = cardElement?.querySelector('.stat-subtitle');
                if (valueElement) valueElement.textContent = data.month;
                if (subtitleElement) subtitleElement.textContent = `本季度: ${data.quarter}`;
                break;
                
            case 'product-analysis':
                cardElement = document.querySelector('[data-stat-type="product-analysis"]');
                valueElement = cardElement?.querySelector('.stat-value');
                subtitleElement = cardElement?.querySelector('.stat-subtitle');
                if (valueElement) valueElement.textContent = data.week;
                if (subtitleElement) subtitleElement.textContent = `本月: ${data.month}`;
                break;
                
            case 'total':
                cardElement = document.querySelector('[data-stat-type="total"]');
                valueElement = cardElement?.querySelector('.stat-value');
                subtitleElement = cardElement?.querySelector('.stat-subtitle');
                if (valueElement) valueElement.textContent = data.total;
                if (subtitleElement) subtitleElement.textContent = '所有类型报告';
                break;
        }
    }

    /**
     * 渲染趋势图表
     */
    renderTrendChart() {
        const canvas = document.getElementById('trend-chart');
        if (!canvas || !this.statistics.report_statistics.trend_data) return;

        const ctx = canvas.getContext('2d');
        const trendData = this.statistics.report_statistics.trend_data;
        
        // 准备图表数据
        const labels = trendData.map(item => {
            const date = new Date(item.date);
            return `${date.getMonth() + 1}/${date.getDate()}`;
        });
        
        const dailyData = trendData.map(item => item.daily);
        const monthlyData = trendData.map(item => item.monthly);
        const productAnalysisData = trendData.map(item => item.product_analysis);

        // 简单的图表绘制（不依赖外部库）
        this.drawLineChart(ctx, {
            labels,
            datasets: [
                {
                    label: '日报',
                    data: dailyData,
                    color: '#00d4ff'
                },
                {
                    label: '月报',
                    data: monthlyData,
                    color: '#00ff88'
                },
                {
                    label: '产品分析',
                    data: productAnalysisData,
                    color: '#ffaa00'
                }
            ]
        });
    }

    /**
     * 渲染饼图
     */
    renderPieChart() {
        const canvas = document.getElementById('pie-chart');
        if (!canvas || !this.statistics.report_statistics) return;

        const ctx = canvas.getContext('2d');
        const stats = this.statistics.report_statistics;
        
        const data = [
            { label: '日报', value: stats.daily.month, color: '#00d4ff' },
            { label: '月报', value: stats.monthly.month, color: '#00ff88' },
            { label: '产品分析', value: stats.product_analysis.month, color: '#ffaa00' }
        ];

        this.drawPieChart(ctx, data);
    }

    /**
     * 绘制折线图
     */
    drawLineChart(ctx, config) {
        const canvas = ctx.canvas;
        const width = canvas.width = canvas.offsetWidth * 2;
        const height = canvas.height = canvas.offsetHeight * 2;
        ctx.scale(2, 2);
        
        const padding = 40;
        const chartWidth = canvas.offsetWidth - padding * 2;
        const chartHeight = canvas.offsetHeight - padding * 2;
        
        // 清空画布
        ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
        
        // 绘制坐标轴
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, canvas.offsetHeight - padding);
        ctx.lineTo(canvas.offsetWidth - padding, canvas.offsetHeight - padding);
        ctx.stroke();
        
        // 绘制数据
        const maxValue = Math.max(...config.datasets.flatMap(d => d.data), 1);
        const xStep = chartWidth / (config.labels.length - 1);
        
        config.datasets.forEach(dataset => {
            ctx.strokeStyle = dataset.color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            
            dataset.data.forEach((value, index) => {
                const x = padding + index * xStep;
                const y = canvas.offsetHeight - padding - (value / maxValue) * chartHeight;
                
                if (index === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
                
                // 绘制数据点
                ctx.fillStyle = dataset.color;
                ctx.beginPath();
                ctx.arc(x, y, 3, 0, Math.PI * 2);
                ctx.fill();
            });
            
            ctx.stroke();
        });
        
        // 绘制标签
        ctx.fillStyle = '#888';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        
        config.labels.forEach((label, index) => {
            const x = padding + index * xStep;
            ctx.fillText(label, x, canvas.offsetHeight - padding + 20);
        });
    }

    /**
     * 绘制饼图
     */
    drawPieChart(ctx, data) {
        const canvas = ctx.canvas;
        const width = canvas.width = canvas.offsetWidth * 2;
        const height = canvas.height = canvas.offsetHeight * 2;
        ctx.scale(2, 2);
        
        const centerX = canvas.offsetWidth / 2;
        const centerY = canvas.offsetHeight / 2;
        const radius = Math.min(centerX, centerY) - 40;
        
        // 清空画布
        ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
        
        // 计算总和
        const total = data.reduce((sum, item) => sum + item.value, 0) || 1;
        
        // 绘制饼图
        let currentAngle = -Math.PI / 2;
        
        data.forEach(item => {
            const sliceAngle = (item.value / total) * Math.PI * 2;
            
            // 绘制扇形
            ctx.fillStyle = item.color;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
            ctx.closePath();
            ctx.fill();
            
            // 绘制标签
            const labelAngle = currentAngle + sliceAngle / 2;
            const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7);
            const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7);
            
            ctx.fillStyle = '#fff';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(item.label, labelX, labelY);
            ctx.fillText(`${item.value}`, labelX, labelY + 15);
            
            currentAngle += sliceAngle;
        });
    }

    /**
     * 渲染最近活动
     */
    renderRecentActivities() {
        const container = document.getElementById('activity-list');
        if (!container || !this.statistics.report_statistics.recent_activities) return;
        
        const activities = this.statistics.report_statistics.recent_activities;
        
        if (activities.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <p>暂无最近活动</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = activities.map(activity => `
            <li class="activity-item">
                <div class="activity-icon">
                    <i class="fas fa-chart-line"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-action">${activity.action}</div>
                    <div class="activity-meta">${activity.username || '系统'}</div>
                </div>
                <div class="activity-time">${this.formatTime(activity.timestamp)}</div>
            </li>
        `).join('');
    }

    /**
     * 渲染系统状态
     */
    renderSystemStatus() {
        const status = this.statistics.system_status;
        
        // 数据库状态
        this.updateStatusItem('database', {
            isOnline: status.database_status === '正常',
            value: status.database_status
        });
        
        // 用户数量
        this.updateStatusItem('users', {
            value: status.user_count
        });
        
        // 日志数量
        this.updateStatusItem('logs', {
            value: status.log_count
        });
        
        // 最近登录
        const lastLoginText = status.last_login 
            ? `${status.last_login.username} - ${this.formatTime(status.last_login.timestamp)}`
            : '无记录';
        this.updateStatusItem('last-login', {
            value: lastLoginText
        });
    }

    /**
     * 更新状态项
     */
    updateStatusItem(type, data) {
        const element = document.querySelector(`[data-status-type="${type}"]`);
        if (!element) return;
        
        const indicator = element.querySelector('.status-indicator');
        const valueElement = element.querySelector('.status-value');
        
        if (indicator && data.isOnline !== undefined) {
            indicator.className = `status-indicator ${data.isOnline ? 'online' : 'offline'}`;
        }
        
        if (valueElement) {
            valueElement.textContent = data.value;
        }
    }

    /**
     * 格式化时间
     */
    formatTime(timestamp) {
        if (!timestamp) return '';
        
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 1) return '刚刚';
        if (diffMins < 60) return `${diffMins}分钟前`;
        if (diffHours < 24) return `${diffHours}小时前`;
        if (diffDays < 7) return `${diffDays}天前`;
        
        return date.toLocaleDateString('zh-CN');
    }

    /**
     * 初始化事件监听器
     */
    initEventListeners() {
        // 统计卡片点击事件
        document.querySelectorAll('.stat-card').forEach(card => {
            card.addEventListener('click', () => {
                const statType = card.getAttribute('data-stat-type');
                this.handleStatCardClick(statType);
            });
        });
        
        // 刷新按钮
        const refreshBtn = document.querySelector('.refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.loadStatistics();
            });
        }
    }

    /**
     * 处理统计卡片点击
     */
    handleStatCardClick(statType) {
        // 根据统计类型跳转到对应页面
        switch(statType) {
            case 'daily':
                this.navigateToPage('daily-report');
                break;
            case 'monthly':
                this.navigateToPage('monthly-report');
                break;
            case 'product-analysis':
                this.navigateToPage('product-analysis');
                break;
            case 'total':
                // 总报告数可以跳转到日志页面
                this.navigateToPage('log-management');
                break;
        }
    }

    /**
     * 导航到指定页面
     */
    navigateToPage(contentType) {
        // 触发对应导航项的点击事件
        const navLink = document.querySelector(`[data-content="${contentType}"]`);
        if (navLink) {
            navLink.click();
        }
    }

    /**
     * 开始自动刷新
     */
    startAutoRefresh() {
        // 每5分钟自动刷新一次
        this.refreshInterval = setInterval(() => {
            this.loadStatistics();
        }, 5 * 60 * 1000);
    }

    /**
     * 停止自动刷新
     */
    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }

    /**
     * 显示加载状态
     */
    showLoading() {
        const container = document.querySelector('.dashboard-container');
        if (container) {
            container.classList.add('loading');
        }
    }

    /**
     * 隐藏加载状态
     */
    hideLoading() {
        const container = document.querySelector('.dashboard-container');
        if (container) {
            container.classList.remove('loading');
        }
    }

    /**
     * 显示错误信息
     */
    showError(message) {
        // 使用现有的通知系统
        if (window.showNotification) {
            window.showNotification(message, 'error');
        } else {
            console.error(message);
        }
    }

    /**
     * 销毁仪表板
     */
    destroy() {
        this.stopAutoRefresh();
        
        // 清理图表
        Object.values(this.charts).forEach(chart => {
            if (chart.destroy) {
                chart.destroy();
            }
        });
        
        this.charts = {};
        this.statistics = null;
    }
}

// 页面加载完成后初始化仪表板
document.addEventListener('DOMContentLoaded', function() {
    // 检查是否在首页
    const defaultSection = document.querySelector('.default-section');
    if (defaultSection) {
        // 等待内容加载完成后再初始化仪表板
        setTimeout(() => {
            if (defaultSection.classList.contains('active')) {
                window.dashboard = new Dashboard();
            }
        }, 100);
    }
});

// 当页面切换时，确保仪表板正确初始化或销毁
const originalLoadContent = window.loadContent;
if (originalLoadContent) {
    window.loadContent = function(contentType) {
        // 销毁现有仪表板
        if (window.dashboard) {
            window.dashboard.destroy();
            window.dashboard = null;
        }
        
        // 调用原始函数
        originalLoadContent(contentType);
    };
}

// 当返回首页时重新初始化仪表板
const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
            const defaultSection = document.querySelector('.default-section');
            if (defaultSection && defaultSection.classList.contains('active') && !window.dashboard) {
                setTimeout(() => {
                    window.dashboard = new Dashboard();
                }, 100);
            }
        }
    });
});

// 开始观察
const defaultSection = document.querySelector('.default-section');
if (defaultSection) {
    observer.observe(defaultSection, { attributes: true });
}