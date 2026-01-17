// 카카오톡 채팅 분석 유틸리티
import type { ChatMessage, AnalysisResult, NameCount } from '../types';

// 파일 형식 감지
type ChatFormat = 'pc' | 'mobile';

function detectChatFormat(content: string): ChatFormat {
    // 모바일 형식: [이름] [오전/오후 시:분] 메시지
    // 날짜 구분선: --------------- 2025년 6월 13일 금요일 ---------------
    const mobilePattern = /\[.+?\]\s*\[(오전|오후)\s*\d+:\d+\]/;

    if (mobilePattern.test(content)) {
        return 'mobile';
    }
    return 'pc';
}

// PC 형식 메시지 파싱 함수
function parsePCMessage(
    match: RegExpMatchArray,
    fullText: string,
    _startIndex: number,
    nextStartIndex: number
): ChatMessage | null {
    const fullLine = match[0];
    const dateTime = match[1];
    const namePart = match[2];

    const messageStart = match.index! + fullLine.length;
    const messageEnd = nextStartIndex > 0 ? nextStartIndex : fullText.length;
    const message = fullText.substring(messageStart, messageEnd).trim();

    let date = '';
    let time = '';

    const dateTimeMatch = dateTime.match(
        /^(\d+년\s*\d+월\s*\d+일)\s*(오전|오후)\s*(\d+:\d+)/
    );
    if (dateTimeMatch) {
        date = dateTimeMatch[1];
        time = `${dateTimeMatch[2]} ${dateTimeMatch[3]}`;
    } else {
        const dateOnlyMatch = dateTime.match(/^(\d+년\s*\d+월\s*\d+일)/);
        if (dateOnlyMatch) {
            date = dateOnlyMatch[1];
        } else {
            return null;
        }
    }

    const name = namePart.split('/')[0].trim();
    const fullName = namePart.trim();

    const timestamp = parseDateTime(date, time);
    if (!timestamp) return null;

    return { date, time, name, message, fullName, timestamp };
}

// 모바일 형식 메시지 파싱
interface MobileMessage {
    name: string;
    time: string;
    message: string;
    lineIndex: number;
}

function parseMobileMessages(content: string): { messages: MobileMessage[], dateMarkers: Map<number, string> } {
    const lines = content.split('\n');
    const messages: MobileMessage[] = [];
    const dateMarkers = new Map<number, string>();

    // 날짜 구분선 패턴: --------------- 2025년 6월 13일 금요일 ---------------
    const dateLinePattern = /^-+\s*(\d+년\s*\d+월\s*\d+일)\s*\S+\s*-+$/;
    // 메시지 패턴: [이름] [오전/오후 시:분] 메시지
    const messagePattern = /^\[(.+?)\]\s*\[(오전|오후)\s*(\d+:\d+)\]\s*(.*)$/;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // 날짜 구분선 확인
        const dateMatch = line.match(dateLinePattern);
        if (dateMatch) {
            dateMarkers.set(i, dateMatch[1]);
            continue;
        }

        // 메시지 확인
        const msgMatch = line.match(messagePattern);
        if (msgMatch) {
            const [, name, period, timeValue, messageText] = msgMatch;
            messages.push({
                name: name.trim(),
                time: `${period} ${timeValue}`,
                message: messageText.trim(),
                lineIndex: i,
            });
        }
    }

    return { messages, dateMarkers };
}

function getMobileDateForLine(lineIndex: number, dateMarkers: Map<number, string>): string {
    let currentDate = '';
    const sortedKeys = Array.from(dateMarkers.keys()).sort((a, b) => a - b);

    for (const key of sortedKeys) {
        if (key <= lineIndex) {
            currentDate = dateMarkers.get(key)!;
        } else {
            break;
        }
    }

    return currentDate;
}

