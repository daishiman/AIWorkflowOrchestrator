# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 値                                      |
| ---------- | --------------------------------------- |
| Phase      | 12                                      |
| 機能名     | task-imp-verify-improve-revert-loop-002 |
| タスクID   | TASK-P0-02                              |
| タスク種別 | 機能追加                                |
| UI task    | No                                      |
| docs-only  | No                                      |
| 作成日     | 2026-03-30                              |

## 目的

実装ガイド（Part 1: 概念説明 + Part 2: 技術詳細）を作成し、システム仕様書を更新する。ドキュメント更新履歴、未タスク検出レポート、スキルフィードバックレポートを作成して Phase 12 の5つの必須成果物を揃える。

## 事前チェック

Phase 12 着手前に以下の既知の落とし穴を確認すること。

| Pitfall | 内容                                         | 防止策                                                                           |
| ------- | -------------------------------------------- | -------------------------------------------------------------------------------- |
| P1      | LOGS.md 2ファイル更新漏れ                    | aiworkflow-requirements/LOGS.md と task-specification-creator/LOGS.md の両方更新 |
| P2      | topic-map.md 再生成忘れ                      | 仕様書変更時は必ず再生成スクリプトを実行                                         |
| P3      | 未タスク管理の3ステップ不完全                | (1)指示書 → (2)残課題テーブル → (3)関連仕様書リンク の全ステップ実施             |
| P4      | documentation-changelog への早期「完了」記載 | 全Step完了後に「完了」を記載。途中で書かない                                     |
| P25     | LOGS.md 2ファイル更新漏れ（P1再発）          | Phase 12チェックリストで「2ファイル更新」を明示的にチェック                      |
| P26     | システム仕様書更新遅延                       | Phase 12完了時点で更新。PRマージを待たない                                       |
| P27     | topic-map.md 再生成トリガー判断ミス          | 追加だけでなく削除・更新も再生成トリガーに含める                                 |
| P28     | スキルフィードバックレポート未作成           | 改善点なしでも「改善点なし」としてレポートを出力                                 |

### 着手時の初期アクション

1. `outputs/artifacts.json` と各 `phase-*.md` のartifact名を1対1で突合し、不一致があれば修正する
2. `task-workflow.md` / `task-workflow-completed.md` の更新対象を確認し、Phase 12 の反映漏れがあれば修正する
3. Phase 1 のタスク分類（UI task: No / docs-only: No）を再確認する

## 実行タスク

### タスク一覧（表）

| Task | 名称                          | 必須 | 成果物                                           |
| ---- | ----------------------------- | ---- | ------------------------------------------------ |
| 12-1 | 実装ガイド作成（2パート構成） | ✅   | `outputs/phase-12/implementation-guide.md`       |
| 12-2 | システム仕様書更新            | ✅   | `outputs/phase-12/system-spec-update-summary.md` |
| 12-3 | ドキュメント変更ログ          | ✅   | `outputs/phase-12/documentation-changelog.md`    |
| 12-4 | 未タスク検出レポート          | ✅   | `outputs/phase-12/unassigned-task-detection.md`  |
| 12-5 | スキルフィードバックレポート  | ✅   | `outputs/phase-12/skill-feedback-report.md`      |

---

### Task 12-1: 実装ガイド作成

成果物: `outputs/phase-12/implementation-guide.md`

#### Part 1: 概念説明（非技術者向け）

verify→improve→re-verify 閉ループの概念を非技術者にも理解できるように説明する。

**必須要件**:

- 日常生活での例え話を**必ず**含める（「たとえば」を最低1回使用）
- 専門用語は使わない（使う場合は即座にかみ砕いて説明）
- 「なぜ必要か」を先に説明してから「何をするか」を説明する

**記載構成**:

