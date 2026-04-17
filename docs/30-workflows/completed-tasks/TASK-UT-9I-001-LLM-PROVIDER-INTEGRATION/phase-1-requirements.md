# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                                        |
| ---------- | ------------------------------------------- |
| Phase      | 1                                           |
| 機能名     | TASK-UT-9I-001-LLM-PROVIDER-INTEGRATION     |
| タスク名   | SkillDocGenerator の LLM プロバイダ連携実装 |
| 前提Phase  | -                                           |
| 後続Phase  | Phase 2                                     |
| 作成日     | 2026-04-17                                  |
| ステータス | completed                                   |

## 目的

`SkillDocGenerator` の docs 生成経路を、`LLMDocQueryAdapter` → `LLMClient` → `AnthropicProvider` の実 LLM プロバイダ連携へ置換し、本番品質のドキュメント生成経路を確立する要件境界を固定する。

## 背景

Issue #2158（TASK-05-SOURCE-INVESTIGATION）の調査により以下が判明した：

1. **LLMDocQueryAdapter の実装不足**: `apps/desktop/src/main/services/skill/LLMDocQueryAdapter.ts` には本番 LLM 連携の正規化ロジックが必要
2. **エラー分類コードの未定義**: IPC は `{ success: false, error: string }` のみで、UI が再試行判定できない
3. **LLM クライアントモジュールの未実装**: Main Process に LLM プロバイダ接続コードが存在しない
4. **型定義の二重化リスク**: `LLMQueryFn` が `@repo/shared` に存在しない可能性（P32 対策未対応）

## Step 0: P50チェック（前提確認）

```bash
# 現状実装の確認（stub 文字列が残っていないことを確認）
rg -n "Generated content for:" apps/desktop/src/main/services/skill/LLMDocQueryAdapter.ts
grep -rn "LLMQueryFn" apps/desktop/src/main/services/skill/
grep -rn "LLMClient" apps/desktop/src/main/services/
grep -rn "AnthropicProvider\|OpenAIProvider" apps/desktop/src/main/
```

確認事項:

- [ ] `LLMDocQueryAdapter` に本番 LLM 連携の正規化ロジックが実装されていることを確認
- [ ] `LLMQueryFn` 型が `SkillDocGenerator.ts` L18-19 に定義済み
- [ ] `services/llm/` ディレクトリが存在することを確認

## SubAgentチーム編成

| SubAgent   | 関心ごと      | 主担当                         |
| ---------- | ------------- | ------------------------------ |
| SubAgent-A | LLMプロバイダ | Anthropic API選定・認証設計    |
| SubAgent-B | エラー分類    | 失敗ポリシー・IPC契約拡張      |
| SubAgent-C | 型契約        | LLMQueryFn型・@repo/shared配置 |
| SubAgent-D | 統合監査      | 矛盾・漏れ・整合・依存判定     |

## 実行タスク

1. **プロバイダ選定**: Anthropic Claude API を対象プロバイダとして確定する
2. **APIキー管理方針**: `authKeyService.getKey()` 経由での注入方針を確定する
3. **エラー分類コード定義**: 7種類のエラーコードを定義する
4. **IPC契約拡張要件**: `errorCode` / `retryable` フィールド追加要件を固定する
5. **受け入れ基準化**: AC-1 〜 AC-7 を定義する

## 参照資料

### 実装・コード

| 資料名                        | パス                                                                                                              | 用途                   |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------- | ---------------------- |
| IPC登録（LLMDocQueryAdapter） | `apps/desktop/src/main/ipc/index.ts`                                                                              | 現行 wiring の確認     |
| SkillDocGenerator             | `apps/desktop/src/main/services/skill/SkillDocGenerator.ts`                                                       | LLMQueryFn型・DI契約   |
| IPC skillHandlers             | `apps/desktop/src/main/ipc/skillHandlers.ts` L1054, L1162                                                         | エラーハンドリング現状 |
| 調査レポート                  | `docs/30-workflows/unassigned-task/task-05-phase-1-3-source-investigation-report.md`                              | 詳細ギャップ分析       |
| UT-9I-001 未タスク            | `docs/30-workflows/completed-tasks/TASK-9I-skill-docs/unassigned-task/task-ut-9i-001-llm-provider-integration.md` | 実装方針               |

### システム仕様（aiworkflow-requirements）

| 資料名                | パス                                                                          | 用途             |
| --------------------- | ----------------------------------------------------------------------------- | ---------------- |
| IPC契約チェックリスト | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md` | IPC契約監査基準  |
| エラーハンドリング    | `.claude/skills/aiworkflow-requirements/references/error-handling.md`         | 失敗契約         |
| セキュリティ原則      | `.claude/skills/aiworkflow-requirements/references/security-principles.md`    | APIキー管理原則  |
| 品質要件              | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`   | 品質ゲート       |
| アーキテクチャ        | `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md` | サービス設計方針 |

## 実行手順

1. 調査レポート（task-05-phase-1-3-source-investigation-report.md）の「Phase 1に反映すべきポイント」を全て確認する
2. UT-9I-001 の前提条件・依存タスクを確認する
3. プロバイダ選定（Anthropic）を確定し、APIキー管理方針を記録する
4. エラー分類コード表を作成する
5. IPC契約拡張要件を記述する
6. 受け入れ基準 AC-1 〜 AC-7 をチェックリスト形式で定義する

## 要件定義

### プロバイダ選定

