# Phase 9 Risk Review

| リスク | 影響 | 重大度 | 現状 |
| --- | --- | --- | --- |
| scoped function coverage が 80% 未満 | 品質 gate を厳密 PASS にできない | 低 | open item として管理 |
| rerun section が settings 下部で埋もれやすい | 発見性が落ちる | 中 | 導線自体は成立。UI 改善候補 |
| test harness の `act(...)` warning | CI ログのノイズ | 低 | user-facing bug ではない |
| store API 不在時の fallback open | 埋め込み環境差分で onboarding が常時開く | 低 | defensive behavior として許容 |
