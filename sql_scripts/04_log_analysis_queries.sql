/*
================================================================================
로그 분석 및 조회 쿼리 모음
================================================================================

용도: 
- 운영 중인 로깅 시스템의 데이터 분석용
- 사용자 활동 패턴 분석 및 시스템 모니터링
- 문제 진단 및 성능 분석을 위한 다양한 쿼리 제공

실행 시점:
- 로그 데이터가 어느 정도 축적된 후 (최소 며칠 이상)
- 주기적인 시스템 모니터링 시
- 특정 이슈나 성능 문제 분석이 필요할 때
- 월간/주간 리포트 작성 시

주의사항:
- 대량의 로그 데이터가 있을 때는 날짜 범위를 제한하여 쿼리 성능 향상
- 개인정보가 포함된 로그는 주의해서 조회
- 운영 시간에는 무거운 분석 쿼리 실행 자제

================================================================================
*/

-- ========================================
-- 1. 기본 통계 조회
-- ========================================

-- 전체 로그 개요
SELECT 
    COUNT(*) as total_logs,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(DISTINCT session_id) as unique_sessions,
    COUNT(DISTINCT action_type) as unique_actions,
    MIN(created_at) as oldest_log,
    MAX(created_at) as newest_log
FROM user_activity_logs;

-- 사용자별 활동 요약 (상위 10명)
SELECT * FROM user_activity_summary LIMIT 10;

-- 액션 타입별 통계
SELECT 
    action_type,
    COUNT(*) as count,
    COUNT(DISTINCT user_id) as unique_users,
    ROUND(COUNT(*)::NUMERIC / (SELECT COUNT(*) FROM user_activity_logs) * 100, 2) as percentage
FROM user_activity_logs
GROUP BY action_type
ORDER BY count DESC;

-- ========================================
-- 2. 시간대별 분석
-- ========================================

-- 최근 7일간 일별 활동
SELECT * FROM daily_activity_stats 
WHERE activity_date >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY activity_date DESC;

-- 시간대별 활동 패턴 (24시간)
SELECT 
    EXTRACT(HOUR FROM created_at) as hour,
    COUNT(*) as activity_count,
    COUNT(DISTINCT user_id) as unique_users
FROM user_activity_logs
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY EXTRACT(HOUR FROM created_at)
ORDER BY hour;

-- 요일별 활동 패턴
SELECT 
    TO_CHAR(created_at, 'Day') as day_of_week,
    COUNT(*) as activity_count,
    COUNT(DISTINCT user_id) as unique_users
FROM user_activity_logs
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY TO_CHAR(created_at, 'Day'), EXTRACT(DOW FROM created_at)
ORDER BY EXTRACT(DOW FROM created_at);

-- ========================================
-- 3. 사용자 활동 분석
-- ========================================

-- 가장 활동적인 사용자 (최근 30일)
SELECT 
    u.name,
    u.department,
    COUNT(l.*) as total_activities,
    COUNT(DISTINCT DATE(l.created_at)) as active_days,
    MAX(l.created_at) as last_activity
FROM users u
JOIN user_activity_logs l ON u.id = l.user_id
WHERE l.created_at >= NOW() - INTERVAL '30 days'
GROUP BY u.id, u.name, u.department
ORDER BY total_activities DESC
LIMIT 10;

-- 신규 사용자 활동 (가입 후 첫 활동까지의 시간)
SELECT 
    u.name,
    u.created_at as registration_time,
    MIN(l.created_at) as first_activity_time,
    MIN(l.created_at) - u.created_at as time_to_first_activity
FROM users u
LEFT JOIN user_activity_logs l ON u.id = l.user_id
WHERE u.created_at >= NOW() - INTERVAL '30 days'
GROUP BY u.id, u.name, u.created_at
ORDER BY u.created_at DESC;

-- 비활성 사용자 찾기 (최근 7일간 활동 없음)
SELECT 
    u.id,
    u.name,
    u.department,
    MAX(l.created_at) as last_activity
FROM users u
LEFT JOIN user_activity_logs l ON u.id = l.user_id
GROUP BY u.id, u.name, u.department
HAVING MAX(l.created_at) < NOW() - INTERVAL '7 days' OR MAX(l.created_at) IS NULL
ORDER BY last_activity DESC NULLS LAST;

