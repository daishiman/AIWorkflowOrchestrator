# Phase 13: PR作成 - タスク仕様書

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 13                              |
| Phase名    | PR作成                          |
| 前提Phase  | Phase 12                        |
| 後続Phase  | なし（タスク完了）              |
| ステータス | 未実施                          |
| 作成日     | 2026-01-25                      |
| 機能名     | TASK-3-1-D-permission-dialog-ui |

---

## 目的

全Phase完了後、Pull Requestを作成しコードレビューを依頼する。

## 背景

Phase 12までで実装、テスト、ドキュメントが完了した。mainブランチへのマージに向けてPRを作成する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: コミット整理

**目的**: コミット履歴を整理する

**実行手順**:

1. 未コミットの変更を確認:

   ```bash
   git status
   ```

2. 必要に応じて追加コミット:

   ```bash
   git add <files>
   git commit -m "feat(desktop): <description>"
   ```

3. コミット履歴確認:
   ```bash
   git log --oneline -10
   ```

**期待される成果物**:

- 整理されたコミット履歴

---

### タスク2: リモートプッシュ

**目的**: 変更をリモートリポジトリにプッシュする

**実行手順**:

1. リモートブランチにプッシュ:

   ```bash
   git push origin feature/task-3-1-d-permission-dialog-ui
   ```

2. プッシュが成功したことを確認

**期待される成果物**:

- リモートブランチへのプッシュ完了

---

### タスク3: PR作成

**目的**: Pull Requestを作成する

**実行手順**:

1. GitHub CLIでPR作成:

   ```bash
   gh pr create \
     --title "feat(desktop): Renderer側権限ダイアログUI実装 (TASK-3-1-D)" \
     --body "## 概要

   Skill実行時のPermission要求をRenderer側でハンドリングするUIを実装。

   ## 変更内容

   - skillAPIにpermission関連メソッド追加（onPermission, respondPermission）
   - SkillStreamDisplayにPermissionDialog統合
   - IPCチャネル定義追加（SKILL_PERMISSION_REQUEST, SKILL_PERMISSION_RESPOND）

   ## 関連Issue

   Closes #509

   ## 依存関係

   - TASK-3-1-C（PermissionRequest Hook統合）のマージが前提

   ## テスト

   - [ ] ユニットテスト: pnpm --filter @repo/desktop test -- --run
   - [ ] 型チェック: pnpm --filter @repo/desktop typecheck
   - [ ] Lint: pnpm --filter @repo/desktop lint

   ## レビュー観点

   - skillAPI拡張の設計妥当性
   - IPC通信のセキュリティ
   - PermissionDialog統合の適切性
   - アクセシビリティ対応

   ## スクリーンショット

   （必要に応じて添付）
   " \
     --base main
   ```

2. PR URLを記録

**期待される成果物**:

- `outputs/phase-13/pr-url.md`: PR URL記録

---

### タスク4: タスク完了処理

**目的**: タスクの完了処理を行う

**実行手順**:

1. 成果物一覧作成:

   ```markdown
   # TASK-3-1-D 成果物一覧

   ## 実装ファイル

   - apps/desktop/src/preload/channels.ts
   - apps/desktop/src/preload/skill-api.ts
   - apps/desktop/src/preload/types.ts
   - apps/desktop/src/renderer/components/AgentView/SkillStreamDisplay.tsx

   ## テストファイル

   - apps/desktop/src/preload/**tests**/skill-api.permission.test.ts
   - apps/desktop/src/renderer/components/AgentView/**tests**/SkillStreamDisplay.permission.test.tsx

   ## ドキュメント

   - outputs/phase-12/\*.md
   ```

2. GitHub Issueの更新:
   - PRリンクを追加
   - ステータスを「In Review」に変更

3. タスク仕様書ステータス更新:
   - `index.md`のステータスを「完了」に更新

**期待される成果物**:

- `outputs/phase-13/completion-report.md`: 完了報告

---

## 参照資料

| 参照資料      | パス                              | 内容        |
| ------------- | --------------------------------- | ----------- |
| 全Phase成果物 | `outputs/phase-*/`                | 各Phase出力 |
| GitHub Issue  | https://github.com/.../issues/509 | 関連Issue   |

---

## 成果物

| 成果物     | パス                                    | 内容           |
| ---------- | --------------------------------------- | -------------- |
| PR URL記録 | `outputs/phase-13/pr-url.md`            | PR情報         |
| 完了報告   | `outputs/phase-13/completion-report.md` | タスク完了報告 |

---

## 完了条件

- [ ] コミットが整理されている
- [ ] リモートにプッシュされている
- [ ] PRが作成されている
- [ ] GitHub Issueが更新されている
- [ ] タスク仕様書のステータスが更新されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## タスク完了

TASK-3-1-D（Renderer側権限ダイアログUI実装）の全Phaseが完了しました。

### 次のステップ

1. PRレビュー待ち
2. レビュー指摘対応（必要に応じて）
3. mainブランチへのマージ
4. TASK-3-1-C との統合確認

### 関連タスク

- **TASK-3-1-C**: PermissionRequest Hook統合（Main Process側）
- **TASK-3-2**: 次のタスク（タスク一覧参照）
