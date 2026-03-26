# UT-IMP-TASK-SDK-02-PHASE11-PHASE12-EVIDENCE-COMPLIANCE-001: TASK-SDK-02 の Phase 11/12 成果物準拠是正

## メタ情報

```yaml
issue_number: 1649
task_id: UT-IMP-TASK-SDK-02-PHASE11-PHASE12-EVIDENCE-COMPLIANCE-001
task_name: TASK-SDK-02 の Phase 11/12 成果物準拠是正
category: 改善
target_feature: TASK-SDK-02 の manual test / implementation guide / compliance evidence
priority: 高
scale: 大規模
status: 未実施
source_phase: TASK-SDK-02 Phase 11-12 レビュー / 2回確認
created_date: 2026-03-26
dependencies: [TASK-SDK-02]
```

| 項目         | 内容                                                                         |
| ------------ | ---------------------------------------------------------------------------- |
| タスクID     | UT-IMP-TASK-SDK-02-PHASE11-PHASE12-EVIDENCE-COMPLIANCE-001                   |
| タスク名     | TASK-SDK-02 の Phase 11/12 成果物準拠是正                                    |
| 分類         | 改善                                                                         |
| 対象機能     | Phase 11/12 成果物、manual test 証跡、implementation guide、compliance check |
| 優先度       | 高                                                                           |
| 見積もり規模 | 大規模                                                                       |
| ステータス   | 未実施                                                                       |
| 発見元       | TASK-SDK-02 Phase 11-12 レビュー / 2回確認                                   |
| 発見日       | 2026-03-26                                                                   |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`TASK-SDK-02` は `validate-phase-output.js` と `verify-all-specs.js` を通過しているが、Phase 11/12 の human-authored 成果物が task-specification-creator の必須要件を満たしていない。

### 1.2 問題点・課題

- `implementation-guide.md` が Part 1 の例え話 / `たとえば` / why-first と、Part 2 の型・API・使用例・エラー・設定一覧を欠く
- `phase-11-manual-test.md` に `## テストケース` と `## 画面カバレッジマトリクス` がない
- `manual-test-checklist.md` と `manual-test-result.md` に TC-ID と png 紐付けがない
- `placeholder.png` を evidence として扱っており、実証跡ではなく validator 回避になっている
- `documentation-changelog.md` と `skill-feedback-report.md` が guide の必須項目を満たしていない
- `phase12-task-spec-compliance-check.md` が実質未完了でも PASS 風に閉じている

### 1.3 放置した場合の影響

- Phase 11/12 完了判定の信頼性が失われる
- 同様の docs-heavy task で placeholder と存在確認だけの close-out が再発する
- completed 移動条件を満たさないまま誤って完了扱いされる

---

## 2. 何を達成するか（What）

### 2.1 目的

TASK-SDK-02 の Phase 11/12 成果物を、guide が要求する内容品質まで引き上げる。

### 2.2 最終ゴール

- `validate-phase12-implementation-guide.js` と `validate-phase11-screenshot-coverage.js` が通る、または non-visual 例外根拠が current workflow に明示される
- compliance check が存在確認ではなく Task 12-1〜12-5 完了を反映する
- placeholder 依存を除去し、current workflow 正本で証跡が追跡できる

### 2.3 スコープ

#### 含むもの

- Phase 11 手動テスト文書の再構成
- screenshot plan / metadata / coverage の current workflow 同期
- implementation guide の全面書き直し
- documentation changelog / skill feedback / compliance check の是正

#### 含まないもの

- workflow 本体コードのバグ修正
- system spec same-wave 更新そのもの

### 2.4 成果物

- 是正済み Phase 11 / 12 成果物
- 再検証ログ

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `.agents/skills/task-specification-creator/references/phase-11-12-guide.md` と `phase-12-documentation-guide.md` を確認済みである
- current workflow の Phase 11 が visual / non-visual のどちらとして扱うかを明示的に決める

### 3.2 依存タスク

- TASK-SDK-02

### 3.3 必要な知識

- Phase 11 screenshot guide
- Phase 12 implementation guide validator
- current / baseline 分離の書き方

### 3.4 推奨アプローチ

