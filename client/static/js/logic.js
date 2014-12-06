// Open respective cards, close after start of play

$('#draw').attr("disabled", false);
firstDrawnCard = doDrawCard()['rank'];

// Show card, with possible actions

// Implement actions
var clientAction = function(action) {

	//1.Perform action
	if(action['name'] == 'swap') {
		console.log(typeof(action['id']));
		swapCard(action['id']);
	}
	//2.Inform Server
}

var serverOrder = function() {
	//1.Perfrom requested action
}

// 1. Replace player card with draw card, add card to pool

// 2. Add card to pool

// 3. Special card

}


function closeFace(id) {
	// Replace with a close card image
	closeCard(id);
}


