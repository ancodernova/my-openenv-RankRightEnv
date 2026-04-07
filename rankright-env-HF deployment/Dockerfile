# -------------------------------
# BASE IMAGE
# -------------------------------
FROM python:3.11-slim

# -------------------------------
# ENV SETTINGS
# -------------------------------
ENV PYTHONUNBUFFERED=1

# -------------------------------
# SYSTEM DEPENDENCIES
# -------------------------------
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# -------------------------------
# SET WORKDIR
# -------------------------------
WORKDIR /app

# -------------------------------
# COPY REQUIREMENTS FIRST (CACHE)
# -------------------------------
COPY requirements.txt .

# -------------------------------
# INSTALL DEPENDENCIES
# -------------------------------
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# -------------------------------
# COPY APP FILES
# -------------------------------
COPY . .

# -------------------------------
# EXPOSE PORT
# -------------------------------
EXPOSE 7860

# -------------------------------
# RUN APP
# -------------------------------
CMD ["uvicorn", "app.api:app", "--host", "0.0.0.0", "--port", "7860"]