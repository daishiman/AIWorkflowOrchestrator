---
name: multipart-upload
description: |
  大容量ファイルのマルチパートアップロードを専門とするスキル。
  アンドリュー・タネンバウムの『コンピュータネットワーク』に基づき、
  ネットワークの不安定性を前提とした堅牢なファイル転送を設計します。

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/multipart-upload/resources/checksum-verification.md`: SHA-256/MD5によるデータ整合性検証とストリーム処理でのハッシュ計算
  - `.claude/skills/multipart-upload/resources/chunk-size-optimization.md`: チャンクサイズ最適化ガイド
  - `.claude/skills/multipart-upload/resources/chunk-strategies.md`: ファイルサイズとネットワーク品質に基づく動的チャンク分割アルゴリズム
  - `.claude/skills/multipart-upload/resources/progress-tracking.md`: リアルタイム進捗率・転送速度・推定残り時間の計算パターン
  - `.claude/skills/multipart-upload/scripts/analyze-upload-config.mjs`: アップロード設定の妥当性検証とチャンクサイズ推奨値算出スクリプト
  - `.claude/skills/multipart-upload/scripts/validate-upload.mjs`: ファイルのチェックサム計算と最適チャンクサイズ判定スクリプト
  - `.claude/skills/multipart-upload/templates/chunk-uploader-template.ts`: チャンク分割・リトライ・進捗追跡機能を持つアップローダー実装テンプレート
  - `.claude/skills/multipart-upload/templates/upload-client-template.ts`: HTTPクライアントとFormData構築を統合したアップロードクライアントテンプレート
  - `.claude/skills/multipart-upload/templates/upload-manager-template.ts`: 複数ファイルの並列アップロードとキュー管理を提供するマネージャーテンプレート

  専門分野:
  - チャンク転送: 大容量ファイルの分割転送と再開機能
  - 進捗追跡: リアルタイム進捗表示とキャンセル機能
  - FormData構築: マルチパートフォームデータの適切な構築
  - データ整合性: チェックサム検証による転送完全性保証

  使用タイミング:
  - 大容量ファイル（10MB超）のアップロード実装時
  - 転送進捗のリアルタイム表示が必要な時
  - 中断再開可能なアップロード機能を実装する時
  - チェックサム検証によるデータ整合性が必要な時

  Use proactively when implementing file upload functionality,
version: 1.0.0
---

# Multipart Upload

## 概要

HTTP 経由での大容量ファイル転送を確実に行うためのマルチパートアップロード技術スキル。FormData の構築、チャンク分割戦略、進捗追跡、エラーハンドリングを包括的にカバーします。

## 使用タイミング

- 10MB 以上の大容量ファイルを HTTP 経由でアップロードする時
- アップロード進捗をリアルタイムで追跡する必要がある時
- ネットワーク不安定環境で確実なファイル転送が必要な時
- チャンク単位でのリトライ機能が必要な時

## 核心概念

### 1. FormData の構築

**概念的フレームワーク**:

- **バイナリデータ添付**: ファイルをバイナリストリームとして FormData に追加
- **メタデータフィールド**: ファイル名、サイズ、タイプ、チェックサムなどを追加フィールドとして含める
- **マルチパート形式**: `multipart/form-data` Content-Type でエンコード
- **境界文字列**: 各パートを区切る一意な境界文字列の自動生成

**実装時の判断基準**:

- [ ] FormData にファイルとメタデータが正しく設定されているか?
- [ ] Content-Type が `multipart/form-data` として設定されているか?
- [ ] 境界文字列が適切に生成・設定されているか?
- [ ] ファイルサイズがサーバー側の制限内に収まっているか?

### 2. チャンク分割戦略

**チャンクサイズ決定アルゴリズム**:

```
ファイルサイズに基づくチャンクサイズ:
├─ < 10MB    → チャンク分割不要（単一リクエスト）
├─ 10-100MB  → 5MB チャンク
├─ 100MB-1GB → 10MB チャンク
└─ > 1GB     → 20MB チャンク

