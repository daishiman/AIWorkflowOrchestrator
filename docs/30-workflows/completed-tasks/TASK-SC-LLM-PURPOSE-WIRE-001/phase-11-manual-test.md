# Phase 11: 手動テスト - タスク仕様書

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| Phase      | 11                           |
| Phase名    | 手動テスト                   |
| 前提Phase  | Phase 10                     |
| 後続Phase  | Phase 12                     |
| ステータス | 未実施                       |
| 作成日     | 2026-04-18                   |
| タスクID   | TASK-SC-LLM-PURPOSE-WIRE-001 |

---

## 目的

自動テストでは検証しにくい実際の動作シナリオを手動で確認する。
NON_VISUAL タスクであるため UI スクリーンショットは不要とし、
ログ出力・型チェック・単体テスト実行を主体とした確認を行う。

## 背景

Phase 9 までの自動テストはモック LLM を使用しているため、
実際の LLM 接続やエージェント定義変更時の挙動を直接確認するシナリオが必要である。
また、既存の collaborative モード・orchestrate モードへの非回帰を
実際の実行フローで確認することで、自動テストの盲点を補完する。

---

## Phase 11 手動テスト方針

タスク種別: NON_VISUAL（UI/UX変更なし）

### 視覚証跡

UI/UX変更なしのため Phase 11 スクリーンショット不要。

### 手動確認方針

ログ・型チェック・単体テスト実行による確認を主体とする。

---

## 実行タスク

### タスク1: シナリオ1 - createSkill 実行時の purpose LLM 生成結果確認

**目的**: `createSkill` を実行したとき、`structurePlan.purpose` に LLM が生成した目的文が格納されることを確認する。

**前提条件**:

- LLM 接続設定が有効になっていること（または LLM モックが設定されていること）。
- `extract-purpose` エージェント定義ファイルが所定のパスに存在すること。

**確認手順**:

1. デバッグログを有効にして `SkillCreatorService` の `runCreateWorkflow` を実行できる環境を準備する。
2. 以下のコマンドでテストを実行し、ログ出力を確認する:
   ```bash
   pnpm --filter @repo/desktop test -- --reporter=verbose
   ```
3. `structurePlan.purpose` に代入される値がエージェント定義文字列（raw テキスト）ではなく、
   LLM が生成した目的文（自然言語の文章）であることをログで確認する。
4. purpose の内容が `skillInput` の内容を反映した意味のある文章であることを確認する。

**確認ポイント**:

- `purposeAgentDef` の値がエージェント定義ファイルの内容と一致すること。
- `llmClient.generate` の呼び出しが1回実行されていること。
- `structurePlan.purpose` に格納された値が LLM の戻り値と一致すること。

**期待される確認結果**:

- ログに purpose LLM 呼び出しの証跡が残っていること。
- `structurePlan.purpose` が意味のある目的文になっていること。

---

### タスク2: シナリオ2 - extract-purpose エージェント定義変更時の動作確認

**目的**: `extract-purpose` エージェント定義ファイルを変更した場合に、
実装コードを変更することなく LLM への system prompt が更新されることを確認する。

**確認手順**:

1. `.claude/skills/skill-creator/agents/extract-purpose.md` の内容を一時的に変更する
   （例: 末尾に識別可能なコメント文を追加する）。
2. テストを再実行してモックの system 引数が変更後の内容を含むことを確認する:
   ```bash
   pnpm --filter @repo/desktop test -- --reporter=verbose
   ```
3. 変更後の内容が `llmClient.generate` の `system` 引数として渡されていることをテストログで確認する。
4. 確認後、エージェント定義ファイルを元の内容に戻す。

**確認ポイント**:

- エージェント定義ファイルの変更が `system` 引数に即座に反映されること。
- 実装コード（`SkillCreatorService.ts`）の変更が不要であること。

**期待される確認結果**:

- エージェント定義の変更が LLM への入力に正しく反映されること。

---

### タスク3: シナリオ3 - 既存モードへの非回帰確認

**目的**: purpose 抽出 LLM 接続の追加により、collaborative モードおよび orchestrate モードの動作に影響がないことを確認する。

**確認手順**:

1. collaborative モードのテストを個別実行する:
   ```bash
   pnpm --filter @repo/desktop test -- --reporter=verbose --grep "collaborative"
   ```
2. orchestrate モードのテストを個別実行する:
   ```bash
   pnpm --filter @repo/desktop test -- --reporter=verbose --grep "orchestrate"
   ```
3. 全テストが PASS していることを確認する。
4. purpose 抽出が既存のワークフローフローに影響していないことをテストログで確認する。

**確認ポイント**:

- collaborative モードの全テストが PASS していること。
- orchestrate モードの全テストが PASS していること。
- purpose 抽出ステップが追加された後も既存のフロー順序が変わっていないこと。

