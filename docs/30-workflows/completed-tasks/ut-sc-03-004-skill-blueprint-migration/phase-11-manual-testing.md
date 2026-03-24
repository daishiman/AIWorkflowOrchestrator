# Phase 11: 手動テスト - タスク仕様書

## メタ情報

| 項目     | 値                                     |
| -------- | -------------------------------------- |
| Phase    | 11                                     |
| 機能名   | ut-sc-03-004-skill-blueprint-migration |
| タスクID | UT-SC-03-004                           |
| 作成日   | 2026-03-24                             |
| 更新日   | 2026-03-24                             |

---

## 目的

plan() の出力型 RuntimeSkillCreatorPlanResult が SkillBlueprint 互換に正しく移行されたことを、型互換性・LLM レスポンス・IPC 経由の 3 観点で手動検証する。本タスクはバックエンドの型変更および LLM プロンプト変更が主であり、UI 変更を伴わないため、手動テストは型互換性確認・LLM レスポンス確認・IPC 呼び出し確認に限定する。

## 背景

UT-SC-03-004 はバックエンド中心の型変更タスクであり、Renderer 側の UI 変更は含まない。CLI 環境でのスクリーンショット取得は不要（P53 参照）。自動テスト結果を間接的な検証証跡として記録する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク 1: 型互換性の手動確認

**目的**: TypeScript コンパイラレベルで SkillBlueprint 型と RuntimeSkillCreatorPlanResult 型の構造的互換性が成立していることを検証する。

**実行手順**:

1. `packages/shared/src/types/skillCreator.ts` を開き、`RuntimeSkillCreatorPlanResult extends SkillBlueprint` の継承構造を目視確認する
2. 以下の型互換性テストコードを一時ファイル（またはテストファイル内）で検証する:
   ```typescript
   // SkillBlueprint 型の変数に RuntimeSkillCreatorPlanResult 型の値を代入できることを確認
   const planResult: RuntimeSkillCreatorPlanResult = {
     planId: "test-plan-001",
     skillName: "test-skill",
     description: "test description",
     category: "simple",
     customizations: {},
     files: [],
     reasoning: "test reasoning",
     skillSpec: "test spec",
     estimatedSteps: 3,
     agents: [],
     scripts: [],
     triggers: [],
     anchors: [],
   };
   const blueprint: SkillBlueprint = planResult; // 型エラーなしでコンパイル可能であること
   ```
3. `pnpm --filter @repo/shared typecheck` を実行し、型エラーが 0 件であることを確認する
4. `pnpm --filter @repo/desktop typecheck` を実行し、RuntimeSkillCreatorFacade.ts の型エラーが 0 件であることを確認する

**判定基準**:

- PASS: 両方の typecheck がエラー 0 件で完了する
- FAIL: いずれかの typecheck でエラーが発生する

**期待される成果物**:

- `outputs/phase-11/type-compatibility-verification.md`（typecheck 実行結果ログ）

---

### タスク 2: LLM レスポンススキーマの手動テスト

**目的**: LLM が新フィールド（category, files, reasoning）を返却すること、および旧形式で返した場合の Graceful degradation を確認する。

**前提条件**: API キーが利用可能な場合のみ実行する。API キーが利用不可の場合はスキップし、自動テスト結果を証跡として記録する。

**実行手順**:

1. **PLAN_RESPONSE_SCHEMA_INSTRUCTION の確認**
   - `apps/desktop/src/main/services/runtime/planPromptConstants.ts` を開く
   - JSON スキーマ定義に `category`, `files`, `reasoning` フィールドが含まれていることを確認する
   - `category` の値セット（`simple`, `standard`, `complex`, `automation`, `integration`）が正本と一致していることを確認する

