# CLAUDE.MD - 방송통신대 수업 트래킹 시스템

## 프로젝트 개요

### 목적
방송통신대 학생들의 개인 수업 진도를 체계적으로 추적하고 시각화하는 웹 애플리케이션 개발

### 핵심 특징
- **개인 중심**: 개별 사용자의 학습 진도 관리에 집중
- **시각적 피드백**: 체크박스 클릭 즉시 진도율 업데이트
- **직관적 대시보드**: 개인 진도율을 차트와 프로그레스 바로 시각화
- **간단한 구조**: 복잡한 기능보다는 핵심 진도 관리에 집중한 구조
- **로그인 없음**: 신뢰할 수 있는 환경에서 누구나 사용 가능
- **현실적 과목 수**: 학기당 5개 과목으로 제한하여 현실성 반영

## 개발 철학 및 가치

### 🎯 핵심 가치
1. **유지보수 가능한 구조**
   - 명확한 폴더 구조와 컴포넌트 분리
   - 일관된 코딩 컨벤션
   - 문서화된 함수 및 컴포넌트
   - 재사용 가능한 모듈화된 코드

2. **기능에 충실한 구조**
   - 화려함보다는 실용성 우선
   - 핵심 기능(진도 추적)에 집중
   - 불필요한 복잡성 제거
   - 빠른 로딩과 반응성

3. **UX 우선의 편한 웹사이트**
   - 직관적인 인터페이스
   - 최소한의 클릭으로 원하는 기능 수행
   - 모바일 친화적 반응형 디자인
   - 명확한 피드백과 상태 표시

## 기술 스택 (개선된 버전)

### Frontend
- **Framework**: React 18+ with TypeScript
  - 컴포넌트 기반 개발로 유지보수성 향상
  - TypeScript로 타입 안정성 확보
- **UI Library**: TailwindCSS + shadcn/ui
  - 일관된 디자인 시스템
  - 접근성이 고려된 UI 컴포넌트
- **Charts**: Recharts
  - React 네이티브 차트 라이브러리
  - 반응형 차트 지원
- **State Management**: React Context + useReducer
  - 간단하고 예측 가능한 상태 관리
- **Icons**: Lucide React
  - 일관된 아이콘 세트

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
  - 가볍고 유연한 웹 프레임워크
- **Database**: SQLite + Prisma ORM
  - 파일 기반으로 배포 간소화
  - 타입 세이프한 데이터베이스 접근
- **Validation**: Zod
  - 런타임 타입 검증

### 배포 및 도구
- **배포**: Vercel (Frontend) + Railway (Backend)
- **패키지 관리**: pnpm
- **번들링**: Vite (개발 서버 + 빌드)
- **코드 포맷팅**: Prettier + ESLint

### 개발 도구
- **TypeScript**: 타입 안정성
- **ESLint + Prettier**: 코드 품질 관리
- **Husky**: Git hooks로 코드 품질 보장

## 프로젝트 구조

```
knou-tracker/
├── frontend/                   # React 프론트엔드
│   ├── src/
│   │   ├── components/         # 재사용 가능한 UI 컴포넌트
│   │   │   ├── ui/            # shadcn/ui 기본 컴포넌트
│   │   │   ├── dashboard/     # 대시보드 관련 컴포넌트
│   │   │   ├── progress/      # 진도 관련 컴포넌트
│   │   │   └── charts/        # 차트 컴포넌트
│   │   ├── pages/             # 페이지 컴포넌트
│   │   ├── hooks/             # 커스텀 훅
│   │   ├── context/           # Context API
│   │   ├── types/             # TypeScript 타입 정의
│   │   ├── utils/             # 유틸리티 함수
│   │   └── lib/               # 외부 라이브러리 설정
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
├── backend/                    # Express 백엔드
│   ├── src/
│   │   ├── routes/            # API 라우트
│   │   ├── controllers/       # 비즈니스 로직
│   │   ├── services/          # 데이터 서비스
│   │   ├── middleware/        # 미들웨어
│   │   ├── types/             # TypeScript 타입
│   │   └── utils/             # 유틸리티 함수
│   ├── prisma/
│   │   ├── schema.prisma      # 데이터베이스 스키마
│   │   └── seed.ts            # 초기 데이터
│   ├── package.json
│   └── tsconfig.json
└── shared/                     # 공통 타입 및 유틸
    ├── types/                 # 프론트엔드-백엔드 공통 타입
    └── constants/             # 공통 상수
```

## 데이터베이스 스키마 (Prisma)

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

## 주요 기능 명세

### 1. 통합 대시보드 페이지 (/) - **메인 페이지**

