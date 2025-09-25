from .function.PDFFunction import *
from .function.OCRFunction import *
from .tools.Testcase import *
from dotenv import load_dotenv

#  수업명 : 가비아 2회차
#  이름 : 김관호
#  작성자 : 김관호
#  수정자 : 
#  작성일 : 25.07.21
#  파일명 : FileGenerator.py

# 테스트케이스 생성기

pdf_path = 'api/ocr/sources/Contract_form.pdf'

if isPDFValid(pdf_path):
    for contract in test_dataset:
        output_PDF_path = insertTexttoPDF(contract, pdf_path)
        output_image_path = output_PDF_path.replace('.pdf', '.jpg')
        convertPDFtoJPG(output_PDF_path, output_image_path)
else:
    print("PDF 파일이 존재하지 않습니다.")
