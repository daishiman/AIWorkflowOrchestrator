# Lessons Learned（教訓集）

> **相対パス**: `references/lessons-learned.md`
> **読み込み条件**: 実装タスク開始時、または類似課題に遭遇した場合

---

## メタ情報

| 項目 | 値 |
|------|---|
| 正本 | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` |
| 目的 | タスク実行時の苦戦箇所と解決策を記録し、将来の開発効率を向上 |
| スコープ | 実装過程で遭遇した課題、解決策、コード例 |
| 対象読者 | AIWorkflowOrchestrator 開発者 |

---

## 変更履歴

| 日付 | バージョン | 変更内容 |
|------|-----------|----------|
| 2026-02-13 | 1.6.0 | UT-FIX-AGENTVIEW-INFINITE-LOOP-001 テスト環境教訓3件追加（happy-dom/userEvent非互換、テスト実行ディレクトリ依存、jsdom切替副作用） |
| 2026-02-12 | 1.5.1 | UT-STORE-HOOKS-TEST-REFACTOR-001 苦戦箇所5・6追加（Phase 12 Step 2誤判定、実装ガイドテストカテゴリテーブル不整合） |
| 2026-02-12 | 1.5.0 | UT-STORE-HOOKS-TEST-REFACTOR-001 教訓追加（renderHookパターン移行、テストヘルパー共通化、electronAPIモック統一） |
| 2026-02-12 | 1.4.0 | UT-STORE-HOOKS-COMPONENT-MIGRATION-001 教訓追加（個別セレクタ移行、Phase 12チェックリスト管理） |
| 2026-02-12 | 1.3.1 | TASK-9B-H: 苦戦箇所の教訓5-8を追加（Phase 12暗黙的要件、artifacts.json全Phase更新、設計書-実装乖離管理、複数エージェント並列時の仕様書更新漏れ） |
| 2026-02-12 | 1.3.0 | 苦戦箇所1・3のコード例を実際の実装と整合するよう修正（架空のversion/authorフィールド削除、executeSkillシグネチャ修正） |
| 2026-02-12 | 1.2.1 | TASK-9B-H: SkillCreatorService IPCハンドラー登録の教訓追加（Preload統合漏れ、並列Phase実行、IPC型定義配置、artifacts.jsonステータス管理） |
| 2026-02-12 | 1.2.0 | TASK-FIX-7-1 追加苦戦箇所2件記録（Phase間テスト数整合性問題、未タスク指示書作成漏れ） |
| 2026-02-11 | 1.1.0 | テンプレート準拠、目次・コード例追加 |
| 2026-02-11 | 1.0.0 | 初版作成（TASK-FIX-7-1 苦戦箇所記録） |

---

## 目次

1. [TASK-FIX-7-1: SkillService executeSkill 委譲実装](#task-fix-7-1-skillservice-executeskill-委譲実装)
   - [苦戦箇所1: Setter Injection vs Constructor Injection](#1-setter-injection-vs-constructor-injection-の選択)
   - [苦戦箇所2: テストモックの大規模修正](#2-テストモックの大規模修正)
   - [苦戦箇所3: 型変換](#3-skill-から-skillmetadata-への型変換)
   - [苦戦箇所4: Phase間テスト数整合性問題](#4-phase間テスト数整合性問題)
   - [苦戦箇所5: 未タスク指示書の作成漏れ](#5-未タスク指示書の作成漏れ)
2. [UT-STORE-HOOKS-COMPONENT-MIGRATION-001: 個別セレクタHook移行](#ut-store-hooks-component-migration-001-個別セレクタhook移行)
   - [苦戦箇所1: useStoreの参照安定性](#1-usestoreの参照安定性)
   - [苦戦箇所2: Phase 12チェックリスト管理](#2-phase-12チェックリスト管理)
3. [TASK-9B-H: SkillCreatorService IPCハンドラー登録](#task-9b-h-skillcreatorservice-ipcハンドラー登録)
   - [教訓1: Preload統合の漏れ防止](#1-preload統合の漏れ防止)
   - [教訓2: 並列Phase実行時のレビュータイミング](#2-並列phase実行時のレビュータイミング)
   - [教訓3: IPC型定義の配置戦略](#3-ipc型定義の配置戦略)
   - [教訓4: artifacts.jsonのPhaseステータス管理](#4-artifactsjsonのphaseステータス管理)
   - [教訓5: Phase 12の暗黙的要件の見落とし](#5-phase-12の暗黙的要件の見落とし)
   - [教訓6: artifacts.jsonのPhase別ステータス更新忘れ](#6-artifactsjsonのphase別ステータス更新忘れ)
   - [教訓7: 設計書と実装の乖離管理](#7-設計書と実装の乖離管理)
   - [教訓8: 複数エージェント並列実行時のシステム仕様書更新漏れ](#8-複数エージェント並列実行時のシステム仕様書更新漏れ)
4. [UT-FIX-AGENTVIEW-INFINITE-LOOP-001: AgentView無限ループ修正テスト](#ut-fix-agentview-infinite-loop-001-agentview無限ループ修正テスト)
   - [苦戦箇所1: happy-dom環境でのuserEvent非互換](#1-happy-dom環境でのuserevent非互換)
   - [苦戦箇所2: テスト実行ディレクトリ依存問題](#2-テスト実行ディレクトリ依存問題)
   - [苦戦箇所3: jsdom切り替え時の副作用](#3-jsdom切り替え時の副作用)
4. [関連ドキュメント](#関連ドキュメント)
5. [テンプレート（新規教訓追加用）](#テンプレート新規教訓追加用)
3. [UT-STORE-HOOKS-TEST-REFACTOR-001: renderHookパターン移行](#ut-store-hooks-test-refactor-001-renderhookパターン移行)
   - [苦戦箇所1: renderHookへの移行効果](#1-renderhookへの移行効果)
   - [苦戦箇所2: テストヘルパー関数の共通化](#2-テストヘルパー関数の共通化)
   - [苦戦箇所3: electronAPIモックの統一](#3-electronapiモックの統一)
   - [苦戦箇所4: 移行中のテスト数増加](#4-移行中のテスト数増加)
   - [苦戦箇所5: Phase 12 Step 2 の「該当なし」誤判定](#5-phase-12-step-2-の該当なし誤判定)
   - [苦戦箇所6: 実装ガイドのテストカテゴリテーブル不整合](#6-実装ガイドのテストカテゴリテーブル不整合)
4. [関連ドキュメント](#関連ドキュメント)
5. [テンプレート（新規教訓追加用）](#テンプレート新規教訓追加用)

---

## 関連ドキュメント

| ドキュメント | 目的 | パス |
|--------------|------|------|
| architecture-implementation-patterns.md | 実装パターン集（DIパターン等） | [./architecture-implementation-patterns.md](./architecture-implementation-patterns.md) |
| interfaces-agent-sdk-executor.md | SkillExecutor インターフェース仕様 | [./interfaces-agent-sdk-executor.md](./interfaces-agent-sdk-executor.md) |
| 06-known-pitfalls.md | 既知の落とし穴と防止策 | [../../../rules/06-known-pitfalls.md](../../../rules/06-known-pitfalls.md) |

---

## TASK-FIX-7-1: SkillService executeSkill 委譲実装

### タスク概要

| 項目 | 内容 |
|------|------|
| タスクID | TASK-FIX-7-1-EXECUTE-SKILL-DELEGATION |
| 目的 | SkillService.executeSkill() が SkillExecutor に委譲するよう変更 |
| 完了日 | 2026-02-11 |
| ステータス | **完了** |

### 実装内容

| 変更内容 | ファイル | 説明 |
|----------|----------|------|
| executeSkill() 委譲実装 | `SkillService.ts` | 内部で skillExecutor.execute() を呼び出し |
| setSkillExecutor() 追加 | `SkillService.ts` | Setter Injection パターンで SkillExecutor を注入 |
| DI 設定 | `skillHandlers.ts` | SkillExecutor を生成して SkillService に注入 |

### 苦戦箇所と解決策

#### 1. Setter Injection vs Constructor Injection の選択

| 項目 | 内容 |
|------|------|
| **課題** | SkillService のコンストラクタ時点では SkillExecutor を生成できない |
| **原因** | SkillExecutor は BrowserWindow を必要とし、アプリ起動後でないと生成不可 |
| **検討した選択肢** | Constructor Injection / Setter Injection / Factory Pattern |
| **採用した解決策** | Setter Injection パターン |
| **選択理由** | 遅延初期化が必要な依存オブジェクトに適切、テスタビリティも確保可能 |

**DIパターン使い分け基準**:

| パターン | 適用場面 | 例 |
|----------|----------|-----|
| Constructor Injection | 依存オブジェクトが生成時点で利用可能 | DB接続、設定オブジェクト |
| Setter Injection | 依存オブジェクトの生成に外部リソースが必要 | BrowserWindow、IPC ハンドラー |
| Factory Pattern | 依存オブジェクトを動的に生成する必要がある | プラグインシステム |

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
      retryConfig?: SkillExecutionRequest['retryConfig'];
    },
  ): Promise<SkillExecutionResponse> {
    if (!this.skillExecutor) {
      throw new Error('SkillExecutor が初期化されていません');
    }
    const skill = await this.getSkillById(skillId);
    if (!skill) {
      throw new Error('スキルが見つかりません');
    }
    // SkillExecutionRequest を構築
    const request: SkillExecutionRequest = {
      prompt: params?.prompt ?? '',
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
function registerSkillHandlers(mainWindow: BrowserWindow, skillService: SkillService): void {
  const skillExecutor = new SkillExecutor(mainWindow);
  skillService.setSkillExecutor(skillExecutor);
  // ハンドラー登録...
}
```

