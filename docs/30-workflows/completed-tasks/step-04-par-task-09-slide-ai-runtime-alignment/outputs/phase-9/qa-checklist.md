# Phase 9 品質チェックリスト

| 項目     | 値                                      |
| -------- | --------------------------------------- |
| タスクID | TASK-IMP-SLIDE-AI-RUNTIME-ALIGNMENT-001 |
| Phase    | 9 - 品質検証                            |
| 作成日   | 2026-03-19                              |
| 分類     | 設計タスク（実装なし、仕様書作成）      |

## 概要

本 Phase は設計タスクのため、T-9-1〜T-9-3（Lint / TypeCheck / Test）は「実装後に確認すべき計画記録」として記録する。
T-9-4〜T-9-8 は設計段階での確認として検証コマンドと期待結果を記載する。

---

## T-9-1: Lint チェック

**ステータス: 計画記録（実装後に確認）**

```bash
pnpm --filter @repo/desktop lint
```

| 確認項目      | 期待結果                      |
| ------------- | ----------------------------- |
| ESLint エラー | 0件                           |
| ESLint 警告   | 0件（または抑制コメント付き） |

- `any` 型の使用は `@ts-ignore` コメント禁止（理由コメント必須）
- 未使用 import が存在しないこと

---

## T-9-2: TypeScript 型チェック

**ステータス: 計画記録（実装後に確認）**

```bash
pnpm --filter @repo/desktop typecheck
```

| 確認項目      | 期待結果                                 |
| ------------- | ---------------------------------------- |
| 型エラー      | 0件                                      |
| strict モード | `tsconfig.json` で `strict: true` が有効 |

- `as any` キャストによるバリデーション回避がないこと（P19 対策）
- non-null assertion (`!`) の不適切使用がないこと（P48 対策）

---

## T-9-3: テスト実行

**ステータス: 計画記録（実装後に確認）**

```bash
pnpm --filter @repo/desktop test
```

| 確認項目          | 期待結果 |
| ----------------- | -------- |
| 全テスト PASS     | 0件失敗  |
| Line Coverage     | 80% 以上 |
| Branch Coverage   | 60% 以上 |
| Function Coverage | 80% 以上 |

実装フェーズで Phase 4 設計のテストケースを全て通過させること。

---

## T-9-4: Direct SDK 排除確認

**ステータス: 設計確認（agent-client.ts 廃止設計により PASS）**

### 検証コマンド

```bash
# slide ディレクトリへの Direct SDK import 確認
grep -rn "from '@anthropic-ai/sdk'" apps/desktop/src/main/slide/
echo "件数: $(grep -rn "from '@anthropic-ai/sdk'" apps/desktop/src/main/slide/ | wc -l | tr -d ' ')"

# Anthropic クライアント直接生成の確認
grep -rn "new Anthropic(" apps/desktop/src/main/slide/
echo "件数: $(grep -rn "new Anthropic(" apps/desktop/src/main/slide/ | wc -l | tr -d ' ')"
```

| 検証観点                                  | 期待結果 | 設計根拠                                                    |
| ----------------------------------------- | -------- | ----------------------------------------------------------- |
| `@anthropic-ai/sdk` 直接 import           | **0件**  | agent-client.ts 廃止により slide 配下にファイルが存在しない |
| `new Anthropic(` による直接インスタンス化 | **0件**  | SDK クライアント生成は RuntimeResolver 経由に統一           |

---

## T-9-5: electron-store / env 直参照排除確認

**ステータス: 設計確認（PASS）**

### 検証コマンド

```bash
# electron-store 直読み確認
grep -rn "electron-store\|new Store(" apps/desktop/src/main/slide/
echo "electron-store 件数: $(grep -rn 'electron-store\|new Store(' apps/desktop/src/main/slide/ | wc -l | tr -d ' ')"

# env 直参照確認
grep -rn "process\.env\.ANTHROPIC" apps/desktop/src/main/slide/
echo "env 直参照件数: $(grep -rn 'process\.env\.ANTHROPIC' apps/desktop/src/main/slide/ | wc -l | tr -d ' ')"

# fallback パターン確認（Silent Fallback 排除）
grep -rn "DEFAULT_CONFIG\|defaultConfig\|\|\| {" apps/desktop/src/main/slide/
```

| 検証観点                        | 期待結果 | 設計根拠                                         |
| ------------------------------- | -------- | ------------------------------------------------ |
| `electron-store` 直読み         | **0件**  | P62 対策: credential は IAuthKeyService 経由のみ |
| `process.env.ANTHROPIC*` 直参照 | **0件**  | Silent Fallback 排除設計                         |
| `DEFAULT_CONFIG` fallback       | **0件**  | 未設定時はエラー表示（fallback しない）          |

---

## T-9-6: validateIpcSender 適用確認

**ステータス: 設計確認（PASS）**

### 検証コマンド

```bash
# validateIpcSender 適用数を確認
grep -rn "validateIpcSender" apps/desktop/src/main/slide/ipc-handlers.ts
echo "validateIpcSender 件数: $(grep -rn 'validateIpcSender' apps/desktop/src/main/slide/ipc-handlers.ts | wc -l | tr -d ' ')"

# ipcMain.handle チャネル数を確認（validateIpcSender と一致すること）
grep -rn "ipcMain\.handle" apps/desktop/src/main/slide/ipc-handlers.ts
echo "ipcMain.handle 件数: $(grep -rn 'ipcMain\.handle' apps/desktop/src/main/slide/ipc-handlers.ts | wc -l | tr -d ' ')"
```

