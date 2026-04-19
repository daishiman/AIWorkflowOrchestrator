# アーキテクチャ設計書 - UNASSIGNED-EMB-005

## コンポーネント構成

```
packages/shared/src/services/embedding/
├── late-chunking/
│   ├── late-chunking-types.ts          # 型定義
│   ├── late-chunking-interfaces.ts     # インターフェース定義
│   ├── token-boundary-calculator.ts    # 文字オフセット→トークンインデックス変換
│   ├── hidden-state-pooler.ts          # Hidden Stateプーリング (Mean/Max/CLS)
│   ├── window-splitter.ts              # スライディングウィンドウ分割
│   ├── late-chunking-service.ts        # メインサービス
│   └── index.ts                        # 公開API
└── embedding-service.ts                # 既存（useLateChunkingフラグ追加）
```

## データフロー

```
入力テキスト（全文）
  └─→ WindowSplitter.split()
        ├─→ [トークン数 ≤ maxTokenLength] そのまま処理
        └─→ [トークン数 > maxTokenLength] ウィンドウ配列に分割
  ↓
  各ウィンドウのエンコード（モックエンコーダ注入）
  → Hidden States（トークンごとのベクトル配列）
  → offset_mapping（文字→トークン位置対応表）
  ↓
  TokenBoundaryCalculator.calculate()
  → ChunkBoundary（文字オフセット）→ TokenRange（トークンインデックス）
  ↓
  HiddenStatePooler.pool()
  → 各TokenRangeのHidden Stateをプーリング
  ↓
  ChunkEmbeddingResult[] 出力
```

## 責務境界

| コンポーネント            | 責務                | 依存      |
| ------------------------- | ------------------- | --------- |
| `LateChunkingService`     | フロー制御・外部API | 他3クラス |
| `TokenBoundaryCalculator` | オフセット変換のみ  | なし      |
| `HiddenStatePooler`       | ベクトル演算のみ    | なし      |
| `WindowSplitter`          | テキスト分割のみ    | なし      |

## 統合方式（EmbeddingService）

ストラテジーパターンは採用せず、EmbeddingService に `lateChunkingService?: LateChunkingService` を注入し `useLateChunking` フラグで委譲する最小変更方式を採用。既存フォールバック・メトリクス機構への影響を最小化する。
