# 📚 KNOU 학습 진도 관리 시스템

방송통신대학교 학생들을 위한 개인 학습 진도 추적 및 관리 웹 애플리케이션

[![GitHub](https://img.shields.io/badge/GitHub-Repository-black?style=for-the-badge&logo=github)](https://github.com/ggplab/knou_tracking2)

## 🎯 프로젝트 개요

### 주요 목적
- 방송통신대 학생들의 **개인 학습 진도를 체계적으로 관리**
- **실시간 진도율 추적**으로 학습 동기 부여
- **직관적인 대시보드**로 한눈에 보는 학습 현황
- **과목별 강의 체크리스트**로 세부 진도 관리

### 핵심 특징
- ✅ **개인 중심 설계**: 각 학생의 개별 진도 관리에 특화 (순위 경쟁 없는 협력적 환경)
- ✅ **실시간 업데이트**: 체크박스 클릭 시 즉시 진도율 반영
- ✅ **시각적 피드백**: 색상 코딩으로 진도율 구간 구분
- ✅ **반응형 디자인**: 데스크톱과 모바일에서 완벽 지원
- ✅ **고성능 최적화**: 데이터베이스 인덱싱과 캐싱으로 빠른 로딩 속도
- ✅ **로그인 불필요**: 브라우저 로컬 저장소 활용
- ✅ **실제 교육과정 반영**: 2025년 2학기 정식 과목 데이터

## 🚀 Live Demo

## 🛠 기술 스택

### Frontend
- **HTML5** - 시맨틱 마크업
- **CSS3** - CSS Variables, Flexbox, Grid 활용
- **Vanilla JavaScript** - 순수 JavaScript로 구현
- **Font Awesome** - 아이콘 라이브러리
- **LocalStorage** - 브라우저 로컬 데이터 저장

### 배포
- **GitHub Pages** - 정적 사이트 호스팅
- **Custom Domain** - knou.ggplab.xyz
- **SSL Certificate** - Let's Encrypt 자동 발급

## ⚡ 주요 기능

### 1. 📊 통합 대시보드
- 학생별 진도율 카드 그리드 뷰
- 전체 진도율 및 과목별 미니 프로그레스 바
- 학과명 배지 표시
- 진도율 기준 자동 순위 계산

### 2. 📝 개인 학습 현황
- 개인별 상세 진도 페이지
- 원형 진도율 차트
- 과목별 강의 체크리스트 (체크박스)
- 실시간 진도율 업데이트

### 3. 👤 신규 사용자 등록
- 이름, 학과 선택
- 학년별 테이블 형태의 과목 선택
- 실제 방송통신대 교육과정 반영

### 4. ⚙️ 관리자 기능
- 학생 추가/삭제
- 과목 및 강의 관리
- 전체 시스템 현황 확인

## 📋 지원 학과

- 통계·데이터과학과 (28과목)
- 컴퓨터과학과 (28과목)


## 🚀 로컬 실행 방법

### 1. 프로젝트 클론
```bash
git clone https://github.com/ggplab/knou_tracking2.git
cd knou_tracking2
```

### 2. 로컬 서버 실행
```bash
# Python을 사용하는 경우
python -m http.server 8000

# Node.js를 사용하는 경우
npx serve .

# PHP를 사용하는 경우  
php -S localhost:8000
```

### 3. 브라우저 접속
`http://localhost:8000`으로 접속하여 확인

## 💾 데이터 초기화

브라우저에서 데이터를 초기화하려면:

1. `reset_data.html` 파일 열기
2. "localStorage 데이터 초기화" 버튼 클릭
3. 메인 애플리케이션 다시 로드

## 🎨 디자인 시스템

### 색상 팔레트
- **Primary**: #4A90E2 (메인 브랜드 컬러)
- **진도율 색상**:
  - 0%: #D1D5DB (회색)
  - 25%: #F59E0B (노란색)
  - 50%: #F97316 (주황색)
  - 75%: #10B981 (초록색)  
  - 100%: #4A90E2 (파란색)


## 📱 브라우저 지원

- ✅ **Chrome** (Latest)
- ✅ **Firefox** (Latest)
- ✅ **Safari** (Latest)
- ✅ **Edge** (Latest)
- ⚠️ **Internet Explorer** (미지원)

## 🚀 GitHub Pages 배포

### 자동 배포 설정
이 프로젝트는 GitHub Pages를 통해 자동 배포됩니다:

- **배포 URL**: `https://yourusername.github.io/knou_tracking2/`
- **배포 브랜치**: `main`  
- **배포 트리거**: Push to main branch

### 로컬 개발 서버
```bash
# Python 서버 (Python 3.x)
python -m http.server 8000

# Node.js 서버
npx serve .

# 브라우저에서 접속
http://localhost:8000
```

### 성능 최적화 가이드
- 📋 **데이터베이스 인덱스**: [`INDEX_GUIDE.md`](INDEX_GUIDE.md)
- 🚀 **성능 테스트**: [`PERFORMANCE_TEST.md`](PERFORMANCE_TEST.md)  
- 🔧 **배포 가이드**: [`DEPLOY_GUIDE.md`](DEPLOY_GUIDE.md)

## 🔧 개발 정보

### 파일 구조
```
knou_tracking2/
├── index.html          # 메인 HTML 파일
├── styles.css          # 전체 스타일시트
├── data.js            # 데이터 관리 로직
├── app.js             # 메인 애플리케이션 로직
├── reset_data.html    # 데이터 초기화 도구
├── CNAME              # 커스텀 도메인 설정
└── README.md          # 프로젝트 문서
```

### 데이터 구조
- **Users**: 학생 정보 (이름, 학과, 생성일)
- **Courses**: 과목 정보 (코드, 이름, 학과, 학년, 강의수)
- **UserCourses**: 수강 신청 정보 (학생-과목 연결)
- **UserProgress**: 학습 진도 (강의별 완료 상태)

## 🤝 기여 방법

1. **Fork** 프로젝트
2. **Feature 브랜치** 생성 (`git checkout -b feature/amazing-feature`)
3. **변경사항 커밋** (`git commit -m 'Add amazing feature'`)
4. **브랜치에 Push** (`git push origin feature/amazing-feature`)
5. **Pull Request** 생성

## 📄 라이선스

이 프로젝트는 **MIT License** 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 👨‍💻 제작자

**지지플랏 (임정)**
- 🔗 LinkedIn: [https://www.linkedin.com/in/jayjunglim/](https://www.linkedin.com/in/jayjunglim/)
- 📧 Email: contact@ggplab.xyz
- 🌐 Website: [ggplab.xyz](https://ggplab.xyz)

---

<div align="center">

**⭐ 이 프로젝트가 도움이 되었다면 Star를 눌러주세요! ⭐**

Made with ❤️ by [지지플랏](https://www.linkedin.com/in/jayjunglim/)

</div>