-- ========================================
-- 4. 학습 활동 분석
-- ========================================

-- 학습 진도 관련 활동 요약
SELECT * FROM learning_activity_logs 
WHERE created_at >= NOW() - INTERVAL '7 days'
ORDER BY created_at DESC
LIMIT 20;

-- 강의 완료율 분석
SELECT 
    DATE(created_at) as date,
    COUNT(CASE WHEN action_type = 'lesson_complete' THEN 1 END) as completed,
    COUNT(CASE WHEN action_type = 'lesson_uncomplete' THEN 1 END) as uncompleted,
    COUNT(DISTINCT user_id) as active_learners
FROM user_activity_logs
WHERE action_type IN ('lesson_complete', 'lesson_uncomplete')
    AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- ========================================
-- 5. 에러 및 성능 분석
-- ========================================

-- 최근 에러 로그 (상위 20개)
SELECT * FROM error_logs 
WHERE created_at >= NOW() - INTERVAL '24 hours'
LIMIT 20;

-- 에러 타입별 통계
SELECT 
    action_type,
    COUNT(*) as error_count,
    COUNT(DISTINCT user_id) as affected_users,
    MAX(created_at) as last_occurrence
FROM user_activity_logs
WHERE action_type LIKE '%error%'
    AND created_at >= NOW() - INTERVAL '7 days'
GROUP BY action_type
ORDER BY error_count DESC;

-- 성능 로그 분석 (평균 응답 시간)
SELECT 
    operation,
    COUNT(*) as operation_count,
    ROUND(AVG(duration_ms), 2) as avg_duration_ms,
    ROUND(MAX(duration_ms), 2) as max_duration_ms,
    ROUND(MIN(duration_ms), 2) as min_duration_ms
FROM performance_logs
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY operation
ORDER BY avg_duration_ms DESC;

-- ========================================
-- 6. 세션 분석
-- ========================================

-- 세션별 활동 요약 (최근 활동한 세션들)
SELECT 
    session_id,
    user_id,
    u.name as user_name,
    COUNT(*) as activities_in_session,
    MIN(l.created_at) as session_start,
    MAX(l.created_at) as session_end,
    MAX(l.created_at) - MIN(l.created_at) as session_duration
FROM user_activity_logs l
LEFT JOIN users u ON l.user_id = u.id
WHERE l.created_at >= NOW() - INTERVAL '24 hours'
    AND session_id IS NOT NULL
GROUP BY session_id, user_id, u.name
HAVING COUNT(*) > 1
ORDER BY session_start DESC
LIMIT 20;

-- 평균 세션 시간 분석
SELECT 
    DATE(MIN(created_at)) as date,
    COUNT(DISTINCT session_id) as total_sessions,
    ROUND(AVG(EXTRACT(EPOCH FROM (MAX(created_at) - MIN(created_at)))), 2) as avg_session_duration_seconds
FROM user_activity_logs
WHERE created_at >= NOW() - INTERVAL '7 days'
    AND session_id IS NOT NULL
GROUP BY session_id, DATE(MIN(created_at))
HAVING COUNT(*) > 1
ORDER BY date DESC;

-- ========================================
-- 7. 맞춤형 분석 함수 사용 예시
-- ========================================

-- 전체 통계 (최근 7일)
SELECT * FROM get_log_stats();

-- 특정 사용자 통계 (사용자 ID 7, 최근 30일)
SELECT * FROM get_log_stats(7, 30);

-- 로그 정리 함수 실행 (30일 이상 된 로그 삭제)
-- SELECT cleanup_old_logs();

-- ========================================
-- 8. 데이터 내보내기용 쿼리
-- ========================================

-- CSV 내보내기용 사용자 활동 요약
SELECT 
    user_name,
    department,
    total_activities,
    lessons_completed,
    page_views,
    errors,
    active_days,
    first_activity,
    last_activity
FROM user_activity_summary
ORDER BY total_activities DESC;

-- 일별 활동 트렌드 (차트용)
SELECT 
    activity_date,
    SUM(count) as total_activities,
    COUNT(DISTINCT action_type) as unique_actions
FROM daily_activity_stats
WHERE activity_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY activity_date
ORDER BY activity_date;