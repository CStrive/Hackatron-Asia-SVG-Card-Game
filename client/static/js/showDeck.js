var cardDeck = $("#cardDeck").playingCards();

var hand = [];
var player1Hand =[];
var player2Hand =[];
var drawnCards = [];
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
$('#startGame').click(startGame);
$('#draw').click(doDrawCard);
