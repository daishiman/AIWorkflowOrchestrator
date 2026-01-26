# Phase 13: PR作成 - タスク仕様書

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 13                                     |
| Phase名    | PR作成                                 |
| 前提Phase  | Phase 12                               |
| 後続Phase  | なし（完了）                           |
| ステータス | 未実施                                 |
| 作成日     | 2026-01-25                             |
| 機能名     | task-3-1-e-remember-choice-persistence |

---

## 目的

`/ai:diff-to-pr`スキルを使用してコミット・PR作成・CI確認を行い、マージ準備を完了する。

## 背景

Phase 1〜12で実装・テスト・ドキュメント化が完了した成果物をPull Requestとして提出し、レビュー・マージの準備を行う。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: ローカル確認

**目的**: PR作成前の最終ローカル確認を行う

**実行手順**:

1. 以下のコマンドを実行して確認:

   ```bash
   # ビルド確認
   pnpm --filter @repo/desktop build

   # テスト確認
   pnpm --filter @repo/desktop test

   # 型チェック確認
   pnpm --filter @repo/desktop typecheck

   # Lint確認
   pnpm --filter @repo/desktop lint
   ```

2. 全てパスすることを確認
3. 問題がある場合は修正

**期待される成果物**:

- ローカル確認結果（全項目PASS）

---

### タスク2: 変更内容確認

**目的**: コミットする変更内容を確認する

**実行手順**:

1. 変更ファイルを確認:
   ```bash
   git status
   git diff --stat
   ```
2. 以下のファイルが含まれていることを確認:
   - `apps/desktop/src/main/services/skill/PermissionStore.ts`
   - `apps/desktop/src/main/services/skill/SkillExecutor.ts`（修正）
   - `apps/desktop/src/main/services/skill/__tests__/PermissionStore.test.ts`
   - `apps/desktop/src/renderer/components/PermissionSettings.tsx`
   - `apps/desktop/src/main/ipc/permission-handlers.ts`
   - `packages/shared/src/ipc/channels.ts`（修正）
   - `docs/guides/permission-store.md`
3. 不要なファイルが含まれていないことを確認

**期待される成果物**:

- 変更ファイル一覧

---

### タスク3: Issue連携確認

**目的**: GitHub Issue #510との連携を確認する

**実行手順**:

1. Issue #510の内容を確認
2. 実装内容がIssueの要件を満たしていることを確認
3. PRにIssue番号を関連付けることを確認

**期待される成果物**:

- Issue連携確認結果

---

### タスク4: PR作成

**目的**: `/ai:diff-to-pr`スキルを使用してPRを作成する

**⚠️ 重要**: このタスクはユーザーの明示的な許可を得てから実行すること

**実行手順**:

1. ユーザーに確認: 「PRを作成してよいですか？」
2. 許可を得たら `/ai:diff-to-pr` を実行
3. PR本文には以下を含める:
   - 変更概要
   - 実装内容
   - テスト結果
   - `Closes #510` または `Fixes #510`
4. PRが作成されたことを確認

**期待される成果物**:

- Pull Request URL

**PR本文テンプレート**:

```markdown
## Summary

- rememberChoice機能の永続化実装
- PermissionStoreクラスの追加
- 設定画面への許可済みツール管理UI追加

## Changes

- `PermissionStore.ts`: 永続化ストアクラス
- `SkillExecutor.ts`: 自動許可チェック・永続化連携
- `PermissionSettings.tsx`: 設定UIコンポーネント
- `permission-handlers.ts`: IPCハンドラー

## Test plan

- [ ] ユニットテスト全件PASS
- [ ] 統合テスト全件PASS
- [ ] 手動テスト完了
- [ ] アプリ再起動後の設定維持確認

Closes #510
```

---

### タスク5: CI確認

**目的**: CI/CDの結果を確認する

**実行手順**:

1. PRのCI/CDワークフローが開始されたことを確認
2. 以下のチェックがパスすることを確認:
   - [ ] Build
   - [ ] Test
   - [ ] Lint
   - [ ] TypeCheck
3. 失敗するチェックがあれば修正

**期待される成果物**:

- CI確認結果

---

## 参照資料

| 参照資料            | パス                                                             | 内容         |
| ------------------- | ---------------------------------------------------------------- | ------------ |
| ai:diff-to-prスキル | `.claude/skills/`                                                | PR作成スキル |
| GitHub Issue        | `https://github.com/daishiman/AIWorkflowOrchestrator/issues/510` | 関連Issue    |

---

## 成果物

| 成果物       | パス           | 内容         |
| ------------ | -------------- | ------------ |
| Pull Request | GitHub PR URL  | 作成されたPR |
| CI結果       | GitHub Actions | CI/CD結果    |

---

## 完了条件

- [ ] ローカル確認が全てPASS
- [ ] 変更内容が確認された
- [ ] Issue連携が確認された
- [ ] PRが作成された
- [ ] CIが全てPASS
- [ ] マージ可能状態になった

---

## PR作成に関する重要な注意

**⚠️ PR作成は自動実行しない。必ずユーザーの明示的な許可を得てから実行すること。**

| 禁止事項                                     | 理由                                           |
| -------------------------------------------- | ---------------------------------------------- |
| 勝手にPRを作成する                           | レビュー前の変更がリモートに反映されてしまう   |
| ユーザー確認なしで`/ai:diff-to-pr`を実行する | 意図しないブランチやコミットが作成される可能性 |
| ローカル確認をスキップする                   | 動作確認されていないコードがPRに含まれる       |

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

## タスク完了

Phase 13が完了し、CIがパスしたら、TASK-3-1-E（rememberChoice機能の永続化実装）は完了です。

**⚠️ マージはユーザーがGitHub UI上で手動実行してください。**
