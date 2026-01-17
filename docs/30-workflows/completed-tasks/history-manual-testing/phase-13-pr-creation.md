# Phase 13: PR作成 - タスク仕様書

## メタ情報

| 項目       | 内容                     |
| ---------- | ------------------------ |
| Phase      | 13                       |
| Phase名    | PR作成                   |
| 前提Phase  | Phase 12                 |
| 後続Phase  | なし（ワークフロー完了） |
| ステータス | 未実施                   |
| 作成日     | 2026-01-16               |
| 機能名     | history-manual-testing   |

---

## 目的

変更をコミットし、ユーザーの明示的な許可を得てからPull Requestを作成し、CIを確認する。

## 背景

手動テスト実施とドキュメント作成が完了し、テスト結果レポートと実装ガイドが作成された状態。これらの成果物をPRとしてまとめ、レビュー可能な状態にする。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: ローカル動作確認依頼【必須】

**目的**: ユーザーにローカルでの動作確認を依頼する。

**実行手順**:

1. ユーザーに以下の確認を依頼
   - 生成されたドキュメントの内容確認
   - テスト結果レポートの妥当性確認
   - 未タスク検出レポートの確認
2. 確認項目
   - `outputs/phase-11/manual-test-result.md` の内容
   - `outputs/phase-11/discovered-issues.md` の内容
   - `outputs/phase-12/implementation-guide.md` の内容
   - `outputs/phase-12/unassigned-task-report.md` の内容

**期待される成果物**:

- ユーザーからの確認完了

---

### タスク2: 変更サマリー提示と許可確認【必須】

**目的**: 変更内容のサマリーを提示しPR作成の許可を確認する。

**実行手順**:

1. 変更内容のサマリーを作成

   ```markdown
   ## 変更サマリー

   ### 新規作成ファイル

   - `docs/30-workflows/history-manual-testing/index.md` - メインタスク仕様書
   - `docs/30-workflows/history-manual-testing/phase-1-requirements.md` - Phase 1仕様書
   - `docs/30-workflows/history-manual-testing/phase-11-manual-test.md` - Phase 11仕様書
   - `docs/30-workflows/history-manual-testing/phase-12-documentation.md` - Phase 12仕様書
   - `docs/30-workflows/history-manual-testing/phase-13-pr-creation.md` - Phase 13仕様書
   - `docs/30-workflows/history-manual-testing/artifacts.json` - 成果物管理
   - `outputs/phase-1/` - Phase 1成果物
   - `outputs/phase-11/` - Phase 11成果物（テスト結果）
   - `outputs/phase-12/` - Phase 12成果物（ドキュメント）

   ### 変更なし

   - コード変更なし（ドキュメントのみ）
   ```

2. ユーザーにPR作成の許可を求める
   - 「上記の変更をPRとして作成してもよろしいですか？」

**重要**: ユーザーから明示的な許可を得るまでPR作成を実行しないこと。

**期待される成果物**:

- ユーザーからのPR作成許可

---

### タスク3: `/ai:diff-to-pr` 実行

**目的**: ユーザーの許可を得た後、PR作成を実行する。

**実行手順**:

1. ユーザーの許可を確認
2. `/ai:diff-to-pr` を実行
   ```
   /ai:diff-to-pr
   ```
3. PRが作成されることを確認

**フォールバック**（`/ai:diff-to-pr`が使えない場合）:

1. 変更をコミット

   ```bash
   git add docs/30-workflows/history-manual-testing/
   git commit -m "docs(workflows): history-manual-testing タスク仕様書作成

   - Phase 1: 要件定義
   - Phase 11: 手動テスト検証
   - Phase 12: ドキュメント更新
   - Phase 13: PR作成

   Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
   ```

2. ブランチをプッシュ
   ```bash
   git push -u origin docs/task-history-manual-testing-spec
   ```
3. PRを作成
   ```bash
   gh pr create --title "docs(workflows): history-manual-testing タスク仕様書作成" --body "..."
   ```

**期待される成果物**:

- PR URL

---

### タスク4: CI確認

**目的**: CIが通過したことを確認する。

**実行手順**:

1. PR作成後、CIの実行を確認
2. CIが通過することを確認
3. 失敗した場合は原因を調査し修正

**期待される成果物**:

- CI通過確認

---

### タスク5: PR情報記録

**目的**: PR情報を記録する。

**実行手順**:

1. `outputs/phase-13/pr-info.md`を作成

   ```markdown
   # PR情報

   ## PR詳細

   | 項目     | 内容                                  |
   | -------- | ------------------------------------- |
   | PR URL   | https://github.com/xxx/xxx/pull/XXX   |
   | ブランチ | docs/task-history-manual-testing-spec |
   | 作成日   | 2026-01-XX                            |
   | CI状態   | PASS / FAIL                           |

   ## 変更ファイル一覧

   - docs/30-workflows/history-manual-testing/index.md
   - docs/30-workflows/history-manual-testing/phase-\*.md
   - docs/30-workflows/history-manual-testing/artifacts.json
   - docs/30-workflows/history-manual-testing/outputs/

   ## レビュー依頼

   レビュー観点:

   - [ ] タスク仕様書の記載内容は適切か
   - [ ] Phase構成は妥当か
   - [ ] テストケースは網羅的か
   ```

**期待される成果物**:

- `outputs/phase-13/pr-info.md`

---

## 参照資料

| 参照資料       | パス                | 説明         |
| -------------- | ------------------- | ------------ |
| Phase 11成果物 | `outputs/phase-11/` | テスト結果   |
| Phase 12成果物 | `outputs/phase-12/` | ドキュメント |

---

## 成果物

| 成果物 | パス                          | 説明           |
| ------ | ----------------------------- | -------------- |
| PR情報 | `outputs/phase-13/pr-info.md` | PR URL・状態等 |

---

## 完了条件

- [ ] ユーザーにローカル動作確認を依頼している
- [ ] 変更サマリーを提示しPR作成の許可を得ている
- [ ] 全変更がコミットされている
- [ ] PRが作成されている
- [ ] CIが通過している
- [ ] レビュー準備が完了している
- [ ] **本Phase内の全作業を100%完了（PR作成・CI確認）**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. ローカル動作確認依頼
2. 変更サマリー提示と許可確認
3. `/ai:diff-to-pr` 実行
4. CI確認
5. PR情報記録
6. タスク完了処理（completed-tasksへ移動）
7. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

---

## タスク完了処理【必須】

**PRが作成され、CIが通過した後、タスクディレクトリを完了タスクフォルダに移動する。**

### 移動手順

```bash
# タスクディレクトリをcompleted-tasksに移動
mv docs/30-workflows/history-manual-testing/ docs/30-workflows/completed-tasks/

# 移動を確認
ls docs/30-workflows/completed-tasks/ | grep history-manual-testing

# 変更をコミット
git add docs/30-workflows/
git commit -m "docs(workflows): history-manual-testingをcompleted-tasksに移動"
git push
```

---

## 依存関係

- **前提**: Phase 12 が完了していること
- **後続**: なし（ワークフロー完了）

---

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 13 実行記録

### 実行タスク

- ローカル動作確認依頼: {{result}}
- 変更サマリー提示と許可確認: {{result}}
- /ai:diff-to-pr 実行: {{result}}
- CI確認: {{result}}
- PR情報記録: {{result}}

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 完了報告

- PR URL: {{PR_URL}}
- マージ準備: 完了
```

---

## 次のPhase

なし（ワークフロー完了）

**タスク完了おめでとうございます！** PRがマージされたら、本タスクは完全に完了となります。
