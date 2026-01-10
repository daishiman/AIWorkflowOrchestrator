# Phase 13: PR作成 - タスク仕様書

## メタ情報

| 項目       | 内容               |
| ---------- | ------------------ |
| Phase      | 13                 |
| Phase名    | PR作成             |
| 前提Phase  | Phase 12           |
| 後続Phase  | -（完了）          |
| ステータス | 未実施             |
| 作成日     | 2026-01-10         |
| 機能名     | slide-reverse-sync |

---

## 目的

変更をコミットし、Pull Requestを作成してCIを確認する。レビュー可能な状態にして成果物を提出する。

## 背景

Phase 12までで実装・テスト・ドキュメントがすべて完了した。最終段階として変更をコミットし、PRを作成してマージの準備を整える。

---

## 使用スキル

> 以下のスキルを順番に呼び出して実行してください。
> 各スキルは `.claude/skills/{{スキル名}}/SKILL.md` を参照してください。

### スキル1: /ai:diff-to-pr

**パス**: `/ai:diff-to-pr`

**選定理由**: 差分確認・コミット・PR作成・CI確認を一括実行するため。

**Trigger条件**:

- PR作成、コミット、CI確認を行う場合に使用

**実行方法**:

1. `/ai:diff-to-pr` コマンドを実行
2. 差分を確認
3. コミットメッセージを作成
4. PRを作成
5. CIを確認

**期待される成果物**:

- コミット
- Pull Request

---

## 参照資料

| 参照資料             | パス                                           | 内容           |
| -------------------- | ---------------------------------------------- | -------------- |
| 最終レビュー結果     | `outputs/phase-10/final-review-result.md`      | Phase 10成果物 |
| 手動テスト結果       | `outputs/phase-11/manual-test-result.md`       | Phase 11成果物 |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-update-log.md` | Phase 12成果物 |
| スキルフィードバック | `outputs/phase-12/skill-feedback-report.md`    | Phase 12成果物 |

---

## 実行手順

### 1. 差分確認

```bash
git status
git diff
```

### 2. コミット作成

```bash
# コミットメッセージ例
git add .
git commit -m "feat(slide): implement reverse sync from index.html to structure.md

- Add index.html file watching to file-watcher.ts
- Implement reverse sync trigger in sync-manager.ts
- Create modifier skill for HTML to Structure conversion
- Add SyncStatusIndicator IPC notification
- Implement infinite loop prevention for bidirectional sync

Refs: task-feat-slide-reverse-sync-001"
```

### 3. PR作成

```bash
gh pr create --title "feat(slide): index.html→structure.md逆同期機能" --body "## 概要

index.htmlの変更をstructure.mdに逆同期する機能を実装しました。

## 変更内容

- file-watcher.ts: index.html監視の追加
- sync-manager.ts: 逆方向同期トリガー
- skill-executor.ts: modifierスキル実行
- skills/modifier.ts: HTML→Structure変換スキル

## テスト結果

- ユニットテスト: 全て成功
- 統合テスト: 全て成功
- カバレッジ: Line 80%+, Branch 60%+, Function 80%+

## 確認事項

- [ ] CI通過
- [ ] レビュー完了
- [ ] マージ可能"
```

### 4. CI確認

```bash
gh pr checks
```

---

## PR内容テンプレート

```markdown
## 概要

index.htmlの変更をstructure.mdに逆同期する機能（slide-reverse-sync）を実装しました。

## 背景

既存のslide-dependency-management機能では、structure.md→index.htmlの順方向同期のみ対応していました。
本PRでは逆方向（index.html→structure.md）の同期を追加し、双方向同期を実現します。

## 変更内容

### 新規ファイル

- `apps/desktop/src/main/slide/skills/modifier.ts` - HTML→Structure変換スキル

### 変更ファイル

- `apps/desktop/src/main/slide/file-watcher.ts` - index.html監視の追加
- `apps/desktop/src/main/slide/sync-manager.ts` - 逆方向同期トリガー
- `apps/desktop/src/main/slide/skill-executor.ts` - modifierスキル実行

### テストファイル

