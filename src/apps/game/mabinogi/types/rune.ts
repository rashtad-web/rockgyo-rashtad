// 마비노기 모바일 룬 도감 타입 정의

/** 룬 장착 부위 */
export type RuneSlot = 'weapon' | 'armor' | 'accessory' | 'emblem';

/** 룬 등급/시즌 인덱스 */
export type RuneIndex =
    | 'season1_legendary'   // 시즌1 전설
    | 'season1_mythic'      // 시즌1 신화
    | 'season2_legendary'   // 시즌2 전설
    | 'season2_mythic'      // 시즌2 신화
    | 'abyss_legendary'     // 어비스 전설
    | 'raid_legendary';     // 레이드 전설

/** 능력치 옵션 종류 */
export type StatType =
    | 'critRate'           // 치명타 확률
    | 'critDamage'         // 치명타 피해
    | 'extraHitRate'       // 추가타 확률
    | 'heavyHitDamage'     // 강타 피해
    | 'comboHitDamage'     // 연타 피해
    | 'comboDamage'        // 콤보 피해
    | 'attackPower'        // 공격력
    | 'damageDealt'        // 주는 피해
    | 'damageDealtToEnemy' // 적에게 주는 피해
    | 'damageReceived'     // 받는 피해
    | 'enemyDamageReceived' // (적이)받는 피해
    | 'selfDamageReceived' // (내가)받는 피해
    | 'multiHitDamage'     // 멀티히트 피해
    | 'skillDamage'        // 스킬 피해
    | 'chargeSkillDamage'  // 차지 스킬 피해
    | 'ultimateDamage'     // 궁극기 피해
    | 'cooldown'           // 쿨타임
    | 'cooldownReduction'  // 쿨타임 감소
    | 'cooldownSpeed'      // 쿨타임 속도
    | 'cooldownRecovery'   // 쿨타임 회복 속도
    | 'castingSpeed'       // 캐스팅 속도
    | 'castingChargeSpeed' // 캐스팅/차지 속도
    | 'chargeSpeed'        // 차지 속도
    | 'skillSpeed'         // 스킬 사용 속도
    | 'healAmount'         // 치유량
    | 'recovery'           // 회복력
    | 'breakDamage'        // 무방비 피해
    | 'breakSkillDamage'   // 브레이크 스킬 피해
    | 'breakHitDamage'     // 브레이크 피해
    | 'dotDamage'          // 지속 피해
    | 'finalDamage'        // 최종 피해
    | 'defense'            // 방어력
    | 'hp'                 // 체력
    | 'skillChange'        // 스킬 변화 (장신구)
    | 'other';             // 기타

/** 효과 증감 타입 */
export type ModifierType = 'increase' | 'decrease';

/** 옵션 분류 */
export type OptionCategory = 'stack' | 'combine' | 'awaken' | 'none';

/** 초월 단계별 수치 */
export interface TranscendenceValues {
    base: number;      // 초월 0단계
    trans1: number;    // 초월 1단계 (전설+)
    trans2: number;    // 초월 2단계 (전설++)
}

/** 개별 능력치 효과 (룬 하나에 여러 개 가능) */
export interface RuneStat {
    statType: StatType;              // 능력치 종류
    values: TranscendenceValues;     // 초월 단계별 수치
    modifier: ModifierType;          // 증가/감소
    category: OptionCategory;        // 옵션 분류 (누적, 결합, 각성)
}

/** 룬 데이터 (멀티 스탯 지원) */
export interface Rune {
    id: string;                      // 고유 ID (자동 생성)
    slot: RuneSlot;                  // 장착 부위
    index: RuneIndex;                // 등급/시즌
    name: string;                    // 룬 이름
    stats: RuneStat[];               // 능력치 목록 (1개 이상)
    description: string;             // 상세 설명
    jobClass?: string;               // 직업 (장신구 룬용)
}

/** 장신구 룬 (스킬 특화) */
export interface AccessoryRune {
    id: string;
    slot: 'accessory';
    index: RuneIndex;
    name: string;
    jobClass: string;                // 직업 (전사, 마법사 등)
    description: string;             // 스킬 효과 설명
    skillEffect?: string;            // 대상 스킬
}

/** 룬 필터 옵션 */
export interface RuneFilters {
    slot?: RuneSlot;
    index?: RuneIndex;
    statType?: StatType;
    searchQuery?: string;
}

/** 한글 라벨 매핑 */
export const SLOT_LABELS: Record<RuneSlot, string> = {
    weapon: '무기',
    armor: '방어구',
    accessory: '장신구',
    emblem: '엠블럼',
};

export const INDEX_LABELS: Record<RuneIndex, string> = {
    season1_legendary: '시즌1 전설',
    season1_mythic: '시즌1 신화',
    season2_legendary: '시즌2 전설',
    season2_mythic: '시즌2 신화',
    abyss_legendary: '어비스 전설',
    raid_legendary: '레이드 전설',
};

export const STAT_LABELS: Record<StatType, string> = {
    critRate: '치명타 확률',
    critDamage: '치명타 피해',
    extraHitRate: '추가타 확률',
    heavyHitDamage: '강타 피해',
    comboHitDamage: '연타 피해',
    comboDamage: '콤보 피해',
    attackPower: '공격력',
    damageDealt: '주는 피해',
    damageDealtToEnemy: '적에게 주는 피해',
    damageReceived: '받는 피해',
    enemyDamageReceived: '(적이)받는 피해',
    selfDamageReceived: '(내가)받는 피해',
    multiHitDamage: '멀티히트 피해',
    skillDamage: '스킬 피해',
    chargeSkillDamage: '차지 스킬 피해',
    ultimateDamage: '궁극기 피해',
    cooldown: '쿨타임',
    cooldownReduction: '쿨타임 감소',
    cooldownSpeed: '쿨타임 속도',
    cooldownRecovery: '쿨타임 회복 속도',
    castingSpeed: '캐스팅 속도',
    castingChargeSpeed: '캐스팅/차지 속도',
    chargeSpeed: '차지 속도',
    skillSpeed: '스킬 사용 속도',
    healAmount: '치유량',
    recovery: '회복력',
    breakDamage: '무방비 피해',
    breakSkillDamage: '브레이크 스킬 피해',
    breakHitDamage: '브레이크 피해',
    dotDamage: '지속 피해',
    finalDamage: '최종 피해',
    defense: '방어력',
    hp: '체력',
    skillChange: '스킬 변화',
    other: '기타',
};

export const MODIFIER_LABELS: Record<ModifierType, string> = {
    increase: '증가',
    decrease: '감소',
};

export const CATEGORY_LABELS: Record<OptionCategory, string> = {
    stack: '누적',
    combine: '결합',
    awaken: '각성',
    none: '-',
};
