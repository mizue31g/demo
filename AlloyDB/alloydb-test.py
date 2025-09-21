from google.cloud.alloydb.connector import Connector  # AlloyDB Connector ライブラリをインポート
import sqlalchemy  # SQLAlchemy ライブラリをインポート

# Connector オブジェクトを初期化
connector = Connector()

# データベース接続を返す関数
def getconn():
    """
    AlloyDB インスタンスへの接続を確立します。

    戻り値:
        データベース接続オブジェクト。
    """
    conn = connector.connect(
        "projects/hcls-jp1/locations/asia-northeast1/clusters/alloydb-cluster/instances/alloydb-instance",  # プロジェクト ID、リージョン、クラスタ、インスタンス、データベースを含む接続文字列
        "pg8000",  # データベースドライバ
        user="postgres",  # データベースユーザー名
        password="password for postgres",  # データベースパスワード
        db="testdb"  # データベース名
    )
    return conn

# 接続プールを作成
pool = sqlalchemy.create_engine(
    "postgresql+pg8000://",  # pg8000 ドライバを使用した PostgreSQL の接続 URI
    creator=getconn,  # 接続を作成するために getconn 関数を使用
    pool_size=5,  # プール内の最大接続数を設定
    max_overflow=10,  # 最大オーバーフロー接続数を設定
)

# 挿入ステートメント
insert_stmt = sqlalchemy.text(
    "INSERT INTO my_table (id, title) VALUES (:id, :title)",  # ID とタイトルのプレースホルダーを含む SQL ステートメント
)

# 接続プールを使用してデータベースに接続
with pool.connect() as db_conn:
    # データベースに挿入（コメントアウト）
    #db_conn.execute(insert_stmt, parameters={})

    # データベースをクエリ
    result = db_conn.execute(sqlalchemy.text("SELECT * from patient")).fetchall()  # クエリを実行してすべての結果を取得

    # トランザクションをコミット（SQLAlchemy v2.X.X では自動コミット）
    # db_conn.commit()  # SQLAlchemy の自動コミットによってすでに処理されています

    # 結果を処理
    for row in result:
        print(row)  # 各行のデータを印刷