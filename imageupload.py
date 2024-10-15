import mysql.connector
from mysql.connector import Error
import os
from datetime import datetime

def connect_to_db():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="",
        database="project"
    )

# ฟังก์ชันสำหรับบันทึกภาพลงใน MySQL
def create_image_upload(cursor, date, image_name):
    sql = "INSERT INTO image (date, image_name) VALUES (%s, %s)"
    values = (date, image_name)

    try:
        cursor.execute(sql, values)
    except Error as e:
        print(f"Error inserting image: {e}")
        raise e

# ฟังก์ชันสำหรับบันทึกภาพลงใน Folder
def save_file(file, upload_folder, new_filename):
    os.makedirs(upload_folder, exist_ok=True)  # สร้างโฟลเดอร์ถ้าเกิดไม่มีอยู่
    file_path = os.path.join(upload_folder, new_filename)
    file.save(file_path)  # บันทึกไฟล์
    return file_path
