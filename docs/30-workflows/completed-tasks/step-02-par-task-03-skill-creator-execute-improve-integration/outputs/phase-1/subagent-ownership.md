# Phase 1 SubAgent 分担

ユーザー要求に従い、本 task は関心ごとを分けて進める。ただし UI にはこの分担を露出しない。

| SubAgent         | 担当                                 | 今回の実作業への割当                                             |
| ---------------- | ------------------------------------ | ---------------------------------------------------------------- |
| Planner Agent    | 要件整理、モード判定、セッション設計 | Phase 1-3 の要件・設計・レビュー成果物                           |
| Executor Agent   | create / execute handoff 実装        | `SkillManagementPanel` session card、store handoff、実行 UI 接続 |
| Improver Agent   | improve flow、失敗系、文書同期       | analyze / auto improve 接続、QA、Phase 12 spec sync              |
| Validation Agent | テスト・品質ゲート・証跡             | Vitest、lint/typecheck、Phase 11 screenshot/coverage             |

## 並列実行ポリシー

- 調査、既存コード読取、テスト実行、Phase成果物草案は並列化してよい
- 設計判断、API 境界の確定、実コード反映、spec 更新は順序を守る
- `SubAgent` / `Codex` / `Atent Team` は内部の分業概念であり、UI 主責務にはしない
