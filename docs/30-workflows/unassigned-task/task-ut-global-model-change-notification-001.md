# [UT-GLOBAL-MODEL-CHANGE-NOTIFICATION-001] グローバルモデル変更時の他画面通知UI

## メタ情報

```yaml
issue_number: 1574
```

## メタ情報

| 項目       | 値                                                                                            |
| ---------- | --------------------------------------------------------------------------------------------- |
| タスクID   | UT-GLOBAL-MODEL-CHANGE-NOTIFICATION-001                                                       |
| 優先度     | 中                                                                                            |
| 発見元     | chat-inline-model-selector Phase 2/3 + 30種思考法（因果関係分析・システム思考）（2026-03-21） |
| 関連タスク | TASK-UI-INLINE-MODEL-SELECTOR-COMPONENT                                                       |

## 背景・目的

InlineModelSelector でモデルを変更すると、グローバル Zustand Store 経由で全画面に即座に反映される。

ユーザーが ChatView でモデルを変更した場合、WorkspaceChatPanel や他のチャット画面にも同じ変更が波及するが、変更通知 UI が存在しないため以下のリスクがある。

- ユーザーが意図せず全画面のモデルを変更してしまう（誤操作リスク）
- 他画面を利用中のユーザーが、自分の知らない間にモデルが切り替わっていることに気付かない
- 「なぜ急に応答の傾向が変わったのか」と混乱するユーザー体験の発生

本タスクは、モデル変更時に変更元以外の画面でトースト通知を表示する機能を実装することを目的とする。

## 実装方針

1. トースト通知コンポーネントの実装
   - 既存のトーストシステム（または新規作成）を使用して「モデルが [モデル名] に変更されました」を表示する
   - 表示時間は 3 秒程度の一時表示とし、ユーザーが手動で閉じることもできる設計とする
   - Apple HIG に準拠したスタイリング（`systemBlue` アクセントカラー）を採用する

2. 通知対象画面の判定ロジック
   - モデル変更を行った画面（変更元）では通知を表示しない
   - 変更元の判定にはコンポーネントインスタンスID またはルートパスを使用する
   - ChatView と WorkspaceChatPanel の両方でサブスクライブする

3. Store 連携
   - モデル変更アクションに `sourceViewId` を付与し、通知コンポーネントが変更元を識別できるようにする
   - `useEffect` + 個別セレクタ（P31 対策）でモデル変更を検知する

## 受け入れ基準

- [ ] モデル変更時に変更元以外の全チャット画面でトースト通知が表示される
- [ ] 変更元の画面では通知が表示されない
- [ ] 通知には変更後のモデル名（プロバイダー名 + モデル名）が含まれる
- [ ] 通知は 3 秒後に自動消去される
- [ ] 通知を手動で閉じることができる
- [ ] 通知表示中に再度モデルを変更した場合、新しい通知が上書き表示される
- [ ] テストカバレッジが Line 80%、Branch 60% を超える

## 苦戦箇所・知見（該当がある場合）

- P31（Zustand Store Hooks 無限ループ）に注意し、モデル変更の検知には合成 Hook ではなく個別セレクタを使用すること
- P5（リスナー二重登録）に注意し、通知サブスクライブは `useEffect` の cleanup 関数で必ず解除すること

## 参照資料

- `docs/30-workflows/chat-inline-model-selector/phase-2-design.md`
- `docs/30-workflows/chat-inline-model-selector/phase-3-design-review.md`
- `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`
- `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`
- `.claude/rules/06-known-pitfalls.md#P31`
- `.claude/rules/06-known-pitfalls.md#P5`