**参照**: [architecture-implementation-patterns.md - Setter Injection](./architecture-implementation-patterns.md)

---

#### 2. テストモックの大規模修正

| 項目 | 内容 |
|------|------|
| **課題** | 既存の5つのテストファイルに mockSkillExecutor を追加する必要があった |
| **影響範囲** | skillHandlers.test.ts, skillHandlers.execute.test.ts, skillHandlers.delegate.test.ts, skillIpc.integration.test.ts, SkillService.delegate.test.ts |
| **解決策** | 各テストファイルに mockSkillExecutor を定義し、beforeEach でリセット |
| **教訓** | DI 追加時は影響範囲を事前に調査すべき |

**mockSkillExecutor の標準構成**:

| メソッド | モック定義 | 説明 |
|----------|-----------|------|
| execute | `vi.fn()` | スキル実行 |
| abort | `vi.fn()` | 実行中断 |
| getActiveExecutions | `vi.fn().mockReturnValue([])` | アクティブ実行一覧 |
| getExecutionStatus | `vi.fn()` | 実行状態取得 |

**コード例（mockSkillExecutor）**:

```typescript
// テストファイルでの mockSkillExecutor 定義
const mockSkillExecutor = {
  execute: vi.fn(),
  abort: vi.fn(),
  getActiveExecutions: vi.fn().mockReturnValue([]),
  getExecutionStatus: vi.fn(),
};

describe('SkillService executeSkill委譲', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // mockSkillExecutor をリセット
    mockSkillExecutor.execute.mockResolvedValue({
      success: true,
      output: 'test output',
    });
  });

  it('executeSkill が SkillExecutor に委譲する', async () => {
    skillService.setSkillExecutor(mockSkillExecutor);

    await skillService.executeSkill(testSkill, 'test args');

    expect(mockSkillExecutor.execute).toHaveBeenCalledWith(
      expect.objectContaining({ name: testSkill.name }),
      'test args'
    );
  });
});
```

**参照**: [06-known-pitfalls.md - P21](../../../rules/06-known-pitfalls.md)

---

#### 3. Skill から SkillMetadata への型変換

| 項目 | 内容 |
|------|------|
| **課題** | Skill 型から SkillMetadata 型への変換が必要 |
| **原因** | SkillService は Skill 型（`lastModified` を含む）を保持するが、SkillExecutor.execute() は SkillMetadata 型（`Omit<Skill, "lastModified">`）を期待する |
| **解決策** | executeSkill() 内でインライン変換を実装（専用メソッドは不要） |
| **教訓** | 使用箇所が1箇所のみの型変換は、専用メソッドに抽出せずインラインで記述する方が可読性が高い。過剰な抽象化を避けるべき |

**型変換の対応関係（9フィールド）**:

