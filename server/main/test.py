from . import main
from flask import render_template, request, session

@main.route('/')
def testFunc():
	return "Test Flask App"

@main.route('/login/')
def login():
	return render_template('login.html')

@main.route('/game', methods=['POST', 'GET'])
def game():
	session['name'] = request.form['inputNickname']
	print session['name']
	return render_template('game.html')