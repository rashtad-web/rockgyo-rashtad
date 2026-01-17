import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { analyzeChat, readFileAsText } from '../utils/analyzer';
import type { AnalysisResult, FilterOptions } from '../types';
import FileUpload from '../components/FileUpload';
import FilterPanel from '../components/FilterPanel';
import StatisticsDisplay from '../components/StatisticsDisplay';
import './KakaoHome.css';

export default function KakaoHome() {
    const [fileContent, setFileContent] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string>('');
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 파일 업로드 처리
    const handleFileSelect = useCallback(async (file: File) => {
        setIsLoading(true);
        setError(null);
        setFileName(file.name);

        try {
            const content = await readFileAsText(file);
            setFileContent(content);

            // 초기 분석 실행
            const result = analyzeChat(content);
            setAnalysisResult(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : '파일 분석 중 오류가 발생했습니다.');
            setAnalysisResult(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // 필터 적용 처리
    const handleFilterApply = useCallback(
        (options: FilterOptions) => {
            if (!fileContent) return;

            setIsLoading(true);
            setError(null);

            // UI 업데이트를 위해 비동기 처리
            setTimeout(() => {
                try {
                    const result = analyzeChat(
                        fileContent,
                        options.startDate,
                        options.endDate,
                        options.keywords
                    );
                    // 원본 날짜 범위 유지
                    if (analysisResult) {
                        result.dateRange = analysisResult.dateRange;
                    }
                    setAnalysisResult(result);
                } catch (err) {
                    setError(
                        err instanceof Error ? err.message : '필터 적용 중 오류가 발생했습니다.'
                    );
                } finally {
                    setIsLoading(false);
                }
            }, 50);
        },
        [fileContent, analysisResult]
    );

    return (
        <div className="page kakao-page">
            <div className="container">
                {/* 헤더 */}
                <div className="app-header animate-fade-in">
                    <Link to="/" className="back-link">
                        ← 홈으로
                    </Link>
                    <div className="app-title-section">
                        <span className="app-icon">💬</span>
                        <div>
                            <h1 className="heading-2">카카오톡 채팅 통계 분석기</h1>
                            <p className="text-secondary">
                                카카오톡 대화 내역을 업로드하고 다양한 통계를 확인하세요
                            </p>
                        </div>
                    </div>
                </div>

                {/* 파일 업로드 */}
                <section className="upload-section">
                    <FileUpload
                        onFileSelect={handleFileSelect}
                        fileName={fileName}
                        isLoading={isLoading}
                    />
                </section>

                {/* 에러 메시지 */}
                {error && (
                    <div className="error-message">
                        <strong>오류:</strong> {error}
                    </div>
                )}

                {/* 로딩 표시 */}
                {isLoading && (
                    <div className="loading-indicator">
                        <div className="spinner"></div>
                        <p>분석 중...</p>
                    </div>
                )}

                {/* 필터 패널 (분석 결과가 있을 때만 표시) */}
                {analysisResult && !isLoading && (
                    <section className="filter-section">
                        <FilterPanel
                            dateRange={analysisResult.dateRange}
                            onApply={handleFilterApply}
                            isLoading={isLoading}
                        />
                    </section>
                )}

                {/* 통계 결과 */}
                {analysisResult && !isLoading && (
                    <section className="results-section">
                        <StatisticsDisplay stats={analysisResult.stats} />
                    </section>
                )}

                {/* 초기 안내 (파일 업로드 전) */}
                {!analysisResult && !isLoading && !error && (
                    <section className="intro-section">
                        <div className="features-grid">
                            <FeatureCard
                                icon="📊"
                                title="대화 통계"
                                description="누가 얼마나 대화했는지 분석"
                            />
                            <FeatureCard
                                icon="📈"
                                title="시간대 분석"
                                description="언제 가장 활발하게 대화하는지"
                            />
                            <FeatureCard
                                icon="😂"
                                title="감정 분석"
                                description="웃음, 울음 표현 및 감정 통계"
                            />
                            <FeatureCard
                                icon="🔤"
                                title="키워드 분석"
                                description="자주 사용하는 단어와 키워드"
                            />
                            <FeatureCard
                                icon="🎯"
                                title="대화 패턴"
                                description="대화 주도자, 종료자 분석"
                            />
                            <FeatureCard
                                icon="🏷️"
                                title="멘션 분석"
                                description="가장 많이 태그된 사람"
                            />
                        </div>

                        <div className="how-to-use">
                            <h3>📖 사용 방법</h3>
                            <ol>
                                <li>카카오톡 채팅방에서 대화 내보내기 (설정 → 대화 내보내기)</li>
                                <li>내보낸 .txt 파일을 위 영역에 드래그하거나 클릭하여 업로드</li>
                                <li>분석 결과 확인 및 필터 조정</li>
                            </ol>
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}

interface FeatureCardProps {
    icon: string;
    title: string;
    description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
    return (
        <div className="feature-card">
            <span className="feature-icon">{icon}</span>
            <h4>{title}</h4>
            <p className="text-muted">{description}</p>
        </div>
    );
}
