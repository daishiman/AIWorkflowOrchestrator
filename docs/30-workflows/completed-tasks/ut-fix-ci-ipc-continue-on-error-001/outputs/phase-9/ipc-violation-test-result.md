# IPC違反検出テスト結果記録 - Phase 9

## 実施日時

2026-04-16

## テスト概要

意図的にIPC違反（Rule-1: shared定義チャネルがpreloadホワイトリスト未登録）を導入し、
`verify-ipc-4layer.cjs` がFAIL（非ゼロ終了）することでGuard機能の有効性を確認した。

## 実施手順

1. `packages/shared/src/ipc/channels.ts` に検証用チャネルを追加

   ```typescript
   // TEST_ONLY: 違反テスト用（直後に削除）
   export const IPC_GUARD_TEST_CHANNEL = "test:ipc-guard-violation" as const;
   ```

2. `apps/desktop/src/preload/channels.ts` には追加しない（意図的な未登録）

3. ローカルで `node scripts/verify-ipc-4layer.cjs` を実行

## FAIL確認結果

```
=== IPC 4-Layer Alignment Verification ===

[Rule-1] shared で定義されたチャネルが preload ホワイトリストに未登録: FAIL (1 missing)
  ::error::Rule-1: Channel "test:ipc-guard-violation" - shared で定義されたチャネルが preload ホワイトリストに未登録
[Rule-2] preload invoke ホワイトリストのチャネルが main ハンドラに未実装: PASS
[Rule-3] renderer で使用されたチャネルが shared/preload に未定義: PASS

--- Summary ---
Total rules: 3
Passed: 2
Failed: 1
Exit code: 1
```

## 違反除去後の確認

```bash
$ git checkout packages/shared/src/ipc/channels.ts
$ node scripts/verify-ipc-4layer.cjs
# Rule-1/2/3 全PASS, Failed: 0, Exit code: 0
```

## 結論

- IPC Guard機能が正常に動作し、違反を検出してFAIL（終了コード: 1）することを確認
- `continue-on-error: true` 削除後、この検出が CI をブロックする
- 違反コードはリモートにpushしていない（ローカル確認のみ）

## Phase末端アクション確認

- [x] 意図的違反導入時に `verify-ipc-4layer.cjs` がFAIL（非ゼロ終了）することを確認
- [x] 違反除去後に `verify-ipc-4layer.cjs` がPASS（ゼロ終了）することを確認
- [x] 違反コードがリモートにpushされていないことを確認
