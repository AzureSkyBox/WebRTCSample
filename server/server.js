var io = require('socket.io').listen(8070);

var calleeSocket = null;
var callerSocket = null;

var socketArr = new Array();

io.sockets.on('connection', function(socket) {
	socket.emit('open', socket.id);
	
	socketArr.push({id:socket.id, socket:socket, hasPartner:false});
	
	socket.on('signaling', function(message) {
		var senderId = message.sender;
		var receiverId = message.receiver;
		var signalingType = JSON.parse(message.msg).type;
		
		if(signalingType.indexOf('bye') != -1) {
			var sockInfo;
			for(var i in socketArr) {
				sockInfo = socketArr[i];
				if(sockInfo.id.indexOf(senderId) != -1 || sockInfo.id.indexOf(receiverId) != -1)
					sockInfo.hasPartner = false;
			}
		}

		for(var i in socketArr) {
			var sockInfo = socketArr[i];
		
			if(sockInfo.id.indexOf(receiverId) != -1) {
				sockInfo.socket.emit('signaling', message);
			}
		}
	});
	socket.on('calling', function(message) {
		var senderId = message.sender;
		
		var senderSocket;	
		var partnerId;		

		for(var i in socketArr) {
			var sockInfo = socketArr[i];

			if(sockInfo.id.indexOf(senderId) == -1 && !sockInfo.hasPartner) {
				sockInfo.hasPartner = true;
				partnerId = sockInfo.id;
			}
			if(sockInfo.id.indexOf(senderId) != -1) {
				sockInfo.hasPartner = true;
				senderSocket = sockInfo.socket;
			}
		}
		
		senderSocket.emit('calling', {partner:partnerId});
	});
});
