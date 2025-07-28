from function.PDFFunction import *
from function.OCRFunction import *
from function.APIFunction import *
from tools.Testcase import *
from dotenv import load_dotenv
import random

#  수업명 : 가비아 2회차
#  이름 : 김관호
#  작성자 : 김관호
#  수정자 : 
#  작성일 : 25.07.21
#  파일명 : main.py

# 테스트케이스 생성기

pdf_path = './sources/Contract_form.pdf'

random_number = random.randint(0, len(contracts)-1)
contract = contracts[random_number]

if(isPDFValid(pdf_path) == True):
    output_PDF_path = insertTexttoPDF(contract, pdf_path)
    output_image_path = output_PDF_path.replace('.pdf', '.jpg')
    convertPDFtoJPG(output_PDF_path, output_image_path)
else:
    print("PDF 파일이 존재하지 않습니다.")
