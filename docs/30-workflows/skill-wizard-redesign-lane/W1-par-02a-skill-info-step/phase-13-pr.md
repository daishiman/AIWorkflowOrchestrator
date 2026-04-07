# Phase 13: PRレビュー・マージ

## メタ情報

- Phase: 13
- タスクID: UT-SKILL-WIZARD-W1-par-02a
- 機能名: SkillInfoStep コンポーネント実装（Step 0）
- 作成日: 2026-04-07

## 目的

実装・テスト・ドキュメントが完成した `SkillInfoStep` コンポーネントの変更をPRとして提出し、レビューを経てメインブランチへマージする。

## 実行タスク

- [ ] ブランチの最新化を行う
- [ ] 最終テスト・lint・型チェックを実行する
- [ ] PR を作成する
- [ ] レビューコメントに対応する
- [ ] CI が GREEN であることを確認する
- [ ] メインブランチへマージする

## 参照資料

| 資料名                | パス               | 説明              |
| --------------------- | ------------------ | ----------------- |
| Phase 9 QA            | `phase-9-qa.md`    | QA チェックリスト |
| Phase 12 ドキュメント | `phase-12-docs.md` | ドキュメント整備  |
| CLAUDE.md             | `CLAUDE.md`        | コミット・PR 規約 |

## 実行手順

### Step 1: ブランチの最新化

```bash
git fetch origin main
git rebase origin/main
```

コンフリクトが発生した場合は解消する。

### Step 2: 最終確認

```bash
# 全テスト
pnpm --filter @repo/desktop vitest run

# 型チェック
pnpm --filter @repo/desktop typecheck

# lint
pnpm --filter @repo/desktop lint
```

全て GREEN / エラー 0 件であることを確認する。

### Step 3: コミット内容の確認

```bash
git diff main...HEAD --stat
```

以下のファイルが含まれていることを確認する:

- `apps/desktop/src/renderer/components/skill/wizard/SkillInfoStep.tsx`（追加）
- `apps/desktop/src/renderer/components/skill/wizard/DescribeStep.tsx`（削除）
- `apps/desktop/src/renderer/components/skill/wizard/__tests__/SkillInfoStep.test.tsx`（追加）

### Step 4: PR 作成

```bash
gh pr create \
  --title "feat(skill-wizard): SkillInfoStep 実装（Step 0）・DescribeStep 削除" \
  --body "$(cat <<'EOF'
## 概要

スキルウィザードの Step 0 を `DescribeStep` から `SkillInfoStep` へ刷新する。

## 変更内容

### 追加
- `SkillInfoStep.tsx`: スキル名・目的・カテゴリタグ入力フォーム（Step 0）
- `SkillInfoStep.test.tsx`: 単体テスト（レンダリング・バリデーション・タグ選択）

### 削除
- `DescribeStep.tsx`: `GenerationMode` ラジオボタンを含む旧 Step 0

### 参照
- `packages/shared/src/types/skillCreator.ts`: `SkillInfoFormData` / `SkillCategory` の正本

## テスト

- [ ] `pnpm --filter @repo/desktop vitest run` GREEN
- [ ] `pnpm --filter @repo/desktop typecheck` エラー 0
- [ ] `pnpm --filter @repo/desktop lint` エラー 0
- [ ] 手動テスト（Electron アプリ上での動作確認）完了

## 関連タスク

- UT-SKILL-WIZARD-W1-par-02a
- 依存: W0-seq-01 完了後
- 並列: W1-par-02b（ConversationRoundStep）
EOF
)"
```

### Step 5: CI 確認

```bash
gh pr checks
```

全 CI ジョブが GREEN になるまで待機する。

### Step 6: レビュー対応

レビューコメントがある場合は修正を行い、追加コミットを作成する。
（`--no-verify` は絶対に使用しない）

### Step 7: マージ

レビュー承認・CI GREEN を確認後、マージする。

```bash
gh pr merge --squash
```

## 成果物

- マージ済み PR URL
- CI 実行結果

## 完了条件

- [ ] PR が作成されている
- [ ] CI が全て GREEN になっている
- [ ] レビュー承認を受けている
- [ ] メインブランチへマージされている
- [ ] マージ後に main ブランチの CI が GREEN であることを確認している
