var cardDeck = $("#cardDeck").playingCards();

var hand = [];
var player1Hand =[];
var player2Hand =[];
var discardedCards = [];
var drawnCard = null;

var showError = function(msg){
    $('#error').html(msg).show();
    setTimeout(function(){
        $('#error').fadeOut('slow');
    },3000);
}

var showHand = function(){
    var el = $('#yourHand');
    el.html('');
    if(drawnCard!=null){
        el.append(drawnCard.getHTML());
    }
}
var showDiscardedCards = function(){
    var el = $('#discardedCards');
    el.html('');
    el.append(discardedCards[discardedCards.length-1].getHTML());
}

var doDrawCard = function(){
    var c = cardDeck.draw();
    if(!c){
        showError('no more cards');
        return;
    }
    drawnCard = c;
    showHand();
    return drawnCard;
}

var doShuffle = function(){
    cardDeck.shuffle();
}

var doPlayerDrawCard = function(playerHand){
    var c = cardDeck.draw();
    playerHand[playerHand.length] =  c;
}

var showP1Hand = function(){
    var card1El = $('#player1Card1');
    var card2El = $('#player1Card2');
    var card3El = $('#player1Card3');
    card1El.html('');
    card2El.html('');
    card3El.html('');

    card1El.append(player1Hand[0].getHTML());
    card2El.append(player1Hand[1].getHTML());
    card3El.append(player1Hand[2].getHTML());

}

var showP2Hand = function(){
    var card1El = $('#player2Card1');
    var card2El = $('#player2Card2');
    var card3El = $('#player2Card3');
    card1El.html('');
    card2El.html('');
    card3El.html('');

    card1El.append(player2Hand[0].getHTML());
    card2El.append(player2Hand[1].getHTML());
    card3El.append(player2Hand[2].getHTML());
}

function closeCard(id) {
    var closeCardImage = document.createElement("div");
    closeCardImage.style.width="76px";
    closeCardImage.style.height="100px";
    closeCardImage.id="closeCardImage";
    closeCardImage.style.backgroundImage="url('static/img/facedowncard.jpg')";
    var el = $(id);
    el.html('');
    el.append(closeCardImage);
}

var startGame = function(){
    doShuffle();

    doPlayerDrawCard(player1Hand);
    doPlayerDrawCard(player1Hand);
    doPlayerDrawCard(player1Hand);
    doPlayerDrawCard(player2Hand);
    doPlayerDrawCard(player2Hand);
    doPlayerDrawCard(player2Hand);

    showP1Hand();
    showP2Hand();
    $('#startGame').button('disable');
}

var swapCard = function(id) {
    var cardToThrow;
    if(drawnCard != null) {
        if(id == -1) {
            cardToThrow = drawnCard;
        } else {
            cardToThrow = player2Hand[id];
            console.log(player2Hand);
            player2Hand[id] = drawnCard;
            showP2Hand();
        }

        discardedCards[discardedCards.length] = cardToThrow;
        showDiscardedCards();
        drawnCard = null;
        showHand();
    }
    return cardToThrow;
}


$('#startGame').button().click(startGame);
$('#draw').button().click(doDrawCard);


//--------------------------------------------
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

function popCardFromDeck(rank, suit) {
    var tempCard = playingCards.card(rank, suit);
    for (var i = 0; i<cardDeck['cards'].length; i++) {
        if (cardDeck['cards'][i] != undefined && cardDeck['cards'][i]['rank'] == tempCard['rank'] && cardDeck['cards'][i]['suit'] == tempCard['suit']) {
            delete cardDeck['cards'][i];
        }
    }
}

