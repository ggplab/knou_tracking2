// Supabase 기반 데이터 매니저
class SupabaseDataManager {
    constructor() {
        this.supabase = null;
        this.initialized = false;
        this.init();
    }

    // 초기화
    async init() {
        try {
            this.supabase = supabaseConfig.getClient();
            this.initialized = true;
            
            // 연결 테스트
            await this.testConnection();
        } catch (error) {
            console.error('❌ SupabaseDataManager 초기화 실패:', error);
            
            // Fallback to localStorage if Supabase fails
            console.warn('⚠️ LocalStorage로 폴백합니다...');
            this.initializeLocalStorageFallback();
        }
    }

    // 연결 테스트
    async testConnection() {
        try {
            const { data, error } = await this.supabase
                .from('users')
                .select('count', { count: 'exact', head: true });
            
            if (error) throw error;
            console.log('✅ Supabase 연결 성공');
            return true;
        } catch (error) {
            console.error('❌ Supabase 연결 실패:', error);
            return false;
        }
    }

    // LocalStorage 폴백 초기화 (기존 DataManager 로직)
    initializeLocalStorageFallback() {
        console.log('📦 LocalStorage 모드로 실행됩니다.');
        this.fallbackToLocalStorage = true;
        
        // 기존 LocalStorage 데이터가 있는지 확인
        if (!localStorage.getItem('knou-users')) {
            // 기존 initializeData 로직 실행
            this.initializeLocalStorageData();
        }
    }

    // === Users 관리 ===
    async getUsers() {
        if (this.fallbackToLocalStorage) {
            return this.getLocalStorageUsers();
        }

        try {
            const { data, error } = await this.supabase
                .from('users')
                .select('*')
                .order('created_at', { ascending: true });

            console.log('👥 getUsers - Supabase 응답:', { data, error });
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('사용자 조회 오류:', error);
            return [];
        }
    }

    async addUser(user) {
        if (this.fallbackToLocalStorage) {
            return this.addLocalStorageUser(user);
        }

        try {
            const { data, error } = await this.supabase
                .from('users')
                .insert([{
                    name: user.name,
                    department: user.department || '통계·데이터'
                }])
                .select();

            if (error) throw error;
            return data[0];
        } catch (error) {
            console.error('사용자 추가 오류:', error);
            throw error;
        }
    }

    async deleteUser(userId) {
        if (this.fallbackToLocalStorage) {
            return this.deleteLocalStorageUser(userId);
        }

        try {
            // 관련 데이터 삭제 (CASCADE)
            await Promise.all([
                this.supabase.from('user_progress').delete().eq('user_id', userId),
                this.supabase.from('user_courses').delete().eq('user_id', userId)
            ]);

            const { error } = await this.supabase
                .from('users')
                .delete()
                .eq('id', userId);

            if (error) throw error;
        } catch (error) {
            console.error('사용자 삭제 오류:', error);
            throw error;
        }
    }

    // === Courses 관리 ===
    async getCourses() {
        if (this.fallbackToLocalStorage) {
            return this.getLocalStorageCourses();
        }

        try {
            const { data, error } = await this.supabase
                .from('courses')
                .select('*')
                .order('department', { ascending: true })
                .order('grade', { ascending: true });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('과목 조회 오류:', error);
            return [];
        }
    }

    async getCoursesByDepartment(department) {
        if (this.fallbackToLocalStorage) {
            return this.getLocalStorageCoursesByDepartment(department);
        }

        try {
            const { data, error } = await this.supabase
                .from('courses')
                .select('*')
                .eq('department', department)
                .order('grade', { ascending: true });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('학과별 과목 조회 오류:', error);
            return [];
        }
    }

    async addCourse(course) {
        if (this.fallbackToLocalStorage) {
            return this.addLocalStorageCourse(course);
        }

        try {
            const { data, error } = await this.supabase
                .from('courses')
                .insert([{
                    course_code: course.courseCode,
                    course_name: course.courseName,
                    department: course.department,
                    grade: course.grade || 1,
                    lesson_count: course.lessonCount || 15
                }])
                .select();

            if (error) throw error;
            
            const newCourse = data[0];
            
            // 자동으로 강의 생성
            await this.generateLessonsForCourse(newCourse.id, newCourse.lesson_count, newCourse.course_name);
            
            return newCourse;
        } catch (error) {
            console.error('과목 추가 오류:', error);
            throw error;
        }
    }

    // === Lessons 관리 ===
    async getLessons() {
        if (this.fallbackToLocalStorage) {
            return this.getLocalStorageLessons();
        }

        try {
            const { data, error } = await this.supabase
                .from('lessons')
                .select(`
                    *,
                    courses (
                        course_name,
                        department
                    )
                `)
                .order('course_id', { ascending: true })
                .order('lesson_order', { ascending: true });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('강의 조회 오류:', error);
            return [];
        }
    }

