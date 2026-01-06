# 事前準備

1. こちらを実行する

   [PubMed RAG: Medical Literature Analysis with BigQuery and Gemini](https://github.com/google/pubmed-rag)

2. Gitリポジトリから git clone する

# イメージのビルド
```
gcloud builds submit --tag gcr.io/PROJECT_ID/bq-pubmed-search-app
```

注: PROJECT_IDを、Google Cloud Projectに置き換えること

# Cloud Run へのデプロイ
```
gcloud run deploy bq-pubmed-search-app \
  --image gcr.io/PROJECT_ID/bq-pubmed-search-app \
  --platform managed \
  --region asia-northeast1 \
  --allow-unauthenticated \
  --memory 1Gi
```