ネットワーク品質による調整:
├─ 高速・安定 → 大きめのチャンク（効率優先）
├─ 中速・普通 → 標準チャンク（バランス）
└─ 低速・不安定 → 小さめのチャンク（信頼性優先）
```

**実装時の判断基準**:

- [ ] チャンクサイズがファイルサイズに応じて適切に設定されているか?
- [ ] ネットワーク品質を考慮したチャンクサイズ調整があるか?
- [ ] 最後のチャンクが残りサイズに応じて調整されているか?
- [ ] チャンク境界がバイト単位で正確に計算されているか?

### 3. 進捗追跡

**進捗計算方式**:

- **アップロード済みバイト数**: 現在までに転送完了したバイト数
- **総ファイルサイズ**: アップロード対象の総バイト数
- **進捗率**: `(アップロード済みバイト数 / 総ファイルサイズ) × 100`
- **推定残り時間**: `(残りバイト数 / 平均転送速度)`

**進捗イベント設計**:

```typescript
interface UploadProgress {
  loaded: number; // アップロード済みバイト数
  total: number; // 総ファイルサイズ
  percentage: number; // 進捗率 (0-100)
  speed: number; // 転送速度 (bytes/sec)
  estimatedTime: number; // 推定残り時間 (秒)
  currentChunk: number; // 現在のチャンク番号
  totalChunks: number; // 総チャンク数
}
```

**実装時の判断基準**:

- [ ] 進捗イベントが適切な間隔で発火しているか? (推奨: 100ms-500ms)
- [ ] 進捗率が正確に計算されているか? (0-100%の範囲)
- [ ] 転送速度が移動平均で平滑化されているか?
- [ ] 推定残り時間が現実的な値を示しているか?

### 4. タイムアウト設定

**ファイルサイズベースのタイムアウト設計**:

```
タイムアウト計算式:
timeout = base_timeout + (file_size_mb × scaling_factor)

推奨値:
├─ base_timeout: 30秒 (接続確立用)
├─ scaling_factor: 5秒/MB (転送時間余裕)
└─ max_timeout: 600秒 (10分、上限)

