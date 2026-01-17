import { Link } from 'react-router-dom'

export default function KakaoHome() {
    return (
        <div className="page">
            <div className="container">
                <div className="app-header animate-fade-in">
                    <Link to="/" className="back-link">← 홈으로</Link>
                    <div className="app-title-section">
                        <span className="app-icon">💬</span>
                        <h1 className="heading-2">카카오톡 분석</h1>
                    </div>
                    <p className="text-secondary">
                        카카오톡 대화 내역을 업로드하고 다양한 통계를 확인하세요
                    </p>
                </div>

                <div className="feature-section">
                    <div className="card upload-card">
                        <div className="upload-area">
                            <div className="upload-icon">📁</div>
                            <h3>대화 내역 업로드</h3>
                            <p className="text-secondary">
                                카카오톡에서 내보낸 .txt 파일을 드래그하거나 클릭하여 업로드
                            </p>
                            <button className="btn btn-primary">
                                파일 선택
                            </button>
                        </div>
                    </div>

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
                            icon="💝"
                            title="이모티콘 분석"
                            description="자주 사용하는 이모티콘 확인"
                        />
                        <FeatureCard
                            icon="🔤"
                            title="워드 클라우드"
                            description="자주 사용하는 단어 시각화"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

interface FeatureCardProps {
    icon: string
    title: string
    description: string
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
    return (
        <div className="card feature-card">
            <span className="feature-icon">{icon}</span>
            <h4>{title}</h4>
            <p className="text-muted">{description}</p>
        </div>
    )
}
