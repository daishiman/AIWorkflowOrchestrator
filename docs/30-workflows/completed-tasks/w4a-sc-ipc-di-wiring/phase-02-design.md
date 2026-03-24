# Phase 2: 設計

## メタ情報

| 項目     | 値                     |
| -------- | ---------------------- |
| Phase    | 2                      |
| タスクID | UT-SC-05-IPC-DI-WIRING |
| 作成日   | 2026-03-23             |

## 目的

`RuntimeSkillCreatorFacade` への3依存注入の具体的な実装設計を行う。修正対象ファイルは `apps/desktop/src/main/ipc/index.ts` の1箇所のみ。

## 実行タスク

### Task 1: LLM アダプター取得戦略の決定

`LLMAdapterFactory.getAdapter(providerId)` は非同期であり、コンストラクタ内では `await` を使えない。以下の3案を評価する。

| 案  | 方式                                                  | メリット                          | デメリット                                   | API キー動的変更対応                                       |
| --- | ----------------------------------------------------- | --------------------------------- | -------------------------------------------- | ---------------------------------------------------------- |
| A   | `track()` 内を `async` にして事前取得後に注入         | Facade 側の変更不要               | API キー未設定時にハンドラ登録自体が失敗する | 非対応: ハンドラ登録時点の API キーを固定使用              |
| B   | `LLMAdapterFactory` をそのまま Facade に注入          | 遅延取得で API キー変更に追従可能 | Facade の Deps 型変更が必要                  | 対応: Factory 経由で呼び出し時点の最新 API キーを使用      |
| C   | `track()` 内で try-catch して取得、失敗時は undefined | 既存 Graceful Degradation と整合  | API キー未設定環境では LLM パスに到達しない  | 非対応: ハンドラ登録時点の API キーを固定使用（案Aと同様） |

**推奨: 案C（IIFE パターン）** を採用する。理由:

1. `RuntimeSkillCreatorFacadeDeps` の `llmAdapter` は `ILLMAdapter | undefined` として既に定義済み
2. API キー未設定環境では Graceful Degradation が正しい動作であり、P34（遅延初期化 DI）パターンに準拠する
3. Facade クラス側の型定義変更が不要

**API キー動的変更の制約**: 案C（および案A）では、`llmAdapter` はアプリ起動時の API キーで初期化される。アプリ実行中に設定画面で API キーを変更しても、`RuntimeSkillCreatorFacade` に注入済みの `llmAdapter` は更新されない。**API キー設定後にはアプリの再起動が必要**。この制約は現フェーズのスコープ外であり、動的変更対応が必要な場合は案B への移行を検討すること（未タスク化候補）。

**注意**: `track()` 関数は `fn: () => void` 型のみ受け入れる（L546）。`safeRegister()` は `registerFn()` を同期呼び出しし Promise を await しない（意味的同期要件）。`async` callback を直接渡すと `() => void` 型シグネチャを満たすが、`safeRegister` のカウント計上タイミングとハンドラ登録完了タイミングが乖離する。このため IIFE パターン（`void (async () => { ... })()`）を使用し、外側 callback を `() => void` に保持したまま内部で非同期処理を完結させる。race condition リスクは低い（Electron Main Process は BrowserWindow 作成前にハンドラ登録を完了するため）。

### Task 2: 修正箇所の設計

**修正対象**: `apps/desktop/src/main/ipc/index.ts` L891-912

**変更前**（L891-912、実コード）:

```typescript
track("registerSkillCreatorHandlers", () => {
  const skillCreatorService = new SkillCreatorService();
  const skillExecutor = getSkillExecutorInstance();
  if (!skillExecutor) {
    console.warn(
      "[IPC] SkillExecutor not available, runtime skill creator handlers will stay degraded",
    );
  }
  const skillFileWriter = new SkillFileWriter(skillBasePath);
  const runtimeSkillCreatorService = skillExecutor
    ? new RuntimeSkillCreatorFacade({
        skillExecutor,
        authKeyService,
        skillFileWriter,
      })
    : undefined;
  registerSkillCreatorHandlers(
    mainWindow,
    skillCreatorService,
    runtimeSkillCreatorService,
  );
});
```

**変更後の設計**（IIFE パターン — Phase 3 レビューで M-1 指摘に基づき修正）:

