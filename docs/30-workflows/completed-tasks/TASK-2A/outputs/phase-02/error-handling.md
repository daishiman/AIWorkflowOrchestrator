# エラーハンドリング設計書

## メタ情報

| 項目     | 内容          |
| -------- | ------------- |
| タスクID | TASK-2A       |
| フェーズ | Phase 2: 設計 |
| 作成日   | 2026-01-24    |
| 機能名   | SkillScanner  |

---

## 1. エラーハンドリング方針

### 1.1 基本方針

| 方針                 | 説明                                                       |
| -------------------- | ---------------------------------------------------------- |
| フォールトトレラント | 1つのスキルのエラーが全体のスキャンを中断しない            |
| ログ出力             | エラー発生時は警告ログを出力し、原因を追跡可能にする       |
| 部分成功許容         | 一部のスキルが読み取れなくても、読み取れたスキルは返却する |
| 致命的エラーの区別   | aiworkflow ディレクトリ作成失敗のみ致命的エラーとして扱う  |

### 1.2 エラー分類

| 分類           | 対処方針                   | 例                              |
| -------------- | -------------------------- | ------------------------------- |
| 致命的エラー   | エラーをスロー、処理中止   | aiworkflow ディレクトリ作成失敗 |
| 回復可能エラー | スキップして継続、警告ログ | SKILL.md パースエラー           |
| 無視可能エラー | スキップして継続、ログなし | サブディレクトリ不在            |

---

## 2. エラーパターン一覧

### 2.1 ensureAiworkflowDir()

| エラーパターン       | エラーコード | 対処方針                                 | ログレベル |
| -------------------- | ------------ | ---------------------------------------- | ---------- |
| ディレクトリ作成失敗 | EACCES       | エラーをスロー                           | error      |
| ディスク容量不足     | ENOSPC       | エラーをスロー                           | error      |
| パスが存在しファイル | EEXIST       | ディレクトリなら成功、ファイルならエラー | error      |

**実装例**:

```typescript
private async ensureAiworkflowDir(): Promise<void> {
  try {
    await fs.mkdir(this.aiworkflowSkillsDir, { recursive: true });
  } catch (e) {
    const error = e as NodeJS.ErrnoException;
    // EEXIST は recursive: true で発生しないはずだが念のため
    if (error.code !== "EEXIST") {
      console.error(
        `aiworkflow ディレクトリ作成失敗: ${this.aiworkflowSkillsDir}`,
        error
      );
      throw error;
    }
  }
}
```

---

### 2.2 scanDirectory()

| エラーパターン               | エラーコード | 対処方針     | ログレベル |
| ---------------------------- | ------------ | ------------ | ---------- |
| ディレクトリが存在しない     | ENOENT       | 空配列を返却 | なし       |
| ディレクトリ読み取り権限なし | EACCES       | 空配列を返却 | warn       |
| パスがディレクトリでない     | ENOTDIR      | 空配列を返却 | warn       |

**実装例**:

```typescript
private async scanDirectory(
  dir: string,
  readonly: boolean
): Promise<ScannedSkillMetadata[]> {
  const skills: ScannedSkillMetadata[] = [];

  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    // ... スキャン処理
  } catch (e) {
    const error = e as NodeJS.ErrnoException;
    if (error.code === "ENOENT") {
      // ディレクトリが存在しない場合は正常（特に ~/.claude/skills/）
      return [];
    }
    console.warn(`ディレクトリ読み込みエラー: ${dir}`, error.message);
    return [];
  }

  return skills;
}
```

---

### 2.3 parseSkill()

| エラーパターン            | エラーコード | 対処方針    | ログレベル |
| ------------------------- | ------------ | ----------- | ---------- |
| SKILL.md が存在しない     | ENOENT       | null を返却 | なし       |
| SKILL.md 読み取り権限なし | EACCES       | null を返却 | warn       |
| YAML Frontmatter 不正     | -            | null を返却 | warn       |
| name フィールドがない     | -            | null を返却 | なし       |
| description が長すぎる    | -            | 切り詰め    | なし       |

**実装例**:

```typescript
private async parseSkill(
  skillPath: string,
  skillMdPath: string,
  readonly: boolean
): Promise<ScannedSkillMetadata | null> {
  let content: string;

  try {
    content = await fs.readFile(skillMdPath, "utf-8");
  } catch (e) {
    const error = e as NodeJS.ErrnoException;
    if (error.code !== "ENOENT") {
      console.warn(`SKILL.md 読み込みエラー: ${skillMdPath}`, error.message);
    }
    return null;
  }

  const { frontmatter } = this.parseFrontmatter(content);

  if (!frontmatter.name || typeof frontmatter.name !== "string") {
    // name がない場合はスキルとして認識しない
    return null;
  }

  // ... 以降の処理
}
```

