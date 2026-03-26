# Phase 13: PR作成

## メタ情報

| 項目       | 値                                       |
| ---------- | ---------------------------------------- |
| Phase      | 13                                       |
| 機能名     | UT-SC-02-005-preload-execute-type-update |
| 作成日     | 2026-03-25                               |
| ステータス | PENDING                                  |

---

## 目的

ユーザーの明示的な許可を得てから PR を作成する。
全 Phase の成果物が揃い、品質基準を満たしていることを最終確認した上で、コード変更を PR として提出する。

---

## ルール

### 1. ユーザー承認必須

- user の明示承認がない限り **blocked** のままにする
- 「PR を作成してよいですか？」と確認し、明示的な「はい」「OK」等の承認を得ること
- 暗黙の同意や推測による承認は認めない

### 2. ローカル確認を省略しない

- PR 作成前に必ずローカル確認チェックリストを全項目実行すること
- 1 項目でも FAIL の場合は PR 作成に進まない

### 3. commit / PR を自動で作らない

- ユーザーの承認前に `git commit` や `gh pr create` を実行しない
- 承認後も、コマンド実行前にユーザーに最終確認を行う

---

## 実行タスク

### ローカル確認チェックリスト

PR 作成前に以下の全コマンドを実行し、結果を記録する。

| #   | 確認項目   | コマンド         | 期待結果    | 結果    |
| --- | ---------- | ---------------- | ----------- | ------- |
| 1   | ビルド     | `pnpm build`     | エラー 0 件 | PENDING |
| 2   | テスト     | `pnpm test`      | 全件 PASS   | PENDING |
| 3   | 型チェック | `pnpm typecheck` | エラー 0 件 | PENDING |
| 4   | Lint       | `pnpm lint`      | エラー 0 件 | PENDING |

**全項目 PASS の場合のみ、次のステップに進む。**

---

### PR 作成手順

1. ローカル確認チェックリストが全項目 PASS であることを確認する
2. ユーザーに PR 作成の承認を求める
3. ユーザーから明示的な承認を得る
4. 以下のコマンドで PR を作成する:

```
/ai:diff-to-pr
```

5. PR の内容を確認し、ユーザーに報告する

---

### PR 記載内容（テンプレート）

```markdown
## 概要

UT-SC-02-005: Preload skill-creator-api.ts の executePlan 戻り値型を RuntimeSkillCreatorExecuteResponse に更新

## 変更内容

- skill-creator-api.ts: executePlan の戻り値型を IpcResult<RuntimeSkillCreatorExecuteResponse> に更新
- SkillLifecyclePanel.tsx: "type" in result.data による型ナロイングを追加
- terminal_handoff 型の暫定ハンドリングを実装

## 受け入れ基準

- [x] AC-1: Preload 型更新
- [x] AC-2: 型ナロイング実装
- [x] AC-3: typecheck PASS
- [x] AC-4: テスト PASS

## テスト

- pnpm typecheck: PASS
- pnpm test: PASS
- pnpm lint: PASS
```

---

## 参照資料

| 資料名       | パス                                          | 説明           |
| ------------ | --------------------------------------------- | -------------- |
| 設計書       | `outputs/phase-2/design-document.md`          | Phase 2成果物  |
| Green結果    | `outputs/phase-5/green-state-verification.md` | Phase 5成果物  |
| テスト拡充   | `outputs/phase-6/test-expansion-results.md`   | Phase 6成果物  |
| カバレッジ   | `outputs/phase-7/coverage-report.md`          | Phase 7成果物  |
| リファクタ   | `outputs/phase-8/refactoring-log.md`          | Phase 8成果物  |
| 品質保証     | `outputs/phase-9/quality-report.md`           | Phase 9成果物  |
| 最終レビュー | `outputs/phase-10/final-review-result.md`     | Phase 10成果物 |
| 手動テスト   | `outputs/phase-11/manual-test-result.md`      | Phase 11成果物 |
| ドキュメント | `outputs/phase-12/documentation-changelog.md` | Phase 12成果物 |

---

## PR本文セクション連携ルール（必須）

