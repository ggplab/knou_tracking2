# KNOU 트래킹 시스템 - SQL 스크립트 모음

이 디렉토리는 KNOU 트래킹 시스템의 데이터베이스 설정과 로깅 시스템 구축을 위한 SQL 스크립트들을 포함합니다.

## 📁 파일 목록

### 1. `01_database_analysis.sql`
**데이터베이스 구조 분석 스크립트**
- **용도**: 기존 Supabase 데이터베이스 구조 파악
- **실행 시점**: 새로운 환경에서 로깅 시스템 구축 전
- **주요 기능**:
  - 테이블 목록 확인
  - users 테이블 구조 분석
  - 기존 데이터 개수 확인
  - 외래키 관계 파악

### 2. `02_create_log_table.sql` ⭐ **메인 스크립트**
**사용자 활동 로그 테이블 생성**
- **용도**: 완전한 로깅 시스템 구축 (테이블 + 뷰 + 함수)
- **실행 시점**: 로깅 시스템 최초 설치 시 (한 번만 실행)
- **주요 기능**:
  - `user_activity_logs` 테이블 생성
  - 성능 최적화 인덱스 6개 생성
  - 분석용 뷰 5개 생성 (활동 요약, 일별 통계, 에러 분석 등)
  - 관리 함수 2개 생성 (로그 정리, 통계 조회)

### 3. `03_insert_sample_logs.sql`
**샘플 로그 데이터 삽입**
- **용도**: 로깅 시스템 테스트 및 분석 뷰 동작 확인
- **실행 시점**: 로그 테이블 생성 후 테스트 시
- **주요 기능**:
  - 기존 사용자 데이터 확인
  - 안전한 샘플 로그 삽입
  - 다양한 액션 타입 테스트 데이터

### 4. `04_log_analysis_queries.sql`
**로그 분석 및 조회 쿼리 모음**
- **용도**: 운영 중인 로깅 시스템 데이터 분석
- **실행 시점**: 로그 데이터 축적 후 주기적 분석 시
- **주요 기능**:
  - 기본 통계 조회
  - 시간대별/요일별 분석
  - 사용자 활동 패턴 분석
  - 에러 및 성능 분석
  - 세션 분석

### 5. `05_performance_indexes.sql`
**성능 최적화 인덱스 생성**
- **용도**: 기존 시스템 성능 최적화
- **실행 시점**: 사용자 증가로 성능 저하 시
- **주의사항**: ⚠️ 각 명령어를 개별적으로 실행 필요
- **주요 기능**:
  - 외래키 인덱스 생성
  - 복합 인덱스 생성
  - 조건부 인덱스 생성
  - 성능 모니터링 쿼리

## 🚀 실행 순서

### 신규 설치 시:
1. `01_database_analysis.sql` - 기존 구조 확인
2. `02_create_log_table.sql` - 로그 시스템 구축 ⭐
3. `03_insert_sample_logs.sql` - 테스트 (선택사항)

### 운영 중 관리:
- `04_log_analysis_queries.sql` - 주기적 분석
- `05_performance_indexes.sql` - 성능 저하 시

### 성능 최적화:
- 기존 시스템이 느려질 때 `05_performance_indexes.sql` 실행

## 📊 생성되는 뷰 (View) 목록

1. **`user_activity_summary`** - 사용자별 활동 요약
2. **`daily_activity_stats`** - 일별 활동 통계  
3. **`error_logs`** - 에러 로그 분석
4. **`performance_logs`** - 성능 로그 분석
5. **`learning_activity_logs`** - 학습 활동 분석

## 🔧 관리 함수 목록

1. **`cleanup_old_logs()`** - 30일 이상 된 로그 삭제
2. **`get_log_stats(user_id, days)`** - 사용자별 통계 조회

## 📝 사용 예시

```sql
-- 전체 사용자 활동 요약 보기
SELECT * FROM user_activity_summary;

-- 최근 7일 통계 조회
SELECT * FROM get_log_stats();

-- 특정 사용자의 30일 통계
SELECT * FROM get_log_stats(7, 30);

-- 오래된 로그 정리
SELECT cleanup_old_logs();

-- 최근 에러 확인
SELECT * FROM error_logs WHERE created_at >= NOW() - INTERVAL '24 hours';
```

## ⚠️ 주의사항

1. **메인 스크립트 실행**: `02_create_log_table.sql`은 한 번만 실행
2. **인덱스 생성**: `05_performance_indexes.sql`의 각 명령어는 개별 실행
3. **백업**: 운영 환경에서는 실행 전 데이터베이스 백업 권장
4. **권한**: Supabase에서 적절한 권한으로 실행 필요

## 🔍 트러블슈팅

- **외래키 오류**: `01_database_analysis.sql`로 기존 구조 재확인
- **중복 생성 오류**: 이미 생성된 객체는 무시하고 진행
- **성능 이슈**: `05_performance_indexes.sql` 실행 검토

## 📞 연동 파일들

- **JavaScript**: `logging.js` - 로그 생성 및 전송
- **HTML**: `test_logging.html` - 로깅 시스템 테스트
- **앱**: `app.js`, `data.js` - 실제 로깅 포인트들