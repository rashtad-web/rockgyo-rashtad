import { useState, useEffect, useCallback } from 'react';
import type { Rune, RuneSlot, RuneIndex, StatType } from '../types/rune';
import {
    filterRunes,
    importRunesFromJson,
} from '../utils/runeManager';
import RuneCard from '../components/RuneCard';
import RuneFilters from '../components/RuneFilters';
import RuneDetailModal from '../components/RuneDetailModal';
import './RuneDatabase.css';

// 내장 룬 데이터
import runesData from '../data/runes.json';

export default function RuneDatabase() {
    const [runes, setRunes] = useState<Rune[]>([]);
    const [filteredRunes, setFilteredRunes] = useState<Rune[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // 필터 상태
    const [slotFilter, setSlotFilter] = useState<RuneSlot | ''>('');
    const [indexFilter, setIndexFilter] = useState<RuneIndex | ''>('');
    const [statFilter, setStatFilter] = useState<StatType | ''>('');
    const [searchQuery, setSearchQuery] = useState('');

    // 모달 상태
    const [selectedRune, setSelectedRune] = useState<Rune | null>(null);

    // 뷰 모드
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // 초기 로드 - 내장 데이터만 사용 (static)
    useEffect(() => {
        const loadedRunes = importRunesFromJson(JSON.stringify(runesData));
        setRunes(loadedRunes);
        setFilteredRunes(loadedRunes);
        setIsLoading(false);
    }, []);

    // 필터 적용
    useEffect(() => {
        const filtered = filterRunes(runes, {
            slot: slotFilter || undefined,
            index: indexFilter || undefined,
            statType: statFilter || undefined,
            searchQuery: searchQuery || undefined,
        });
        setFilteredRunes(filtered);
    }, [runes, slotFilter, indexFilter, statFilter, searchQuery]);

    // 필터 초기화
    const handleResetFilters = useCallback(() => {
        setSlotFilter('');
        setIndexFilter('');
        setStatFilter('');
        setSearchQuery('');
    }, []);

    // 통계
    const stats = {
        total: runes.length,
        weapon: runes.filter((r) => r.slot === 'weapon').length,
        armor: runes.filter((r) => r.slot === 'armor').length,
        emblem: runes.filter((r) => r.slot === 'emblem').length,
        accessory: runes.filter((r) => r.slot === 'accessory').length,
    };

    if (isLoading) {
        return (
            <div className="rune-database loading">
                <div className="spinner"></div>
                <p>로딩 중...</p>
            </div>
        );
    }

    return (
        <div className="rune-database">
            {/* 헤더 */}
            <header className="db-header">
                <div className="header-content">
                    <h1>🔮 룬 도감</h1>
                    <p className="subtitle">마비노기 모바일 8성 전설/신화 룬 데이터베이스</p>
                </div>
            </header>

            {/* 통계 카드 */}
            <section className="stats-section">
                <div className="stat-cards">
                    <div className="stat-card total">
                        <span className="stat-value">{stats.total}</span>
                        <span className="stat-label">전체</span>
                    </div>
                    <div className="stat-card weapon">
                        <span className="stat-value">{stats.weapon}</span>
                        <span className="stat-label">무기</span>
                    </div>
                    <div className="stat-card armor">
                        <span className="stat-value">{stats.armor}</span>
                        <span className="stat-label">방어구</span>
                    </div>
                    <div className="stat-card emblem">
                        <span className="stat-value">{stats.emblem}</span>
                        <span className="stat-label">엠블럼</span>
                    </div>
                    <div className="stat-card accessory">
                        <span className="stat-value">{stats.accessory}</span>
                        <span className="stat-label">장신구</span>
                    </div>
                </div>
            </section>

            {/* 필터 */}
            <RuneFilters
                slotFilter={slotFilter}
                indexFilter={indexFilter}
                statFilter={statFilter}
                searchQuery={searchQuery}
                onSlotChange={setSlotFilter}
                onIndexChange={setIndexFilter}
                onStatChange={setStatFilter}
                onSearchChange={setSearchQuery}
                onReset={handleResetFilters}
                resultCount={filteredRunes.length}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
            />

            {/* 룬 목록 */}
            {filteredRunes.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">🔍</div>
                    <h3>검색 결과가 없습니다</h3>
                    <p>필터 조건을 변경해 보세요.</p>
                    <button className="btn btn-secondary" onClick={handleResetFilters}>
                        필터 초기화
                    </button>
                </div>
            ) : (
                <div className={`rune-list ${viewMode}`}>
                    {filteredRunes.map((rune) => (
                        <RuneCard
                            key={rune.id}
                            rune={rune}
                            viewMode={viewMode}
                            onClick={() => setSelectedRune(rune)}
                        />
                    ))}
                </div>
            )}

            {/* 상세 팝업 */}
            {selectedRune && (
                <RuneDetailModal
                    rune={selectedRune}
                    onClose={() => setSelectedRune(null)}
                />
            )}
        </div>
    );
}
