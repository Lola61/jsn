(function (factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory;
  } else {
    factory(window.jQuery);
  }
})(function ($) {
  if (!$) {
    throw new Error('jQuery не найден. Подключите jQuery до slider.js.');
  }

  var defaults = {
    autoplay: true,
    interval: 4000,
    pauseOnHover: true,
    dots: true
  };

  function getWidth($el) {
    var width = $el.width();
    if (!width) {
      var cssWidth = parseFloat($el.css('width'));
      if (!isNaN(cssWidth)) {
        width = cssWidth;
      }
    }
    if (!width && $el[0]) {
      width = $el[0].clientWidth || $el[0].offsetWidth;
    }
    return width || 0;
  }

  function setupDots($slider, $slides) {
    var $dotsContainer = $slider.find('.slider-dots');
    if (!$dotsContainer.length) {
      $dotsContainer = $('<div class="slider-dots" role="tablist"></div>').appendTo($slider);
    }
    $dotsContainer.empty();
    $slides.each(function (index) {
      var $dot = $('<button type="button" class="slider-dot" role="tab"></button>');
      $dot.attr('aria-label', 'Перейти к слайду ' + (index + 1));
      $dot.attr('data-index', index);
      $dotsContainer.append($dot);
    });
    return $dotsContainer;
  }

  function SimpleSlider($slider, options) {
    this.settings = $.extend({}, defaults, options);
    this.$slider = $slider;
    this.$track = $slider.find('.slider-track');
    this.$slides = this.$track.find('.slide');
    this.slideCount = this.$slides.length;
    this.currentIndex = 0;
    this.timer = null;
    this.$dotsContainer = null;
    this.slideWidth = 0;
    this.isHovered = false;

    if (!this.slideCount) {
      return;
    }

    this.init();
  }

  SimpleSlider.prototype.init = function () {
    var self = this;

    if (this.settings.dots) {
      this.$dotsContainer = setupDots(this.$slider, this.$slides);
      this.$dotsContainer.on('click', 'button', function (event) {
        var index = parseInt($(event.currentTarget).attr('data-index'), 10);
        self.goTo(index);
      });
    }

    this.$slider.addClass('is-ready');
    this.$slides.eq(0).addClass('is-active');
    this.updateDimensions();
    this.bindEvents();
    this.updateDots();

    if (this.settings.autoplay) {
      this.startAutoplay();
    }

    this.$slider.data('simpleSlider', this);
  };

  SimpleSlider.prototype.bindEvents = function () {
    var self = this;
    this.$slider.find('.slider-next').on('click', function () {
      self.next();
    });

    this.$slider.find('.slider-prev').on('click', function () {
      self.prev();
    });

    $(window).on('resize.simpleSlider', function () {
      self.updateDimensions();
    });

    if (this.settings.pauseOnHover) {
      this.$slider.on('mouseenter', function () {
        self.isHovered = true;
        self.stopAutoplay();
      });
      this.$slider.on('mouseleave', function () {
        self.isHovered = false;
        self.startAutoplay();
      });
    }
  };

  SimpleSlider.prototype.updateDimensions = function () {
    this.slideWidth = getWidth(this.$slider);
    if (!this.slideWidth) {
      return;
    }

    var totalWidth = this.slideWidth * this.slideCount;
    this.$slides.css('width', this.slideWidth + 'px');
    this.$track.css({
      width: totalWidth + 'px',
      transform: 'translateX(' + (-this.currentIndex * this.slideWidth) + 'px)'
    });
  };

  SimpleSlider.prototype.updateDots = function () {
    if (!this.$dotsContainer) {
      return;
    }
    var $buttons = this.$dotsContainer.find('button');
    $buttons.removeClass('is-active').attr('aria-selected', 'false');
    $buttons.eq(this.currentIndex).addClass('is-active').attr('aria-selected', 'true');
  };

  SimpleSlider.prototype.goTo = function (index) {
    if (!this.slideCount) {
      return;
    }

    var normalizedIndex = (index + this.slideCount) % this.slideCount;
    this.currentIndex = normalizedIndex;

    this.$slides.removeClass('is-active').eq(this.currentIndex).addClass('is-active');
    this.$track.css('transform', 'translateX(' + (-this.currentIndex * this.slideWidth) + 'px)');
    this.updateDots();
  };

  SimpleSlider.prototype.next = function () {
    this.goTo(this.currentIndex + 1);
  };

  SimpleSlider.prototype.prev = function () {
    this.goTo(this.currentIndex - 1);
  };

  SimpleSlider.prototype.startAutoplay = function () {
    var self = this;
    if (!this.settings.autoplay || this.timer) {
      return;
    }
    this.timer = setInterval(function () {
      if (!self.isHovered) {
        self.next();
      }
    }, this.settings.interval);
  };

  SimpleSlider.prototype.stopAutoplay = function () {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  };

  $.fn.simpleSlider = function (options) {
    return this.each(function () {
      var $this = $(this);
      if (!$this.data('simpleSlider')) {
        new SimpleSlider($this, options);
      }
    });
  };

  return $.fn.simpleSlider;
});
