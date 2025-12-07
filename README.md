# AI-Based Phishing URL Detection System

A full-stack web application that detects phishing URLs using a machine-learning model trained on URL features.

## Tech Stack
Python, FastAPI, React.js, Scikit-learn, XGBoost, MongoDB, Docker

## How It Works
1. User enters a URL in the React UI.
2. The backend extracts features and runs a trained ML model.
3. Response returned: phishing or safe.
4. Logs optionally saved to MongoDB.

## Run Project
1. Add dataset to `ml/dataset.csv` with columns: `url,label`
2. Train model:
