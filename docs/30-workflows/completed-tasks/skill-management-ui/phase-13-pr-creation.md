# Phase 13: PR作成・CI確認 - タスク仕様書

## メタ情報

| 項目       | 内容                |
| ---------- | ------------------- |
| Phase      | 13                  |
| Phase名    | PR作成・CI確認      |
| 前提Phase  | Phase 12            |
| 後続Phase  | なし（完了）        |
| ステータス | 未実施              |
| 作成日     | 2026-01-10          |
| 機能名     | skill-management-ui |

---

## 目的

実装完了後、Pull Requestを作成し、CIパイプラインの成功を確認してマージ準備を完了する。

## 背景

Pull Requestは、コードレビュー・CI検証・マージの起点となる。適切なPR作成とCI成功確認により、品質を担保した状態でマージを行う。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 変更内容の確認

**目的**: コミット前に変更内容を最終確認する

**実行手順**:

1. 変更ファイルを確認:

```bash
git status
git diff --stat
```

2. 変更内容チェックリスト:

| 確認項目                       | 結果 |
| ------------------------------ | ---- |
| 不要なファイルが含まれていない | [ ]  |
| デバッグコードが残っていない   | [ ]  |
| console.logが残っていない      | [ ]  |
| TODOコメントが解決されている   | [ ]  |
| 機密情報が含まれていない       | [ ]  |
| テストファイルが含まれている   | [ ]  |

**期待される成果物**:

- 変更内容確認結果（`outputs/phase-13/change-verification.md`）

---

### タスク2: コミットの作成

**目的**: 適切なコミットメッセージで変更をコミットする

**実行手順**:

1. ステージング:

```bash
git add .
```

2. コミット（Conventional Commits形式）:

```bash
git commit -m "feat(agent): implement skill management UI (AGENT-002)

- Add SkillList component for displaying imported skills
- Add SkillCard component for individual skill display
- Add SkillDetailPanel for skill details and actions
- Add SkillImportDialog for importing new skills
- Add SkillSearchBar for skill search functionality
- Add SkillCategoryFilter for category filtering
- Integrate skill management into AgentView
- Add SkillSlice for state management
- Add IPC handlers for skill operations
- Add unit tests and integration tests
- Add comprehensive documentation

Closes #AGENT-002"
```

3. コミット確認:

```bash
git log --oneline -1
```

| 確認項目                             | 結果 |
| ------------------------------------ | ---- |
| コミットメッセージがConventional形式 | [ ]  |
| 変更内容が適切に記述されている       | [ ]  |
| Issue番号が紐づけられている          | [ ]  |

**期待される成果物**:

- コミット作成完了（Gitログで確認）

---

### タスク3: プッシュ

**目的**: ローカルの変更をリモートにプッシュする

**実行手順**:

1. リモートにプッシュ:

```bash
git push origin task/skill-management-ui
```

2. プッシュ確認:

| 確認項目                     | 結果 |
| ---------------------------- | ---- |
| プッシュが成功した           | [ ]  |
| リモートブランチが作成された | [ ]  |

**期待される成果物**:

- プッシュ完了（リモートで確認）

---

### タスク4: Pull Request作成

**目的**: GitHub上でPull Requestを作成する

**実行手順**:

1. PR作成（GitHub CLI使用）:

```bash
gh pr create \
  --title "feat(agent): implement skill management UI (AGENT-002)" \
  --body "## 概要
AgentView内にスキル管理UIを実装し、ユーザーがスキルをインポート・一覧・検索・詳細表示できるようにしました。

## 変更内容
### 追加されたコンポーネント
- **SkillList**: インポート済みスキルの一覧表示
- **SkillCard**: 個別スキルのカード表示
- **SkillDetailPanel**: スキル詳細情報の表示
- **SkillImportDialog**: スキルインポートダイアログ
- **SkillSearchBar**: スキル検索機能
- **SkillCategoryFilter**: カテゴリフィルター

### 状態管理
- **SkillSlice**: Zustand Sliceパターンによる状態管理

### IPC通信
- skill:list - スキル一覧取得
- skill:available - 利用可能スキル取得
- skill:import - スキルインポート
- skill:remove - スキル削除
- skill:search - スキル検索

## テスト
- [x] ユニットテスト: 全コンポーネント
- [x] 統合テスト: IPC通信・状態管理
- [x] アクセシビリティテスト
- [x] 手動テスト完了

## スクリーンショット
[スクリーンショットを追加]

## チェックリスト
- [x] コードがESLint/Prettierに準拠
- [x] TypeScriptエラーなし
- [x] テストが全て成功
- [x] カバレッジ基準を満たす
- [x] ドキュメントを更新
- [x] AGENT-001（ダッシュボード基盤）に依存

## 関連Issue
Closes #AGENT-002

## レビュー観点
- コンポーネント設計の妥当性
- 状態管理パターンの適切さ
- IPC通信のエラーハンドリング
- アクセシビリティ対応" \
  --base main \
  --head task/skill-management-ui
```

2. PR確認:

| 確認項目                       | 結果 |
| ------------------------------ | ---- |
| PRが作成された                 | [ ]  |
| タイトルが適切                 | [ ]  |
| 説明が十分                     | [ ]  |
| ラベルが設定されている         | [ ]  |
| レビュアーがアサインされている | [ ]  |

