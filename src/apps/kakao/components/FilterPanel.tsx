import { useState, useEffect } from 'react';
import type { FilterOptions } from '../types';
import './FilterPanel.css';

interface FilterPanelProps {
    dateRange: { min: Date; max: Date };
    onApply: (options: FilterOptions) => void;
    isLoading?: boolean;
}

export default function FilterPanel({
    dateRange,
    onApply,
    isLoading,
}: FilterPanelProps) {
    const formatDateTime = (date: Date) => {
        const pad = (n: number) => String(n).padStart(2, '0');
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
            date.getDate()
        )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
    };

    const [startDate, setStartDate] = useState(formatDateTime(dateRange.min));
    const [endDate, setEndDate] = useState(formatDateTime(dateRange.max));
    const [keywords, setKeywords] = useState(
        '벙, 정모, 술, 맛집, 공연, 연습, 밴드, 음악, 노래, 라이브, 락교'
    );

    // dateRange가 변경되면 입력값 업데이트
    useEffect(() => {
        setStartDate(formatDateTime(dateRange.min));
        setEndDate(formatDateTime(dateRange.max));
    }, [dateRange]);

    const handleApply = () => {
        const keywordList = keywords
            .split(',')
            .map((k) => k.trim())
            .filter((k) => k.length > 0);

        onApply({
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            keywords: keywordList.length > 0 ? keywordList : undefined,
        });
    };

    const handleReset = () => {
        setStartDate(formatDateTime(dateRange.min));
        setEndDate(formatDateTime(dateRange.max));
        setKeywords('벙, 정모, 술, 맛집, 공연, 연습, 밴드, 음악, 노래, 라이브, 락교');
        // 리셋 후 자동 적용
        onApply({
            startDate: dateRange.min,
            endDate: dateRange.max,
            keywords: ['벙', '정모', '술', '맛집', '공연', '연습', '밴드', '음악', '노래', '라이브', '락교'],
        });
    };

    return (
        <div className="filter-panel">
            <h2>🔧 필터 설정</h2>

            <div className="filter-grid">
                {/* 기간 필터 */}
                <div className="filter-group date-filter">
                    <h3>📅 기간 필터</h3>
                    <div className="input-group">
                        <label>시작 날짜/시간</label>
                        <input
                            type="datetime-local"
                            value={startDate}
                            min={formatDateTime(dateRange.min)}
                            max={formatDateTime(dateRange.max)}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>
                    <div className="input-group">
                        <label>종료 날짜/시간</label>
                        <input
                            type="datetime-local"
                            value={endDate}
                            min={formatDateTime(dateRange.min)}
                            max={formatDateTime(dateRange.max)}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                    <div className="date-range-info">
                        파일 범위: {dateRange.min.toLocaleString('ko-KR')} ~{' '}
                        {dateRange.max.toLocaleString('ko-KR')}
                    </div>
                </div>

                {/* 키워드 필터 */}
                <div className="filter-group keyword-filter">
                    <h3>🔍 키워드 설정</h3>
                    <div className="input-group">
                        <label>키워드 목록 (쉼표로 구분)</label>
                        <textarea
                            value={keywords}
                            onChange={(e) => setKeywords(e.target.value)}
                            placeholder="예: 벙, 정모, 술, 맛집, 공연"
                            rows={4}
                        />
                    </div>
                    <div className="keyword-hint">
                        키워드는 쉼표(,)로 구분하여 입력하세요.
                    </div>
                </div>
            </div>

            {/* 버튼 */}
            <div className="filter-actions">
                <button
                    className="btn btn-primary"
                    onClick={handleApply}
                    disabled={isLoading}
                >
                    {isLoading ? '처리 중...' : '✅ 적용'}
                </button>
                <button
                    className="btn btn-secondary"
                    onClick={handleReset}
                    disabled={isLoading}
                >
                    🔄 초기화
                </button>
            </div>
        </div>
    );
}
