import { Outlet, Link, useLocation } from 'react-router-dom'

const navLinks = [
    { path: '/', label: '홈' },
    { path: '/kakao', label: '카카오톡 분석' },
    { path: '/game/mabinogi', label: '마비노기 모바일' },
]

export default function MainLayout() {
    const location = useLocation()

    const isActive = (path: string) => {
        if (path === '/') return location.pathname === '/'
        return location.pathname.startsWith(path)
    }

    return (
        <>
            <header className="header">
                <div className="container header-inner">
                    <Link to="/" className="logo">
                        🚀 Rockgyo
                    </Link>
                    <nav className="nav">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`nav-link ${isActive(link.path) ? 'active' : ''}`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                </div>
            </header>
            <main>
                <Outlet />
            </main>
        </>
    )
}
