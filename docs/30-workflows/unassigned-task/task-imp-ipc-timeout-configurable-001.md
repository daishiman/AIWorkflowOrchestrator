# IPC タイムアウト値のチャンネル別設定可能化

## メタ情報

```yaml
issue_number: 1133
task_id: UT-IMP-IPC-TIMEOUT-CONFIGURABLE-001
task_name: IPC タイムアウト値のチャンネル別設定可能化
category: 改善
target_feature: Preload IPC タイムアウト機構
priority: 低
scale: 小規模
status: 未実施
source_phase: TASK-FIX-SAFEINVOKE-TIMEOUT-001 Phase 12
created_date: 2026-03-10
dependencies: []
```

## メタ情報

| 項目         | 内容                                                  |
| ------------ | ----------------------------------------------------- |
| タスクID     | UT-IMP-IPC-TIMEOUT-CONFIGURABLE-001                   |
| タスク名     | IPC タイムアウト値のチャンネル別設定可能化            |
| 分類         | 改善                                                  |
| 対象機能     | Preload IPC タイムアウト機構 (ipc-utils.ts)           |
| 優先度       | 低（P4）                                              |
| 見積もり規模 | 小規模                                                |
| ステータス   | 未実施                                                |
| 発見元       | TASK-FIX-SAFEINVOKE-TIMEOUT-001 Phase 12 未タスク検出 |
| 発見日       | 2026-03-10                                            |

---

## 目的

`invokeWithTimeout` にオプショナルなタイムアウト値パラメータを追加し、チャンネルごとのタイムアウト設定を可能にする。

---

## 背景・問題（Why）

TASK-FIX-SAFEINVOKE-TIMEOUT-001 で `IPC_TIMEOUT_MS = 5000` を定数として実装した。現在は全チャンネルで同一のタイムアウト値が使用される。

### 問題点

1. 重いファイル I/O 操作（スキルインポート等）は 5 秒では不足する可能性がある
2. 軽い設定取得（auth-mode:get 等）は 2 秒で十分かもしれない
3. 外部 API 呼び出し経由のチャンネル（LLM プロバイダー一覧取得等）は 10 秒以上必要な場合がある
4. 現在の固定値では、チャンネルの特性に応じた最適なタイムアウトを設定できない

### 放置した場合の影響

- 重い操作で不要なタイムアウトエラーが発生する
- 軽い操作でハングを検知するまでの時間が不必要に長い
- ユーザー体験の劣化（「応答なし」エラーが頻発、または検知が遅い）

---

## 達成目標（What）

### スコープ

- **含む**: invokeWithTimeout API 拡張、チャンネル別タイムアウト設定マップ、テスト
- **含まない**: safeOn のタイムアウト（別タスク UT-IMP-SAFEON-EVENT-TIMEOUT-001）、Main Process 側の変更

### 成果物

| 成果物                                                                  | 種別     |
| ----------------------------------------------------------------------- | -------- |
| `apps/desktop/src/preload/ipc-utils.ts` の API 拡張                     | 変更     |
| `apps/desktop/src/preload/ipc-timeout-config.ts` チャンネル別設定マップ | 新規作成 |
| `apps/desktop/src/preload/__tests__/ipc-timeout-config.test.ts` テスト  | 新規作成 |

### API 設計案

```typescript
// ipc-timeout-config.ts
export const CHANNEL_TIMEOUT_MS: Partial<Record<string, number>> = {
  "skill:import": 15000, // 重いファイル I/O
  "skill:remove": 10000, // ファイル削除
  "auth-mode:get": 2000, // 軽い設定取得
  "llm:providers": 10000, // 外部 API 経由
};

// ipc-utils.ts
export function invokeWithTimeout<T>(
  allowedChannels: readonly string[],
  channel: string,
  ...args: unknown[]
): Promise<T> {
  const timeoutMs = CHANNEL_TIMEOUT_MS[channel] ?? IPC_TIMEOUT_MS;
  // ... 既存ロジック
}
```

---

## 実装方針（How）

### 前提条件

