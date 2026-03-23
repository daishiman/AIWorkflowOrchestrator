# Phase 12: ドキュメント更新

## メタ情報

| 項目     | 値                                    |
| -------- | ------------------------------------- |
| Phase    | 12                                    |
| タスクID | UT-SC-02-002                          |
| 機能名   | UT-SC-02-002-execute-terminal-handoff |
| 作成日   | 2026-03-23                            |

## 目的

`terminal_handoff` 分岐追加に関する実装ガイド・システム仕様書・変更ログを整備し、
後続の開発者が本修正の意図・設計・影響範囲を正確に把握できる状態にする。

## 実行タスク

| #      | タスク                           | 優先度 | 省略可否                   |
| ------ | -------------------------------- | ------ | -------------------------- |
| Task 1 | 実装ガイド作成                   | 高     | 不可                       |
| Task 2 | システム仕様書更新               | 高     | 不可                       |
| Task 3 | documentation-changelog.md 作成  | 高     | 不可                       |
| Task 4 | 未タスク検出レポート作成         | 高     | 不可（0件でも作成）        |
| Task 5 | スキルフィードバックレポート作成 | 中     | 不可（改善点なしでも作成） |

## 参照資料

| 資料                       | パス                                                                                 |
| -------------------------- | ------------------------------------------------------------------------------------ |
| タスク実行ルール           | `.claude/rules/05-task-execution.md`                                                 |
| 既知の落とし穴             | `.claude/rules/06-known-pitfalls.md`                                                 |
| 仕様書更新ワークフロー     | `.claude/skills/aiworkflow-requirements/references/spec-update-workflow.md`          |
| Phase 5 実装仕様書         | `docs/30-workflows/UT-SC-02-002-execute-terminal-handoff/phase-05-implementation.md` |
| 修正対象ファイル（型定義） | `packages/shared/src/types/skillCreator.ts`                                          |
| 修正対象ファイル（Facade） | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                |
| 修正対象ファイル（テスト） | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts` |

## 実行手順

### Task 1: 実装ガイド作成

成果物パス: `docs/30-workflows/UT-SC-02-002-execute-terminal-handoff/implementation-guide.md`

#### Part 1: 中学生レベルの概念説明（日常例え必須）

**「terminal_handoff とは何か？」をお店の転送電話で説明する**

> お客さんがAI（RuntimeSkillCreatorFacade）に電話をかけてきたとします。
> お客さんが「ターミナルで直接作業したい」と言ってきた場合（execution_type = "terminal_handoff"）、
> AIは「では、ターミナル担当の窓口に転送します」と言って、そちらに電話をつなぎます。
> このとき、AI自身は何も作業しません――「転送しました」という結果だけを返します。
>
> 一方、お客さんが「AIに統合APIで処理してほしい」と言ってきた場合（execution_type = "integrated_api"）、
> AIは自分で作業（LLMへのリクエスト等）を行い、その結果を返します。
>
> この「誰が作業するか」を最初に振り分けるのが `execute()` の分岐ロジックです。

#### Part 2: 技術者向け実装詳細

1. **Union 型パターン**
   - `packages/shared/src/types/skillCreator.ts` に `RuntimeSkillCreatorExecuteResponse` Union 型を追加
   - 既存の `RuntimeSkillCreatorPlanResponse` / `RuntimeSkillCreatorImproveResponse` と同一パターン
   - 定義: `RuntimeSkillCreatorExecuteResult | { type: "terminal_handoff"; bundle: TerminalHandoffBundle }`

2. **分岐ロジック**
   - `RuntimeSkillCreatorFacade.execute()` 内で `if (decision.type === "terminal_handoff")` による早期リターン分岐
   - `terminal_handoff` ケース: `handoffBuilder.build(planResult.skillSpec, process.cwd())` でバンドル生成、`SkillExecutor` を呼び出さずに即時返却
   - `integrated_api` ケース（else パス）: 既存の `SkillExecutor.execute()` 委譲フローを維持
   - `void decision;` 行を除去し、`decision` を分岐条件で正しく使用

3. **テスト設計**
   - `terminal_handoff` テスト: `executeMock` が呼ばれないことを `expect(executeMock).not.toHaveBeenCalled()` で検証
   - `integrated_api` テスト: 既存の期待値テストを維持（非破壊）
   - 既存テスト L208-246 の矛盾を修正: `resolve` モックを `terminal_handoff` → `integrated_api` に変更

---

### Task 2: システム仕様書更新

> P43 対策: 更新対象が複数ある場合はサブエージェントを3ファイル以下/回に分割する。
> P26 対策: Phase 12 完了時点で `.claude/skills/` を実更新する（PRマージを待たない）。

#### Step 1-A: タスク完了記録（2ファイル必須 — P1/P25 対策）

以下の**2ファイル両方**にタスク完了記録を追加する。

**ファイル1**: `.claude/skills/aiworkflow-requirements/LOGS.md`

```markdown
## UT-SC-02-002 (2026-03-23) — execute() terminal_handoff 分岐追加

