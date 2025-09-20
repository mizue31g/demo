# Helper
# gcloud auth configure-docker us-central1-docker.pkg.dev
# Build
# docker build -t us-central1-docker.pkg.dev/hcls-jp1/medgemma-demo/appoint-ready .
# Push
# docker push us-central1-docker.pkg.dev/hcls-jp1/medgemma-demo/appoint-ready



gcloud run deploy  appoint-ready\
  --image us-central1-docker.pkg.dev/hcls-jp1/medgemma-demo/appoint-ready \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 7860 \
  --env-vars-file env.list.yaml
