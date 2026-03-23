# Phase 2 成果物: 設計書

## メタ情報

| 項目     | 値                            |
| -------- | ----------------------------- |
| Phase    | 2                             |
| タスクID | TASK-SC-04-OUTPUT-PERSISTENCE |
| 作成日   | 2026-03-23                    |

---

## 1. SkillFileWriter クラス設計

### 1.1 クラス図

```
┌──────────────────────────────────────────────────────┐
│                  SkillFileWriter                      │
├──────────────────────────────────────────────────────┤
│ - basePath: string                                    │
├──────────────────────────────────────────────────────┤
│ + persist(skillName, content, options?): Promise<...> │
│ - validateSkillName(skillName: string): void          │
│ - checkExistingSkill(skillPath: string): Promise<void>│
│ - writeFiles(skillPath, content): Promise<string[]>   │
│ - rollback(writtenFiles, skillPath): Promise<void>     │
│ - ensureDirectory(dirPath: string): Promise<void>     │
│ - writeFile(filePath, content): Promise<void>         │
│ - validateFileName(name: string): void                │
├──────────────────────────────────────────────────────┤
│ + static SKILL_MD_FILENAME = "SKILL.md"               │
│ + static AGENTS_DIR = "agents"                        │
│ + static SCRIPTS_DIR = "scripts"                      │
│ + static REFERENCES_DIR = "references"                │
└──────────────────────────────────────────────────────┘
```

### 1.2 メソッド詳細

#### persist()

```typescript
async persist(
  skillName: string,
  content: SkillGeneratedContent,
  options?: { overwrite?: boolean }
): Promise<{ skillPath: string; files: string[] }> {
  // 1. skillName バリデーション
  this.validateSkillName(skillName);

  // 2. 既存スキルチェック
  const skillPath = path.join(this.basePath, skillName);
  if (!options?.overwrite) {
    await this.checkExistingSkill(skillPath);
  }

  // 3. ディレクトリ作成
  await this.ensureDirectory(skillPath);

  // 4. ファイル書き込み（アトミック: 失敗時ロールバック）
  const files = await this.writeFiles(skillPath, content);

  return { skillPath, files };
}
```

#### validateSkillName()

```typescript
private validateSkillName(skillName: string): void {
  // P42 準拠 3段バリデーション
  if (typeof skillName !== "string") {
    throw { code: "VALIDATION_ERROR", message: "skillName must be a string" };
  }
  if (skillName === "") {
    throw { code: "VALIDATION_ERROR", message: "skillName must not be empty" };
  }
  if (skillName.trim() === "") {
    throw { code: "VALIDATION_ERROR", message: "skillName must not be whitespace only" };
  }

  // パストラバーサル防止
  if (skillName.includes("..") || skillName.includes("/") || skillName.includes("\\")) {
    throw { code: "PATH_TRAVERSAL", message: "skillName contains invalid characters" };
  }

  // path.resolve でサニタイズ後、basePath プレフィックス確認
  const resolved = path.resolve(this.basePath, skillName);
  const normalizedBase = path.resolve(this.basePath);
  if (!resolved.startsWith(normalizedBase + path.sep)) {
    throw { code: "PATH_TRAVERSAL", message: "Resolved path escapes base directory" };
  }
}
```

#### checkExistingSkill()

```typescript
private async checkExistingSkill(skillPath: string): Promise<void> {
  try {
    await fs.access(skillPath);
    throw {
      code: "SKILL_ALREADY_EXISTS",
      message: `Skill already exists at ${skillPath}`
    };
  } catch (err: unknown) {
    // ENOENT = ディレクトリが存在しない = 正常
    if (err && typeof err === "object" && "code" in err && err.code === "ENOENT") {
      return;
    }
    // SKILL_ALREADY_EXISTS は再スロー
    if (err && typeof err === "object" && "code" in err && err.code === "SKILL_ALREADY_EXISTS") {
      throw err;
    }
    throw err;
  }
}
```

#### writeFiles()

