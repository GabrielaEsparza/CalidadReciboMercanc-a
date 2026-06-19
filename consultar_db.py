# Importamos directamente la función inteligente que ya tiene el COMMIT integrado
from conexion_db import consultar_db

if __name__ == "__main__":
    print("--- EJECUTANDO CONSULTA ---")
    
    # CASO A: Si vas a hacer un SELECT
    query = "SELECT * FROM Operadores"
    #query = "UPDATE Operadores SET `Name` = 'admin' WHERE `Id` = 5;"
    params = None
    
    resultado = consultar_db(query, params)
    
    # VALIDACIÓN INTELIGENTE:
    if resultado is not None:
        # Si es una lista, es un SELECT
        if isinstance(resultado, list):
            print(f"¡SELECT exitoso! Se encontraron {len(resultado)} registros:")
            print(resultado) # Aquí verás tus datos o un [] si está vacía, pero ya no dará error
            
        # Si es un número, es un INSERT / UPDATE / DELETE
        elif isinstance(resultado, int):
            print(f"¡Escritura exitosa! Filas afectadas o ID asignado: {resultado}")
    else:
        print("Error crítico: No se pudo procesar la consulta en la base de datos.")
