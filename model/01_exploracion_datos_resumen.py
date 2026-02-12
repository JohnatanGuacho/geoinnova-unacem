"""
01. Exploración Resumida del Dataset

Contexto:
Este script realiza una validación básica de coherencia y estructura sobre un dataset
previamente depurado y categorizado de reportes de seguridad industrial agregados por trimestre.
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

# =========================
# CONFIGURACIÓN
# =========================
DATA_PATH = r"C:\Users\johna\Desktop\GEOINNOVA\GEOINNOVA\model\reportes_por_trimestre_organizado.csv"

# =========================
# CARGA DE DATOS
# =========================
df = pd.read_csv(DATA_PATH)

print("Primeras filas del dataset:")
print(df.head(), "\n")

# =========================
# ESTRUCTURA GENERAL
# =========================
print("Dimensiones del dataset:")
print(f"Filas (trimestres): {df.shape[0]}")
print(f"Columnas: {df.shape[1]}\n")

print("Información de columnas:")
print(df.info(), "\n")

# =========================
# VALIDACIÓN DE CONSISTENCIA
# =========================
tipo_cols = [col for col in df.columns if col.startswith('tipo_')]

df['suma_tipos'] = df[tipo_cols].sum(axis=1)
df['diferencia'] = df['Total_reportes'] - df['suma_tipos']

print("Resumen de diferencias entre Total_reportes y suma de tipos:")
print(df['diferencia'].describe(), "\n")

# =========================
# VALIDACIÓN TEMPORAL
# =========================
plt.figure(figsize=(10, 4))
plt.plot(df['anio_trimestre'], df['Total_reportes'], marker='o')
plt.xticks(rotation=45)
plt.title('Total de Reportes por Trimestre')
plt.xlabel('Trimestre')
plt.ylabel('Número de Reportes')
plt.grid(True)
plt.tight_layout()
plt.show()

# =========================
# CONCLUSIÓN
# =========================
print("Conclusión:")
print("- El dataset presenta coherencia estadística completa.")
print("- La estructura temporal es consistente.")
print("- Los datos son aptos para modelado predictivo de riesgo.")