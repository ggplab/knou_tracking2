// KNOU tracking system data manager with Supabase support
class DataManager {
    constructor() {
        this.useSupabase = false;
        this.supabaseManager = null;
        this.initialized = false;
        this.initializeDataManager();
    }

    async initializeDataManager() {
        // Supabase 사용 가능한지 확인
        try {
            if (typeof supabaseConfig !== 'undefined' && supabaseConfig.initialized) {
                this.supabaseManager = new SupabaseDataManager();
                await this.supabaseManager.init();
                
                if (this.supabaseManager.initialized && !this.supabaseManager.fallbackToLocalStorage) {
                    this.useSupabase = true;
                    console.log('✅ Supabase 모드로 실행');
                    
                    // Supabase 연결 성공 시 기존 localStorage 데이터 정리
                    if (localStorage.getItem('knou-users')) {
                        console.log('🧹 기존 localStorage 데이터 정리 중...');
                        localStorage.removeItem('knou-users');
                    }
                    this.initialized = true;
                    return;
                }
            }
        } catch (error) {
            console.warn('⚠️ Supabase 초기화 실패, LocalStorage로 폴백:', error);
        }

        // LocalStorage 모드로 폴백
        console.log('📦 LocalStorage 모드로 실행');
        this.useSupabase = false;
        this.initializeData();
        this.initialized = true;
    }

