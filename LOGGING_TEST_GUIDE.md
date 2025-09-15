# 로깅 시스템 테스트 가이드

## 🧪 로컬 테스트 방법

### 1. 서버 실행
```bash
# 프로젝트 디렉토리에서
python3 -m http.server 8080
```

### 2. 브라우저 접속
- **메인 앱**: http://localhost:8080/index.html
- **로깅 테스트**: http://localhost:8080/test_logging.html

## 📋 테스트 시나리오

### A. 메인 앱에서 테스트 (index.html)

#### 1. 페이지 네비게이션 테스트
- [ ] 대시보드 → 개인현황 → 관리 → 신규등록 이동
- [ ] 각 페이지 이동 시 `page_view` 로그 생성 확인
- [ ] 브라우저 개발자도구 콘솔에서 로그 확인

#### 2. 사용자 등록 테스트
- [ ] 신규등록 페이지에서 새 사용자 등록
- [ ] 닉네임 중복 체크 시 `validation_error` 로그 확인
- [ ] 성공적인 등록 시 `user_register` 로그 확인

#### 3. 진도 업데이트 테스트  
- [ ] 개인현황에서 사용자 선택
- [ ] 강의 체크박스 클릭
- [ ] `lesson_complete`/`lesson_uncomplete` 로그 확인

#### 4. 에러 발생 테스트
- [ ] 존재하지 않는 사용자 선택 시도
- [ ] 네트워크 끊고 진도 업데이트 시도
- [ ] `error_occurred` 로그 확인

### B. 전용 테스트 페이지 (test_logging.html)

#### 1. 기본 로깅 테스트
- [ ] "사용자 액션 로그" 버튼 클릭
- [ ] "페이지 뷰 로그" 버튼 클릭  
- [ ] "성능 로그" 버튼 클릭
- [ ] 실시간 로그 디스플레이에서 확인

#### 2. 에러 로깅 테스트
- [ ] "에러 로그" 버튼 클릭
- [ ] 에러 카운트 증가 확인
- [ ] 에러 상세 정보 확인

#### 3. 대량 로깅 테스트
- [ ] "대량 로그 생성" 버튼 클릭
- [ ] 10개 로그 일괄 생성 확인
- [ ] 통계 업데이트 확인

#### 4. 로그 레벨 테스트
- [ ] DEBUG, INFO, WARN, ERROR 레벨 설정
- [ ] 각 레벨에서 로그 출력 확인
- [ ] 콘솔/Supabase 로깅 토글 확인

#### 5. 오프라인 테스트
- [ ] 네트워크 연결 끊기
- [ ] 로그 생성 시도
- [ ] 로컬 큐에 저장되는지 확인
- [ ] 네트워크 복구 후 동기화 확인

## 🔍 확인 포인트

### 브라우저 개발자도구 (F12)
```javascript
// 콘솔에서 직접 로그 생성 테스트
await logActivity('test_action', 'test_target', {test: true});

// 로그 매니저 상태 확인
console.log(logManager);
```

### Supabase 데이터베이스
```sql
-- 실시간 로그 확인
SELECT * FROM user_activity_logs 
ORDER BY created_at DESC 
LIMIT 10;

-- 세션별 로그 확인  
SELECT session_id, COUNT(*), MIN(created_at), MAX(created_at)
FROM user_activity_logs 
GROUP BY session_id 
ORDER BY MIN(created_at) DESC;
```

### 네트워크 탭
- [ ] Supabase API 호출 확인
- [ ] 로그 전송 성공/실패 확인
- [ ] 응답 시간 모니터링

## ⚠️ 문제 해결

### 로그가 생성되지 않는 경우
1. 브라우저 콘솔에서 에러 메시지 확인
2. `logManager` 객체가 초기화되었는지 확인
3. Supabase 연결 상태 확인

### Supabase 연결 실패
1. `config.js`의 Supabase URL/Key 확인
2. 네트워크 연결 상태 확인
3. Supabase 프로젝트 상태 확인

### 로컬스토리지 문제
```javascript
// 로컬 큐 확인
console.log(localStorage.getItem('knou_log_queue'));

// 로컬 큐 정리
localStorage.removeItem('knou_log_queue');
```

## 📊 성공 기준

- [ ] 모든 사용자 액션이 정상적으로 로깅됨
- [ ] 에러 발생 시 적절한 에러 로그 생성
- [ ] 오프라인 상태에서도 로컬 큐에 저장
- [ ] 온라인 복구 시 로그 동기화
- [ ] 성능 로그가 정확한 시간 측정
- [ ] Supabase에서 로그 데이터 확인 가능

## 🎯 고급 테스트

### 성능 테스트
- 1000개 로그 생성 후 응답 시간 측정
- 대량 데이터 상황에서 UI 반응성 확인

### 동시성 테스트  
- 여러 탭에서 동시 로깅
- 세션 관리 정확성 확인

### 데이터 무결성 테스트
- 로그 순서 보장 확인
- 중복 로그 방지 확인