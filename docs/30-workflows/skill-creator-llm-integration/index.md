# Skill Creator LLM Integration

## 概要

Electron アプリの Skill Creator に LLM を統合し、「こういうスキルを作りたい」という自然言語入力から、精度の高いスキルを自動生成する機能を実装する。

LLM のトークン予算を「構造決定」ではなく「コンテンツ品質」に集中させるため、**ベーステンプレート + LLM カスタマイズのハイブリッド方式**を採用する。

## 品質設計原則

```
スキルの品質 = ① 意図理解の精度 × ② コンテンツ生成の精度 × ③ 構造の正しさ
```

| 要素             | 担当                                      | 品質保証手段                             |
| ---------------- | ----------------------------------------- | ---------------------------------------- |
| ① 意図理解       | plan() + 39 agent 仕様書のプロンプト注入  | LLM のトークン予算を意図理解に集中       |
| ② コンテンツ品質 | execute() + **PromptQualityProfile 注入** | ファイル種別ごとの品質基準を LLM に明示  |
| ③ 構造の正しさ   | テンプレートカテゴリで保証                | validate-structure.js で必須ファイル検証 |

**品質責任の配置原則**: 品質定義は plan()（上流）で行い、execute() / verify() / improve()（下流）に伝播させる。下流で品質を後付けしない。

### プロンプト品質の4次元（v1 は決定論的チェックに限定）

| 次元                       | 定義                                         | v1 検証方法                                              |
| -------------------------- | -------------------------------------------- | -------------------------------------------------------- |
| 完全性 (Completeness)      | 必要なセクション・要素がすべて含まれているか | 必須セクション存在チェック（正規表現）                   |
| 非曖昧性 (Unambiguity)     | 解釈の余地が最小化されているか               | 禁止パターン辞書照合（`適切に`, `必要に応じて`, `など`） |
| 実行可能性 (Actionability) | LLM が具体的な行動に変換できるか             | 各ステップに「動詞 + 対象」が含まれるか                  |
| 検証可能性 (Verifiability) | 成功・失敗の判断基準があるか                 | 完了条件にチェックリスト形式が存在するか                 |

### PromptQualityProfile（ファイル種別ごとの品質基準）

plan() が SkillBlueprint と共に生成し、execute() に渡す。

```typescript
interface PromptQualityProfile {
  // SKILL.md の品質基準
  skillMd: {
    requiredSections: string[]; // ["設計原則", "クイックスタート", "Task仕様ナビ", ...]
    maxLines: number; // 500
    mustHaveFrontmatter: true; // YAML frontmatter 必須
    mustHaveAnchors: true; // Anchors 必須
    mustHaveTrigger: true; // Trigger キーワード 必須
  };
  // agents/*.md の品質基準
  agentSpec: {
    requiredSections: string[]; // ["メタ情報", "プロフィール", "知識ベース", "実行仕様", "インターフェース"]
    minStepsInProcess: number; // 思考プロセスの最小ステップ数: 3
    mustHaveOutputSchema: true; // 出力テンプレート/スキーマ必須
    mustHaveChecklist: true; // チェックリスト必須
  };
  // scripts/ の品質基準
  script: {
    mustBeIdempotent: true; // 冪等性
    mustHaveErrorHandling: true; // エラーハンドリング
    mustHaveHelpFlag: true; // --help フラグ
  };
  // references/ の品質基準
  reference: {
    maxLinesWithoutToc: number; // 100行超は目次必須
    mustBeLinkedFromSkillMd: true; // SKILL.md からリンク必須
  };
}
```

### 品質チェックの配置（3層 + LLM 自己改善）

```
plan()     → SkillBlueprint + PromptQualityProfile を生成
                ↓ 品質基準を下流に伝播
execute()  → PromptQualityProfile を LLM プロンプトに注入
             → Self-Critique Protocol で生成中に自己改善
                ↓
verify()   → Layer 1: 構造検証（validate-structure.js）
             Layer 2: 内容品質検証（正規表現 + 低品質パターン検出）
             Layer 3: LLM 多視点評価（生成者とは異なる視点で評価）
                ↓
             → 品質スコアが閾値未満 → execute() に修正指示付きで再生成（最大2回）
             → 品質スコアが閾値以上 → ユーザーに提示
                ↓
improve()  → ユーザーフィードバック + LLM 自己分析 → SkillDiff で差分適用
```

