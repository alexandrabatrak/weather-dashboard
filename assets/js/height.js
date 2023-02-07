// dynamically calculate elements size - lately I have this everywhere lol
let height = (() => {
  if (window.matchMedia('(min-width: 768px)').matches) {
    $('#today').css(
      'min-height',
      `calc(100vh - 250px - ${$('header').outerHeight(true)}px)`
    );
    $('main').css('padding-top', `${$('header').outerHeight(true)}px`);
  }
})();

let history = (() =>
  $('#history').css({
    width: `${$('.search-wrapper').outerWidth(true)}px`,
    top: `${$('header').outerHeight(true)}px`,
  }))();

window.onresize = () => {
  height;
  history;
};
