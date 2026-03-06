# Phase 3: 設計レビューゲート

## メタ情報

| 項目       | 内容                                  |
| ---------- | ------------------------------------- |
| Phase      | 3                                     |
| 機能名     | task-043b-ui-ux-import-list-design    |
| タスク名   | TASK-10A-E-B UI/UX インポート一覧設計 |
| 前提Phase  | Phase 2                               |
| 後続Phase  | Phase 4                               |
| 作成日     | 2026-03-06                            |
| ステータス | completed                             |
| 担当       | SubAgent-B                            |

## 目的

Phase 2 の UI 設計が既存アーキテクチャ、Store 契約、テスト方針、親タスク依存関係と矛盾しないことをレビューする。

## 背景

本タスクは `SkillManagementPanel` に imported / available の2系統を持ち込むため、`TASK-10A-E-A` の IPC 境界、`TASK-10A-E-C` の state 設計、既存 `TASK-10A-D` の currentView 遷移と競合しやすい。

## Atent Team 編成

| SubAgent | 関心ごと   | 主担当内容                                       |
| -------- | ---------- | ------------------------------------------------ |
| B1       | UI整合     | 見出し、件数、空状態の一貫性                     |
| B2       | Store整合  | `availableSkillsMetadata` / `importSkill` の境界 |
| B3       | A11y整合   | dialog と live region の設計妥当性               |
| B4       | リスク統合 | 差戻し条件と依存リスクの集約                     |

## 実行タスク

- 設計レビュー: Phase 2 の情報設計、状態設計、A11y 設計をレビューする
- 依存レビュー: A / C / D タスクと衝突する設計を抽出する
- リスク登録: 仕様の曖昧点、既存 UI とのドリフト、テスト不足をリスクとして固定する
- Go/Back 判定: Phase 4 へ進める条件と差戻し条件を定義する

## 参照資料

### 親タスク・コード

| 資料名             | パス                                           | 用途                   |
| ------------------ | ---------------------------------------------- | ---------------------- |
| 親タスク仕様       | `../task-043b-ui-ux-import-list-design.md`     | 親受け入れ条件の再確認 |
| 依存Phase 1 仕様   | `phase-1-requirements.md`                      | 要件根拠の確認         |
| 依存Phase 2 仕様   | `phase-2-design.md`                            | レビュー対象           |
| 依存Phase 2 成果物 | `outputs/phase-2/information-architecture.md`  | UI構造の確認           |
| 依存Phase 2 成果物 | `outputs/phase-2/ui-state-matrix.md`           | 状態優先順位の確認     |
| 依存Phase 2 成果物 | `outputs/phase-2/a11y-interaction-contract.md` | A11y 契約の確認        |
| 要件定義書         | `outputs/phase-1/requirements-definition.md`   | Phase 1 成果物         |
| 受け入れ基準       | `outputs/phase-1/acceptance-criteria.md`       | Phase 1 成果物         |
| スコープ定義       | `outputs/phase-1/scope-definition.md`          | Phase 1 成果物         |
| UI状態棚卸し       | `outputs/phase-1/ui-state-inventory.md`        | Phase 1 成果物         |
| 文言ガイド         | `outputs/phase-2/copy-guidelines.md`           | Phase 2 成果物         |

### システム仕様（aiworkflow-requirements）

