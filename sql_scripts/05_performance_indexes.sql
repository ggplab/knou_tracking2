/*
================================================================================
성능 최적화 인덱스 생성 스크립트
================================================================================

용도: 
- KNOU 트래킹 시스템의 데이터베이스 성능 최적화
- 대시보드 쿼리 속도 향상 및 JOIN 연산 최적화
- 사용자 증가 시 시스템 응답 속도 유지

실행 시점:
- 기본 테이블들이 모두 생성된 후
- 사용자와 데이터가 어느 정도 축적된 후 (100명 이상 권장)
- 대시보드 로딩이 느려지기 시작할 때
- 주기적인 성능 최적화 작업 시

실행 방법:
- ⚠️ 중요: 각 명령어를 하나씩 개별적으로 실행해야 합니다!
- Supabase SQL Editor에서는 CONCURRENTLY 명령어를 한 번에 하나씩만 실행할 수 있습니다.

주의사항:
- CONCURRENTLY 옵션으로 서비스 중단 없이 인덱스 생성
- 대량 데이터가 있는 경우 인덱스 생성에 시간이 걸릴 수 있음
- 인덱스는 디스크 공간을 추가로 사용함

================================================================================
*/

-- ==================== 1단계: 기본 외래키 인덱스 ====================

-- [1] user_courses 테이블 - user_id 인덱스
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_courses_user_id ON user_courses(user_id);

-- [2] user_courses 테이블 - course_id 인덱스  
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_courses_course_id ON user_courses(course_id);

-- [3] user_progress 테이블 - user_id 인덱스 (가장 중요!)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);

-- [4] user_progress 테이블 - lesson_id 인덱스
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_progress_lesson_id ON user_progress(lesson_id);

-- [5] lessons 테이블 - course_id 인덱스
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_lessons_course_id ON lessons(course_id);

-- ==================== 2단계: 복합 인덱스 ====================

-- [6] user_progress 복합 인덱스 (JOIN + WHERE 최적화)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_progress_composite ON user_progress(user_id, lesson_id);

-- [7] lessons 정렬 최적화 (ORDER BY lesson_order)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_lessons_course_id_order ON lessons(course_id, lesson_order);

-- [8] user_courses 복합 인덱스 (사용자별 수강 과목 조회 최적화)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_courses_composite ON user_courses(user_id, course_id);

-- ==================== 3단계: 조건부 인덱스 ====================

-- [9] 완료된 진도만 인덱싱 (통계 조회 최적화)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_progress_completed 
ON user_progress(user_id, lesson_id) 
WHERE completed = true;

-- [10] 날짜 기반 조회 최적화 (최근 활동 조회용)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_progress_completed_at ON user_progress(completed_at) 
WHERE completed_at IS NOT NULL;

-- ==================== 4단계: 인덱스 확인 ====================

-- 생성된 인덱스 확인
SELECT 
    indexname,
    tablename,
    indexdef
FROM pg_indexes 
WHERE tablename IN ('users', 'courses', 'lessons', 'user_courses', 'user_progress')
    AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- ==================== 5단계: 성능 분석 ====================

-- 대시보드 메인 쿼리 성능 분석
EXPLAIN (ANALYZE, BUFFERS) 
SELECT 
    u.id,
    u.name,
    u.department,
    COUNT(CASE WHEN up.completed = true THEN 1 END) as completed_lessons,
    COUNT(up.id) as total_lessons
FROM users u
LEFT JOIN user_courses uc ON u.id = uc.user_id
LEFT JOIN lessons l ON uc.course_id = l.course_id
LEFT JOIN user_progress up ON u.id = up.user_id AND l.id = up.lesson_id
GROUP BY u.id, u.name, u.department;

-- ==================== 6단계: 통계 정보 업데이트 ====================

-- PostgreSQL의 쿼리 플래너가 최적화된 실행 계획을 세울 수 있도록 통계 업데이트
ANALYZE users;
ANALYZE courses; 
ANALYZE lessons;
ANALYZE user_courses;
ANALYZE user_progress;

-- ==================== 7단계: 인덱스 사용률 모니터링 ====================

-- 인덱스 사용률 확인 (나중에 주기적으로 실행)
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as index_scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched,
    CASE 
        WHEN idx_scan = 0 THEN '미사용'
        WHEN idx_scan < 100 THEN '저사용'
        WHEN idx_scan < 1000 THEN '보통사용'
        ELSE '고사용'
    END as usage_level
FROM pg_stat_user_indexes 
WHERE schemaname = 'public'
    AND indexname LIKE 'idx_%'
ORDER BY idx_scan DESC;

-- 테이블별 스캔 통계
SELECT 
    schemaname,
    tablename,
    seq_scan as sequential_scans,
    seq_tup_read as sequential_reads,
    idx_scan as index_scans,
    idx_tup_fetch as index_reads,
    ROUND(
        CASE 
            WHEN (seq_scan + idx_scan) = 0 THEN 0
            ELSE (idx_scan::NUMERIC / (seq_scan + idx_scan)) * 100 
        END, 2
    ) as index_usage_percentage
FROM pg_stat_user_tables 
WHERE schemaname = 'public'
ORDER BY index_usage_percentage DESC;

/*
================================================================================
실행 후 확인사항:

1. 모든 인덱스가 성공적으로 생성되었는지 확인
2. 대시보드 로딩 속도 개선 확인
3. 주기적으로 인덱스 사용률 모니터링
4. 불필요한 인덱스는 삭제 고려 (사용률이 매우 낮은 경우)

성능 최적화 팁:
- 인덱스 생성 후 1-2주 후에 사용률 재확인
- 사용률이 낮은 인덱스는 DROP 고려
- 새로운 쿼리 패턴 발견 시 추가 인덱스 검토
================================================================================
*/