# Phase 6: テスト拡充 — TASK-9I スキルドキュメント生成

## メタ情報

| 項目       | 値                                               |
| ---------- | ------------------------------------------------ |
| Phase      | 6                                                |
| 機能名     | TASK-9I-skill-docs                               |
| 作成日     | 2026-02-28                                       |
| 前提Phase  | Phase 5（実装・Green状態確認）                   |
| 依存タスク | TASK-9B（SkillService / SkillExecutor 実装済み） |

## 目的

Phase 5 の実装に対して、カバレッジ基準（Line 80%+, Branch 60%+, Function 80%+）を満たすために**不足しているテストを追加**する。境界値・エッジケース・統合テスト・セキュリティテストにより、実装の堅牢性を検証する。

## カバレッジ基準

| 指標              | 最低基準 | 推奨基準 | 対象ファイル                                                        |
| ----------------- | -------- | -------- | ------------------------------------------------------------------- |
| Line Coverage     | 80%      | 90%      | `apps/desktop/src/main/services/skill/SkillDocGenerator.ts`         |
| Branch Coverage   | 60%      | 70%      | `apps/desktop/src/main/services/skill/SkillDocGenerator.ts`         |
| Function Coverage | 80%      | 90%      | `apps/desktop/src/main/ipc/skillHandlers.ts`（docs ハンドラー部分） |

## 実行タスク

- Task 1: SkillDocGenerator の境界値・エッジケーステストを追加する
- Task 2: IPC ハンドラーの境界値テストを追加する
- Task 3: 統合テスト（IPC 経由の end-to-end フロー）を追加する
- Task 4: セキュリティテストを追加する

### Task 1: SkillDocGenerator 境界値・エッジケーステスト追加

**対象ファイル**: `apps/desktop/src/main/services/skill/SkillDocGenerator.test.ts`（既存ファイルに追加）

#### 1.1 テストケース一覧（generate 境界値）

| No    | テスト項目                                                                    | 期待結果                                                                    |
| ----- | ----------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| GB-01 | `customSections` が空配列 `[]` の場合にデフォルトセクションのみ生成される     | `sections` にカスタムセクションが含まれず、デフォルトセクションのみ存在する |
| GB-02 | `customSections` に10個のセクション名を指定した場合に全て生成される           | `sections` にカスタム10セクション分が追加されている                         |
| GB-03 | スキルの SKILL.md が空文字列の場合でも生成が完了する                          | `GeneratedDoc` が返却される（content が空でないこと）                       |
| GB-04 | LLM queryFn が空文字列 `""` を返した場合にセクション content が空文字列になる | セクションの content が空文字列で、wordCount が 0 になる                    |
| GB-05 | 同一スキルに対する複数回の generate 呼び出しが独立して動作する                | 2回の generate で異なる generatedAt が返却される                            |

#### 1.2 テストケース一覧（preview 境界値）

| No    | テスト項目                                                                               | 期待結果                                                            |
| ----- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| PB-01 | テンプレートの sections が空配列 `[]` の場合にセクションなしの GeneratedDoc が返却される | `sections` が空配列 `[]` で返却される                               |
| PB-02 | テンプレートに `required: false` のセクションのみの場合に全て生成される                  | 全セクションが生成され、required フラグに関係なく含まれる           |
| PB-03 | `required: true` のセクションで LLM が失敗した場合にエラーがスローされる                 | エラーがスローされる（required セクションの生成失敗は許容されない） |

#### 1.3 テストケース一覧（exportToFile 境界値）

| No    | テスト項目                                                         | 期待結果                                        |
| ----- | ------------------------------------------------------------------ | ----------------------------------------------- |
| EB-01 | 絶対パスでのエクスポートが正常に動作する                           | `fs.writeFile` が絶対パスで呼び出される         |
| EB-02 | ファイル名にスペースを含むパスでのエクスポートが正常に動作する     | `fs.writeFile` がスペース付きパスで呼び出される |
| EB-03 | content が非常に長い文字列（100KB 以上）でもエクスポートが完了する | エラーなく `fs.writeFile` が呼び出される        |

#### 1.4 テストケース一覧（HTML 変換）