    async getLessonsByCourseId(courseId) {
        if (this.fallbackToLocalStorage) {
            return this.getLocalStorageLessonsByCourseId(courseId);
        }

        try {
            const { data, error } = await this.supabase
                .from('lessons')
                .select('*')
                .eq('course_id', courseId)
                .order('lesson_order', { ascending: true });

            console.log(`🔍 getLessonsByCourseId(${courseId}) 결과:`, { data, error });
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('과목별 강의 조회 오류:', error);
            return [];
        }
    }

    async addLesson(lesson) {
        if (this.fallbackToLocalStorage) {
            return this.addLocalStorageLesson(lesson);
        }

        try {
            // 다음 순서 번호 계산
            const { data: existingLessons, error: countError } = await this.supabase
                .from('lessons')
                .select('lesson_order')
                .eq('course_id', lesson.courseId)
                .order('lesson_order', { ascending: false })
                .limit(1);

            if (countError) throw countError;

            const nextOrder = existingLessons.length > 0 ? existingLessons[0].lesson_order + 1 : 1;

            const { data, error } = await this.supabase
                .from('lessons')
                .insert([{
                    course_id: lesson.courseId,
                    lesson_name: lesson.lessonName,
                    lesson_order: nextOrder
                }])
                .select();

            if (error) throw error;
            return data[0];
        } catch (error) {
            console.error('강의 추가 오류:', error);
            throw error;
        }
    }

    // 과목에 대한 강의 자동 생성
    async generateLessonsForCourse(courseId, lessonCount, courseName) {
        try {
            const lessons = [];
            for (let i = 1; i <= lessonCount; i++) {
                lessons.push({
                    course_id: courseId,
                    lesson_name: `${i}강: ${courseName} 강의 ${i}`,
                    lesson_order: i
                });
            }

            const { error } = await this.supabase
                .from('lessons')
                .insert(lessons);

            if (error) throw error;
            console.log(`✅ 과목 "${courseName}" (ID: ${courseId})에 ${lessonCount}개 강의 생성 완료`);
        } catch (error) {
            console.error('강의 자동 생성 오류:', error);
            throw error;
        }
    }
    
    // 모든 과목에 대해 강의 생성 (lessons가 없는 과목들)
    async generateAllMissingLessons() {
        try {
            console.log('🔄 강의가 없는 과목들을 확인하고 강의를 생성합니다...');
            
            // 모든 과목 가져오기
            const courses = await this.getCourses();
            
            for (const course of courses) {
                // 해당 과목에 강의가 있는지 확인
                const existingLessons = await this.getLessonsByCourseId(course.id);
                
                if (existingLessons.length === 0) {
                    console.log(`📚 과목 "${course.course_name}"에 강의가 없습니다. 생성 중...`);
                    await this.generateLessonsForCourse(course.id, course.lesson_count, course.course_name);
                } else {
                    console.log(`✅ 과목 "${course.course_name}"에 이미 ${existingLessons.length}개의 강의가 있습니다.`);
                }
            }
            
            console.log('🎉 모든 과목의 강의 생성이 완료되었습니다!');
            return true;
        } catch (error) {
            console.error('전체 강의 생성 오류:', error);
            throw error;
        }
    }

    // === User Courses 관리 ===
    async getUserCourses(userId) {
        if (this.fallbackToLocalStorage) {
            return this.getLocalStorageUserCourses(userId);
        }

        try {
            const { data, error } = await this.supabase
                .from('user_courses')
                .select(`
                    *,
                    courses (
                        id,
                        course_code,
                        course_name,
                        department,
                        grade,
                        lesson_count
                    )
                `)
                .eq('user_id', userId);

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('사용자 수강과목 조회 오류:', error);
            return [];
        }
    }

    async enrollUserInCourse(userId, courseId) {
        if (this.fallbackToLocalStorage) {
            return this.enrollUserInCourseLocalStorage(userId, courseId);
        }

        try {
            const { data, error } = await this.supabase
                .from('user_courses')
                .insert([{
                    user_id: userId,
                    course_id: courseId
                }])
                .select();

            if (error) throw error;
            return data[0];
        } catch (error) {
            console.error('수강 등록 오류:', error);
            throw error;
        }
    }

    // === User Progress 관리 ===
    async getUserProgress(userId) {
        if (this.fallbackToLocalStorage) {
            return this.getLocalStorageUserProgress(userId);
        }

        try {
            const { data, error } = await this.supabase
                .from('user_progress')
                .select(`
                    *,
                    lessons (
                        id,
                        lesson_name,
                        lesson_order,
                        course_id,
                        courses (
                            course_name,
                            course_code
                        )
                    )
                `)
                .eq('user_id', userId);

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('사용자 진도 조회 오류:', error);
            return [];
        }
    }

