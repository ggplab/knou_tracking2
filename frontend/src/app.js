// Main application logic for KNOU tracking system

class KNOUTracker {
    constructor() {
        this.currentPage = 'dashboard';
        this.currentStudent = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderDashboard();
        this.renderAdmin();
        this.renderRegister();
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

    showPage(pageName) {
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
            this.renderDashboard();
        } else if (pageName === 'admin') {
            this.renderAdmin();
        } else if (pageName === 'register') {
            this.renderRegister();
        }
    }

    renderDashboard() {
        const dashboardData = dataManager.getDashboardData();
        const studentGrid = document.getElementById('student-grid');
        
        studentGrid.innerHTML = '';

        dashboardData.progressSummary.forEach((student, index) => {
            const studentCard = this.createStudentCard(student, index + 1);
            studentGrid.appendChild(studentCard);
        });

        // Update stats
        const totalStudents = dashboardData.users.length;
        const avgProgress = Math.round(
            dashboardData.progressSummary.reduce((acc, s) => acc + s.overallProgress, 0) / totalStudents
        );

        document.querySelector('.stat-card:first-child .stat-value').textContent = totalStudents;
        document.querySelector('.stat-card:last-child .stat-value').textContent = `${avgProgress}%`;
    }

    createStudentCard(student, rank) {
        const card = document.createElement('div');
        card.className = 'student-card fade-in';
        card.onclick = () => this.showStudentDetail(student.userId);

        const progressColor = this.getProgressColor(student.overallProgress);
        
        // Get user department
        const user = dataManager.getUsers().find(u => u.id === student.userId);
        const department = user ? user.department : '';

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

    showStudentDetail(userId) {
        this.currentStudent = userId;
        const user = dataManager.getUsers().find(u => u.id === userId);
        const userCourses = dataManager.getUserCourses(userId);
        const userProgress = dataManager.getUserProgress(userId);

        // Update student name
        document.getElementById('student-name').textContent = user.name;

        // Calculate overall progress
        const totalLessons = userCourses.reduce((acc, uc) => {
            return acc + dataManager.getLessonsByCourseId(uc.courseId).length;
        }, 0);

        const completedLessons = userProgress.filter(up => up.completed).length;
        const overallProgress = totalLessons > 0 ? 
            Math.round((completedLessons / totalLessons) * 100) : 0;

        // Update progress circle
        this.updateProgressCircle(overallProgress);

        // Render courses
        this.renderStudentCourses(userCourses, userProgress);

        // Show student detail page
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        document.getElementById('student-detail-page').classList.add('active');
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

    renderStudentCourses(userCourses, userProgress) {
        const courseList = document.getElementById('course-list');
        courseList.innerHTML = '';

        userCourses.forEach(uc => {
            const lessons = dataManager.getLessonsByCourseId(uc.courseId);
            const courseProgress = userProgress.filter(up => 
                lessons.some(l => l.id === up.lessonId)
            );
            const completedCount = courseProgress.filter(p => p.completed).length;
            const progressPercentage = lessons.length > 0 ? 
                Math.round((completedCount / lessons.length) * 100) : 0;

            const courseCard = this.createCourseCard(uc.course, lessons, courseProgress, progressPercentage);
            courseList.appendChild(courseCard);
        });
    }

    createCourseCard(course, lessons, progress, progressPercentage) {
        const card = document.createElement('div');
        card.className = 'course-card fade-in';

        const progressColor = this.getProgressColor(progressPercentage);

        card.innerHTML = `
            <div class="course-header">
                <h3 class="course-title">${course.courseName} (${course.courseCode})</h3>
                <div class="course-progress-detail">
                    <div class="progress-bar">
                        <div class="progress-fill ${progressColor}" style="width: ${progressPercentage}%"></div>
                    </div>
                    <span style="color: white; font-weight: 600; margin-left: 1rem;">${progressPercentage}%</span>
                </div>
            </div>
            
            <div class="lesson-grid">
                ${lessons.map(lesson => {
                    const lessonProgress = progress.find(p => p.lessonId === lesson.id);
                    const isCompleted = lessonProgress ? lessonProgress.completed : false;
                    
                    return `
                        <div class="lesson-item ${isCompleted ? 'completed' : ''}">
                            <input type="checkbox" 
                                   class="lesson-checkbox" 
                                   ${isCompleted ? 'checked' : ''}
                                   onchange="app.toggleLessonProgress(${lesson.id}, this.checked)">
                            <label class="lesson-name">${lesson.lessonName}</label>
                        </div>
                    `;
                }).join('')}
            </div>
        `;

        return card;
    }

    toggleLessonProgress(lessonId, completed) {
        if (!this.currentStudent) return;

        dataManager.updateProgress(this.currentStudent, lessonId, completed);
        
        // Refresh the student detail view
        this.showStudentDetail(this.currentStudent);
        
        // Also refresh dashboard if it's visible or will be visible next
        if (this.currentPage === 'dashboard') {
            this.renderDashboard();
        }
    }

    // Admin functionality
    renderAdmin() {
        this.renderUserList();
        this.renderCourseList();
        this.renderCourseTree();
    }

    renderUserList() {
        const userList = document.getElementById('user-list');
        const users = dataManager.getUsers();

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
    }

    renderCourseList() {
        const courseSelect = document.getElementById('lesson-course-select');
        const courses = dataManager.getCourses();

        courseSelect.innerHTML = '<option value="">과목 선택</option>';

        courses.forEach(course => {
            const option = document.createElement('option');
            option.value = course.id;
            option.textContent = `${course.courseCode} - ${course.courseName}`;
            courseSelect.appendChild(option);
        });
    }

    renderCourseTree() {
        const courseTree = document.getElementById('course-tree');
        const courses = dataManager.getCourses();

        courseTree.innerHTML = '';

        courses.forEach(course => {
            const lessons = dataManager.getLessonsByCourseId(course.id);
            const courseNode = this.createCourseNode(course, lessons);
            courseTree.appendChild(courseNode);
        });
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
    handleAddUser(e) {
        e.preventDefault();
        const userName = document.getElementById('user-name').value.trim();
        
        if (!userName) return;

        const newUser = dataManager.addUser({ name: userName });
        
        // Auto-enroll in all available courses
        const courses = dataManager.getCourses();
        courses.forEach(course => {
            dataManager.enrollUserInCourse(newUser.id, course.id);
        });

        document.getElementById('user-name').value = '';
        this.renderUserList();
        this.renderDashboard();
    }

    handleAddCourse(e) {
        e.preventDefault();
        const courseCode = document.getElementById('course-code').value.trim();
        const courseName = document.getElementById('course-name').value.trim();
        const department = document.getElementById('course-department').value;
        const lessonCount = parseInt(document.getElementById('course-lesson-count').value) || 15;
        
        if (!courseCode || !courseName || !department) return;

        dataManager.addCourse({ courseCode, courseName, department, lessonCount });

        document.getElementById('course-code').value = '';
        document.getElementById('course-name').value = '';
        document.getElementById('course-department').value = '';
        document.getElementById('course-lesson-count').value = 15;
        this.renderCourseList();
        this.renderCourseTree();
    }

    handleAddLesson(e) {
        e.preventDefault();
        const courseId = parseInt(document.getElementById('lesson-course-select').value);
        const lessonName = document.getElementById('lesson-name').value.trim();
        
        if (!courseId || !lessonName) return;

        dataManager.addLesson({ courseId, lessonName });

        document.getElementById('lesson-name').value = '';
        this.renderCourseTree();
    }

    deleteUser(userId) {
        if (confirm('이 학생을 정말 삭제하시겠습니까?')) {
            dataManager.deleteUser(userId);
            this.renderUserList();
            this.renderDashboard();
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

        departments.forEach(dept => {
            const option = document.createElement('option');
            option.value = dept.name;
            option.textContent = dept.name;
            departmentSelect.appendChild(option);
        });
    }

    loadCoursesByDepartment() {
        const department = document.getElementById('register-department').value;
        const courseSelection = document.getElementById('course-selection');

        if (!department) {
            courseSelection.innerHTML = '<p class="course-selection-note">학과를 먼저 선택해주세요.</p>';
            return;
        }

        const courses = dataManager.getCoursesByDepartment(department);
        
        if (courses.length === 0) {
            courseSelection.innerHTML = '<p class="course-selection-note">해당 학과의 과목이 없습니다.</p>';
            return;
        }

        // Group courses by grade
        const coursesByGrade = {};
        courses.forEach(course => {
            if (!coursesByGrade[course.grade]) {
                coursesByGrade[course.grade] = [];
            }
            coursesByGrade[course.grade].push(course);
        });

        const gradeLabels = { 1: '1학년', 2: '2학년', 3: '3학년', 4: '4학년' };
        
        courseSelection.innerHTML = `
            <div class="course-table-container">
                ${Object.keys(coursesByGrade).sort().map(grade => `
                    <div class="grade-section">
                        <h4 class="grade-header">${gradeLabels[grade]} 과목</h4>
                        <div class="course-table">
                            ${coursesByGrade[grade].map(course => `
                                <div class="course-row">
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
        `;
    }

    handleRegister(e) {
        e.preventDefault();
        
        const name = document.getElementById('register-name').value.trim();
        const department = document.getElementById('register-department').value;
        const selectedCourses = Array.from(document.querySelectorAll('input[name="courses"]:checked'))
            .map(cb => parseInt(cb.value));

        if (!name || !department || selectedCourses.length === 0) {
            alert('모든 필드를 입력해주세요. 최소 1개 이상의 과목을 선택해주세요.');
            return;
        }

        // Add new user
        const newUser = dataManager.addUser({ name, department });

        // Enroll user in selected courses
        selectedCourses.forEach(courseId => {
            dataManager.enrollUserInCourse(newUser.id, courseId);
        });

        // Reset form and show success message
        this.resetRegisterForm();
        alert(`${name}님이 성공적으로 등록되었습니다!`);
        
        // Refresh dashboard
        this.renderDashboard();
        
        // Redirect to dashboard
        this.showPage('dashboard');
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

// Initialize app
const app = new KNOUTracker();