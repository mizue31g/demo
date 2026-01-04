# イメージの再ビルド
gcloud builds submit --tag gcr.io/hcls-jp1/bq-pubmed-search-app

# Cloud Run への再デプロイ
gcloud run deploy bq-pubmed-search-app \
  --image gcr.io/hcls-jp1/bq-pubmed-search-app \
  --platform managed \
  --region asia-northeast1 \
  --allow-unauthenticated \
  --memory 1Gi