---

### 2.4 scanSubDirectory()

| エラーパターン           | エラーコード | 対処方針               | ログレベル |
| ------------------------ | ------------ | ---------------------- | ---------- |
| ディレクトリが存在しない | ENOENT       | 空配列を返却           | なし       |
| 読み取り権限なし         | EACCES       | 空配列を返却           | なし       |
| ファイル stat 取得失敗   | -            | そのファイルをスキップ | なし       |

**実装例**:

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
        // ... リソース構築
        resources.push({ /* ... */ });
      } catch {
        // ファイル情報取得エラーは無視
      }
    }
  } catch {
    // ディレクトリが存在しない場合は空配列
  }

  return resources;
}
```

---

### 2.5 extractDescription()

| エラーパターン       | 対処方針       | ログレベル |
| -------------------- | -------------- | ---------- |
| ファイル読み取り失敗 | 空文字を返却   | なし       |
| 見出しが見つからない | 最初の行を使用 | なし       |
| 空ファイル           | 空文字を返却   | なし       |

**実装例**:

```typescript
private async extractDescription(filePath: string): Promise<string> {
  try {
    const content = await fs.readFile(filePath, "utf-8");

    const headingMatch = content.match(/^#\s+(.+)$/m);
    if (headingMatch) {
      return headingMatch[1].trim();
    }

    const lines = content.split("\n").filter((line) => line.trim());
    return lines[0]?.slice(0, 100) || "";
  } catch {
    return "";
  }
}
```

---

### 2.6 parseFrontmatter()

| エラーパターン           | 対処方針                             | ログレベル |
| ------------------------ | ------------------------------------ | ---------- |
| Frontmatter 区切りがない | `{ frontmatter: {}, body: content }` | なし       |
| YAML パースエラー        | `{ frontmatter: {}, body: content }` | なし       |
| Frontmatter が null      | 空オブジェクトとして扱う             | なし       |

**実装例**:

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
    return { frontmatter, body: match[2] };
  } catch {
    return { frontmatter: {}, body: content };
  }
}
```

---

## 3. セキュリティ関連エラー

### 3.1 パストラバーサル攻撃

| 検出パターン           | 対処方針                 | ログレベル |
| ---------------------- | ------------------------ | ---------- |
| スキル名に `..` を含む | そのスキルをスキップ     | warn       |
| スキル名に `/` を含む  | そのスキルをスキップ     | warn       |
| シンボリックリンク     | そのまま処理（制限なし） | なし       |

**実装例**:

```typescript
private async scanDirectory(
  dir: string,
  readonly: boolean
): Promise<ScannedSkillMetadata[]> {
  // ...
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    // セキュリティチェック: パストラバーサル防止
    if (entry.name.includes("..") || entry.name.includes("/")) {
      console.warn(`不正なスキル名をスキップ: ${entry.name}`);
      continue;
    }

    // ...
  }
}
```

---

## 4. エラーログフォーマット

### 4.1 ログ出力形式

```typescript
// 警告ログ
console.warn(`[SkillScanner] スキル読み込みスキップ: ${skillName}`, error);

// エラーログ
console.error(`[SkillScanner] ディレクトリ作成失敗: ${dir}`, error);
```

### 4.2 ログ出力項目

| 項目         | 説明                   |
| ------------ | ---------------------- |
| モジュール名 | `[SkillScanner]`       |
| 操作         | 実行していた操作の説明 |
| 対象         | パス、スキル名など     |
| エラー詳細   | Error オブジェクト     |

---

## 5. エラー状態の伝搬

### 5.1 戻り値による伝搬

| メソッド             | エラー時の戻り値           |
| -------------------- | -------------------------- |
| scanAll()            | 読み取れたスキルのみの配列 |
| scanDirectory()      | 空配列 `[]`                |
| parseSkill()         | `null`                     |
| scanSubDirectory()   | 空配列 `[]`                |
| extractDescription() | 空文字 `""`                |

### 5.2 例外による伝搬

| メソッド              | 例外をスローするケース |
| --------------------- | ---------------------- |
| ensureAiworkflowDir() | ディレクトリ作成失敗時 |

---

## 変更履歴

| Version | Date       | Changes  |
| ------- | ---------- | -------- |
| 1.0.0   | 2026-01-24 | 初版作成 |
