# Phase 12 実装ガイド

## Part 1（中学生レベルの説明）

### 1. この機能は何をしているか

この機能は「正しい窓口だけを使って、間違った持ち込みを止める受付」です。

#### 日常生活での例え

学校の職員室をイメージしてください。

- 先生に提出する紙は「提出箱」に入れる
- 相談があるときは「相談窓口」に行く

この2つを混ぜると、紙がなくなったり、対応が遅れたりします。
このタスクでは、アプリの中でも「提出箱」と「相談窓口」をきっちり分けました。

### 2. この機能でできること

| 機能                       | 説明                                  | 例                            |
| -------------------------- | ------------------------------------- | ----------------------------- |
| 正しい入力だけ受け付ける   | 空文字や空白だけの名前を拒否する      | `ERR_1001` を表示             |
| 許可された呼び出しだけ通す | 不正な呼び出し元を拒否する            | `ERR_2004` を表示             |
| 想定外の失敗を安全に扱う   | 内部エラーを安全な文言に変換する      | `ERR_5001` + `Internal error` |
| 役割を混ぜない             | import と importFromSource を分離する | 画面導線で混在しない          |

### 3. なぜ必要か

- 予期しない入力でアプリが壊れないため
- 不正な呼び出しを受け付けないため
- エラー時に内部情報を漏らさないため

## Part 2（技術詳細）

### 1. 変更点

- Main IPC: `skillHandlers.share.ts`
  - `IPC_CHANNELS` 参照へ統一
  - sender拒否時 `ERR_2004`
  - 予期しない例外を `ERR_5001` へ正規化
- Tests
  - `skillHandlers.share.test.ts`: 34 tests
  - `skill-api.contract.test.ts`: 60 tests
- Manual Evidence
  - Phase11スクリーンショット 4件

### 2. エラー契約

| 経路           | code               | errorCode  | message                   |
| -------------- | ------------------ | ---------- | ------------------------- |
| 入力不正       | `VALIDATION_ERROR` | `ERR_1001` | 検証メッセージ            |
| sender拒否     | `IPC_UNAUTHORIZED` | `ERR_2004` | `Unauthorized IPC sender` |
| 予期しない例外 | `INTERNAL_ERROR`   | `ERR_5001` | `Internal error`          |

### 3. 実行コマンド

```bash
cd apps/desktop
pnpm vitest run src/main/ipc/__tests__/skillHandlers.share.test.ts
pnpm vitest run src/preload/__tests__/skill-api.contract.test.ts
pnpm typecheck
pnpm vitest run src/main/ipc/__tests__/skillHandlers.share.test.ts src/preload/__tests__/skill-api.contract.test.ts --coverage --coverage.include=src/main/ipc/skillHandlers.share.ts --coverage.include=src/preload/skill-api.ts --coverage.thresholds.lines=0 --coverage.thresholds.functions=0 --coverage.thresholds.branches=0 --coverage.thresholds.statements=0
```

### 4. カバレッジ結果

- `skillHandlers.share.ts`: Line 91.89 / Branch 85.71 / Func 100
- `skill-api.ts`: Line 57.14 / Branch 90.32 / Func 41.37
