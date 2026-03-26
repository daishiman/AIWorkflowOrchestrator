# テストファイル構成

## 概要

E2E テストのファイル配置とシナリオ分担を定義する。

---

## ディレクトリ構成

```
apps/desktop/src/test/
├── e2e/
│   ├── skill-creator-integration.test.ts  # シナリオ A, C, D, E
│   └── terminal-handoff.test.ts           # シナリオ B
├── helpers/
│   └── skill-creator-test-helpers.ts      # 共通ヘルパー
```

---

## ファイル別責務

### skill-creator-integration.test.ts

| セクション     | シナリオ | テスト内容                                       |
| -------------- | -------- | ------------------------------------------------ |
| 正常フロー     | A        | plan → execute-plan → スキル生成完了             |
| LLMエラー回復  | C        | エラーメッセージ表示 + リトライ可能性            |
| improve 機能   | D        | improve-skill → apply-improvement 連携           |
| 後方互換       | E        | skill:create チャンネルの動作継続                |
| セキュリティ   | -        | NFR-1: エラーレスポンスの機密情報漏洩検証        |
| パフォーマンス | -        | NFR-2: vi.useFakeTimers() によるタイムアウト検証 |

### terminal-handoff.test.ts

| セクション           | シナリオ | テスト内容                                           |
| -------------------- | -------- | ---------------------------------------------------- |
| Plan TerminalHandoff | B        | apiKey null/空文字列/空白のみ → HandoffGuidance 返却 |
| Improve Handoff      | B        | improve-skill での TerminalHandoff 検証              |
| セキュリティ         | B        | terminalCommand のシェルインジェクション文字検証     |
| 構造検証             | B        | HandoffGuidance の各フィールド非空検証               |

### skill-creator-test-helpers.ts

| ヘルパー関数                | 用途                                               |
| --------------------------- | -------------------------------------------------- |
| `createMockMainWindow()`    | MockBrowserWindow の生成                           |
| `createMockEvent()`         | IpcMainInvokeEvent のモック生成                    |
| `getHandler(channel)`       | handlerMap からハンドラー取得                      |
| `createMockRuntimeFacade()` | RuntimeSkillCreatorFacade の全メソッドモック       |
| `assertTerminalHandoff()`   | TerminalHandoff レスポンスの構造検証               |
| `assertIpcSuccess()`        | 成功レスポンスの汎用検証                           |
| `assertIpcError()`          | エラーレスポンスの汎用検証（サニタイズ含む）       |
| `setupHandlers()`           | ハンドラー登録・BrowserWindow モック設定の一括実行 |

---

## 既存テストとの関係

| 既存テストファイル                         | 関連性                                         |
| ------------------------------------------ | ---------------------------------------------- |
| `skillCreatorIpc.integration.test.ts`      | モックパターンの参照元。本テストと重複しない   |
| `creatorHandlers.applyImprovement.test.ts` | apply-improvement の単体テスト。本テストは統合 |
| `skillCreatorHandlers.validation.test.ts`  | バリデーションの単体テスト。本テストは E2E     |

---

## テスト実行コマンド

```bash
# E2E テストのみ実行
cd apps/desktop && pnpm vitest run src/test/e2e/

# 統合テスト
cd apps/desktop && pnpm vitest run src/test/e2e/skill-creator-integration.test.ts

# TerminalHandoff テスト
cd apps/desktop && pnpm vitest run src/test/e2e/terminal-handoff.test.ts

# 全テスト（カバレッジ付き）
cd apps/desktop && pnpm vitest run --coverage src/test/e2e/
```
