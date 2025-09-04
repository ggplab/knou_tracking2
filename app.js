// Main application logic for KNOU tracking system

class KNOUTracker {
    constructor() {
        this.currentPage = 'dashboard';
        this.currentStudent = null;
        this.cache = {
            dashboardData: null,
            lessons: new Map(),
            lastUpdate: null,
            stats: {
                cacheHits: 0,
                dbQueries: 0,
                totalRequests: 0
            }
        };
        this.init();
    }

    async init() {
        this.setupEventListeners();
        
        // DataManager 초기화 완료까지 대기
        while (!dataManager.initialized) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        await this.renderDashboard();
        await this.renderAdmin();
        await this.renderRegister();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.target.getAttribute('data-page');
                this.showPage(page);
            });
        });

        // Admin forms
        document.getElementById('add-user-form').addEventListener('submit', (e) => {
            this.handleAddUser(e);
        });

        // Course and lesson management forms removed

        // Register form
        document.getElementById('register-form').addEventListener('submit', (e) => {
            this.handleRegister(e);
        });

        // Back button
        document.querySelector('.back-btn').addEventListener('click', () => {
            this.showPage('dashboard');
        });
    }

    async showPage(pageName) {
        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-page="${pageName}"]`).classList.add('active');

        // Show page
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        document.getElementById(`${pageName}-page`).classList.add('active');

        this.currentPage = pageName;

        // Render page content
        if (pageName === 'dashboard') {
            await this.renderDashboard();
        } else if (pageName === 'student') {
            await this.renderStudentPage();
        } else if (pageName === 'admin') {
            await this.renderAdmin();
        } else if (pageName === 'register') {
            await this.renderRegister();
        }
    }

    async renderDashboard() {
        try {
            // 로딩 상태 표시
            const studentGrid = document.getElementById('student-grid');
            studentGrid.innerHTML = '<div class="loading">데이터를 불러오는 중...</div>';

            const dashboardData = await this.getCachedDashboardData();
            
            studentGrid.innerHTML = '';

            dashboardData.progressSummary.forEach((student, index) => {
                const studentCard = this.createStudentCard(student, index + 1);
                studentGrid.appendChild(studentCard);
            });

            // Update stats
            const totalStudents = dashboardData.users.length;
            const avgProgress = totalStudents > 0 ? Math.round(
                dashboardData.progressSummary.reduce((acc, s) => acc + s.overallProgress, 0) / totalStudents
            ) : 0;

            document.querySelector('.stat-card:first-child .stat-value').textContent = totalStudents;
            document.querySelector('.stat-card:last-child .stat-value').textContent = `${avgProgress}%`;
        } catch (error) {
            console.error('대시보드 렌더링 오류:', error);
            const studentGrid = document.getElementById('student-grid');
            studentGrid.innerHTML = '<div class="error">데이터를 불러오는 중 오류가 발생했습니다.</div>';
        }
    }

    createStudentCard(student, rank) {
        const card = document.createElement('div');
        card.className = 'student-card fade-in';
        card.onclick = async () => await this.showStudentDetail(student.userId);

        const progressColor = this.getProgressColor(student.overallProgress);
        
        // Get user department (passed from renderDashboard)
        const department = student.department || '';

        card.innerHTML = `
            <div class="student-card-header">
                <div class="student-info-header">
                    <h3 class="student-name">${student.userName}</h3>
                    <span class="student-department">${department}</span>
                </div>
                <span class="student-rank">#${rank}</span>
            </div>
            
            <div class="overall-progress-bar">
                <div class="progress-label">
                    <span>전체 진도</span>
                    <span>${student.overallProgress}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill ${progressColor}" style="width: ${student.overallProgress}%"></div>
                </div>
            </div>

            <div class="course-progress-list">
                ${student.courseProgress.map(course => `
                    <div class="course-progress-item">
                        <span class="course-name">${course.courseName}</span>
                        <div class="course-progress-mini">
                            <div class="mini-progress-bar">
                                <div class="mini-progress-fill ${this.getProgressColor(course.progress)}" 
                                     style="width: ${course.progress}%"></div>
                            </div>
                            <span class="course-percentage">${course.progress}%</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        return card;
    }

    async showStudentDetail(userId) {
        // 개인 현황 페이지로 이동하고 해당 학생 선택
        await this.showPage('student');
        
        // 학생 선택 드롭다운에서 해당 학생 선택
        const studentSelect = document.getElementById('student-select');
        studentSelect.value = userId.toString();
        
        // 개인 현황 로드
        await this.loadStudentProgress(userId);
    }

    updateProgressCircle(progress) {
        const circle = document.querySelector('.progress-ring-circle');
        const percentageText = document.querySelector('.progress-percentage');
        
        const radius = 50;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (progress / 100) * circumference;

        circle.style.strokeDasharray = circumference;
        circle.style.strokeDashoffset = offset;
        circle.style.stroke = this.getProgressColorHex(progress);

        percentageText.textContent = `${progress}%`;
    }

    async renderStudentCourses(userCourses, userProgress) {
        const courseList = document.getElementById('course-list');
        courseList.innerHTML = '';

        for (const uc of userCourses) {
            // Supabase: uc.course_id, LocalStorage: uc.courseId
            const courseId = uc.course_id || uc.courseId || (uc.courses && uc.courses.id);
            const course = uc.courses || uc.course;
            
            if (!courseId || !course) {
                console.error('courseId or course not found in userCourse:', uc);
                continue;
            }
            
            const lessons = await dataManager.getLessonsByCourseId(courseId);
            console.log(`📚 과목 ${course.course_name || course.courseName} (ID: ${courseId})의 강의 목록:`, lessons);
            
            // lessons가 배열인지 확인
            if (!Array.isArray(lessons)) {
                console.error('lessons is not an array:', lessons);
                continue;
            }
            
            if (lessons.length === 0) {
                console.warn(`⚠️ 과목 ${course.course_name || course.courseName}에 강의가 없습니다.`);
            }
            
            const courseProgress = userProgress.filter(up => 
                lessons.some(l => l.id === up.lessonId)
            );
            const completedCount = courseProgress.filter(p => p.completed).length;
            const progressPercentage = lessons.length > 0 ? 
                Math.round((completedCount / lessons.length) * 100) : 0;

            const courseCard = this.createCourseCard(course, lessons, courseProgress, progressPercentage);
            courseList.appendChild(courseCard);
        }
    }

    createCourseCard(course, lessons, progress, progressPercentage) {
        const card = document.createElement('div');
        card.className = 'unified-course-card fade-in';

        const progressColor = this.getProgressColor(progressPercentage);

        card.innerHTML = `
            <div class="unified-card-header">
                <div class="course-info">
                    <h3 class="course-title">${course.course_name || course.courseName}</h3>
                    <span class="course-code">(${course.course_code || course.courseCode})</span>
                </div>
                <div class="progress-info">
                    <div class="progress-circle ${progressColor}">
                        <span class="progress-text">${progressPercentage}%</span>
                    </div>
                </div>
            </div>
            
            <div class="unified-lesson-grid">
                ${Array.isArray(lessons) ? lessons.map(lesson => {
                    const lessonProgress = progress.find(p => p.lessonId === lesson.id);
                    const isCompleted = lessonProgress ? lessonProgress.completed : false;
                    
                    return `
                        <div class="unified-lesson-item ${isCompleted ? 'completed' : ''}">
                            <input type="checkbox" 
                                   class="unified-lesson-checkbox" 
                                   ${isCompleted ? 'checked' : ''}
                                   onchange="app.toggleLessonProgress(${lesson.id}, this.checked)">
                            <span class="unified-lesson-name">${lesson.lesson_name || lesson.lessonName || 'undefined'}</span>
                        </div>
                    `;
                }).join('') : '<p class="no-lessons">강의 정보를 불러올 수 없습니다.</p>'}
            </div>
        `;

        return card;
    }

    async toggleLessonProgress(lessonId, completed) {
        if (!this.currentStudent) return;

        try {
            // 1. 데이터베이스 업데이트
            await dataManager.updateProgress(this.currentStudent, lessonId, completed);
            
            // 2. 해당 체크박스의 상태만 업데이트 (UI 즉시 반영)
            const checkbox = document.querySelector(`input[onchange*="toggleLessonProgress(${lessonId}"]`);
            if (checkbox) {
                const lessonItem = checkbox.closest('.lesson-item');
                if (completed) {
                    lessonItem.classList.add('completed');
                } else {
                    lessonItem.classList.remove('completed');
                }
            }
            
            // 3. 진도율 업데이트 (부드러운 애니메이션)
            await this.updateProgressBarsOnly();
            
        } catch (error) {
            console.error('진도 업데이트 오류:', error);
            
            // 에러 발생 시 체크박스 상태 되돌리기
            const checkbox = document.querySelector(`input[onchange*="toggleLessonProgress(${lessonId}"]`);
            if (checkbox) {
                checkbox.checked = !completed;
                const lessonItem = checkbox.closest('.lesson-item');
                if (!completed) {
                    lessonItem.classList.add('completed');
                } else {
                    lessonItem.classList.remove('completed');
                }
            }
            
            alert('진도 업데이트 중 오류가 발생했습니다.');
        }
    }

    // 진도율 바만 업데이트하는 메서드 (전체 새로고침 없이)
    async updateProgressBarsOnly() {
        try {
            const userProgress = await dataManager.getUserProgress(this.currentStudent);
            const userCourses = await dataManager.getUserCourses(this.currentStudent);
            
            // 전체 진도율 계산 및 업데이트
            let totalLessons = 0;
            for (const uc of userCourses) {
                const courseId = uc.course_id || uc.courseId || (uc.courses && uc.courses.id);
                if (courseId) {
                    const lessons = await dataManager.getLessonsByCourseId(courseId);
                    totalLessons += lessons.length;
                }
            }
            
            const completedLessons = userProgress.filter(up => up.completed).length;
            const overallProgress = totalLessons > 0 ? 
                Math.round((completedLessons / totalLessons) * 100) : 0;
                
            // 원형 진도율 업데이트
            this.updateProgressCircle(overallProgress);
            
            // 각 과목별 진도율 바 업데이트
            const courseCards = document.querySelectorAll('.course-card');
            for (const card of courseCards) {
                const progressBar = card.querySelector('.progress-fill');
                const progressText = card.querySelector('.course-progress-detail span');
                
                // 해당 과목의 진도율 재계산 (간단하게 체크된 체크박스 비율로 계산)
                const checkboxes = card.querySelectorAll('.lesson-checkbox');
                const checkedBoxes = card.querySelectorAll('.lesson-checkbox:checked');
                const courseProgress = checkboxes.length > 0 ? 
                    Math.round((checkedBoxes.length / checkboxes.length) * 100) : 0;
                
                if (progressBar && progressText) {
                    progressBar.style.width = courseProgress + '%';
                    progressBar.className = `progress-fill ${this.getProgressColor(courseProgress)}`;
                    progressText.textContent = courseProgress + '%';
                }
            }
            
        } catch (error) {
            console.error('진도율 업데이트 오류:', error);
        }
    }

    // Student Progress Page functionality
    async renderStudentPage() {
        await this.loadStudentSelector();
    }

    async loadStudentSelector() {
        try {
            const studentSelect = document.getElementById('student-select');
            studentSelect.innerHTML = '<option value="">학습자를 선택하세요</option>';
            
            const users = await dataManager.getUsers();
            
            users.forEach(user => {
                const option = document.createElement('option');
                option.value = user.id;
                option.textContent = `${user.name} (${user.department})`;
                studentSelect.appendChild(option);
            });
            
        } catch (error) {
            console.error('Error loading student selector:', error);
        }
    }

    async loadStudentProgress(userId) {
        const startTime = performance.now();
        
        if (!userId) {
            document.getElementById('student-progress-content').style.display = 'none';
            return;
        }

        try {
            const progressContent = document.getElementById('student-progress-content');
            progressContent.style.display = 'block';
            
            // 로딩 상태 - 스켈레톤 UI
            const coursesGrid = document.getElementById('courses-grid');
            coursesGrid.innerHTML = this.createSkeletonLoader();

            // 캐시된 대시보드 데이터 사용 (성능 최적화)
            const dashboardData = await this.getCachedDashboardData();
            const user = dashboardData.users.find(u => u.id === parseInt(userId));
            const currentUserSummary = dashboardData.progressSummary.find(u => u.userId === parseInt(userId));
            
            // 사용자 기본 정보 표시
            document.getElementById('selected-student-name').textContent = user.name;
            document.getElementById('selected-student-department').textContent = user.department;
            
            // 전체 진도율 표시
            const overallProgress = currentUserSummary ? currentUserSummary.overallProgress : 0;
            document.getElementById('overall-progress-percentage').textContent = `${Math.round(overallProgress)}%`;
            
            // 가로 진도율 바 업데이트
            const progressBarFill = document.getElementById('progress-bar-fill');
            if (progressBarFill) {
                progressBarFill.style.width = `${overallProgress}%`;
            }

            // 과목별 카드 렌더링
            await this.renderStudentCoursesGrid(userId, currentUserSummary);
            
            const loadTime = performance.now() - startTime;
            console.log(`📊 Progress data loaded in: ${loadTime.toFixed(1)}ms`);
            
        } catch (error) {
            console.error('Error loading student progress:', error);
            const coursesGrid = document.getElementById('courses-grid');
            coursesGrid.innerHTML = '<div class="error">진도 정보를 불러오는 중 오류가 발생했습니다.</div>';
        }
    }

    async renderStudentCoursesGrid(userId, userSummary) {
        const coursesGrid = document.getElementById('courses-grid');
        coursesGrid.innerHTML = '';
        
        if (!userSummary || !userSummary.courseProgress.length) {
            coursesGrid.innerHTML = '<div class="no-courses">등록된 과목이 없습니다.</div>';
            return;
        }

        for (const courseProgress of userSummary.courseProgress) {
            const courseCard = await this.createCourseCard(userId, courseProgress);
            coursesGrid.appendChild(courseCard);
        }
    }

    async createCourseCard(userId, courseProgress) {
        const courseCard = document.createElement('div');
        courseCard.className = 'course-card';
        
        const lessons = await this.getCachedLessons(courseProgress.courseId);
        const userProgressData = await dataManager.getUserProgress();
        const userLessonsProgress = userProgressData.filter(up => 
            (up.userId === parseInt(userId) || up.user_id === parseInt(userId)) && 
            lessons.some(lesson => lesson.id === (up.lessonId || up.lesson_id))
        );
        
        const completedCount = userLessonsProgress.filter(up => up.completed).length;
        const totalCount = lessons.length;
        const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

        courseCard.setAttribute('data-course-id', courseProgress.courseId);
        courseCard.innerHTML = `
            <div class="course-card-header">
                <h3>${courseProgress.courseName}</h3>
                <div class="course-code">${courseProgress.courseCode}</div>
                <div class="course-progress-bar">
                    <div class="course-progress-fill" style="width: ${progressPercentage}%"></div>
                </div>
            </div>
            <div class="course-card-body">
                <div class="progress-info" style="margin-bottom: 0.75rem; text-align: center; font-weight: 600; font-size: 0.9rem;">
                    ${completedCount}/${totalCount} 강의 완료 (${Math.round(progressPercentage)}%)
                </div>
                <div class="lessons-grid">
                    ${lessons.map(lesson => {
                        const isCompleted = userLessonsProgress.some(up => (up.lessonId === lesson.id || up.lesson_id === lesson.id) && up.completed);
                        return `
                            <div class="lesson-item ${isCompleted ? 'completed' : ''}">
                                <input 
                                    type="checkbox" 
                                    class="lesson-checkbox" 
                                    data-user-id="${userId}"
                                    data-lesson-id="${lesson.id}"
                                    ${isCompleted ? 'checked' : ''}
                                    onchange="app.handleLessonToggle(this)"
                                />
                                <span class="lesson-name">${lesson.name || lesson.lesson_name || lesson.lessonName || `${lesson.lesson_order || lesson.lessonOrder || ''}강`}</span>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
        
        return courseCard;
    }

    async handleLessonToggle(checkbox) {
        const startTime = performance.now();
        const userId = parseInt(checkbox.getAttribute('data-user-id'));
        const lessonId = parseInt(checkbox.getAttribute('data-lesson-id'));
        const completed = checkbox.checked;

        try {
            await dataManager.updateUserProgress(userId, lessonId, completed);
            
            const updateTime = performance.now() - startTime;
            console.log(`✅ User progress updated in: ${updateTime.toFixed(1)}ms`);
            
            // UI 업데이트 - 해당 강의 아이템 스타일 변경
            const lessonItem = checkbox.closest('.lesson-item');
            if (completed) {
                lessonItem.classList.add('completed');
            } else {
                lessonItem.classList.remove('completed');
            }

            // 부분적 업데이트만 수행 (성능 최적화)
            await this.updateProgressDisplay(userId);
            
        } catch (error) {
            console.error('Error updating lesson progress:', error);
            // 오류 발생 시 체크박스 상태 되돌리기
            checkbox.checked = !completed;
            alert('진도 업데이트 중 오류가 발생했습니다.');
        }
    }

    // Admin functionality
    renderAdmin() {
        this.renderUserList();
        this.loadStudentManagementOptions();
    }

    async renderUserList() {
        try {
            const userList = document.getElementById('user-list');
            userList.innerHTML = '<div class="loading">사용자 목록을 불러오는 중...</div>';
            
            const users = await dataManager.getUsers();

            userList.innerHTML = '';

            users.forEach(user => {
                const userItem = document.createElement('div');
                userItem.className = 'user-item slide-in';
                
                userItem.innerHTML = `
                    <span class="user-name">${user.name}</span>
                    <div class="user-actions">
                        <button class="btn-sm btn-danger" onclick="app.deleteUser(${user.id})">삭제</button>
                    </div>
                `;

                userList.appendChild(userItem);
            });
        } catch (error) {
            console.error('사용자 목록 렌더링 오류:', error);
            const userList = document.getElementById('user-list');
            userList.innerHTML = '<div class="error">사용자 목록을 불러오는 중 오류가 발생했습니다.</div>';
        }
    }

    async renderCourseList() {
        try {
            const courseSelect = document.getElementById('lesson-course-select');
            courseSelect.innerHTML = '<option value="">로딩 중...</option>';
            
            const courses = await dataManager.getCourses();
            courseSelect.innerHTML = '<option value="">과목 선택</option>';
            
            courses.forEach(course => {
                const option = document.createElement('option');
                option.value = course.id;
                option.textContent = `${course.courseCode} - ${course.courseName}`;
                courseSelect.appendChild(option);
            });
        } catch (error) {
            console.error('과목 목록 렌더링 오류:', error);
            const courseSelect = document.getElementById('lesson-course-select');
            courseSelect.innerHTML = '<option value="">과목 로드 실패</option>';
        }
    }

    async renderCourseTree() {
        try {
            const courseTree = document.getElementById('course-tree');
            courseTree.innerHTML = '<div class="loading">과목 목록을 불러오는 중...</div>';
            
            const courses = await dataManager.getCourses();
            courseTree.innerHTML = '';
            
            for (const course of courses) {
                const lessons = await dataManager.getLessonsByCourseId(course.id);
                const courseNode = this.createCourseNode(course, lessons);
                courseTree.appendChild(courseNode);
            }
        } catch (error) {
            console.error('과목 트리 렌더링 오류:', error);
            const courseTree = document.getElementById('course-tree');
            courseTree.innerHTML = '<div class="error">과목 목록을 불러오는 중 오류가 발생했습니다.</div>';
        }
    }

    createCourseNode(course, lessons) {
        const node = document.createElement('div');
        node.className = 'course-node';

        node.innerHTML = `
            <div class="course-node-header" onclick="this.parentElement.classList.toggle('expanded')">
                <span>${course.courseCode} - ${course.courseName} (${lessons.length}개 강의)</span>
                <span>▼</span>
            </div>
            <div class="course-node-content">
                <div class="lesson-list">
                    ${lessons.map(lesson => `
                        <div class="lesson-list-item">
                            <span>${lesson.lessonOrder}. ${lesson.lessonName}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        return node;
    }

    // Event handlers
    async handleAddUser(e) {
        e.preventDefault();
        const userName = document.getElementById('user-name').value.trim();
        
        if (!userName) return;

        try {
            const newUser = await dataManager.addUser({ name: userName });
            
            // Auto-enroll in all available courses
            const courses = await dataManager.getCourses();
            for (const course of courses) {
                await dataManager.enrollUserInCourse(newUser.id, course.id);
            }

            document.getElementById('user-name').value = '';
            await this.renderUserList();
            await this.renderDashboard();
        } catch (error) {
            console.error('사용자 추가 오류:', error);
            alert('사용자 추가 중 오류가 발생했습니다.');
        }
    }

    // Course and lesson management functions removed

    async deleteUser(userId) {
        if (confirm('이 학생을 정말 삭제하시겠습니까?')) {
            try {
                await dataManager.deleteUser(userId);
                await this.renderUserList();
                await this.renderDashboard();
            } catch (error) {
                console.error('사용자 삭제 오류:', error);
                alert('사용자 삭제 중 오류가 발생했습니다.');
            }
        }
    }

    // Register functionality
    renderRegister() {
        this.loadDepartments();
    }

    loadDepartments() {
        const departmentSelect = document.getElementById('register-department');
        const departments = dataManager.getDepartments();

        departmentSelect.innerHTML = '<option value="">학과를 선택하세요</option>';

        if (departments && departments.length > 0) {
            departments.forEach(dept => {
                const option = document.createElement('option');
                option.value = dept.name;
                option.textContent = dept.name;
                departmentSelect.appendChild(option);
            });
        }
    }

    async loadCoursesByDepartment() {
        const department = document.getElementById('register-department').value;
        const courseSelection = document.getElementById('course-selection');

        if (!department) {
            courseSelection.innerHTML = '<p class="course-selection-note">학과를 먼저 선택해주세요.</p>';
            return;
        }

        try {
            courseSelection.innerHTML = '<div class="loading">과목을 불러오는 중...</div>';
            
            // 모든 과목을 가져와서 학과별로 필터링할 수 있도록 함
            await this.renderCourseSelection();
            
        } catch (error) {
            console.error('과목 로드 오류:', error);
            courseSelection.innerHTML = '<div class="error">과목을 불러오는 중 오류가 발생했습니다.</div>';
        }
    }
    
    async renderCourseSelection() {
        const courseSelection = document.getElementById('course-selection');
        
        try {
            // 모든 과목 가져오기
            const allCourses = await dataManager.getCourses();
            
            if (!allCourses || allCourses.length === 0) {
                courseSelection.innerHTML = '<p class="course-selection-note">과목이 없습니다.</p>';
                return;
            }
            
            // 학과별로 그룹화
            const coursesByDepartment = {};
            allCourses.forEach(course => {
                if (!coursesByDepartment[course.department]) {
                    coursesByDepartment[course.department] = {};
                }
                if (!coursesByDepartment[course.department][course.grade]) {
                    coursesByDepartment[course.department][course.grade] = [];
                }
                coursesByDepartment[course.department][course.grade].push(course);
            });

            const gradeLabels = { 1: '1학년', 2: '2학년', 3: '3학년', 4: '4학년' };
            
            courseSelection.innerHTML = `
                <div class="course-filter-container">
                    <div class="filter-buttons">
                        <button type="button" class="filter-btn active" onclick="app.filterCourses('all')">전체 과목</button>
                        <button type="button" class="filter-btn" onclick="app.filterCourses('통계·데이터')">통계·데이터과</button>
                        <button type="button" class="filter-btn" onclick="app.filterCourses('컴퓨터')">컴퓨터과</button>
                    </div>
                </div>
                <div class="course-table-container">
                    ${Object.keys(coursesByDepartment).map(dept => `
                        <div class="department-section" data-department="${dept}">
                            <h3 class="department-header">${dept}과 과목</h3>
                            <div class="grade-tabs">
                                ${Object.keys(coursesByDepartment[dept]).sort().map(grade => `
                                    <button type="button" class="grade-tab ${grade === '1' ? 'active' : ''}" 
                                            onclick="showGrade('${dept}', ${grade})">${gradeLabels[grade]}</button>
                                `).join('')}
                            </div>
                            ${Object.keys(coursesByDepartment[dept]).sort().map(grade => `
                                <div class="grade-content ${grade === '1' ? 'active' : ''}" 
                                     data-department="${dept}" data-grade="${grade}">
                                    <div class="course-grid">
                                        ${coursesByDepartment[dept][grade].map(course => `
                                            <div class="course-card" onclick="toggleCourseSelection('course-${course.id}')">
                                                <div class="course-checkbox">
                                                    <input type="checkbox" id="course-${course.id}" name="courses" value="${course.id}" onclick="event.stopPropagation()">
                                                </div>
                                                <div class="course-info">
                                                    <div class="course-name">${course.courseName}</div>
                                                    <div class="course-details">${course.courseCode} • ${course.lessonCount}강</div>
                                                </div>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    `).join('')}
                </div>
            `;
            
            // 체크박스 초기 상태 설정 및 이벤트 리스너 추가
            setTimeout(() => {
                document.querySelectorAll('.course-card input[type="checkbox"]').forEach(checkbox => {
                    const courseCard = checkbox.closest('.course-card');
                    
                    // 체크박스 변경 이벤트 리스너 추가
                    checkbox.addEventListener('change', function() {
                        if (this.checked) {
                            courseCard.classList.add('selected');
                        } else {
                            courseCard.classList.remove('selected');
                        }
                    });
                    
                    // 초기 상태 설정
                    if (checkbox.checked) {
                        courseCard.classList.add('selected');
                    }
                });
            }, 100);
            
        } catch (error) {
            console.error('과목 렌더링 오류:', error);
            courseSelection.innerHTML = '<div class="error">과목을 불러오는 중 오류가 발생했습니다.</div>';
        }
    }

    // 과목 필터링 기능
    filterCourses(filterType) {
        // 필터 버튼 활성화 상태 변경
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');
        
        // 학과 섹션 표시/숨김
        const departmentSections = document.querySelectorAll('.department-section');
        departmentSections.forEach(section => {
            if (filterType === 'all') {
                section.style.display = 'block';
            } else {
                const department = section.getAttribute('data-department');
                section.style.display = department === filterType ? 'block' : 'none';
            }
        });
    }

    // 학년별 탭 전환 기능
    showGrade(department, grade) {
        // 해당 학과의 모든 grade-tab 버튼 비활성화
        const deptSection = document.querySelector(`[data-department="${department}"]`);
        if (deptSection) {
            deptSection.querySelectorAll('.grade-tab').forEach(tab => {
                tab.classList.remove('active');
            });
            deptSection.querySelectorAll('.grade-content').forEach(content => {
                content.classList.remove('active');
            });
            
            // 클릭한 탭과 해당 콘텐츠 활성화
            event.target.classList.add('active');
            const targetContent = deptSection.querySelector(`[data-grade="${grade}"]`);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        
        const name = document.getElementById('register-name').value.trim();
        const department = document.getElementById('register-department').value;
        const selectedCourses = Array.from(document.querySelectorAll('input[name="courses"]:checked'))
            .map(cb => parseInt(cb.value));

        if (!name || !department || selectedCourses.length === 0) {
            alert('모든 필드를 입력해주세요. 최소 1개 이상의 과목을 선택해주세요.');
            return;
        }

        // 닉네임 중복 검사
        try {
            const users = await dataManager.getUsers();
            const isDuplicate = users.some(user => 
                (user.name || '').toLowerCase() === name.toLowerCase()
            );
            
            if (isDuplicate) {
                alert('이미 사용 중인 닉네임입니다. 다른 닉네임을 선택해주세요.');
                return;
            }
        } catch (error) {
            console.error('닉네임 중복 검사 오류:', error);
            alert('닉네임 중복 검사 중 오류가 발생했습니다.');
            return;
        }

        try {
            // Add new user (비동기 처리)
            const newUser = await dataManager.addUser({ name, department });
            console.log('👤 새 사용자 생성:', newUser);

            // Enroll user in selected courses (비동기 처리)
            for (const courseId of selectedCourses) {
                const enrollment = await dataManager.enrollUserInCourse(newUser.id, courseId);
                console.log('📚 수강 등록 완료:', { userId: newUser.id, courseId, enrollment });
            }

            // Reset form and show success message
            this.resetRegisterForm();
            alert(`${name}님이 성공적으로 등록되었습니다! (${selectedCourses.length}개 과목 수강 등록)`);
            
            // Refresh dashboard
            await this.renderDashboard();
            
            // Redirect to dashboard
            this.showPage('dashboard');
        } catch (error) {
            console.error('사용자 등록 오류:', error);
            alert('사용자 등록 중 오류가 발생했습니다.');
        }
    }

    resetRegisterForm() {
        document.getElementById('register-form').reset();
        document.getElementById('course-selection').innerHTML = '<p class="course-selection-note">학과를 먼저 선택해주세요.</p>';
        
        // 닉네임 검증 메시지 초기화
        const validationMessage = document.getElementById('nickname-validation');
        if (validationMessage) {
            validationMessage.textContent = '';
            validationMessage.className = 'validation-message';
        }
    }

    async checkNicknameDuplicate(nickname) {
        const validationMessage = document.getElementById('nickname-validation');
        const submitButton = document.querySelector('#register-form button[type="submit"]');
        
        if (!nickname || nickname.trim() === '') {
            validationMessage.textContent = '';
            validationMessage.className = 'validation-message';
            if (submitButton) submitButton.disabled = false;
            return;
        }
        
        nickname = nickname.trim();
        
        // 닉네임 길이 검증
        if (nickname.length < 2) {
            validationMessage.textContent = '닉네임은 최소 2자 이상이어야 합니다.';
            validationMessage.className = 'validation-message warning';
            if (submitButton) submitButton.disabled = true;
            return;
        }
        
        if (nickname.length > 20) {
            validationMessage.textContent = '닉네임은 20자 이하로 입력해주세요.';
            validationMessage.className = 'validation-message warning';
            if (submitButton) submitButton.disabled = true;
            return;
        }
        
        try {
            const users = await dataManager.getUsers();
            const isDuplicate = users.some(user => 
                (user.name || '').toLowerCase() === nickname.toLowerCase()
            );
            
            if (isDuplicate) {
                validationMessage.textContent = '이미 사용 중인 닉네임입니다. 다른 닉네임을 선택해주세요.';
                validationMessage.className = 'validation-message error';
                if (submitButton) submitButton.disabled = true;
            } else {
                validationMessage.textContent = '사용 가능한 닉네임입니다.';
                validationMessage.className = 'validation-message success';
                if (submitButton) submitButton.disabled = false;
            }
        } catch (error) {
            console.error('닉네임 중복 검사 오류:', error);
            validationMessage.textContent = '닉네임 중복 검사 중 오류가 발생했습니다.';
            validationMessage.className = 'validation-message error';
            if (submitButton) submitButton.disabled = true;
        }
    }

    showAdminTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.textContent.includes(tabName === 'users' ? '학생 관리' : '과목 관리')) {
                btn.classList.add('active');
            }
        });

        // Show tab content
        document.querySelectorAll('.admin-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.getElementById(`admin-${tabName}`).classList.add('active');
    }

    // Utility functions
    getProgressColor(progress) {
        if (progress === 0) return 'progress-0';
        if (progress < 25) return 'progress-25';
        if (progress < 50) return 'progress-50';
        if (progress < 75) return 'progress-75';
        if (progress < 100) return 'progress-100';
        return 'progress-100';
    }

    getProgressColorHex(progress) {
        if (progress === 0) return '#BDC3C7';
        if (progress < 25) return '#F39C12';
        if (progress < 50) return '#E67E22';
        if (progress < 75) return '#27AE60';
        return '#3498DB';
    }

    calculateProgressSummary(users, userProgress, userCourses) {
        return users.map(user => {
            // 해당 사용자의 과목들
            const userCoursesForUser = userCourses.filter(uc => uc.userId === user.id || uc.user_id === user.id);
            
            const courseProgress = userCoursesForUser.map(uc => {
                // Supabase와 localStorage 형식 모두 지원
                const courseId = uc.courseId || uc.course_id;
                const course = uc.course || uc.courses;
                
                // 해당 과목의 모든 강의 ID 가져오기 (비동기이므로 실제로는 별도 처리 필요)
                const lessons = []; // 임시로 빈 배열, 실제로는 getLessonsByCourseId 호출 필요
                
                const userLessonsProgress = userProgress.filter(up => 
                    (up.userId === user.id || up.user_id === user.id) && 
                    lessons.some(lesson => lesson.id === (up.lessonId || up.lesson_id))
                );
                
                const completedCount = userLessonsProgress.filter(up => up.completed).length;
                const progressPercentage = lessons.length > 0 ? 
                    Math.round((completedCount / lessons.length) * 100) : 0;

                return {
                    courseId: course?.id || courseId,
                    courseCode: course?.courseCode || course?.course_code,
                    courseName: course?.courseName || course?.course_name,
                    progress: progressPercentage
                };
            });

            // 전체 진도율 계산
            let totalLessons = 0;
            let totalCompleted = 0;
            
            courseProgress.forEach(cp => {
                // 실제로는 각 과목의 강의 수를 가져와야 함
                const lessonCount = 15; // 임시로 기본값 사용
                totalLessons += lessonCount;
                totalCompleted += Math.round(lessonCount * (cp.progress / 100));
            });

            const overallProgress = totalLessons > 0 ? 
                Math.round((totalCompleted / totalLessons) * 100) : 0;

            return {
                userId: user.id,
                userName: user.name,
                department: user.department,
                overallProgress,
                courseProgress
            };
        }).sort((a, b) => b.overallProgress - a.overallProgress);
    }

    // 캐싱 및 성능 최적화 메서드들
    async getCachedDashboardData() {
        const startTime = performance.now();
        const now = Date.now();
        const CACHE_DURATION = 60000; // 1분 캐시

        this.cache.stats.totalRequests++;
        
        if (this.cache.dashboardData && 
            this.cache.lastUpdate && 
            (now - this.cache.lastUpdate) < CACHE_DURATION) {
            this.cache.stats.cacheHits++;
            const cacheTime = performance.now() - startTime;
            const hitRate = ((this.cache.stats.cacheHits / this.cache.stats.totalRequests) * 100).toFixed(1);
            console.log(`🎯 Dashboard data loaded from cache in: ${cacheTime.toFixed(1)}ms (Hit rate: ${hitRate}%)`);
            return this.cache.dashboardData;
        }

        this.cache.stats.dbQueries++;
        console.log('🔄 Fetching fresh dashboard data from database...');
        const dashboardData = await dataManager.getDashboardData();
        this.cache.dashboardData = dashboardData;
        this.cache.lastUpdate = now;
        
        const dbTime = performance.now() - startTime;
        const hitRate = ((this.cache.stats.cacheHits / this.cache.stats.totalRequests) * 100).toFixed(1);
        const queryReduction = (((this.cache.stats.totalRequests - this.cache.stats.dbQueries) / this.cache.stats.totalRequests) * 100).toFixed(1);
        
        console.log(`🚀 Dashboard data loaded from database in: ${dbTime.toFixed(1)}ms`);
        console.log(`📈 Cache stats - Hit rate: ${hitRate}%, DB queries reduced by: ${queryReduction}%`);
        
        return dashboardData;
    }

    async getCachedLessons(courseId) {
        if (this.cache.lessons.has(courseId)) {
            return this.cache.lessons.get(courseId);
        }

        const lessons = await dataManager.getCourseLessons(courseId);
        this.cache.lessons.set(courseId, lessons);
        return lessons;
    }

    invalidateCache() {
        this.cache.dashboardData = null;
        this.cache.lessons.clear();
        this.cache.lastUpdate = null;
    }

    async updateProgressDisplay(userId) {
        try {
            // 캐시 무효화 (새로운 진도 데이터 반영)
            this.invalidateCache();
            
            // 새로운 데이터로 진도율만 업데이트
            const dashboardData = await this.getCachedDashboardData();
            const currentUserSummary = dashboardData.progressSummary.find(u => u.userId === parseInt(userId));
            
            if (currentUserSummary) {
                // 전체 진도율 업데이트
                const overallProgress = currentUserSummary.overallProgress;
                document.getElementById('overall-progress-percentage').textContent = `${Math.round(overallProgress)}%`;
                
                // 가로 진도율 바 업데이트
                const progressBarFill = document.getElementById('progress-bar-fill');
                if (progressBarFill) {
                    progressBarFill.style.width = `${overallProgress}%`;
                }

                // 과목별 진도 바 업데이트
                this.updateCourseProgressBars(currentUserSummary);
            }
            
        } catch (error) {
            console.error('Error updating progress display:', error);
        }
    }

    updateCourseProgressBars(userSummary) {
        // 각 과목 카드의 진도 바를 개별적으로 업데이트
        userSummary.courseProgress.forEach(courseProgress => {
            const courseCard = document.querySelector(`[data-course-id="${courseProgress.courseId}"]`);
            if (courseCard) {
                const progressFill = courseCard.querySelector('.course-progress-fill');
                const progressInfo = courseCard.querySelector('.progress-info');
                
                if (progressFill) {
                    progressFill.style.width = `${courseProgress.progress}%`;
                }
                
                // 완료 강의 수도 업데이트
                const lessons = this.cache.lessons.get(courseProgress.courseId) || [];
                const completedCount = Math.round(lessons.length * (courseProgress.progress / 100));
                
                if (progressInfo) {
                    progressInfo.textContent = `${completedCount}/${lessons.length} 강의 완료 (${Math.round(courseProgress.progress)}%)`;
                }
            }
        });
    }

    createSkeletonLoader() {
        return `
            <div class="skeleton-grid">
                ${Array(3).fill(0).map(() => `
                    <div class="skeleton-card">
                        <div class="skeleton-header">
                            <div class="skeleton-line skeleton-title"></div>
                            <div class="skeleton-line skeleton-subtitle"></div>
                            <div class="skeleton-progress-bar"></div>
                        </div>
                        <div class="skeleton-body">
                            <div class="skeleton-line skeleton-info"></div>
                            <div class="skeleton-lessons">
                                ${Array(6).fill(0).map(() => `
                                    <div class="skeleton-lesson">
                                        <div class="skeleton-checkbox"></div>
                                        <div class="skeleton-line skeleton-lesson-name"></div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // 학생별 과목 관리 기능
    async loadStudentManagementOptions() {
        try {
            const users = await dataManager.getUsers();
            const studentSelect = document.getElementById('manage-student-select');
            
            studentSelect.innerHTML = '<option value="">학생을 선택하세요</option>';
            
            users.forEach(user => {
                const option = document.createElement('option');
                option.value = user.id;
                option.textContent = `${user.name} (${user.department || '학과 미정'})`;
                studentSelect.appendChild(option);
            });
        } catch (error) {
            console.error('학생 목록 로딩 오류:', error);
        }
    }

    async loadStudentCourses(userId) {
        if (!userId) {
            document.getElementById('student-course-content').style.display = 'none';
            return;
        }

        try {
            document.getElementById('student-course-content').style.display = 'block';
            
            // 현재 수강 중인 과목 로드
            await this.renderCurrentCourses(parseInt(userId));
            
            // 추가 가능한 과목 로드
            await this.renderAvailableCourses(parseInt(userId));
            
            // 학과 필터 이벤트 리스너 추가
            document.getElementById('available-course-department').onchange = () => {
                this.filterAvailableCourses(parseInt(userId));
            };
        } catch (error) {
            console.error('학생 과목 로딩 오류:', error);
        }
    }

    async renderCurrentCourses(userId) {
        try {
            const currentCoursesList = document.getElementById('current-courses-list');
            currentCoursesList.innerHTML = '<div class="loading">로딩 중...</div>';
            
            const userCourses = await dataManager.getUserCourses(userId);
            const courses = await dataManager.getCourses();
            
            const currentCourses = userCourses.map(uc => {
                const course = courses.find(c => c.id === uc.course_id || c.id === uc.courseId);
                return course;
            }).filter(c => c);
            
            if (currentCourses.length === 0) {
                currentCoursesList.innerHTML = '<div class="course-management-empty">등록된 과목이 없습니다.</div>';
                return;
            }
            
            currentCoursesList.innerHTML = currentCourses.map(course => `
                <div class="course-management-item">
                    <div class="course-management-info">
                        <div class="course-management-name">${course.courseName || course.course_name}</div>
                        <div class="course-management-code">${course.courseCode || course.course_code} • ${course.lessonCount || course.lesson_count || 15}강</div>
                    </div>
                    <div class="course-management-actions">
                        <button class="btn-remove-course" onclick="app.removeCourseFromStudent(${userId}, ${course.id})">
                            제거
                        </button>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error('현재 과목 렌더링 오류:', error);
            document.getElementById('current-courses-list').innerHTML = '<div class="error">과목을 불러오는 중 오류가 발생했습니다.</div>';
        }
    }

    async renderAvailableCourses(userId) {
        try {
            const availableCoursesList = document.getElementById('available-courses-list');
            availableCoursesList.innerHTML = '<div class="loading">로딩 중...</div>';
            
            const userCourses = await dataManager.getUserCourses(userId);
            const allCourses = await dataManager.getCourses();
            
            const enrolledCourseIds = userCourses.map(uc => uc.course_id || uc.courseId);
            const availableCourses = allCourses.filter(course => !enrolledCourseIds.includes(course.id));
            
            this.availableCourses = availableCourses; // 필터링을 위해 저장
            this.filterAvailableCourses(userId);
        } catch (error) {
            console.error('사용 가능한 과목 렌더링 오류:', error);
            document.getElementById('available-courses-list').innerHTML = '<div class="error">과목을 불러오는 중 오류가 발생했습니다.</div>';
        }
    }

    filterAvailableCourses(userId) {
        if (!this.availableCourses) return;
        
        const selectedDepartment = document.getElementById('available-course-department').value;
        const filteredCourses = selectedDepartment 
            ? this.availableCourses.filter(course => (course.department || course.course_department) === selectedDepartment)
            : this.availableCourses;
        
        const availableCoursesList = document.getElementById('available-courses-list');
        
        if (filteredCourses.length === 0) {
            availableCoursesList.innerHTML = '<div class="course-management-empty">추가 가능한 과목이 없습니다.</div>';
            return;
        }
        
        availableCoursesList.innerHTML = filteredCourses.map(course => `
            <div class="course-management-item">
                <div class="course-management-info">
                    <div class="course-management-name">${course.courseName || course.course_name}</div>
                    <div class="course-management-code">${course.courseCode || course.course_code} • ${course.lessonCount || course.lesson_count || 15}강</div>
                </div>
                <div class="course-management-actions">
                    <button class="btn-add-course" onclick="app.addCourseToStudent(${userId}, ${course.id})">
                        추가
                    </button>
                </div>
            </div>
        `).join('');
    }

    async addCourseToStudent(userId, courseId) {
        try {
            await dataManager.enrollUserInCourse(userId, courseId);
            
            // 과목 목록 새로고침
            await this.renderCurrentCourses(userId);
            await this.renderAvailableCourses(userId);
            
            // 대시보드도 새로고침
            this.cache.dashboardData = null; // 캐시 무효화
            await this.renderDashboard();
            
            alert('과목이 성공적으로 추가되었습니다.');
        } catch (error) {
            console.error('과목 추가 오류:', error);
            alert('과목 추가 중 오류가 발생했습니다.');
        }
    }

    async removeCourseFromStudent(userId, courseId) {
        if (confirm('이 과목을 정말 제거하시겠습니까? 해당 과목의 모든 진도 정보도 함께 삭제됩니다.')) {
            try {
                await dataManager.unenrollUserFromCourse(userId, courseId);
                
                // 과목 목록 새로고침
                await this.renderCurrentCourses(userId);
                await this.renderAvailableCourses(userId);
                
                // 대시보드도 새로고침
                this.cache.dashboardData = null; // 캐시 무효화
                await this.renderDashboard();
                
                alert('과목이 성공적으로 제거되었습니다.');
            } catch (error) {
                console.error('과목 제거 오류:', error);
                alert('과목 제거 중 오류가 발생했습니다.');
            }
        }
    }
}

// Global functions for inline event handlers  
window.showPage = (pageName) => app.showPage(pageName);
window.showAdminTab = (tabName) => app.showAdminTab(tabName);
window.filterCourses = (filterType) => app.filterCourses(filterType);
window.showGrade = (department, grade) => app.showGrade(department, grade);

// Course selection helper functions
window.toggleCourseSelection = (checkboxId) => {
    const checkbox = document.getElementById(checkboxId);
    if (checkbox) {
        checkbox.checked = !checkbox.checked;
        // 체크박스 상태가 변경된 것을 시각적으로 반영
        const courseCard = checkbox.closest('.course-card');
        if (courseCard) {
            if (checkbox.checked) {
                courseCard.classList.add('selected');
            } else {
                courseCard.classList.remove('selected');
            }
        }
    }
};

// Initialize app
const app = new KNOUTracker();