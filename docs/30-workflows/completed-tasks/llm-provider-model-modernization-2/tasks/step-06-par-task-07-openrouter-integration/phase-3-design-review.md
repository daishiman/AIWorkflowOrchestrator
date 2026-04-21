# Phase 3: 設計レビュー -- OpenRouter プロバイダー統合

## メタ情報

| 項目      | 値                     |
| --------- | ---------------------- |
| Phase番号 | 3                      |
| 機能名    | openrouter-integration |
| タスクID  | TASK-LLM-MOD-07        |
| 作成日    | 2026-03-23             |
| 依存Phase | Phase 2（設計）        |

## 目的

Phase 2 の設計内容が要件・アーキテクチャ・セキュリティ原則と整合しているかを検証し、Phase 4 移行の可否を判定する。

## 実行タスク

### Task 3-1: 要件との整合確認

| 確認項目                                                                         | 判定基準                                               | 結果   |
| -------------------------------------------------------------------------------- | ------------------------------------------------------ | ------ |
| AC-01: `LLMProviderIdSchema` に `"openrouter"` が追加されること                  | `z.enum([..., "openrouter"])` が設計書に明記されている | 要確認 |
| AC-02: `PROVIDER_CONFIGS` に OpenRouter エントリ（4 モデル）が追加されること     | エントリの id, name, models が定義されている           | 要確認 |
| AC-03: `inferProviderId` が `/` 含みモデルIDで `"openrouter"` を返すこと         | `/` パターンが最後の fallback として追加されている     | 要確認 |
| AC-04: `isValidProviderId` が `LLMProviderIdSchema.safeParse` に統一されること   | 二重管理が解消されている                               | 要確認 |
| AC-05: `LLMAdapterFactory` が OpenRouter で `OpenAICompatibleAdapter` を返すこと | `OPENAI_COMPATIBLE_CONFIGS` に設定が追加されている     | 要確認 |
| AC-06: TypeScript コンパイルエラー 0 件                                          | 全変更箇所で型整合が設計されている                     | 要確認 |

### Task 3-2: アーキテクチャ整合確認

| 確認項目                                                           | 判定基準                                                        | 結果   |
| ------------------------------------------------------------------ | --------------------------------------------------------------- | ------ |
| レイヤー依存方向が正しいこと                                       | Main → shared の方向のみ、Renderer → Node.js 直接参照なし       | 要確認 |
| `PROVIDER_CONFIGS` インライン型が `LLMModel` 型と整合すること      | モデル要素の型フィールドが一致                                  | 要確認 |
| `inferProviderId` の判定順序が既存プロバイダーを先にマッチすること | `gpt-`, `claude-`, `gemini-`, `grok-` が `/` より先に判定される | 要確認 |
| DIP 準拠: IPC ハンドラが具象クラスに依存していないこと（P61対策）  | 既存のハンドラ型シグネチャに変更なし                            | 要確認 |
| 型リテラルのハードコードが `LLMProviderId` 型に統一されること      | `aiHandlers.ts`, `useWorkspaceChatController.ts` で型統一       | 要確認 |
| `OpenAICompatibleAdapter` の再利用が適切であること                 | TASK-LLM-MOD-06 で実装済みのアダプターに追加変更なし            | 要確認 |

### Task 3-3: セキュリティ確認

| 確認項目                                               | 判定基準                                                       | 結果   |
| ------------------------------------------------------ | -------------------------------------------------------------- | ------ |
| OpenRouter API キーの保存先が SecureStorage であること | `ALL_PROVIDERS` に追加され、既存のセキュアストレージ経路を利用 | 要確認 |
| `extraHeaders` にユーザー入力が含まれないこと          | `HTTP-Referer`, `X-Title` は静的リテラル値                     | 要確認 |
| 新規 IPC チャンネルの追加がないこと                    | 既存の `LLM_GET_PROVIDERS` 等を再利用                          | 要確認 |
| API キーがログ・エラーメッセージに含まれないこと       | エラーメッセージにキー情報を含めない設計                       | 要確認 |

### Task 3-4: レビューゲート判定

| 判定              | 対応                      |
| ----------------- | ------------------------- |
| PASS              | Phase 4 へ移行            |
| MINOR             | 指摘対応後 Phase 4 へ移行 |
| MAJOR（要件問題） | Phase 1 へ戻る            |
| MAJOR（設計問題） | Phase 2 へ戻る            |

## 参照資料

| 資料                                    | 用途                     |
| --------------------------------------- | ------------------------ |
| Phase 2 設計書                          | レビュー対象             |
| Phase 1 要件定義書                      | 要件との整合確認         |
| `.claude/rules/01-architecture.md`      | アーキテクチャルール確認 |
| `.claude/rules/04-electron-security.md` | セキュリティルール確認   |

## 成果物

| 成果物               | パス       | 備考                   |
| -------------------- | ---------- | ---------------------- |
| Phase 3 設計レビュー | 本ファイル | レビュー判定結果を記録 |

## 統合テスト連携

設計レビューで PASS となった場合、Phase 4 のテスト設計に以下を反映する:

- `inferProviderId` の判定順序テスト（`/` 含みの前に既存プレフィックスマッチが優先されること）
- `OPENAI_COMPATIBLE_CONFIGS` の `extraHeaders` が正しく設定されていることの確認
- `ALL_PROVIDERS` に `"openrouter"` が含まれることの確認

## 完了条件

- [ ] Task 3-1 〜 3-3 の全確認項目に対して判定結果を記録した
- [ ] レビューゲート判定（PASS / MINOR / MAJOR）を決定した
- [ ] MINOR 以上の指摘がある場合、具体的な修正内容を記載した
- [ ] PASS または MINOR 対応完了後に Phase 4 移行の承認が得られた

## 次のPhase

[Phase 4: テスト作成](./phase-4-test-creation.md)
