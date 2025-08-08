import mysql.connector
from dotenv import load_dotenv
import os 

def test_mysql_connection() :
    load_dotenv()
    
    try : 
        conn = mysql.connector.connect(
            host = os.getenv('host'),
            user = os.getenv('user'),
            password = os.getenv('password'),
            database = os.getenv('database'),
        )
        
        if conn.is_connected() :
            print('mysql server connect')
            print('db server version : ', conn.get_server_info())
        else :
            print('db server connect fail')
        conn.close()
    except mysql.connector.Error as err :
        print(f'error : ', {err})
        
if __name__ == "__main__" : 
    test_mysql_connection()