import { Routes, Route, Link, useLocation } from 'react-router-dom'
import MabinogiHome from './pages/MabinogiHome'
import RuneDatabase from './pages/RuneDatabase'
import './styles.css'

/**
 * 마비노기 모바일 유틸 앱 모듈
 * 
 * 이 모듈은 완전히 독립적으로 개발됩니다.
 * 내부 라우팅: /game/mabinogi/*
 */
export default function MabinogiApp() {
    const location = useLocation()
    const isHome = location.pathname === '/game/mabinogi' || location.pathname === '/game/mabinogi/'

    return (
        <div className="mabinogi-app">
            {/* 내부 네비게이션 */}
            {!isHome && (
                <nav className="mabi-nav">
                    <Link to="/game/mabinogi" className="nav-back">← 메인</Link>
                    <div className="nav-links">
                        <Link
                            to="/game/mabinogi/runes"
                            className={location.pathname.includes('/runes') ? 'active' : ''}
                        >
                            🔮 룬 도감
                        </Link>
                        {/* 추가 기능은 여기에 */}
                    </div>
                </nav>
            )}

            <Routes>
                <Route index element={<MabinogiHome />} />
                <Route path="runes" element={<RuneDatabase />} />
                {/* 추가 페이지들을 여기에 설정 */}
                {/* <Route path="calculator" element={<CalculatorPage />} /> */}
            </Routes>
        </div>
    )
}
