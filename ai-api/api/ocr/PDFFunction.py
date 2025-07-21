import fitz  # PyMuPDF
from LeaseContract import LeaseContract
from StringHelper import *
import properties
from pdf2image import convert_from_path  # PDF를 이미지(JPG)로 변환하는 함수
from pdf2image import exceptions
import os

#  수업명 : 가비아 2회차
#  이름 : 김관호
#  작성자 : 김관호
#  수정자 : 
#  작성일 : 25.07.21
#  파일명 : PDFFunction.py

# OCR할 때 필요한 PDF 처리 관련 함수들을 모아 놓은 파일

#@Param pdf_path pdf    파일경로
#@Param image_path      이미지가 생성될 위치
#PDF를 JPG로 변환해주는 함수
def convertPDFtoJPG(pdf_path:str, image_path:str):
    # PDF 파일을 이미지로 변환 (페이지별로 이미지 생성됨)
    pages = convert_from_path(pdf_path, dpi=300, poppler_path = properties.poppler_path)
    # 첫 번째 페이지만 JPG로 저장
    pages[0].save(image_path, 'JPEG')     # 첫 페이지를 JPG 형식으로 저장
    print(f'이미지 저장 완료: {image_path}')  # 변환 완료 메시지 출력

#@Param pdf_path pdf    파일경로
#PDF가 유효한지 확인해주는 함수
def isPDFValid(pdf_path:str)->bool:
    # 파일 존재 확인
    if not os.path.exists(pdf_path):
        print(f"❌ PDF 파일이 존재하지 않습니다: {pdf_path}")
        return False

    # 예외 처리 포함
    try:
        pages = convert_from_path(pdf_path, dpi=300, poppler_path=properties.poppler_path)
        print("성공")
        return True
    except exceptions.PDFPageCountError:
        print("❌ PDF 페이지 수를 읽을 수 없습니다. PDF가 손상되었거나 Poppler 경로가 잘못되었을 수 있습니다.")
        return False
    except Exception as e:
        print(f"❌ 변환 중 오류 발생: {e}")
        return False

