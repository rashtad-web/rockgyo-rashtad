import { Link } from 'react-router-dom'
import './HomePage.css'

const apps = [
    {
        path: '/kakao',
        icon: '💬',
        title: '카카오톡 분석',
        description: '카카오톡 대화 내역을 분석하고 통계를 확인하세요',
        status: 'active' as const,
    },
    {
        path: '/game/mabinogi',
        icon: '⚔️',
        title: '마비노기 모바일',
        description: '마비노기 모바일 게임을 위한 유틸리티 도구',
        status: 'active' as const,
    },
    {
        path: '#',
        icon: '🔮',
        title: '더 많은 기능',
        description: '새로운 유틸리티가 계속 추가될 예정입니다',
        status: 'coming-soon' as const,
    },
]

export default function HomePage() {
    return (
        <div className="page home-page">
            <div className="container">
                {/* Hero Section */}
                <section className="hero animate-fade-in">
                    <h1 className="heading-1">
                        나만의 <span className="text-gradient">유틸리티 허브</span>
                    </h1>
                    <p className="hero-subtitle text-secondary">
                        다양한 도구들을 한 곳에서. 필요한 기능을 빠르게 사용하세요.
                    </p>
                </section>

                {/* Apps Grid */}
                <section className="apps-section">
                    <h2 className="heading-3">사용 가능한 도구</h2>
                    <div className="card-grid">
                        {apps.map((app, index) => (
                            <AppCard key={app.path + index} {...app} />
                        ))}
                    </div>
                </section>
            </div>
        </div>
    )
}

interface AppCardProps {
    path: string
    icon: string
    title: string
    description: string
    status: 'active' | 'coming-soon'
}

function AppCard({ path, icon, title, description, status }: AppCardProps) {
    const isComingSoon = status === 'coming-soon'

    const content = (
        <>
            <div className="app-card-icon">{icon}</div>
            <div className="app-card-content">
                <h3 className="app-card-title">
                    {title}
                    {isComingSoon && <span className="badge">준비중</span>}
                </h3>
                <p className="app-card-description text-secondary">{description}</p>
            </div>
            {!isComingSoon && (
                <div className="app-card-arrow">→</div>
            )}
        </>
    )

    if (isComingSoon) {
        return <div className="card app-card disabled">{content}</div>
    }

    return (
        <Link to={path} className="card app-card">
            {content}
        </Link>
    )
}
