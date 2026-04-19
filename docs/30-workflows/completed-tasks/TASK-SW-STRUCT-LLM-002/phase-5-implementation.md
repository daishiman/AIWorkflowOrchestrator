# Phase 5: 実装

## メタ情報

| 項目       | 内容                                  |
| ---------- | ------------------------------------- |
| Phase      | 5                                     |
| タスクID   | TASK-SW-STRUCT-LLM-002                |
| 機能名     | skill-creator-features-llm-generation |
| 前提Phase  | Phase 4                               |
| 後続Phase  | Phase 6                               |
| 作成日     | 2026-04-18                            |
| ステータス | not_started                           |

## 目的

TDD の Green フェーズとして、`runCreateWorkflow()` の `features: []` ハードコードを
LLM 自動生成に置き換え、Phase 4 で作成したテストを全 PASS させる最小実装を行う。

## 実行タスク

- 既存テスト回帰確認（実装前 baseline 確認）
- `runCreateWorkflow()` の `features` フィールドを LLM 呼び出しに変更
- `loadAgent("plan-structure")` でエージェント定義を読み込む処理を追加
- `llmService.generate()` 経由で features プロンプトを送信する処理を追加
- 生成結果を `string[]` にパースする処理を追加
- try-catch でエラー時は `features: []` にフォールバックする処理を追加
- Green 確認: Phase 4 で作成したテストが全 PASS することを確認
- 型チェック・lint 確認

## 参照資料

| 資料名                      | パス                                                                                  | 用途               |
| --------------------------- | ------------------------------------------------------------------------------------- | ------------------ |
| Phase 4 テスト仕様書        | `phase-4-test-creation.md`                                                            | テストケース参照   |
| Phase 2 設計書              | `outputs/phase-2/design.md`                                                           | 実装設計参照       |
| SkillCreatorService.ts      | `apps/desktop/src/main/services/skill/SkillCreatorService.ts`                         | 修正対象ファイル   |
| テストファイル              | `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.features.test.ts` | Green 確認対象     |
| plan-structure エージェント | `apps/desktop/src/main/agents/plan-structure/`                                        | loadAgent 対象確認 |

## 実行手順

### 0. 既存テスト回帰確認（baseline 確認）【必須】

```bash
# 変更前の既存テストを実行して baseline 確認
pnpm --filter @repo/desktop exec vitest run src/main/services/skill/__tests__/
# 期待: 全 PASS（変更前の状態）

# Phase 4 テストが FAIL していることを確認（Red 状態）
pnpm --filter @repo/desktop exec vitest run src/main/services/skill/__tests__/SkillCreatorService.features.test.ts
# 期待: FAIL（features: [] のハードコードのため）
```

### 1. `runCreateWorkflow()` の features フィールドを LLM 呼び出しに変更

`apps/desktop/src/main/services/skill/SkillCreatorService.ts` の `runCreateWorkflow()` メソッド（line 937 付近）を変更する:

```typescript
// 変更前（line 946 付近）
private async runCreateWorkflow(options) {
  const structurePlan: StructurePlanJson = {
    purpose: options.description,
    features: [], // AC-3: LLM統合は別タスク
    agents: ["extract-purpose", "plan-structure"],
  };
}

// 変更後
private async runCreateWorkflow(options) {
  // features を LLM で生成する
  let features: string[] = [];
  try {
    const agent = await this.loadAgent("plan-structure");
    const featuresPrompt = this.buildFeaturesPrompt(options.description, agent);
    const generated = await this.llmService.generate(featuresPrompt);
    features = this.parseFeaturesResponse(generated);
  } catch (error) {
    // AC-3: LLM 失敗時は空配列でフォールバック
    this.logger.warn("features 生成に失敗しました。空配列でフォールバックします。", error);
    features = [];
  }

  const structurePlan: StructurePlanJson = {
    purpose: options.description,
    features,
    agents: ["extract-purpose", "plan-structure"],
  };
}
```

### 2. features プロンプトビルダーの追加

`SkillCreatorService.ts` にプライベートメソッドを追加する:

```typescript
/**
 * features 生成用のプロンプトを構築する
 */
private buildFeaturesPrompt(description: string, agentDef: AgentDefinition): string {
  return `${agentDef.systemPrompt}

