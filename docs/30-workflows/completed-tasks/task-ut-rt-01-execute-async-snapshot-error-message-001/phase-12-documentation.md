# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                                                   |
| ---------- | ------------------------------------------------------ |
| Phase      | 12                                                     |
| Phase 名   | ドキュメント更新                                       |
| 前提 Phase | Phase 11（手動テスト）完了                             |
| 後続 Phase | Phase 13（PR 作成）                                    |
| ステータス | 完了                                                   |
| 作成日     | 2026-04-06                                             |
| 機能名     | task-ut-rt-01-execute-async-snapshot-error-message-001 |

---

## 目的

実装した内容をシステム要件ドキュメントに反映し、技術的な理解を促進するドキュメントを作成し、未完了タスクを検出・記録する。

---

## 事前チェック【必須】

Phase 12 実行前に、以下の既知の落とし穴を確認する:

- P1: LOGS.md 2 ファイル更新漏れ（`aiworkflow-requirements/LOGS.md` + `task-specification-creator/LOGS.md` の両方）
- P2: `topic-map.md` 再生成忘れ
- P3: 未タスク管理の 3 ステップ不完全
- P4: `documentation-changelog.md` への早期「完了」記載
- P28: スキルフィードバックレポート未作成

---

## 実行タスク

| Task      | 内容                                   | 主成果物                                                 |
| --------- | -------------------------------------- | -------------------------------------------------------- |
| Task 12-1 | 技術ドキュメント作成（実装ガイド作成） | `outputs/phase-12/implementation-guide.md`               |
| Task 12-2 | システムドキュメント更新               | `outputs/phase-12/system-spec-update-summary.md`         |
| Task 12-3 | ドキュメント更新履歴作成               | `outputs/phase-12/documentation-changelog.md`            |
| Task 12-4 | 未タスク検出（残課題の検出と記録）     | `outputs/phase-12/unassigned-task-detection.md`          |
| Task 12-5 | スキルフィードバックレポート作成       | `outputs/phase-12/skill-feedback-report.md`              |
| Task 12-6 | phase12-task-spec-compliance-check     | `outputs/phase-12/phase12-task-spec-compliance-check.md` |

- Task 12-1: 技術ドキュメント作成（実装ガイド作成）
- Task 12-2: システムドキュメント更新（aiworkflow-requirements 等の更新）
- Task 12-3: ドキュメント更新履歴作成（変更履歴の記録）
- Task 12-4: 未タスク検出（残課題の検出と記録）
- Task 12-5: スキルフィードバックレポート作成（ワークフロー改善点と技術的教訓の記録）
- Task 12-6: phase12-task-spec-compliance-check（Task 12-1〜12-5 の準拠確認）

> **必須**: 実行タスクは「表」と「`- Task 12-X:` 箇条書き」を**両方**残すこと。

---

## Task 12-1: 実装ガイド作成【必須】

**成果物**: `outputs/phase-12/implementation-guide.md`

2パート構成で作成する。

### Part 1（中学生レベル）

**対象読者**: 初学者・非技術者

**構成ルール**:

- 日常例え話を含む（`たとえば` を最低 1 回使用）
- 専門用語なし（または注釈付き）
- 「なぜ必要か」→「何をするか」の順序を維持する

**例え話の方針**:

> お使いを頼まれた子供が失敗したとき、親に結果だけでなく失敗の理由も伝える

たとえば、「買い物に行ったけどお店が閉まっていた」と伝えるだけでなく、「閉店日だったから買えなかった」という理由まで伝えることで、親は次の対応（別の店に行く、明日に延期する等）を判断できる。これと同じように、`executeAsync()` がエラーを起こしたとき、エラーが起きたという事実だけでなく、その理由（エラーメッセージ）も画面（Renderer）に届けるように修正する。

**記載内容**:

1. なぜ必要か: エラーが起きても原因が画面に表示されないという問題
2. 何をするか: エラーメッセージを常に伝えるように条件を修正する

### Part 2（技術者レベル）

**対象読者**: 開発者・技術者

**記載内容**:

1. `executeAsync()` の 3 パスの説明

