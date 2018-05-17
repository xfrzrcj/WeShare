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
     
})
var jast=true;
var jast1=true;
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
					//showQRCode: true
					showQRCode: false
				},
				goods: {
					name: "test",
					desc: "test goods"
				},
				//callback: cbCallDapp
				//listener: cbCallDapp
			});
		}

		function cbCallDapp(resp){
			console.log("callback resp: " + JSON.stringify(resp))
			//document.getElementById("callResult").innerHTML = "call Dapp result:\n" +  JSON.stringify(resp)
		}

       
		//onClickCallDapp()
function dianzan(th){
	//点赞
	    if(jast){
        var hash=th.parent().parent().attr('data-hash');
        $.ajax({
            contentType:"application/json",
            data:'{"from":"n1EjkdHBDpdjFfVaeJqMQW11RhYqrrjCZR7","to":"n1huG18QbozvJn3Hdyn11sBKkvHQ9pdRz7D","value":"0","nonce":3,"gasPrice":"1000000","gasLimit":"2000000","contract":{"function":"star","args":"[\\"'+hash+'\\"]"}}',
            type:'post',
            url:'https://testnet.nebulas.io/v1/user/call',
            dataType:'json',
            success:function(d){
               var num=parseInt(th.find('span').eq(1).html())+1
               th.find('span').eq(1).html(num);
               th.addClass('active').siblings().removeClass('active');
               onClickCallDapp();
            }
        })
        jast=false;
	    }
}
function cai(th){
	//踩
	    if(jast1){
	    	var hash=th.parent().parent().attr('data-hash');
        $.ajax({
            contentType:"application/json",
            data:'{"from":"n1EjkdHBDpdjFfVaeJqMQW11RhYqrrjCZR7","to":"n1huG18QbozvJn3Hdyn11sBKkvHQ9pdRz7D","value":"0","nonce":3,"gasPrice":"1000000","gasLimit":"2000000","contract":{"function":"booing","args":"[\\"'+hash+'\\"]"}}',
            type:'post',
            url:'https://testnet.nebulas.io/v1/user/call',
            dataType:'json',
            success:function(d){
               th.addClass('active').siblings().removeClass('active');
               var num=parseInt(th.find('span').eq(1).html())+1
               th.find('span').eq(1).html(num);
               onClickCallDapp();
            }
        })
        jast1=false;
	    }
        
}
function pinglun(th){
	//发表评论
	    var hash=th.parent().parent().attr('data-hash');
        $.ajax({
            contentType:"application/json",
            data:'{"from":"n1EjkdHBDpdjFfVaeJqMQW11RhYqrrjCZR7","to":"n1huG18QbozvJn3Hdyn11sBKkvHQ9pdRz7D","value":"0","nonce":3,"gasPrice":"1000000","gasLimit":"2000000","contract":{"function":"comment","args":"[\\"'+hash+'\\"]"}}',
            type:'post',
            url:'https://testnet.nebulas.io/v1/user/call',
            dataType:'json',
            success:function(d){
               th.addClass('active').siblings().removeClass('active');
               var num=parseInt(th.find('span').eq(1).html())+1
               th.find('span').eq(1).html(num);
               onClickCallDapp();
            }
        })
}
 //获取url中的参数
        function getUrlParam(name) {
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
            var r = window.location.search.substr(1).match(reg);  //匹配目标参数
            if (r != null) return unescape(r[2]); return null; //返回参数值
        }