- `apps/desktop/src/main/slide/**/*.test.ts` - ユニット・統合テスト

## テスト結果

| 項目              | 結果    |
| ----------------- | ------- |
| ユニットテスト    | ✅ PASS |
| 統合テスト        | ✅ PASS |
| Line Coverage     | 80%+    |
| Branch Coverage   | 60%+    |
| Function Coverage | 80%+    |

## 関連タスク

- タスク指示書: `docs/30-workflows/unassigned-task/task-feat-slide-reverse-sync-001.md`
- タスク仕様書: `docs/30-workflows/slide-reverse-sync/`

## 確認事項

- [ ] CI通過
- [ ] レビュー完了
- [ ] ドキュメント確認
```

---

## 成果物

| 成果物       | パス/リンク                              | 内容             |
| ------------ | ---------------------------------------- | ---------------- |
| コミット     | (Gitリポジトリ)                          | 変更のコミット   |
| Pull Request | (GitHub PR URL)                          | マージリクエスト |
| PR記録       | `outputs/phase-13/pr-creation-record.md` | PR作成記録       |

---

## 完了条件

- [ ] すべての変更がコミットされている
- [ ] PRが作成されている
- [ ] PR説明が適切に記載されている
- [ ] CIが通過している
- [ ] レビュー依頼が完了している
- [ ] **本Phase内の全スキルを100%実行完了**

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. Phase 12成果物の確認
2. 差分確認
3. コミット作成
4. /ai:diff-to-prの実行
5. PR作成
6. CI確認
7. PR記録の作成
8. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

---

## スキル100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全スキルを100%実行完了
- [ ] PRが作成されている
- [ ] CIが通過している
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/slide-reverse-sync --phase 13
```

---

## スキルフィードバック記録（Phase完了後に記載）

```markdown
## Phase 13 実行記録

### 使用スキル

- /ai:diff-to-pr: {{result}}

### PR情報

- PR URL: {{URL}}
- コミット数: {{COUNT}}
- 変更ファイル数: {{COUNT}}

### CI結果

- ビルド: {{PASS/FAIL}}
- テスト: {{PASS/FAIL}}
- Lint: {{PASS/FAIL}}

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### タスク完了サマリー

- 開始日: {{DATE}}
- 完了日: {{DATE}}
- 総Phase数: 13
- 総コミット数: {{COUNT}}
```

---

## タスク完了

このPhaseをもってtask-feat-slide-reverse-sync-001タスクは完了となります。

### タスク完了フロー

```
Phase 13: PR作成（/ai:diff-to-pr 使用）
    ↓
CI通過確認
    ↓
タスクディレクトリを completed-tasks/ に移動
    ↓
（該当する場合）未タスク指示書を削除
    ↓
変更をコミット・プッシュ
    ↓
ワークフロー完了
```

### タスクディレクトリ移動手順

CI通過後、以下の手順でタスクディレクトリを完了タスクフォルダに移動する:

```bash
# 1. タスクディレクトリをcompleted-tasksに移動
mv docs/30-workflows/slide-reverse-sync/ docs/30-workflows/completed-tasks/

# 2. 移動を確認
ls docs/30-workflows/completed-tasks/ | grep slide-reverse-sync

# 3. （該当する場合）未タスク指示書を削除
rm docs/30-workflows/unassigned-task/task-feat-slide-reverse-sync-001.md

# 4. 変更をコミット
git add docs/30-workflows/
git commit -m "docs(workflows): slide-reverse-syncをcompleted-tasksに移動"
git push
```

### 完了チェックリスト

- [ ] 全13 Phaseが完了
- [ ] 全成果物がoutputs/配下に配置されている
- [ ] artifacts.jsonが最新状態
- [ ] PRがマージ可能な状態
- [ ] CIが全て通過している
- [ ] タスクディレクトリが `completed-tasks/` に移動済み
- [ ] （該当時）未タスク指示書が削除済み
- [ ] LOGS.mdにスキルフィードバックが記録されている
- [ ] **本Phase内の全作業を100%完了**

### 次のステップ

1. PRのレビュー対応
2. マージ後の動作確認
3. 関連機能への影響確認
