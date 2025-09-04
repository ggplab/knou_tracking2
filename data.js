// Mock data for KNOU tracking system
class DataManager {
    constructor() {
        this.initializeData();
    }

    initializeData() {
        // Initialize with sample data if not exists
        if (!localStorage.getItem('knou-users')) {
            const sampleData = {
                users: [
                    { id: 1, name: '임정', department: '통계·데이터', createdAt: new Date().toISOString() },
                    { id: 2, name: '최관수', department: '컴퓨터', createdAt: new Date().toISOString() },
                    { id: 3, name: '김서현', department: '컴퓨터', createdAt: new Date().toISOString() }
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

                ],
                userProgress: this.generateRealProgress()
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

    generateRealProgress() {
        const progress = [];
        let progressId = 1;
        const lessons = this.generateLessonsFromCourses();

        // Real user progress based on actual enrollment
        const realEnrollments = [
            // 임정 - 통계·데이터과학과 (6과목)
            { userId: 1, courseIds: [4, 19, 21, 40, 39, 45], completionRate: 0.75 },
            // 최관수 - 컴퓨터과학과 (5과목)  
            { userId: 2, courseIds: [48, 53, 35, 38, 41], completionRate: 0.6 },
            // 김서현 - 컴퓨터과학과 (3과목)
            { userId: 3, courseIds: [53, 40, 52], completionRate: 0.4 }
        ];

        for (const enrollment of realEnrollments) {
            for (const courseId of enrollment.courseIds) {
                const courseLessons = lessons.filter(l => l.courseId === courseId);
                const totalLessons = courseLessons.length;
                const lessonsToComplete = Math.floor(totalLessons * enrollment.completionRate);
                
                // Mark lessons as completed sequentially
                for (let i = 0; i < totalLessons; i++) {
                    const lessonId = courseLessons[i].id;
                    const completed = i < lessonsToComplete;
                    
                    progress.push({
                        id: progressId++,
                        userId: enrollment.userId,
                        lessonId,
                        completed,
                        completedAt: completed ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : null
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
        const data = localStorage.getItem('knou-users');
        return data ? JSON.parse(data) : null;
    }

    saveData(data) {
        localStorage.setItem('knou-users', JSON.stringify(data));
    }

    // Users
    getUsers() {
        const data = this.getData();
        return data ? data.users : [];
    }

    addUser(user) {
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

    deleteUser(userId) {
        const data = this.getData();
        data.users = data.users.filter(u => u.id !== userId);
        data.userCourses = data.userCourses.filter(uc => uc.userId !== userId);
        data.userProgress = data.userProgress.filter(up => up.userId !== userId);
        this.saveData(data);
    }

    // Courses
    getCourses() {
        const data = this.getData();
        return data ? data.courses : [];
    }

    addCourse(course) {
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
        const data = this.getData();
        return data ? data.departments : [];
    }

    getCoursesByDepartment(department) {
        const data = this.getData();
        return data ? data.courses.filter(c => c.department === department) : [];
    }

    // Lessons
    getLessons() {
        const data = this.getData();
        return data ? data.lessons : [];
    }

    getLessonsByCourseId(courseId) {
        const data = this.getData();
        return data ? data.lessons.filter(l => l.courseId === courseId) : [];
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
    getUserCourses(userId) {
        const data = this.getData();
        if (!data) return [];

        return data.userCourses
            .filter(uc => uc.userId === userId)
            .map(uc => {
                const course = data.courses.find(c => c.id === uc.courseId);
                return { ...uc, course };
            });
    }

    enrollUserInCourse(userId, courseId) {
        const data = this.getData();
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
    getUserProgress(userId) {
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

    updateProgress(userId, lessonId, completed) {
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
    getDashboardData() {
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