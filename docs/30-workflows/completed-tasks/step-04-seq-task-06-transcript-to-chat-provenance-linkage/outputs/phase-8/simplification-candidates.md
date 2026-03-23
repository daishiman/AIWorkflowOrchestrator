# Phase 8: 簡素化候補

> タスクID: TASK-IMP-TRANSCRIPT-TO-CHAT-PROVENANCE-LINKAGE-001
> 確定日: 2026-03-22

## 目的

Phase 2で検討した代替案を再評価し、実装前に設計を最小化できる箇所を特定する。

---

## 1. Phase 2 代替案の再評価

### 1.1 「provenanceをmessage.metadataネストにする案」（却下維持）

**Phase 2時点の判断**: 既存 `metadata` 構造との競合リスクがあるためトップレベルフィールドを採用。

**Phase 8 再評価**: 判断維持。`metadata` は将来的に他用途で拡張される可能性があり、`transcriptProvenance` をトップレベルに置く設計の方がコードの可読性・検索性が高い。

**結論**: 変更なし。

### 1.2 「sourceTypeをenumにする案」（採用検討）

**Phase 2時点の判断**: union型 `'range' | 'last-output' | 'session'` を採用。

**Phase 8 再評価**: `sourceType` は今後 `'file'` が追加される可能性がある（M-1指摘）。union型のままの方が拡張時のコード変更箇所が少ない。TypeScript の文字列リテラル型で十分な型安全性を確保できる。

**結論**: union型を維持。enumへの変換は不要。

### 1.3 「TranscriptSession型を別定義にする案」（採用検討）

**Phase 2時点の判断**: OP-3（セッションを貼り付ける）に専用の `TranscriptSession` 型を設けるか検討したが、`TranscriptProvenance` に統合した。

**Phase 8 再評価（M-2指摘踏まえ）**: `TranscriptSession` 型を独立させることで、OP-3専用のメタデータ（セッション全体の行数、期間等）を格納しやすくなる。しかし現状の要件（V-C1~V-C8）では不要であり、YAGNI原則に従い現設計を維持する。

**結論**: 変更なし。M-2は未タスクとして管理。

---

## 2. 新たに発見された簡素化ポイント

### 2.1 TranscriptProvenanceChip と ProvenanceBadge の統合

**現設計**: `TranscriptProvenanceChip` を新規コンポーネントとして設計。

**簡素化案**: 既存の `ProvenanceBadge` コンポーネント（仮）が存在する場合、拡張として実装できる。

**評価**:

- 実装フェーズでコードベースを確認する前に統合判断は不可
- 設計上は独立コンポーネントとして定義し、実装フェーズで判断する
- **推奨**: 実装フェーズで `grep -rn "Provenance" apps/desktop/src/renderer/` を実行して既存コンポーネントを確認してから判断

**結論**: 設計は変更しない。実装フェーズへの判断委譲。

### 2.2 useTranscriptShare の3操作を単一Hookにまとめる案

**現設計**: OP-1/OP-2/OP-3 を個別の関数として `useTranscriptShare` に実装。

**簡素化案**: 3操作を統一インターフェース `shareTranscript(type: 'range' | 'last-output' | 'session', payload)` に集約。

**評価**:

- 利点: 呼び出し側のコードが均一になる
- 欠点: 各操作のpayload型が異なるため、overload または discriminated union が必要で複雑性が増す
- 現在の個別関数（`shareRange`, `shareLastOutput`, `shareSession`）の方が型推論が明確

**結論**: 個別関数を維持。統一インターフェース案は採用しない。

### 2.3 sharedAt の型を Date にする案

**現設計**: `sharedAt: string`（ISO 8601）

**簡素化案**: `sharedAt: Date` にしてシリアライズ/デシリアライズを自動化。

**評価**:

- IPC経由でのstructured clone制約（P48パターン）により、`Date` オブジェクトはcontextBridgeを通過できない場合がある
- `string` を維持することでシリアライズ問題を回避できる
- 表示時は `new Date(sharedAt)` で変換すれば十分

**結論**: `string` 型を維持。

### 2.4 messageRange を配列インデックスではなくメッセージIDで管理する案

**現設計**: `messageRange: { startLine: number; endLine: number }`

**簡素化案**: `messageRange: { startId: string; endId: string }` でメッセージIDを使用。

**評価**:

- メッセージIDの方がセッション変更に対して堅牢
- ただし現在のWorkspaceChatMessageにメッセージIDが存在するかどうかは実装確認が必要
- インデックスは実装が単純で、セッション内での参照が明確

**結論**: インデックス方式を維持。IDベース方式は将来の拡張として未タスク化。

---

## 3. 簡素化の最終判断サマリー

| 候補                     | 判断                         | 理由                               |
| ------------------------ | ---------------------------- | ---------------------------------- |
| metadataネスト案         | 却下維持                     | 可読性・拡張性でトップレベルが優位 |
| sourceTypeをenum化       | 採用しない                   | union型で十分な型安全性            |
| TranscriptSession型独立  | 採用しない                   | YAGNIに反する                      |
| Chip/Badge統合           | 実装フェーズに委譲           | コードベース確認後に判断           |
| 3操作の統一Hook          | 採用しない                   | 型推論の明確性を優先               |
| sharedAtをDate型に       | 採用しない                   | IPC経由のシリアライズリスクを回避  |
| messageRangeをIDベースに | 採用しない（将来未タスク化） | 現状はインデックスで十分           |

**総評**: 現設計は既に適切に最小化されており、Phase 8時点で実施すべき簡素化はない。設計を維持したまま実装フェーズへ進む。
