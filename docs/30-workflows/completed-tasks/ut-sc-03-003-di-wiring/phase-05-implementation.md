# Phase 5: 実装

## メタ情報

| 項目       | 値                         |
| ---------- | -------------------------- |
| Phase      | 5                          |
| タスクID   | UT-SC-03-003               |
| 親タスクID | TASK-SC-03-PLAN-LLM-PROMPT |
| 作成日     | 2026-03-23                 |
| 前提Phase  | Phase 4（テスト作成完了）  |

## 目的

Phase 4 で作成した Red 状態のテストを Green にするために、RuntimeSkillCreatorFacade への Setter Injection パターンによる llmAdapter 遅延注入と、ipc/index.ts での ResourceLoader 生成・LLMAdapter 非同期取得の DI 配線を実装する。

## 実行タスク

### Task 1: RuntimeSkillCreatorFacade.ts の修正

対象ファイル: `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`

#### 1-1: `private readonly llmAdapter` の readonly 解除

```typescript
// 変更前（L54）
private readonly llmAdapter?: ILLMAdapter;

// 変更後
private llmAdapter?: ILLMAdapter;
```

readonly を解除する理由: Setter Injection パターン（P34 準拠）により、BrowserWindow 生成後に LLMAdapterFactory から非同期で取得した adapter を遅延注入する必要がある。ResourceLoader はコンストラクタ時点で生成可能なため readonly を維持する。

#### 1-2: setLLMAdapter() メソッドの追加

```typescript
/**
 * LLMAdapter を遅延注入する（Setter Injection）
 *
 * ipc/index.ts から fire-and-forget async で呼び出される。
 * LLMAdapterFactory.getAdapter() が非同期のため、
 * コンストラクタ時点では注入できない。
 *
 * 冪等性: 複数回呼び出した場合、最後に渡された adapter が使用される。
 *
 * @param adapter - 注入する ILLMAdapter インスタンス
 */
setLLMAdapter(adapter: ILLMAdapter): void {
  this.llmAdapter = adapter;
}
```

追加位置: コンストラクタの直後（L68 付近）。

### Task 2: ipc/index.ts の修正

対象ファイル: `apps/desktop/src/main/ipc/index.ts`

#### 2-1: import の追加

既存の import に以下を追加する:

```typescript
import { ResourceLoader } from "../services/skill/ResourceLoader";
import { DEFAULT_SKILL_CREATOR_PATH } from "../services/skill/constants";
import { LLMAdapterFactory } from "../adapters/llm/LLMAdapterFactory";
```

#### 2-2: ResourceLoader 生成と Facade コンストラクタへの注入

「10. Skill Creator handlers」セクション内の RuntimeSkillCreatorFacade 生成部分を修正する:

```typescript
import { DEFAULT_SKILL_CREATOR_PATH } from "../services/skill/constants";

// 変更前（L900-906）
const runtimeSkillCreatorService = skillExecutor
  ? new RuntimeSkillCreatorFacade({
      skillExecutor,
      authKeyService,
      skillFileWriter,
    })
  : undefined;

// 変更後
const resourceLoader = new ResourceLoader(DEFAULT_SKILL_CREATOR_PATH);
const runtimeSkillCreatorService = skillExecutor
  ? new RuntimeSkillCreatorFacade({
      skillExecutor,
      authKeyService,
      skillFileWriter,
      resourceLoader,
    })
  : undefined;
```

#### 2-3: fire-and-forget async で LLMAdapter を取得し Setter Injection

ResourceLoader 注入の直後に、LLMAdapter の非同期取得と遅延注入を追加する:

```typescript
// LLMAdapter を非同期で取得し Setter Injection（fire-and-forget）
if (runtimeSkillCreatorService) {
  void (async () => {
    try {
      const adapter = await LLMAdapterFactory.getAdapter("anthropic");
      runtimeSkillCreatorService.setLLMAdapter(adapter);
    } catch (error: unknown) {
      // Graceful degradation: LLMAdapter 取得失敗時はスタブのまま動作
      console.warn(
        "[IPC] LLMAdapter initialization failed, skill creator will use stub responses:",
        error instanceof Error ? error.message : "Unknown error",
      );
    }
  })();
}
```

