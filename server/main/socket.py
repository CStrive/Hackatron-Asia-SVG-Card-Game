from flask import Flask, render_template, session, request
from flask.ext.socketio import emit, join_room, leave_room
from .. import socketio, redis
from random import shuffle
from functions import Cards
import json, uuid, copy

players = []
defaultRoom = str(0)
NUM_PLAYERS_ROOM = 2

# Connect client socket
# Store client name and set default room
@socketio.on('connect', namespace='/svg')
def socketConnect():
	players.append(request.namespace)

@socketio.on('setnickname', namespace='/svg')
def socketSetName(user):
	session['name'] = user['name']
	session['room'] = findAvailableRoom()
	print "room: " + session['room']
	addUserToRoom(session['name'], session['room'])
	join_room(session['room'])
	gameStart(session['room'])

# Disconnect a client
@socketio.on('disconnect', namespace='/svg')
def socketDisconnect():
	# leave_room(session['room'])
	if players.count(request.namespace) != 0:
		players.remove(request.namespace)


def findAvailableRoom():
	allRooms = list( redis.smembers("ROOM") )
	for eachRoom in allRooms:
		if isRoomFull(eachRoom) == False:
			return eachRoom
	return str(uuid.uuid4())



# Read input player action
# Perform operation as per required while reading discarded and drawn card
@socketio.on('readaction', namespace='/svg')
def readActionPerformed(data):
	playerName = session['name']
	svgroom = session['room']
	nextPlayerName = getNextPlayer(playerName, svgroom)

	if isDrawnCardDiscarded(data['discardedCard'], data['drawnCard']) == True:
		# Simplest case
		responseData = createResponseDataDiscardDrawn(playerName, svgroom, data, nextPlayerName)
		logMessage = playerName + " drew and discarded " + data['discardedCard']['rank']
		updatePlayerLogs(logMessage, svgroom)

	elif isDroppedCardFaceCards(data['discardedCard']['rank']) == True:
		# Perform operations for face cards
		responseData = createResponseDataFaceCard(playerName, svgroom, data, nextPlayerName, 1)

	else:
		# Discarded card is a normal card. Hence a swap has happened
		responseData = createResponseDataSwapCard(playerName, svgroom, data, nextPlayerName)
		logMessage = playerName + " swapped the card drawn with the card at " + str(data['position'])
		updatePlayerLogs(logMessage, svgroom)

	# print responseData
	emit('operation', responseData, room=svgroom)



# Function that returns whether drawn card is the same as the discarded card
# If true it means that the card has to removed from the deck and pool as well
def isDrawnCardDiscarded(discardedCard, drawnCard):
	if (discardedCard['rank'] == drawnCard['rank']) and (discardedCard['suit'] == drawnCard['suit']):
		return True
	else:
		return False



def createResponseDataDiscardDrawn(playerName, svgroom, data, nextPlayerName):
	if isDroppedCardFaceCards(data['discardedCard']['rank']) == True:
		return createResponseDataFaceCard(playerName, svgroom, data, nextPlayerName, 0)
	else:
		responseData = {}
		responseData['name'] = "updateDeckAndPool"
		responseData['turn'] = playerName
		responseData['nextturn'] = nextPlayerName
		responseData['options'] = data['discardedCard']

		cards = json.loads( redis.hget("USER_CARDS", playerName) )
		responseData['cards'] = cards['cards']
		return responseData


# Swap cards and create response data
def createResponseDataSwapCard(playerName, svgroom, data, nextPlayerName):
	responseData = {}
	responseData['name'] = "updateDeckAndPool"
	responseData['turn'] = playerName
	responseData['nextturn'] = nextPlayerName
	responseData['options'] = data['discardedCard']

	swapCard(playerName, svgroom, data['position'], data['drawnCard'])
	cards = json.loads( redis.hget("USER_CARDS", playerName) )
	responseData['cards'] = cards['cards']
	return responseData


