document.addEventListener('DOMContentLoaded', function() {
    const categoryItems = document.querySelectorAll('.category-item');
    const subcategoryGrids = document.querySelectorAll('.subcategory-grid');

    categoryItems.forEach(item => {
        item.addEventListener('click', function() {
            // 移除所有活动类
            categoryItems.forEach(i => i.classList.remove('active'));
            subcategoryGrids.forEach(grid => grid.classList.remove('active'));

            // 添加活动类到当前项
            this.classList.add('active');
            const category = this.getAttribute('data-category');
            const targetGrid = document.getElementById(category);
            
            // 添加淡入效果
            setTimeout(() => {
                targetGrid.classList.add('active');
            }, 10);
        });
    });

    // 默认显示数据类别
    const dataAnalysisItem = document.querySelector('.category-item[data-category="data-analysis"]');
    if (dataAnalysisItem) {
        dataAnalysisItem.click();
    } else {
        // 如果没有找到数据分类项，则默认点击第一个类别
        categoryItems[0].click();
    }

    // 添加点击事件处理程序到所有 href 为 # 的链接
    const links = document.querySelectorAll('a[href="#"]');
    links.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            // 创建一个更现代化的提示
            const tooltip = document.createElement('div');
            tooltip.textContent = '仅限内网使用';
            tooltip.style.position = 'fixed';
            tooltip.style.top = '50%';
            tooltip.style.left = '50%';
            tooltip.style.transform = 'translate(-50%, -50%)';
            tooltip.style.backgroundColor = '#ff6b6b';
            tooltip.style.color = 'white';
            tooltip.style.padding = '15px 25px';
            tooltip.style.borderRadius = '8px';
            tooltip.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
            tooltip.style.zIndex = '10000';
            tooltip.style.fontSize = '18px';
            tooltip.style.fontWeight = '600';
            tooltip.style.opacity = '0';
            tooltip.style.transition = 'opacity 0.3s ease';
            
            document.body.appendChild(tooltip);
            
            // 淡入效果
            setTimeout(() => {
                tooltip.style.opacity = '1';
            }, 10);
            
            // 3秒后自动移除
            setTimeout(() => {
                tooltip.style.opacity = '0';
                setTimeout(() => {
                    document.body.removeChild(tooltip);
                }, 300);
            }, 3000);
        });
    });
});
