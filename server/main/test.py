from . import main
from flask import render_template, session, request

@main.route('/')
def testFunc():
	return render_template('login.html')

@main.route('/login/')
def login():
	return render_template('login.html')

@main.route('/game', methods=['POST', 'GET'])
def game():
	session['name'] = request.form['inputNickname']
	print session['name']
	return render_template('game.html')