| 資料名               | パス                                                                         | 用途                                      |
| -------------------- | ---------------------------------------------------------------------------- | ----------------------------------------- |
| UIコンポーネント仕様 | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`      | 完了済み UI パターンとの差分確認          |
| UIアーキテクチャ     | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`    | SkillManagementPanel の責務逸脱確認       |
| 状態管理             | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md` | state 境界の逸脱確認                      |
| 教訓                 | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`       | import id mismatch と偽成功ログの再発防止 |
| 品質要件             | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`  | テスト粒度と coverage 条件                |
| タスク運用           | `.claude/skills/aiworkflow-requirements/references/task-workflow-rules.md`   | Phase通過条件                             |

## 実行手順

1. Phase 2 の4成果物をレビューし、要件未反映、非スコープ逸脱、文言ドリフトを抽出する。
2. `arch-state-management.md` の idempotent import 契約と、追加成功時の UI 遷移が一致しているか確認する。
3. `lessons-learned.md` を参照し、`skill.name` と `skill.id` の混同、IPC 最終戻り値の誤読、dialog focus drift をリスクとして記録する。
4. Phase 4 に渡す差戻し条件を `MAJOR` / `MINOR` に分けて固定する。

## 統合テスト連携

- リスクごとに自動テスト化対象を紐付ける。
- `MAJOR` は Phase 4 着手禁止、`MINOR` は Phase 4 に観点追加で進行可能とする。
- `SkillManagementPanel.integration.test.tsx` に残す currentView 遷移回帰を blocking 条件へ入れる。

## レビュー判定基準

| 判定  | 条件                                                                 | 対応                                                       |
| ----- | -------------------------------------------------------------------- | ---------------------------------------------------------- |
| PASS  | 要件、UI設計、Store境界、A11y設計、依存関係に欠陥がない              | Phase 4 へ進む                                             |
| MINOR | 文言、証跡、TC対応表、N/A理由に軽微な不足がある                      | 指摘を `design-review-result.md` に記録して Phase 4 へ進む |
| MAJOR | 要件未反映、責務逸脱、A/C/D との境界衝突、focus/alert 設計欠落がある | 影響範囲に応じて Phase 1 または Phase 2 へ差し戻す         |

### 差戻し先決定

| 問題種別   | 戻り先  | 本タスクでの具体例                                          |
| ---------- | ------- | ----------------------------------------------------------- |
| 要件の問題 | Phase 1 | imported / available の対象範囲が曖昧、非スコープ条件が欠落 |
| 設計の問題 | Phase 2 | 状態優先順位、focus return、件数表示、検索適用範囲が未定義  |
| 両方の問題 | Phase 1 | 親タスク依存と UI 方針が同時に矛盾している                  |

## 多角的チェック観点

| 観点               | 本Phaseで確認する内容                                                                   | 仕様参照先                                                                                                                                                                                                                               |
| ------------------ | --------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| セキュリティ       | 新規IPC/Preload/API追加なしを維持し、Renderer内のUI設計に閉じること                     | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`, `.claude/skills/aiworkflow-requirements/references/error-handling.md`                                                                                      |
| UI/UX              | 2セクション、状態表示、文言、フォーカス、ライブリージョン、44pxターゲットをレビューする | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`, `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`, `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`      |
| アーキテクチャ     | `SkillManagementPanel` の責務境界と既存 `editor/analysis/create` view 非侵食を確認する  | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`, `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                                                                                  |
| API/IPC            | `skill:list` / `skill:getImported` / `skill:import` の既存契約再利用に限定する          | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`, `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                                                                                  |
| エラーハンドリング | 擬似失敗、二重追加、stale error、再試行導線が設計へ入っているか確認する                 | `.claude/skills/aiworkflow-requirements/references/error-handling.md`, `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                                                                                      |
| テスタビリティ     | TC-ID、selector、fixture、manual evidence の対応が後続Phaseで維持できるか確認する       | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`, `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`, `.claude/skills/aiworkflow-requirements/references/testing-fixtures.md` |

### Electronデスクトップアプリ観点

| 層       | 本Phaseで確認する内容                                            | 仕様参照先                                                                                                                                                      |
| -------- | ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Renderer | list view / dialog / live region / focus contract をレビューする | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                                                                                         |
| Main     | 新規サービス追加なし、既存 handler 契約を変えない                | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`, `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` |
| IPC通信  | 既存 `skill:*` channel を再利用し、新規 channel を追加しない     | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                                                                                            |
| Preload  | 新規公開API追加なしを確認する                                    | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`                                                                                    |
| Store    | `agentSlice` 個別selector と idempotent import 契約を維持する    | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                                                                                    |

## 成果物

| 成果物             | パス                                         | 説明                     |
| ------------------ | -------------------------------------------- | ------------------------ |
| 設計レビュー結果   | `outputs/phase-3/design-review-result.md`    | 合否と指摘一覧           |
| オープンリスク台帳 | `outputs/phase-3/open-risk-register.md`      | MAJOR / MINOR リスク一覧 |
| 依存判定ログ       | `outputs/phase-3/dependency-decision-log.md` | A / C / D との境界判断   |

## 完了条件

- [x] Phase 2 の主要設計がレビュー済みである
- [x] MAJOR / MINOR リスクが分類済みである
- [x] A / C / D タスクとの依存境界が記録されている
- [x] Phase 4 へ進む条件と差戻し条件が定義されている
- [x] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. Phase 2 成果物確認
2. 依存レビュー
3. リスク分類
4. 合否判定
5. 完了条件確認

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 成果物テーブルの全ファイルを出力
- [x] 完了条件を全件確認

## 次のPhase

Phase 4: テスト作成
