# メソッド詳細設計書

## メタ情報

| 項目     | 内容          |
| -------- | ------------- |
| タスクID | TASK-2A       |
| フェーズ | Phase 2: 設計 |
| 作成日   | 2026-01-24    |
| 機能名   | SkillScanner  |

---

## 1. 公開メソッド

### 1.1 scanAll()

| 項目           | 内容                                                          |
| -------------- | ------------------------------------------------------------- |
| **シグネチャ** | `async scanAll(): Promise<ScannedSkillMetadata[]>`            |
| **責務**       | 両ディレクトリをスキャンし、全スキルのメタデータを返す        |
| **入力**       | なし                                                          |
| **出力**       | `ScannedSkillMetadata[]` - スキャンされた全スキルのメタデータ |

**処理フロー**:

```
1. ensureAiworkflowDir() を呼び出し
   └─▶ ~/.aiworkflow/skills/ が存在しない場合は作成

2. aiworkflow スキルをスキャン
   └─▶ scanDirectory(aiworkflowSkillsDir, readonly=false)

3. Claude CLI スキルをスキャン
   └─▶ scanDirectory(claudeSkillsDir, readonly=true)
   └─▶ ディレクトリが存在しない場合は空配列

4. 結果をマージして返却
   └─▶ [...aiworkflowSkills, ...claudeSkills]
```

**エラーハンドリング**:

| エラー                          | 対処                           |
| ------------------------------- | ------------------------------ |
| aiworkflow ディレクトリ作成失敗 | エラーをスロー                 |
| claude ディレクトリ不在         | 空配列として処理               |
| 個別スキルのパースエラー        | そのスキルをスキップ、ログ出力 |

**擬似コード**:

```typescript
async scanAll(): Promise<ScannedSkillMetadata[]> {
  // 1. aiworkflow ディレクトリを確保
  await this.ensureAiworkflowDir();

  // 2. 両ディレクトリをスキャン
  const [aiworkflowSkills, claudeSkills] = await Promise.all([
    this.scanDirectory(this.aiworkflowSkillsDir, false),
    this.scanDirectory(this.claudeSkillsDir, true),
  ]);

  // 3. 結果をマージ
  return [...aiworkflowSkills, ...claudeSkills];
}
```

---

## 2. プライベートメソッド

### 2.1 ensureAiworkflowDir()

| 項目           | 内容                                                 |
| -------------- | ---------------------------------------------------- |
| **シグネチャ** | `private async ensureAiworkflowDir(): Promise<void>` |
| **責務**       | aiworkflow スキルディレクトリの存在を保証する        |
| **入力**       | なし                                                 |
| **出力**       | なし（void）                                         |

**処理フロー**:

```
1. mkdir(aiworkflowSkillsDir, { recursive: true }) を実行
   └─▶ ディレクトリが存在する場合は何もしない
   └─▶ 存在しない場合は再帰的に作成
```

**エラーハンドリング**:

| エラー           | 対処                   |
| ---------------- | ---------------------- |
| 権限エラー       | エラーをそのままスロー |
| ディスク容量不足 | エラーをそのままスロー |

**擬似コード**:

```typescript
private async ensureAiworkflowDir(): Promise<void> {
  await fs.mkdir(this.aiworkflowSkillsDir, { recursive: true });
}
```

---

### 2.2 scanDirectory()

| 項目           | 内容                                                                                           |
| -------------- | ---------------------------------------------------------------------------------------------- |
| **シグネチャ** | `private async scanDirectory(dir: string, readonly: boolean): Promise<ScannedSkillMetadata[]>` |
| **責務**       | 指定ディレクトリ内のスキルをスキャンする                                                       |
| **入力**       | `dir`: スキャン対象ディレクトリ, `readonly`: 読み取り専用フラグ                                |
| **出力**       | `ScannedSkillMetadata[]` - スキャンされたスキルのメタデータ                                    |

**処理フロー**:

