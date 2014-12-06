from . import main
from flask import render_template

@main.route('/')
def testFunc():
	return "Test Flask App"

@main.route('/login/')
def login():
	return render_template('login.html')

@main.route('/game/')
def game():
	return render_template('game.html')