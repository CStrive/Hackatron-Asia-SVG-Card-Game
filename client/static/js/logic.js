// Open respective cards, close after start of play

// Disable button when opponent's turn
$('#draw').attr("disabled", false);
firstDrawnCard = doDrawCard()['rank'];

// Show card, with possible actions

// Implement actions
var clientActions = function(action) {
	var discardedCard,
		data;

	data['drawnCard'] = drawnCard;

	// 1.Perform action
	if(action['name'] == 'swap') {
		discardedCard = swapCard(action['id']);
	}

	// 2.Inform Server
	if(action['id'] == -1) {
		// a. Discard
		data['discardedCard'] = discardedCard;	
	} else {
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
	socket.on('clientMethod', function(data)) {
		// Call respective functions
		// 1. Update the deck (by removing the drawn card) and pool (by showing the latest card that was discarded to pool)
		switch(data['name']) {
			case 'updateDeckAndPool':
				popCardFromDeck(data['options']['rank'], data['options']['suit']);
				updateTopOfPool(data['options']['rank'], data['options']['suit']);		
				break;
		}
		
		// 2a. King. Notify which player saw their cards.
		// 2b. Queen. Notify which card is swapped
		// 2c. Jack. Notify that cards were shuffled
		// 2d. 10. Notify that player's cards were shuffled
	});
}

function closeFace(id) {
	// Replace with a close card image
	closeCard(id);
}


