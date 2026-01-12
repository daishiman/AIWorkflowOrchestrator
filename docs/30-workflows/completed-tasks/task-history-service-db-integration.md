# HistoryService データベース統合 - タスク指示書

## メタ情報

| 項目         | 内容                            |
| ------------ | ------------------------------- |
| タスクID     | history-service-db-integration  |
| タスク名     | HistoryService データベース統合 |
| 分類         | 改善                            |
| 対象機能     | 履歴/ログ表示UI                 |
| 優先度       | 高                              |
| 見積もり規模 | 中規模                          |
| ステータス   | 未実施                          |
| 発見元       | Phase 12（未タスク検出）        |
| 発見日       | 2026-01-11                      |
| 依存タスク   | CONV-05-02（履歴取得サービス）  |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

履歴UIコンポーネント統合タスク（history-ui-integration）において、UIコンポーネントとIPCハンドラーの統合は完了したが、HistoryServiceはスタブ実装のままである。現在のHistoryServiceは空のデータを返すダミー実装となっており、実際のデータベースとは接続されていない。

### 1.2 問題点・課題

1. **データ取得不可**: 現在のHistoryServiceは全メソッドで空データを返す
   - `getFileHistory`: 常に `{ items: [], total: 0, hasMore: false }` を返す
   - `getVersionDetail`: 常に `null` を返す
   - `getConversionLogs`: 常に空配列を返す
   - `restoreVersion`: 復元処理が実装されていない

2. **TODO コメントが残存**: HistoryService.ts に5つのTODOコメントが存在
   - Line 22: `TODO: Integrate with actual database from CONV-05-02`
   - Line 32: `TODO: Implement actual database query`
   - Line 48: `TODO: Implement actual database query`
   - Line 74: `TODO: Implement actual database query`
   - Line 93: `TODO: Implement actual restoration logic`

3. **手動テストの DEFERRED 項目**: GUI環境での検証が未完了
   - MT-06: 追加読み込み機能の検証
   - IT-03: データ永続化の検証

### 1.3 放置した場合の影響

- 履歴UIは表示されるが、実際の履歴データが表示されない
- ユーザーはファイルのバージョン履歴を確認できない
- バージョン復元機能が使用できない
- 変換ログの確認ができない

---

## 2. 何を達成するか（What）

### 2.1 目的

HistoryServiceのスタブ実装を、CONV-05-02で実装されたデータベースサービスと統合し、実際の履歴データを取得・表示できるようにする。

### 2.2 最終ゴール

1. 履歴UIで実際のファイル履歴データが表示される
2. バージョン詳細が正しく取得・表示される
3. 変換ログがフィルタリング可能な状態で表示される
4. バージョン復元機能が正常に動作する
5. DEFERRED 項目（MT-06, IT-03）がVERIFIED状態になる

### 2.3 スコープ

#### 含むもの

- HistoryService.ts のデータベース接続実装
- 4つのメソッドの実DB対応
  - `getFileHistory`
  - `getVersionDetail`
  - `getConversionLogs`
  - `restoreVersion`
- 既存テストの維持・拡張
- DEFERRED項目の検証

#### 含まないもの

- 新しいUIコンポーネントの作成
- IPCハンドラーの変更（既に完了済み）
- preloadスクリプトの変更（既に完了済み）
- validateDOMNesting警告の修正（別タスク: CONV-05-03）

### 2.4 成果物

| 成果物             | パス                                                              |
| ------------------ | ----------------------------------------------------------------- |
| HistoryService実装 | `apps/desktop/src/main/services/HistoryService.ts`                |
| テスト更新         | `apps/desktop/src/main/services/__tests__/HistoryService.test.ts` |
| 検証レポート       | `docs/30-workflows/{{タスクフォルダ}}/outputs/`                   |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

1. CONV-05-02（履歴取得サービス）が完了していること
2. データベーススキーマが定義されていること
3. SQLiteまたは対象DBへの接続方法が確立していること

### 3.2 依存タスク

| タスク                 | 説明             | ステータス   |
| ---------------------- | ---------------- | ------------ |
| CONV-05-01             | 履歴データ永続化 | 確認必要     |
| CONV-05-02             | 履歴取得サービス | **必須依存** |
| history-ui-integration | 履歴UI統合       | 完了         |

### 3.3 必要な知識

- TypeScript / Electron
- SQLite または対象DBの操作
- IPC通信パターン（既存実装の理解）
- Result<T>型によるエラーハンドリング

### 3.4 推奨アプローチ

1. CONV-05-02の実装を確認し、HistoryServiceインターフェースとの互換性を確認
2. 依存性注入パターンで実DBサービスを注入
3. 既存のスタブ実装を段階的に置き換え
4. 各メソッドごとにテスト→実装→検証のサイクル

---

## 4. 実行手順

### Phase構成

| Phase | 名称     | 目的                                             |
| ----- | -------- | ------------------------------------------------ |
| 1     | 要件確認 | CONV-05-02の実装確認、インターフェース互換性確認 |
| 2     | 設計     | 統合設計、依存性注入方法の決定                   |
| 3     | 実装     | 4メソッドの実DB対応                              |
| 4     | テスト   | ユニットテスト・統合テスト実行                   |
| 5     | 検証     | DEFERRED項目の検証、手動テスト                   |

### Phase 1: 要件確認

#### 目的

CONV-05-02の実装を確認し、HistoryServiceとの統合方法を決定する。

#### 手順

1. CONV-05-02の成果物を確認
2. データベーススキーマを確認
3. 履歴取得サービスのインターフェースを確認
4. HistoryServiceとの互換性を分析

