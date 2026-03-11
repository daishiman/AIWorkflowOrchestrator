# [#1131] "[UT-IMP-PRELOAD-SKILL-API-SAFEINVOKE-TIMEOUT-001] preload/skill-api.ts への safeInvoke timeout 展開"

## メタ情報

```yaml
task_id: UT-IMP-PRELOAD-SKILL-API-SAFEINVOKE-TIMEOUT-001
task_name: preload/skill-api.ts への safeInvoke timeout 展開
category: 改善
target_feature: Skill API preload 境界
priority: 中
scale: 中規模
status: 未実施
source_phase: TASK-FIX-SAFEINVOKE-TIMEOUT-001 Phase 10/12 再監査
created_date: 2026-03-10
dependencies: []
spec_path: docs/30-workflows/unassigned-task/task-imp-preload-skill-api-safeinvoke-timeout-001.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | 中規模 |
| ステータス | 未実施 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-FIX-SAFEINVOKE-TIMEOUT-001 で `preload/index.ts` の `safeInvoke` に `Promise.race` + `IPC_TIMEOUT_MS = 5000` によるタイムアウト機構を追加した。これにより、Main Process の IPC ハンドラが応答しない場合でも Renderer が永続的にハングすることを防止できるようになった。

しかし、`preload/skill-api.ts` は `preload/index.ts` とは**独立した**独自の `safeInvoke` 関数（L374-378）を持っている。この独自実装にはタイムアウト機構が存在しない。`skill-api.ts` は Skill 関連の全 IPC 操作（import / remove / list / get / execute / share 等）を担当しており、42 箇所の `safeInvokeUnwrap` 呼び出しと 12 箇所の直接 `safeInvoke` 呼び出し（定義含む）が存在する。

### 1.2 問題点・課題

`skill-api.ts` の `safeInvoke` にタイムアウト機構がないため、以下の問題が存在する:

1. **IPC ハング時に Renderer が無制限に待機する**: Skill 系の Main Process ハンドラ（skill:import, skill:remove, skill:list 等）が応答しない場合、`safeInvoke` の返す Promise が永遠に pending 状態となり、UI がフリーズする
2. **preload/index.ts との保護レベルの不整合**: 同一 Preload 層内で、一般 IPC は 5 秒タイムアウトで保護されているが、Skill API の IPC は無保護という非対称な状態
3. **ユーザーへの影響**: スキルのインポート・削除・一覧取得でハングが発生すると、ユーザーはアプリを強制終了するしか手段がない

### 1.3 放置した場合の影響

- Main Process の skill 系ハンドラで障害が発生した場合、Renderer が永続ハングする（preload/index.ts 側の修正で防げない）
- Settings 画面の無限ローディング問題（TASK-FIX-SAFEINVOKE-TIMEOUT-001 で対処）と同種の問題が Skill 操作で再現する可能性がある
- 「preload 全体が保護済み」という誤認が生じ、障害時の原因切り分けが遅延する

---

## 2. 何を達成するか（What）

### 2.1 目的

`preload/skill-api.ts` の独自 `safeInvoke` に `preload/index.ts` と同一パターンのタイムアウト機構を導入し、Preload 層全体の IPC 保護を完成させる。

### 2.2 最終ゴール

- `skill-api.ts` の `safeInvoke` が `Promise.race` + `IPC_TIMEOUT_MS = 5000` でタイムアウトする
- `safeInvokeUnwrap` はタイムアウト済みの `safeInvoke` を内部で使用するため、自動的に保護される
- 既存の Skill API テスト群が全 PASS する（回帰なし）
- タイムアウト専用テストが追加されている

### 2.3 スコープ

**含む:**

- `skill-api.ts` の `safeInvoke` 関数へのタイムアウト機構追加
- `safeInvokeUnwrap` 経由でタイムアウトが機能することの検証
- タイムアウト専用テストの追加（12 テストケース程度、親タスクのパターン準拠）
- システム仕様書の safeInvoke rollout 注記の更新

**含まない:**

- `safeInvokeUnwrap` の関数シグネチャやエラーハンドリングロジックの変更
- 42 箇所の `safeInvokeUnwrap` 呼び出し元の変更（タイムアウトは `safeInvoke` 層で透過的に適用）
- `preload/index.ts` の `safeInvoke` の変更（実装済み）
- `IPC_TIMEOUT_MS` の値の変更（5000ms を維持）

### 2.4 成果物

| #   | 成果物                            | パス                                                           |
| --- | --------------------------------- | -------------------------------------------------------------- |
| 1   | タイムアウト実装済み `safeInvoke` | `apps/desktop/src/preload/skill-api.ts`                        |
| 2   | タイムアウトテスト                | `apps/desktop/src/preload/__tests__/skill-api.timeout.test.ts` |
| 3   | 仕様書更新                        | `architecture-implementation-patterns.md` 等の rollout 注記    |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `apps/desktop/src/preload/skill-api.ts` の `safeInvoke`（L374-378）と `safeInvokeUnwrap`（L393-406）の実装を理解していること
- `preload/index.ts` の `safeInvoke` タイムアウト実装（L112-134）を参照できること
- 既存テスト群（`skill-api.test.ts`, `skill-api.permission.test.ts`, `skill-api.contract.test.ts`, `skill-api.unwrap.test.ts`）を実行できること
- TASK-FIX-SAFEINVOKE-TIMEOUT-001 のテスト（`safeInvoke-timeout.test.ts`）を参照できること

### 3.2 依存タスク

| タスクID                        | 状態     | 依存種別               |
| ------------------------------- | -------- | ---------------------- |
| TASK-FIX-SAFEINVOKE-TIMEOUT-001 | 実装済み | 先行（パターン提供元） |

### 3.3 必要な知識

- **Promise.race パターン**: 2 つの Promise（IPC 応答と setTimeout）を競合させ、先に解決した方を採用する
- **Vitest fake timers**: `vi.useFakeTimers()` + `vi.advanceTimersByTime()` による時間制御テスト（P13 準拠: `runAllTimers` は使用禁止）
- **contextBridge mock capture パターン**: Preload モジュールは `contextBridge.exposeInMainWorld` 経由でのみ API を公開するため、テストでは mock の capturer を使用する
- **IpcResult ラッパー**: `skill-api.ts` は `IpcResult<T>` 型（`{ success: boolean, data?: T, error?: string }`）を使用しており、`safeInvokeUnwrap` がこれを展開する

### 3.4 推奨アプローチ

#### Step 1: `IPC_TIMEOUT_MS` 定数と `Promise.race` の追加

`preload/index.ts` の実装パターンを `skill-api.ts` に適用する。変更は `safeInvoke` 関数のみ（`safeInvokeUnwrap` は変更不要）。

**参照すべき実装パターン（`preload/index.ts` L112-134）:**

```typescript
/** IPC呼び出しのデフォルトタイムアウト（ミリ秒） */
const IPC_TIMEOUT_MS = 5000;

