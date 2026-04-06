# Phase 3: 設計レビューゲート

## メタ情報

| 項目       | 内容                                  |
| ---------- | ------------------------------------- |
| Phase      | 3                                     |
| Phase名    | 設計レビューゲート                    |
| 対象機能   | TASK-UI-02 ConversationPanel 孤立解消 |
| 前提Phase  | Phase 2: 設計                         |
| 次Phase    | Phase 4: テスト作成                   |
| ステータス | pending                               |
| 作成日     | 2026-04-06                            |
| 更新日     | 2026-04-06                            |

## 目的

コンポーネント再利用性、IPC 経路整合性、ナビゲーション契約準拠を gate 判定し、実装に進めるかを確認する。

## 実行手順

### Step 1: Phase 2 の設計書を読み込む

`outputs/phase-2/design-document.md` を精読し、以下の観点でレビューする。

### Step 2: 以下の Task を順次実行

## 実行タスク

### Task 1: コンポーネント再利用性チェック

- 共有コンポーネント（QuestionCard 等）の Props 型が IPC に依存していないことを確認する
- ConversationPanel 固有のロジックが抽出コンポーネントに漏れていないことを確認する
- 抽出コンポーネントが ConversationalInterview からも利用可能であることを確認する
- コンポーネントの依存方向が適切であることを確認する（共有 → 固有 の方向のみ）

### Task 2: IPC 経路整合性確認

- 選択した IPC 経路（session / runtime）が正本仕様に準拠していることを確認する
- IPC 抽象化レイヤーが session IPC と runtime IPC の差異を正しく吸収していることを確認する
- `ipc-contract-checklist.md` の必須項目（Main Process / Preload API / 型定義の同時更新）を確認する
- `security-skill-ipc-core.md` のセキュリティパターンに準拠していることを確認する

### Task 3: ナビゲーション契約準拠確認

- App.tsx のルーティング変更が `ui-ux-navigation.md` の契約に準拠していることを確認する
- TASK-UI-01（ルート昇格）で追加されるルートと矛盾しないことを確認する
- ナビゲーション導線が一貫していることを確認する

### Task 4: AC 対応確認

各 AC が設計で対応されていることを確認する:

| AC   | 設計での対応 | 検証可能性 | 判定 |
| ---- | ------------ | ---------- | ---- |
| AC-1 | -            | -          | -    |
| AC-2 | -            | -          | -    |
| AC-3 | -            | -          | -    |
| AC-4 | -            | -          | -    |
| AC-5 | -            | -          | -    |

### Task 5: gate 判定

| 判定     | 条件                                           | 対応                             |
| -------- | ---------------------------------------------- | -------------------------------- |
| PASS     | コンポーネント設計と IPC 整合性に問題なし      | Phase 4 へ                       |
| MINOR    | 軽微な設計修正が必要だが実装可能               | 修正内容を記録し Phase 4 へ      |
| MAJOR    | IPC 経路やコンポーネント設計に大きな矛盾がある | Phase 2 へ差し戻し               |
| CRITICAL | 統合/分離の方針自体を見直す必要がある          | Phase 1 へ差し戻しユーザーに確認 |

## 参照資料

| 資料名                  | パス                                                                                   | 説明             |
| ----------------------- | -------------------------------------------------------------------------------------- | ---------------- |
| 設計書                  | `outputs/phase-2/design-document.md`                                                   | レビュー対象     |
| 要件定義                | `outputs/phase-1/spec-extraction-map.md`                                               | 方針決定の根拠   |
| 比較マトリクス          | `outputs/phase-1/component-comparison-matrix.md`                                       | 機能比較の詳細   |
| ConversationPanel       | `apps/desktop/src/renderer/components/skill-creator/SkillCreatorConversationPanel.tsx` | 現行実装         |
| ConversationalInterview | `apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx`               | 現行実装         |
| App.tsx                 | `apps/desktop/src/renderer/App.tsx`                                                    | ルーティング定義 |

### システム仕様（aiworkflow-requirements）

> 設計レビューで必ず以下の仕様との整合性を確認してください。

| 参照資料                  | パス                                                                                        | 内容                         |
| ------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------- |
| UI/UX ナビゲーション契約  | `.agents/skills/aiworkflow-requirements/references/ui-ux-navigation.md`                     | ルート設計の正本仕様         |
| IPC契約チェックリスト     | `.agents/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`               | IPC 変更の整合性検証         |
| スキル実行IPCセキュリティ | `.agents/skills/aiworkflow-requirements/references/security-skill-ipc-core.md`              | セキュリティパターン準拠確認 |
| Skill Creator Service仕様 | `.agents/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-reference.md` | IPC パターンとの整合性       |

## 統合テスト連携

- Phase 4 のテスト観点が AC-1〜AC-5 を 1:1 に覆うことを確認する
- 共有コンポーネントの Props 型がテストケースに対応することを確認する

## 成果物

| 成果物                 | パス                                    | 説明                                             |
| ---------------------- | --------------------------------------- | ------------------------------------------------ |
| 設計レビューゲート結果 | `outputs/phase-3/design-review-gate.md` | gate 判定、再利用性検証、IPC 整合性、AC 対応確認 |

## 完了条件

- [ ] コンポーネント再利用性が確認されている
- [ ] IPC 経路の整合性が確認されている（正本仕様準拠）
- [ ] ナビゲーション契約に準拠していることが確認されている
- [ ] AC-1〜AC-5 が設計で対応されていることが確認されている
- [ ] gate 判定（PASS/MINOR/MAJOR/CRITICAL）が明示されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 4: テスト作成](./phase-4-test-creation.md)
