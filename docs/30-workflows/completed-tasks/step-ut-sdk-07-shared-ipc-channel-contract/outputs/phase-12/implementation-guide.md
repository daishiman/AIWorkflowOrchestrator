# Phase 12: 実装ガイド

## タスク情報

- **タスクID**: TASK-UT-SDK-07-SHARED-IPC-CHANNEL-CONTRACT-001
- **タスク名**: 共有IPCチャネル契約

---

## Part 1: 概要説明（非技術者向け）

### なぜこの変更が必要だったのか

ソフトウェアを開発するとき、アプリケーションの異なる部品同士は「チャネル名」という合意された名前を使って通信します。ラジオの周波数のようなものです。ある部品が周波数Aを使い、別の部品が周波数Bを使っていたら、お互いに通信できません。

私たちのプロジェクトでは、「チャネル名の共有辞書」に3つの項目が載っておらず、アプリの特定の部品にだけ存在している状態でした。これは、会社の電話帳に3人分の内線番号が載っていないのと同じです。番号を知っている人には問題ありませんが、正式な記録がないとミスが起きやすくなります。

### たとえば

会社の電話帳を想像してください。3人の内線番号が本社の正式な電話帳に載っておらず、特定の支社にだけメモ書きで残っていました。もし誰かがメモ書きの番号を間違えて更新してしまったら、その3人への電話がつながらなくなります。今回の変更は、この3つの内線番号を正式な電話帳に登録し、支社のメモ書きを「電話帳を見てください」という参照に置き換えたものです。

### 何を作ったのか

3つのチャネル名を共有パッケージに追加し、デスクトップアプリがそこから参照するようにしました。これにより、チャネル名の一元管理が実現し、不整合のリスクが排除されました。

---

## Part 2: 技術詳細

### 追加した型定義

#### `APPROVAL_CHANNELS`

```typescript
export const APPROVAL_CHANNELS = {
  APPROVAL_RESPOND: "approval:respond",
  APPROVAL_REQUEST: "approval:request",
} as const;
```

- `as const` オブジェクトとして定義
- `APPROVAL_RESPOND`: invoke 方向（レンダラー → メイン）
- `APPROVAL_REQUEST`: on (push) 方向（メイン → レンダラー）

#### `EXECUTION_CHANNELS`

```typescript
export const EXECUTION_CHANNELS = {
  EXECUTION_GET_DISCLOSURE_INFO: "execution:get-disclosure-info",
} as const;
```

- `as const` オブジェクトとして定義
- `EXECUTION_GET_DISCLOSURE_INFO`: invoke 方向（レンダラー → メイン）

両オブジェクトは `IPC_CHANNELS` にスプレッドされて統合されています。

### 使用例

```typescript
import { APPROVAL_CHANNELS } from "@repo/shared/src/ipc/channels";

const ch = APPROVAL_CHANNELS.APPROVAL_RESPOND; // "approval:respond"
```

### エラーハンドリング

該当なし（定数定義のみのため）。

### エッジケース

- テストファイルにおける動的インポートでは、vite バンドラーの制限により `@repo/shared` エイリアスの代わりに相対パスを使用する必要がある

### 定数テーブル

| キー                          | 値                                | カテゴリ  |
| ----------------------------- | --------------------------------- | --------- |
| APPROVAL_RESPOND              | `"approval:respond"`              | invoke    |
| APPROVAL_REQUEST              | `"approval:request"`              | on (push) |
| EXECUTION_GET_DISCLOSURE_INFO | `"execution:get-disclosure-info"` | invoke    |
