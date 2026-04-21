# Phase 11: 手動テスト - タスク仕様書

## メタ情報

| 項目         | 内容                                             |
| ------------ | ------------------------------------------------ |
| Phase        | 11                                               |
| タスクID     | TASK-SC-CREATOR-UPDATE-IMPL-001                  |
| タスク名     | SkillCreatorService runUpdateWorkflow 実処理実装 |
| タスク種別   | NON_VISUAL                                       |
| ステータス   | 未実施                                           |
| 作成日       | 2026-04-21                                       |
| GitHub Issue | #2318（CLOSED）                                  |

---

## 目的

NON_VISUAL タスクのため、UI スクリーンショットは不要。
テスト実行ログと型定義テスト結果を証跡として使用する。

`runUpdateWorkflow()` の実処理実装が正しく動作することを確認し、
update モード実行時に既存 SKILL.md が実際に更新されることを保証する。

---

## 視覚証跡

UI/UX 変更なしのため Phase 11 スクリーンショット不要。
代替証跡: `outputs/phase-10/final-review-result.md` と `outputs/phase-11/manual-test-result.md`（テスト実行ログ）を参照。

---

## docs-only 正本ポリシー

`outputs/phase-11/manual-test-result.md` を Phase 11 の正本とし、以下を 1 ファイルに集約する:

- テスト件数サマリー（PASS/FAIL/SKIP、実施情報）
- 実行コマンドと判定
- 仕様判断根拠（update モードの動作確認・AbortSignal 中断確認・LLM 利用可否判断）
- docs-only チェック観点

docs-only チェック観点:

- `SKILL.md` から参照した family file / reference へ辿れるか
- `.claude` と `.agents` の file set・参照先が一致しているか
- validator / verify コマンドを再実行できるか
- `artifacts.json` と phase 本文の成果物定義が一致しているか

---

## 3層評価（NON_VISUAL タスク用）

### Semantic 評価

update モードの動作を以下の観点で評価する:

| 評価項目                                | 確認内容                                                 | 判定   |
| --------------------------------------- | -------------------------------------------------------- | ------ |
| update モードで SKILL.md が更新される   | `runUpdateWorkflow()` が既存 SKILL.md を書き換えるか     | 未確認 |
| LLM 利用可能時に purpose が再生成される | LLM クライアントが存在する場合、purpose が再生成されるか | 未確認 |
| AbortSignal 中断が各ステップで機能する  | シグナル発火時に処理が中断されるか                       | 未確認 |

### 代替証跡

- `outputs/phase-10/final-review-result.md`（最終レビュー結果）
- `outputs/phase-11/manual-test-result.md`（テスト実行ログ）

---

## 実行タスク

### Step 1: update モード関連テストの実行

```bash
# update モード関連テストのみを対象に実行
pnpm --filter @repo/desktop test --testNamePattern="runUpdateWorkflow|update.*mode|update.*skill"
```

実行対象テスト（例）:

- `runUpdateWorkflow` が既存 SKILL.md を更新するテスト
- LLM 利用可能時に purpose が再生成されるテスト
- AbortSignal 中断が各ステップで機能するテスト

---

### Step 2: 全テスト PASS 確認

```bash
# 全テストスイートを実行して回帰がないことを確認
pnpm --filter @repo/desktop test
```

確認項目:

- [ ] `runUpdateWorkflow()` 関連テストが全て PASS
- [ ] 既存テストへの回帰がない
- [ ] テスト失敗件数: 0 件

---

### Step 3: Preload API / 型定義テスト結果の記録

以下を `manual-test-result.md` に記録する:

| 確認項目                               | 確認方法                                | 結果   |
| -------------------------------------- | --------------------------------------- | ------ |
| TypeScript 型エラーなし                | `pnpm --filter @repo/desktop typecheck` | 未計測 |
| `runUpdateWorkflow()` の引数型が正しい | TypeScript 型定義の確認                 | 未確認 |
| `case "update":` の戻り値型が正しい    | TypeScript 型定義の確認                 | 未確認 |

---

### Step 4: docs-only 整合ウォークスルー

以下を `manual-test-result.md` に記録する:

- `SKILL.md` / reference / phase 仕様のリンク整合
- `.claude` と `.agents` の正本・mirror 関係の確認結果
- `outputs/artifacts.json` と phase 本文の成果物一致確認
- 仕様判断根拠 ID または短い理由

---

## 成果物

- `outputs/phase-11/manual-test-result.md`（テスト実行ログ・3 層評価・docs-only 整合記録）

---

## 完了条件

- [ ] update モード関連テストが全て PASS している
- [ ] 既存テストへの回帰がない（テスト失敗: 0 件）
- [ ] Preload API / 型定義テスト結果が記録されている
- [ ] `outputs/phase-11/manual-test-result.md` にテスト実行ログが記録されている
- [ ] docs-only 整合ウォークスルー結果が `manual-test-result.md` に記録されている

---

## タスク100%実行確認【必須】

Phase 11 完了時に以下をすべてチェックすること:

- [ ] Step 1: update モード関連テストを実行した
- [ ] Step 2: 全テスト PASS を確認した
- [ ] Step 3: Preload API / 型定義テスト結果を記録した
- [ ] Step 4: docs-only 整合ウォークスルーを記録した
- [ ] `outputs/phase-11/manual-test-result.md` を作成した
- [ ] 完了条件を全て満たしている

---

## 次Phase

完了後、以下のファイルを実行してください:

`docs/30-workflows/TASK-SC-CREATOR-UPDATE-IMPL-001/phase-12-documentation.md`