```typescript
private async writeFiles(
  skillPath: string,
  content: SkillGeneratedContent
): Promise<string[]> {
  const writtenFiles: string[] = [];

  try {
    // 1. SKILL.md（必須）
    const skillMdPath = path.join(skillPath, SkillFileWriter.SKILL_MD_FILENAME);
    await this.writeFile(skillMdPath, content.skillMd);
    writtenFiles.push(skillMdPath);

    // 2. agents/
    if (content.agents.length > 0) {
      const agentsDir = path.join(skillPath, SkillFileWriter.AGENTS_DIR);
      await this.ensureDirectory(agentsDir);
      for (const agent of content.agents) {
        this.validateFileName(agent.name);
        const filePath = path.join(agentsDir, `${agent.name}.md`);
        await this.writeFile(filePath, agent.content);
        writtenFiles.push(filePath);
      }
    }

    // 3. scripts/
    if (content.scripts.length > 0) {
      const scriptsDir = path.join(skillPath, SkillFileWriter.SCRIPTS_DIR);
      await this.ensureDirectory(scriptsDir);
      for (const script of content.scripts) {
        this.validateFileName(script.name);
        const filePath = path.join(scriptsDir, script.name);
        await this.writeFile(filePath, script.content);
        writtenFiles.push(filePath);
      }
    }

    // 4. references/
    if (content.references.length > 0) {
      const refsDir = path.join(skillPath, SkillFileWriter.REFERENCES_DIR);
      await this.ensureDirectory(refsDir);
      for (const ref of content.references) {
        this.validateFileName(ref.name);
        const filePath = path.join(refsDir, `${ref.name}.md`);
        await this.writeFile(filePath, ref.content);
        writtenFiles.push(filePath);
      }
    }

    return writtenFiles;
  } catch (err) {
    // ロールバック: 書き込み済みファイルを逆順で削除
    await this.rollback(writtenFiles, skillPath);
    throw err;
  }
}
```

#### rollback()

```typescript
/**
 * 方式 A 採用: ファイル逆順削除 + 空ディレクトリ除去
 * - シンプルで予測可能。overwrite: true 時にも既存ファイルを誤削除しない
 * - 方式 B（recursive rm）は overwrite 時に既存ファイルまで消すリスクがあり不採用
 * - 方式 C（一時ディレクトリ）は OS 跨ぎの rename 制約があり不採用
 *
 * MINOR-2 (UT-SC-04-002) 先取り適用: skillPath を引数で受け取る設計に変更。
 * writtenFiles[0] からの逆算は writtenFiles が空の場合に "." を返すバグがあったため。
 */
private async rollback(writtenFiles: string[], skillPath: string): Promise<void> {
  // 1. 書き込み済みファイルを逆順で削除
  for (const filePath of writtenFiles.reverse()) {
    try {
      await fs.unlink(filePath);
    } catch {
      // ロールバック中のエラーはログのみ（ベストエフォート）
      console.error(`Rollback: failed to delete ${filePath}`);
    }
  }

  // 2. 空になったサブディレクトリを削除（agents/, scripts/, references/）
  const subDirs = [
    SkillFileWriter.AGENTS_DIR,
    SkillFileWriter.SCRIPTS_DIR,
    SkillFileWriter.REFERENCES_DIR,
  ];
  for (const dir of subDirs) {
    const dirPath = path.join(skillPath, dir);
    try {
      const entries = await fs.readdir(dirPath);
      if (entries.length === 0) {
        await fs.rmdir(dirPath);
      }
    } catch {
      // ディレクトリが存在しない場合は無視
    }
  }

  // 3. スキルディレクトリ自体が空なら削除
  // skillPath は引数で受け取る（writtenFiles[0] からの逆算バグを回避）
  try {
    const entries = await fs.readdir(skillPath);
    if (entries.length === 0) {
      await fs.rmdir(skillPath);
    }
  } catch {
    // 無視
  }
}
```

---

## 2. SkillGeneratedContent 型定義（完全版）

### 2.1 型定義

```typescript
/**
 * LLM が生成したスキルコンテンツを保持する中間データ型。
 * RuntimeSkillCreatorExecuteResult（成功/失敗のみ）とは別に、
 * execute() 内部でキャプチャされ SkillFileWriter.persist() に渡される。
 */
export interface SkillGeneratedContent {
  /** SKILL.md の全内容（必須、空文字列不可） */
  skillMd: string;

  /** agents/ 配下に配置するエージェント定義 */
  agents: Array<{
    /** ファイル名（拡張子なし）。例: "analyze-request" → agents/analyze-request.md */
    name: string;
    /** ファイルの全内容 */
    content: string;
  }>;

  /** scripts/ 配下に配置するスクリプトファイル */
  scripts: Array<{
    /** ファイル名（拡張子あり）。例: "generate-index.js" → scripts/generate-index.js */
    name: string;
    /** ファイルの全内容 */
    content: string;
  }>;

  /** references/ 配下に配置する参照ドキュメント */
  references: Array<{
    /** ファイル名（拡張子なし）。例: "patterns" → references/patterns.md */
    name: string;
    /** ファイルの全内容 */
    content: string;
  }>;
}
```

### 2.2 配置先

- `packages/shared/src/types/skillCreator.ts` に追加（P32 対策: shared に配置して desktop / web 双方から参照可能にする）
- `apps/desktop/src/preload/types.ts` への追加は不要（Preload API はこの型を直接扱わない。persist() は Main Process 内で完結する）

---

## 3. execute() 呼び出しフロー