    initializeData() {
        // Supabase를 사용하는 경우 localStorage 샘플 데이터는 불필요
        if (this.useSupabase) {
            return;
        }
        
        // LocalStorage 모드에서만 샘플 데이터 초기화
        if (!localStorage.getItem('knou-users')) {
            const sampleData = {
                users: [
                    { id: 1, name: '김학생', department: '통계·데이터', createdAt: new Date().toISOString() },
                    { id: 2, name: '이학생', department: '컴퓨터', createdAt: new Date().toISOString() },
                    { id: 3, name: '박학생', department: '통계·데이터', createdAt: new Date().toISOString() },
                    { id: 4, name: '정학생', department: '컴퓨터', createdAt: new Date().toISOString() },
                    { id: 5, name: '최학생', department: '통계·데이터', createdAt: new Date().toISOString() }
                ],
                departments: [
                    { id: 1, name: '통계·데이터' },
                    { id: 2, name: '컴퓨터' }
                ],
                courses: [
                    // 통계·데이터과 과목들
                    { id: 1, courseCode: '124', courseName: '인간과과학', department: '통계·데이터', grade: 1, lessonCount: 15, createdAt: new Date().toISOString() },
                    { id: 2, courseCode: '171', courseName: '대학영어', department: '통계·데이터', grade: 1, lessonCount: 15, createdAt: new Date().toISOString() },
                    { id: 3, courseCode: '173', courseName: '심리학에게묻다', department: '통계·데이터', grade: 1, lessonCount: 15, createdAt: new Date().toISOString() },
                    { id: 4, courseCode: '500', courseName: '원격대학교육의이해', department: '통계·데이터', grade: 1, lessonCount: 7, createdAt: new Date().toISOString() },
                    { id: 5, courseCode: '35101', courseName: '통계로세상읽기', department: '통계·데이터', grade: 1, lessonCount: 15, createdAt: new Date().toISOString() },
                    { id: 6, courseCode: '35105', courseName: '데이터과학개론', department: '통계·데이터', grade: 1, lessonCount: 15, createdAt: new Date().toISOString() },
                    { id: 7, courseCode: '35106', courseName: '파이썬컴퓨팅', department: '통계·데이터', grade: 1, lessonCount: 15, createdAt: new Date().toISOString() },
                    
                    { id: 8, courseCode: '106', courseName: '철학의이해', department: '통계·데이터', grade: 2, lessonCount: 15, createdAt: new Date().toISOString() },
                    { id: 9, courseCode: '201', courseName: '대학수학의이해', department: '통계·데이터', grade: 2, lessonCount: 15, createdAt: new Date().toISOString() },
                    { id: 10, courseCode: '500', courseName: '원격대학교육의이해', department: '통계·데이터', grade: 2, lessonCount: 7, createdAt: new Date().toISOString() },
                    { id: 11, courseCode: '35227', courseName: '여론조사의이해', department: '통계·데이터', grade: 2, lessonCount: 15, createdAt: new Date().toISOString() },
                    { id: 12, courseCode: '35301', courseName: '파이썬과 R', department: '통계·데이터', grade: 2, lessonCount: 15, createdAt: new Date().toISOString() },
                    { id: 13, courseCode: '35457', courseName: '빅데이터의이해와활용', department: '통계·데이터', grade: 2, lessonCount: 15, createdAt: new Date().toISOString() },
                    { id: 14, courseCode: '43211', courseName: '경제학의이해', department: '통계·데이터', grade: 2, lessonCount: 15, createdAt: new Date().toISOString() },

                    { id: 15, courseCode: '500', courseName: '원격대학교육의이해', department: '통계·데이터', grade: 3, lessonCount: 7, createdAt: new Date().toISOString() },
                    { id: 16, courseCode: '21151', courseName: '생활법률', department: '통계·데이터', grade: 3, lessonCount: 15, createdAt: new Date().toISOString() },
                    { id: 17, courseCode: '35302', courseName: '파이썬데이터처리', department: '통계·데이터', grade: 3, lessonCount: 15, createdAt: new Date().toISOString() },
                    { id: 18, courseCode: '35313', courseName: '표본조사론', department: '통계·데이터', grade: 3, lessonCount: 15, createdAt: new Date().toISOString() },
                    { id: 19, courseCode: '35329', courseName: '바이오통계학', department: '통계·데이터', grade: 3, lessonCount: 15, createdAt: new Date().toISOString() },
                    { id: 20, courseCode: '35424', courseName: '실험계획과응용', department: '통계·데이터', grade: 3, lessonCount: 15, createdAt: new Date().toISOString() },
                    { id: 21, courseCode: '35455', courseName: '수리통계학', department: '통계·데이터', grade: 3, lessonCount: 15, createdAt: new Date().toISOString() },

                    { id: 22, courseCode: '476', courseName: '이슈로보는오늘날의유럽', department: '통계·데이터', grade: 4, lessonCount: 15, createdAt: new Date().toISOString() },
                    { id: 23, courseCode: '500', courseName: '원격대학교육의이해', department: '통계·데이터', grade: 4, lessonCount: 7, createdAt: new Date().toISOString() },
                    { id: 24, courseCode: '24455', courseName: '마케팅조사', department: '통계·데이터', grade: 4, lessonCount: 15, createdAt: new Date().toISOString() },
                    { id: 25, courseCode: '35402', courseName: '비정형데이터분석', department: '통계·데이터', grade: 4, lessonCount: 15, createdAt: new Date().toISOString() },
                    { id: 26, courseCode: '35458', courseName: 'R데이터분석', department: '통계·데이터', grade: 4, lessonCount: 15, createdAt: new Date().toISOString() },
                    { id: 27, courseCode: '35460', courseName: '베이즈데이터분석', department: '통계·데이터', grade: 4, lessonCount: 15, createdAt: new Date().toISOString() },
                    { id: 28, courseCode: '35461', courseName: '자연언어처리', department: '통계·데이터', grade: 4, lessonCount: 15, createdAt: new Date().toISOString() },
                    
                    // 컴퓨터과 과목들
                    { id: 29, courseCode: '171', courseName: '대학영어', department: '컴퓨터', grade: 1, lessonCount: 15, createdAt: new Date().toISOString() },
                    { id: 30, courseCode: '173', courseName: '심리학에게묻다', department: '컴퓨터', grade: 1, lessonCount: 15, createdAt: new Date().toISOString() },
                    { id: 31, courseCode: '500', courseName: '원격대학교육의이해', department: '컴퓨터', grade: 1, lessonCount: 7, createdAt: new Date().toISOString() },
                    { id: 32, courseCode: '26103', courseName: '대중영화의이해', department: '컴퓨터', grade: 1, lessonCount: 15, createdAt: new Date().toISOString() },
                    { id: 33, courseCode: '34204', courseName: '컴퓨터과학 개론', department: '컴퓨터', grade: 1, lessonCount: 15, createdAt: new Date().toISOString() },
                    { id: 34, courseCode: '34205', courseName: '멀티미디어시스템', department: '컴퓨터', grade: 1, lessonCount: 15, createdAt: new Date().toISOString() },
                    { id: 35, courseCode: '34308', courseName: 'C프로그래밍', department: '컴퓨터', grade: 1, lessonCount: 15, createdAt: new Date().toISOString() },

                    { id: 36, courseCode: '201', courseName: '대학수학의이해', department: '컴퓨터', grade: 2, lessonCount: 15, createdAt: new Date().toISOString() },
                    { id: 37, courseCode: '500', courseName: '원격대학교육의이해', department: '컴퓨터', grade: 2, lessonCount: 7, createdAt: new Date().toISOString() },
                    { id: 38, courseCode: '34206', courseName: '오픈소스기반데이터분석', department: '컴퓨터', grade: 2, lessonCount: 15, createdAt: new Date().toISOString() },
                    { id: 39, courseCode: '34310', courseName: '자료구조', department: '컴퓨터', grade: 2, lessonCount: 15, createdAt: new Date().toISOString() },
                    { id: 40, courseCode: '34353', courseName: '선형대수', department: '컴퓨터', grade: 2, lessonCount: 15, createdAt: new Date().toISOString() },
                    { id: 41, courseCode: '34354', courseName: '프로그래밍언어론', department: '컴퓨터', grade: 2, lessonCount: 15, createdAt: new Date().toISOString() },
                    { id: 42, courseCode: '43211', courseName: '경제학의이해', department: '컴퓨터', grade: 2, lessonCount: 15, createdAt: new Date().toISOString() },

                    { id: 43, courseCode: '500', courseName: '원격대학교육의이해', department: '컴퓨터', grade: 3, lessonCount: 7, createdAt: new Date().toISOString() },
                    { id: 44, courseCode: '21151', courseName: '생활법률', department: '컴퓨터', grade: 3, lessonCount: 15, createdAt: new Date().toISOString() },
                    { id: 45, courseCode: '34309', courseName: '컴퓨터구조', department: '컴퓨터', grade: 3, lessonCount: 15, createdAt: new Date().toISOString() },
                    { id: 46, courseCode: '34372', courseName: 'JSP프로그래밍', department: '컴퓨터', grade: 3, lessonCount: 15, createdAt: new Date().toISOString() },
                    { id: 47, courseCode: '34373', courseName: 'UNIX시스템', department: '컴퓨터', grade: 3, lessonCount: 15, createdAt: new Date().toISOString() },
                    { id: 48, courseCode: '34417', courseName: '시뮬레이션', department: '컴퓨터', grade: 3, lessonCount: 15, createdAt: new Date().toISOString() },
                    { id: 49, courseCode: '34478', courseName: '머신러닝', department: '컴퓨터', grade: 3, lessonCount: 15, createdAt: new Date().toISOString() },

                    { id: 50, courseCode: '500', courseName: '원격대학교육의이해', department: '컴퓨터', grade: 4, lessonCount: 7, createdAt: new Date().toISOString() },
                    { id: 51, courseCode: '24313', courseName: '경영전략론', department: '컴퓨터', grade: 4, lessonCount: 15, createdAt: new Date().toISOString() },
                    { id: 52, courseCode: '34401', courseName: '클라우드컴퓨팅', department: '컴퓨터', grade: 4, lessonCount: 15, createdAt: new Date().toISOString() },
                    { id: 53, courseCode: '34418', courseName: '컴파일러구성', department: '컴퓨터', grade: 4, lessonCount: 15, createdAt: new Date().toISOString() },
                    { id: 54, courseCode: '34479', courseName: '딥러닝', department: '컴퓨터', grade: 4, lessonCount: 15, createdAt: new Date().toISOString() },
                    { id: 55, courseCode: '35457', courseName: '빅데이터의이해와활용', department: '컴퓨터', grade: 4, lessonCount: 15, createdAt: new Date().toISOString() },
                    { id: 56, courseCode: '43312', courseName: '성,사랑,사회', department: '컴퓨터', grade: 4, lessonCount: 15, createdAt: new Date().toISOString() }
                ],
                lessons: this.generateLessonsFromCourses(),
                userCourses: [
                    // Each user enrolled in 5 courses (현실적인 과목 수)
                    { id: 1, userId: 1, courseId: 1, enrolledAt: new Date().toISOString() },
                    { id: 2, userId: 1, courseId: 2, enrolledAt: new Date().toISOString() },
                    { id: 3, userId: 1, courseId: 3, enrolledAt: new Date().toISOString() },
                    { id: 4, userId: 1, courseId: 4, enrolledAt: new Date().toISOString() },
                    { id: 5, userId: 1, courseId: 5, enrolledAt: new Date().toISOString() },

                    { id: 6, userId: 2, courseId: 1, enrolledAt: new Date().toISOString() },
                    { id: 7, userId: 2, courseId: 2, enrolledAt: new Date().toISOString() },
                    { id: 8, userId: 2, courseId: 3, enrolledAt: new Date().toISOString() },
                    { id: 9, userId: 2, courseId: 4, enrolledAt: new Date().toISOString() },
                    { id: 10, userId: 2, courseId: 5, enrolledAt: new Date().toISOString() },

                    { id: 11, userId: 3, courseId: 1, enrolledAt: new Date().toISOString() },
                    { id: 12, userId: 3, courseId: 2, enrolledAt: new Date().toISOString() },
                    { id: 13, userId: 3, courseId: 3, enrolledAt: new Date().toISOString() },
                    { id: 14, userId: 3, courseId: 4, enrolledAt: new Date().toISOString() },
                    { id: 15, userId: 3, courseId: 5, enrolledAt: new Date().toISOString() },

                    { id: 16, userId: 4, courseId: 1, enrolledAt: new Date().toISOString() },
                    { id: 17, userId: 4, courseId: 2, enrolledAt: new Date().toISOString() },
                    { id: 18, userId: 4, courseId: 3, enrolledAt: new Date().toISOString() },
                    { id: 19, userId: 4, courseId: 4, enrolledAt: new Date().toISOString() },
                    { id: 20, userId: 4, courseId: 5, enrolledAt: new Date().toISOString() },

                    { id: 21, userId: 5, courseId: 1, enrolledAt: new Date().toISOString() },
                    { id: 22, userId: 5, courseId: 2, enrolledAt: new Date().toISOString() },
                    { id: 23, userId: 5, courseId: 3, enrolledAt: new Date().toISOString() },
                    { id: 24, userId: 5, courseId: 4, enrolledAt: new Date().toISOString() },
                    { id: 25, userId: 5, courseId: 5, enrolledAt: new Date().toISOString() }
                ],
                userProgress: this.generateSampleProgress()
            };

            this.saveData(sampleData);
        }
    }

