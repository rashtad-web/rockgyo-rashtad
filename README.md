# Rockgyo Rashtad

다양한 유틸리티 도구들을 모아둔 개인 웹사이트입니다.

🌐 **Live Site**: [https://rashtad-web.github.io/rockgyo-rashtad](https://rashtad-web.github.io/rockgyo-rashtad)

## 🚀 Features

| 경로             | 기능                 | 상태     |
| ---------------- | -------------------- | -------- |
| `/kakao`         | 카카오톡 대화 분석   | 🚧 개발중 |
| `/game/mabinogi` | 마비노기 모바일 유틸 | 🚧 개발중 |

## 🛠️ Tech Stack

- **React 19** + **TypeScript**
- **Vite** - 빠른 빌드 도구
- **React Router** - SPA 라우팅
- **GitHub Pages** - 배포

## 📁 Project Structure

```
src/
├── apps/                    # 독립 앱 모듈들
│   ├── kakao/              # 카카오톡 분석
│   └── game/
│       └── mabinogi/       # 마비노기 모바일 유틸
├── shared/                  # 공통 컴포넌트/유틸
├── layouts/                 # 레이아웃
├── pages/                   # 메인 페이지
├── App.tsx                  # 라우터 설정
└── main.tsx                 # 엔트리 포인트
```

## 🧑‍💻 Development

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 미리보기
npm run preview
```

## 📦 Adding New App Module

새로운 독립 기능을 추가하려면:

1. `src/apps/[category]/[app-name]/` 폴더 생성
2. `index.tsx` - 앱 엔트리 포인트 (내부 라우팅 포함)
3. `pages/` - 페이지 컴포넌트들
4. `styles.css` - 앱 전용 스타일
5. `App.tsx`에 lazy import 및 라우트 추가

```tsx
// App.tsx에 추가
const NewApp = lazy(() => import('./apps/category/new-app'))

// Routes 내부에 추가
<Route 
  path="/category/new-app/*" 
  element={
    <Suspense fallback={<div className="loading">로딩 중...</div>}>
      <NewApp />
    </Suspense>
  } 
/>
```

## 🚀 Deployment

`main` 브랜치에 푸시하면 GitHub Actions가 자동으로 빌드 및 배포합니다.

```bash
git add .
git commit -m "feat: add new feature"
git push origin main
```

## 📄 License

MIT License