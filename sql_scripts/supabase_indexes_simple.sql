-- KNOU Tracking System - 간편 인덱스 생성 (한번에 실행 가능)
-- 🚀 이 스크립트는 전체를 한번에 실행할 수 있습니다
-- ⚠️ 주의: 실제 운영 중인 시스템에서는 CONCURRENTLY 버전을 권장합니다

-- 1. 기본 외래키 인덱스 (Basic Foreign Key Indexes)
CREATE INDEX IF NOT EXISTS idx_user_courses_user_id ON user_courses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_courses_course_id ON user_courses(course_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_lesson_id ON user_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lessons_course_id ON lessons(course_id);

-- 2. 복합 인덱스 (Composite Indexes)
CREATE INDEX IF NOT EXISTS idx_user_progress_composite ON user_progress(user_id, lesson_id);
CREATE INDEX IF NOT EXISTS idx_lessons_course_id_order ON lessons(course_id, lesson_order);
CREATE INDEX IF NOT EXISTS idx_user_courses_composite ON user_courses(user_id, course_id);

-- 3. 조건부 인덱스 (Conditional Indexes)
CREATE INDEX IF NOT EXISTS idx_user_progress_completed 
ON user_progress(user_id, lesson_id) 
WHERE completed = true;

-- 4. 인덱스 생성 확인
SELECT 
    indexname,
    tablename,
    indexdef
FROM pg_indexes 
WHERE tablename IN ('users', 'courses', 'lessons', 'user_courses', 'user_progress')
    AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- 성공 메시지
SELECT '✅ 모든 인덱스가 성공적으로 생성되었습니다!' as status;