function safeInvoke<T>(channel: string, ...args: unknown[]): Promise<T> {
  if (!ALLOWED_INVOKE_CHANNELS.includes(channel)) {
    return Promise.reject(new Error(`Channel ${channel} is not allowed`));
  }
  return Promise.race([
    ipcRenderer.invoke(channel, ...args),
    new Promise<never>((_, reject) =>
      setTimeout(
        () =>
          reject(
            new Error(
              `IPC timeout: ${channel} did not respond within ${IPC_TIMEOUT_MS}ms`,
            ),
          ),
        IPC_TIMEOUT_MS,
      ),
    ),
  ]);
}
```

**`skill-api.ts` への適用（L374-378 の変更）:**

変更前:

```typescript
function safeInvoke<T>(channel: string, ...args: unknown[]): Promise<T> {
  if (!ALLOWED_INVOKE_CHANNELS.includes(channel)) {
    return Promise.reject(new Error(`Channel ${channel} is not allowed`));
  }
  return ipcRenderer.invoke(channel, ...args);
}
```

変更後:

```typescript
/** IPC呼び出しのデフォルトタイムアウト（ミリ秒） */
const IPC_TIMEOUT_MS = 5000;

function safeInvoke<T>(channel: string, ...args: unknown[]): Promise<T> {
  if (!ALLOWED_INVOKE_CHANNELS.includes(channel)) {
    return Promise.reject(new Error(`Channel ${channel} is not allowed`));
  }
  return Promise.race([
    ipcRenderer.invoke(channel, ...args),
    new Promise<never>((_, reject) =>
      setTimeout(
        () =>
          reject(
            new Error(
              `IPC timeout: ${channel} did not respond within ${IPC_TIMEOUT_MS}ms`,
            ),
          ),
        IPC_TIMEOUT_MS,
      ),
    ),
  ]);
}
```

#### Step 2: テスト作成

`safeInvoke-timeout.test.ts` のパターンに準拠したテストを `skill-api.timeout.test.ts` として作成する。`skill-api.ts` 固有の考慮点:

- `skill-api.ts` は `contextBridge.exposeInMainWorld("skillAPI", ...)` で公開するため、テストの API キャプチャ先が `exposedAPIs["skillAPI"]` になる
- `safeInvokeUnwrap` 経由のタイムアウト検証が必要（`IpcResult` ラッパーとの組み合わせ）
- テスト実行は `cd apps/desktop` から行うこと（P40 準拠）

#### Step 3: 仕様書更新

`architecture-implementation-patterns.md` の safeInvoke timeout パターン（S19）に `skill-api.ts` への展開完了を記録する。

### 3.5 実装課題と解決策（親タスクからの教訓）

以下は TASK-FIX-SAFEINVOKE-TIMEOUT-001 の実装時に遭遇した課題と解決策。本タスクでも同様の課題が発生する。

| #   | 課題                                                                                                                                                       | 原因                                                                                        | 解決策                                                                                                                                                                                             | 関連 Pitfall |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| 1   | **contextBridge mock capture パターン**: Preload の `safeInvoke` は `contextBridge.exposeInMainWorld` 経由でのみアクセス可能。通常の import ではテスト不可 | Preload モジュールは `process.contextIsolated === true` のとき contextBridge パスを通過する | テストで `process.contextIsolated = true` を設定し、`contextBridge.exposeInMainWorld` の mock で公開された API をキャプチャする。`skill-api.ts` では `exposedAPIs["skillAPI"]` から API を取得する | -            |
| 2   | **fake timer + module re-import の組み合わせ**: `vi.useFakeTimers()` と `vi.resetModules()` の実行順序を誤ると、タイマーが正しく動作しない                 | モジュールの re-import 時にタイマー状態がリセットされる                                     | `beforeEach` 内で以下の順序を厳守: (1) `vi.useFakeTimers()` (2) `vi.resetModules()` (3) API キャプチャ用オブジェクトをリセット (4) `await import("../skill-api")` でモジュール再読み込み           | P13          |
| 3   | **Promise.race でのメモリリーク判断**: タイムアウト後に `clearTimeout` しなくてよいか                                                                      | IPC 成功時に setTimeout が残存する                                                          | `IPC_TIMEOUT_MS` が短い（5 秒以下）ため、`clearTimeout` は不要。シンプルさを優先する。UI 頻度の IPC ではメモリ影響は無視できる                                                                     | -            |
| 4   | **Write ツールが新規ファイル作成を拒否する場合がある**: テストファイル新規作成時にツール制約に遭遇する可能性                                               | Claude Code の Write ツールの制約                                                           | `mkdir -p` + heredoc パターンで Bash ツール経由でファイルを作成する                                                                                                                                | -            |
| 5   | **カバレッジ計測の scope 問題**: モノレポで特定ファイルのカバレッジを計測しようとすると、scope 設定が正しく適用されない                                    | Vitest のカバレッジプロバイダがモノレポ構成を考慮しない場合がある                           | ファイル単体のパス網羅分析で代替する。`cd apps/desktop && pnpm vitest run --coverage src/preload/__tests__/skill-api.timeout.test.ts` で対象テストのカバレッジを確認                               | P40          |

---

## 4. 実行手順

### Phase 4: テスト作成

1. `apps/desktop/src/preload/__tests__/skill-api.timeout.test.ts` を作成する
2. `safeInvoke-timeout.test.ts` のパターンに準拠し、以下のテストケースを含める:
   - T1: IPC 未応答時にタイムアウトエラーで reject する
   - T2: エラーメッセージにチャンネル名とタイムアウト値を含む
   - T3: `IPC_TIMEOUT_MS` が 5000ms であることを検証する
   - T4: 正常応答時はタイムアウトせずに resolve する
   - T5: タイムアウト直前の応答は正常に resolve する（境界値）
   - T6: 未許可チャンネルは即座に reject する
   - T7: Main Process エラーはタイムアウトエラーではなく IPC エラーで返る
   - T8: 複数の同時呼び出しが独立してタイムアウトする
   - T9: `safeInvokeUnwrap` 経由でもタイムアウトが機能する
   - T10: タイムアウト後の遅延 IPC レスポンスが無視される（メモリ安全性）
   - T11: IPC 即時応答（0ms）が正常に resolve する（最小境界値）
   - T12: `safeInvokeUnwrap` でタイムアウト時のエラーが IPC timeout メッセージを含む
3. テストを実行し、全テストが RED であることを確認する（実装前）

### Phase 5: 実装

1. `skill-api.ts` に `IPC_TIMEOUT_MS = 5000` 定数を追加する（L374 の直前）
2. `safeInvoke` 関数を `Promise.race` パターンに変更する（Step 1 の実装パターン参照）
3. `safeInvokeUnwrap` は変更しない（`safeInvoke` の変更が自動的に適用される）
4. テストを実行し、全テストが GREEN であることを確認する

### Phase 6-7: テスト拡充・カバレッジ確認

1. 既存テスト群を実行し回帰がないことを確認する:
   ```bash
   cd apps/desktop && pnpm vitest run \
     src/preload/__tests__/skill-api.test.ts \
     src/preload/__tests__/skill-api.permission.test.ts \
     src/preload/__tests__/skill-api.contract.test.ts \
     src/preload/__tests__/skill-api.unwrap.test.ts \
     src/preload/__tests__/skill-api.unification.test.ts \
     src/preload/__tests__/skill-api.getFileTree.test.ts \
     src/preload/__tests__/skill-api.timeout.test.ts
   ```
2. カバレッジを確認し、`safeInvoke` 関数のブランチカバレッジが 100% であることを検証する

### Phase 8-9: リファクタリング・品質検証

1. `preload/index.ts` と `skill-api.ts` の `safeInvoke` 実装が同一パターンであることを確認する
2. 共通化の可能性を検討する（共通化する場合は別タスクとして切り出す）
3. `pnpm lint` + `pnpm typecheck` を実行する

### Phase 12: ドキュメント

1. `architecture-implementation-patterns.md` の S19（safeInvoke timeout パターン）に `skill-api.ts` への展開完了を記録する
2. `task-workflow.md` の残課題テーブルを更新する
3. `LOGS.md`（2 箇所）を更新する
4. `topic-map.md` を再生成する

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `skill-api.ts` の `safeInvoke` に `Promise.race` + `IPC_TIMEOUT_MS = 5000` が実装されている
- [ ] `safeInvokeUnwrap` 経由でタイムアウトが機能する（`safeInvoke` の変更が透過的に適用される）
- [ ] 未許可チャンネルは即座に reject され、IPC 呼び出しが発生しない
- [ ] タイムアウトエラーメッセージにチャンネル名と `5000ms` が含まれる
- [ ] タイムアウト後の遅延レスポンスが無視される（unhandled rejection なし）

### 品質要件

- [ ] タイムアウト専用テスト（12 テストケース程度）が全 PASS
- [ ] 既存 Skill API テスト群（6 ファイル）が全 PASS（回帰なし）
- [ ] `pnpm lint` が通ること
- [ ] `pnpm typecheck` が通ること
- [ ] `safeInvoke` 関数のブランチカバレッジが 100%

### ドキュメント要件

- [ ] `architecture-implementation-patterns.md` の S19 に展開完了を記録
- [ ] `task-workflow.md` の残課題テーブルを更新
- [ ] `LOGS.md`（`aiworkflow-requirements` と `task-specification-creator` の 2 箇所）を更新
- [ ] `topic-map.md` を再生成

---

## 6. 検証方法

### テストケース

| #   | テストケース                              | 検証内容                         | 期待結果                                               |
| --- | ----------------------------------------- | -------------------------------- | ------------------------------------------------------ |
| T1  | IPC 未応答 + 5000ms 経過                  | タイムアウト発生                 | `IPC timeout:` を含むエラーで reject                   |
| T2  | エラーメッセージ内容                      | チャンネル名と時間を含む         | `IPC timeout: {channel} did not respond within 5000ms` |
| T3  | `IPC_TIMEOUT_MS` 値                       | 定数値                           | 5000                                                   |
| T4  | IPC 正常応答                              | タイムアウト前に resolve         | 正常値が返る                                           |
| T5  | IPC 応答 4999ms                           | 境界値（タイムアウト直前）       | 正常値が返る                                           |
| T6  | 未許可チャンネル                          | ホワイトリスト外                 | 即座に reject、`mockInvoke` 未呼び出し                 |
| T7  | Main Process エラー                       | IPC エラー vs タイムアウトエラー | IPC エラーで reject（timeout メッセージなし）          |
| T8  | 複数同時呼び出し                          | 独立タイムアウト                 | 各 Promise が個別にタイムアウト                        |
| T9  | `safeInvokeUnwrap` 経由タイムアウト       | ラッパー透過性                   | タイムアウトエラーで reject                            |
| T10 | タイムアウト後の遅延レスポンス            | メモリ安全性                     | unhandled rejection なし                               |
| T11 | IPC 即時応答（0ms）                       | 最小境界値                       | 正常値が返る                                           |
| T12 | `safeInvokeUnwrap` タイムアウトメッセージ | エラー伝播                       | `IPC timeout` を含むメッセージ                         |

### 検証手順

```bash
# 1. タイムアウトテストの実行
cd apps/desktop && pnpm vitest run src/preload/__tests__/skill-api.timeout.test.ts