1. **なぜ必要か**: 手動介入なしにスキルの品質を自動改善するため。AIが作ったスキルに不備があった場合、人間が毎回チェックして直すのは非効率
2. **何をするか**: 検証（verify）→ 改善（improve）→ 再検証（re-verify）のサイクルを自動で繰り返し実行する仕組み
3. **たとえば**: 「たとえば、テストの答え合わせをして、間違えた問題を復習して解き直し、もう一度答え合わせをする。全問正解になるか、決められた回数に達するまでこれを繰り返す」のような日常の例え
4. **今回作ったもの**: 3つのメソッド（`recordVerifyPass()`, `recordImproveAttempt()`, `getImproveAttemptCount()`）と1つのパイプライン（`verifyAndImproveLoop()`）

#### Part 2: 技術詳細

**必須要件**:

- TypeScript型定義を含める
- APIシグネチャと使用例を記載
- エラーハンドリングとエッジケースを説明
- 設定可能なパラメータと定数を一覧化
- テスト構成を記載

**記載構成**:

1. **型定義**:
   - `SkillCreatorVerifyResult` の拡張フィールド（`improveAttemptCount?`, `maxImproveRetry?`, `loopExhausted?`, `failedChecksSummary?`）
   - `RuntimeSkillCreatorVerifyAndImproveResult` 新規型（`finalStatus`, `totalAttempts`, `finalChecks`, `loopExhausted`, `errorMessage?`, `workflowSnapshot`）
   - `RuntimeSkillCreatorFacadeDeps` の `maxImproveRetry?` フィールド

2. **APIシグネチャ**:
   - `SkillCreatorWorkflowEngine.recordVerifyPass(planId, checks)`
   - `SkillCreatorWorkflowEngine.recordImproveAttempt(planId, failedChecks)`
   - `SkillCreatorWorkflowEngine.getImproveAttemptCount(planId)`
   - `RuntimeSkillCreatorFacade.verifyAndImproveLoop(planId, skillDir, skillName, authMode, apiKey?)`
   - `formatVerifyChecksAsFeedback(checks)`

3. **使用例**:

   ```typescript
   // 閉ループの呼び出し例
   const result = await facade.verifyAndImproveLoop(
     planId,
     skillDir,
     skillName,
     authMode,
   );

   if (result.finalStatus === "pass") {
     // 全チェック PASS — 次のフェーズへ進行
   } else if (result.loopExhausted) {
     // maxRetry 到達 — ユーザー判断を要求
   } else {
     // エラー — エラー内容を表示
     console.error(result.errorMessage);
   }
   ```

4. **エラーハンドリング**:
   - verify 実行エラー: `finalStatus: "error"` で即座にループ停止
   - LLM improve 呼び出し失敗: ループ停止、`errorMessage` に記録
   - apply 失敗（`appliedCount: 0`）: ループ停止、`"review"` に遷移
   - improve 結果が空（`suggestions: []`）: ループ停止、「改善提案なし」
   - `verificationEngine` 未DI: 空配列返却 → 全チェック PASS 扱い（graceful degradation）

5. **エッジケース**:
   - `maxImproveRetry` の範囲外値（1未満 → 1にクランプ、10超 → 10にクランプ）
   - 同一修正の繰り返し（MR-01: 将来の改善候補）

6. **設定パラメータ**:

   | パラメータ        | 型       | デフォルト | 範囲  | 説明                                |
   | ----------------- | -------- | ---------- | ----- | ----------------------------------- |
   | `maxImproveRetry` | `number` | 3          | 1〜10 | verify→improve ループの最大試行回数 |

7. **テスト構成**:

   | テストファイル                         | 対象                     | テスト種別 |
   | -------------------------------------- | ------------------------ | ---------- |
   | `SkillCreatorWorkflowEngine.test.ts`   | `recordVerifyPass()` 等  | ユニット   |
   | `RuntimeSkillCreatorFacade.test.ts`    | `verifyAndImproveLoop()` | ユニット   |
   | `formatVerifyChecksAsFeedback.test.ts` | フィードバック変換       | ユニット   |

---

### Task 12-2: システム仕様書更新

成果物: `outputs/phase-12/system-spec-update-summary.md`

#### Step 1: 完了記録

