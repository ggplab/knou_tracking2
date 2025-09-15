// Logging system for KNOU tracking application
// 사용자 활동 로깅 및 분석을 위한 시스템

// 로그 액션 타입 정의
const LOG_ACTIONS = {
    // 인증 관련
    LOGIN_ATTEMPT: 'login_attempt',
    LOGIN_SUCCESS: 'login_success', 
    LOGIN_FAILED: 'login_failed',
    LOGOUT: 'logout',
    
    // 사용자 관리
    USER_REGISTER: 'user_register',
    USER_UPDATE: 'user_update',
    USER_DELETE: 'user_delete',
    USER_VIEW: 'user_view',
    
    // 학습 진도 관리
    LESSON_COMPLETE: 'lesson_complete',
    LESSON_UNCOMPLETE: 'lesson_uncomplete',
    PROGRESS_VIEW: 'progress_view',
    PROGRESS_UPDATE: 'progress_update',
    
    // 과목 관리
    COURSE_ENROLL: 'course_enroll',
    COURSE_UNENROLL: 'course_unenroll',
    COURSE_ADD: 'course_add',
    COURSE_VIEW: 'course_view',
    
    // 페이지 네비게이션
    PAGE_VIEW: 'page_view',
    DASHBOARD_VIEW: 'dashboard_view',
    ADMIN_VIEW: 'admin_view',
    STUDENT_VIEW: 'student_view',
    REGISTER_VIEW: 'register_view',
    
    // 에러/오류
    ERROR_OCCURRED: 'error_occurred',
    API_ERROR: 'api_error',
    VALIDATION_ERROR: 'validation_error',
    
    // 시스템/성능
    SYSTEM_INIT: 'system_init',
    CACHE_HIT: 'cache_hit',
    CACHE_MISS: 'cache_miss',
    DB_QUERY: 'db_query',
    PERFORMANCE_LOG: 'performance_log'
};

// 로그 레벨 정의
const LOG_LEVELS = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3
};

class LogManager {
    constructor() {
        this.sessionId = this.generateSessionId();
        this.userId = null;
        this.supabase = null;
        this.localQueue = [];
        this.maxLocalQueue = 100;
        this.isOnline = navigator.onLine;
        this.logLevel = LOG_LEVELS.INFO;
        this.enableConsoleLog = true;
        this.enableSupabaseLog = true;
        this.initialized = false;
        
        // 성능 추적
        this.performanceMetrics = {
            pageLoadTime: 0,
            dbQueryCount: 0,
            cacheHitRate: 0,
            errorCount: 0
        };
    }

    async init(supabaseClient = null) {
        try {
            if (supabaseClient) {
                this.supabase = supabaseClient;
                this.enableSupabaseLog = true;
            } else {
                this.enableSupabaseLog = false;
                console.warn('⚠️ Supabase 클라이언트가 없어 로컬 로깅만 사용합니다.');
            }
            
            this.setupEventListeners();
            await this.flushLocalQueue();
            this.initialized = true;
            
            // 시스템 초기화 로그
            await this.log(LOG_ACTIONS.SYSTEM_INIT, 'LogManager', {
                enableSupabaseLog: this.enableSupabaseLog,
                sessionId: this.sessionId,
                userAgent: navigator.userAgent.substring(0, 100)
            });
            
            console.log('✅ LogManager 초기화 완료');
        } catch (error) {
            console.error('❌ LogManager 초기화 실패:', error);
            this.enableSupabaseLog = false;
        }
    }

