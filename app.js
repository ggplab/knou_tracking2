// Main application logic for KNOU tracking system

class KNOUTracker {
    constructor() {
        this.currentPage = 'dashboard';
        this.currentStudent = null;
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

        document.getElementById('add-course-form').addEventListener('submit', (e) => {
            this.handleAddCourse(e);
        });

        document.getElementById('add-lesson-form').addEventListener('submit', (e) => {
            this.handleAddLesson(e);
        });

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

            const dashboardData = await dataManager.getDashboardData();
            
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
        try {
            this.currentStudent = userId;
            
            // 로딩 상태 표시
            const courseList = document.getElementById('course-list');
            courseList.innerHTML = '<div class="loading">데이터를 불러오는 중...</div>';
            
            const users = await dataManager.getUsers();
            const user = users.find(u => u.id === userId);
            const userCourses = await dataManager.getUserCourses(userId);
            const userProgress = await dataManager.getUserProgress(userId);

        // Update student name
        document.getElementById('student-name').textContent = user.name;

            // Calculate overall progress
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

            // Update progress circle
            this.updateProgressCircle(overallProgress);

            // Render courses
            await this.renderStudentCourses(userCourses, userProgress);

            // Show student detail page
            document.querySelectorAll('.page').forEach(page => {
                page.classList.remove('active');
            });
            document.getElementById('student-detail-page').classList.add('active');
        } catch (error) {
            console.error('학생 상세 정보 표시 오류:', error);
            const courseList = document.getElementById('course-list');
            courseList.innerHTML = '<div class="error">학생 정보를 불러오는 중 오류가 발생했습니다.</div>';
        }
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

    // Admin functionality
    renderAdmin() {
        this.renderUserList();
        this.renderCourseList();
        this.renderCourseTree();
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

    async handleAddCourse(e) {
        e.preventDefault();
        const courseCode = document.getElementById('course-code').value.trim();
        const courseName = document.getElementById('course-name').value.trim();
        const department = document.getElementById('course-department').value;
        const lessonCount = parseInt(document.getElementById('course-lesson-count').value) || 15;
        
        if (!courseCode || !courseName || !department) return;

        try {
            await dataManager.addCourse({ courseCode, courseName, department, lessonCount });

            document.getElementById('course-code').value = '';
            document.getElementById('course-name').value = '';
            document.getElementById('course-department').value = '';
            document.getElementById('course-lesson-count').value = 15;
            await this.renderCourseList();
            await this.renderCourseTree();
        } catch (error) {
            console.error('과목 추가 오류:', error);
            alert('과목 추가 중 오류가 발생했습니다.');
        }
    }

    async handleAddLesson(e) {
        e.preventDefault();
        const courseId = parseInt(document.getElementById('lesson-course-select').value);
        const lessonName = document.getElementById('lesson-name').value.trim();
        
        if (!courseId || !lessonName) return;

        try {
            await dataManager.addLesson({ courseId, lessonName });

            document.getElementById('lesson-name').value = '';
            await this.renderCourseTree();
        } catch (error) {
            console.error('강의 추가 오류:', error);
            alert('강의 추가 중 오류가 발생했습니다.');
        }
    }

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
                                            <div class="course-card">
                                                <div class="course-checkbox">
                                                    <input type="checkbox" id="course-${course.id}" name="courses" value="${course.id}">
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
}

// Global functions for inline event handlers
window.showPage = (pageName) => app.showPage(pageName);
window.showAdminTab = (tabName) => app.showAdminTab(tabName);
window.filterCourses = (filterType) => app.filterCourses(filterType);
window.showGrade = (department, grade) => app.showGrade(department, grade);

// Initialize app
const app = new KNOUTracker();