`SkillMetadata` は `Omit<Skill, "lastModified">` として定義されており、`lastModified` を除くすべての Skill プロパティを含む。実際の変換では、以下の9フィールドを明示的にマッピングしている。

| Skill プロパティ | SkillMetadata プロパティ | 変換内容 |
|-----------------|-------------------------|----------|
| id | id | スキル一意識別子（パスのハッシュ） |
| name | name | スキル名 |
| slug | slug | ディレクトリ名 |
| description | description | 概要説明 |
| path | path | SKILL.md のファイルパス |
| triggers | triggers | Trigger キーワード配列 |
| anchors | anchors | Anchor 一覧 |
| allowedTools | allowedTools | 許可されたツール配列（任意） |
| category | category | カテゴリ（任意） |

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

| 項目 | 内容 |
|------|------|
| **課題** | Phase 7/8/9/10 でテスト数が不整合（Phase 7: 38, Phase 8: 33, Phase 9: 39, Phase 10: 53） |
| **原因** | 各Phaseの成果物を独立に作成した際に、実際のテスト実行結果ではなく推定値を記載した |
| **解決策** | テスト数は必ず `pnpm vitest run -- --grep "対象" --reporter=verbose` の実行結果から取得する |
| **教訓** | テスト数等の定量データは推定ではなく実測値を使用すべき。Phase間で数値が不整合な場合は、最新のテスト実行結果を正として更新する |

**不整合が発生するパターン**:

| パターン | 原因 | 防止策 |
|----------|------|--------|
| Phase間の推定値ズレ | 各Phaseを異なるセッションで作成 | Phase完了時に毎回 `pnpm test` を実行して実測値を記録 |
| テスト追加/削除の未反映 | Phase 6でテスト追加後にPhase 7の数値を更新し忘れ | Phase 7（カバレッジ確認）で必ずテスト総数を再計測 |
| リファクタリングによるテスト統合 | Phase 8でテスト統合後に数値が減少 | リファクタリング後のテスト数を明示的に記録 |

**推奨ワークフロー**:

| ステップ | 処理 | 成果物 |
|----------|------|--------|
| 1 | `pnpm vitest run --reporter=verbose 2>&1 \| tail -5` | テスト総数の実測値 |
| 2 | 実測値を Phase 成果物に記録 | 正確なテスト数 |
| 3 | 前Phase の数値と比較し差異を説明 | テスト数増減の根拠 |

---

#### 5. 未タスク指示書の作成漏れ

| 項目 | 内容 |
|------|------|
| **課題** | `unassigned-task-report.md` に「指示書作成済み」と記載しながら、実際の指示書ファイルを未作成 |
| **原因** | レポート作成と指示書作成を別々のエージェントが担当し、指示書作成が実行されなかった |
| **解決策** | 未タスク管理の3ステップ（(1)指示書作成 (2)残課題テーブル登録 (3)関連仕様書リンク追加）は単一エージェントで一括実行する |
| **教訓** | P3（未タスク管理の3ステップ不完全）の再発。チェックリストを使った物理的ファイル存在確認が必要 |

**未タスク管理の3ステップ検証方法**:

| ステップ | 検証コマンド | 期待結果 |
|----------|-------------|----------|
| 1. 指示書ファイル存在確認 | `ls docs/30-workflows/unassigned-task/task-*.md` | 対象ファイルが存在すること |
| 2. 残課題テーブル登録確認 | `grep "タスクID" task-workflow.md` | 残課題テーブルにエントリが存在すること |
| 3. 関連仕様書リンク確認 | `grep "タスクID" references/*.md` | 関連仕様書に参照リンクが存在すること |

**再発防止策**:

