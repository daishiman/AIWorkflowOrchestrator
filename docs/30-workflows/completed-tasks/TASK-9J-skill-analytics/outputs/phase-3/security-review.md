# Phase 3 タスク3: セキュリティレビュー

## メタ情報

| 項目   | 内容                                            |
| ------ | ----------------------------------------------- |
| タスク | タスク3: セキュリティレビュー                   |
| 作成日 | 2026-02-28                                      |
| 入力   | Phase 2 IPCチャネル設計、エラーハンドリング設計 |

## セキュリティチェック項目

| チェック項目                                                 | 結果 | 備考                                                                         |
| ------------------------------------------------------------ | ---- | ---------------------------------------------------------------------------- |
| 全IPCハンドラで `validateIpcSender` 実施                     | OK   | 全5チャネルのハンドラ先頭で実行、`getAllowedWindows: () => [mainWindow]`     |
| 予期しないエラーが `"Internal error"` に正規化               | OK   | パターン11 として全5チャネルで定義                                           |
| `contextBridge` 経由でのみ公開（`window.electronAPI.skill`） | OK   | `skill-api.ts` の `skillAPI` オブジェクトに統合                              |
| ハードコードチャンネル名を使わない（`IPC_CHANNELS` のみ）    | OK   | 全チャネルが `IPC_CHANNELS.SKILL_ANALYTICS_*` 定数で参照                     |
| PII/認証情報をイベント・exportに含めない                     | OK   | SkillUsageEvent にPII/認証フィールドなし。エクスポートは記録済みイベントのみ |
| `period.start/end` のISO 8601検証がある                      | OK   | `isNaN(Date.parse())` で検証                                                 |
| `period.start <= period.end` の整合検証がある                | OK   | `new Date(start) > new Date(end)` で検証                                     |

## 攻撃ベクトルと防御策

| 攻撃ベクトル                        | 防御策                           | 設計上の対応 | 備考                                               |
| ----------------------------------- | -------------------------------- | ------------ | -------------------------------------------------- |
| 不正SenderからのIPC呼び出し         | `validateIpcSender`              | OK           | 全5チャネルで先頭実行                              |
| `skillName` への不正入力            | P42 3段バリデーション            | OK           | `typeof` + `trim() === ""` の3段チェック           |
| `period` 改ざん（ISO不正/逆転期間） | ISO検証 + `start <= end` 検証    | OK           | `validatePeriod` 共通関数で一括検証                |
| 大量データによる処理逼迫            | 集計O(n)設計 + 性能測定計画      | OK           | NFR-4 で 10,000件1秒基準。Phase 7 で実測           |
| エラー詳細からの情報漏えい          | 内部エラーのサニタイズ/正規化    | OK           | パターン11: `"Internal error"` 固定文字列          |
| `eventType` インジェクション        | 許可リスト照合                   | OK           | `VALID_EVENT_TYPES` 定数との `includes` チェック   |
| `format` インジェクション           | 許可リスト照合                   | OK           | `VALID_FORMATS` 定数との `includes` チェック       |
| `granularity` インジェクション      | 許可リスト照合                   | OK           | `VALID_GRANULARITIES` 定数との `includes` チェック |
| `duration`/`tokenCount` 不正値      | 型チェック + 非負検証            | OK           | `typeof !== "number" \|\| < 0` で拒否              |
| `toolsUsed` 不正配列                | `Array.isArray` + 要素型チェック | OK           | 配列かつ各要素が string であることを検証           |
| `timestamp` 偽装                    | ISO 8601形式検証                 | OK           | `isNaN(Date.parse())` で検証（定義時のみ）         |

## 詳細分析

### 1. Sender 検証の実装パターン

全5チャネルで以下のパターンが統一されている:

```typescript
const validation = validateIpcSender(event, IPC_CHANNELS.SKILL_ANALYTICS_*, {
  getAllowedWindows: () => [mainWindow],
});
if (!validation.valid) {
  return toIPCValidationError(validation);
}
```

`throw` ではなく `return` 方式を採用しており、TASK-9G の最新パターンに準拠している。

### 2. エラーサニタイズ

エラーハンドリング設計の「返さない情報」一覧:

- スタックトレース
- Unix / Windows ファイルパス
- IP アドレス
- 機密情報（token, key, password, secret）
- JavaScript ランタイムエラーの詳細

予期しない例外は全て `{ success: false, error: "Internal error" }` に正規化される。ログ出力は `electron-log` で Main Process 内に完結する。

### 3. バリデーション実行順序

全5チャネルで Sender 検証が最初に実行される設計が明示されている。Sender 検証失敗時は後続のバリデーションを実行しない（early return）。

### 4. PII/認証情報の非包含

`SkillUsageEvent` に含まれるフィールドは以下のみ:

- `id`: UUID v4（自動生成）
- `skillName`: スキル名
- `eventType`: イベント種別
- `timestamp`: 実行日時
- `success`: 成功フラグ
- `toolsUsed`: ツール名配列
- `duration`: 実行時間
- `errorMessage`: エラーメッセージ
- `tokenCount`: トークン消費量

ユーザー個人情報、認証トークン、API キーは含まれない。`errorMessage` フィールドについては、`SkillAnalytics.recordEvent()` の呼び出し元（SkillExecutor 等）がサニタイズ済みのメッセージを渡す前提で設計されている。

## 特記事項

### `errorMessage` フィールドの PII 混入対策

`SkillUsageEvent.errorMessage` は任意フィールドとして記録される。呼び出し元が未サニタイズのエラーメッセージを渡すリスクについては、Phase 2 設計で以下の対策が講じられている:

1. `errorMessage` の入力サニタイズは、呼び出し元（SkillExecutor 等の Main Process 内部コード）の責務として設計されている
2. IPC ハンドラのレスポンスサニタイズは予期しない例外に対して `"Internal error"` 固定文字列で正規化される
3. `errorMessage` は IPC 境界を越えて Renderer に直接公開されるフィールドではなく、永続化データとエクスポート出力にのみ含まれる

IPC 境界での追加サニタイズは過剰防御であり、既存の SkillExecutor のエラーサニタイズ処理と責務が重複するため不要と評価する。

### `toIPCValidationError` の返却形式

`toIPCValidationError(validation)` は既存の共通関数であり、TASK-9F/9G でも同様の形式で使用されている。`safeInvokeUnwrap` はこの形式を処理可能であり、既存の動作実績がある。

## 指摘事項

指摘なし。

## 集計

| 重大度   | 件数 | 詳細 |
| -------- | ---- | ---- |
| CRITICAL | 0    |      |
| MAJOR    | 0    |      |
| MINOR    | 0    |      |

## 結論

セキュリティ設計は IPC 境界防御と情報漏えい防止の観点で十分な対策が講じられている。全5チャネルで `validateIpcSender` が先頭実行され、エラーレスポンスはサニタイズされている。全チェック項目と全攻撃ベクトルに対する防御策が設計済みであり、MAJOR/CRITICAL 指摘はない。Phase 4 進行を妨げる問題は検出されなかった。
