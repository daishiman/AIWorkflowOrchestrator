# 理由メッセージ仕様書 - PermissionRequest Hook 統合

## メタ情報

| 項目     | 内容                        |
| -------- | --------------------------- |
| タスクID | TASK-3-1-C                  |
| Phase    | 2 - 設計                    |
| 作成日   | 2026-01-25                  |
| 機能名   | PermissionRequest Hook 統合 |

---

## 概要

ツール名と引数から、ユーザーにとって理解しやすい日本語の理由メッセージを生成する。
このメッセージは権限確認ダイアログに表示され、ユーザーが承認/拒否の判断材料とする。

---

## ツール別理由フォーマット

### Bash

| 項目         | 内容                        |
| ------------ | --------------------------- |
| ツール名     | Bash                        |
| 主要引数     | `command`                   |
| フォーマット | `コマンドを実行: {command}` |
| 文字数制限   | command は 100 文字まで     |
| 省略形式     | `{先頭100文字}...`          |

**例**:

```
コマンドを実行: npm install @anthropic-ai/claude-agent-sdk
コマンドを実行: git status && git diff
コマンドを実行: pnpm --filter @repo/desktop build && pnpm --filter @repo/desktop test...
```

---

### Write

| 項目         | 内容                                   |
| ------------ | -------------------------------------- |
| ツール名     | Write                                  |
| 主要引数     | `file_path` または `path`              |
| フォーマット | `ファイルを作成: {file_path}`          |
| 文字数制限   | file_path は 150 文字まで              |
| 省略形式     | `...{末尾100文字}`（パスは末尾が重要） |

**例**:

```
ファイルを作成: src/components/Button.tsx
ファイルを作成: apps/desktop/src/main/services/skill/SkillExecutor.ts
ファイルを作成: .../very/deep/nested/path/to/file.ts
```

---

### Edit

| 項目         | 内容                          |
| ------------ | ----------------------------- |
| ツール名     | Edit                          |
| 主要引数     | `file_path` または `path`     |
| フォーマット | `ファイルを編集: {file_path}` |
| 文字数制限   | file_path は 150 文字まで     |
| 省略形式     | `...{末尾100文字}`            |

**例**:

```
ファイルを編集: src/utils/helpers.ts
ファイルを編集: packages/shared/src/types/skill.ts
```

---

### Read

| 項目         | 内容                              |
| ------------ | --------------------------------- |
| ツール名     | Read                              |
| 主要引数     | `file_path` または `path`         |
| フォーマット | `ファイルを読み取り: {file_path}` |
| 文字数制限   | file_path は 150 文字まで         |
| 省略形式     | `...{末尾100文字}`                |

**例**:

```
ファイルを読み取り: package.json
ファイルを読み取り: docs/README.md
```

---

### Glob

| 項目         | 内容                        |
| ------------ | --------------------------- |
| ツール名     | Glob                        |
| 主要引数     | `pattern`                   |
| フォーマット | `ファイルを検索: {pattern}` |
| 文字数制限   | pattern は 100 文字まで     |
| 省略形式     | `{先頭100文字}...`          |

**例**:

```
ファイルを検索: **/*.ts
ファイルを検索: src/components/**/*.tsx
ファイルを検索: apps/desktop/src/**/__tests__/*.test.ts
```

---

### Grep

| 項目         | 内容                        |
| ------------ | --------------------------- |
| ツール名     | Grep                        |
| 主要引数     | `pattern`                   |
| フォーマット | `テキストを検索: {pattern}` |
| 文字数制限   | pattern は 80 文字まで      |
| 省略形式     | `{先頭80文字}...`           |

**例**:

```
テキストを検索: TODO
テキストを検索: import.*SkillExecutor
テキストを検索: export (class|interface|type)
```

---

### Task

| 項目         | 内容                              |
| ------------ | --------------------------------- |
| ツール名     | Task                              |
| 主要引数     | `description`                     |
| フォーマット | `サブタスクを実行: {description}` |
| 文字数制限   | description は 50 文字まで        |
| 省略形式     | `{先頭50文字}...`                 |

**例**:

```
サブタスクを実行: 依存関係を調査
サブタスクを実行: テストファイルを検索して実行
```

---

### WebSearch

| 項目         | 内容                 |
| ------------ | -------------------- |
| ツール名     | WebSearch            |
| 主要引数     | `query`              |
| フォーマット | `Web検索: {query}`   |
| 文字数制限   | query は 80 文字まで |
| 省略形式     | `{先頭80文字}...`    |

**例**:

```
Web検索: Claude Agent SDK documentation
Web検索: TypeScript generics best practices
```

---

### WebFetch

| 項目         | 内容                          |
| ------------ | ----------------------------- |
| ツール名     | WebFetch                      |
| 主要引数     | `url`                         |
| フォーマット | `Webコンテンツを取得: {url}`  |
| 文字数制限   | url は 100 文字まで           |
| 省略形式     | `{先頭50文字}...{末尾30文字}` |

