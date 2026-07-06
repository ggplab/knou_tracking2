# CLAUDE.MD - 방송통신대 수업 트래킹 시스템

## 프로젝트 개요
방송통신대 학생들의 개인 수업 진도를 체계적으로 추적하고 시각화하는 웹 애플리케이션

### 핵심 가치
- **유지보수성**: 명확한 구조와 타입 안정성
- **기능 중심**: 핵심 진도 추적에 집중한 단순한 구조
- **UX 우선**: 직관적이고 반응적인 인터페이스

## 기술 스택 (당초 계획 — 미구현)

> ⚠️ 아래 스택은 초기 설계안이고 실제 구현과 다르다. **현행 구현은 정적 HTML/JS + localStorage** — "현재 구현 상태" 섹션이 실상 기준. 이 섹션은 향후 마이그레이션 시 참고용으로만 남긴다.

### Frontend
- **Framework**: React 18+ with TypeScript
- **UI Library**: TailwindCSS + shadcn/ui
- **Charts**: Recharts
- **State Management**: React Context + useReducer
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: SQLite + Prisma ORM
- **Validation**: Zod

### 도구
- **배포**: Vercel (Frontend) + Railway (Backend)
- **패키지 관리**: pnpm
- **번들링**: Vite
- **코드 품질**: Prettier + ESLint + TypeScript

## 데이터베이스 스키마

```prisma
model User {
  id        Int      @id @default(autoincrement())
  name      String   @unique
  createdAt DateTime @default(now())

  userCourses UserCourse[]
  progress    UserProgress[]
}

model Course {
  id         Int      @id @default(autoincrement())
  courseName String
  courseCode String   @unique
  createdAt  DateTime @default(now())

  lessons     Lesson[]
  userCourses UserCourse[]
}

model Lesson {
  id          Int    @id @default(autoincrement())
  courseId    Int
  lessonName  String
  lessonOrder Int

  course   Course         @relation(fields: [courseId], references: [id])
  progress UserProgress[]
}

model UserCourse {
  id         Int      @id @default(autoincrement())
  userId     Int
  courseId   Int
  enrolledAt DateTime @default(now())

  user   User   @relation(fields: [userId], references: [id])
  course Course @relation(fields: [courseId], references: [id])

  @@unique([userId, courseId])
}

model UserProgress {
  id          Int       @id @default(autoincrement())
  userId      Int
  lessonId    Int
  completed   Boolean   @default(false)
  completedAt DateTime?

  user   User   @relation(fields: [userId], references: [id])
  lesson Lesson @relation(fields: [lessonId], references: [id])

  @@unique([userId, lessonId])
}
```

## 주요 기능

### 1. 통합 대시보드 (/)
- 학생별 진도율 카드 그리드
- 실시간 진도율 및 순위 표시
- 반응형 카드 레이아웃

### 2. 개인 학습 현황 (/student/[id])
- 진도율 차트 (Recharts)
- 과목별 강의 체크박스
- 실시간 진도 업데이트

### 3. 관리 페이지 (/admin)
- 사용자 관리 (추가/수정/삭제)
- 과목/강의 관리
- 수강 과목 할당

## API 엔드포인트

```typescript
// 사용자
GET    /api/users
POST   /api/users
GET    /api/users/:id
PUT    /api/users/:id
DELETE /api/users/:id

// 과목
GET    /api/courses
POST   /api/courses
GET    /api/courses/:id/lessons
POST   /api/lessons

// 진도
GET    /api/users/:id/progress
POST   /api/progress
GET    /api/users/:id/courses
POST   /api/users/:id/courses
DELETE /api/users/:id/courses/:courseId

// 대시보드
GET    /api/dashboard/overview
GET    /api/users/:id/stats
GET    /api/admin/stats
```

## 현재 구현 상태 (2025-09-04)

### 완료된 기능
- ✅ HTML/CSS/JS 기반 클라이언트 앱
- ✅ localStorage 데이터 저장
- ✅ 대시보드 (학생별 진도율 카드)
- ✅ 학생 상세 페이지 (과목별 체크박스)
- ✅ 관리자 기능 (학생/과목 관리)
- ✅ 신규 사용자 등록
- ✅ 실제 방송통신대 데이터 반영 (56개 과목)
- ✅ 반응형 디자인

### 프로젝트 구조
```
knou_tracking2/
├── frontend/
│   ├── public/
│   │   └── index.html          # 메인 HTML
│   └── src/
│       ├── styles.css          # 스타일시트
│       ├── data.js            # 데이터 관리
│       └── app.js             # 메인 로직
├── reset_data.html            # 데이터 초기화
└── CLAUDE.md                 # 프로젝트 문서
```

### 배포 방법
1. **GitHub Pages**: frontend/public 폴더 선택
2. **Netlify**: frontend/public 폴더 드래그 앤 드롭
3. **로컬**: `python -m http.server 8000` (frontend/public에서)

### 브라우저 호환성
- ✅ Chrome, Firefox, Safari, Edge (최신)
- ✅ 모바일 브라우저
- ⚠️ IE 미지원 (ES6+ 사용)

## 개발 규칙

### Git 브랜치
```
main              # 운영
├── develop       # 개발
├── feature/*     # 기능
├── bugfix/*      # 수정
└── hotfix/*      # 긴급
```

### 커밋 메시지
```
feat: 새 기능
fix: 버그 수정
docs: 문서
style: 포맷팅
refactor: 리팩토링
test: 테스트
chore: 빌드/도구
```

### 성능 목표
- 페이지 로딩: 1초 이내
- 반응성: 100ms 이내 피드백
- 가용성: 99.9% 업타임

## 향후 확장
- 백엔드 API 연동
- 사용자 인증
- 진도 통계/리포트
- 성적 관리
- 모바일 앱

## 주의사항
- localStorage 기반 (브라우저 데이터 삭제 시 손실)
- 다중 사용자 동기화 이슈 가능
- 대용량 데이터 성능 저하 가능성