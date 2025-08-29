import mysql.connector
from dotenv import load_dotenv
import os 

#  수업명 : 가비아 2회차
#  이름 : 신인철
#  작성자 : 신인철
#  수정자 : 
#  작성일 : 25.07.30
#  파일명 : dbConnect_Test.py

# Python mysql DB connection Test source 

def test_mysql_connection() :
    load_dotenv()
    
    try : 
        conn = mysql.connector.connect(
            host = os.getenv('DB_HOST'),
            port = os.getenv('DB_PORT'),
            user = os.getenv('DB_USER'),
            password = os.getenv('DB_PASSWORD'),
            database = os.getenv('DB_NAME'),
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