```
1. ディレクトリを読み取り
   └─▶ withFileTypes: true でエントリ取得

2. 各エントリに対して:
   ├─▶ ディレクトリでない場合はスキップ
   ├─▶ 名前に ".." や "/" を含む場合はスキップ（セキュリティ）
   └─▶ parseSkill() を呼び出し
       └─▶ null が返った場合はスキップ

3. 有効なスキルのみを配列で返却
```

**エラーハンドリング**:

| エラー                   | 対処                   |
| ------------------------ | ---------------------- |
| ディレクトリ不在         | 空配列を返却           |
| 読み取り権限エラー       | 空配列を返却、ログ出力 |
| 個別スキルのパースエラー | そのスキルをスキップ   |

**擬似コード**:

```typescript
private async scanDirectory(
  dir: string,
  readonly: boolean
): Promise<ScannedSkillMetadata[]> {
  const skills: ScannedSkillMetadata[] = [];

  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      // ディレクトリのみ処理
      if (!entry.isDirectory()) continue;

      // セキュリティチェック
      if (entry.name.includes("..") || entry.name.includes("/")) continue;

      const skillPath = path.join(dir, entry.name);
      const skillMdPath = path.join(skillPath, "SKILL.md");

      try {
        const skill = await this.parseSkill(skillPath, skillMdPath, readonly);
        if (skill) skills.push(skill);
      } catch (e) {
        console.warn(`スキル読み込みスキップ: ${entry.name}`, e);
      }
    }
  } catch (e) {
    // ディレクトリが存在しない場合は空配列
    if ((e as NodeJS.ErrnoException).code !== "ENOENT") {
      console.warn(`ディレクトリ読み込みエラー: ${dir}`, e);
    }
  }

  return skills;
}
```

---

### 2.3 parseSkill()

| 項目           | 内容                                                                                                                         |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| **シグネチャ** | `private async parseSkill(skillPath: string, skillMdPath: string, readonly: boolean): Promise<ScannedSkillMetadata \| null>` |
| **責務**       | SKILL.md を読み取り、SkillMetadata を構築する                                                                                |
| **入力**       | `skillPath`: スキルディレクトリパス, `skillMdPath`: SKILL.md パス, `readonly`: 読み取り専用フラグ                            |
| **出力**       | `ScannedSkillMetadata                                                                                                        | null` - パース成功時はメタデータ、失敗時は null |

**処理フロー**:

```
1. SKILL.md を読み取り
   └─▶ fs.readFile(skillMdPath, "utf-8")

2. Frontmatter をパース
   └─▶ parseFrontmatter(content)

3. name フィールドの検証
   └─▶ 存在しない場合は null を返却

4. ファイル更新日時を取得
   └─▶ fs.stat(skillMdPath)

5. サブディレクトリを並列スキャン
   └─▶ Promise.all([
         scanSubDirectory(agents),
         scanSubDirectory(references),
         scanSubDirectory(scripts),
         scanSubDirectory(assets),
         scanSubDirectory(schemas),
         scanSubDirectory(indexes),
         scanOtherFiles()
       ])

6. メタデータを構築して返却
```

**エラーハンドリング**:

| エラー              | 対処                  |
| ------------------- | --------------------- |
| SKILL.md 不在       | null を返却           |
| YAML パースエラー   | null を返却、ログ出力 |
| name フィールド不在 | null を返却           |

**擬似コード**:

