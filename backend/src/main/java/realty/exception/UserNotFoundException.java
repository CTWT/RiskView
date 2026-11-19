package realty.exception;

/*
 * 수업명 : 가비아 2회차
 * 이름 : 박윤성
 * 작성자 : 박윤성
 * 수정자 : 
 * 작성일 : 25.07.30
 * 파일명 : UserNotFoundException.java
 */

public class UserNotFoundException extends RuntimeException {
    /**
     * 사용자를 찾을 수 없을 때 발생하는 예외
     * @param message
     */
    public UserNotFoundException(String message) {
        super(message);
    }
}