以下のスキルの説明に基づいて、このスキルが持つべき主要な機能（features）を
JSON 配列形式で出力してください。
配列の各要素は kebab-case の文字列とし、3〜8 個程度で記述してください。

スキルの説明:
${description}

出力形式（JSON 配列のみ、他の説明不要）:
["feature-1", "feature-2", "feature-3"]`;
}

/**
 * LLM のレスポンスから features 配列をパースする
 */
private parseFeaturesResponse(response: string): string[] {
  // JSON 配列部分を抽出してパース
  const match = response.match(/\[[\s\S]*?\]/);
  if (!match) {
    throw new Error("LLM レスポンスから features 配列を抽出できませんでした");
  }
  const parsed = JSON.parse(match[0]);
  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error("LLM レスポンスが有効な配列ではありませんでした");
  }
  return parsed.filter((item): item is string => typeof item === "string");
}
```

### 3. Green 確認コマンド

```bash
# Phase 4 テストが PASS することを確認（Green 状態）
pnpm --filter @repo/desktop exec vitest run src/main/services/skill/__tests__/SkillCreatorService.features.test.ts
# 期待: PASS（全 TC-01〜TC-07）

# 既存テストが引き続き PASS することを確認
pnpm --filter @repo/desktop exec vitest run src/main/services/skill/__tests__/
# 期待: PASS（回帰なし）
```

### 4. 型チェック・lint 確認

```bash
# TypeScript 型チェック
pnpm --filter @repo/desktop typecheck
# 期待: 0 error

# ESLint
pnpm --filter @repo/desktop lint
# 期待: 0 error
```

## 統合テスト連携【必須】

features 生成実装の統合検証。

| 判定項目           | 基準                             | 結果    |
| ------------------ | -------------------------------- | ------- |
| Green 確認         | Phase 4 テストが全 PASS すること | pending |
| 既存テスト回帰なし | 既存テストへの影響がないこと     | pending |
| 型チェック         | `pnpm typecheck` が 0 error      | pending |
| フォールバック確認 | LLM 失敗時に空配列で継続すること | pending |

## 多角的チェック観点（AIが判断）

| 観点                | チェック内容                                                                    |
| ------------------- | ------------------------------------------------------------------------------- |
| 最小実装            | Green 達成に必要な最小差分のみを変更しているか                                  |
| try-catch スコープ  | フォールバック対象のエラーが適切なスコープで捕捉されているか                    |
| プロンプト品質      | `buildFeaturesPrompt` が有用な features を生成するのに十分な指示を含んでいるか  |
| パース堅牢性        | `parseFeaturesResponse` が不正なレスポンスでも安全に処理するか                  |
| 既存 API との整合性 | `loadAgent` および `llmService.generate` の呼び出し形式が既存コードと一致するか |

## サブタスク管理

1. 既存テスト回帰確認（baseline・Red 状態確認）
2. `runCreateWorkflow()` の features フィールド変更
3. `buildFeaturesPrompt()` プライベートメソッド追加
4. `parseFeaturesResponse()` プライベートメソッド追加
5. Green 確認（Phase 4 テスト PASS）
6. 既存テスト回帰確認（PASS）
7. 型チェック・lint 確認

## 成果物

| 成果物       | パス                                                          | 説明                  |
| ------------ | ------------------------------------------------------------- | --------------------- |
| 実装ファイル | `apps/desktop/src/main/services/skill/SkillCreatorService.ts` | features LLM 生成実装 |

## 完了条件

- [ ] 既存テスト回帰確認（baseline）が完了
- [ ] `runCreateWorkflow()` の `features: []` が LLM 呼び出しに変更済み
- [ ] `buildFeaturesPrompt()` メソッドが追加済み
- [ ] `parseFeaturesResponse()` メソッドが追加済み
- [ ] try-catch によるフォールバック処理が実装済み
- [ ] Phase 4 テスト（TC-01〜TC-07）が全 PASS している（Green）
- [ ] 既存テストが回帰なしで PASS している
- [ ] `pnpm typecheck` が 0 error
- [ ] `pnpm lint` が 0 error
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-SW-STRUCT-LLM-002
```

## 次Phase

Phase 6: テスト拡充
