# Phase 1 成果物: 要件定義書

## タスク概要

| 項目       | 内容                                                          |
| ---------- | ------------------------------------------------------------- |
| タスクID   | TASK-SC-LLM-PURPOSE-WIRE-001                                  |
| 機能名     | llm-purpose-wire                                              |
| 対象       | `apps/desktop/src/main/services/skill/SkillCreatorService.ts` |
| 作成日     | 2026-04-16                                                    |
| ステータス | completed                                                     |

---

## 問題定義

### 現状の問題点

`runCreateWorkflow`（`SkillCreatorService.ts` L630〜L653）において以下の問題がある。

| 問題                     | 詳細                                                                                                                               |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| purpose が raw 文字列    | `purpose` フィールドに `loadAgent("extract-purpose")` の戻り値（エージェント定義文字列）がそのまま入っており、LLM 推論結果ではない |
| LLM 呼び出し未実装       | `extractPurposeAgent` を LLM に渡して purpose を推論するステップが存在しない                                                       |
| エラーハンドリング不十分 | `loadAgent` 失敗と LLM 失敗を単一 `try/catch` で処理しており区別できていない                                                       |

### 現状コード（問題箇所）

```typescript
// 現状（問題あり）
const extractPurposeAgent =
  await this.resourceLoader.loadAgent("extract-purpose");
const structurePlan: StructurePlanJson = {
  skillName: options.name,
  description: options.description,
  purpose: extractPurposeAgent, // ← エージェント定義の raw 文字列がそのまま入っている
  features: [],
  agents: [extractPurposeAgent, planStructureAgent],
};
```

---

## 機能要件

| ID   | 要件                                                                               |
| ---- | ---------------------------------------------------------------------------------- |
| FR-1 | `runCreateWorkflow` 内で `extract-purpose` エージェント定義を LLM に渡すこと       |
| FR-2 | LLM の推論結果を `StructurePlanJson.purpose` に格納すること                        |
| FR-3 | `loadAgent` 失敗と LLM 失敗を独立したエラーパスで処理すること                      |
| FR-4 | LLM 失敗時は `options.description` をフォールバック値として使用すること            |
| FR-5 | `ILLMClient` を `SkillCreatorService` コンストラクタからインジェクション可能にする |

---

## 非機能要件

| ID    | 要件                                                                                                   |
| ----- | ------------------------------------------------------------------------------------------------------ |
| NFR-1 | 既存コンストラクタ呼び出し（引数なし）の後方互換を維持すること                                         |
| NFR-2 | `runCreateWorkflow` の戻り値型 `StructurePlanJson \| null` を変更しないこと                            |
| NFR-3 | `LLM Provider/Model` 未選択時は `options.description` をフォールバックとして使用し、フロー継続すること |

---

## P50チェック結果

| 確認項目                         | 確認結果                                                        |
| -------------------------------- | --------------------------------------------------------------- |
| `runCreateWorkflow` 問題箇所     | L630〜L653: `purpose` に raw 文字列代入、LLM 呼び出しなし       |
| `ILLMClient` シグネチャ          | `complete(prompt, options?)` → `Promise<Result<string, Error>>` |
| `loadAgent` の戻り値             | `Promise<string>`（エージェント定義文字列）                     |
| 既存テストでのcreateモードテスト | SC-008 等で `mode: "create"` テストが存在（影響範囲確認済み）   |

---

## タスク分類

| 分類項目   | 値                                       |
| ---------- | ---------------------------------------- |
| タスク種別 | バックエンドサービス実装タスク           |
| UIタスク   | 非UIタスク（UIの見た目変更なし）         |
| 可視性     | NON_VISUAL（内部ロジックのみ変更）       |
| テスト種別 | ユニットテスト（SkillCreatorService 層） |

---

## 統合テスト連携目標

| 判定項目               | 基準 |
| ---------------------- | ---- |
| ユニットテストLine     | 80%+ |
| ユニットテストBranch   | 60%+ |
| ユニットテストFunction | 80%+ |
