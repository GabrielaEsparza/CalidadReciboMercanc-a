import os
import threading
import mysql.connector
from dotenv import load_dotenv


load_dotenv() # Carga variables de entorno desde un archivo .env

# Configuración de la base de datos usando variables de entorno
dbconfig = {
    "host": os.getenv("DB_HOST"),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
    "database": os.getenv("DB_NAME"),
}

# Función conectar_db() que creará una conexión directa, nueva y limpia cada vez
def conectar_db():
    try:
        # Ya no usamos el pool, nos conectamos directamente al motor de MySQL
        return mysql.connector.connect(**dbconfig)
    except Exception as e:
        print(f"Error al conectar a la base de datos: {e}")
        return None