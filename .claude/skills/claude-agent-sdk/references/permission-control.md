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

### モード一覧（SDK@0.2.30 実型）

```typescript
type SDKPermissionMode =
  | "default"              // デフォルト（ツールごとの設定に従う）
  | "acceptEdits"          // 編集系を自動承認
  | "bypassPermissions"    // すべてバイパス（開発専用）
  | "plan"                 // 計画モード
  | "delegate"             // 委譲モード
  | "dontAsk";             // 確認なし
```

> **注意**: 旧ドキュメントの "auto" | "ask" | "deny" は SDK@0.2.30 の実型には存在しません。
> 正確な値は `node_modules/@anthropic-ai/claude-agent-sdk/dist/index.d.ts` を参照してください。

### 使用例

```typescript
const options: Options = {
  permissionMode: "default", // デフォルトの権限制御
};
```

---

## Permission Rules

### 構文

```typescript
interface PermissionRules {
  allow?: ToolPermissionRule[];  // 許可ルール
  deny?: ToolPermissionRule[];   // 拒否ルール
  ask?: ToolPermissionRule[];    // 確認ルール
}

interface ToolPermissionRule {
  tool: string | string[];       // ツール名またはパターン
  paths?: string[];              // 対象パス（オプション）
  commands?: string[];           // 対象コマンド（オプション）
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
    ask: [
      { tool: "Write" },
      { tool: "Edit" },
    ],
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
    deny: [
      { tool: "Bash" },
      { tool: "Write" },
      { tool: "Edit" },
    ],
    // 必要なもののみ許可
    allow: [
      { tool: "Read", paths: ["/project/src/**"] },
      { tool: "Grep" },
      { tool: "Glob" },
    ],
    // 明示的な確認が必要な操作
    ask: [
      { tool: "Edit", paths: ["/project/src/**"] },
    ],
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
    ask: [
      { tool: "Bash", commands: ["git push", "npm publish"] },
    ],
  },
};
```

---

## 権限永続化パターン（rememberChoice）

ユーザーが「次回から確認しない」を選択した権限設定を永続化するパターン。

### 概要

PermissionRequest Hookと連携し、`rememberChoice: true`の応答を受けた場合に設定をelectron-storeで永続化。

### アーキテクチャ

```
PermissionRequest Hook
    ↓
PermissionResponse { allowed: true, rememberChoice: true }
    ↓
PermissionStore.allowTool(toolName)
    ↓
electron-store (JSON永続化)
    ↓
次回実行時: isToolAllowed() → ダイアログスキップ
```

### PermissionStore API

| メソッド                  | 戻り値               | 計算量 | 説明                         |
| ------------------------- | -------------------- | ------ | ---------------------------- |
| `isToolAllowed(tool)`     | `boolean`            | O(1)   | ツールが許可済みか判定       |
| `allowTool(tool)`         | `void`               | O(1)   | ツールを許可リストに追加     |
| `revokeTool(tool)`        | `boolean`            | O(1)   | ツールを許可リストから削除   |
| `getAllowedTools()`       | `string[]`           | O(n)   | 許可ツール名一覧を取得       |
| `clearAll()`              | `number`             | O(n)   | 全許可をクリア               |

### 実装例

```typescript
import { PermissionStore } from "./services/skill/PermissionStore";

// PermissionRequest Hookでの使用
const hooks = {
  onPermissionRequest: async (request) => {
    const store = PermissionStore.getInstance();

    // 許可済みならダイアログスキップ
    if (store.isToolAllowed(request.toolName)) {
      return { allowed: true };
    }

    // ダイアログ表示
    const response = await showPermissionDialog(request);

    // rememberChoice選択時に永続化
    if (response.allowed && response.rememberChoice) {
      store.allowTool(request.toolName);
    }

    return response;
  },
};
```

### データスキーマ

```typescript
interface PermissionStoreSchema {
  version: number;                    // スキーマバージョン
  allowedTools: AllowedToolEntry[];   // 許可済みツール一覧
  updatedAt: string;                  // 最終更新日時（ISO 8601）
}

interface AllowedToolEntry {
  toolName: string;   // ツール識別子
  allowedAt: string;  // 許可日時（ISO 8601）
}
```

### ストレージパス

