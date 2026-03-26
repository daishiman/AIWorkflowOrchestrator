# [#1573] "[UT-CHATPANEL-STUB-CLEANUP-001] [UT"

## メタ情報

```yaml
task_id: UT-CHATPANEL-STUB-CLEANUP-001
task_name: [UT
category: -
target_feature: -
priority: 低
scale: -
status: 未実施
source_phase: chat-inline-model-selector Phase 3 懸念3（2026-03-21）
created_date: 2026-03-24
dependencies: []
spec_path: docs/30-workflows/unassigned-task/task-ut-chatpanel-stub-cleanup-001.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | -      |
| ステータス | 未実施 |

---

## 背景・目的

`apps/desktop/src/renderer/components/chat/LLMSelectorPanel.tsx`（24行）は ChatPanel 用のスタブ版コンポーネントであり、`onSelect` コールバックが空実装（no-op）で実際のモデル選択機能を持たない。

InlineModelSelector の導入後、本コンポーネントは以下の理由で役割が完全に重複する。

- InlineModelSelector がグローバル Store を通じてモデル選択を管理する
- スタブ版 LLMSelectorPanel の `onSelect` が空のため、ユーザーが操作しても何も起きない
- 2つのモデル選択 UI が並存することでユーザーの混乱を招く

本タスクは、スタブ版 LLMSelectorPanel を削除し、ChatPanel 内のモデル選択を InlineModelSelector に置き換えることを目的とする。

## 実装方針

1. 削除前の影響調査
   - `grep -rn "LLMSelectorPanel" apps/desktop/src/` で全参照箇所を特定する
   - ChatPanel での利用箇所を特定し、InlineModelSelector への置き換え範囲を確定する

2. InlineModelSelector への置き換え
   - ChatPanel 内の `<LLMSelectorPanel>` を `<InlineModelSelector>` に置き換える
   - 既存の Props マッピングを確認し、不要なプロパティを除去する

3. スタブファイルの削除
   - `apps/desktop/src/renderer/components/chat/LLMSelectorPanel.tsx` を削除する
   - 関連するテストファイルが存在する場合は合わせて削除する
   - `index.ts` 等のバレルファイルからエクスポートを削除する

4. 動作確認
   - ChatPanel でのモデル選択が InlineModelSelector 経由で正常に機能することを確認する
   - `pnpm typecheck` でコンパイルエラーがないことを確認する

## 受け入れ基準

- [ ] `apps/desktop/src/renderer/components/chat/LLMSelectorPanel.tsx` が削除されている
- [ ] ChatPanel 内のモデル選択が InlineModelSelector に置き換えられている
- [ ] `grep -rn "LLMSelectorPanel" apps/desktop/src/` の結果が 0 件である
- [ ] `pnpm typecheck` がエラーなしで通過する
- [ ] `pnpm lint` がエラーなしで通過する
- [ ] ChatPanel でのモデル選択操作が正常に動作する

## 苦戦箇所・知見（該当がある場合）

- TASK-IMP-CHATPANEL-REVIEW-HARNESS-ALIGNMENT との作業順序に注意し、ChatPanel のハーネス整備が完了してから本タスクを実施すること
- バレルファイル（`index.ts`）からの削除漏れによる幽霊依存（P8）が発生しないよう、削除後に `grep -rn` で参照が残っていないことを必ず確認すること

## 参照資料

- `docs/30-workflows/chat-inline-model-selector/phase-3-design-review.md`
- `apps/desktop/src/renderer/components/chat/LLMSelectorPanel.tsx`
- `.claude/rules/06-known-pitfalls.md#P8`
- `.claude/rules/07-git-and-tooling.md#コミット前チェックリスト`
