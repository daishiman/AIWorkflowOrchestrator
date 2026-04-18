# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| Phase      | 1                            |
| Phase名    | 要件定義                     |
| 前提Phase  | なし                         |
| 後続Phase  | Phase 2                      |
| ステータス | 未実施                       |
| 作成日     | 2026-04-18                   |
| タスクID   | TASK-SC-LLM-PURPOSE-WIRE-001 |

---

## 目的

`SkillCreatorService.ts` の `runCreateWorkflow` における `purpose` フィールド処理の現状を分析し、
LLM 実結果への差し替えに必要な要件・制約・受入条件を確定する。

## 背景

現状の `runCreateWorkflow()` は `loadAgent("extract-purpose")` でエージェント定義ファイルを読み込むが、
その内容を LLM に渡すステップが未実装のため `structurePlan.purpose` にエージェント定義の raw 文字列
（または `options.description` の単純コピー）が格納されている。

本 Phase では実装着手前に要件と境界を明確化し、後続 Phase の設計・実装ブレを防ぐ。

---

## 実行タスク

### タスク1: 現状コード確認

**目的**: `runCreateWorkflow` の purpose 処理フローを把握し、変更箇所と影響範囲を特定する。

**実行手順**:

1. `apps/desktop/src/main/services/skill/SkillCreatorService.ts` の `runCreateWorkflow` メソッドを精読する
2. 現在 `structurePlan.purpose` にどの値が格納されているかを確認する（`options.description` の直接代入）
3. `this.resourceLoader.loadAgent` の呼び出し箇所を確認し、戻り値が利用されていないことを確認する
4. `llmClient` フィールドの有無を確認する（現状: 未定義）
5. `StructurePlanJson` 型定義の `purpose` フィールド型（`string`）を確認する

**期待される成果物**:

- 現状の purpose 処理フロー記述（コメント付き疑似コード）
- 変更が必要な行番号・メソッド名リスト
- `llmClient` 未実装の確認結果

---

### タスク2: extract-purpose エージェント定義ファイル確認

**目的**: LLM に渡す system prompt の内容と、LLM が返すべき出力フォーマットを把握する。

**実行手順**:

1. `.claude/skills/skill-creator/agents/extract-purpose.md` を精読する
2. エージェントが要求する入力形式（要求分析書: スキル名・説明文）を確認する
3. エージェントが出力すべき JSON スキーマを確認する（`skillName`, `summary`, `goals` フィールド）
4. `schemas/purpose.json` の制約（文字数・パターン）を把握する
5. `StructurePlanJson.purpose` に格納すべき値がスキーマ出力のどのフィールドに対応するかを判断する
   - 候補: `summary` フィールド（1-2文、10-200文字）または `goals` の連結文字列

**期待される成果物**:

- extract-purpose エージェントの入力・出力仕様サマリー
- `structurePlan.purpose` に格納すべき値の特定（`summary` フィールドが対応）
- 期待出力フォーマットの明確化

---

### タスク3: 受入条件の策定

**目的**: AC-1〜AC-7 の受入条件を実装可能な粒度で確定する。

**実行手順**:

1. タスク概要の AC-1〜AC-7 を確認する
2. 各 AC について「実装で何をすべきか」「テストで何を検証すべきか」を対応付ける
3. AC-5（エージェント定義ファイルの出力フォーマット明確化）については Phase 2 設計書への記載で充足することを確認する
4. AC-4（既存パターンとの整合）については `llmClient` インターフェースの追加方針を検討する

**受入条件詳細**:

| ID   | 条件                                                                                           | 検証方法                        |
| ---- | ---------------------------------------------------------------------------------------------- | ------------------------------- |
| AC-1 | `loadAgent("extract-purpose")` の戻り値が `llmClient.generate` の `system` に渡される          | ユニットテストのモック引数検証  |
| AC-2 | `llmClient.generate({ system: purposeAgentDef, user: skillInput })` 相当の呼び出しが実装される | ユニットテストのモック引数検証  |
| AC-3 | `structurePlan.purpose` に LLM 生成結果（文字列）が格納される                                  | ユニットテストの戻り値検証      |
| AC-4 | 既存 LLM 呼び出しパターンと整合する（`llmClient` フィールド追加、コンストラクタ注入）          | コードレビュー・型チェック      |
| AC-5 | extract-purpose エージェントの期待出力フォーマットが Phase 2 設計書に明文化される              | 設計書レビュー                  |
| AC-6 | `pnpm --filter @repo/desktop test` で既存テストが全てパスする                                  | CI テスト実行                   |
| AC-7 | `SkillCreatorService.purpose.test.ts` が作成され LLM モックで purpose 抽出を検証できる         | テストファイル存在 + テスト実行 |

**期待される成果物**:

- 受入条件詳細表（上記）
- 各 AC の検証方法の確定

---

### タスク4: 命名規則の確認

**目的**: 既存コードの命名規則に従い、追加する変数・メソッド・型の名前を決定する。

**実行手順**:

1. `SkillCreatorService.ts` の既存フィールド・メソッド命名（camelCase）を確認する
2. `llmClient` というフィールド名が他のサービスで使われているか確認する
3. `generate` メソッドの引数型名（インターフェース名）の命名候補を決定する
   - 候補: `LlmGenerateOptions` / `GenerateOptions` / `LLMGenerateOptions`
4. purpose 抽出専用メソッドの名前を決定する
   - 候補: `extractPurpose` / `generatePurpose` / `resolvePurpose`