#@Param contract    PDF에 새겨넣을 계약서에 대한 데이터
#@Param pdf_path      PDF 파일경로
#PDF에 계약서 정보를 새겨넣는 함수
def insertTexttoPDF(contract:LeaseContract,pdf_path:str) -> str:
    # 기존 계약서 PDF 열기
    doc = fitz.open(pdf_path)

    # 첫 페이지 가져오기
    page = doc[0]

    # 한글 폰트 경로
    font_path = "C:\\Windows\\Fonts\\malgun.ttf"  # Windows용 맑은 고딕 폰트 경로

    fontsize = 8

    # ✅ 빈칸 위치에 텍스트 삽입 (폰트 지정 포함)
    if(contract.rentType == '전세'):
        page.insert_text((45, 74), "O", fontsize=8, fontname="KoreanFont", fontfile=font_path, color=(1,0,0))
    elif(contract.rentType == '월세'):
        page.insert_text((109, 74), "O", fontsize=8, fontname="KoreanFont", fontfile=font_path, color=(1,0,0))

    page.insert_text((105, 122), contract.location, fontsize=fontsize, fontname="KoreanFont", fontfile=font_path)
    page.insert_text((160, 144), contract.landType, fontsize=fontsize, fontname="KoreanFont", fontfile=font_path)
    page.insert_text((160, 162), contract.buildingStructureUse, fontsize=fontsize, fontname="KoreanFont", fontfile=font_path)
    page.insert_text((352, 144), str(contract.landArea), fontsize=fontsize, fontname="KoreanFont", fontfile=font_path)
    page.insert_text((352, 162), str(contract.buildingArea), fontsize=fontsize, fontname="KoreanFont", fontfile=font_path)
    page.insert_text((105, 179), contract.leasePart, fontsize=fontsize, fontname="KoreanFont", fontfile=font_path)
    page.insert_text((352, 179), str(contract.leaseArea), fontsize=fontsize, fontname="KoreanFont", fontfile=font_path)
    page.insert_text((120, 220), number_to_korean(contract.deposit), fontsize=fontsize, fontname="KoreanFont", fontfile=font_path)
    page.insert_text((410, 220), format_number_with_commas(contract.deposit), fontsize=fontsize, fontname="KoreanFont", fontfile=font_path)
    page.insert_text((120, 239), number_to_korean(contract.downPayment), fontsize=fontsize, fontname="KoreanFont", fontfile=font_path)
    page.insert_text((450, 239), contract.lesseeName, fontsize=fontsize, fontname="KoreanFont", fontfile=font_path)
    page.insert_text((120, 258), number_to_korean(contract.middlePayment), fontsize=fontsize, fontname="KoreanFont", fontfile=font_path)
    page.insert_text((370, 258), str(contract.middlePaymentDate.year), fontsize=fontsize, fontname="KoreanFont", fontfile=font_path)
    page.insert_text((425, 258), str(contract.middlePaymentDate.month), fontsize=fontsize, fontname="KoreanFont", fontfile=font_path)
    page.insert_text((460, 258), str(contract.middlePaymentDate.day), fontsize=fontsize, fontname="KoreanFont", fontfile=font_path)
    page.insert_text((120, 277), number_to_korean(contract.balance), fontsize=fontsize, fontname="KoreanFont", fontfile=font_path)
    page.insert_text((370, 277), str(contract.balanceDate.year), fontsize=fontsize, fontname="KoreanFont", fontfile=font_path)
    page.insert_text((425, 277), str(contract.balanceDate.month), fontsize=fontsize, fontname="KoreanFont", fontfile=font_path)
    page.insert_text((460, 277), str(contract.balanceDate.day), fontsize=fontsize, fontname="KoreanFont", fontfile=font_path)
    page.insert_text((120, 295), number_to_korean(contract.rentAmount), fontsize=fontsize, fontname="KoreanFont", fontfile=font_path)
    if(contract.rentType == "선불"):
        page.insert_text((371, 298), "ㅁ", fontsize=20, fontname="KoreanFont", fontfile=font_path, color=(1,0,0))
    elif(contract.rentType == "후불"):
        page.insert_text((407, 298), "ㅁ", fontsize=20, fontname="KoreanFont", fontfile=font_path, color=(1,0,0))

    page.insert_text((460, 295), str(contract.rentDate.day), fontsize=fontsize, fontname="KoreanFont", fontfile=font_path)

    page.insert_text((375, 313), str(contract.leasePeriodStart.year), fontsize=fontsize, fontname="KoreanFont", fontfile=font_path)
    page.insert_text((425, 313), str(contract.leasePeriodStart.month), fontsize=fontsize, fontname="KoreanFont", fontfile=font_path)
    page.insert_text((465, 313), str(contract.leasePeriodStart.day), fontsize=fontsize, fontname="KoreanFont", fontfile=font_path)

    page.insert_text((230, 325), str(contract.leasePeriodEnd.year), fontsize=fontsize, fontname="KoreanFont", fontfile=font_path)
    page.insert_text((280, 325), str(contract.leasePeriodEnd.month), fontsize=fontsize, fontname="KoreanFont", fontfile=font_path)
    page.insert_text((315, 325), str(contract.leasePeriodEnd.day), fontsize=fontsize, fontname="KoreanFont", fontfile=font_path)

    page.insert_text((130, 481), str(contract.commissionAmount), fontsize=fontsize, fontname="KoreanFont", fontfile=font_path)

    texts = split_text_by_width(contract.specialTerms, 100)
    for i, text in enumerate(texts):
        page.insert_text((86, 522 + i * 12), text, fontsize=fontsize, fontname="KoreanFont", fontfile=font_path)

    page.insert_text((140, 622), contract.lessorAddress, fontsize=fontsize, fontname="KoreanFont", fontfile=font_path)
    page.insert_text((140, 637), contract.lessorIdNumber, fontsize=fontsize, fontname="KoreanFont", fontfile=font_path)
    page.insert_text((345, 637), contract.lessorPhone, fontsize=fontsize, fontname="KoreanFont", fontfile=font_path)
    page.insert_text((447, 637), contract.lessorName, fontsize=fontsize, fontname="KoreanFont", fontfile=font_path)
    page.insert_text((167, 653), contract.lessorAgentAddress, fontsize=fontsize, fontname="KoreanFont", fontfile=font_path)
    page.insert_text((345, 653), contract.lessorAgentIdNumber, fontsize=fontsize, fontname="KoreanFont", fontfile=font_path)
    page.insert_text((447, 653), contract.lessorAgentName, fontsize=fontsize, fontname="KoreanFont", fontfile=font_path)

    page.insert_text((140, 669), contract.lesseeAddress, fontsize=fontsize, fontname="KoreanFont", fontfile=font_path)
    page.insert_text((140, 686), contract.lesseeIdNumber, fontsize=fontsize, fontname="KoreanFont", fontfile=font_path)
    page.insert_text((345, 686), contract.lesseePhone, fontsize=fontsize, fontname="KoreanFont", fontfile=font_path)
    page.insert_text((447, 686), contract.lesseeName, fontsize=fontsize, fontname="KoreanFont", fontfile=font_path)
    page.insert_text((167, 703), contract.lesseeAgentAddress, fontsize=fontsize, fontname="KoreanFont", fontfile=font_path)
    page.insert_text((345, 703), contract.lesseeAgentIdNumber, fontsize=fontsize, fontname="KoreanFont", fontfile=font_path)
    page.insert_text((447, 703), contract.lesseeAgentName, fontsize=fontsize, fontname="KoreanFont", fontfile=font_path)

    page.insert_text((140, 719), contract.realtorOfficeAddress1, fontsize=fontsize, fontname="KoreanFont", fontfile=font_path)
    page.insert_text((370, 719), contract.realtorOfficeAddress2, fontsize=fontsize, fontname="KoreanFont", fontfile=font_path)
    page.insert_text((140, 737), contract.realtorOfficeName1, fontsize=fontsize, fontname="KoreanFont", fontfile=font_path)
    page.insert_text((370, 737), contract.realtorOfficeName2, fontsize=fontsize, fontname="KoreanFont", fontfile=font_path)
    page.insert_text((184, 753), contract.realtorSignature1, fontsize=fontsize, fontname="KoreanFont", fontfile=font_path)
    page.insert_text((414, 753), contract.realtorSignature2, fontsize=fontsize, fontname="KoreanFont", fontfile=font_path)

    page.insert_text((140, 770), split_license_phone(contract.realtorLicensePhone1)[0], fontsize=fontsize, fontname="KoreanFont", fontfile=font_path)
    page.insert_text((240, 770), split_license_phone(contract.realtorLicensePhone1)[1], fontsize=fontsize, fontname="KoreanFont", fontfile=font_path)

    page.insert_text((370, 770), split_license_phone(contract.realtorLicensePhone2)[0], fontsize=fontsize, fontname="KoreanFont", fontfile=font_path)
    page.insert_text((500, 770), split_license_phone(contract.realtorLicensePhone2)[1], fontsize=fontsize, fontname="KoreanFont", fontfile=font_path)

    page.insert_text((184, 786), contract.realtorAgentSignature1, fontsize=fontsize, fontname="KoreanFont", fontfile=font_path)
    page.insert_text((414, 786), contract.realtorAgentSignature2, fontsize=fontsize, fontname="KoreanFont", fontfile=font_path)

    # 저장
    output_path = contract.location + '.pdf'
    doc.save(output_path)

    print(f"✅ PDF 저장 완료: {output_path}")

    return output_path