2. **parsePlanResponse() のフォールバック確認**（コードレビュー）
   - `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` の `parsePlanResponse()` を確認する
   - LLM が `category` を返さない場合に `"standard"` がデフォルト適用されることを確認する
   - LLM が `files` を返さない場合に `[]`（空配列）がデフォルト適用されることを確認する
   - LLM が `reasoning` を返さない場合に `""` がデフォルト適用されることを確認する

3. **isValidPlanResponse() の拡張確認**（コードレビュー）
   - バリデーションロジックが新フィールドの型チェックを含んでいることを確認する
   - 新フィールドがオプショナル扱い（存在しなくてもバリデーション PASS）であることを確認する

4. **LLM 実呼び出しテスト**（API キー利用可能時のみ）
   - plan() を実際に呼び出し、レスポンスに `category`, `files`, `reasoning` が含まれるか確認する
   - レスポンスの `category` 値が SkillCategory の 5 値のいずれかであることを確認する

**判定基準**:

- PASS: コードレビューで Graceful degradation が確認でき、LLM 実呼び出し（実行した場合）で新フィールドが返却される
- CONDITIONAL PASS: API キー不可でスキップした場合、コードレビューと自動テスト結果で代替検証
- FAIL: parsePlanResponse() にフォールバックが実装されていない

**期待される成果物**:

- `outputs/phase-11/llm-response-schema-verification.md`（コードレビュー結果 + LLM 呼び出し結果）

---

### タスク 3: Renderer からの IPC 呼び出し確認

**目的**: skill-creator:plan IPC チャネル経由で plan() を呼び出し、レスポンスに新フィールドが含まれることを確認する。

**前提条件**: Electron アプリ起動が可能な場合のみ実行する。起動不可の場合はスキップし、自動テスト結果を証跡として記録する。

**実行手順**:

1. Electron アプリを開発モードで起動する:
   ```bash
   pnpm --filter @repo/desktop dev
   ```
2. DevTools コンソールを開く（`Cmd + Option + I`）
3. skill-creator:plan IPC チャネル経由で plan() を呼び出す:
   ```javascript
   const result = await window.electronAPI.skillCreator.plan({
     prompt: "簡単な天気予報を取得するスキルを作成して",
   });
   console.log("result:", result);
   ```
4. レスポンスの検証:
   - `result.data.category` が存在し、SkillCategory の 5 値のいずれかであることを確認する
   - `result.data.files` が存在し、配列であることを確認する
   - `result.data.reasoning` が存在し、文字列であることを確認する
   - 既存フィールド（`result.data.planId`, `result.data.skillName`, `result.data.description`）が引き続き存在することを確認する

**判定基準**:

- PASS: IPC レスポンスに新フィールドが含まれ、既存フィールドも保持されている
- CONDITIONAL PASS: Electron 起動不可でスキップした場合、自動テスト結果で代替検証
- FAIL: IPC レスポンスに新フィールドが欠落している、または既存フィールドが破壊されている

**期待される成果物**:

- `outputs/phase-11/ipc-response-verification.md`（IPC 呼び出し結果 or スキップ理由）

---

### タスク 4: 手動テスト結果レポート作成

**目的**: タスク 1-3 の結果を統合し、手動テスト結果レポートを作成する。

**実行手順**:

1. タスク 1-3 の各判定結果を集約する
2. 発見された問題を以下のカテゴリで分類する:
   - **Blocker**: Phase 12 に進む前に修正が必要な問題
   - **Note**: Phase 12 の未タスク検出で記録すべき改善点
   - **Info**: 参考情報（修正不要）
3. 全体判定を記録する:
   - 全タスク PASS → Phase 12 へ進行
   - Blocker あり → 該当 Phase へ差し戻し

**期待される成果物**:

- `outputs/phase-11/manual-test-report.md`（手動テスト結果サマリー）

---

## 参照資料

