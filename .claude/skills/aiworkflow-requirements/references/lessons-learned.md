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
| 2026-02-11 | 1.1.0 | テンプレート準拠、目次・コード例追加 |
| 2026-02-11 | 1.0.0 | 初版作成（TASK-FIX-7-1 苦戦箇所記録） |

---

## 目次

1. [TASK-FIX-7-1: SkillService executeSkill 委譲実装](#task-fix-7-1-skillservice-executeskill-委譲実装)
   - [苦戦箇所1: Setter Injection vs Constructor Injection](#1-setter-injection-vs-constructor-injection-の選択)
   - [苦戦箇所2: テストモックの大規模修正](#2-テストモックの大規模修正)
   - [苦戦箇所3: 型変換](#3-skillexecutionrequest--skillexecutionresponse-の型変換)
2. [関連ドキュメント](#関連ドキュメント)
3. [テンプレート（新規教訓追加用）](#テンプレート新規教訓追加用)

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
  private skillExecutor?: SkillExecutor;

  // Setter Injection: 遅延初期化用
  setSkillExecutor(executor: SkillExecutor): void {
    this.skillExecutor = executor;
  }

  async executeSkill(skill: Skill, args: string): Promise<SkillExecutionResult> {
    if (!this.skillExecutor) {
      throw new Error('SkillExecutor not initialized. Call setSkillExecutor() first.');
    }
    // 型変換して委譲
    const metadata = this.convertToMetadata(skill);
    return this.skillExecutor.execute(metadata, args);
  }
}

// skillHandlers.ts（DI設定）
function registerSkillHandlers(mainWindow: BrowserWindow): void {
  const skillExecutor = new SkillExecutor(mainWindow, authKeyService);
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

#### 3. SkillExecutionRequest / SkillExecutionResponse の型変換

| 項目 | 内容 |
|------|------|
| **課題** | Skill 型から SkillMetadata 型への変換が必要 |
| **原因** | IPC ハンドラーは Skill 型、SkillExecutor.execute() は SkillMetadata 型を期待 |
| **解決策** | 明示的な型変換関数を実装 |
| **教訓** | 型変換は明示的に行い、プロパティの対応関係をドキュメント化すべき |

**型変換の対応関係**:

| Skill プロパティ | SkillMetadata プロパティ | 変換内容 |
|-----------------|-------------------------|----------|
| id | name | スキル識別子 |
| name | name | スキル名（同一） |
| description | description | 説明文 |
| path | path | ファイルパス |
| - | version | デフォルト値 "1.0.0" |
| - | author | デフォルト値 "unknown" |

**コード例（型変換関数）**:

```typescript
// SkillService.ts
private convertToMetadata(skill: Skill): SkillMetadata {
  return {
    name: skill.name,
    description: skill.description ?? '',
    path: skill.path,
    version: '1.0.0',  // デフォルト値
    author: 'unknown', // デフォルト値
  };
}

// 使用例
async executeSkill(skill: Skill, args: string): Promise<SkillExecutionResult> {
  const metadata = this.convertToMetadata(skill);
  return this.skillExecutor.execute(metadata, args);
}
```

**参照**: [interfaces-agent-sdk-executor.md - 型変換パターン](./interfaces-agent-sdk-executor.md)

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
