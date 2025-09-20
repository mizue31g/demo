
url="https://637220864365953024.us-central1-955157136126.prediction.vertexai.goog/v1/projects/955157136126/locations/us-central1/endpoints/637220864365953024:predict"
bearer=$(gcloud auth print-access-token)
echo $bearer

curl -X POST -H "Authorization: Bearer $bearer, 'Content-Type': 'application/json'" \
	--data @message1.json \
$url