    generateLessonsFromCourses() {
        const lessons = [];
        let lessonId = 1;
        
        // Generate lessons for all courses (1-56) based on lessonCount
        for (let courseId = 1; courseId <= 56; courseId++) {
            // Get course info from the courses array
            let lessonCount = 15; // default
            let courseName = `과목 ${courseId}`;
            
            // Find specific lesson counts for known courses
            if (courseId === 4 || courseId === 10 || courseId === 15 || courseId === 23 || courseId === 31 || courseId === 37 || courseId === 43 || courseId === 50) {
                lessonCount = 7; // 원격대학교육의이해
            }
            
            for (let i = 1; i <= lessonCount; i++) {
                lessons.push({
                    id: lessonId++,
                    courseId: courseId,
                    lessonName: `${i}강: 강의 ${i}`,
                    lessonOrder: i
                });
            }
        }
        
        return lessons;
    }

    generateSampleProgress() {
        const progress = [];
        let progressId = 1;
        
        // Get the lessons that were just generated
        const lessons = this.generateLessonsFromCourses();

        // Generate different progress levels for each user
        for (let userId = 1; userId <= 5; userId++) {
            // Get user's courses based on department
            const userCourseIds = userId <= 3 ? [1, 2, 3, 4, 5] : [11, 12, 13, 14, 15]; // Sample course assignment
            
            for (const courseId of userCourseIds) {
                const courseLessons = lessons.filter(l => l.courseId === courseId);
                const totalLessons = courseLessons.length;
                
                // Generate different completion rates for variety
                let completionRate;
                switch (userId) {
                    case 1: completionRate = 0.9; break;  // 90%
                    case 2: completionRate = 0.75; break; // 75%
                    case 3: completionRate = 0.6; break;  // 60%
                    case 4: completionRate = 0.45; break; // 45%
                    case 5: completionRate = 0.3; break;  // 30%
                    default: completionRate = 0.5;
                }

                const lessonsToComplete = Math.floor(totalLessons * completionRate);
                
                // Mark lessons as completed
                for (let i = 0; i < totalLessons; i++) {
                    const lessonId = courseLessons[i].id;
                    const completed = i < lessonsToComplete;
                    
                    progress.push({
                        id: progressId++,
                        userId,
                        lessonId,
                        completed,
                        completedAt: completed ? new Date().toISOString() : null
                    });
                }
            }
        }

        return progress;
    }

