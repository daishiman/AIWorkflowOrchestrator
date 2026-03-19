# Lessons Learned（教訓集） / skill domain lessons

> 親仕様書: [lessons-learned.md](lessons-learned.md)
> 役割: skill domain lessons

## TASK-FIX-7-1: SkillService executeSkill 委譲実装

### タスク概要

| 項目       | 内容                                                            |
| ---------- | --------------------------------------------------------------- |
| タスクID   | TASK-FIX-7-1-EXECUTE-SKILL-DELEGATION                           |
| 目的       | SkillService.executeSkill() が SkillExecutor に委譲するよう変更 |
| 完了日     | 2026-02-11                                                      |
| ステータス | **完了**                                                        |

### 実装内容

| 変更内容                | ファイル           | 説明                                             |
| ----------------------- | ------------------ | ------------------------------------------------ |
| executeSkill() 委譲実装 | `SkillService.ts`  | 内部で skillExecutor.execute() を呼び出し        |
| setSkillExecutor() 追加 | `SkillService.ts`  | Setter Injection パターンで SkillExecutor を注入 |
| DI 設定                 | `skillHandlers.ts` | SkillExecutor を生成して SkillService に注入     |

### 苦戦箇所と解決策

#### 1. Setter Injection vs Constructor Injection の選択

| 項目               | 内容                                                                    |
| ------------------ | ----------------------------------------------------------------------- |
| **課題**           | SkillService のコンストラクタ時点では SkillExecutor を生成できない      |
| **原因**           | SkillExecutor は BrowserWindow を必要とし、アプリ起動後でないと生成不可 |
| **検討した選択肢** | Constructor Injection / Setter Injection / Factory Pattern              |
| **採用した解決策** | Setter Injection パターン                                               |
| **選択理由**       | 遅延初期化が必要な依存オブジェクトに適切、テスタビリティも確保可能      |

**DIパターン使い分け基準**:

| パターン              | 適用場面                                   | 例                            |
| --------------------- | ------------------------------------------ | ----------------------------- |
| Constructor Injection | 依存オブジェクトが生成時点で利用可能       | DB接続、設定オブジェクト      |
| Setter Injection      | 依存オブジェクトの生成に外部リソースが必要 | BrowserWindow、IPC ハンドラー |
| Factory Pattern       | 依存オブジェクトを動的に生成する必要がある | プラグインシステム            |

**コード例（Setter Injection パターン）**:

```typescript
// SkillService.ts
class SkillService {
  private skillExecutor: SkillExecutor | null = null;

  // Setter Injection: 遅延初期化用
  setSkillExecutor(executor: SkillExecutor): void {
    this.skillExecutor = executor;
  }

  async executeSkill(
    skillId: string,
    params?: {
      prompt?: string;
      timeout?: number;
      sessionId?: string;
      retryConfig?: SkillExecutionRequest["retryConfig"];
    },
  ): Promise<SkillExecutionResponse> {
    if (!this.skillExecutor) {
      throw new Error("SkillExecutor が初期化されていません");
    }
    const skill = await this.getSkillById(skillId);
    if (!skill) {
      throw new Error("スキルが見つかりません");
    }
    // SkillExecutionRequest を構築
    const request: SkillExecutionRequest = {
      prompt: params?.prompt ?? "",
      skillId,
      timeout: params?.timeout,
      sessionId: params?.sessionId,
      retryConfig: params?.retryConfig,
    };
    // Skill → SkillMetadata のインライン変換
    const metadata: SkillMetadata = {
      id: skill.id,
      name: skill.name,
      slug: skill.slug,
      description: skill.description,
      path: skill.path,
      triggers: skill.triggers,
      anchors: skill.anchors,
      allowedTools: skill.allowedTools,
      category: skill.category,
    };
    return this.skillExecutor.execute(request, metadata);
  }
}

// skillHandlers.ts（DI設定）
function registerSkillHandlers(
  mainWindow: BrowserWindow,
  skillService: SkillService,
  authKeyService?: IAuthKeyService,
): void {
  const skillExecutor = new SkillExecutor(
    mainWindow,
    undefined,
    authKeyService,
  );
  skillService.setSkillExecutor(skillExecutor);
  // ハンドラー登録...
}
```

**参照**: [architecture-implementation-patterns.md - Setter Injection](./architecture-implementation-patterns.md)

---

#### 2. テストモックの大規模修正

| 項目         | 内容                                                                                                                                              |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **課題**     | 既存の5つのテストファイルに mockSkillExecutor を追加する必要があった                                                                              |
| **影響範囲** | skillHandlers.test.ts, skillHandlers.execute.test.ts, skillHandlers.delegate.test.ts, skillIpc.integration.test.ts, SkillService.delegate.test.ts |
| **解決策**   | 各テストファイルに mockSkillExecutor を定義し、beforeEach でリセット                                                                              |
| **教訓**     | DI 追加時は影響範囲を事前に調査すべき                                                                                                             |

