# Phase 13: PR作成

## 1. 前提条件

### 1.1 Phase 1〜12 完了確認

| Phase | 名称                 | 完了状況 |
| ----- | -------------------- | -------- |
| 1     | 要件定義             | ⬜       |
| 2     | 設計                 | ⬜       |
| 3     | 設計レビューゲート   | ⬜       |
| 4     | テスト作成           | ⬜       |
| 5     | 実装                 | ⬜       |
| 6     | テスト拡充           | ⬜       |
| 7     | テストカバレッジ確認 | ⬜       |
| 8     | リファクタリング     | ⬜       |
| 9     | 品質保証             | ⬜       |
| 10    | 最終レビューゲート   | ⬜       |
| 11    | 手動テスト検証       | ⬜       |
| 12    | ドキュメント更新     | ⬜       |

### 1.2 品質チェック

```bash
# 最終品質チェック
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/desktop lint
pnpm --filter @repo/desktop test
```

| チェック項目       | 結果 |
| ------------------ | ---- |
| TypeScript エラー  | ⬜   |
| ESLint エラー      | ⬜   |
| テスト全 PASS      | ⬜   |
| カバレッジ目標達成 | ⬜   |

## 2. PR準備

### 2.1 ブランチ確認

```bash
# 現在のブランチ確認
git branch --show-current
# → task-9a-a-skill-file-manager

# mainブランチとの差分確認
git log main..HEAD --oneline
```

### 2.2 コミット整理

| コミット種別 | 内容                         |
| ------------ | ---------------------------- |
| feat         | SkillFileManager 実装        |
| test         | 単体/統合/セキュリティテスト |
| docs         | 実装ガイド、仕様書更新       |

### 2.3 変更ファイル一覧

| 操作 | ファイル                                                                              |
| ---- | ------------------------------------------------------------------------------------- |
| 新規 | `apps/desktop/src/main/services/skill/SkillFileManager.ts`                            |
| 新規 | `apps/desktop/src/main/services/skill/__tests__/SkillFileManager.test.ts`             |
| 新規 | `apps/desktop/src/main/services/skill/__tests__/SkillFileManager.integration.test.ts` |
| 更新 | `apps/desktop/src/main/services/skill/index.ts`                                       |
| 更新 | 仕様書ファイル（Phase 12 で更新）                                                     |

## 3. PR作成

### 3.1 PRタイトル

```
feat(skill): SkillFileManager実装 - ファイル読み書き・バックアップ・復元 (#TASK-9A-A)
```

### 3.2 PR本文テンプレート

```markdown
## Summary

- SkillFileManager クラスを実装
- スキルファイルの読み書き・バックアップ・復元機能を提供
- ~/.aiworkflow/skills/ は編集可能、~/.claude/skills/ は読み取り専用

## Changes

- 新規: SkillFileManager クラス（6メソッド + ユーティリティ）
- 新規: カスタムエラークラス（5種類）
- 新規: 単体テスト + 統合テスト + セキュリティテスト（96件）

## Test plan

- [ ] `pnpm --filter @repo/desktop test SkillFileManager` が全て PASS
- [ ] カバレッジ: Line ≥80%, Branch ≥80%, Function ≥90%
- [ ] セキュリティテスト: パストラバーサル、読み取り専用保護
- [ ] 手動テスト: 実際のスキルディレクトリで動作確認

## Related

- TASK-7D: ChatPanel統合（前提タスク）
- TASK-9A-B: IPCハンドラ実装（後続タスク）

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

### 3.3 PR作成コマンド

```bash
# リモートにプッシュ
git push -u origin task-9a-a-skill-file-manager

# PR作成（gh CLI使用）
gh pr create --title "feat(skill): SkillFileManager実装 - ファイル読み書き・バックアップ・復元 (#TASK-9A-A)" --body "$(cat <<'EOF'
## Summary

- SkillFileManager クラスを実装
- スキルファイルの読み書き・バックアップ・復元機能を提供
- ~/.aiworkflow/skills/ は編集可能、~/.claude/skills/ は読み取り専用

## Test plan

- [ ] `pnpm --filter @repo/desktop test SkillFileManager` が全て PASS
- [ ] カバレッジ目標達成
- [ ] セキュリティテスト PASS

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

## 4. PR作成後

### 4.1 CI確認

| チェック項目      | 結果 |
| ----------------- | ---- |
| TypeScript Build  | ⬜   |
| ESLint            | ⬜   |
| Unit Tests        | ⬜   |
| Integration Tests | ⬜   |

### 4.2 レビュー対応

| 対応項目             | ステータス |
| -------------------- | ---------- |
| レビューコメント対応 | ⬜         |
| 追加修正コミット     | ⬜         |
| CI再確認             | ⬜         |

## 5. 完了条件

- [ ] PRが作成されている
- [ ] CIが全て PASS
- [ ] レビュー対応完了
- [ ] マージ準備完了

## 6. 注意事項

⚠️ **PR作成はユーザーの明示的な許可を得てから実行すること**

本フェーズでは、PR作成の準備と手順を示すのみとし、実際のPR作成はユーザーの指示を待つこと。
