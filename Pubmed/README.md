
# イメージのビルド
gcloud builds submit --tag gcr.io/PROJECT_ID/bq-pubmed-search-app

注: PROJECT_IDを、Google Cloud Projectに置き換えてください

# Cloud Run へのデプロイ
gcloud run deploy bq-pubmed-search-app \
  --image gcr.io/PROJECT_ID/bq-pubmed-search-app \
  --platform managed \
  --region asia-northeast1 \
  --allow-unauthenticated \
  --memory 1Gi