```typescript
track("registerSkillCreatorHandlers", () => {
  void (async () => {
    const skillCreatorService = new SkillCreatorService();
    const skillExecutor = getSkillExecutorInstance();
    if (!skillExecutor) {
      console.warn(
        "[IPC] SkillExecutor not available, runtime skill creator handlers will stay degraded",
      );
    }

    // LLM アダプター取得（API キー未設定時は undefined にフォールバック）
    let llmAdapter: ILLMAdapter | undefined;
    try {
      llmAdapter = await LLMAdapterFactory.getAdapter("anthropic");
    } catch {
      console.warn(
        "[IPC] LLM adapter not available (API key may not be set), skill creator LLM features will be degraded",
      );
    }

    // ResourceLoader: skill-creator リソース読み込み基盤
    const resourceLoader = new ResourceLoader(DEFAULT_SKILL_CREATOR_PATH);

    const skillFileWriter = new SkillFileWriter(skillBasePath);
    const runtimeSkillCreatorService = skillExecutor
      ? new RuntimeSkillCreatorFacade({
          skillExecutor,
          authKeyService,
          skillFileWriter,
          llmAdapter,
          resourceLoader,
          skillFileManager, // L702 で既に生成済みのインスタンスを参照
        })
      : undefined;
    registerSkillCreatorHandlers(
      mainWindow,
      skillCreatorService,
      runtimeSkillCreatorService,
    );
  })();
});
```

### Task 3: import 追加の設計

以下の import を `apps/desktop/src/main/ipc/index.ts` に追加する:

```typescript
import { LLMAdapterFactory } from "../adapters/llm/LLMAdapterFactory";
import type { ILLMAdapter } from "../adapters/llm/types";
import { ResourceLoader } from "../services/skill/ResourceLoader";
import { DEFAULT_SKILL_CREATOR_PATH } from "../services/skill/constants";
```

### Task 4: skillFileManager スコープの確認

`skillFileManager` は L701 で `const skillFileManager = new SkillFileManager()` として生成されている。この変数は `track("registerSkillFileHandlers", ...)` のクロージャスコープ内に閉じているか、外側スコープで宣言されているかを確認する必要がある。

L700-704 を確認すると:

```typescript
// Skill File handlers (TASK-9A-B)
const skillFileManager = new SkillFileManager();
track("registerSkillFileHandlers", () =>
  registerSkillFileHandlers(mainWindow, skillFileManager, skillService),
);
```

`skillFileManager` は `track()` のコールバック外で宣言されているため、同じ親関数スコープ内の L889-909 からも参照可能。変更不要。

### Task 5: IIFE パターンの採用根拠

`track()` 関数は `fn: () => void` 型のコールバックのみを受け入れる（L546）。`safeRegister()` は `registerFn()` を同期呼び出しするという意味的同期要件がある。

**問題の本質**: `safeRegister()` は登録関数を即時同期実行し、成功/失敗カウントをその場で計上することを想定している。`async` callback を直接渡すと `() => void` 型シグネチャ上は互換（`Promise<void>` は `void` に代入可能）だが、`safeRegister` がカウントを計上した時点ではハンドラ登録（`registerSkillCreatorHandlers()` の呼び出し）はまだ完了していない。これは `safeRegister` の意味的契約（登録完了後にカウント）を破る。

**結論**: IIFE パターン（`void (async () => { ... })()`）を使用し、外側の callback は `() => void` 型を維持する。IIFE 開始時点で `safeRegister` のカウントが計上されるが、実際のハンドラ登録はその後の非同期完了後となる（IIFE 開始自体を「登録試行」として扱う）。`LLMAdapterFactory.getAdapter()` はキャッシュヒット時に実質同期で返るため、実用上の遅延は無視できる。

## 参照資料