    getLessonsByCourse(courseId) {
        // Return lessons based on courseId
        const lessonRanges = {
            1: { start: 1, end: 15 },   // CS101
            2: { start: 16, end: 30 },  // MATH201
            3: { start: 31, end: 45 },  // ENG301
            4: { start: 46, end: 60 },  // BUS401
            5: { start: 61, end: 75 }   // PHY101
        };

        const range = lessonRanges[courseId];
        const lessons = [];
        
        for (let i = range.start; i <= range.end; i++) {
            lessons.push({
                id: i,
                courseId,
                lessonName: `Lesson ${i}`,
                lessonOrder: i - range.start + 1
            });
        }
        
        return lessons;
    }

    // Data access methods
    getData() {
        // Supabase 모드에서는 localStorage를 사용하지 않음
        if (this.useSupabase) {
            return null;
        }
        
        const data = localStorage.getItem('knou-users');
        if (data) {
            return JSON.parse(data);
        } else {
            // 데이터가 없으면 초기화하고 반환
            this.initializeData();
            const newData = localStorage.getItem('knou-users');
            return JSON.parse(newData);
        }
    }

    saveData(data) {
        localStorage.setItem('knou-users', JSON.stringify(data));
    }

    // Users
    async getUsers() {
        if (this.useSupabase) {
            return await this.supabaseManager.getUsers();
        }
        
        const data = this.getData();
        return data ? data.users : [];
    }