#### 컴포넌트 구조
```tsx
// Dashboard.tsx
├── DashboardHeader           # 페이지 제목 및 전체 통계
├── StudentProgressCards     # 학생별 진도율 카드 그리드
│   └── StudentCard         # 개별 학생 카드
│       ├── StudentInfo     # 이름, 순위, 배지
│       ├── OverallProgress # 전체 진도율 (큰 프로그레스)
│       └── CourseProgress  # 과목별 진도율 (작은 프로그레스들)
```

#### 기능
- **실시간 진도율**: 사용자 진도 변경 시 즉시 반영
- **순위 표시**: 전체 진도율 기준 자동 순위 계산
- **시각적 구분**: 색상으로 진도율 구간 구분
- **반응형 카드**: 화면 크기에 따라 자동 조정

### 2. 개인 학습 현황 페이지 (/student/[id])

#### 컴포넌트 구조
```tsx
// StudentDashboard.tsx
├── StudentHeader            # 학생 이름, 전체 진도율, 순위
├── ProgressOverview        # 진도율 차트와 주요 메트릭
│   ├── ProgressChart      # 도넛 차트 또는 선형 차트
│   └── StatsCards         # 완료 강의 수, 주간 학습 등
├── CourseProgressList     # 과목별 상세 진도
│   └── CourseAccordion    # 확장 가능한 과목별 강의 리스트
│       ├── CourseHeader   # 과목명, 진도율, 확장 버튼
│       └── LessonChecklist # 강의별 체크박스 (3열 그리드)
└── RecentActivity         # 최근 학습 활동 타임라인
```

#### 기능
- **진도율 차트**: Recharts로 시각화
- **과목 아코디언**: 확장/축소 상태 유지
- **실시간 체크박스**: 즉시 DB 업데이트 및 UI 반영
- **학습 타임라인**: 최근 완료한 강의들 시간순 표시

### 3. 관리 페이지 (/admin)

#### 컴포넌트 구조
```tsx
// AdminDashboard.tsx
├── AdminTabs               # 탭 기반 관리 인터페이스
│   ├── UserManagement     # 사용자 관리
│   │   ├── AddUserForm    # 새 사용자 추가 폼
│   │   └── UserList       # 사용자 목록 및 수정
│   ├── CourseManagement   # 과목/강의 관리
│   │   ├── AddLessonForm  # 새 강의 추가 폼
│   │   └── CourseTree     # 과목별 강의 트리
│   ├── EnrollmentManager  # 수강 과목 관리
│   │   ├── UserSelector   # 사용자 선택
│   │   ├── CurrentCourses # 현재 수강 과목
│   │   └── AvailableCourses # 추가 가능한 과목
│   └── SystemStats        # 시스템 현황 및 통계
```

#### 기능
- **드래그 앤 드롭**: 과목 할당 시 직관적 인터페이스
- **실시간 검증**: 폼 입력 시 즉시 유효성 검사
- **벌크 작업**: 여러 사용자에게 동시 과목 할당
- **데이터 시각화**: 시스템 전체 통계 차트

## API 설계

### RESTful API 엔드포인트

```typescript
// 사용자 관리
GET    /api/users              # 모든 사용자 목록
POST   /api/users              # 새 사용자 생성
GET    /api/users/:id          # 특정 사용자 정보
PUT    /api/users/:id          # 사용자 정보 수정
DELETE /api/users/:id          # 사용자 삭제

// 과목 및 강의
GET    /api/courses            # 모든 과목 목록
POST   /api/courses            # 새 과목 생성
GET    /api/courses/:id/lessons # 과목별 강의 목록
POST   /api/lessons            # 새 강의 추가

// 진도 관리
GET    /api/users/:id/progress # 사용자 전체 진도
POST   /api/progress           # 진도 업데이트
GET    /api/users/:id/courses  # 사용자 수강 과목
POST   /api/users/:id/courses  # 과목 등록
DELETE /api/users/:id/courses/:courseId # 과목 해제

// 통계 및 대시보드
GET    /api/dashboard/overview # 전체 대시보드 데이터
GET    /api/users/:id/stats    # 개인별 상세 통계
GET    /api/admin/stats        # 관리자용 시스템 통계
```

### TypeScript 타입 정의