**命名決定表**:

| 対象                       | 決定名                                | 理由                            |
| -------------------------- | ------------------------------------- | ------------------------------- |
| LLM クライアントフィールド | `llmClient`                           | 既存コメントに記載済みの名称    |
| LLM 呼び出しメソッド引数型 | `LlmGenerateOptions`                  | TypeScript 慣習（Llm は頭字語） |
| purpose 抽出専用メソッド   | `extractPurposeWithLlm`               | 既存の `extract-purpose` に対応 |
| テストファイル名           | `SkillCreatorService.purpose.test.ts` | 既存命名パターンに準拠          |

**期待される成果物**:

- 命名決定表（上記）

---

### タスク5: 前提タスク（TASK-SC-PLAN-CONNECT-GENERATE-SKILL-MD-001）の完了確認

**目的**: 依存タスクが完了済みであることを確認し、本タスクの着手可否を判定する。

**実行手順**:

1. `docs/30-workflows/` 配下で `TASK-SC-PLAN-CONNECT-GENERATE-SKILL-MD-001` の仕様書を探す
2. 仕様書のステータスが「完了」または相当状態であることを確認する
3. `generateSkillMd` メソッドが実装済みであることを `SkillCreatorService.ts` で確認する
4. 依存タスクが未完了の場合、本タスクを保留にする判断基準を明確化する

**完了確認チェックリスト**:

- [ ] TASK-SC-PLAN-CONNECT-GENERATE-SKILL-MD-001 のステータス確認
- [ ] `generateSkillMd` メソッドの実装確認
- [ ] `StructurePlanJson` 型定義の確認
- [ ] `structurePlan.purpose` が `generateSkillMd` で使用されていることの確認

**期待される成果物**:

- 前提タスク完了確認結果
- 着手判定（GO / NO-GO）

---

### タスク6: 統合テスト連携 — 接続要件の明記

**目的**: LLM API / `llmClient` インターフェースの接続要件を要件書に明記し、統合テスト計画の基礎とする。

**実行手順**:

1. `llmClient` が満たすべきインターフェース契約を定義する
   - `generate(options: { system: string; user: string }): Promise<string>` 相当
2. テスト環境でのモック差し替え可能性を確認する（`vi.mock` でのモック化）
3. 統合テストシナリオの入力・出力の境界を定義する
   - 入力: `skillInput`（スキル名 + 説明文の文字列）
   - 出力: `purpose` 文字列（LLM 生成の自然言語目的文）
4. 実際の LLM 接続が不要な状態でテストできることを要件として明記する

**接続要件定義**:

| 要件             | 内容                                                                   |
| ---------------- | ---------------------------------------------------------------------- |
| インターフェース | `generate(options: { system: string; user: string }): Promise<string>` |
| モック可能性     | コンストラクタ注入により `vi.mock` で差し替え可能                      |
| エラーモデル     | `generate` が throw した場合、`runCreateWorkflow` は `null` を返す     |
| タイムアウト     | `generate` の timeout は `llmClient` 実装に委譲（本タスクでは未規定）  |

**期待される成果物**:

- `llmClient` インターフェース仕様
- 統合テスト接続要件リスト

---

## 参照資料

| 参照資料                         | パス                                                                                  | 内容                     |
| -------------------------------- | ------------------------------------------------------------------------------------- | ------------------------ |
| SkillCreatorService              | apps/desktop/src/main/services/skill/SkillCreatorService.ts                           | 実装対象                 |
| ResourceLoader                   | apps/desktop/src/main/services/skill/ResourceLoader.ts                                | loadAgent メソッド提供元 |
| extract-purpose エージェント定義 | .claude/skills/skill-creator/agents/extract-purpose.md                                | system prompt の内容     |
| タスクインデックス               | docs/30-workflows/TASK-SC-LLM-PURPOSE-WIRE-001/index.md                               | タスク概要・受入条件     |
| STRUCT-001 テスト（参考）        | apps/desktop/src/main/services/skill/**tests**/SkillCreatorService.struct-001.test.ts | 既存テストパターン参照   |

---

## 成果物

| 成果物                     | パス                                                                   | 内容                           |
| -------------------------- | ---------------------------------------------------------------------- | ------------------------------ |
| Phase 1 要件定義書（本書） | docs/30-workflows/TASK-SC-LLM-PURPOSE-WIRE-001/phase-1-requirements.md | 要件・受入条件・命名規則の確定 |

---

## 統合テスト連携

**Phase 1 アクション**: 接続要件（LLM API / `llmClient` インターフェース）を要件に明記する。

- `llmClient.generate` の入出力契約を定義し、統合テストの境界として確立する
- テスト環境でモック差し替え可能な設計であることを要件として記録する
- Phase 4 のテスト作成 Phase で参照する統合テストシナリオの入力・出力境界を定義する

---

## 完了条件

- [ ] `runCreateWorkflow` の現状 purpose 処理フローが文書化されている
- [ ] extract-purpose エージェントの入力・出力仕様が把握されている
- [ ] AC-1〜AC-7 の受入条件詳細と検証方法が確定している
- [ ] 追加変数・メソッドの命名が決定している
- [ ] 前提タスク（TASK-SC-PLAN-CONNECT-GENERATE-SKILL-MD-001）の完了確認が完了している
- [ ] `llmClient` インターフェース接続要件が明記されている
