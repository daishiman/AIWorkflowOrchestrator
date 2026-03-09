# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| タスクID   | TASK-FIX-SAFEINVOKE-TIMEOUT-001 |
| Phase      | 1                               |
| Phase名    | 要件定義                        |
| カテゴリ   | fix                             |
| 優先度     | Priority 2                      |
| ステータス | pending                         |
| 前提Phase  | なし                            |
| 後続Phase  | Phase 2                         |

## 目的

`safeInvoke` 関数にタイムアウト機構を追加し、IPC呼び出しがハングした場合に Promise が永遠に resolve しない問題を解消する。要件と受け入れ基準を明確に定義する。

## 背景

### 問題の概要

`apps/desktop/src/preload/index.ts` の L113-117 にある `safeInvoke` は、`ipcRenderer.invoke()` の戻り値をそのまま返しており、タイムアウト機構がない。Main Process 側のハンドラが応答しない場合（ネットワーク障害、外部サービス到達不能、ハンドラ内部の Promise 未解決等）、呼び出し元の Promise が永遠に pending 状態となる。

### 影響範囲

1. **認証初期化**: `initializeAuth()` がハング → `isLoading` が true のまま → AuthGuard が全画面ブロック
2. **Supabase接続**: Supabase設定済みで到達不能な場合、`supabase.auth.getSession()` がハングし、IPC応答が返らない
3. **全IPC呼び出し**: skill操作、設定取得、LLMプロバイダ取得等、`safeInvoke` 経由の全APIに同じリスク

### 現在のコード

```typescript
// apps/desktop/src/preload/index.ts L113-117
function safeInvoke<T>(channel: string, ...args: unknown[]): Promise<T> {
  if (!ALLOWED_INVOKE_CHANNELS.includes(channel)) {
    return Promise.reject(new Error(`Channel ${channel} is not allowed`));
  }
  return ipcRenderer.invoke(channel, ...args); // NO TIMEOUT!
}
```

## 実行タスク

### タスク1: 要件の抽出と整理

**目的**: 問題の影響範囲を特定し、修正要件を明確化する

**手順**:

1. `safeInvoke` の現在の実装を確認
2. `safeInvoke` の全呼び出し元を `grep` で特定
3. 各呼び出し元での影響（タイムアウト時の挙動）を分析
4. タイムアウト値の妥当性を検討

**期待される成果物**:

- 呼び出し元の一覧と影響分析

### タスク2: 受け入れ基準の定義

**目的**: テスト可能な受け入れ基準を定義する

**受け入れ基準**:

| ID   | 基準                                                                                  | 検証方法                               |
| ---- | ------------------------------------------------------------------------------------- | -------------------------------------- |
| AC-1 | safeInvoke が IPC_TIMEOUT_MS 以内に応答しない場合、タイムアウトエラーで reject される | ユニットテスト（fake timer）           |
| AC-2 | タイムアウトエラーメッセージに channel 名が含まれる                                   | ユニットテスト（エラーメッセージ検証） |
| AC-3 | 正常なIPC応答はタイムアウトなしで返る                                                 | ユニットテスト（正常応答検証）         |
| AC-4 | ALLOWED_INVOKE_CHANNELS 外のチャンネルは従来どおり即座に reject される                | ユニットテスト（既存テスト維持）       |
| AC-5 | タイムアウト値が定数（IPC_TIMEOUT_MS）として定義され、変更可能である                  | コードレビュー                         |
| AC-6 | 全既存テストが PASS する                                                              | CI/全テスト実行                        |

### タスク3: スコープの明確化

**目的**: 修正範囲を限定し、過剰な変更を防止する

**スコープ内**:

- `safeInvoke` へのタイムアウト追加（`Promise.race` パターン）
- タイムアウト定数 `IPC_TIMEOUT_MS` の定義
- タイムアウトエラーメッセージの設計
- ユニットテスト作成

**スコープ外**:

- `safeOn` の変更（イベントリスナーであり、タイムアウトの概念が異なる）
- Main Process 側のハンドラ変更
- AuthGuard の改修（別タスクで対応）
- タイムアウト値のユーザー設定機能
- リトライ機構の追加

### タスク4: セキュリティ考慮事項

**目的**: Preload 層のセキュリティ境界への影響を評価する

**確認項目**:

- `contextIsolation: true` / `sandbox: true` の維持（変更なし）
- `contextBridge` 経由の API は引き続きホワイトリスト制御
- タイムアウトエラーメッセージに内部情報（パス、スタックトレース等）を含めない
- channel 名はホワイトリスト内のもののみ露出（既存のバリデーション維持）

### タスク5: 技術的制約の整理

**目的**: 実装時の技術的制約を明確にする

**制約事項**:

1. **P13 準拠**: タイマーテストでは `advanceTimersByTime` を使用し、`runAllTimers` は使用しない（無限ループ防止）
2. **メモリリーク防止**: タイムアウト後に遅延して resolve された IPC 応答を適切に無視する
3. **Preload 環境制約**: Preload スクリプトは sandbox 環境で動作するため、使用可能な API に制限がある
4. **既存テスト互換**: 既存の `safeInvoke` テストが全て PASS すること

## 参照資料

| 参照資料              | パス                                                                          |
| --------------------- | ----------------------------------------------------------------------------- |
| 対象ファイル          | `apps/desktop/src/preload/index.ts` (L113-117)                                |
| セキュリティルール    | `.claude/rules/04-electron-security.md`                                       |
| 既知の落とし穴 P13    | `.claude/rules/06-known-pitfalls.md#P13`                                      |
| 既知の落とし穴 P42    | `.claude/rules/06-known-pitfalls.md#P42`                                      |
| IPC契約チェックリスト | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md` |

## 統合テスト連携

- Phase 4 でテストケースを設計する際、AC-1〜AC-6 を全てカバーする
- Phase 5 の実装後、Phase 6 でエッジケース（複数同時タイムアウト、タイムアウト直前の応答等）をテスト追加

## 成果物

| 成果物               | パス                                                                        |
| -------------------- | --------------------------------------------------------------------------- |
| 要件定義書（本文書） | `docs/30-workflows/TASK-FIX-SAFEINVOKE-TIMEOUT-001/phase-1-requirements.md` |

## 完了条件

- [ ] 現在の `safeInvoke` 実装を確認し、問題を特定
- [ ] 全呼び出し元の影響分析が完了
- [ ] 受け入れ基準 AC-1〜AC-6 が定義済み
- [ ] スコープ内/外が明確に区分
- [ ] セキュリティ考慮事項を評価
- [ ] 技術的制約を整理
- [ ] 本Phase内の全タスクを100%実行完了

## 次Phase

Phase 2: 設計へ進む。`Promise.race` パターンの詳細設計とエラーメッセージ形式を決定する。
