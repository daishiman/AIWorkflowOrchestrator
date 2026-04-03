# Phase 3 Design Review

## Verdict

PASS

## Review Points

| 観点            | 結果 | コメント                                                |
| --------------- | ---- | ------------------------------------------------------- |
| Boundary        | PASS | backend / shared を変更せず、renderer local で完結する  |
| Maintainability | PASS | 派生状態を `useMemo`、開閉状態を local state で分離する |
| Accessibility   | PASS | button ベースの accordion で操作可能にする              |
| Dependency      | PASS | 新しい SVG ライブラリは不要                             |
| Reverify        | PASS | `loadVerifyDetail` 再実行で更新できる                   |

## Rejected Alternative

- `VerifyLayerGroup.tsx` を別ファイルに切り出す案は、現時点では不要と判断した。
- 理由は、状態と描画の関係が `SkillLifecyclePanel.tsx` に近く、分離による利益よりも import churn が大きいため。

## Decision Notes

- Layer1 / Layer2 の既存表示を維持する。
- `expandedLayers` は workflow 切り替え時のみ初期化し、reverify 時は保持する。
- 空の Layer は表示しない。
