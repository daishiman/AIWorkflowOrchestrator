# Phase 11: 手動テスト - GoogleAdapter system_instruction 対応

## メタ情報

| 項目     | 値                                       |
| -------- | ---------------------------------------- |
| Phase    | 11                                       |
| 機能名   | google-adapter-system-instruction        |
| 作成日   | 2026-03-23                               |
| タスクID | TASK-LLM-MOD-03                          |
| 依存     | phase-10-final-review.md（PASS判定済み） |

## 目的

自動テストでは検証できない実際の Gemini API との接続を確認し、`system_instruction` フィールドが API レベルで正しく動作することを検証する。

## 実行タスク

### Task 11-1: 前提条件の確認

手動テスト実施前に以下を確認する。

| 前提条件                                      | 確認方法                                             |
| --------------------------------------------- | ---------------------------------------------------- |
| 有効な Google Gemini API キーが設定されている | `echo $GOOGLE_API_KEY` でキーが存在することを確認    |
| `apps/desktop` のビルドが成功する             | `pnpm --filter @repo/desktop build`                  |
| ネットワーク接続が利用可能                    | `curl -I https://generativelanguage.googleapis.com/` |

**API キーが存在しない場合**: Task 11-2〜11-4 をスキップし、「API キー未設定のため手動テストスキップ」と記録する。

### Task 11-2: system_instruction フィールド送信確認スクリプト

以下のスクリプトを実行して、実際の API レスポンスを確認する。

```typescript
// scripts/test-google-system-instruction.ts
import { GoogleAdapter } from "./apps/desktop/src/main/adapters/llm/GoogleAdapter";

const adapter = new GoogleAdapter(process.env.GOOGLE_API_KEY!);

// テスト 1: systemPrompt ありの場合
const responseWithSystem = await adapter.sendChat({
  providerId: "google",
  modelId: "gemini-2.5-flash",
  messages: [{ role: "user", content: "あなたは誰ですか？" }],
  systemPrompt:
    "あなたは「AIアシスタント・ケンジ」という名前のアシスタントです。必ず自分の名前を名乗ってください。",
});

console.log("[systemPrompt あり] レスポンス:", responseWithSystem.content);
// 期待: レスポンスに「ケンジ」が含まれる

// テスト 2: systemPrompt なしの場合
const responseWithoutSystem = await adapter.sendChat({
  providerId: "google",
  modelId: "gemini-2.5-flash",
  messages: [{ role: "user", content: "あなたは誰ですか？" }],
});

console.log("[systemPrompt なし] レスポンス:", responseWithoutSystem.content);
// 期待: 通常の Gemini の自己紹介

// テスト 3: ヘルスチェック
const health = await adapter.checkHealth();
console.log("[ヘルスチェック]", health);
// 期待: { status: "connected", latency: <ms> }
```

**実行コマンド** (Node.js + tsx の場合):

```bash
GOOGLE_API_KEY=<your-api-key> npx tsx scripts/test-google-system-instruction.ts
```

### Task 11-3: 手動テスト結果記録

| テストケース                                     | 期待する結果                                            | 実際の結果（手動テスト実行時に記入） | 判定   |
| ------------------------------------------------ | ------------------------------------------------------- | ------------------------------------ | ------ |
| T11-01: systemPrompt ありで API 呼び出し         | レスポンスに systemPrompt の指示が反映される            | \_\_\_                               | \_\_\_ |
| T11-02: systemPrompt なしで API 呼び出し         | 通常の Gemini レスポンス                                | \_\_\_                               | \_\_\_ |
| T11-03: ヘルスチェック (`v1beta` エンドポイント) | `status: "connected"` かつ `latency >= 0`               | \_\_\_                               | \_\_\_ |
| T11-04: ストリーミングで systemPrompt 送信       | チャンクが yield され、内容が systemPrompt の指示を反映 | \_\_\_                               | \_\_\_ |

### Task 11-4: CLI 環境でのスクリプト実行制約

**制約事項** (P53 対応): CLI 環境では Electron アプリの実画面テストは実施できない。代替として以下のアプローチを採用する。

1. `scripts/test-google-system-instruction.ts` のようなスタンドアロンスクリプトで `GoogleAdapter` を直接テストする
2. 実際の API への接続確認は「ヘルスチェックが `connected` を返す」をもってスクリーンショット代替とする
3. Electron アプリ全体の結合テストは Task11 以降の統合テスト（Task04 完了後）で実施する

**スキップ条件**: API キーが存在しない場合は `T11-01`〜`T11-04` をスキップし、Phase 12 に進む。自動テスト（Phase 9）の結果を「間接的な検証」として記録する。

## 参照資料

| 資料名         | パス                                                  | 内容                        |
| -------------- | ----------------------------------------------------- | --------------------------- |
| 要件定義書     | `phase-1-requirements.md`                             | AC-05・AC-06 の手動検証基準 |
| 実装済みコード | `apps/desktop/src/main/adapters/llm/GoogleAdapter.ts` | 手動テスト対象              |

## 統合テスト連携

本 Phase 完了後、Task04（step-03 のテスト更新）が開始可能になる。Task04 では本タスクの `GoogleAdapter.test.ts` の最終状態（追加テストを含む）を参照して期待値の整合確認を行う。

## 多角的チェック観点（AIが判断）

タスクの性質に応じて、以下の観点を確認する。
**具体的なチェック項目はAIがタスク内容に応じて判断・適用する。**

| 観点               | 適用判断                           | 仕様参照先                                   |
| ------------------ | ---------------------------------- | -------------------------------------------- |
| セキュリティ       | 認証・認可・入力検証が関係する場合 | `aiworkflow-requirements: security-*.md`     |
| アーキテクチャ     | 設計・構造変更の場合               | `aiworkflow-requirements: architecture-*.md` |
| API設計            | API実装・変更の場合                | `aiworkflow-requirements: api-*.md`          |
| エラーハンドリング | 例外処理が必要な場合               | `aiworkflow-requirements: error-handling.md` |
| パフォーマンス     | 性能要件がある場合                 | `aiworkflow-requirements: architecture-*.md` |

## 成果物

| 成果物         | パス                                                            | 説明                    |
| -------------- | --------------------------------------------------------------- | ----------------------- |
| 手動テスト結果 | `phase-11-manual-testing.md`（本ファイル）の Task 11-3 テーブル | 実際の API 応答確認記録 |

## 完了条件

- [ ] API キーの有無を確認している
- [ ] API キーが存在する場合: T11-01〜T11-04 の全テストが PASS している
- [ ] API キーが存在しない場合: スキップ理由を記録し、自動テスト結果を代替証跡として記録している
- [ ] Task 11-3 テーブルに実際の結果が記録されている（またはスキップ理由が記録されている）
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次のPhase

Phase 12: ドキュメント更新
