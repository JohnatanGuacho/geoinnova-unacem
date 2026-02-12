import json
import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
import joblib
from pathlib import Path

# ===== CONFIG =====
BASE = Path(r"C:\Users\johna\Desktop\GEOINNOVA\GEOINNOVA\model")
CSV_PATH = BASE / "reportes_por_trimestre_organizado.csv"
WINDOW = 3

df = pd.read_csv(CSV_PATH)

# ---- temporal ----
df["anio"] = df["anio_trimestre"].str.split("-T").str[0].astype(int)
df["trimestre"] = df["anio_trimestre"].str.split("-T").str[1].astype(int)

# ---- scalers ----
scaler_time = MinMaxScaler()
time_scaled = scaler_time.fit_transform(df[["anio", "trimestre"]])

scaler_total = MinMaxScaler()
total_scaled = scaler_total.fit_transform(df[["Total_reportes"]].values)

joblib.dump(scaler_time, str(BASE / "scaler_time.pkl"))
joblib.dump(scaler_total, str(BASE / "scaler_total.pkl"))

# ---- features (anio, trimestre, total) ----
X_features = np.concatenate([time_scaled, total_scaled], axis=1)  # (n, 3)

# ---- columnas targets (OJO: tus columnas son tipo__ / genero__ / sitio__ / cat__) ----
cols_que   = [c for c in df.columns if c.startswith("tipo__")]
cols_quien = [c for c in df.columns if c.startswith("genero__")]
cols_donde = [c for c in df.columns if c.startswith("sitio__")]
cols_como  = [c for c in df.columns if c.startswith("cat__")]

# ---- targets como proporciones ----
total = df["Total_reportes"].values.astype(float)
eps = 1e-9

y_que   = df[cols_que].values   / (total[:, None] + eps)
y_quien = df[cols_quien].values / (total[:, None] + eps)
y_donde = df[cols_donde].values / (total[:, None] + eps)
y_como  = df[cols_como].values  / (total[:, None] + eps)

# riesgo total (0..1)
y_total = total_scaled  # (n, 1)

def create_sequences(X, Y_list, window=3):
    X_seq = []
    Ys = [[] for _ in range(len(Y_list))]
    for i in range(len(X) - window):
        X_seq.append(X[i:i+window])
        for j, Y in enumerate(Y_list):
            Ys[j].append(Y[i+window])
    return np.array(X_seq), [np.array(y) for y in Ys]

targets = [y_que, y_quien, y_donde, y_como, y_total]
X_seq, y_seq = create_sequences(X_features, targets, WINDOW)

# ---- save npy ----
np.save(str(BASE / "X_seq.npy"), X_seq)
np.save(str(BASE / "y_que.npy"), y_seq[0])
np.save(str(BASE / "y_quien.npy"), y_seq[1])
np.save(str(BASE / "y_donde.npy"), y_seq[2])
np.save(str(BASE / "y_como.npy"), y_seq[3])
np.save(str(BASE / "y_total.npy"), y_seq[4])

# ---- save label map ----
label_map = {
    "que": cols_que,
    "quien": cols_quien,
    "donde": cols_donde,
    "como": cols_como
}
with open(BASE / "label_map.json", "w", encoding="utf-8") as f:
    json.dump(label_map, f, ensure_ascii=False, indent=2)

print("✅ Preprocess OK")
print("X_seq:", X_seq.shape)
print("y_que:", y_seq[0].shape, "y_quien:", y_seq[1].shape, "y_donde:", y_seq[2].shape, "y_como:", y_seq[3].shape, "y_total:", y_seq[4].shape)
