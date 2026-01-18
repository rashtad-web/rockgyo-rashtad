// 룬 데이터 관리 유틸리티
import type {
    Rune,
    AccessoryRune,
    RuneSlot,
    RuneIndex,
    StatType,
    OptionCategory,
    ModifierType,
    RuneStat
} from '../types/rune';

const STORAGE_KEY = 'mabinogi_runes';
const ACCESSORY_STORAGE_KEY = 'mabinogi_accessory_runes';

/** 고유 ID 생성 */
export function generateRuneId(): string {
    return `rune_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// ============================================================================
// JSON 스키마 타입 정의
// ============================================================================

/** 새 JSON 스키마 (구조화된 형태) */
interface RuneJsonSchema {
    version?: string;
    lastUpdated?: string;
    runes: RuneJsonItem[];
}

interface RuneJsonItem {
    name: string;
    slot: string;
    index: string;
    stats: RuneJsonStat[];
    description?: string;
    jobClass?: string;              // 직업 (장신구 룬용)
}

interface RuneJsonStat {
    type: string;
    modifier: string;
    values: {
        base: number;
        trans1: number;
        trans2: number;
    };
    category?: string;
}

// ============================================================================
// 스프레드시트 한글 값 변환 (레거시 지원)
// ============================================================================

export function parseSlotFromKorean(value: string): RuneSlot {
    const map: Record<string, RuneSlot> = {
        '무기': 'weapon',
        '방어구': 'armor',
        '장신구': 'accessory',
        '엠블럼': 'emblem',
    };
    return map[value] || 'weapon';
}

export function parseIndexFromKorean(value: string): RuneIndex {
    const map: Record<string, RuneIndex> = {
        '시즌1 전설': 'season1_legendary',
        '시즌1 신화': 'season1_mythic',
        '시즌2 전설': 'season2_legendary',
        '시즌2 신화': 'season2_mythic',
        '어비스 전설': 'abyss_legendary',
        '레이드 전설': 'raid_legendary',
    };
    return map[value] || 'season1_legendary';
}

export function parseStatTypeFromKorean(value: string): StatType {
    const map: Record<string, StatType> = {
        '치명타 확률': 'critRate',
        '치명타 피해': 'critDamage',
        '추가타 확률': 'extraHitRate',
        '강타 피해': 'heavyHitDamage',
        '연타 피해': 'comboHitDamage',
        '콤보 피해': 'comboDamage',
        '공격력': 'attackPower',
        '주는 피해': 'damageDealt',
        '적에게 주는 피해': 'damageDealtToEnemy',
        '받는 피해': 'damageReceived',
        '(적)받는 피해': 'damageReceived',
        '(적이)받는 피해': 'enemyDamageReceived',
        '(내가)받는 피해': 'selfDamageReceived',
        '멀티히트 피해': 'multiHitDamage',
        '스킬 피해': 'skillDamage',
        '차지 스킬 피해': 'chargeSkillDamage',
        '궁극기 피해': 'ultimateDamage',
        '쿨타임': 'cooldown',
        '쿨타임 감소': 'cooldownReduction',
        '쿨타임 속도': 'cooldownSpeed',
        '쿨타임 회복 속도': 'cooldownRecovery',
        '캐스팅 속도': 'castingSpeed',
        '캐스팅/차지 속도': 'castingChargeSpeed',
        '차지 속도': 'chargeSpeed',
        '스킬 사용 속도': 'skillSpeed',
        '치유량': 'healAmount',
        '회복력': 'recovery',
        '무방비 피해': 'breakDamage',
        '브레이크 스킬 피해': 'breakSkillDamage',
        '브레이크 피해': 'breakHitDamage',
        '지속 피해': 'dotDamage',
        '최종 피해': 'finalDamage',
        '방어력': 'defense',
        '체력': 'hp',
        '스킬 변화': 'skillChange',
    };
    return map[value] || 'other';
}

function parseModifierFromKorean(value: string): ModifierType {
    if (value === 'X' || value === '감소' || value.includes('감소')) {
        return 'decrease';
    }
    return 'increase';
}

function parseCategoryFromKorean(value: string): OptionCategory {
    const map: Record<string, OptionCategory> = {
        '누적': 'stack',
        '결합': 'combine',
        '각성': 'awaken',
        'X': 'none',
        'O': 'none',
        '-': 'none',
    };
    return map[value] || 'none';
}

// ============================================================================
// 새 JSON 스키마 파싱
// ============================================================================

function isValidSlot(value: string): value is RuneSlot {
    return ['weapon', 'armor', 'accessory', 'emblem'].includes(value);
}

function isValidIndex(value: string): value is RuneIndex {
    return [
        'season1_legendary', 'season1_mythic',
        'season2_legendary', 'season2_mythic',
        'abyss_legendary', 'raid_legendary'
    ].includes(value);
}

function isValidStatType(value: string): value is StatType {
    return [
        'critRate', 'critDamage', 'extraHitRate', 'heavyHitDamage', 'comboHitDamage', 'comboDamage',
        'attackPower', 'damageDealt', 'damageDealtToEnemy', 'damageReceived', 'enemyDamageReceived', 'selfDamageReceived',
        'multiHitDamage', 'skillDamage', 'chargeSkillDamage', 'ultimateDamage', 'cooldown', 'cooldownReduction', 'cooldownSpeed',
        'cooldownRecovery', 'castingSpeed', 'castingChargeSpeed', 'chargeSpeed', 'skillSpeed', 'healAmount', 'recovery',
        'breakDamage', 'breakSkillDamage', 'breakHitDamage', 'dotDamage', 'finalDamage', 'defense', 'hp', 'skillChange', 'other'
    ].includes(value);
}

function isValidModifier(value: string): value is ModifierType {
    return ['increase', 'decrease'].includes(value);
}

function isValidCategory(value: string): value is OptionCategory {
    return ['stack', 'combine', 'awaken', 'none'].includes(value);
}

/** 새 구조화된 JSON에서 룬 배열 파싱 */
function parseFromStructuredJson(data: RuneJsonSchema): Rune[] {
    const runes: Rune[] = [];

    for (const item of data.runes) {
        const slot = isValidSlot(item.slot) ? item.slot : 'weapon';
        const index = isValidIndex(item.index) ? item.index : 'season1_legendary';

        const stats: RuneStat[] = item.stats.map(s => ({
            statType: isValidStatType(s.type) ? s.type : 'other',
            modifier: isValidModifier(s.modifier) ? s.modifier : 'increase',
            values: {
                base: s.values.base || 0,
                trans1: s.values.trans1 || 0,
                trans2: s.values.trans2 || 0,
            },
            category: isValidCategory(s.category || 'none') ? (s.category as OptionCategory) : 'none',
        }));

        const rune: Rune = {
            id: generateRuneId(),
            name: item.name,
            slot,
            index,
            stats,
            description: item.description || '',
        };

        // 장신구 룬의 직업 필드 추가
        if (item.jobClass) {
            rune.jobClass = item.jobClass;
        }

        runes.push(rune);
    }

    return runes;
}

// ============================================================================
// 레거시 스프레드시트 JSON 파싱 (플랫 구조)
// ============================================================================

/** 레거시 플랫 JSON에서 룬 배열로 변환 (같은 이름 합치기) */
function parseFromLegacyFlatJson(jsonData: Record<string, unknown>[]): Rune[] {
    const runeMap = new Map<string, Rune>();

    for (const row of jsonData) {
        const slot = parseSlotFromKorean(String(row['파츠'] || ''));
        const index = parseIndexFromKorean(String(row['룬 인덱스'] || ''));
        const name = String(row['이름'] || '').trim();
        const description = String(row['룬 설명'] || '');

        if (!name) continue;

        const stat: RuneStat = {
            statType: parseStatTypeFromKorean(String(row['효과'] || '')),
            values: {
                base: Number(row['초월0']) || 0,
                trans1: Number(row['초월1']) || 0,
                trans2: Number(row['초월2']) || 0,
            },
            modifier: parseModifierFromKorean(String(row['증감'] || '')),
            category: parseCategoryFromKorean(String(row['옵션'] || '')),
        };

        const runeKey = `${slot}_${index}_${name}`;

        if (runeMap.has(runeKey)) {
            const existingRune = runeMap.get(runeKey)!;
            existingRune.stats.push(stat);
            if (!existingRune.description && description) {
                existingRune.description = description;
            }
        } else {
            runeMap.set(runeKey, {
                id: generateRuneId(),
                slot,
                index,
                name,
                stats: [stat],
                description,
            });
        }
    }

    return Array.from(runeMap.values());
}

// ============================================================================
// 메인 파싱 함수 (자동 감지)
// ============================================================================

/** JSON 가져오기 - 자동으로 형식 감지 */
export function importRunesFromJson(jsonString: string): Rune[] {
    try {
        const data = JSON.parse(jsonString);

        // 1. 이미 파싱된 Rune 배열 (id와 stats 배열이 있음)
        if (Array.isArray(data) && data.length > 0 && 'id' in data[0] && 'stats' in data[0]) {
            return data as Rune[];
        }

        // 2. 새 구조화된 JSON 스키마 ({ runes: [...] })
        if (data && typeof data === 'object' && 'runes' in data && Array.isArray(data.runes)) {
            return parseFromStructuredJson(data as RuneJsonSchema);
        }

        // 3. 레거시 플랫 배열 (스프레드시트 형식)
        if (Array.isArray(data)) {
            return parseFromLegacyFlatJson(data);
        }

    } catch (error) {
        console.error('Failed to import runes from JSON:', error);
    }
    return [];
}

// ============================================================================
// JSON 내보내기 (새 구조화된 형식)
// ============================================================================

/** JSON 내보내기 - 구조화된 형식 */
export function exportRunesToJson(runes: Rune[]): string {
    const exportData: RuneJsonSchema = {
        version: '1.0',
        lastUpdated: new Date().toISOString().split('T')[0],
        runes: runes.map(rune => ({
            name: rune.name,
            slot: rune.slot,
            index: rune.index,
            stats: rune.stats.map(stat => ({
                type: stat.statType,
                modifier: stat.modifier,
                values: {
                    base: stat.values.base,
                    trans1: stat.values.trans1,
                    trans2: stat.values.trans2,
                },
                category: stat.category !== 'none' ? stat.category : undefined,
            })).map(s => s.category ? s : { type: s.type, modifier: s.modifier, values: s.values }),
            description: rune.description || undefined,
        })).map(r => r.description ? r : { name: r.name, slot: r.slot, index: r.index, stats: r.stats }),
    };

    return JSON.stringify(exportData, null, 2);
}

// ============================================================================
// LocalStorage 관리
// ============================================================================

export function loadRunes(): Rune[] {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (data) {
            return JSON.parse(data) as Rune[];
        }
    } catch (error) {
        console.error('Failed to load runes from storage:', error);
    }
    return [];
}

export function saveRunes(runes: Rune[]): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(runes));
    } catch (error) {
        console.error('Failed to save runes to storage:', error);
    }
}

// ============================================================================
// CRUD 함수
// ============================================================================

export function addRune(runes: Rune[], rune: Omit<Rune, 'id'>): Rune[] {
    const newRune: Rune = { ...rune, id: generateRuneId() };
    const updated = [...runes, newRune];
    saveRunes(updated);
    return updated;
}

export function updateRune(runes: Rune[], id: string, updates: Partial<Rune>): Rune[] {
    const updated = runes.map(rune => rune.id === id ? { ...rune, ...updates } : rune);
    saveRunes(updated);
    return updated;
}

export function deleteRune(runes: Rune[], id: string): Rune[] {
    const updated = runes.filter(rune => rune.id !== id);
    saveRunes(updated);
    return updated;
}

// ============================================================================
// 검색/필터
// ============================================================================

// 한글 초성 배열
const CHOSUNG = [
    'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ',
    'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
];

/** 한글 문자에서 초성 추출 */
function getChosung(char: string): string {
    const code = char.charCodeAt(0);
    // 한글 범위: 0xAC00 ~ 0xD7A3
    if (code >= 0xAC00 && code <= 0xD7A3) {
        const chosungIndex = Math.floor((code - 0xAC00) / 588);
        return CHOSUNG[chosungIndex];
    }
    return char;
}

/** 문자열에서 초성만 추출 */
function extractChosung(str: string): string {
    return str.split('').map(getChosung).join('');
}

/** 검색어가 초성으로만 이루어졌는지 확인 */
function isChosungOnly(str: string): boolean {
    return str.split('').every(char => CHOSUNG.includes(char));
}

/** 띄어쓰기 제거 */
function removeSpaces(str: string): string {
    return str.replace(/\s+/g, '');
}

/** 검색 쿼리와 텍스트 매칭 (초성 검색 + 띄어쓰기 무시) */
function matchesSearch(text: string, query: string): boolean {
    // 소문자 변환 및 띄어쓰기 제거
    const normalizedText = removeSpaces(text.toLowerCase());
    const normalizedQuery = removeSpaces(query.toLowerCase());

    // 빈 쿼리면 매칭
    if (!normalizedQuery) return true;

    // 1. 일반 텍스트 검색 (띄어쓰기 무시)
    if (normalizedText.includes(normalizedQuery)) {
        return true;
    }

    // 2. 초성 검색 (쿼리가 초성으로만 이루어진 경우)
    if (isChosungOnly(normalizedQuery)) {
        const textChosung = extractChosung(normalizedText);
        if (textChosung.includes(normalizedQuery)) {
            return true;
        }
    }

    // 3. 혼합 검색 (쿼리에 초성과 일반 문자가 섞인 경우)
    // 텍스트의 초성과 쿼리 비교
    const textChosung = extractChosung(normalizedText);
    if (textChosung.includes(normalizedQuery)) {
        return true;
    }

    return false;
}

export function filterRunes(
    runes: Rune[],
    filters: {
        slot?: RuneSlot;
        index?: RuneIndex;
        statType?: StatType;
        searchQuery?: string;
    }
): Rune[] {
    return runes.filter(rune => {
        if (filters.slot && rune.slot !== filters.slot) return false;
        if (filters.index && rune.index !== filters.index) return false;

        if (filters.statType) {
            const hasStatType = rune.stats.some(stat => stat.statType === filters.statType);
            if (!hasStatType) return false;
        }

        if (filters.searchQuery) {
            const matchesName = matchesSearch(rune.name, filters.searchQuery);
            const matchesDesc = matchesSearch(rune.description, filters.searchQuery);
            if (!matchesName && !matchesDesc) return false;
        }
        return true;
    });
}

// ============================================================================
// 장신구 룬 관리
// ============================================================================

export function loadAccessoryRunes(): AccessoryRune[] {
    try {
        const data = localStorage.getItem(ACCESSORY_STORAGE_KEY);
        if (data) {
            return JSON.parse(data) as AccessoryRune[];
        }
    } catch (error) {
        console.error('Failed to load accessory runes:', error);
    }
    return [];
}

export function saveAccessoryRunes(runes: AccessoryRune[]): void {
    try {
        localStorage.setItem(ACCESSORY_STORAGE_KEY, JSON.stringify(runes));
    } catch (error) {
        console.error('Failed to save accessory runes:', error);
    }
}
