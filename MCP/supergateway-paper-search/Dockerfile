# build stage
FROM node:22-alpine as builder

# 対話プロンプト自動化ツール「expect」をインストール
RUN apk add --no-cache expect

# 1. supergateway をグローバルインストール
RUN npm install -g @latitude-data/supergateway@latest

# 2. npxのネットワーク問題を回避するため、@smithery/cli を先にグローバルインストール
RUN npm install -g @smithery/cli

# 3. expect を使い、インストール済みの smithery コマンドの対話プロンプトを自動化
RUN echo '#!/usr/bin/expect -f' > /tmp/install_mcp.exp && \
    echo 'exp_internal 1' >> /tmp/install_mcp.exp && \
    echo 'set timeout 300' >> /tmp/install_mcp.exp && \
    # npxを使わず、グローバルインストールしたコマンドを直接実行
    echo 'spawn smithery install @openags/paper-search-mcp --client claude' >> /tmp/install_mcp.exp && \
    echo 'expect {' >> /tmp/install_mcp.exp && \
    echo '  timeout { puts "Error: Script timed out."; exit 1 }' >> /tmp/install_mcp.exp && \
    echo '  eof { puts "Error: Command finished unexpectedly."; exit 1 }' >> /tmp/install_mcp.exp && \
    echo '  "*Would you like to help improve Smithery*"' >> /tmp/install_mcp.exp && \
    echo '}' >> /tmp/install_mcp.exp && \
    echo 'send "n\r"' >> /tmp/install_mcp.exp && \
    echo 'expect eof' >> /tmp/install_mcp.exp && \
    echo 'catch wait result; exit [lindex \$result 3]' >> /tmp/install_mcp.exp

# スクリプトに実行権限を付与
RUN chmod +x /tmp/install_mcp.exp

# 作成したスクリプトを実行して、paper-search-mcp をインストール
RUN /tmp/install_mcp.exp


# runtime stage
FROM node:22-alpine
WORKDIR /app

# ビルドステージからインストール済みのパッケージと実行ファイルをコピー
COPY --from=builder /usr/local/lib/node_modules /usr/local/lib/node_modules
COPY --from=builder /usr/local/bin /usr/local/bin


# supergateway がリッスンするポート
ENV GATEWAY_PORT=8000
EXPOSE ${GATEWAY_PORT}

ENTRYPOINT [ "supergateway" ]