    async addUser(user) {
        if (this.useSupabase) {
            return await this.supabaseManager.addUser(user);
        }
        
        const data = this.getData();
        const newId = Math.max(...data.users.map(u => u.id), 0) + 1;
        const newUser = {
            ...user,
            id: newId,
            department: user.department || '통계·데이터',
            createdAt: new Date().toISOString()
        };
        data.users.push(newUser);
        this.saveData(data);
        return newUser;
    }

    async deleteUser(userId) {
        if (this.useSupabase) {
            return await this.supabaseManager.deleteUser(userId);
        }
        
        const data = this.getData();
        data.users = data.users.filter(u => u.id !== userId);
        data.userCourses = data.userCourses.filter(uc => uc.userId !== userId);
        data.userProgress = data.userProgress.filter(up => up.userId !== userId);
        this.saveData(data);
    }

    // Courses
    async getCourses() {
        if (this.useSupabase) {
            const courses = await this.supabaseManager.getCourses();
            // 속성명을 JavaScript 코드에서 기대하는 형식으로 변환
            return courses.map(course => ({
                id: course.id,
                courseCode: course.course_code,
                courseName: course.course_name,
                department: course.department,
                grade: course.grade,
                lessonCount: course.lesson_count,
                createdAt: course.created_at || new Date().toISOString()
            }));
        }
        
        const data = this.getData();
        return data ? data.courses : [];
    }

