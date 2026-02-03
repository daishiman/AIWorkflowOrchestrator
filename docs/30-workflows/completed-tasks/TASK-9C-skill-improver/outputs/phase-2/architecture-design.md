# TASK-9C アーキテクチャ設計書

## メタ情報

| 項目   | 値                               |
| ------ | -------------------------------- |
| タスク | TASK-9C スキル改善・自動修正機能 |
| 作成日 | 2026-02-03                       |
| Phase  | 2                                |

---

## 全体アーキテクチャ

```
┌──────────────────────────────────────────────────────────────────────────┐
│                    スキル改善アーキテクチャ                               │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Renderer Process                                                        │
│  ┌────────────────────────────────────────────────────────────────┐     │
│  │  skillSlice (状態管理) - 将来拡張                              │     │
│  │  ├─ analysisResult: SkillAnalysis | null                       │     │
│  │  ├─ improvementStatus: 'idle'|'analyzing'|'improving'          │     │
│  │  └─ optimizationResult: OptimizationResult | null              │     │
│  └────────────────────────────────────────────────────────────────┘     │
│           │                                                              │
│           │ IPC (invoke/handle)                                          │
│           ▼                                                              │
│  Main Process                                                            │
│  ┌────────────────────────────────────────────────────────────────┐     │
│  │  skillHandlers.ts                                               │     │
│  │  ├─ skill:analyze           → SkillAnalyzer.analyze()          │     │
│  │  ├─ skill:improve           → SkillImprover.applyImprovements()│     │
│  │  ├─ skill:optimize          → PromptOptimizer.optimize()       │     │
│  │  ├─ skill:optimize:variants → PromptOptimizer.generateVariants()│    │
│  │  └─ skill:optimize:evaluate → PromptOptimizer.evaluate()       │     │
│  └────────────────────────────────────────────────────────────────┘     │
│           │                                                              │
│           ▼                                                              │
│  ┌────────────────────────────────────────────────────────────────┐     │
│  │  Services Layer                                                 │     │
│  │                                                                 │     │
│  │  ┌──────────────────┐ ┌──────────────────┐ ┌─────────────────┐│     │
│  │  │  SkillAnalyzer   │ │  SkillImprover   │ │PromptOptimizer  ││     │
│  │  │                  │ │                  │ │                 ││     │
│  │  │ + analyze()      │ │ + apply()        │ │ + optimize()    ││     │
│  │  │ - collectFiles() │ │ + restoreBackup()│ │ + evaluate()    ││     │
│  │  │ - staticAnalysis │ │ - createBackup() │ │ + variants()    ││     │
│  │  │ - aiAnalysis()   │ │ - applyPrompt()  │ │                 ││     │
│  │  │ - mergeAnalysis()│ │ - applyStructure │ │                 ││     │
│  │  └────────┬─────────┘ └────────┬─────────┘ └────────┬────────┘│     │
│  │           │                    │                    │         │     │
│  └───────────┼────────────────────┼────────────────────┼─────────┘     │
│              │                    │                    │                │
│              ▼                    ▼                    ▼                │
│  ┌────────────────────┐   ┌────────────────────┐                       │
│  │  Claude Agent SDK  │   │  File System (fs)  │                       │
│  │  query()           │   │  - readFile        │                       │
│  │  - prompt          │   │  - writeFile       │                       │
│  │  - systemPrompt    │   │  - readdir         │                       │
│  │  - maxTurns        │   │  - mkdir           │                       │
│  └────────────────────┘   └────────────────────┘                       │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## レイヤー構成

### 1. IPC Layer (skillHandlers.ts)

**責務**: Renderer-Main間の通信ブリッジ

| チャネル                | ハンドラー                         | 入力検証           |
| ----------------------- | ---------------------------------- | ------------------ |
| skill:analyze           | SkillAnalyzer.analyze()            | skillName: string  |
| skill:improve           | SkillImprover.applyImprovements()  | skillName, options |
| skill:optimize          | PromptOptimizer.optimize()         | prompt: string     |
| skill:optimize:variants | PromptOptimizer.generateVariants() | prompt, count      |
| skill:optimize:evaluate | PromptOptimizer.evaluate()         | prompt: string     |

### 2. Service Layer

**責務**: ビジネスロジックの実装

| サービス        | 責務                         | 依存                 |
| --------------- | ---------------------------- | -------------------- |
| SkillAnalyzer   | スキルの分析（静的+AI）      | fs, Claude Agent SDK |
| SkillImprover   | 改善の適用とバックアップ管理 | fs, Claude Agent SDK |
| PromptOptimizer | プロンプトの最適化・評価     | Claude Agent SDK     |

### 3. Infrastructure Layer

**責務**: 外部サービス・システムとの統合

| コンポーネント   | 責務                     |
| ---------------- | ------------------------ |
| Claude Agent SDK | AI分析・改善提案生成     |
| File System (fs) | スキルファイルの読み書き |

---

## サービス設計

### SkillAnalyzer

```typescript
class SkillAnalyzer {
  constructor(private skillsDir: string) {}