| パス                            | 説明                                             | 変更内容                                                           |
| ------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------ |
| structured error パス           | `execute()` が `{ success: false }` を返した場合 | `if (!snapshot)` 条件を削除し常に `onWorkflowStateSnapshot` を呼ぶ |
| catch パス                      | `execute()` が例外をスローした場合               | `if (!snapshot)` 条件を削除し常に `onWorkflowStateSnapshot` を呼ぶ |
| terminal_handoff / success パス | 正常終了した場合                                 | **変更なし**                                                       |

2. `onWorkflowStateSnapshot` のシグネチャ

```typescript
onWorkflowStateSnapshot?: (
  planId: string,
  snapshot: SkillCreatorWorkflowUiSnapshot | null,
  error?: string, // 第3引数: エラーメッセージ（optional）
) => void;
```

3. Before/After コードスニペット

**Before（structured error パス）**:

```typescript
if (isStructuredError) {
  const errorResponse =
    executeResult as RuntimeSkillCreatorExecuteErrorResponse;
  const snapshot = this.workflowEngine.getWorkflowState(planId);
  if (!snapshot) {
    this.onWorkflowStateSnapshot?.(planId, null, errorResponse.error.message);
  }
}
```

**After（structured error パス）**:

```typescript
if (isStructuredError) {
  const errorResponse =
    executeResult as RuntimeSkillCreatorExecuteErrorResponse;
  const snapshot = this.workflowEngine.getWorkflowState(planId);
  this.onWorkflowStateSnapshot?.(
    planId,
    snapshot ?? null,
    errorResponse.error.message,
  );
}
```

**Before（catch パス）**:

```typescript
} catch (error) {
  this.workflowEngine.triggerPhaseTransition(planId, "error", 0);
  const errorMessage = error instanceof Error ? error.message : String(error);
  const snapshot = this.workflowEngine.getWorkflowState(planId);
  if (!snapshot) {
    this.onWorkflowStateSnapshot?.(planId, null, errorMessage);
  }
```

**After（catch パス）**:

```typescript
} catch (error) {
  this.workflowEngine.triggerPhaseTransition(planId, "error", 0);
  const errorMessage = error instanceof Error ? error.message : String(error);
  const snapshot = this.workflowEngine.getWorkflowState(planId);
  this.onWorkflowStateSnapshot?.(planId, snapshot ?? null, errorMessage);
```

4. テストシナリオ T-01〜T-06 の説明

| テストID | シナリオ                                                                                                           | 検証ポイント                                                         |
| -------- | ------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------- |
| T-01     | structured error でエラーメッセージが伝搬される                                                                    | `onWorkflowStateSnapshot` の第3引数が `error.message` と一致         |
| T-02     | structured error で snapshot が存在する場合も伝搬される                                                            | 第2引数が `snapshot ?? null` となる                                  |
| T-03     | terminal_handoff パスでは第3引数が `undefined`                                                                     | 正常系への影響なし                                                   |
| T-04     | success パスでは第3引数が `undefined`                                                                              | 正常系への影響なし                                                   |
| T-05     | structured error パスで snapshot が存在しない場合も伝搬される                                                      | `snapshot ?? null` の null 分岐と structured error 伝搬が固定される  |
| T-06     | catch パスで非 Error 値を受け取った場合も `String(error)` が第3引数に渡され、`snapshot ?? null` の null 分岐も通る | `String(error)` ルートと `snapshot ?? null` の null 分岐が固定される |

---

## Task 12-2: システムドキュメント更新【必須】

**成果物**: `outputs/phase-12/system-spec-update-summary.md`

### Step 1-A: タスク完了記録

以下のファイルに「完了タスク」セクションを追加する:

| 更新対象ファイル                      | 更新内容                                                                  |
| ------------------------------------- | ------------------------------------------------------------------------- |
| `aiworkflow-requirements/LOGS.md`     | TASK-UT-RT-01-EXECUTE-ASYNC-SNAPSHOT-ERROR-MESSAGE-001 完了エントリの追加 |
| `task-specification-creator/LOGS.md`  | 同タスクの完了記録を追加                                                  |
| `aiworkflow-requirements/SKILL.md`    | 変更履歴テーブルの更新                                                    |
| `task-specification-creator/SKILL.md` | 変更履歴テーブルの更新                                                    |

> **注意**: LOGS.md は 2 ファイル両方を更新すること（P1, P25 既知の落とし穴）

完了タスク記録テンプレート:

