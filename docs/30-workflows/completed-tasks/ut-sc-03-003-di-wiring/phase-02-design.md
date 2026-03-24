# Phase 2: 設計

## メタ情報

| 項目       | 値                         |
| ---------- | -------------------------- |
| Phase      | 2                          |
| タスクID   | UT-SC-03-003               |
| 親タスクID | TASK-SC-03-PLAN-LLM-PROMPT |
| 作成日     | 2026-03-23                 |

## 目的

`RuntimeSkillCreatorFacade` への `llmAdapter` / `resourceLoader` の DI 配線アーキテクチャを設計する。非同期 `LLMAdapterFactory.getAdapter()` と同期的な `track()` 登録フローの整合を、P34（Setter Injection）パターンで解決する。

## 設計概要

### アプローチ: Setter Injection + Fire-and-Forget Async

`ResourceLoader`（同期生成）はコンストラクタで即時注入し、`llmAdapter`（非同期取得）は Setter Injection で遅延注入する。

```
[起動シーケンス]
  │
  ├─ [同期] ResourceLoader を生成 → コンストラクタ注入
  ├─ [同期] RuntimeSkillCreatorFacade を生成（llmAdapter なし → graceful degradation 状態）
  ├─ [同期] registerSkillCreatorHandlers() でハンドラ登録
  │
  └─ [非同期・fire-and-forget] LLMAdapterFactory.getAdapter("anthropic")
       ├─ 成功 → facade.setLLMAdapter(adapter) → plan() が LLM 実行可能に
       └─ 失敗 → warn ログ → graceful degradation 継続
```

### 代替案の比較

| 案                       | メリット                     | デメリット                              | 採否 |
| ------------------------ | ---------------------------- | --------------------------------------- | ---- |
| A. Setter Injection      | 既存フロー変更最小、P34 準拠 | readonly を外す変更が必要               | 採用 |
| B. Deferred Construction | コンストラクタだけで完結     | ハンドラ登録時に facade が未生成の期間  | 却下 |
| C. Lazy Getter           | フィールド変更不要           | 毎回 null チェックのコスト、複雑        | 却下 |
| D. Promise Wrapper       | 既存コンストラクタ変更不要   | ハンドラ側で await 必要、全体設計に波及 | 却下 |

### 採用理由

案 A（Setter Injection）を採用する理由:

1. P34 パターンに準拠（BrowserWindow 等と同じ「外部リソース遅延注入」パターン）
2. `track()` 同期フローを壊さない
3. graceful degradation が自然に機能する（注入前はスタブ、注入後は LLM 実行）
4. 変更箇所が最小（2ファイルのみ）

## 詳細設計

### 変更 1: RuntimeSkillCreatorFacade に setLLMAdapter() を追加

**ファイル**: `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`

```typescript
export class RuntimeSkillCreatorFacade {
  private readonly resolver: RuntimePolicyResolver;
  private readonly handoffBuilder: TerminalHandoffBuilder;
  private readonly skillExecutor: SkillExecutor;
- private readonly llmAdapter?: ILLMAdapter;
+ private llmAdapter?: ILLMAdapter;          // readonly 解除（Setter Injection 対応）
  private readonly resourceLoader?: ResourceLoader;
  private readonly skillFileWriter?: SkillFileWriter;

  constructor(deps: RuntimeSkillCreatorFacadeDeps) { /* 既存のまま */ }

+ /**
+  * LLM Adapter を遅延注入する（P34: Setter Injection パターン）。
+  * LLMAdapterFactory.getAdapter() が非同期のため、コンストラクタ時点では
+  * 注入できない。注入前は graceful degradation でスタブ応答を返す。
+  */
+ setLLMAdapter(adapter: ILLMAdapter): void {
+   this.llmAdapter = adapter;
+ }
```

**変更点**:

- `private readonly llmAdapter` → `private llmAdapter`（readonly 解除）
- `setLLMAdapter(adapter: ILLMAdapter): void` メソッド追加

### 変更 2: ipc/index.ts の DI 配線

**ファイル**: `apps/desktop/src/main/ipc/index.ts`

```typescript
// --- 新規 import ---
import { LLMAdapterFactory } from "../adapters/llm/LLMAdapterFactory";
import { ResourceLoader } from "../services/skill/ResourceLoader";
import { DEFAULT_SKILL_CREATOR_PATH } from "../services/skill/constants";
// NOTE: 既存定数を使用する。独自のパス構築（path.join(process.env.HOME, ...)）は行わない。

// --- 10. Skill Creator handlers（既存セクション修正） ---
track("registerSkillCreatorHandlers", () => {
  const skillCreatorService = new SkillCreatorService();
  const skillExecutor = getSkillExecutorInstance();
  if (!skillExecutor) {
    console.warn(
      "[IPC] SkillExecutor not available, runtime skill creator handlers will stay degraded",
    );
  }
  const skillFileWriter = new SkillFileWriter(skillBasePath);
  const resourceLoader = new ResourceLoader(DEFAULT_SKILL_CREATOR_PATH);

  const runtimeSkillCreatorService = skillExecutor
    ? new RuntimeSkillCreatorFacade({
        skillExecutor,
        authKeyService,
        skillFileWriter,
        resourceLoader, // ← 同期注入（新規）
      })
    : undefined;

  // llmAdapter は非同期取得 → Setter Injection（P34 準拠）
  if (runtimeSkillCreatorService) {
    void (async () => {
      try {
        const adapter = await LLMAdapterFactory.getAdapter("anthropic");
        runtimeSkillCreatorService.setLLMAdapter(adapter);
      } catch {
        console.warn(
          "[IPC] LLMAdapter not available for skill creator, plan() will use stub response",
        );
      }
    })();
  }

  registerSkillCreatorHandlers(
    mainWindow,
    skillCreatorService,
    runtimeSkillCreatorService,
  );
});
```

