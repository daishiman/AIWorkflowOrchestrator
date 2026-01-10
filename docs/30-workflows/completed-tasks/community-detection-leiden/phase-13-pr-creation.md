# Phase 13: PR作成 - タスク仕様書

## メタ情報

| 項目       | 内容                       |
| ---------- | -------------------------- |
| Phase      | 13                         |
| Phase名    | PR作成                     |
| 前提Phase  | Phase 12 (ドキュメント)    |
| 後続Phase  | なし（完了）               |
| ステータス | 未実施                     |
| 作成日     | 2026-01-10                 |
| 機能名     | community-detection-leiden |

---

## 目的

変更をコミットし、Pull Requestを作成してCIを確認する。CI通過後、タスクディレクトリを完了フォルダに移動する。

## 背景

開発フローの最終段階として、コードレビューを経てmainブランチにマージするためのPRを作成する。PRには変更内容のサマリー、テスト結果、ドキュメントへのリンクを含める。

---

## 使用スキル

> `/ai:diff-to-pr` スキルを使用してPR作成を行う。

### スキル: /ai:diff-to-pr【推奨】

**実行方法**:

```
/ai:diff-to-pr
```

このスキルが自動的に以下を実行:

1. 変更差分の確認
2. コミットメッセージ生成
3. PR作成
4. CI結果確認

**フォールバック（/ai:diff-to-prが使えない場合）**:

git/gh CLIで手動対応する（後述の手動手順を参照）。

---

## 参照資料

| 参照資料          | パス                                                    | 内容          |
| ----------------- | ------------------------------------------------------- | ------------- |
| 全Phase成果物     | `outputs/phase-*/`                                      | 各Phase成果物 |
| 実装コード        | `packages/shared/src/services/graph/`                   | 実装          |
| テストコード      | `packages/shared/src/services/graph/__tests__/`         | テスト        |
| ワークフローindex | `docs/30-workflows/community-detection-leiden/index.md` | 概要          |

---

## 成果物

| 成果物     | パス                             | 内容           |
| ---------- | -------------------------------- | -------------- |
| PRサマリー | `outputs/phase-13/pr-summary.md` | PR内容サマリー |
| PR情報     | `outputs/phase-13/pr-info.md`    | PR URL等       |
| PR         | GitHub上                         | Pull Request   |

---

## PR作成前の最終確認【必須】

```bash
# 全テスト実行
pnpm --filter @repo/shared test
pnpm --filter @repo/shared test:integration

# Lint/型チェック
pnpm --filter @repo/shared lint
pnpm --filter @repo/shared typecheck

# ビルド確認
pnpm --filter @repo/shared build
```

---

## 実行手順

### 方法1: `/ai:diff-to-pr` を使用（推奨）

```
/ai:diff-to-pr
```

実行後、PRが作成されCIが通過していることを確認する。

### 方法2: 手動でPR作成（フォールバック）

#### 1. 変更のステージング

```bash
git add .
git status
```

#### 2. コミット

```bash
git commit -m "$(cat <<'EOF'
feat(graph): implement Leiden algorithm for community detection

- Add LeidenAlgorithm class with local move, refinement, and aggregation phases
- Implement CommunityDetector service with ICommunityDetector interface
- Add comprehensive unit tests and integration tests
- Support hierarchical community detection with configurable resolution
- Implement Result-based error handling

Closes #XX

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

#### 3. プッシュ

```bash
git push -u origin task/community-detection-leiden
```

#### 4. PR作成

```bash
gh pr create --title "feat(graph): Leidenアルゴリズムによるコミュニティ検出機能" --body "$(cat <<'EOF'
## Summary

- Leidenアルゴリズムによるコミュニティ検出機能を実装
- GraphRAGのグローバルクエリ対応の基盤を構築
- 階層的コミュニティ構造のサポート

## Changes

### 新規ファイル
- `packages/shared/src/services/graph/leiden-algorithm.ts`
- `packages/shared/src/services/graph/community-detector.ts`
- `packages/shared/src/services/graph/types.ts`（Community関連型追加）
- `packages/shared/src/services/graph/__tests__/leiden-algorithm.test.ts`
- `packages/shared/src/services/graph/__tests__/community-detector.test.ts`

