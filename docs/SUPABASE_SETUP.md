# KNOU Tracking System - Supabase 연동 가이드

## 📋 개요

이 가이드는 방송통신대 학습 진도 관리 시스템을 Supabase 데이터베이스와 연동하는 방법을 설명합니다.

## 🚀 시작하기 전에

### 1. Supabase 프로젝트 생성
1. [Supabase](https://supabase.com)에서 계정 생성
2. 새 프로젝트 생성
3. 데이터베이스 비밀번호 설정

### 2. 데이터베이스 테이블 생성

Supabase SQL Editor에서 다음 스크립트를 실행하세요:

```sql
-- Users 테이블
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    department VARCHAR(50) DEFAULT '통계·데이터',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Courses 테이블 (수강과목들의 정보)
CREATE TABLE courses (
    id BIGSERIAL PRIMARY KEY,
    course_code VARCHAR(10) NOT NULL UNIQUE,
    course_name VARCHAR(200) NOT NULL,
    department VARCHAR(50) NOT NULL,
    grade INTEGER DEFAULT 1,
    lesson_count INTEGER DEFAULT 15,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lessons 테이블 (수강목록)
CREATE TABLE lessons (
    id BIGSERIAL PRIMARY KEY,
    course_id BIGINT REFERENCES courses(id) ON DELETE CASCADE,
    lesson_name VARCHAR(200) NOT NULL,
    lesson_order INTEGER NOT NULL
);

-- User Courses 테이블 (수강신청)
CREATE TABLE user_courses (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    course_id BIGINT REFERENCES courses(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, course_id)
);

-- User Progress 테이블 (학습진도)
CREATE TABLE user_progress (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    lesson_id BIGINT REFERENCES lessons(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, lesson_id)
);
```

### 3. Row Level Security (RLS) 설정

보안을 위해 다음 정책을 설정하세요:

```sql
-- 모든 테이블에 대해 RLS 활성화
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;  
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- 읽기/쓰기 권한 부여 (현재는 모든 사용자에게 권한 부여)
-- 실제 운영환경에서는 더 엄격한 정책 적용 권장

CREATE POLICY "Allow all operations" ON users FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON courses FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON lessons FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON user_courses FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON user_progress FOR ALL USING (true);
```

### 4. 2025년 2학기 실제 과목 데이터 삽입

#### 기존 더미 데이터 삭제

```sql
-- 기존 course 테이블 데이터 모두 삭제
DELETE FROM courses;
```

#### 2025년 2학기 통계·데이터과학과 및 컴퓨터과학과 실제 과목 삽입

```sql
-- 2025년 2학기 실제 과목 데이터 삽입 (knou_2025_02.csv 기반)
INSERT INTO courses (course_code, course_name, department, grade, lesson_count, course_type, subject_category) VALUES
-- 통계·데이터과학과 1학년
('124', '인간과과학', '통계·데이터', 1, 15, '출석수업', '교양'),
('171', '대학영어', '통계·데이터', 1, 15, '-', '교양'),
('173', '심리학에게묻다', '통계·데이터', 1, 15, '-', '교양'),
('500', '원격대학교육의이해', '통계·데이터', 1, 7, '웹 강의', '교양'),
('35101', '통계로세상읽기', '통계·데이터', 1, 15, '비대면 수업', '전공'),
('35105', '데이터과학개론', '통계·데이터', 1, 15, '-', '전공'),
('35106', '파이썬컴퓨팅', '통계·데이터', 1, 15, '비대면 수업', '전공'),

-- 통계·데이터과학과 2학년
('106', '철학의이해', '통계·데이터', 2, 15, '-', '교양'),
('201', '대학수학의이해', '통계·데이터', 2, 15, '비대면 수업', '교양'),
('35227', '여론조사의이해', '통계·데이터', 2, 15, '-', '전공'),
('35301', '파이썬과 R', '통계·데이터', 2, 15, '비대면 수업', '전공'),
('35457', '빅데이터의이해와활용', '통계·데이터', 2, 15, '-', '전공'),
('43211', '경제학의이해', '통계·데이터', 2, 15, '-', '교양'),

-- 통계·데이터과학과 3학년
('21151', '생활법률', '통계·데이터', 3, 15, '-', '교양'),
('35302', '파이썬데이터처리', '통계·데이터', 3, 15, '-', '전공'),
('35313', '표본조사론', '통계·데이터', 3, 15, '비대면 수업', '전공'),
('35329', '바이오통계학', '통계·데이터', 3, 15, '-', '전공'),
('35424', '실험계획과응용', '통계·데이터', 3, 15, '비대면 수업', '전공'),
('35455', '수리통계학', '통계·데이터', 3, 15, '비대면 수업', '전공'),

-- 통계·데이터과학과 4학년
('476', '이슈로보는오늘날의유럽', '통계·데이터', 4, 15, '-', '교양'),
('24455', '마케팅조사', '통계·데이터', 4, 15, '-', '전공'),
('35402', '비정형데이터분석', '통계·데이터', 4, 15, '비대면 수업', '전공'),
('35458', 'R데이터분석', '통계·데이터', 4, 15, '비대면 수업', '전공'),
('35460', '베이즈데이터분석', '통계·데이터', 4, 15, '-', '전공'),
('35461', '자연언어처리', '통계·데이터', 4, 15, '-', '전공'),

-- 컴퓨터과학과 1학년
('26103', '대중영화의이해', '컴퓨터', 1, 15, '-', '일반선택'),
('34204', '컴퓨터과학 개론', '컴퓨터', 1, 15, '대면 수업', '전공'),
('34205', '멀티미디어시스템', '컴퓨터', 1, 15, '-', '전공'),
('34308', 'C프로그래밍', '컴퓨터', 1, 15, '비대면 수업', '전공'),

-- 컴퓨터과학과 2학년
('34206', '오픈소스기반데이터분석', '컴퓨터', 2, 15, '-', '전공'),
('34310', '자료구조', '컴퓨터', 2, 15, '대면 수업', '전공'),
('34353', '선형대수', '컴퓨터', 2, 15, '대면 수업', '전공'),
('34354', '프로그래밍언어론', '컴퓨터', 2, 15, '-', '전공'),

-- 컴퓨터과학과 3학년
('34309', '컴퓨터구조', '컴퓨터', 3, 15, '비대면 수업', '전공'),
('34372', 'JSP프로그래밍', '컴퓨터', 3, 15, '비대면 수업', '전공'),
('34373', 'UNIX시스템', '컴퓨터', 3, 15, '-', '전공'),
('34417', '시뮬레이션', '컴퓨터', 3, 15, '-', '전공'),
('34478', '머신러닝', '컴퓨터', 3, 15, '비대면 수업', '전공'),

-- 컴퓨터과학과 4학년
('24313', '경영전략론', '컴퓨터', 4, 15, '-', '일반선택'),
('34401', '클라우드컴퓨팅', '컴퓨터', 4, 15, '비대면 수업', '전공'),
('34418', '컴파일러구성', '컴퓨터', 4, 15, '비대면 수업', '전공'),
('34479', '딥러닝', '컴퓨터', 4, 15, '비대면 수업', '전공'),
('43312', '성,사랑,사회', '컴퓨터', 4, 15, '-', '교양')

#### 강의 정보 하드코딩(lesson)

```sql
 -- 모든 lessons 테이블 데이터 삭제 (깨끗하게 시작)
  DELETE FROM lessons WHERE course_id BETWEEN 94 AND 136;

  -- 깨끗한 강의 데이터 재생성
  DO $$
  DECLARE
      course_record RECORD;
      lesson_count INT;
      i INT;
  BEGIN
      -- 과목 ID 94~136 범위의 모든 과목에 대해 반복
      FOR course_record IN
          SELECT id, course_name, course_code,
                 CASE
                     WHEN course_name LIKE '%원격대학교육의이해%' THEN 7
                     ELSE 15
                 END as lesson_count
          FROM courses
          WHERE id BETWEEN 94 AND 136
          ORDER BY id
      LOOP
          -- 각 과목의 강의 수만큼 반복 (간단한 강의명)
          FOR i IN 1..course_record.lesson_count LOOP
              INSERT INTO lessons (course_id, lesson_name, lesson_order)
              VALUES (
                  course_record.id,
                  i || '강',  -- 단순히 "1강", "2강", "3강" 형태
                  i
              );
          END LOOP;

          RAISE NOTICE '과목: % (ID: %) - %개 강의 생성 완료',
                       course_record.course_name,
                       course_record.id,
                       course_record.lesson_count;
      END LOOP;
END;
$$;
```

-- 강의 자동 생성 (각 과목별로)
INSERT INTO lessons (course_id, lesson_name, lesson_order)
SELECT 
    c.id,
    generate_series || '강: ' || c.course_name || ' ' || generate_series || '강',
    generate_series
FROM courses c
CROSS JOIN generate_series(1, c.lesson_count);

-- 실제 사용자 데이터 및 수강 과목 등록
INSERT INTO users (name, department) VALUES
('임정', '통계·데이터'),
('최관수', '컴퓨터'),
('김서현', '컴퓨터'),
('김희주', '컴퓨터');

-- 사용자별 수강 과목 등록
-- 임정 (통계데이터과학과)
INSERT INTO user_courses (user_id, course_id)
SELECT 
    u.id,
    c.id
FROM users u, courses c
WHERE u.name = '임정' 
AND c.course_name IN ('원격대학교육의이해', '바이오통계학', '수리통계학', '선형대수', '자료구조');

-- 최관수 (컴퓨터과학과)
INSERT INTO user_courses (user_id, course_id)
SELECT 
    u.id,
    c.id
FROM users u, courses c
WHERE u.name = '최관수' 
AND c.course_name IN ('시뮬레이션', '컴파일러구성', 'C프로그래밍', '오픈소스기반데이터분석', '프로그래밍언어론');

-- 김서현 (컴퓨터과학과)
INSERT INTO user_courses (user_id, course_id)
SELECT 
    u.id,
    c.id
FROM users u, courses c
WHERE u.name = '김서현' 
AND c.course_name IN ('컴파일러구성', '선형대수', '클라우드컴퓨팅');

-- 김희주 (컴퓨터과학과)
INSERT INTO user_courses (user_id, course_id)
SELECT 
    u.id,
    c.id
FROM users u, courses c
WHERE u.name = '김희주' 
AND c.course_name IN ('원격대학교육의이해', '자료구조', '컴퓨터구조', '선형대수', '머신러닝', '수리통계학');
```

#### 데이터 확인

```sql
-- 삽입된 데이터 확인
SELECT 
  course_name, 
  course_code, 
  department, 
  grade, 
  subject_category,
  lesson_count,
  course_type
FROM courses 
ORDER BY department, grade, course_code;

-- 학과별 과목 수 확인
SELECT 
  department,
  grade,
  COUNT(*) as course_count
FROM courses 
GROUP BY department, grade
ORDER BY department, grade;

-- 전체 과목 수 확인
SELECT 
  '총 과목 수' as category,
  COUNT(*) as count
FROM courses
UNION ALL
SELECT 
  '통계·데이터과학과',
  COUNT(*)
FROM courses 
WHERE department = '통계·데이터'
UNION ALL
SELECT 
  '컴퓨터과학과',
  COUNT(*)
FROM courses 
WHERE department = '컴퓨터';

-- 사용자별 수강 과목 확인
SELECT 
  u.name,
  u.department,
  c.course_name,
  c.grade,
  c.lesson_count
FROM users u
JOIN user_courses uc ON u.id = uc.user_id
JOIN courses c ON uc.course_id = c.id
ORDER BY u.name, c.grade, c.course_name;

-- 사용자별 수강 과목 수 확인
SELECT 
  u.name,
  u.department,
  COUNT(*) as enrolled_courses
FROM users u
JOIN user_courses uc ON u.id = uc.user_id
GROUP BY u.id, u.name, u.department
ORDER BY u.name;
```

#### 데이터 특이사항

**1. 과목 관리**
- 공통 과목은 제거하고 각 학과별로 개별 관리
- 중복 과목명은 학과별로 별도 레코드로 저장

**2. 수업수 분류**
- **7강**: 원격대학교육의이해만 해당
- **15강**: 나머지 모든 과목

**3. 과목 분류**
- **교양**: 일반교양 과목
- **전공**: 각 학과 전문 과목  
- **일반선택**: 타 학과 과목 중 선택 가능

**4. 수업 유형**
- **웹 강의**: 온라인 강의
- **대면 수업**: 출석 수업
- **비대면 수업**: 실시간 온라인 수업
- **출석수업**: 오프라인 출석 수업
- **-**: 일반 온라인 강의

**5. 실제 사용자 데이터**
- **임정** (통계·데이터): 5개 과목 수강
- **최관수** (컴퓨터): 5개 과목 수강
- **김서현** (컴퓨터): 3개 과목 수강
- **김희주** (컴퓨터): 6개 과목 수강

**6. 크로스 학과 수강**
- 컴퓨터과학과 학생이 통계·데이터과학과 과목(수리통계학) 수강 가능

## ⚙️ 프로젝트 설정

### 1. Supabase 연결 정보 설정

`frontend/src/config.js` 파일에서 다음 값들을 업데이트하세요:

```javascript
// Supabase 프로젝트 설정
this.SUPABASE_URL = 'https://your-project-id.supabase.co';
this.SUPABASE_ANON_KEY = 'your-anon-key';
```

### 2. 연결 정보 확인하기

Supabase 프로젝트 대시보드에서:
1. **Settings** → **API** 페이지로 이동
2. **Project URL**을 복사하여 `SUPABASE_URL`에 입력
3. **anon public key**를 복사하여 `SUPABASE_ANON_KEY`에 입력

### 3. 환경별 설정 (권장)

**개발환경:**
```javascript
// config.js
const isDevelopment = window.location.hostname === 'localhost';

this.SUPABASE_URL = isDevelopment 
    ? 'http://localhost:54321'  // 로컬 Supabase (선택사항)
    : 'https://your-project.supabase.co';
```

**운영환경:**
- 환경변수나 별도의 설정 파일 사용 권장
- API 키는 절대 소스코드에 하드코딩하지 말 것

## 🔄 시스템 작동 방식

### Fallback 메커니즘

시스템은 다음과 같은 우선순위로 작동합니다:

1. **Supabase 모드**: 설정이 올바르고 연결이 성공하면 Supabase 사용
2. **LocalStorage 모드**: Supabase 연결 실패 시 자동으로 LocalStorage로 폴백

### 데이터 동기화

- Supabase 모드에서는 모든 데이터가 실시간으로 데이터베이스에 저장됩니다
- LocalStorage 모드에서는 브라우저 로컬 스토리지에 데이터가 저장됩니다

## 🐛 문제 해결

### 연결 테스트

브라우저 개발자 도구 콘솔에서 다음을 확인하세요:

```javascript
// 성공한 경우
✅ Supabase 클라이언트 초기화 완료
✅ Supabase 연결 성공
✅ Supabase 모드로 실행

// 실패한 경우  
❌ Supabase 연결 실패
⚠️ LocalStorage로 폴백합니다...
📦 LocalStorage 모드로 실행
```

### 일반적인 문제들

**1. CORS 오류**
- Supabase 프로젝트 설정에서 허용된 도메인 확인
- localhost 개발 시에는 보통 자동으로 허용됨

**2. 테이블 접근 오류**
- RLS 정책이 올바르게 설정되었는지 확인
- 테이블명이 정확한지 확인 (대소문자 구분)

**3. API 키 오류**
- anon key가 올바른지 확인
- service_role key는 사용하지 말 것 (보안상 위험)

## 📊 데이터베이스 모니터링

Supabase 대시보드에서 다음을 모니터링할 수 있습니다:

1. **Table Editor**: 데이터 직접 확인/수정
2. **SQL Editor**: 복잡한 쿼리 실행
3. **API Logs**: 요청/응답 로그 확인
4. **Database**: 성능 및 사용량 모니터링

## 🔒 보안 고려사항

### 데이터 보호
- RLS 정책을 통한 행 레벨 보안
- API 키는 환경변수로 관리
- HTTPS 연결 강제 사용

### 접근 제어
현재는 모든 사용자에게 전체 권한을 부여하고 있습니다. 실제 운영 시에는:

```sql
-- 사용자별 데이터 접근 제한 예시
CREATE POLICY "Users can only see their own data" 
ON user_progress 
FOR ALL 
USING (user_id = auth.uid());
```

## 📈 성능 최적화

### 인덱스 생성
자주 사용되는 쿼리에 대해 인덱스를 생성하세요:

```sql
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_lesson_id ON user_progress(lesson_id);
CREATE INDEX idx_lessons_course_id ON lessons(course_id);
CREATE INDEX idx_user_courses_user_id ON user_courses(user_id);
```

### 연결 풀링
- Supabase는 자동으로 연결 풀링을 관리합니다
- 과도한 동시 연결을 피하세요

## 🚀 배포 가이드

### 1. 환경 변수 설정
```bash
# .env 파일 (절대 커밋하지 말 것)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 2. 빌드 설정
```javascript
// vite.config.js 예시
export default defineConfig({
  define: {
    'process.env': {
      VITE_SUPABASE_URL: JSON.stringify(process.env.VITE_SUPABASE_URL),
      VITE_SUPABASE_ANON_KEY: JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY)
    }
  }
});
```

### 3. 배포 후 확인사항
- [ ] 데이터베이스 연결 테스트
- [ ] CRUD 기능 테스트
- [ ] 에러 로그 모니터링
- [ ] 성능 측정

---

## 📞 지원

문제가 발생하거나 질문이 있으시면:

1. 브라우저 개발자 도구 콘솔 확인
2. Supabase 대시보드 로그 확인  
3. 이슈 리포트 작성 시 에러 메시지 포함

**성공적인 Supabase 연동을 위해 이 가이드를 차근차근 따라해보세요! 🎉**