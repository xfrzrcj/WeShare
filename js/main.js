$(function(){
	$(".edit1").click(function(){
		/*$(".mask").show();
		$(".modal2").show();*/
		onClickCallDapp()
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
	/*$(".btn-box button").click(function(){
		$(this).addClass('active').siblings().removeClass('active')
	});*/
	$(".return-top").click(function() {
        $("html,body").animate({scrollTop:0}, 500);
    }); 
     var NebPay = require("nebpay");
		var nebPay = new NebPay();

		//to check if the extension is installed
		//if the extension is installed, var "webExtensionWallet" will be injected in to web page
		if(typeof(webExtensionWallet) === "undefined"){
			alert ("Extension wallet is not installed, please install it first.")
		}
		
		
		function onClickCallDapp() {
			var to = "n1huG18QbozvJn3Hdyn11sBKkvHQ9pdRz7D";
			var value = 0;
			var callFunction = 'publicMsg';
			var callArgs = '["dsfsfs"]';
			nebPay.call(to, value, callFunction, callArgs, {
				qrcode: {
					showQRCode: true
				},
				goods: {
					name: "test",
					desc: "test goods"
				},
				//callback: cbCallDapp
				listener: cbCallDapp
			});
		}

		function cbCallDapp(resp){
			console.log("callback resp: " + JSON.stringify(resp))
			document.getElementById("callResult").innerHTML = "call Dapp result:\n" +  JSON.stringify(resp)
		}

       
		//onClickCallDapp()
})
function dianzan(th){
	//点赞
        var hash=th.parent().parent().index();
        $.ajax({
            contentType:"application/json",
            data:'{"from":"n1EjkdHBDpdjFfVaeJqMQW11RhYqrrjCZR7","to":"n1huG18QbozvJn3Hdyn11sBKkvHQ9pdRz7D","value":"0","nonce":3,"gasPrice":"1000000","gasLimit":"2000000","contract":{"function":"star","args":"['+hash+']"}}',
            type:'post',
            url:'https://testnet.nebulas.io/v1/user/call',
            dataType:'json',
            success:function(d){
               var num=parseInt(th.find('span').eq(1).html())+1
               th.find('span').eq(1).html(num);
               th.addClass('active').siblings().removeClass('active')
            }
        })
}
function tucao(th){
	//点赞
        var hash=th.parent().parent().index();
        alert(hash)
        $.ajax({
            contentType:"application/json",
            data:'{"from":"n1EjkdHBDpdjFfVaeJqMQW11RhYqrrjCZR7","to":"n1huG18QbozvJn3Hdyn11sBKkvHQ9pdRz7D","value":"0","nonce":3,"gasPrice":"1000000","gasLimit":"2000000","contract":{"function":"booing","args":"['+hash+']"}}',
            type:'post',
            url:'https://testnet.nebulas.io/v1/user/call',
            dataType:'json',
            success:function(d){
               var num=parseInt(th.find('span').eq(1).html())+1
               th.find('span').eq(1).html(num);
            }
        })
}