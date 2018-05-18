'use strict';
//地址n1hmmwZM1A5zeKwjZMThi6RpMyVJ1ccWU5t
//文章 数据结构
var Msg = function(jsonStr) {
    if (jsonStr) {
        var obj = JSON.parse(jsonStr);
        if (!obj.author) {
            throw new Error("no author error");
        }
        this.author = obj.author; //作者address
		this.authorName = obj.authorName;
		this.authorPhoto = obj.authorPhoto;
        if (obj.stars) {
            this.stars = obj.stars;  //点赞数量
        } else {
            this.stars = 0;
        }
        if (obj.booing) {
            this.booing = obj.booing; //踩的数量
        } else {
            this.booing = 0;
        }
        if (!obj.addTime) {
            this.addTime = Blockchain.transaction.timestamp;
        }else{
			this.addTime = obj.addTime; //创建时间
		}
        if (!obj.hash) {
            throw new Error("no hash error");
        }
        this.hash = obj.hash;  //文章hash
        this.txt = obj.txt;
		this.comments = obj.comments;//评论数量
		this.title = obj.title;//标题名
    }
}

Msg.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};

//用户信息结构
var User = function(jsonStr) {
    if (jsonStr) {
        var obj = JSON.parse(jsonStr);
        this.address = obj.address; //用户address
        this.name = obj.name; //用户昵称
        this.photo = obj.photo; //头像
		this.msgNum = obj.msgNum;//发表文章数量
		this.stars = obj.stars;//获得点赞数
		this.booings = obj.booings;//获得吐槽数
		this.publicStars = obj.publicStars;//给出的点赞数
		this.publicBooings = obj.publicBooings;//给出的吐槽数
		this.signInTime = obj.signInTime;//注册时间
    }
}

User.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};

//评论结构
var Comment =function(jsonStr){
	if (jsonStr) {
        var obj = JSON.parse(jsonStr);
        this.comment = obj.comment; //评论
        this.commHash = obj.commHash; //评论hash
        this.commentator = obj.commentator; //评论者hash
		this.commentatorName = obj.commentatorName; //评论者
		this.msgHash = obj.msgHash; //评论文章的hash
		this.time = obj.time;//评论时间
    }
}

Comment.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};

var WeiBoContract = function() {
    LocalContractStorage.defineProperty(this, "owner"); //合约拥有者
    LocalContractStorage.defineProperty(this, "starFee"); //点赞费用
    LocalContractStorage.defineProperty(this, "booingFee"); //吐槽费用
    LocalContractStorage.defineProperty(this, "totalMessagesNum"); //总文章数
    LocalContractStorage.defineProperty(this, "hotFlag"); //流行榜首标志
    LocalContractStorage.defineProperty(this, "badFlag"); //吐槽榜首标志
    LocalContractStorage.defineProperty(this, "hotEndFlag"); //流行榜尾标志
    LocalContractStorage.defineProperty(this, "badEndFlag"); //吐槽榜尾标志
    LocalContractStorage.defineProperty(this, "newFlag"); //最新榜首标志
    LocalContractStorage.defineMapProperty(this, "allMessages", { //所有文章
        parse: function(jsonText) {
            return new Msg(jsonText);
        },
        stringify: function(obj) {
            return obj.toString();
        }
    });
	
	LocalContractStorage.defineMapProperty(this, "comments", { //所有评论
        parse: function(jsonText) {
            return new Comment(jsonText);
        },
        stringify: function(obj) {
            return obj.toString();
        }
    });
	
	LocalContractStorage.defineMapProperty(this, "users", { //所有评论
        parse: function(jsonText) {
            return new User(jsonText);
        },
        stringify: function(obj) {
            return obj.toString();
        }
    });

    LocalContractStorage.defineMapProperty(this, "newMessages"); //key是当前文章序号，value是文章hash，实际是list
    LocalContractStorage.defineProperty(this, "newestMessagesNo"); //最新的文章序号
    LocalContractStorage.defineMapProperty(this, "hotMessagesTr"); //采用linkedlist方式首尾相连，key是当前文章no，value是比当前文章点赞排名高一位的一篇文章hash，0star 也存
    LocalContractStorage.defineMapProperty(this, "hotMessages"); //采用linkedlist方式首尾相连，key是当前文章no，value是比当前文章点赞排名低一位的一篇文章hash。首页流行榜用.0star 不存
    LocalContractStorage.defineMapProperty(this, "badMessagesTr"); //采用linkedlist方式首尾相连，key是当前文章no，value是比当前文章吐槽排名高一位的一篇文章hash 0booing不存
    LocalContractStorage.defineMapProperty(this, "badMessages"); //采用linkedlist方式首尾相连，key是当前文章no，value是比当前文章吐槽排名低一位的一篇文章hash。首页吐槽榜用，0booing不存
};

