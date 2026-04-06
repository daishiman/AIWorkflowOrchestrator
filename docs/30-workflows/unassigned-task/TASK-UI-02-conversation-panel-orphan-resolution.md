# TASK-UI-02: ConversationPanel 孤立解消 - タスク指示書

## メタ情報

```yaml
issue_number: 1939
task_id: TASK-UI-02
task_name: conversation-panel-orphan-resolution
category: UI コンポーネント統合
target_feature: SkillCreatorConversationPanel / ConversationalInterview 統合
priority: P0
scale: 中規模
status: 未実施
source: UI/UX ナビゲーション監査
created_date: 2026-04-06
step: 12（TASK-UI-01 完了後、TASK-UI-03 と並列実行可）
dependencies:
  - TASK-UI-01（ルート昇格完了後に着手）
blocking: []
```

| 項目         | 値                                                                                                                    |
| ------------ | --------------------------------------------------------------------------------------------------------------------- |
| タスクID     | TASK-UI-02                                                                                                            |
| タスク名     | ConversationPanel 孤立解消                                                                                            |
| 分類         | UI コンポーネント統合                                                                                                 |
| 対象機能     | SkillCreatorConversationPanel / ConversationalInterview 統合                                                          |
| 優先度       | P0（最高）                                                                                                            |
| 見積もり規模 | 中規模                                                                                                                |
| ステータス   | 未実施                                                                                                                |
| 発見元       | UI/UX ナビゲーション監査                                                                                              |
| 発見日       | 2026-04-06                                                                                                            |
| Step         | 12（TASK-UI-01 完了後、TASK-UI-03 と並列実行可）                                                                      |
| 依存タスク   | TASK-UI-01（ルート昇格完了後に着手）                                                                                  |
| 後続タスク   | なし                                                                                                                  |
| 並行可能     | TASK-UI-03                                                                                                            |
| 仕様書       | `docs/30-workflows/skill-creator-agent-sdk-lane/step-12-par-task-ui-02-conversation-panel-orphan-resolution/index.md` |

---

## 1. Why

### 1.1 背景

現在、会話型スキル作成 UI に以下の二重構造が存在する:

1. **SkillCreatorConversationPanel.tsx** — フル機能のチャットベーススキル作成 UI だが、`App.tsx` にルートが存在せず完全に到達不能。Phase-11 デモ HTML からのみ参照されている。`window.skillCreatorSessionAPI`（session IPC）を使用。
2. **ConversationalInterview.tsx** — `SkillLifecyclePanel` に埋め込まれた既存インタビュー UI。runtime IPC パスを使用。

### 1.2 問題点・課題

- `SkillCreatorConversationPanel` に到達する正規ルートが存在しない（孤立状態）
- session IPC と runtime IPC が並立し、どちらを使うべきか不明確
- `QuestionCard` 等の共有可能コンポーネントが再利用されていない
- Phase-11 デモ HTML という孤立した参照が残存している

### 1.3 放置した場合の影響

- デッドコードが蓄積し、将来の機能追加時に混乱を生む
- セキュリティ審査時に未到達パスの存在が問題になる可能性

---

## 2. What

### 2.1 達成目標

1. SkillCreatorConversationPanel が正式なルートを持つ、または ConversationalInterview と統合される
2. session IPC と runtime IPC の使い分けが明確化される
3. QuestionCard 等の共有可能コンポーネントが整理される
4. 孤立した参照（デモ HTML）がクリーンアップされる
5. 既存テストが全て pass する

### 2.2 スコープ

**含む:**

- ConversationPanel のルート追加または統合
- IPC 経路の明確化
- QuestionCard 等の共有コンポーネント整理
- デモ HTML クリーンアップ
- テスト維持

**含まない:**

- 新規 IPC チャネルの設計（既存パスの整理のみ）
- SkillLifecyclePanel の全面再設計
- Electron メインプロセスの大規模改修

---

## 3. 苦戦箇所（予想される）

- **IPC 経路判断**: session IPC (`window.skillCreatorSessionAPI`) と runtime IPC の責務の違いを正確に理解してから設計する必要がある。誤った判断で統合すると後退が大きい
- **デッドコードの影響範囲特定**: `SkillCreatorConversationPanel` のコードは実装済みだが実際の動作テストができていないため、統合時に hidden bugs が発覚する可能性がある
- **shared コンポーネントの整理**: `QuestionCard` 等を shared に移動する際、他コンポーネントへの影響を事前に把握する必要がある

**P0-07 からの学び（適用可能なもの）:**

- UI 変更を伴うタスクでは manual test の visual evidence が必須
- manifest（この場合はルート定義）が壊れている場合は fallback ではなく明確なエラーにする

---

## 4. Phase 構成

詳細仕様: `docs/30-workflows/skill-creator-agent-sdk-lane/step-12-par-task-ui-02-conversation-panel-orphan-resolution/index.md`

| Phase | 概要                                               |
| ----- | -------------------------------------------------- |
| 1     | 要件確認・孤立コンポーネント調査                   |
| 2     | 統合 or ルート追加の設計選択                       |
| 3     | 設計レビュー                                       |
| 4     | テスト作成                                         |
| 5     | 実装（ルート追加 or 統合、共有コンポーネント整理） |
| 6     | テスト拡張                                         |
| 7     | カバレッジ確認                                     |
| 8     | リファクタリング                                   |
| 9     | 品質確認                                           |
| 10    | 最終レビュー                                       |
| 11    | 手動テスト                                         |
| 12    | ドキュメント                                       |
| 13    | PR 作成                                            |