### Layer 1-2: 決定論的チェック（低コスト・即時）

```
# 禁止パターン辞書（曖昧表現）
AMBIGUOUS = ["適切に", "必要に応じて", "など", "等", "うまく", "よしなに", "できれば"]

# 必須要素（SKILL.md）
REQUIRED_SKILL_SECTIONS = ["## 目的", "## 設計原則", "## クイックスタート"]

# 必須要素（agents/*.md）
REQUIRED_AGENT_SECTIONS = ["## 実行仕様", "## インターフェース"]

# 内容の最低品質閾値
MIN_PURPOSE_LENGTH = 50        # 目的セクション最低50文字
MIN_STEPS_PER_AGENT = 3        # 各agentの思考プロセス最低3ステップ
MIN_TRIGGER_KEYWORDS = 3       # Trigger に最低3キーワード
```

### Layer 3: LLM 多視点評価（自己改善能力の活用）

循環論法のリスクは「生成者と評価者の視点を分離する」ことで軽減する。同一 LLM でも、異なるシステムプロンプトで呼び出すことで、疑似的な独立評価を実現する。

```typescript
// LLM 多視点評価の実行フロー
interface QualityEvaluationPipeline {
  // Step 1: Self-Critique（生成直後、execute() 内で実行）
  selfCritique: {
    prompt: "あなたが書いたスキルを以下の4つの質問で自己評価してください:
             1. 各セクションを読んだ LLM は具体的に何をすべきか理解できるか？
             2. 曖昧な表現（「適切に」等）は残っていないか？
             3. 完了条件は検証可能な形で書かれているか？
             4. 不要なセクションはないか？";
    maxIterations: 2;  // 自己改善の最大反復回数
  };

  // Step 2: 多視点評価（verify() 内で実行、生成者とは異なる視点）
  perspectives: [
    {
      role: "初見のユーザー";
      prompt: "あなたはこのスキルを初めて見ます。SKILL.md だけを読んで、
               このスキルが何をするものか、どう使うかを説明してください。
               説明できない部分があれば、それが品質上の問題です。";
    },
    {
      role: "セキュリティレビュアー";
      prompt: "このスキルにセキュリティリスクはありますか？
               ファイル操作、外部API呼び出し、認証情報の扱いを確認してください。";
    },
    {
      role: "品質監査員";
      prompt: "PromptQualityProfile の各基準に対して、
               このスキルの充足状況をスコア（0-100）で評価してください。
               各次元: 完全性, 非曖昧性, 実行可能性, 検証可能性";
    }
  ];

  // Step 3: スコア統合 → 閾値判定
  threshold: 70;  // 100点満点中70点以上で合格
  failAction: "execute() に具体的な修正指示を付けて再生成（最大2回）";
}
```

### LLM 自己改善の具体的手法

| 手法                   | 実行タイミング           | 内容                                    | コスト                    |
| ---------------------- | ------------------------ | --------------------------------------- | ------------------------- |
| Self-Critique Protocol | execute() 内             | 生成直後に4つの自己質問で自己改善       | 低（同一セッション内）    |
| 初見理解テスト         | verify() Layer 3         | 文脈を断絶した別セッションで理解度検証  | 中（別 LLM コール）       |
| 多視点評価             | verify() Layer 3         | ユーザー/セキュリティ/品質の3視点で評価 | 中（3回の LLM コール）    |
| 対立的テスト           | verify() Layer 3（任意） | 意図的に弱点を突く入力でスキルを試行    | 高（複数回の LLM コール） |
| 品質フィードバック学習 | improve() 後             | ユーザーフィードバックのパターンを蓄積  | 低（ログ記録のみ）        |

### improve() での LLM 自己分析

improve() はユーザーフィードバックだけでなく、LLM 自身の分析も組み合わせて改善提案を生成する。

```
improve() の入力:
  1. ユーザーフィードバック（「トリガーが発動しない」等）
  2. verify() Layer 3 の品質スコア（低スコア次元を自動特定）
  3. 現在のスキル全体の構造読み込み（SkillStructureReader）

improve() の LLM 指示:
  「以下の情報に基づき、スキルの改善提案を SkillDiff 形式で生成してください:
   - ユーザーフィードバック: {feedback}
   - 品質スコア: 完全性={x}, 非曖昧性={y}, 実行可能性={z}, 検証可能性={w}
   - 最も低いスコアの次元に対して優先的に改善を提案してください
   - 改善は具体的な before/after で示してください」
```

