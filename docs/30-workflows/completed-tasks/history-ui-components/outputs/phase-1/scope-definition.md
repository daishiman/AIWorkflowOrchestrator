# スコープ定義書

## メタ情報

| 項目       | 内容                          |
| ---------- | ----------------------------- |
| タスクID   | CONV-05-03                    |
| 機能名     | 履歴/ログ表示UIコンポーネント |
| バージョン | 1.0                           |
| 作成日     | 2026-01-10                    |
| Phase      | 1                             |

---

## スコープ内（In Scope）

### コンポーネント

| コンポーネント名   | パス                                                                | 説明                   |
| ------------------ | ------------------------------------------------------------------- | ---------------------- |
| VersionHistory     | apps/desktop/src/renderer/components/history/VersionHistory.tsx     | 履歴一覧パネル         |
| VersionDetail      | apps/desktop/src/renderer/components/history/VersionDetail.tsx      | バージョン詳細パネル   |
| ConversionLogs     | apps/desktop/src/renderer/components/history/ConversionLogs.tsx     | ログ一覧パネル         |
| RestoreDialog      | apps/desktop/src/renderer/components/history/RestoreDialog.tsx      | 復元確認ダイアログ     |
| VersionHistoryItem | apps/desktop/src/renderer/components/history/VersionHistoryItem.tsx | 履歴アイテム行（内部） |
| LogEntry           | apps/desktop/src/renderer/components/history/LogEntry.tsx           | ログエントリ行（内部） |

### カスタムフック

| フック名          | パス                                                 | 説明               |
| ----------------- | ---------------------------------------------------- | ------------------ |
| useVersionHistory | apps/desktop/src/renderer/hooks/useVersionHistory.ts | 履歴データ取得     |
| useVersionDetail  | apps/desktop/src/renderer/hooks/useVersionDetail.ts  | バージョン詳細取得 |
| useConversionLogs | apps/desktop/src/renderer/hooks/useConversionLogs.ts | ログデータ取得     |
| useRestore        | apps/desktop/src/renderer/hooks/useRestore.ts        | 復元処理           |

### テストファイル

| テストファイル            | パス                                                    |
| ------------------------- | ------------------------------------------------------- |
| VersionHistory.test.tsx   | apps/desktop/src/renderer/components/history/**tests**/ |
| VersionDetail.test.tsx    | apps/desktop/src/renderer/components/history/**tests**/ |
| ConversionLogs.test.tsx   | apps/desktop/src/renderer/components/history/**tests**/ |
| RestoreDialog.test.tsx    | apps/desktop/src/renderer/components/history/**tests**/ |
| useVersionHistory.test.ts | apps/desktop/src/renderer/hooks/**tests**/              |
| useVersionDetail.test.ts  | apps/desktop/src/renderer/hooks/**tests**/              |
| useConversionLogs.test.ts | apps/desktop/src/renderer/hooks/**tests**/              |
| useRestore.test.ts        | apps/desktop/src/renderer/hooks/**tests**/              |

### 機能

| 機能ID | 機能名               | 説明                                          |
| ------ | -------------------- | --------------------------------------------- |
| F-01   | 履歴一覧表示         | ファイルIDを指定して履歴一覧を表示            |
| F-02   | バージョン詳細表示   | 履歴アイテムをクリックして詳細を表示          |
| F-03   | バージョン復元       | 過去バージョンからファイルを復元              |
| F-04   | 復元確認ダイアログ   | 復元前にユーザーに確認を求める                |
| F-05   | ログ一覧表示         | 変換ログを一覧表示                            |
| F-06   | ログフィルタリング   | レベル（info/warn/error）でフィルタ           |
| F-07   | ページネーション     | 20件ずつ追加読み込み                          |
| F-08   | ローディング状態表示 | データ取得中のスピナー表示                    |
| F-09   | エラー状態表示       | エラー発生時のメッセージ表示                  |
| F-10   | アクセシビリティ     | WCAG 2.1 AA準拠（キーボード操作、ARIA属性等） |

---

## スコープ外（Out of Scope）

### 機能

| 除外機能                   | 理由                                 | 将来対応 |
| -------------------------- | ------------------------------------ | -------- |
| 復元処理のバックエンド実装 | 既存サービス（CONV-05-02）を使用     | -        |
| ログのエクスポート機能     | 現段階では要件なし                   | 検討中   |
| 履歴の検索機能             | 現段階では要件なし                   | 検討中   |
| バージョン間の差分表示機能 | 複雑度が高く、別タスクとして切り出し | 検討中   |
| 履歴の削除機能             | セキュリティ観点から慎重な検討が必要 | 検討中   |
| 無限スクロール             | 「さらに読み込む」ボタン方式を採用   | -        |
| リアルタイム更新           | 現段階では要件なし                   | 検討中   |

### 技術的制約

| 制約項目             | 説明                                         |
| -------------------- | -------------------------------------------- |
| 外部ストア使用       | Zustand等は使用せず、フック内で状態管理      |
| サーバーサイド実装   | フロントエンドUIのみ、バックエンドは既存使用 |
| データベーススキーマ | 既存スキーマを使用、変更なし                 |

---

## 境界条件

### データ量の制限

| 項目          | 制限値   | 理由                       |
| ------------- | -------- | -------------------------- |
| 1回の取得件数 | 20件     | UI性能とユーザビリティ考慮 |
| 最大表示件数  | 制限なし | ページネーションで対応     |
| メッセージ長  | 制限なし | CSSで折り返し/トランケート |

