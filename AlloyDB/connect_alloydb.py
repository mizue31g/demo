"""This script connects to an AlloyDB database and executes a simple query."""

from google.cloud.alloydb.connector import Connector
import sqlalchemy

# TODO: Update the following variables with your AlloyDB connection details.
project_id = "your-project-id"
region = "your-region"
cluster = "your-cluster"
instance = "your-instance"
database = "your-database"
user = "your-user"
password = "your-password"

# initialize Connector object
connector = Connector()

# function to return the database connection object
def getconn():
    """
    Establishes a connection to the AlloyDB instance.

    Returns:
        A database connection object.
    """
    conn = connector.connect(
        f"projects/{project_id}/locations/{region}/clusters/{cluster}/instances/{instance}",
        "pg8000",
        user=user,
        password=password,
        db=database,
    )
    return conn

# create connection pool
pool = sqlalchemy.create_engine(
    "postgresql+pg8000://",
    creator=getconn,
)

# connect to the database and execute a query
with pool.connect() as db_conn:
    # Execute a simple query to test the connection
    result = db_conn.execute(sqlalchemy.text("SELECT 1")).fetchone()
    print(f"Connection successful, result: {result}")

    # You can execute other queries here, for example:
    # result = db_conn.execute(sqlalchemy.text("SELECT * FROM my_table")).fetchall()
    # for row in result:
    #     print(row)