# 2. 既存テスト群の回帰チェック
cd apps/desktop && pnpm vitest run src/preload/__tests__/skill-api*.test.ts

# 3. Lint・型チェック
pnpm lint
pnpm typecheck

# 4. 全テスト実行（最終確認）
cd apps/desktop && pnpm vitest run
```

---

## 7. リスクと対策

| #   | リスク                                                                                                       | 影響度 | 発生確率 | 対策                                                                                                                                                            |
| --- | ------------------------------------------------------------------------------------------------------------ | ------ | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `safeInvokeUnwrap` のエラーハンドリングがタイムアウトエラーを想定していない                                  | 中     | 低       | `safeInvokeUnwrap` は `safeInvoke` の reject をそのまま throw するため、タイムアウトエラーも正しく伝播する。テスト T9/T12 で検証する                            |
| 2   | 既存テストが fake timers の影響を受ける                                                                      | 中     | 中       | タイムアウトテストは独立したテストファイル（`skill-api.timeout.test.ts`）に分離する。`afterEach` で `vi.useRealTimers()` を確実に呼ぶ                           |
| 3   | `IPC_TIMEOUT_MS` が `preload/index.ts` と `skill-api.ts` で二重定義になる                                    | 低     | 確実     | 本タスクでは意図的に二重定義を許容する。共通化は別タスクとして管理する。値の一致は定数値テスト（T3）で担保する                                                  |
| 4   | `skill-api.ts` の `safeInvoke` が `contextBridge.exposeInMainWorld` 経由でなく直接使用されているケースがある | 中     | 低       | `safeInvokeUnwrap` が `safeInvoke` を内部呼び出ししているため、全 42 箇所の `safeInvokeUnwrap` 呼び出しが自動的に保護される。直接 `safeInvoke` を呼ぶ箇所も同様 |
| 5   | テスト実行ディレクトリの誤り（P40）                                                                          | 高     | 中       | テスト実行は必ず `cd apps/desktop` から行う。`pnpm --filter @repo/desktop exec vitest run` でも可                                                               |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント                                                                                | 参照内容                                           |
| ------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| `apps/desktop/src/preload/index.ts` (L112-134)                                              | `safeInvoke` タイムアウト実装（参照パターン）      |
| `apps/desktop/src/preload/skill-api.ts` (L374-378)                                          | 変更対象の `safeInvoke`                            |
| `apps/desktop/src/preload/skill-api.ts` (L393-406)                                          | `safeInvokeUnwrap`（変更不要、透過的に保護される） |
| `apps/desktop/src/preload/__tests__/safeInvoke-timeout.test.ts`                             | 親タスクのテスト実装（テンプレート）               |
| `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | S19: safeInvoke timeout パターン                   |
| `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | IPC セキュリティ原則、タイムアウト設計             |
| `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                      | TASK-FIX-SAFEINVOKE-TIMEOUT-001 実装教訓           |

