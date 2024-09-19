from flask import Flask, request, jsonify, render_template, send_from_directory
import pickle
import json
import numpy as np
import logging


app = Flask(__name__, static_url_path='/static', static_folder='static')

logging.basicConfig(level=logging.DEBUG)

# Load your machine learning model
with open('public/final.pickle', 'rb') as file:
    model = pickle.load(file)

# Load data columns
with open('public/columns.json', 'r') as file:
    data_columns = json.load(file)['data_columns']

@app.route("/", methods=['GET'])
def home():
    return render_template('index.html')

# @app.route('/public/<path:filename>')
# def serve_public(filename):
#     return send_from_directory('public', filename)

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    logging.debug(f"Received data: {data}")

    location = data['location']
    area = float(data['area'])
    bathrooms = int(data['bathrooms'])
    bhk = int(data['bhk'])

    estimated_price = predict_price(location, area, bathrooms, bhk)

    return jsonify({'success': True, 'price': estimated_price})

def predict_price(location, sqft, bath, bhk):
    logging.debug(f"Predicting price for: location={location}, sqft={sqft}, bath={bath}, bhk={bhk}")
    try:
        loc_index = data_columns.index(location.lower())
    except ValueError:
        logging.error(f"Invalid location: {location}")
        return None

    x = np.zeros(len(data_columns))
    x[0] = sqft
    x[1] = bath
    x[2] = bhk
    if loc_index >= 0:
        x[loc_index] = 1

    try:
        prediction = model.predict([x])[0]
        logging.debug(f"Predicted price: {prediction}")
        return round(prediction, 2)
    except Exception as e:
        logging.error(f"Prediction error: {str(e)}")
        return None

if __name__ == '__main__':
    app.run(debug=True)