fire-and-forget パターンの理由:

- LLMAdapterFactory.getAdapter() は非同期操作（APIキー取得、設定読み込みなど）
- registerAllIpcHandlers() の戻り値は同期的な IpcHandlerRegistrationResult であり、async にできない
- Facade は graceful degradation を備えているため、LLMAdapter 未注入状態でも安全に動作する

### 実装上の注意事項

1. **P42 準拠バリデーション**: 本タスクは DI 配線のみであり、文字列入力のバリデーションは不要。既存の plan() 内の P42 準拠3段バリデーション（L103-105）はそのまま維持する
2. **P54 準拠**: setLLMAdapter() は戻り値不要のため、safeRegister パターンとは別に扱う必要はない。ただし fire-and-forget async 内では try-catch で囲む
3. **P5 準拠**: setLLMAdapter() は冪等。二重呼び出しされても最後の adapter で上書きされるだけで副作用はない
4. **LLMAdapterFactory**: `apps/desktop/src/main/adapters/llm/LLMAdapterFactory.ts` に実装済み。import パスは `../adapters/llm/LLMAdapterFactory`

## 参照資料

| 資料                             | パス                                                                  |
| -------------------------------- | --------------------------------------------------------------------- |
| Phase 4 テスト設計               | `docs/30-workflows/ut-sc-03-003-di-wiring/phase-04-test-creation.md`  |
| Phase 2 設計書                   | `docs/30-workflows/ut-sc-03-003-di-wiring/phase-02-design.md`         |
| RuntimeSkillCreatorFacade 実装   | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` |
| ipc/index.ts                     | `apps/desktop/src/main/ipc/index.ts`                                  |
| ResourceLoader 実装              | `apps/desktop/src/main/services/skill/ResourceLoader.ts`              |
| ILLMAdapter 型定義               | `apps/desktop/src/main/adapters/llm/types.ts`                         |
| P34: Setter Injection パターン   | `.claude/rules/06-known-pitfalls.md`                                  |
| P54: safeRegister パターン不適合 | `.claude/rules/06-known-pitfalls.md`                                  |
| P5: リスナー二重登録防止         | `.claude/rules/06-known-pitfalls.md`                                  |

## 成果物

| 成果物                                 | パス                                                                  |
| -------------------------------------- | --------------------------------------------------------------------- |
| RuntimeSkillCreatorFacade.ts（修正後） | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` |
| ipc/index.ts（修正後）                 | `apps/desktop/src/main/ipc/index.ts`                                  |

## 完了条件

- [ ] RuntimeSkillCreatorFacade.ts の `llmAdapter` フィールドから `readonly` が除去されている
- [ ] RuntimeSkillCreatorFacade.ts に `setLLMAdapter(adapter: ILLMAdapter): void` メソッドが追加されている
- [ ] ipc/index.ts に ResourceLoader の import が追加されている
- [ ] ipc/index.ts で `DEFAULT_SKILL_CREATOR_PATH`（`../services/skill/constants` から import）を使用して ResourceLoader がインスタンス化され、Facade コンストラクタの `deps.resourceLoader` に渡されている
- [ ] ipc/index.ts で fire-and-forget async により LLMAdapter が取得・setLLMAdapter で注入されている
- [ ] fire-and-forget async の失敗時に console.warn でログ出力し、例外が外部に伝播しないこと
- [ ] Phase 4 で作成した全テスト（TC-1 ~ TC-6）が Green 状態であること
- [ ] 既存テスト（RuntimeSkillCreatorFacade.test.ts, .plan.test.ts, skillCreatorHandlers.runtime.test.ts）が全て PASS すること
- [ ] `pnpm typecheck` が PASS すること

## 統合テスト連携

本Phaseで実施する統合テスト関連の作業:

- [ ] DI配線に関連する既存テストが引き続きPASSすることを確認
- [ ] 新規追加テストが既存テストと干渉しないことを確認

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

Phase 6: テスト拡充 (`phase-06-test-expansion.md`)
