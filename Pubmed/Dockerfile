# Python 3.10のスリムイメージを使用
FROM python:3.10-slim

# 作業ディレクトリの設定
WORKDIR /app

# 依存関係ファイルのコピーとインストール
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# アプリケーションコードのコピー
COPY app.py .

# Streamlitのポートを公開
EXPOSE 8080

# コンテナ起動時に実行するコマンド
# Cloud Runはポート8080でリクエストを待ち受ける必要があります
CMD ["streamlit", "run", "app.py", "--server.port=8080", "--server.address=0.0.0.0"]

