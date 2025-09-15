/*
================================================================================
대시보드 성능 최적화 함수 (선택사항)
================================================================================

용도: 
- 대시보드 로딩 속도 극대화
- 복잡한 JOIN 쿼리를 단일 함수 호출로 대체
- 사용자가 많을 때 성능 향상

실행 시점:
- 사용자가 100명 이상으로 증가했을 때
- 대시보드 로딩이 3초 이상 걸릴 때
- 성능 최적화가 필요할 때

주의사항:
- 선택사항이므로 실행하지 않아도 시스템은 정상 작동
- 복잡한 함수이므로 PostgreSQL 지식 필요
- 테스트 환경에서 먼저 검증 후 운영 적용 권장

================================================================================
*/

-- 대시보드 데이터를 한 번에 가져오는 최적화 함수
CREATE OR REPLACE FUNCTION get_dashboard_summary()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    -- 사용자별 진도 요약을 한 번의 쿼리로 계산
    WITH user_progress_summary AS (
        SELECT 
            u.id as user_id,
            u.name as user_name,
            u.department,
            u.created_at as user_created_at,
            
            -- 각 사용자의 수강 과목별 진도 계산
            COALESCE(
                JSON_AGG(
                    JSON_BUILD_OBJECT(
                        'courseId', c.id,
                        'courseCode', c.course_code,
                        'courseName', c.course_name,
                        'progress', COALESCE(
                            ROUND(
                                (COUNT(CASE WHEN up.completed = true THEN 1 END)::NUMERIC / 
                                 NULLIF(COUNT(l.id), 0)) * 100, 0
                            ), 0
                        )
                    ) ORDER BY c.course_name
                ) FILTER (WHERE c.id IS NOT NULL), 
                '[]'::JSON
            ) as course_progress,
            
            -- 전체 진도율 계산
            COALESCE(
                ROUND(
                    (COUNT(CASE WHEN up.completed = true THEN 1 END)::NUMERIC / 
                     NULLIF(COUNT(l.id), 0)) * 100, 0
                ), 0
            ) as overall_progress
            
        FROM users u
        LEFT JOIN user_courses uc ON u.id = uc.user_id
        LEFT JOIN courses c ON uc.course_id = c.id
        LEFT JOIN lessons l ON c.id = l.course_id
        LEFT JOIN user_progress up ON u.id = up.user_id AND l.id = up.lesson_id
        GROUP BY u.id, u.name, u.department, u.created_at
    )
    
    -- 최종 결과 JSON 구성
    SELECT JSON_BUILD_OBJECT(
        'users', JSON_AGG(
            JSON_BUILD_OBJECT(
                'id', user_id,
                'name', user_name,
                'department', department,
                'created_at', user_created_at
            ) ORDER BY user_name
        ),
        'progressSummary', JSON_AGG(
            JSON_BUILD_OBJECT(
                'userId', user_id,
                'userName', user_name,
                'department', department,
                'overallProgress', overall_progress,
                'courseProgress', course_progress
            ) ORDER BY overall_progress DESC
        ),
        'generated_at', NOW(),
        'total_users', COUNT(*)
    )
    INTO result
    FROM user_progress_summary;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 함수 사용 권한 설정
GRANT EXECUTE ON FUNCTION get_dashboard_summary() TO anon;
GRANT EXECUTE ON FUNCTION get_dashboard_summary() TO authenticated;

-- 함수 테스트
SELECT get_dashboard_summary();

-- 성능 분석 (실행 계획 확인)
EXPLAIN (ANALYZE, BUFFERS) SELECT get_dashboard_summary();