### タイミング制約

| 項目                 | 制限値    | 理由             |
| -------------------- | --------- | ---------------- |
| 初期表示応答時間     | 200ms以内 | UX要件           |
| 復元処理タイムアウト | 30秒      | 長時間処理を考慮 |

---

## 依存関係

### 上流依存（このタスクが依存するもの）

| タスクID   | タスク名         | 状態 | 依存内容                        |
| ---------- | ---------------- | ---- | ------------------------------- |
| CONV-05-01 | ログ記録サービス | 完了 | ConversionLogger, LogRepository |
| CONV-05-02 | 履歴取得サービス | 完了 | IHistoryService, HistoryService |

### 下流依存（このタスクに依存するもの）

| タスクID | タスク名               | 依存内容 |
| -------- | ---------------------- | -------- |
| -        | （現時点では特定なし） | -        |

### 外部依存

| 依存先                 | バージョン | 用途                 |
| ---------------------- | ---------- | -------------------- |
| React                  | 18.x       | UIライブラリ         |
| TypeScript             | 5.x        | 型システム           |
| Tailwind CSS           | 3.x        | スタイリング         |
| Vitest                 | -          | テストフレームワーク |
| @testing-library/react | -          | コンポーネントテスト |

---

## 接続要件（統合テスト連携）

### API接続

| 接続元   | 接続先            | メソッド                             | 説明               |
| -------- | ----------------- | ------------------------------------ | ------------------ |
| Renderer | window.historyAPI | getFileHistory(fileId, options)      | 履歴一覧取得       |
| Renderer | window.historyAPI | getVersionDetail(conversionId)       | バージョン詳細取得 |
| Renderer | window.historyAPI | restoreVersion(fileId, conversionId) | バージョン復元     |

### 認証フロー

認証不要（ローカルデータへのアクセス）

### データフロー

```
┌─────────────────────────────────────────────────────────────┐
│                      Renderer Process                        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐    ┌─────────────────────────────────┐ │
│  │ VersionHistory  │───▶│ useVersionHistory               │ │
│  │ (Component)     │    │  - history[]                    │ │
│  │                 │    │  - isLoading, error             │ │
│  │                 │    │  - loadMore(), refresh()        │ │
│  └────────┬────────┘    └───────────────┬─────────────────┘ │
│           │                             │                    │
│           ▼                             ▼                    │
│  ┌─────────────────┐    ┌─────────────────────────────────┐ │
│  │ VersionDetail   │───▶│ useVersionDetail                │ │
│  │ (Component)     │    │  - detail                       │ │
│  └────────┬────────┘    │  - isLoading, error             │ │
│           │             └───────────────┬─────────────────┘ │
│           ▼                             │                    │
│  ┌─────────────────┐                    │                    │
│  │ RestoreDialog   │───▶ useRestore()   │                    │
│  │ (Component)     │                    │                    │
│  └─────────────────┘                    │                    │
│                                         ▼                    │
│                         ┌─────────────────────────────────┐ │
│                         │ window.historyAPI (Preload)     │ │
│                         │  - getFileHistory()             │ │
│                         │  - getVersionDetail()           │ │
│                         │  - restoreVersion()             │ │
│                         └───────────────┬─────────────────┘ │
└─────────────────────────────────────────┼───────────────────┘
                                          │ IPC
┌─────────────────────────────────────────┼───────────────────┐
│                      Main Process       ▼                    │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐│
│  │ IPC Handlers                                            ││
│  │  - history:getFileHistory                               ││
│  │  - history:getVersionDetail                             ││
│  │  - history:restoreVersion                               ││
│  └───────────────────────────┬─────────────────────────────┘│
│                              ▼                               │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ HistoryService (packages/shared)                        ││
│  │  - getFileHistory()                                     ││
│  │  - restoreVersion()                                     ││
│  └───────────────────────────┬─────────────────────────────┘│
│                              ▼                               │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ SQLite Database                                         ││
│  │  - conversion_history table                             ││
│  │  - conversion_logs table                                ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

---

## 成果物サマリ

### Phase 1 成果物

| 成果物         | ファイルパス                               | ステータス |
| -------------- | ------------------------------------------ | ---------- |
| 要件定義書     | outputs/phase-1/requirements-definition.md | 完了       |
| 受け入れ基準   | outputs/phase-1/acceptance-criteria.md     | 完了       |
| スコープ定義書 | outputs/phase-1/scope-definition.md        | 完了       |

### 最終成果物（Phase 5完了時）

| 成果物            | パス                                                            |
| ----------------- | --------------------------------------------------------------- |
| VersionHistory    | apps/desktop/src/renderer/components/history/VersionHistory.tsx |
| VersionDetail     | apps/desktop/src/renderer/components/history/VersionDetail.tsx  |
| ConversionLogs    | apps/desktop/src/renderer/components/history/ConversionLogs.tsx |
| RestoreDialog     | apps/desktop/src/renderer/components/history/RestoreDialog.tsx  |
| useVersionHistory | apps/desktop/src/renderer/hooks/useVersionHistory.ts            |
| useVersionDetail  | apps/desktop/src/renderer/hooks/useVersionDetail.ts             |
| useConversionLogs | apps/desktop/src/renderer/hooks/useConversionLogs.ts            |
| useRestore        | apps/desktop/src/renderer/hooks/useRestore.ts                   |
| テストファイル    | apps/desktop/src/renderer/\*\*/**tests**/                       |