```typescript
private async parseSkill(
  skillPath: string,
  skillMdPath: string,
  readonly: boolean
): Promise<ScannedSkillMetadata | null> {
  const content = await fs.readFile(skillMdPath, "utf-8");
  const { frontmatter, body } = this.parseFrontmatter(content);

  // name 必須チェック
  if (!frontmatter.name || typeof frontmatter.name !== "string") {
    return null;
  }

  const stat = await fs.stat(skillMdPath);

  // サブディレクトリを並列スキャン
  const [agents, references, scripts, assets, schemas, indexes, otherFiles] =
    await Promise.all([
      this.scanSubDirectory(skillPath, "agents"),
      this.scanSubDirectory(skillPath, "references"),
      this.scanSubDirectory(skillPath, "scripts"),
      this.scanSubDirectory(skillPath, "assets"),
      this.scanSubDirectory(skillPath, "schemas"),
      this.scanSubDirectory(skillPath, "indexes"),
      this.scanOtherFiles(skillPath),
    ]);

  return {
    name: frontmatter.name,
    description:
      typeof frontmatter.description === "string"
        ? frontmatter.description
        : body.slice(0, 200),
    allowedTools: Array.isArray(frontmatter["allowed-tools"])
      ? frontmatter["allowed-tools"]
      : [],
    path: skillPath,
    updatedAt: stat.mtime,
    agents,
    references,
    scripts,
    assets,
    schemas,
    indexes,
    otherFiles,
    readonly,
  };
}
```

---

### 2.4 scanSubDirectory()

| 項目           | 内容                                                                                             |
| -------------- | ------------------------------------------------------------------------------------------------ |
| **シグネチャ** | `private async scanSubDirectory(skillPath: string, subDir: string): Promise<SkillSubResource[]>` |
| **責務**       | 指定されたサブディレクトリ内のファイル一覧を取得                                                 |
| **入力**       | `skillPath`: スキルディレクトリパス, `subDir`: サブディレクトリ名                                |
| **出力**       | `SkillSubResource[]` - サブディレクトリ内のリソース情報                                          |

**処理フロー**:

```
1. サブディレクトリパスを構築
   └─▶ path.join(skillPath, subDir)

2. ディレクトリを読み取り
   └─▶ fs.readdir(dirPath, { withFileTypes: true })

3. 各ファイルに対して:
   ├─▶ ファイルでない場合はスキップ
   ├─▶ ファイル情報を取得（stat）
   ├─▶ Markdown の場合は説明を抽出
   └─▶ SkillSubResource を構築

4. リソース配列を返却
```

**エラーハンドリング**:

| エラー               | 対処                   |
| -------------------- | ---------------------- |
| ディレクトリ不在     | 空配列を返却           |
| ファイル stat エラー | そのファイルをスキップ |

**擬似コード**:

```typescript
private async scanSubDirectory(
  skillPath: string,
  subDir: string
): Promise<SkillSubResource[]> {
  const dirPath = path.join(skillPath, subDir);
  const resources: SkillSubResource[] = [];

  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isFile()) continue;

      const filePath = path.join(dirPath, entry.name);

      try {
        const stat = await fs.stat(filePath);

        // Markdown の場合は説明を抽出
        let description: string | undefined;
        if (entry.name.endsWith(".md")) {
          description = await this.extractDescription(filePath);
        }

        resources.push({
          filename: entry.name,
          relativePath: path.join(subDir, entry.name),
          description,
          size: stat.size,
        });
      } catch {
        // ファイル情報取得エラーはスキップ
      }
    }
  } catch {
    // ディレクトリが存在しない場合は空配列
  }

  return resources;
}
```

---

### 2.5 scanOtherFiles()

| 項目           | 内容                                                                         |
| -------------- | ---------------------------------------------------------------------------- |
| **シグネチャ** | `private async scanOtherFiles(skillPath: string): Promise<SkillOtherFile[]>` |
| **責務**       | スキルディレクトリ直下のその他のファイルをスキャン                           |
| **入力**       | `skillPath`: スキルディレクトリパス                                          |
| **出力**       | `SkillOtherFile[]` - その他ファイル情報                                      |

**処理フロー**:

```
1. ディレクトリを読み取り
   └─▶ fs.readdir(skillPath, { withFileTypes: true })

2. 各エントリに対して:
   ├─▶ ファイルでない場合はスキップ
   ├─▶ "SKILL.md" はスキップ
   ├─▶ ファイルタイプを判定
   │   ├─▶ EVALS.json → "evals"
   │   ├─▶ LOGS.md → "logs"
   │   ├─▶ package.json → "package"
   │   └─▶ その他 → "other"
   └─▶ SkillOtherFile を構築

3. ファイル配列を返却
```

