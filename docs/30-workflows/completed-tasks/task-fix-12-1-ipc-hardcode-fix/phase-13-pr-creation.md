# Phase 13: PR作成 - タスク仕様書

## メタ情報

| 項目       | 内容                               |
| ---------- | ---------------------------------- |
| Phase      | 13                                 |
| Phase名    | PR作成                             |
| 前提Phase  | Phase 12 (ドキュメント更新)        |
| 後続Phase  | -（完了）                          |
| ステータス | 未実施                             |
| 作成日     | 2026-02-08                         |
| タスクID   | TASK-FIX-12-1-IPC-HARDCODE-FIX     |
| 機能名     | SkillExecutorのIPCチャネル名定数化 |

---

## 目的

変更をコミット・プッシュし、ユーザー許可後にPRを作成する。

## 背景

全Phaseが完了した状態で、変更を本番ブランチにマージするためのPRを作成する。

---

## 参照資料

| 参照資料   | パス                                                    | 内容                   |
| ---------- | ------------------------------------------------------- | ---------------------- |
| 対象コード | `apps/desktop/src/main/services/skill/SkillExecutor.ts` | リファクタリング対象   |
| 実装ガイド | `outputs/phase-12/implementation-guide.md`              | 変更内容のドキュメント |

---

## 成果物

| 成果物 | パス                          | 内容           |
| ------ | ----------------------------- | -------------- |
| PR情報 | `outputs/phase-13/pr-info.md` | PR URL・CI結果 |

---

## PR作成フロー

```
Step 1: ローカル動作確認依頼
    ↓
Step 2: 変更サマリー提示
    ↓
Step 3: ユーザー許可確認
    ↓
Step 4: PR作成（許可後のみ）
    ↓
Step 5: CI通過確認
    ↓
Step 6: タスクディレクトリをcompleted-tasksに移動
    ↓
ワークフロー完了
```

---

## Step 1: ローカル動作確認依頼

ユーザーに以下の確認を依頼:

```markdown
## ローカル動作確認のお願い

以下のコマンドでビルド・テストが通ることを確認してください:

1. 型チェック: `pnpm typecheck`
2. Lint: `pnpm lint`
3. テスト: `pnpm --filter @repo/desktop test`

問題なければ「PR作成OK」とお知らせください。
```

---

## Step 2: 変更サマリー

```markdown
## 変更サマリー - TASK-FIX-12-1-IPC-HARDCODE-FIX

### 概要

SkillExecutor.tsのIPCチャネル名をハードコードから定数参照に変更

### 変更ファイル

- `apps/desktop/src/main/services/skill/SkillExecutor.ts`
  - L918: `"skill:stream"` -> `SKILL_CHANNELS.SKILL_STREAM`
  - L1214: `"skill:stream"` -> `SKILL_CHANNELS.SKILL_STREAM`

### 変更種別

- リファクタリング（動作変更なし）

### 影響範囲

- なし（定数の値は同一）

### 破壊的変更

- なし
```

---

## Step 3: ユーザー許可確認

**PR作成前に必ずユーザーの許可を得ること**

許可を得るまでPR作成コマンドを実行しない。

---

## Step 4: PR作成（ユーザー許可後）

```bash
# ブランチ作成（必要な場合）
git checkout -b refactor/task-fix-12-1-ipc-hardcode-fix

# コミット
git add apps/desktop/src/main/services/skill/SkillExecutor.ts
git commit -m "refactor(skill): replace hardcoded IPC channel with constant

- Replace \"skill:stream\" with SKILL_CHANNELS.SKILL_STREAM (L918, L1214)
- Improve maintainability and prevent typos
- No behavioral changes

Refs: TASK-FIX-12-1-IPC-HARDCODE-FIX"

# プッシュ
git push -u origin refactor/task-fix-12-1-ipc-hardcode-fix

# PR作成
gh pr create \
  --title "refactor(skill): SkillExecutorのIPCチャネル名を定数化" \
  --body "## Summary
- SkillExecutor.tsのIPCチャネル名をハードコードから定数参照に変更
- L918, L1214の\`\"skill:stream\"\`を\`SKILL_CHANNELS.SKILL_STREAM\`に置換

## Motivation
- IPCセキュリティルール準拠（ハードコード禁止）
- タイポ防止・保守性向上

## Changes
- \`apps/desktop/src/main/services/skill/SkillExecutor.ts\`: 2箇所の定数化

## Test Plan
- [ ] 型チェック通過
- [ ] Lint通過
- [ ] 既存テスト全パス
- [ ] スキル実行の動作確認

Refs: TASK-FIX-12-1-IPC-HARDCODE-FIX"
```

---

## Step 5: CI通過確認

PRマージ前にCIが全て通過していることを確認:

- [ ] TypeScript型チェック
- [ ] ESLint
- [ ] 単体テスト
- [ ] E2Eテスト（該当する場合）

---

## Step 6: タスク完了時の移動手順

```bash
# 1. タスクディレクトリをcompleted-tasksに移動
mv docs/30-workflows/task-fix-12-1-ipc-hardcode-fix/ \
   docs/30-workflows/completed-tasks/

# 2. 移動を確認
ls docs/30-workflows/completed-tasks/ | grep task-fix-12-1

# 3. artifacts.jsonのstatusをcompletedに更新
# outputs/artifacts.json の status を "completed" に変更

# 4. 変更をコミット
git add docs/30-workflows/
git commit -m "docs(workflows): TASK-FIX-12-1-IPC-HARDCODE-FIXをcompleted-tasksに移動"
git push
```

---

## 完了条件チェックリスト

| #   | 項目                                               | 必須 |
| --- | -------------------------------------------------- | ---- |
| 1   | ローカル動作確認が完了している                     | Yes  |
| 2   | ユーザーからPR作成の許可を得ている                 | Yes  |
| 3   | PRが作成されている                                 | Yes  |
| 4   | CIが全て通過している                               | Yes  |
| 5   | タスクディレクトリが `completed-tasks/` に移動済み | Yes  |
| 6   | `artifacts.json` の `status` が `"completed"`      | Yes  |

---

## Phase末端アクション

- [ ] 本Phase内の全作業を100%実行完了
- [ ] PRが作成されている
- [ ] CIが通過している
- [ ] タスクディレクトリが移動されている
- [ ] artifacts.jsonが更新されている

---

## 依存関係

- **前提**: Phase 12 が完了していること
- **後続**: なし（タスク完了）

---

## ワークフロー完了

Phase 13が完了したら、このタスクは完了です。

タスクディレクトリは `docs/30-workflows/completed-tasks/task-fix-12-1-ipc-hardcode-fix/` に移動されます。
