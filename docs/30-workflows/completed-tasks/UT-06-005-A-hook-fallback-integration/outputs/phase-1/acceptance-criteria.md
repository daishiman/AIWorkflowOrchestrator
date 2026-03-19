# Phase 1 成果物: 受け入れ基準

## メタ情報

| 項目      | 値                                           |
| --------- | -------------------------------------------- |
| タスク ID | UT-06-005-A                                  |
| フェーズ  | Phase 1 - 要件定義                           |
| 作成日    | 2026-03-17                                   |
| 参照      | `outputs/phase-1/requirements-definition.md` |

## 受け入れ基準一覧

| AC-ID  | 受け入れ基準                                                                | 対応 FR/NFR      | 検証方法                                                                                                 |
| ------ | --------------------------------------------------------------------------- | ---------------- | -------------------------------------------------------------------------------------------------------- |
| AC-001 | Permission 拒否時に `processPermissionFallback` が1回呼ばれること           | FR-101           | ユニットテスト: モック検証（`expect(mockProcessPermissionFallback).toHaveBeenCalledTimes(1)`）           |
| AC-002 | タイムアウト発生時に `executeAbortFlow("timeout")` が呼ばれること           | FR-102           | ユニットテスト: `vi.useFakeTimers()` でタイマーを制御し `executeAbortFlow` の引数を検証                  |
| AC-003 | retry 時に `sendPermissionRequest` が再度呼ばれること（最大3回）            | FR-103           | ユニットテスト: 呼び出し回数検証（最大 `PERMISSION_MAX_RETRIES=3` 回）                                   |
| AC-004 | skip フォールバック時に `{ proceed: false, message: "..." }` が返されること | FR-104           | ユニットテスト: 戻り値の `proceed` フィールドが `false` であることを検証                                 |
| AC-005 | abort フォールバック時にスキル実行が停止し、エラーがスローされること        | FR-105           | ユニットテスト: `await expect(hook(...)).rejects.toThrow()` で例外を検証                                 |
| AC-006 | フォールバック処理の例外発生時に abort へ遷移すること（fail-closed）        | NFR-101          | ユニットテスト: `processPermissionFallback` のモックに例外を注入して `executeAbortFlow` の呼び出しを検証 |
| AC-007 | 既存テスト 275+ ケースが全 PASS であること                                  | NFR-104, NFR-105 | `pnpm --filter @repo/desktop exec vitest run` を実行して全テストが PASS することを確認                   |

## 検証条件の詳細

### AC-001: Permission 拒否検証

- `sendPermissionRequest` が `{ approved: false }` を返す状況を再現する
- `processPermissionFallback` が1回だけ呼ばれることをモックで検証する
- `processPermissionFallback` の引数（`response`, `context`）が正しい値であることを確認する

### AC-002: タイムアウト検証

- `DEFAULT_TIMEOUT_MS=30000ms` 経過後に `executeAbortFlow` が `"timeout"` 引数で呼ばれることを確認する
- タイマーのクリア処理が行われ、メモリリークが発生しないことを確認する

### AC-003: retry ループ検証

- `processPermissionFallback` が `{ action: "retry" }` を返す状況を再現する
- `sendPermissionRequest` の再呼び出し回数が `PERMISSION_MAX_RETRIES=3` を超えないことを確認する
- 3回 retry 後に `executeAbortFlow("max_retries")` が呼ばれることを確認する（AC との対応: FR-106）

### AC-004: skip 検証

- `processPermissionFallback` が `{ action: "skip" }` を返す状況を再現する
- 戻り値が `{ proceed: false }` であり、後続処理が継続することを確認する

### AC-005: abort 検証

- `processPermissionFallback` が `{ action: "abort" }` を返す状況を再現する
- `executeAbortFlow` が呼ばれ、例外がスローされることを確認する

### AC-006: fail-closed 検証

- `processPermissionFallback` の呼び出しで例外が発生した場合に `executeAbortFlow` へフォールバックすることを確認する
- 例外の詳細をログに出力し、abort フローが確実に実行されることを確認する

### AC-007: 既存テスト維持

- `SkillExecutor.test.ts` の既存 275+ ケースが全 PASS であること
- 特に FR-001（危険コマンドチェック）、FR-002（保護パスチェック）、FR-003（ツール実行開始通知）の動作が変わらないことを確認する
