(function () {
  'use strict';

  /* ============================================================
     图片资源清单（压缩后的 webp 图片，每店固定 3 张）
     ============================================================ */
  var STORE_PHOTOS = {
    shatou: [
      { file: 'shatou/01.webp', ratio: 1.33 },
      { file: 'shatou/02.webp', ratio: 1.33 },
      { file: 'shatou/03.webp', ratio: 1.05 }
    ],
    nansha: [
      { file: 'nansha/01.webp', ratio: 2.72 },
      { file: 'nansha/02.webp', ratio: 1.78 },
      { file: 'nansha/03.webp', ratio: 2.99 }
    ],
    foshan: [
      { file: 'foshan/01.webp', ratio: 0.80 },
      { file: 'foshan/02.webp', ratio: 1.37 },
      { file: 'foshan/03.webp', ratio: 1.60 }
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
     直接使用文件夹内的 3 张图片，双列流式布局，保持原始宽高比
     ============================================================ */
  function buildPhotoWall(storeName) {
    var container = document.getElementById('photos-' + storeName);
    if (!container) return;

    var photos = STORE_PHOTOS[storeName];
    if (!photos) return;

    var selected = photos;

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

    function openMenu() {
      nav.classList.add('open');
    }

    function closeMenu() {
      nav.classList.remove('open');
    }

    /* 移动端菜单切换 */
    toggle.addEventListener('click', function () {
      if (nav.classList.contains('open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    /* 点击导航链接关闭菜单 */
    var links = nav.querySelectorAll('.nav-links a');
    for (var i = 0; i < links.length; i++) {
      links[i].addEventListener('click', function () {
        closeMenu();
      });
    }

    /* 点击遮罩区域关闭菜单 */
    document.addEventListener('click', function (e) {
      if (nav.classList.contains('open') && !nav.contains(e.target)) {
        closeMenu();
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
    var storeNames = ['shatou', 'nansha', 'foshan'];
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
