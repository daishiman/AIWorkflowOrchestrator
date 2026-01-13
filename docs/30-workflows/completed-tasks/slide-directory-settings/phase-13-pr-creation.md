# Phase 13: PR作成 - タスク仕様書

## メタ情報

| 項目       | 内容                     |
| ---------- | ------------------------ |
| Phase      | 13                       |
| Phase名    | PR作成                   |
| 前提Phase  | Phase 12                 |
| 後続Phase  | なし（完了）             |
| ステータス | 未実施                   |
| 作成日     | 2026-01-13               |
| 機能名     | slide-directory-settings |

---

## 目的

全Phaseの成果をまとめ、Pull Requestを作成してコードレビューに進む。PRの説明文を充実させ、レビュアーが効率的にレビューできるようにする。

## 背景

Phase 12でドキュメント更新が完了した。このPhaseでは、全ての成果をPRにまとめ、mainブランチへのマージを申請する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 最終コミット確認

**目的**: 全ての変更が正しくコミットされていることを確認する

**実行手順**:

1. コミット状況を確認:

   ```bash
   git status
   git log --oneline -10
   ```

2. 未コミットの変更がある場合はコミット:

   ```bash
   git add .
   git commit -m "feat(slide-settings): complete implementation"
   ```

3. コミット一覧を確認し、意味のある単位でまとまっていることを確認

4. 結果を `outputs/phase-13/commit-status.md` に出力

**期待される成果物**:

- `outputs/phase-13/commit-status.md`

---

### タスク2: ブランチの整理

**目的**: PRに含めるブランチの状態を整理する

**実行手順**:

1. ベースブランチとの差分確認:

   ```bash
   git diff main --stat
   ```

2. コンフリクトの確認:

   ```bash
   git fetch origin
   git merge origin/main --no-commit --no-ff
   # コンフリクトがある場合は解決
   git merge --abort  # ドライラン後は中止
   ```

3. 必要に応じてrebase:

   ```bash
   git rebase main
   ```

4. 結果を `outputs/phase-13/branch-status.md` に出力

**期待される成果物**:

- `outputs/phase-13/branch-status.md`

---

### タスク3: PR説明文の作成

**目的**: レビュアーにわかりやすいPR説明文を作成する

**実行手順**:

1. PR説明文テンプレート:

```markdown
## 概要

スライド出力ディレクトリ設定機能を実装しました。

### 実装内容

- 設定画面にスライド出力ディレクトリ設定セクションを追加
- OS標準ダイアログによるディレクトリ選択機能
- electron-storeによる設定永続化
- ディレクトリ自動作成オプション
- presentation-slide-generatorスキルとの連携

### 技術的な変更点

- `SlideSettingsStore`: electron-storeベースの設定永続化クラス
- `slideSettingsHandlers`: IPC通信ハンドラー（5チャンネル）
- `SlideDirectorySettings`: React UIコンポーネント
- `useSlideSettings`: 状態管理カスタムフック

### セキュリティ対応

- IPCホワイトリスト方式による通信制限
- sender検証によるDevToolsからの呼び出し防止
- パストラバーサル攻撃の防止

### テスト

- ユニットテスト: XX件
- 統合テスト: XX件
- Line Coverage: XX%
- Branch Coverage: XX%

### スクリーンショット

（設定画面のスクリーンショットを添付）

### 関連Issue

- #XXX

### チェックリスト

- [ ] コードがレビュー可能な状態
- [ ] テストがパスしている
- [ ] ドキュメントが更新されている
- [ ] CHANGELOGが更新されている
```

2. PR説明文を作成し `outputs/phase-13/pr-description.md` に保存

**期待される成果物**:

- `outputs/phase-13/pr-description.md`

---

### タスク4: PRの作成

**目的**: GitHub上でPull Requestを作成する

**実行手順**:

1. ブランチをプッシュ:

   ```bash
   git push -u origin feat/task-spec-slide-directory-settings
   ```

