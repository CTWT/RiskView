from function.PDFFunction import *
from function.OCRFunction import *
from function.APIFunction import *
from testcase import *
from properties import *

#  수업명 : 가비아 2회차
#  이름 : 김관호
#  작성자 : 김관호
#  수정자 : 
#  작성일 : 25.07.21
#  파일명 : main.py

# 테스트를 실행할 main.py

pdf_path = './sources/Contract_form.pdf'

contract = contract1

if(isPDFValid(pdf_path) == True):
    output_PDF_path = insertTexttoPDF(contract, pdf_path)
    output_image_path = output_PDF_path.replace('.pdf', '.jpg')
    convertPDFtoJPG(output_PDF_path, output_image_path)
    ocr_list = runOCR(output_image_path)
    outputContract = ocrMapping(ocr_list)
    json_string = convertToJSON(outputContract)
    sendDataToSpring(json_string)
else:
    print("PDF 파일이 존재하지 않습니다.")