### 品質保証の全体設計

```
Create → execute(Self-Critique内蔵)
           ↓
         verify(Layer 1: 構造 + Layer 2: 内容ルール + Layer 3: LLM多視点評価)
           ↓                                            ↓
         スコア ≥ 70 → ユーザーに提示           スコア < 70 → 修正指示付き再生成
                         ↓                                    ↓ (最大2回)
                    ユーザー試用                          再度 verify
                         ↓
                    フィードバック
                         ↓
                    Improve(ユーザーFB + LLM自己分析 + 品質スコア)
                         ↓
                    verify → ... (収束まで繰り返し)
```

## 現状の問題

1. UI「スキルを生成」→ `SkillCreatorService` → テンプレートから空ファイル作成のみ（LLM 不使用）
2. `RuntimeSkillCreatorFacade` の `plan()` / `improve()` はスタブ
3. `SkillLifecyclePanel` は RuntimeSkillCreatorFacade を一切呼んでいない（UI → Runtime 断絶）
4. LLM 出力をファイルに永続化するパスが存在しない

## スキルライフサイクル（v1 スコープ）

v1 は **Create + Verify + Improve** の3操作に絞る。Update は Improve に統合、Delete は既存 `skill:remove` で対応。

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│  Create  │ ──▶ │  Verify  │ ──▶ │ Improve  │ ──▶ (Verify に戻る)
└──────────┘     └──────────┘     └──────────┘
```

| 操作    | IPC チャネル                                        | 内容                                                    |
| ------- | --------------------------------------------------- | ------------------------------------------------------- |
| Create  | `skill-creator:plan` → `skill-creator:execute-plan` | 要求分析 → カテゴリ選択 + カスタマイズ → 全ファイル生成 |
| Verify  | `skill-creator:verify`（新規）                      | 生成スキルを実行し、要求を満たすかトータル検証          |
| Improve | `skill-creator:improve-skill`                       | フィードバック → 差分提案 → 承認 → 適用                 |

v2 で追加予定: Update（部分更新の高度化）、Delete（ライフサイクル完結）、Audit（既存スキルの品質監査）、Migrate（品質基準バージョンアップ時の一括更新）、スキル間依存グラフ、Verify → Improve 自動ループ、LLM ベース品質スコアリング

## アーキテクチャ

### ハイブリッド構造決定フロー

```
[Renderer] 「PRレビューを自動化したい」
    │
    ▼ IPC: skill-creator:plan
[Main] RuntimeSkillCreatorFacade.plan()
    → ResourceLoader.loadAgent("discover-problem" 等)
    → LLM が要求を分析
    → テンプレートカテゴリを選択（simple/standard/complex/automation/integration）
    → カテゴリに対するカスタマイズ（追加ディレクトリ/ファイル）を決定
    → SkillBlueprint を返却
    │
    │ [素人モード] → 要約表示のみ → 自動承認
    │ [上級者モード] → 構造計画を表示 → ユーザーが確認・修正 → 承認
    │
    ▼ IPC: skill-creator:execute-plan
[Main] RuntimeSkillCreatorFacade.execute()
    → SkillBlueprint に従い、LLM が各ファイルの内容を高品質に生成
    → SkillFileWriter.create() でファイルシステムに永続化
    → SKILL_CREATOR_PROGRESS で進捗ストリーミング
    │
    ▼ IPC: skill-creator:verify (新規)
[Main] RuntimeSkillCreatorFacade.verify()
    → 生成スキルを SkillExecutor で実際に実行
    → 要求を満たすかトータル検証
    │
    ▼ IPC: skill-creator:improve-skill
[Main] RuntimeSkillCreatorFacade.improve()
    → SkillStructureReader で現在のスキル構造を読み込み
    → LLM がフィードバックに基づき SkillDiff（追加/変更/削除）を提案
    → 承認 → SkillFileWriter.applyDiff() で差分適用