### 3.1 改修後のフロー図

```
[Renderer]
   │
   │  IPC: skill-creator:execute-plan
   │  args: { planId, skillSpec, authMode, apiKey }
   ▼
[Main Process: IPC Handler]
   │
   ▼
[RuntimeSkillCreatorFacade.execute()]
   │
   ├─ 1. SkillExecutor.execute(request)
   │     └─ LLM 呼び出し → コンテンツ生成
   │
   ├─ 2. コンテンツ抽出 → SkillGeneratedContent にマッピング
   │
   ├─ 3. SkillFileWriter.persist(skillName, generatedContent)
   │     ├─ validateSkillName()
   │     ├─ checkExistingSkill()
   │     ├─ ensureDirectory()
   │     └─ writeFiles() → SKILL.md / agents/ / scripts/ / references/
   │         └─ 失敗時: rollback() で書き込み済みファイルを削除
   │
   └─ 4. RuntimeSkillCreatorExecuteResult を返却
         ├─ 成功: { executeId, skillName, success: true }
         └─ 失敗: { executeId, skillName, success: false, error: "..." }
```

### 3.2 エラーハンドリング

| エラー種別           | 発生箇所             | 対処                                 |
| -------------------- | -------------------- | ------------------------------------ |
| VALIDATION_ERROR     | validateSkillName()  | 即座に error として返却              |
| PATH_TRAVERSAL       | validateSkillName()  | 即座に error として返却              |
| SKILL_ALREADY_EXISTS | checkExistingSkill() | 即座に error として返却              |
| WRITE_ERROR          | writeFiles()         | rollback() 実行後に error として返却 |
| ROLLBACK_FAILED      | rollback()           | error ログ出力後、WRITE_ERROR で返却 |

---

## 4. パストラバーサル防止ロジック

### 4.1 バリデーション層

```
入力: skillName (string)
  │
  ├─ 1. typeof チェック    → "string" でない場合は拒否
  ├─ 2. 空文字列チェック   → "" の場合は拒否
  ├─ 3. トリム空文字列     → "   " の場合は拒否 (P42)
  ├─ 4. 危険文字検出       → ".." "/" "\\" を含む場合は拒否
  └─ 5. path.resolve 検証  → 解決後パスが basePath 配下でない場合は拒否
```

### 4.2 テストパターン（Phase 4 で実装）

| 入力             | 期待結果 | 理由                       |
| ---------------- | -------- | -------------------------- |
| `"my-skill"`     | PASS     | 正常なスキル名             |
| `"my_skill_01"`  | PASS     | アンダースコア・数字を許容 |
| `"../malicious"` | REJECT   | 親ディレクトリ参照         |
| `"/absolute"`    | REJECT   | 絶対パス                   |
| `"a/b"`          | REJECT   | サブディレクトリ           |
| `""`             | REJECT   | 空文字列                   |
| `"   "`          | REJECT   | スペースのみ (P42)         |
| `"./relative"`   | REJECT   | カレントディレクトリ参照   |
| `"a\\b"`         | REJECT   | Windows パス区切り         |

---

## 5. DI 配線設計

### 5.1 RuntimeSkillCreatorFacadeDeps への追加

```typescript
// 現行の DI 構造
interface RuntimeSkillCreatorFacadeDeps {
  skillExecutor: SkillExecutor;
  llmAdapter?: ILLMAdapter;
  resourceLoader?: ResourceLoader;
}

// 改修後
interface RuntimeSkillCreatorFacadeDeps {
  skillExecutor: SkillExecutor;
  llmAdapter?: ILLMAdapter;
  resourceLoader?: ResourceLoader;
  skillFileWriter?: SkillFileWriter; // 追加（optional: 未設定時は永続化をスキップ）
}
```

### 5.2 方式選択の根拠

- **方式 A（採用）**: `RuntimeSkillCreatorFacadeDeps` にオプショナルプロパティとして追加
  - SkillFileWriter の生成に BrowserWindow 等の遅延依存が不要
  - ファクトリで `new SkillFileWriter(basePath)` → deps に渡す
  - 未設定時は永続化をスキップ（graceful degradation: P54 準拠）
- **方式 B（不採用）**: Setter Injection
  - P34 の適用ケース（BrowserWindow 等の遅延リソース）ではないため不適切

### 5.3 ファクトリ改修

```typescript
// 既存ファクトリの改修箇所
function createRuntimeSkillCreatorFacade(): RuntimeSkillCreatorFacade {
  const skillFileWriter = new SkillFileWriter(
    path.join(process.cwd(), ".claude", "skills"),
  );

  return new RuntimeSkillCreatorFacade({
    skillExecutor,
    llmAdapter,
    resourceLoader,
    skillFileWriter, // 追加
  });
}
```