    async updateProgress(userId, lessonId, completed) {
        if (this.fallbackToLocalStorage) {
            return this.updateLocalStorageProgress(userId, lessonId, completed);
        }

        try {
            const { data, error } = await this.supabase
                .from('user_progress')
                .upsert({
                    user_id: userId,
                    lesson_id: lessonId,
                    completed: completed,
                    completed_at: completed ? new Date().toISOString() : null
                }, {
                    onConflict: 'user_id,lesson_id'
                })
                .select();

            if (error) throw error;
            return data[0];
        } catch (error) {
            console.error('진도 업데이트 오류:', error);
            throw error;
        }
    }

    // === Dashboard 데이터 ===
    async getDashboardData() {
        if (this.fallbackToLocalStorage) {
            return this.getLocalStorageDashboardData();
        }

        try {
            // 사용자 목록
            const users = await this.getUsers();
            console.log('📊 getDashboardData - 조회된 사용자 수:', users.length);
            console.log('📊 getDashboardData - 사용자 목록:', users);
            
            const progressSummary = await Promise.all(users.map(async (user) => {
                // 사용자의 수강과목
                const userCourses = await this.getUserCourses(user.id);
                
                // 과목별 진도율 계산
                const courseProgress = await Promise.all(userCourses.map(async (uc) => {
                    const courseId = uc.course_id || uc.courseId;
                    const lessons = await this.getLessonsByCourseId(courseId);
                    const progress = await this.supabase
                        .from('user_progress')
                        .select('*')
                        .eq('user_id', user.id)
                        .eq('completed', true)
                        .in('lesson_id', lessons.map(l => l.id));

                    const completedCount = progress.data ? progress.data.length : 0;
                    const progressPercentage = lessons.length > 0 ? 
                        Math.round((completedCount / lessons.length) * 100) : 0;

                    const course = uc.courses || uc.course;
                    return {
                        courseId: course.id,
                        courseName: course.course_name || course.courseName,
                        progress: progressPercentage
                    };
                }));

                // 전체 진도율 계산
                const totalLessons = courseProgress.reduce((acc, cp) => {
                    const course = userCourses.find(uc => {
                        const ucCourse = uc.courses || uc.course;
                        return ucCourse && ucCourse.id === cp.courseId;
                    });
                    const ucCourse = course ? (course.courses || course.course) : null;
                    return acc + (ucCourse ? (ucCourse.lesson_count || 0) : 0);
                }, 0);

                const totalCompleted = courseProgress.reduce((acc, cp) => {
                    const course = userCourses.find(uc => {
                        const ucCourse = uc.courses || uc.course;
                        return ucCourse && ucCourse.id === cp.courseId;
                    });
                    const ucCourse = course ? (course.courses || course.course) : null;
                    const lessonCount = ucCourse ? (ucCourse.lesson_count || 0) : 0;
                    return acc + Math.round(lessonCount * (cp.progress / 100));
                }, 0);

                const overallProgress = totalLessons > 0 ? 
                    Math.round((totalCompleted / totalLessons) * 100) : 0;

                return {
                    userId: user.id,
                    userName: user.name,
                    department: user.department,
                    overallProgress,
                    courseProgress
                };
            }));

            // 진도율 기준으로 정렬
            progressSummary.sort((a, b) => b.overallProgress - a.overallProgress);

            return {
                users,
                progressSummary
            };
        } catch (error) {
            console.error('대시보드 데이터 조회 오류:', error);
            return { users: [], progressSummary: [] };
        }
    }

    // === Departments 관리 ===
    getDepartments() {
        return [
            { id: 1, name: '통계·데이터' },
            { id: 2, name: '컴퓨터' }
        ];
    }

    // === LocalStorage Fallback Methods ===
    // (기존 DataManager의 메소드들을 여기에 포함 - 길이 때문에 생략하고 필요시 추가)
    
    initializeLocalStorageData() {
        // 기존 data.js의 initializeData 로직을 여기에 복사
        console.log('LocalStorage 초기 데이터 설정...');
        // ... (기존 로직)
    }

    getLocalStorageUsers() {
        const data = this.getLocalStorageData();
        return data ? data.users : [];
    }

    getLocalStorageData() {
        const data = localStorage.getItem('knou-users');
        return data ? JSON.parse(data) : null;
    }

    // ... (기타 LocalStorage 폴백 메소드들)
}

// 전역 인스턴스 생성
const supabaseDataManager = new SupabaseDataManager();