**期待される成果物**:

- Pull Request URL（`outputs/phase-13/pr-url.md`）

---

### タスク5: CI実行の確認

**目的**: CIパイプラインが正常に実行されることを確認する

**実行手順**:

1. CI実行状況を確認:

```bash
gh pr checks
```

2. CI確認チェックリスト:

| CIジョブ          | ステータス | 結果 |
| ----------------- | ---------- | ---- |
| Lint              | [ ]        | [ ]  |
| TypeCheck         | [ ]        | [ ]  |
| Unit Tests        | [ ]        | [ ]  |
| Integration Tests | [ ]        | [ ]  |
| Build             | [ ]        | [ ]  |
| Coverage Report   | [ ]        | [ ]  |

3. CI失敗時の対応:
   - 失敗原因を特定
   - 修正をコミット
   - 再度CIを確認

**期待される成果物**:

- CI実行結果確認（`outputs/phase-13/ci-result.md`）

---

### タスク6: レビュー準備

**目的**: レビュアーがレビューしやすい状態を整える

**実行手順**:

1. レビュー準備チェックリスト:

| 確認項目                             | 結果 |
| ------------------------------------ | ---- |
| PR説明が十分                         | [ ]  |
| スクリーンショットが添付されている   | [ ]  |
| 変更の背景・目的が明確               | [ ]  |
| テスト結果が記載されている           | [ ]  |
| 特に確認してほしい点が明記されている | [ ]  |

2. コメントでレビュー観点を補足（必要に応じて）

**期待される成果物**:

- レビュー準備完了確認（`outputs/phase-13/review-ready.md`）

---

### タスク7: マージ準備完了の確認

**目的**: マージ準備が完了していることを最終確認する

**実行手順**:

1. マージ準備チェックリスト:

| 確認項目                            | 結果 |
| ----------------------------------- | ---- |
| 全CIジョブが成功                    | [ ]  |
| コンフリクトがない                  | [ ]  |
| レビュー承認を待つ状態              | [ ]  |
| ドキュメントが更新されている        | [ ]  |
| Breaking Changeがない（または明記） | [ ]  |

2. マージブロッカーがないことを確認

**期待される成果物**:

- マージ準備完了確認（`outputs/phase-13/merge-ready.md`）

---

### タスク8: 完了報告

**目的**: タスク完了を報告し、次のアクションを明確にする

**実行手順**:

1. 完了報告を作成:

```markdown
# AGENT-002 スキル管理UI - 完了報告

## ステータス

✅ 実装完了・PR作成済み

## PR情報

- URL: [PR URL]
- ブランチ: task/skill-management-ui
- ベース: main

## 実装内容

- SkillList/SkillCard/SkillDetailPanel/SkillImportDialog
- SkillSearchBar/SkillCategoryFilter
- SkillSlice（状態管理）
- IPC API（skill:list/available/import/remove/search）

## テスト結果

- ユニットテスト: ✅ 全て成功
- 統合テスト: ✅ 全て成功
- カバレッジ: Line XX%, Branch XX%, Function XX%

## 次のアクション

1. コードレビューを待つ
2. レビュー指摘があれば対応
3. 承認後、mainにマージ
4. AGENT-003/AGENT-004の開発へ進む
```

2. 完了報告を記録

**期待される成果物**:

- 完了報告書（`outputs/phase-13/completion-report.md`）

---

## 成果物

| 成果物               | パス                                      | 内容         |
| -------------------- | ----------------------------------------- | ------------ |
| 変更内容確認結果     | `outputs/phase-13/change-verification.md` | 変更確認     |
| PR URL               | `outputs/phase-13/pr-url.md`              | PR情報       |
| CI実行結果確認       | `outputs/phase-13/ci-result.md`           | CI結果       |
| レビュー準備完了確認 | `outputs/phase-13/review-ready.md`        | レビュー準備 |
| マージ準備完了確認   | `outputs/phase-13/merge-ready.md`         | マージ準備   |
| 完了報告書           | `outputs/phase-13/completion-report.md`   | 完了報告     |

---

## 完了条件

- [ ] 変更内容の確認が完了している
- [ ] コミットが作成されている
- [ ] リモートにプッシュされている
- [ ] Pull Requestが作成されている
- [ ] CIが全て成功している
- [ ] レビュー準備が完了している
- [ ] マージ準備が完了している
- [ ] 完了報告が作成されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 12（ドキュメント更新）が完了していること
- **後続**: なし（タスク完了）

---

## タスク完了後のアクション

1. **コードレビュー**: レビュアーからのフィードバックを待つ
2. **レビュー対応**: 指摘があれば修正をコミット
3. **マージ**: 承認後、mainブランチにマージ
4. **後続タスク**: AGENT-003/AGENT-004の開発へ進む

---

## 関連タスク

| タスクID  | タスク名                       | 関係         |
| --------- | ------------------------------ | ------------ |
| AGENT-001 | エージェントダッシュボード基盤 | 依存（前提） |
| AGENT-003 | スキル管理バックエンド         | 後続         |
| AGENT-004 | エージェント実行UI             | 後続         |
