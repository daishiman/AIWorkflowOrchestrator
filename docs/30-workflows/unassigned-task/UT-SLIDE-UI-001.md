# UT-SLIDE-UI-001: SlideWorkspace UI 4領域実装

## メタ情報

```yaml
issue_number: 1509
```

## メタ情報

| 項目     | 内容                                      |
| -------- | ----------------------------------------- |
| タスクID | UT-SLIDE-UI-001                           |
| 優先度   | HIGH                                      |
| 依存     | UT-SLIDE-IMPL-001 完了                    |
| 検出元   | Task08 Phase 12 unassigned-task-detection |
| 作成日   | 2026-03-23                                |

## 概要

SlideWorkspace の UI 4領域（progress row / guidance block / fallback card / terminal launcher）を contract-matrix.md の表示マトリクスに基づいて実装する。UX-07 TC-ID 5件の screenshot 撮影まで含む。

## 主要ファイル

- apps/desktop/src/renderer/slide/SlideWorkspace.tsx
- apps/desktop/src/renderer/slide/slideStore.ts
- packages/shared/src/slide/types.ts（SlideUIStatus 型参照）

## 要件

- UI 4領域の表示マトリクス実装（synced/running/degraded/guidance × 4領域 = 16セル）
- P31 対策: 個別セレクタ（useSlideUIStatus, useSlideLane）を使用（合成 Hook 禁止）
- P48 対策: 派生セレクタに useShallow を適用
- Apple HIG 準拠のスタイリング（8px グリッド、角丸 8-12px、システムフォント）
- screenshot-plan.json の5件（UX-07-S01〜S05）を Phase 11 で撮影

## 受入基準

- [ ] 4状態（synced/running/degraded/guidance）で正しい UI 領域が表示される
- [ ] progress row が全状態で表示される
- [ ] guidance block が degraded/guidance 時のみ表示される
- [ ] fallback card が degraded 時のみ表示される
- [ ] terminal launcher が guidance 時のみ表示される
- [ ] P31/P48 対策が適用され無限ループが発生しない
- [ ] UX-07 TC-ID 5件の screenshot が outputs/phase-11/ に保存されている

## 苦戦箇所（設計タスクで発見）

1. **三層ステータス管理の drift**: artifacts.json（root）/ outputs/artifacts.json / phase-\*.md の3箇所でステータスを管理しており不整合が発生した。UI コンポーネントの状態管理でも同様の issue が起きやすい。Zustand store を単一正本とし、UI は store からのみ読むこと
2. **不正遷移4パターンの UI ガード**: synced→degraded、synced→guidance、guidance→degraded、degraded→running の4遷移が禁止されている。UI 側でもこれらの遷移をトリガーするユーザー操作を防ぐこと

## Gate 条件

- UT-SLIDE-IMPL-001（cleanup 順序3: ModifierResponse 実装）が完了していること

## 参照

| 参照資料         | パス                                                                                                                    |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------- |
| 契約マトリクス   | docs/30-workflows/step-05-par-task-08-slide-modifier-manual-fallback-alignment/outputs/phase-2/contract-matrix.md       |
| 実装ガイド       | docs/30-workflows/step-05-par-task-08-slide-modifier-manual-fallback-alignment/outputs/phase-12/implementation-guide.md |
| screenshot 計画  | docs/30-workflows/step-05-par-task-08-slide-modifier-manual-fallback-alignment/outputs/phase-11/screenshot-plan.json    |
| P31/P48 対策     | .claude/rules/06-known-pitfalls.md#P31                                                                                  |
| Apple HIG カラー | .claude/rules/01-architecture.md（UI/UX セクション）                                                                    |
