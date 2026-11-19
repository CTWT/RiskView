package realty.exception;

/*
 * 수업명 : 가비아 2회차
 * 이름 : 박윤성
 * 작성자 : 박윤성
 * 수정자 : 
 * 작성일 : 25.07.30
 * 파일명 : AccountDeletedException.java
 */

public class AccountDeletedException extends RuntimeException {
    /**
     * 계정이 삭제된 경우 발생하는 예외
     * @param message
     */
    public AccountDeletedException(String message) {
        super(message);
    }
}
