(function () {
  'use strict';

  /* ============================================================
     图片资源清单（文件名 + 预估宽高比）
     ============================================================ */
  var STORE_PHOTOS = {
    沙头: [
      { file: '沙头/微信图片_20260508172424.jpg', ratio: 1.33 },
      { file: '沙头/微信图片_20260508172428.jpg', ratio: 1.33 },
      { file: '沙头/微信图片_20260508172431.jpg', ratio: 1.05 },
      { file: '沙头/微信图片_20260508172434.jpg', ratio: 1.33 },
      { file: '沙头/微信图片_20260508172437.jpg', ratio: 1.33 },
      { file: '沙头/微信图片_20260508172441.jpg', ratio: 1.06 },
      { file: '沙头/微信图片_20260508172444.png', ratio: 1.49 },
      { file: '沙头/微信图片_20260508172447.png', ratio: 1.50 },
      { file: '沙头/微信图片_20260508172451.png', ratio: 1.90 },
      { file: '沙头/微信图片_20260508172454.png', ratio: 1.54 },
      { file: '沙头/微信图片_20260508172457.png', ratio: 1.46 },
      { file: '沙头/微信图片_20260508172500.png', ratio: 1.52 }
    ],
    南沙: [
      { file: '南沙/微信图片_20260508172228.jpg', ratio: 2.72 },
      { file: '南沙/微信图片_20260508172246.jpg', ratio: 1.78 },
      { file: '南沙/微信图片_20260508172251.jpg', ratio: 2.99 },
      { file: '南沙/微信图片_20260508172257.jpg', ratio: 1.00 },
      { file: '南沙/微信图片_20260508172302.jpg', ratio: 1.44 },
      { file: '南沙/微信图片_20260508172306.jpg', ratio: 0.73 },
      { file: '南沙/微信图片_20260508172309.jpg', ratio: 0.80 },
      { file: '南沙/微信图片_20260508172313.jpg', ratio: 0.79 },
      { file: '南沙/微信图片_20260508172316.jpg', ratio: 1.78 },
      { file: '南沙/微信图片_20260508172320.jpg', ratio: 0.73 },
      { file: '南沙/微信图片_20260508172325.jpg', ratio: 1.43 }
    ],
    佛山: [
      { file: '佛山/微信图片_20260508172329.jpg', ratio: 0.80 },
      { file: '佛山/微信图片_20260508172337.jpg', ratio: 1.37 },
      { file: '佛山/微信图片_20260508172340.jpg', ratio: 1.60 },
      { file: '佛山/微信图片_20260508172344.jpg', ratio: 1.47 },
      { file: '佛山/微信图片_20260508172347.jpg', ratio: 1.48 },
      { file: '佛山/微信图片_20260508172351.jpg', ratio: 1.66 },
      { file: '佛山/微信图片_20260508172354.jpg', ratio: 1.80 },
      { file: '佛山/微信图片_20260508172358.jpg', ratio: 0.46 },
      { file: '佛山/微信图片_20260508172401.jpg', ratio: 1.11 },
      { file: '佛山/微信图片_20260508172405.jpg', ratio: 0.55 },
      { file: '佛山/微信图片_20260508172409.jpg', ratio: 1.49 },
      { file: '佛山/微信图片_20260508172413.jpg', ratio: 0.75 },
      { file: '佛山/微信图片_20260508172417.jpg', ratio: 0.48 },
      { file: '佛山/微信图片_20260508172420.jpg', ratio: 1.03 }
    ]
  };

  /* ============================================================
     工具函数
     ============================================================ */
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  /* ============================================================
     照片墙算法
     随机选取 3-4 张图片，双列流式布局，保持原始宽高比
     ============================================================ */
  function buildPhotoWall(storeName) {
    var container = document.getElementById('photos-' + storeName);
    if (!container) return;

    var photos = STORE_PHOTOS[storeName];
    if (!photos) return;

    var count = Math.random() < 0.5 ? 3 : 4;
    var selected = shuffle(photos).slice(0, count);

    /* 使用双列流式布局，每张图保持原始宽高比 */
    container.style.display = 'flex';
    container.style.flexWrap = 'wrap';
    container.style.gap = '4px';

    container.innerHTML = '';

    for (var i = 0; i < selected.length; i++) {
      var item = selected[i];
      var div = document.createElement('div');
      div.className = 'photo-item';
      div.style.overflow = 'hidden';
      div.style.backgroundColor = '#f0f0f0';

      /*
       计算每张图的弹性宽度：
       - 宽图（ratio > 1.5）：占满一行或较大比例
       - 普通图：约占 50%
       - 窄图/竖图（ratio < 0.85）：约占 40%-45%
      */
      var flexBasis;
      if (item.ratio > 2.0) {
        flexBasis = '100%';    /* 超宽图独占一行 */
      } else if (item.ratio > 1.5) {
        flexBasis = 'calc(50% - 2px)';  /* 宽图占一半 */
      } else if (item.ratio < 0.75) {
        flexBasis = 'calc(50% - 2px)';  /* 竖图也占一半，但高度更大 */
      } else if (item.ratio < 0.9) {
        flexBasis = 'calc(50% - 2px)';
      } else {
        flexBasis = 'calc(50% - 2px)';
      }

      div.style.flex = '0 0 ' + flexBasis;
      div.style.maxWidth = '100%';

      var img = document.createElement('img');
      img.src = item.file;
      img.alt = '门店实拍';
      img.loading = 'lazy';
      img.style.width = '100%';
      img.style.height = 'auto';
      img.style.display = 'block';
      img.style.objectFit = 'contain';
      img.style.backgroundColor = '#f0f0f0';

      div.appendChild(img);
      container.appendChild(div);
    }
  }

  /* ============================================================
     滚动渐入动画（Intersection Observer）
     参考 inferri.com 的动态逐步出现效果
     ============================================================ */
  function initScrollReveal() {
    var reveals = document.querySelectorAll('.reveal');
    if (!reveals.length) return;

    /* 如果浏览器不支持 IntersectionObserver，直接显示所有 */
    if (!('IntersectionObserver' in window)) {
      for (var i = 0; i < reveals.length; i++) {
        reveals[i].classList.add('visible');
      }
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].isIntersecting) {
          entries[i].target.classList.add('visible');
          /* 元素显示后不再观察，节省性能 */
          observer.unobserve(entries[i].target);
        }
      }
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    });

    for (var i = 0; i < reveals.length; i++) {
      observer.observe(reveals[i]);
    }
  }

  /* ============================================================
     导航栏交互
     ============================================================ */
  function initNav() {
    var nav = document.getElementById('nav');
    var toggle = document.getElementById('navToggle');
    if (!nav || !toggle) return;

    /* 滚动时添加背景 */
    var scrollHandler = function () {
      if (window.scrollY > 60) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    };
    window.addEventListener('scroll', scrollHandler, { passive: true });
    scrollHandler();

    /* 移动端菜单切换 */
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });

    /* 点击导航链接关闭菜单 */
    var links = nav.querySelectorAll('.nav-links a');
    for (var i = 0; i < links.length; i++) {
      links[i].addEventListener('click', function () {
        nav.classList.remove('open');
      });
    }

    /* 点击页面其他区域关闭菜单 */
    document.addEventListener('click', function (e) {
      if (nav.classList.contains('open') && !nav.contains(e.target)) {
        nav.classList.remove('open');
      }
    });
  }

  /* ============================================================
     门店横向滑动
     ============================================================ */
  function initStoreScroll() {
    var scroll = document.getElementById('storesScroll');
    var leftBtn = document.getElementById('storesArrowLeft');
    var rightBtn = document.getElementById('storesArrowRight');
    if (!scroll) return;

    if (leftBtn) {
      leftBtn.addEventListener('click', function () {
        scroll.scrollBy({ left: -400, behavior: 'smooth' });
      });
    }
    if (rightBtn) {
      rightBtn.addEventListener('click', function () {
        scroll.scrollBy({ left: 400, behavior: 'smooth' });
      });
    }

    /* 触摸滑动优化 */
    var touchStartX = 0;
    scroll.addEventListener('touchstart', function (e) {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });
  }

  /* ============================================================
     初始化
     ============================================================ */
  function init() {
    initNav();
    initScrollReveal();
    initStoreScroll();

    /* 为三家门店构建照片墙 */
    var storeNames = ['沙头', '南沙', '佛山'];
    for (var i = 0; i < storeNames.length; i++) {
      buildPhotoWall(storeNames[i]);
    }

    /* Hero 区域在页面加载后立即显示 */
    var heroReveals = document.querySelectorAll('.hero .reveal');
    for (var i = 0; i < heroReveals.length; i++) {
      heroReveals[i].classList.add('visible');
    }
  }

  /* DOM 就绪后初始化 */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
