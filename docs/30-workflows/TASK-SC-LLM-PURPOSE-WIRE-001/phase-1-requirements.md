# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| Phase      | 1                            |
| タスクID   | TASK-SC-LLM-PURPOSE-WIRE-001 |
| 機能名     | llm-purpose-wire             |
| 前提Phase  | -                            |
| 後続Phase  | Phase 2                      |
| 作成日     | 2026-04-16                   |
| ステータス | pending                      |

## 目的

`runCreateWorkflow` 内で `loadAgent("extract-purpose")` を呼び出してエージェント定義文字列を取得しているが、
LLM に推論を依頼して purpose を抽出するステップが未実装である。
現状では `StructurePlanJson.purpose` にエージェント定義の raw 文字列がそのまま格納されており、
LLM の推論結果が反映されていない。

本タスクでは `extract-purpose` エージェント定義を LLM に渡し、
その推論結果を `StructurePlanJson.purpose` に格納する処理を実装する。
合わせて失敗時のエラーハンドリングとユニットテストを整備する。

## 実行タスク

- [ ] P50チェック: `SkillCreatorService.ts` の `runCreateWorkflow` の現状確認・問題箇所特定
- [ ] `ILLMClient` インターフェース（`packages/shared/src/services/llm/types.ts`）の確認
- [ ] LLM 呼び出し方式（直接呼び出し vs エージェント経由）の選択肢整理
- [ ] エラーハンドリング要件（loadAgent 失敗 / LLM 呼び出し失敗）の定義
- [ ] 受け入れ基準 AC-1〜AC-6 を検証可能な形で固定
- [ ] タスク分類宣言: 本タスクは **バックエンドサービス実装タスク / NON_VISUAL**（内部ロジック中心）

## 参照資料

| 資料名                      | パス                                                                         | 用途                           |
| --------------------------- | ---------------------------------------------------------------------------- | ------------------------------ |
| SkillCreatorService.ts      | `apps/desktop/src/main/services/skill/SkillCreatorService.ts`                | 対象実装ファイル・問題箇所確認 |
| ILLMClient インターフェース | `packages/shared/src/services/llm/types.ts`                                  | LLM 呼び出し API 確認          |
| SkillCreatorService.test.ts | `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts` | 既存テスト構造確認             |
| GitHub Issue #2181          | [#2181](https://github.com/daishiman/AIWorkflowOrchestrator/issues/2181)     | 要件原本・設計オプション参照   |
| 依存タスク仕様書            | `docs/30-workflows/TASK-SC-PLAN-CONNECT-GENERATE-SKILL-MD-001/`              | 後続接続タスクとの整合確認     |

## 実行手順

### 0. P50チェック: 既実装状態の調査（必須）

```bash
# runCreateWorkflow の現状確認
grep -n -A 30 "runCreateWorkflow" apps/desktop/src/main/services/skill/SkillCreatorService.ts

# purpose フィールドへの代入箇所確認
grep -n "purpose" apps/desktop/src/main/services/skill/SkillCreatorService.ts

# ILLMClient インターフェースの確認
cat packages/shared/src/services/llm/types.ts

# ResourceLoader.loadAgent の実装確認
grep -n -A 20 "loadAgent" apps/desktop/src/main/services/skill/ResourceLoader.ts

# 既存テストでの runCreateWorkflow / create モードのテスト確認
grep -n "create\|runCreateWorkflow\|purpose" apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts
```

### 1. 問題箇所の整理

現行の `runCreateWorkflow`（`SkillCreatorService.ts` L630〜L653）の問題:

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

**問題点**:

| 問題                  | 詳細                                                                                      |
| --------------------- | ----------------------------------------------------------------------------------------- |
| purpose が raw 文字列 | `purpose` フィールドにエージェント定義の文字列がそのまま格納されており LLM 推論結果でない |
| LLM 呼び出し未実装    | `extractPurposeAgent` を LLM に渡して purpose を推論するステップが存在しない              |
| エラーハンドリング    | 現状は `try/catch` で null を返すのみで、LLM 失敗と loadAgent 失敗を区別できていない      |

