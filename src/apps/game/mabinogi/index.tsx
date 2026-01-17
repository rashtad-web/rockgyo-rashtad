import { Routes, Route } from 'react-router-dom'
import MabinogiHome from './pages/MabinogiHome'
import './styles.css'

/**
 * 마비노기 모바일 유틸 앱 모듈
 * 
 * 이 모듈은 완전히 독립적으로 개발됩니다.
 * 내부 라우팅: /game/mabinogi/*
 */
export default function MabinogiApp() {
    return (
        <div className="mabinogi-app">
            <Routes>
                <Route index element={<MabinogiHome />} />
                {/* 추가 페이지들을 여기에 설정 */}
                {/* <Route path="calculator" element={<CalculatorPage />} /> */}
                {/* <Route path="guide" element={<GuidePage />} /> */}
            </Routes>
        </div>
    )
}
