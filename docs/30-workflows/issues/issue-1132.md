# [#1132] "[UT-IMP-PRELOAD-SKILL-CREATOR-API-SAFEINVOKE-TIMEOUT-001] preload/skill-creator-api.ts への safeInvoke timeout 展開"

## メタ情報

```yaml
task_id: UT-IMP-PRELOAD-SKILL-CREATOR-API-SAFEINVOKE-TIMEOUT-001
task_name: preload/skill-creator-api.ts への safeInvoke timeout 展開
category: 改善
target_feature: Skill Creator preload 境界
priority: 中
scale: 中規模
status: 未実施
source_phase: TASK-FIX-SAFEINVOKE-TIMEOUT-001 Phase 10/12 再監査
created_date: 2026-03-10
dependencies: []
spec_path: docs/30-workflows/unassigned-task/task-imp-preload-skill-creator-api-safeinvoke-timeout-001.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | 中規模 |
| ステータス | 未実施 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

親タスク TASK-FIX-SAFEINVOKE-TIMEOUT-001 で `apps/desktop/src/preload/index.ts` の `safeInvoke` に `Promise.race` + `IPC_TIMEOUT_MS = 5000` によるタイムアウト機構を追加した。しかし `apps/desktop/src/preload/skill-creator-api.ts` は **独自の `safeInvoke` 関数を L177-181 に定義** しており、`index.ts` の修正が波及しない。この独自関数はタイムアウト機構を持たず、IPC がハングした場合に Promise が永遠に pending のまま残る。

### 1.2 問題点・課題

- `skill-creator-api.ts` L177-181 の `safeInvoke` は `ipcRenderer.invoke()` をそのまま返しており、タイムアウト機構が存在しない
- この `safeInvoke` は **14箇所** で呼び出されている（detectMode, createSkill, executeTasks, validateSkill, validateSchema, improveSkill, forkSkill, shareSkill, scheduleSkill, debugSkill, generateDocs, getStats の各メソッド）
- Skill Creator の IPC 操作（スキル作成・検証・改善など）は外部処理に依存するため、Main Process 側のハンドラが応答しないケースが発生しうる
- `safeOn` 関数（L187-201）も存在するが、こちらはイベントリスナー登録用でありタイムアウトの対象外

### 1.3 放置した場合の影響

- Skill Creator 画面で create / validate / improve 等の操作を実行した際、Main Process が無応答になると **UI が永続的にローディング状態** となる
- ユーザーはアプリを強制終了するしか手段がなくなる
- `preload/index.ts` 側は保護済みのため、「safeInvoke にはタイムアウトがある」という前提でコードレビューや障害調査を行うと、`skill-creator-api.ts` の未保護箇所を見落とすリスクがある

---

## 2. 何を達成するか（What）

### 2.1 目的

`skill-creator-api.ts` の独自 `safeInvoke` に `preload/index.ts` と同一パターンのタイムアウト機構を追加し、Skill Creator 経由の全 IPC 呼び出しをタイムアウトで保護する。

### 2.2 最終ゴール

- `skill-creator-api.ts` の `safeInvoke` が `Promise.race` によるタイムアウト（5000ms）で保護されている
- タイムアウト発火時に `IpcResult<T>` の error envelope 形式（`{ success: false, error: "..." }`）でエラーが返される
- 12件以上のテストケースが追加され、全 PASS している
- 既存の Skill Creator 機能に回帰が発生していない

### 2.3 スコープ

**含む:**

- `skill-creator-api.ts` の `safeInvoke` 関数へのタイムアウト追加
- タイムアウト定数 `IPC_TIMEOUT_MS` の定義
- タイムアウト発火テスト・正常応答テスト・チャンネル拒否テストの追加
- 既存テストの回帰確認

**含まない:**

- `safeOn` 関数へのタイムアウト追加（イベントリスナーは対象外）
- `skill-api.ts` の safeInvoke 修正（別タスクで管理）
- `safeInvoke` の共通モジュール化（アーキテクチャ変更は本タスクのスコープ外）
- Main Process 側のハンドラ修正
- タイムアウト値のユーザー設定可能化

### 2.4 成果物

| 成果物                | パス                                                                   |
| --------------------- | ---------------------------------------------------------------------- |
| 修正ファイル          | `apps/desktop/src/preload/skill-creator-api.ts`                        |
| テストファイル        | `apps/desktop/src/preload/__tests__/skill-creator-api-timeout.test.ts` |
| Phase 12 ドキュメント | `docs/30-workflows/` 配下（Phase 構成に準拠）                          |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-FIX-SAFEINVOKE-TIMEOUT-001 が完了しマージ済みであること（`preload/index.ts` に参照実装が存在すること）
- `apps/desktop/src/preload/skill-creator-api.ts` の現在の実装（L177-181, L187-201）を理解していること
- `apps/desktop/src/preload/index.ts` L112-134 のタイムアウト実装パターンを理解していること

### 3.2 依存タスク

| タスクID                                  | 状態 | 依存関係                                                        |
| ----------------------------------------- | ---- | --------------------------------------------------------------- |
| TASK-FIX-SAFEINVOKE-TIMEOUT-001           | 完了 | 参照実装（`preload/index.ts` の `safeInvoke` timeout パターン） |
| TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001 | 完了 | localStorage.clear() 削除（Zustand persist 破壊問題の解消）     |

### 3.3 必要な知識

- Electron Preload プロセスの `contextBridge` / `ipcRenderer` の動作原理
- `Promise.race` によるタイムアウトパターン
- Vitest の fake timer（`vi.useFakeTimers()` / `vi.advanceTimersByTime()`）
- `IpcResult<T>` 型の error envelope パターン（`{ success: boolean, data?: T, error?: string }`）
- P13（タイマーテスト無限ループ）の回避方法

### 3.4 推奨アプローチ

1. `preload/index.ts` L112-134 の実装をそのまま `skill-creator-api.ts` に適用する
2. `IpcResult<T>` の error envelope を壊さないよう、タイムアウト時も同じ形式でエラーを返す
3. タイムアウト定数 `IPC_TIMEOUT_MS = 5000` を `skill-creator-api.ts` 内にファイルローカルで定義する（共通化は別タスク）
4. テストは `preload/index.ts` のテストパターンを踏襲し、skill-creator-api 固有のチャンネル名で検証する

**参照実装（`preload/index.ts` L112-134）:**

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

### 3.5 実装課題と解決策（親タスクからの教訓）

以下は親タスク TASK-FIX-SAFEINVOKE-TIMEOUT-001 で苦戦した5つの課題と、その解決策である。本タスクでも同様の問題が発生するため、事前に把握しておくこと。

#### 課題 1: contextBridge mock capture パターン

**問題**: Preload の `safeInvoke` は `contextBridge.exposeInMainWorld` 経由でのみアクセス可能。テストで直接 import しても contextBridge を通過しないため、タイムアウト動作の検証ができない。

**解決策**: テストで `process.contextIsolated = true` を設定して contextBridge パスを通過させる。`contextBridge.exposeInMainWorld` をモックし、第2引数（公開される API オブジェクト）をキャプチャしてテスト対象とする。

```typescript
// テストでのキャプチャパターン例
let capturedAPI: SkillCreatorAPI;
vi.mocked(contextBridge.exposeInMainWorld).mockImplementation(
  (_key: string, api: unknown) => {
    capturedAPI = api as SkillCreatorAPI;
  },
);
process.contextIsolated = true;
await import("../skill-creator-api");
// capturedAPI.createSkill(...) でテスト可能
```

**注意**: `skill-creator-api.ts` は `contextBridge.exposeInMainWorld` を直接呼び出していない（`skillCreatorAPI` を export するのみ）。呼び出し元（`index.ts` 等）で contextBridge に渡される構造の場合、テスト戦略が異なる可能性がある。実装前に `skill-creator-api.ts` の export 先を確認すること。

#### 課題 2: fake timer + module re-import の組み合わせ

**問題**: `vi.useFakeTimers()` を設定した後にモジュールを再 import すると、モジュール内の `setTimeout` が fake timer に差し替わる。しかし import 順序を誤ると real timer が使用され、`vi.advanceTimersByTime()` が効かない。

**解決策**: 以下の順序を厳守する（P13 準拠）。

1. `vi.useFakeTimers()` を呼び出す
2. `vi.resetModules()` でモジュールキャッシュをクリアする
3. API キャプチャ変数をリセットする
4. `await import("../skill-creator-api")` で再 import する

```typescript
beforeEach(async () => {
  vi.useFakeTimers();
  vi.resetModules();
  capturedAPI = undefined;
  await import("../skill-creator-api");
});