```

### LLM 呼び出し戦略

| メソッド  | 方式                               | 理由                                             |
| --------- | ---------------------------------- | ------------------------------------------------ |
| plan()    | AnthropicAdapter (messages.create) | テキスト応答で十分。構造化出力は tool_use で保証 |
| execute() | SkillExecutor (claude-agent-sdk)   | ファイル生成に自律ツール実行が必要               |
| verify()  | SkillExecutor (claude-agent-sdk)   | 生成スキルの実行検証が必要                       |
| improve() | AnthropicAdapter (messages.create) | テキスト応答で十分                               |

### ハイブリッド構造決定の型設計

```typescript
// --- テンプレートカテゴリ ---
// 既存7スキルの帰納的分析から導出した5カテゴリ
type SkillCategory =
  | "simple"
  | "standard"
  | "complex"
  | "automation"
  | "integration";

// 各カテゴリのベース構造（テンプレートで保証）
const CATEGORY_TEMPLATES: Record<SkillCategory, CategoryTemplate> = {
  simple: { dirs: [], desc: "SKILL.md のみ" },
  standard: {
    dirs: ["agents", "references"],
    desc: "LLM Task 仕様書 + 参照資料",
  },
  complex: {
    dirs: ["agents", "scripts", "references", "schemas"],
    desc: "スクリプト + バリデーション付き",
  },
  automation: {
    dirs: ["agents", "scripts", "assets"],
    desc: "自動化スクリプト + テンプレート",
  },
  integration: {
    dirs: ["agents", "scripts", "references", "schemas", "assets"],
    desc: "外部連携 + フル構成",
  },
};

// --- plan() の出力: LLM がカテゴリ選択 + カスタマイズ ---
interface SkillBlueprint {
  skillName: string;
  description: string;
  // テンプレートベースの構造（LLM がカテゴリを選択）
  category: SkillCategory;
  // テンプレートへのカスタマイズ（LLM が決定）
  customizations: {
    additionalDirectories?: string[]; // テンプレートにない追加ディレクトリ
    additionalFiles?: PlannedFile[]; // テンプレートにない追加ファイル
    excludedDefaults?: string[]; // テンプレートから除外するデフォルトファイル
  };
  // 生成予定の全ファイル（テンプレート + カスタマイズの統合結果）
  files: PlannedFile[];
  reasoning: string; // なぜこのカテゴリ・構造にしたか
}

interface PlannedFile {
  path: string; // "agents/analyze-pr.md"
  purpose: string; // "PR分析のLLM Task仕様書"
}

// --- improve() の差分型 ---
interface SkillDiff {
  add: Array<{ path: string; content: string }>;
  modify: Array<{ path: string; content: string }>;
  remove: string[];
  reasoning: string;
}
```

### 必須生成ファイル（全カテゴリ共通）

```
.claude/skills/{skillName}/
├── SKILL.md          ← 必須: エントリポイント
├── LOGS.md           ← 必須: 運用記録（初期テンプレート）
└── EVALS.json        ← 必須: 評価記録（初期テンプレート）
```

これに加え、選択されたカテゴリのテンプレートディレクトリ + LLM カスタマイズが適用される。

### コンポーネント設計

```typescript
// SkillFileWriter: 書き込み責務
class SkillFileWriter {
  async create(
    skillName: string,
    blueprint: SkillBlueprint,
    contents: Map<string, string>,
  ): Promise<SkillWriteResult>;
  async applyDiff(
    skillName: string,
    diff: SkillDiff,
  ): Promise<SkillWriteResult>;
}

// SkillStructureReader: 読み込み責務（SRP 分離）
class SkillStructureReader {
  async read(skillName: string): Promise<SkillCurrentStructure>;
}

