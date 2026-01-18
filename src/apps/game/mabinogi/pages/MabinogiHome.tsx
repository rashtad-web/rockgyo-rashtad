import { Link } from 'react-router-dom'

export default function MabinogiHome() {
    return (
        <div className="page">
            <div className="container">
                <div className="app-header animate-fade-in">
                    <Link to="/" className="back-link">← 홈으로</Link>
                    <div className="app-title-section">
                        <span className="app-icon">⚔️</span>
                        <h1 className="heading-2">마비노기 모바일</h1>
                    </div>
                    <p className="text-secondary">
                        마비노기 모바일을 더 즐겁게 플레이하기 위한 유틸리티
                    </p>
                </div>

                <div className="tools-section">
                    <h3 className="heading-3">도구 목록</h3>
                    <div className="card-grid">
                        <ToolCard
                            icon="🔮"
                            title="룬 도감"
                            description="8성 전설/신화 룬 정보 검색 및 관리"
                            status="active"
                            href="/game/mabinogi/runes"
                        />
                        <ToolCard
                            icon="🧮"
                            title="스탯 계산기"
                            description="캐릭터 스탯과 전투력을 계산합니다"
                            status="coming-soon"
                        />
                        <ToolCard
                            icon="📖"
                            title="스킬 가이드"
                            description="스킬별 상세 정보와 추천 빌드"
                            status="coming-soon"
                        />
                        <ToolCard
                            icon="🗺️"
                            title="던전 공략"
                            description="던전별 공략 정보와 보상 목록"
                            status="coming-soon"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

interface ToolCardProps {
    icon: string
    title: string
    description: string
    status: 'active' | 'coming-soon'
    href?: string
}

function ToolCard({ icon, title, description, status, href }: ToolCardProps) {
    const isComingSoon = status === 'coming-soon'

    const content = (
        <>
            <span className="tool-icon">{icon}</span>
            <div className="tool-content">
                <h4>
                    {title}
                    {isComingSoon && <span className="badge">준비중</span>}
                </h4>
                <p className="text-muted">{description}</p>
            </div>
        </>
    )

    if (href && !isComingSoon) {
        return (
            <Link to={href} className="card tool-card active-tool">
                {content}
            </Link>
        )
    }

    return (
        <div className={`card tool-card ${isComingSoon ? 'disabled' : ''}`}>
            {content}
        </div>
    )
}