afterEach(() => {
  vi.useRealTimers();
});
```

**P13 注意**: `vi.runAllTimers()` は setTimeout + Promise + 再スケジュールのパターンで無限ループする。必ず `vi.advanceTimersByTime(5000)` で1ステップずつ進めること。

#### 課題 3: Promise.race でのメモリリーク判断

**問題**: `Promise.race` で正常応答が先に resolve した場合、タイムアウト用の `setTimeout` がクリアされずにメモリに残る。`clearTimeout` を追加すべきかの判断が必要。

**解決策**: IPC_TIMEOUT_MS が短い（5000ms 以下）場合、`clearTimeout` によるメモリリーク防止は不要。UI 頻度の IPC 呼び出しでは setTimeout が自然消滅するまでの時間が十分短いため、コードのシンプルさを優先する。親タスクと同じ判断を踏襲すること。

#### 課題 4: Write ツールが新規ファイル作成を拒否する場合

**問題**: Claude Code の Write ツールが新規テストファイルの作成を拒否するケースがある。

**解決策**: `mkdir -p` + heredoc パターンで Bash ツール経由でファイルを作成する。

```bash
mkdir -p apps/desktop/src/preload/__tests__
cat > apps/desktop/src/preload/__tests__/skill-creator-api-timeout.test.ts << 'EOF'
// テストコード
EOF
```

#### 課題 5: カバレッジ計測の scope 問題

**問題**: モノレポ環境では `vitest --coverage` のスコープが正しく設定されず、対象ファイルのカバレッジが計測されないことがある（P40 準拠）。

**解決策**: モノレポではファイル単体のパス網羅分析で代替する。テスト実行は必ず `apps/desktop/` ディレクトリから行うこと。

```bash
cd apps/desktop && pnpm vitest run src/preload/__tests__/skill-creator-api-timeout.test.ts
```

---

## 4. 実行手順

### Phase 4: テスト作成

1. `apps/desktop/src/preload/__tests__/skill-creator-api-timeout.test.ts` を作成する
2. 以下のテストケースを含める:
   - 正常応答テスト: 各 IPC チャンネル（detectMode, createSkill, executeTasks, validateSkill, validateSchema, improveSkill, forkSkill, shareSkill, scheduleSkill, debugSkill, generateDocs, getStats）が正常に応答を返すこと
   - タイムアウト発火テスト: IPC が応答しない場合に 5000ms 後にタイムアウトエラーが reject されること
   - エラーメッセージ検証: タイムアウトエラーに対象チャンネル名とタイムアウト値が含まれること
   - チャンネル拒否テスト: `ALLOWED_INVOKE_CHANNELS` に含まれないチャンネルが拒否されること
   - IpcResult envelope 検証: タイムアウトエラーが `IpcResult` の error envelope 形式と互換であること
3. テストを実行し、全件 RED（失敗）であることを確認する

### Phase 5: 実装

1. `skill-creator-api.ts` L177 の手前に `IPC_TIMEOUT_MS` 定数を追加する

```typescript
/** IPC呼び出しのデフォルトタイムアウト（ミリ秒） */
const IPC_TIMEOUT_MS = 5000;
```

2. `safeInvoke` 関数（L177-181）を以下のように修正する:

```typescript
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