### 関連 Pitfall

| Pitfall ID | 内容                                            | 本タスクへの影響                                                                             |
| ---------- | ----------------------------------------------- | -------------------------------------------------------------------------------------------- |
| P13        | タイマーテストの無限ループ                      | `vi.advanceTimersByTime()` で 1 ステップずつ進める。`runAllTimers` は使用禁止                |
| P39        | happy-dom 環境での userEvent 非互換             | テスト環境が happy-dom の場合は `fireEvent` を使用（本タスクでは UI テストなしのため影響小） |
| P40        | テスト実行ディレクトリ依存（モノレポ）          | 必ず `cd apps/desktop` から実行する                                                          |
| P41        | v8 カバレッジプロバイダのインライン関数カウント | `Promise.race` 内のインライン arrow function がカバレッジに影響する可能性あり                |

### 親タスク情報

| 項目       | 値                                                    |
| ---------- | ----------------------------------------------------- |
| 親タスクID | TASK-FIX-SAFEINVOKE-TIMEOUT-001                       |
| 実装内容   | `preload/index.ts` の `safeInvoke` にタイムアウト追加 |
| テスト数   | 12 テストケース                                       |
| テスト結果 | 548 テスト全 PASS                                     |

---

## 9. 備考

### レビュー指摘の原文

TASK-FIX-SAFEINVOKE-TIMEOUT-001 Phase 10/12 再監査で以下が検出された:

> `preload/index.ts` には timeout を入れたが、`skill-api.ts` は独自 `safeInvoke` を持つため同じ保護が効いていない。skill import/remove/list 系が Main 側で停止すると Renderer は待ち続ける。共通 safeInvoke パターン導入後は派生実装の横展開漏れ監査が必要。

### 補足事項

1. **`safeInvokeUnwrap` の変更は不要**: `safeInvokeUnwrap` は L397 で `await safeInvoke<IpcResult<T>>(channel, ...args)` を呼び出しているため、`safeInvoke` にタイムアウトを追加するだけで 42 箇所の `safeInvokeUnwrap` 呼び出しが自動的に保護される

2. **共通化の検討**: `preload/index.ts` と `skill-api.ts` の `safeInvoke` を共通モジュールに抽出する選択肢がある。ただし、Preload のモジュール構成変更は影響範囲が大きいため、本タスクでは二重定義を許容し、共通化は別タスクで検討する

3. **`IPC_TIMEOUT_MS` のエクスポート**: 定数はモジュール内の private 定数として定義する（`preload/index.ts` と同じ方針）。テストでは値をハードコード（`5000`）して検証する
