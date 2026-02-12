import json
import numpy as np
import tensorflow as tf
from pathlib import Path

# OJO: BASE debe apuntar donde está tu .h5 y tus .npy
BASE = Path(r"C:\Users\johna\Desktop\GEOINNOVA\GEOINNOVA\model")

model = tf.keras.models.load_model(BASE / "modelo_geoinnova_multitask.h5", compile=False)
X = np.load(BASE / "X_seq.npy")

with open(BASE / "label_map.json", "r", encoding="utf-8") as f:
    labels = json.load(f)

def topk(probs, names, k=3):
    idx = np.argsort(probs)[::-1][:k]
    return [(names[i], float(probs[i])) for i in idx]

pred_que, pred_quien, pred_donde, pred_como, pred_total = model.predict(X[-1:], verbose=0)

pred_que = pred_que[0]
pred_quien = pred_quien[0]
pred_donde = pred_donde[0]
pred_como = pred_como[0]
pred_total = float(pred_total[0][0])

print("\n=== ✅ PREDICCIÓN (última ventana) ===")
print("Riesgo total (0..1):", pred_total)

print("\nTOP-3 ¿QUÉ?")
for lbl, p in topk(pred_que, labels["que"]):
    print(f" - {lbl}: {p:.3f}")

print("\nTOP-3 ¿QUIÉN?")
for lbl, p in topk(pred_quien, labels["quien"]):
    print(f" - {lbl}: {p:.3f}")

print("\nTOP-3 ¿DÓNDE?")
for lbl, p in topk(pred_donde, labels["donde"]):
    print(f" - {lbl}: {p:.3f}")

print("\nTOP-3 ¿CÓMO?")
for lbl, p in topk(pred_como, labels["como"]):
    print(f" - {lbl}: {p:.3f}")
