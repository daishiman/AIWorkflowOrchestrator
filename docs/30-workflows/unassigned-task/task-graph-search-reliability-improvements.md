# グラフ検索信頼性改善 - タスク指示書

## メタ情報

| 項目         | 内容                        |
| ------------ | --------------------------- |
| タスクID     | CONV-07-04-IMPROVE-001      |
| タスク名     | グラフ検索信頼性改善        |
| 分類         | 改善                        |
| 対象機能     | GraphSearchStrategy         |
| 優先度       | 中                          |
| 見積もり規模 | 中規模                      |
| ステータス   | 未実施                      |
| 発見元       | Phase 9（品質保証フェーズ） |
| 発見日       | 2026-01-13                  |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

GraphSearchStrategy実装（CONV-07-04）のPhase 9品質保証レビューにおいて、信頼性向上のための改善推奨事項が検出された。現在の実装は機能的に完成しているが、プロダクション環境での長期運用を考慮した場合、追加の防御的プログラミングが望ましい。

### 1.2 問題点・課題

1. **タイムアウト設定の欠如**
   - GraphStore API呼び出しにタイムアウトが設定されていない
   - Embedding生成API呼び出しにタイムアウトが設定されていない
   - 外部サービス障害時に無限待機のリスク

2. **エラーコード体系の不足**
   - エラー種別を識別するための体系的なコード未定義
   - デバッグ・運用時のエラー原因特定が困難

### 1.3 放置した場合の影響

- 外部サービス（GraphStore, Embedding API）障害時にアプリケーション全体がハングアップする可能性
- 運用時のエラー調査に時間がかかる
- SLA（応答時間保証）の達成が困難

---

## 2. 何を達成するか（What）

### 2.1 目的

GraphSearchStrategyの外部API呼び出しにタイムアウト設定を追加し、エラー発生時の識別性を向上させる。

### 2.2 最終ゴール

1. 全ての外部API呼び出しに設定可能なタイムアウトが適用されている
2. エラー発生時にエラーコードで原因を特定できる
3. タイムアウト時に適切なフォールバック動作が実行される

### 2.3 スコープ

#### 含むもの

- GraphStore API呼び出しへのタイムアウト追加
- EmbeddingProvider API呼び出しへのタイムアウト追加
- GraphSearchOptionsへのtimeoutMsオプション追加
- エラーコード体系の定義と実装
- タイムアウトエラーのハンドリング

#### 含まないもの

- 他の検索戦略（Keyword, Vector）への適用
- リトライ機構の実装（別タスク）
- サーキットブレーカーの実装（別タスク）

### 2.4 成果物

| 成果物                       | 説明               |
| ---------------------------- | ------------------ |
| graph-search-strategy.ts更新 | タイムアウト実装   |
| search-error-codes.ts        | エラーコード定義   |
| ユニットテスト追加           | タイムアウトテスト |
| APIリファレンス更新          | 新オプション記載   |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- GraphSearchStrategy基本実装が完了していること（CONV-07-04）
- AbortController APIが使用可能であること

### 3.2 依存タスク

| タスクID   | タスク名       | 状態 |
| ---------- | -------------- | ---- |
| CONV-07-04 | グラフ検索戦略 | 完了 |

### 3.3 必要な知識

- TypeScript async/await
- AbortController API
- Promise.race パターン
- エラーハンドリングパターン

### 3.4 推奨アプローチ

1. AbortControllerを使用したタイムアウト実装
2. Promise.raceで外部API呼び出しとタイムアウトを競合させる
3. Result<T, E>パターンでエラーを型安全に返却

---

## 4. 実行手順

### Phase構成

- Phase 1-4: タスク仕様書作成スキルの標準フェーズに従う
- Phase 5: タイムアウト実装
- Phase 6: エラーコード体系実装
- Phase 7-12: テスト・品質保証・ドキュメント

### Phase 5: タイムアウト実装

#### 目的

外部API呼び出しに設定可能なタイムアウトを追加する

#### 手順

1. GraphSearchOptionsにtimeoutMsオプションを追加
2. withTimeout()ヘルパー関数を作成
3. GraphStore.findSimilarEntities()呼び出しをラップ
4. EmbeddingProvider.generateEmbedding()呼び出しをラップ
5. タイムアウト発生時はTimeoutErrorを返却

#### 成果物

- graph-search-strategy.ts更新版
- timeout-utils.ts（ヘルパー関数）

#### 完了条件

- [ ] timeoutMsオプションが設定可能
- [ ] デフォルト値: 30000ms
- [ ] タイムアウト時にTimeoutErrorが返却される

### Phase 6: エラーコード体系実装

#### 目的

エラー種別を識別可能なコード体系を導入する

#### 手順

1. SearchErrorCodeenum定義
2. SearchError型にcodeプロパティ追加
3. 既存エラーにコード付与
4. タイムアウトエラーコード追加

#### 成果物

- search-error-codes.ts

#### 完了条件

- [ ] エラーコード定義完了
- [ ] 既存エラーにコード付与
- [ ] ドキュメント更新

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] タイムアウト設定が可能（timeoutMsオプション）
- [ ] デフォルトタイムアウト30000ms
- [ ] タイムアウト時に適切なエラー返却
- [ ] エラーコードでエラー種別識別可能

### 品質要件

- [ ] ユニットテストカバレッジ90%以上
- [ ] タイムアウトテスト合格
- [ ] 既存テスト全件合格

### ドキュメント要件

- [ ] APIリファレンス更新
- [ ] エラーコード一覧ドキュメント

---

## 6. 検証方法

### テストケース

| No  | テストケース                     | 期待結果         |
| --- | -------------------------------- | ---------------- |
| 1   | timeoutMs=100でスロークエリ実行  | TimeoutError返却 |
| 2   | timeoutMs=30000で正常クエリ実行  | 正常結果返却     |
| 3   | タイムアウト後のリソース解放確認 | AbortSignal発火  |

### 検証手順

1. `pnpm vitest run graph-search-strategy.test.ts`
2. タイムアウトテストケース合格確認
3. 既存テスト69件全合格確認

---

## 7. リスクと対策

| リスク                    | 影響度 | 発生確率 | 対策                               |
| ------------------------- | ------ | -------- | ---------------------------------- |
| 既存テスト破壊            | 高     | 低       | 後方互換性維持（オプショナル引数） |
| AbortController非対応環境 | 中     | 低       | Node.js 16+必須を明記              |
| タイムアウト値の最適化    | 中     | 中       | 設定可能にして運用時調整可能に     |

---

## 8. 参照情報

### 関連ドキュメント

- [GraphSearchStrategy実装レポート](../graph-search-strategy/outputs/phase-5/implementation-report.md)
- [Phase 9品質保証レポート](../graph-search-strategy/outputs/phase-9/reliability-test.md)
- [APIリファレンス](../../docs/api/graph-search-strategy.md)

### 参考資料

- [MDN AbortController](https://developer.mozilla.org/docs/Web/API/AbortController)
- [TypeScript Promise.race](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-5.html)

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
Phase 9改善推奨事項:
- タイムアウト設定の追加: 外部API呼び出し（GraphStore, Embedding）のタイムアウト
- 詳細なエラーコード体系の導入: エラー種別を識別可能なコード体系
```

### 補足事項

- この改善は将来的な推奨事項であり、現在のPR/マージをブロックするものではない
- プロダクション運用開始前の実装を推奨
