from flask import Flask, render_template, session, request
from flask.ext.socketio import emit, join_room, leave_room
from .. import socketio, redis
from random import shuffle
from functions import Cards

players = []
defaultRoom = str(0)
NUM_PLAYERS_ROOM = 2

# Connect client socket
# Store client name and set default room
@socketio.on('connect', namespace='/svg')
def socketConnect(user):
	session['name'] = user['name']
	session['room'] = defaultRoom
	join_room()
	players.append(request.namespace)
	gameStart(session['room'])

# Disconnect a client
@socketio.on('disconnect', namespace='/svg')
def socketDisconnect():
	leave_room()
    if players.count(request.namespace) != 0:
    	players.remove(request.namespace)


# Retrieve the cards of the current user and return json
# Called when discarded card is K
@socketio.on('mycards', namespace='/svg')
def getMyCards():
	if redis.hexists("USER_CARDS", session['name']) == True:
		cards = json.loads( redis.hget("USER_CARDS", session['name']) )
		emit('mycards', {'data':cards})
		
		action = session['name'] + " saw his own cards"
		updatePlayerLogs(action, session['room'])
		informNextPlayerOfTurn(session['name'], session['room'])


# Retrieve the cards of the another user and return json
# Called when discarded card is 10
@socketio.on('opponentcards', namespace='/svg')
def getOpponentCards(message):
	player = message['player']

	if redis.hexists("USER_CARDS", player) == True:
		cards = json.loads( redis.hget("USER_CARDS", player) )
		emit('oppocards', {'data':cards})
		
		action = session['name'] + " saw the cards of " + player
		updatePlayerLogs(action, session['room'])
		informNextPlayerOfTurn(session['name'], session['room'])



# Set the three cards that belong to the user
# Store the cards json in redis
# Supposed to be performed only during the first game creation
@socketio.on('setcards', namespace='/svg')
def setMyCards(userCards):
	redis.hset("USER_CARDS", session['name'], json.dumps(userCards))


# This function will be called only by the client who is performing the action
# Take 3 arguments: card # to be swapped, rank of new card to be stored, suit of new card
@socketio.on('swapcards', namespace='/svg')
def swapCard(message):
	removeCard = message['remove']
	newCardRank = message['rank']
	newCardSuit = message['suit']

	currentCards = json.loads( redis.hget("USER_CARDS", session['name']) )
	# removeCard is an integer [1,3]
	newCards = currentCards
	newCards["cards"][removeCard-1]["rank"] = newCardRank
	newCards["cards"][removeCard-1]["suit"] = newCardSuit
	redis.hset("USER_CARDS", session['name'], json.dumps(newCards))

	discardCard(session['room'], currentCards['cards'][removeCard-1]['rank'], currentCards['cards'][removeCard-1]['suits'])
	clientRemoveCard(session['name'], session['room'], newCardRank, newCardSuit)

	action = session['name'] + " swapped the card at position " + str(removeCard) + " with the new card"
	updatePlayerLogs(action, session['room'])

	if isDroppedCardFaceCards(currentCards['cards'][removeCard-1]['rank']) == False:
		informNextPlayerOfTurn(session['name'], session['room'])



# This function will be called only by the client who is performing the action when they get Q
# In this user will specify the card number of the other player whose card will be swapped
# User provides: card number to be swapped, player with whom to swap and the location of the card
@socketio.on('exchangecards', namespace='/svg')
def exchangeCard(message):
	userCardNumber = message['usercard']
	playerSwapCardNumber = message['playercard']
	playerSwap = message['player']

	currentMe = json.loads( redis.hget("USER_CARDS", session['name']) )
	currentOpp = json.loads( redis.hget("USER_CARDS", playerSwap) )
	
	newCardsMe = currentMe
	newCardsOpp = currentOpp

	newCardsMe["cards"][userCardNumber-1] = currentOpp["cards"][playerSwapCardNumber-1]
	newCardsOpp["cards"][playerSwapCardNumber-1] = currentMe["cards"][userCardNumber-1]
	
	redis.hset("USER_CARDS", session['name'], json.dumps(newCardsMe))
	redis.hset("USER_CARDS", playerSwap, json.dumps(newCardsOpp))

	action = session['name'] + " swapped the card at position " + str(userCardNumber) + " with the card at " + str(playerSwapCardNumber) + " belonging to " + playerSwap
	updatePlayerLogs(action, session['room'])

	informNextPlayerOfTurn(session['name'], session['room'])



