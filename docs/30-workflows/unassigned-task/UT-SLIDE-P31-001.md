# UT-SLIDE-P31-001: SlideWorkspace P31/P48 無限ループ対策

## メタ情報

```yaml
issue_number: 1510
```

## メタ情報

| 項目     | 内容                                      |
| -------- | ----------------------------------------- |
| タスクID | UT-SLIDE-P31-001                          |
| 優先度   | MEDIUM                                    |
| 依存     | UT-SLIDE-UI-001 完了と同時またはその後    |
| 検出元   | Task08 Phase 12 unassigned-task-detection |
| 作成日   | 2026-03-23                                |

## 概要

slideSettingsStore の合成 Hook を個別セレクタに分解し、派生セレクタには useShallow を適用する。P31（合成Hook無限ループ）と P48（派生セレクタ無限ループ）の両方を構造的に防止する。

## 主要ファイル

- apps/desktop/src/renderer/slide/slideSettingsStore.ts
- apps/desktop/src/renderer/slide/SlideWorkspace.tsx

## 要件

- 合成 Hook（useSlideStore()）→ 個別セレクタ（useSlideUIStatus, useSlideLane 等）に分解
- .filter() / .map() 返却セレクタに `useShallow` を適用
- `@deprecated` タグを合成 Hook に追加
- 個別セレクタごとのユニットテスト追加

## 受入基準

- [ ] useSlideStore() 合成 Hook に `@deprecated` タグが付与されている
- [ ] 個別セレクタ（useSlideUIStatus, useSlideLane, useSlideCapability 等）が定義されている
- [ ] 派生セレクタ（.filter/.map 使用）に useShallow が適用されている
- [ ] SlideWorkspace.tsx が個別セレクタのみを使用している
- [ ] renderHook テストでタイムアウトが発生しない（無限ループ防止の証跡）

## 苦戦箇所（設計タスクで発見）

1. **P31 と P48 の複合発生パターン**: 合成 Hook の関数参照不安定（P31）と派生セレクタの新規参照生成（P48）が同時に発生しうる。個別セレクタ化だけでは P48 は解消しないため、useShallow の適用を忘れないこと
2. **useEffect 依存配列との相互作用**: 個別セレクタで取得したアクション関数を useEffect 依存配列に含める場合、Zustand のアクション参照は安定しているため安全だが、派生値は不安定。混同しないよう型で区別すること

## Gate 条件

- UT-SLIDE-UI-001（cleanup 順序4）が完了していること

## 参照

| 参照資料                         | パス                                                                                                                    |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| P31 詳細                         | .claude/rules/06-known-pitfalls.md#P31                                                                                  |
| P48 詳細                         | .claude/rules/06-known-pitfalls.md#P48                                                                                  |
| 状態管理ルール                   | .claude/rules/03-state-management.md                                                                                    |
| 実装ガイド（P31/P48 セクション） | docs/30-workflows/step-05-par-task-08-slide-modifier-manual-fallback-alignment/outputs/phase-12/implementation-guide.md |
