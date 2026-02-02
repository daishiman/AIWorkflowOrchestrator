# LLMハンドラータイムアウト実装 - タスク指示書

## メタ情報

```yaml
issue_number: 669
```

## メタ情報

| 項目         | 内容                                     |
| ------------ | ---------------------------------------- |
| タスクID     | task-imp-llm-handler-timeout-001         |
| タスク名     | LLMハンドラータイムアウト実装            |
| 分類         | 改善                                     |
| 対象機能     | LLM Handler / IPC通信                    |
| 優先度       | 中                                       |
| 見積もり規模 | 小規模                                   |
| ステータス   | 未実施                                   |
| 発見元       | コードベーススキャン（TODOコメント検出） |
| 発見日       | 2026-02-02                               |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`apps/desktop/src/main/handlers/__tests__/llm.test.ts:290` に以下のTODOコメントが存在する：

```
// TODO: Implement timeout mechanism in handler
```

LLMハンドラーにおいて、タイムアウト機構が未実装のままとなっている。これは、LLM APIへのリクエストが長時間応答しない場合に、アプリケーションがハングアップする可能性があることを示している。

### 1.2 問題点・課題

- LLM APIリクエストにタイムアウトが設定されていない
- ネットワーク障害やAPI遅延時にUIが無応答になる可能性
- ユーザーエクスペリエンスの低下

### 1.3 放置した場合の影響

- ネットワーク問題発生時にアプリケーションが無限待機
- ユーザーがアプリケーションを強制終了せざるを得ない状況
- リソース（メモリ、接続）のリーク可能性

---

## 2. 何を達成するか（What）

### 2.1 目的

LLMハンドラーにタイムアウト機構を実装し、指定時間内に応答がない場合に適切にエラーハンドリングを行う。

### 2.2 最終ゴール

- LLMリクエストに設定可能なタイムアウトが実装されている
- タイムアウト発生時に適切なエラーメッセージがUIに表示される
- タイムアウト値が設定ファイルまたは定数で管理されている

### 2.3 スコープ

#### 含むもの

- LLMハンドラーへのタイムアウトロジック追加
- タイムアウトエラーの型定義
- テストケースの追加
- タイムアウト定数の定義

#### 含まないもの

- リトライ機構の実装（別タスク: UT-RETRY系で管理）
- UIへのプログレスバー追加
- タイムアウト値のUI設定機能

### 2.4 成果物

| 成果物                | 説明                                    |
| --------------------- | --------------------------------------- |
| 更新済みLLMハンドラー | タイムアウトロジック実装                |
| タイムアウトエラー型  | error-handling.mdに準拠したエラーコード |
| テストケース          | タイムアウト動作の検証テスト            |
| 定数定義              | デフォルトタイムアウト値                |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- error-handling.mdのエラーコード体系を理解していること
- AbortController / Promiseタイムアウトパターンを理解していること

### 3.2 依存タスク

なし（独立して実行可能）

### 3.3 必要な知識

- TypeScript
- Node.js AbortController API
- Promiseタイムアウトパターン
- Electron IPC

### 3.4 推奨アプローチ

1. `AbortController` を使用したタイムアウト実装
2. デフォルトタイムアウト値は30秒（LLM応答時間を考慮）
3. タイムアウト発生時は `ERR_TIMEOUT` エラーコードを返す

### 3.5 システム仕様書参照

| 仕様書                                    | セクション           | 内容                       |
| ----------------------------------------- | -------------------- | -------------------------- |
| `error-handling.md`                       | エラーコード一覧     | エラーコード体系           |
| `interfaces-llm.md`                       | LLM IPC契約          | ハンドラーインターフェース |
| `architecture-implementation-patterns.md` | タイムアウトパターン | 実装パターン               |

---

## 4. 実行手順

### Phase構成

| Phase | 名称 | 概要                       |
| ----- | ---- | -------------------------- |
| 1     | 設計 | タイムアウト実装方式の決定 |
| 2     | 実装 | ハンドラー修正・テスト追加 |
| 3     | 検証 | 動作確認                   |

### Phase 1: 設計

#### 目的

タイムアウト実装の方式を決定する。

#### 手順

1. 既存のLLMハンドラー構造を確認
2. AbortController適用箇所を特定
3. エラーコード（ERR_TIMEOUT系）を定義

#### 成果物

設計メモ

### Phase 2: 実装

#### 目的

タイムアウト機構を実装する。

#### 手順

1. 定数ファイルにデフォルトタイムアウト値を定義

   ```typescript
   export const LLM_REQUEST_TIMEOUT_MS = 30000; // 30秒
   ```

2. LLMハンドラーにタイムアウトロジックを追加

   ```typescript
   const controller = new AbortController();
   const timeout = setTimeout(() => controller.abort(), LLM_REQUEST_TIMEOUT_MS);
   try {
     const result = await llmRequest({ signal: controller.signal });
     return result;
   } finally {
     clearTimeout(timeout);
   }
   ```

3. タイムアウトエラーハンドリングを追加

4. テストケースを追加
   - タイムアウト発生時のエラーレスポンス確認
   - 正常完了時のタイムアウトクリア確認

#### 成果物

- 修正済みLLMハンドラー
- 新規テストケース

### Phase 3: 検証

#### 目的

実装が正しく動作することを確認する。

#### 手順

1. 単体テスト実行
2. 統合テスト実行（モック環境で遅延シミュレート）
3. TODOコメント削除

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] LLMリクエストにタイムアウトが設定されている
- [ ] タイムアウト発生時に適切なエラーが返される
- [ ] タイムアウト値が定数として定義されている

### 品質要件

- [ ] タイムアウト動作のテストがPASS
- [ ] 既存テストに影響がない
- [ ] TypeScriptコンパイルエラーがない

### ドキュメント要件

- [ ] TODOコメントが除去されている
- [ ] error-handling.mdにエラーコードが追加されている（必要に応じて）

---

## 6. 検証方法

### テストケース

| #   | テストケース               | 期待結果                   |
| --- | -------------------------- | -------------------------- |
| 1   | タイムアウト発生時のエラー | ERR_TIMEOUTエラーが返る    |
| 2   | 正常完了時                 | タイムアウトがクリアされる |
| 3   | タイムアウト前の応答       | 正常にレスポンスが返る     |

### 検証手順

```bash
# 1. テスト実行
pnpm --filter @repo/desktop test llm.test.ts

# 2. 全テストPASS確認
# Expected: Tests: X passed, X total

# 3. TODOコメント確認
grep -n "Implement timeout mechanism" apps/desktop/src/main/handlers/__tests__/llm.test.ts
# Expected: 結果なし
```

---

## 7. リスクと対策

| リスク                    | 影響度 | 発生確率 | 対策                                           |
| ------------------------- | ------ | -------- | ---------------------------------------------- |
| タイムアウト値が短すぎる  | 高     | 中       | 30秒を基準に、実際のLLM応答時間を計測して調整  |
| AbortController未対応環境 | 中     | 低       | Node.js v15+で標準サポート、Electronは対応済み |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/aiworkflow-requirements/references/error-handling.md`
- `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`
- `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`

### 参考資料

- [MDN AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

該当なし（コードベーススキャンによる発見）

### 補足事項

- リトライ機構（UT-RETRY系タスク）と連携する可能性があるが、本タスクは独立して実装可能
- サーキットブレーカー（UT-RETRY-003）との統合は将来検討