### 主な機能
- コミュニティ検出（Leidenアルゴリズム）
- 階層的コミュニティ構造
- Resolution パラメータによる粒度調整
- Seed指定による再現性確保
- Result型によるエラーハンドリング

## Test Plan

- [x] ユニットテスト（Line 80%+, Branch 60%+, Function 80%+）
- [x] 統合テスト（GraphStore連携、データフロー、エラーハンドリング）
- [x] 手動テスト（境界値、再現性、パラメータ効果）
- [x] Lint/型チェックパス

## Documentation

- [実装ガイド](outputs/phase-12/implementation-guide.md)
- [APIドキュメント](outputs/phase-12/api-documentation.md)
- [アーキテクチャ設計](outputs/phase-2/architecture-design.md)

## Related Issues

- Closes #XX

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

## CI確認【必須】

PR作成後、CIの状態を確認:

```bash
# CI状態確認
gh pr checks

# CIが失敗した場合
# 1. 失敗原因を特定
# 2. 修正をコミット
# 3. 再プッシュ
```

| CI項目            | 期待結果 | 実際の結果 |
| ----------------- | -------- | ---------- |
| Build             | Pass     |            |
| Lint              | Pass     |            |
| Type Check        | Pass     |            |
| Unit Tests        | Pass     |            |
| Integration Tests | Pass     |            |

---

## タスク完了処理【必須】

**PRが作成され、CIが通過した後、タスクディレクトリを完了タスクフォルダに移動する。**

### 移動手順

```bash
# 1. タスクディレクトリをcompleted-tasksに移動
mv docs/30-workflows/community-detection-leiden/ docs/30-workflows/completed-tasks/

# 2. 移動を確認
ls docs/30-workflows/completed-tasks/ | grep community-detection-leiden

# 3. 変更をコミット
git add docs/30-workflows/
git commit -m "docs(workflows): community-detection-leidenをcompleted-tasksに移動"
git push
```

### artifacts.json更新

`artifacts.json`の`task.status`を「completed」に更新:

```json
{
  "task": {
    "status": "completed",
    "completedAt": "{{ISO_TIMESTAMP}}"
  }
}
```

### index.md更新

`index.md`のステータスを「完了」に更新:

```markdown
| ステータス | 完了 |
```

---

## 完了条件チェックリスト

| #   | 項目                                               | 必須 | 確認 |
| --- | -------------------------------------------------- | ---- | ---- |
| 1   | 全変更がコミットされている                         | ✅   |      |
| 2   | PRが作成されている                                 | ✅   |      |
| 3   | CIが全て通過している                               | ✅   |      |
| 4   | PRサマリーが記録されている                         | ✅   |      |
| 5   | タスクディレクトリが `completed-tasks/` に移動済み | ✅   |      |
| 6   | `artifacts.json` の `status` が `"completed"`      | ✅   |      |
| 7   | `index.md` のステータスが「完了」に更新されている  | ✅   |      |
| 8   | （該当時）元の未タスク指示書が削除済み             | 条件 |      |
| 9   | **本Phase内の全作業を100%完了**                    | ✅   |      |

---

## スキル100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] /ai:diff-to-pr（または手動PR作成）が完了
- [ ] CIが通過
- [ ] タスクディレクトリがcompleted-tasksに移動済み
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/community-detection-leiden --phase 13
```

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] PR作成・CI確認・移動が完了
- [ ] ワークフロー完了をindex.mdに記録
- [ ] artifacts.jsonを最終更新

---

## 依存関係

- **前提**: Phase 12 が完了していること
- **後続**: なし（ワークフロー完了）

---

## スキルフィードバック記録（Phase完了後に記入）

| スキル         | 結果 | 備考 |
| -------------- | ---- | ---- |
| /ai:diff-to-pr |      |      |

---

## ワークフロー完了確認

全Phaseが完了したことを確認し、以下を実行:

1. `index.md`のステータスを「完了」に更新
2. `artifacts.json`の`task.status`を「completed」に更新
3. タスクディレクトリを`completed-tasks/`に移動
4. ブランチを削除（必要に応じて）

---

## 次のアクション

PRがマージされたら:

1. ✅ `index.md`のステータスを「完了」に更新
2. ✅ `artifacts.json`の`task.status`を「completed」に更新
3. ✅ タスクディレクトリが`completed-tasks/`に移動済み
4. 🔄 ブランチを削除（オプション）

**ワークフロー完了**