    async addCourse(course) {
        if (this.useSupabase) {
            return await this.supabaseManager.addCourse(course);
        }
        
        const data = this.getData();
        const newId = Math.max(...data.courses.map(c => c.id), 0) + 1;
        const newCourse = {
            ...course,
            id: newId,
            lessonCount: course.lessonCount || 15,
            createdAt: new Date().toISOString()
        };
        data.courses.push(newCourse);
        
        // Auto-generate lessons for the new course
        const lessons = [];
        for (let i = 1; i <= newCourse.lessonCount; i++) {
            const newLessonId = Math.max(...data.lessons.map(l => l.id), 0) + lessons.length + 1;
            lessons.push({
                id: newLessonId,
                courseId: newId,
                lessonName: `${i}강: ${newCourse.courseName} 강의 ${i}`,
                lessonOrder: i
            });
        }
        data.lessons.push(...lessons);
        
        this.saveData(data);
        return newCourse;
    }

    // Departments
    getDepartments() {
        if (this.useSupabase) {
            // Supabase에서는 고정된 학과 정보 반환
            return [
                { id: 1, name: '통계·데이터' },
                { id: 2, name: '컴퓨터' }
            ];
        }
        
        const data = this.getData();
        return data ? data.departments : [];
    }

    async getCoursesByDepartment(department) {
        if (this.useSupabase) {
            const courses = await this.supabaseManager.getCoursesByDepartment(department);
            // 속성명을 JavaScript 코드에서 기대하는 형식으로 변환
            return courses.map(course => ({
                id: course.id,
                courseCode: course.course_code,
                courseName: course.course_name,
                department: course.department,
                grade: course.grade,
                lessonCount: course.lesson_count,
                createdAt: course.created_at || new Date().toISOString()
            }));
        }
        
        const data = this.getData();
        return data ? data.courses.filter(c => c.department === department) : [];
    }

    // Lessons
    async getLessons() {
        if (this.useSupabase) {
            return await this.supabaseManager.getLessons();
        }
        
        const data = this.getData();
        return data ? data.lessons : [];
    }

    async getLessonsByCourseId(courseId) {
        if (this.useSupabase) {
            return await this.supabaseManager.getLessonsByCourseId(courseId);
        }
        
        const data = this.getData();
        return data ? data.lessons.filter(l => l.courseId === courseId) : [];
    }
    
    // 모든 과목에 대해 강의 생성
    async generateAllMissingLessons() {
        if (this.useSupabase) {
            return await this.supabaseManager.generateAllMissingLessons();
        }
        
        console.log('localStorage 모드에서는 강의 자동 생성이 지원되지 않습니다.');
        return false;
    }

    addLesson(lesson) {
        const data = this.getData();
        const newId = Math.max(...data.lessons.map(l => l.id), 0) + 1;
        const courseLessons = data.lessons.filter(l => l.courseId === lesson.courseId);
        const newOrder = Math.max(...courseLessons.map(l => l.lessonOrder), 0) + 1;
        
        const newLesson = {
            ...lesson,
            id: newId,
            lessonOrder: newOrder
        };
        data.lessons.push(newLesson);
        this.saveData(data);
        return newLesson;
    }

