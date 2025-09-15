-- KNOU Tracking System - Database Performance Indexes
-- ⚠️ 중요: 각 명령어를 하나씩 개별적으로 실행해야 합니다!
-- Supabase SQL Editor에서는 CONCURRENTLY 명령어를 한 번에 하나씩만 실행할 수 있습니다.

-- 📋 실행 방법:
-- 1. 아래 각 CREATE INDEX 명령어를 복사
-- 2. Supabase SQL Editor에 하나씩 붙여넣기  
-- 3. Run 버튼 클릭하여 개별 실행
-- 4. 성공 메시지 확인 후 다음 명령어 실행

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

-- 5. 인덱스 적용 확인 쿼리
-- 아래 쿼리들로 인덱스가 정상적으로 생성되었는지 확인하세요
SELECT 
    indexname,
    tablename,
    indexdef
FROM pg_indexes 
WHERE tablename IN ('users', 'courses', 'lessons', 'user_courses', 'user_progress')
    AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- 6. 쿼리 성능 분석 (실행 계획 확인)
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

-- 7. 통계 정보 업데이트 (선택사항)
-- PostgreSQL의 쿼리 플래너가 최적화된 실행 계획을 세울 수 있도록 통계 업데이트
ANALYZE users;
ANALYZE courses; 
ANALYZE lessons;
ANALYZE user_courses;
ANALYZE user_progress;

-- 8. 인덱스 사용률 모니터링 쿼리 (나중에 확인용)
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as index_scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes 
WHERE schemaname = 'public'
    AND indexname LIKE 'idx_%'
ORDER BY idx_scan DESC;