import numpy as np
import tensorflow as tf
from sklearn.model_selection import train_test_split
from pathlib import Path

BASE = Path(r"C:\Users\johna\Desktop\GEOINNOVA\GEOINNOVA\model")

X = np.load(BASE / "X_seq.npy")          # (n, 3, 3)
y_que = np.load(BASE / "y_que.npy")      # (n, 6)
y_quien = np.load(BASE / "y_quien.npy")  # (n, 2)
y_donde = np.load(BASE / "y_donde.npy")  # (n, 5)
y_como = np.load(BASE / "y_como.npy")    # (n, 8)
y_total = np.load(BASE / "y_total.npy")  # (n, 1)

X_train, X_test, yq_tr, yq_te, yqu_tr, yqu_te, yd_tr, yd_te, yc_tr, yc_te, yt_tr, yt_te = train_test_split(
    X, y_que, y_quien, y_donde, y_como, y_total,
    test_size=0.33, random_state=42
)

# ===== modelo multi-salida =====
inp = tf.keras.Input(shape=(X.shape[1], X.shape[2]))  # (3,3)

x = tf.keras.layers.LSTM(32, return_sequences=False)(inp)
x = tf.keras.layers.Dense(32, activation="relu")(x)
x = tf.keras.layers.Dropout(0.15)(x)

# heads: salidas como distribuciones => softmax
out_que = tf.keras.layers.Dense(y_que.shape[1], activation="softmax", name="que")(x)
out_quien = tf.keras.layers.Dense(y_quien.shape[1], activation="softmax", name="quien")(x)
out_donde = tf.keras.layers.Dense(y_donde.shape[1], activation="softmax", name="donde")(x)
out_como = tf.keras.layers.Dense(y_como.shape[1], activation="softmax", name="como")(x)

# riesgo total escalado 0..1 => sigmoid
out_total = tf.keras.layers.Dense(1, activation="sigmoid", name="total")(x)

model = tf.keras.Model(
    inputs=inp,
    outputs=[out_que, out_quien, out_donde, out_como, out_total]
)

model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=1e-3),
    loss={
        "que": "mse",
        "quien": "mse",
        "donde": "mse",
        "como": "mse",
        "total": "mse"
    },
    metrics={
        "total": ["mae"]
    }
)

model.summary()

# callbacks (para no sobreentrenar)
cb = [
    tf.keras.callbacks.EarlyStopping(monitor="val_loss", patience=25, restore_best_weights=True)
]

history = model.fit(
    X_train,
    {"que": yq_tr, "quien": yqu_tr, "donde": yd_tr, "como": yc_tr, "total": yt_tr},
    validation_data=(X_test, {"que": yq_te, "quien": yqu_te, "donde": yd_te, "como": yc_te, "total": yt_te}),
    epochs=300,
    verbose=0,
    callbacks=cb
)

# evaluación rápida
eval_out = model.evaluate(
    X_test,
    {"que": yq_te, "quien": yqu_te, "donde": yd_te, "como": yc_te, "total": yt_te},
    verbose=0
)
print("✅ Evaluación OK (valores de loss/metric):", eval_out)

# guardar .h5
out_path = BASE / "modelo_geoinnova_multitask.h5"
model.save(out_path)
print("✅ Guardado:", out_path)
