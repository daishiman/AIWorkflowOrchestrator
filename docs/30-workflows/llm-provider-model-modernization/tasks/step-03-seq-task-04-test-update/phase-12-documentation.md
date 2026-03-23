# Phase 12: ドキュメント更新 — テスト期待値更新

## メタ情報

| 項目      | 値                   |
| --------- | -------------------- |
| Phase番号 | 12                   |
| 機能名    | test-update          |
| タスクID  | TASK-LLM-MOD-04      |
| 作成日    | 2026-03-23           |
| 前Phase   | Phase 11: 手動テスト |
| 次Phase   | Phase 13: 完了       |

## 目的

実装ガイドの作成・システム仕様書の更新・未タスク検出の3作業を行い、TASK-LLM-MOD-04 の成果物を記録する。

---

## Task 1: 実装ガイド

### Part 1: 中学生レベルの概念説明

#### テスト期待値更新とは何か

ソフトウェアのテストは「答え合わせの問題集」のようなものです。

たとえば「このAIサービスに問い合わせると、使えるモデルの一覧が返ってくるはずだ」というテストがあるとします。AI会社が新しいモデルをリリースしたとき、問題集の「正解」もそれに合わせて書き直さないといけません。そうしないと、正しいプログラムなのに「不正解」と判定されてしまいます。

このタスクでは:

1. 新しいモデルが追加されたり古いモデルが廃止されたりした後、「正解」を新しいモデル一覧に書き直した
2. `o3` や `o4-mini` という新しいOpenAIのモデルを「これはOpenAIのモデルだ」と識別するテストを追加した
3. Google AIに「システムプロンプト」（AIへの事前指示）を渡す新機能が追加されたので、それが正しく動くかを確認するテストを追加した

#### なぜ重要か

プログラムが正しく動いていても、テストの「正解」が古いままだと「失敗」と判定されます。それが蓄積すると、本当に壊れたときに気付けなくなります。テスト期待値を最新に保つことは、品質を守り続けるために欠かせない作業です。

### Part 2: 開発者向け技術詳細

#### 変更対象と内容

| ファイル                        | 変更内容                                                 |
| ------------------------------- | -------------------------------------------------------- |
| `llm.test.ts`                   | PROVIDER_CONFIGS 整合性更新 + inferProviderId テスト追加 |
| `llm-stream.test.ts`            | ストリーミングテストの model フィールド期待値更新        |
| `AnthropicAdapter.test.ts`      | ヘルスチェック model 期待値 → `"claude-haiku-4-5"`       |
| `GoogleAdapter.test.ts`         | system_instruction テスト T-03 / T-04 追加               |
| OpenAI / xAI / Factory / Schema | 差分確認後に必要に応じて更新                             |

#### 追加テストケース一覧

| テストID | 内容                                          | ファイル                |
| -------- | --------------------------------------------- | ----------------------- |
| T-01     | `inferProviderId("o3")` → `"openai"`          | `llm.test.ts`           |
| T-02     | `inferProviderId("o4-mini")` → `"openai"`     | `llm.test.ts`           |
| T-03     | systemPrompt あり → `system_instruction` 設定 | `GoogleAdapter.test.ts` |
| T-04     | systemPrompt なし → `system_instruction` 省略 | `GoogleAdapter.test.ts` |

#### 制約事項

- P39: happy-dom 環境で `userEvent` を使用しない（`fireEvent` を使用）
- P40: テスト実行は `cd apps/desktop && pnpm vitest run` でパッケージディレクトリから実行

---

## Task 2: システム仕様書更新

### Step 1-A: タスク完了記録

#### LOGS.md 更新対象（2ファイル）

1. `aiworkflow-requirements/LOGS.md` に以下を追記:

```
## TASK-LLM-MOD-04: テスト期待値更新

- 完了日: 2026-03-23
- 変更ファイル: llm.test.ts, AnthropicAdapter.test.ts, GoogleAdapter.test.ts 他
- 内容: PROVIDER_CONFIGS 変更・Adapter 更新に合わせたテスト期待値更新・T-01〜T-04 追加
```

2. `task-specification-creator/LOGS.md` に同内容を追記

注意: P1/P25 対応 — 2ファイル両方を必ず更新すること。

### Step 1-B: 実装状況テーブル

テスト専任タスクのため、API エンドポイント等の実装ステータステーブル更新は対象外。

### Step 1-C: 関連タスクテーブル確認

