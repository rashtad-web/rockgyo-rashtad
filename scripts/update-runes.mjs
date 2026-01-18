/**
 * 마비노기 룬 데이터 업데이트 스크립트
 * 
 * Google 스프레드시트에서 룬 데이터를 가져와 runes.json을 업데이트합니다.
 * 
 * 사용법:
 *   npm run update-runes
 * 
 * 스프레드시트 URL:
 *   https://docs.google.com/spreadsheets/d/1MXDN0MQEGsqwysscKCxWe6e5xiXgdRDcm5eZqLzKb9I
 */

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 스프레드시트 ID
const SPREADSHEET_ID = '1MXDN0MQEGsqwysscKCxWe6e5xiXgdRDcm5eZqLzKb9I';

// 시트 GID
const SHEETS = {
    main: 0,                // 첫 번째 시트 (무기/방어구/엠블럼 룬)
    accessory: 436299696,   // 장신구 시트
};

// 출력 파일 경로
const OUTPUT_PATH = path.resolve(__dirname, '../src/apps/game/mabinogi/data/runes.json');

// ============================================================================
// 한글 -> 영어 매핑
// ============================================================================

const SLOT_MAP = {
    '무기': 'weapon',
    '방어구': 'armor',
    '장신구': 'accessory',
    '앰블럼': 'emblem',
    '엠블럼': 'emblem',
};

const INDEX_MAP = {
    '시즌0\n전설': 'season1_legendary',
    '시즌1\n전설': 'season1_legendary',
    '시즌1\n신화': 'season1_mythic',
    '시즌2\n전설': 'season2_legendary',
    '시즌2\n신화': 'season2_mythic',
    '시즌0 전설': 'season1_legendary',
    '시즌1 전설': 'season1_legendary',
    '시즌1 신화': 'season1_mythic',
    '시즌2 전설': 'season2_legendary',
    '시즌2 신화': 'season2_mythic',
    '어비스 전설': 'abyss_legendary',
    '레이드 전설': 'raid_legendary',
};

const STAT_MAP = {
    '치명타 확률': 'critRate',
    '치명타 피해': 'critDamage',
    '추가타 확률': 'extraHitRate',
    '강타 피해': 'heavyHitDamage',
    '연타 피해': 'comboHitDamage',
    '콤보 피해': 'comboDamage',
    '공격력': 'attackPower',
    '주는 피해': 'damageDealt',
    '적에게 주는 피해': 'damageDealtToEnemy',
    '(적)받는 피해': 'enemyDamageReceived',
    '(적이)받는 피해': 'enemyDamageReceived',
    '(내가)받는 피해': 'selfDamageReceived',
    '받는 피해': 'damageReceived',
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
    '기타': 'other',
};

const CATEGORY_MAP = {
    '누적': 'stack',
    '축적': 'stack',
    '결함': 'combine',
    '결합': 'combine',
    '각성': 'awaken',
    'X': 'none',
    'O': 'none',
    '-': 'none',
    '': 'none',
};

// ============================================================================
// HTTP 요청
// ============================================================================

function fetchUrl(url) {
    return new Promise((resolve, reject) => {
        const makeRequest = (targetUrl) => {
            https.get(targetUrl, (response) => {
                if (response.statusCode === 302 || response.statusCode === 301) {
                    makeRequest(response.headers.location);
                    return;
                }

                let data = '';
                response.on('data', chunk => data += chunk);
                response.on('end', () => resolve(data));
                response.on('error', reject);
            }).on('error', reject);
        };

        makeRequest(url);
    });
}

// ============================================================================
// CSV 파싱
// ============================================================================

function parseCSV(csv) {
    // 따옴표 내의 줄바꿈을 보존하면서 행 단위로 분리
    const lines = [];
    let currentLine = '';
    let inQuotes = false;

    for (let i = 0; i < csv.length; i++) {
        const char = csv[i];

        if (char === '"') {
            if (inQuotes && csv[i + 1] === '"') {
                currentLine += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
            currentLine += char;
        } else if ((char === '\n' || char === '\r') && !inQuotes) {
            if (char === '\r' && csv[i + 1] === '\n') {
                i++; // CRLF 처리
            }
            if (currentLine.trim()) {
                lines.push(currentLine);
            }
            currentLine = '';
        } else {
            currentLine += char;
        }
    }
    if (currentLine.trim()) {
        lines.push(currentLine);
    }

    if (lines.length === 0) return [];

    const headers = parseCSVLine(lines[0]);
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        const row = {};
        headers.forEach((header, index) => {
            row[header.trim()] = values[index]?.trim() || '';
        });
        rows.push(row);
    }

    return rows;
}

function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else if (char !== '\r') {
            current += char;
        }
    }
    result.push(current);

    return result;
}

// ============================================================================
// 메인 룬 파싱 (무기/방어구/엠블럼)
// ============================================================================

