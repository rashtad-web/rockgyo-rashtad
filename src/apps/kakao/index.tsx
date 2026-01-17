import { Routes, Route } from 'react-router-dom'
import KakaoHome from './pages/KakaoHome'
import './styles.css'

/**
 * 카카오톡 분석 앱 모듈
 * 
 * 이 모듈은 완전히 독립적으로 개발됩니다.
 * 내부 라우팅: /kakao/* 
 */
export default function KakaoApp() {
    return (
        <div className="kakao-app">
            <Routes>
                <Route index element={<KakaoHome />} />
                {/* 추가 페이지들을 여기에 설정 */}
                {/* <Route path="analyze" element={<AnalyzePage />} /> */}
                {/* <Route path="stats" element={<StatsPage />} /> */}
            </Routes>
        </div>
    )
}
