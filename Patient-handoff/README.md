# Patient-handoff アプリケーションのデプロイ手順

このガイドでは、Patient-handoff リポジトリを Google Cloud Run にデプロイする手順を説明します。

## 前提条件

*   **Google Cloud アカウント:** 課金が有効になっている Google Cloud アカウントが必要です。
*   **Google Cloud SDK のインストールと設定:**
    *   [Google Cloud SDK をインストール](https://cloud.google.com/sdk/docs/install)し、`gcloud init` コマンドで初期設定を行います。
    *   以下のコマンドでアプリケーション認証情報を設定します。
        ```bash
        gcloud auth application-default login
        ```
*   **Git:** リポジトリをクローンするために Git がインストールされている必要があります。

## デプロイ手順

### 1. リポジトリのクローン

まず、このリポジトリをローカルマシンにクローンします。

```bash
git clone https://github.com/mizue31g/demo.git
cd demo/Patient-handoff
```

### 2. バックエンドのデプロイ

`backend` サービスを Google Cloud Run にデプロイします。

1.  `backend` ディレクトリに移動します。
    ```bash
    cd backend
    ```
2.  Cloud Run にデプロイします。`PROJECT_ID` はご自身の Google Cloud プロジェクトIDに置き換えてください。
    ```bash
    gcloud run deploy patient-handoff-backend \
      --source . \
      --region asia-northeast1 \
      --project hcls-jp1 \
      --allow-unauthenticated
    ```
    デプロイが完了すると、`Service URL` が表示されます。この URL をメモしておいてください。これは後でフロントエンドを設定する際に必要になります。

3.  元のディレクトリに戻ります。
    ```bash
    cd ..
    ```

### 3. フロントエンドのデプロイ

`frontend` サービスを Google Cloud Run にデプロイします。この際、バックエンドサービスの URL を設定する必要があります。

1.  `frontend` ディレクトリに移動します。
    ```bash
    cd frontend
    ```
2.  Cloud Build を使用して Docker イメージをビルドし、バックエンドの URL を `_VITE_BACKEND_URL` 置換変数として渡します。`PROJECT_ID` はご自身の Google Cloud プロジェクトIDに、`YOUR_BACKEND_SERVICE_URL` はバックエンドデプロイ時にメモした URL に置き換えてください。
    ```bash
    gcloud builds submit \
      --tag gcr.io/${PROJECT_ID}/patient-handoff-frontend \
      --substitutions=_VITE_BACKEND_URL="YOUR_BACKEND_SERVICE_URL" \
      .
    ```
    例:
    ```bash
    gcloud builds submit \
      --tag gcr.io/hcls-jp1/patient-handoff-frontend \
      --substitutions=_VITE_BACKEND_URL="https://patient-handoff-backend-g2rmsdbipa-an.a.run.app" \
      .
    ```
3.  ビルドした Docker イメージを Cloud Run にデプロイします。
    ```bash
    gcloud run deploy patient-handoff-frontend \
      --image gcr.io/${PROJECT_ID}/patient-handoff-frontend \
      --region asia-northeast1 \
      --project hcls-jp1 \
      --allow-unauthenticated
    ```
    デプロイが完了すると、`Service URL` が表示されます。これが Patient-handoff アプリケーションのフロントエンドの URL です。

4.  元のディレクトリに戻ります。
    ```bash
    cd ..
    ```

### 4. アプリケーションの確認

フロントエンドサービスの `Service URL` にアクセスして、アプリケーションが正しく動作することを確認してください。バックエンドとの通信が正常に行われ、すべての機能が期待どおりに動作することを確認します。

これで、Patient-handoff アプリケーションが Google Cloud Run にデプロイされました。
