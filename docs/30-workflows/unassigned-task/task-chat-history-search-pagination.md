# チャット履歴検索ページネーション改善 - タスク指示書

## メタ情報

```yaml
issue_number: 408
```

## メタ情報

| 項目         | 内容                                             |
| ------------ | ------------------------------------------------ |
| タスクID     | UT-CHAT-HIST-001                                 |
| タスク名     | チャット履歴検索ページネーション改善             |
| 分類         | 改善                                             |
| 対象機能     | チャット履歴検索（SearchSessionsUseCase）        |
| 優先度       | 低                                               |
| 見積もり規模 | 小規模                                           |
| ステータス   | 未実施                                           |
| 発見元       | Phase 12（ドキュメント更新）- TODO/FIXMEコメント |
| 発見日       | 2026-01-22                                       |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

SearchSessionsUseCaseの検索結果において、現在は返却されたセッション数をそのまま総件数（total）として返している。これはページネーション対応時に正確な総件数が必要になる場合に問題となる。

**該当箇所**:

```typescript
// packages/shared/src/features/chat-history/application/use-cases/SearchSessionsUseCase.ts:48
total: sessions.length, // TODO: 実際の総件数を返す場合はリポジトリを拡張
```

### 1.2 問題点・課題

| 問題点             | 詳細                                             |
| ------------------ | ------------------------------------------------ |
| 総件数の不正確さ   | limit/offsetを適用後の件数が総件数として返される |
| ページネーションUI | 正確な総ページ数を計算できない                   |
| ユーザー体験       | 「〇件中△件を表示」の表示ができない              |

### 1.3 放置した場合の影響

- 現状ではlimit/offsetを使用した本格的なページネーションが未実装のため、即座の影響はない
- 将来ページネーションUIを実装する際に追加の修正が必要になる
- 検索結果件数の表示が不正確になる可能性

---

## 2. 何を達成するか（What）

### 2.1 目的

IChatSessionRepositoryに総件数をカウントするメソッドを追加し、SearchSessionsUseCaseが正確な総件数を返却できるようにする。

### 2.2 最終ゴール

- 検索条件に一致する全セッションの件数が正確に返却される
- ページネーションUIに必要な情報（総件数、総ページ数）が計算可能

### 2.3 スコープ

#### 含むもの

- IChatSessionRepositoryへのcountメソッド追加
- DrizzleChatSessionRepositoryへのcount実装
- SearchSessionsUseCaseの修正
- 関連テストの追加

#### 含まないもの

- ページネーションUIの実装
- 無限スクロールの実装
- パフォーマンス最適化（大規模データ対応）

### 2.4 成果物

| 成果物         | パス                                                                                                   |
| -------------- | ------------------------------------------------------------------------------------------------------ |
| リポジトリ修正 | `packages/shared/src/features/chat-history/domain/repositories/IChatSessionRepository.ts`              |
| 実装修正       | `packages/shared/src/features/chat-history/infrastructure/persistence/DrizzleChatSessionRepository.ts` |
| UseCase修正    | `packages/shared/src/features/chat-history/application/use-cases/SearchSessionsUseCase.ts`             |
| テスト追加     | 各ファイルの対応テスト                                                                                 |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- Drizzle Repository実装が完了していること（完了済み）
- 既存テストが全てパスしていること

### 3.2 依存タスク

- なし（独立して実行可能）

### 3.3 必要な知識

- Drizzle ORM（count関数）
- Clean Architecture（Repository Pattern）
- TypeScript

### 3.4 推奨アプローチ

1. IChatSessionRepositoryにcountBySearchCriteriaメソッドを追加
2. DrizzleChatSessionRepositoryで実装
3. SearchSessionsUseCaseを修正して正確な総件数を返却
4. テスト追加

---

## 4. 実行手順

### Phase構成

このタスクは小規模のため、簡易フェーズ構成（3 Phase）で実行する。

### Phase 1: 設計・テスト作成

#### 目的

インターフェース設計とテストファースト開発

#### 手順

1. IChatSessionRepositoryにcountBySearchCriteriaシグネチャを追加
2. 失敗するテストを作成

#### 成果物

- インターフェース定義
- テストコード（Red状態）

#### 完了条件

- [ ] countBySearchCriteriaメソッドが定義されている
- [ ] テストが失敗することを確認

### Phase 2: 実装

#### 目的

機能実装とテストパス

#### 手順

1. DrizzleChatSessionRepositoryにcountBySearchCriteria実装
2. SearchSessionsUseCase修正
3. テストをパスさせる

#### 成果物

- Repository実装
- UseCase修正

#### 完了条件

- [ ] 全テストがパス
- [ ] 型エラーなし

### Phase 3: 品質確認

#### 目的

品質保証とドキュメント

#### 手順

1. カバレッジ確認
2. 静的解析実行
3. TODOコメント削除

#### 成果物

- 品質レポート

#### 完了条件

- [ ] カバレッジ80%以上
- [ ] Lintエラーなし
- [ ] TODOコメント削除済み

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] countBySearchCriteriaメソッドが正確な件数を返す
- [ ] SearchSessionsUseCaseが正確な総件数を返却する
- [ ] 既存機能に影響がない

### 品質要件

- [ ] 新規コードのテストカバレッジ80%以上
- [ ] 型エラー0件
- [ ] Lintエラー0件

### ドキュメント要件

- [ ] TODOコメントが削除されている
- [ ] システム仕様書の更新（必要に応じて）

---

## 6. 検証方法

### テストケース

| TC-ID  | テスト内容               | 期待結果       |
| ------ | ------------------------ | -------------- |
| TC-001 | 検索条件なしでカウント   | 全件数を返す   |
| TC-002 | キーワード条件でカウント | 一致件数を返す |
| TC-003 | 複合条件でカウント       | 一致件数を返す |
| TC-004 | 0件の場合                | 0を返す        |

### 検証手順

1. `pnpm --filter @repo/shared test` でテスト実行
2. `pnpm --filter @repo/shared typecheck` で型チェック
3. `pnpm --filter @repo/shared lint` でLintチェック

---

## 7. リスクと対策

| リスク             | 影響度 | 発生確率 | 対策                                  |
| ------------------ | ------ | -------- | ------------------------------------- |
| パフォーマンス低下 | 低     | 低       | COUNTクエリは軽量、大規模時は別途対応 |
| 既存テスト失敗     | 中     | 低       | 既存テストを確認してから実装          |

---

## 8. 参照情報

### 関連ドキュメント

| 資料                 | パス                                                                             |
| -------------------- | -------------------------------------------------------------------------------- |
| アーキテクチャ仕様   | `.claude/skills/aiworkflow-requirements/references/architecture-chat-history.md` |
| インターフェース仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-chat-history.md`   |

### 参考資料

- Drizzle ORM Documentation: count function
- Clean Architecture: Repository Pattern

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
// packages/shared/src/features/chat-history/application/use-cases/SearchSessionsUseCase.ts:48
total: sessions.length, // TODO: 実際の総件数を返す場合はリポジトリを拡張
```

### 補足事項

- このタスクは優先度「低」のため、ページネーションUI実装時に対応しても可
- 現状のシンプルな検索機能では即座の対応は不要
