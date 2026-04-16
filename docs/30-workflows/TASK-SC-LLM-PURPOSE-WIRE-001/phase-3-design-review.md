# Phase 3: 設計レビューゲート

## メタ情報

| 項目       | 内容                                |
| ---------- | ----------------------------------- |
| Phase      | 3                                   |
| タスクID   | TASK-SC-LLM-PURPOSE-WIRE-001        |
| 機能名     | llm-purpose-wire                    |
| 前提Phase  | Phase 2                             |
| 後続Phase  | Phase 4（PASS または MINOR の場合） |
| 作成日     | 2026-04-16                          |
| ステータス | pending                             |

## 目的

Phase 2 の設計内容を多角的にレビューし、Phase 4（テスト作成）への進行可否を判定する。
PASS / MINOR / MAJOR のいずれかを決定し、MINOR の場合は追跡テーブルに記録する。

## 実行タスク

- 設計一貫性チェック: 型・コンストラクタ・関数シグネチャが矛盾なく整合しているか
- AC 整合チェック: 設計が AC-1〜AC-6 を全て満たしているか
- 後方互換性チェック: `llmClient` 省略時に既存フローへの影響がないか
- 命名規則チェック: 既存コードの命名パターンと一致しているか
- リスクチェック: エラーハンドリング・フォールバック挙動に問題がないか
- MINOR 追跡テーブル: 指摘事項があれば記録

## 参照資料

| 資料名                      | パス                                                          | 用途               |
| --------------------------- | ------------------------------------------------------------- | ------------------ |
| Phase 1 成果物              | `outputs/phase-1/requirements-definition.md`                  | 要件・AC参照       |
| Phase 1 受け入れ基準        | `outputs/phase-1/acceptance-criteria.md`                      | AC 整合確認        |
| Phase 2 成果物              | `outputs/phase-2/design.md`                                   | 設計書参照         |
| SkillCreatorService.ts      | `apps/desktop/src/main/services/skill/SkillCreatorService.ts` | 既存実装・命名確認 |
| ILLMClient インターフェース | `packages/shared/src/services/llm/types.ts`                   | 型整合確認         |

## 実行手順

### 1. 設計一貫性チェック

| チェック項目                                                                                 | 判定基準                         | 結果    |
| -------------------------------------------------------------------------------------------- | -------------------------------- | ------- |
| `ILLMClient` が `complete(prompt, options?)` シグネチャを持ち `Result<string, Error>` を返す | 型定義と設計の整合               | pending |
| コンストラクタの `llmClient` 引数が省略可能（`llmClient?: ILLMClient`）になっている          | 後方互換の確保                   | pending |
| `runCreateWorkflow` の `loadAgent` 失敗と LLM 失敗が別々の `try/catch` で処理されている      | エラーハンドリングの分離         | pending |
| `result.success` チェックで LLM 結果の成否を判定している                                     | `Result` 型の正しい利用          | pending |
| LLM 失敗時のフォールバックが `options.description` であることが設計に明記されている          | フォールバック値の明確化         | pending |
| `structurePlan.purpose` に LLM 推論結果（`result.data`）を代入している                       | AC-2 の設計対応                  | pending |
| `llmClient` 未注入時に default client を生成する設計が明記されている                         | `llmClient` 省略ケースの設計網羅 | pending |

### 2. AC 整合チェック

| AC ID | 設計対応                                                                                                                   | 充足判定 |
| ----- | -------------------------------------------------------------------------------------------------------------------------- | -------- |
| AC-1  | `runCreateWorkflow` 内で `this.llmClient.complete(skillInput, { systemPrompt: extractPurposeAgent })` を呼び出す設計が明記 | pending  |
| AC-2  | `result.success === true` の場合に `structurePlan.purpose = result.data` とする設計が明記                                  | pending  |
| AC-3  | Phase 2 設計書に「Option A（直接呼び出し）を採用」として LLM 呼び出し方式が明記されている                                  | pending  |
| AC-4  | `loadAgent` 失敗時に `null` を返す `try/catch` 分離が設計に明記                                                            | pending  |
| AC-5  | LLM `result.success === false` および LLM 例外時に `options.description` へフォールバックする設計が明記                    | pending  |
| AC-6  | 既存テストへの影響が最小限（`llmClient` 省略時の後方互換）であることが設計に明記                                           | pending  |

### 3. 後方互換性チェック

```bash
# SkillCreatorService のコンストラクタ呼び出し元を確認（引数なし呼び出しが壊れないか）
grep -rn "new SkillCreatorService" apps/ packages/

# createSkill の呼び出し元確認
grep -rn "\.createSkill\b" apps/ packages/

# 既存テストでの SkillCreatorService インスタンス生成確認
grep -n "new SkillCreatorService" apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts
```

| チェック項目                                                       | 判定基準                                  | 結果    |
| ------------------------------------------------------------------ | ----------------------------------------- | ------- |
| `new SkillCreatorService()` の引数なし呼び出しが変更後も動作するか | コンストラクタ第3引数が省略可能であること | pending |
| `llmClient` 省略時に default client が使われるか                   | 後方互換フォールバックの設計確認          | pending |
| 既存の create モードテストが設計変更後も通過するか                 | テスト影響範囲の確認                      | pending |

### 4. 命名規則チェック

