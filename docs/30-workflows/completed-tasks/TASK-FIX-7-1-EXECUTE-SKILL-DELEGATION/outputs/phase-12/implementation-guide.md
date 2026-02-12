# 実装ガイド: SkillService → SkillExecutor 委譲

## タスク情報

| 項目     | 値                                    |
| -------- | ------------------------------------- |
| タスクID | TASK-FIX-7-1-EXECUTE-SKILL-DELEGATION |
| 完了日   | 2026-02-11                            |

---

## Part 1: 概念的説明（中学生でもわかる版）

### レストランの注文システムで理解する

スキル実行の仕組みは、レストランの注文のようなものです。

1. **お客さん（Renderer）**: 「このスキルを実行して」と注文します
2. **ウェイター（SkillService）**: 注文を受け取り、キッチンに伝えます
3. **キッチン（SkillExecutor）**: 実際に料理（スキル）を作ります
4. **シェフのレシピ（SDK）**: 料理の作り方を知っています

### Setter Injection ってなに？

レストランが開店する前に、キッチンの準備が必要です。

ウェイターは最初からキッチンに繋がっているわけではありません。
キッチンの準備ができてから「このキッチンを使って」と教えてもらいます。

これが **Setter Injection**（セッター・インジェクション）です。

```
開店前: [ウェイター] --- [X] --- [キッチン]
                    (まだ繋がっていない)

開店後: [ウェイター] --- [OK] --- [キッチン]
                    (setSkillExecutor で接続！)
```

### なぜこの方法を使うの？

キッチン（SkillExecutor）は、お店の窓（BrowserWindow）がないと準備できません。
でもウェイター（SkillService）は先にいます。

だから、**後からキッチンを紹介する**方法を使います。

---

## Part 2: 技術的詳細（開発者向け）

### アーキテクチャ

```
Renderer
    ↓ IPC (skill:execute)
SkillService
    ↓ setSkillExecutor() で遅延注入
SkillExecutor
    ↓ callSDKQuery()
Claude Agent SDK
```

### Setter Injection パターン

```typescript
class SkillService {
  private skillExecutor: SkillExecutor | null = null;

  /**
   * BrowserWindow 準備後に呼び出される
   */
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
    // 1. SkillExecutor初期化確認
    if (!this.skillExecutor) {
      throw new Error("SkillExecutor が初期化されていません");
    }

    // 2. スキル存在確認
    const skill = await this.getSkillById(skillId);
    if (!skill) {
      throw new Error("スキルが見つかりません");
    }

    // 3. インポート状態確認
    if (!this.importManager.isImported(skillId)) {
      throw new Error("スキルがインポートされていません");
    }

    // 4. SkillExecutionRequest構築
    const request: SkillExecutionRequest = {
      prompt: params?.prompt ?? "",
      skillId,
      timeout: params?.timeout,
      sessionId: params?.sessionId,
      retryConfig: params?.retryConfig,
    };

    // 5. Skill → SkillMetadata 型変換（インライン）
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

    // 6. SkillExecutorに委譲
    return this.skillExecutor.execute(request, metadata);
  }
}
```

### 型変換（Skill -> SkillMetadata）

| Skill フィールド | SkillMetadata フィールド | 変換     |
| ---------------- | ------------------------ | -------- |
| `id`             | `id`                     | そのまま |
| `name`           | `name`                   | そのまま |
| `slug`           | `slug`                   | そのまま |
| `description`    | `description`            | そのまま |
| `path`           | `path`                   | そのまま |
| `triggers`       | `triggers`               | そのまま |
| `anchors`        | `anchors`                | そのまま |
| `allowedTools`   | `allowedTools`           | そのまま |
| `category`       | `category`               | そのまま |
| `lastModified`   | -                        | **除外** |

### 使い分け基準

| パターン              | 使用条件                                   |
| --------------------- | ------------------------------------------ |
| Constructor Injection | 依存オブジェクトが生成時点で利用可能       |
| **Setter Injection**  | 依存オブジェクトの生成に外部リソースが必要 |
| Factory Pattern       | 依存オブジェクトを動的に生成する必要がある |

### 関連する既知の落とし穴

| Pitfall ID | 内容                                                 |
| ---------- | ---------------------------------------------------- |
| P34        | 遅延初期化が必要な依存オブジェクトの DI パターン選択 |
| P35        | DI 追加時のテストモック大規模修正                    |

### 参照

- [architecture-implementation-patterns.md](/.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md)
- [06-known-pitfalls.md](/.claude/rules/06-known-pitfalls.md)
