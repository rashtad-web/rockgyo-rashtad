import { Routes, Route } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import HomePage from './pages/HomePage'

// 독립 앱 모듈들 (lazy loading으로 필요할 때만 로드)
import { lazy, Suspense } from 'react'

const KakaoApp = lazy(() => import('./apps/kakao'))
const MabinogiApp = lazy(() => import('./apps/game/mabinogi'))

function App() {
    return (
        <Routes>
            <Route element={<MainLayout />}>
                {/* 메인 홈페이지 */}
                <Route path="/" element={<HomePage />} />

                {/* 독립 앱 모듈들 */}
                <Route
                    path="/kakao/*"
                    element={
                        <Suspense fallback={<div className="loading">로딩 중...</div>}>
                            <KakaoApp />
                        </Suspense>
                    }
                />
                <Route
                    path="/game/mabinogi/*"
                    element={
                        <Suspense fallback={<div className="loading">로딩 중...</div>}>
                            <MabinogiApp />
                        </Suspense>
                    }
                />

                {/* 404 페이지 */}
                <Route path="*" element={<NotFound />} />
            </Route>
        </Routes>
    )
}

function NotFound() {
    return (
        <div className="not-found">
            <h1>404</h1>
            <p>페이지를 찾을 수 없습니다</p>
        </div>
    )
}

export default App
