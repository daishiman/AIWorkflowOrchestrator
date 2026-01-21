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
| 機能名     | embedding-late-chunking      |

---

## 目的

変更をコミットし、ユーザーの明示的な許可を得てからPull Requestを作成し、CIを確認する。

## 背景

PR作成はユーザー確認が必要であり、CI結果の確認まで含めて完了とする。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: ローカル動作確認依頼

**目的**: ユーザーにローカル動作確認を依頼する

**実行手順**:

1. 変更内容と確認コマンドを整理
2. ユーザーにローカルでの動作確認を依頼

**期待される成果物**:

- `outputs/phase-13/pr-info.md`

---

### タスク2: 変更サマリー提示と許可確認

**目的**: PR作成の許可を得る

**実行手順**:

1. 変更サマリーを提示
2. PR作成の明示的な許可を得る

**期待される成果物**:

- `outputs/phase-13/pr-info.md`

---

### タスク3: PR作成とCI確認

**目的**: `/ai:diff-to-pr` を実行しCIを確認する

**実行手順**:

1. ユーザー許可後に `/ai:diff-to-pr` を実行
2. PR URLとCI結果を記録

**期待される成果物**:

- `outputs/phase-13/pr-info.md`

---

## 参照資料

**前Phase成果物**

| 参照資料             | パス                                           | 内容       |
| -------------------- | ---------------------------------------------- | ---------- |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-update-log.md` | 更新履歴   |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`     | 実装ガイド |

**依存Phase成果物**

| 参照資料                 | パス                                         | 内容           |
| ------------------------ | -------------------------------------------- | -------------- |
| Phase 1 要件定義         | `outputs/phase-1/requirements-definition.md` | 要件整理       |
| Phase 2 設計             | `outputs/phase-2/architecture-design.md`     | 設計まとめ     |
| Phase 5 実装             | `outputs/phase-5/implementation-summary.md`  | 実装サマリー   |
| Phase 6 テスト拡充       | `outputs/phase-6/coverage-report.md`         | カバレッジ分析 |
| Phase 7 カバレッジ確認   | `outputs/phase-7/coverage-report.md`         | 再測定結果     |
| Phase 8 リファクタリング | `outputs/phase-8/refactoring-log.md`         | 変更記録       |
| Phase 9 品質保証         | `outputs/phase-9/quality-summary.md`         | 品質まとめ     |
| Phase 10 最終レビュー    | `outputs/phase-10/final-review-result.md`    | 判定結果       |
| Phase 11 手動テスト      | `outputs/phase-11/manual-test-result.md`     | 手動テスト結果 |

---

## 成果物

| 成果物 | パス                          | 内容     |
| ------ | ----------------------------- | -------- |
| PR情報 | `outputs/phase-13/pr-info.md` | PR URL等 |

---

## 完了条件

- [ ] ユーザーにローカル動作確認を依頼している
- [ ] 変更サマリーを提示しPR作成の許可を得ている
- [ ] 全変更がコミットされている
- [ ] PRが作成されている
- [ ] CIが通過している
- [ ] レビュー準備が完了している
- [ ] タスクディレクトリがcompleted-tasksに移動されている

---

## タスク完了処理【必須】

**PRが作成され、CIが通過した後、タスクディレクトリを完了タスクフォルダに移動する。**

### 移動手順

```bash
# タスクディレクトリをcompleted-tasksに移動
mv docs/30-workflows/embedding-late-chunking/ docs/30-workflows/completed-tasks/

# 移動を確認
ls docs/30-workflows/completed-tasks/ | grep embedding-late-chunking

# 変更をコミット
git add docs/30-workflows/
git commit -m "docs(workflows): embedding-late-chunkingをcompleted-tasksに移動"
git push
```

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 成果物の作成・配置
4. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/embedding-late-chunking --phase 13
```

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 13 実行記録

### 実行タスク

- タスク1:
- タスク2:
- タスク3:

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

- なし
```

## 依存関係

- **前提**: Phase 12（ドキュメント更新）の完了
- **後続**: なし（ワークフロー完了）

---

## 次のPhase

なし（ワークフロー完了）