3. テストを実行し、全件 GREEN（成功）であることを確認する

### Phase 6: テスト拡充

1. 境界値テスト（タイムアウト直前の応答、0ms 応答）を追加する
2. 複数の safeInvoke 同時呼び出し時の独立性を検証するテストを追加する

### Phase 7: カバレッジ確認

1. `safeInvoke` 関数の全パス（正常応答パス / タイムアウトパス / チャンネル拒否パス）が網羅されていることを確認する
2. 未達の場合は Phase 6 に戻る

### Phase 9: 品質検証

1. `pnpm lint` が通ること
2. `pnpm typecheck` が通ること
3. `cd apps/desktop && pnpm vitest run` で全テストが PASS すること

### Phase 12: ドキュメント

1. `implementation-guide.md` を作成する
2. システム仕様書（`security-electron-ipc.md` 等）を更新する
3. `documentation-changelog.md` を作成する
4. `unassigned-task-report.md` を作成する（0件でも必須）

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `skill-creator-api.ts` の `safeInvoke` に `Promise.race` + `IPC_TIMEOUT_MS = 5000` が実装されている
- [ ] タイムアウト発火時のエラーメッセージに対象チャンネル名とタイムアウト値（ms）が含まれている
- [ ] 14箇所の `safeInvoke` 呼び出し（detectMode 〜 getStats）が全てタイムアウトで保護されている
- [ ] `safeOn` 関数は変更されていない（タイムアウト対象外）
- [ ] チャンネルホワイトリスト拒否の動作が変更されていない

