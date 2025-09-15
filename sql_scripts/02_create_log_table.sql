/*
================================================================================
사용자 활동 로그 테이블 생성 스크립트 (메인)
================================================================================

용도: 
- KNOU 트래킹 시스템의 사용자 활동 로깅을 위한 완전한 로그 시스템 구축
- 기존 Supabase 데이터베이스 구조에 완벽하게 매칭되는 로그 테이블 생성
- 분석용 뷰와 관리 함수까지 포함한 완전한 로깅 인프라 구축

실행 시점:
- 로깅 시스템을 처음 설치할 때 (한 번만 실행)
- 기존 데이터베이스 구조 분석 완료 후 실행
- 모든 필요한 테이블(users, courses, lessons 등)이 이미 존재할 때

주의사항:
- 실행 전 반드시 01_database_analysis.sql로 기존 구조 확인 필요
- users 테이블에 데이터가 있어야 샘플 로그 정상 삽입됨
- 한 번 실행 후 재실행 시 에러 발생 가능 (테이블 중복 생성)

================================================================================
*/

-- 1. user_activity_logs 테이블 생성 (기존 구조와 완벽 매칭)
CREATE TABLE user_activity_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,  -- users.id가 bigint이므로 맞춤
    action_type CHARACTER VARYING(50) NOT NULL,
    action_target CHARACTER VARYING(100),
    action_details JSONB,
    session_id CHARACTER VARYING(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB
);

-- 2. 성능 최적화 인덱스 생성
CREATE INDEX idx_user_activity_logs_user_id ON user_activity_logs(user_id);
CREATE INDEX idx_user_activity_logs_action_type ON user_activity_logs(action_type);
CREATE INDEX idx_user_activity_logs_created_at ON user_activity_logs(created_at DESC);
CREATE INDEX idx_user_activity_logs_session_id ON user_activity_logs(session_id);

-- 3. JSONB 검색 최적화 인덱스
CREATE INDEX idx_user_activity_logs_action_details ON user_activity_logs USING GIN(action_details);
CREATE INDEX idx_user_activity_logs_metadata ON user_activity_logs USING GIN(metadata);

-- 4. Row Level Security 설정
ALTER TABLE user_activity_logs ENABLE ROW LEVEL SECURITY;

-- 5. 모든 사용자 접근 허용 정책
CREATE POLICY "Allow all operations on user_activity_logs" ON user_activity_logs
    FOR ALL USING (true) WITH CHECK (true);

-- 6. 사용자별 활동 요약 뷰 (기존 users 구조 반영)
CREATE VIEW user_activity_summary AS
SELECT 
    u.id as user_id,
    u.name as user_name,
    COALESCE(u.department, 'Unknown') as department,
    COUNT(l.*) as total_activities,
    COUNT(CASE WHEN l.action_type = 'lesson_complete' THEN 1 END) as lessons_completed,
    COUNT(CASE WHEN l.action_type = 'lesson_uncomplete' THEN 1 END) as lessons_uncompleted,
    COUNT(CASE WHEN l.action_type = 'page_view' THEN 1 END) as page_views,
    COUNT(CASE WHEN l.action_type = 'user_register' THEN 1 END) as registrations,
    COUNT(CASE WHEN l.action_type LIKE '%error%' THEN 1 END) as errors,
    MIN(l.created_at) as first_activity,
    MAX(l.created_at) as last_activity,
    COUNT(DISTINCT DATE(l.created_at)) as active_days
FROM users u
LEFT JOIN user_activity_logs l ON u.id = l.user_id
GROUP BY u.id, u.name, u.department
ORDER BY total_activities DESC;

-- 7. 일별 활동 통계 뷰
CREATE VIEW daily_activity_stats AS
SELECT 
    DATE(created_at) as activity_date,
    action_type,
    COUNT(*) as count,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(DISTINCT session_id) as unique_sessions
FROM user_activity_logs
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at), action_type
ORDER BY activity_date DESC, count DESC;

-- 8. 에러 로그 분석 뷰
CREATE VIEW error_logs AS
SELECT 
    l.id,
    l.user_id,
    u.name as user_name,
    u.department,
    l.action_type,
    l.action_target,
    l.action_details->>'error' as error_message,
    l.action_details->>'context' as error_context,
    l.action_details->>'duration_ms' as duration_ms,
    l.session_id,
    l.created_at
