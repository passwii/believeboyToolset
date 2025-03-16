document.addEventListener('DOMContentLoaded', function() {
    // 导航栏滚动隐藏/显示效果
    const nav = document.querySelector('.main-nav');
    let lastScrollTop = 0;
    let ticking = false;

    window.addEventListener('scroll', function() {
        if (!ticking) {
            window.requestAnimationFrame(function() {
                let currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
                
                if (currentScrollTop > lastScrollTop && currentScrollTop > 50) {
                    // 向下滚动
                    nav.classList.add('hide');
                    nav.classList.remove('show');
                } else {
                    // 向上滚动或在顶部
                    nav.classList.remove('hide');
                    nav.classList.add('show');
                }
                
                lastScrollTop = currentScrollTop <= 0 ? 0 : currentScrollTop;
                ticking = false;
            });
        }
        ticking = true;
    });

    // 下拉菜单功能
    const dropdowns = document.querySelectorAll('.dropdown');

    dropdowns.forEach(dropdown => {
        const link = dropdown.querySelector('.nav-link');
        const menu = dropdown.querySelector('.dropdown-menu');

        // 鼠标悬停时显示下拉菜单
        dropdown.addEventListener('mouseenter', () => {
            menu.style.display = 'block';
        });

        // 鼠标离开时隐藏下拉菜单
        dropdown.addEventListener('mouseleave', () => {
            menu.style.display = 'none';
        });

        // 阻止点击事件的默认行为
        link.addEventListener('click', (e) => {
            e.preventDefault();
            // 如果需要在点击时跳转到对应页面，可以添加以下代码：
            window.location.href = link.getAttribute('href');
        });
    });

    const hamburger = document.querySelector('.hamburger-menu');
    const navLinks = document.querySelector('.nav-links');

    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    const card = document.getElementById('market-insight-card');
    const detail = document.getElementById('market-insight-detail');
    const closeButton = detail.querySelector('.close-detail');

    card.addEventListener('click', function () {
        const overlay = document.createElement('div');
        overlay.classList.add('overlay');
        document.body.appendChild(overlay);
        detail.style.display = 'block';
    });

    closeButton.addEventListener('click', function () {
        detail.style.display = 'none';
        document.body.removeChild(document.querySelector('.overlay'));
    });
});
