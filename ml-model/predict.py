import sys
import json
import os
import numpy as np
import joblib

MODEL_DIR = os.path.join(os.path.dirname(__file__), 'models')

def encode_category(category, le):
    try:
        return int(le.transform([category])[0])
    except ValueError:
        return int(le.transform([le.classes_[0]])[0])

def predict_demand(data):
    try:
        model = joblib.load(os.path.join(MODEL_DIR, 'demand_model.pkl'))
        scaler = joblib.load(os.path.join(MODEL_DIR, 'demand_scaler.pkl'))
        le = joblib.load(os.path.join(MODEL_DIR, 'demand_label_encoder.pkl'))
    except FileNotFoundError:
        return simulate_demand(data)

    predictions = []
    for item in data:
        import datetime
        now = datetime.datetime.now()
        avg_daily = item.get('avgDailySales', item.get('currentStock', 100) / 30.0)
        features = [
            encode_category(item.get('category', 'Other'), le),
            item.get('currentStock', 100),
            item.get('sellingPrice', 10.0),
            item.get('daysToExpiry', 180),
            now.month,
            now.weekday(),
            1 if now.weekday() >= 5 else 0,
            avg_daily,
            item.get('currentStock', 100) * 0.9
        ]
        X = scaler.transform([features])
        pred = model.predict(X)[0]
        confidence = min(0.95, max(0.60, 1 - abs(pred - item.get('currentStock', 100)) / (item.get('currentStock', 100) + 1)))
        predictions.append({
            'id': item.get('id'),
            'name': item.get('name'),
            'category': item.get('category'),
            'currentStock': item.get('currentStock'),
            'predictedDemand': round(float(pred), 0),
            'confidence': round(float(confidence), 2),
            'recommendation': get_demand_recommendation(pred, item.get('currentStock', 0))
        })
    return {'predictions': predictions, 'modelType': 'Random Forest Regressor', 'status': 'success'}

def simulate_demand(data):
    predictions = []
    for item in data:
        base = item.get('currentStock', 100) * 0.8
        noise = np.random.normal(0, base * 0.1)
        pred = max(0, base + noise)
        predictions.append({
            'id': item.get('id'),
            'name': item.get('name'),
            'category': item.get('category'),
            'currentStock': item.get('currentStock'),
            'predictedDemand': round(float(pred), 0),
            'confidence': round(np.random.uniform(0.70, 0.92), 2),
            'recommendation': get_demand_recommendation(pred, item.get('currentStock', 0))
        })
    return {'predictions': predictions, 'modelType': 'Simulated (train model first)', 'status': 'simulated'}

def predict_expiry(data):
    try:
        model = joblib.load(os.path.join(MODEL_DIR, 'expiry_model.pkl'))
        scaler = joblib.load(os.path.join(MODEL_DIR, 'expiry_scaler.pkl'))
        le = joblib.load(os.path.join(MODEL_DIR, 'expiry_label_encoder.pkl'))
    except FileNotFoundError:
        return simulate_expiry(data)

    predictions = []
    for item in data:
        stock = item.get('currentStock', 100)
        avg_daily = item.get('avgDailySales', stock / 30.0)
        turnover = item.get('stockTurnoverRate', avg_daily / (stock + 0.001))
        days_remaining = stock / (avg_daily + 0.001)
        features = [
            encode_category(item.get('category', 'Other'), le),
            stock,
            item.get('sellingPrice', 10.0),
            item.get('daysToExpiry', 180),
            avg_daily,
            turnover,
            days_remaining
        ]
        X = scaler.transform([features])
        risk = int(model.predict(X)[0])
        proba = model.predict_proba(X)[0]
        risk_score = float(proba[1])
        predictions.append({
            'id': item.get('id'),
            'name': item.get('name'),
            'category': item.get('category'),
            'currentStock': stock,
            'daysToExpiry': item.get('daysToExpiry'),
            'riskScore': round(risk_score, 2),
            'riskLevel': get_risk_level(risk_score),
            'confidence': round(float(max(proba)), 2),
            'willExpireBeforeSold': bool(risk),
            'recommendation': get_expiry_recommendation(risk_score, item.get('daysToExpiry', 180))
        })
    return {'predictions': predictions, 'modelType': 'Random Forest Classifier', 'status': 'success'}

def simulate_expiry(data):
    predictions = []
    for item in data:
        days = item.get('daysToExpiry', 180)
        stock = item.get('currentStock', 100)
        avg_daily = stock / 30.0
        days_to_sell = stock / (avg_daily + 0.001)
        risk_score = min(1.0, max(0.0, (days_to_sell - days) / (days + 1) + 0.5))
        predictions.append({
            'id': item.get('id'),
            'name': item.get('name'),
            'category': item.get('category'),
            'currentStock': stock,
            'daysToExpiry': days,
            'riskScore': round(float(risk_score), 2),
            'riskLevel': get_risk_level(risk_score),
            'confidence': round(np.random.uniform(0.70, 0.92), 2),
            'willExpireBeforeSold': risk_score > 0.5,
            'recommendation': get_expiry_recommendation(risk_score, days)
        })
    return {'predictions': predictions, 'modelType': 'Simulated (train model first)', 'status': 'simulated'}

def get_risk_level(score):
    if score >= 0.75: return 'Critical'
    if score >= 0.50: return 'High'
    if score >= 0.25: return 'Medium'
    return 'Low'

def get_demand_recommendation(predicted, current):
    if predicted > current * 1.2: return 'Restock urgently - demand exceeds stock'
    if predicted > current * 0.8: return 'Monitor stock levels closely'
    return 'Stock levels adequate'

def get_expiry_recommendation(risk, days):
    if risk >= 0.75: return f'Critical: Promote heavily or return to supplier. Expires in {days} days'
    if risk >= 0.50: return f'High risk: Consider discount pricing. Expires in {days} days'
    if risk >= 0.25: return f'Medium risk: Monitor sales. Expires in {days} days'
    return 'Low risk: Normal sales expected'

if __name__ == '__main__':
    try:
        raw = sys.stdin.read().strip()
        if not raw:
            print(json.dumps({'error': 'No input provided'}))
            sys.exit(1)
        payload = json.loads(raw)
        pred_type = payload.get('type', 'demand')
        data = payload.get('data', [])
        if pred_type == 'demand':
            result = predict_demand(data)
        else:
            result = predict_expiry(data)
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({'error': str(e), 'status': 'failed'}))
        sys.exit(1)
