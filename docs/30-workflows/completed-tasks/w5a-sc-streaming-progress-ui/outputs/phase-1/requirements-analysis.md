# Phase 1: 要件定義 - 調査結果

## タスク1: SKILL_CREATOR_PROGRESS チャンネルの現行定義

### チャンネル定義

- **チャンネル名**: `skill-creator:progress`
- **定数名**: `IPC_CHANNELS.SKILL_CREATOR_PROGRESS` (`channels.ts:322`)
- **方向**: Main -> Renderer (push)
- **登録先**: `ALLOWED_ON_CHANNELS` (`channels.ts:700`)

### ペイロード型 (`skill-creator-api.ts:42-46`)

```typescript
export interface SkillCreatorProgress {
  phase: string;
  percentage: number;
  message: string;
}
```

### 送信箇所

- `skillCreatorHandlers.ts:695`: `mainWindow.webContents.send(IPC_CHANNELS.SKILL_CREATOR_PROGRESS, progress)`

### Preload API (`skill-creator-api.ts:363-366`)

```typescript
onProgress: (callback: (progress: SkillCreatorProgress) => void): (() => void) =>
  safeOn<SkillCreatorProgress>(IPC_CHANNELS.SKILL_CREATOR_PROGRESS, callback),
```

- `safeOn` がクリーンアップ関数を返す設計 -> P5対策の基盤は整っている

## タスク2: GenerateStep.tsx の現行UI実装

### 現行実装 (`GenerateStep.tsx`)

- Props: `{ isGenerating: boolean; error: Error | null }`
- `isGenerating=true` 時: スピナー(`role="status"`) + 「生成中...」テキスト
- `error` 時: エラーメッセージ表示（フォールバック:「スキル生成に失敗しました」）
- `aria-live="polite"` 適用済み

### 問題点

1. 進捗データを受け取る口がない（プログレスバーなし）
2. 段階表示なし（4段階が区別できない）
3. エラー種別による表示分岐がない
4. キャンセル機能なし
5. プレビュー表示なし

## タスク3: 進捗表示要件

| 段階             | stage値             | ユーザー向けメッセージ              | percent範囲 |
| ---------------- | ------------------- | ----------------------------------- | ----------- |
| 構造計画中       | `planning`          | スキルの構造を計画しています...     | 0-25%       |
| SKILL.md 生成中  | `generating-skill`  | SKILL.md を生成しています...        | 25-50%      |
| agents 生成中    | `generating-agents` | エージェント定義を生成しています... | 50-75%      |
| バリデーション中 | `validating`        | スキルを検証しています...           | 75-100%     |

## タスク4: エラー表示要件

| エラーコード      | 原因             | UI対応                                 |
| ----------------- | ---------------- | -------------------------------------- |
| `API_KEY_NOT_SET` | APIキー未設定    | 設定画面への誘導リンク付きエラーカード |
| `LLM_ERROR`       | レートリミット等 | リトライボタン付きエラーカード         |
| `NETWORK_ERROR`   | ネットワーク切断 | オフライン表示 + 再接続待機メッセージ  |

## タスク5: キャンセル機能要件

- トリガー: キャンセルボタン押下
- 表示タイミング: 生成中（`planning` / `generating-skill` / `generating-agents` / `validating`）のみ
- 処理: `AbortController` で中断 -> IPC `skill-creator:cancel` 送信
- キャンセル後UI: 「キャンセルしました」メッセージ -> ウィザード先頭に戻る

## タスク6: 受入基準（AC）

### FR-2: リアルタイム進捗表示

- [ ] 進捗4段階がUIに反映される
- [ ] percent値に応じてプログレスバーが変化する
- [ ] previewContent表示が可能

### AC-3: 進捗ストリーミング

- [ ] SKILL_CREATOR_PROGRESS イベントがリアルタイムでUIに反映される
- [ ] 高速連続更新に対してデバウンス（100ms）が適用される

### AC-6: エラーメッセージ

- [ ] API_KEY_NOT_SET: 設定画面への誘導
- [ ] LLM_ERROR: リトライボタン表示
- [ ] NETWORK_ERROR: オフライン表示
- [ ] エラーに内部情報が漏洩しない

## NFR確認

- アクセシビリティ: `role="progressbar"`, `aria-valuenow/min/max`, `aria-live="polite"`, `role="alert"`
- パフォーマンス: デバウンス100ms、個別セレクタパターン
- i18n: メッセージキー方式で管理可能な構造（初期実装はハードコーディング可）
- セキュリティ: エラー表示にスタックトレース等を含めない
