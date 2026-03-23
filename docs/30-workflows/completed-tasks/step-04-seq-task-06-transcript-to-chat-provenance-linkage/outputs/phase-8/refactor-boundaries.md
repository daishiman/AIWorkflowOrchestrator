# Phase 8: リファクタリング境界定義

> タスクID: TASK-IMP-TRANSCRIPT-TO-CHAT-PROVENANCE-LINKAGE-001
> 確定日: 2026-03-22

## 目的

設計フェーズ（Phase 1-7）で確定したcontractを壊さずにリファクタリングできる範囲と、絶対に変更してはならない境界を明確にする。

---

## 1. 安全にリファクタリングできる構造

### 1.1 TranscriptProvenanceChip（拡張・内部変更可）

| 対象             | 許可される変更                                 |
| ---------------- | ---------------------------------------------- |
| 表示フォーマット | 日時フォーマット・ラベル文字列の変更           |
| スタイリング     | Tailwind classの追加・変更                     |
| アイコン         | sourceTypeごとのアイコンコンポーネント差し替え |
| アクセシビリティ | aria-label、role属性の追加                     |
| アニメーション   | 表示/非表示トランジションの追加                |

**制約**: `TranscriptProvenance` 型のプロパティを直接参照するが、型定義そのものの変更はPhase 2設計書の承認が必要。

### 1.2 TranscriptSelectionToolbar（内部実装変更可）

| 対象             | 許可される変更                   |
| ---------------- | -------------------------------- |
| ボタンレイアウト | 水平/垂直配置の変更              |
| 操作フロー       | OP-1/OP-2/OP-3内部の実装詳細     |
| エラー表示       | エラーメッセージの文言・スタイル |
| ローディング状態 | スピナー・プログレス表示の追加   |

**制約**: OP-1/OP-2/OP-3の3操作の分類は変更禁止。

### 1.3 TranscriptPanel（内部実装変更可）

| 対象               | 許可される変更                 |
| ------------------ | ------------------------------ |
| スクロール挙動     | 仮想化ライブラリへの置き換え   |
| 検索機能           | 検索バーの内部実装             |
| レンダリング最適化 | `React.memo`、`useMemo` の追加 |
| テスト用属性       | `data-testid` の追加・変更     |

### 1.4 Hook層（内部ロジック変更可）

| Hook名                   | 許可される変更                             |
| ------------------------ | ------------------------------------------ |
| `useTranscriptSelection` | debounce時間の調整、選択アルゴリズムの改善 |
| `useTranscriptShare`     | キャッシュ戦略の変更                       |
| `useProvenanceDisplay`   | フォールバック表示ロジックの追加           |

---

## 2. 変更禁止のContract一覧

### 2.1 型定義Contract（絶対禁止）

```typescript
// この型定義の構造は変更禁止
interface TranscriptProvenance {
  sourceType: "range" | "last-output" | "session"; // 追加は可、削除・変更は禁止
  sharedAt: string; // ISO 8601 形式 — 変更禁止
  sessionTitle: string; // 変更禁止
  messageRange?: {
    // 存在する場合のフィールド変更禁止
    startLine: number;
    endLine: number;
  };
  originalContent: string; // 変更禁止
}

// WorkspaceChatMessage への追加フィールド — 削除禁止
interface WorkspaceChatMessage {
  // ...既存フィールド
  transcriptProvenance?: TranscriptProvenance; // 削除禁止
}
```

**理由**: 下流のWorkspaceChatPanelおよびチャット永続化層がこの型に依存する。変更は破壊的移行となる。

### 2.2 操作セマンティクスContract（変更禁止）

| 操作ID | セマンティクス           | 禁止事項                                      |
| ------ | ------------------------ | --------------------------------------------- |
| OP-1   | 選択範囲をチャットへ送る | auto-send禁止。必ずユーザーの明示的送信を経由 |
| OP-2   | 直近出力を添付           | hidden parsing禁止。表示済み内容のみ添付      |
| OP-3   | セッションを貼り付ける   | 自動要約禁止。原文のみ貼り付け                |

### 2.3 状態遷移Contract（順序変更禁止）

```
TranscriptVisible
  -> RangeSelected     (ユーザーによるテキスト選択後のみ)
  -> ShareReady        (OP-1/OP-2/OP-3いずれかの実行後のみ)
  -> ChatAttached      (OP-1/OP-2の場合)
  -> ChatPasted        (OP-3の場合)
  -> ProvenanceVisible (チャット表示後のみ)
```

**禁止**: `TranscriptVisible -> ShareReady` の直接遷移（RangeSelectedを飛ばすことは禁止）。

### 2.4 ChatMessage.metadata構造変更禁止

既存の `ChatMessage.metadata` オブジェクト構造は変更禁止。`transcriptProvenance` は `WorkspaceChatMessage` のトップレベルフィールドとして追加する（metadataネストは禁止）。

**理由（P44対策）**: IPCハンドラの引数形式とPreload側の呼び出し形式のドリフトを防ぐ。

### 2.5 IPC Channel名Contract（変更禁止）

設計で確定したチャンネル名は変更禁止。実装時は `IPC_CHANNELS` 定数で参照すること（文字列リテラル直書き禁止）。

---

## 3. 条件付きで変更可能な境界

### 3.1 sourceTypeの拡張（Phase 12 MINOR指摘 M-1対応）

`sourceType` への `'file'` 追加は許可されるが、以下の手順が必要:

1. `TranscriptProvenance.sourceType` の型定義に `'file'` を追加
2. `TranscriptProvenanceChip` の表示分岐を追加
3. 既存3種（range/last-output/session）の動作を回帰テストで確認

### 3.2 truncation上限の変更（Phase 12 MINOR指摘 M-3対応）

`originalContent` の文字数上限は設定値として外出し可能。ただし:

- デフォルト値の変更には設計レビューが必要
- 上限を超えた場合のUI表示方法も同時に変更すること

---

## 4. リファクタリング優先順位

| 優先度 | 対象                 | 目的                                               |
| ------ | -------------------- | -------------------------------------------------- |
| P0     | なし                 | 設計タスクのためプロダクションコードなし           |
| P1     | 型定義の共通化       | `packages/shared` への `TranscriptProvenance` 移動 |
| P2     | Hook層のテスト容易性 | DI可能なファクトリパターンへの変換                 |
| P3     | コンポーネントの分割 | `TranscriptPanel` の仮想化対応                     |

---

## 5. 変更影響マトリクス

| 変更箇所               | WorkspaceChatPanel | TranscriptProvenanceChip | IPC層    | 永続化層 |
| ---------------------- | ------------------ | ------------------------ | -------- | -------- |
| TranscriptProvenance型 | 影響あり           | 影響あり                 | 影響あり | 影響あり |
| 状態遷移ロジック       | 影響あり           | 影響なし                 | 影響なし | 影響なし |
| チップ表示スタイル     | 影響なし           | 影響あり                 | 影響なし | 影響なし |
| OP内部実装             | 影響なし           | 影響なし                 | 要確認   | 影響なし |
