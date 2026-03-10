# Phase 1 成果物: 要件分析結果

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| タスクID   | TASK-FIX-SAFEINVOKE-TIMEOUT-001 |
| Phase      | 1                               |
| 成果物種別 | 要件分析結果                    |
| 作成日     | 2026-03-10                      |
| ステータス | 完了                            |

## 1. safeInvoke 現在の実装確認結果

### 1-1. 重複実装の特定

`safeInvoke` は以下の3ファイルに同一パターンで重複実装されている。

| ファイル                                        | 行番号   | 実装内容                    |
| ----------------------------------------------- | -------- | --------------------------- |
| `apps/desktop/src/preload/index.ts`             | L113-118 | ipcRenderer.invoke 直接返却 |
| `apps/desktop/src/preload/skill-api.ts`         | L374-379 | ipcRenderer.invoke 直接返却 |
| `apps/desktop/src/preload/skill-creator-api.ts` | L177-182 | ipcRenderer.invoke 直接返却 |

全ファイルとも以下の同一パターン:

```typescript
function safeInvoke<T>(channel: string, ...args: unknown[]): Promise<T> {
  if (!ALLOWED_INVOKE_CHANNELS.includes(channel)) {
    return Promise.reject(new Error(`Channel ${channel} is not allowed`));
  }
  return ipcRenderer.invoke(channel, ...args);
}
```

### 1-2. 問題点

1. **タイムアウト機構の欠如**: `ipcRenderer.invoke()` の戻り値をそのまま返しており、Main Process が応答しない場合 Promise が永遠に pending 状態となる
2. **重複実装のドリフトリスク**: 1箇所だけ修正すると3ファイル間で挙動差が発生する
3. **共通 helper の不在**: `ipc-utils.ts` は現時点で存在しない（Glob 検索で確認済み）

## 2. 全呼び出し元の影響分析

### 2-1. 呼び出し回数の集計

| ファイル                       | safeInvoke 出現回数 | 用途                                              |
| ------------------------------ | ------------------- | ------------------------------------------------- |
| `preload/index.ts`             | 133回               | 認証、LLM、エージェント、設定、テーマ等の全般 IPC |
| `preload/skill-api.ts`         | 54回                | スキル管理（インポート、削除、一覧取得等）        |
| `preload/skill-creator-api.ts` | 14回                | スキル作成（テンプレート、ファイル操作等）        |
| **合計**                       | **201回**           |                                                   |

### 2-2. 影響カテゴリ分析

タイムアウト発生時の影響を重大度別に分類する。

#### 重大度: 高（アプリ全体がブロック）

| 呼び出しカテゴリ | 代表的なチャンネル                      | タイムアウト時の影響                             |
| ---------------- | --------------------------------------- | ------------------------------------------------ |
| 認証初期化       | `auth:get-session`, `auth:check-online` | `isLoading=true` 継続 → AuthGuard 全画面ブロック |
| Supabase 接続    | `auth:supabase-*`                       | ネットワーク障害時にハング                       |
| 認証モード取得   | `auth-mode:get`, `auth-mode:set`        | 設定画面到達不能                                 |

#### 重大度: 中（特定機能が使用不能）

| 呼び出しカテゴリ | 代表的なチャンネル                           | タイムアウト時の影響          |
| ---------------- | -------------------------------------------- | ----------------------------- |
| LLM プロバイダー | `llm:get-providers`, `llm:validate-key`      | LLM設定画面がローディング継続 |
| スキル管理       | `skill:import`, `skill:remove`, `skill:list` | スキル一覧が表示されない      |
| エージェント     | `agent:*`                                    | エージェント機能が使用不能    |

#### 重大度: 低（個別操作の失敗）

| 呼び出しカテゴリ | 代表的なチャンネル       | タイムアウト時の影響               |
| ---------------- | ------------------------ | ---------------------------------- |
| テーマ           | `theme:get`, `theme:set` | テーマ切り替え失敗（UI に影響小）  |
| ログ             | `log:*`                  | ログ送信失敗（非致命的）           |
| スキル作成       | `skill-creator:*`        | スキル作成ウィザードの個別操作失敗 |

### 2-3. 影響の連鎖構造

```
safeInvoke ハング（タイムアウトなし）
  → IPC Promise が永遠に pending
    → Store の isLoading が true のまま
      → AuthGuard が全画面をブロック
        → ユーザーが Settings 画面にも到達不能
          → 設定変更による復旧が不可能
```

この連鎖は、safeInvoke にタイムアウトを追加することで「IPC Promise が永遠に pending」の段階で切断される。

## 3. 受け入れ基準 AC-1 から AC-6 の定義確認

