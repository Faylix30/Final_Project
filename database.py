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