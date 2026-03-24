# Phase 11: 手動テスト — AnthropicAdapter ヘルスチェックモデル更新

## メタ情報

| 項目       | 値                       |
| ---------- | ------------------------ |
| Phase番号  | 11                       |
| 機能名     | anthropic-adapter-update |
| タスクID   | TASK-LLM-MOD-02          |
| 作成日     | 2026-03-23               |
| ステータス | 未着手                   |

## 目的

Electron アプリを起動し、Anthropic プロバイダーのヘルスチェックが `claude-haiku-4-5` モデルで正常に動作することを手動で確認する。

## 実行タスク

### Task 11-1: アプリ起動前確認

```bash
pnpm --filter @repo/desktop build
```

ビルドが成功することを確認する。

### Task 11-2: Electron アプリ起動

```bash
pnpm --filter @repo/desktop dev
```

### Task 11-3: ヘルスチェック手動確認シナリオ

#### シナリオ MT-01: Anthropic プロバイダー接続確認

| 手順 | 操作                                                       | 期待結果                                        |
| ---- | ---------------------------------------------------------- | ----------------------------------------------- |
| 1    | アプリを起動し、設定画面を開く                             | 設定画面が表示される                            |
| 2    | Anthropic プロバイダーの API キーを入力する                | API キーが入力欄に反映される                    |
| 3    | 「接続テスト」または「ヘルスチェック」ボタンをクリックする | ローディング状態が表示される                    |
| 4    | 接続テスト結果を確認する                                   | 「Connected」または同等のステータスが表示される |

#### シナリオ MT-02: DevTools によるリクエスト確認（オプション）

CLI 環境でのアプリ操作が難しい場合、以下の代替確認を実施する。

```bash
# Main Process のログで checkHealth リクエストを確認
# アプリ起動時のコンソール出力で以下を探す:
# POST https://api.anthropic.com/v1/messages
# body: { model: "claude-haiku-4-5", ... }
```

#### シナリオ MT-03: CLI 環境での代替確認

Electron 実行環境がない場合（CLI 環境）、以下の代替確認で手動テストを代替する。

```bash
# 1. 実装コードの最終確認
grep -n "claude-haiku-4-5" apps/desktop/src/main/adapters/llm/AnthropicAdapter.ts

# 2. テスト実行による動作確認
cd apps/desktop && pnpm vitest run src/main/adapters/llm/__tests__/AnthropicAdapter.test.ts --reporter=verbose

# 3. 実際の API 呼び出しをシミュレート（MSW モックなし・実環境）
# 環境変数 ANTHROPIC_API_KEY が設定されている場合のみ実行
# pnpm --filter @repo/desktop exec ts-node -e "
#   import { AnthropicAdapter } from './src/main/adapters/llm/AnthropicAdapter';
#   const adapter = new AnthropicAdapter(process.env.ANTHROPIC_API_KEY);
#   adapter.checkHealth().then(console.log).catch(console.error);
# "
```

P53 対応: CLI 環境でのスクリーンショット取得不可のため、テスト実行結果を視覚検証の代替とする。

### Task 11-4: 手動テスト結果の記録

| シナリオ | 結果          | 備考                                                |
| -------- | ------------- | --------------------------------------------------- |
| MT-01    | PASS / 未実施 | 実行環境・日時を記録                                |
| MT-02    | PASS / 未実施 | DevTools ログのスクリーンショット（取得可能な場合） |
| MT-03    | PASS          | CLI 代替確認として実施                              |

## 参照資料

| ドキュメント                                             | 用途                                         |
| -------------------------------------------------------- | -------------------------------------------- |
| `phase-10-final-review.md`                               | Phase 10 PASS 確認（前提条件）               |
| `apps/desktop/src/main/adapters/llm/AnthropicAdapter.ts` | 変更ファイルの最終状態                       |
| `.claude/rules/06-known-pitfalls.md` (P53)               | CLI 環境でのスクリーンショット取得制約の参考 |

## 統合テスト連携

MT-01 シナリオは実際の Anthropic API との統合動作を確認する。API キーが利用可能な場合のみ実行する（課金が発生するため、`max_tokens: 1` の最小リクエストであることを事前確認済み）。

## 成果物

| 成果物                  | パス                                                                                        | 備考                     |
| ----------------------- | ------------------------------------------------------------------------------------------- | ------------------------ |
| Phase 11 手動テスト記録 | `docs/30-workflows/step-02-par-task-02-anthropic-adapter-update/phase-11-manual-testing.md` | 本ファイル（結果を記入） |

## 完了条件

- [ ] MT-01（Electron アプリ）または MT-03（CLI 代替）のいずれかを実施した
- [ ] 手動テスト結果をシナリオテーブルに記録した
- [ ] MT-01 を実施した場合、「Connected」ステータスが返ったことを確認した
- [ ] MT-03 を実施した場合、`grep` コマンドで `claude-haiku-4-5` が存在することを確認した
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 12: ドキュメント更新（`phase-12-documentation.md`）