interface SkillCurrentStructure {
  skillName: string;
  files: Array<{ path: string; content: string; size: number }>;
  directories: string[];
}
```

## 機能要件・受け入れ基準（v1）

| ID   | 要件 / 基準                                                              |
| ---- | ------------------------------------------------------------------------ |
| FR-1 | 自然言語 → LLM がカテゴリ選択 + カスタマイズ → スキル構造計画生成 (plan) |
| FR-2 | 計画に基づき、LLM が全ファイル内容を高品質に生成し永続化 (execute)       |
| FR-3 | フィードバック → LLM が差分提案 → 承認で適用 (improve)                   |
| FR-4 | 生成スキルの要求充足をトータル検証 (verify)                              |
| FR-5 | UI → RuntimeSkillCreatorFacade パイプライン接続                          |
| FR-6 | API Key 未設定時の TerminalHandoff 経路保証                              |
| AC-1 | 自然言語入力 → LLM がカテゴリベースでスキル一式を生成する                |
| AC-2 | 生成スキルが `.claude/skills/` に永続化され、即座に実行可能な状態である  |
| AC-3 | 生成進捗が UI にストリーミング表示される                                 |
| AC-4 | API Key 未設定時は TerminalHandoffBundle + CLI コマンド表示              |
| AC-5 | improve: フィードバック → 差分提案 → 承認で適用                          |
| AC-6 | verify: 生成スキルが「やりたいこと」を実際に満たすかトータル検証できる   |
| AC-7 | エラー時に適切なメッセージ表示                                           |
| AC-8 | 既存 skill:create（テンプレート生成）が破壊されない                      |

## 検証方針

**生成されたスキル全体が要求を満たすか**をトータルで検証する。

| 検証レベル   | 内容                                                                                | 方法                     |
| ------------ | ----------------------------------------------------------------------------------- | ------------------------ |
| 構造検証     | 必須ファイル（SKILL.md, LOGS.md, EVALS.json）+ カテゴリ必須ディレクトリが存在するか | `validate-structure.js`  |
| 実行検証     | 生成スキルを SkillExecutor で実行して動作するか                                     | verify() + E2E テスト    |
| 要求充足検証 | ユーザーの「やりたいこと」に対して、生成スキルが正しく応答するか                    | LLM 評価 or 手動確認     |
| 回帰検証     | improve 後もスキル全体の整合性が保たれているか                                      | 改善適用後の再実行テスト |

## plan 承認フロー

| モード                   | 対象ユーザー | 動作                                                                            |
| ------------------------ | ------------ | ------------------------------------------------------------------------------- |
| 素人モード（デフォルト） | 一般ユーザー | 要約表示（「3ファイルのスキルを作成します」）→ 自動承認 → plan+execute 連続実行 |
| 上級者モード（設定切替） | 開発者       | SkillBlueprint の詳細表示 → カテゴリ/ファイル構成を修正可能 → 承認後に execute  |

## ディレクトリ構成

命名規則: `w{Wave番号}{並列識別子}-sc-{機能名}`

```
skill-creator-llm-integration/
├── index.md                              ← 本ファイル（正本）
│
├── w1a-sc-ipc-wiring-fix/                ┐ Wave 1: 並列実行
├── w1b-sc-runtime-policy-closure/        ┘
│
├── w2-sc-plan-llm-prompt/                ← Wave 2: w1a,w1b完了後
│
├── w3a-sc-output-persistence/            ┐ Wave 3: 並列実行 (w2完了後)
├── w3b-sc-improve-llm/                   ┘
│
├── w4-sc-ui-runtime-connection/          ← Wave 4: w2,w3a完了後
│
├── w5a-sc-streaming-progress-ui/         ┐ Wave 5: 並列実行 (w4完了後)
└── w5b-sc-e2e-terminal-handoff/          ┘
```

## 依存関係グラフと並列実行計画

```
Wave 1 (並列):  [w1a-ipc-wiring] + [w1b-runtime-policy]
                        ↓
Wave 2 (直列):  [w2-plan-llm]
                        ↓
Wave 3 (並列):  [w3a-output-persistence] + [w3b-improve-llm]
                        ↓
Wave 4 (直列):  [w4-ui-runtime-connection]
                        ↓