```typescript
// shared/types/index.ts
export interface User {
  id: number;
  name: string;
  createdAt: string;
}

export interface Course {
  id: number;
  courseName: string;
  courseCode: string;
  createdAt: string;
}

export interface Lesson {
  id: number;
  courseId: number;
  lessonName: string;
  lessonOrder: number;
  course?: Course;
}

export interface UserProgress {
  id: number;
  userId: number;
  lessonId: number;
  completed: boolean;
  completedAt?: string;
  lesson?: Lesson;
}

export interface DashboardData {
  users: User[];
  progressSummary: {
    userId: number;
    userName: string;
    overallProgress: number;
    courseProgress: {
      courseId: number;
      courseName: string;
      progress: number;
    }[];
  }[];
}
```

## UI/UX 개선사항

### 디자인 시스템

#### 색상 팔레트
```css
:root {
  /* Primary Colors */
  --primary: 217 91% 60%;        /* #4A90E2 - 메인 브랜드 */
  --primary-foreground: 0 0% 98%; /* 흰색 텍스트 */
  
  /* Progress Colors */
  --progress-0: 0 0% 80%;        /* 회색 - 0% */
  --progress-25: 43 96% 56%;     /* 노란색 - 25% */
  --progress-50: 27 96% 61%;     /* 주황색 - 50% */
  --progress-75: 142 76% 36%;    /* 초록색 - 75% */
  --progress-100: 217 91% 60%;   /* 파란색 - 100% */
  
  /* Semantic Colors */
  --success: 142 76% 36%;        /* 성공 */
  --warning: 43 96% 56%;         /* 경고 */
  --destructive: 0 84% 60%;      /* 위험 */
  --muted: 210 40% 96%;          /* 회색 배경 */
}
```

#### 컴포넌트 가이드라인
```tsx
// 재사용 가능한 프로그레스 바 컴포넌트
interface ProgressBarProps {
  value: number;          // 0-100
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  animated?: boolean;
  className?: string;
}

// 일관된 카드 컴포넌트
interface CardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  variant?: 'default' | 'outlined' | 'filled';
}
```

### 반응형 디자인
```css
/* Mobile First 접근 */
.dashboard-grid {
  grid-template-columns: 1fr;           /* 모바일: 1열 */
}

@media (min-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr 1fr;     /* 태블릿: 2열 */
  }
}

@media (min-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: repeat(3, 1fr); /* 데스크톱: 3열 */
  }
}
```

### 사용성 개선
1. **키보드 네비게이션**: 모든 인터랙티브 요소 키보드 접근 가능
2. **스크린 리더**: 적절한 ARIA 레이블 및 역할 정의
3. **로딩 상태**: Skeleton UI로 로딩 중 시각적 피드백
4. **에러 처리**: 명확한 에러 메시지 및 복구 안내
5. **오프라인 지원**: Service Worker로 기본적인 오프라인 기능

## 성능 최적화

### Frontend 최적화
```typescript
// 메모이제이션으로 불필요한 리렌더링 방지
const StudentCard = memo(({ student }: { student: Student }) => {
  const memoizedProgress = useMemo(
    () => calculateProgress(student.progress),
    [student.progress]
  );
  
  return <Card>{/* 컴포넌트 내용 */}</Card>;
});

// 가상화로 대량 데이터 렌더링 최적화
const LessonList = ({ lessons }: { lessons: Lesson[] }) => {
  return (
    <FixedSizeList
      height={400}
      itemCount={lessons.length}
      itemSize={50}
      itemData={lessons}
    >
      {LessonItem}
    </FixedSizeList>
  );
};
```

### Backend 최적화
```typescript
// 데이터베이스 쿼리 최적화
const getUserDashboardData = async (userId: number) => {
  return await prisma.user.findUnique({
    where: { id: userId },
    include: {
      userCourses: {
        include: {
          course: {
            include: {
              lessons: {
                include: {
                  progress: {
                    where: { userId }
                  }
                }
              }
            }
          }
        }
      }
    }
  });
};

// 캐싱으로 응답 시간 단축
import { LRUCache } from 'lru-cache';
const cache = new LRUCache<string, any>({ max: 500 });
```

## 배포 전략

### Frontend (Vercel)
```json
// vercel.json
{
  "framework": "vite",
  "buildCommand": "pnpm build",
  "outputDirectory": "dist",
  "installCommand": "pnpm install",
  "env": {
    "VITE_API_URL": "https://knou-tracker-api.railway.app"
  }
}
```

### Backend (Railway)
```json
// railway.json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "pnpm build"
  },
  "deploy": {
    "startCommand": "pnpm start",
    "healthcheckPath": "/health"
  }
}
```

## 개발 워크플로우

### Git 브랜치 전략
```
main              # 운영 환경
├── develop       # 개발 환경
├── feature/*     # 새 기능 개발
├── bugfix/*      # 버그 수정
└── hotfix/*      # 긴급 수정
```