| OS      | パス                                                              |
| ------- | ----------------------------------------------------------------- |
| macOS   | ~/Library/Application Support/@repo-desktop/permission-store.json |
| Windows | %APPDATA%/@repo-desktop/permission-store.json                     |
| Linux   | ~/.config/@repo-desktop/permission-store.json                     |

### ベストプラクティス

| すべきこと                         | 避けるべきこと                     |
| ---------------------------------- | ---------------------------------- |
| Main Processでのみ操作             | Renderer Processから直接アクセス   |
| IPCハンドラー経由でRenderer連携    | 複数インスタンス生成               |
| ALLOWED_TOOLS_WHITELISTで検証      | 任意のツール名を無検証で許可       |

**実装タスク**: TASK-3-1-E（2026-01-26完了）
**仕様詳細**: [security-skill-execution.md](/.claude/skills/aiworkflow-requirements/references/security-skill-execution.md)

---

## Phase-Based Policy Configuration（TASK-P0-09）

SkillCreator の 4 フェーズに対応した phase 別ポリシー定義。
`SkillCreatorGovernancePolicy.ts` の `PHASE_POLICIES` 定数として実装。

### phase 別ポリシー一覧

| phase   | permissionMode | allowedTools                          | disallowedTools |
| ------- | -------------- | ------------------------------------- | --------------- |
| plan    | `plan`         | Read, Glob, Grep, Bash                | Edit, Write     |
| execute | `acceptEdits`  | Read, Edit, Write, Glob, Grep, Bash   | -               |
| verify  | `plan`         | Read, Glob, Grep, Bash                | Edit, Write     |
| improve | `acceptEdits`  | Read, Edit, Glob, Grep                | Write           |

### getPolicyForPhase の使用例

```typescript
import { getPolicyForPhase } from "./SkillCreatorGovernancePolicy";

const policy = getPolicyForPhase("execute");
console.log(policy.permissionMode);    // "acceptEdits"
console.log(policy.allowedTools);      // ["Read", "Edit", "Write", "Glob", "Grep", "Bash"]
console.log(policy.disallowedTools);   // undefined（execute は無制限）

const verifyPolicy = getPolicyForPhase("verify");
console.log(verifyPolicy.disallowedTools); // ["Edit", "Write"]
```

### createCanUseToolCallback の使用例

phase ポリシーに基づく `canUseTool` 判定コールバックを生成する。

```typescript
import { createCanUseToolCallback } from "./SkillCreatorGovernancePolicy";

const canUseTool = createCanUseToolCallback("execute", "/skills/my-skill");

// 許可される例
canUseTool("Read", {});
// => { allowed: true }

canUseTool("Write", { file_path: "/skills/my-skill/SKILL.md" });
// => { allowed: true }

// 拒否される例
canUseTool("Write", { file_path: "/etc/hosts" });
// => { allowed: false, reason: 'Write is restricted to "/skills/my-skill" in execute phase...' }

canUseTool("Edit", {});
// => { allowed: false, reason: 'Write は execute phase では file_path/path の指定が必要です' }
```

### SkillCreatorSdkPolicy 型

```typescript
interface SkillCreatorSdkPolicy {
  phase: SkillCreatorGovernancePhase;   // "plan" | "execute" | "verify" | "improve"
  permissionMode: string;               // SDK の permissionMode 値
  allowedTools: string[];               // 許可ツール名リスト
  disallowedTools?: string[];           // 明示禁止ツール名リスト
}
```

📖 実装参照: `apps/desktop/src/main/services/runtime/SkillCreatorGovernancePolicy.ts`

---

## セキュリティチェックリスト

| 項目                     | 推奨設定                               |
| ------------------------ | -------------------------------------- |
| デフォルトモード         | "default"                              |
| ファイルアクセス         | プロジェクトディレクトリに制限         |
| 危険コマンド             | deny ルールでブロック                  |
| 機密操作                 | ask ルールで明示的確認                 |
| 本番環境                 | bypassPermissions を使用しない         |
| ロギング                 | 権限チェック結果をログに記録           |
| 権限永続化               | PermissionStoreでrememberChoice管理    |

---

## 関連ドキュメント

- [query-api.md](./query-api.md) - query() API
- [hooks-system.md](./hooks-system.md) - Hooksシステム
- [security-sandboxing.md](./security-sandboxing.md) - セキュリティとサンドボックス
