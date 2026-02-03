# Phase 2: 設計

## メタ情報

| 項目   | 値                               |
| ------ | -------------------------------- |
| Phase  | 2                                |
| タスク | TASK-9C スキル改善・自動修正機能 |
| 作成日 | 2026-02-03                       |

## 目的

要件を実現可能な構造に落とし込む。

## 実行タスク

- アーキテクチャ設計: システム構造の設計とパターン選定
- ドメインモデリング: エンティティ・関係の定義
- API設計: IPCエンドポイント・型スキーマの設計

## 参照資料

| 資料名                 | パス                                                     | 説明          |
| ---------------------- | -------------------------------------------------------- | ------------- |
| 要件定義書             | `outputs/phase-1/requirements-definition.md`             | Phase 1成果物 |
| アーキテクチャパターン | `aiworkflow-requirements: architecture-patterns.md`      | 設計パターン  |
| インターフェース仕様   | `aiworkflow-requirements: interfaces-agent-sdk-skill.md` | 型定義        |

## 実行手順

### 1. アーキテクチャ設計

```
┌──────────────────────────────────────────────────────────────────┐
│                    スキル改善アーキテクチャ                       │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Renderer Process                                                │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  skillSlice (状態管理)                                  │     │
│  │  ├─ analysisResult: SkillAnalysis | null               │     │
│  │  ├─ improvementStatus: 'idle'|'analyzing'|'improving'  │     │
│  │  └─ optimizationResult: OptimizationResult | null      │     │
│  └────────────────────────────────────────────────────────┘     │
│           │                                                      │
│           │ IPC                                                  │
│           ▼                                                      │
│  Main Process                                                    │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  skillHandlers.ts                                       │     │
│  │  ├─ skill:analyze → SkillAnalyzer.analyze()            │     │
│  │  ├─ skill:improve → SkillImprover.applyImprovements()  │     │
│  │  └─ skill:optimize → PromptOptimizer.optimize()        │     │
│  └────────────────────────────────────────────────────────┘     │
│           │                                                      │
│           ▼                                                      │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  Services                                               │     │
│  │  ┌──────────────┐ ┌──────────────┐ ┌───────────────┐  │     │
│  │  │SkillAnalyzer │ │SkillImprover │ │PromptOptimizer│  │     │
│  │  │              │ │              │ │               │  │     │
│  │  │- analyze()   │ │- apply()     │ │- optimize()   │  │     │
│  │  │- static分析  │ │- prompt改善  │ │- evaluate()   │  │     │
│  │  │- AI分析      │ │- 構造改善    │ │- variants()   │  │     │
│  │  └──────────────┘ └──────────────┘ └───────────────┘  │     │
│  └────────────────────────────────────────────────────────┘     │
│           │                                                      │
│           ▼                                                      │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  Claude Agent SDK                                       │     │
│  │  query({ prompt, systemPrompt, maxTurns })             │     │
│  └────────────────────────────────────────────────────────┘     │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### 2. ドメインモデリング

**エンティティ定義**:

```typescript
// SkillAnalysis - 分析結果
interface SkillAnalysis {
  skillName: string;
  overallScore: number; // 0-100
  categories: AnalysisCategory[];
  suggestions: Suggestion[];
  risks: Risk[];
}

// AnalysisCategory - 分析カテゴリ
interface AnalysisCategory {
  name: string; // 'prompt'|'structure'|'security'|'documentation'
  score: number; // 0-100
  details: string;
  issues: string[];
}

// Suggestion - 改善提案
interface Suggestion {
  type: "prompt" | "structure" | "security" | "performance" | "documentation";
  priority: "low" | "medium" | "high" | "critical";
  description: string;
  currentCode?: string;
  suggestedCode?: string;
  autoFixable: boolean;
}

// Risk - リスク評価
interface Risk {
  level: "low" | "medium" | "high";
  description: string;
  mitigation: string;
}

// ImprovementResult - 改善結果
interface ImprovementResult {
  applied: Suggestion[];
  skipped: Suggestion[];
  errors: { suggestion: Suggestion; error: string }[];
}

// OptimizationResult - 最適化結果
interface OptimizationResult {
  original: string;
  optimized: string;
  changes: string[];
  metrics: {
    clarityScore: number;
    specificityScore: number;
    completenessScore: number;
  };
}
```

### 3. API設計（IPCチャネル）

| チャネル                | リクエスト型                                   | レスポンス型                          | 説明             |
| ----------------------- | ---------------------------------------------- | ------------------------------------- | ---------------- |
| skill:analyze           | { skillName: string }                          | SkillAnalysis                         | スキル分析       |
| skill:improve           | { skillName: string, options: ImproveOptions } | ImprovementResult                     | 改善実行         |
| skill:optimize          | { prompt: string }                             | OptimizationResult                    | プロンプト最適化 |
| skill:optimize:variants | { prompt: string, count: number }              | string[]                              | バリアント生成   |
| skill:optimize:evaluate | { prompt: string }                             | { score: number, feedback: string[] } | プロンプト評価   |

## 統合テスト連携【必須】

統合ポイント/契約（API・スキーマ）を設計に反映する:

| 統合ポイント | 契約定義                                  |
| ------------ | ----------------------------------------- |
| Renderer→IPC | 上記IPCチャネル定義                       |
| IPC→Services | サービスメソッドシグネチャ                |
| Services→SDK | Claude Agent SDK query() API              |
| Services→FS  | fs.readFile/writeFile（バックアップ含む） |

## アーキテクチャ層別設計（AIが判断）

| 層                         | 設計観点                          | 仕様参照先                                               |
| -------------------------- | --------------------------------- | -------------------------------------------------------- |
| フロントエンド（Renderer） | skillSlice拡張、分析結果表示      | `aiworkflow-requirements: ui-ux-*.md`                    |
| バックエンド（Main）       | 3サービスクラス設計               | `aiworkflow-requirements: architecture-*.md`             |
| IPC通信                    | 5チャネル追加                     | `aiworkflow-requirements: interfaces-agent-sdk-skill.md` |
| セキュリティ               | ファイル操作制限、SDK呼び出し制限 | `aiworkflow-requirements: security-skill-execution.md`   |

## 成果物

| 成果物         | パス                                     | 説明         |
| -------------- | ---------------------------------------- | ------------ |
| アーキテクチャ | `outputs/phase-2/architecture-design.md` | システム構造 |
| ドメインモデル | `outputs/phase-2/domain-model.md`        | エンティティ |
| API設計        | `outputs/phase-2/api-design.md`          | IPC仕様      |

## 完了条件

- [ ] アーキテクチャが定義されている
- [ ] ドメインモデル（5エンティティ）が作成されている
- [ ] IPCチャネル（5チャネル）が設計されている
- [ ] 要件との整合性が確認されている
- [ ] 統合ポイント/契約が設計に反映されている
- [ ] アーキテクチャ層別の設計が完了している
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. アーキテクチャ設計（レイヤー構造）
3. ドメインモデリング（5エンティティ）
4. IPCチャネル設計（5チャネル）
5. 統合ポイント/契約定義
6. 成果物作成（アーキテクチャ、ドメインモデル、API設計）
7. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

---

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] 5エンティティ、5チャネルが設計されていることを確認
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/skill-import-agent-system/tasks/TASK-9C-skill-improver --phase 2
```

---

## 次のPhase

Phase 3: 設計レビューゲート
