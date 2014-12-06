from flask import Flask, render_template, session, request
from flask.ext.socketio import emit, join_room, leave_room
from .. import socketio, redis

players = []
defaultRoom = str(0)

# Connect client socket
# Store client name and set default room
@socketio.on('connect', namespace='/svg')
def socketConnect(user):
	session['name'] = user['name']
	session['room'] = defaultRoom
	players.append(request.namespace)

# Disconnect a client
@socketio.on('disconnect', namespace='/svg')
def socketDisconnect():
    if players.count(request.namespace) != 0:
    	players.remove(request.namespace)


# Retrieve the cards of the current user and return json
@socketio.on('mycards', namespace='/svg')
def getMyCards():
	if redis.hexists("USER_CARDS", session['name']) == True:
		cards = json.loads( redis.hget("USER_CARDS", session['name']) )
		emit('response', {'data':cards})


# Set the three cards that belong to the user
# Store the cards json in redis
# Supposed to be performed only during the first game creation
@socketio.on('setcards', namespace='/svg')
def setMyCards(userCards):
	redis.hset("USER_CARDS", session['name'], json.dumps(userCards))


# This function will be called only by the client who is performing the action
# Take 3 arguments: card # to be swapped, rank of new card to be stored, suit of new card
@socketio.on('swapcards', namespace='/svg')
def swapCard(removeCard, newCardRank, newCardSuit):
	currentCards = json.loads( redis.hget("USER_CARDS", session['name']) )
	# removeCard is an integer [1,3]
	newCards = currentCards
	newCards["cards"][removeCard-1]["rank"] = newCardRank
	newCards["cards"][removeCard-1]["suit"] = newCardSuit
	redis.hset("USER_CARDS", session['name'], json.dumps(newCards))

	dropCard(session['room'], currentCards['cards'][removeCard-1]['rank'], currentCards['cards'][removeCard-1]['suits'])
	clientRemoveCard(session['name'], session['room'], newCardRank, newCardSuit)

	action = session['name'] + " swapped the card at position " + str(removeCard) + " with the new card"
	updatePlayerLogs(action, session['room'])



# This function will be called only by the client who is performing the action
# Function is called when the drawn card is going to be dropped
@socketio.on('dropcard', namespace='/svg')
def cardToBeDropped(newCardRank, newCardSuit):
	dropCard(session['room'], newCardRank, newCardSuit)
	clientRemoveCard(session['name'], session['room'], newCardRank, newCardSuit)

	action = session['name'] + " dropped the drawn card"
	updatePlayerLogs(action, session['room'])


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
def dropCard(svgroom, cardRank, cardSuit):
	card = {}
	card['rank'] = cardRank
	card['suit'] = cardSuit
	emit('drop', {'data':card}, room=svgroom)