import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import joblib
import os

DATASET_PATH = os.path.join(os.path.dirname(__file__), 'dataset', 'expiry_data.csv')
MODEL_DIR = os.path.join(os.path.dirname(__file__), 'models')
os.makedirs(MODEL_DIR, exist_ok=True)

def preprocess(df):
    df = df.drop_duplicates()
    df = df.dropna()
    le = LabelEncoder()
    df['category_encoded'] = le.fit_transform(df['category'])
    joblib.dump(le, os.path.join(MODEL_DIR, 'expiry_label_encoder.pkl'))
    df['days_of_stock_remaining'] = df['current_stock'] / (df['avg_daily_sales'] + 0.001)
    df['will_expire_before_sold'] = (df['days_of_stock_remaining'] > df['days_to_expiry']).astype(int)
    features = ['category_encoded', 'current_stock', 'selling_price', 'days_to_expiry',
                'avg_daily_sales', 'stock_turnover_rate', 'days_of_stock_remaining']
    X = df[features]
    y = df['expiry_risk']
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    joblib.dump(scaler, os.path.join(MODEL_DIR, 'expiry_scaler.pkl'))
    joblib.dump(features, os.path.join(MODEL_DIR, 'expiry_features.pkl'))
    return X_scaled, y

def train():
    print("Loading expiry dataset...")
    df = pd.read_csv(DATASET_PATH)
    print(f"Dataset shape: {df.shape}")
    print(f"Class distribution:\n{df['expiry_risk'].value_counts()}")

    X, y = preprocess(df)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    print("Training Random Forest Classifier for Expiry Risk Prediction...")
    model = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42, n_jobs=-1, class_weight='balanced')
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"Accuracy: {accuracy * 100:.2f}%")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=['Low Risk', 'High Risk']))
    print("Confusion Matrix:")
    print(confusion_matrix(y_test, y_pred))

    model_path = os.path.join(MODEL_DIR, 'expiry_model.pkl')
    joblib.dump(model, model_path)
    print(f"Expiry risk model saved to {model_path}")

    metrics = {'accuracy': accuracy * 100}
    joblib.dump(metrics, os.path.join(MODEL_DIR, 'expiry_metrics.pkl'))
    print("Training complete!")

if __name__ == '__main__':
    train()
