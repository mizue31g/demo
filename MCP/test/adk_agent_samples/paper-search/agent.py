import os

import vertexai
from vertexai import agent_engines

from google.adk.agents import LlmAgent
# LanguageModelConfig の新しいインポートパス
#from google.adk.agents.llm_agent import LanguageModelConfig
from google.adk.tools.mcp_tool.mcp_toolset import MCPToolset
# StdioServerParameters の代わりに StdioConnectionParams を使用
from google.adk.tools.mcp_tool.mcp_toolset import StdioConnectionParams

# 環境変数からGoogle CloudのプロジェクトIDとロケーションを取得します。
PROJECT_ID = os.getenv("GOOGLE_CLOUD_PROJECT")
LOCATION = os.getenv("GOOGLE_CLOUD_LOCATION")

if not PROJECT_ID or not LOCATION:
    raise ValueError(
        "GCP_PROJECT_ID and GCP_LOCATION environment variables must be set for Vertex AI."
    )

# LanguageModelConfig オブジェクトを直接作成します
#llm_config = LanguageModelConfig(
#    project=PROJECT_ID,
#    location=LOCATION,
    # ADK のバージョンによっては、model パラメータもここに含める必要がある場合があります。
    # 現在のドキュメントの例では LlmAgent の top level に model が指定されています。
    # 'model'='gemini-1.5-pro' # 必要であればここに含める
#)

root_agent = LlmAgent(
    # 使用したいVertex AIのモデルを指定します (例: 'gemini-1.5-pro', 'gemini-1.0-pro'など)。
    # リージョンによって利用可能なモデルが異なります。
    model='gemini-2.5-flash',
    name='paper_search_agent',
    instruction='あなたは学術論文の検索と分析のエキスパートです。ユーザーのクエリに基づいて論文を検索し、要約や詳細を提供するために利用可能なツールを使用してください。',
    #language_model_config=llm_config, # LanguageModelConfig オブジェクトを渡す
    tools=[
        MCPToolset(
            connection_params=StdioConnectionParams(
                # ここで server_params を追加し、その中に command と args を含めます。
                server_params={
                    'command': 'python',
                    'args': ["-m", "paper_search_mcp.server"],
                }
            ),
        )
    ],
)