# Phase 13: PR作成

## メタ情報

| 項目   | 値                         |
| ------ | -------------------------- |
| Phase  | 13                         |
| 機能名 | task-knowledge-graph-store |
| 作成日 | 2026-01-13                 |

## 目的

全Phase完了後の最終成果物として、Pull Requestを作成する。変更内容を整理し、レビュアーが理解しやすいPR説明文を作成する。

## 実行タスク

- **変更サマリ作成**: 実装内容の概要整理
- **PR説明文作成**: 変更内容・テスト結果・影響範囲
- **レビュー依頼**: 適切なレビュアーのアサイン
- **CI確認**: 自動テスト・Lintの通過確認
- **マージ準備**: コンフリクト解消・リベース

## 参照資料

### 全Phase成果物

| Phase | 主要成果物                 | 用途                 |
| ----- | -------------------------- | -------------------- |
| 1     | 要件定義書                 | PR説明の背景         |
| 2-3   | 設計書・レビュー結果       | アーキテクチャ説明   |
| 4-7   | テスト・カバレッジ         | テスト結果セクション |
| 8-9   | リファクタリング・品質保証 | コード品質セクション |
| 10-11 | レビュー・マニュアルテスト | 検証結果セクション   |
| 12    | ドキュメント               | ドキュメント変更     |

## PRテンプレート

```markdown
## Summary

Knowledge Graph Store の実装を追加します。エンティティ・関係・コミュニティを管理するためのStore層と、グラフ探索機能を提供します。

### 主な変更点

- EntityStore: エンティティのCRUD操作
- RelationStore: 関係の管理と証拠追跡
- CommunityStore: コミュニティの階層管理
- GraphQueryService: グラフ探索・最短経路検索

### 関連Issue

- Closes #XXX

## Changes

### 新規ファイル

- `packages/shared/src/services/graph/types.ts` - 型定義
- `packages/shared/src/services/graph/errors.ts` - エラークラス
- `packages/shared/src/services/graph/entity-store.ts` - EntityStore実装
- `packages/shared/src/services/graph/relation-store.ts` - RelationStore実装
- `packages/shared/src/services/graph/community-store.ts` - CommunityStore実装
- `packages/shared/src/services/graph/graph-query-service.ts` - グラフ探索実装
- `packages/shared/src/services/graph/knowledge-graph-store.ts` - 統合ファクトリ

### テストファイル

- `packages/shared/src/services/graph/__tests__/*.test.ts` - ユニットテスト
- `packages/shared/src/services/graph/__tests__/integration/*.test.ts` - 統合テスト

## Test Plan

### 自動テスト結果

| カテゴリ       | テスト数 | 結果 |
| -------------- | -------- | ---- |
| ユニットテスト | XX       | PASS |
| 統合テスト     | XX       | PASS |
| パフォーマンス | XX       | PASS |

### カバレッジ

| 指標              | 値  |
| ----------------- | --- |
| Line Coverage     | XX% |
| Branch Coverage   | XX% |
| Function Coverage | XX% |

### マニュアルテスト

- [x] EntityStore操作確認
- [x] RelationStore操作確認
- [x] CommunityStore操作確認
- [x] GraphQueryService操作確認
- [x] エラーメッセージ品質確認

## Screenshots / Demos

（該当する場合）

## Checklist

- [x] コードがプロジェクトのスタイルガイドに準拠している
- [x] 自己レビューを実施した
- [x] コードにコメント（特に複雑な箇所）を追加した
- [x] ドキュメントを更新した
- [x] 変更により新しい警告が発生していない
- [x] テストを追加し、すべて成功している
- [x] 依存パッケージの更新は必要ない

---

🤖 Generated with [Claude Code](https://claude.ai/claude-code)
```

## 統合テスト連携【必須】

PR作成前の最終確認:

| 確認項目         | 基準                   | 結果       |
| ---------------- | ---------------------- | ---------- |
| 全テストPASS     | CI上で成功             | {{RESULT}} |
| Lint PASS        | 警告・エラー0件        | {{RESULT}} |
| 型チェック PASS  | TypeScriptエラー0件    | {{RESULT}} |
| コンフリクトなし | mainとの差分が解消済み | {{RESULT}} |
| レビュアー設定   | 適切な人がアサイン     | {{RESULT}} |

## 実行手順

### 1. 変更内容の確認

```bash
# 変更ファイル一覧
git diff --name-only main

# 変更統計
git diff --stat main

# コミット履歴
git log --oneline main..HEAD
```

### 2. 最新mainとの同期

```bash
# mainを最新化
git fetch origin main

# リベース（または マージ）
git rebase origin/main

# コンフリクト解消（該当時）
```

### 3. PR作成

```bash
# プッシュ
git push origin HEAD

# PR作成（GitHub CLI使用時）
gh pr create --title "feat: Knowledge Graph Store 実装" --body-file .github/PULL_REQUEST_TEMPLATE.md
```

### 4. CI確認

```bash
# CI状況確認
gh pr checks

# 失敗時はログ確認・修正
```

## PR説明文チェックリスト

| 項目       | 確認内容                             | 判定 |
| ---------- | ------------------------------------ | ---- |
| Summary    | 変更概要が明確                       | □    |
| 関連Issue  | 関連Issueがリンクされている          | □    |
| Changes    | 変更ファイルがリストされている       | □    |
| Test Plan  | テスト結果が記載されている           | □    |
| カバレッジ | カバレッジ情報が記載されている       | □    |
| Checklist  | チェックリストが完了している         | □    |
| レビュアー | 適切なレビュアーがアサインされている | □    |

## 成果物

| 成果物     | パス                                 | 説明       |
| ---------- | ------------------------------------ | ---------- |
| PRリンク   | `outputs/phase-13/pr-link.md`        | 作成したPR |
| 変更サマリ | `outputs/phase-13/change-summary.md` | 変更概要   |

## 完了条件

- [ ] 全Phase（1-12）が完了している
- [ ] 変更がmainにリベース済み
- [ ] CIが全て成功している
- [ ] PR説明文が作成されている
- [ ] レビュアーがアサインされている
- [ ] コンフリクトがない
- [ ] PRリンクが記録されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認（全Phase成果物）
2. 変更内容の確認
3. mainとの同期（リベース/マージ）
4. コンフリクト解消（該当時）
5. PR説明文の作成
6. PRの作成
7. CIの確認
8. レビュアーのアサイン
9. 成果物の作成・配置
10. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] PRが作成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/task-knowledge-graph-store --phase 13
```

## タスク完了

このPhaseでタスク仕様書に基づく全実装が完了します。PRがマージされれば、task-knowledge-graph-storeタスクは完了となります。

### 完了後のアクション

1. PRレビュー対応
2. マージ
3. タスクステータス更新（completed）
4. 関連Issueのクローズ
