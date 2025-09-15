/*
================================================================================
샘플 로그 데이터 삽입 스크립트
================================================================================

용도: 
- 로그 테이블 생성 후 테스트용 샘플 데이터 삽입
- 기존 사용자 데이터를 활용한 안전한 샘플 로그 생성
- 로깅 시스템 동작 확인 및 분석 뷰 테스트용

실행 시점:
- 02_create_log_table.sql 실행 완료 후
- 로깅 시스템 테스트 전
- 분석 뷰들의 정상 동작 확인이 필요할 때

주의사항:
- users 테이블에 데이터가 있어야 정상 실행됨
- 실행할 때마다 새로운 샘플 로그가 추가됨
- 테스트 환경에서만 사용 권장 (운영 환경에서는 선택적 사용)

================================================================================
*/

-- 기존 사용자 데이터 확인 후 안전하게 샘플 로그 삽입
DO $$
DECLARE
    user_count INTEGER;
    first_user_id BIGINT;
    sample_session_id TEXT;
BEGIN
    -- 사용자 수 확인
    SELECT COUNT(*) INTO user_count FROM users;
    
    IF user_count = 0 THEN
        RAISE NOTICE '⚠️ 사용자 데이터가 없습니다. 먼저 사용자를 생성해주세요.';
    ELSE
        -- 첫 번째 사용자 ID 가져오기
        SELECT id INTO first_user_id FROM users ORDER BY id LIMIT 1;
        
        -- 세션 ID 생성
        sample_session_id := 'sample_session_' || extract(epoch from now())::text;
        
        RAISE NOTICE '✅ 사용자 데이터 확인: % 명의 사용자가 있습니다. 첫 번째 사용자 ID: %', user_count, first_user_id;
        
        -- 안전하게 샘플 로그 삽입 (실제 존재하는 사용자 ID 사용)
        INSERT INTO user_activity_logs (user_id, action_type, action_target, action_details, session_id) 
        VALUES
        -- 시스템 초기화 로그
        (first_user_id, 'system_init', 'logging_system', 
         jsonb_build_object(
             'test', true, 
             'version', '1.0',
             'existing_users', user_count,
             'setup_type', 'sample_data'
         ), sample_session_id),
        
        -- 페이지 뷰 로그
        (first_user_id, 'page_view', 'dashboard', 
         jsonb_build_object(
             'page', 'dashboard', 
             'load_time_ms', 150,
             'referrer', 'direct'
         ), sample_session_id),
        
        -- 학습 활동 로그
        (first_user_id, 'lesson_complete', 'lesson_1', 
         jsonb_build_object(
             'lessonId', 1,
             'courseId', 1,
             'completed', true,
             'duration_ms', 2500
         ), sample_session_id),
        
        -- 성능 로그
        (first_user_id, 'performance_log', 'dashboard_load', 
         jsonb_build_object(
             'operation', 'dashboard_render',
             'duration_ms', 145,
             'data_size', 1024
         ), sample_session_id),
        
        -- 익명 시스템 로그 (user_id NULL)
        (NULL, 'system_init', 'sample_data_inserted', 
         jsonb_build_object(
             'anonymous', true,
             'sample_logs_count', 5,
             'insertion_time', NOW()
         ), 'system_' || sample_session_id);
        
        RAISE NOTICE '✅ 샘플 로그 5개가 성공적으로 삽입되었습니다.';
    END IF;
END $$;

-- 삽입된 샘플 로그 확인
SELECT 
    l.id,
    l.user_id,
    u.name as user_name,
    l.action_type,
    l.action_target,
    l.created_at
FROM user_activity_logs l
LEFT JOIN users u ON l.user_id = u.id
ORDER BY l.created_at DESC
LIMIT 10;