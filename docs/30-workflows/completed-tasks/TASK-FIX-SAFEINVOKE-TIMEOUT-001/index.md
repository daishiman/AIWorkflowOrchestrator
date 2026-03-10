# TASK-FIX-SAFEINVOKE-TIMEOUT-001: safeInvoke タイムアウト追加

## 概要

| 項目         | 内容                                                                                                                                                                   |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| タスクID     | TASK-FIX-SAFEINVOKE-TIMEOUT-001                                                                                                                                        |
| タイトル     | safeInvoke タイムアウト追加                                                                                                                                            |
| タスク種別   | fix                                                                                                                                                                    |
| 優先度       | Priority 2                                                                                                                                                             |
| ステータス   | completed                                                                                                                                                              |
| 対象ファイル | `apps/desktop/src/preload/index.ts`, `apps/desktop/src/preload/skill-api.ts`, `apps/desktop/src/preload/skill-creator-api.ts`, `apps/desktop/src/preload/ipc-utils.ts` |

## 問題

`safeInvoke` 系 wrapper にタイムアウトがなく、IPC呼び出しがハングした場合 Promise が永遠に resolve しない。認証初期化のハング、Supabase到達不能時の全画面ブロック、skill 系 API の待ちっぱなしを引き起こす。

## 修正方針

`Promise.race` パターンの timeout-aware helper を Preload 共通部品として抽出し、`index.ts` / `skill-api.ts` / `skill-creator-api.ts` から再利用する。関数シグネチャは維持し、呼び出し元変更なしで責務だけを 1 箇所に集約する。

## 実装関心ごとマップ

| 関心ごと                 | 対象                                               | 目的                                                   |
| ------------------------ | -------------------------------------------------- | ------------------------------------------------------ |
| A. 共通 IPC 呼び出し責務 | `ipc-utils.ts`                                     | timeout、channel allowlist、エラーメッセージを一元管理 |
| B. Renderer 公開契約     | `index.ts`, `skill-api.ts`, `skill-creator-api.ts` | 既存公開 API のシグネチャ維持                          |
| C. 認証 UI 影響          | `auth:get-session`, `auth:check-online` 利用箇所   | timeout 後に `isLoading` が閉じることを確認            |
| D. テスト戦略            | preload helper 単体テスト + wrapper 回帰テスト     | 共通実装と公開契約の両方を守る                         |

## 必要仕様抽出マトリクス

| 種別        | まず読む                                  | 今回の使いどころ                                      |
| ----------- | ----------------------------------------- | ----------------------------------------------------- |
| Must        | `security-electron-ipc.md`                | Preload 境界、allowlist、防御責務                     |
| Must        | `architecture-implementation-patterns.md` | safeInvoke / Promise ベース helper 設計               |
| Must        | `api-ipc-auth.md`                         | `auth:get-session` / `auth:check-online` 契約確認     |
| Must        | `architecture-auth-security.md`           | AuthGuard 停滞の因果と UI 影響                        |
| Must        | `arch-state-management.md`                | timeout 後の `isLoading` / `isAuthenticated` 遷移確認 |
| Must        | `error-handling.md`                       | timeout エラー分類、文言、復旧方針                    |
| Must        | `ipc-contract-checklist.md`               | wrapper 抽出後も IPC 契約を壊さない確認               |
| Conditional | `ui-ux-settings.md`                       | 設定画面が認証ハングで巻き込まれない確認              |
| Conditional | `quality-requirements.md`                 | coverage / TDD 基準確認                               |
| Conditional | `testing-component-patterns.md`           | fake timer / preload test 設計補強                    |
| Conditional | `task-workflow.md`, `lessons-learned.md`  | 類似タスクの完了記録と再発防止確認                    |

## 推奨抽出手順

`search-spec.js` は複合語一発検索より、1概念ずつの分割検索が安定する。

1. `safeInvoke`
2. `timeout`
3. `auth:get-session`
4. `auth:check-online`
5. `Promise.race`

## Phase 一覧

| Phase | 名称             | 仕様書                                                         | ステータス |
| ----- | ---------------- | -------------------------------------------------------------- | ---------- |
| 1     | 要件定義         | [phase-1-requirements.md](./phase-1-requirements.md)           | completed  |
| 2     | 設計             | [phase-2-design.md](./phase-2-design.md)                       | completed  |
| 3     | 設計レビュー     | [phase-3-design-review.md](./phase-3-design-review.md)         | completed  |
| 4     | テスト作成       | [phase-4-test-creation.md](./phase-4-test-creation.md)         | completed  |
| 5     | 実装             | [phase-5-implementation.md](./phase-5-implementation.md)       | completed  |
| 6     | テスト拡充       | [phase-6-test-expansion.md](./phase-6-test-expansion.md)       | completed  |
| 7     | カバレッジ確認   | [phase-7-coverage-check.md](./phase-7-coverage-check.md)       | completed  |
| 8     | リファクタリング | [phase-8-refactoring.md](./phase-8-refactoring.md)             | completed  |
| 9     | 品質検証         | [phase-9-quality-assurance.md](./phase-9-quality-assurance.md) | completed  |
| 10    | 最終レビュー     | [phase-10-final-review.md](./phase-10-final-review.md)         | completed  |
| 11    | 手動テスト       | [phase-11-manual-test.md](./phase-11-manual-test.md)           | completed  |
| 12    | ドキュメント     | [phase-12-documentation.md](./phase-12-documentation.md)       | completed  |
| 13    | PR作成           | [phase-13-pr-creation.md](./phase-13-pr-creation.md)           | pending    |

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

## SubAgent 分担方針

| SubAgent | 担当                                                 | 最大対象          |
| -------- | ---------------------------------------------------- | ----------------- |
| Agent-A  | workflow 本体 (`index`, Phase 1-5)                   | 3ファイル         |
| Agent-B  | 検証 Phase (`Phase 6-11`)                            | 3ファイルずつ分割 |
| Agent-C  | ドキュメント/完了 (`Phase 12-13`, `artifacts.json`)  | 3ファイル         |
| Agent-D  | system spec 導線 (`resource-map`, `quick-reference`) | 2ファイル         |
