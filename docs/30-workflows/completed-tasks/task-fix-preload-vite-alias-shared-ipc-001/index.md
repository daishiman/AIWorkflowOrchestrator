# タスク: TASK-FIX-PRELOAD-VITE-ALIAS-SHARED-IPC-001

## メタ情報

| 項目       | 値                                                   |
| ---------- | ---------------------------------------------------- |
| タスクID   | TASK-FIX-PRELOAD-VITE-ALIAS-SHARED-IPC-001           |
| 優先度     | high                                                 |
| 分類       | バグ修正 / テスト基盤整合                            |
| 由来       | 調査で発見（2026-03-31）                             |
| ステータス | completed（Phase 1-12 completed / Phase 13 blocked） |
| 作成日     | 2026-03-31                                           |

## 概要

`@repo/shared/src/ipc/channels` の解決が build と test で分断されていた。
preload build では `externalizeDepsPlugin()` が shared subpath を外部化し、Vitest では `vitest.config.ts` に shared IPC alias がないため import 解決が失敗していた。

## 真の論点

shared IPC channel の正本を `packages/shared/src/ipc/channels.ts` に寄せた後も、
`electron.vite.config.ts` と `vitest.config.ts` の解決規則が同一waveで閉じていなかった。
そのため preload bundle と parity test の両方に別形態のドリフトが残っていた。

## 影響範囲

- `apps/desktop/electron.vite.config.ts`
- `apps/desktop/vitest.config.ts`
- `apps/desktop/src/preload/channels.ts`
- `apps/desktop/src/preload/__tests__/skill-api.getDetail-update.test.ts`
- `apps/desktop/src/main/services/runtime/__tests__/governance-bundle.test.ts`
- `apps/desktop/out/preload/index.js`

## 制約

- ユーザーが明示的に承認するまで `commit` / `push` / PR 作成は実行しない
- shared IPC の正本は `packages/shared/src/ipc/channels.ts` とする

## Phase 一覧

| Phase | 名称             | 説明                                                                                |
| ----- | ---------------- | ----------------------------------------------------------------------------------- |
| 1     | 要件定義         | build/test alias drift の根本原因と受け入れ条件を確定                               |
| 2     | 設計             | electron-vite / Vitest 双方の alias parity と副作用分析                             |
| 3     | 設計レビュー     | build/test parity を同一waveで閉じる設計ゲート                                      |
| 4     | テスト作成       | preload bundle 検証と targeted vitest の Red/Green 条件整理                         |
| 5     | 実装             | `electron.vite.config.ts` / `vitest.config.ts` / `governance-bundle.test.ts` を更新 |
| 6     | テスト拡充       | build 出力と targeted vitest による回帰確認                                         |
| 7     | カバレッジ確認   | build bundle / test runtime / import path 正規化の網羅確認                          |
| 8     | リファクタリング | relative import workaround と stale follow-up の除去                                |
| 9     | 品質保証         | typecheck / build / targeted test / 文書整合の確認                                  |
| 10    | 最終レビュー     | 受け入れ条件・副作用・残課題の最終判定                                              |
| 11    | 手動テスト       | NON_VISUAL walkthrough による実測確認                                               |
| 12    | ドキュメント     | close-out、system spec 同期、旧 follow-up 完了移管                                  |
| 13    | PR 作成          | ユーザー承認後のみ実施（現時点 blocked）                                            |