- 修正ファイル: packages/shared/src/types/skillCreator.ts, RuntimeSkillCreatorFacade.ts
- 内容: RuntimeSkillCreatorExecuteResponse Union型追加 + execute() terminal_handoff 早期リターン分岐実装
- テスト: terminal_handoff / integrated_api の各パスに対応するテストケース追加
- ステータス: 完了
```

**ファイル2**: `.claude/skills/task-specification-creator/LOGS.md`

```markdown
## UT-SC-02-002 (2026-03-23) — execute() terminal_handoff 分岐追加

- タスク種別: バックエンドロジック修正（セキュリティ）
- Phase 1-13 完了
- ステータス: 完了
```

#### Step 1-B: 実装状況テーブル更新

以下のファイルで `UT-SC-02-002` の実装ステータスを `完了` に更新する（該当する場合）。

- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
  - 残課題テーブルの `UT-SC-02-002` 行を `完了` に更新
  - 完了タスクセクションに追記

#### Step 1-C: 関連タスクテーブル更新

```bash
grep -rn "UT-SC-02-002" .claude/skills/aiworkflow-requirements/references/
```

上記コマンドで検索し、ヒットした仕様書の関連タスクテーブルを更新する。

#### Step 1-D: topic-map.md 再生成（P2/P27 対策）

仕様書に変更があれば必ず再生成を実行する（追加・削除・更新すべてがトリガー）。

```bash
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
```

実行後、以下を確認する。

- `indexes/topic-map.md` が更新されていること
- `indexes/keywords.json` が更新されていること

#### Step 2: システム仕様更新

本タスクでは `RuntimeSkillCreatorExecuteResponse` という新規 Union 型を `packages/shared/src/types/skillCreator.ts` に追加した。
新規インターフェース追加に該当するため、以下のファイルを更新する（該当する場合）。

- `.claude/skills/aiworkflow-requirements/references/interfaces-skill-creator.md`（またはそれに相当する仕様書）
  - `RuntimeSkillCreatorExecuteResponse` 型定義の追加を記録
  - `RuntimeSkillCreatorFacade.execute()` の戻り値型変更（`SkillExecuteResult` → `RuntimeSkillCreatorExecuteResponse`）を記録

#### Step 3: SKILL.md 変更履歴更新（P29 対策）

- `.claude/skills/aiworkflow-requirements/SKILL.md` の変更履歴テーブルに追記
- `.claude/skills/task-specification-creator/SKILL.md` の変更履歴テーブルに追記

---

### Task 3: documentation-changelog.md 作成

成果物パス: `docs/30-workflows/UT-SC-02-002-execute-terminal-handoff/documentation-changelog.md`

> P4 対策: 全 Step 完了前に「完了」と記載しない。各 Step の実行結果を「事後記録」する。

記録内容:

- Step 1-A: LOGS.md 2ファイル更新の完了結果
- Step 1-B: task-workflow.md 更新の完了結果
- Step 1-C: 関連タスクテーブル検索・更新の完了結果（ヒット件数を記録）
- Step 1-D: topic-map.md 再生成の完了結果（生成ログを添付）
- Step 2: システム仕様更新の完了結果（更新ファイル一覧を記録）
- Step 3: SKILL.md 変更履歴更新の完了結果

---

### Task 4: 未タスク検出レポート作成（0件でも必須 — P3/P38/P58 対策）

成果物パス: `outputs/phase-12/unassigned-task-detection.md`

確認観点:

- `terminal_handoff` 以外の `execution_type` 追加が将来必要になる可能性
- `RuntimeSkillCreatorFacade` のエラーハンドリング強化の余地
- `packages/shared/src/types/skillCreator.ts` に他の未定義型がないか

未タスクが検出された場合は以下の3ステップを全て実行する（P3 対策）。

1. `docs/30-workflows/unassigned-task/` に指示書ファイルを作成
2. `.claude/skills/aiworkflow-requirements/references/task-workflow.md` 残課題テーブルに登録
3. 関連仕様書に参照リンクを追加

未タスク件数は `unassigned-task-detection.md` に記録し、`artifacts.json` の Phase 12 ステータスも更新する。

再評価クローズした未タスクがある場合は、対応する GitHub Issue を `gh issue close` で同時に Close する（P56 対策）。

---

### Task 5: スキルフィードバックレポート作成（改善点なしでも必須 — P28 対策）

成果物パス: `docs/30-workflows/UT-SC-02-002-execute-terminal-handoff/skill-feedback-report.md`

検討観点:

- Phase 1-13 ワークフローで発生した手戻り・遅延はあったか
- 既知の落とし穴（06-known-pitfalls.md）への該当事例はあったか
- 新たな落とし穴として記録すべきパターンはあったか
- `.claude/rules/` や `.claude/skills/` の更新が必要な改善点はあったか

改善点がない場合でも「改善点なし」として明示的にレポートを作成する。

## 多角的チェック観点

| 観点               | 適用判断                          | 確認内容                                         |
| ------------------ | --------------------------------- | ------------------------------------------------ |
| セキュリティ       | terminal_handoff でのセキュリティ | SkillExecutor 非呼び出しの保証                   |
| アーキテクチャ     | 3メソッドのパターン統一           | plan/improve/execute の分岐パターンの一貫性      |
| エラーハンドリング | Optional chaining の安全性        | `response.error?.message` 等の null 安全パターン |

## 統合テスト連携

Phase 11 の自動テスト PASS を前提として、本 Phase を開始する。

| 確認項目          | 確認方法                                                      |
| ----------------- | ------------------------------------------------------------- |
| Phase 11 完了確認 | `phase-11-manual-test.md` の完了条件チェックリスト全項目 PASS |

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

## 成果物

| 成果物                       | パス                                                                                                 | 必須                       |
| ---------------------------- | ---------------------------------------------------------------------------------------------------- | -------------------------- |
| 実装ガイド                   | `outputs/phase-12/implementation-guide.md`                                                           | 必須                       |
| documentation-changelog      | `outputs/phase-12/documentation-changelog.md`                                                        | 必須                       |
| 未タスク検出レポート         | `outputs/phase-12/unassigned-task-detection.md`                                                      | 必須（0件でも作成）        |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`                                                          | 必須（改善点なしでも作成） |
| 仕様更新サマリー             | `outputs/phase-12/system-spec-update-summary.md`                                                     | 必須                       |
| LOGS.md 更新（2ファイル）    | `.claude/skills/aiworkflow-requirements/LOGS.md` `.claude/skills/task-specification-creator/LOGS.md` | 必須                       |
| topic-map.md 再生成          | `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`                                        | 必須                       |

