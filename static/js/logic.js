// Deal cards
startGame();

// Open respective cards, close after start of play

// Do until deck is empty

// Set player turn state, set other

// Set deck clickable for current player 
$('#draw').attr("disabled", false);
drawnCard = doDrawCard()['rank'];

// Show card, with possible actions

// Implement actions

// 1. Replace player card with draw card, add card to pool

// 2. Add card to pool

// 3. Special card
if(drawnCard == 'K') {
	showP2Hand();
} else if(drawnCard == 'Q') {
	// server
} else if(drawnCard == 'J') {
	// server
} else if(drawnCard == '10') {
	showP1Hand();
}

// Jump to set player turn state

// Decide winner by comparing total of hand values
var p1HandValue = computeHandValue(player1Hand);
var p2HandValue = computeHandValue(player2Hand);

if (p1HandValue < p2HandValue) {
	console.log("P1 wins!");
} else if (p1HandValue > p2HandValue) {
	console.log("P2 wins!");
} else {
	console.log("Tie!");
}

function computeHandValue(hand) {
	var value = 0;
	for (var i = 0; i < 3; i++) {
		if (hand[i]['rank'] == 'A') {
			value = value + 1;
		} else if (hand[i]['rank'] == 'J' || hand[i]['rank'] == 'Q' || hand[i]['rank'] == 'K') {
			value = value + 10;
		} else {
			value = value + parseInt(hand[i]['rank']);	
		}	
	}
	return value;
}

function closeFace(id) {
	// Replace with a close card image
	closeCard(id);
}

function popCardFromDeck(rank, suit) {
	var tempCard = playingCards.card(rank, suit);
	for (var i = 0; i<cardDeck['cards'].length; i++) {
		if (cardDeck['cards'][i] != undefined && cardDeck['cards'][i]['rank'] == tempCard['rank'] && cardDeck['cards'][i]['suit'] == tempCard['suit']) {
			delete cardDeck['cards'][i];
		}
	}
}