    generateSessionId() {
        return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    setUser(userId) {
        this.userId = userId;
    }

    async log(actionType, target = null, details = null, userId = null, level = LOG_LEVELS.INFO) {
        try {
            // 로그 레벨 체크
            if (level < this.logLevel) {
                return;
            }

            const logEntry = {
                user_id: userId || this.userId,
                action_type: actionType,
                action_target: target,
                action_details: details ? (typeof details === 'object' ? details : { message: details }) : null,
                session_id: this.sessionId,
                created_at: new Date().toISOString(),
                metadata: {
                    url: window.location.href,
                    page: window.location.pathname,
                    screen_resolution: `${screen.width}x${screen.height}`,
                    user_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    user_agent: navigator.userAgent.substring(0, 200),
                    level: this.getLevelName(level)
                }
            };

            // 콘솔 출력
            if (this.enableConsoleLog) {
                this.outputToConsole(logEntry, level);
            }

            // Supabase에 저장
            if (this.enableSupabaseLog && this.isOnline && this.supabase) {
                await this.saveToSupabase(logEntry);
            } else {
                this.saveToLocalQueue(logEntry);
            }

        } catch (error) {
            console.error('로깅 중 오류 발생:', error);
        }
    }

    // 편의 메서드들
    async debug(target, details = null, userId = null) {
        await this.log(LOG_ACTIONS.SYSTEM_INIT, target, details, userId, LOG_LEVELS.DEBUG);
    }

    async info(actionType, target = null, details = null, userId = null) {
        await this.log(actionType, target, details, userId, LOG_LEVELS.INFO);
    }

    async warn(actionType, target = null, details = null, userId = null) {
        await this.log(actionType, target, details, userId, LOG_LEVELS.WARN);
    }

    async error(actionType, target = null, details = null, userId = null) {
        await this.log(actionType, target, details, userId, LOG_LEVELS.ERROR);
    }

    // 특화된 로깅 메서드들
    async logUserAction(actionType, target, details = null, userId = null) {
        await this.log(actionType, target, details, userId, LOG_LEVELS.INFO);
    }

    async logError(error, context = null, userId = null) {
        const errorDetails = {
            message: error.message,
            stack: error.stack,
            context: context,
            timestamp: new Date().toISOString()
        };
        await this.log(LOG_ACTIONS.ERROR_OCCURRED, context || 'unknown', errorDetails, userId, LOG_LEVELS.ERROR);
        this.performanceMetrics.errorCount++;
    }

    async logPerformance(operation, duration, details = null) {
        const perfDetails = {
            operation: operation,
            duration_ms: duration,
            details: details,
            timestamp: new Date().toISOString()
        };
        await this.log(LOG_ACTIONS.PERFORMANCE_LOG, operation, perfDetails, this.userId, LOG_LEVELS.DEBUG);
    }

    async logPageView(pageName, additionalData = null) {
        const pageDetails = {
            page: pageName,
            referrer: document.referrer,
            loadTime: performance.now(),
            additionalData: additionalData
        };
        await this.log(LOG_ACTIONS.PAGE_VIEW, pageName, pageDetails, this.userId, LOG_LEVELS.INFO);
    }

    async logApiCall(endpoint, method, duration, success, error = null) {
        const apiDetails = {
            endpoint: endpoint,
            method: method,
            duration_ms: duration,
            success: success,
            error: error,
            timestamp: new Date().toISOString()
        };
        
        if (success) {
            await this.log(LOG_ACTIONS.DB_QUERY, endpoint, apiDetails, this.userId, LOG_LEVELS.DEBUG);
            this.performanceMetrics.dbQueryCount++;
        } else {
            await this.log(LOG_ACTIONS.API_ERROR, endpoint, apiDetails, this.userId, LOG_LEVELS.ERROR);
        }
    }

    async saveToSupabase(logEntry) {
        try {
            const { error } = await this.supabase
                .from('user_activity_logs')
                .insert([logEntry]);
            
            if (error) {
                console.error('Supabase 로그 저장 실패:', error);
                this.saveToLocalQueue(logEntry);
            }
        } catch (error) {
            console.error('Supabase 로그 저장 중 예외:', error);
            this.saveToLocalQueue(logEntry);
        }
    }

    saveToLocalQueue(logEntry) {
        this.localQueue.push(logEntry);
        
        // 큐 크기 제한
        if (this.localQueue.length > this.maxLocalQueue) {
            this.localQueue.shift(); // 가장 오래된 로그 제거
        }
        
        // 로컬스토리지에 백업
        try {
            localStorage.setItem('knou_log_queue', JSON.stringify(this.localQueue));
        } catch (error) {
            console.warn('로컬스토리지 로그 저장 실패:', error);
        }
    }

    async flushLocalQueue() {
        if (!this.enableSupabaseLog || !this.supabase || this.localQueue.length === 0) {
            return;
        }

        try {
            // 로컬스토리지에서 큐 복원
            const storedQueue = localStorage.getItem('knou_log_queue');
            if (storedQueue) {
                const parsedQueue = JSON.parse(storedQueue);
                this.localQueue = [...this.localQueue, ...parsedQueue];
            }

            if (this.localQueue.length > 0) {
                const { error } = await this.supabase
                    .from('user_activity_logs')
                    .insert(this.localQueue);

                if (!error) {
                    console.log(`✅ ${this.localQueue.length}개의 로컬 로그를 Supabase에 동기화했습니다.`);
                    this.localQueue = [];
                    localStorage.removeItem('knou_log_queue');
                } else {
                    console.error('로컬 큐 동기화 실패:', error);
                }
            }
        } catch (error) {
            console.error('로컬 큐 플러시 실패:', error);
        }
    }

    setupEventListeners() {
        // 온라인/오프라인 상태 감지
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.flushLocalQueue();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
        });