- [ ] 完了タスクセクションに TASK-P0-02 の記録を追加
- [ ] `task-workflow.md` の完了タスクセクションを更新
- [ ] `task-workflow-completed.md` の completed record を更新
- [ ] 関連ドキュメントリンクを追加
- [ ] 変更履歴エントリを追加
- [ ] `outputs/artifacts.json` と `artifacts.json` の artifact 名を再突合
- [ ] **LOGS.md 2ファイル更新**:
  - [ ] `.claude/skills/aiworkflow-requirements/LOGS.md`
  - [ ] `.claude/skills/task-specification-creator/LOGS.md`
- [ ] **SKILL.md 2ファイル更新**:
  - [ ] `.claude/skills/aiworkflow-requirements/SKILL.md`
  - [ ] `.claude/skills/task-specification-creator/SKILL.md`
- [ ] canonical `.claude/skills/...` root と mirror 側の差分を確認
- [ ] `topic-map.md` 再生成:
  - [ ] `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js`
  - [ ] `node .claude/skills/task-specification-creator/scripts/generate-index.js --workflow docs/30-workflows/task-imp-verify-improve-revert-loop-002 --regenerate`

#### Step 2: ドメイン仕様同期

**判定**: **必要** — 新規インターフェースおよび既存インターフェースの拡張があるため。

新規・変更インターフェース:

| 変更種別 | 対象                                        | 内容                                                                                      |
| -------- | ------------------------------------------- | ----------------------------------------------------------------------------------------- |
| 新規型   | `RuntimeSkillCreatorVerifyAndImproveResult` | 閉ループ結果型（`finalStatus`, `totalAttempts`, `finalChecks`, etc.）                     |
| 拡張     | `SkillCreatorVerifyResult`                  | `improveAttemptCount?`, `maxImproveRetry?`, `loopExhausted?`, `failedChecksSummary?` 追加 |
| 拡張     | `RuntimeSkillCreatorFacadeDeps`             | `maxImproveRetry?` フィールド追加                                                         |
| 新規関数 | `formatVerifyChecksAsFeedback()`            | verify チェック → improve フィードバック変換ユーティリティ                                |

更新対象仕様書の候補:

- `task-workflow.md` の完了タスクセクション
- `task-workflow-completed.md` の completed record
- `skillCreator.ts` 関連の型仕様
- `api-ipc-system-core.md` の runtime lane 契約
- `interfaces-agent-sdk-skill-reference.md` の `SkillCreatorVerifyResult` / Facade 契約

> **注意**: 仕様書更新は3ファイル以下/エージェントに分割すること

---

### Task 12-3: ドキュメント変更ログ

成果物: `outputs/phase-12/documentation-changelog.md`

**記載構成**:

- Step 1 の実施結果を個別に明記（`task-workflow.md` / `task-workflow-completed.md` / LOGS.md 2件 / SKILL.md 2件 / topic-map.md / artifact sync）
- Step 2 の実施結果を個別に明記（`skillCreator.ts` / `api-ipc-system-core.md` / `interfaces-agent-sdk-skill-reference.md` の仕様反映状況）
- **全Step完了後に「Phase 12完了」と記載する**（P4対策）

---

### Task 12-4: 未タスク検出レポート

成果物: `outputs/phase-12/unassigned-task-detection.md`

**0件でも出力必須**。`current` / `baseline` を分離して記録する。

検出ソース:

| ソース                | 確認項目                                                        |
| --------------------- | --------------------------------------------------------------- |
| Phase 3 レビュー結果  | **MR-01**: LLM が同じ修正を繰り返すリスク（将来の未タスク候補） |
| Phase 3 レビュー結果  | **MR-02**: `verificationEngine` 未DI時に `console.warn` を追加  |
| Phase 10 レビュー結果 | MINOR判定の指摘事項                                             |
| Phase 11 手動テスト   | Task 11-7 の発見事項（スコープ外分類のもの）                    |
| コードコメント        | TODO/FIXME/HACK/XXX                                             |

**MR-01 の未タスク化**:

- Phase 3 で指摘: LLM が同じ修正を繰り返すリスク。前回の improve 内容を次回フィードバックに含めると効果的
- 対応: 未タスク候補として `docs/30-workflows/unassigned-task/` 配下に仕様書を作成