**期待される確認結果**:

- 非回帰確認 PASS の記録。

---

### タスク4: 確認コマンドとデバッグ方法

**目的**: 手動確認時に使用するコマンドとデバッグ方法を整理する。

**ログ出力の確認方法**:

```bash
# verbose モードでテスト実行（詳細ログ出力）
pnpm --filter @repo/desktop test -- --reporter=verbose

# 特定テストファイルのみ実行
pnpm --filter @repo/desktop test -- apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.purpose.test.ts

# デバッグモードで実行（NODE_DEBUG を利用）
NODE_DEBUG=* pnpm --filter @repo/desktop test -- --reporter=verbose 2>&1 | grep -i "purpose\|llm\|agent"
```

**デバッグ時の確認観点**:

| 確認観点                      | 確認方法                                                                |
| ----------------------------- | ----------------------------------------------------------------------- |
| `loadAgent` の呼び出し確認    | テストのモック呼び出し記録（`toHaveBeenCalledWith("extract-purpose")`） |
| `llmClient.generate` 引数確認 | テストのモック呼び出し記録（`system` / `user` 引数の内容）              |
| `structurePlan.purpose` の値  | テストのアサーション結果（期待値との比較）                              |
| エラー発生箇所の特定          | スタックトレースの確認                                                  |

---

### タスク5: 統合テスト連携（LLM 接続）の確認

**目的**: 実際の LLM 接続を使用した統合テストが利用可能な場合に実行し、結果を記録する。

**実行手順**:

1. LLM 接続設定が利用可能かを確認する（API キーの存在等）。
2. 利用可能な場合: 統合テストを実行し、purpose に実際の LLM 生成結果が入ることを確認する。
3. 利用不可の場合: モックを使用したテスト結果で代替し、その旨を記録する。

```bash
# 統合テスト実行（LLM 接続環境が必要）
pnpm --filter @repo/desktop test
```

**期待される成果物**:

- 統合テスト手動確認の実行記録（LLM 接続有無と結果）

---

## 参照資料

| 参照資料                     | パス                                                                               | 内容                     |
| ---------------------------- | ---------------------------------------------------------------------------------- | ------------------------ |
| SkillCreatorService          | apps/desktop/src/main/services/skill/SkillCreatorService.ts                        | 確認対象の実装           |
| purpose 抽出テスト           | apps/desktop/src/main/services/skill/**tests**/SkillCreatorService.purpose.test.ts | 手動確認用テスト         |
| extract-purpose エージェント | .claude/skills/skill-creator/agents/extract-purpose.md                             | エージェント定義ファイル |
| Phase 10 仕様書              | docs/30-workflows/TASK-SC-LLM-PURPOSE-WIRE-001/phase-10-final-review.md            | 前提Phase 仕様書         |
| タスク index                 | docs/30-workflows/TASK-SC-LLM-PURPOSE-WIRE-001/index.md                            | タスク全体概要           |

---

## 成果物

| 成果物                   | パス                                             | 内容                                         |
| ------------------------ | ------------------------------------------------ | -------------------------------------------- |
| シナリオ1 確認記録       | outputs/phase-11/scenario-1-result.md            | purpose LLM 生成結果確認の実行記録           |
| シナリオ2 確認記録       | outputs/phase-11/scenario-2-result.md            | エージェント定義変更時の動作確認記録         |
| シナリオ3 非回帰確認記録 | outputs/phase-11/scenario-3-regression-result.md | collaborative / orchestrate モード非回帰確認 |
| 統合テスト手動確認記録   | outputs/phase-11/integration-test-result.md      | LLM 接続統合テストの実行記録                 |

---

## 統合テスト連携

Phase 11 では以下の統合テスト連携アクションを実行する:

1. **手動統合テスト（LLM 接続）の確認**: LLM 接続環境が利用可能な場合、実際の LLM を使用した統合テストを手動で実行し、purpose に実際の生成結果が格納されることを確認する。
2. **モックとの結果比較**: LLM 接続が利用不可の場合でも、モックを使用したテスト結果が期待通りであることを記録し、LLM 接続テストの代替とする。
3. **非回帰確認の統合テスト**: collaborative モード・orchestrate モードの統合テストシナリオを手動で実行し、PASS を確認する。

---

## 完了条件

- [ ] シナリオ1（purpose LLM 生成結果確認）の手動確認が完了し、結果が記録されている
- [ ] シナリオ2（エージェント定義変更時の動作確認）が完了し、エージェント定義ファイルが元の内容に戻されている
- [ ] シナリオ3（既存モード非回帰確認）で collaborative / orchestrate モードの全テストが PASS している
- [ ] 統合テスト（LLM 接続または代替）の確認記録が `outputs/phase-11/` に残されている
- [ ] 全成果物が `outputs/phase-11/` に記録されている