    // User Courses
    async getUserCourses(userId) {
        if (this.useSupabase) {
            return await this.supabaseManager.getUserCourses(userId);
        }
        
        const data = this.getData();
        if (!data) return [];

        return data.userCourses
            .filter(uc => uc.userId === userId)
            .map(uc => {
                const course = data.courses.find(c => c.id === uc.courseId);
                return { ...uc, course };
            });
    }

    async enrollUserInCourse(userId, courseId) {
        if (this.useSupabase) {
            return await this.supabaseManager.enrollUserInCourse(userId, courseId);
        }
        
        const data = this.getData();
        if (!data || !data.userCourses) {
            throw new Error('데이터를 불러올 수 없습니다.');
        }
        
        const newId = Math.max(...data.userCourses.map(uc => uc.id), 0) + 1;
        
        const enrollment = {
            id: newId,
            userId,
            courseId,
            enrolledAt: new Date().toISOString()
        };
        
        data.userCourses.push(enrollment);
        this.saveData(data);
        return enrollment;
    }

    // User Progress
    async getUserProgress(userId) {
        if (this.useSupabase) {
            return await this.supabaseManager.getUserProgress(userId);
        }
        
        const data = this.getData();
        if (!data) return [];

        return data.userProgress
            .filter(up => up.userId === userId)
            .map(up => {
                const lesson = data.lessons.find(l => l.id === up.lessonId);
                const course = lesson ? data.courses.find(c => c.id === lesson.courseId) : null;
                return { ...up, lesson: { ...lesson, course } };
            });
    }

    async updateProgress(userId, lessonId, completed) {
        if (this.useSupabase) {
            return await this.supabaseManager.updateProgress(userId, lessonId, completed);
        }
        
        const data = this.getData();
        let progressRecord = data.userProgress.find(up => 
            up.userId === userId && up.lessonId === lessonId
        );

        if (progressRecord) {
            progressRecord.completed = completed;
            progressRecord.completedAt = completed ? new Date().toISOString() : null;
        } else {
            const newId = Math.max(...data.userProgress.map(up => up.id), 0) + 1;
            progressRecord = {
                id: newId,
                userId,
                lessonId,
                completed,
                completedAt: completed ? new Date().toISOString() : null
            };
            data.userProgress.push(progressRecord);
        }

        this.saveData(data);
        return progressRecord;
    }

    // Dashboard data
    async getDashboardData() {
        if (this.useSupabase) {
            return await this.supabaseManager.getDashboardData();
        }
        
        const data = this.getData();
        if (!data) return { users: [], progressSummary: [] };

        const progressSummary = data.users.map(user => {
            const userCourses = data.userCourses.filter(uc => uc.userId === user.id);
            const courseProgress = userCourses.map(uc => {
                const course = data.courses.find(c => c.id === uc.courseId);
                const lessons = data.lessons.filter(l => l.courseId === uc.courseId);
                const progress = data.userProgress.filter(up => 
                    up.userId === user.id && 
                    lessons.some(l => l.id === up.lessonId)
                );
                const completedCount = progress.filter(p => p.completed).length;
                const progressPercentage = lessons.length > 0 ? 
                    Math.round((completedCount / lessons.length) * 100) : 0;

                return {
                    courseId: course.id,
                    courseName: course.courseName,
                    progress: progressPercentage
                };
            });

            const totalLessons = courseProgress.reduce((acc, cp) => {
                const lessons = data.lessons.filter(l => l.courseId === cp.courseId);
                return acc + lessons.length;
            }, 0);

            const totalCompleted = courseProgress.reduce((acc, cp) => {
                const lessons = data.lessons.filter(l => l.courseId === cp.courseId);
                return acc + Math.round(lessons.length * (cp.progress / 100));
            }, 0);

            const overallProgress = totalLessons > 0 ? 
                Math.round((totalCompleted / totalLessons) * 100) : 0;

            return {
                userId: user.id,
                userName: user.name,
                overallProgress,
                courseProgress
            };
        });

        // Sort by overall progress descending
        progressSummary.sort((a, b) => b.overallProgress - a.overallProgress);

        return {
            users: data.users,
            progressSummary
        };
    }
}

