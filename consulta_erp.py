import os
import pyodbc
from dotenv import load_dotenv

load_dotenv()

def conectar_erp():
    server = os.getenv("ERP_HOST")
    database = os.getenv("ERP_NAME")
    user = os.getenv("ERP_USER")
    password = os.getenv("ERP_PASSWORD")

    cadena_conexion = (
        f'Driver={{SQL Server}};'
        f'Server={server};'
        f'Database={database};'
        f'UID={user};'
        f'PWD={password};'
        f'Timeout=10;'
    )
    return pyodbc.connect(cadena_conexion)

def obtener_contenedores():
    conn = conectar_erp()
    if not conn:
        print("No se pudo conectar al ERP")
        return

    try:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT c.id, c.mov, c.movid, c.Referencia, c.Estatus, c.Situacion, 
                   c.proveedor, p.Nombre as CFDIRetBeneficiarioNombre,
                   CAST(C.FechaEmision AS DATE) as Fecha,
                   CD.Articulo, a.Descripcion1 as Descripcion,
                   CD.Cantidad, c.origen, c.origenid
            FROM compra c
            LEFT JOIN comprad cd ON c.id = cd.ID
            LEFT JOIN Prov p ON c.proveedor = p.proveedor
            LEFT JOIN art a ON cd.articulo = a.Articulo
            WHERE c.mov IN ('Entrada Importacion') 
            AND YEAR(C.FechaEmision) >= 2026
            AND c.Estatus IN ('SINAFECTAR')
        """)

        columnas = [col[0] for col in cursor.description]
        print(" | ".join(columnas))
        print("-" * 80)

        for fila in cursor.fetchall():
            print(" | ".join(str(val) for val in fila))

    except Exception as e:
        print(f"Error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    obtener_contenedores()