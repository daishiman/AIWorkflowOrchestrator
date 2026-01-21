# 非機能要件一覧

## Phase 1 - タスク3: 非機能要件の定義

### 作成日

2026-01-18

---

## 非機能要件

| ID      | カテゴリ       | 要件                       | 目標値/基準        |
| ------- | -------------- | -------------------------- | ------------------ |
| NFR-001 | パフォーマンス | スキル実行のレスポンス時間 | 3秒以内            |
| NFR-002 | セキュリティ   | IPC通信のセキュリティ      | sender検証必須     |
| NFR-003 | 並行性         | 同時実行の排他制御         | 考慮不要（初期版） |

---

## NFR-001: スキル実行のレスポンス時間

### 概要

スキル実行リクエストから結果取得までのレスポンス時間は3秒以内とする。

### 詳細

| 項目     | 内容                                  |
| -------- | ------------------------------------- |
| 測定区間 | 実行ボタンクリック → トースト通知表示 |
| 目標値   | 3秒以内（95パーセンタイル）           |
| 測定条件 | 通常のスキル実行（外部APIなし）       |
| 備考     | 外部APIを呼び出すスキルは除外         |

### 根拠

- ユーザーがフィードバックを待つ許容時間は一般的に3秒以内
- 3秒を超えるとユーザーはシステムがハングしたと感じる可能性がある

---

## NFR-002: IPC通信のセキュリティ

### 概要

IPC通信のセキュリティを確保するため、sender検証を必須とする。

### 詳細

| 項目       | 内容                                         |
| ---------- | -------------------------------------------- |
| 検証対象   | skill:execute チャンネルへのIPC呼び出し      |
| 検証方法   | validateIpcSender による送信元ウィンドウ検証 |
| 許可送信元 | メインウィンドウのみ                         |
| 不正送信時 | IPCValidationError をスロー                  |

### 実装パターン

```typescript
const validation = validateIpcSender(event, IPC_CHANNELS.SKILL_EXECUTE, {
  getAllowedWindows: () => [mainWindow],
});
if (!validation.valid) {
  throw toIPCValidationError(validation);
}
```

### 参照

- `.claude/skills/aiworkflow-requirements/references/security-implementation.md`
- `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md`

---

## NFR-003: 同時実行の排他制御

### 概要

初期実装では、同時実行の排他制御は考慮しない。

### 詳細

| 項目     | 内容                                         |
| -------- | -------------------------------------------- |
| スコープ | 初期実装                                     |
| 方針     | 同一スキルの同時実行を許可                   |
| 理由     | 実装の複雑性を避け、MVP としてシンプルに保つ |
| 将来対応 | 必要に応じて後続バージョンで対応             |

### 備考

- UI側では FR-005 により同一スキルの実行ボタンを一時無効化する
- これによりユーザー操作レベルでの重複実行は防止される
- バックエンド側での厳密な排他制御は初期実装では行わない

---

## セキュリティ要件詳細

### IPC チャンネルホワイトリスト

`skill:execute` チャンネルは `ALLOWED_INVOKE_CHANNELS` に追加が必要。

```typescript
export const ALLOWED_INVOKE_CHANNELS: readonly string[] = [
  // ... existing channels
  IPC_CHANNELS.SKILL_EXECUTE, // 追加
];
```

### sender検証フロー

```
┌─────────────────┐
│  IPC Request    │
│  (Renderer)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ validateIpcSender │
│                   │
│ - Check sender    │
│ - Check webContents │
│ - Check allowedWindows │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
   valid    invalid
    │         │
    ▼         ▼
┌────────┐ ┌────────────┐
│ Execute │ │ Throw Error │
└────────┘ └────────────┘
```

---

## パフォーマンス計測ポイント

| 計測ポイント           | 説明                             |
| ---------------------- | -------------------------------- |
| T1: 実行ボタンクリック | ユーザー操作のタイムスタンプ     |
| T2: IPC送信            | preload からメインプロセスへ送信 |
| T3: ハンドラー受信     | メインプロセスで IPC を受信      |
| T4: サービス実行完了   | SkillService.executeSkill 完了   |
| T5: IPC レスポンス     | メインプロセスからレスポンス返却 |
| T6: UI更新             | トースト表示                     |

**総所要時間**: T6 - T1 ≤ 3秒

---

## 完了確認

- [x] 非機能要件 NFR-001 を定義
- [x] 非機能要件 NFR-002 を定義
- [x] 非機能要件 NFR-003 を定義
- [x] outputs/phase-1/non-functional-requirements.md に出力
