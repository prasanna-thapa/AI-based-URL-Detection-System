import os
import sys
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
from xgboost import XGBClassifier
import joblib

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(CURRENT_DIR, "..", "backend")
sys.path.append(BACKEND_DIR)

from feature_engineering import extract_features, FAST_MODE

print("FAST_MODE =", FAST_MODE, "→ WHOIS/DNS disabled for training")

df = pd.read_csv("dataset.csv")

X = df["url"].apply(extract_features).apply(pd.Series)
y = df["label"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

model = XGBClassifier(
    n_estimators=600,
    max_depth=9,
    learning_rate=0.05,
    subsample=0.9,
    colsample_bytree=0.9,
    eval_metric="logloss",
    tree_method="gpu_hist",      
    predictor="gpu_predictor",    
    n_jobs=-1
)

print("Training model on GPU...")
model.fit(X_train, y_train)

pred = model.predict(X_test)
acc = accuracy_score(y_test, pred)
print("\nFINAL ACCURACY:", acc)

joblib.dump(model, os.path.join(BACKEND_DIR, "model.pkl"))
print("\nModel saved at:", os.path.join(BACKEND_DIR, "model.pkl"))
