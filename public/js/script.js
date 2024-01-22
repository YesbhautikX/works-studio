let mainCategories = document.querySelectorAll('.main-category');
let subcategoryContainers = document.querySelectorAll('.subcategory-container');
let goBackButton = document.getElementById('go-back-button'); // assuming you have a button with the id 'go-back-button'
let subcategoryall = document.getElementById('subcategoryall'); // assuming you have a button with the id 'go-back-button'

mainCategories.forEach((mainCategory, index) => {
  mainCategory.addEventListener('click', () => {
    // Check if the selected category is "All"
    if (index === 0) {
      // For "Show All" button, show all main categories and hide the go back button
      document.querySelector('.buttons-wrapper').style.display = 'flex';
      goBackButton.style.display = 'none';

      // Hide all subcategory containers
      subcategoryContainers.forEach(subcategoryContainer => {
        subcategoryContainer.style.display = 'none';
      });
    } else {
      // Hide all main categories, except for "Show All"
    mainCategories.forEach(category => {
      category.style.display = 'none';
    });
      // Show the go back button
      goBackButton.style.display = 'block';
      $(document).ready(function () {
 
        $('.all').addClass('selected');
    });

      // Hide all subcategory containers
      subcategoryContainers.forEach(subcategoryContainer => {
        subcategoryContainer.style.display = 'none';
      });

      // Display the selected subcategory container
      if (index !== 0) {
        subcategoryContainers[index - 1].style.display = 'flex';
      }
    }
  });
});

goBackButton.addEventListener('click', () => {
  // Show all main categories
    mainCategories.forEach(category => {
      category.style.display = 'flex';
    });
  // Hide the go back button
  goBackButton.style.display = 'none';

  // Hide all subcategory containers
  subcategoryContainers.forEach(subcategoryContainer => {
    subcategoryContainer.style.display = 'none';
  });
  $(document).ready(function () {
 
    $('.grid .project-item').show();
    $('.Select-category').removeClass('selected');
    $('.show-all').addClass('selected');
});
});


$(document).ready(function () {
  $('.show-all').addClass('selected');
  $('.buttons-wrapper .button').on('click', function (e) {
    e.preventDefault();
    $('.Select-category').removeClass('selected');

    $(this).addClass('selected');
    var categoryClass = $(this).attr('class').split(' ').find(c => c !== 'button' && c !== 'Select-category');

    $('.grid .project-item').show();
    $('.grid .project-item').has('.buttons-wrapper .button.' + categoryClass).show();
  });
});



$(document).ready(function () {
  var itemsToShow = 4;
  var itemsIncrement = 2;
  var isFiltered = false;
  var filteredItems;
 
  function showItems() {
     $(".grid .project-item:lt(" + itemsToShow + ")").show();
  }
 
  function hideItems() {
     $(".grid .project-item").hide();
  }
 
  function loadMore() {
     itemsToShow += itemsIncrement;
     showItems();
     if (itemsToShow >= $(".grid .project-item").length) {
       $(".load-more-button").hide();
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
       $(".load-more-button").show();
     } else {
       $(".load-more-button").hide();
     }
  }
 
  hideItems();
  showItems();
 
  $(".buttons-wrapper .button").on("click", function (e) {
     e.preventDefault();
     var categoryClass = $(this)
       .attr("class")
       .split(" ")
       .find((c) => c !== "button" && c !== "category");
 
     itemsToShow = 4;
     isFiltered = true;
     hideItems();
 
     if ($(this).hasClass("show-all")) {
       isFiltered = false;
       showItems();
       $(".load-more-button").show();
     } else {
       filteredItems = $(".grid .project-item").has(
         ".buttons-wrapper .button." + categoryClass
       );
       filteredItems.slice(0, itemsToShow).show();
       $(".load-more-button").toggle(filteredItems.length > itemsToShow);
 
       // Scroll to the filtered category
       var scrollToElement = $(".scroll").offset().top;
       $("html, body").animate({ scrollTop: scrollToElement }, 500);
     }
  });
 
  $(".button.subcategory").on("click", function (e) {
     e.preventDefault();
     var selectedCategory = $(this).data("category");
 
     // Hide all project items
     $(".project-item").hide();
 
     // Show project items matching the selected subcategory
     filteredItems = $(".project-item[data-category*='" + selectedCategory + "']");
     filteredItems.slice(0, itemsToShow).show();
     $(".load-more-button").toggle(filteredItems.length > itemsToShow);
  });
 
  $(".load-more-button").on("click", function () {
     if (isFiltered) {
       resetLoadMore();
     } else {
       loadMore();
     }
  });
 });


