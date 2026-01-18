import type { RuneSlot, RuneIndex, StatType } from '../types/rune';
import { SLOT_LABELS, INDEX_LABELS, STAT_LABELS } from '../types/rune';
import './RuneFilters.css';

interface RuneFiltersProps {
    slotFilter: RuneSlot | '';
    indexFilter: RuneIndex | '';
    statFilter: StatType | '';
    searchQuery: string;
    onSlotChange: (value: RuneSlot | '') => void;
    onIndexChange: (value: RuneIndex | '') => void;
    onStatChange: (value: StatType | '') => void;
    onSearchChange: (value: string) => void;
    onReset: () => void;
    resultCount: number;
    viewMode: 'grid' | 'list';
    onViewModeChange: (mode: 'grid' | 'list') => void;
}

export default function RuneFilters({
    slotFilter,
    indexFilter,
    statFilter,
    searchQuery,
    onSlotChange,
    onIndexChange,
    onStatChange,
    onSearchChange,
    onReset,
    resultCount,
    viewMode,
    onViewModeChange,
}: RuneFiltersProps) {
    return (
        <div className="rune-filters">
            <div className="filters-row">
                {/* 검색 */}
                <div className="filter-group search">
                    <input
                        type="text"
                        placeholder="룬 이름 또는 설명 검색..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="search-input"
                    />
                </div>

                {/* 부위 필터 */}
                <div className="filter-group">
                    <select
                        value={slotFilter}
                        onChange={(e) => onSlotChange(e.target.value as RuneSlot | '')}
                        className="filter-select"
                    >
                        <option value="">전체 부위</option>
                        {Object.entries(SLOT_LABELS).map(([key, label]) => (
                            <option key={key} value={key}>
                                {label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* 등급 필터 */}
                <div className="filter-group">
                    <select
                        value={indexFilter}
                        onChange={(e) => onIndexChange(e.target.value as RuneIndex | '')}
                        className="filter-select"
                    >
                        <option value="">전체 등급</option>
                        {Object.entries(INDEX_LABELS).map(([key, label]) => (
                            <option key={key} value={key}>
                                {label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* 능력치 필터 */}
                <div className="filter-group">
                    <select
                        value={statFilter}
                        onChange={(e) => onStatChange(e.target.value as StatType | '')}
                        className="filter-select"
                    >
                        <option value="">전체 능력치</option>
                        {Object.entries(STAT_LABELS).map(([key, label]) => (
                            <option key={key} value={key}>
                                {label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* 초기화 */}
                <button className="btn btn-ghost" onClick={onReset}>
                    초기화
                </button>
            </div>

            <div className="filters-info">
                <span className="result-count">{resultCount}개 룬</span>

                <div className="view-toggle">
                    <button
                        className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                        onClick={() => onViewModeChange('grid')}
                        title="그리드 뷰"
                    >
                        ⊞
                    </button>
                    <button
                        className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                        onClick={() => onViewModeChange('list')}
                        title="리스트 뷰"
                    >
                        ☰
                    </button>
                </div>
            </div>
        </div>
    );
}
