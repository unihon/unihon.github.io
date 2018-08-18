$(window).scroll(function() {
    $(window).scrollTop() > 500 ? $("#rocket").addClass("show") : $("#rocket").removeClass("show");
});
$("#rocket").click(function() {
    $("html, body").animate({
        scrollTop: 0
    }, 500);
    return false;
});
