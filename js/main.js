$(function(){
	$(".edit1").click(function(){
		$(".mask").show();
		$(".modal2").show();
	})
	$(".edit").click(function(){
		$(".mask").show();
		$(".modal1").show();
	})
	$(".close").click(function(){
		$(".mask").hide();
		$(".modal").hide();
	})
	$(".sort li").click(function(){
		$(this).addClass('active').siblings().removeClass('active')
	})
	$(".btn-box button").click(function(){
		$(this).addClass('active').siblings().removeClass('active')
	});
	$(".return-top").click(function() {
      $("html,body").animate({scrollTop:0}, 500);
  }); 
})