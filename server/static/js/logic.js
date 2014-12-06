var namespace = '/svg';

var socket = io.connect('http://' + document.domain + ':' + location.port + namespace, {
	"connect timeout": 300,
    "close timeout": 60,
    "hearbeat timeout": 40,
    "transports": ["xhr-polling", "jsonp-polling"]
});

socket.emit('setnickname', {'name':localStorage.getItem("nickname")});


// Open respective cards, close after start of play
// Disable button when opponent's turn
$('#draw').attr("disabled", false);
//firstDrawnCard = doDrawCard()['rank'];
// Show card, with possible actions
// Implement actions
var player2Name = localStorage.getItem("nickname");
console.log(player2Name);
var player1Name = '';

socket.on('start', function(msg) {
	data = msg['data'];
	console.log(data);
	if(data[0]['name'] == player2Name) {
		player2Hand = data[0]['cards'];
		player1Hand = data[1]['cards'];
		player1Name = data[1]['name'];
		console.log(player1Hand);
		console.log(player2Hand);
	}
	else {
		player2Hand = data[1]['cards'];
		player1Hand = data[0]['cards'];
		player1Name = data[0]['name'];
	}

	showP1Hand();
	showP2Hand();
});


var clientActions = function(action) {
	console.log("client action was triggered");
	var discardedCard = {};
	var	data = {};
	data['drawnCard'] = drawnCard;
	// 1.Perform action
	if(action['name'] == 'swap') {
		discardedCard = swapCard(action['id']);
	} else if (action['name'] == 'exchange'){
		discardedCard = discardedCards[discardedCards.length-1];
		data['position'] = exchangeCard(action['id']);
		data['opponentPosition'] = action['id'];
	}
	if (discardedCard['rank'] == 'Q' && action['name'] != 'exchange') {
		return;
	}
	// 2.Inform Server
	if(action['id'] == -1) {
		// a. Discard
		data['discardedCard'] = discardedCard;	
	} else if (action['name'] == 'swap'){
		// b. Replace and discard
		data['discardedCard'] = discardedCard; 
		data['position'] = action['id'];	
	}
	// c. Special cases
	switch(discardedCard['rank']) {
		case '10':
			data['specialCard'] = '10';
			break;
		case 'J':
			data['specialCard'] = 'J';
			break;
		case 'Q':
			data['specialCard'] = 'Q';
			break;
		case 'K':
			data['specialCard'] = 'K';
			break;
	}
	
	console.log(data);
	socket.emit('readaction', data);
}
var serverOrders = function() {
	// Perfrom requested action
	socket.on('operation', function(data) {
		// Call respective functions
		// 1. Update the deck (by removing the drawn card) and pool (by showing the latest card that was discarded to pool)
		if(data['name'] == 'updateDeckAndPool') {
			popCardFromDeck(data['options']['rank'], data['options']['suit']);
			updateTopOfPool(data['options']['rank'], data['options']['suit']);	
		}
		
		switch(data['options']['rank']) {
			case 'K':
				var text1 = player1Name+' has viewed his cards';
				var n = noty({text: text1, layout: 'top', type:'information'});
				break;
			case 'Q':
				var text2 = player1Name+" has switched his card number " + data['options']['opp'] + "with you card number " + data['options']['you']; 
				var n = noty({text: text2, layout: 'top', type:'information'});
				break;
			case 'J':
				var text3 = player1Name+' has shuffled your cards';
				var n = noty({text: text3, layout: 'top', type:'information'});
				break;
			case '10':
				var text4 = player1Name +' has viewed your cards';
				var n = noty({text: text4, layout: 'top', type:'information'});
				break;
		}
	});
}
function closeFace(id) {
	// Replace with a close card image
	closeCard(id);
}