from flask import Flask, render_template, session, request
from flask.ext.socketio import emit, join_room, leave_room
from .. import socketio