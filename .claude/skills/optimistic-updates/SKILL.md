---
name: optimistic-updates
description: |
  楽観的更新（Optimistic Updates）パターンの実装スキル。サーバーレスポンス前にUIを即座更新し、失敗時のロールバック機構を提供することで、レスポンシブなユーザー体験を実現します。

  📖 参考資料:
  • 『Designing Data-Intensive Applications』（Martin Kleppmann）/ 適用: 分散システムにおける楽観的並行制御 / 目的: 競合検出とロールバック戦略の設計
  • 『React Query Essentials』（TanStack）/ 適用: onMutate/onError/onSettledフック / 目的: 楽観的更新とロールバックの自動化
  • 『SWR Documentation』（Vercel）/ 適用: optimisticDataとrollbackOnError / 目的: 宣言的な楽観的更新の実装

  UIの即座更新が必要な時、CRUD操作のレイテンシを隠蔽したい時、React Query/SWRで楽観的更新を実装したい時、ロールバック戦略を設計したい時、競合状態を処理したい時に使用します。

allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
---

# 楽観的更新パターンスキル

## 概要

楽観的更新（Optimistic Updates）は、サーバーからの応答を待たずにUIを即座に更新するパターンです。ユーザー体験を大幅に向上させますが、失敗時の適切なロールバック処理と競合制御が必要です。

本スキルは、React Query、SWR、その他の状態管理ライブラリを使用した楽観的更新の実装、エラーハンドリング、テスト戦略を包括的にカバーします。

詳細な実装手順は以下のレベル別リソースを参照してください：

- **レベル1**: 基礎概念、用語、基本フロー理解
- **レベル2**: React Query/SWRでの基本実装
- **レベル3**: 競合制御、エラーハンドリング、高度なパターン
- **レベル4**: 分散システム、複雑な状態管理、パフォーマンス最適化

## ワークフロー

### Phase 1: 要件分析と設計

**目的**: 楽観的更新の適用可否を判断し、設計方針を決定する

**アクション**:

1. `references/Level1_basics.md` で楽観的更新の基礎概念を確認
2. `references/applicability-criteria.md` で適用基準をチェック
3. 対象操作の成功率、重要度、可逆性を評価
4. ロールバック戦略（即座 vs 遅延、完全 vs 部分）を決定
5. 競合制御の必要性を判定

**Task**: `agents/analyze-requirements.md` を参照

**判断ポイント**:

- 成功率が99%以上？ → 楽観的更新適用候補
- 金融トランザクションや不可逆操作？ → 楽観的更新は避ける
- 複数ユーザーの同時編集？ → 競合制御が必須

### Phase 2: 実装

**目的**: 要件に基づいて楽観的更新を実装する

**アクション**:

1. `references/Level2_intermediate.md` で実装パターンを確認
2. 状態管理ライブラリに応じたテンプレートを選択：
   - React Query: `assets/react-query-template.ts`
   - SWR: `assets/swr-template.ts`
   - Redux/Zustand: `assets/state-management-template.ts`
3. CRUD操作別の実装：
   - 更新: `references/update-patterns.md`
   - 新規作成: `references/create-patterns.md`
   - 削除: `references/delete-patterns.md`
4. エラーハンドリングとロールバック機構の実装
5. `references/Level3_advanced.md` で競合制御を実装（必要な場合）

**Task**: `agents/implement-optimistic-update.md` を参照

### Phase 3: テストと検証

**目的**: 実装の品質を確保し、エッジケースをカバーする

**アクション**:

1. `references/testing-strategies.md` でテスト戦略を確認
2. 正常系のテスト実装（即座更新、サーバー確認）
3. 異常系のテスト実装（ロールバック、エラー通知）
4. 競合状態のテスト（複数ミューテーション同時実行）
5. `scripts/validate-implementation.mjs` で実装品質を検証
6. `scripts/log_usage.mjs` で使用履歴を記録

**Task**: `agents/validate-and-test.md` を参照

## Task仕様ナビ