WeiBoContract.prototype = {
    init: function() {
        this.owner = Blockchain.transaction.from;
        this.totalMessages = 0;
        this.starFee = 10000000000;
        this.booingFee = 10000000000;
        this.hotFlag = "hot";
        this.badFlag = "bad";
        this.hotEndFlag = "hotEnd";
        this.badEndFlag = "badEnd";
        this.newestMessagesNo = 0;
        this.newFlag = 0;
    },
	
    star: function(mesHash) { //为文章点赞,参数为文章hash，需要发送交易
		var user = Blockchain.transaction.from;
		if(LocalContractStorage.get(user+mesHash+"1")){//同一文章一个人只能点赞一次
			throw new Error("you have star the message");
		}
		if(!this.users.get(user)){
			throw new Error("user not exist");
		}
        var value = Blockchain.transaction.value;
        if (value == this.starFee) {
            var message = this.allMessages.get(mesHash);
            if (message) {
                if (Blockchain.transfer(message.author, value)) { //转钱给作者成功才更新状态
                    message.stars = message.stars + 1;
					this.allMessages.put(mesHash,message);//需要put回去才会更新状态
					
					var author = this.users.get(message.author);//作者信息更新
					author.stars = author.stars+1;
					this.users.set(message.author,author);
					
					var olduser = this.users.get(user);//点赞者信息更新
					olduser.publicStars = olduser.publicStars+1;
					this.users.set(user,olduser);
					
                    while (true) {
						if (!this.hotMessages.get(this.hotFlag)) {
                            this.hotMessagesTr.put(this.hotEndFlag, mesHash);
                            this.hotMessagesTr.put(mesHash, this.hotFlag);

                            this.hotMessages.put(mesHash, this.hotEndFlag);
                            this.hotMessages.put(this.hotFlag, mesHash);
							
                            break;
                        }
                        var hotterMsg = this.hotMessagesTr.get(mesHash);
                        if (hotterMsg) {
                            if (hotterMsg == this.hotFlag) {
                                break;
                            } else {
                                if (this.allMessages.get(hotterMsg).stars < message.stars) {  //交换两篇文章的位置
									var hottestHash = this.hotMessagesTr.get(hotterMsg);
									var coldestHash = this.hotMessages.get(mesHash);

									this.hotMessagesTr.put(mesHash, hottestHash);
									this.hotMessagesTr.put(hotterMsg, mesHash);
									this.hotMessagesTr.put(coldestHash, hotterMsg);

									this.hotMessages.put(mesHash, hotterMsg);
									this.hotMessages.put(hotterMsg, coldestHash);
									this.hotMessages.put(hottestHash, mesHash);
                                } else {
                                    break;
                                }
                            }
                        } else {
                            var hotter = this.hotMessagesTr.get(this.hotEndFlag);
							this.hotMessagesTr.put(mesHash,hotter);
							this.hotMessagesTr.put(this.hotEndFlag,mesHash);
							
							this.hotMessages.put(mesHash,this.hotEndFlag);
							this.hotMessages.put(hotter,mesHash);
							break;
                        }
                    }
					LocalContractStorage.set(user+mesHash+"1","1");
                }else{
					throw new Error("transfer fail");	
				}
            } else {
                throw new Error("message not exist");
            }
        } else {
            throw new Error("fee for star must be " + this.starFee + " wei");
        }
    },
    booing: function(mesHash) { //吐槽文章，需要发送交易
		var user = Blockchain.transaction.from;
		if(LocalContractStorage.get(user+mesHash+"0")){
			throw new Error("you have booing the message");//同一文章一个人只能吐槽一次
		}
		if(!this.users.get(user)){
			throw new Error("user not exist");
		}
		var value = Blockchain.transaction.value;
		if (value == this.booingFee) {
			var message = this.allMessages.get(mesHash);
			if (message) {
				if (Blockchain.transfer(this.owner, value)) { //转钱成功才更新状态
					message.booing = message.booing + 1;
					this.allMessages.put(mesHash,message);//需要put回去才会更新状态
					
					var author = this.users.get(message.author);//作者信息更新
					author.booings = author.booings+1;
					this.users.set(message.author,author);
					
					var olduser = this.users.get(user);//吐槽者信息更新
					olduser.publicBooings = olduser.publicBooings+1;
					this.users.set(user,olduser);
					
					while (true) {
						if (!this.badMessages.get(this.badFlag)) {
							this.badMessagesTr.put(this.badEndFlag, mesHash);
							this.badMessagesTr.put(mesHash, this.badFlag);
							this.badMessages.put(mesHash, this.badEndFlag);
							this.badMessages.put(this.badFlag, mesHash);
							
							break;
						}
						var worseMsg = this.badMessagesTr.get(mesHash);
						if (worseMsg) {
							if (worseMsg == this.badFlag) {
								break;
							} else {
								if (this.allMessages.get(worseMsg).booing < message.booing) {  //交换两篇文章的位置
									var worestHash = this.badMessagesTr.get(worseMsg);
									var okHash = this.badMessages.get(mesHash);
									this.badMessagesTr.put(mesHash, worestHash);
									this.badMessagesTr.put(worseMsg, mesHash);
									this.badMessagesTr.put(okHash, worseMsg);

									this.badMessages.put(mesHash, worseMsg);
									this.badMessages.put(worseMsg, okHash);
									this.badMessages.put(worestHash, mesHash);
								} else {
									break;
								}
							}
						} else {
							var worse = this.badMessagesTr.get(this.badEndFlag);
							this.badMessagesTr.put(mesHash,worse);
							this.badMessagesTr.put(this.badEndFlag,mesHash);
							
							this.badMessages.put(mesHash,this.badEndFlag);
							this.badMessages.put(worse,mesHash);
							break;
						}
					}
					LocalContractStorage.set(user+mesHash+"0","0");
				}else{
					throw new Error("transfer fail");	
				}
			} else {
				throw new Error("message not exist");
			}
		} else {
			throw new Error("fee for star must be " + this.booingFee + " wei");
		}
    },

    publicMsg: function(title,txt) {  //发布文章,需要发送交易
		var user = Blockchain.transaction.from;
		if(!this.users.get(user)){
			throw new Error("user not exist");
		}
        var mesHash = Blockchain.transaction.hash;
        var msg = new Msg();
        msg.author = Blockchain.transaction.from;
        msg.stars = 0;
        msg.booing = 0;
        msg.addTime = Blockchain.transaction.timestamp;
        msg.txt = txt;
		msg.hash = mesHash;
		msg.comments = 0;
		msg.title = title;
        this.allMessages.put(mesHash, msg);        

        this.newestMessagesNo = this.newestMessagesNo + 1;
        this.newMessages.put(this.newestMessagesNo, mesHash);
		
		var addrMsg = LocalContractStorage.get("addressMsgs"+user);//记录账户所发送的文章
		if(addrMsg){
			LocalContractStorage.set("addressMsgs"+mesHash,addrMsg);
		}
		LocalContractStorage.set("addressMsgs"+user,mesHash);
		var olduser = this.users.get(user);
		olduser.msgNum = olduser.msgNum+1;
		this.users.set(user,olduser);
    },

    getNewMessages: function(from, size) { //获取最新文章，
        if (from == this.newFlag) {
            from = this.newestMessagesNo;
        }
        var result = new Array();
        if (size > from) {
            size = from;
        }
        for (var i = 0; i < size; i++) {
			var msg = this.allMessages.get(this.newMessages.get(from - i));
			msg.authorName = this.users.get(msg.author).name;
			msg.authorPhoto = this.users.get(msg.author).authorPhoto;
            result[i] = msg;
        }
        return result;
    },
   //获取点赞最多文章，从高到低
    getHotMessages: function(from, size) {
        var result = new Array();
        var hash = this.hotMessages.get(from);
        if (hash) {
            for (var i = 0; i < size; i++) {
				var msg = this.allMessages.get(hash);
				msg.authorName = this.users.get(msg.author).name;
				msg.authorPhoto = this.users.get(msg.author).authorPhoto;
                result[i] = msg;
                hash = this.hotMessages.get(hash);
                if (hash == this.hotEndFlag) {
                    break;
                }
            }
        }
        return result;
    },
     //获取被踩的文章,从高到低
    getBooingMeaasges: function(from, size) {
        var result = new Array();
        var hash = this.badMessages.get(from);
        if (hash) {
            for (var i = 0; i < size; i++) {
				var msg = this.allMessages.get(hash);
				msg.authorName = this.users.get(msg.author).name;
				msg.authorPhoto = this.users.get(msg.author).authorPhoto;
                result[i] = msg;
                hash = this.badMessages.get(hash);
                if (hash == this.badEndFlag) {
                    break;
                }
            }
        }
        return result;
    },
	//根据hash查找文章
	getMessageByHash(hash){
		return this.allMessages.get(hash);
	},
	//根据user的hash查看某人的文章信息
	getMessageByUser(user,size){
		var result = new Array();
		if(!this.users.get(user)){
			throw new Error("user not exist");
		}
		var addrMsg = LocalContractStorage.get("addressMsgs"+user);
		var i = 0;
		while (addrMsg && i<size) {
			result[i] = this.allMessages.get(addrMsg);
			addrMsg = LocalContractStorage.get("addressMsgs"+addrMsg);
			i++;
		}
		return result;
	},
	//发表评论
	comment:function(hash,context){
		var user = Blockchain.transaction.from;
		if(!this.users.get(user)){
			throw new Error("user not exist");
		}
		var msg = this.allMessages.get(hash);
		if(msg){
			var commHash = Blockchain.transaction.hash;
			var commentator = Blockchain.transaction.from;
			var comm = new Comment();
			comm.comment = context;
			comm.commHash = commHash;
			comm.commentator = commentator;
			comm.msgHash = hash;
			comm.time = Blockchain.block.timestamp;
			this.comments.set(commHash,comm);
			var firstcomment = LocalContractStorage.get("comments"+hash);
			if(firstcomment){
				LocalContractStorage.set("comments"+commHash,firstcomment);
			}
			LocalContractStorage.set("comments"+hash,commHash);
			msg.comments = msg.comments + 1;
			this.allMessages.set(hash,msg);
		}else{
			throw new Error("message not exist");
		}
	},
	//获取评论
	getComments:function(from,size){
		var result = new Array();
        var hash = LocalContractStorage.get("comments"+from);
        if (hash) {
            for (var i = 0; i < size; i++) {
				var commentator = this.comments.get(hash);
				commentator.commentatorName = this.users.get(commentator.commentator).name;
                result[i] = commentator;
                hash = LocalContractStorage.get("comments"+hash);
                if (!hash) {
                    break;
                }
            }
        }
        return result;
	},
	//更新用户数据
	updateUser:function(name,photo){
		var userhash = Blockchain.transaction.from;
		var user = this.users.get(userhash);
		if(!user){
			user = new User();
			user.address = userhash;
			user.msgNum = 0;
			user.stars = 0;
			user.booings = 0;
			user.publicStars = 0;
			user.publicBooings = 0;
			user.signInTime = Blockchain.block.timestamp;
		}
		user.name = name;
		user.photo = photo;
		this.users.set(userhash,user);
	},
	//判断用户是否注册过
	isUserSignIn:function(){
		if(this.users.get(Blockchain.transaction.from)){
			return true;
		}else{
			return false;
		}
	},
	//获取用户信息
	getUser:function(hash){
		return this.users.get(hash);
	}
};
module.exports = WeiBoContract;