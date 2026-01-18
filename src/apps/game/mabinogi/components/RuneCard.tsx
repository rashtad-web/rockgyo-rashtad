import type { Rune } from '../types/rune';
import { SLOT_LABELS, INDEX_LABELS, STAT_LABELS } from '../types/rune';
import './RuneCard.css';

interface RuneCardProps {
    rune: Rune;
    viewMode: 'grid' | 'list';
    onClick: () => void;
}

export default function RuneCard({ rune, viewMode, onClick }: RuneCardProps) {
    const slotClass = rune.slot;
    const isMythic = rune.index.includes('mythic');
    const indexClass = isMythic ? 'mythic' : 'legendary';
    const statCount = rune.stats.length;
    const isAccessory = rune.slot === 'accessory';

    return (
        <div
            className={`rune-card ${viewMode} ${slotClass} ${indexClass}`}
            onClick={onClick}
        >
            <div className="rune-header">
                <span className={`rune-slot ${slotClass}`}>
                    {rune.jobClass || SLOT_LABELS[rune.slot]}
                </span>
                <span className={`rune-index ${indexClass}`}>
                    {INDEX_LABELS[rune.index]}
                </span>
            </div>

            <h3 className="rune-name">
                {rune.name}
                {statCount > 1 && !isAccessory && <span className="stat-count-badge">{statCount}개</span>}
            </h3>

            {/* 장신구: 스킬 효과 설명만 표시 */}
            {isAccessory ? (
                <div className="rune-skill-desc">
                    {rune.description.slice(0, 60)}...
                </div>
            ) : (
                /* 일반 룬: 모든 스탯 - 0단계 수치만 표시 */
                <div className="rune-stats-container">
                    {rune.stats.map((stat, i) => (
                        <div key={i} className="rune-stat-item">
                            <span className="stat-type">{STAT_LABELS[stat.statType]}</span>
                            <span className={`stat-value ${stat.modifier}`}>
                                {stat.modifier === 'increase' ? '+' : '-'}{stat.values.base}%
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {/* 리스트 뷰에서 설명 미리보기 */}
            {viewMode === 'list' && rune.description && !isAccessory && (
                <p className="rune-description">{rune.description.slice(0, 80)}...</p>
            )}
        </div>
    );
}
