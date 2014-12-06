var cardDeck = $("#cardDeck").playingCards();

var hand = [];

var showError = function(msg){
    $('#error').html(msg).show();
    setTimeout(function(){
        $('#error').fadeOut('slow');
    },3000);
}
var showHand = function(){
    var el = $('#yourHand');
    el.html('');
    el.append(hand[hand.length-1].getHTML());
}
var doDrawCard = function(){
    var c = cardDeck.draw();
    if(!c){
        showError('no more cards');
        return;
    }
    hand[hand.length] = c;
    //cardDeck.spread();
    showHand();
}
var doShuffle = function(){
    cardDeck.shuffle();
}
var doPlayerDrawCard = function(playerHand){
    var c = cardDeck.draw();
    playerHand[playerHand.length] = c;
    //showHand();
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
function closeCard() {
    var closeCardImage = document.createElement("div");
    closeCardImage.style.width="76px";
    closeCardImage.style.height="100px";
    closeCardImage.style.backgroundImage="url('static/img/facedowncard.jpg')";
    var el = $('#yourHand');
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
}

var selectedCard = null;

var swapCard = function(id) {
    var cardToThrow;
    if(drawnCard != null) {
        if(id == -1) {
            cardToThrow = drawnCard;
        } else {
            cardToThrow = player2Hand[id];
            player2Hand[id] = drawnCard;
            showP2Hand();
        }

        discardedCards[discardedCards.length] = cardToThrow;
        showDiscardedCards();
        drawnCard = null;
        showHand();
    }

    else {
        selectedCard = id;
        cardToThrow = discardedCards[discardedCards.length-1];
    }
    return cardToThrow;
}


var exchangeCard = function(id) {
    var tempCard;
    if(discardedCards[discardedCards.length-1]['rank'] == 'Q') {
        tempCard = player2Hand[selectedCard];
        player2Hand[selectedCard] = player1Hand[id];
        player1Hand[id] = tempCard;
        showP1Hand();
        showP2Hand();
    }

    return selectedCard;
}

$('#startGame').button().click(startGame);
$('#draw').button().click(doDrawCard);


//--------------------------------------------
// Decide winner by comparing total of hand values
function decideWinner() {
    var p1HandValue = computeHandValue(player1Hand);
    var p2HandValue = computeHandValue(player2Hand);

    if (p1HandValue < p2HandValue) {
        console.log("P1 wins!");
    } else if (p1HandValue > p2HandValue) {
        console.log("P2 wins!");
    } else {
        console.log("Tie!");
    }    
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

function updateTopOfPool(rank, suit) {
    var tempCard = playingCards.card(rank, suit);
    discardedCards[discardedCards.length] = tempCard;
}
