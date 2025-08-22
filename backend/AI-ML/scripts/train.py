import re
import pandas as pd
import numpy as np
from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import FunctionTransformer
from sklearn.metrics import accuracy_score, classification_report
import joblib

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent.parent  # disaster-management/
DATA_PATH = BASE_DIR / "backend" / "data" / "raw" / "train.csv"
MODEL_PATH = BASE_DIR / "ai-ml" / "models" / "disaster_tweet_model.joblib"

# Text cleaning function
def clean_text(s: str) -> str:
    if not isinstance(s, str):
        return ""
    s = s.lower()
    s = re.sub(r"http\S+|www\.\S+", " ", s)  # Remove URLs
    s = re.sub(r"@\w+", " ", s)              # Remove @mentions
    s = re.sub(r"#", " ", s)                 # Remove hashtag symbol
    s = re.sub(r"[^a-z\s]", " ", s)          # Keep only letters
    s = re.sub(r"\s+", " ", s).strip()       # Remove extra spaces
    return s

def clean_series(texts):
    return np.array([clean_text(t) for t in texts])

# Main training process
def main():
    print(f"Loading data from: {DATA_PATH}")
    df = pd.read_csv(DATA_PATH)

    X = df["text"].astype(str)
    y = df["target"].astype(int)

    X_train, X_val, y_train, y_val = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # Pipeline with cleaning + TF-IDF + Logistic Regression
    pipeline = Pipeline([
        ("clean", FunctionTransformer(clean_series, validate=False)),
        ("tfidf", TfidfVectorizer(
            max_features=20000,
            ngram_range=(1, 2),
            min_df=2,
            stop_words="english"
        )),
        ("clf", LogisticRegression(max_iter=1000))
    ])

    print("Training model...")
    pipeline.fit(X_train, y_train)

    preds = pipeline.predict(X_val)
    acc = accuracy_score(y_val, preds)
    print(f"Validation Accuracy: {acc:.4f}")
    print("\nClassification Report:\n", classification_report(y_val, preds))

    # Save model
    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(pipeline, MODEL_PATH)
    print(f"Model saved to: {MODEL_PATH}")

if __name__ == "__main__":
    main()
