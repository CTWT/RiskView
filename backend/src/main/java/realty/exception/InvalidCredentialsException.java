package realty.exception;

/*
 * 수업명 : 가비아 2회차
 * 이름 : 박윤성
 * 작성자 : 박윤성
 * 수정자 : 
 * 작성일 : 25.07.30
 * 파일명 : InvalidCredentialsException.java
 */

public class InvalidCredentialsException extends RuntimeException {
    /**
     * 비밀번호가 일치하지 않을 때 발생하는 예외
     * @param message
     */
    public InvalidCredentialsException(String message) {
        super(message);
    }
}
