from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import tensorflow as tf
import numpy as np
import jwt
import os
from database import connect_to_db
from datetime import datetime
import bcrypt
import base64
from io import BytesIO
from PIL import Image
import mysql.connector
from mysql.connector import Error

# Flask app setup
app = Flask(__name__)
CORS(app)

# JWT Secret Key
SECRET_KEY = "MySecretKey"

# MySQL Connect
db = connect_to_db()
cursor = db.cursor()

# Load Model
model = tf.keras.models.load_model('./model/ResNet50.h5')

# Upload folder configuration
UPLOAD_FOLDER = 'imageupload'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def predict_image(image_path):
    # โหลด และ predict ด้วยโมเดล
    img = tf.keras.preprocessing.image.load_img(image_path, target_size=(200, 250))
    img_array = tf.keras.preprocessing.image.img_to_array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0)

    # predict และดึงค่าความน่าจะเป็นสำหรับแต่ละคลาส
    predictions = model.predict(img_array)
    labels = ['ไม่สามารถระบุเชื้อได้','Microsporum canis', 'Scytalidium dimidiatum']

    # สร้างผลลัพธ์โดยแสดงความน่าจะเป็นของแต่ละคลาสเป็นเปอร์เซ็นต์
    prediction_results = []
    for i, probability in enumerate(predictions[0]):
        percentage = round(float(probability) * 100, 2)  # แปลงค่าเป็นเปอร์เซ็นต์และแสดงทศนิยม 2 ตำแหน่ง
        prediction_results.append({
            'class': labels[i],
            'probability': percentage
        })

    # แปลงรูปภาพเป็น Base64 เพื่อใช้แสดงใน frontend
    pil_img = Image.open(image_path)
    buffered = BytesIO()
    pil_img.save(buffered, format="JPEG")
    img_base64 = base64.b64encode(buffered.getvalue()).decode('utf-8')

    return {
        'prediction_results': prediction_results,
        'image_base64': img_base64
    }

# API: upload & predict
@app.route('/api/upload', methods=['POST'])
def upload_image():
    if 'images[]' not in request.files:
        return jsonify({'result': False, 'message': 'No file part'})

    files = request.files.getlist('images[]')
    if not files:
        return jsonify({'result': False, 'message': 'No files found'})

    results = []

    for file in files:
        if file.filename == '':
            return jsonify({'result': False, 'message': 'No selected file'})

        filename = secure_filename(file.filename)

        # Insert image details into database
        now = datetime.now().strftime('%Y-%m-%d')
        try:
            cursor.execute("INSERT INTO image (date, image_name) VALUES (%s, %s)", (now, filename))
            db.commit()
            image_id = cursor.lastrowid
        except Exception as e:
            db.rollback()
            return jsonify({'result': False, 'message': str(e)})

        # Rename file with image_id and save to disk
        new_filename = f"{image_id}_{filename}"
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], new_filename)
        file.save(file_path)

        try:
            # Get prediction results
            result = predict_image(file_path)

            # Update image name in database
            cursor.execute("UPDATE image SET image_name = %s WHERE image_id = %s", (new_filename, image_id))
            db.commit()

            # Save prediction results in database
            for prediction in result['prediction_results']:
                class_name = prediction['class']
                probability = prediction['probability']
                cursor.execute("INSERT INTO predictions (image_id, class_name, probability) VALUES (%s, %s, %s)", 
                               (image_id, class_name, probability))
            db.commit()

            # Add results to response
            results.append({
                'file': new_filename,
                'prediction_results': result['prediction_results'],
                'image_base64': result['image_base64']
            })
        except Exception as e:
            db.rollback()
            return jsonify({'result': False, 'message': str(e)})

    return jsonify({'result': True, 'predictions': results})

