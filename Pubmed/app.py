import streamlit as st
from google.cloud import bigquery
from google.cloud import translate_v2 as translate
import html

# ページ設定
st.set_page_config(page_title="PMC Article Vector Search (Multilingual)", layout="wide")

st.title("PMC Article Vector Search")
st.markdown("入力された言語を自動的に英語に翻訳し、PubMed記事（英語）をベクトル検索します。")

# --- Session State の初期化 ---
if 'query_input' not in st.session_state:
    st.session_state.query_input = "インターロイキン-10 −1082A/G多型と虚血性脳卒中リスクの関係"

# --- コールバック関数 ---
# ボタンクリック時に実行され、再描画の前に値を更新します
def update_query(text):
    st.session_state.query_input = text

# --- ユーザー入力エリア ---
query_text = st.text_area(
    "検索クエリを入力してください（日本語OK）", 
    height=100, 
    key='query_input'
)

# --- サンプル質問ボタン ---
st.markdown("##### 💡 サンプル質問から選択:")
col1, col2, col3 = st.columns(3)

# on_click パラメータを使用する方法に変更
with col1:
    st.button(
        "睡眠不足の影響", 
        use_container_width=True,
        on_click=update_query,
        args=("1日6時間以下の睡眠を続けると、脳や体にどのような悪影響がありますか？",)
    )

with col2:
    st.button(
        "ビタミンCと風邪", 
        use_container_width=True,
        on_click=update_query,
        args=("ビタミンCのサプリメントを飲むことは、本当に風邪の予防や治療に役立ちますか？",)
    )

with col3:
    st.button(
        "コーヒーと心臓病", 
        use_container_width=True,
        on_click=update_query,
        args=("毎日コーヒーを飲むことは、心臓病のリスクを上げますか？それとも下げますか？",)
    )

st.markdown("---")

# --- 検索実行ロジック ---
if st.button("検索実行", type="primary"):
    if not query_text:
        st.warning("クエリを入力してください。")
    else:
        try:
            # 翻訳ロジック
            translate_client = translate.Client()
            translation = translate_client.translate(query_text, target_language='en')
            translated_text = html.unescape(translation['translatedText'])
            detected_lang = translation['detectedSourceLanguage']
            final_query = translated_text
            
            if detected_lang != 'en':
                st.info(f"**翻訳を実行しました ({detected_lang} -> en):**\n\n{final_query}")
            else:
                st.caption("英語入力として処理します。")

            # BigQuery 検索ロジック
            bq_client = bigquery.Client(project="hcls-jp1")

            sql = """
                DECLARE query_text STRING DEFAULT @query_input;

                WITH query_embedding AS (
                  SELECT ml_generate_embedding_result AS embedding_col
                  FROM ML.GENERATE_EMBEDDING(
                    MODEL `hcls-jp1.models.textembed`,
                    (SELECT query_text AS content),
                    STRUCT(TRUE AS flatten_json_output)
                  )
                )
                SELECT
                  base.pmc_id,
                  base.pmid,
                  base.title,
                  base.author,
                  base.article_text,
                  base.pmc_link,
                  distance
                FROM VECTOR_SEARCH(
                  TABLE `bigquery-public-data.pmc_open_access_commercial.articles`,
                  'ml_generate_embedding_result',
                  (SELECT embedding_col FROM query_embedding),
                  top_k => 15
                )
                ORDER BY distance ASC;
            """

            job_config = bigquery.QueryJobConfig(
                query_parameters=[
                    bigquery.ScalarQueryParameter("query_input", "STRING", final_query)
                ]
            )

            with st.spinner('BigQueryで検索中...'):
                query_job = bq_client.query(sql, job_config=job_config)
                results = query_job.result()
                df = results.to_dataframe()

                if df.empty:
                    st.info("検索結果が見つかりませんでした。")
                else:
                    st.success(f"{len(df)} 件の関連論文が見つかりました。")
                    for index, row in df.iterrows():
                        with st.expander(f"{index + 1}. {row['title']} (Distance: {row['distance']:.4f})"):
                            st.markdown(f"**Authors:** {row['author']}")
                            st.markdown(f"**PMID:** {row['pmid']} | **PMC ID:** {row['pmc_id']}")
                            st.markdown(f"**Link:** [{row['pmc_link']}]({row['pmc_link']})")
                            st.markdown("---")
                            preview = row['article_text'][:500] + "..." if row['article_text'] and len(row['article_text']) > 500 else row['article_text']
                            st.text(preview)

        except Exception as e:
            st.error(f"エラーが発生しました: {e}")