**mockSkillExecutor の標準構成**:

| メソッド            | モック定義                    | 説明               |
| ------------------- | ----------------------------- | ------------------ |
| execute             | `vi.fn()`                     | スキル実行         |
| abort               | `vi.fn()`                     | 実行中断           |
| getActiveExecutions | `vi.fn().mockReturnValue([])` | アクティブ実行一覧 |
| getExecutionStatus  | `vi.fn()`                     | 実行状態取得       |

**コード例（mockSkillExecutor）**:

```typescript
// テストファイルでの mockSkillExecutor 定義
const mockSkillExecutor = {
  execute: vi.fn(),
  abort: vi.fn(),
  getActiveExecutions: vi.fn().mockReturnValue([]),
  getExecutionStatus: vi.fn(),
};

describe("SkillService executeSkill委譲", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // mockSkillExecutor をリセット
    mockSkillExecutor.execute.mockResolvedValue({
      success: true,
      output: "test output",
    });
  });

  it("executeSkill が SkillExecutor に委譲する", async () => {
    skillService.setSkillExecutor(mockSkillExecutor);

    await skillService.executeSkill(testSkill, "test args");

    expect(mockSkillExecutor.execute).toHaveBeenCalledWith(
      expect.objectContaining({ name: testSkill.name }),
      "test args",
    );
  });
});
```

**参照**: [06-known-pitfalls.md - P21](../../../rules/06-known-pitfalls.md)

---

#### 3. Skill から SkillMetadata への型変換

| 項目       | 内容                                                                                                                                                  |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **課題**   | Skill 型から SkillMetadata 型への変換が必要                                                                                                           |
| **原因**   | SkillService は Skill 型（`lastModified` を含む）を保持するが、SkillExecutor.execute() は SkillMetadata 型（`Omit<Skill, "lastModified">`）を期待する |
| **解決策** | executeSkill() 内でインライン変換を実装（専用メソッドは不要）                                                                                         |
| **教訓**   | 使用箇所が1箇所のみの型変換は、専用メソッドに抽出せずインラインで記述する方が可読性が高い。過剰な抽象化を避けるべき                                   |

**型変換の対応関係（9フィールド）**:

`SkillMetadata` は `Omit<Skill, "lastModified">` として定義されており、`lastModified` を除くすべての Skill プロパティを含む。実際の変換では、以下の9フィールドを明示的にマッピングしている。

| Skill プロパティ | SkillMetadata プロパティ | 変換内容                           |
| ---------------- | ------------------------ | ---------------------------------- |
| id               | id                       | スキル一意識別子（パスのハッシュ） |
| name             | name                     | スキル名                           |
| slug             | slug                     | ディレクトリ名                     |
| description      | description              | 概要説明                           |
| path             | path                     | SKILL.md のファイルパス            |
| triggers         | triggers                 | Trigger キーワード配列             |
| anchors          | anchors                  | Anchor 一覧                        |
| allowedTools     | allowedTools             | 許可されたツール配列（任意）       |
| category         | category                 | カテゴリ（任意）                   |

**コード例（インライン変換）**:

```typescript
// SkillService.ts - executeSkill() 内でインライン変換
// 使用箇所が1箇所のため、専用メソッドへの抽出は過剰な抽象化と判断
const metadata: SkillMetadata = {
  id: skill.id,
  name: skill.name,
  slug: skill.slug,
  description: skill.description,
  path: skill.path,
  triggers: skill.triggers,
  anchors: skill.anchors,
  allowedTools: skill.allowedTools,
  category: skill.category,
};
return this.skillExecutor.execute(request, metadata);
```

**参照**: [interfaces-agent-sdk-executor.md - 型変換パターン](./interfaces-agent-sdk-executor.md)

---

#### 4. Phase間テスト数整合性問題

| 項目       | 内容                                                                                                                          |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------- |
| **課題**   | Phase 7/8/9/10 でテスト数が不整合（Phase 7: 38, Phase 8: 33, Phase 9: 39, Phase 10: 53）                                      |
| **原因**   | 各Phaseの成果物を独立に作成した際に、実際のテスト実行結果ではなく推定値を記載した                                             |
| **解決策** | テスト数は必ず `pnpm vitest run -- --grep "対象" --reporter=verbose` の実行結果から取得する                                   |
| **教訓**   | テスト数等の定量データは推定ではなく実測値を使用すべき。Phase間で数値が不整合な場合は、最新のテスト実行結果を正として更新する |

**不整合が発生するパターン**:

| パターン                         | 原因                                             | 防止策                                               |
| -------------------------------- | ------------------------------------------------ | ---------------------------------------------------- |
| Phase間の推定値ズレ              | 各Phaseを異なるセッションで作成                  | Phase完了時に毎回 `pnpm test` を実行して実測値を記録 |
| テスト追加/削除の未反映          | Phase 6でテスト追加後にPhase 7の数値を更新し忘れ | Phase 7（カバレッジ確認）で必ずテスト総数を再計測    |
| リファクタリングによるテスト統合 | Phase 8でテスト統合後に数値が減少                | リファクタリング後のテスト数を明示的に記録           |

**推奨ワークフロー**:

| ステップ | 処理                                                 | 成果物             |
| -------- | ---------------------------------------------------- | ------------------ |
| 1        | `pnpm vitest run --reporter=verbose 2>&1 \| tail -5` | テスト総数の実測値 |
| 2        | 実測値を Phase 成果物に記録                          | 正確なテスト数     |
| 3        | 前Phase の数値と比較し差異を説明                     | テスト数増減の根拠 |

---

#### 5. 未タスク指示書の作成漏れ

| 項目       | 内容                                                                                                                   |
| ---------- | ---------------------------------------------------------------------------------------------------------------------- |
| **課題**   | `unassigned-task-report.md` に「指示書作成済み」と記載しながら、実際の指示書ファイルを未作成                           |
| **原因**   | レポート作成と指示書作成を別々のエージェントが担当し、指示書作成が実行されなかった                                     |
| **解決策** | 未タスク管理の3ステップ（(1)指示書作成 (2)残課題テーブル登録 (3)関連仕様書リンク追加）は単一エージェントで一括実行する |
| **教訓**   | P3（未タスク管理の3ステップ不完全）の再発。チェックリストを使った物理的ファイル存在確認が必要                          |

**未タスク管理の3ステップ検証方法**:

| ステップ                  | 検証コマンド                                     | 期待結果                               |
| ------------------------- | ------------------------------------------------ | -------------------------------------- |
| 1. 指示書ファイル存在確認 | `ls docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-*.md` | 対象ファイルが存在すること             |
| 2. 残課題テーブル登録確認 | `grep "タスクID" task-workflow.md`               | 残課題テーブルにエントリが存在すること |
| 3. 関連仕様書リンク確認   | `grep "タスクID" references/*.md`                | 関連仕様書に参照リンクが存在すること   |

**再発防止策**:

