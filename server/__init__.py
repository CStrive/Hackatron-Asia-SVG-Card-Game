from redis import Redis
from flask import Flask
from flask.ext.socketio import SocketIO

socketio = SocketIO()
redis = Redis()

def create_app(debug=False):
	"""Create an application."""
	app = Flask(__name__)
	app.debug = debug

	from .main import main as main_blueprint
	app.register_blueprint(main_blueprint)

	socketio.init_app(app)
	return app