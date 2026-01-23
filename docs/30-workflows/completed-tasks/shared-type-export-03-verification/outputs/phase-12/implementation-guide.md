# Community型インポートガイド

## 作成日

2026-01-23

## Phase 12 - Task 12-1: 実装ガイド

---

## Part 1: 概念的説明（初学者・非技術者向け）

### 1.1 型エクスポートの目的と意義

**型エクスポートとは？**

TypeScriptの「型」は、データの形を定義するものです。例えば「Community（コミュニティ）」という型は、コミュニティに必要な情報（ID、名前、メンバー一覧など）の形を定義します。

**型エクスポートの目的**

- **コードの再利用**: 同じ型定義を複数の場所で使い回せる
- **型安全性**: TypeScriptがコンパイル時にエラーを検出できる
- **チーム開発の効率化**: 統一された型定義でコミュニケーションコストを削減

### 1.2 モノレポにおける型共有の利点

本プロジェクトはモノレポ構成であり、複数のパッケージ（`@repo/shared`, `@repo/desktop`など）が1つのリポジトリに含まれています。

```
AIWorkflowOrchestrator/
├── packages/
│   └── shared/        # 共有ライブラリ（型定義を含む）
└── apps/
    └── desktop/       # デスクトップアプリ（型を使用する側）
```

**利点**:

1. **一元管理**: 型定義を1箇所で管理
2. **即時反映**: 型を変更するとすぐに全パッケージに反映
3. **バージョン不整合の防止**: パッケージ間で常に同じ型を使用

### 1.3 バレルファイル（index.ts）の役割

バレルファイルとは、複数のエクスポートを1つのファイルにまとめる「まとめファイル」です。

```
packages/shared/
├── src/services/graph/
│   ├── types.ts          # 型定義（実装）
│   ├── index.ts          # バレルファイル（再エクスポート）
│   └── ...
└── index.ts              # メインバレルファイル
```

**メリット**:

- インポート文が短くなる: `from "@repo/shared"` で済む
- 内部実装を隠蔽: 利用者は `types.ts` の存在を意識しなくてよい

---

## Part 2: 技術的詳細（開発者向け）

### 2.1 インポート方法

#### 2.1.1 型のインポート（推奨）

型（interface, type）をインポートする場合は `import type` を使用します。

```typescript
import type {
  Community,
  CommunitySummary,
  CommunityStructure,
  CommunityDetectionOptions,
  CommunityDetectionResult,
  CommunityDetectionStats,
  CommunitySummarizationOptions,
  CommunitySummarizationResult,
} from "@repo/shared";
```

**なぜ `import type` を使うのか？**

- ビルド時に型情報が削除され、バンドルサイズが削減される
- 循環参照の問題を防ぐことができる

#### 2.1.2 値のインポート

enum（列挙型）やclass（クラス）は実行時に値として使用されるため、通常の `import` を使用します。

```typescript
import {
  CommunityErrorCode,
  CommunityDetectionError,
  CommunitySummarizationErrorCode,
  CommunitySummarizationError,
  normalizeEntityName,
} from "@repo/shared";
```

### 2.2 使用例

#### 2.2.1 Community型の使用

```typescript
import type { Community } from "@repo/shared";
import { useState } from "react";

function useCommunities() {
  const [communities, setCommunities] = useState<Community[]>([]);

  const addCommunity = (community: Community) => {
    setCommunities((prev) => [...prev, community]);
  };

  return { communities, addCommunity };
}
```

#### 2.2.2 エラーハンドリング

```typescript
import { CommunityErrorCode, CommunityDetectionError } from "@repo/shared";

try {
  // コミュニティ検出処理
} catch (error) {
  if (error instanceof CommunityDetectionError) {
    switch (error.code) {
      case CommunityErrorCode.NOT_FOUND:
        console.error("コミュニティが見つかりません");
        break;
      case CommunityErrorCode.INVALID_GRAPH:
        console.error("無効なグラフ構造です");
        break;
    }
  }
}
```

### 2.3 注意事項

#### 2.3.1 型と値の区別

| カテゴリ  | インポート方法 | 例                          |
| --------- | -------------- | --------------------------- |
| interface | `import type`  | Community, CommunitySummary |
| type      | `import type`  | CommunityId                 |
| enum      | `import`       | CommunityErrorCode          |
| class     | `import`       | CommunityDetectionError     |
| function  | `import`       | normalizeEntityName         |

#### 2.3.2 パスの指定

```typescript
// ✅ 推奨: メインエントリからインポート
import type { Community } from "@repo/shared";

// ⚠️ 非推奨: サブパスを直接指定
import type { Community } from "@repo/shared/src/services/graph/types";
```

#### 2.3.3 内部パッケージでの使用

`@repo/shared` 内部では相対パスを使用します。

```typescript
// @repo/shared 内部での使用
import type { Community } from "./types";
```

---

## 3. エクスポート一覧

### 3.1 型（export type）

| 型名                          | 説明                   |
| ----------------------------- | ---------------------- |
| Community                     | コミュニティの基本構造 |
| CommunitySummary              | コミュニティの要約     |
| CommunityStructure            | 階層的コミュニティ構造 |
| CommunityDetectionOptions     | 検出オプション         |
| CommunityDetectionResult      | 検出結果               |
| CommunityDetectionStats       | 検出統計               |
| CommunitySummarizationOptions | 要約オプション         |
| CommunitySummarizationResult  | 要約結果               |

### 3.2 値（export）

| 名前                            | 種別     | 説明                 |
| ------------------------------- | -------- | -------------------- |
| CommunityErrorCode              | enum     | 検出エラーコード     |
| CommunityDetectionError         | class    | 検出エラー           |
| CommunitySummarizationErrorCode | enum     | 要約エラーコード     |
| CommunitySummarizationError     | class    | 要約エラー           |
| normalizeEntityName             | function | エンティティ名正規化 |

---

## 4. 完了確認

- [x] Part 1（概念的説明）が作成されている
- [x] Part 2（技術的詳細）が作成されている
- [x] インポート方法が明確に説明されている
