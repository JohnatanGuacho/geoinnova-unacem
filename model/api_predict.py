import json
import numpy as np
import tensorflow as tf
from flask import Flask, jsonify
from pathlib import Path
from flask_cors import CORS


BASE = Path(r"C:\Users\johna\Desktop\GEOINNOVA\GEOINNOVA\model")

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Cargar modelo una sola vez
model = tf.keras.models.load_model(BASE / "modelo_geoinnova_multitask.h5", compile=False)

# Cargar data y labels
X = np.load(BASE / "X_seq.npy")
with open(BASE / "label_map.json", "r", encoding="utf-8") as f:
    labels = json.load(f)

def topk(probs, names, k=3):
    idx = np.argsort(probs)[::-1][:k]
    return [{"label": names[i], "p": float(probs[i])} for i in idx]

def risk_level(score: float):
    # semáforo simple (ajústalo si quieres)
    if score < 0.40:
        return {"nivel": "BAJO", "color": "green"}
    if score < 0.70:
        return {"nivel": "MEDIO", "color": "yellow"}
    return {"nivel": "ALTO", "color": "red"}

@app.get("/api/predict/latest")
def predict_latest():
    pred_que, pred_quien, pred_donde, pred_como, pred_total = model.predict(X[-1:], verbose=0)

    score = float(pred_total[0][0])
    sem = risk_level(score)

    payload = {
        "riesgo": score,
        "nivel": sem["nivel"],
        "color": sem["color"],
        "top3": {
            "que": topk(pred_que[0], labels["que"], 3),
            "quien": topk(pred_quien[0], labels["quien"], 3),
            "donde": topk(pred_donde[0], labels["donde"], 3),
            "como": topk(pred_como[0], labels["como"], 3),
        }
    }
    return jsonify(payload)

if __name__ == "__main__":
    # corre en local
    app.run(host="127.0.0.1", port=5050, debug=True)


