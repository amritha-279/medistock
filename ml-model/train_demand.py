import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import mean_absolute_error, r2_score
import joblib
import os

DATASET_PATH = os.path.join(os.path.dirname(__file__), 'dataset', 'medicine_data.csv')
MODEL_DIR = os.path.join(os.path.dirname(__file__), 'models')
os.makedirs(MODEL_DIR, exist_ok=True)

def preprocess(df):
    df = df.drop_duplicates()
    df = df.dropna()
    le = LabelEncoder()
    df['category_encoded'] = le.fit_transform(df['category'])
    joblib.dump(le, os.path.join(MODEL_DIR, 'demand_label_encoder.pkl'))
    features = ['category_encoded', 'current_stock', 'selling_price', 'days_to_expiry',
                'month', 'day_of_week', 'is_weekend', 'avg_daily_sales', 'prev_month_sales']
    X = df[features]
    y = df['demand']
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    joblib.dump(scaler, os.path.join(MODEL_DIR, 'demand_scaler.pkl'))
    joblib.dump(features, os.path.join(MODEL_DIR, 'demand_features.pkl'))
    return X_scaled, y

def train():
    print("Loading dataset...")
    df = pd.read_csv(DATASET_PATH)
    print(f"Dataset shape: {df.shape}")

    X, y = preprocess(df)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    print("Training Random Forest Regressor for Demand Forecasting...")
    model = RandomForestRegressor(n_estimators=100, max_depth=10, random_state=42, n_jobs=-1)
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    print(f"MAE: {mae:.2f}")
    print(f"R2 Score: {r2:.4f}")
    print(f"Model Accuracy: {r2 * 100:.2f}%")

    model_path = os.path.join(MODEL_DIR, 'demand_model.pkl')
    joblib.dump(model, model_path)
    print(f"Demand model saved to {model_path}")

    metrics = {'mae': mae, 'r2': r2, 'accuracy': r2 * 100}
    joblib.dump(metrics, os.path.join(MODEL_DIR, 'demand_metrics.pkl'))
    print("Training complete!")

if __name__ == '__main__':
    train()
