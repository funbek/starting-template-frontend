$(document).ready(function() {
	// добавление класса active
	$(".trigger-button").on("click", function() {
			$(".trigger-button").not(this).removeClass("active");
			$(this).toggleClass("active");
	});

	// скрытие пункта с active при нажатии на свободную область
	$(document).on( "click", function(event){
			if( $(event.target).closest(".trigger-button, .hidden-block").length )
			return;
				$(".trigger-button.active").removeClass("active");
				event.stopPropagation();
	});

	if ( $(".tabs") ) {
		// табы
		$(".tabs").delegate(".tab-list:not(.current)", "click", function() {
			$(this)
			.addClass("current")
			.siblings()
			.removeClass("current")
			.parents("div.tabs-content")
			.eq(0).find(">div.box")
			.hide()
			.eq($(this).index())
			.fadeIn(500).show();
			return false;
		})
		// !!!! На мобильных устройствах делаем аккордеон
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
