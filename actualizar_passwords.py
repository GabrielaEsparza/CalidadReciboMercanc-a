import bcrypt
from conexion_db import consultar_db

def encriptar_para_dotnet(password_plano: str) -> str:
    # 1. Convertir el texto plano a bytes (UTF-8)
    password_bytes = password_plano.encode('utf-8')
    
    # 2. Generar el Salt aleatorio estándar de BCrypt
    # rounds=11 es el factor de trabajo seguro por defecto de .NET
    salt = bcrypt.gensalt(rounds=11)
    
    # 3. Crear el Hash
    hash_bytes = bcrypt.hashpw(password_bytes, salt)
    
    # 4. Convertirlo a texto de vuelta para guardarlo en la base de datos
    return hash_bytes.decode('utf-8')

if __name__ == "__main__":
    print("--- ENCRIPTANDO CONTRASEÑA COMPATIBLE CON .NET ---")
    
    password_original = "admin123"
    
    # Generamos el hash seguro (se verá como: $2b$11$...)
    password_encriptado = encriptar_para_dotnet(password_original)
    
    # Preparamos la consulta para el operador "admi"
    query = "UPDATE Operadores SET `Password` = %s WHERE `Name` = %s"
    params = (password_encriptado, "admin")
    
    filas_afectadas = consultar_db(query, params)
    
    if filas_afectadas is not None and filas_afectadas > 0:
        print("¡Éxito! Contraseña encriptada y actualizada en la base de datos.")
        print(f"Hash guardado: {password_encriptado}")
    else:
        print("No se pudo actualizar. Verifica que el operador 'admin' exista.")
