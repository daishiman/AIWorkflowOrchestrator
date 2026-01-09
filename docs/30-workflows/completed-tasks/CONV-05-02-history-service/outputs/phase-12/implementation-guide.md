# 履歴取得サービス（HistoryService）実装ガイド

## Part 1: 概念的な説明

### このサービスは何をするの？

履歴取得サービスは、**ファイルの「タイムマシン」** のようなものです。

例えば、学校で作文を書くとき、何度も書き直しますよね。最初に書いた文章、2回目に直した文章、最終版...と、同じ作文でも複数の「バージョン」ができます。

このサービスは、そういった**ファイルの全てのバージョンを記録して、いつでも見たり、昔のバージョンに戻したりできる**ようにするものです。

### 主な機能（たとえ話）

| 機能               | たとえ話                                   |
| ------------------ | ------------------------------------------ |
| 履歴一覧取得       | 作文の「書き直し履歴」を見る               |
| バージョン詳細取得 | 特定の書き直し版の中身を見る               |
| バージョン差分取得 | 「1回目と3回目で何が変わった？」を調べる   |
| バージョン復元     | 「やっぱり最初の文章の方が良かった」と戻す |
| 最新バージョン取得 | 「今の最新版は？」を確認する               |
| バージョン数取得   | 「何回書き直した？」を数える               |

### なぜこのサービスが必要なの？

ファイル変換処理では、同じファイルを何度も変換することがあります。

- PDFからWordに変換
- 再度PDFに変換
- また修正してWord変換...

このとき、**「あの時の変換結果に戻りたい」** という要望に応えるために、履歴管理が必要になります。

---

## Part 2: 技術的な詳細

### 全体アーキテクチャ

```
┌─────────────────────────────────────────────────────────────┐
│                     Application Layer                        │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                    HistoryService                        ││
│  │  [公開メソッド]                                          ││
│  │  • getFileHistory()      履歴一覧取得                    ││
│  │  • getVersionDetail()    バージョン詳細取得              ││
│  │  • getVersionDiff()      バージョン差分取得              ││
│  │  • restoreToVersion()    バージョン復元                  ││
│  │  • getLatestVersion()    最新バージョン取得              ││
│  │  • getVersionCount()     バージョン数取得                ││
│  └─────────────────────────────────────────────────────────┘│
│                              │                               │
│                              ▼                               │
│  ┌─────────────────────────────────────────────────────────┐│
│  │               Private Helper Methods                     ││
│  │  • getLatestConversionId()   最新ID取得                  ││
│  │  • getAllConversionsForVersioning()  バージョン番号用    ││
│  │  • buildVersionMap()         バージョンマップ構築        ││
│  │  • computeMetadataChanges()  メタデータ差分計算          ││
│  │  • toVersionHistoryItem()    データ変換（DRY原則）       ││
│  │  • getVersionMapForFile()    バージョンマップ取得        ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Infrastructure Layer                       │
│  ┌────────────────────┐  ┌────────────────────────────────┐ │
│  │ConversionRepository│  │ IConversionLogger              │ │
│  │ • findByFileId()   │  │ • info()                       │ │
│  │ • findById()       │  │ • warn()                       │ │
│  │ • create()         │  │ • error()                      │ │
│  │ • countByFileId()  │  │                                │ │
│  └────────────────────┘  └────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### なぜこの設計にしたか（Why優先の説明）

#### 1. Repository Pattern（リポジトリパターン）

**なぜ？** データベースの詳細をサービス層から隠すため。

```typescript
// 悪い例: サービス層でDBクエリを直接書く
class HistoryService {
  async getFileHistory(fileId: string) {
    // これはダメ！SQLを直接書くとDBを変えたとき全部書き直し
    const result = await db.query(
      "SELECT * FROM conversions WHERE file_id = ?",
      [fileId],
    );
  }
}

// 良い例: Repositoryを通す
class HistoryService {
  constructor(private conversionRepository: ConversionRepository) {}

  async getFileHistory(fileId: string) {
    // Repository経由なら、DBが変わってもここを変える必要なし
    const result = await this.conversionRepository.findByFileId(fileId);
  }
}
```

#### 2. Result型パターン（Railway Oriented Programming）

**なぜ？** エラーハンドリングを明示的かつ安全にするため。

```typescript
// 悪い例: try-catchの例外処理
async getVersionDetail(id: string): Promise<VersionHistoryItem> {
  try {
    const conversion = await this.repository.findById(id);
    if (!conversion) throw new Error('Not found');  // 例外を投げる
    return conversion;
  } catch (e) {
    throw e;  // どこで捕まえるか不明確
  }
}

// 良い例: Result型
async getVersionDetail(id: string): Promise<Result<VersionHistoryItem, Error>> {
  const result = await this.conversionRepository.findById(id);

  if (!result.success) {
    return err(result.error);  // エラーを明示的に伝播
  }

  if (!result.data) {
    return err(new Error(`Conversion not found: ${id}`));  // 明示的なエラー
  }

  return ok(this.toVersionHistoryItem(result.data, ...));  // 成功も明示的
}
```

#### 3. DRY原則（Don't Repeat Yourself）

**なぜ？** 同じコードを複数箇所に書くと、修正漏れやバグの原因になるため。

```typescript
// 悪い例: 同じ変換ロジックが4箇所に
async getFileHistory(...) {
  const items = conversions.map((conv) => ({
    conversionId: conv.id,
    fileId: conv.fileId,
    fileName: conv.fileName,
    // ... 10行以上の変換ロジック
  }));
}

