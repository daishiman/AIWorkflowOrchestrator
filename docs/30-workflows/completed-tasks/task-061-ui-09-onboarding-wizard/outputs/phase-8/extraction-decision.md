# Phase 8 Extraction Decision

| 候補 | 判断 | 理由 |
| --- | --- | --- |
| `OnboardingWizard` を shared 化 | 見送り | onboarding は dashboard 専用 UX で、現時点では view-local が自然 |
| skill card 定義を store へ移動 | 見送り | UI 表示向けの curated choice であり、store state ではない |
| display name fallback を view 側へ移動 | 却下 | selector で集中管理した方が regression を抑えやすい |
| Phase 11 harness を App route に統合 | 却下 | 本番 routing と screenshot evidence を分離したい |
| `SettingsView` rerun section の organism 化 | 見送り | 再利用箇所がなく section 単位で十分 |