### 品質要件

- [ ] タイムアウト専用テストファイルが存在し、12件以上のテストケースが含まれている
- [ ] `cd apps/desktop && pnpm vitest run` で全テストが PASS する（548件 + 新規テスト）
- [ ] `pnpm lint` が通る
- [ ] `pnpm typecheck` が通る
- [ ] `safeInvoke` の全パス（正常応答 / タイムアウト / チャンネル拒否）がテストで網羅されている

### ドキュメント要件

- [ ] Phase 12 の全ドキュメントが作成されている
- [ ] `task-workflow.md` の残課題テーブルが更新されている
- [ ] `LOGS.md` 2ファイルが更新されている（P1/P25 対策）
- [ ] `topic-map.md` が再生成されている（P2/P27 対策）

---

## 6. 検証方法

### テストケース

| #   | テストケース                        | 期待結果                                                         |
| --- | ----------------------------------- | ---------------------------------------------------------------- |
| 1   | `safeInvoke` で正常応答が返る       | IPC の戻り値がそのまま resolve される                            |
| 2   | IPC が 5000ms 以上応答しない        | `IPC timeout: {channel} did not respond within 5000ms` で reject |
| 3   | IPC が 4999ms で応答する            | 正常応答が返る（タイムアウトしない）                             |
| 4   | 許可されていないチャンネルを指定    | `Channel {channel} is not allowed` で reject                     |
| 5   | detectMode のタイムアウト           | SKILL_CREATOR_DETECT_MODE チャンネルでタイムアウトエラー         |
| 6   | createSkill のタイムアウト          | SKILL_CREATOR_CREATE チャンネルでタイムアウトエラー              |
| 7   | executeTasks のタイムアウト         | SKILL_CREATOR_EXECUTE_TASKS チャンネルでタイムアウトエラー       |
| 8   | validateSkill の正常応答            | `IpcResult<boolean>` 形式で返る                                  |
| 9   | improveSkill の正常応答             | `IpcResult<unknown>` 形式で返る                                  |
| 10  | 複数の safeInvoke 同時呼び出し      | 各呼び出しが独立してタイムアウトする                             |
| 11  | IPC_TIMEOUT_MS の値が 5000 である   | 定数値の検証                                                     |
| 12  | safeOn はタイムアウト機構を持たない | safeOn の動作が変更されていないこと                              |

### 検証手順

```bash
# 1. テストファイル単体実行（P40 準拠: apps/desktop ディレクトリから実行）
cd apps/desktop && pnpm vitest run src/preload/__tests__/skill-creator-api-timeout.test.ts

# 2. Preload テスト全体の回帰確認
cd apps/desktop && pnpm vitest run src/preload/__tests__/

# 3. desktop パッケージ全テスト
cd apps/desktop && pnpm vitest run

# 4. Lint・型チェック
pnpm lint
pnpm typecheck
```

---

## 7. リスクと対策

| #   | リスク                                                                | 影響度 | 発生確率 | 対策                                                                            |
| --- | --------------------------------------------------------------------- | ------ | -------- | ------------------------------------------------------------------------------- |
| 1   | Skill Creator 独自の `IpcResult<T>` 戻り値契約を壊す                  | 高     | 低       | `safeInvoke` のシグネチャ・戻り値型を変更しない。タイムアウト追加のみに限定する |
| 2   | fake timer テストで無限ループ（P13）                                  | 中     | 中       | `vi.runAllTimers()` を使わず `vi.advanceTimersByTime(5000)` を使用する          |
| 3   | モジュール re-import 時にモック状態がリセットされない                 | 中     | 中       | `beforeEach` で `vi.resetModules()` + API キャプチャ変数リセットを厳守する      |
| 4   | テスト実行ディレクトリの誤り（P40）                                   | 低     | 中       | `cd apps/desktop && pnpm vitest run` で実行。プロジェクトルートからは実行しない |
| 5   | `ALLOWED_INVOKE_CHANNELS` に skill-creator チャンネルが含まれていない | 高     | 低       | テスト前に `channels.ts` で SKILL*CREATOR*\* チャンネルの登録を確認する         |
| 6   | 将来の safeInvoke 共通化で二重修正が発生する                          | 低     | 中       | 本タスクではファイルローカル定義に留め、共通化は別タスクとして管理する          |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント                            | パス                                                                                        | 参照箇所                                                  |
| --------------------------------------- | ------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| 参照実装（タイムアウト付き safeInvoke） | `apps/desktop/src/preload/index.ts` L112-134                                                | `Promise.race` パターンの実装                             |
| 修正対象ファイル                        | `apps/desktop/src/preload/skill-creator-api.ts` L177-181                                    | タイムアウトなしの `safeInvoke`                           |
| チャンネル定義                          | `apps/desktop/src/preload/channels.ts`                                                      | `ALLOWED_INVOKE_CHANNELS`, `IPC_CHANNELS.SKILL_CREATOR_*` |
| safeInvoke timeout パターン（S19）      | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 実装パターンの正本                                        |
| IPC セキュリティ原則                    | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | タイムアウト設計の指針                                    |
| 実装教訓                                | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                      | TASK-FIX-SAFEINVOKE-TIMEOUT-001 の教訓                    |

