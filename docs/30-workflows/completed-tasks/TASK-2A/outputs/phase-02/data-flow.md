# データフロー設計書

## メタ情報

| 項目     | 内容          |
| -------- | ------------- |
| タスクID | TASK-2A       |
| フェーズ | Phase 2: 設計 |
| 作成日   | 2026-01-24    |
| 機能名   | SkillScanner  |

---

## 1. 全体データフロー

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           scanAll()                                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ Step 1: ensureAiworkflowDir()                                     │   │
│  │                                                                    │   │
│  │   ~/.aiworkflow/skills/ が存在するか確認                          │   │
│  │         │                                                          │   │
│  │         ├── 存在する ──▶ 何もしない                               │   │
│  │         │                                                          │   │
│  │         └── 存在しない ──▶ mkdir -p で作成                        │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                               │                                          │
│                               ▼                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ Step 2: 並列スキャン (Promise.all)                                │   │
│  │                                                                    │   │
│  │   ┌─────────────────────────────────────────────────────────┐    │   │
│  │   │ scanDirectory(~/.aiworkflow/skills/, readonly=false)    │    │   │
│  │   │                                                          │    │   │
│  │   │   ▼ 各スキルディレクトリに対して                        │    │   │
│  │   │   parseSkill(skillPath, SKILL.md, false)                 │    │   │
│  │   │                                                          │    │   │
│  │   │   戻り値: ScannedSkillMetadata[] (readonly=false)        │    │   │
│  │   └─────────────────────────────────────────────────────────┘    │   │
│  │                                                                    │   │
│  │   ┌─────────────────────────────────────────────────────────┐    │   │
│  │   │ scanDirectory(~/.claude/skills/, readonly=true)         │    │   │
│  │   │                                                          │    │   │
│  │   │   ▼ 各スキルディレクトリに対して                        │    │   │
│  │   │   parseSkill(skillPath, SKILL.md, true)                  │    │   │
│  │   │                                                          │    │   │
│  │   │   戻り値: ScannedSkillMetadata[] (readonly=true)         │    │   │
│  │   └─────────────────────────────────────────────────────────┘    │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                               │                                          │
│                               ▼                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ Step 3: 結果マージ                                                │   │
│  │                                                                    │   │
│  │   [...aiworkflowSkills, ...claudeSkills]                          │   │
│  │                                                                    │   │
│  │   戻り値: ScannedSkillMetadata[]                                  │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. parseSkill() 内部データフロー

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     parseSkill(skillPath, skillMdPath, readonly)         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ Step 1: SKILL.md 読み取り                                         │   │
│  │                                                                    │   │
│  │   fs.readFile(skillMdPath, "utf-8")                               │   │
│  │         │                                                          │   │
│  │         └── 失敗 ──▶ throw Error (上位で catch)                   │   │
│  │                                                                    │   │
│  │   戻り値: content (string)                                        │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                               │                                          │
│                               ▼                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ Step 2: Frontmatter パース                                        │   │
│  │                                                                    │   │
│  │   parseFrontmatter(content)                                       │   │
│  │         │                                                          │   │
│  │         └── { frontmatter, body }                                 │   │
│  │                                                                    │   │
│  │   frontmatter.name が存在しない場合 ──▶ return null               │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                               │                                          │
│                               ▼                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ Step 3: ファイル更新日時取得                                      │   │
│  │                                                                    │   │
│  │   fs.stat(skillMdPath)                                            │   │
│  │         │                                                          │   │
│  │         └── stat.mtime を取得                                     │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                               │                                          │
│                               ▼                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ Step 4: サブディレクトリ並列スキャン (Promise.all)                │   │
│  │                                                                    │   │
│  │   ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐ │   │
│  │   │ scanSubDirectory │ │ scanSubDirectory │ │ scanSubDirectory │ │   │
│  │   │ (agents/)        │ │ (references/)    │ │ (scripts/)       │ │   │
│  │   └────────┬─────────┘ └────────┬─────────┘ └────────┬─────────┘ │   │
│  │            │                     │                     │          │   │
│  │   ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐ │   │
│  │   │ scanSubDirectory │ │ scanSubDirectory │ │ scanSubDirectory │ │   │
│  │   │ (assets/)        │ │ (schemas/)       │ │ (indexes/)       │ │   │
│  │   └────────┬─────────┘ └────────┬─────────┘ └────────┬─────────┘ │   │
│  │            │                     │                     │          │   │
│  │   ┌──────────────────────────────────────────────────────────┐   │   │
│  │   │ scanOtherFiles(skillPath)                                │   │   │
│  │   └────────┬─────────────────────────────────────────────────┘   │   │
│  │            │                                                      │   │
│  │            ▼                                                      │   │
│  │   [agents, references, scripts, assets, schemas, indexes, other] │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                               │                                          │
│                               ▼                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ Step 5: SkillMetadata 構築                                        │   │
│  │                                                                    │   │
│  │   {                                                                │   │
│  │     name: frontmatter.name,                                       │   │
│  │     description: frontmatter.description || body.slice(0, 200),   │   │
│  │     allowedTools: frontmatter["allowed-tools"] || [],             │   │
│  │     path: skillPath,                                              │   │
│  │     updatedAt: stat.mtime,                                        │   │
│  │     agents,                                                        │   │
│  │     references,                                                    │   │
│  │     scripts,                                                       │   │
│  │     assets,                                                        │   │
│  │     schemas,                                                       │   │
│  │     indexes,                                                       │   │
│  │     otherFiles,                                                    │   │
│  │     readonly,                                                      │   │
│  │   }                                                                │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. scanSubDirectory() 内部データフロー

