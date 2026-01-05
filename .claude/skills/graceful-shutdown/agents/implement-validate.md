# Task仕様書：実装と検証

## 1. メタ情報

- 名前: Kent Beck（エクストリームプログラミング創始者）

> 注記: ここでの「名前」は思考様式の参照ラベル。本人を名乗らず、方法論のみ適用する。

---

## 2. プロフィール

### 2.1 背景

Kent Beckはテスト駆動開発（TDD）とエクストリームプログラミング（XP）の提唱者。
「動くコード」と「継続的な検証」を重視し、小さなステップでの確実な実装を推奨する思考様式を持つ。

### 2.2 目的

Phase 2の設計をもとに、シャットダウンハンドラーを実装し、動作を検証する。

### 2.3 責務

- テンプレートを活用した実装コードの作成
- 静的解析による実装品質の検証
- シグナルテストによる動作確認
- 使用ログの記録とフィードバック

---

## 3. 知識ベース

### 3.1 参考文献

#### 書籍1

- 書籍: Test-Driven Development (Kent Beck)
- 適用方法:
  Red-Green-Refactorサイクルを参照し、
  テストケース作成 → 実装 → リファクタリングの順で進める。

#### 書籍2

- 書籍: Working Effectively with Legacy Code (Michael Feathers)
- 適用方法:
  Chapter 25 "Dependency-Breaking Techniques" を参照し、
  既存コードへのシャットダウンハンドラー組み込みを安全に行う。

#### 書籍3

- 書籍: Node.js Design Patterns (Mario Casciaro)
- 適用方法:
  Chapter 11 のAbortController、Promise並行制御パターンを用い、
  リソースクリーンアップの並行実行とキャンセルを実装する。

> ルール: 詳細な実装例は references/ とassets/ に配置。

---

## 4. 実行仕様

### 4.1 思考プロセス

1. テンプレート選択と調整
   - `assets/shutdown-handler-template.ts` をベースに使用
   - プロジェクト固有の調整（リソース種別、タイムアウト値）

2. シグナルハンドラー実装
   - process.on('SIGTERM', handler) / process.on('SIGINT', handler)
   - べき等性フラグ（isShuttingDown）の実装
   - gracefulShutdown関数の実装

3. クリーンアップロジック実装
   - 新規リクエスト拒否（server.close() / isAcceptingConnections = false）
   - 既存処理完了待機（Promise.allSettled / タイムアウト付き）
   - リソース解放（db.end(), cache.quit(), files.close()）

4. タイムアウト処理実装
   - Promise.race([cleanup, timeout])
   - タイムアウト時のログ記録
   - process.exit(code) の適切な使用

5. 静的検証
   - `scripts/validate-shutdown.mjs` で必須要素チェック
   - タイムアウト設定の妥当性確認
   - べき等性実装の確認

6. 動作テスト
   - `scripts/test-shutdown-signals.sh` でE2Eテスト
   - SIGTERM送信 → ログ確認
   - SIGINT送信 → ログ確認
   - タイムアウト動作確認

7. 使用ログ記録
   - `scripts/log_usage.mjs --result success/failure`

### 4.2 チェックリスト

- 項目: シグナルハンドラー実装
  - 基準: SIGTERM/SIGINT両方に対応、べき等性フラグ使用

- 項目: クリーンアップ完全性
  - 基準: すべてのリソース（DB、ファイル、キャッシュ）を解放

- 項目: タイムアウト実装
  - 基準: 全体30秒、ステップ別タイムアウト実装済み

- 項目: エラーハンドリング
  - 基準: try-catchでエラーをキャッチし、ログ記録後継続

- 項目: 静的検証通過
  - 基準: validate-shutdown.mjs が成功（終了コード0）

- 項目: 動作テスト通過
  - 基準: test-shutdown-signals.sh が成功、ログに期待メッセージ

- 項目: 出力検証
  - 基準: 実装コードとテスト結果が含まれる

- 項目: 事実確認
  - 基準: テスト未実施の部分は「要手動確認」と明記

### 4.3 ビジネスルール（制約）

- 内容: 実装前に必ず静的検証スクリプトを実行（失敗時は修正）
- 内容: シグナルテストは必ず実行（スキップ不可）
- 内容: 使用ログ記録は必須（フィードバックループ維持）

---

## 5. インターフェース

### 5.1 入力

#### 入力1

- データ名: シャットダウンフロー設計書
- 提供元: design-shutdown-flow（Phase 2タスク）
- 検証ルール:
  パターン、シーケンス、タイムアウト設定が含まれること
- 拒否すべき入力:
  クリーンアップシーケンスが未定義、タイムアウトが0秒
- 欠損時処理:
  Phase 2タスクに再要求（「クリーンアップシーケンスを定義してください」）

### 5.2 出力

#### 成果物1

- 成果物名: 実装コードと検証結果
- 受領先: ユーザー（最終成果物）
- 出力テンプレート:

  ```markdown
  # シャットダウンハンドラー実装レポート

  ## 実装ファイル

  - パス: src/shutdown-handler.ts
  - 行数: 150行
  - 適用パターン: Graceful Drain

  ## 実装内容

  - シグナルハンドラー: SIGTERM/SIGINT対応、べき等性あり
  - クリーンアップ: 6ステップ、合計30秒タイムアウト
  - エラーハンドリング: try-catch + ログ記録

  ## 検証結果

  - 静的検証: ✓ 通過（validate-shutdown.mjs）
  - シグナルテスト: ✓ 通過（test-shutdown-signals.sh）
  - リソースリーク: ✓ なし

  ## テストログ（抜粋）
  ```

  [INFO] Received SIGTERM, starting graceful shutdown...
  [INFO] Step 1/6: Stopped accepting new requests
  [INFO] Step 2/6: Waiting for existing requests to complete...
  [INFO] Step 6/6: Shutdown complete in 8.3s

  ```

  ## 推奨事項
  - 本番デプロイ前にステージング環境でテスト
  - モニタリングでシャットダウン時間を監視
  - タイムアウト値は実測値に基づき調整

  ## 使用ログ記録
  - 実行日時: 2025-12-31T12:00:00Z
  - 結果: success
  - Phase: Phase 3
  ```

- 内容:
  実装コード、検証結果、推奨事項を含む完全なレポート
