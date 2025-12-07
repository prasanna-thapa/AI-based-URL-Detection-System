
FROM node:18 AS frontend
WORKDIR /app
COPY frontend/ ./frontend
WORKDIR /app/frontend
RUN npm install
RUN npm run build


FROM python:3.10

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ ./backend
COPY server.py .
COPY --from=frontend /app/frontend/dist ./frontend/dist

CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8080"]