1. Phase 11 を「本当に non-visual か」「review board capture が必要か」で再判定する
2. Phase 12 の6成果物を存在確認ではなく内容監査ベースで書き直す
3. validator PASS と guide 準拠を別々に確認する

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                                | 発見経緯                                            | 解決策                                                                   | 教訓                                                                 |
| --------------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------ | -------------------------------------------------------------------- |
| placeholder で validator を通してしまった           | verification report に placeholder 配置が残っていた | representative evidence か non-visual 例外根拠を current workflow に残す | validator の heuristic は品質保証の代替にならない                    |
| implementation guide が存在確認だけで完了扱いされた | compliance check が `present` 判定のみだった        | guide validator と本文レビューを両方回す                                 | Phase 12 は「ファイルがある」だけでは閉じない                        |
| skill feedback に next action が欠けた              | guide の Task 12-5 要件未読で close-out された      | feedback には next action / なし理由を必須化する                         | docs-heavy task でも feedback は定性的感想ではなく次アクションを持つ |

---

## 4. 実行手順

### Phase A: Phase 11 再監査

1. visual / non-visual 判定をやり直す
2. `phase-11-manual-test.md` に `## テストケース` と `## 画面カバレッジマトリクス` を追加する
3. `manual-test-checklist.md` と `manual-test-result.md` を TC-ID ベースへ是正する
4. 必要なら `screenshots/` と metadata JSON を current workflow に追加する

### Phase B: Phase 12 6成果物の是正

1. `implementation-guide.md` を guide 準拠で書き直す
2. `documentation-changelog.md` に Phase 12 実更新一覧を追記する
3. `skill-feedback-report.md` に next action を追加する
4. `phase12-task-spec-compliance-check.md` を実内容ベースへ書き換える

### Phase C: 再検証

1. `validate-phase-output.js`
2. `verify-all-specs.js`
3. `validate-phase11-screenshot-coverage.js`
4. `validate-phase12-implementation-guide.js`

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] Phase 11 文書に TC-ID / coverage / evidence path が揃っている
- [ ] implementation guide が guide の必須要件を満たす
- [ ] skill feedback に next action または「なし」の理由がある

### 品質要件

- [ ] placeholder 依存を除去するか、例外根拠を current workflow に明記している
- [ ] compliance check が Task 12-1〜12-5 の内容完了を反映している
- [ ] 再検証コマンド結果を evidence として残している

### ドキュメント要件

- [ ] Phase 11 / 12 成果物が guide 準拠で更新されている

---

## 6. 検証方法

### テストケース

- Case 1: Phase 11 文書から TC-ID と png / 非視覚根拠を追跡できる
- Case 2: implementation guide validator が PASS する
- Case 3: compliance check が未実施項目を PASS 扱いしない

### 検証手順

```bash
node .agents/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/step-02-seq-task-02-workflow-engine-runtime-orchestration
node .agents/skills/task-specification-creator/scripts/verify-all-specs.js \
  --workflow docs/30-workflows/step-02-seq-task-02-workflow-engine-runtime-orchestration --json
node .agents/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js \
  --workflow docs/30-workflows/step-02-seq-task-02-workflow-engine-runtime-orchestration --json
node .agents/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js \
  --workflow docs/30-workflows/step-02-seq-task-02-workflow-engine-runtime-orchestration --json
```

---

## 7. リスクと対策

| リスク                                        | 影響度 | 発生確率 | 対策                                                                    |
| --------------------------------------------- | ------ | -------- | ----------------------------------------------------------------------- |
| 再撮影環境が不安定で Phase 11 が止まる        | 中     | 中       | current build / fallback evidence / metadata のどれで閉じるか先に決める |
| guide 準拠の追記で本文が冗長化する            | 低     | 中       | 必須要件だけを満たし、task 非対象の話は書かない                         |
| compliance 文書だけ直して実成果物が追従しない | 高     | 中       | 6成果物の更新後に最後に compliance check を書く                         |

---

## 8. 参照情報

### 関連ドキュメント

- `.agents/skills/task-specification-creator/references/phase-11-12-guide.md`
- `.agents/skills/task-specification-creator/references/phase-12-documentation-guide.md`
- `docs/30-workflows/step-02-seq-task-02-workflow-engine-runtime-orchestration/outputs/verification-report.md`

### 参考資料

- `docs/30-workflows/step-02-seq-task-02-workflow-engine-runtime-orchestration/outputs/phase-11/`
- `docs/30-workflows/step-02-seq-task-02-workflow-engine-runtime-orchestration/outputs/phase-12/`

---

## 9. 備考

### レビュー指摘の原文（要約）

> implementation guide が Task 12-1 未達。  
> Phase 11 証跡は placeholder 依存で TC-ID が無い。  
> compliance check は存在確認だけで実内容を見ていない。
