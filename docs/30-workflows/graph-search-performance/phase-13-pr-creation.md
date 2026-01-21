# Phase 13: PR作成 - タスク仕様書

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| Phase      | 13                           |
| Phase名    | PR作成                       |
| 前提Phase  | Phase 12（ドキュメント更新） |
| 後続Phase  | なし（完了）                 |
| ステータス | 未実施                       |
| 作成日     | 2026-01-18                   |
| 機能名     | graph-search-performance     |

---

## 目的

変更内容を整理し、PR作成とCI確認を実施して完了状態にする。

## 背景

実装完了後は変更内容を明確にし、レビュー可能な状態でPRを作成する必要がある。

---

## 使用スキル

- `/ai:diff-to-pr`: 差分確認・コミット・PR作成・CI確認に使用する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: ローカル動作確認依頼

**目的**: PR作成前にユーザーのローカル動作確認を得る。

**実行手順**:

1. ユーザーにローカル動作確認を依頼する。
2. `pnpm test` を実行する。
3. `pnpm typecheck` を実行する。
4. `pnpm lint` を実行する。
5. 結果を `outputs/phase-13/local-check-result.md` に記録する。

**期待される成果物**:

- `outputs/phase-13/local-check-result.md`

---

### タスク2: 変更サマリー提示と許可確認

**目的**: PR作成に必要なユーザー許可を得る。

**実行手順**:

1. 変更内容のサマリーを整理する。
2. PR作成の許可をユーザーに確認する。
3. 許可結果を `outputs/phase-13/pr-info.md` に記録する。

**期待される成果物**:

- `outputs/phase-13/pr-info.md`

---

### タスク3: PR作成とCI確認

**目的**: PRを作成し、CIの成功を確認する。

**実行手順**:

1. **ユーザー許可を得た上で** `/ai:diff-to-pr` を実行する。
2. PR URLとCI状況を確認する。
3. `outputs/phase-13/pr-info.md` を更新する。

**期待される成果物**:

- `outputs/phase-13/pr-info.md`

---

### タスク4: 完了処理

**目的**: タスク完了状態に移行する。

**実行手順**:

1. CIが成功していることを確認する。
2. 「タスク完了処理【必須】」に従ってディレクトリを移動する。
3. 完了報告を `outputs/phase-13/completion-report.md` に記録する。

**期待される成果物**:

- `outputs/phase-13/completion-report.md`

---

## 参照資料

**前Phase成果物**

| 参照資料             | パス                                           | 内容           |
| -------------------- | ---------------------------------------------- | -------------- |
| 要件定義             | `outputs/phase-1/requirements-definition.md`   | 要件一覧       |
| キャッシュ設計       | `outputs/phase-2/cache-design.md`              | キャッシュ仕様 |
| 実装サマリー         | `outputs/phase-5/implementation-summary.md`    | 実装内容       |
| テスト拡充結果       | `outputs/phase-6/coverage-report.md`           | カバレッジ分析 |
| ゲート判定結果       | `outputs/phase-7/gate-result.md`               | 判定結果       |
| リファクタリング記録 | `outputs/phase-8/refactoring-log.md`           | 変更点         |
| 品質レポート         | `outputs/phase-9/quality-report.md`            | 品質検証結果   |
| 最終レビュー結果     | `outputs/phase-10/final-review-result.md`      | 判定結果       |
| 手動テスト結果       | `outputs/phase-11/manual-test-result.md`       | 手動検証結果   |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-update-log.md` | 更新内容       |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`     | 実装説明       |

---

## 成果物

| 成果物           | パス                                     | 内容       |
| ---------------- | ---------------------------------------- | ---------- |
| ローカル確認結果 | `outputs/phase-13/local-check-result.md` | テスト結果 |
| PR情報           | `outputs/phase-13/pr-info.md`            | PR URLとCI |
| 完了報告         | `outputs/phase-13/completion-report.md`  | 完了記録   |

---

## 完了条件

- [ ] ユーザーにローカル動作確認を依頼している
- [ ] 変更サマリーを提示しPR作成の許可を得ている
- [ ] ローカル確認結果が記録されている
- [ ] 全変更がコミットされている
- [ ] PRが作成されている
- [ ] CIが成功している
- [ ] レビュー準備が完了している
- [ ] タスクディレクトリがcompleted-tasksに移動されている
- [ ] **本Phase内の全作業を100%完了（PR作成・CI確認・移動）**

---

## タスク完了処理【必須】

**PRが作成され、CIが通過した後、タスクディレクトリを完了タスクフォルダに移動する。**

### 移動手順

```bash
# タスクディレクトリをcompleted-tasksに移動
mv docs/30-workflows/graph-search-performance/ docs/30-workflows/completed-tasks/

# 移動を確認
ls docs/30-workflows/completed-tasks/ | rg graph-search-performance

# 変更をコミット
git add docs/30-workflows/
git commit -m "docs(workflows): graph-search-performanceをcompleted-tasksに移動"
git push
```

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 本Phase内の全スキルを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] スキルフィードバックが記録されている

---

## スキルフィードバック記録

| スキル         | 結果    | 備考                   |
| -------------- | ------- | ---------------------- |
| /ai:diff-to-pr | pending | 実行後に結果を記録する |

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 成果物の作成・配置
4. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

---

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/graph-search-performance --phase 13
```

---

## Phase実行記録

Phase完了後、以下を記録してください:

```markdown
## Phase 13 実行記録

### 実行タスク

| タスク                     | 結果   | 備考 |
| -------------------------- | ------ | ---- |
| ローカル動作確認依頼       | 未実施 |      |
| 変更サマリー提示と許可確認 | 未実施 |      |
| PR作成とCI確認             | 未実施 |      |
| 完了処理                   | 未実施 |      |

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phaseへの引き継ぎ事項

- なし
```

---

## 次のPhase

なし（ワークフロー完了）
