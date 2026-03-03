# aiworkflow-requirements 抽出マトリクス（UT-UI-05A-GETFILETREE-001）

## 目的

`task-specification-creator` の「漏れなく仕様抽出」要件に合わせ、`skill:getFileTree` 実装で参照すべき仕様を関心ごと単位で固定化する。

## 抽出ポリシー

- 起点は `indexes/resource-map.md`（Progressive Disclosure）
- 補助として `scripts/search-spec.js` を利用
- 仕様書更新は 1 SubAgent あたり 3 ファイル以下を原則とする
- 「実装に必須」と「条件付き」を分離し、非適用理由を明記する

## 必須仕様セット（今回実装で常に参照）

| 関心ごと       | 必須仕様                                                                         | 必須理由                                                            |
| -------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| IPC/API契約    | `api-ipc-agent.md`, `interfaces-agent-sdk-skill.md`, `ipc-contract-checklist.md` | `skill:getFileTree` チャネル契約、型境界、P42/P45準拠を固定するため |
| セキュリティ   | `security-electron-ipc.md`, `security-api-electron.md`, `error-handling.md`      | sender検証、入力検証、エラーサニタイズを実装境界に反映するため      |
| アーキテクチャ | `architecture-overview.md`, `arch-electron-services.md`                          | Renderer/Preload/Main の責務境界と配置ルールを維持するため          |
| 品質/試験      | `quality-requirements.md`, `testing-component-patterns.md`                       | 目標カバレッジ・テスト設計の基準を統一するため                      |
| 台帳/履歴      | `task-workflow.md`, `lessons-learned.md`                                         | 未タスク管理・完了記録・苦戦箇所の再利用を保証するため              |

## 条件付き仕様セット（該当時のみ追加）

| 条件                       | 追加参照仕様                                                                     | 今回判定                                              |
| -------------------------- | -------------------------------------------------------------------------------- | ----------------------------------------------------- |
| UI表示仕様を変更する       | `ui-ux-components.md`, `ui-ux-feature-components.md`, `testing-accessibility.md` | 条件付き（SkillEditorView側統合まで進める場合に適用） |
| DBスキーマを変更する       | `database-schema.md`, `database-implementation.md`                               | 非適用（今回DB変更なし）                              |
| 外部API/HTTP連携を変更する | `api-core.md`, `api-endpoints.md`                                                | 非適用（IPCのみ）                                     |
| 状態管理スライスを変更する | `arch-state-management.md`                                                       | 条件付き（useFileTree契約変更時に適用）               |

## SubAgent 編成（関心ごと分離）

| SubAgent | 関心ごと       | 担当仕様                                                                                 |
| -------- | -------------- | ---------------------------------------------------------------------------------------- |
| A        | IPC/API契約    | `api-ipc-agent.md`, `interfaces-agent-sdk-skill.md`, `ipc-contract-checklist.md`         |
| B        | セキュリティ   | `security-electron-ipc.md`, `security-api-electron.md`, `error-handling.md`              |
| C        | アーキテクチャ | `architecture-overview.md`, `arch-electron-services.md`, `interfaces-agent-sdk-skill.md` |
| D        | 品質/試験      | `quality-requirements.md`, `testing-component-patterns.md`, `testing-accessibility.md`   |
| E        | 台帳/履歴      | `task-workflow.md`, `lessons-learned.md`, `LOGS.md`                                      |

## Phase別適用マトリクス

| Phase | 主要論点         | 参照する仕様 |
| ----- | ---------------- | ------------ |
| 1     | 要件定義         | A, B, C      |
| 2     | 設計             | A, B, C      |
| 3     | 設計レビュー     | A, B, C, D   |
| 4     | テスト作成       | A, B, D      |
| 5     | 実装             | A, B, C      |
| 6     | テスト拡充       | B, D         |
| 7     | カバレッジ確認   | D            |
| 8     | リファクタリング | A, B, D      |
| 9     | 品質保証         | A, B, D      |
| 10    | 最終レビュー     | A, B, C, D   |
| 11    | 手動テスト       | A, D         |
| 12    | ドキュメント更新 | A, B, E      |
| 13    | PR準備           | E            |

## 抽出再現コマンド

```bash
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "skill:getFileTree" -C 2
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "getFileTree" -C 2
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "ipc-contract-checklist" -C 2
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "security-electron-ipc" -C 2
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "interfaces-agent-sdk-skill" -C 2
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "task-workflow" -C 2
```

## 抽出漏れガード

- [ ] IPC/API・セキュリティ・アーキテクチャ・品質・台帳の5関心ごとを確認した
- [ ] `skill:getFileTree` の実装状況（未実装/完了）を `api-ipc-agent.md` と `task-workflow.md` で照合した
- [ ] `security-api-electron.md` の Preload公開ルールを確認した
- [ ] 条件付き仕様（UI/DB/API）を非適用理由つきで判定した
- [ ] Phase 12 で `topic-map.md` 再生成の要否を判定した