FROM user_activity_logs l
LEFT JOIN users u ON l.user_id = u.id
WHERE l.action_type IN ('error_occurred', 'api_error', 'validation_error')
ORDER BY l.created_at DESC;

-- 9. 성능 로그 분석 뷰
CREATE VIEW performance_logs AS
SELECT 
    l.id,
    l.user_id,
    u.name as user_name,
    l.action_target as operation,
    (l.action_details->>'duration_ms')::numeric as duration_ms,
    l.action_details->>'operation' as operation_type,
    l.session_id,
    l.created_at
FROM user_activity_logs l
LEFT JOIN users u ON l.user_id = u.id
WHERE l.action_type = 'performance_log'
    AND l.action_details ? 'duration_ms'
ORDER BY l.created_at DESC;

-- 10. 학습 진도 관련 로그 뷰
CREATE VIEW learning_activity_logs AS
SELECT 
    l.id,
    l.user_id,
    u.name as user_name,
    u.department,
    l.action_type,
    l.action_target,
    l.action_details->>'lessonId' as lesson_id,
    l.action_details->>'courseId' as course_id,
    l.action_details->>'completed' as completed,
    l.session_id,
    l.created_at
FROM user_activity_logs l
LEFT JOIN users u ON l.user_id = u.id
WHERE l.action_type IN ('lesson_complete', 'lesson_uncomplete', 'progress_update', 'course_enroll', 'course_unenroll')
ORDER BY l.created_at DESC;

-- 11. 로그 정리 함수 (30일 이상 된 로그 삭제)
CREATE OR REPLACE FUNCTION cleanup_old_logs()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- 30일 이상 된 로그 삭제
    DELETE FROM user_activity_logs 
    WHERE created_at < NOW() - INTERVAL '30 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- 정리 작업 로그 남기기
    INSERT INTO user_activity_logs (action_type, action_target, action_details, created_at)
    VALUES (
        'system_maintenance',
        'log_cleanup',
        jsonb_build_object(
            'operation', 'cleanup_old_logs',
            'deleted_count', deleted_count,
            'retention_days', 30,
            'executed_at', NOW()
        ),
        NOW()
    );
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 12. 로그 통계 함수
CREATE OR REPLACE FUNCTION get_log_stats(
    p_user_id BIGINT DEFAULT NULL,
    p_days INTEGER DEFAULT 7
)
RETURNS TABLE(
    total_logs BIGINT,
    unique_users BIGINT,
    unique_sessions BIGINT,
    error_count BIGINT,
    error_rate NUMERIC,
    most_active_user TEXT,
    most_common_action TEXT
) AS $$
BEGIN
    RETURN QUERY
    WITH stats AS (
        SELECT 
            COUNT(*) as total,
            COUNT(DISTINCT l.user_id) as users,
            COUNT(DISTINCT l.session_id) as sessions,
            COUNT(CASE WHEN l.action_type LIKE '%error%' THEN 1 END) as errors
        FROM user_activity_logs l
        WHERE (p_user_id IS NULL OR l.user_id = p_user_id)
          AND l.created_at >= NOW() - (p_days || ' days')::INTERVAL
    ),
    top_user AS (
        SELECT u.name
        FROM user_activity_logs l
        JOIN users u ON l.user_id = u.id
        WHERE (p_user_id IS NULL OR l.user_id = p_user_id)
          AND l.created_at >= NOW() - (p_days || ' days')::INTERVAL
        GROUP BY u.id, u.name
        ORDER BY COUNT(*) DESC
        LIMIT 1
    ),
    top_action AS (
        SELECT l.action_type
        FROM user_activity_logs l
        WHERE (p_user_id IS NULL OR l.user_id = p_user_id)
          AND l.created_at >= NOW() - (p_days || ' days')::INTERVAL
        GROUP BY l.action_type
        ORDER BY COUNT(*) DESC
        LIMIT 1
    )
    SELECT 
        s.total,
        s.users,
        s.sessions,
        s.errors,
        CASE WHEN s.total > 0 THEN ROUND((s.errors::NUMERIC / s.total) * 100, 2) ELSE 0 END,
        tu.name,
        ta.action_type
    FROM stats s
    CROSS JOIN top_user tu
    CROSS JOIN top_action ta;
END;
$$ LANGUAGE plpgsql;

-- 13. 생성 완료 확인
SELECT 
    'user_activity_logs 테이블이 성공적으로 생성되었습니다!' as status,
    (SELECT COUNT(*) FROM users) as total_users,
    'logging.js와 연동하여 사용하세요.' as next_step;