Wave 5 (並列):  [w5a-streaming-ui] + [w5b-e2e-validation]
```

## タスク一覧（v1 スコープ）

| Dir | タスクID                      | 責務                                       | Wave | 並列 | 前提         | 関連FR   | 関連AC     |
| --- | ----------------------------- | ------------------------------------------ | ---- | ---- | ------------ | -------- | ---------- |
| w1a | TASK-SC-01-IPC-WIRING-FIX     | IPC配線P65解消                             | 1    | Yes  | なし         | FR-5前提 | AC-8       |
| w1b | TASK-SC-02-RUNTIME-POLICY     | Policy分岐安定化                           | 1    | Yes  | なし         | FR-6     | AC-4       |
| w2  | TASK-SC-03-PLAN-LLM-PROMPT    | plan() カテゴリ選択 + LLM実装              | 2    | No   | w1a, w1b     | FR-1     | AC-1, AC-4 |
| w3a | TASK-SC-04-OUTPUT-PERSISTENCE | SkillFileWriter + SkillStructureReader     | 3    | Yes  | w2           | FR-2     | AC-2       |
| w3b | TASK-SC-05-IMPROVE-LLM        | improve() 差分提案 + applyDiff             | 3    | Yes  | w2           | FR-3     | AC-5       |
| w4  | TASK-SC-06-UI-RUNTIME-CONN    | UI→Runtime + 承認フロー + ライフサイクルUI | 4    | No   | w2, w3a      | FR-5     | AC-1,3,4   |
| w5a | TASK-SC-07-STREAMING-UI       | ストリーミング進捗UI + エラー表示          | 5    | Yes  | w4           | FR-2     | AC-3, AC-7 |
| w5b | TASK-SC-08-E2E-VALIDATION     | E2E検証 + verify実装 + TerminalHandoff     | 5    | Yes  | w3a, w3b, w4 | FR-4,6   | AC-6, 全AC |

## 設計判断

| 判断                       | 選択                                                    | 根拠                                                                                     |
| -------------------------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| 構造決定方式               | ハイブリッド（テンプレートカテゴリ + LLM カスタマイズ） | 帰納的分析: 既存7スキルの構造は5カテゴリに集約可能。LLM のトークンをコンテンツ品質に集中 |
| v1 スコープ                | Create + Verify + Improve の3操作                       | Update は Improve に統合可能。Delete は既存 skill:remove で代替                          |
| plan/improve の LLM 方式   | AnthropicAdapter + tool_use で構造化出力保証            | テキスト応答で十分。JSON パース失敗リスクを tool_use で排除                              |
| execute/verify の LLM 方式 | SkillExecutor (claude-agent-sdk)                        | ファイル生成・実行検証に自律ツール実行が必要                                             |
| ファイル操作の責務分離     | SkillFileWriter (書込) + SkillStructureReader (読込)    | SRP 準拠。Writer に readStructure を含めない                                             |
| 承認フロー                 | 素人モード(自動承認) / 上級者モード(確認UI)             | 素人には構造計画は意味不明。要約表示で十分                                               |

## Phase ファイルとの整合性に関する注意

> **正本宣言**: 各タスクの Phase ファイルは初版（2026-03-22）に基づいて生成されたものであり、
> 型名・メソッド名・インターフェース定義は**本 index.md の定義を正本とする**。
>
> Phase ファイルに記載の旧型名は以下のとおり読み替えること:
>
> | Phase ファイル（旧）                 | index.md（正）                              |
> | ------------------------------------ | ------------------------------------------- |
> | `SkillGeneratedContent`              | `SkillBlueprint` + カテゴリテンプレート     |
> | `SkillStructurePlan`（旧版）         | `SkillBlueprint`（category フィールド追加） |
> | `persist()`                          | `SkillFileWriter.create()`                  |
> | `readStructure()` in SkillFileWriter | `SkillStructureReader.read()`               |
> | FR-4 (update)                        | v2 に延期。Improve で統合対応               |
> | FR-5 (delete)                        | v2 に延期。既存 skill:remove で対応         |
> | AC-6 (update)                        | v2 に延期                                   |
> | AC-7 (delete)                        | v2 に延期                                   |

## 各タスクの Phase 構成

各タスクディレクトリに Phase 1-13 のファイルが含まれる:

| Phase | ファイル名                                             | 内容             |
| ----- | ------------------------------------------------------ | ---------------- |
| 1     | phase-01-requirements.md                               | 要件定義         |
| 2     | phase-02-design.md                                     | 設計             |
| 3     | phase-03-design-review.md                              | 設計レビュー     |
| 4     | phase-04-test.md / phase-04-test-creation.md           | テスト作成       |
| 5     | phase-05-implementation.md                             | 実装             |
| 6     | phase-06-test-expansion.md / phase-06-test-coverage.md | テスト拡充       |
| 7     | phase-07-coverage.md / phase-07-coverage-check.md      | カバレッジ確認   |
| 8     | phase-08-refactoring.md                                | リファクタリング |
| 9     | phase-09-quality.md / phase-09-quality-verification.md | 品質検証         |
| 10    | phase-10-final-review.md                               | 最終レビュー     |
| 11    | phase-11-manual-test.md / phase-11-manual-testing.md   | 手動テスト       |
| 12    | phase-12-documentation.md                              | ドキュメント     |
| 13    | phase-13-pr.md / phase-13-pr-creation.md               | PR作成           |