```bash
# 既存の private フィールド命名パターン確認（camelCase）
grep -n "private readonly" apps/desktop/src/main/services/skill/SkillCreatorService.ts

# 既存のメソッド命名パターン確認（camelCase）
grep -n "private async run" apps/desktop/src/main/services/skill/SkillCreatorService.ts
```

| 確認項目                         | 期待パターン                  | 結果    |
| -------------------------------- | ----------------------------- | ------- |
| フィールド名 `llmClient`         | camelCase                     | pending |
| 型名 `ILLMClient`                | PascalCase（Iプレフィックス） | pending |
| `complete()` メソッド名          | camelCase                     | pending |
| `runCreateWorkflow()` メソッド名 | camelCase                     | pending |
| `skillInput` ローカル変数名      | camelCase                     | pending |

### 5. リスクチェック

| リスク                                                                  | 評価                                                                          | 対応                         |
| ----------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ---------------------------- |
| `llmClient` 未注入のまま本番環境で呼ばれた場合に purpose の精度が下がる | default client を生成し、description フォールバックも維持する                 | 設計で吸収済み               |
| `Result<string, Error>` の `result.data` が空文字列になる可能性         | normalizePurpose と description フォールバックで吸収済み                      | 実装済み                     |
| `loadAgent` と LLM の `try/catch` 分離によりコードが複雑化する          | `try/catch` 2段構成は可読性の課題があるが、エラー区別のためには必要           | Phase 4 テスト設計で吸収     |
| コンストラクタ引数追加により既存の DI コンテナ設定が壊れる可能性        | `llmClient` は省略可能（オプショナル引数）のため既存呼び出しへの影響なし      | 設計で吸収済み               |
| `options.description` フォールバックが purpose の意味論的精度を下げる   | フォールバックは機能継続のための暫定値。精度が必要なケースは LLM 設定を必須に | フォールバック動作として許容 |

### 6. レビュー判定基準

| 判定  | 条件                                                             | 次のアクション         |
| ----- | ---------------------------------------------------------------- | ---------------------- |
| PASS  | 全チェック項目でリスクなし、AC-1〜AC-6 の設計対応が充足          | Phase 4 へ進む         |
| MINOR | 小さな指摘事項あり（実装時に並行解消可能）                       | Phase 4 へ進む（追跡） |
| MAJOR | 設計の根本的な問題（型設計の破綻・AC未充足・後方互換が管理不能） | Phase 2 へ戻る         |

**MAJOR 判定となる条件の例**:

- `ILLMClient` インターフェースが `complete()` を持たず、設計が成立しない
- `llmClient` のオプショナル設計で既存コンストラクタ呼び出しに型エラーが発生する
- AC-1〜AC-6 のいずれかを設計が構造的に満たせない

**総合判定**: （実行時に PASS / MINOR / MAJOR を記録）

### 7. MINOR 追跡テーブル

| MINOR ID         | 指摘内容 | 解決予定Phase | 解決確認Phase | 備考 |
| ---------------- | -------- | ------------- | ------------- | ---- |
| （実行時に記録） | -        | -             | -             | -    |

### 8. Phase 4 開始条件

Phase 4（テスト作成）を開始できる条件:

- [ ] 総合判定が PASS または MINOR であること
- [ ] MAJOR 判定の場合は Phase 2 へ戻り再設計を行うこと
- [ ] MINOR の指摘事項が追跡テーブルに記録されていること

## 統合テスト連携【必須】

| 判定項目               | 基準    | 結果    |
| ---------------------- | ------- | ------- |
| 型チェック（設計段階） | PASS    | pending |
| lint                   | 0 error | pending |

## 多角的チェック観点

| 観点           | チェック内容                                                                                         |
| -------------- | ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| 型設計妥当性   | `ILLMClient                                                                                          | null` の設計がコンストラクタ・`runCreateWorkflow` 内で一貫しているか |
| 最小変更原則   | 設計変更が本タスクのスコープ（purpose フィールドへの LLM 結果格納）に限定されているか                |
| テスト設計適合 | Phase 4 でテストを書きやすい設計になっているか（モック注入のしやすさ）                               |
| 依存タスク整合 | `TASK-SC-PLAN-CONNECT-GENERATE-SKILL-MD-001` が期待する `purpose` フィールドの型・意味論と一致するか |

## 成果物

| 成果物           | パス                               | 説明                            |
| ---------------- | ---------------------------------- | ------------------------------- |
| 設計レビュー結果 | `outputs/phase-3/gate-decision.md` | PASS/MINOR/MAJOR 判定・指摘事項 |

## 完了条件

- [ ] 設計一貫性チェック（7項目）が完了
- [ ] AC-1〜AC-6 の設計対応が確認済み
- [ ] 後方互換性チェック（影響範囲確認）が完了
- [ ] 命名規則チェック（5項目）が完了
- [ ] リスクチェック（5項目）が完了
- [ ] 総合判定（PASS/MINOR/MAJOR）が記録されている
- [ ] MINOR 判定の指摘事項があれば追跡テーブルに記録済み
- [ ] Phase 4 開始条件（PASS or MINOR）が充足されている
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 設計一貫性チェック（7項目）
2. AC 整合チェック（AC-1〜AC-6）
3. 後方互換性チェック（grep による影響範囲確認）
4. 命名規則チェック（5項目）
5. リスクチェック（5項目）
6. 総合判定記録
7. MINOR 追跡テーブル記録（該当時）
8. 成果物の出力

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次Phase

Phase 4: テスト作成（PASS または MINOR の場合）
Phase 2: 設計（MAJOR の場合）