| 参照資料                     | パス                                                                  | 内容                           |
| ---------------------------- | --------------------------------------------------------------------- | ------------------------------ |
| Phase 10 成果物              | `outputs/phase-10/`                                                   | 最終レビュー判定結果           |
| 正本 index.md                | `docs/30-workflows/skill-creator-llm-integration/index.md`            | SkillBlueprint 正本定義        |
| skillCreator.ts              | `packages/shared/src/types/skillCreator.ts`                           | 型定義ファイル                 |
| RuntimeSkillCreatorFacade.ts | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | plan() 実装ファイル            |
| planPromptConstants.ts       | `apps/desktop/src/main/services/runtime/planPromptConstants.ts`       | LLM プロンプト定数             |
| P53                          | `.claude/rules/06-known-pitfalls.md`                                  | CLI 環境スクリーンショット制約 |

---

## 成果物

| 成果物                 | パス                                                   | 内容                                  |
| ---------------------- | ------------------------------------------------------ | ------------------------------------- |
| 型互換性検証結果       | `outputs/phase-11/type-compatibility-verification.md`  | typecheck 実行結果ログ                |
| LLM レスポンス検証結果 | `outputs/phase-11/llm-response-schema-verification.md` | コードレビュー結果 + LLM 呼び出し結果 |
| IPC レスポンス検証結果 | `outputs/phase-11/ipc-response-verification.md`        | IPC 呼び出し結果 or スキップ理由      |
| 手動テスト結果レポート | `outputs/phase-11/manual-test-report.md`               | 手動テスト全体のサマリー              |

---

## 統合テスト連携

| 連携先     | 連携内容                                                             |
| ---------- | -------------------------------------------------------------------- |
| Phase 10   | 最終レビュー結果（PASS/MINOR）を前提とする                           |
| Phase 12   | 発見された Note は Phase 12 Task 4 の未タスク検出で処理する          |
| 自動テスト | Phase 4-7 の自動テスト結果を間接的な視覚検証の代替証跡として使用する |

---

## 多角的チェック観点

| #   | 観点                 | 確認内容                                                       |
| --- | -------------------- | -------------------------------------------------------------- |
| 1   | 型安全性             | SkillBlueprint と RuntimeSkillCreatorPlanResult の構造的互換性 |
| 2   | 後方互換性           | 既存フィールドが破壊されていないこと                           |
| 3   | Graceful degradation | LLM 旧形式レスポンスでデフォルト値が適用されること             |
| 4   | IPC 契約整合性       | skill-creator:plan チャネルのレスポンス型が更新されていること  |
| 5   | P53 準拠             | CLI 環境でスクリーンショット取得を要求していないこと           |

---

## 完了条件

- [ ] タスク 1: 型互換性テストで `pnpm typecheck` がエラー 0 件で PASS している
- [ ] タスク 2: parsePlanResponse() の Graceful degradation がコードレビューで確認されている
- [ ] タスク 2: isValidPlanResponse() が新フィールドのオプショナルバリデーションを含んでいる
- [ ] タスク 3: IPC 呼び出し確認が完了している（実行 or スキップ理由記録済み）
- [ ] タスク 4: 手動テスト結果レポートが作成されている
- [ ] Blocker が 0 件である（0 件でない場合は該当 Phase へ差し戻し）
- [ ] 全成果物が `outputs/phase-11/` に生成されている

---

## サブタスク管理

1. タスク 1: 型互換性の手動確認
2. タスク 2: LLM レスポンススキーマの手動テスト
3. タスク 3: Renderer からの IPC 呼び出し確認
4. タスク 4: 手動テスト結果レポート作成

---

## タスク 100% 実行確認チェックリスト

- [ ] 本 Phase 内の全タスク（1-4）を 100% 実行完了
- [ ] 各タスクを 100% 完了し、完了を明記
- [ ] 成果物が全て `outputs/phase-11/` に生成されていることを確認

---

## 次の Phase

完了後、以下のファイルを実行してください:

`docs/30-workflows/ut-sc-03-004-skill-blueprint-migration/phase-12-documentation.md`