# For discarded card as face card perform relevant operations
def createResponseDataFaceCard(playerName, svgroom, data, nextPlayerName, swap):
	cardRank = data['discardedCard']['rank']
	if cardRank == '10':
		responseData = returnOpponentCards(playerName, svgroom, data, nextPlayerName, swap)
		logMessage = playerName + " viewed the cards of " + nextPlayerName
	elif cardRank == 'J':
		responseData = returnShuffleOpponent(playerName, svgroom, data, nextPlayerName, swap)
		logMessage = playerName + " shuffled " + nextPlayerName + "'s cards"
	elif cardRank == 'Q':
		responseData = returnExchangeCards(playerName, svgroom, data, nextPlayerName, swap)
		logMessage = playerName + " exchanged their card at " + str(data['position']) + " position with " + nextPlayerName + "'s card at the position " + str(data['opponentPosition'])
	elif cardRank == 'K':
		responseData = returnSelfCards(playerName, svgroom, data, nextPlayerName, swap)
		logMessage = playerName + " viewed his own cards"
	else:
		responseData = {}
		logMessage = ""

	updatePlayerLogs(logMessage, svgroom)
	return responseData


# Operation for K
def returnSelfCards(playerName, svgroom, data, nextPlayerName, swap):
	responseData = {}
	responseData['name'] = "updateDeckAndPool"
	responseData['turn'] = playerName
	responseData['nextturn'] = nextPlayerName
	responseData['options'] = data['discardedCard']

	if swap == 1:
		swapCard(playerName, svgroom, data['position'], data['drawnCard'])

	cards = json.loads( redis.hget("USER_CARDS", playerName) )
	responseData['cards'] = cards['cards']

	responseData['specialCard'] = 'K'
	responseData['player'] = playerName
	return responseData


# Operation for Q
def returnExchangeCards(playerName, svgroom, data, nextPlayerName, swap):
	responseData = {}
	responseData['name'] = "updateDeckAndPool"
	responseData['turn'] = playerName
	responseData['nextturn'] = nextPlayerName
	responseData['options'] = data['discardedCard']

	if swap == 1:
		swapCard(playerName, svgroom, data['position'], data['drawnCard'])

	# using nextPlayerName here only for 2 player
	exchangeCard(playerName, data['position'], nextPlayerName, data['opponentPosition'])
	cards = json.loads( redis.hget("USER_CARDS", playerName) )
	responseData['cards'] = cards['cards']

	responseData['specialCard'] = 'Q'
	responseData['position'] = data['position']
	responseData['opponentPosition'] = data['opponentPosition']
	responseData['player'] = nextPlayerName #responseData['player'] = data['player']
	return responseData


# Operation for J
def returnShuffleOpponent(playerName, svgroom, data, nextPlayerName, swap):
	responseData = {}
	responseData['name'] = "updateDeckAndPool"
	responseData['turn'] = playerName
	responseData['nextturn'] = nextPlayerName
	responseData['options'] = data['discardedCard']

	if swap == 1:
		swapCard(playerName, svgroom, data['position'], data['drawnCard'])

	# using nextPlayerName here only for 2 player
	shuffleCards(nextPlayerName)
	cards = json.loads( redis.hget("USER_CARDS", nextPlayerName) )
	responseData['cards'] = cards['cards']

	responseData['specialCard'] = 'J'
	responseData['player'] = nextPlayerName #responseData['player'] = data['player']
	return responseData


# Operation for 10
def returnOpponentCards(playerName, svgroom, data, nextPlayerName, swap):
	responseData = {}
	responseData['name'] = "updateDeckAndPool"
	responseData['turn'] = playerName
	responseData['nextturn'] = nextPlayerName
	responseData['options'] = data['discardedCard']

	if swap == 1:
		swapCard(playerName, svgroom, data['position'], data['drawnCard'])

	# using nextPlayername here only for 2 player
	cards = json.loads( redis.hget("USER_CARDS", nextPlayerName) )
	responseData['cards'] = cards['cards']

	responseData['specialCard'] = '10'
	responseData['player'] = nextPlayerName #responseData['player'] = data['player']
	return responseData



# This function will be called only by the client who is performing the action
# Take 3 arguments: card # to be swapped, rank of new card to be stored, suit of new card
def swapCard(playerName, svgroom, removePosition, drawnCard):
	newCardRank = drawnCard['rank']
	newCardSuit = drawnCard['suit']

	currentCards = json.loads( redis.hget("USER_CARDS", playerName) )
	# removePostion is an integer [1,3]
	newCards = currentCards
	newCards["cards"][removePosition]["rank"] = newCardRank
	newCards["cards"][removePosition]["suit"] = newCardSuit
	redis.hset("USER_CARDS", session['name'], json.dumps(newCards))