async getVersionDetail(...) {
  // 同じ10行以上の変換ロジック（コピペ）
}

// 良い例: ヘルパーメソッドに抽出
private toVersionHistoryItem(
  conversion: Conversion,
  versionMap: Map<string, number>,
  latestId: string | null,
): VersionHistoryItem {
  return {
    conversionId: conversion.id,
    fileId: conversion.fileId,
    // ... 変換ロジックは1箇所だけ
  };
}

async getFileHistory(...) {
  const items = conversions.map((conv) =>
    this.toVersionHistoryItem(conv, versionMap, latestId)
  );
}
```

### データフロー

#### 履歴一覧取得の流れ

```
getFileHistory(fileId, options)
    │
    ├── [1] countByFileId(fileId)
    │       └── 総件数を取得（ページネーション用）
    │
    ├── [2] findByFileId(fileId, { limit, offset, ... })
    │       └── 実際のデータを取得
    │
    ├── [3] getLatestConversionId(fileId)
    │       └── 最新バージョンを特定（isCurrentVersion判定用）
    │
    ├── [4] getVersionMapForFile(fileId)
    │       └── バージョン番号マップを構築（0, 1, 2, ...）
    │
    └── [5] toVersionHistoryItem() × N回
            └── 各Conversionを画面表示用に変換
```

#### バージョン復元の流れ

```
restoreToVersion(fileId, conversionId)
    │
    ├── [1] findById(conversionId)
    │       └── 復元対象のデータを取得
    │
    ├── [2] ファイルID一致チェック
    │       └── 別ファイルのバージョンは復元不可
    │
    ├── [3] logger.info()
    │       └── 操作ログを記録（監査証跡）
    │
    ├── [4] create({ ...originalConversion, metadata: { restoredFrom, restoredAt } })
    │       └── 新しいバージョンとして作成
    │
    └── [5] toVersionHistoryItem()
            └── 作成結果を返却
```

### ファイル構成

```
packages/shared/src/services/history/
├── index.ts                 # 公開API（エクスポートのみ）
├── types.ts                 # 型定義（IHistoryService, VersionHistoryItem等）
├── history-service.ts       # 本体（HistoryServiceクラス）
└── __tests__/
    ├── history-service.test.ts           # テストコード
    └── mocks/
        ├── conversion-repository.mock.ts # リポジトリのモック
        └── logger.mock.ts                # ロガーのモック
```

### 主要な型定義

```typescript
// バージョン履歴の1件分
interface VersionHistoryItem {
  conversionId: string; // 変換ID（一意識別子）
  fileId: string; // ファイルID
  fileName: string; // ファイル名
  version: number; // バージョン番号（0, 1, 2, ...）
  createdAt: Date; // 作成日時
  mimeType: string; // MIMEタイプ（text/plain等）
  contentHash: string; // コンテンツのハッシュ値
  sizeBytes: number; // ファイルサイズ（バイト）
  metadata?: Record<string, unknown>; // メタデータ（任意）
  isCurrentVersion: boolean; // 最新バージョンか
}

// バージョン間の差分
interface VersionDiff {
  conversionIdA: string; // 比較元ID
  conversionIdB: string; // 比較先ID
  sizeChange: number; // サイズ変化（バイト）
  metadataChanges: MetadataChange[]; // メタデータの変更
  contentChanged: boolean; // コンテンツが変わったか
}

// メタデータの変更1件
interface MetadataChange {
  key: string; // 変更されたキー
  oldValue: unknown; // 変更前の値
  newValue: unknown; // 変更後の値
}
```

### エラーハンドリング戦略

| エラーパターン     | エラーメッセージ                                   | 理由                       |
| ------------------ | -------------------------------------------------- | -------------------------- |
| 変換が見つからない | `Conversion not found: {id}`                       | IDのみ含む（機密情報なし） |
| ソース変換なし     | `Source conversion not found: {id}`                | 差分取得時の比較元         |
| ターゲット変換なし | `Target conversion not found: {id}`                | 差分取得時の比較先         |
| ファイル不一致     | `Conversion {id} does not belong to file {fileId}` | 復元時の検証エラー         |

---

## 用語集

| 用語                       | 読み方                     | 意味                                          |
| -------------------------- | -------------------------- | --------------------------------------------- |
| Conversion                 | コンバージョン             | ファイルの変換1回分のデータ                   |
| Repository                 | リポジトリ                 | データの保存・取得を担当するクラス            |
| Result型                   | リザルトがた               | 成功/失敗を明示的に表す型（ok/err）           |
| DRY                        | ディーアールワイ           | Don't Repeat Yourself（繰り返しを避ける原則） |
| Railway Oriented           | レイルウェイオリエンテッド | 鉄道のように成功/失敗の線路を分ける設計       |
| Pagination                 | ページネーション           | データを分割して取得すること                  |
| Metadata                   | メタデータ                 | データについてのデータ（作成者、変換設定等）  |
| Mock                       | モック                     | テスト用の偽物オブジェクト                    |
| DI（Dependency Injection） | ディーアイ                 | 依存性注入（外から必要なものを渡す設計）      |

---

## Phase 12 実行記録

### 使用スキル

| スキル                     | 結果    | 備考               |
| -------------------------- | ------- | ------------------ |
| documentation-architecture | success | 実装ガイド作成完了 |

### 備考

- Part 1: 中学生にもわかる比喩・例え話で説明
- Part 2: Why優先で設計意図を明確化
- ASCII図解でアーキテクチャを可視化
- 用語集で専門用語を補足