例:
├─ 10MB  → 30 + (10 × 5) = 80秒
├─ 50MB  → 30 + (50 × 5) = 280秒
└─ 200MB → min(30 + (200 × 5), 600) = 600秒
```

**実装時の判断基準**:

- [ ] タイムアウトがファイルサイズに比例して動的に設定されているか?
- [ ] 最大タイムアウト値が設定されているか? (無限待機防止)
- [ ] 接続タイムアウトと転送タイムアウトが分離されているか?
- [ ] タイムアウト発生時のクリーンアップ処理があるか?

### 5. エラーハンドリング

**エラー分類マトリックス**:

| エラータイプ               | HTTP ステータス           | リトライ | 対応戦略                       |
| -------------------------- | ------------------------- | -------- | ------------------------------ |
| **ネットワーク切断**       | - (ECONNRESET, ETIMEDOUT) | 可能     | 指数バックオフでリトライ       |
| **サーバー一時障害**       | 503, 504                  | 可能     | 短時間待機後リトライ           |
| **レート制限**             | 429                       | 可能     | Retry-After ヘッダーに従う     |
| **リクエストタイムアウト** | 408                       | 可能     | チャンクサイズ縮小してリトライ |
| **ファイルサイズ超過**     | 413                       | 不可     | エラーログ記録、中止           |
| **認証失敗**               | 401, 403                  | 不可     | 認証情報確認要求               |
| **不正リクエスト**         | 400                       | 不可     | リクエストパラメータ修正       |
| **サーバーエラー**         | 500, 502                  | 制限付き | 3 回まで、その後中止           |

**実装時の判断基準**:

- [ ] エラータイプが正確に分類されているか?
- [ ] リトライ可能/不可能エラーが適切に判定されているか?
- [ ] リトライ回数の上限が設定されているか? (推奨: 5 回)
- [ ] エラー詳細が構造化ログに記録されているか?
- [ ] ユーザーフレンドリーなエラーメッセージが提供されるか?

### 6. チェックサム検証

**チェックサム計算タイミング**:

1. **アップロード前**: ローカルファイルのハッシュ値を計算
2. **転送中**: チャンク単位でハッシュ値を計算（オプション）
3. **アップロード後**: サーバーから返されたハッシュ値と照合

**アルゴリズム選択基準**:

| アルゴリズム | 速度 | セキュリティ | 使用ケース                 |
| ------------ | ---- | ------------ | -------------------------- |
| **MD5**      | 高速 | 低           | 内部システム、非機密データ |
| **SHA-1**    | 中速 | 中           | レガシーシステム互換性     |
| **SHA-256**  | 中速 | 高           | 推奨、セキュリティ重視     |
| **SHA-512**  | 低速 | 最高         | 最高セキュリティ要件       |

**実装時の判断基準**:

- [ ] ファイルハッシュがアップロード前に計算されているか?
- [ ] ハッシュアルゴリズムが適切に選択されているか? (推奨: SHA-256)
- [ ] サーバーレスポンスにハッシュ値が含まれているか?
- [ ] ハッシュ不一致時のリトライロジックがあるか?
- [ ] ストリーム処理でハッシュ計算を行っているか? (メモリ効率)

## 技術スタック

### 推奨ライブラリ (Node.js)

- **axios**: HTTP クライアント、進捗追跡機能
- **form-data**: FormData 構築
- **crypto**: ハッシュ計算 (Node.js 標準)
- **fs**: ファイルストリーム読み込み

### 推奨ライブラリ (ブラウザ)

- **fetch API**: ネイティブ HTTP クライアント
- **FormData API**: ネイティブ FormData 構築
- **Web Crypto API**: ハッシュ計算

### 推奨ライブラリ (Python)

- **requests**: HTTP クライアント
- **requests-toolbelt**: マルチパートアップロード拡張
- **hashlib**: ハッシュ計算 (Python 標準)

## 実装パターン

### パターン 1: シンプル単一ファイルアップロード

**適用条件**:

- ファイルサイズ < 10MB
- ネットワーク安定
- リトライ不要

**実装概要**:

```typescript
// 概念的実装例
async function simpleUpload(filePath: string, url: string) {
  const formData = new FormData();
  formData.append("file", fs.createReadStream(filePath));
  formData.append("checksum", calculateHash(filePath));

  const response = await axios.post(url, formData, {
    timeout: 60000,
    headers: formData.getHeaders(),
  });

  return response.data;
}
```

### パターン 2: 進捗追跡付きアップロード

**適用条件**:

- ファイルサイズ 10MB-100MB
- 進捗表示が必要
- ユーザーフィードバック重視

**実装概要**:

```typescript
// 概念的実装例
async function uploadWithProgress(
  filePath: string,
  url: string,
  onProgress: (progress: UploadProgress) => void,
) {
  const fileSize = fs.statSync(filePath).size;
  const formData = new FormData();
  formData.append("file", fs.createReadStream(filePath));

  const response = await axios.post(url, formData, {
    onUploadProgress: (progressEvent) => {
      const progress: UploadProgress = {
        loaded: progressEvent.loaded,
        total: progressEvent.total,
        percentage: (progressEvent.loaded / progressEvent.total) * 100,
        speed: calculateSpeed(progressEvent),
        estimatedTime: calculateETA(progressEvent),
      };
      onProgress(progress);
    },
  });

  return response.data;
}
```

### パターン 3: チャンク分割アップロード

**適用条件**:

- ファイルサイズ > 100MB
- ネットワーク不安定
- レジューム機能が必要

**実装概要**:

```typescript
// 概念的実装例
async function chunkedUpload(
  filePath: string,
  url: string,
  chunkSize: number = 5 * 1024 * 1024,
) {
  const fileSize = fs.statSync(filePath).size;
  const totalChunks = Math.ceil(fileSize / chunkSize);

  for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
    const start = chunkIndex * chunkSize;
    const end = Math.min(start + chunkSize, fileSize);
    const chunk = fs.createReadStream(filePath, { start, end: end - 1 });

    const formData = new FormData();
    formData.append("chunk", chunk);
    formData.append("chunkIndex", chunkIndex.toString());
    formData.append("totalChunks", totalChunks.toString());

    await uploadChunkWithRetry(url, formData, chunkIndex);
  }
}
```

## ベストプラクティス

### 1. メモリ効率

- ✅ ファイル全体をメモリにロードせず、ストリーム処理を使用
- ✅ チャンクサイズを適切に設定（推奨: 5-10MB）
- ❌ 大容量ファイルを Buffer.from()で一括読み込みしない

### 2. エラーハンドリング

- ✅ リトライ可能エラーと不可能エラーを明確に分類
- ✅ 指数バックオフでリトライ間隔を調整
- ✅ 構造化ログでエラー詳細を記録
- ❌ すべてのエラーで無限リトライしない

### 3. セキュリティ

- ✅ チェックサム検証でデータ整合性を確保
- ✅ HTTPS 通信を使用（中間者攻撃防止）
- ✅ 認証トークンを適切に管理
- ❌ 平文 HTTP 通信を使用しない
- ❌ チェックサム検証を省略しない

### 4. パフォーマンス

- ✅ 適切なチャンクサイズでネットワーク効率を最大化
- ✅ 並列アップロード（複数ファイル時）でスループット向上
- ✅ Keep-Alive 接続で TCP ハンドシェイクコストを削減
- ❌ 過度に小さいチャンク（< 1MB）を使用しない

### 5. ユーザーエクスペリエンス

- ✅ リアルタイム進捗表示でユーザーフィードバック
- ✅ 推定残り時間を表示
- ✅ キャンセル機能を提供
- ❌ 進捗表示なしで長時間待機させない

## トラブルシューティング

### 問題 1: アップロードが途中で停止する

**症状**: 進捗が一定値で停止、タイムアウトエラー

**原因候補**:

- ネットワーク切断
- サーバー側タイムアウト
- チャンクサイズが大きすぎる

**解決策**:

1. タイムアウト値を増やす（ファイルサイズに比例）
2. チャンクサイズを小さくする（5MB → 2MB）
3. リトライロジックを実装
4. ネットワーク品質を確認

### 問題 2: チェックサム不一致エラー

**症状**: サーバーから返されたハッシュ値がローカル計算値と不一致

**原因候補**:

- ファイル転送中の破損
- ハッシュアルゴリズムの不一致
- ファイル内容の変更

**解決策**:

1. ハッシュアルゴリズムをサーバーと統一（SHA-256 推奨）
2. ストリーム処理でハッシュ計算を行う
3. リトライしてデータ破損を回避
4. ファイルがアップロード中に変更されていないか確認

### 問題 3: メモリ不足エラー

**症状**: 大容量ファイルアップロード時に OOM エラー

**原因候補**:

- ファイル全体をメモリにロード
- チャンクサイズが大きすぎる

**解決策**:

1. ストリーム処理に切り替え（fs.createReadStream）
2. チャンクサイズを小さくする（10MB → 5MB）
3. メモリ使用量をモニタリング

## リソース構造

```
multipart-upload/
├── SKILL.md                                    # 本ファイル（概要とワークフロー）
├── resources/
│   ├── chunk-strategies.md                     # チャンク分割戦略の詳細
│   ├── progress-tracking.md                    # 進捗追跡の実装パターン
│   └── checksum-verification.md                # チェックサム検証の詳細
├── scripts/
│   └── analyze-upload-config.mjs               # アップロード設定分析スクリプト
└── templates/
    ├── upload-manager-template.ts              # アップロードマネージャーテンプレート
    └── chunk-uploader-template.ts              # チャンクアップローダーテンプレート
