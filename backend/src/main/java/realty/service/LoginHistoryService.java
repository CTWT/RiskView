package realty.service;

import realty.domain.model.LoginHistory;
import realty.domain.repository.LoginHistoryRepository;
import realty.domain.model.User;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Sort;
import realty.domain.dto.LoginHistoryDTO;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


/*
 * 수업명 : 가비아 2회차
 * 이름 : 박윤성
 * 작성자 : 박윤성
 * 수정자 : 
 * 작성일 : 25.07.29
 * 파일명 : LoginHistoryService.java
 */

@Service
public class LoginHistoryService {
    
    @Autowired
    private LoginHistoryRepository loginHistoryRepository;

    /**
     * 로그인 기록 저장
     * @param user User 객체
     * @param ipAddress IP 주소
     * @param userAgent UserAgent
     * @return LoginHistory 객체
     */
    @Transactional
    public LoginHistory saveLoginHistory(User user, String ipAddress, String userAgent) {
        // 로그인 기록 생성
        LoginHistory loginHistory = LoginHistory.builder()
                                                .userCode(user.getUserCode())
                                                .ipAddress(ipAddress)
                                                .userAgent(userAgent)
                                                .build();
        // 로그인 기록 데이터베이스에 저장
        loginHistoryRepository.save(loginHistory);
        // 로그인 코드 설정
        loginHistory.setLoginCode("LH" + String.format("%08d", loginHistory.getLoginId()));
        // 설정된 로그인 코드를 데이터베이스에 저장
        loginHistoryRepository.save(loginHistory);
        // 로그인 기록 반환
        return loginHistory;
    }

    /**
     * 사용자 코드로 로그인 기록 조회
     * @param userCode 사용자 코드
     * @return 로그인 기록 리스트
     */
    public List<LoginHistoryDTO> findByUserCode(String userCode) {
        // 로그인 기록 정렬
        Sort sort = Sort.by(Sort.Direction.DESC, "loginTime");
        // 사용자 코드로 정렬된 로그인 기록 조회
        List<LoginHistory> loginHistories = loginHistoryRepository.findByUserCode(userCode, sort);
        // 로그인 기록 리스트를 DTO 리스트로 변환
        return loginHistories.stream()
                            .map(history -> LoginHistoryDTO.builder()
                                        .loginTime(history.getLoginTime()
                                            .format(DateTimeFormatter
                                            .ofPattern("yyyy-MM-dd HH:mm:ss")))
                                        .ipAddress(history.getIpAddress())
                                        .userAgent(history.getUserAgent())
                                        .build())
                            .collect(Collectors.toList());
    }
}