**擬似コード**:

```typescript
private async scanOtherFiles(skillPath: string): Promise<SkillOtherFile[]> {
  const files: SkillOtherFile[] = [];

  try {
    const entries = await fs.readdir(skillPath, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isFile() || entry.name === "SKILL.md") continue;

      const filePath = path.join(skillPath, entry.name);

      try {
        const stat = await fs.stat(filePath);

        // ファイルタイプを判定
        let type: SkillOtherFile["type"] = "other";
        if (entry.name === "EVALS.json") type = "evals";
        else if (entry.name === "LOGS.md") type = "logs";
        else if (entry.name === "package.json") type = "package";

        files.push({
          filename: entry.name,
          type,
          size: stat.size,
        });
      } catch {
        // ファイル情報取得エラーはスキップ
      }
    }
  } catch {
    // エラー時は空配列
  }

  return files;
}
```

---

### 2.6 extractDescription()

| 項目           | 内容                                                                  |
| -------------- | --------------------------------------------------------------------- |
| **シグネチャ** | `private async extractDescription(filePath: string): Promise<string>` |
| **責務**       | Markdown ファイルから説明テキストを抽出                               |
| **入力**       | `filePath`: Markdown ファイルパス                                     |
| **出力**       | `string` - 抽出された説明（最大100文字）                              |

**処理フロー**:

```
1. ファイルを読み取り
   └─▶ fs.readFile(filePath, "utf-8")

2. 見出しを検索
   └─▶ 正規表現 /^#\s+(.+)$/m でマッチ
   └─▶ マッチした場合は見出しテキストを返却

3. 見出しがない場合
   └─▶ 最初の非空行を取得（最大100文字）

4. 抽出できない場合は空文字を返却
```

**擬似コード**:

```typescript
private async extractDescription(filePath: string): Promise<string> {
  try {
    const content = await fs.readFile(filePath, "utf-8");

    // 最初の見出しを検索
    const headingMatch = content.match(/^#\s+(.+)$/m);
    if (headingMatch) {
      return headingMatch[1].trim();
    }

    // 見出しがない場合は最初の非空行
    const lines = content.split("\n").filter((line) => line.trim());
    if (lines.length > 0) {
      return lines[0].slice(0, 100);
    }

    return "";
  } catch {
    return "";
  }
}
```

---

### 2.7 parseFrontmatter()

| 項目           | 内容                                                                                                |
| -------------- | --------------------------------------------------------------------------------------------------- |
| **シグネチャ** | `private parseFrontmatter(content: string): { frontmatter: Record<string, unknown>; body: string }` |
| **責務**       | YAML Frontmatter を抽出・パースする                                                                 |
| **入力**       | `content`: Markdown コンテンツ                                                                      |
| **出力**       | `{ frontmatter, body }` - パース結果                                                                |

**処理フロー**:

```
1. Frontmatter 区切りを検出
   └─▶ 正規表現 /^---\n([\s\S]*?)\n---\n([\s\S]*)$/ でマッチ

2. マッチしない場合
   └─▶ { frontmatter: {}, body: content } を返却

3. YAML 部分をパース
   └─▶ yaml.parse(yamlContent)

4. パースエラーの場合
   └─▶ { frontmatter: {}, body: content } を返却

5. 正常な場合
   └─▶ { frontmatter: parsedYaml, body: bodyContent } を返却
```

**擬似コード**:

```typescript
private parseFrontmatter(content: string): {
  frontmatter: Record<string, unknown>;
  body: string;
} {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);

  if (!match) {
    return { frontmatter: {}, body: content };
  }

  try {
    const frontmatter = yaml.parse(match[1]) || {};
    return {
      frontmatter,
      body: match[2],
    };
  } catch {
    return { frontmatter: {}, body: content };
  }
}
```

---

## 変更履歴

| Version | Date       | Changes  |
| ------- | ---------- | -------- |
| 1.0.0   | 2026-01-24 | 初版作成 |
