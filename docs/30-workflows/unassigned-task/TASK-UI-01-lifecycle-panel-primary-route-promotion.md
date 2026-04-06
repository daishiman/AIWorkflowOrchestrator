# TASK-UI-01: LifecyclePanel 一次導線昇格 - タスク指示書

## メタ情報

```yaml
issue_number: 1938
task_id: TASK-UI-01
task_name: lifecycle-panel-primary-route-promotion
category: UI ルーティング改善
target_feature: Skill Creator Agent SDK Lane - LifecyclePanel 導線
priority: P0
scale: 中規模
status: 未実施
source: skill-creator-agent-sdk-lane UI 統合監査
created_date: 2026-04-06
step: 11（直列実行）
dependencies: []
blocking:
  - TASK-UI-02
  - TASK-UI-03
```

| 項目         | 値                                                                                                                       |
| ------------ | ------------------------------------------------------------------------------------------------------------------------ |
| タスクID     | TASK-UI-01                                                                                                               |
| タスク名     | LifecyclePanel 一次導線昇格                                                                                              |
| 分類         | UI ルーティング改善                                                                                                      |
| 対象機能     | SkillLifecyclePanel を一次導線に昇格                                                                                     |
| 優先度       | P0                                                                                                                       |
| 見積もり規模 | 中規模                                                                                                                   |
| ステータス   | 未実施                                                                                                                   |
| 発見元       | skill-creator-agent-sdk-lane UI 統合監査                                                                                 |
| 発見日       | 2026-04-06                                                                                                               |
| Step         | 11（直列実行）                                                                                                           |
| 依存タスク   | なし                                                                                                                     |
| 後続タスク   | TASK-UI-02, TASK-UI-03                                                                                                   |
| 仕様書       | `docs/30-workflows/skill-creator-agent-sdk-lane/step-11-seq-task-ui-01-lifecycle-panel-primary-route-promotion/index.md` |

---

## 1. Why

### 1.1 背景

現状、スキル作成には 2 つの導線が存在する:

1. **一次導線（プライマリ）**: `SkillCreateWizard`（4ステップフォーム）— メインナビゲーションの「スキル作成」からアクセス
2. **二次導線（セカンダリ）**: `SkillLifecyclePanel`（会話型インタビュー + フルライフサイクル）— `SkillManagementPanel` 経由でのみアクセス可能

会話型スキル作成フロー（LifecyclePanel）は plan → review → execute → verify → improve の完全なライフサイクルを提供し、`SkillCreateWizard` よりも高品質なスキル作成体験を実現する。しかし、現在はメインナビゲーションからの直接アクセスができない。

### 1.2 問題点・課題

- `SkillLifecyclePanel` がメインナビゲーションから直接アクセスできない（`SkillManagementPanel` 経由が必須）
- 高品質な会話型スキル作成フローが発見しにくい状態にある
- `normalizeSkillLifecycleView()` が新しいルーティングに対応していない

### 1.3 放置した場合の影響

- 高品質な LifecyclePanel フローの活用率が低いまま推移する
- TASK-UI-02, TASK-UI-03 がブロックされ続ける

---

## 2. What

### 2.1 達成目標

1. SkillLifecyclePanel がメインナビゲーションの「スキル作成」から直接アクセスできる
2. 既存の SkillCreateWizard への導線は維持される（後方互換）
3. `normalizeSkillLifecycleView()` が新しいルーティングを正しくハンドルする
4. `skillLifecycleJourney.ts` のナビゲーション定義が更新される
5. モバイル/デスクトップ両方のナビゲーションで動作する

### 2.2 スコープ

**含む:**

- `App.tsx` のルート定義変更（LifecyclePanel への直接ルート追加）
- `normalizeSkillLifecycleView()` の更新
- `skillLifecycleJourney.ts` のナビゲーション定義更新
- `SkillManagementPanel.tsx` からの既存導線維持
- メインナビゲーションのエントリポイント追加/変更
- 既存テストの修正（ルーティング変更に伴うもの）

**含まない:**

- SkillCreateWizard の廃止や機能変更
- SkillLifecyclePanel の内部ロジック変更
- バックエンド/IPC の変更

---

## 3. 苦戦箇所（予想される）

- **ルーティング後方互換**: `App.tsx` ルート定義の変更により既存テストが壊れやすい。ルート変更前に既存テストの全把握が必要
- **normalizeSkillLifecycleView() の影響範囲**: この関数は多くのビュー遷移から呼ばれており、変更の影響範囲が広い可能性がある
- **ナビゲーション二重管理**: `skillLifecycleJourney.ts` と `App.tsx` の両方を一貫して更新する必要があり、片側の更新漏れが発生しやすい

**P0-07 からの学び（適用可能なもの）:**

- UI 変更がある場合は manual test の visual evidence が必須（Phase 11 の記録方針）
- 変更が複数ファイルにまたがる場合、片側だけの説明にしない

---

## 4. Phase 構成

詳細仕様: `docs/30-workflows/skill-creator-agent-sdk-lane/step-11-seq-task-ui-01-lifecycle-panel-primary-route-promotion/index.md`

| Phase | 概要                                                                |
| ----- | ------------------------------------------------------------------- |
| 1     | 要件確認・コードアンカー特定                                        |
| 2     | ルーティング設計                                                    |
| 3     | 設計レビュー                                                        |
| 4     | テスト作成                                                          |
| 5     | 実装（App.tsx, normalizeSkillLifecycleView, skillLifecycleJourney） |
| 6     | テスト拡張                                                          |
| 7     | カバレッジ確認                                                      |
| 8     | リファクタリング                                                    |
| 9     | 品質確認                                                            |
| 10    | 最終レビュー                                                        |
| 11    | 手動テスト                                                          |
| 12    | ドキュメント                                                        |
| 13    | PR 作成                                                             |
