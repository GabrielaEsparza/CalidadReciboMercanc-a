import os
import mysql.connector
from dotenv import load_dotenv

load_dotenv() 

dbconfig = {
    "host": os.getenv("DB_HOST"),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
    "database": os.getenv("DB_NAME"),
}

def conectar_db_recibo():
    try:
        recibo_dbconfig = dbconfig.copy()
        recibo_dbconfig["database"] = os.getenv("DB_NAME_RECIBO")
        return mysql.connector.connect(**recibo_dbconfig)
    except Exception as e:
        print(f"Error al conectar a la base de datos de recibo: {e}")
        return None

# ESTA es la función que dará el servicio a otros archivos
def consultar_db(query, params=None):
    conexion = conectar_db_recibo() 
    if not conexion:
        return None
    
    cursor = conexion.cursor(dictionary=True) 
    resultado = None
    
    try:
        cursor.execute(query, params or ())
        
        # El servicio detecta si es escritura y aplica el cambio de forma automática
        if query.strip().upper().startswith(("INSERT", "UPDATE", "DELETE", "ALTER")):
            conexion.commit()
            resultado = cursor.lastrowid if query.strip().upper().startswith("INSERT") else cursor.rowcount
        else:
            resultado = cursor.fetchall()
            
    except mysql.connector.Error as error:
        print(f"Error al ejecutar la consulta: {error}")
        resultado = None
    finally:
        cursor.close()
        conexion.close()
        
    return resultado
