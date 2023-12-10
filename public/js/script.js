$(document).ready(function () {
  $('.show-all').addClass('selected');
    $('.buttons-wrapper .button').on('click', function (e) {
      e.preventDefault();
      $('.category').removeClass('selected');
      $(this).addClass('selected');
      var category = $(this).attr('href');
      $('.grid .project-item').show();
      $('.grid .project-item').has('.buttons-wrapper .button[href="' + category + '"]').show();
    });
  });


$(document).ready(function () {
  var itemsToShow = 4;
  var itemsIncrement = 2;
  var isFiltered = false;
  var filteredItems;

  function showItems() {
    $('.grid .project-item:lt(' + itemsToShow + ')').show();
  }

  function hideItems() {
    $('.grid .project-item').hide();
  }

  function loadMore() {
    itemsToShow += itemsIncrement;
    showItems();
    if (itemsToShow >= $('.grid .project-item').length) {
      $('.load-more-button').hide();
    }
  }

  function resetLoadMore() {
    var remainingItems = filteredItems.length - itemsToShow;
    for (var i = 0; i < remainingItems; i++) {
      filteredItems.slice(itemsToShow, itemsToShow + itemsIncrement).show();
      itemsToShow += itemsIncrement;
      remainingItems = filteredItems.length - itemsToShow;
    }
    if (itemsToShow < filteredItems.length) {
      $('.load-more-button').show();
    } else {
      $('.load-more-button').hide();
    }
  }

  hideItems();
  showItems();

  $('.buttons-wrapper .button').on('click', function (e) {
    e.preventDefault();
    var category = $(this).attr('href');

    itemsToShow = 4;
    isFiltered = true;
    hideItems();

    if ($(this).hasClass('show-all')) {
      isFiltered = false;

      showItems();
      $('.load-more-button').show();
    } else {
      filteredItems = $('.grid .project-item').has('.buttons-wrapper .button[href="' + category + '"]');
      filteredItems.slice(0, itemsToShow).show();
      $('.load-more-button').toggle(filteredItems.length > itemsToShow);

      // Scroll to the filtered category
      var scrollToElement = $('.scroll').offset().top;
      $('html, body').animate({ scrollTop: scrollToElement }, 500);
    }
  });


  $('.load-more-button').on('click', function () {
    if (isFiltered) {
      resetLoadMore();
    } else {
      loadMore();
    }
  });
});

  document.addEventListener('DOMContentLoaded', function () {
  var backToTopButton = document.getElementById('back-to-top-button');

  window.onscroll = function () {
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
      backToTopButton.style.display = 'block';
    } else {
      backToTopButton.style.display = 'none';
    }
  };

  backToTopButton.addEventListener('click', function () {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0; 
  });
});