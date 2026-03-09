# TASK-FIX-SAFEINVOKE-TIMEOUT-001: safeInvoke タイムアウト追加

## 概要

| 項目         | 内容                                           |
| ------------ | ---------------------------------------------- |
| タスクID     | TASK-FIX-SAFEINVOKE-TIMEOUT-001                |
| タイトル     | safeInvoke タイムアウト追加                    |
| タスク種別   | fix                                            |
| 優先度       | Priority 2                                     |
| ステータス   | pending                                        |
| 対象ファイル | `apps/desktop/src/preload/index.ts` (L113-117) |

## 問題

`safeInvoke` にタイムアウトがなく、IPC呼び出しがハングした場合 Promise が永遠に resolve しない。認証初期化のハング、Supabase到達不能時の全画面ブロック等の問題を引き起こす。

## 修正方針

`Promise.race` パターンで IPC_TIMEOUT_MS (5000ms) タイムアウトを追加。関数シグネチャの変更なし、呼び出し元への影響最小化。

## Phase 一覧

| Phase | 名称             | 仕様書                                                         | ステータス |
| ----- | ---------------- | -------------------------------------------------------------- | ---------- |
| 1     | 要件定義         | [phase-1-requirements.md](./phase-1-requirements.md)           | pending    |
| 2     | 設計             | [phase-2-design.md](./phase-2-design.md)                       | pending    |
| 3     | 設計レビュー     | [phase-3-design-review.md](./phase-3-design-review.md)         | pending    |
| 4     | テスト作成       | [phase-4-test-creation.md](./phase-4-test-creation.md)         | pending    |
| 5     | 実装             | [phase-5-implementation.md](./phase-5-implementation.md)       | pending    |
| 6     | テスト拡充       | [phase-6-test-expansion.md](./phase-6-test-expansion.md)       | pending    |
| 7     | カバレッジ確認   | [phase-7-coverage-check.md](./phase-7-coverage-check.md)       | pending    |
| 8     | リファクタリング | [phase-8-refactoring.md](./phase-8-refactoring.md)             | pending    |
| 9     | 品質検証         | [phase-9-quality-assurance.md](./phase-9-quality-assurance.md) | pending    |
| 10    | 最終レビュー     | [phase-10-final-review.md](./phase-10-final-review.md)         | pending    |
| 11    | 手動テスト       | [phase-11-manual-test.md](./phase-11-manual-test.md)           | pending    |
| 12    | ドキュメント     | [phase-12-documentation.md](./phase-12-documentation.md)       | pending    |
| 13    | 完了             | [phase-13-completion.md](./phase-13-completion.md)             | pending    |

## 受け入れ基準

- AC-1: safeInvoke が IPC_TIMEOUT_MS 以内に応答しない場合、タイムアウトエラーで reject
- AC-2: タイムアウトエラーメッセージに channel 名が含まれる
- AC-3: 正常なIPC応答はタイムアウトなしで返る
- AC-4: ALLOWED_INVOKE_CHANNELS 外のチャンネルは従来どおり即座に reject
- AC-5: タイムアウト値が定数（IPC_TIMEOUT_MS）として定義され、変更可能
- AC-6: 全既存テストが PASS

## 関連する既知の落とし穴

- P13: タイマーテストの無限ループ（`advanceTimersByTime` 使用必須）
- P42: 文字列引数の `.trim()` バリデーション漏れ
- P44: skill:import/remove IPC インターフェース不整合

## 並列実行ガイド

| グループ | Phase | 備考                                   |
| -------- | ----- | -------------------------------------- |
| A        | 1-3   | 要件定義〜設計レビュー（順次）         |
| B        | 4-7   | テスト〜カバレッジ（順次）             |
| C        | 8-10  | リファクタリング〜最終レビュー（順次） |
| D        | 11    | 手動テスト                             |
| E        | 12-13 | ドキュメント〜完了（順次）             |
