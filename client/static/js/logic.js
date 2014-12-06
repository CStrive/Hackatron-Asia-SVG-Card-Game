// Deal cards

// Open respective cards, close after start of play

// Do until deck is empty

// Set player turn state, set other

// Set deck clickable for current player 
$('#draw').attr("disabled", false);
drawnCard = doDrawCard()[0]['rank'];

// Show card, with possible actions
if(drawnCard == 'K') {
	showP2Hand();
} else if(drawnCard == 'Q') {
	// server
} else if(drawnCard == 'J') {
	// server
} else if(drawnCard == '10') {
	showP1Hand();
}

// Implement actions

// 1. Replace player card with draw card, add card to pool

// 2. Add card to pool

// 3. Special card

// 3.1 King - See self cards

// 3.2 Queen - Replace one card with another player’s card

// 3.3 Jack - Shuffle another player’s cards

// 3.4 Ten - See someone else’s cards

// Jump to set player turn state

function closeFace(id) {
	// Replace with a close card image
	closeCard(id);
}