// 메시지 타입 감지
function detectMessageType(
    message: string
): 'text' | 'photo' | 'video' | 'emoji' | 'link' | 'other' {
    if (
        message.includes('사진') ||
        message.includes('photo') ||
        message.includes('image')
    ) {
        return 'photo';
    }
    if (message.includes('동영상') || message.includes('video')) {
        return 'video';
    }
    if (message.includes('이모티콘') || message.includes('emoji')) {
        return 'emoji';
    }
    if (message.match(/https?:\/\//)) {
        return 'link';
    }
    if (message.trim().length === 0) {
        return 'other';
    }
    return 'text';
}

// 시간 파싱
function parseHour(time: string): number {
    const match = time.match(/(오전|오후)\s*(\d+):(\d+)/);
    if (!match) return -1;

    const [, period, hourStr] = match;
    let hour = parseInt(hourStr, 10);

    if (period === '오후' && hour !== 12) {
        hour += 12;
    } else if (period === '오전' && hour === 12) {
        hour = 0;
    }

    return hour;
}

// 요일 계산
function getDayOfWeek(dateStr: string): string {
    const match = dateStr.match(/(\d+)년\s*(\d+)월\s*(\d+)일/);
    if (!match) return '알 수 없음';

    const [, year, month, day] = match;
    const date = new Date(
        parseInt(year, 10),
        parseInt(month, 10) - 1,
        parseInt(day, 10)
    );
    const days = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
    return days[date.getDay()];
}

// 날짜/시간 파싱
function parseDateTime(dateStr: string, timeStr: string): Date | null {
    const dateMatch = dateStr.match(/(\d+)년\s*(\d+)월\s*(\d+)일/);
    if (!dateMatch) return null;

    const [, year, month, day] = dateMatch;
    const timeMatch = timeStr.match(/(오전|오후)\s*(\d+):(\d+)/);
    if (!timeMatch) return null;

    const [, period, hourStr, minuteStr] = timeMatch;
    let hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);

    if (period === '오후' && hour !== 12) {
        hour += 12;
    } else if (period === '오전' && hour === 12) {
        hour = 0;
    }

    return new Date(
        parseInt(year, 10),
        parseInt(month, 10) - 1,
        parseInt(day, 10),
        hour,
        minute
    );
}

// 멘션된 이름 추출
function extractMentionedNames(message: string): string[] {
    const mentionPattern = /@([^/\s@]+)(?:\/[^\s@]*)?/g;
    const names: string[] = [];
    let match;
    while ((match = mentionPattern.exec(message)) !== null) {
        const name = match[1].trim();
        if (name) {
            names.push(name);
        }
    }
    return names;
}

// 우는 표현 카운트
function countCryingExpressions(message: string): number {
    const cryingPattern = /[ㅜㅠ]{1,}/g;
    const matches = message.match(cryingPattern);
    return matches ? matches.length : 0;
}

// 웃는 표현 카운트
function countLaughingExpressions(message: string): number {
    const laughingPattern = /(ㅋ{1,}|ㅎ{1,}|ㅊ{1,}|하하|호호|헤헤|히히|크크|킥킥)/g;
    const matches = message.match(laughingPattern);
    return matches ? matches.length : 0;
}

// 단어 추출
function extractWords(message: string): string[] {
    const words: string[] = [];
    const koreanWords = message.match(/[가-힣]{2,}/g) || [];
    const englishWords = (message.match(/[a-zA-Z]{2,}/g) || []).map((w) =>
        w.toLowerCase()
    );
    words.push(...koreanWords, ...englishWords);
    return words;
}

// 메시지 배열 생성 (형식에 따라)
function parseAllMessages(content: string): ChatMessage[] {
    const format = detectChatFormat(content);
    const allMessages: ChatMessage[] = [];

    if (format === 'mobile') {
        // 모바일 형식 파싱
        const { messages, dateMarkers } = parseMobileMessages(content);

        for (const msg of messages) {
            const date = getMobileDateForLine(msg.lineIndex, dateMarkers);
            if (!date) continue;

            const timestamp = parseDateTime(date, msg.time);
            if (!timestamp) continue;

            allMessages.push({
                date,
                time: msg.time,
                name: msg.name,
                message: msg.message,
                fullName: msg.name,
                timestamp,
            });
        }
    } else {
        // PC 형식 파싱
        const messagePattern =
            /(\d+년\s*\d+월\s*\d+일\s*(?:오전|오후)\s*\d+:\d+),\s*([^:\n]+?)\s*:\s*/g;

        const matches: RegExpMatchArray[] = [];
        let match;

        while ((match = messagePattern.exec(content)) !== null) {
            matches.push(match);
        }

        for (let i = 0; i < matches.length; i++) {
            const currentMatch = matches[i];
            const nextMatch = i < matches.length - 1 ? matches[i + 1] : null;
            const nextStartIndex = nextMatch ? nextMatch.index! : content.length;

            const message = parsePCMessage(
                currentMatch,
                content,
                currentMatch.index!,
                nextStartIndex
            );
            if (message) {
                allMessages.push(message);
            }
        }
    }

    return allMessages;
}

