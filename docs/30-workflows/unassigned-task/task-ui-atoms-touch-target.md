# UT-UI-ATOMS-TOUCH-TARGET-001: SuggestionBubble sm サイズ タッチターゲット改善

## メタ情報

| 項目         | 値                                                             |
| ------------ | -------------------------------------------------------------- |
| タスクID     | UT-UI-ATOMS-TOUCH-TARGET-001                                   |
| タスク名     | SuggestionBubble size="sm" タッチターゲット Apple HIG 44px準拠 |
| 優先度       | 低                                                             |
| 複雑度       | trivial                                                        |
| 発見元       | TASK-UI-00-ATOMS Phase 10 MINOR指摘 M-2                        |
| 依存タスク   | なし                                                           |
| ブロック対象 | なし                                                           |

## 目的

SuggestionBubble の `size="sm"` が36px（`h-9`）で、Apple HIG推奨の最小タッチターゲット44pxを下回っている問題を改善する。デフォルトサイズ（md: 44px）は基準を満たしており、smは密度優先UIオプションとして許容されているが、タッチデバイスでの操作性向上のために `min-h-[44px]` のタッチターゲット領域を確保する対応を検討する。

## Why（なぜ必要か）

- Apple HIG は全インタラクティブ要素に44pt以上のタッチターゲットを推奨している
- `size="sm"` はモバイルUIやサイドバー等の狭い領域で使用される可能性が高く、タッチ操作しにくいリスクがある
- Phase 3設計レビュー（R-3）でも同じ指摘があり、`min-h-[44px]` での対応方針が提示されていた

## 実行タスク

### Task 1: タッチターゲット領域の調査

`size="sm"` の使用箇所を特定し、密度優先UIとしての使用パターンを分析する。

### Task 2: 実装方針の決定

以下のいずれかの方針を選択する:

1. **視覚的サイズは36px維持、タッチ領域のみ44px確保**: `min-h-[44px]` を適用し、タッチ領域を拡大する（`::before` 疑似要素によるヒットエリア拡張）
2. **sm サイズ自体を44pxに変更**: `h-9` → `h-11` に変更。ただし視覚的密度が低下する
3. **現状維持（ドキュメント対応のみ）**: smは密度優先オプションとしてドキュメントに明記し、44px未満であることを注意書きとして記載する

### Task 3: 実装とテスト更新

選択した方針に基づいて実装を更新し、テストを修正する。

## 成果物

| #   | 成果物                | パス                                                                                    |
| --- | --------------------- | --------------------------------------------------------------------------------------- |
| 1   | SuggestionBubble 修正 | `apps/desktop/src/renderer/components/atoms/SuggestionBubble/index.tsx`                 |
| 2   | テスト更新            | `apps/desktop/src/renderer/components/atoms/SuggestionBubble/SuggestionBubble.test.tsx` |

## 完了条件

- [ ] `size="sm"` のタッチターゲットがApple HIG 44px推奨に合致するか、不合致の理由がドキュメントに明記されている
- [ ] テストが全てPASS
- [ ] `cd apps/desktop && pnpm vitest run src/renderer/components/atoms/SuggestionBubble/` がPASS

## 参照資料

- `apps/desktop/src/renderer/components/atoms/SuggestionBubble/index.tsx` -- 実装
- `apps/desktop/src/renderer/components/atoms/SuggestionBubble/SuggestionBubble.test.tsx` -- テスト
- `docs/30-workflows/task-ui-00-atoms/outputs/phase-10/final-review-result.md` -- Phase 10 MINOR M-2
- `docs/30-workflows/task-ui-00-atoms/outputs/phase-3/review-summary.md` -- Phase 3 MINOR R-3
- [Apple HIG -- Pointing and clicking](https://developer.apple.com/design/human-interface-guidelines/pointing-and-clicking) -- 44ptタッチターゲット推奨

## 親タスク教訓

| 教訓                 | 内容                                                                                                                                                                             |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase 3指摘の追跡    | Phase 3 R-3で同じ指摘があり「`min-h-[44px]`で対応」方針が出されていたが、Phase 5実装時に`h-9`（36px）のまま実装された。Phase 3指摘事項は実装時のチェックリストに含めるべきだった |
| 密度優先UIの判断基準 | 「密度優先UIオプションとして許容」の判断は妥当だが、44px未満のタッチターゲットは意識的な例外としてドキュメントに明記すべき                                                       |