# This function is called when a user gets a J
# Shuffle the order of the cards of another user
# Takes in the player name whose cards are to be swapped
@socketio.on('shuffle', namespace='/svg')
def shuffleCards(message):
	playerToShuffle = message['player']
	currentCards = json.loads( redis.hget("USER_CARDS", playerToShuffle) )

	newCards = currentCards
	a = [1,2,3]
	newOrder = shuffle(a)
	newCards['cards'][0] = currentCards['cards'][newOrder[0]]
	newCards['cards'][1] = currentCards['cards'][newOrder[1]]
	newCards['cards'][2] = currentCards['cards'][newOrder[2]]

	redis.hset("USER_CARDS", playerToShuffle, json.dumps(newCards))

	action = session['name'] + " shuffled " + playerToShuffle + "'s cards"
	updatePlayerLogs(action, session['room'])

	informNextPlayerOfTurn(session['name'], session['room'])




# This function will be called only by the client who is performing the action
# Function is called when the drawn card is going to be dropped
@socketio.on('discardCard', namespace='/svg')
def cardToBeDropped(message):
	drawnCardRank = message['rank']
	drawnCardSuit = message['suit']

	discardCard(session['room'], drawnCardRank, drawnCardSuit)
	clientRemoveCard(session['name'], session['room'], drawnCardRank, drawnCardSuit)

	action = session['name'] + " dropped the drawn card"
	updatePlayerLogs(action, session['room'])

	if isDroppedCardFaceCards(currentCards['cards'][removeCard-1]['rank']) == False:
		informNextPlayerOfTurn(session['name'], session['room'])


# This function is supposed to send action performed to all players
def updatePlayerLogs(action, svgroom):
	emit('log', {'data':action} , room=svgroom)


# This function is supposed to inform the other clients of the cards to be removed
# This is important to maintain the deck in all the clients
def clientRemoveCard(playerName, svgroom, cardRank, cardSuit):
	card = {}
	card['rank'] = cardRank
	card['suit'] = cardSuit
	emit('remove', {'data':card}, room=svgroom)


# This function is supposed to inform the other clients of the cards to be removed
# This is important to maintain the deck in all the clients
def discardCard(svgroom, cardRank, cardSuit):
	card = {}
	card['rank'] = cardRank
	card['suit'] = cardSuit
	emit('discard', {'data':card}, room=svgroom)


# This function will start the game if the number of players in a room is adequate
# Should send the players their cards along with the order of play
def gameStart(svgroom):
	if isRoomFull(svgroom) == False:
		return

	cardsDelt = dealCards(NUM_PLAYERS_ROOM)
	orderPlayers = getOrderOfPlay(svgroom)
	cardsAndPlayers = []
	for x in range(0, NUM_PLAYERS_ROOM):
		player = {}
		player['name'] = orderPlayers[x]
		player['cards'] = cardsDelt[x]
		cardsAndPlayers.append(player)
	
	emit('start', {'data':cardsAndPlayers}, room=svgroom)


# Create the first 3 cards for all players
def dealCards(numPlayers):
	c = Cards()
	c.deal(numPlayers)
	c.format_for_client()
	return c.all_player_cards


def isDroppedCardFaceCards(cardRank):
	if cardRank == '10':
		return True
	elif cardRank == 'J':
		return True
	elif cardRank == 'Q':
		return True
	elif cardRank == 'K':
		return True
	else:
		return False



def informNextPlayerOfTurn(currentPlayer, svgroom):
	nextPlayer = getNextPlayer(currentPlayer, svgroom)
	for player in players:
		if player.session['name'] == nextPlayer:
			player.base_emit('turn')


def getNextPlayer(currentPlayer, svgroom):
	orderPlayers = getOrderOfPlay(svgroom)
	for x in range(0, NUM_PLAYERS_ROOM):
		if orderPlayers[x] == currentPlayer:
			if x != NUM_PLAYERS_ROOM-1:
				return orderPlayers[x+1]
			else:
				return orderPlayers[0]


def getOrderOfPlay(svgroom):
	redisKey = "ROOM_" + svgroom
	return redis.smembers(redisKey)


def isRoomFull(svgroom):
	redisKey = "ROOM_" + svgroom
	if redis.scard(redisKey) >= NUM_PLAYERS_ROOM:
		return True
	return False


def addUserToRoom(name, svgroom):
	redisKey = "ROOM_" + svgroom
	if redis.scard(redisKey) < NUM_PLAYERS_ROOM:
		redis.sadd(redisKey, name)


def endGame(svgroom):
	redisKey = "ROOM_" + svgroom
	orderPlayers = getOrderOfPlay(svgroom)

	endGameCards = {}

	for x in range(0, NUM_PLAYERS_ROOM):
		for player in players:
			if player.session['name'] == orderPlayers[x]:
				endGameCards[orderPlayers[x]] = redis.hget("USER_CARDS", player.session['name'])
				redis.hdel("USER_CARDS", player.session['name'])
				redis.srem(redisKey, player.session['name'])

	emit('endgame', {'data':endGameCards}, room=svgroom)

	for x in range(0, NUM_PLAYERS_ROOM):
		for player in players:
			if player.session['name'] == orderPlayers[x]:
				player.leave_room()
