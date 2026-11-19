package realty.exception;

/*
 * 수업명 : 가비아 2회차
 * 이름 : 박윤성
 * 작성자 : 박윤성
 * 수정자 : 
 * 작성일 : 25.07.30
 * 파일명 : EmailNotVerifiedException.java
 */

public class EmailNotVerifiedException extends RuntimeException {
    /**
     * 이메일 인증 미완료 예외
     * @param message
     */
    public EmailNotVerifiedException(String message) {
        super(message);
    }
}