#### 成果物

- 要件確認レポート

#### 完了条件

- CONV-05-02のAPIインターフェースが理解されている
- 統合方法が決定されている

### Phase 2: 設計

#### 目的

HistoryServiceとCONV-05-02サービスの統合設計を行う。

#### 手順

1. 依存性注入パターンの設計
2. データ変換ロジックの設計（必要な場合）
3. エラーハンドリング方針の決定

#### 成果物

- 統合設計書

#### 完了条件

- 統合設計が文書化されている
- 実装方針が明確である

### Phase 3: 実装

#### 目的

HistoryServiceの4メソッドを実DB対応に更新する。

#### 手順

1. `getFileHistory` の実装
2. `getVersionDetail` の実装
3. `getConversionLogs` の実装
4. `restoreVersion` の実装
5. TODO コメントの削除

#### 成果物

- 更新された HistoryService.ts

#### 完了条件

- 全4メソッドが実DB接続で動作
- TODO コメントがすべて解消

### Phase 4: テスト

#### 目的

実装の品質を保証する。

#### 手順

1. 既存テストの実行・確認
2. 必要に応じてテストケースの追加
3. 統合テストの実行

#### 成果物

- テスト結果レポート

#### 完了条件

- 全テストがPASS
- カバレッジ80%以上維持

### Phase 5: 検証

#### 目的

DEFERRED項目を含む手動検証を実施する。

#### 手順

1. GUI環境での動作確認
2. MT-06（追加読み込み）の検証
3. IT-03（データ永続化）の検証
4. 検証レポート作成

#### 成果物

- 検証レポート

#### 完了条件

- DEFERRED項目がすべてVERIFIED
- 手動テスト完了

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `getFileHistory` が実データを返す
- [ ] `getVersionDetail` が実データを返す
- [ ] `getConversionLogs` が実データを返す
- [ ] `restoreVersion` が復元処理を実行する
- [ ] ページネーションが正常に動作する
- [ ] ログフィルタリングが正常に動作する

### 品質要件

- [ ] 全テストがPASS（52件以上）
- [ ] カバレッジ80%以上
- [ ] TypeScript型エラーなし
- [ ] ESLintエラーなし

### ドキュメント要件

- [ ] HistoryService.ts のTODOコメント解消
- [ ] 検証レポート作成
- [ ] システム仕様書の統合ステータス更新

---

## 6. 検証方法

### テストケース

| ケースID | テスト内容         | 期待結果                             |
| -------- | ------------------ | ------------------------------------ |
| DB-01    | 履歴一覧取得       | 実データがリストで表示される         |
| DB-02    | ページネーション   | 追加読み込みで次のデータが取得される |
| DB-03    | バージョン詳細取得 | 選択バージョンの詳細情報が表示される |
| DB-04    | ログ取得           | 変換ログが一覧表示される             |
| DB-05    | ログフィルタ       | レベル別フィルタリングが動作する     |
| DB-06    | バージョン復元     | 過去バージョンへの復元が実行される   |

### 検証手順

1. Electronアプリを起動
2. 履歴ページへ遷移
3. 実データが表示されることを確認
4. 各機能（選択、フィルタ、復元）を操作
5. 結果を記録

---

## 7. リスクと対策

| リスク                 | 影響度 | 発生確率 | 対策                           |
| ---------------------- | ------ | -------- | ------------------------------ |
| CONV-05-02が未完了     | 高     | 低       | 依存タスクの完了を待つ         |
| インターフェース不一致 | 中     | 中       | アダプターパターンで吸収       |
| パフォーマンス低下     | 中     | 低       | インデックス最適化、クエリ改善 |
| データ移行問題         | 低     | 低       | テストデータで事前検証         |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント         | パス                                                                                  |
| -------------------- | ------------------------------------------------------------------------------------- |
| 履歴UI仕様           | `.claude/skills/aiworkflow-requirements/references/ui-ux-history-panel.md`            |
| 統合実装ガイド       | `docs/30-workflows/history-ui-integration/outputs/phase-12/implementation-guide.md`   |
| 未タスク検出レポート | `docs/30-workflows/history-ui-integration/outputs/phase-12/unassigned-task-report.md` |

### 関連コード

| ファイル           | パス                                               | 説明          |
| ------------------ | -------------------------------------------------- | ------------- |
| HistoryService.ts  | `apps/desktop/src/main/services/HistoryService.ts` | 対象ファイル  |
| historyHandlers.ts | `apps/desktop/src/main/ipc/historyHandlers.ts`     | IPCハンドラー |
| HistoryPage.tsx    | `apps/desktop/src/renderer/pages/HistoryPage.tsx`  | 履歴ページ    |

---

## 9. 備考

### 発見元の原文

```
コードベース内のTODO/FIXME検出結果（history関連ファイル）:

| ファイル          | 行  | 内容                                                   |
| ----------------- | --- | ------------------------------------------------------ |
| HistoryService.ts | 22  | `TODO: Integrate with actual database from CONV-05-02` |
| HistoryService.ts | 32  | `TODO: Implement actual database query`                |
| HistoryService.ts | 48  | `TODO: Implement actual database query`                |
| HistoryService.ts | 74  | `TODO: Implement actual database query`                |
| HistoryService.ts | 93  | `TODO: Implement actual restoration logic`             |
```

### 補足事項

- 本タスクはCONV-05-02の完了後に着手すること
- history-ui-integrationタスクで作成されたスタブ実装を置き換える形で進める
- 既存の52テストは維持しつつ、必要に応じて拡張する