### 2. 受け入れ基準の固定

| ID   | 受け入れ基準                                                                                     | 検証方法                                                                            |
| ---- | ------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| AC-1 | `runCreateWorkflow` 内で `extract-purpose` エージェント定義を LLM に渡す処理が実装されていること | コードレビュー・`grep -n "llmClient\|complete\|generate" SkillCreatorService.ts`    |
| AC-2 | `StructurePlanJson.purpose` に LLM の推論結果が格納されていること（raw 文字列ではないこと）      | ユニットテストで LLM モックの戻り値が purpose に反映されることを検証                |
| AC-3 | LLM 呼び出し方式（直接呼び出し vs エージェント経由）が設計ドキュメントに明記されていること       | Phase 2 設計書の確認                                                                |
| AC-4 | `loadAgent` 失敗時のエラーハンドリングが実装されていること                                       | テスト: `loadAgent` が throw した場合のフォールバック動作を検証                     |
| AC-5 | LLM 呼び出し失敗時のエラーハンドリングが実装されていること                                       | テスト: LLM モックがエラーを返した場合のフォールバック動作を検証                    |
| AC-6 | 既存テストが全て PASS すること                                                                   | `pnpm --filter @repo/desktop exec vitest run __tests__/SkillCreatorService.test.ts` |

### 3. タスク分類の宣言

| 分類項目   | 値                                             |
| ---------- | ---------------------------------------------- |
| タスク種別 | バックエンドサービス実装タスク                 |
| UIタスク   | 非UIタスク（UIの見た目変更なし）               |
| 可視性     | NON_VISUAL（動作は同一、内部ロジックのみ変更） |
| テスト種別 | ユニットテスト（SkillCreatorService 層）       |

## 統合テスト連携【必須】

| 判定項目               | 基準 | 結果    |
| ---------------------- | ---- | ------- |
| ユニットテストLine     | 80%+ | pending |
| ユニットテストBranch   | 60%+ | pending |
| ユニットテストFunction | 80%+ | pending |

## 多角的チェック観点

| 観点               | チェック内容                                                                              |
| ------------------ | ----------------------------------------------------------------------------------------- | --------------------------- |
| 後方互換性         | `runCreateWorkflow` の戻り値（`StructurePlanJson                                          | null`）の契約が維持されるか |
| 依存タスク整合     | `TASK-SC-PLAN-CONNECT-GENERATE-SKILL-MD-001`（後続タスク）との purpose フィールド整合確認 |
| エラーハンドリング | loadAgent 失敗と LLM 失敗の2種類のエラーパスが設計で区別されているか                      |
| テスト網羅性       | purpose が LLM 推論結果であることをモックで検証できるか                                   |

## 成果物

| 成果物       | パス                                         | 説明                         |
| ------------ | -------------------------------------------- | ---------------------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | 機能要件・非機能要件・AC一覧 |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | 検証可能なAC一覧             |

## 完了条件

- [ ] P50チェック実施済み（`runCreateWorkflow` の問題箇所を確認）
- [ ] `ILLMClient` インターフェースの `complete()` シグネチャを確認済み
- [ ] 問題点（3点）を整理済み
- [ ] AC-1〜AC-6 が検証可能な形で定義されている
- [ ] タスク分類（バックエンドサービス実装 / 非UIタスク / NON_VISUAL）を宣言済み
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. P50チェック（`runCreateWorkflow` 現状確認・問題箇所特定）
2. `ILLMClient` インターフェース確認
3. 問題点の整理
4. LLM 呼び出し方式の選択肢整理
5. 受け入れ基準（AC-1〜AC-6）の固定
6. タスク分類の宣言
7. 成果物の出力

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次Phase

Phase 2: 設計
