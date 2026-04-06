# TASK-UI-03: IPC 二重経路統合 - タスク指示書

## メタ情報

```yaml
issue_number: 1940
task_id: TASK-UI-03
task_name: ipc-session-runtime-unification
category: IPC アーキテクチャ統合
target_feature: Skill Creator IPC 通信層（Session IPC / Runtime IPC）
priority: P0
scale: 中規模
status: 未実施
source: skill-creator-agent-sdk-lane UI 統合監査
created_date: 2026-04-06
step: 12（TASK-UI-01 完了後、TASK-UI-02 と並列実行可）
dependencies:
  - TASK-UI-01（ルート昇格が先行完了すること）
blocking: []
parallel_with:
  - TASK-UI-02
```

| 項目         | 値                                                                                                               |
| ------------ | ---------------------------------------------------------------------------------------------------------------- |
| タスクID     | TASK-UI-03                                                                                                       |
| タスク名     | IPC 二重経路統合（Session IPC / Runtime IPC）                                                                    |
| 分類         | IPC アーキテクチャ統合                                                                                           |
| 対象機能     | skill-creator IPC 通信層                                                                                         |
| 優先度       | P0（最高）                                                                                                       |
| 見積もり規模 | 中規模                                                                                                           |
| ステータス   | 未実施                                                                                                           |
| 発見元       | skill-creator-agent-sdk-lane UI 統合監査                                                                         |
| 発見日       | 2026-04-06                                                                                                       |
| Step         | 12（TASK-UI-01 完了後、TASK-UI-02 と並列実行可）                                                                 |
| 依存タスク   | TASK-UI-01（ルート昇格が先行完了すること）                                                                       |
| 後続タスク   | なし                                                                                                             |
| 並行可能     | TASK-UI-02                                                                                                       |
| 仕様書       | `docs/30-workflows/skill-creator-agent-sdk-lane/step-12-par-task-ui-03-ipc-session-runtime-unification/index.md` |

---

## 1. Why

### 1.1 背景

現在の Skill Creator には 2 つの独立した IPC 通信パスが存在する:

1. **Session IPC** (`window.skillCreatorSessionAPI`): `startSession`, `sendAnswer`, `onQuestion` 等。質問/回答型の会話フロー
2. **Runtime IPC** (`window.electronAPI.skillCreator`): `planSkill`, `executePlan`, `getWorkflowState` 等。ワークフロー状態スナップショット型

### 1.2 問題点・課題

- エラーハンドリングが経路ごとに異なる
- 状態モデルが分断されている（質問/回答 vs ワークフロー状態）
- `preload` 層が両 API surface を公開するが相互運用しない
- 新機能開発時にどちらの IPC 経路を使うべきか判断基準がない
- セキュリティ要件（パストラバーサル防止等）が両経路で均一に適用されているか不明

### 1.3 放置した場合の影響

- 新機能開発ごとに IPC 経路の混乱が繰り返される
- セキュリティホールが片方の経路にのみ存在するリスク

---

## 2. What

### 2.1 達成目標

1. IPC 経路に統一された設計方針を持つ（統合 or 明確な分離契約）
2. 新機能開発者が適切な IPC 経路を迷わず選択できるガイドライン
3. `preload` 層の API surface が整理され一貫性を持つ
4. `creatorHandlers.ts` のハンドラー構成が整合的である
5. セキュリティ要件が両経路で均一に適用される

### 2.2 スコープ

**含む:**

- IPC 経路の設計方針策定
- preload API surface の整理
- `creatorHandlers.ts` の構成統合
- channel 命名規則の統一
- セキュリティ要件の均一化
- IPC 契約チェックリスト準拠

**含まない:**

- UI コンポーネントの全面リライト
- WorkflowEngine の状態遷移変更（TASK-P0-02 の範囲）
- 新規 IPC チャネルの追加（統合/整理のみ）

---

## 3. 苦戦箇所（予想される）

- **IPC 設計方針の決定**: session IPC を廃止して runtime IPC に統合するか、明確な分離契約を設けるかの判断は設計の核心。誤った方向に進むと大量の修正が必要になる
- **preload 変更のセキュリティ影響**: preload 層の変更は contextBridge 契約に関わるため、セキュリティ面での慎重な確認が必要
- **`creatorHandlers.ts` の複雑さ**: 両 IPC ハンドラーが混在しており、責務の分離が複雑。既存動作を壊さずに整理する必要がある

**P0-07 からの学び（適用可能なもの）:**

- 同一の責務が複数経路に分散している場合（P0-07 では manifest 動的解決 vs 静的 fallback）、境界を明確にしてから実装する
- `VALIDATION_ERROR` パターン: broken な設定は silent fallback ではなく明確なエラーで止める

---

## 4. Phase 構成

詳細仕様: `docs/30-workflows/skill-creator-agent-sdk-lane/step-12-par-task-ui-03-ipc-session-runtime-unification/index.md`

| Phase | 概要                                                     |
| ----- | -------------------------------------------------------- |
| 1     | 要件確認・両 IPC 経路の現状把握                          |
| 2     | 統合設計（統合 or 分離契約）                             |
| 3     | 設計レビュー                                             |
| 4     | テスト作成                                               |
| 5     | 実装（preload 整理、creatorHandlers 統合、命名規則統一） |
| 6     | テスト拡張                                               |
| 7     | カバレッジ確認                                           |
| 8     | リファクタリング                                         |
| 9     | 品質確認                                                 |
| 10    | 最終レビュー                                             |
| 11    | 手動テスト                                               |
| 12    | ドキュメント                                             |
| 13    | PR 作成                                                  |
