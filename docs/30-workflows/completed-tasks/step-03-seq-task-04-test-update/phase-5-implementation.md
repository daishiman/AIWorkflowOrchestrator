# Phase 5: 実装実態確認

## メタ情報

| 項目   | 値                         |
| ------ | -------------------------- |
| Phase  | 5                          |
| 機能名 | task-llm-mod-04-audit-sync |
| 作成日 | 2026-03-29                 |

## 目的

実装変更を行わず、既に存在する current implementation を確定する。

## 実行タスク

- 旧パス不在の確認
- current 実装パスの確定
- テスト痕跡の grep 確認
- historical completion 記録との照合

## 実装実態

| 項目                               | current fact                                                 |
| ---------------------------------- | ------------------------------------------------------------ |
| provider 正本                      | `packages/shared/src/types/llm/schemas/provider-registry.ts` |
| schema 導出                        | `packages/shared/src/types/llm/schemas/provider.ts`          |
| main handler                       | `apps/desktop/src/main/handlers/llm.ts`                      |
| 旧 `providers.ts`                  | 存在しない                                                   |
| `handleGetProviders()`             | `PROVIDER_CONFIGS` を返す                                    |
| `AnthropicAdapter.checkHealth()`   | `claude-haiku-4-5` を使用                                    |
| `GoogleAdapter.buildRequestBody()` | `system_instruction` を生成                                  |

## grep 証跡

- `llm.test.ts` に `o3` / `o4-mini` が存在
- `AnthropicAdapter.test.ts` に `claude-haiku-4-5` が存在
- `GoogleAdapter.test.ts` に `system_instruction` ケースが複数存在

## 実装判断

- 追加コードは不要
- stale spec だけを修正する
- 本 Phase の実装結果は「コード変更なし、仕様書のみ更新」

## 参照資料

| 資料              | パス                                                         | 説明       |
| ----------------- | ------------------------------------------------------------ | ---------- |
| Phase 4           | `phase-4-test-creation.md`                                   | 検証ケース |
| provider registry | `packages/shared/src/types/llm/schemas/provider-registry.ts` | SSoT       |
| main handler      | `apps/desktop/src/main/handlers/llm.ts`                      | 実装       |

## 統合テスト連携

統合対象は既存コードの読み取りと証跡固定である。

## 成果物

| 成果物       | パス                        | 説明          |
| ------------ | --------------------------- | ------------- |
| 実装実態確認 | `phase-5-implementation.md` | current facts |

## 完了条件

- [x] 旧パス不在を確認した
- [x] current 実装パスを確定した
- [x] 追加コード不要と結論づけた
- [x] **本Phase内の全タスクを100%実行完了**
