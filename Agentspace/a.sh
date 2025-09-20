LOCATION=global
PROJECT_ID=hcls-jp1
PROJECT_ID=955157136126
TOKEN=$(gcloud auth print-access-token)

# Use the AgentSpace Application ID returned in the previous step
AGENTSPACE_ID=enterprise-search_1744679631468

curl -X POST \
	"https://discoveryengine.googleapis.com/v1alpha/projects/$PROJECT_ID/locations/$LOCATION/collections/default_collection/engines/$AGENTSPACE_ID/assistants/default_assistant/agents" \
 --header "Authorization: Bearer $TOKEN" \
 --header "Content-Type: application/json" \
 --header "x-goog-user-project: $PROJECT_ID" \
 --data '{ "displayName": "DISPLAY_NAME", }'



