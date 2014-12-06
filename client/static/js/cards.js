var cardDeck = $("#cardDeck").playingCards();

var player1Hand =[];
var player2Hand =[];

var doShuffle = function(){
	cardDeck.shuffle();
}

var doDrawCard = function(playerHand){
    var c = cardDeck.draw();
    playerHand[playerHand.length] = c;
    //showHand();
}

var showP1Hand = function(){
    var el = $('#player1Hand')
    el.html('');
    for(var i=0;i<player1Hand.length;i++){
        el.append(player1Hand[i].getHTML());
    }
}

var showP2Hand = function(){
    var el = $('#player2Hand')
    el.html('');
    for(var i=0;i<player2Hand.length;i++){
        el.append(player2Hand[i].getHTML());
    }
}

var startGame = function(){
	doShuffle();

	doDrawCard(player1Hand);
	doDrawCard(player1Hand);
	doDrawCard(player1Hand);
	doDrawCard(player2Hand);
	doDrawCard(player2Hand);
	doDrawCard(player2Hand);

	showP1Hand();
	showP2Hand();
}

$('#startGame').click(startGame);