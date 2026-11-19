package realty.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import java.util.HashMap;
import java.util.Map;

/*
 * 수업명 : 가비아 2회차
 * 이름 : 박윤성
 * 작성자 : 박윤성
 * 수정자 : 
 * 작성일 : 25.08.18
 * 파일명 : GlobalExceptionHandler.java
 */

@RestControllerAdvice
public class GlobalExceptionHandler {

    // GlobalExceptionHandler 클래스에서 발생하는 로그를 출력하기 위해 SLF4J 로깅 객체 선언
    private final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /**
     * 사용자 없음 예외 처리
     * @param e UserNotFoundException
     * @return 응답 객체
     */
    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleUserNotFoundException(UserNotFoundException e) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", "사용자를 찾을 수 없습니다.");
        logger.error("UserNotFoundException: ", e);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    /**
     * 삭제된 계정 예외 처리
     * @param e AccountDeletedException
     * @return 응답 객체
     */
    @ExceptionHandler(AccountDeletedException.class)
    public ResponseEntity<Map<String, Object>> handleAccountDeletedException(AccountDeletedException e) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", "삭제된 계정입니다.");
        logger.error("AccountDeletedException: ", e);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    /**
     * 로그인 실패 (비밀번호 틀림 등)
     * @param e InvalidCredentialsException
     * @return 응답 객체
     */
    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<Map<String, Object>> handleInvalidCredentialsException(InvalidCredentialsException e) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", "아이디 또는 비밀번호가 일치하지 않습니다.");
        logger.error("InvalidCredentialsException: ", e);
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    /**
     * 이메일 미인증 예외 처리
     * @param e EmailNotVerifiedException
     * @return 응답 객체
     */
    @ExceptionHandler(EmailNotVerifiedException.class)
    public ResponseEntity<Map<String, Object>> handleEmailNotVerifiedException(EmailNotVerifiedException e) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", "이메일 인증이 필요합니다.");
        logger.error("EmailNotVerifiedException: ", e);
        return ResponseEntity.badRequest().body(response);
    }

    /**
     * 그 외 모든 예외 처리
     * @param e Exception
     * @return 응답 객체
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleException(Exception e) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", "서버 내부 오류가 발생했습니다.");
        logger.error("Exception: ", e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}
