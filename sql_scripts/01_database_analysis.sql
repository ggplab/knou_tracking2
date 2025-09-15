/*
================================================================================
데이터베이스 구조 분석 스크립트
================================================================================

용도: 
- 기존 Supabase 데이터베이스의 구조를 파악할 때 사용
- 새로운 환경에서 테이블 구조를 확인할 때 사용
- 로그 테이블 생성 전 기존 스키마 분석용

실행 시점:
- 새로운 Supabase 프로젝트에 로깅 시스템을 추가할 때
- 기존 테이블 구조가 변경되었을 때 재확인용
- 다른 개발자가 프로젝트에 참여할 때 구조 파악용

================================================================================
*/

-- 1. 기본 테이블 목록 확인
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 2. users 테이블 구조 확인
SELECT 
    column_name, 
    data_type, 
    character_maximum_length,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. 주요 테이블들의 데이터 개수 확인
SELECT 
    'users' as table_name, COUNT(*) as row_count FROM users
UNION ALL
SELECT 'courses' as table_name, COUNT(*) as row_count FROM courses
UNION ALL  
SELECT 'lessons' as table_name, COUNT(*) as row_count FROM lessons
UNION ALL
SELECT 'user_courses' as table_name, COUNT(*) as row_count FROM user_courses
UNION ALL
SELECT 'user_progress' as table_name, COUNT(*) as row_count FROM user_progress;

-- 4. users 테이블 샘플 데이터 확인
SELECT id, name, department, created_at 
FROM users 
ORDER BY id 
LIMIT 5;

-- 5. 기존 외래키 제약조건 확인
SELECT
    tc.table_name, 
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;