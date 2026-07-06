# 로깅 시스템 문제 해결 가이드

## 🚨 증상: 사용자 상호작용이 Supabase에 기록되지 않음

### 가능한 원인들 및 해결 방법

#### 1. **Supabase 테이블이 없는 경우**
**확인 방법:**
```sql
-- Supabase SQL Editor에서 실행
SELECT * FROM user_activity_logs LIMIT 1;
```

**해결 방법:**
- `sql_scripts/02_create_log_table.sql` 실행

#### 2. **로깅 시스템 초기화 실패**
**확인 방법:**
- 브라우저 F12 → 콘솔에서 에러 메시지 확인
- `dataManager.logManager`가 null인지 확인

**해결 방법:**
```javascript
// 콘솔에서 수동 초기화
await dataManager.initializeLogging();
```

#### 3. **Supabase 연결 실패**
**확인 방법:**
- 콘솔에서 "LocalStorage 모드로 실행" 메시지 확인
- 네트워크 탭에서 Supabase API 호출 실패 확인

**해결 방법:**
- config.js의 URL/API Key 재확인
- Supabase 프로젝트 상태 확인

#### 4. **로컬 큐에만 저장되는 경우**
**확인 방법:**
```javascript
// 로컬 큐 내용 확인
console.log(JSON.parse(localStorage.getItem('knou_log_queue') || '[]'));
```

**해결 방법:**
- 온라인 상태 확인
- Supabase 테이블 권한 확인

#### 5. **app.js에서 logManager 연결 안 됨**
**확인 방법:**
```javascript
// app 객체에서 logManager 확인
console.log('app.logManager:', app?.logManager);
```

**해결 방법:**
- app.js의 init() 메서드에서 `this.logManager = dataManager.logManager;` 확인

#### 6. **로깅 포인트가 호출되지 않음**
**확인 방법:**
- 브라우저에서 사용자 상호작용 시 콘솔 로그 확인

**해결 방법:**
- app.js의 이벤트 핸들러에 로깅 호출 추가 확인

### 🔍 단계별 진단 방법

#### Step 1: 기본 상태 확인
```javascript
// 필수 객체들이 모두 로드되었는지 확인
console.log({
    supabaseConfig: typeof supabaseConfig !== 'undefined',
    LOG_ACTIONS: typeof LOG_ACTIONS !== 'undefined', 
    initializeLogManager: typeof initializeLogManager !== 'undefined',
    dataManager: typeof dataManager !== 'undefined',
    app: typeof app !== 'undefined'
});
```

#### Step 2: Supabase 연결 테스트
```javascript
// 직접 Supabase 테스트
if (supabaseConfig?.initialized) {
    const client = supabaseConfig.getClient();
    const { data, error } = await client
        .from('user_activity_logs')
        .select('count', { count: 'exact', head: true });
    console.log('Supabase 테스트:', { data, error });
}
```

#### Step 3: 수동 로그 생성 테스트
```javascript
// 로깅 시스템이 있다면 수동으로 로그 생성
if (dataManager?.logManager) {
    await dataManager.logManager.log(LOG_ACTIONS.PAGE_VIEW, 'manual_test', {test: true});
    console.log('수동 로그 생성 완료');
}
```

#### Step 4: 실제 상호작용 테스트
1. 페이지 네비게이션 (대시보드 → 개인현황)
2. 콘솔에서 로그 메시지 확인
3. 1-2분 후 Supabase에서 데이터 확인

### 🛠️ 빠른 수정 방법

#### 임시 수동 로깅 활성화
브라우저 콘솔에서 실행:
```javascript
// 수동으로 페이지 뷰 로깅 테스트
window.testLogging = async () => {
    if (!dataManager?.logManager) {
        console.log('❌ 로깅 시스템 없음');
        return;
    }
    
    await dataManager.logManager.log(LOG_ACTIONS.PAGE_VIEW, 'manual_test', {
        test: true,
        timestamp: new Date().toISOString()
    });
    
    console.log('✅ 수동 로그 생성됨');
};

// 실행
await testLogging();
```

#### 강제 Supabase 동기화
```javascript
// 로컬 큐를 강제로 Supabase에 동기화
if (dataManager?.logManager) {
    await dataManager.logManager.flushLocalQueue();
    console.log('로컬 큐 동기화 시도됨');
}
```

### 📋 체크리스트

- [ ] Supabase에 `user_activity_logs` 테이블 존재
- [ ] config.js에서 Supabase URL/Key 설정 완료
- [ ] 브라우저 콘솔에 초기화 메시지 표시
- [ ] `dataManager.logManager` 객체 존재
- [ ] `app.logManager` 객체 존재  
- [ ] 사용자 상호작용 시 콘솔 로그 출력
- [ ] 네트워크 탭에서 Supabase API 호출 확인
- [ ] 로컬 큐에 로그 저장되는지 확인

### 🆘 최후 수단

모든 방법이 실패한다면:

1. **브라우저 캐시 완전 삭제**
2. **시크릿 모드에서 테스트**
3. **다른 브라우저에서 테스트**
4. **debug_logging.html에서 "테스트 로그 직접 삽입" 시도**