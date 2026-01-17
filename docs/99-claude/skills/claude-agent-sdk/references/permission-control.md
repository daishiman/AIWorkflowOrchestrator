# Permission Control リファレンス

## 権限制御の4層

1. **Permission Modes**: 基本的な権限レベル設定
2. **canUseTool Callback**: プログラマティックな権限判定
3. **Hooks**: PreToolUse/PermissionRequest イベント
4. **Permission Rules**: 宣言的なルール定義

---

## 処理順序

```
PreToolUse Hook
    ↓
Deny Rules（拒否ルール）
    ↓
Allow Rules（許可ルール）
    ↓
Ask Rules（確認ルール）
    ↓
Permission Mode Check
    ↓
canUseTool Callback
    ↓
PostToolUse Hook
```

---

## Permission Modes

### モード一覧

```typescript
type PermissionMode =
  | "auto" // すべて自動承認
  | "ask" // すべて確認
  | "deny" // すべて拒否
  | "default"; // デフォルト（ツールごとの設定に従う）
```

### 使用例

```typescript
const options: Options = {
  permissionMode: "ask", // すべてのツール使用で確認を求める
};
```

---

## Permission Rules

### 構文

```typescript
interface PermissionRules {
  allow?: ToolPermissionRule[]; // 許可ルール
  deny?: ToolPermissionRule[]; // 拒否ルール
  ask?: ToolPermissionRule[]; // 確認ルール
}

interface ToolPermissionRule {
  tool: string | string[]; // ツール名またはパターン
  paths?: string[]; // 対象パス（オプション）
  commands?: string[]; // 対象コマンド（オプション）
}
```

### 実装例

```typescript
const options: Options = {
  permissionMode: "default",
  permissions: {
    // プロジェクト内のReadは自動許可
    allow: [
      { tool: "Read", paths: ["/project/**"] },
      { tool: "Grep" },
      { tool: "Glob" },
    ],
    // 危険なコマンドは拒否
    deny: [
      { tool: "Bash", commands: ["rm -rf", "sudo", "chmod"] },
      { tool: "Write", paths: ["/etc/**", "/usr/**"] },
    ],
    // 編集系は確認
    ask: [{ tool: "Write" }, { tool: "Edit" }],
  },
};
```

---

## canUseTool Callback

プログラマティックな権限判定を行うためのコールバック:

```typescript
const options: Options = {
  canUseTool: async (toolUse) => {
    // カスタムロジックで権限判定
    if (toolUse.name === "Bash") {
      return !toolUse.input.command.includes("rm");
    }
    return true;
  },
};
```

### 高度な例

```typescript
const options: Options = {
  canUseTool: async (toolUse) => {
    // ロールベースアクセス制御
    const userRole = await getUserRole();

    if (userRole === "viewer") {
      // 閲覧者は読み取り専用
      return ["Read", "Grep", "Glob"].includes(toolUse.name);
    }

    if (userRole === "editor") {
      // 編集者はファイル操作可能
      return ["Read", "Grep", "Glob", "Write", "Edit"].includes(toolUse.name);
    }

    if (userRole === "admin") {
      // 管理者は全ツール使用可能
      return true;
    }

    return false;
  },
};
```

---

## 権限バイパス（開発用）

**警告**: 開発・テスト環境専用。本番環境では絶対に使用しないこと。

```typescript
const result = query({
  prompt: "Task with no permission prompts",
  options: {
    permissionMode: "bypassPermissions",
  },
});
```

`bypassPermissions`を使用するには、セーフティ措置として以下の設定が必要:

```typescript
// 設定ファイルまたは環境変数で
allow_dangerously_skip_permissions: true;
```

---

## 推奨パターン

### 最小権限の原則

```typescript
const options: Options = {
  // deny-all から開始
  permissions: {
    deny: [{ tool: "Bash" }, { tool: "Write" }, { tool: "Edit" }],
    // 必要なもののみ許可
    allow: [
      { tool: "Read", paths: ["/project/src/**"] },
      { tool: "Grep" },
      { tool: "Glob" },
    ],
    // 明示的な確認が必要な操作
    ask: [{ tool: "Edit", paths: ["/project/src/**"] }],
  },
};
```

### ディレクトリベースの制限

```typescript
const projectRoot = process.cwd();

const options: Options = {
  permissions: {
    allow: [
      { tool: "Read", paths: [`${projectRoot}/**`] },
      { tool: "Write", paths: [`${projectRoot}/src/**`] },
      { tool: "Edit", paths: [`${projectRoot}/src/**`] },
    ],
    deny: [
      // システムディレクトリは禁止
      { tool: "Read", paths: ["/etc/**", "/usr/**", "/var/**"] },
      { tool: "Write", paths: ["/etc/**", "/usr/**", "/var/**"] },
      // シェル設定ファイルは禁止
      { tool: "Write", paths: ["**/.bashrc", "**/.zshrc", "**/.profile"] },
    ],
  },
};
```

### コマンドベースの制限

```typescript
const options: Options = {
  permissions: {
    deny: [
      {
        tool: "Bash",
        commands: [
          "rm -rf",
          "sudo",
          "chmod 777",
          "> /dev/",
          "mkfs",
          "dd if=",
          ":(){ :|:& };:", // fork bomb
        ],
      },
    ],
    ask: [{ tool: "Bash", commands: ["git push", "npm publish"] }],
  },
};
```

---

## セキュリティチェックリスト

| 項目             | 推奨設定                       |
| ---------------- | ------------------------------ |
| デフォルトモード | "ask" または "deny"            |
| ファイルアクセス | プロジェクトディレクトリに制限 |
| 危険コマンド     | deny ルールでブロック          |
| 機密操作         | ask ルールで明示的確認         |
| 本番環境         | bypassPermissions を使用しない |
| ロギング         | 権限チェック結果をログに記録   |

---

## 関連ドキュメント

- [query-api.md](./query-api.md) - query() API
- [hooks-system.md](./hooks-system.md) - Hooksシステム
- [security-sandboxing.md](./security-sandboxing.md) - セキュリティとサンドボックス