```

## コマンドリファレンス

このスキルで使用可能なリソース、スクリプト、テンプレートへのアクセスコマンド:

### リソース読み取り

```bash
# チャンク分割戦略の詳細
cat .claude/skills/multipart-upload/resources/chunk-strategies.md

# 進捗追跡の実装パターン
cat .claude/skills/multipart-upload/resources/progress-tracking.md

# チェックサム検証の詳細
cat .claude/skills/multipart-upload/resources/checksum-verification.md
```

### スクリプト実行

```bash
# アップロード設定の分析
node .claude/skills/multipart-upload/scripts/analyze-upload-config.mjs <config-file>

# アップロード対象ファイルの検証（チェックサム計算、推奨チャンクサイズ）
node .claude/skills/multipart-upload/scripts/validate-upload.mjs <file-path>
```

### テンプレート参照

```bash
# アップロードマネージャーテンプレート
cat .claude/skills/multipart-upload/templates/upload-manager-template.ts

# チャンクアップローダーテンプレート
cat .claude/skills/multipart-upload/templates/chunk-uploader-template.ts
```

## 関連スキル

- **retry-strategies** (`.claude/skills/retry-strategies/SKILL.md`): リトライ戦略とサーキットブレーカー
- **network-resilience** (`.claude/skills/network-resilience/SKILL.md`): ネットワーク耐性設計
- **api-client-patterns** (`.claude/skills/api-client-patterns/SKILL.md`): API クライアント設計

## 参考文献

- **『Computer Networks』** Andrew S. Tanenbaum 著
  - Chapter 3: The Data Link Layer - エラー検出とフロー制御

- **『Web を支える技術』** 山本陽平著
  - 第 4 章: HTTP の世界観 - マルチパートの仕様

- **RFC 7578**: multipart/form-data 仕様
  - https://tools.ietf.org/html/rfc7578

## 変更履歴

| バージョン | 日付       | 変更内容                                            |
| ---------- | ---------- | --------------------------------------------------- |
| 1.0.0      | 2025-11-26 | 初版作成 - チャンク転送、進捗追跡、チェックサム検証 |

## 使用上の注意

### このスキルが得意なこと

- チャンク分割戦略の設計
- 進捗追跡の実装パターン
- チェックサム検証の設計
- FormData 構築のベストプラクティス

### このスキルが行わないこと

- 具体的なアップロードコードの実装（それは@local-sync エージェントの役割）
- サーバーサイドの受信処理（クラウド API の役割）
- ネットワーク障害時のリトライ戦略（retry-strategies スキル）