| 検証観点                           | 期待結果                      | 設計根拠                                                                  |
| ---------------------------------- | ----------------------------- | ------------------------------------------------------------------------- |
| `validateIpcSender` 件数           | **6件**（全チャネル数と一致） | 全 IPC ハンドラに validateIpcSender を適用                                |
| `ipcMain.handle` 件数              | **6件**                       | SLIDE_SYNC_START / STOP / STATUS / REVERSE / MANUAL / EXECUTE の6チャネル |
| validateIpcSender ≠ ipcMain.handle | **0件**（不一致なし）         | 未適用 handler が存在しないこと                                           |

---

## T-9-7: P42 3段バリデーション確認

**ステータス: 設計確認（PASS）**

P42 パターン: `typeof チェック → 空文字列チェック → trim() 空文字列チェック` の3段構成。

### 検証コマンド

```bash
# 文字列引数バリデーションの trim チェック確認
grep -rn "\.trim()" apps/desktop/src/main/slide/ipc-handlers.ts
echo "trim() 件数: $(grep -rn '\.trim()' apps/desktop/src/main/slide/ipc-handlers.ts | wc -l | tr -d ' ')"

# typeof string チェック確認
grep -rn 'typeof.*"string"' apps/desktop/src/main/slide/ipc-handlers.ts
```

| 検証観点                           | 期待結果               | 設計根拠                                     |
| ---------------------------------- | ---------------------- | -------------------------------------------- |
| `.trim() === ""` パターン          | 文字列引数の数と同件数 | P42: スペースのみ入力を弾く3段バリデーション |
| `typeof arg !== "string"` パターン | 文字列引数の数と同件数 | 型チェック（第1段）                          |
| `arg === ""` のみの単純チェック    | **0件**                | P42: 単純空文字チェックのみは不十分          |

### 期待する3段バリデーション例

```typescript
// P42 準拠（3段バリデーション）
if (
  typeof sessionId !== "string" || // 第1段: 型チェック
  sessionId === "" || // 第2段: 空文字列チェック
  sessionId.trim() === "" // 第3段: トリム後空文字列チェック
) {
  return {
    success: false,
    error: {
      code: "VALIDATION_ERROR",
      message: "sessionId must be non-empty string",
    },
  };
}
```

---

## T-9-8: UX 整合確認

**ステータス: 設計確認（PASS）**

### guidance / error / sync status の表示一貫性

| UI 領域                  | 確認方法                             | 期待動作                                                      |
| ------------------------ | ------------------------------------ | ------------------------------------------------------------- |
| **Guidance パネル**      | Storybook / 手動テスト               | Slide 設定未完了時にオンボーディングガイダンスを表示          |
| **Error 表示**           | 手動テスト（未設定状態でボタン押下） | 「APIキーが未設定です」等の明示エラー（silent fallback なし） |
| **Sync Status**          | 手動テスト（sync 実行中）            | spinner + 進捗メッセージが連続して更新される                  |
| **internal role 非露出** | コードレビュー                       | UI に `role: "modifier"` 等の内部役割値が表示されない         |

### 検証コマンド（コードレビュー）

```bash
# internal role 文字列が UI に直接露出していないか確認
grep -rn '"modifier"\|"legacy"\|"slide-agent"' apps/desktop/src/renderer/
echo "internal role 露出件数: $?"

# user-facing 文字列が i18n キーを使用しているか確認
grep -rn '"Slide"\|"Agent"\|"Modifier"' apps/desktop/src/renderer/components/slide/
```

| 検証観点                              | 期待結果                 |
| ------------------------------------- | ------------------------ |
| internal role の UI 直接露出          | **0件**                  |
| ハードコードされた user-facing 文字列 | **0件**（i18n キー使用） |

---

## 総合判定

| チェック                      | ステータス | 備考                                                    |
| ----------------------------- | ---------- | ------------------------------------------------------- |
| T-9-1 Lint                    | 計画記録   | 実装後に `pnpm --filter @repo/desktop lint` で確認      |
| T-9-2 TypeCheck               | 計画記録   | 実装後に `pnpm --filter @repo/desktop typecheck` で確認 |
| T-9-3 Test                    | 計画記録   | 実装後に `pnpm --filter @repo/desktop test` で確認      |
| T-9-4 Direct SDK 排除         | PASS       | agent-client.ts 廃止設計で構造的に排除                  |
| T-9-5 electron-store/env 排除 | PASS       | IAuthKeyService 経由統一設計で排除                      |
| T-9-6 validateIpcSender 適用  | PASS       | 全6チャネルへの適用を設計確認済み                       |
| T-9-7 P42 3段バリデーション   | PASS       | 全文字列引数への適用を設計確認済み                      |
| T-9-8 UX 整合                 | PASS       | guidance/error/sync status の一貫性を設計確認済み       |

**Phase 9 総合: PASS（設計確認）** — T-9-1〜T-9-3 は実装フェーズで確認すること。
