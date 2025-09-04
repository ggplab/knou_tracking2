// Supabase 설정
class SupabaseConfig {
    constructor() {
        // 환경 감지 (개발환경 vs 운영환경)
        const isDevelopment = window.location.hostname === 'localhost' || 
                             window.location.hostname === '127.0.0.1' ||
                             window.location.port !== '';

        // Supabase 설정 - 개발환경에서도 Supabase 사용
        console.log('🚀 Supabase 모드 활성화');
        this.SUPABASE_URL = 'https://qeecatyznizafegpmest.supabase.co';
        this.SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlZWNhdHl6bml6YWZlZ3BtZXN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5NTI3MTgsImV4cCI6MjA3MjUyODcxOH0.nBUn4FfKsXcj6eHxO_x34t2RtYiKIYW4LevvNKIvUjs';
        
        this.supabase = null;
        this.initialized = false;
    }

    // Supabase 클라이언트 초기화
    initialize() {
        console.log('🔍 SupabaseConfig.initialize() 시작');
        console.log('🔍 SUPABASE_URL:', this.SUPABASE_URL);
        console.log('🔍 SUPABASE_ANON_KEY 길이:', this.SUPABASE_ANON_KEY?.length);
        console.log('🔍 supabase 전역 객체:', typeof supabase);
        
        try {
            // 환경변수가 설정되지 않은 경우 경고
            if (this.SUPABASE_URL === 'SUPABASE_URL' || this.SUPABASE_ANON_KEY === 'SUPABASE_API') {
                console.warn('⚠️ Supabase 설정이 필요합니다. config.js 파일에서 SUPABASE_URL과 SUPABASE_ANON_KEY를 설정해주세요.');
                return false;
            }

            // supabase 전역 객체가 로드되었는지 확인
            if (typeof supabase === 'undefined') {
                console.error('❌ Supabase 라이브러리가 로드되지 않았습니다.');
                return false;
            }

            console.log('🔍 supabase.createClient 호출 중...');
            this.supabase = supabase.createClient(this.SUPABASE_URL, this.SUPABASE_ANON_KEY);
            console.log('🔍 Supabase 클라이언트 생성됨:', this.supabase);
            
            this.initialized = true;
            console.log('✅ Supabase 클라이언트 초기화 완료');
            return true;
        } catch (error) {
            console.error('❌ Supabase 초기화 실패:', error);
            console.error('❌ 오류 스택:', error.stack);
            return false;
        }
    }

    // Supabase 클라이언트 반환
    getClient() {
        if (!this.initialized) {
            const success = this.initialize();
            if (!success) {
                throw new Error('Supabase 클라이언트를 초기화할 수 없습니다.');
            }
        }
        return this.supabase;
    }

    // 연결 상태 확인
    async testConnection() {
        try {
            const client = this.getClient();
            const { data, error } = await client.from('users').select('count', { count: 'exact', head: true });
            
            if (error) {
                console.error('❌ Supabase 연결 테스트 실패:', error);
                return false;
            }
            
            console.log('✅ Supabase 연결 테스트 성공');
            return true;
        } catch (error) {
            console.error('❌ Supabase 연결 테스트 중 오류:', error);
            return false;
        }
    }
}

// 전역 Supabase 설정 인스턴스
const supabaseConfig = new SupabaseConfig();

// 설정 가이드 출력
console.log(`
📋 Supabase 설정 가이드:

1. Supabase 프로젝트에서 다음 정보를 확인하세요:
   - Project URL: Settings → API → Project URL
   - API Key: Settings → API → anon/public key

2. config.js 파일에서 다음 값을 업데이트하세요:
   - SUPABASE_URL: 프로젝트 URL
   - SUPABASE_ANON_KEY: anon key

3. 데이터베이스 테이블 구조:
   - users (id, name, department, created_at)
   - courses (id, course_code, course_name, department, grade, lesson_count, created_at)
   - lessons (id, course_id, lesson_name, lesson_order)
   - user_courses (id, user_id, course_id, enrolled_at)
   - user_progress (id, user_id, lesson_id, completed, completed_at)
`);

// 자동으로 Supabase 초기화
supabaseConfig.initialize();