| 項目              | 内容                                     |
| ----------------- | ---------------------------------------- |
| 対象プロバイダ    | Anthropic Claude API                     |
| 推奨モデル        | claude-haiku-4-5（コスト効率・速度重視） |
| APIエンドポイント | `https://api.anthropic.com/v1/messages`  |
| 認証スキーム      | API Key（ヘッダー: `x-api-key`）         |
| APIキー取得方法   | `authKeyService.getKey()`                |
| SDK               | `@anthropic-ai/sdk`                      |

### エラー分類コードテーブル

| コード            | HTTP | 原因             | UI再試行 | 復旧戦略       |
| ----------------- | ---- | ---------------- | -------- | -------------- |
| `API_KEY_MISSING` | 401  | APIキー未設定    | 不可     | 設定画面へ誘導 |
| `API_KEY_INVALID` | 403  | APIキー無効      | 不可     | キー再入力     |
| `RATE_LIMIT`      | 429  | レート制限       | 可能     | 指数バックオフ |
| `SERVER_ERROR`    | 5xx  | サーバエラー     | 可能     | 指数バックオフ |
| `TIMEOUT`         | -    | 30秒超過         | 可能     | 自動リトライ   |
| `NETWORK_ERROR`   | -    | ネットワーク断   | 可能     | 自動リトライ   |
| `INTERNAL_ERROR`  | -    | 予期しないエラー | 不可     | ログ記録・報告 |

### IPC契約拡張要件

```typescript
// 現行（不十分）
{ success: false, error: string }

// 拡張後
{
  success: false,
  error: string,        // ユーザー向けメッセージ（日本語）
  errorCode?: DocErrorCode,  // 分類コード
  retryable?: boolean,  // UI が再試行を提案すべきか
}

type DocErrorCode =
  | "API_KEY_MISSING"
  | "API_KEY_INVALID"
  | "RATE_LIMIT"
  | "SERVER_ERROR"
  | "TIMEOUT"
  | "NETWORK_ERROR"
  | "INTERNAL_ERROR";
```

### LLM呼び出しSLA

| 項目               | 値                                                  |
| ------------------ | --------------------------------------------------- |
| タイムアウト閾値   | 30秒（既存 LLM_TIMEOUT_MS 準拠）                    |
| リトライ上限       | 3回（指数バックオフ: 1s/2s/4s）                     |
| 対象リトライエラー | RATE_LIMIT / SERVER_ERROR / TIMEOUT / NETWORK_ERROR |
| 非リトライエラー   | API_KEY_MISSING / API_KEY_INVALID                   |

## 受け入れ基準

- AC-1: 実 LLM プロバイダ（Anthropic）で `skill:docs:generate` が成功レスポンスを返す
- AC-2: API キー未設定時に `{ success: false, errorCode: "API_KEY_MISSING", retryable: false }` を返す
- AC-3: API キー無効時に `{ success: false, errorCode: "API_KEY_INVALID", retryable: false }` を返す
- AC-4: 429応答時に `{ success: false, errorCode: "RATE_LIMIT", retryable: true }` を返す
- AC-5: 5xx応答時に `{ success: false, errorCode: "SERVER_ERROR", retryable: true }` を返す
- AC-6: タイムアウト時に `{ success: false, errorCode: "TIMEOUT", retryable: true }` を返す
- AC-7: `LLMDocQueryAdapter` の stub 実装が本番 IPC 登録経路から完全に排除される

## 統合テスト連携

- SubAgent-A: Anthropic API 接続テストケースを設計する
- SubAgent-B: 全エラーコードの IPC 返却テストケースを設計する
- SubAgent-C: 型定義の整合性テストを設計する
- SubAgent-D: AC-1〜AC-7 の統合検証順序を確定する

## 多角的チェック観点（AIが判断）

| 観点         | チェック内容                                           |
| ------------ | ------------------------------------------------------ |
| セキュリティ | APIキーがログやエラーメッセージに漏洩しないか          |
| 型安全性     | `LLMQueryFn` 型が `@repo/shared` に集約される設計か    |
| IPC契約整合  | Preload層が新 `errorCode` フィールドに対応できるか     |
| 後方互換性   | 既存 `skill:docs:*` ハンドラの成功パスが破壊されないか |

## 成果物

- `outputs/phase-1/requirements.md`: 要件定義書（本Phase内容）
- `outputs/phase-1/error-classification-table.md`: エラー分類コード表
- `outputs/phase-1/acceptance-criteria.md`: 受け入れ基準 AC-1〜AC-7

## 完了条件

- [ ] プロバイダ（Anthropic）が確定し、APIキー管理方針が明文化されている
- [ ] エラー分類コード7種類が定義されている
- [ ] IPC 契約拡張要件（errorCode / retryable）が固定されている
- [ ] 受け入れ基準 AC-1〜AC-7 が定義されている
- [ ] Phase 1-3 完了前に Phase 4 へ進まないゲートが設定されている

## タスク100%実行確認【必須】

- [ ] Step 0: P50チェック完了（LLMDocQueryAdapter stub の存在確認）
- [ ] プロバイダ選定完了
- [ ] エラー分類コード表作成完了
- [ ] IPC契約拡張要件記述完了
- [ ] 受け入れ基準 AC-1〜AC-7 定義完了
- [ ] 成果物ファイル出力完了

## 次Phase

Phase 2（設計）へ進む。**Phase 1-3 完了前に Phase 4 へ進むことを禁止する。**
