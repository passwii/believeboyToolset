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
            document.getElementById(category).classList.add('active');
        });
    });

    // 默认显示第一个类别
    categoryItems[0].click();

    // 添加点击事件处理程序到所有 href 为 # 的链接
    const links = document.querySelectorAll('a[href="#"]');
    links.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            alert('仅限内网使用');
        });
    });
});