### シーケンス図

```
Main Process 起動
  │
  ├── [同期] track("registerSkillCreatorHandlers", () => {
  │     ├── new SkillCreatorService()
  │     ├── getSkillExecutorInstance()
  │     ├── new SkillFileWriter(skillBasePath)
  │     ├── new ResourceLoader(DEFAULT_SKILL_CREATOR_PATH)    ← 新規
  │     ├── new RuntimeSkillCreatorFacade({ ..., resourceLoader })  ← resourceLoader 注入
  │     ├── registerSkillCreatorHandlers(...)
  │     └── void (async () => {                                ← fire-and-forget
  │           LLMAdapterFactory.getAdapter("anthropic")
  │             ├─ 成功 → facade.setLLMAdapter(adapter)
  │             └─ 失敗 → console.warn(...)
  │         })()
  │   })
  │
  ├── [非同期・バックグラウンド] LLM Adapter 取得完了
  │     → facade.llmAdapter が設定される
  │     → 以降の plan() 呼び出しで LLM が使用される
  │
  └── Renderer からの IPC 呼び出し
        ├── plan() 呼び出し（adapter 注入前） → graceful degradation（スタブ応答）
        └── plan() 呼び出し（adapter 注入後） → LLM 実行（正常応答）
```

### エラーハンドリング設計

| エラーケース                     | 処理                                         | ログレベル |
| -------------------------------- | -------------------------------------------- | ---------- |
| API キー未設定                   | getAdapter() が例外 → catch → warn ログ      | warn       |
| SecureStorage アクセス失敗       | getAdapter() が例外 → catch → warn ログ      | warn       |
| skill-creator ディレクトリ不存在 | ResourceLoader が遅延読み込み時にエラー      | plan() 内  |
| SkillExecutor 未取得             | facade 自体が生成されない → 既存の warn ログ | warn       |

### スレッドセーフティ

`setLLMAdapter()` は Node.js のシングルスレッドモデルにより、競合状態は発生しない。非同期 IIFE の resolve と IPC ハンドラの呼び出しはイベントループ上で直列化される。

## 参照資料

- Phase 1 成果物（要件定義書）
- `.claude/rules/06-known-pitfalls.md` P34（Setter Injection パターン）
- `apps/desktop/src/main/adapters/llm/LLMAdapterFactory.ts`
- `apps/desktop/src/main/services/skill/ResourceLoader.ts`
- `apps/desktop/src/main/services/skill/constants.ts`（`DEFAULT_SKILL_CREATOR_PATH` 定義元）

## 成果物

- 設計書（本ファイル）
  - Setter Injection 方式の採用理由
  - 変更 1: RuntimeSkillCreatorFacade.setLLMAdapter() 追加
  - 変更 2: ipc/index.ts の DI 配線修正
  - シーケンス図
  - エラーハンドリング設計

## 完了条件

- [ ] 非同期 DI の解決方式（Setter Injection）の採用理由を記述した
- [ ] RuntimeSkillCreatorFacade の変更箇所を明記した（readonly 解除 + setter 追加）
- [ ] ipc/index.ts の変更箇所を明記した（ResourceLoader 生成 + fire-and-forget async）
- [ ] エラーケースを網羅した（API キー未設定、SecureStorage 失敗、ディレクトリ不存在）
- [ ] スレッドセーフティを確認した

## 統合テスト連携

本Phaseで実施する統合テスト関連の作業:

- [ ] 既存テストの実行確認（`pnpm --filter @repo/desktop test`）
- [ ] DI配線に関連する既存テストの影響確認

## 多角的チェック観点（AIが判断）

| 観点               | 適用 | チェック内容                                                                         |
| ------------------ | ---- | ------------------------------------------------------------------------------------ |
| アーキテクチャ     | Yes  | DI配線がレイヤー依存方向（Main→Services）を遵守しているか                            |
| セキュリティ       | No   | 認証・認可の変更なし                                                                 |
| IPC通信            | Yes  | RuntimeSkillCreatorFacade への依存注入が IPC ハンドラ登録と整合しているか            |
| エラーハンドリング | Yes  | graceful degradation（llmAdapter/resourceLoader 未注入時のスタブ返却）が維持されるか |

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次のPhase

Phase 3: 設計レビュー
