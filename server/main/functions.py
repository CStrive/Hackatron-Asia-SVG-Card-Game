from random import shuffle

class Cards:
    def __init__(self):
        values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
        suites = ['H', 'S', 'C', 'D']
        self.deck = [i + j for i in suites for j in values]

    def shuffle(self):
        shuffle(self.deck)

    def deal(self, n_players):
    	self.shuffle()
    	self.hands = []
    	for player in range(n_players):
    		player_cards = [self.deck.pop(), self.deck.pop(), self.deck.pop()]
        	self.hands.append(player_cards)

    def format_for_client(self):
		self.all_player_cards = []
		cards_for_player = []
		card_value = {}
		for each_player in self.hands:
			for each_card in each_player:
				suit = each_card[:1]
				rank = each_card[1:]
				card_value["rank"] = rank
				card_value["suit"] = suit
				cards_for_player.append(card_value)
				card_value = {}
			self.all_player_cards.append(cards_for_player)
			cards_for_player = []

#test code
# c = Cards()
# c.deal(4)
# print c.hands
# c.format_for_client()
# print c.all_player_cards



