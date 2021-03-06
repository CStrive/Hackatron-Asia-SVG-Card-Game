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
var player1Name = '';


socket.on('start', function(msg) {
	data = msg['data'];

	if(data[0]['name'] == player2Name) {
		for(var i=0; i<3;i++) {
			player2Hand[i] = playingCards.card(data[0]['cards'][i]['rank'], data[0]['cards'][i]['suit']);
		}

		for(var i=0; i<3;i++) {
			player1Hand[i] = playingCards.card(data[1]['cards'][i]['rank'], data[1]['cards'][i]['suit']);
		}
		player1Name = data[1]['name'];
	}
	else {
		for(var i=0; i<3;i++) {
			player2Hand[i] = playingCards.card(data[1]['cards'][i]['rank'], data[1]['cards'][i]['suit']);
		}

		for(var i=0; i<3;i++) {
			player1Hand[i] = playingCards.card(data[0]['cards'][i]['rank'], data[0]['cards'][i]['suit']);
		}
		player1Name = data[0]['name'];
	}

	// showP1Hand();
  
	var card = $('#beginGameShow');
  	card.append(player2Hand[0].getHTML());
  	card.append(player2Hand[1].getHTML());
  	card.append(player2Hand[2].getHTML());
	$('#myModal').modal('show');	
	// showP2Hand();

	// Display player names
	$("#player1NameDisplay").text(player1Name);
	$("#player2NameDisplay").text(player2Name);
});


socket.on('endGame', function(msg) {
	data = msg['data'];

	if(data[0]['name'] == player2Name) {
		for(var i=0; i<3;i++) {
			player2Hand[i] = playingCards.card(data[0]['cards'][i]['rank'], data[0]['cards'][i]['suit']);
			popCardFromDeck(player2Hand[i]['rank'], player2Hand[i]['suit']);
		}

		for(var i=0; i<3;i++) {
			player1Hand[i] = playingCards.card(data[1]['cards'][i]['rank'], data[1]['cards'][i]['suit']);
			popCardFromDeck(player1Hand[i]['rank'], player1Hand[i]['suit']);
		}
	}
	else {
		for(var i=0; i<3;i++) {
			player2Hand[i] = playingCards.card(data[1]['cards'][i]['rank'], data[1]['cards'][i]['suit']);
			popCardFromDeck(player2Hand[i]['rank'], player2Hand[i]['suit']);
		}

		for(var i=0; i<3;i++) {
			player1Hand[i] = playingCards.card(data[0]['cards'][i]['rank'], data[0]['cards'][i]['suit']);
			popCardFromDeck(player1Hand[i]['rank'], player1Hand[i]['suit']);
		}
	}

	showP1Hand();
	showP2Hand();

	decideWinner();
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
		data['discardedCard'] = discardedCard;
		data['drawnCard'] = spCard;
		spCard = null;
		console.log(data);
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

socket.on('operation', function(data) {
	console.log(data);
	// Call respective functions
	// 1. Update the deck (by removing the drawn card) and pool (by showing the latest card that was discarded to pool)
	if(data['name'] == 'updateDeckAndPool') {
		popCardFromDeck(data['options']['rank'], data['options']['suit']);
		updateTopOfPool(data['options']['rank'], data['options']['suit']);	
	}
	
	if(data['turn']==player1Name) {
		switch(data['options']['rank']) {
			case 'K':
				console.log("comes to K");
				var text1 = player1Name+' has viewed his cards';
				var n = noty({text: text1, layout: 'top', type:'information'});	
				var cardKing = $('#forK');
				for(var i=0; i<3;i++) {
					player2Hand[i] = playingCards.card(data['cards'][i]['rank'], data['cards'][i]['suit']);
				}
				break;
			case 'Q':
				var text2 = player1Name+" has switched his card number " + data['options']['opponentPosition'] + "with you card number " + data['options']['position']; 
				tempCard = player2Hand[parseInt(position)];
				player2Hand[parseInt(position)] = player1Hand[parseInt(opponentPosition)];
				player1Hand[parseInt(opponentPosition)] = tempCard;
				var n = noty({text: text2, layout: 'top', type:'information'});
				break;
			case 'J':
				var text3 = player1Name+' has shuffled your cards';
				var n = noty({text: text3, layout: 'top', type:'information'});
				for(var i=0; i<3;i++) {
					player2Hand[i] = playingCards.card(data['cards'][i]['rank'], data['cards'][i]['suit']);
				}
				// showP2Hand();
				break;
			case '10':
				console.log("comes to 10");
				var text4 = player1Name +' has viewed your cards';
				var n = noty({text: text4, layout: 'top', type:'information'});
				for(var i=0; i<3;i++) {
					player2Hand[i] = playingCards.card(data['cards'][i]['rank'], data['cards'][i]['suit']);
				}
				break;
		}
	} else {
		switch(data['options']['rank']) {
			case 'K':
				console.log("comes to K");	
				var cardKing = $('#forK');
				for(var i=0; i<3;i++) {
					player2Hand[i] = playingCards.card(data['cards'][i]['rank'], data['cards'][i]['suit']);
				}
			  	cardKing.append(player2Hand[0].getHTML());
			  	cardKing.append(player2Hand[1].getHTML());
			  	cardKing.append(player2Hand[2].getHTML());
				$('#forKing').modal('show');
				cardKing = [];
				break;
			case '10':
				var card10 = $('#for10');
				for(var i=0; i<3;i++) {
					player2Hand[i] = playingCards.card(data['cards'][i]['rank'], data['cards'][i]['suit']);
				}
				card10.append(player2Hand[0].getHTML());
			  	card10.append(player2Hand[1].getHTML());
			  	card10.append(player2Hand[2].getHTML());
			  	$('#forTen').modal('show');
			  	card10 = [];
			  	break;
		}
	}
});

socket.on('log', function(data){
	$('#feed').html(data);
});

function closeFace(id) {
	// Replace with a close card image
	closeCard(id);
}