function parseMainRunes(rows) {
    const runeMap = new Map();
    let currentSlot = '';
    let currentIndex = '';
    let currentName = '';

    for (const row of rows) {
        // 파츠가 있으면 업데이트 (빈 문자열이 아닌 경우만)
        const slotValue = row['파츠']?.trim();
        if (slotValue && slotValue !== '') {
            currentSlot = slotValue;
        }

        // 룬 인덱스가 있으면 업데이트
        const indexValue = row['룬 인덱스']?.trim();
        if (indexValue && indexValue !== '') {
            currentIndex = indexValue;
        }

        // 이름이 있으면 업데이트
        const nameValue = row['이름']?.trim();
        if (nameValue && nameValue !== '') {
            currentName = nameValue;
        }

        const effectKr = row['효과'] || '';
        const base = parseFloat(row['초월0']) || 0;
        const trans1 = parseFloat(row['초월1']) || 0;
        const trans2 = parseFloat(row['초월2']) || 0;
        const modifierKr = row['증감'] || '';
        const categoryKr = row['옵션'] || '';
        const description = row['룬 설명'] || '';

        // 효과가 없으면 스킵
        if (!effectKr || !currentName) continue;

        const slot = SLOT_MAP[currentSlot] || 'weapon';
        const index = INDEX_MAP[currentIndex] || 'season1_legendary';
        const statType = STAT_MAP[effectKr] || 'other';

        // 음수 값이면 decrease (스프레드시트에서 X는 "해당 없음"이며 양수값은 항상 increase)
        const hasNegativeValue = base < 0 || trans1 < 0 || trans2 < 0;
        const modifier = hasNegativeValue ? 'decrease' : 'increase';

        const category = CATEGORY_MAP[categoryKr] || 'none';

        const stat = {
            type: statType,
            modifier,
            values: {
                base: Math.abs(base),
                trans1: Math.abs(trans1),
                trans2: Math.abs(trans2)
            },
        };
        if (category !== 'none') {
            stat.category = category;
        }

        const runeKey = `${slot}_${index}_${currentName}`;

        if (runeMap.has(runeKey)) {
            runeMap.get(runeKey).stats.push(stat);
            if (!runeMap.get(runeKey).description && description) {
                runeMap.get(runeKey).description = description;
            }
        } else {
            const rune = {
                name: currentName,
                slot,
                index,
                stats: [stat],
            };
            if (description) {
                rune.description = description;
            }
            runeMap.set(runeKey, rune);
        }
    }

    return Array.from(runeMap.values());
}

// ============================================================================
// 장신구 룬 파싱
// ============================================================================

function parseAccessoryRunes(rows) {
    const runes = [];

    for (const row of rows) {
        const jobClass = row['직업']?.trim() || '';
        const name = row['등급']?.trim() || row['이름']?.trim() || '';

        // 설명은 빈 헤더이거나 7번째 열일 수 있음
        const keys = Object.keys(row);
        const descKey = keys.find(k => k !== '직업' && k !== '등급' && k !== '이름' && row[k]?.includes('스킬'));
        const description = descKey ? row[descKey]?.trim() : (row[''] || '');

        if (!name || !jobClass) continue;

        runes.push({
            name,
            slot: 'accessory',
            index: 'season1_legendary',
            jobClass,
            stats: [
                {
                    type: 'skillChange',
                    modifier: 'increase',
                    values: { base: 0, trans1: 1.5, trans2: 3 }
                },
                {
                    type: 'finalDamage',
                    modifier: 'increase',
                    values: { base: 0, trans1: 1.5, trans2: 3 }
                }
            ],
            description: description || '',
        });
    }

    return runes;
}

// ============================================================================
// 메인 실행
// ============================================================================

async function main() {
    console.log('🔄 룬 데이터 업데이트 시작...\n');

    let mainRunes = [];
    let accessoryRunes = [];

    try {
        // 메인 시트 가져오기
        console.log('📥 메인 시트 다운로드 중...');
        const mainUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&gid=${SHEETS.main}`;
        const mainCSV = await fetchUrl(mainUrl);
        const mainRows = parseCSV(mainCSV);
        console.log(`   → ${mainRows.length}개 행 로드됨`);

        mainRunes = parseMainRunes(mainRows);
        console.log(`   → ${mainRunes.length}개 룬 파싱됨`);

    } catch (error) {
        console.error('❌ 메인 시트 다운로드 실패:', error.message);
    }

    try {
        // 장신구 시트 가져오기
        console.log('\n📥 장신구 시트 다운로드 중...');
        const accessoryUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&gid=${SHEETS.accessory}`;
        const accessoryCSV = await fetchUrl(accessoryUrl);
        const accessoryRows = parseCSV(accessoryCSV);
        console.log(`   → ${accessoryRows.length}개 행 로드됨`);

        accessoryRunes = parseAccessoryRunes(accessoryRows);
        console.log(`   → ${accessoryRunes.length}개 룬 파싱됨`);

    } catch (error) {
        console.error('❌ 장신구 시트 다운로드 실패:', error.message);
    }

    // 모든 룬 합치기
    const allRunes = [...mainRunes, ...accessoryRunes];

    if (allRunes.length === 0) {
        console.log('\n❌ 파싱된 룬이 없습니다.');
        return;
    }

    // JSON 생성
    const output = {
        version: '1.0',
        lastUpdated: new Date().toISOString().split('T')[0],
        runes: allRunes,
    };

    // 파일 저장
    console.log('\n💾 runes.json 저장 중...');
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 4), 'utf-8');

    // 통계 출력
    const stats = {
        total: allRunes.length,
        weapon: allRunes.filter(r => r.slot === 'weapon').length,
        armor: allRunes.filter(r => r.slot === 'armor').length,
        emblem: allRunes.filter(r => r.slot === 'emblem').length,
        accessory: allRunes.filter(r => r.slot === 'accessory').length,
    };

    console.log('\n✅ 업데이트 완료!\n');
    console.log('📊 통계:');
    console.log(`   전체: ${stats.total}개`);
    console.log(`   무기: ${stats.weapon}개`);
    console.log(`   방어구: ${stats.armor}개`);
    console.log(`   엠블럼: ${stats.emblem}개`);
    console.log(`   장신구: ${stats.accessory}개`);
    console.log(`\n📁 저장 위치: ${OUTPUT_PATH}`);
}

main();
