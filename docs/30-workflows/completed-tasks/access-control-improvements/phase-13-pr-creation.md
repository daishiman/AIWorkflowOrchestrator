# Phase 13: PR作成 - タスク仕様書

## メタ情報

| 項目       | 内容                        |
| ---------- | --------------------------- |
| Phase      | 13                          |
| Phase名    | PR作成                      |
| 前提Phase  | Phase 12                    |
| 後続Phase  | -（最終Phase）              |
| ステータス | 未実施                      |
| 作成日     | 2026-01-18                  |
| 機能名     | access-control-improvements |

---

## 目的

認可機能の実装をmainブランチにマージするためのPull Requestを作成する。

## 背景

全てのPhaseが完了し、品質基準を満たしたため、PRを作成してレビューを依頼する。

---

## 実行タスク

### タスク1: ローカル動作確認依頼【必須】

**目的**: ユーザーにローカル環境での動作確認を依頼する

**重要**: PR作成前に、ユーザーにローカル環境での動作確認を依頼する。

**確認依頼内容**:

```bash
# ビルド確認
pnpm build

# テスト確認
pnpm test

# 型チェック確認
pnpm typecheck

# Lint確認
pnpm lint
```

**期待される成果物**: ユーザーによるローカル動作確認完了

---

### タスク2: 変更サマリー提示と許可確認【必須】

**目的**: 変更内容のサマリーを提示し、PR作成の許可を得る

**重要**: ユーザーから明示的な許可を得るまでPR作成を実行しないこと。

**提示内容**:

- 変更ファイル一覧
- 変更内容の概要
- PR作成の許可確認

**期待される成果物**: ユーザーからのPR作成許可

---

### タスク3: PR作成

**目的**: ユーザーの許可を得た後、`/ai:diff-to-pr`でPull Requestを作成する

**実行コマンド**:

```
/ai:diff-to-pr
```

**PRテンプレート**:

```markdown
## 概要

チャット履歴機能にセッション所有者認可チェックを追加し、OWASP A01: Broken Access Control脆弱性を修正する。

## 変更内容

- UnauthorizedErrorクラスの追加
- isUnauthorizedError型ガードの追加
- verifySessionOwnershipヘルパーの実装
- getSession, deleteSession, exportToMarkdown, exportToJsonへの認可チェック追加
- IPCハンドラーの修正

## テスト

- [ ] ユニットテスト: 認可チェックテスト全件パス
- [ ] カバレッジ: Line 80%+, Branch 60%+, Function 80%+
- [ ] 手動テスト: 正常系・異常系シナリオ確認済み

## セキュリティ

- [x] OWASP A01準拠確認済み
- [x] 情報漏洩防止確認済み
- [x] Fail-Secure設計確認済み

## 関連Issue

- SECURITY-001: Access Control Improvements
```

**期待される成果物**: Pull Request

---

### タスク4: CIの確認

**目的**: CI/CDパイプラインが成功することを確認する

**確認項目**:

- [ ] ビルドが成功している
- [ ] テストが成功している
- [ ] Lintが成功している
- [ ] 型チェックが成功している

**期待される成果物**: CI成功確認

---

### タスク5: タスク完了処理【必須】

**目的**: タスクディレクトリをcompleted-tasksに移動する

**重要**: PRが作成され、CIが通過した後に実行する。

**移動手順**:

```bash
# タスクディレクトリをcompleted-tasksに移動
mv docs/30-workflows/access-control-improvements/ docs/30-workflows/completed-tasks/

# 移動を確認
ls docs/30-workflows/completed-tasks/ | grep access-control-improvements

# 変更をコミット
git add docs/30-workflows/
git commit -m "docs(workflows): access-control-improvementsをcompleted-tasksに移動"
git push
```

**期待される成果物**: タスクディレクトリの移動完了

---

### タスク6: PR作成結果の記録

**目的**: PR作成結果を記録する

**記載内容**:

- PR URL
- CI結果
- レビュー準備状況

**期待される成果物**: `outputs/phase-13/pr-creation-report.md`

---

## 成果物

| 成果物         | パス                                     | 内容             |
| -------------- | ---------------------------------------- | ---------------- |
| PR作成レポート | `outputs/phase-13/pr-creation-report.md` | PR URL・作成結果 |

---

## 完了条件

- [ ] ユーザーにローカル動作確認を依頼している
- [ ] 変更サマリーを提示しPR作成の許可を得ている
- [ ] 全変更がコミットされている
- [ ] PRが作成されている
- [ ] CIが成功している
- [ ] タスクディレクトリがcompleted-tasksに移動されている
- [ ] PR作成レポートが作成されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 12（ドキュメント更新）が完了していること
- **後続**: PRレビュー・マージ（本ワークフロー外）

---

## ワークフロー完了

このPhaseの完了をもって、access-control-improvementsワークフローは完了となります。

### 完了チェックリスト

- [ ] Phase 1-13の全タスクが完了している
- [ ] 全ての成果物が生成されている
- [ ] PRが作成されレビュー待ち状態である
- [ ] CIが成功している

### 成果物一覧

| Phase    | 成果物                                                                      |
| -------- | --------------------------------------------------------------------------- |
| Phase 1  | `outputs/phase-1/requirements-authorization.md`                             |
| Phase 2  | `outputs/phase-2/design-authorization.md`                                   |
| Phase 3  | `outputs/phase-3/design-review-report.md`                                   |
| Phase 6  | `outputs/phase-6/coverage-report.md`                                        |
| Phase 7  | `outputs/phase-7/coverage-report.md`                                        |
| Phase 8  | `outputs/phase-8/refactoring-report.md`                                     |
| Phase 9  | `outputs/phase-9/quality-report.md`                                         |
| Phase 10 | `outputs/phase-10/final-review-report.md`                                   |
| Phase 11 | `outputs/phase-11/manual-test-report.md`                                    |
| Phase 12 | `outputs/phase-12/documentation-update.md`                                  |
| Phase 13 | `outputs/phase-13/pr-creation-report.md`                                    |
| 実装     | `packages/shared/src/features/chat-history/errors.ts`                       |
| テスト   | `packages/shared/src/features/chat-history/__tests__/authorization.test.ts` |
