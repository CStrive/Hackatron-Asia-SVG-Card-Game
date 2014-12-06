$(document).ready(function() {
	var cardDeck = $("#cardDeck").playingCards();
	
	var hand = [];
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
    $('#draw').click(doDrawCard);
});