  // 公開メソッド
  async analyze(skill: ImportedSkill): Promise<SkillAnalysis>;

  // 内部メソッド
  private async collectFiles(skillDir: string): Promise<Map<string, string>>;
  private performStaticAnalysis(files: Map<string, string>): StaticAnalysis;
  private async performAIAnalysis(
    skill: ImportedSkill,
    files: Map<string, string>,
  ): Promise<AIAnalysis>;
  private mergeAnalysis(
    skillName: string,
    staticAnalysis: StaticAnalysis,
    aiAnalysis: AIAnalysis,
  ): SkillAnalysis;
}
```

### SkillImprover

```typescript
class SkillImprover {
  constructor(private skillsDir: string) {}

  // 公開メソッド
  async applyImprovements(
    skillName: string,
    analysis: SkillAnalysis,
    options?: ImprovementOptions,
  ): Promise<ImprovementResult>;
  async restoreFromBackup(skillName: string): Promise<void>;

  // 内部メソッド
  private async createBackup(skillName: string): Promise<string>;
  private async applySuggestion(
    skillName: string,
    suggestion: Suggestion,
  ): Promise<void>;
  private async improvePrompt(
    skillDir: string,
    suggestion: Suggestion,
  ): Promise<void>;
  private async improveStructure(
    skillDir: string,
    suggestion: Suggestion,
  ): Promise<void>;
  private async improveDocumentation(
    skillDir: string,
    suggestion: Suggestion,
  ): Promise<void>;
  private async improveSecurity(
    skillDir: string,
    suggestion: Suggestion,
  ): Promise<void>;
  private async collectFiles(dir: string): Promise<Map<string, string>>;
}
```

### PromptOptimizer

```typescript
class PromptOptimizer {
  // 公開メソッド
  async optimize(prompt: string): Promise<OptimizationResult>;
  async generateVariants(prompt: string, count?: number): Promise<string[]>;
  async evaluate(prompt: string): Promise<PromptEvaluation>;
}
```

---

## エラーハンドリング戦略

### エラー分類

| エラーカテゴリ  | 例                             | 対応                   |
| --------------- | ------------------------------ | ---------------------- |
| ValidationError | 空のスキル名、無効なオプション | 即座にエラー返却       |
| NotFoundError   | スキルが存在しない             | エラーメッセージ返却   |
| SDKError        | Claude Agent SDK応答エラー     | リトライ or エラー返却 |
| FileSystemError | 読み書き権限エラー             | バックアップ復元試行   |
| ParseError      | JSON/Markdownパースエラー      | 適切なエラーメッセージ |

### リカバリー戦略

```
改善実行フロー:
1. バックアップ作成
2. 改善適用開始
   ├─ 成功 → 結果返却
   └─ エラー発生
       ├─ 部分成功 → applied/errorsを含む結果返却
       └─ 致命的エラー → バックアップから復元
```

---

## セキュリティ設計

### ファイルアクセス制限

| 制限                     | 実装方法                        |
| ------------------------ | ------------------------------- |
| スキルディレクトリ外     | パス検証（skillsDir内のみ許可） |
| ディレクトリトラバーサル | `..` を含むパスを拒否           |
| 特殊文字                 | スキル名のサニタイゼーション    |

### SDK呼び出し制限

| 制限         | 設定値        |
| ------------ | ------------- |
| maxTurns     | 1（単発）     |
| タイムアウト | 30秒          |
| レート制限   | SDKデフォルト |

---

## 既存サービスとの統合

### SkillService との連携

```typescript
// skillHandlers.ts内での利用例
ipcMain.handle("skill:analyze", async (_, { skillName }) => {
  // 既存のSkillServiceでスキル情報を取得
  const skill = await skillService.getSkillByName(skillName);
  if (!skill) {
    return { success: false, error: "スキルが見つかりません" };
  }

  // SkillAnalyzerで分析実行
  const analyzer = new SkillAnalyzer(skillsDir);
  const analysis = await analyzer.analyze(skill);
  return { success: true, data: analysis };
});
```

### 既存パターンの踏襲

| パターン         | 既存実装                | 新規実装     |
| ---------------- | ----------------------- | ------------ |
| IPC応答形式      | { success, data/error } | 同一形式     |
| バリデーション   | validateIpcSender()     | 同一関数使用 |
| エラーメッセージ | 日本語                  | 日本語       |

---

## 作成日時

- **作成**: 2026-02-03
- **作成者**: AI (Phase 2 自動生成)
