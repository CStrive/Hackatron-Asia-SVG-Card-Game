
var cardDeck = $("#cardDeck").playingCards();

var hand = [];
var showError = function(msg){
    $('#error').html(msg).show();
    setTimeout(function(){
        $('#error').fadeOut('slow');
    },3000);
}
var showHand = function(){
    var el = $('#yourHand')
    el.html('');
    for(var i=0;i<hand.length;i++){
        el.append(hand[i].getHTML());
    }
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
$('#draw').click(doDrawCard);