| ID   | 基準                                                                                    | 検証方法                               | 状態         |
| ---- | --------------------------------------------------------------------------------------- | -------------------------------------- | ------------ |
| AC-1 | safeInvoke が `IPC_TIMEOUT_MS` 以内に応答しない場合、タイムアウトエラーで reject される | ユニットテスト（fake timer）           | [x] 定義済み |
| AC-2 | タイムアウトエラーメッセージに channel 名とタイムアウト値が含まれる                     | ユニットテスト（エラーメッセージ検証） | [x] 定義済み |
| AC-3 | 正常な IPC 応答はタイムアウトなしで返る                                                 | ユニットテスト（正常応答検証）         | [x] 定義済み |
| AC-4 | `ALLOWED_INVOKE_CHANNELS` 外のチャンネルは従来どおり即座に reject される                | ユニットテスト（既存テスト維持）       | [x] 定義済み |
| AC-5 | タイムアウト値が定数（`IPC_TIMEOUT_MS`）として定義され、変更可能である                  | コードレビュー                         | [x] 定義済み |
| AC-6 | 全既存テストが PASS する                                                                | CI/全テスト実行                        | [x] 定義済み |

## 4. スコープ内/外の明確化

### スコープ内

- [x] `safeInvoke` への `Promise.race` タイムアウト追加
- [x] タイムアウト定数 `IPC_TIMEOUT_MS = 5000` の定義
- [x] Preload 共通 helper（`invokeWithTimeout`）の抽出
- [x] タイムアウトエラーメッセージ設計: `IPC timeout: {channel} did not respond within {IPC_TIMEOUT_MS}ms`
- [x] ユニットテスト作成（helper 単体 + wrapper 回帰）
- [x] 3ファイルの `safeInvoke` を共通 helper に委譲

### スコープ外

- [x] `safeOn` の変更（イベントリスナーであり、タイムアウトの概念が異なる）
- [x] Main Process 側のハンドラ変更
- [x] AuthGuard の改修（別タスク TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001 で対応）
- [x] タイムアウト値のユーザー設定機能
- [x] リトライ機構の追加
- [x] `clearTimeout` によるタイマークリーンアップ（最終実装で採用、timer 残留 0 件をテスト固定）

## 5. セキュリティ考慮事項

| 確認項目                                   | 結果     | 詳細                                                                |
| ------------------------------------------ | -------- | ------------------------------------------------------------------- |
| `contextIsolation: true` への影響          | なし     | Preload 内部の実装変更のみ。BrowserWindow 設定は変更しない          |
| `sandbox: true` への影響                   | なし     | `setTimeout` / `Promise.race` は sandbox 環境で使用可能             |
| `contextBridge` ホワイトリスト制御の維持   | 維持     | `ALLOWED_INVOKE_CHANNELS` チェックは helper 内で継続                |
| エラーメッセージに内部情報が含まれないこと | 含まない | channel 名（ホワイトリスト内のもの）とタイムアウト値のみ露出        |
| 拒否チャンネルの情報漏洩                   | なし     | 拒否されたチャンネルはタイムアウト前に即座に reject（既存動作維持） |
| DoS ベクタ: Timer 大量生成                 | 問題なし | IPC 呼び出し頻度は通常使用で低い。各 Timer は最大5秒で自動解放      |

## 6. 技術的制約

| 制約項目                 | 詳細                                                                                | 準拠ルール           |
| ------------------------ | ----------------------------------------------------------------------------------- | -------------------- |
| P13 準拠: タイマーテスト | `vi.advanceTimersByTime()` を使用。`vi.runAllTimers()` は使用禁止（無限ループ防止） | P13                  |
| メモリリーク防止         | `Promise.race` の敗者 Promise は GC で回収される。Timer は最大5秒後に自動解放       | -                    |
| Preload 環境制約         | sandbox 環境で `setTimeout` / `Promise` / `Promise.race` は使用可能                 | 04-electron-security |
| 既存テスト互換           | `safeInvoke` / `safeInvokeUnwrap` の関数シグネチャは変更しない                      | AC-6                 |
| 関心ごとの分離           | timeout 責務は helper に集約。公開 API ファイルは channel 配線のみ                  | 01-architecture      |

## 完了条件チェックリスト

- [x] 現在の `safeInvoke` 実装を確認し、問題を特定（3ファイルに重複、タイムアウトなし）
- [x] 全呼び出し元の影響分析が完了（合計201回、重大度3段階で分類）
- [x] 受け入れ基準 AC-1 から AC-6 が定義済み
- [x] スコープ内/外が明確に区分
- [x] セキュリティ考慮事項を評価（全6項目確認済み）
- [x] 技術的制約を整理（全5項目整理済み）
- [x] 本 Phase 内の全タスクを100%実行完了
