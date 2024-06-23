from flask import Flask, request, jsonify
from tensorflow.keras.models import load_model
from flask_cors import CORS
from tensorflow.keras.preprocessing import image
import numpy as np
from PIL import Image
import io
import os

app = Flask(__name__)
CORS(app)

os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

model = load_model('doodle_model.h5')

def prepare_image(img):
    img = img.resize((150, 150))
    img = img.convert('RGB')
    img = image.img_to_array(img)
    img = np.expand_dims(img, axis=0)
    img = img / 255.0
    return img

class_labels = ['adaptor', 'batman', 'cheese', 'heart', 'pen', 'roses', 'sofa']

@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    try:
        img = Image.open(io.BytesIO(file.read()))
        img = prepare_image(img)
        prediction = model.predict(img)
        predicted_class_index = np.argmax(prediction, axis=1)[0]
        predicted_class = class_labels[predicted_class_index]
        return jsonify({'predicted_class': predicted_class})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
