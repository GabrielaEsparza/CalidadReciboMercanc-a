#!/usr/bin/env python3
import pandas as pd
import json
import sys
from pathlib import Path

def process_arribos():
    # Ruta del archivo
    downloads = Path.home() / "Downloads" / "Arribos.xlsx"

    if not downloads.exists():
        print(json.dumps({"error": f"Archivo no encontrado: {downloads}"}))
        sys.exit(1)

    try:
        # Leer Excel
        df = pd.read_excel(downloads)

        # Normalizar nombres de columnas (remover espacios, minúsculas)
        df.columns = df.columns.str.strip().str.upper()

        # Filtrar por ESTATUS
        if 'ESTATUS' not in df.columns:
            print(json.dumps({"error": "Columna 'ESTATUS' no encontrada"}))
            print(f"Columnas disponibles: {df.columns.tolist()}")
            sys.exit(1)

        filtrado = df[df['ESTATUS'].isin(['CONCLUIDO', 'PENDIENTE MODULAR'])].copy()

        # Verificar columnas requeridas
        columnas_requeridas = ['PO', 'CODIGO', 'SHP QTY', 'CONTENEDOR']
        columnas_faltantes = [col for col in columnas_requeridas if col not in df.columns]

        if columnas_faltantes:
            print(json.dumps({
                "error": f"Columnas faltantes: {columnas_faltantes}",
                "columnas_disponibles": df.columns.tolist()
            }))
            sys.exit(1)

        # Extraer columnas y agregar ID (número de fila original + 2 por header)
        resultado = []
        for idx, row in filtrado.iterrows():
            registro = {
                "ID": idx + 2,  # +2: +1 para header, +1 porque pandas es 0-indexed
                "PO": row['PO'],
                "CODIGO": row['CODIGO'],
                "SHP_QTY": row['SHP QTY'],
                "CONTENEDOR": row['CONTENEDOR']
            }
            resultado.append(registro)

        # Output JSON
        output = {
            "total": len(resultado),
            "registros": resultado
        }

        print(json.dumps(output, indent=2, ensure_ascii=False))

    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    process_arribos()