| タスク                 | 対象レベル | 主要リソース                 | スクリプト                    | テンプレート              |
| ---------------------- | ---------- | ---------------------------- | ----------------------------- | ------------------------- |
| 適用可否判断           | L1         | `applicability-criteria.md`  | -                             | -                         |
| React Query基本実装    | L2         | `Level2_intermediate.md`     | -                             | `react-query-template.ts` |
| SWR基本実装            | L2         | `Level2_intermediate.md`     | -                             | `swr-template.ts`         |
| 更新操作の楽観的更新   | L2         | `update-patterns.md`         | -                             | `react-query-template.ts` |
| 新規作成の楽観的更新   | L2-L3      | `create-patterns.md`         | -                             | `react-query-template.ts` |
| 削除の楽観的更新       | L2         | `delete-patterns.md`         | -                             | `react-query-template.ts` |
| 競合制御の実装         | L3         | `Level3_advanced.md`         | -                             | -                         |
| ロールバック戦略の実装 | L2-L3      | `rollback-strategies.md`     | -                             | -                         |
| エラーハンドリング     | L2-L3      | `error-handling-patterns.md` | -                             | -                         |
| テスト実装             | L2-L3      | `testing-strategies.md`      | `generate-test-cases.mjs`     | `test-template.ts`        |
| パフォーマンス最適化   | L3-L4      | `Level4_expert.md`           | `validate-implementation.mjs` | -                         |
| 分散システム対応       | L4         | `Level4_expert.md`           | -                             | -                         |

## ベストプラクティス

### すべきこと ✓

- **適用基準の遵守**: 成功率99%以上、可逆性のある操作にのみ適用
- **完全なロールバック**: 失敗時は完全に元の状態に戻す
- **明確なフィードバック**: 成功、失敗、ロールバックを明確にユーザーに通知
- **競合状態の考慮**: 複数ミューテーションの同時実行をキャンセル/制御
- **段階的な詳細化**: Level1から段階的により複雑なシナリオへ
- **一貫性の維持**: サーバーの真実（Source of Truth）との同期を確保
- **エラーログの記録**: 失敗時のコンテキストとスタックトレースを記録
- **テストの包括性**: 正常系、異常系、競合状態をすべてカバー

### 避けるべきこと ✗

- **重要トランザクションへの適用**: 金融、医療、法的な重要操作には使用しない
- **不可逆操作への適用**: 削除、課金、送信など取り消せない操作は慎重に
- **不完全なロールバック**: 部分的なロールバックで矛盾状態を作らない
- **エラーの無視**: ロールバック失敗時のフォールバック処理を省略しない
- **過度な楽観性**: 成功率が低い（<95%）操作には適用しない
- **競合制御の省略**: 複数ユーザー環境で競合検出を実装しない
- **テストの不足**: ロールバックやエラーケースのテストを省略しない
- **フィードバックの欠如**: ユーザーに状態変化を通知しない

## リソース参照

### ドキュメント

| リソース                                | 説明                                         | 対象レベル |
| --------------------------------------- | -------------------------------------------- | ---------- |
| `references/Level1_basics.md`           | 楽観的更新の基礎概念、用語、基本フロー       | L1         |
| `references/Level2_intermediate.md`     | React Query/SWRでの基本実装パターン          | L2         |
| `references/Level3_advanced.md`         | 競合制御、高度なエラーハンドリング、最適化   | L3         |
| `references/Level4_expert.md`           | 分散システム、複雑な状態管理、アーキテクチャ | L4         |
| `references/applicability-criteria.md`  | 楽観的更新の適用可否判断基準                 | L1         |
| `references/update-patterns.md`         | 更新操作の実装パターン                       | L2         |
| `references/create-patterns.md`         | 新規作成の実装パターン                       | L2-L3      |
| `references/delete-patterns.md`         | 削除操作の実装パターン                       | L2         |
| `references/rollback-strategies.md`     | ロールバック戦略とパターン                   | L2-L3      |
| `references/error-handling-patterns.md` | エラーハンドリングとリトライ戦略             | L2-L3      |
| `references/testing-strategies.md`      | テスト戦略とエッジケース                     | L2-L3      |

### スクリプト

```bash
# 実装品質の検証
node .claude/skills/optimistic-updates/scripts/validate-implementation.mjs --help

# テストケースの自動生成
node .claude/skills/optimistic-updates/scripts/generate-test-cases.mjs --help

# 使用履歴の記録と自動評価
node .claude/skills/optimistic-updates/scripts/log_usage.mjs --help
```

### テンプレート

```bash
# React Queryテンプレート
cat .claude/skills/optimistic-updates/assets/react-query-template.ts

# SWRテンプレート
cat .claude/skills/optimistic-updates/assets/swr-template.ts

# 状態管理テンプレート
cat .claude/skills/optimistic-updates/assets/state-management-template.ts

# テストテンプレート
cat .claude/skills/optimistic-updates/assets/test-template.ts
```

## 変更履歴

| Version | Date       | Changes                                                             |
| ------- | ---------- | ------------------------------------------------------------------- |
| 1.0.0   | 2025-12-31 | 初版作成、18-skills.md仕様準拠、Task仕様ナビ統合、allowed-tools定義 |