| 対策 | 説明 |
|------|------|
| 単一エージェント実行 | 3ステップを分割せず、1つのエージェントが一括で実行 |
| ファイル存在確認 | 各ステップ完了後に `ls` でファイル存在を物理的に検証 |
| Phase 12チェックリスト | [05-task-execution.md#Task 4](../../../rules/05-task-execution.md) のチェックリストを逐次確認 |

**参照**: [06-known-pitfalls.md - P3](../../../rules/06-known-pitfalls.md)

---

### 成果物

| 成果物 | パス |
|--------|------|
| SkillService 実装 | `apps/desktop/src/main/services/skill/SkillService.ts` |
| skillHandlers DI 設定 | `apps/desktop/src/main/ipc/skillHandlers.ts` |
| 委譲テスト | `apps/desktop/src/main/ipc/__tests__/skillHandlers.delegate.test.ts` |
| SkillService 委譲テスト | `apps/desktop/src/main/services/skill/__tests__/SkillService.delegate.test.ts` |

### 関連ドキュメント更新

| ドキュメント | 更新内容 |
|--------------|----------|
| [architecture-implementation-patterns.md](./architecture-implementation-patterns.md) | Setter Injection パターン追加 |
| [interfaces-agent-sdk-executor.md](./interfaces-agent-sdk-executor.md) | SkillService 統合セクション追加、型変換パターン追加 |
| [06-known-pitfalls.md](../../../rules/06-known-pitfalls.md) | P32 追加（遅延初期化パターン選択の教訓） |

---

## UT-STORE-HOOKS-COMPONENT-MIGRATION-001: 個別セレクタHook移行

### タスク概要

| 項目 | 内容 |
|------|------|
| タスクID | UT-STORE-HOOKS-COMPONENT-MIGRATION-001 |
| 目的 | Zustand合成Store Hookを個別セレクタHookに移行し、P31無限ループを根本解決 |
| 完了日 | 2026-02-12 |
| ステータス | **完了** |

### 実装内容

| 変更内容 | ファイル | 説明 |
|----------|----------|------|
| 個別セレクタHook 30個追加 | `apps/desktop/src/renderer/store/index.ts` | LLM系12個 + Skill系15個 + AuthMode系3個 |
| LLMSelectorPanel移行 | `apps/desktop/src/renderer/components/llm/LLMSelectorPanel.tsx` | useLLMStore() → useLLMProviders(), useLLMFetchProviders() 等 |
| SkillSelector移行 | `apps/desktop/src/renderer/components/skill/SkillSelector.tsx` | useSkillStore() → useAvailableSkillsMetadata(), useRescanSkills() 等 |
| SettingsView移行 | `apps/desktop/src/renderer/views/SettingsView/index.tsx` | useAuthModeStore() → useSetAuthMode(), useInitializeAuthMode() 等。useRefガード削除 |

### 苦戦箇所と解決策

#### 1. useStoreの参照安定性

| 項目 | 内容 |
|------|------|
| **課題** | ZustandのuseStore(selector)で返されるオブジェクトや関数の参照安定性を保証する必要があった |
| **原因** | `useAppStore(state => ({ a: state.a, b: state.b }))` は毎回新しいオブジェクトを返すため、依存配列に入れると無限ループ発生 |
| **解決策** | 各フィールドを個別のセレクタで取得し、プリミティブ値やZustandが内部的に安定させる関数参照を返すようにした |
| **教訓** | Zustand Storeからの取得は「1セレクタ=1フィールド」が最も安全。オブジェクトをまとめて返すパターンは避ける |

**コード例（個別セレクタパターン）**:

```typescript
// store/index.ts - 個別セレクタHook（参照安定）
export const useLLMProviders = () => useAppStore((state) => state.providers);
export const useLLMFetchProviders = () => useAppStore((state) => state.fetchProviders);

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

| 項目 | 内容 |
|------|------|
| **課題** | Phase 12で12項目もの更新が必要で、複数の更新漏れが発生した |
| **原因** | Step 1-A〜1-D + Step 2の各サブステップを並列に管理しようとして、一部をスキップした |
| **解決策** | documentation-changelog.mdに各Step欄を事前に空欄状態で作成し、逐次消化する方式に変更 |
| **教訓** | Phase 12は「全Step確認前に完了と記載しない」ルールを厳守。チェックリスト駆動が必須 |

**参照**: [spec-update-workflow.md](../../task-specification-creator/references/spec-update-workflow.md), [06-known-pitfalls.md - P1, P4](../../../rules/06-known-pitfalls.md)

---

### 成果物

| 成果物 | パス |
|--------|------|
| 個別セレクタHook（30個） | `apps/desktop/src/renderer/store/index.ts` |
| 参照安定性テスト（31件） | `apps/desktop/src/renderer/store/__tests__/selectors.test.ts` |
| 無限ループ防止テスト（40件） | `apps/desktop/src/renderer/__tests__/infinite-loop-prevention.test.tsx` |
| LLMSelectorPanel | `apps/desktop/src/renderer/components/llm/LLMSelectorPanel.tsx` |
| SkillSelector | `apps/desktop/src/renderer/components/skill/SkillSelector.tsx` |
| SettingsView | `apps/desktop/src/renderer/views/SettingsView/index.tsx` |

### 関連ドキュメント更新

| ドキュメント | 更新内容 |
|--------------|----------|
| [arch-state-management.md](./arch-state-management.md) | P31対策セクションに個別セレクタ実装完了記録 |
| [06-known-pitfalls.md](../../../rules/06-known-pitfalls.md) | P31解決策に個別セレクタ実装完了を反映 |
| [task-workflow.md](../../task-specification-creator/references/task-workflow.md) | 完了タスクセクション追加 |
| [patterns.md](./patterns.md) | P31対策パターンに個別セレクタ移行パターン追加 |
| [03-state-management.md](../../../rules/03-state-management.md) | 個別セレクタDOルール追加 |

---

## TASK-9B-H: SkillCreatorService IPCハンドラー登録

> **このセクションの役割**: プロセス面の教訓（何が問題だったか、どう防止するか）を記録する。実装パターン（どう実装するか）については [architecture-implementation-patterns.md - IPC ハンドラー登録パターン](./architecture-implementation-patterns.md) を参照。

### タスク概要

| 項目 | 内容 |
|------|------|
| タスクID | TASK-9B-H-SKILL-CREATOR-IPC |
| 目的 | SkillCreatorService の IPC ハンドラー登録・Preload API 公開・セキュリティ層を実装 |
| 完了日 | 2026-02-12 |
| ステータス | **完了** |

### 実装内容

| 変更内容 | ファイル | 説明 |
|----------|----------|------|
| IPCハンドラー登録 | `skillCreatorHandlers.ts` | ipcMain.handle で5チャンネル + 進捗通知1チャンネルを登録 |
| Preload API実装 | `skill-creator-api.ts` | safeInvoke/safeOn でホワイトリスト検証付きAPI公開 |
| contextBridge統合 | `preload/index.ts` | electronAPI.skillCreator として統合公開 |
| ホワイトリスト更新 | `channels.ts` | ALLOWED_INVOKE_CHANNELS / ALLOWED_ON_CHANNELS に追加 |

### 苦戦箇所と解決策

#### 1. Preload統合の漏れ防止

| 項目 | 内容 |
|------|------|
| **課題** | skill-creator-api.ts で skillCreatorAPI を実装したが、preload/index.ts への contextBridge 統合を忘れた |
| **原因** | Preload API の新規追加時に必要な更新箇所が4箇所に分散しており、チェックリスト化されていなかった |
| **解決策** | Phase 8-9 で発見・修正。新規Preload API追加時の4箇所更新チェックリストを策定 |
| **教訓** | 新規 Preload API 追加時は以下の4箇所を必ず更新する |

**新規Preload API追加時の必須更新箇所**:

| 更新箇所 | ファイル | 内容 |
|----------|----------|------|
| 1. import追加 | `preload/index.ts` | API実装モジュールのimport |
| 2. electronAPIオブジェクト追加 | `preload/index.ts` | electronAPIオブジェクトに新APIを追加 |
| 3. contextBridge.exposeInMainWorld | `preload/index.ts` | contextBridge経由でRendererに公開 |
| 4. non-isolatedフォールバック | `preload/index.ts` | contextIsolation無効時のwindow直下フォールバック |

**参照**: [architecture-implementation-patterns.md - IPC ハンドラー登録パターン](./architecture-implementation-patterns.md)

**相互参照**: [06-known-pitfalls.md#P23 API二重定義の型管理](../../rules/06-known-pitfalls.md)（Preload API追加時の更新箇所分散に関する教訓）

---

#### 2. 並列Phase実行時のレビュータイミング

| 項目 | 内容 |
|------|------|
| **課題** | Phase 10（読み取り専用レビュー）が Phase 8-9（コード修正）と並列実行され、修正前のコードをレビューして MAJOR 判定を出した |
| **原因** | コード修正を伴う Phase とコード読み取りの Phase を並列実行した |
| **解決策** | コード修正を伴う Phase と読み取りレビュー Phase の並列実行を避ける |
| **教訓** | 並列実行する場合は修正前コードの可能性をレビュー結果に明記する |

**Phase並列実行の安全な組み合わせ**:

| 組み合わせ | 安全性 | 理由 |
|-----------|--------|------|
| Phase 1-3（要件・設計・レビュー） | 安全 | 読み取り専用の仕様書作業 |
| Phase 4-7（テスト・実装・カバレッジ） | 注意 | コード変更あり、依存関係確認必須 |
| Phase 8-9 + Phase 10 | 危険 | リファクタリング中にレビューすると修正前コードを評価してしまう |
| Phase 11 + Phase 12 | 安全 | 手動テストとドキュメントは独立 |

---

#### 3. IPC型定義の配置戦略

| 項目 | 内容 |
|------|------|
| **課題** | IpcResult<T> 型が Main 側（skillCreatorHandlers.ts）と Preload 側（skill-creator-api.ts）で重複定義された |
| **原因** | IPC 通信の両端で同じ型を使用するが、共有パッケージに配置する判断が後回しになった |
| **解決策** | 未タスク UT-9B-H-001 として登録し、@repo/shared/types に型を配置する後日対応を計画 |
| **教訓** | IPC通信で両側から参照される型は最初から @repo/shared に配置すべき |

**IPC型の配置判断基準**:

| 型の参照元 | 配置先 | 例 |
|-----------|--------|-----|
| Main側のみ | `apps/desktop/src/main/` 内 | 内部サービス型 |
| Preload側のみ | `apps/desktop/src/preload/` 内 | UI固有型 |
| Main + Preload両方 | `packages/shared/src/` | IpcResult<T>、共有レスポンス型 |
| Main + Preload + Renderer | `packages/shared/src/` | ドメイン型（Skill、Agent等） |

---

#### 4. artifacts.jsonのPhaseステータス管理

| 項目 | 内容 |
|------|------|
| **課題** | Phase完了時に artifacts.json のステータスが自動更新されず、Phase 12 のみ completed で残りが pending だった |
| **原因** | 各 Phase 完了時に artifacts.json のステータス更新が完了条件に含まれていなかった |
| **解決策** | 各 Phase 完了時に artifacts.json のステータス更新を完了条件チェックリストに追加 |
| **教訓** | Phase 完了時は成果物の作成だけでなく、artifacts.json のステータス更新も必須アクションとする |

**相互参照**: [06-known-pitfalls.md#P4 documentation-changelogへの早期完了記載](../../rules/06-known-pitfalls.md)（ステータス管理の早期完了判定に関する教訓）

---

#### 5. Phase 12の暗黙的要件の見落とし

| 項目 | 内容 |
|------|------|
| **課題** | Phase 12の成果物として仕様書に明示されていないが、P28対策としてスキルフィードバックレポートが必要だった。仕様書のチェックリストを完了しても、`.claude/rules/06-known-pitfalls.md` に記載されたP28への対処が漏れた |
| **原因** | Phase 12仕様書のチェックリストが `06-known-pitfalls.md` のPhase 12関連項目（P1-P4, P25-P28）を参照していなかった |
| **解決策** | Phase 12実行前に `06-known-pitfalls.md` のPhase 12関連項目（P1-P4, P25-P28）を全て確認するチェックステップを追加する。P28は仕様書テンプレートにTask 5として明示化すべき |
| **教訓** | Phase 12のチェックリストだけでなく、`06-known-pitfalls.md` のPhase 12関連Pitfallも完了条件に含める必要がある |

**参照**: [06-known-pitfalls.md - P28](../../../rules/06-known-pitfalls.md)

**相互参照**: [06-known-pitfalls.md#P28 スキルフィードバックレポート未作成](../../rules/06-known-pitfalls.md)（Phase 12の暗黙的成果物に関する教訓）

---

#### 6. artifacts.jsonのPhase別ステータス更新忘れ

| 項目 | 内容 |
|------|------|
| **課題** | Phase 12エージェントがPhase 12のステータスのみをcompletedに更新し、Phase 1-11はpendingのまま放置された |
| **原因** | 各Phaseの完了時にartifacts.jsonを更新する運用が確立されておらず、Phase 12エージェントが自Phase以外のステータスを確認しなかった |
| **解決策** | Phase 12仕様書の完了条件に「artifacts.jsonの全Phase（1-12）のステータスがcompletedであること」を明示する |
| **教訓** | Phase 12はプロジェクト全体のステータス整合性を確認する最終チェックポイントとして機能させる |

---

#### 7. 設計書と実装の乖離管理

| 項目 | 内容 |
|------|------|
| **課題** | Phase 2設計書で詳細に定義されたZodスキーマ、sanitizeError関数、handleWithErrorBoundaryラッパーが実装されなかった。Phase 5で実装をシンプル化したが、設計書を更新しなかったため、最終レビューで「設計-実装乖離」として検出された |
| **原因** | Phase 5（実装）で設計書の仕様を変更する判断をしたが、設計書（Phase 2成果物）を同時に更新しなかった |
| **解決策** | Phase 5（実装）で設計書の仕様を変更する場合は、同Phase内で設計書（Phase 2成果物）も更新する。「意図的なシンプル化」と「実装漏れ」を区別するため、変更理由をPhase 5成果物に記録する |
| **教訓** | 設計と実装の乖離は「意図的」であっても、設計書を更新しなければ後続レビューで「実装漏れ」と区別できない |

**設計変更時の記録フォーマット**:

| 項目 | 記載内容 |
|------|----------|
| 変更対象 | 設計書のどの仕様を変更したか |
| 変更理由 | シンプル化、パフォーマンス最適化、スコープ縮小 等 |
| 変更種別 | 「意図的なシンプル化」「スコープ外として後日対応」「不要と判断して削除」 |
| 未タスク化要否 | 後日対応が必要な場合は未タスクとして登録 |

**相互参照**: 将来 06-known-pitfalls.md に P33（設計-実装乖離管理）として追加予定。現時点では本教訓が正本。

---

#### 8. 複数エージェント並列実行時のシステム仕様書更新漏れ

| 項目 | 内容 |
|------|------|
| **課題** | Phase 12エージェントが一部のシステム仕様書（api-ipc-agent.md, security-electron-ipc.md, architecture-overview.md）への更新を漏らした。後続の品質レビューで発見・追加修正が必要になった |
| **原因** | IPC機能開発時に更新すべきシステム仕様書の一覧が明示されておらず、エージェントが一部ファイルの存在を認識していなかった |
| **解決策** | Phase 12仕様書に「IPC機能開発時の更新対象ファイル一覧」を追加する。最低限の更新対象として以下を明記する |
| **教訓** | IPC機能開発では影響範囲が広く、更新対象ファイルが多い。チェックリストによる漏れ防止が必須 |

**IPC機能開発時の最低限の更新対象ファイル一覧**:

| ファイル | 更新内容 |
|----------|----------|
| `api-ipc-agent.md` | IPCチャンネル定義、ハンドラー仕様の追加・更新 |
| `security-electron-ipc.md` | セキュリティ層（ホワイトリスト、バリデーション）の記録 |
| `architecture-overview.md` | アーキテクチャ図、コンポーネント構成の更新 |
| `interfaces-agent-sdk-skill.md` | 型定義、インターフェース変更の記録 |
| `task-workflow.md` | 完了タスク記録、残課題テーブル更新 |
| `lessons-learned.md` | 苦戦箇所と教訓の記録 |
| `architecture-implementation-patterns.md` | 新規実装パターンの追加 |

---

### 成果物

| 成果物 | パス |
|--------|------|
| IPCハンドラー | `apps/desktop/src/main/ipc/skillCreatorHandlers.ts` |
| Preload API | `apps/desktop/src/preload/skill-creator-api.ts` |
| ホワイトリスト更新 | `apps/desktop/src/preload/channels.ts` |
| Preload統合 | `apps/desktop/src/preload/index.ts` |
| ハンドラーテスト | `apps/desktop/src/main/ipc/__tests__/skillCreatorHandlers.test.ts` |
| Preload APIテスト | `apps/desktop/src/preload/__tests__/skill-creator-api.test.ts` |

### 関連ドキュメント更新

| ドキュメント | 更新内容 |
|--------------|----------|
| [architecture-implementation-patterns.md](./architecture-implementation-patterns.md) | IPC ハンドラー登録パターン（Pattern 3）追加 |
| [06-known-pitfalls.md](../../../rules/06-known-pitfalls.md) | Preload統合漏れ、並列Phase実行の教訓 |

---

## UT-STORE-HOOKS-TEST-REFACTOR-001: renderHookパターン移行

### タスク概要

| 項目 | 内容 |
|------|------|
| タスクID | UT-STORE-HOOKS-TEST-REFACTOR-001 |
| 目的 | Store Hooksテストを getState() パターンから renderHook パターンに移行し、Reactサブスクリプション経由のテストを実現 |
| 完了日 | 2026-02-12 |
| ステータス | **完了** |

### 実装内容

| 変更内容 | ファイル | 説明 |
|----------|----------|------|
| AuthModeテストのrenderHook移行 | `apps/desktop/src/renderer/store/__tests__/authModeSelectors.test.ts` | getState()パターンをrenderHook + act()に全面移行 |
| LLMテストのrenderHook移行 | `apps/desktop/src/renderer/store/__tests__/llmSelectors.test.ts` | getState()パターンをrenderHook + act()に全面移行 |
| AgentテストのrenderHook移行 | `apps/desktop/src/renderer/store/__tests__/agentSelectors.test.ts` | getState()パターンをrenderHook + act()に全面移行 |

### 苦戦箇所と解決策

#### 1. renderHookへの移行効果

| 項目 | 内容 |
|------|------|
| **課題** | getState()パターンはZustandの内部APIを直接テストするため、Reactサブスクリプション経由の実際の動作と乖離する |
| **原因** | getState()はReactの再レンダリングサイクルを経由しないため、コンポーネントでの使用時と異なる結果を返す可能性がある |
| **解決策** | renderHookパターンにより、コンポーネントが実際に使用する経路（Reactサブスクリプション）でテスト |
| **教訓** | Zustand Hookのテストでは、getState()直接呼び出しではなく、renderHookを通じてReactサブスクリプション経路を検証すべき |

---

#### 2. テストヘルパー関数の共通化

| 項目 | 内容 |
|------|------|
| **課題** | 3つのテストファイルで同一のヘルパー関数（`assertNoInfiniteLoop()`, `assertStableReference()`, `assertNoUnrelatedRerender()`）が重複定義されている |
| **原因** | 各テストファイルを独立に作成した際に、共通ヘルパーの抽出を後回しにした |
| **解決策** | 3つのヘルパー関数を各ファイル内に定義。将来の共通化候補としてタスク化 |
| **教訓** | テストヘルパーが3ファイル以上で重複する場合は、共通テストユーティリティファイルへの抽出を検討すべき |

**テストヘルパー関数一覧**:

| ヘルパー関数 | 目的 | 検証内容 |
|-------------|------|----------|
| `assertNoInfiniteLoop()` | 無限ループ防止検証 | renderCountが閾値（通常5回）以下であることを確認 |
| `assertStableReference()` | 参照安定性検証 | 状態変更後もアクション関数の参照が同一であることを確認 |
| `assertNoUnrelatedRerender()` | 不要な再レンダリング防止検証 | 無関係な状態変更で再レンダリングが発生しないことを確認 |

---

#### 3. electronAPIモックの統一

| 項目 | 内容 |
|------|------|
| **課題** | authMode、LLM、skillの3セクションでelectronAPIモックの構造が異なり、テスト間で不整合が発生 |
| **原因** | 各テストファイルで個別にwindow.electronAPIモックを定義していたため、必要なプロパティの漏れが発生 |
| **解決策** | `createMockElectronAPI()` パターンで、authMode + llm + skill の3セクション全体を統一的にモック |
| **教訓** | electronAPIモックはテストファイルごとに部分的に定義するのではなく、全セクションを含む統一モックファクトリを使用すべき |

---

#### 4. 移行中のテスト数増加

| 項目 | 内容 |
|------|------|
| **課題** | テスト数が大幅に増加（getState()パターン48件 → renderHookパターン114件 + export検証23件） |
| **原因** | renderHookパターンでは参照安定性・無限ループ防止・不要再レンダリング防止のテストカテゴリ（CAT-01〜CAT-09）を体系的に追加した |
| **解決策** | テストカテゴリの体系的分類により、網羅性を確保しつつテスト構造を可読に維持 |
| **教訓** | テスト数の増加自体は問題ではなく、カテゴリ分類（CAT-01: 初期値, CAT-02: アクション実行, CAT-03: 参照安定性, CAT-04: 無限ループ防止, CAT-05: 不要再レンダリング防止等）で構造化されていることが重要 |

---

#### 5. Phase 12 Step 2 の「該当なし」誤判定

| 項目 | 内容 |
|------|------|
| **課題** | テストリファクタリングのため Step 2（システム仕様更新）を「該当なし」と判定したが、後から6ファイルの仕様書更新が必要になった |
| **原因** | 「テストのみの変更 = システム仕様に影響なし」と短絡的に判断した。しかし renderHook パターンへの移行はテスト戦略・テスト方法論の変更であり、開発ガイドラインや実装パターン仕様書に記録すべき内容だった |
| **解決策** | Phase 12 Step 2 の判定基準を拡張し、以下の変更は「該当あり」として仕様書更新を行う: (1) テスト方法論・戦略の変更（テストパターン移行等） (2) テストヘルパー・ユーティリティの新規追加 (3) テストカテゴリ体系の変更 |
| **教訓** | テストのみの変更でも、テスト方法論・戦略の変更はシステム仕様書の更新対象となる。「プロダクションコード変更なし = 仕様書更新不要」という判断は誤り |

**更新が必要だった仕様書一覧**:

| 仕様書 | 更新内容 |
|--------|----------|
| `development-guidelines.md` | Zustand Hookテスト戦略（renderHookパターン）セクション追加 |
| `patterns.md` | Store Hookテスト実装パターン（renderHook方式）追加 |
| `arch-state-management.md` | テスト戦略セクション更新 |
| `task-workflow.md` | 完了タスクセクション追加、残課題テーブル更新 |
| `LOGS.md`（2ファイル） | タスク完了記録追加 |

**Phase 12 Step 2 判定フローチャート**:

| 変更種別 | Step 2 判定 | 理由 |
|----------|------------|------|
| プロダクションコード変更 | 該当あり | アーキテクチャ・インターフェースへの影響 |
| テスト方法論・戦略変更 | **該当あり** | 開発ガイドライン・パターン仕様書への影響 |
| テストケース追加（既存パターン） | 該当なし | 既存のテスト方法論内の変更 |
| テストコードのリファクタリング（パターン不変） | 該当なし | 構造変更のみ、方法論は不変 |

---

#### 6. 実装ガイドのテストカテゴリテーブル不整合

| 項目 | 内容 |
|------|------|
| **課題** | Phase 5 で作成した実装ガイドのテストカテゴリテーブルが、Phase 6 のテスト拡充後に更新されなかった |
| **原因** | Phase 6 でテストを大幅に拡充（CAT-07 が 3 テストから 19 テストに増加、CAT-10〜CAT-16 が新規追加）したが、実装ガイドのテーブルを再確認しなかった |
| **解決策** | Phase 6 完了後に実装ガイドのテストカテゴリテーブルを再確認し、テスト数とカテゴリを最新の実測値に更新する |
| **教訓** | Phase 6（テスト拡充）完了後は、必ず実装ガイドのテストカテゴリテーブルを再確認する。テーブルは Phase 5 時点のスナップショットであり、Phase 6 以降の変更が自動反映されないため |

**不整合の具体例**:

| カテゴリ | Phase 5 時点の記載 | Phase 6 後の実測値 | 差異 |
|----------|-------------------|-------------------|------|
| CAT-07（export検証） | 3テスト | 19テスト | +16テスト（大幅増） |
| CAT-10〜CAT-16 | 未記載 | 新規追加 | Phase 6 で新設されたカテゴリ |

**再発防止策**:

| Phase | テストカテゴリテーブル確認 | 理由 |
|-------|-------------------------|------|
| Phase 5（実装） | 初版作成 | 実装時点のテスト構造を記録 |
| Phase 6（テスト拡充） | **必須更新** | テスト数・カテゴリが変化するため |
| Phase 7（カバレッジ確認） | 確認推奨 | カバレッジ不足でテスト追加した場合 |
| Phase 8（リファクタリング） | 確認推奨 | テスト統合・分割した場合 |

---

### 成果物

| 成果物 | パス |
|--------|------|
| AuthModeセレクタテスト | `apps/desktop/src/renderer/store/__tests__/authModeSelectors.test.ts` |
| LLMセレクタテスト | `apps/desktop/src/renderer/store/__tests__/llmSelectors.test.ts` |
| Agentセレクタテスト | `apps/desktop/src/renderer/store/__tests__/agentSelectors.test.ts` |

### 関連ドキュメント更新

| ドキュメント | 更新内容 |
|--------------|----------|
| [development-guidelines.md](./development-guidelines.md) | Zustand Hookテスト戦略（renderHookパターン）セクション追加 |
| [patterns.md](../../skill-creator/references/patterns.md) | Store Hookテスト実装パターン（renderHook方式）追加 |

---

## UT-FIX-AGENTVIEW-INFINITE-LOOP-001: AgentView無限ループ修正テスト

### タスク概要

| 項目 | 内容 |
|------|------|
| タスクID | UT-FIX-AGENTVIEW-INFINITE-LOOP-001 |
| 目的 | AgentViewコンポーネントの個別セレクタHook移行とテスト作成 |
| 完了日 | 2026-02-12 |
| ステータス | **完了** |

### 1. happy-dom環境でのuserEvent非互換

| 項目 | 内容 |
|------|------|
| 難易度 | 高 |
| 影響範囲 | テストファイル全体（53テスト中49テスト失敗） |
| 解決時間 | 中程度（原因特定に時間を要した） |

**問題**: Phase 6で追加されたテストが`@testing-library/user-event`の`userEvent.setup()`を使用しており、happy-dom環境でSymbol操作エラーが発生。

```
TypeError: Symbol(Node prepared with document state workarounds)
```

**原因分析**:
- プロジェクトのデフォルトテスト環境は`happy-dom`（`vitest.config.ts`で設定）
- `userEvent.setup()`はjsdomのDOM APIに依存するSymbol操作を内部的に実行
- happy-domはこのSymbol操作を完全にはサポートしていない

**解決策**: `userEvent`を全て`fireEvent`に置換

```typescript
// ❌ happy-domで失敗するパターン
const { userEvent } = await import("@testing-library/user-event");
const user = userEvent.setup();
await user.click(element);

// ✅ happy-domで安定するパターン
import { fireEvent } from "@testing-library/react";
fireEvent.click(element);

// ✅ 非同期ハンドラの場合（Promise microtask flush）
import { act } from "@testing-library/react";
await act(async () => {
  fireEvent.click(element);
});
```

**再発防止**:
- happy-dom環境では`fireEvent`を使用する（プロジェクト標準）
- `userEvent`が必要な場合は`// @vitest-environment jsdom`ディレクティブを追加
- テスト追加時は必ずCI/ローカルで実行確認

### 2. テスト実行ディレクトリ依存問題

| 項目 | 内容 |
|------|------|
| 難易度 | 中 |
| 影響範囲 | テスト実行全体 |
| 解決時間 | 短い（パターン認識後は即解決） |

**問題**: プロジェクトルートから`pnpm vitest run apps/desktop/src/...`を実行すると、`document is not defined`エラーが発生。

**原因分析**:
- プロジェクトルートの`vitest.config.ts`と`apps/desktop/vitest.config.ts`は別ファイル
- ルートから実行すると`apps/desktop/vitest.config.ts`の`environment: "happy-dom"`と`setupFiles: ["./src/test/setup.ts"]`が読み込まれない
- 結果、テスト環境がデフォルト（node）となり、DOM APIが利用不可

**解決策**:
```bash
# ❌ プロジェクトルートから実行（失敗）
pnpm vitest run apps/desktop/src/renderer/views/AgentView/__tests__/AgentView.test.tsx

# ✅ apps/desktop/から実行（成功）
cd apps/desktop && pnpm vitest run src/renderer/views/AgentView/__tests__/AgentView.test.tsx

# ✅ pnpm --filter を使用（成功）
pnpm --filter @repo/desktop exec vitest run src/renderer/views/AgentView/__tests__/AgentView.test.tsx
```

**再発防止**: `apps/desktop/`配下のテストは必ず同ディレクトリから実行

### 3. jsdom切り替え時の副作用

| 項目 | 内容 |
|------|------|
| 難易度 | 中 |
| 影響範囲 | テストファイル全体 |
| 解決時間 | 短い（切り戻しで対応） |

**問題**: happy-domでの`userEvent`エラーを回避するため`// @vitest-environment jsdom`ディレクティブを追加したところ、別の問題が発生。

**症状**:
1. `toBeInTheDocument()`マッチャーが動作しない
2. DOM要素が重複して表示される（`getAllByRole`で期待以上の要素が返る）

**原因分析**:
- jsdom環境では`setup.ts`のロード順序が異なり、`@testing-library/jest-dom`の拡張が正しく適用されない場合がある
- jsdom独自のDOM実装による要素重複

**解決策**: jsdomへの切り替えを断念し、happy-dom + fireEventの組み合わせに統一

**教訓**: テスト環境の切り替えは、単一テストの問題解決を目的としない。環境を変更する場合は、テストファイル全体への影響を事前に検証する。

---

## テンプレート（新規教訓追加用）

以下は将来のタスク記録用テンプレートです。

### 記入ガイドライン

| 項目 | 説明 | 必須 |
|------|------|:----:|
| タスクID | 一意のタスク識別子（例: TASK-FIX-XX-X） | Yes |
| 目的 | タスクの目的を1文で記述 | Yes |
| 完了日 | YYYY-MM-DD 形式 | Yes |
| 苦戦箇所 | 課題・原因・解決策・教訓をテーブルで記述 | Yes |
| コード例 | 解決策を示す具体的なコード（TypeScript） | 推奨 |
| 参照 | 関連ドキュメントへのリンク | 推奨 |
| 成果物 | 変更/追加されたファイルのパス | Yes |

### テンプレート本文

```markdown
## TASK-XXX: タスク名（YYYY-MM-DD）

### タスク概要

| 項目 | 内容 |
|------|------|
| タスクID | TASK-XXX |
| 目的 | タスクの目的 |
| 完了日 | YYYY-MM-DD |
| ステータス | **完了** |

### 実装内容

| 変更内容 | ファイル | 説明 |
|----------|----------|------|
| 変更1 | ファイルパス | 説明 |

### 苦戦箇所と解決策

#### 1. [苦戦箇所のタイトル]

| 項目 | 内容 |
|------|------|
| **課題** | 課題の説明 |
| **原因** | 原因の説明 |
| **解決策** | 解決策の説明 |
| **教訓** | 今後の教訓 |

**コード例**:

```typescript
// 解決策を示すコード例
```

**参照**: [関連ドキュメント](./path/to/doc.md)

---

### 成果物

| 成果物 | パス |
|--------|------|
| 成果物名 | ファイルパス |

### 関連ドキュメント更新

| ドキュメント | 更新内容 |
|--------------|----------|
| ドキュメント名 | 更新内容 |
```

---

## 品質チェックリスト

新規教訓を追加する際は、以下を確認してください。

| チェック項目 | 基準 |
|-------------|------|
| [ ] タスク概要が完全 | タスクID、目的、完了日、ステータスがすべて記載 |
| [ ] 苦戦箇所が構造化 | 課題・原因・解決策・教訓の4項目がテーブルで記載 |
| [ ] コード例が具体的 | 解決策を再現可能なコード例が含まれる |
| [ ] 参照リンクが有効 | 関連ドキュメントへのリンクが正しい |
| [ ] 06-known-pitfalls.md と整合 | 汎用的な教訓は pitfalls にも追加 |
| [ ] 変更履歴を更新 | 本ドキュメント上部の変更履歴テーブルを更新 |
| [ ] 目次を更新 | 新規タスクを目次に追加 |