2. PRを作成:

   ```bash
   gh pr create \
     --title "feat(slide-settings): スライド出力ディレクトリ設定機能を追加" \
     --body-file outputs/phase-13/pr-description.md \
     --base main
   ```

3. PRのURLを記録

4. 結果を `outputs/phase-13/pr-created.md` に出力

**期待される成果物**:

- `outputs/phase-13/pr-created.md`
- GitHub上のPull Request

---

### タスク5: PR作成完了確認

**目的**: PRが正しく作成されたことを確認する

**実行手順**:

1. PRチェックリスト:

| 確認項目        | 状態       |
| --------------- | ---------- |
| タイトル        | [ ] 確認済 |
| 説明文          | [ ] 確認済 |
| ベースブランチ  | [ ] main   |
| レビュアー指定  | [ ] 完了   |
| ラベル          | [ ] 設定済 |
| CI/CDステータス | [ ] 確認中 |

2. CIの結果を待機し、全てパスすることを確認

3. 最終結果を `outputs/phase-13/pr-final-status.md` に出力

**期待される成果物**:

- `outputs/phase-13/pr-final-status.md`

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料     | パス                                                                           | 内容       |
| ------------ | ------------------------------------------------------------------------------ | ---------- |
| PR作成ガイド | `.claude/skills/task-specification-creator/references/spec-update-workflow.md` | PR作成手順 |

### 関連ドキュメント

| 参照資料      | パス                                          | 内容            |
| ------------- | --------------------------------------------- | --------------- |
| 全Phase成果物 | `outputs/phase-*/`                            | 各Phaseの成果物 |
| タスク仕様書  | `docs/30-workflows/slide-directory-settings/` | 本タスク仕様    |

---

## 成果物

| 成果物         | パス                                  | 内容             |
| -------------- | ------------------------------------- | ---------------- |
| コミット状況   | `outputs/phase-13/commit-status.md`   | コミット確認結果 |
| ブランチ状況   | `outputs/phase-13/branch-status.md`   | ブランチ整理結果 |
| PR説明文       | `outputs/phase-13/pr-description.md`  | PR本文           |
| PR作成結果     | `outputs/phase-13/pr-created.md`      | PR URL等         |
| 最終ステータス | `outputs/phase-13/pr-final-status.md` | PR最終確認結果   |

---

## 完了条件

- [ ] 全ての変更がコミットされている
- [ ] ブランチがmainと同期されている
- [ ] PR説明文が作成されている
- [ ] PRがGitHub上に作成されている
- [ ] CIが全てパスしている
- [ ] 全成果物が `outputs/phase-13/` に配置されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## タスク完了アクション【必須】

本Phaseの完了をもって、タスク全体が完了となります。

1. タスク完了レポートを作成:

```markdown
# タスク完了レポート

## タスク情報

- タスクID: task-feat-slide-directory-settings-002
- 機能名: slide-directory-settings
- 開始日: YYYY-MM-DD
- 完了日: YYYY-MM-DD

## 実行結果サマリー

- Phase 1-13: 全て完了

## 成果物

- PR URL: https://github.com/xxx/xxx/pull/XXX
- 技術ドキュメント: docs/technical/slide-settings.md
- ユーザーガイド: docs/user-guide/slide-settings.md
- APIリファレンス: docs/api/slide-settings-api.md

## 品質メトリクス

- Line Coverage: XX%
- Branch Coverage: XX%
- 全テスト: XX件（成功）

## 次のステップ

- コードレビュー待ち
- レビュー指摘対応
- mainへのマージ
```

2. `outputs/task-completion-report.md` に保存

---

## 依存関係

- **前提**: Phase 12 が完了していること
- **後続**: コードレビュー（本ワークフロー外）

---

## 次のステップ

PR作成後は以下のフローとなります:

1. コードレビュー（レビュアーによる）
2. レビュー指摘対応（必要に応じて）
3. 承認後、mainブランチへマージ
4. リリースノート更新

本タスク仕様書のスコープは、PR作成までとなります。