- `apps/desktop/src/main/ipc/index.ts` L698-909
- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` L46-53
- `apps/desktop/src/main/adapters/llm/LLMAdapterFactory.ts` L109-133
- `apps/desktop/src/main/services/skill/constants.ts` L64
- `.claude/rules/06-known-pitfalls.md` P34（遅延初期化 DI パターン）

## 統合テスト連携

Phase 2 は設計フェーズであり、テストコードはこの段階では作成しない。Phase 4 以降で作成するテストの設計上の留意点を以下に整理する。

| テスト対象                              | 設計上の留意点                                                                                                                  | 作成予定 Phase |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| `index.ts` IIFE パターン                | `LLMAdapterFactory.getAdapter` をモックし、成功/失敗の両ケースで `RuntimeSkillCreatorFacade` のコンストラクタ引数を検証すること | Phase 4        |
| `skillFileManager` スコープ参照         | 親スコープで宣言された `skillFileManager` がクロージャ経由で IIFE 内から正しく参照されることを確認すること                      | Phase 4        |
| `ResourceLoader` の初期化               | `DEFAULT_SKILL_CREATOR_PATH` を使用して `ResourceLoader` が生成されること                                                       | Phase 4        |
| API キー未設定時の Graceful Degradation | `getAdapter()` throw 時に `llmAdapter: undefined` で Facade が生成され、`plan()`/`improve()` がスタブ応答を返すこと             | Phase 4        |

## 多角的チェック観点（AIが判断）

本タスクは Electron Main Process の IPC 配線（DI 注入）変更であるため、以下のドメインを参照してレビューを実施する。

| ドメイン                      | 参照資料                                                       | 確認内容                                                                              |
| ----------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| IPC 通信（Main-Renderer連携） | `aiworkflow-requirements: api-ipc-agent.md`, `interfaces-*.md` | `registerSkillCreatorHandlers()` のシグネチャが変更されないこと                       |
| セキュリティ                  | `aiworkflow-requirements: security-api-electron.md`            | `LLMAdapterFactory.getAdapter()` 内の SecureStorage 経由 API キー取得が維持されること |
| アーキテクチャ                | `aiworkflow-requirements: architecture-overview.md`            | `index.ts`（IPC 層）→ `RuntimeSkillCreatorFacade`（サービス層）の依存方向が正しいこと |
| 既知の落とし穴                | `.claude/rules/06-known-pitfalls.md` P34, P54, P65             | 遅延初期化 DI、safeRegister の意味的同期要件、dead-end namespace 回避の準拠確認       |

## サブタスク管理

| サブタスクID | タスク名                              | 完了条件                                                                      | ステータス |
| ------------ | ------------------------------------- | ----------------------------------------------------------------------------- | ---------- |
| P2-T1        | LLM アダプター取得戦略の決定          | 案A/B/C を評価し案C（IIFE パターン）を採用                                    | 完了       |
| P2-T2        | 修正箇所の設計（変更前/変更後コード） | `index.ts` L891-912 の変更前/変更後コードを設計（Phase 3 M-2 で実態修正済み） | 完了       |
| P2-T3        | import 追加の設計                     | 追加する 4 import 文を列挙                                                    | 完了       |
| P2-T4        | `skillFileManager` スコープの確認     | 親スコープで宣言済みであることを確認                                          | 完了       |
| P2-T5        | IIFE パターンの採用根拠の整理         | `safeRegister` の意味的同期要件に基づく論理を明文化                           | 完了       |

## タスク100%実行確認【必須】

- [x] Task 1: 案A/B/C を評価し、API キー動的変更対応列を含めて比較した
- [x] Task 1: API キー設定後にアプリ再起動が必要という制約を明記した
- [x] Task 2: 変更前コードを実態（`skillFileWriter` 含む）に合わせて修正した（Phase 3 M-2 対応）
- [x] Task 2: IIFE パターンの変更後コードを設計した（Phase 3 M-1 対応）
- [x] Task 3: 追加 import 文 4 件を列挙した
- [x] Task 4: `skillFileManager` が親関数スコープで宣言済みであることを確認した
- [x] Task 5: IIFE パターンを `safeRegister` の意味的同期要件として論理を統一した

## 成果物

- 本仕様書（Phase 2 設計）

## 完了条件

- [x] LLM アダプター取得戦略を案C（IIFE パターン）に決定した
- [x] `apps/desktop/src/main/ipc/index.ts` の変更前/変更後コードを設計した（Phase 3 M-2 指摘で実態に合わせて修正済み）
- [x] 追加する import 文を列挙した
- [x] `skillFileManager` が親関数スコープで宣言されていることを確認した
- [x] `track()` 関数が `() => void` 型のみ受け入れることを確認し、IIFE パターンを採用した

## 次のPhase

Phase 3: 設計レビュー
