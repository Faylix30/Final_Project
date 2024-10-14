from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import tensorflow as tf
import numpy as np
import jwt
import os
from imageupload import connect_to_db, create_image_upload, save_file
from datetime import datetime
import bcrypt

# Flask app setup
app = Flask(__name__)
CORS(app)

# JWT Secret Key
SECRET_KEY = "MySecretKey"

# MySQL Connection
db = connect_to_db()
cursor = db.cursor()

# Load TensorFlow Model
model = tf.keras.models.load_model('./model/DenseNet201.h5')

# Upload folder configuration
UPLOAD_FOLDER = 'imageupload'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def predict_image(image_path):
    img = tf.keras.preprocessing.image.load_img(image_path)
    img_array = tf.keras.preprocessing.image.img_to_array(img) / 255.0

    img_array = tf.image.resize(img_array, (200, 250))  # ปรับขนาดให้ตรงกับโมเดล
    img_array = np.expand_dims(img_array, axis=0)

    prediction = model.predict(img_array)
    return prediction.tolist()


@app.route('/api/upload', methods=['POST'])
def upload_image():
    if 'images[]' not in request.files:
        return jsonify({'result': False, 'message': 'No file part'})

    files = request.files.getlist('images[]')  # รับไฟล์หลายไฟล์จากคำขอ
    if not files:
        return jsonify({'result': False, 'message': 'No files found'})

    print(f"Received {len(files)} files")  # ตรวจสอบจำนวนไฟล์ที่ได้รับ
    results = []  # สำหรับเก็บผลลัพธ์การพยากรณ์ของแต่ละไฟล์

    for file in files:
        if file.filename == '':
            return jsonify({'result': False, 'message': 'No selected file'})

        filename = secure_filename(file.filename)
        
        # บันทึกข้อมูลลงฐานข้อมูล (ขั้นแรกก่อนบันทึกรูป) เพื่อดึงค่า image_id
        now = datetime.now().strftime('%Y-%m-%d')
        try:
            cursor.execute("INSERT INTO image (date, image_name) VALUES (%s, %s)", (now, filename))
            db.commit()
            image_id = cursor.lastrowid  # ดึง image_id จากฐานข้อมูลหลังการบันทึก
        except Exception as e:
            db.rollback()
            return jsonify({'result': False, 'message': str(e)})

        # นำ image_id มานำหน้าชื่อไฟล์
        new_filename = f"{image_id}_{filename}"
        print(f"Processing file: {new_filename}")  # ตรวจสอบชื่อไฟล์ที่ถูกเปลี่ยนแปลง

        try:
            # บันทึกไฟล์ในโฟลเดอร์ที่กำหนดด้วยชื่อใหม่
            file_path = save_file(file, app.config['UPLOAD_FOLDER'], new_filename)
            print(f"File saved at: {file_path}")  # ตรวจสอบการบันทึกไฟล์

            # อัปเดตชื่อไฟล์ในฐานข้อมูลหลังจากบันทึกไฟล์
            cursor.execute("UPDATE image SET image_name = %s WHERE image_id = %s", (new_filename, image_id))
            db.commit()

            # ทำการพยากรณ์ด้วย TensorFlow สำหรับแต่ละไฟล์
            prediction = predict_image(file_path)
            results.append({'file': new_filename, 'prediction': prediction})

        except Exception as e:
            db.rollback()  # ยกเลิกการเปลี่ยนแปลงในกรณีที่เกิดข้อผิดพลาด
            print(f"Error: {str(e)}")  # แสดงข้อผิดพลาดใน console
            return jsonify({'result': False, 'message': str(e)})

    return jsonify({'result': True, 'message': 'Images uploaded successfully', 'predictions': results})

# API: predict
@app.route('/api/predict', methods=['POST'])
def predict():
    data = request.json
    image_path = os.path.join(app.config['UPLOAD_FOLDER'], data['filename'])

    if not os.path.exists(image_path):
        return jsonify({'result': False, 'message': 'File not found'})

    try:
        prediction = predict_image(image_path)
        return jsonify({'result': True, 'prediction': prediction})
    except Exception as e:
        return jsonify({'result': False, 'message': str(e)})

# API: ล็อกอิน
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data['username']
    password = data['password'].encode('utf-8')

    cursor.execute("SELECT * FROM users WHERE user_name = %s", (username,))
    user = cursor.fetchone()

    if user and bcrypt.checkpw(password, user[2].encode('utf-8')):
        return jsonify({'result': True})
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

# รัน Flask Server
if __name__ == '__main__':
    app.run(port=8080, debug=True)
