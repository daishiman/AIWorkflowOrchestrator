# aiworkflow-requirements 抽出マトリクス（TASK-UI-05A）

## 目的

`task-specification-creator` の「漏れなく仕様抽出」要件を満たすため、`aiworkflow-requirements` から今回実装に必要な情報を関心ごとごとに固定化する。

## 抽出ポリシー

- 起点は `indexes/resource-map.md`（Progressive Disclosure）
- 補助として `indexes/quick-reference.md` と `scripts/search-spec.js` を利用
- 仕様書更新対象は SubAgent ごとに分割し、1バッチ3ファイル以下を維持

## 必須仕様セット（実装前に必読）

| 関心ごと     | 必須仕様                                                                                             | 必須理由                                                       |
| ------------ | ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| UI/UX        | `ui-ux-components.md`, `ui-ux-feature-components.md`, `ui-ux-design-principles.md`                   | 画面責務、既存UIとの境界、視覚規約を固定するため               |
| IPC/API      | `api-ipc-agent.md`, `interfaces-agent-sdk-skill.md`, `api-endpoints.md`                              | チャネル契約と型境界（`skill:getFileTree` 含む）を固定するため |
| セキュリティ | `security-electron-ipc.md`, `security-skill-ipc.md`, `security-api-electron.md`, `error-handling.md` | P42/P45、Sender検証、エラーサニタイズを一貫させるため          |
| 品質/試験    | `quality-requirements.md`, `testing-component-patterns.md`, `testing-accessibility.md`               | カバレッジ基準、テスト戦略、a11y要件を固定するため             |
| 台帳/履歴    | `task-workflow.md`, `ui-ux-components.md`, `ui-ux-feature-components.md`, `lessons-learned.md`       | `spec_created` 状態、未タスク、教訓の同期漏れを防ぐため        |

## 条件付き仕様セット（該当時のみ追加）

| 条件                           | 追加参照仕様                                             | 判定基準                                          |
| ------------------------------ | -------------------------------------------------------- | ------------------------------------------------- |
| Preload API の追加・変更がある | `interfaces-agent-sdk-ui.md`, `security-api-electron.md` | Preload公開メソッド名・引数・戻り値に変更がある   |
| IPC契約の改修がある            | `ipc-contract-checklist.md`, `architecture-overview.md`  | チャネル追加/削除、引数名変更、戻り値変更がある   |
| 状態管理設計に変更がある       | `arch-state-management.md`, `arch-ui-components.md`      | Hook構造・Store境界・再レンダリング戦略を変更する |
| E2E/UI回帰を厳密化する         | `testing-playwright-e2e.md`                              | 実装フェーズで画面遷移とUI回帰を自動化する        |

## SubAgent 編成（関心ごと分離）

| SubAgent | 関心ごと      | 主責務                                                  | 必須参照仕様                                                                                                |
| -------- | ------------- | ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| A        | UI/UX         | 画面仕様・アクセシビリティ整合                          | `ui-ux-components.md`, `ui-ux-design-principles.md`, `ui-ux-feature-components.md`, `arch-ui-components.md` |
| B        | IPC/API契約   | IPCチャネル契約・型境界整合（`skill:getFileTree` 含む） | `api-ipc-agent.md`, `api-endpoints.md`, `interfaces-agent-sdk-skill.md`, `ipc-contract-checklist.md`        |
| C        | セキュリティ  | IPC防御・入力検証・エラー方針整合                       | `security-electron-ipc.md`, `security-skill-ipc.md`, `security-api-electron.md`, `error-handling.md`        |
| D        | 品質/試験     | カバレッジ・試験観点・品質ゲート整合                    | `quality-requirements.md`, `testing-component-patterns.md`, `testing-accessibility.md`                      |
| E        | 台帳/依存整合 | 先行タスク整合、残課題・履歴同期                        | `task-workflow.md`, `lessons-learned.md`, `TASK-UI-05-SKILL-CENTER-VIEW`                                    |

## Phase別 抽出適用マトリクス

| Phase | 主要論点         | 参照すべき仕様（必須）                             | 出力先                         |
| ----- | ---------------- | -------------------------------------------------- | ------------------------------ |
| 1     | 要件定義         | A, B, C, D                                         | `phase-1-requirements.md`      |
| 2     | 設計             | A, B, C + `arch-state-management.md`               | `phase-2-design.md`            |
| 3     | 設計レビュー     | A, B, C, D                                         | `phase-3-design-review.md`     |
| 4     | テスト作成       | D + B（IPC観点） + C（入力検証観点）               | `phase-4-test-creation.md`     |
| 5     | 実装             | A, B, C, D（実装と試験の双方向整合）               | `phase-5-implementation.md`    |
| 6     | テスト拡充       | D + A（a11y） + C（異常系）                        | `phase-6-test-expansion.md`    |
| 7     | カバレッジ確認   | D（品質基準正本）                                  | `phase-7-coverage-check.md`    |
| 8     | リファクタ       | A（UI維持） + D（品質維持） + B/C（契約/防御維持） | `phase-8-refactoring.md`       |
| 9     | 品質保証         | A, B, C, D を総合評価                              | `phase-9-quality-assurance.md` |
| 10    | 最終レビュー     | A, B, C, D, E                                      | `phase-10-final-review.md`     |
| 11    | 手動テスト       | A, D + E（先行回帰）                               | `phase-11-manual-test.md`      |
| 12    | ドキュメント更新 | A, B, C, D, E（仕様同期）                          | `phase-12-documentation.md`    |
| 13    | PR作成           | E（許可制/台帳整合）                               | `phase-13-pr-creation.md`      |

## 抽出再現コマンド

```bash
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "ui-ux-components" -C 2
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "skill:readFile" -C 2
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "skill:getFileTree" -C 2
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "ipc-contract-checklist" -C 2
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "security-electron-ipc" -C 2
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "security-api-electron" -C 2
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "quality-requirements" -C 2
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "testing-accessibility" -C 2
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "task-workflow" -C 2
```

## 抽出漏れガード（チェックリスト）

- [ ] UI/UX, IPC/API, セキュリティ, 品質/試験, 台帳の5関心ごとが全て参照されている
- [ ] IPC/API では `skill:getFileTree` の実装状況（未実装/UT管理）まで確認している
- [ ] IPC改修がある場合、`ipc-contract-checklist.md` の該当フェーズを実施している
- [ ] Preload/IPC境界に変更がある場合、`security-api-electron.md` を確認している
- [ ] 参照先が `resource-map.md` のカテゴリ定義と一致している
- [ ] 実装に不要なカテゴリ（DB更新など）は「非適用理由」を明記している
- [ ] 仕様更新時、`topic-map.md` 再生成トリガーの有無を判定している
