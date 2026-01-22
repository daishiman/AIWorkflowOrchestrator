# Phase 13: PR作成 - タスク仕様書

## メタ情報

| 項目       | 内容                           |
| ---------- | ------------------------------ |
| Phase      | 13                             |
| Phase名    | PR作成                         |
| 前提Phase  | Phase 12                       |
| 後続Phase  | -                              |
| ステータス | 未実施                         |
| 作成日     | 2026-01-18                     |
| 機能名     | skill-execution-implementation |

---

## 目的

実装をコミットし、Pull Requestを作成してCI/CDの確認を行う。

## 背景

全てのPhaseが完了した後、コードをコミットしてPRを作成する。
CI/CDの成功を確認し、マージ準備完了をユーザーに報告する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。
>
> **推奨**: `/ai:diff-to-pr` スキルを使用してPR作成ワークフローを自動化できます。

### タスク1: 変更内容の確認

**目的**: コミット対象の変更を確認する

**実行手順**:

1. 変更ファイルを確認

```bash
git status
```

2. 差分を確認

```bash
git diff
```

3. `outputs/phase-13/changes-summary.md` に変更サマリーを出力

**期待される成果物**:

- 変更サマリー

---

### タスク2: コミット

**目的**: 変更をコミットする

**実行手順**:

1. 変更をステージング

```bash
git add .
```

2. コミット（Co-Authored-By含む）

```bash
git commit -m "$(cat <<'EOF'
feat(agent): スキル実行機能を実装

- skillAPI.execute メソッドを追加
- SKILL_EXECUTE IPCチャンネルを追加
- SkillService.executeSkill メソッドを追加
- AgentView の handleExecute を実装
- 関連するテストを追加

Refs: SKILL-EXEC-001

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

**期待される成果物**:

- コミット完了

---

### タスク3: プッシュ

**目的**: リモートにプッシュする

**実行手順**:

1. リモートにプッシュ

```bash
git push origin task/skill-execution-implementation
```

**期待される成果物**:

- プッシュ完了

---

### タスク4: PR作成

**目的**: Pull Requestを作成する

**実行手順**:

1. PR作成

```bash
gh pr create --title "feat(agent): スキル実行機能を実装" --body "$(cat <<'EOF'
## Summary

- Agent画面でスキルを実行できる機能を実装
- skillAPI、IPC ハンドラー、SkillService に execute 機能を追加
- AgentView の handleExecute を実装

## Changes

- `apps/desktop/src/renderer/preload/index.ts`: skillAPI.execute を追加
- `apps/desktop/src/preload/channels.ts`: SKILL_EXECUTE チャンネルを追加
- `apps/desktop/src/main/ipc/skillHandlers.ts`: execute ハンドラーを追加
- `apps/desktop/src/main/services/skill/SkillService.ts`: executeSkill を追加
- `apps/desktop/src/renderer/views/AgentView/index.tsx`: handleExecute を実装

## Test plan

- [ ] ユニットテストがパスする
- [ ] 型チェックがパスする
- [ ] ESLintがパスする
- [ ] 手動テストでスキル実行が動作する

## Related issues

- SKILL-EXEC-001

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

2. `outputs/phase-13/pr-url.md` にPR URLを出力

**期待される成果物**:

- PR作成完了

---

### タスク5: CI/CD確認

**目的**: CI/CDの成功を確認する

**実行手順**:

1. 以下のチェック項目を確認

| #   | チェック項目         | 結果 |
| --- | -------------------- | ---- |
| 1   | ビルドが成功する     | [ ]  |
| 2   | テストが成功する     | [ ]  |
| 3   | 型チェックが成功する | [ ]  |
| 4   | Lintが成功する       | [ ]  |

2. `outputs/phase-13/ci-cd-result.md` に結果を出力

**期待される成果物**:

- CI/CD確認結果

---

### タスク6: マージ準備完了報告

**目的**: ユーザーにマージ準備完了を報告する

**実行手順**:

1. 全てのチェックがパスしたことを確認
2. ユーザーにマージ準備完了を報告
3. `outputs/phase-13/completion-report.md` に完了レポートを出力

**期待される成果物**:

- 完了レポート

---

## 参照資料

| 参照資料              | パス                | 内容                 |
| --------------------- | ------------------- | -------------------- |
| Phase 12ドキュメント  | `outputs/phase-12/` | ドキュメント更新結果 |
| /ai:diff-to-pr スキル | `.claude/skills/`   | PR作成自動化スキル   |

---

## 成果物

| 成果物       | 配置先                                  | 内容               |
| ------------ | --------------------------------------- | ------------------ |
| 変更サマリー | `outputs/phase-13/changes-summary.md`   | 変更ファイル一覧   |
| コミット     | Git履歴                                 | コミットハッシュ   |
| プッシュ     | リモートリポジトリ                      | ブランチプッシュ   |
| PR URL       | `outputs/phase-13/pr-url.md`            | Pull Request URL   |
| CI/CD結果    | `outputs/phase-13/ci-cd-result.md`      | CI/CD実行結果      |
| 完了レポート | `outputs/phase-13/completion-report.md` | マージ準備完了報告 |

---

## 完了条件

- [ ] 変更がコミットされている
- [ ] プッシュが完了している
- [ ] PRが作成されている
- [ ] CI/CDが成功している
- [ ] マージ準備完了をユーザーに報告している

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（タスク1〜6）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] outputs/phase-13/ ディレクトリに全成果物を配置

---

## 依存関係

- **前提**: Phase 12（ドキュメント更新）が完了していること
- **後続**: なし（最終Phase）

---

## Phase実行記録

Phase完了後、以下を記録してください:

```markdown
## Phase 13 実行記録

### 実行タスク

- タスク1: 変更内容の確認 - [完了/未完了]
- タスク2: コミット - [完了/未完了]
- タスク3: プッシュ - [完了/未完了]
- タスク4: PR作成 - [完了/未完了]
- タスク5: CI/CD確認 - [完了/未完了]
- タスク6: マージ準備完了報告 - [完了/未完了]

### PR情報

- PR URL:
- コミットハッシュ:
- ブランチ名:

### CI/CD結果

- ビルド: [成功/失敗]
- テスト: [成功/失敗]
- 型チェック: [成功/失敗]
- Lint: [成功/失敗]

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:
```

---

## タスク完了

全Phaseが完了しました。

**マージはユーザーがGitHub UIで手動実行してください。**

PR URLをユーザーに共有し、レビュー・マージを依頼してください。