```markdown
## 完了タスク

### タスク: executeAsync() でのエラーメッセージ伝搬パス統一（2026-04-06 完了）

| 項目       | 内容                                                   |
| ---------- | ------------------------------------------------------ |
| タスク ID  | TASK-UT-RT-01-EXECUTE-ASYNC-SNAPSHOT-ERROR-MESSAGE-001 |
| ステータス | **完了**                                               |
| テスト数   | 6（自動）+ 0（手動）                                   |
```

> **注意**: テスト数は `pnpm test` 実行結果の実測値のみを記載すること。

### Step 1-B: 実装状況テーブル更新

`task-workflow-backlog.md` の残課題テーブルで本タスクを完了扱いへ更新し、`task-workflow-completed.md` に Phase 12 完了記録を同期する。

| 更新対象                     | 更新内容                                                                     |
| ---------------------------- | ---------------------------------------------------------------------------- |
| `task-workflow-backlog.md`   | 残課題テーブルの本タスクを完了扱いへ更新                                     |
| `task-workflow-completed.md` | Phase 12 完了記録を追加                                                      |
| 関連タスクセクション         | TASK-UT-RT-01-EXECUTE-IMPROVE-ADAPTER-GUARD-001 との依存関係を完了として記録 |

### Step 1-C: 関連タスクテーブル更新

```bash
grep -rn "TASK-UT-RT-01-EXECUTE-ASYNC-SNAPSHOT-ERROR-MESSAGE-001" .claude/skills/aiworkflow-requirements/references/
grep -n "TASK-UT-RT-01-EXECUTE-ASYNC-SNAPSHOT-ERROR-MESSAGE-001" .claude/skills/aiworkflow-requirements/references/task-workflow.md
grep -rn "TASK-UT-RT-01-EXECUTE-ASYNC-SNAPSHOT-ERROR-MESSAGE-001" docs/30-workflows/unassigned-task/
```

検索結果をもとに関連仕様書を特定し、ステータスを「完了」に更新する。

### Step 1-D: topic-map.md 再生成

references 配下の更新に伴い実行する（P2, P27 既知の落とし穴）:

```bash
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
```

再生成後、新規セクションの行番号が正しく反映されていることを確認する。

### Step 2（条件付き）: システム仕様更新の判断

**本タスクは Step 2 が不要。**

**判断理由**:

- 本タスクの変更内容は `RuntimeSkillCreatorFacade.ts` 内の内部ロジック修正のみ
- 新規インターフェース・型の追加なし（`onWorkflowStateSnapshot` のシグネチャは既存のまま）
- 既存インターフェース変更なし
- 新規定数・設定値の追加なし
- リファクタリング（内部ロジック変更のみ）に相当するため更新不要

この判断は `documentation-changelog.md` に「システム仕様更新: 不要（内部ロジック変更のみ、インターフェース変更なし）」として記録する。

---

## Task 12-3: ドキュメント更新履歴作成【必須】

**成果物**: `outputs/phase-12/documentation-changelog.md`

記録する変更内容:

| 変更ファイル                                     | 変更種別 | 変更内容                                                  |
| ------------------------------------------------ | -------- | --------------------------------------------------------- |
| `RuntimeSkillCreatorFacade.ts`                   | 修正     | structured error / catch パスの `if (!snapshot)` 条件削除 |
| `RuntimeSkillCreatorFacade.executeAsync.test.ts` | 新規追加 | T-01〜T-06 のテスト追加                                   |
| `phase-11-manual-test.md`                        | 更新     | Phase 11 完了ステータスへ同期                             |
| `artifacts.json`                                 | 更新     | Phase 11/12 の成果物一覧を同期                            |
| `aiworkflow-requirements/LOGS.md`                | 追記     | タスク完了エントリの追加                                  |
| `task-specification-creator/LOGS.md`             | 追記     | タスク完了記録の追加                                      |
| `aiworkflow-requirements/SKILL.md`               | 更新     | 変更履歴テーブルの更新                                    |
| `task-specification-creator/SKILL.md`            | 更新     | 変更履歴テーブルの更新                                    |
| `task-workflow-backlog.md`                       | 更新     | 残課題テーブルを完了扱いへ更新                            |
| `task-workflow-completed.md`                     | 更新     | Phase 12 完了記録を同期                                   |

また、以下の confirmed wording を **記録しない**（planned wording 残存防止）:

```bash
rg -n "仕様策定のみ|実行予定|保留として記録" \
  docs/30-workflows/task-ut-rt-01-execute-async-snapshot-error-message-001/outputs/phase-12/ \
  | rg -v 'phase12-task-spec-compliance-check.md' || echo "planned wording なし"
```

---

## Task 12-4: 未タスク検出レポート作成【必須】

**成果物**: `outputs/phase-12/unassigned-task-detection.md`

**0件でも出力必須。**

### 確認ソース

| #   | ソース                                         | 確認内容                                                                  |
| --- | ---------------------------------------------- | ------------------------------------------------------------------------- |
| 1   | Phase 3 レビュー結果                           | MINOR 判定の指摘事項（本タスクは MINOR なし）                             |
| 2   | Phase 3 未タスク候補欄                         | `RuntimeSkillCreatorExecuteResponse` union 拡張時の exhaustive check 導入 |
| 3   | Phase 11 手動テスト 既知の制限                 | Renderer 側でエラーメッセージが実際に UI に表示されるかの確認             |
| 4   | 各 Phase 成果物の「将来対応」「TODO」「FIXME」 | Phase 1〜11 全体                                                          |

### 未タスク候補リスト

| #   | 候補タスク名                                                              | 発見ソース                                             | 優先度目安                    | 配置先                               |
| --- | ------------------------------------------------------------------------- | ------------------------------------------------------ | ----------------------------- | ------------------------------------ |
| 1   | `RuntimeSkillCreatorExecuteResponse` union 拡張時の exhaustive check 導入 | Phase 3 設計レビュー（未タスク候補欄）                 | 中（将来 union 拡張時に必要） | `docs/30-workflows/unassigned-task/` |
| 2   | Renderer 側でエラーメッセージが実際に UI に表示されるかの確認タスク       | Phase 11 既知の制限 / Phase 1 スコープ「含まないもの」 | 中（ユーザー体験の改善）      | `docs/30-workflows/unassigned-task/` |

### 未タスク指示書作成手順（検出時）

1. `docs/30-workflows/unassigned-task/` に未タスク指示書（`.md`）を作成する
2. `task-workflow.md` の残課題テーブルへ登録する
3. 関連仕様書に未タスク参照リンクを追加する

```bash
# 未タスク指示書の物理ファイル存在を確認
ls docs/30-workflows/unassigned-task/
```

---

## Task 12-5: スキルフィードバックレポート作成【必須】

**成果物**: `outputs/phase-12/skill-feedback-report.md`

**改善点がなくても「改善点なし」としてレポートを作成すること（省略不可）。**

記録するセクション:

| セクション         | 記載内容の方針                                                                          |
| ------------------ | --------------------------------------------------------------------------------------- |
| ワークフロー改善点 | Phase 実行中に発見したワークフロー上の改善提案（なければ「改善提案なし」）              |
| 技術的教訓         | `if (!snapshot)` 条件削除パターンなど、実装中に得られた知見                             |
| スキル改善提案     | `task-specification-creator` / `skill-creator` への改善提案（なければ「改善提案なし」） |
| 新規 Pitfall 候補  | `06-known-pitfalls.md` に追加すべき新規 Pitfall（NON_VISUAL タスクの記録方法など）      |

---

## Task 12-6: phase12-task-spec-compliance-check【必須・最終確認】

**成果物**: `outputs/phase-12/phase12-task-spec-compliance-check.md`

Phase 12 の 6 つの成果物と、Task 12-1〜12-5 の実施結果が相互に矛盾しないことを確認する最終ゲート。
`artifacts.json` と `outputs/artifacts.json` が存在する場合は、同時に更新して参照切れを防ぐ。

### 確認項目

| #   | 確認内容                                                                        |
| --- | ------------------------------------------------------------------------------- |
| 1   | `implementation-guide.md` に Part 1 / Part 2 が揃っている                       |
| 2   | `system-spec-update-summary.md` に Step 1-A〜1-C と Step 2 の判断が揃っている   |
| 3   | `documentation-changelog.md` に current / baseline / validator 結果が揃っている |
| 4   | `unassigned-task-detection.md` が 0 件でも出力されている                        |
| 5   | `skill-feedback-report.md` が改善点なしの場合も作成されている                   |
| 6   | `artifacts.json` と Phase 12 の成果物一覧が一致している                         |
| 7   | planned wording（`仕様策定のみ` / `実行予定` / `保留として記録`）が残っていない |