```
┌─────────────────────────────────────────────────────────────────────────┐
│                 scanSubDirectory(skillPath, subDir)                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ Step 1: パス構築                                                  │   │
│  │                                                                    │   │
│  │   dirPath = path.join(skillPath, subDir)                          │   │
│  │                                                                    │   │
│  │   例: /home/user/.aiworkflow/skills/my-skill/agents               │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                               │                                          │
│                               ▼                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ Step 2: ディレクトリ読み取り                                      │   │
│  │                                                                    │   │
│  │   fs.readdir(dirPath, { withFileTypes: true })                    │   │
│  │         │                                                          │   │
│  │         ├── 成功 ──▶ entries 取得                                 │   │
│  │         │                                                          │   │
│  │         └── 失敗（ENOENT）──▶ return []                           │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                               │                                          │
│                               ▼                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ Step 3: 各ファイルを処理                                          │   │
│  │                                                                    │   │
│  │   for (entry of entries)                                          │   │
│  │         │                                                          │   │
│  │         ├── isFile() でない ──▶ skip                              │   │
│  │         │                                                          │   │
│  │         ├── fs.stat(filePath) ──▶ size 取得                       │   │
│  │         │                                                          │   │
│  │         ├── .md ファイル ──▶ extractDescription(filePath)         │   │
│  │         │                                                          │   │
│  │         └── SkillSubResource を構築                               │   │
│  │             {                                                      │   │
│  │               filename: entry.name,                                │   │
│  │               relativePath: path.join(subDir, entry.name),         │   │
│  │               description: (markdown の場合のみ),                  │   │
│  │               size: stat.size,                                     │   │
│  │             }                                                      │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                               │                                          │
│                               ▼                                          │
│                       return SkillSubResource[]                          │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 4. データ型の流れ

```
入力データ
━━━━━━━━
ファイルシステム
├── ~/.aiworkflow/skills/
│   └── skill-a/
│       ├── SKILL.md (YAML + Markdown)
│       ├── agents/task-1.md
│       └── references/guide.md
│
└── ~/.claude/skills/
    └── skill-b/
        └── SKILL.md

        │
        ▼

中間データ
━━━━━━━━
parseFrontmatter() → { frontmatter: Record<string, unknown>, body: string }

scanSubDirectory() → SkillSubResource[]
  {
    filename: string,
    relativePath: string,
    description?: string,
    size: number
  }

scanOtherFiles() → SkillOtherFile[]
  {
    filename: string,
    type: "evals" | "logs" | "package" | "other",
    size: number
  }

        │
        ▼

出力データ
━━━━━━━━
scanAll() → ScannedSkillMetadata[]
  {
    name: string,
    description: string,
    allowedTools: string[],
    path: string,
    updatedAt: Date,
    agents: SkillSubResource[],
    references: SkillSubResource[],
    scripts: SkillSubResource[],
    assets: SkillSubResource[],
    schemas: SkillSubResource[],
    indexes: SkillSubResource[],
    otherFiles: SkillOtherFile[],
    readonly: boolean
  }
```

---

## 5. 並列処理の最適化

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 並列処理ポイント                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  1. scanAll() 内の scanDirectory() 呼び出し                             │
│     ├── aiworkflow ディレクトリスキャン ──┐                             │
│     │                                      ├──▶ Promise.all             │
│     └── claude ディレクトリスキャン ───────┘                             │
│                                                                          │
│  2. parseSkill() 内のサブディレクトリスキャン                           │
│     ├── agents/ ──────────────┐                                         │
│     ├── references/ ──────────┤                                         │
│     ├── scripts/ ─────────────┤                                         │
│     ├── assets/ ──────────────┼──▶ Promise.all (7並列)                  │
│     ├── schemas/ ─────────────┤                                         │
│     ├── indexes/ ─────────────┤                                         │
│     └── otherFiles ───────────┘                                         │
│                                                                          │
│  ※ scanDirectory() 内の各スキルのパースは直列                           │
│    （ファイルシステムへの負荷を考慮）                                   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 変更履歴

| Version | Date       | Changes  |
| ------- | ---------- | -------- |
| 1.0.0   | 2026-01-24 | 初版作成 |
