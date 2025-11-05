const { JSDOM } = require('jsdom');
const jqueryFactory = require('jquery');
const sliderFactory = require('../js/slider');

function createDom() {
  return new JSDOM(`<!DOCTYPE html>
  <html lang="ru">
    <body>
      <div class="slider" id="test-slider">
        <div class="slider-track">
          <article class="slide"><div class="slide-content"><h2>Слайд 1</h2></div></article>
          <article class="slide"><div class="slide-content"><h2>Слайд 2</h2></div></article>
          <article class="slide"><div class="slide-content"><h2>Слайд 3</h2></div></article>
        </div>
        <button class="slider-control slider-prev" type="button">Назад</button>
        <button class="slider-control slider-next" type="button">Вперёд</button>
        <div class="slider-dots"></div>
      </div>
    </body>
  </html>`);
}

describe('simpleSlider', () => {
  let dom;
  let window;
  let document;
  let $;
  let sliderInstance;

  beforeEach(() => {
    dom = createDom();
    window = dom.window;
    document = window.document;

    global.window = window;
    global.document = document;

    $ = jqueryFactory(window);
    global.$ = $;
    global.jQuery = $;

    sliderFactory($);

    const $slider = $('#test-slider');
    $slider.css('width', '600');
    $slider.simpleSlider({ autoplay: false });
    sliderInstance = $slider.data('simpleSlider');
  });

  afterEach(() => {
    sliderInstance && sliderInstance.stopAutoplay();
    dom.window.close();
    delete global.window;
    delete global.document;
    delete global.$;
    delete global.jQuery;
  });

  test('активирует первый слайд и соответствующую точку', () => {
    const $slider = $('#test-slider');
    expect(sliderInstance.currentIndex).toBe(0);
    expect($slider.find('.slide').eq(0).hasClass('is-active')).toBe(true);
    expect($slider.find('.slider-dots button').eq(0).hasClass('is-active')).toBe(true);
  });

  test('переключает слайды по кнопкам', () => {
    const $slider = $('#test-slider');
    $slider.find('.slider-next').trigger('click');
    expect(sliderInstance.currentIndex).toBe(1);
    expect($slider.find('.slide').eq(1).hasClass('is-active')).toBe(true);

    $slider.find('.slider-prev').trigger('click');
    expect(sliderInstance.currentIndex).toBe(0);
    expect($slider.find('.slide').eq(0).hasClass('is-active')).toBe(true);
  });

  test('обновляет ширину дорожки при вызове updateDimensions', () => {
    const $slider = $('#test-slider');
    sliderInstance.updateDimensions();
    expect(sliderInstance.slideWidth).toBe(600);
    const trackWidth = parseInt($slider.find('.slider-track').css('width'), 10);
    expect(trackWidth).toBe(1800);
  });
});