// 메인 분석 함수
export function analyzeChat(
    content: string,
    startDate?: Date,
    endDate?: Date,
    keywords?: string[]
): AnalysisResult {
    // 모든 메시지 파싱
    const allParsedMessages = parseAllMessages(content);

    const messages: ChatMessage[] = [];
    const messagesByParticipant = new Map<string, number>();
    const messagesByDate = new Map<string, number>();
    const messagesByHour = new Map<number, number>();
    const messagesByDayOfWeek = new Map<string, number>();
    const messageTypes = { text: 0, photo: 0, video: 0, emoji: 0, link: 0, other: 0 };
    const mentionsByParticipant = new Map<string, number>();
    const cryingByParticipant = new Map<string, number>();
    const laughingByParticipant = new Map<string, number>();

    const messageLengthByParticipant = new Map<
        string,
        { total: number; count: number }
    >();
    const wordCount = new Map<string, number>();
    const lateNightMessages = new Map<string, number>();
    const photoCount = new Map<string, number>();
    const videoCount = new Map<string, number>();
    const linkCount = new Map<string, number>();
    const keywordMentions = new Map<string, Map<string, number>>();

    // 새로 추가된 통계를 위한 변수
    const conversationStartersCount = new Map<string, number>();
    const conversationEndersCount = new Map<string, number>();
    const positiveExpressions = new Map<string, number>();
    const negativeExpressions = new Map<string, number>();
    const questionExpressions = new Map<string, number>();
    const exclamationExpressions = new Map<string, number>();
    const messagesByTimeSlot = new Map<string, number>();
    const messageLengthByParticipantDetail = new Map<
        string,
        {
            oneLine: number;
            short: number;
            medium: number;
            long: number;
            veryLong: number;
        }
    >();
    const mentionRelations = new Map<string, Map<string, number>>();
    const messagesByMonth = new Map<string, number>();
    const messagesByWeek = new Map<string, number>();
    const participantsByMonth = new Map<string, Set<string>>();
    const participantFirstMessage = new Map<string, Date>();
    const participantLastMessage = new Map<string, Date>();
    const participantActiveDates = new Map<string, Set<string>>();

    // 기본 키워드 또는 전달받은 키워드 사용
    const defaultKeywords = [
        '벙', '정모', '술', '맛집', '공연', '연습', '밴드', '음악', '노래', '라이브', '락교',
    ];
    const keywordsToUse = keywords && keywords.length > 0 ? keywords : defaultKeywords;

    for (const keyword of keywordsToUse) {
        keywordMentions.set(keyword, new Map<string, number>());
    }

    let lastSender = '';
    let lastMessageTime: Date | null = null;
    let consecutiveCount = 0;
    const maxConsecutiveByParticipant = new Map<string, number>();
    const CONSECUTIVE_MESSAGE_THRESHOLD_MS = 5 * 60 * 1000;

    // allParsedMessages를 순회하며 통계 수집
    for (const message of allParsedMessages) {
        if (!message.date || !message.timestamp) continue;

        // 날짜 필터링
        if (startDate && message.timestamp < startDate) continue;
        if (endDate && message.timestamp > endDate) continue;

        messages.push(message);

        const participantCount = messagesByParticipant.get(message.name) || 0;
        messagesByParticipant.set(message.name, participantCount + 1);

        const dateCount = messagesByDate.get(message.date) || 0;
        messagesByDate.set(message.date, dateCount + 1);

        // 메시지 타임라인 히트맵 (월별)
        const messageDate = message.timestamp;
        const monthKey = `${messageDate.getFullYear()}년 ${messageDate.getMonth() + 1}월`;
        const monthCount = messagesByMonth.get(monthKey) || 0;
        messagesByMonth.set(monthKey, monthCount + 1);

        // 메시지 타임라인 히트맵 (주간별)
        const weekStart = new Date(messageDate);
        weekStart.setDate(messageDate.getDate() - messageDate.getDay());
        const weekKey = `${weekStart.getFullYear()}-${String(
            weekStart.getMonth() + 1
        ).padStart(2, '0')}-${String(weekStart.getDate()).padStart(2, '0')}`;
        const weekCount = messagesByWeek.get(weekKey) || 0;
        messagesByWeek.set(weekKey, weekCount + 1);

        // 대화 참여도 변화 추이 (월별 참여자)
        if (!participantsByMonth.has(monthKey)) {
            participantsByMonth.set(monthKey, new Set<string>());
        }
        participantsByMonth.get(monthKey)!.add(message.name);

        // 참여자별 첫/마지막 메시지 날짜
        if (
            !participantFirstMessage.has(message.name) ||
            message.timestamp < participantFirstMessage.get(message.name)!
        ) {
            participantFirstMessage.set(message.name, message.timestamp);
        }
        if (
            !participantLastMessage.has(message.name) ||
            message.timestamp > participantLastMessage.get(message.name)!
        ) {
            participantLastMessage.set(message.name, message.timestamp);
        }

        // 참여자별 실제 활동한 날짜
        if (!participantActiveDates.has(message.name)) {
            participantActiveDates.set(message.name, new Set<string>());
        }
        participantActiveDates.get(message.name)!.add(message.date);

        const hour = parseHour(message.time);
        if (hour >= 0) {
            const hourCount = messagesByHour.get(hour) || 0;
            messagesByHour.set(hour, hourCount + 1);
        }

        const dayOfWeek = getDayOfWeek(message.date);
        const dayCount = messagesByDayOfWeek.get(dayOfWeek) || 0;
        messagesByDayOfWeek.set(dayOfWeek, dayCount + 1);

        const type = detectMessageType(message.message);
        messageTypes[type]++;

        const mentionedNames = extractMentionedNames(message.message);
        for (const mentionedName of mentionedNames) {
            const mentionCount = mentionsByParticipant.get(mentionedName) || 0;
            mentionsByParticipant.set(mentionedName, mentionCount + 1);

            // 참여자 간 상호작용 (멘션 관계도)
            if (!mentionRelations.has(message.name)) {
                mentionRelations.set(message.name, new Map<string, number>());
            }
            const relationMap = mentionRelations.get(message.name)!;
            const relationCount = relationMap.get(mentionedName) || 0;
            relationMap.set(mentionedName, relationCount + 1);
        }

        const cryingCount = countCryingExpressions(message.message);
        if (cryingCount > 0) {
            const currentCrying = cryingByParticipant.get(message.name) || 0;
            cryingByParticipant.set(message.name, currentCrying + cryingCount);
        }

        const laughingCount = countLaughingExpressions(message.message);
        if (laughingCount > 0) {
            const currentLaughing = laughingByParticipant.get(message.name) || 0;
            laughingByParticipant.set(message.name, currentLaughing + laughingCount);
        }

        const msgLength = message.message.length;
        const lengthData = messageLengthByParticipant.get(message.name) || {
            total: 0,
            count: 0,
        };
        lengthData.total += msgLength;
        lengthData.count += 1;
        messageLengthByParticipant.set(message.name, lengthData);

        if (type === 'text' && msgLength > 0) {
            const words = extractWords(message.message);
            for (const word of words) {
                const count = wordCount.get(word) || 0;
                wordCount.set(word, count + 1);
            }
        }

        if (hour >= 2 && hour < 5) {
            const lateNightCount = lateNightMessages.get(message.name) || 0;
            lateNightMessages.set(message.name, lateNightCount + 1);
        }

        if (type === 'photo') {
            const count = photoCount.get(message.name) || 0;
            photoCount.set(message.name, count + 1);
        } else if (type === 'video') {
            const count = videoCount.get(message.name) || 0;
            videoCount.set(message.name, count + 1);
        } else if (type === 'link') {
            const count = linkCount.get(message.name) || 0;
            linkCount.set(message.name, count + 1);
        }

        const lowerMessage = message.message.toLowerCase();
        for (const keyword of keywordsToUse) {
            const keywordLower = keyword.toLowerCase().trim();
            const escapedKeyword = keywordLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const pattern = new RegExp(escapedKeyword, 'g');

            if (pattern.test(lowerMessage)) {
                const keywordMap = keywordMentions.get(keyword)!;
                const count = keywordMap.get(message.name) || 0;
                keywordMap.set(message.name, count + 1);
            }
        }

        // 감정/표현 분석
        const positiveKeywords = [
            '좋아', '최고', '고마워', '사랑', '행복', '즐거', '멋있', '예쁘', '귀여', '대박',
            '완벽', '훌륭', '좋다', '좋은', '좋게',
        ];
        const negativeKeywords = [
            '싫어', '안돼', '아니', '화나', '슬프', '힘들', '짜증', '불편', '나쁘', '안좋',
            '미워', '싫다', '싫은',
        ];
        const questionKeywords = [
            '?', '뭐', '어디', '언제', '누구', '왜', '어떻게', '무엇', '어떤', '몇',
        ];
        const exclamationKeywords = ['와', '헐', '대박', '와우', '오', '와!', '헐!', '!'];

        for (const keyword of positiveKeywords) {
            if (lowerMessage.includes(keyword)) {
                const count = positiveExpressions.get(message.name) || 0;
                positiveExpressions.set(message.name, count + 1);
                break;
            }
        }
        for (const keyword of negativeKeywords) {
            if (lowerMessage.includes(keyword)) {
                const count = negativeExpressions.get(message.name) || 0;
                negativeExpressions.set(message.name, count + 1);
                break;
            }
        }
        for (const keyword of questionKeywords) {
            if (lowerMessage.includes(keyword)) {
                const count = questionExpressions.get(message.name) || 0;
                questionExpressions.set(message.name, count + 1);
                break;
            }
        }
        for (const keyword of exclamationKeywords) {
            if (lowerMessage.includes(keyword)) {
                const count = exclamationExpressions.get(message.name) || 0;
                exclamationExpressions.set(message.name, count + 1);
                break;
            }
        }

        // 시간대별 활동 패턴
        let timeSlot = '';
        if (hour >= 0 && hour < 6) {
            timeSlot = '새벽 (0-5시)';
        } else if (hour >= 6 && hour < 12) {
            timeSlot = '아침 (6-11시)';
        } else if (hour >= 12 && hour < 14) {
            timeSlot = '점심 (12-13시)';
        } else if (hour >= 14 && hour < 18) {
            timeSlot = '오후 (14-17시)';
        } else if (hour >= 18 && hour < 22) {
            timeSlot = '저녁 (18-21시)';
        } else {
            timeSlot = '밤 (22-23시)';
        }
        if (timeSlot) {
            const count = messagesByTimeSlot.get(timeSlot) || 0;
            messagesByTimeSlot.set(timeSlot, count + 1);
        }

        // 메시지 길이 패턴
        const hasNewline = message.message.includes('\n');
        const lengthDetail = messageLengthByParticipantDetail.get(message.name) || {
            oneLine: 0,
            short: 0,
            medium: 0,
            long: 0,
            veryLong: 0,
        };
        if (!hasNewline && msgLength > 0) {
            lengthDetail.oneLine++;
        }
        if (msgLength <= 5) {
            lengthDetail.short++;
        } else if (msgLength <= 50) {
            lengthDetail.medium++;
        } else if (msgLength <= 100) {
            lengthDetail.long++;
        } else {
            lengthDetail.veryLong++;
        }
        messageLengthByParticipantDetail.set(message.name, lengthDetail);

        const currentMessageTime = parseDateTime(message.date, message.time);

        // 대화 주도자 계산
        const CONVERSATION_START_THRESHOLD_MS = 60 * 60 * 1000;
        if (lastMessageTime && currentMessageTime) {
            const timeDiff = currentMessageTime.getTime() - lastMessageTime.getTime();
            if (timeDiff >= CONVERSATION_START_THRESHOLD_MS) {
                const count = conversationStartersCount.get(message.name) || 0;
                conversationStartersCount.set(message.name, count + 1);
            }
        } else if (!lastMessageTime) {
            const count = conversationStartersCount.get(message.name) || 0;
            conversationStartersCount.set(message.name, count + 1);
        }

        if (message.name === lastSender && currentMessageTime && lastMessageTime) {
            const timeDiff = currentMessageTime.getTime() - lastMessageTime.getTime();
            if (timeDiff >= 0 && timeDiff <= CONSECUTIVE_MESSAGE_THRESHOLD_MS) {
                consecutiveCount++;
            } else {
                if (consecutiveCount > 0) {
                    const currentMax = maxConsecutiveByParticipant.get(lastSender) || 0;
                    if (consecutiveCount > currentMax) {
                        maxConsecutiveByParticipant.set(lastSender, consecutiveCount);
                    }
                }
                consecutiveCount = 1;
            }
            lastMessageTime = currentMessageTime;
        } else {
            if (lastSender && consecutiveCount > 0) {
                const currentMax = maxConsecutiveByParticipant.get(lastSender) || 0;
                if (consecutiveCount > currentMax) {
                    maxConsecutiveByParticipant.set(lastSender, consecutiveCount);
                }
            }
            lastSender = message.name;
            consecutiveCount = 1;
            lastMessageTime = currentMessageTime;
        }
    }

    if (lastSender && consecutiveCount > 0) {
        const currentMax = maxConsecutiveByParticipant.get(lastSender) || 0;
        if (consecutiveCount > currentMax) {
            maxConsecutiveByParticipant.set(lastSender, consecutiveCount);
        }
    }

    // 정렬된 통계 생성
    const topParticipants = Array.from(messagesByParticipant.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20);

    const topDates = Array.from(messagesByDate.entries())
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

    const topHours = Array.from(messagesByHour.entries())
        .map(([hour, count]) => ({ hour, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

    const topMentioned = Array.from(mentionsByParticipant.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20);

    const topCrying = Array.from(cryingByParticipant.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20);

    const topLaughing = Array.from(laughingByParticipant.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20);

    const avgMessageLengthByParticipant = Array.from(
        messageLengthByParticipant.entries()
    )
        .map(([name, data]) => ({
            name,
            avgLength: Math.round(data.total / data.count),
        }))
        .sort((a, b) => b.avgLength - a.avgLength)
        .slice(0, 20);

    const stopWords = new Set([
        '그리고', '그런데', '그래서', '그러나', '하지만', '그때', '그것', '이것', '저것',
        'the', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'this', 'that',
    ]);
    const topWords = Array.from(wordCount.entries())
        .filter(([word]) => !stopWords.has(word) && word.length >= 2)
        .map(([word, count]) => ({ word, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20);

    const lateNightParticipants = Array.from(lateNightMessages.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20);

    const spamParticipants = Array.from(maxConsecutiveByParticipant.entries())
        .map(([name, maxConsecutive]) => ({ name, maxConsecutive }))
        .sort((a, b) => b.maxConsecutive - a.maxConsecutive)
        .slice(0, 20);

    const photoSharing = Array.from(photoCount.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20);

    const videoSharing = Array.from(videoCount.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20);

    const linkSharing = Array.from(linkCount.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20);

    const keywordMentionsResult = new Map<string, NameCount[]>();
    for (const keyword of keywordsToUse) {
        const keywordMap = keywordMentions.get(keyword)!;
        const topMentions = Array.from(keywordMap.entries())
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
        if (topMentions.length > 0) {
            keywordMentionsResult.set(keyword, topMentions);
        }
    }

    // 대화 종료자 계산
    const CONVERSATION_END_THRESHOLD_MS = 1 * 60 * 60 * 1000;
    for (let i = 0; i < messages.length; i++) {
        const currentMessage = messages[i];
        const currentTime = currentMessage.timestamp;
        let isEnd = true;

        for (let j = i + 1; j < messages.length; j++) {
            const nextMessage = messages[j];
            const timeDiff = nextMessage.timestamp.getTime() - currentTime.getTime();
            if (timeDiff > 0 && timeDiff <= CONVERSATION_END_THRESHOLD_MS) {
                isEnd = false;
                break;
            }
            if (timeDiff > CONVERSATION_END_THRESHOLD_MS) {
                break;
            }
        }

        if (isEnd) {
            const count = conversationEndersCount.get(currentMessage.name) || 0;
            conversationEndersCount.set(currentMessage.name, count + 1);
        }
    }

    const conversationStarters = Array.from(conversationStartersCount.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20);
    const conversationEnders = Array.from(conversationEndersCount.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20);

    // 감정/표현 분석 Top 20
    const positiveTop = Array.from(positiveExpressions.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20);
    const negativeTop = Array.from(negativeExpressions.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20);
    const questionTop = Array.from(questionExpressions.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20);
    const exclamationTop = Array.from(exclamationExpressions.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20);

    // 시간대별 활동 패턴
    const totalMessagesForTimeSlot = Array.from(messagesByTimeSlot.values()).reduce(
        (sum, count) => sum + count,
        0
    );
    const activityByTimeSlot = Array.from(messagesByTimeSlot.entries())
        .map(([slot, count]) => ({
            slot,
            count,
            percentage:
                totalMessagesForTimeSlot > 0
                    ? (count / totalMessagesForTimeSlot) * 100
                    : 0,
        }))
        .sort((a, b) => b.count - a.count);

    // 메시지 길이 패턴
    let oneLineCount = 0;
    let shortCount = 0;
    let mediumCount = 0;
    let longCount = 0;
    let veryLongCount = 0;
    for (const detail of messageLengthByParticipantDetail.values()) {
        oneLineCount += detail.oneLine;
        shortCount += detail.short;
        mediumCount += detail.medium;
        longCount += detail.long;
        veryLongCount += detail.veryLong;
    }
    const messageLengthByParticipantDetailArray = Array.from(
        messageLengthByParticipantDetail.entries()
    )
        .map(([name, detail]) => ({
            name,
            oneLine: detail.oneLine,
            short: detail.short,
            medium: detail.medium,
            long: detail.long,
            veryLong: detail.veryLong,
        }))
        .sort((a, b) => {
            const totalA = a.oneLine + a.short + a.medium + a.long + a.veryLong;
            const totalB = b.oneLine + b.short + b.medium + b.long + b.veryLong;
            return totalB - totalA;
        })
        .slice(0, 20);

    // 대화 밀도 분석
    const dateArray = Array.from(messagesByDate.entries())
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));
    const totalDays = dateArray.length;
    const activeDays = dateArray.filter((d) => d.count > 0).length;
    const avgMessagesPerDay = totalDays > 0 ? messages.length / totalDays : 0;

    let mostActiveDay = { date: '', count: 0 };
    let quietestDay = { date: '', count: Infinity };
    for (const { date, count } of dateArray) {
        if (count > mostActiveDay.count) {
            mostActiveDay = { date, count };
        }
        if (count < quietestDay.count && count > 0) {
            quietestDay = { date, count };
        }
    }
    if (quietestDay.count === Infinity) {
        quietestDay = { date: dateArray[0]?.date || '', count: 0 };
    }

    // 가장 긴 공백 기간 계산
    let longestGap = { days: 0, startDate: '', endDate: '' };
    for (let i = 0; i < dateArray.length - 1; i++) {
        const currentDate = new Date(dateArray[i].date);
        const nextDate = new Date(dateArray[i + 1].date);
        const daysDiff = Math.floor(
            (nextDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysDiff > longestGap.days) {
            longestGap = {
                days: daysDiff,
                startDate: dateArray[i].date,
                endDate: dateArray[i + 1].date,
            };
        }
    }

    // 참여자 간 상호작용 Top 30
    const participantInteractions: Array<{
        from: string;
        to: string;
        count: number;
    }> = [];
    for (const [from, toMap] of mentionRelations.entries()) {
        for (const [to, count] of toMap.entries()) {
            participantInteractions.push({ from, to, count });
        }
    }
    participantInteractions.sort((a, b) => b.count - a.count);
    const topInteractions = participantInteractions.slice(0, 30);

    // 메시지 타임라인 히트맵
    const timelineByMonth = Array.from(messagesByMonth.entries())
        .map(([month, count]) => ({ month, count }))
        .sort((a, b) => a.month.localeCompare(b.month));
    const timelineByWeek = Array.from(messagesByWeek.entries())
        .map(([weekKey, count]) => {
            const date = new Date(weekKey);
            return {
                week: `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 주`,
                count,
                sortKey: weekKey,
            };
        })
        .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
        .map(({ week, count }) => ({ week, count }));

    // 대화 참여도 변화 추이
    const monthlyParticipants = Array.from(participantsByMonth.entries())
        .map(([month, participants]) => ({ month, count: participants.size }))
        .sort((a, b) => {
            const parseMonth = (monthStr: string) => {
                const match = monthStr.match(/(\d+)년\s*(\d+)월/);
                if (match) {
                    return parseInt(match[1]) * 12 + parseInt(match[2]);
                }
                return 0;
            };
            return parseMonth(a.month) - parseMonth(b.month);
        });

    const participantActivityPeriod = Array.from(participantFirstMessage.keys())
        .map((name) => {
            const activeDates = participantActiveDates.get(name) || new Set<string>();
            const daysActive = activeDates.size;
            return { name, daysActive };
        })
        .sort((a, b) => b.daysActive - a.daysActive)
        .slice(0, 20);

    // 날짜 범위 계산 (allParsedMessages 사용)
    let minDate: Date | null = null;
    let maxDate: Date | null = null;

    for (const msg of allParsedMessages) {
        if (msg && msg.timestamp) {
            if (!minDate || msg.timestamp < minDate) minDate = msg.timestamp;
            if (!maxDate || msg.timestamp > maxDate) maxDate = msg.timestamp;
        }
    }

    const result: AnalysisResult = {
        stats: {
            totalMessages: messages.length,
            totalParticipants: messagesByParticipant.size,
            messagesByParticipant,
            messagesByDate,
            messagesByHour,
            messagesByDayOfWeek,
            messageTypes,
            topParticipants,
            topDates,
            topHours,
            mentionsByParticipant,
            cryingByParticipant,
            laughingByParticipant,
            topMentioned,
            topCrying,
            topLaughing,
            avgMessageLengthByParticipant,
            topWords,
            lateNightParticipants,
            spamParticipants,
            photoSharing,
            videoSharing,
            linkSharing,
            keywordMentions: keywordMentionsResult,
            conversationStarters,
            conversationEnders,
            emotionAnalysis: {
                positive: positiveTop,
                negative: negativeTop,
                questions: questionTop,
                exclamations: exclamationTop,
            },
            activityByTimeSlot,
            messageLengthPattern: {
                oneLine: oneLineCount,
                short: shortCount,
                medium: mediumCount,
                long: longCount,
                veryLong: veryLongCount,
                byParticipant: messageLengthByParticipantDetailArray,
            },
            conversationDensity: {
                avgMessagesPerDay: Math.round(avgMessagesPerDay * 10) / 10,
                mostActiveDay,
                quietestDay,
                longestGap,
                activeDays,
                totalDays,
            },
            participantInteractions: topInteractions,
            timelineHeatmap: { byMonth: timelineByMonth, byWeek: timelineByWeek },
            participationTrend: { monthlyParticipants, participantActivityPeriod },
        },
        allMessages: allParsedMessages,
        dateRange: { min: minDate || new Date(), max: maxDate || new Date() },
    };

    return result;
}

// 파일 읽기 유틸리티
export function readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result;
            if (typeof result === 'string') {
                resolve(result);
            } else {
                reject(new Error('파일을 읽을 수 없습니다.'));
            }
        };
        reader.onerror = () => reject(new Error('파일 읽기 오류가 발생했습니다.'));
        reader.readAsText(file, 'UTF-8');
    });
}
