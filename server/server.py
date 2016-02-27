from animals import AnimalApi
from flask import Flask, render_template
from flask_restful import Api
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
static_folder = os.path.join(BASE_DIR, 'client', 'app', 'dist')
print(static_folder)
app = Flask(__name__, template_folder='../client/app', static_path='/static', static_folder=static_folder)
api = Api(app)

api.add_resource(AnimalApi, '/api/animals')


@app.route("/")
def hello():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)
