from google.cloud.alloydb.connector import Connector
import sqlalchemy

connector = Connector()

def getconn():
    conn = connector.connect(
        "projects/hcls-jp1/locations/asia-northeast1/clusters/alloydb-cluster/instances/alloydb-instance",
        "pg8000",
        user="postgres",
        password="password for postgres",
        db="testdb"
    )
    return conn

pool = sqlalchemy.create_engine(
    "postgresql+pg8000://",
    creator=getconn,
    pool_size=5,
    max_overflow=10,
)

insert_stmt = sqlalchemy.text(
    "INSERT INTO my_table (id, title) VALUES (:id, :title)",
)

with pool.connect() as db_conn:
    result = db_conn.execute(sqlalchemy.text("SELECT * from patient")).fetchall()

    for row in result:
        print(row)