| No    | テスト項目                                                              | 期待結果                                                   |
| ----- | ----------------------------------------------------------------------- | ---------------------------------------------------------- |
| HT-01 | Markdown のヘッダー（`#`, `##`, `###`）が対応する HTML タグに変換される | `<h1>`, `<h2>`, `<h3>` タグが含まれる                      |
| HT-02 | Markdown のコードブロック（\`\`\`）が `<pre><code>` に変換される        | `<pre><code>` タグが含まれる                               |
| HT-03 | 空の Markdown 文字列が有効な HTML 構造で返却される                      | `<html><head></head><body></body></html>` 形式が返却される |

### Task 2: IPC ハンドラー境界値テスト追加

**対象ファイル**: `apps/desktop/src/main/ipc/skillHandlers.docs.test.ts`（既存ファイルに追加）

#### 2.1 テストケース一覧

| No    | チャンネル            | テスト項目                                                         | 期待結果                                                                |
| ----- | --------------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| HB-01 | `skill:docs:generate` | `includeExamples` が boolean 以外（文字列 `"true"`）の場合         | `{ success: false, error: "includeExamples must be a boolean" }`        |
| HB-02 | `skill:docs:generate` | `includeApiReference` が boolean 以外の場合                        | `{ success: false, error: "includeApiReference must be a boolean" }`    |
| HB-03 | `skill:docs:generate` | `customSections` が配列以外（文字列）の場合                        | `{ success: false, error: "customSections must be an array" }`          |
| HB-04 | `skill:docs:generate` | `customSections` 配列内に文字列以外の要素が含まれる場合            | `{ success: false, error: "customSections must contain only strings" }` |
| HB-05 | `skill:docs:generate` | 引数全体が null の場合                                             | `{ success: false, error: "skillName must be a non-empty string" }`     |
| HB-06 | `skill:docs:export`   | `outputPath` が `/path/to/../../secret` のパストラバーサルの場合   | `{ success: false, error: "Invalid output path" }`                      |
| HB-07 | `skill:docs:export`   | `doc.content` が空文字列の場合でもエクスポートが成功する           | `{ success: true }`（空ファイルの書き出しは許容される）                 |
| HB-08 | `skill:docs:preview`  | `template` が null の場合にデフォルトテンプレートが使用される      | `{ success: true, data: GeneratedDoc }`                                 |
| HB-09 | `skill:docs:preview`  | `template.sections` が空配列の場合にセクションなしプレビューが返る | `{ success: true, data: GeneratedDoc }` で sections が空配列            |

### Task 3: 統合テスト（IPC 経由 end-to-end フロー）

**対象ファイル**: `apps/desktop/src/main/ipc/skillHandlers.docs.test.ts`（既存ファイルに追加）

#### 3.1 テストケース一覧

| No    | テスト項目                                                           | 期待結果                                                               |
| ----- | -------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| IT-01 | generate → export の連続フロー: 生成結果をそのままエクスポートする   | generate の data をそのまま export に渡して `{ success: true }` が返る |
| IT-02 | generate → preview → generate の順で呼び出しても各結果が独立している | 3回の呼び出しで異なる generatedAt が返却される                         |
| IT-03 | templates → preview（テンプレート指定）のフローが正常に動作する      | templates で取得したテンプレートを preview に渡して結果が返る          |

### Task 4: セキュリティテスト追加

**対象ファイル**: `apps/desktop/src/main/ipc/skillHandlers.docs.test.ts`（既存ファイルに追加）

#### 4.1 テストケース一覧

| No    | テスト項目                                                                         | 期待結果                                                                          |
| ----- | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| HS-01 | 全4ハンドラーで mainWindow が destroyed 後に呼び出し                               | validateIpcSender が `{ valid: false }` を返し、例外が送出される                  |
| HS-02 | 予期しない Error のスタックトレースが漏洩しない                                    | レスポンスの `error` にスタックトレースが含まれない                               |
| HS-03 | 予期しない Error のファイルパス情報が漏洩しない                                    | レスポンスの `error` に絶対パスが含まれない                                       |
| HS-04 | `validateIpcSender` の `getAllowedWindows` コールバックが正しく呼ばれる（P41対策） | `validateIpcSender.mock.calls[i][2].getAllowedWindows()` で `[mainWindow]` が返る |

---

## 実行手順

### Step 1: 現在のカバレッジ計測

```bash
cd apps/desktop && pnpm vitest run src/main/services/skill/SkillDocGenerator src/main/ipc/skillHandlers.docs --coverage
```

カバレッジレポートを確認し、不足箇所を特定する。

### Step 2: テスト追加

Task 1-4 のテストケースのうち、カバレッジ向上に寄与するものから優先的に追加する。

### Step 3: カバレッジ再計測

テスト追加後に再度カバレッジを計測し、基準を満たしているか確認する。

```bash
cd apps/desktop && pnpm vitest run src/main/services/skill/SkillDocGenerator src/main/ipc/skillHandlers.docs --coverage
```

### Step 4: 基準未達の場合

カバレッジ基準を満たさない場合は、レポートの未カバー行・分岐を確認し、追加テストを作成する。

---

## 参照資料

| 資料                                                                        | 用途                                  |
| --------------------------------------------------------------------------- | ------------------------------------- |
| Phase 4 成果物（phase-4-test-creation.md）                                  | 既存テスト仕様                        |
| Phase 5 成果物（phase-5-implementation.md）                                 | 実装コード                            |
| `apps/desktop/src/main/ipc/__tests__/skillFileHandlers.test.ts`             | エッジケーステストパターン            |
| `.claude/rules/02-code-quality.md`                                          | カバレッジ基準定義                    |
| `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | 品質要件の正本                        |
| `.claude/rules/06-known-pitfalls.md#P41`                                    | v8 カバレッジのインライン関数カウント |
| `.claude/rules/06-known-pitfalls.md#P9`                                     | テスト間変数リーク防止                |