# API: prediction history
@app.route('/api/prediction-history', methods=['GET'])
def prediction_history():
    try:
        cursor.execute("""
            SELECT image.image_id, image.image_name, image.date, predictions.class_name, predictions.probability
            FROM image
            JOIN predictions ON image.image_id = predictions.image_id
            ORDER BY image.date DESC
        """)
        rows = cursor.fetchall()

        history = {}
        for row in rows:
            image_id, image_name, date, class_name, probability = row
            # ถ้า image_id ยังไม่มีใน history ให้สร้าง entry ใหม่
            if image_id not in history:
                history[image_id] = {
                    'image_id': image_id,
                    'image_name': image_name,
                    'date': date,
                    'predictions': []
                }
            # เพิ่มผลลัพธ์การ predict ในรายการ predictions
            history[image_id]['predictions'].append({
                'class_name': class_name,
                'probability': probability
            })

        # ส่งคืนข้อมูลในรูปแบบ list
        return jsonify({'result': True, 'history': list(history.values())})
    except Exception as e:
        return jsonify({'result': False, 'message': str(e)})

# API: delete prediction history
@app.route('/api/delete-history/<int:image_id>', methods=['DELETE'])
def delete_history(image_id):
    try:
        # ลบข้อมูล predictions ที่เกี่ยวข้องกับ image_id
        cursor.execute("DELETE FROM predictions WHERE image_id = %s", (image_id,))
        db.commit()
        
        # ลบข้อมูล image ที่เกี่ยวข้อง
        cursor.execute("DELETE FROM image WHERE image_id = %s", (image_id,))
        db.commit()

        return jsonify({'result': True, 'message': 'Deleted successfully'})
    except Exception as e:
        db.rollback()
        return jsonify({'result': False, 'message': str(e)})

# API: login
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data['username']
    password = data['password'].encode('utf-8')

    cursor.execute("SELECT * FROM users WHERE user_name = %s", (username,))
    user = cursor.fetchone()

    if user and bcrypt.checkpw(password, user[2].encode('utf-8')):
        user_role = user[5]
        
        return jsonify({
            'result': True,
            'user': {
                'username': username,
                'role': user_role
            }
        })
    else:
        return jsonify({'result': False, 'message': 'Invalid username or password'})

# API: รับ JWT Authentication
@app.route('/api/authen_request', methods=['POST'])
def authen_request():
    data = request.json
    username = data['username']

    cursor.execute("SELECT * FROM users WHERE user_name = %s", (username,))
    user = cursor.fetchone()

    if user:
        payload = {'username': username}
        auth_token = jwt.encode(payload, SECRET_KEY, algorithm='HS256')
        return jsonify({'result': True, 'data': {'auth_token': auth_token}})
    else:
        return jsonify({'result': False, 'message': 'Invalid username'})

# API: ตรวจสอบ JWT และให้ Access Token
@app.route('/api/access_request', methods=['POST'])
def access_request():
    data = request.json
    auth_token = data['auth_token']
    password = data['password'].encode('utf-8')

    try:
        decoded = jwt.decode(auth_token, SECRET_KEY, algorithms=['HS256'])
        username = decoded['username']

        cursor.execute("SELECT * FROM users WHERE user_name = %s", (username,))
        user = cursor.fetchone()

        if user and bcrypt.checkpw(password, user[2].encode('utf-8')):
            payload = {
                'user_id': user[0],
                'user_name': user[1],
                'first_name': user[3],
                'last_name': user[4]
            }
            access_token = jwt.encode(payload, SECRET_KEY, algorithm='HS256')
            return jsonify({'result': True, 'data': {'access_token': access_token, 'account_info': payload}})
        else:
            return jsonify({'result': False, 'message': 'Invalid username or password'})
    except jwt.ExpiredSignatureError:
        return jsonify({'result': False, 'message': 'Token expired'})
    except jwt.InvalidTokenError:
        return jsonify({'result': False, 'message': 'Invalid token'})


if __name__ == '__main__':
    app.run(port=8080, debug=True)