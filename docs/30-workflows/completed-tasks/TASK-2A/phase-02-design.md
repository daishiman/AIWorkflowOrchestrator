# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                          |
| ---------- | ----------------------------- |
| Phase      | 2                             |
| Phase名    | 設計                          |
| 前提Phase  | Phase 1（要件定義）           |
| 後続Phase  | Phase 3（設計レビューゲート） |
| ステータス | 未実施                        |
| 作成日     | 2026-01-24                    |
| 機能名     | TASK-2A: SkillScanner         |

---

## 目的

Phase 1 で定義した要件に基づき、SkillScanner のアーキテクチャと詳細設計を行う。クラス構造、メソッドシグネチャ、データフローを定義し、実装の青写真を作成する。

## 背景

SkillScanner は Main Process で動作するサービスクラスであり、ファイルシステムへのアクセス、YAML パース、ディレクトリ走査など複数の責務を持つ。適切な設計により、テスト容易性と保守性を確保する必要がある。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: クラス設計

**目的**: SkillScanner クラスの構造を設計する

**実行手順**:

1. 以下のクラス構造を設計する：

```typescript
export class SkillScanner {
  // プロパティ
  private aiworkflowSkillsDir: string; // ~/.aiworkflow/skills/
  private claudeSkillsDir: string; // ~/.claude/skills/

  // コンストラクタ
  constructor(options?: {
    aiworkflowSkillsDir?: string;
    claudeSkillsDir?: string;
  });

  // 公開メソッド
  async scanAll(): Promise<SkillMetadata[]>;

  // プライベートメソッド
  private async ensureAiworkflowDir(): Promise<void>;
  private async scanDirectory(
    dir: string,
    readonly: boolean,
  ): Promise<SkillMetadata[]>;
  private async parseSkill(
    skillPath: string,
    skillMdPath: string,
    readonly: boolean,
  ): Promise<SkillMetadata | null>;
  private async scanSubDirectory(
    skillPath: string,
    subDir: string,
  ): Promise<SkillSubResource[]>;
  private async scanOtherFiles(skillPath: string): Promise<SkillOtherFile[]>;
  private async extractDescription(filePath: string): Promise<string>;
  private parseFrontmatter(content: string): {
    frontmatter: Record<string, unknown>;
    body: string;
  };
}
```

2. `outputs/phase-02/class-design.md` に設計をまとめる

**期待される成果物**:

- `outputs/phase-02/class-design.md`

---

### タスク2: メソッド詳細設計

**目的**: 各メソッドの詳細仕様を設計する

**実行手順**:

1. 各メソッドの詳細を設計する：

#### scanAll()

| 項目       | 内容                                                                                           |
| ---------- | ---------------------------------------------------------------------------------------------- |
| 責務       | 両ディレクトリをスキャンし、全スキルのメタデータを返す                                         |
| 入力       | なし                                                                                           |
| 出力       | `Promise<SkillMetadata[]>`                                                                     |
| 処理フロー | 1. ensureAiworkflowDir() 2. scanDirectory(aiworkflow) 3. scanDirectory(claude) 4. 結果をマージ |
| エラー処理 | 個別スキルのエラーは無視し、他のスキルのスキャンを継続                                         |

#### parseSkill()

| 項目       | 内容                                                                                   |
| ---------- | -------------------------------------------------------------------------------------- |
| 責務       | SKILL.md を読み取り、SkillMetadata を構築する                                          |
| 入力       | skillPath, skillMdPath, readonly                                                       |
| 出力       | `Promise<SkillMetadata \| null>`                                                       |
| 処理フロー | 1. SKILL.md読み取り 2. Frontmatterパース 3. サブディレクトリスキャン 4. メタデータ構築 |
| エラー処理 | パースエラー時は null を返す                                                           |

#### scanSubDirectory()

| 項目       | 内容                                                                 |
| ---------- | -------------------------------------------------------------------- |
| 責務       | 指定されたサブディレクトリ内のファイル一覧を取得                     |
| 入力       | skillPath, subDir (agents/references/scripts/assets/schemas/indexes) |
| 出力       | `Promise<SkillSubResource[]>`                                        |
| 処理フロー | 1. ディレクトリ存在確認 2. ファイル一覧取得 3. 各ファイルの情報取得  |
| エラー処理 | ディレクトリ不在時は空配列を返す                                     |

#### parseFrontmatter()

| 項目       | 内容                                                      |
| ---------- | --------------------------------------------------------- |
| 責務       | YAML Frontmatter を抽出・パースする                       |
| 入力       | content (Markdown文字列)                                  |
| 出力       | `{ frontmatter: Record<string, unknown>; body: string }`  |
| 処理フロー | 1. --- 区切りを検出 2. YAML部分をパース 3. body部分を分離 |
| エラー処理 | Frontmatterなしの場合は空オブジェクトを返す               |

2. `outputs/phase-02/method-specifications.md` に設計をまとめる

**期待される成果物**:

- `outputs/phase-02/method-specifications.md`

---

### タスク3: データフロー設計

**目的**: スキャン処理のデータフローを設計する

**実行手順**:

1. 以下のデータフローを設計する：