| 対策                   | 説明                                                                                          |
| ---------------------- | --------------------------------------------------------------------------------------------- |
| 単一エージェント実行   | 3ステップを分割せず、1つのエージェントが一括で実行                                            |
| ファイル存在確認       | 各ステップ完了後に `ls` でファイル存在を物理的に検証                                          |
| Phase 12チェックリスト | [05-task-execution.md#Task 4](../../../rules/05-task-execution.md) のチェックリストを逐次確認 |

**参照**: [06-known-pitfalls.md - P3](../../../rules/06-known-pitfalls.md)

---

### 成果物

| 成果物                  | パス                                                                           |
| ----------------------- | ------------------------------------------------------------------------------ |
| SkillService 実装       | `apps/desktop/src/main/services/skill/SkillService.ts`                         |
| skillHandlers DI 設定   | `apps/desktop/src/main/ipc/skillHandlers.ts`                                   |
| 委譲テスト              | `apps/desktop/src/main/ipc/__tests__/skillHandlers.delegate.test.ts`           |
| SkillService 委譲テスト | `apps/desktop/src/main/services/skill/__tests__/SkillService.delegate.test.ts` |

### 関連ドキュメント更新

| ドキュメント                                                                         | 更新内容                                            |
| ------------------------------------------------------------------------------------ | --------------------------------------------------- |
| [architecture-implementation-patterns.md](./architecture-implementation-patterns.md) | Setter Injection パターン追加                       |
| [interfaces-agent-sdk-executor.md](./interfaces-agent-sdk-executor.md)               | SkillService 統合セクション追加、型変換パターン追加 |
| [06-known-pitfalls.md](../../../rules/06-known-pitfalls.md)                          | P32 追加（遅延初期化パターン選択の教訓）            |

---

## UT-STORE-HOOKS-COMPONENT-MIGRATION-001: 個別セレクタHook移行

### タスク概要

| 項目       | 内容                                                                     |
| ---------- | ------------------------------------------------------------------------ |
| タスクID   | UT-STORE-HOOKS-COMPONENT-MIGRATION-001                                   |
| 目的       | Zustand合成Store Hookを個別セレクタHookに移行し、P31無限ループを根本解決 |
| 完了日     | 2026-02-12                                                               |
| ステータス | **完了**                                                                 |

### 実装内容

| 変更内容                  | ファイル                                                        | 説明                                                                                |
| ------------------------- | --------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| 個別セレクタHook 30個追加 | `apps/desktop/src/renderer/store/index.ts`                      | LLM系12個 + Skill系15個 + AuthMode系3個                                             |
| LLMSelectorPanel移行      | `apps/desktop/src/renderer/components/llm/LLMSelectorPanel.tsx` | useLLMStore() → useLLMProviders(), useLLMFetchProviders() 等                        |
| SkillSelector移行         | `apps/desktop/src/renderer/components/skill/SkillSelector.tsx`  | useSkillStore() → useAvailableSkillsMetadata(), useRescanSkills() 等                |
| SettingsView移行          | `apps/desktop/src/renderer/views/SettingsView/index.tsx`        | useAuthModeStore() → useSetAuthMode(), useInitializeAuthMode() 等。useRefガード削除 |

### 苦戦箇所と解決策

#### 1. useStoreの参照安定性

| 項目       | 内容                                                                                                                      |
| ---------- | ------------------------------------------------------------------------------------------------------------------------- |
| **課題**   | ZustandのuseStore(selector)で返されるオブジェクトや関数の参照安定性を保証する必要があった                                 |
| **原因**   | `useAppStore(state => ({ a: state.a, b: state.b }))` は毎回新しいオブジェクトを返すため、依存配列に入れると無限ループ発生 |
| **解決策** | 各フィールドを個別のセレクタで取得し、プリミティブ値やZustandが内部的に安定させる関数参照を返すようにした                 |
| **教訓**   | Zustand Storeからの取得は「1セレクタ=1フィールド」が最も安全。オブジェクトをまとめて返すパターンは避ける                  |

**コード例（個別セレクタパターン）**:

```typescript
// store/index.ts - 個別セレクタHook（参照安定）
export const useLLMProviders = () => useAppStore((state) => state.providers);
export const useLLMFetchProviders = () =>
  useAppStore((state) => state.fetchProviders);

// コンポーネントでの使用（useRefガード不要）
const providers = useLLMProviders();
const fetchProviders = useLLMFetchProviders();

useEffect(() => {
  // fetchProvidersはZustandが内部的に安定させた参照のため、依存配列に含めても安全
  fetchProviders();
}, [fetchProviders]);
```

**参照**: [arch-state-management.md - P31対策](./arch-state-management.md), [06-known-pitfalls.md - P31](../../../rules/06-known-pitfalls.md)

---

#### 2. Phase 12チェックリスト管理

| 項目       | 内容                                                                                 |
| ---------- | ------------------------------------------------------------------------------------ |
| **課題**   | Phase 12で12項目もの更新が必要で、複数の更新漏れが発生した                           |
| **原因**   | Step 1-A〜1-D + Step 2の各サブステップを並列に管理しようとして、一部をスキップした   |
| **解決策** | documentation-changelog.mdに各Step欄を事前に空欄状態で作成し、逐次消化する方式に変更 |
| **教訓**   | Phase 12は「全Step確認前に完了と記載しない」ルールを厳守。チェックリスト駆動が必須   |

**参照**: [spec-update-workflow.md](../../task-specification-creator/references/spec-update-workflow.md), [06-known-pitfalls.md - P1, P4](../../../rules/06-known-pitfalls.md)

---

### 成果物

| 成果物                       | パス                                                                    |
| ---------------------------- | ----------------------------------------------------------------------- |
| 個別セレクタHook（30個）     | `apps/desktop/src/renderer/store/index.ts`                              |
| 参照安定性テスト（31件）     | `apps/desktop/src/renderer/store/__tests__/selectors.test.ts`           |
| 無限ループ防止テスト（40件） | `apps/desktop/src/renderer/__tests__/infinite-loop-prevention.test.tsx` |
| LLMSelectorPanel             | `apps/desktop/src/renderer/components/llm/LLMSelectorPanel.tsx`         |
| SkillSelector                | `apps/desktop/src/renderer/components/skill/SkillSelector.tsx`          |
| SettingsView                 | `apps/desktop/src/renderer/views/SettingsView/index.tsx`                |

### 関連ドキュメント更新

| ドキュメント                                                                     | 更新内容                                      |
| -------------------------------------------------------------------------------- | --------------------------------------------- |
| [arch-state-management.md](./arch-state-management.md)                           | P31対策セクションに個別セレクタ実装完了記録   |
| [06-known-pitfalls.md](../../../rules/06-known-pitfalls.md)                      | P31解決策に個別セレクタ実装完了を反映         |
| [task-workflow.md](../../task-specification-creator/references/task-workflow.md) | 完了タスクセクション追加                      |
| [patterns.md](./patterns.md)                                                     | P31対策パターンに個別セレクタ移行パターン追加 |
| [03-state-management.md](../../../rules/03-state-management.md)                  | 個別セレクタDOルール追加                      |

---

