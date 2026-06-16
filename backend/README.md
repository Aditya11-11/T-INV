# TreadFlow Tire Inventory Flask Backend

This is the backend service for the TreadFlow Tire Inventory application, built with Flask and MongoDB. It manages active inventory, historical sales data, locations, and tire types, securing your database credentials on the server side.

## Local Development

### 1. Prerequisites
- Python 3.8+
- MongoDB running locally or a MongoDB Atlas account

### 2. Setup
Clone or copy this folder, then create a virtual environment and install dependencies:
```bash
# Create a virtual environment
python -m venv venv

# Activate it (Linux/macOS)
source venv/bin/activate

# Activate it (Windows)
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Environment Variables
Create a `.env` file or export the variables in your shell:
```env
MONGO_URI=mongodb://localhost:27017/treadflow
PORT=5000
```

### 4. Run the Server
```bash
python app.py
```
The API will be available at `http://localhost:5000`.

---

## Deploying to Render

1. Create a new **Web Service** on Render.
2. Link your Git repository.
3. Configure the following settings:
   - **Root Directory**: `backend` (or leave empty if deploying from a separate repository)
   - **Environment**: `Python`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
4. In the **Environment Variables** section, add:
   - `MONGO_URI`: Your MongoDB connection string (e.g. `mongodb+srv://...`)
   - `PYTHON_VERSION`: `3.10` or higher (optional, but recommended)

Once deployed, copy the **live URL** (e.g., `https://treadflow-backend.onrender.com`) and provide it to Antigravity to integrate it into the React frontend!