### 関連 Pitfall

| ID  | タイトル                                    | 本タスクへの影響                                 |
| --- | ------------------------------------------- | ------------------------------------------------ |
| P13 | タイマーテストの無限ループ                  | `vi.advanceTimersByTime()` で1ステップずつ進める |
| P39 | happy-dom 環境での userEvent 非互換         | Preload テストでは DOM 不要のため影響なし        |
| P40 | テスト実行ディレクトリ依存（モノレポ）      | `apps/desktop/` から実行すること                 |
| P43 | Phase 12 サブエージェントの rate limit 中断 | 仕様書更新は3ファイル以下/エージェントに分割     |

---

## 9. 備考

### レビュー指摘の原文

> TASK-FIX-SAFEINVOKE-TIMEOUT-001 Phase 10 最終レビュー / Phase 12 再監査にて検出:
> `apps/desktop/src/preload/skill-creator-api.ts` は独自の `safeInvoke` を L177-181 に定義しており、`preload/index.ts` のタイムアウト修正が波及しない。14箇所の IPC 呼び出しがタイムアウト未保護のまま残存している。

### skill-api.ts との分離管理について

`skill-api.ts`（スキルインポート・削除・一覧取得）と `skill-creator-api.ts`（スキル作成・検証・改善・フォーク等）は責務が異なるため、未タスクを分離管理している。`skill-api.ts` への safeInvoke timeout 展開が必要な場合は、別途未タスク指示書を作成すること。

### safeInvoke 呼び出し箇所一覧（14箇所）

| #     | メソッド名                       | IPC チャンネル                               | 行番号（目安） |
| ----- | -------------------------------- | -------------------------------------------- | -------------- |
| 1     | detectMode                       | `IPC_CHANNELS.SKILL_CREATOR_DETECT_MODE`     | L209           |
| 2     | createSkill                      | `IPC_CHANNELS.SKILL_CREATOR_CREATE`          | L212           |
| 3     | executeTasks                     | `IPC_CHANNELS.SKILL_CREATOR_EXECUTE_TASKS`   | L217           |
| 4     | validateSkill                    | `IPC_CHANNELS.SKILL_CREATOR_VALIDATE`        | L220           |
| 5     | validateSchema                   | `IPC_CHANNELS.SKILL_CREATOR_VALIDATE_SCHEMA` | L226           |
| 6     | improveSkill                     | `IPC_CHANNELS.SKILL_CREATOR_IMPROVE`         | L235           |
| 7     | forkSkill                        | `IPC_CHANNELS.SKILL_CREATOR_FORK`            | L242           |
| 8     | shareSkill                       | `IPC_CHANNELS.SKILL_CREATOR_SHARE`           | L249           |
| 9     | scheduleSkill                    | `IPC_CHANNELS.SKILL_CREATOR_SCHEDULE`        | L255           |
| 10    | debugSkill                       | `IPC_CHANNELS.SKILL_CREATOR_DEBUG`           | L261           |
| 11    | generateDocs                     | `IPC_CHANNELS.SKILL_CREATOR_GENERATE_DOCS`   | L268           |
| 12    | getStats                         | `IPC_CHANNELS.SKILL_CREATOR_STATS`           | L278           |
| 13-14 | （上記のうち複数引数を持つもの） | 同上                                         | 同上           |

**補足**: 実際の呼び出し箇所は12メソッド内の `safeInvoke` 呼び出しであり、各メソッドが1回ずつ呼び出す構造。`safeOn` は `onProgress`（L282）の1箇所のみで使用されており、タイムアウトの対象外。