- TASK-FIX-SAFEINVOKE-TIMEOUT-001 完了済み（ipc-utils.ts が存在する）

### 推奨アプローチ

1. `CHANNEL_TIMEOUT_MS` マップを別ファイルに定義（SRP）
2. `invokeWithTimeout` でチャンネル名をキーにマップを参照
3. マップに未定義のチャンネルは `IPC_TIMEOUT_MS`（5000ms）をフォールバック
4. 既存テストに影響なし（デフォルト値が同じ）

### 注意すべき Pitfall

- **P42**: タイムアウト値の入力バリデーション（負数、0、非数値のガード）
- **P13**: テストで `advanceTimersByTime` を使用（各チャンネルのタイムアウト値でテスト）

---

## 実装で苦戦した箇所（親タスクの経験から）

### 同種課題の5分解決カード

```
症状: IPC タイムアウトが全チャンネル一律で、重い操作がタイムアウトする
根本原因: IPC_TIMEOUT_MS が定数で固定されている
5手順:
  1. CHANNEL_TIMEOUT_MS マップを ipc-timeout-config.ts に定義
  2. invokeWithTimeout で channel をキーにマップ参照
  3. 未定義チャンネルは IPC_TIMEOUT_MS (5000ms) フォールバック
  4. 負数/0/非数値のバリデーションガード追加
  5. チャンネル別タイムアウトのテスト追加
検証ゲート: 新規テスト PASS + 既存 preload テスト全 PASS
```

### TASK-FIX-SAFEINVOKE-TIMEOUT-001 からの教訓

1. **定数の外部化が正解**: `IPC_TIMEOUT_MS` を定数として export した設計は正解。チャンネル別設定もこの延長で設計すべき
2. **後方互換の重要性**: デフォルト値を変更しなければ既存の呼び出し元に影響なし。この「フォールバックパターン」は設定可能化の鉄則
3. **DRY 統合の恩恵**: 3 ファイルの safeInvoke を ipc-utils.ts に統合したため、タイムアウト設定の変更も 1 箇所で完結する
4. **テストの再利用性**: 既存の 15 テストはデフォルト値（5000ms）でテストしているため、チャンネル別設定を追加しても回帰なし

---

## 実行タスク

### Phase 構成

Phase 1-13 の標準構成。小規模タスクのため Phase 4-5 を中心に実行。

---

## 参照資料

| 資料                           | パス                                                                                        |
| ------------------------------ | ------------------------------------------------------------------------------------------- |
| 現在の invokeWithTimeout 実装  | `apps/desktop/src/preload/ipc-utils.ts`                                                     |
| 既存テスト 15 件               | `apps/desktop/src/preload/__tests__/ipc-utils.safeInvoke-timeout.test.ts`                   |
| アーキテクチャ実装パターン S33 | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` |
| 既知の落とし穴 P13, P42        | `.claude/rules/06-known-pitfalls.md`                                                        |

---

## 完了条件

- [ ] `CHANNEL_TIMEOUT_MS` マップが定義されている
- [ ] `invokeWithTimeout` がチャンネル別タイムアウトを参照する
- [ ] 未定義チャンネルは `IPC_TIMEOUT_MS`（5000ms）にフォールバック
- [ ] 負数/0 のバリデーションガードが実装されている
- [ ] チャンネル別タイムアウトのテストが PASS
- [ ] 既存 preload テストに回帰なし
- [ ] `pnpm typecheck` PASS
- [ ] `pnpm lint` PASS

---

## リスクと対策

| リスク                                      | 影響度 | 発生確率 | 対策                                          |
| ------------------------------------------- | ------ | -------- | --------------------------------------------- |
| タイムアウト値の設定ミス（極端に短い/長い） | 中     | 低       | MIN/MAX 定数で範囲制限（500ms-30000ms）       |
| 設定マップの肥大化                          | 低     | 低       | 特殊なチャンネルのみ定義、他はデフォルト      |
| 後方互換の破壊                              | 高     | 極低     | デフォルト値を維持、追加パラメータは optional |

---

## 次 Phase

Phase 1（要件定義）から開始。
