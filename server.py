from flask import Flask, request, jsonify, render_template
import pickle
import json
import numpy as np
import logging
import os  # For environment variables like PORT

# Flask app setup
app = Flask(__name__, static_url_path='/static', static_folder='static')

# Set up logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

# Load the machine learning model
try:
    with open('static/public/final.pickle', 'rb') as file:
        model = pickle.load(file)
        logging.info("Model loaded successfully.")
except FileNotFoundError as e:
    logging.error(f"Model file not found: {str(e)}")
    model = None

# Load data columns
try:
    with open('static/public/columns.json', 'r') as file:
        data_columns = json.load(file)['data_columns']
        logging.info("Data columns loaded successfully.")
except FileNotFoundError as e:
    logging.error(f"Columns file not found: {str(e)}")
    data_columns = []

@app.route("/", methods=['GET'])
def home():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        logging.debug(f"Received data: {data}")

        location = data.get('location', '').lower()
        area = float(data.get('area', 0))
        bathrooms = int(data.get('bathrooms', 0))
        bhk = int(data.get('bhk', 0))

        estimated_price = predict_price(location, area, bathrooms, bhk)

        if estimated_price is not None:
            return jsonify({'success': True, 'price': estimated_price})
        else:
            return jsonify({'success': False, 'message': 'Invalid location or prediction error'})
    except Exception as e:
        logging.error(f"Error in predict endpoint: {str(e)}")
        return jsonify({'success': False, 'message': 'Error processing request'})

def predict_price(location, sqft, bath, bhk):
    logging.debug(f"Predicting price for: location={location}, sqft={sqft}, bath={bath}, bhk={bhk}")
    try:
        loc_index = data_columns.index(location) if location in data_columns else -1

        x = np.zeros(len(data_columns))
        x[0] = sqft
        x[1] = bath
        x[2] = bhk
        if loc_index >= 0:
            x[loc_index] = 1

        prediction = model.predict([x])[0]
        logging.debug(f"Predicted price: {prediction}")
        return round(prediction, 2)
    except Exception as e:
        logging.error(f"Prediction error: {str(e)}")
        return None

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))  # Dynamically determine port
    app.run(host='0.0.0.0', port=port, debug=True)

