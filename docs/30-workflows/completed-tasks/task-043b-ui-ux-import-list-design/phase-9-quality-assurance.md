# Phase 9: 品質保証

## メタ情報

| 項目       | 内容                                  |
| ---------- | ------------------------------------- |
| Phase      | 9                                     |
| 機能名     | task-043b-ui-ux-import-list-design    |
| タスク名   | TASK-10A-E-B UI/UX インポート一覧設計 |
| 前提Phase  | Phase 8                               |
| 後続Phase  | Phase 10                              |
| 作成日     | 2026-03-06                            |
| ステータス | completed                             |
| 担当       | SubAgent-B                            |

## 目的

文言、視覚状態、フォーカス、state 整合、error 表示、非スコープ維持を横断監査し、実装開始前の品質保証観点を固定する。

## 背景

本フェーズは `phase-5-implementation.md` で定義した実装境界を基準に、UI と Store の責務逸脱が起きていないかを監査する。UI list task であっても、error alert と stale state の扱いが崩れると user flow 全体が壊れる。

## Atent Team 編成

| SubAgent | 関心ごと  | 主担当内容                                  |
| -------- | --------- | ------------------------------------------- |
| B1       | UX監査    | 文言、見出し、CTA、空状態                   |
| B2       | A11y監査  | focus visible、dialog、status、alert        |
| B3       | State監査 | duplicate guard、stale error、selector 境界 |
| B4       | 総合判定  | 実装着手可否と blocking issue の整理        |

## 実行タスク

- UX 監査: 画面上の語彙と状態表現が一貫しているか確認する
- A11y 監査: dialog、status、alert、button、input の属性と focus を確認する
- State 監査: imported / available / isImporting / skillError の整合を確認する
- 非スコープ監査: 新規 IPC、Preload API、Store state 追加が紛れ込んでいないか確認する

## 参照資料

### 依存Phase

| 資料名                   | パス                                                | 用途           |
| ------------------------ | --------------------------------------------------- | -------------- |
| 依存Phase 5 仕様         | `phase-5-implementation.md`                         | 実装境界       |
| 依存Phase 8 仕様         | `phase-8-refactoring.md`                            | 分割条件       |
| 依存Phase 8 成果物       | `outputs/phase-8/refactoring-plan.md`               | refactor 条件  |
| 実装計画                 | `outputs/phase-5/implementation-plan.md`            | Phase 5 成果物 |
| コンポーネント境界図     | `outputs/phase-5/component-boundary-map.md`         | Phase 5 成果物 |
| selector-action対応表    | `outputs/phase-5/selector-action-map.md`            | Phase 5 成果物 |
| import flow wireframe    | `outputs/phase-5/import-flow-wireframe.md`          | Phase 5 成果物 |
| 文言トークン正規化       | `outputs/phase-8/copy-token-normalization.md`       | Phase 8 成果物 |
| コンポーネント抽出ガイド | `outputs/phase-8/component-extraction-guideline.md` | Phase 8 成果物 |

### システム仕様（aiworkflow-requirements）

| 資料名     | パス                                                                           | 用途                     |
| ---------- | ------------------------------------------------------------------------------ | ------------------------ |
| 品質要件   | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`    | 品質観点                 |
| UI設計原則 | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md` | 文言とフォーカス         |
| A11yテスト | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`   | aria と focus            |
| 状態管理   | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`   | state 整合               |
| エラー仕様 | `.claude/skills/aiworkflow-requirements/references/error-handling.md`          | error alert と再試行導線 |

## 実行手順

1. 文言が `追加する`、`追加しました`、`もう一度試してみてください` の方針に沿っているか確認する。
2. `role="status"` と `role="alert"` の使い分けが仕様に含まれているか確認する。
3. duplicate import、nullish metadata、防御検索、`importedCount` 非依存の成功条件が仕様に含まれているか確認する。
4. local UI hook を使う場合でも既存個別selector + ローカル state に閉じているか確認する。
5. 新規 IPC / Preload / Store state 追加が仕様に含まれていないことを確認する。

## 統合テスト連携

- UX / A11y / State の3軸を test case と manual case に再配布する。
- blocking issue がある場合は Phase 5 または Phase 6 へ戻す。
- pass 判定は Phase 10 の go/no-go 入力にする。

## 多角的チェック観点

| 観点               | 本Phaseで確認する内容                                                                        | 仕様参照先                                                                                                                                                                                                                               |
| ------------------ | -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| セキュリティ       | UI変更が Renderer 内に閉じており、新規IPC/Preload/API追加がないことを確認する                | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`, `.claude/skills/aiworkflow-requirements/references/error-handling.md`                                                                                      |
| UI/UX              | 2セクション、状態表示、文言、フォーカス、ライブリージョン、レスポンシブ品質を監査する        | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`, `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`, `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`      |
| アーキテクチャ     | `SkillManagementPanel` の責務境界と既存 view 非侵食が品質監査で維持されるか確認する          | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`, `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                                                                                  |
| API/IPC            | `skill:list` / `skill:getImported` / `skill:import` の既存契約再利用に留まっているか確認する | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`, `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                                                                                  |
| エラーハンドリング | error alert、retry、stale error クリア、擬似失敗防止を監査する                               | `.claude/skills/aiworkflow-requirements/references/error-handling.md`, `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                                                                                      |
| テスタビリティ     | TC-ID、selector、fixture、manual evidence の対応が QA レポートへ反映されるか確認する         | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`, `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`, `.claude/skills/aiworkflow-requirements/references/testing-fixtures.md` |

### Electronデスクトップアプリ観点

| 層       | 本Phaseで確認する内容                                              | 仕様参照先                                                                                                                                                      |
| -------- | ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Renderer | list view / dialog / live region / focus contract の品質を監査する | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                                                                                         |
| Main     | 新規サービス追加なし、既存 handler 契約を変えない                  | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`, `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` |
| IPC通信  | 既存 `skill:*` channel の戻り値契約が維持されているか確認する      | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                                                                                            |
| Preload  | 新規公開API追加なしを確認する                                      | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`                                                                                    |
| Store    | `agentSlice` 個別selector と idempotent import 契約を維持する      | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                                                                                    |

## 成果物

| 成果物              | パス                                                    | 説明                         |
| ------------------- | ------------------------------------------------------- | ---------------------------- |
| 品質レポート        | `outputs/phase-9/quality-report.md`                     | UX / A11y / State の総合監査 |
| A11y 準拠 checklist | `outputs/phase-9/accessibility-compliance-checklist.md` | 属性と focus の監査          |
| UX 一貫性監査       | `outputs/phase-9/ux-consistency-audit.md`               | 文言と状態表現の監査         |

## 完了条件

- [x] UX / A11y / State の監査観点が出揃っている
- [x] 非スコープ逸脱なしが明記されている
- [x] blocking issue の差戻し先が明記されている
- [x] nullish metadata、防御検索、`importedCount` 非依存の成功条件、local hook 許容境界が監査対象に入っている
- [x] Phase 10 の go/no-go 入力が揃っている
- [x] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. UX 監査
2. A11y 監査
3. State 監査
4. blocking issue 整理
5. 完了条件確認

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 成果物テーブルの全ファイルを出力
- [x] 完了条件を全件確認

## 次のPhase

Phase 10: 最終レビューゲート