```bash
grep -rn "TASK-LLM-MOD-04" .claude/skills/aiworkflow-requirements/references/
```

関連仕様書が存在する場合は完了ステータスを更新する。

### Step 1-D: topic-map.md 再生成

仕様書に変更があった場合は実行する（P2/P27 対応）:

```bash
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
```

### Step 2: システム仕様更新

テスト更新タスクのため、新規インターフェース・アーキテクチャ変更はなし。
システム仕様書の更新は対象外（変更があった場合のみ）。

---

## Task 3: documentation-changelog.md

> 注意: P4/P51 対応 — 全 Step 完了後に実際の実行結果を記録する。実行前に「完了」と記載しない。

`docs/30-workflows/llm-provider-model-modernization/` の changelog または本ファイル末尾に記録:

```markdown
## TASK-LLM-MOD-04 ドキュメント更新記録

- Task 1 実装ガイド: 作成完了（本ファイル）
- Task 2 Step 1-A: LOGS.md 2ファイル更新（実行後に記録）
- Task 2 Step 1-C: 関連タスクテーブル確認（実行後に記録）
- Task 2 Step 1-D: topic-map.md 再生成（変更あり/なしを記録）
- Task 2 Step 2: 対象外（新規インターフェースなし）
- Task 3: 本セクションを全 Step 完了後に更新
- Task 4: unassigned-task-report.md 作成（実行後に記録）
```

---

## Task 4: 未タスク検出

### 検出結果の記録

Phase 5〜11 の実施中に検出した未タスクを以下に記録する:

| 未タスクID       | 内容 | 優先度 | 指示書パス |
| ---------------- | ---- | ------ | ---------- |
| （実行時に記入） |      |        |            |

0件の場合も `unassigned-task-report.md` を作成すること（P3/P38 対応）。

### 3ステップ確認（P3 対応）

未タスクが検出された場合:

1. `docs/30-workflows/llm-provider-model-modernization/tasks/unassigned-task/` に指示書を作成
2. task-workflow.md の残課題テーブルに登録
3. 関連仕様書に参照リンクを追加

### unassigned-task-detection.md 更新

```bash
grep -n "TASK-LLM-MOD-04" docs/30-workflows/llm-provider-model-modernization/unassigned-task-detection.md
```

件数とステータスを更新する。

---

## 参照資料

| 資料                                        | 用途                                     |
| ------------------------------------------- | ---------------------------------------- |
| `.claude/rules/05-task-execution.md`        | Phase 12 必須チェックリスト              |
| `.claude/rules/06-known-pitfalls.md#P1,P25` | LOGS.md 2ファイル更新漏れ対策            |
| `.claude/rules/06-known-pitfalls.md#P2,P27` | topic-map.md 再生成漏れ対策              |
| `.claude/rules/06-known-pitfalls.md#P3,P38` | 未タスク管理3ステップ対策                |
| `.claude/rules/06-known-pitfalls.md#P4,P51` | documentation-changelog 早期完了記載禁止 |
| `phase-11-manual-testing.md`                | 手動テスト結果                           |

## 成果物

| 成果物                          | パス                                                                                                                 |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| 実装ガイド（本ファイル Task 1） | `phase-12-documentation.md`                                                                                          |
| unassigned-task-report.md       | `docs/30-workflows/llm-provider-model-modernization/tasks/step-03-seq-task-04-test-update/unassigned-task-report.md` |

## 完了条件

### Task 1: 実装ガイド

- [x] Part 1（中学生レベル概念説明）が記述されている
- [x] Part 2（開発者向け技術詳細）が記述されている

### Task 2: システム仕様書更新

- [ ] aiworkflow-requirements/LOGS.md を更新した
- [ ] task-specification-creator/LOGS.md を更新した（2ファイル更新確認）
- [ ] 関連タスクテーブルを確認した（grep 実行済み）
- [ ] topic-map.md を再生成した（または変更なしを確認した）

### Task 3: documentation-changelog

- [ ] 全 Step 完了後に changelog セクションに実行結果を記録した
- [ ] 「完了」と記載したのは実際に実行した後であることを確認した

### Task 4: 未タスク検出

- [ ] unassigned-task-report.md を作成した（0件の場合も作成）
- [ ] 検出した未タスクは3ステップ全完了した
- [ ] unassigned-task-detection.md の件数・ステータスを更新した

## 次のPhase

Phase 13: 完了 (`phase-13-completion.md`)
