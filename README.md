GEOINNOVA - UNACEM Hackathon Project

Descripción General

Este repositorio contiene el desarrollo técnico realizado durante la Hackathon PUCE - UNACEM.
El proyecto implementa un sistema de análisis y predicción basado en datos históricos agregados por trimestre.

La solución incluye:

Preprocesamiento y transformación de datos agregados.

Entrenamiento de un modelo predictivo multi-salida (LSTM).

Exposición del modelo mediante una API REST para integración con un dashboard web.

Por políticas de confidencialidad, los datos originales proporcionados por UNACEM no se incluyen en este repositorio.

Objetivo del Proyecto

El objetivo principal del sistema es permitir el análisis y predicción de riesgo en base a reportes históricos, proporcionando:

Indicadores analíticos para un dashboard de monitoreo.

Predicción de riesgo total futuro (escala 0 a 1).

Predicción de distribución probable para variables categóricas asociadas al riesgo, tales como:

Tipo de evento (¿Qué?)

Perfil o clasificación del involucrado (¿Quién?)

Ubicación o sitio de ocurrencia (¿Dónde?)

Categoría de causa o condición (¿Cómo?)

Tecnologías Utilizadas

Python 3.10.8

Pandas y NumPy (procesamiento y transformación de datos)

Scikit-learn (normalización y escalado)

TensorFlow / Keras (modelo LSTM multitarea)

Flask (API REST de predicción)

Matplotlib (validación gráfica y exploración)

Estructura del Proyecto

Estructura sugerida del repositorio:

GEOINNOVA/
│
├── model/
│ ├── reportes_por_trimestre_organizado.csv
│ ├── X_seq.npy
│ ├── y_que.npy
│ ├── y_quien.npy
│ ├── y_donde.npy
│ ├── y_como.npy
│ ├── y_total.npy
│ ├── scaler_time.pkl
│ ├── scaler_total.pkl
│ ├── label_map.json
│ ├── modelo_geoinnova_multitask.h5
│ └── scripts/
│ ├── 01_exploracion_dataset.py
│ ├── 02_preprocess.py
│ ├── 03_train_model.py
│ ├── 04_predict_test.py
│
├── api_predict.py
├── requirements.txt
└── README.txt

Nota:
El archivo reportes_por_trimestre_organizado.csv no debe incluir datos confidenciales si el repositorio es público.

Instalación del Entorno

5.1 Clonar repositorio

git clone https://github.com/JohnatanGuacho/REPO.git

cd REPO

5.2 Crear entorno virtual

python -m venv venv

5.3 Activar entorno virtual

En Windows:
venv\Scripts\activate

En Linux/Mac:
source venv/bin/activate

5.4 Instalar dependencias

pip install -r requirements.txt

Ejecución del Proyecto

6.1 Preprocesamiento de datos

Este paso genera los archivos necesarios para el entrenamiento del modelo, incluyendo:

Secuencias temporales (X_seq.npy)

Variables objetivo (y_*.npy)

Escaladores (scaler_time.pkl, scaler_total.pkl)

Mapeo de etiquetas (label_map.json)

Ejecutar:

python model/scripts/02_preprocess.py

6.2 Entrenamiento del modelo

Este paso entrena el modelo LSTM multitarea y genera el archivo final:

modelo_geoinnova_multitask.h5

Ejecutar:

python model/scripts/03_train_model.py

6.3 Prueba local de predicción

Este script permite validar el modelo mediante una predicción de prueba usando la última ventana temporal del dataset.

Ejecutar:

python model/scripts/04_predict_test.py

API REST de Predicción

La API se desarrolló con Flask y permite consumir el modelo entrenado mediante un endpoint.

7.1 Ejecutar la API

python api_predict.py

Por defecto, la API corre en:

http://127.0.0.1:5050

7.2 Endpoint disponible

GET /api/predict/latest

Este endpoint devuelve:

Score de riesgo total (0 a 1)

Clasificación de riesgo (BAJO, MEDIO, ALTO)

Top 3 probabilidades para las salidas categóricas (¿Qué?, ¿Quién?, ¿Dónde?, ¿Cómo?)

Consideraciones Técnicas

El modelo fue entrenado con datos agregados por trimestre, con un enfoque de series temporales.

Se utiliza una ventana temporal de tamaño 3 para predecir el siguiente trimestre.

Las variables categóricas se manejan como distribuciones normalizadas (proporciones).

El riesgo total se predice como una salida adicional escalada en el rango 0..1.

El modelo final está almacenado en formato .h5 para portabilidad.

Seguridad y Confidencialidad

Los datos originales entregados por UNACEM son confidenciales y no se publican.

El repositorio debe ser compartido únicamente con personal autorizado si incluye información sensible.

Se recomienda que los archivos de dataset sean manejados internamente dentro de la organización.

Recomendaciones para Ejecución en Entorno Controlado (UNACEM)

Para replicar la solución en instalaciones internas se requiere:

Python 3.10.8 instalado

Creación de entorno virtual

Instalación de dependencias mediante requirements.txt

Disponibilidad de los archivos del modelo entrenado:

modelo_geoinnova_multitask.h5

scaler_time.pkl

scaler_total.pkl

label_map.json

X_seq.npy (si se desea predicción con ventanas ya creadas)

Posteriormente se ejecuta:

python api_predict.py

Contacto

Para consultas técnicas, soporte de instalación o replicación del entorno:

Nombre: Johnatan Guacho
Correo: johnatan.guacho@espoch.edu.ec

Fin del documento.