## 統合テスト連携

| 連携先                    | 内容                                                                 |
| ------------------------- | -------------------------------------------------------------------- |
| Phase 5（実装）           | 実装済みサービスに対する境界値・エッジケース・統合シナリオを追加する |
| Phase 7（カバレッジ確認） | 拡充後テストを用いて coverage gate 判定を実施する                    |

## 多角的チェック観点

| 観点               | 確認事項                                                                                 |
| ------------------ | ---------------------------------------------------------------------------------------- |
| 境界値テスト       | 空配列、空文字列、null、大量データ（100KB+）のケースがテストされている                   |
| 統合テスト         | IPC 経由の generate → export フローが end-to-end で検証されている                        |
| セキュリティテスト | スタックトレース漏洩、ファイルパス漏洩、パストラバーサル攻撃のケースがテストされている   |
| P41対策            | `validateIpcSender` の `getAllowedWindows` コールバックが明示的に検証されている          |
| HTML 変換品質      | Markdown → HTML 変換の主要パターン（ヘッダー、コードブロック、空入力）がテストされている |

## 成果物

| 成果物                                                                     | 説明                                             |
| -------------------------------------------------------------------------- | ------------------------------------------------ |
| `apps/desktop/src/main/services/skill/SkillDocGenerator.test.ts`           | 境界値・HTML変換テスト追加（14テスト）           |
| `apps/desktop/src/main/ipc/skillHandlers.docs.test.ts`                     | 境界値・統合・セキュリティテスト追加（16テスト） |
| `docs/30-workflows/TASK-9I-skill-docs/outputs/phase-6/coverage-report.md`  | カバレッジ計測結果                               |
| `docs/30-workflows/TASK-9I-skill-docs/outputs/phase-6/integration-test.md` | 統合テスト結果                                   |

## 完了条件

- [ ] Task 1-4 の全テストケース（30テスト）が追加されている
- [ ] 追加した全テストが Green 状態（成功）である
- [ ] `beforeEach` で全モックがリセットされている（P9対策）
- [ ] `validateIpcSender` の `getAllowedWindows` コールバックが明示的に呼び出し確認されている（P41対策）
- [ ] カバレッジ計測コマンドが実行可能である
- [ ] 既存テスト（Phase 4 の67テスト）が引き続き全てPASSしている
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## 次の Phase

Phase 7（カバレッジ確認）へ進む。カバレッジ基準の充足を最終確認する。