## 完了条件

- [ ] Task 1: `implementation-guide.md` が作成され、Part 1（日常例え）と Part 2（技術詳細）を含む
- [ ] Task 2 Step 1-A: LOGS.md が **2ファイル両方** 更新されている
- [ ] Task 2 Step 1-B: task-workflow.md の実装ステータスが更新されている
- [ ] Task 2 Step 1-C: `grep -rn "UT-SC-02-002"` の結果に未更新ファイルがない
- [ ] Task 2 Step 1-D: `node generate-index.js` が正常完了し topic-map.md が更新されている
- [ ] Task 2 Step 2: 新規 Union 型に関するシステム仕様書が更新されている
- [ ] Task 2 Step 3: SKILL.md 変更履歴が **2ファイル両方** 更新されている
- [ ] Task 3: `documentation-changelog.md` が全 Step の**実行結果**を記録している（「完了予定」ではなく「完了済み」）
- [ ] Task 4: `unassigned-task-report.md` が作成されている（0件の場合も「0件」と明記）
- [ ] Task 5: `skill-feedback-report.md` が作成されている（改善点なしの場合も「なし」と明記）
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている

## 次の Phase

Phase 13: PR 作成
→ `docs/30-workflows/UT-SC-02-002-execute-terminal-handoff/phase-13-pr.md`
