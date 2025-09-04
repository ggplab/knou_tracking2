// Supabase 프로젝트 설정 (이 파일은 GitHub에 포함됩니다)
// anon 키는 공개되어도 안전하며, 데이터 접근은 Supabase의 RLS 정책으로 제어됩니다.

const SUPABASE_URL = 'https://qeecatyznizafegpmest.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlZWNhdHl6bml6YWZlZ3BtZXN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5NTI3MTgsImV4cCI6MjA3MjUyODcxOH0.nBUn4FfKsXcj6eHxO_x34t2RtYiKIYW4LevvNKIvUjs';

// Supabase 클라이언트 생성
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('✅ Supabase 클라이언트가 초기화되었습니다.');
