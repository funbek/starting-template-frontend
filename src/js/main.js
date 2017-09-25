$(document).ready(function() {
	// Add class active
	$(".trigger-button").on("click", function() {
			$(".trigger-button").not(this).removeClass("active");
			$(this).toggleClass("active");
	});

	// hide element if event click not by them
	$(document).on( "click", function(event){
			if( $(event.target).closest(".trigger-button, .hidden-block").length )
			return;
				$(".trigger-button.active").removeClass("active");
				event.stopPropagation();
	});

	if ( $(".tabs") ) {
		// Tabs
		$(".tabs-container").delegate(".tabs-container__list:not(.tabs-container__list_current)", "click", function() {
			$(this)
				.addClass("tabs-container__list_current")
				.siblings()
				.removeClass("tabs-container__list_current")
				.parents(".tabs-container__head")
	      .siblings(".tabs-container__content")
				.eq(0).find(" > .tabs-container__item")
				.hide()
	      .removeClass("tabs-container__item_active")
				.eq($(this).index())
	      .addClass("tabs-container__item_active")
				.fadeIn(500).show();
				return false;
		})
		// Accoridion on mobile devices
		$(".accordion-trigger").on("click", function() {
			if ( $(this).hasClass("active") ){
				$(this).removeClass("active");
				$(this).siblings(".accordion-content").slideUp(200);
			} else {
				$(".accordion-trigger").removeClass("active");
				$(this).addClass("active");
				$(".accordion-content").slideUp(200);
				$(this).siblings(".accordion-content").slideDown(200);
			}
		});
	}
})
