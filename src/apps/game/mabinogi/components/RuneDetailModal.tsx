import { useState } from 'react';
import type { Rune } from '../types/rune';
import { SLOT_LABELS, INDEX_LABELS, STAT_LABELS, CATEGORY_LABELS } from '../types/rune';
import './RuneDetailModal.css';

interface RuneDetailModalProps {
    rune: Rune;
    onClose: () => void;
}

type TranscendenceLevel = 0 | 1 | 2;

export default function RuneDetailModal({ rune, onClose }: RuneDetailModalProps) {
    const slotClass = rune.slot;
    const isMythic = rune.index.includes('mythic');
    const indexClass = isMythic ? 'mythic' : 'legendary';
    const isAccessory = rune.slot === 'accessory';

    const [transLevel, setTransLevel] = useState<TranscendenceLevel>(0);

    const getValue = (stat: typeof rune.stats[0]) => {
        if (isMythic) return stat.values.base;
        switch (transLevel) {
            case 0: return stat.values.base;
            case 1: return stat.values.trans1;
            case 2: return stat.values.trans2;
        }
    };

    // 초월 단계별 클래스
    const transClass = `trans-${transLevel}`;

    return (
        <div className="popup-overlay" onClick={onClose}>
            <div className={`popup-content ${indexClass}`} onClick={(e) => e.stopPropagation()}>
                {/* 초월 효과 내부 오버레이 */}
                {transLevel > 0 && <div className={`trans-effect ${transClass}`} />}
                {/* 헤더 */}
                <div className="popup-header">
                    <div className="popup-title-row">
                        <span className={`popup-slot ${slotClass}`}>
                            {rune.jobClass || SLOT_LABELS[rune.slot]}
                        </span>
                        <h3 className="popup-name">{rune.name}</h3>
                        <span className={`popup-index ${indexClass}`}>{INDEX_LABELS[rune.index]}</span>
                    </div>
                    <button className="popup-close" onClick={onClose}>✕</button>
                </div>

                {/* 초월 단계 선택 (전설만, 장신구는 표시 방식 다름) */}
                {!isMythic && (
                    <div className="popup-trans-toggle">
                        {([0, 1, 2] as TranscendenceLevel[]).map((level) => (
                            <button
                                key={level}
                                className={`toggle-btn trans-level-${level} ${transLevel === level ? 'active' : ''}`}
                                onClick={() => setTransLevel(level)}
                            >
                                {level === 0 ? '기본' : level === 1 ? '전설+' : '전설++'}
                            </button>
                        ))}
                    </div>
                )}

                {/* 장신구: 초월 효과 표시 */}
                {isAccessory && transLevel > 0 && (
                    <div className="popup-accessory-bonus">
                        <span className="bonus-label">초월 보너스</span>
                        <span className="bonus-value">+{transLevel * 1.5}% 최종 피해</span>
                    </div>
                )}

                {/* 일반 룬: 스탯 목록 */}
                {!isAccessory && (
                    <div className="popup-stats">
                        {rune.stats.map((stat, index) => (
                            <div key={index} className={`popup-stat ${stat.modifier}`}>
                                <span className="popup-stat-name">
                                    {STAT_LABELS[stat.statType]}
                                    {stat.category !== 'none' && (
                                        <span className="popup-category">{CATEGORY_LABELS[stat.category]}</span>
                                    )}
                                </span>
                                <span className={`popup-stat-value ${stat.modifier} ${transClass}`}>
                                    {stat.modifier === 'increase' ? '+' : '-'}{getValue(stat)}%
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                {/* 설명 */}
                {rune.description && (
                    <div className="popup-description">
                        {rune.description}
                    </div>
                )}
            </div>
        </div>
    );
}
