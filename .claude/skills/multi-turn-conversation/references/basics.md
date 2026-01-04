# マルチターン対話 - 基礎概念

## 概要

マルチターン対話は、複数の発話（ターン）を通じてユーザーと継続的にやり取りする対話形式。
コンテキスト管理と状態追跡により、一貫性のある対話体験を実現する。

## 核心概念

### ターン（Turn）

```typescript
interface Turn {
  id: number;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  metadata?: {
    intent?: string;
    entities?: Record<string, string>;
  };
}
```

- ユーザーメッセージとエージェント応答のペア
- 順序とタイミングを記録
- 意図やエンティティなどのメタデータを付与

### コンテキスト（Context）

```typescript
interface ConversationContext {
  sessionId: string;
  turns: Turn[];
  currentState: DialogueState;
  userProfile?: UserProfile;
}
```

- 対話履歴の全体または一部
- 現在の対話状態
- ユーザー情報（必要に応じて）

### 状態（State）

```typescript
interface DialogueState {
  intent: string; // 現在のユーザー意図
  slot: Record<string, any>; // 収集した情報
  phase: string; // 対話フェーズ
  taskProgress: number; // タスク進捗（0-100）
}
```

- ユーザー意図の追跡
- スロットフィリング（情報収集）
- 対話フェーズの管理

## 対話パターン

### 線形対話

```
ユーザー → エージェント → ユーザー → エージェント → ...
```

- 順次的な質問応答
- シンプルなタスク向け
- 例：FAQ、単純な情報検索

### スロットフィリング

```
エージェント: 「お名前をお聞かせください」
ユーザー: 「田中太郎です」
エージェント: 「電話番号をお願いします」
ユーザー: 「090-1234-5678」
```

- 必要な情報を順次収集
- フォーム入力の代替
- 例：予約、申込、設定

### タスク指向対話

```
Phase 1: 意図理解
  └→ Phase 2: 情報収集
      └→ Phase 3: 確認
          └→ Phase 4: 実行
              └→ Phase 5: 完了報告
```

- 目標達成に向けた段階的な対話
- フェーズごとに異なる処理
- 例：予約完了、問題解決、設定変更

### 自由対話

```
ユーザー: 任意の発話
エージェント: 適切な応答
（繰り返し、終了条件まで）
```

- 構造化されていない対話
- 柔軟な話題遷移
- 例：雑談、相談、ブレインストーミング

## セッション管理

### セッションライフサイクル

```
開始 → アクティブ → 一時停止 → 再開 → 終了
         ↓
      タイムアウト → 終了
```

### セッション状態

| 状態    | 説明                     |
| ------- | ------------------------ |
| active  | 対話進行中               |
| paused  | 一時停止（ユーザー離脱） |
| resumed | 再開                     |
| ended   | 正常終了                 |
| expired | タイムアウト終了         |

## 意図認識

### 意図の分類

| カテゴリ   | 例                         |
| ---------- | -------------------------- |
| 情報要求   | 「〜について教えて」       |
| アクション | 「〜を予約して」           |
| 確認       | 「それで合っていますか」   |
| 修正       | 「やっぱり〜に変更して」   |
| 終了       | 「ありがとう、終わりです」 |

### 意図更新

```typescript
function updateIntent(
  currentState: DialogueState,
  userMessage: string,
): DialogueState {
  const newIntent = recognizeIntent(userMessage);

  return {
    ...currentState,
    intent: newIntent || currentState.intent,
    // 意図が変わった場合、関連スロットをリセット
    slot: intentChanged(currentState.intent, newIntent)
      ? {}
      : currentState.slot,
  };
}
```

## 判断基準

### スキル適用タイミング

- 対話フローの設計時
- コンテキスト管理機構の実装時
- ターン状態管理の構築時
- セッション管理の設計時

### 前提条件

- 対話のユースケースが明確
- ターゲットユーザーが特定されている
- 期待される対話の長さが想定されている

## 基本的なベストプラクティス

### すべきこと

- ターンIDの付与（順序管理）
- タイムスタンプの記録
- コンテキストサイズの上限設定
- 意図変更時の確認メッセージ

### 避けるべきこと

- 無制限のコンテキスト保持
- 意図の同期ズレの放置
- ターン情報の削除（監査要件考慮）
- 仮定に基づくユーザー状態操作
