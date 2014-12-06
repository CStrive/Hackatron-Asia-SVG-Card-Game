from . import main

@main.route('/')
def testFunc():
	return "Test Flask App"