### 코드 품질 관리
```json
// package.json scripts
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write .",
    "type-check": "tsc --noEmit",
    "test": "vitest",
    "test:ui": "vitest --ui"
  }
}
```

### 커밋 메시지 규칙
```
feat: 새 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 포맷팅
refactor: 코드 리팩토링
test: 테스트 코드
chore: 빌드/도구 설정
```

## 마이그레이션 계획

### Phase 1: 기반 구조 구축 (1-2주)
- [ ] 프로젝트 초기 설정 (Vite + React + TypeScript)
- [ ] 기본 UI 컴포넌트 라이브러리 설정 (shadcn/ui)
- [ ] 백엔드 API 서버 구축 (Express + Prisma)
- [ ] 데이터베이스 마이그레이션 (SQLite)
- [ ] 기본 라우팅 및 네비게이션 구현

### Phase 2: 핵심 기능 구현 (2-3주)
- [ ] 통합 대시보드 페이지
- [ ] 개인 학습 현황 페이지
- [ ] 관리 페이지
- [ ] 진도 업데이트 API 및 실시간 동기화
- [ ] 차트 및 시각화 구현

### Phase 3: UX 개선 및 최적화 (1-2주)
- [ ] 반응형 디자인 완성
- [ ] 로딩 상태 및 에러 처리
- [ ] 성능 최적화 (메모이제이션, 가상화)
- [ ] 접근성 개선
- [ ] 모바일 사용성 테스트

### Phase 4: 배포 및 모니터링 (1주)
- [ ] 프로덕션 환경 설정
- [ ] CI/CD 파이프라인 구축
- [ ] 모니터링 및 로그 설정
- [ ] 사용자 피드백 수집 시스템

## 성공 지표

### 기술적 지표
- [ ] **페이지 로딩 시간**: 1초 이내 (Lighthouse 90+ 점수)
- [ ] **반응성**: 사용자 액션 후 100ms 이내 피드백
- [ ] **가용성**: 99.9% 업타임 달성
- [ ] **호환성**: 모든 모던 브라우저에서 정상 작동

### 사용성 지표  
- [ ] **직관성**: 새 사용자가 5분 내 모든 기능 이해
- [ ] **효율성**: 진도 체크까지 3클릭 이내
- [ ] **만족도**: 사용자 피드백 4.5/5.0 이상
- [ ] **접근성**: WCAG 2.1 AA 레벨 준수

### 비즈니스 지표
- [ ] **사용자 유지율**: 월간 활성 사용자 80% 이상
- [ ] **기능 사용률**: 모든 핵심 기능 주간 사용률 70% 이상  
- [ ] **에러율**: 사용자 세션당 에러 발생률 1% 미만
- [ ] **지원 요청**: 사용 관련 문의 월 3건 이하

---

## 🎯 **개인 중심의 현대적 학습 진도 관리 시스템**

### 📊 **핵심 개념**
- **유지보수성**: 명확한 구조와 타입 안정성으로 장기적 관리 용이
- **기능 중심**: 핵심 가치(진도 추적)에 집중한 단순하고 효과적인 구조  
- **UX 우선**: 사용자 경험을 최우선으로 하는 직관적이고 반응적인 인터페이스
- **현실 반영**: 실제 학습 환경을 고려한 실용적 기능과 제한사항
- **미래 지향**: 확장 가능하고 현대적인 기술 스택

이 개선된 버전은 기존 Streamlit 버전의 모든 핵심 기능을 유지하면서, 더 나은 사용자 경험과 유지보수성을 제공하는 현대적인 웹 애플리케이션으로 발전시킨 것입니다.

---

## ✅ **최종 구현 완료 사항 (2025-09-04)**

### 📋 **프로젝트 완료 상태**
- ✅ **프로젝트 구조 생성**: frontend, backend, shared 폴더 구조
- ✅ **기본 HTML/CSS/JS 파일 설정**: 모든 핵심 파일 생성
- ✅ **대시보드 구현**: 학생별 진도율 카드와 순위 표시
- ✅ **학생 상세 페이지**: 과목별 강의 체크박스 및 진도 관리
- ✅ **관리자 기능**: 학생/과목 관리 인터페이스
- ✅ **신규 사용자 등록**: 이름, 학과, 수강과목 선택 퍼널

### 🎯 **실제 방송통신대 데이터 반영**
- ✅ **knou_2025_02.csv 데이터 완전 반영**: 56개 과목 전체 포함
- ✅ **통계·데이터과 과목**: 1-4학년 28개 과목
- ✅ **컴퓨터과 과목**: 1-4학년 28개 과목  
- ✅ **수업수 정확 반영**: 7강(원격대학교육의이해), 15강(일반 과목)
- ✅ **학과별 필터링**: 선택한 학과의 과목만 표시