### 出力テンプレ

```markdown
## phase12-task-spec-compliance-check

| 項目      | 判定        | 備考                                  |
| --------- | ----------- | ------------------------------------- |
| Task 12-1 | PASS / FAIL | Part 1 / Part 2 の確認結果            |
| Task 12-2 | PASS / FAIL | system-spec-update-summary の確認結果 |
| Task 12-3 | PASS / FAIL | documentation-changelog の確認結果    |
| Task 12-4 | PASS / FAIL | unassigned-task-detection の確認結果  |
| Task 12-5 | PASS / FAIL | skill-feedback-report の確認結果      |
| Task 12-6 | PASS / FAIL | task-spec compliance の最終判定       |
```

---

## 成果物一覧

| 成果物                       | パス                                                     | 必須 | 説明                                           |
| ---------------------------- | -------------------------------------------------------- | ---- | ---------------------------------------------- |
| 実装ガイド                   | `outputs/phase-12/implementation-guide.md`               | 必須 | Part 1（中学生レベル）+ Part 2（技術者レベル） |
| システム仕様更新サマリー     | `outputs/phase-12/system-spec-update-summary.md`         | 必須 | Step 1-A〜1-C + Step 2 判断結果                |
| ドキュメント更新履歴         | `outputs/phase-12/documentation-changelog.md`            | 必須 | 変更ファイル一覧                               |
| 未タスク検出レポート         | `outputs/phase-12/unassigned-task-detection.md`          | 必須 | 0 件でも出力                                   |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`              | 必須 | 改善点なしでも出力                             |
| 準拠チェック                 | `outputs/phase-12/phase12-task-spec-compliance-check.md` | 必須 | Task 12-1〜12-6 の最終確認                     |

---

## 完了条件

- [x] 実行タスクを「表」と「`- Task 12-X:` 箇条書き」の両方で記載している
- [x] 実装ガイド（Part 1: 中学生レベル・日常例え話あり）が作成されている
- [x] 実装ガイド（Part 2: 技術者レベル・3パス説明・Before/After・T-01〜T-06）が作成されている
- [x] 【Task 2 Step 1-A】`aiworkflow-requirements/LOGS.md` にタスク完了エントリを追加した
- [x] 【Task 2 Step 1-A】`task-specification-creator/LOGS.md` にタスク完了記録を追加した（**2 ファイル両方必須**）
- [x] 【Task 2 Step 1-A】`aiworkflow-requirements/SKILL.md` 変更履歴テーブルを更新した
- [x] 【Task 2 Step 1-A】`task-specification-creator/SKILL.md` 変更履歴テーブルを更新した
- [x] 【Task 2 Step 1-B】実装状況テーブル（`task-workflow-backlog.md` / `task-workflow-completed.md`）を更新した
- [x] 【Task 2 Step 1-C】関連タスクテーブルのステータスを「完了」に更新した
- [x] 【Task 2 Step 1-D】`topic-map.md` と `keywords.json` を再生成した
- [x] 【Task 2 Step 2】システム仕様更新が不要であることを判断し、理由を `documentation-changelog.md` に記録した
- [x] 未タスク検出レポートが出力されている（2 件の未タスク候補を記録）
- [x] スキルフィードバックレポートが出力されている（改善点なしでも作成）
- [x] phase12-task-spec-compliance-check が出力されている
- [x] `artifacts.json` が更新されている（Phase 12 ステータスを `completed` に変更）
- [x] `artifacts.json` と `outputs/artifacts.json` が同期している
- [x] planned wording（`仕様策定のみ` / `実行予定` / `保留として記録`）が残存していないことを確認
- [x] **本 Phase 内の全タスクを 100% 実行完了**

---

## Phase 末端アクション【必須】

- [x] Phase 12 内の全タスクを 100% 実行完了
- [x] 6 つの成果物ファイルが全て `outputs/phase-12/` に配置されていることを確認
- [x] `artifacts.json` の Phase 12 ステータスを `completed` に更新
- [x] planned wording 残存確認コマンドを実行し「planned wording なし」を確認

---

## 次 Phase

Phase 12 完了後、次は **Phase 13（PR 作成）** へ進む。ただし Phase 13 はユーザーの明示的な承認後のみ実施する。

`docs/30-workflows/task-ut-rt-01-execute-async-snapshot-error-message-001/phase-13-pr-creation.md`