**MR-02 の未タスク化**:

- Phase 3 で指摘: `verificationEngine` 未DI時に全PASSとなる設定ミスのリスク
- Phase 5 で `console.warn` 追加として部分対応済み
- 将来的改善（ヘルスチェックで検出する仕組み）は未タスク候補として記録

未タスク管理の3ステップ（P3対策）:

1. 指示書作成（`docs/30-workflows/unassigned-task/` 配下）
2. 残課題テーブルへの追加
3. 関連仕様書へのリンク追加

---

### Task 12-5: スキルフィードバックレポート

成果物: `outputs/phase-12/skill-feedback-report.md`

**改善点なしでも出力必須**。

検討観点:

| 観点             | 検討内容                                          |
| ---------------- | ------------------------------------------------- |
| テンプレート改善 | Phase仕様書テンプレートに漏れや曖昧さがなかったか |
| ワークフロー改善 | 機械検証や手順分岐に改善余地がないか              |
| ドキュメント改善 | 再利用しやすい横断ガイドライン化の候補がないか    |

`phase12-task-spec-compliance-check.md` を root evidence として残す。

---

## 実行後バリデーションコマンド

```bash
# outputs/phase-12/ 配下に5ファイル全て存在するか確認
ls -la outputs/phase-12/implementation-guide.md \
       outputs/phase-12/system-spec-update-summary.md \
       outputs/phase-12/documentation-changelog.md \
       outputs/phase-12/unassigned-task-detection.md \
       outputs/phase-12/skill-feedback-report.md

# topic-map.md の再生成確認
git diff --name-only | grep topic-map

# LOGS.md 2ファイルの更新確認
git diff --name-only | grep LOGS.md
```

## 参照資料

| 資料名                                       | パス                                          | 説明                       |
| -------------------------------------------- | --------------------------------------------- | -------------------------- |
| タスク概要                                   | `index.md`                                    | AC定義・スコープ           |
| Phase 1 要件                                 | `phase-1-requirements.md`                     | 要件定義                   |
| Phase 2 設計                                 | `phase-2-design.md`                           | 型定義・メソッドシグネチャ |
| Phase 3 レビュー                             | `phase-3-design-review.md`                    | MR-01, MR-02 指摘          |
| Phase 10 結果                                | `outputs/phase-10/final-review-result.md`     | 最終レビュー判定           |
| Phase 11 結果                                | `outputs/phase-11/manual-test-result.md`      | 手動テスト結果             |
| Phase 11 発見事項                            | `outputs/phase-11/discovered-issues.md`       | スコープ外問題一覧         |
| Phase 12 ドキュメントガイド                  | `references/phase-12-documentation-guide.md`  | Part 1/2 作成手順          |
| 仕様更新ワークフロー                         | `references/spec-update-workflow.md`          | Step 1〜Step 2 手順        |
| 未タスクガイドライン                         | `references/unassigned-task-guidelines.md`    | 未タスク検出・管理手順     |
| Phase 12 同期パターン                        | `references/patterns-phase12-sync.md`         | Task 12-5 手順             |
| 06-known-pitfalls                            | `.claude/rules-disabled/06-known-pitfalls.md` | P1, P2, P3, P4, P25〜P28   |
| 要件定義書                                   | `outputs/phase-1/phase-1-requirements.md`     | Phase 1 成果物             |
| 状態遷移・型定義・メソッドシグネチャの設計書 | `outputs/phase-2/phase-2-design.md`           | Phase 2 成果物             |

## 統合テスト連携

| 観点               | 内容                                               |
| ------------------ | -------------------------------------------------- |
| Phase 3 MINOR反映  | MR-01, MR-02 の未タスク化を Task 12-4 で実施       |
| Phase 10 MINOR反映 | MINOR 指摘事項の未タスク化を Task 12-4 で実施      |
| Phase 11 引継      | 発見事項を Task 12-4 の検出ソースに含める          |
| Phase 13 への引継  | 全成果物が揃ったことを確認してから Phase 13 に進行 |

