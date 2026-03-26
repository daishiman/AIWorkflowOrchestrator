# [#1628] "[UT-PER-CHAT-MODEL-SELECTION-DESIGN-001] [UT"

## メタ情報

```yaml
task_id: UT-PER-CHAT-MODEL-SELECTION-DESIGN-001
task_name: [UT
category: -
target_feature: -
priority: 低
scale: -
status: 未実施
source_phase: chat-inline-model-selector Phase 1 スコープ外定義 + 30種思考法（戦略的思考）（2026-03-21）
created_date: 2026-03-25
dependencies: []
spec_path: docs/30-workflows/unassigned-task/task-ut-per-chat-model-selection-design-001.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | -      |
| ステータス | 未実施 |

---

## 背景・目的

現在の InlineModelSelector はグローバルな Zustand Store 経由でモデル設定を管理し、全画面で同一のモデルが共有される設計となっている。

ChatGPT や Cursor のように各チャットごとに異なるモデルを記憶する per-chat 選択を実現するには、以下の変更が必要になる。

- `onSelectionChange` コールバックにチャットID を連携させる API 変更
- チャットID × モデルID のマッピングを保持するデータモデルの追加
- グローバル Store への保存ではなく、チャットエントリに紐づいた保存先への変更
- 既存のグローバルモデル設定との共存・フォールバック戦略の整理

本タスクは実装ではなく、将来的な拡張パスの設計文書を作成することを目的とする。

## 実装方針

1. データモデル設計
   - `ChatModelSelection` 型を定義する（`chatId: string`, `providerId: string`, `modelId: string`）
   - SQLite の `chats` テーブルにモデル選択列を追加するマイグレーション計画を記述する
   - グローバルモデルをフォールバックとして使用する優先順位ルールを定義する

2. InlineModelSelector API 変更計画
   - `chatId?: string` プロパティを追加することで per-chat モードとグローバルモードを切り替えられる設計を記述する
   - `onSelectionChange(providerId, modelId, chatId?)` シグネチャへの変更点を文書化する
   - 後方互換性を維持するためのデフォルト値戦略を記述する

3. Store 変更計画
   - per-chat モデル選択を管理する新規 Slice の設計を記述する
   - グローバルモデル選択 Slice との責務分離を明確化する

## 受け入れ基準

- [ ] per-chat 対応時のデータモデル（チャットID × モデルID mapping）が文書化されている
- [ ] InlineModelSelector API の変更計画（プロパティ追加・シグネチャ変更）が文書化されている
- [ ] グローバルモデルをフォールバックとする優先順位ルールが定義されている
- [ ] 既存実装（グローバル選択）との後方互換性維持方針が記述されている
- [ ] データベースマイグレーション計画が記述されている

## 苦戦箇所・知見（該当がある場合）

- Phase 1 スコープ外として明示的に除外された機能のため、既存コンポーネントの API 変更を最小化しつつ拡張できる設計が重要
- P57（設計タスクにおける Phase 12 システム仕様書更新の先送りパターン）に注意し、設計文書は Phase 12 完了時点で `.claude/skills/` に反映すること

## 参照資料

- `docs/30-workflows/chat-inline-model-selector/phase-1-requirements.md`
- `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`
- `.claude/skills/aiworkflow-requirements/references/architecture-database.md`
- `.claude/rules/06-known-pitfalls.md#P57`