// Create global instance
const dataManager = new DataManager();

// Supabase 데이터 관리 클래스 (별도 파일로 분리 가능)
class SupabaseDataManager {
    constructor() {
        this.supabase = null;
        this.initialized = false;
        this.fallbackToLocalStorage = false;
    }

    async init() {
        try {
            if (typeof supabase !== 'undefined' && supabase.createClient) {
                this.supabase = supabase.createClient(supabaseConfig.url, supabaseConfig.anonKey);
                
                // 연결 테스트
                const { data, error } = await this.supabase.from('users').select('id').limit(1);
                if (error) {
                    throw new Error(`Supabase 연결 테스트 실패: ${error.message}`);
                }
                
                this.initialized = true;
                console.log('🚀 Supabase 연결 성공');
            } else {
                throw new Error('Supabase 클라이언트가 정의되지 않았습니다.');
            }
        } catch (error) {
            console.error(error.message);
            this.fallbackToLocalStorage = true;
            this.initialized = false;
        }
    }

    async getUsers() {
        const { data, error } = await this.supabase.from('users').select('*');
        if (error) throw error;
        return data;
    }

    async addUser(user) {
        const { data, error } = await this.supabase.from('users').insert([{ name: user.name, department: user.department }]).select();
        if (error) throw error;
        return data[0];
    }

    async deleteUser(userId) {
        const { error } = await this.supabase.from('users').delete().eq('id', userId);
        if (error) throw error;
    }

    async getCourses() {
        const { data, error } = await this.supabase.from('courses').select('*');
        if (error) throw error;
        return data;
    }

    async addCourse(course) {
        const { data, error } = await this.supabase.from('courses').insert([{ 
            course_code: course.courseCode, 
            course_name: course.courseName,
            department: course.department,
            lesson_count: course.lessonCount
        }]).select();
        if (error) throw error;
        return data[0];
    }

    async getCoursesByDepartment(department) {
        const { data, error } = await this.supabase.from('courses').select('*').eq('department', department);
        if (error) throw error;
        return data;
    }

    async getLessons() {
        const { data, error } = await this.supabase.from('lessons').select('*');
        if (error) throw error;
        return data;
    }

    async getLessonsByCourseId(courseId) {
        const { data, error } = await this.supabase.from('lessons').select('*').eq('course_id', courseId);
        if (error) throw error;
        return data;
    }

    async addLesson(lesson) {
        const { data, error } = await this.supabase.from('lessons').insert([{ 
            course_id: lesson.courseId, 
            lesson_name: lesson.lessonName 
        }]).select();
        if (error) throw error;
        return data[0];
    }

    async getUserCourses(userId) {
        const { data, error } = await this.supabase
            .from('user_courses')
            .select('*, courses(*)')
            .eq('user_id', userId);
        if (error) throw error;
        return data;
    }

    async enrollUserInCourse(userId, courseId) {
        const { data, error } = await this.supabase.from('user_courses').insert([{ user_id: userId, course_id: courseId }]).select();
        if (error) throw error;
        return data[0];
    }

    async getUserProgress(userId) {
        const { data, error } = await this.supabase.from('user_progress').select('*').eq('user_id', userId);
        if (error) throw error;
        return data;
    }

    async updateProgress(userId, lessonId, completed) {
        const { data, error } = await this.supabase
            .from('user_progress')
            .upsert({ user_id: userId, lesson_id: lessonId, completed }, { onConflict: 'user_id, lesson_id' })
            .select();
        if (error) throw error;
        return data[0];
    }

    async getDashboardData() {
        const { data, error } = await this.supabase.rpc('get_dashboard_data');
        if (error) throw error;
        return data[0];
    }
    
    async generateAllMissingLessons() {
        const { data, error } = await this.supabase.rpc('generate_all_missing_lessons');
        if (error) {
            console.error('강의 자동 생성 실패:', error);
            return false;
        }
        console.log('강의 자동 생성 결과:', data);
        return data;
    }
}
