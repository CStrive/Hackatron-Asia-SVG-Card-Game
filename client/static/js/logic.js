// Open respective cards, close after start of play

// Disable button when opponent's turn
$('#draw').attr("disabled", false);
firstDrawnCard = doDrawCard()['rank'];
// Show card, with possible actions

// Implement actions
var clientActions = function(action) {
	var discardedCard;
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
			// data = function();
			break;
		case 'J':
			break;
		case 'Q':
			break;
		case 'K':
			break;
	}
	
	socket.emit('serverFunction', data);
}

var serverOrders = function() {
	// Perfrom requested action
	socket.on('clientMethod', function(data) {
		// Call respective functions
		// 1. Update the deck (by removing the drawn card) and pool (by showing the latest card that was discarded to pool)
		switch(data['name']) {
			case 'updateDeckAndPool':
				popCardFromDeck(data['options']['rank'], data['options']['suit']);
				updateTopOfPool(data['options']['rank'], data['options']['suit']);		
				break;
		}
		
		switch(data['options']['rank']) {
			case 'K':
				var n = noty({text: 'Your Opponent has viewed his cards', layout: 'top', type:'information'});
				break;
			case 'Q':
				var text2 = "Your opponent has switched his card number " + data['options']['opp'] + "with you card number " + data['options']['you']; 
				var n = noty({text: text2, layout: 'top', type:'information'});
				break;
			case 'J':
				var n = noty({text: 'Your Opponent has shuffled your cards', layout: 'top', type:'information'});
				break;
			case '10':
				var n = noty({text: 'Your Opponent has viewed your cards', layout: 'top', type:'information'});
				break;
		}
	});
}

function closeFace(id) {
	// Replace with a close card image
	closeCard(id);
}