```
scanAll()
    │
    ├─▶ ensureAiworkflowDir()
    │       └─▶ mkdir ~/.aiworkflow/skills/ (if not exists)
    │
    ├─▶ scanDirectory(~/.aiworkflow/skills/, readonly=false)
    │       │
    │       └─▶ for each skill directory:
    │               │
    │               └─▶ parseSkill(skillPath, SKILL.md, readonly)
    │                       │
    │                       ├─▶ readFile(SKILL.md)
    │                       ├─▶ parseFrontmatter(content)
    │                       ├─▶ scanSubDirectory(agents/)
    │                       ├─▶ scanSubDirectory(references/)
    │                       ├─▶ scanSubDirectory(scripts/)
    │                       ├─▶ scanSubDirectory(assets/)
    │                       ├─▶ scanSubDirectory(schemas/)
    │                       ├─▶ scanSubDirectory(indexes/)
    │                       ├─▶ scanOtherFiles()
    │                       └─▶ return SkillMetadata
    │
    ├─▶ scanDirectory(~/.claude/skills/, readonly=true)
    │       └─▶ (同上)
    │
    └─▶ return [...aiworkflowSkills, ...claudeSkills]
```

2. `outputs/phase-02/data-flow.md` に設計をまとめる

**期待される成果物**:

- `outputs/phase-02/data-flow.md`

---

### タスク4: エラーハンドリング設計

**目的**: 発生しうるエラーと対処方針を設計する

**実行手順**:

1. 以下のエラーパターンと対処を設計する：

| エラーパターン                 | 対処方針                           |
| ------------------------------ | ---------------------------------- |
| ~/.aiworkflow/skills/ 作成失敗 | エラーをスローし、スキャン中止     |
| ~/.claude/skills/ が存在しない | 空配列を返し、スキャン継続         |
| SKILL.md が存在しないスキル    | そのスキルをスキップ、警告ログ出力 |
| SKILL.md のパースエラー        | そのスキルをスキップ、警告ログ出力 |
| サブディレクトリ読み取りエラー | 空配列を返し、スキャン継続         |
| ファイル stat 取得エラー       | そのファイルをスキップ             |
| パストラバーサル攻撃の検出     | エラーをスロー、スキップ           |

2. `outputs/phase-02/error-handling.md` に設計をまとめる

**期待される成果物**:

- `outputs/phase-02/error-handling.md`

---

### タスク5: ディレクトリ構成設計

**目的**: 実装ファイルの配置を設計する

**実行手順**:

1. 以下のディレクトリ構成を設計する：

```
apps/desktop/src/main/services/skill/
├── SkillScanner.ts          # メインクラス
├── index.ts                  # バレルエクスポート
└── __tests__/
    ├── SkillScanner.test.ts  # ユニットテスト
    └── __fixtures__/         # テスト用フィクスチャ
        ├── valid-skill/
        │   ├── SKILL.md
        │   ├── agents/
        │   │   └── task-1.md
        │   └── references/
        │       └── guide.md
        ├── invalid-skill/
        │   └── README.md     # SKILL.md なし
        └── malformed-skill/
            └── SKILL.md      # 不正なYAML
```

2. `outputs/phase-02/directory-structure.md` に設計をまとめる

**期待される成果物**:

- `outputs/phase-02/directory-structure.md`

---

## 参照資料

| 参照資料                | パス                                                                                | 内容                            |
| ----------------------- | ----------------------------------------------------------------------------------- | ------------------------------- |
| Phase 1 成果物          | `outputs/phase-01/`                                                                 | 要件定義                        |
| Skill構造・フォーマット | `.claude/skills/aiworkflow-requirements/references/claude-code-skills-structure.md` | SKILL.md仕様、ディレクトリ構造  |
| ディレクトリ構造        | `.claude/skills/aiworkflow-requirements/references/directory-structure.md`          | モノレポ構成、apps/desktop/配置 |
| specification.md 5.6    | `docs/30-workflows/skill-import-agent-system/specification.md`                      | SkillScanner実装仕様            |

---

## 成果物

| 成果物             | パス                                        | 内容             |
| ------------------ | ------------------------------------------- | ---------------- |
| クラス設計         | `outputs/phase-02/class-design.md`          | クラス構造定義   |
| メソッド仕様       | `outputs/phase-02/method-specifications.md` | メソッド詳細設計 |
| データフロー       | `outputs/phase-02/data-flow.md`             | 処理フロー図     |
| エラーハンドリング | `outputs/phase-02/error-handling.md`        | エラー対処方針   |
| ディレクトリ構成   | `outputs/phase-02/directory-structure.md`   | ファイル配置設計 |

---

## 統合テスト連携

**Phase 2 では統合テストの対象外**

設計フェーズのため、統合テストは後続の Phase 4 以降で実施する。ただし、設計時に統合テストの観点を考慮すること：

- IPC ハンドラーからの呼び出しパターンを想定
- モック可能な設計（DI 対応）

---

## 完了条件

- [ ] クラス構造が設計され、全メソッドシグネチャが定義されている
- [ ] 各メソッドの詳細仕様（責務、入出力、処理フロー、エラー処理）が定義されている
- [ ] データフローが図示されている
- [ ] エラーハンドリング方針が全パターンについて定義されている
- [ ] ディレクトリ構成が定義され、テストフィクスチャ構造が設計されている
- [ ] 全成果物が outputs/phase-02/ に配置されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 1（要件定義）が完了していること
- **後続**: Phase 3（設計レビューゲート）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/skill-import-agent-system/tasks/TASK-2A/phase-03-design-review.md`