# This function will be called only by the client who is performing the action when they get Q
# In this user will specify the card number of the other player whose card will be swapped
# User provides: card number to be swapped, player with whom to swap and the location of the card
def exchangeCard(playerName, position, opponent, opponentPosition):
	currentMe = json.loads( redis.hget("USER_CARDS", playerName) )
	currentOpp = json.loads( redis.hget("USER_CARDS", opponent) )
	
	newCardsMe = copy.deepcopy(currentMe)
	newCardsOpp = copy.deepcopy(currentOpp)

	newCardsMe["cards"][position] = currentOpp["cards"][opponentPosition]
	newCardsOpp["cards"][opponentPosition] = currentMe["cards"][position]
	
	redis.hset("USER_CARDS", playerName, json.dumps(newCardsMe))
	redis.hset("USER_CARDS", opponent, json.dumps(newCardsOpp))



# This function is called when a user gets a J
# Shuffle the order of the cards of another user
# Takes in the player name whose cards are to be swapped
def shuffleCards(playerToShuffle):
	currentCards = json.loads( redis.hget("USER_CARDS", playerToShuffle) )

	newCards = copy.deepcopy(currentCards)
	a = [0,1,2]
	shuffle(a)
	newCards['cards'][0] = currentCards['cards'][a[0]]
	newCards['cards'][1] = currentCards['cards'][a[1]]
	newCards['cards'][2] = currentCards['cards'][a[2]]

	redis.hset("USER_CARDS", playerToShuffle, json.dumps(newCards))


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


def getNextPlayer(currentPlayer, svgroom):
	orderPlayers = getOrderOfPlay(svgroom)
	for x in range(0, NUM_PLAYERS_ROOM):
		if orderPlayers[x] == currentPlayer:
			if x != NUM_PLAYERS_ROOM-1:
				return orderPlayers[x+1]
			else:
				return orderPlayers[0]



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
		redis.hset("USER_CARDS", player['name'], json.dumps({'cards':player['cards']}) )
		cardsAndPlayers.append(player)
	
	print "start game: " + json.dumps({'data':cardsAndPlayers})
	emit('start', {'data':cardsAndPlayers}, room=svgroom)


# Create the first 3 cards for all players
def dealCards(numPlayers):
	c = Cards()
	c.deal(numPlayers)
	c.format_for_client()
	return c.all_player_cards


def informNextPlayerOfTurn(currentPlayer, svgroom):
	nextPlayer = getNextPlayer(currentPlayer, svgroom)
	for player in players:
		if player.session['name'] == nextPlayer:
			player.base_emit('turn')


def getOrderOfPlay(svgroom):
	redisKey = "ROOM_" + svgroom
	return list( redis.smembers(redisKey) )


def isRoomFull(svgroom):
	redisKey = "ROOM_" + svgroom
	if redis.scard(redisKey) >= NUM_PLAYERS_ROOM:
		return True
	return False


def addUserToRoom(name, svgroom):
	if redis.sismember("ROOM", svgroom) == False:
		redis.sadd("ROOM", svgroom)
	redisKey = "ROOM_" + svgroom
	if redis.scard(redisKey) < NUM_PLAYERS_ROOM:
		redis.sadd(redisKey, name)


def endGame(svgroom):
	print "game over"
	redis.srem("ROOM", svgroom)
	redisKey = "ROOM_" + svgroom
	orderPlayers = getOrderOfPlay(svgroom)

	endGameCards = []

	for x in range(0, NUM_PLAYERS_ROOM):
		for player in players:
			if player.session['name'] == orderPlayers[x]:
				thisPlayer = {}
				thisPlayer['name'] = player.session['name']
				thisPlayer['cards'] = redis.hget("USER_CARDS", player.session['name'])
				endGameCards.append(thisPlayer)
				redis.hdel("USER_CARDS", player.session['name'])
				redis.srem(redisKey, player.session['name'])

	emit('endgame', {'data':endGameCards}, room=svgroom)

	for x in range(0, NUM_PLAYERS_ROOM):
		for player in players:
			if player.session['name'] == orderPlayers[x]:
				player.leave_room(player.session['room'])




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
	emit('log', action , room=svgroom)


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