### 🎨 **UI/UX 개선사항**
- ✅ **학년별 표 형태 과목 선택**: 1/2/3/4학년으로 구분된 깔끔한 레이아웃
- ✅ **대시보드 학과명 표시**: 학생 카드에 소속 학과 배지 추가
- ✅ **반응형 디자인**: 모바일 친화적 인터페이스
- ✅ **실시간 진도 업데이트**: 체크박스 클릭 즉시 반영
- ✅ **색상 코딩**: 진도율별 시각적 구분 (0%, 25%, 50%, 75%, 100%)

### 🔧 **기술적 구현**
- ✅ **완전한 클라이언트 사이드 앱**: HTML/CSS/JavaScript만으로 구현
- ✅ **localStorage 데이터 저장**: 브라우저 로컬 저장소 활용
- ✅ **모듈화된 구조**: DataManager 클래스로 데이터 관리 분리
- ✅ **이벤트 기반 아키텍처**: 사용자 상호작용 실시간 처리
- ✅ **에러 처리 및 유효성 검사**: 폼 입력 검증

### 🚀 **배포 준비사항**

#### **프로젝트 파일 구조**
```
knou_tracking2/
├── frontend/
│   ├── public/
│   │   └── index.html          # 메인 HTML 파일
│   └── src/
│       ├── styles.css          # 전체 스타일시트
│       ├── data.js            # 데이터 관리 로직
│       └── app.js             # 메인 애플리케이션 로직
├── reset_data.html            # 데이터 초기화 도구
└── CLAUDE.md                 # 프로젝트 문서
```

#### **주요 기능**
1. **대시보드** (`/`)
   - 학생별 진도율 카드 (이름, 학과, 순위)
   - 전체 진도율 및 과목별 미니 진도바
   - 클릭하여 학생 상세 페이지로 이동

2. **신규 등록** (`#register`)
   - 이름, 학과 선택
   - 학년별로 정리된 과목 선택 (표 형태)
   - 등록 후 자동으로 대시보드에 추가

3. **학생 상세** (학생 카드 클릭)
   - 개인별 전체 진도율 (원형 차트)
   - 과목별 강의 목록 (체크박스)
   - 실시간 진도 업데이트

4. **관리** (`#admin`)
   - 학생 관리: 추가/삭제
   - 과목 관리: 새 과목 추가 (코드, 이름, 학과, 수업수)

#### **배포 방법**
1. **GitHub Pages**
   ```bash
   # 프로젝트를 GitHub에 푸시
   git add .
   git commit -m "Complete KNOU tracking system"
   git push origin main
   
   # GitHub Pages 설정에서 frontend/public 폴더 선택
   ```

2. **Netlify**
   ```bash
   # frontend/public 폴더를 Netlify에 드래그 앤 드롭
   # 또는 Git 연결하여 자동 배포
   ```

3. **로컬 서버 실행**
   ```bash
   # Python 서버
   cd frontend/public
   python -m http.server 8000
   
   # Node.js 서버  
   npx serve frontend/public
   ```

#### **초기 설정**
1. `reset_data.html` 파일을 먼저 열어서 "localStorage 데이터 초기화" 클릭
2. `frontend/public/index.html` 파일을 열어서 메인 애플리케이션 실행
3. 모든 데이터가 자동으로 초기화되어 바로 사용 가능

#### **브라우저 호환성**
- ✅ Chrome, Firefox, Safari, Edge (최신 버전)
- ✅ 모바일 브라우저 지원
- ⚠️ Internet Explorer 미지원 (ES6+ 문법 사용)

### 💡 **향후 확장 가능사항**
- 백엔드 API 연동 (Node.js + Express + SQLite)
- 사용자 인증 시스템
- 진도 통계 및 리포트
- 과목별 성적 관리
- 학습 일정 관리
- 모바일 앱 (React Native)

### 🔍 **주의사항**
- localStorage 기반이므로 브라우저 데이터 삭제 시 모든 진도 정보 손실
- 다중 사용자 동시 접근 시 데이터 동기화 이슈 가능
- 대용량 데이터 처리 시 성능 저하 가능성

---

## 🎉 **최종 결과물**
방송통신대 학생들을 위한 **완전 기능하는 학습 진도 관리 웹 애플리케이션**이 성공적으로 완성되었습니다. 실제 교육과정 데이터를 반영하여 현실적이고 실용적인 도구로 활용할 수 있습니다.