## 成果物

| 成果物                       | パス                                             | 説明                 |
| ---------------------------- | ------------------------------------------------ | -------------------- |
| 実装ガイド                   | `outputs/phase-12/implementation-guide.md`       | Part 1 + Part 2      |
| システム仕様更新サマリー     | `outputs/phase-12/system-spec-update-summary.md` | Step 1 + Step 2 結果 |
| ドキュメント変更ログ         | `outputs/phase-12/documentation-changelog.md`    | 全Step の実施結果    |
| 未タスク検出レポート         | `outputs/phase-12/unassigned-task-detection.md`  | 0件でも出力          |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`      | 改善点なしでも出力   |

## 完了条件チェックリスト

### 必須5成果物チェック

- [ ] `outputs/phase-12/implementation-guide.md` が存在する
- [ ] `outputs/phase-12/system-spec-update-summary.md` が存在する
- [ ] `outputs/phase-12/documentation-changelog.md` が存在する
- [ ] `outputs/phase-12/unassigned-task-detection.md` が存在する
- [ ] `outputs/phase-12/skill-feedback-report.md` が存在する

### Task 12-1: 実装ガイド

- [ ] Part 1 に日常の例え話が含まれている（「たとえば」が最低1回）
- [ ] Part 1 は「なぜ必要か」→「何をするか」→「たとえば」→「今回作ったもの」の順序で記述
- [ ] Part 2 に TypeScript 型定義が含まれている
- [ ] Part 2 に API シグネチャと使用例が記載されている
- [ ] Part 2 にエラーハンドリングとエッジケースの説明がある
- [ ] Part 2 に設定パラメータの一覧がある
- [ ] Part 2 にテスト構成が記載されている

### Task 12-2: システム仕様書更新

- [ ] Step 1: LOGS.md **2ファイル**更新（P1/P25対策）
- [ ] Step 1: SKILL.md **2ファイル**更新
- [ ] Step 1: topic-map.md 再生成（P2/P27対策）
- [ ] Step 2: `RuntimeSkillCreatorVerifyAndImproveResult` の仕様反映
- [ ] Step 2: `SkillCreatorVerifyResult` 拡張の仕様反映
- [ ] Step 2: `RuntimeSkillCreatorFacadeDeps` 拡張の仕様反映
- [ ] 仕様書更新は3ファイル以下/エージェントに分割

### Task 12-3: ドキュメント変更ログ

- [ ] Step 1 の結果が個別に記録されている
- [ ] Step 2 の結果が個別に記録されている
- [ ] 全Step完了後に「Phase 12完了」を記載（P4対策）

### Task 12-4: 未タスク検出

- [ ] 0件でも出力されている
- [ ] `current` / `baseline` が分離記録されている
- [ ] MR-01 が未タスク候補として検討されている
- [ ] MR-02 が未タスク候補として検討されている
- [ ] Phase 10 MINOR / Phase 11 発見事項が検出ソースに含まれている
- [ ] 未タスク管理の3ステップ（指示書・テーブル・リンク）が完了
- [ ] 該当する未タスクは `docs/30-workflows/unassigned-task/` 配下に仕様書作成

### Task 12-5: スキルフィードバック

- [ ] 改善点なしでも出力されている
- [ ] `phase12-task-spec-compliance-check.md` が root evidence として作成されている

### 全体

- [ ] `outputs/phase-12/` 配下に5ファイル全て存在する
- [ ] **本Phase内の全タスクを100%実行完了**

## 漏れやすいポイント（再掲）

| Pitfall | 要点                                                      |
| ------- | --------------------------------------------------------- |
| P1      | LOGS.md は2箇所。片方忘れやすい                           |
| P2      | topic-map.md は仕様書変更があれば必ず再生成               |
| P27     | 追加だけでなく削除・更新も再生成トリガー                  |
| P29     | worktree環境でも `.claude` 正本を実更新する               |
| P3      | 未タスクは3ステップ（指示書→テーブル→リンク）で完結させる |

## 次のPhase

Phase 13: PR作成
