# Use an official Python runtime as a parent image
FROM python:3.11-slim

# Set the working directory in the container
WORKDIR /app

# Install production dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir 'Flask[async]==3.0.3'

# Copy the rest of the application code
COPY . .

# Set environment variables for Vertex AI (if not already set in Cloud Run)
# These should ideally be set in Cloud Run service configuration for production
ENV GCP_PROJECT_ID=${GCP_PROJECT_ID}
ENV GCP_REGION=${GCP_REGION}

# Expose the port that the application will run on
CMD exec gunicorn --bind 0.0.0.0:$PORT --workers 1 app:app
