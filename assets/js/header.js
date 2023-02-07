$(function () {
  let didScroll;
  let lastScrollTop = 0;
  let delta = 5;
  const header = $('header');
  let headerHeight = header.outerHeight(true);
  let offset = $('main').offset();

  $(window).scroll(function () {
    didScroll = true;
  });

  setInterval(function () {
    if (didScroll) {
      hasScrolled();
      didScroll = false;
    }
  }, 250);

  function hasScrolled() {
    let st = $(this).scrollTop();

    if (st > offset.top) {
      header.addClass('filled');
    } else {
      header.removeClass('filled');
    }
    if (Math.abs(lastScrollTop - st) <= delta) return;

    if (st > lastScrollTop && st > headerHeight) {
      header.addClass('up');
    } else {
      if (st + $(window).height() < $(document).height()) {
        header.removeClass('up');
      }
    }

    lastScrollTop = st;
  }
});