- `/ai:diff-to-pr` の Phase 3.6 で、staged差分から `TARGET_WORKFLOW_DIR` を1件特定する
- Phase 11/12成果物パス（`implementation-guide.md` / `screenshot-coverage.md` / `screenshots/`）は `TARGET_WORKFLOW_DIR` 配下のみ参照する
- PR本文 `## その他` に、Phase 12 実装ガイド反映元パスと要点（Part 1/Part 2）を必ず記載する
- `implementation-guide.md` の全文を PRコメントとして必ず投稿する
- UI/UX変更がない場合は PR本文 `## スクリーンショット` セクションを削除する
- workflow候補が複数ある場合は、PR作成前にユーザーへ対象workflowを確認する

---

## 成果物

| 成果物           | パス                                     | 内容                        |
| ---------------- | ---------------------------------------- | --------------------------- |
| ローカル確認結果 | `outputs/phase-13/local-check-result.md` | チェックリスト実行結果      |
| 変更サマリ       | `outputs/phase-13/change-summary.md`     | PR に含まれる変更内容の要約 |
| PR情報           | `outputs/phase-13/pr-info.md`            | PR URL等                    |

### local-check-result.md 記載項目

- 各チェック項目の実行結果（PASS / FAIL）
- コマンド出力のサマリ
- 総合判定

### change-summary.md 記載項目

- 変更ファイル一覧（パス + 変更概要）
- 受け入れ基準の達成状況
- 影響範囲の分析

---

## 完了条件

- [ ] ローカル確認チェックリストの全項目が PASS している
- [ ] ユーザーから明示的な PR 作成承認を得ている
- [ ] PR が作成されている（または承認待ち状態である）
- [ ] CIが通過している
- [ ] local-check-result.md が作成されている
- [ ] change-summary.md が作成されている
- [ ] pr-info.md が作成されている
- [ ] タスクディレクトリがcompleted-tasksに移動されている
- [ ] **本Phase内の全作業を100%完了（PR作成・CI確認・移動）**

---

## タスク100%実行確認【必須】

- [ ] ローカル確認チェックリストを全項目実行した
- [ ] ユーザーへの承認確認を行った
- [ ] ユーザーの承認を得てから PR 作成コマンドを実行した
- [ ] CIが通過したことを確認した
- [ ] 成果物を所定パスに出力した（local-check-result.md, change-summary.md, pr-info.md）
- [ ] タスクディレクトリをcompleted-tasksに移動した
- [ ] 完了条件を全て満たした

---

## 多角的チェック観点（AIが判断）

タスクの性質に応じて、以下の観点を確認する。

| 観点               | 適用判断 | 仕様参照先                                             |
| ------------------ | -------- | ------------------------------------------------------ |
| セキュリティ       | 適用     | `aiworkflow-requirements: security-api-electron.md`    |
| アーキテクチャ     | 適用     | `aiworkflow-requirements: architecture-*.md`           |
| API設計            | 適用     | `aiworkflow-requirements: api-*.md`, `interfaces-*.md` |
| エラーハンドリング | 適用     | `aiworkflow-requirements: error-handling.md`           |
| UI/UX              | 非適用   | -                                                      |
| データ整合性       | 非適用   | -                                                      |
| パフォーマンス     | 非適用   | -                                                      |
| アクセシビリティ   | 非適用   | -                                                      |

**Electronデスクトップアプリ観点**（本プロジェクト固有）:

| 層                         | 適用判断 | 仕様参照先                                             |
| -------------------------- | -------- | ------------------------------------------------------ |
| IPC通信                    | 適用     | `aiworkflow-requirements: api-*.md`, `interfaces-*.md` |
| Preload/セキュリティ       | 適用     | `aiworkflow-requirements: security-api-electron.md`    |
| フロントエンド（Renderer） | 適用     | `aiworkflow-requirements: ui-ux-*.md`                  |
| バックエンド（Main）       | 非適用   | -                                                      |
| ローカルストレージ         | 非適用   | -                                                      |

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. ローカル確認チェックリスト実行
2. ユーザーへの承認確認
3. PR作成実行
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

---

## タスク完了処理【必須】

**本 workflow は完了判定後に `completed-tasks/` へ移動済みである。**

### 移動手順

```bash
# 移動後の配置確認
ls docs/30-workflows/completed-tasks/ | grep UT-SC-02-005
```

---

## 次Phase

なし（本タスクの最終 Phase）
