//切换toc
function tocShow(){
	$('#blog-sidebar').css('display','none');
	$('#hon-toc').fadeIn();
	$('.toc-and-sidebar').css({'position':'sticky'});
	$('#sidebar').css({'max-height':'calc(100vh - 80px)'});
	$(':root').css({'--big-now-sidebar':'calc(100vh - 80px)'});
	$(':root').css({'--big-now-toc-text':"'Sidebar'"});
}
function minTocShow(){ 
	$('.toc-and-sidebar').animate({'right':'0px'},'fast','swing');
	$('#sidebar').css({'max-height':'calc(100vh)'});
	$(':root').css({'--min-now-sidebar':'calc(100vh)'});
}

//切换sidebar
function tocClose(){
	$('#hon-toc').css('display','none');
	$('#blog-sidebar').fadeIn();
	$('.toc-and-sidebar').css({'position':'static'});
	$('#sidebar').css({'max-height':'none','padding-bottom':'0px'});
	$(':root').css({'--big-now-sidebar':'none'});
	$(':root').css({'--big-now-toc-text':"'Toc'"});
}
function minTocClose(){
	$('.toc-and-sidebar').animate({'right':'-100%'},'fast','swing',function(){
		$('#sidebar').css({'max-height':'none'});
		$(':root').css({'--min-now-sidebar':'none'});
	});
}

var switch_tag = 1;
$('.toc-switch').click(function(){
	var state = $('.toc-and-sidebar').css('--min_tag');
	//1时为小屏
	if(state == 1){
		minTocShow();
	}else{
		if(switch_tag){
			tocShow();
		}else{
			tocClose();
			$("html, body").animate({
				scrollTop: 0
			}, 500);
		}
		switch_tag = !switch_tag;
	}
})

$('.toc-link').click(function(){
	var state = $('.toc-and-sidebar').css('--min_tag');
	if(state == 1){
		minTocClose();
	}
})
$('#sidebar').click(function(e){
	if(e.target == e.currentTarget){
		var state = $('.toc-and-sidebar').css('--min_tag');
		if(state == 1){
			minTocClose();
		}
	}
})
