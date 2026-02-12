# Phase 2: 設計

## メタ情報

| 項目   | 値                                    |
| ------ | ------------------------------------- |
| Phase  | 2                                     |
| 機能名 | TASK-FIX-7-1-EXECUTE-SKILL-DELEGATION |
| 作成日 | 2026-02-11                            |
| 状態   | **完了**                              |

## 目的

SkillService → SkillExecutor 委譲の設計を行い、Setter Injection パターンを採用する。

## 実行タスク

- アーキテクチャ設計: Setter Injection パターンの設計
- ドメインモデリング: Skill ↔ SkillMetadata の型変換設計
- API設計: executeSkill メソッドのインターフェース設計

## 参照資料

| 資料名         | パス                                                                                        | 説明          |
| -------------- | ------------------------------------------------------------------------------------------- | ------------- |
| 要件定義書     | `outputs/phase-1/requirements-definition.md`                                                | Phase 1成果物 |
| DIパターン参照 | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 設計パターン  |

## 設計決定

### Setter Injection パターンの採用

**理由**: SkillExecutor は BrowserWindow を必要とするため、SkillService のコンストラクタ時点では生成不可能。

**設計**:

```typescript
// SkillService.ts
class SkillService {
  private skillExecutor: SkillExecutor | null = null;

  // Setter Injection: 外部リソース準備後に呼び出される
  setSkillExecutor(executor: SkillExecutor): void {
    this.skillExecutor = executor;
  }

  async executeSkill(
    request: SkillExecutionRequest,
  ): Promise<SkillExecutionResponse> {
    // 1. SkillExecutor の初期化確認
    if (!this.skillExecutor) {
      throw new Error("SkillExecutor is not initialized");
    }

    // 2. スキル存在確認・バリデーション
    const skill = this.getSkillById(request.skillId);
    if (!skill) {
      throw new Error(`Skill not found: ${request.skillId}`);
    }

    // 3. 型変換: Skill → SkillMetadata
    const metadata = this.convertToSkillMetadata(skill);

    // 4. SkillExecutor に委譲
    return this.skillExecutor.execute(request, metadata);
  }
}
```

### 型変換設計

```typescript
// Skill (UI層の型)
interface Skill {
  id: string;
  name: string;
  description: string;
  version: string;
  // ... UI固有のフィールド
}

// SkillMetadata (SDK層の型)
interface SkillMetadata {
  skillId: string;
  name: string;
  description: string;
  version: string;
  // ... SDK固有のフィールド
}

// 変換関数
private convertToSkillMetadata(skill: Skill): SkillMetadata {
  return {
    skillId: skill.id,
    name: skill.name,
    description: skill.description,
    version: skill.version,
  };
}
```

## 統合テスト連携【必須】

| 統合ポイント               | 契約定義                                        |
| -------------------------- | ----------------------------------------------- |
| SkillService→SkillExecutor | `execute(request, metadata): Promise<Response>` |
| SkillExecutor→SDK          | `callSDKQuery()` via AuthKeyService             |
| IPC通信                    | `skill:execute` チャンネル                      |

## アーキテクチャ層別設計

| 層           | 設計観点                         | 実装ファイル         |
| ------------ | -------------------------------- | -------------------- |
| Main Process | Setter Injection、バリデーション | `SkillService.ts`    |
| IPC通信      | チャンネル定義は既存を利用       | `skill-handler.ts`   |
| 型定義       | Skill ↔ SkillMetadata 変換       | `SkillService.ts` 内 |

## 成果物

| 成果物         | パス                                     | 説明             |
| -------------- | ---------------------------------------- | ---------------- |
| アーキテクチャ | `outputs/phase-2/architecture-design.md` | Setter Injection |
| API仕様        | `outputs/phase-2/api-specification.md`   | メソッド設計     |

## 完了条件

- [x] アーキテクチャが定義されている（Setter Injection）
- [x] 型変換設計が作成されている
- [x] 要件との整合性が確認されている
- [x] 統合ポイント/契約が設計に反映されている
- [x] アーキテクチャ層別の設計が完了している
- [x] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 3: 設計レビューゲート