**例**:

```
Webコンテンツを取得: https://docs.anthropic.com/api
Webコンテンツを取得: https://github.com/...nthropic-ai/sdk
```

---

### デフォルト（その他のツール）

| 項目         | 内容                |
| ------------ | ------------------- |
| フォーマット | `{toolName} を実行` |

**例**:

```
LS を実行
TodoWrite を実行
CustomTool を実行
```

---

## 完全実装

```typescript
const TOOL_REASON_CONFIG: Record<
  string,
  {
    format: string;
    argKey: string | string[];
    maxLength: number;
    truncateMode: "head" | "tail" | "both";
  }
> = {
  Bash: {
    format: "コマンドを実行: {value}",
    argKey: "command",
    maxLength: 100,
    truncateMode: "head",
  },
  Write: {
    format: "ファイルを作成: {value}",
    argKey: ["file_path", "path"],
    maxLength: 150,
    truncateMode: "tail",
  },
  Edit: {
    format: "ファイルを編集: {value}",
    argKey: ["file_path", "path"],
    maxLength: 150,
    truncateMode: "tail",
  },
  Read: {
    format: "ファイルを読み取り: {value}",
    argKey: ["file_path", "path"],
    maxLength: 150,
    truncateMode: "tail",
  },
  Glob: {
    format: "ファイルを検索: {value}",
    argKey: "pattern",
    maxLength: 100,
    truncateMode: "head",
  },
  Grep: {
    format: "テキストを検索: {value}",
    argKey: "pattern",
    maxLength: 80,
    truncateMode: "head",
  },
  Task: {
    format: "サブタスクを実行: {value}",
    argKey: "description",
    maxLength: 50,
    truncateMode: "head",
  },
  WebSearch: {
    format: "Web検索: {value}",
    argKey: "query",
    maxLength: 80,
    truncateMode: "head",
  },
  WebFetch: {
    format: "Webコンテンツを取得: {value}",
    argKey: "url",
    maxLength: 100,
    truncateMode: "both",
  },
};

function getArgValue(
  args: Record<string, unknown>,
  keys: string | string[],
): string {
  const keyArray = Array.isArray(keys) ? keys : [keys];

  for (const key of keyArray) {
    const value = args[key];
    if (typeof value === "string" && value.length > 0) {
      return value;
    }
  }

  return "";
}

function truncateValue(
  value: string,
  maxLength: number,
  mode: "head" | "tail" | "both",
): string {
  if (value.length <= maxLength) {
    return value;
  }

  switch (mode) {
    case "head":
      return `${value.substring(0, maxLength)}...`;
    case "tail":
      return `...${value.substring(value.length - maxLength)}`;
    case "both": {
      const headLength = Math.floor(maxLength * 0.5);
      const tailLength = Math.floor(maxLength * 0.3);
      return `${value.substring(0, headLength)}...${value.substring(value.length - tailLength)}`;
    }
    default:
      return value;
  }
}

export function getPermissionReason(
  toolName: string,
  args: Record<string, unknown>,
): string {
  const config = TOOL_REASON_CONFIG[toolName];

  if (!config) {
    return `${toolName} を実行`;
  }

  const rawValue = getArgValue(args, config.argKey);

  if (!rawValue) {
    return `${toolName} を実行`;
  }

  const truncatedValue = truncateValue(
    rawValue,
    config.maxLength,
    config.truncateMode,
  );

  return config.format.replace("{value}", truncatedValue);
}
```

---

## テストケース

| ID     | ツール名 | 引数                                  | 期待される出力                            |
| ------ | -------- | ------------------------------------- | ----------------------------------------- |
| TC-001 | Bash     | `{ command: "npm install" }`          | `コマンドを実行: npm install`             |
| TC-002 | Bash     | `{ command: "a".repeat(150) }`        | `コマンドを実行: aaa...（100文字で省略）` |
| TC-003 | Write    | `{ file_path: "src/index.ts" }`       | `ファイルを作成: src/index.ts`            |
| TC-004 | Write    | `{ path: "src/index.ts" }`            | `ファイルを作成: src/index.ts`            |
| TC-005 | Edit     | `{ file_path: "long/path/..." }`      | 末尾を優先して省略                        |
| TC-006 | Glob     | `{ pattern: "**/*.ts" }`              | `ファイルを検索: **/*.ts`                 |
| TC-007 | Grep     | `{ pattern: "TODO" }`                 | `テキストを検索: TODO`                    |
| TC-008 | Unknown  | `{}`                                  | `Unknown を実行`                          |
| TC-009 | Bash     | `{}`                                  | `Bash を実行`                             |
| TC-010 | WebFetch | `{ url: "https://very.long.url..." }` | 両端を保持して中央を省略                  |

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-25 | 初版作成 |
