LOCATION=global
PROJECT_ID=hcls-jp1
TOKEN=$(gcloud auth print-access-token)

# Use the AgentSpace Application ID returned in the previous step
AGENTSPACE_ID=enterprise-search_1744679631468

curl -X POST "https://discoveryengine.googleapis.com/v1alpha/projects/$PROJECT_ID/locations/$LOCATION/collections/default_collection/engines/$AGENTSPACE_ID/assistants/default_assistant/agents" \
 --header "Authorization: Bearer $TOKEN" \
 --header "Content-Type: application/json" \
 --header "x-goog-user-project: $PROJECT_ID" \
 --data '{
 "displayName": "Academic Research",
 "description": "Agent to explore academic landscape surrounding seminal research works",
 "adkAgentDefinition": {
   "tool_settings": {
      "tool_description": "Tool Description"
   },
   "provisioned_reasoning_engine": {
      "reasoning_engine": "projects/hcls-jp1/locations/us-central1/reasoningEngines/6746365853521936384"
   }
 }
}'