        // 페이지 언로드 시 로컬 큐 저장
        window.addEventListener('beforeunload', () => {
            if (this.localQueue.length > 0) {
                try {
                    localStorage.setItem('knou_log_queue', JSON.stringify(this.localQueue));
                } catch (error) {
                    console.warn('페이지 언로드 시 로그 저장 실패:', error);
                }
            }
        });
    }

    outputToConsole(logEntry, level) {
        const levelName = this.getLevelName(level);
        const emoji = this.getLevelEmoji(level);
        const timestamp = new Date(logEntry.created_at).toLocaleTimeString();
        
        const message = `${emoji} [${timestamp}] ${levelName}: ${logEntry.action_type}`;
        const details = {
            target: logEntry.action_target,
            user: logEntry.user_id,
            details: logEntry.action_details,
            session: logEntry.session_id
        };

        switch (level) {
            case LOG_LEVELS.DEBUG:
                console.debug(message, details);
                break;
            case LOG_LEVELS.INFO:
                console.info(message, details);
                break;
            case LOG_LEVELS.WARN:
                console.warn(message, details);
                break;
            case LOG_LEVELS.ERROR:
                console.error(message, details);
                break;
            default:
                console.log(message, details);
        }
    }

    getLevelName(level) {
        const levels = ['DEBUG', 'INFO', 'WARN', 'ERROR'];
        return levels[level] || 'UNKNOWN';
    }

    getLevelEmoji(level) {
        const emojis = ['🔍', 'ℹ️', '⚠️', '❌'];
        return emojis[level] || '📝';
    }

    // 성능 메트릭 조회
    getPerformanceMetrics() {
        return { ...this.performanceMetrics };
    }

    // 로그 레벨 설정
    setLogLevel(level) {
        this.logLevel = level;
    }

    // 콘솔 로깅 토글
    toggleConsoleLogging(enabled) {
        this.enableConsoleLog = enabled;
    }

    // Supabase 로깅 토글  
    toggleSupabaseLogging(enabled) {
        this.enableSupabaseLog = enabled;
    }

    // 로그 통계 조회 (Supabase에서)
    async getLogStats(userId = null, startDate = null, endDate = null) {
        if (!this.supabase) {
            return null;
        }

        try {
            let query = this.supabase
                .from('user_activity_logs')
                .select('action_type, created_at');

            if (userId) {
                query = query.eq('user_id', userId);
            }

            if (startDate) {
                query = query.gte('created_at', startDate);
            }

            if (endDate) {
                query = query.lte('created_at', endDate);
            }

            const { data, error } = await query;

            if (error) {
                console.error('로그 통계 조회 실패:', error);
                return null;
            }

            // 통계 계산
            const stats = {
                totalLogs: data.length,
                actionTypes: {},
                timeline: {}
            };

            data.forEach(log => {
                // 액션 타입별 카운트
                stats.actionTypes[log.action_type] = (stats.actionTypes[log.action_type] || 0) + 1;
                
                // 일별 타임라인
                const date = log.created_at.split('T')[0];
                stats.timeline[date] = (stats.timeline[date] || 0) + 1;
            });

            return stats;
        } catch (error) {
            console.error('로그 통계 계산 실패:', error);
            return null;
        }
    }
}

// 전역 로그 매니저 인스턴스
let logManager = null;

// 로그 매니저 초기화 함수
async function initializeLogManager(supabaseClient = null) {
    if (!logManager) {
        logManager = new LogManager();
        await logManager.init(supabaseClient);
    }
    return logManager;
}

// 전역 로그 함수들 (편의성을 위해)
window.logActivity = async (actionType, target = null, details = null, userId = null) => {
    if (logManager) {
        await logManager.log(actionType, target, details, userId);
    }
};

window.logError = async (error, context = null, userId = null) => {
    if (logManager) {
        await logManager.logError(error, context, userId);
    }
};

window.logPerformance = async (operation, duration, details = null) => {
    if (logManager) {
        await logManager.logPerformance(operation, duration, details);
    }
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        LogManager,
        LOG_ACTIONS,
        LOG_LEVELS,
        initializeLogManager
    };
}