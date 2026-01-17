// 카카오톡 채팅 분석 타입 정의

export interface ChatMessage {
    date: string;
    time: string;
    name: string;
    message: string;
    fullName?: string;
    timestamp: Date;
}

export interface MessageTypes {
    text: number;
    photo: number;
    video: number;
    emoji: number;
    link: number;
    other: number;
}

export interface NameCount {
    name: string;
    count: number;
}

export interface DateCount {
    date: string;
    count: number;
}

export interface HourCount {
    hour: number;
    count: number;
}

export interface TimeSlotActivity {
    slot: string;
    count: number;
    percentage: number;
}

export interface MessageLengthDetail {
    name: string;
    oneLine: number;
    short: number;
    medium: number;
    long: number;
    veryLong: number;
}

export interface ConversationDensity {
    avgMessagesPerDay: number;
    mostActiveDay: DateCount;
    quietestDay: DateCount;
    longestGap: {
        days: number;
        startDate: string;
        endDate: string;
    };
    activeDays: number;
    totalDays: number;
}

export interface ParticipantInteraction {
    from: string;
    to: string;
    count: number;
}

export interface TimelineHeatmap {
    byMonth: Array<{ month: string; count: number }>;
    byWeek: Array<{ week: string; count: number }>;
}

export interface ParticipationTrend {
    monthlyParticipants: Array<{ month: string; count: number }>;
    participantActivityPeriod: Array<{ name: string; daysActive: number }>;
}

export interface EmotionAnalysis {
    positive: NameCount[];
    negative: NameCount[];
    questions: NameCount[];
    exclamations: NameCount[];
}

export interface MessageLengthPattern {
    oneLine: number;
    short: number;
    medium: number;
    long: number;
    veryLong: number;
    byParticipant: MessageLengthDetail[];
}

export interface Statistics {
    totalMessages: number;
    totalParticipants: number;
    messagesByParticipant: Map<string, number>;
    messagesByDate: Map<string, number>;
    messagesByHour: Map<number, number>;
    messagesByDayOfWeek: Map<string, number>;
    messageTypes: MessageTypes;
    topParticipants: NameCount[];
    topDates: DateCount[];
    topHours: HourCount[];
    mentionsByParticipant: Map<string, number>;
    cryingByParticipant: Map<string, number>;
    laughingByParticipant: Map<string, number>;
    topMentioned: NameCount[];
    topCrying: NameCount[];
    topLaughing: NameCount[];
    avgMessageLengthByParticipant: Array<{ name: string; avgLength: number }>;
    topWords: Array<{ word: string; count: number }>;
    lateNightParticipants: NameCount[];
    spamParticipants: Array<{ name: string; maxConsecutive: number }>;
    photoSharing: NameCount[];
    videoSharing: NameCount[];
    linkSharing: NameCount[];
    keywordMentions: Map<string, NameCount[]>;
    conversationStarters: NameCount[];
    conversationEnders: NameCount[];
    emotionAnalysis: EmotionAnalysis;
    activityByTimeSlot: TimeSlotActivity[];
    messageLengthPattern: MessageLengthPattern;
    conversationDensity: ConversationDensity;
    participantInteractions: ParticipantInteraction[];
    timelineHeatmap: TimelineHeatmap;
    participationTrend: ParticipationTrend;
}

export interface AnalysisResult {
    stats: Statistics;
    allMessages: ChatMessage[];
    dateRange: {
        min: Date;
        max: Date;
    };
}

export interface FilterOptions {
    startDate?: Date;
    endDate?: Date;
    keywords?: string[];
}
