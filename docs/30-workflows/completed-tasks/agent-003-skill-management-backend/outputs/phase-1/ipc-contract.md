# IPC契約定義書

## メタ情報

| 項目     | 内容                     |
| -------- | ------------------------ |
| Phase    | 1                        |
| タスク   | タスク4: IPC契約の定義   |
| 作成日   | 2026-01-11               |
| 参照仕様 | security-api-electron.md |

---

## 1. IPCチャネル一覧

| チャネル名                    | 方向          | 説明                     |
| ----------------------------- | ------------- | ------------------------ |
| `agent:scan-available-skills` | Renderer→Main | 利用可能スキル一覧取得   |
| `agent:get-imported-skills`   | Renderer→Main | インポート済みスキル取得 |
| `agent:import-skills`         | Renderer→Main | スキルインポート         |
| `agent:remove-skill`          | Renderer→Main | スキル削除               |
| `agent:get-skill-detail`      | Renderer→Main | スキル詳細取得           |

---

## 2. チャネル詳細定義

### 2.1 agent:scan-available-skills

**目的**: 指定ディレクトリから利用可能なスキルをスキャンする

| 項目 | 内容               |
| ---- | ------------------ |
| 方向 | Renderer → Main    |
| 認証 | IPC sender検証必須 |

**引数**:

```typescript
interface ScanAvailableSkillsArgs {
  basePath?: string; // 省略時はデフォルトパス（~/.claude/skills/）
}
```

**戻り値**:

```typescript
interface SkillScanResult {
  skills: Skill[];
  errors: SkillScanError[];
  scannedAt: Date;
}
```

### 2.2 agent:get-imported-skills

**目的**: インポート済みスキルの一覧を取得する

| 項目 | 内容               |
| ---- | ------------------ |
| 方向 | Renderer → Main    |
| 認証 | IPC sender検証必須 |

**引数**: なし

**戻り値**:

```typescript
Skill[]
```

### 2.3 agent:import-skills

**目的**: 指定されたスキルをインポートする

| 項目 | 内容               |
| ---- | ------------------ |
| 方向 | Renderer → Main    |
| 認証 | IPC sender検証必須 |

**引数**:

```typescript
interface ImportSkillsArgs {
  skillIds: string[];
}
```

**戻り値**:

```typescript
interface ImportResult {
  success: boolean;
  importedCount: number;
  errors: string[];
}
```

### 2.4 agent:remove-skill

**目的**: インポート済みスキルを削除する

| 項目 | 内容               |
| ---- | ------------------ |
| 方向 | Renderer → Main    |
| 認証 | IPC sender検証必須 |

**引数**:

```typescript
interface RemoveSkillArgs {
  skillId: string;
}
```

**戻り値**:

```typescript
interface RemoveResult {
  success: boolean;
  message?: string;
}
```

### 2.5 agent:get-skill-detail

**目的**: 指定されたスキルの詳細情報を取得する

| 項目 | 内容               |
| ---- | ------------------ |
| 方向 | Renderer → Main    |
| 認証 | IPC sender検証必須 |

**引数**:

```typescript
interface GetSkillDetailArgs {
  skillId: string;
}
```

**戻り値**:

```typescript
Skill | null;
```

---

## 3. 型定義

### 3.1 Skill型

```typescript
export interface Skill {
  id: string; // パスから生成したslug
  name: string; // SKILL.md内のname
  slug: string; // ディレクトリ名
  description: string; // SKILL.md内のdescription
  path: string; // SKILL.mdへの絶対パス
  triggers: string[]; // Triggerキーワード配列
  anchors: Anchor[]; // Anchors配列
  tags?: string[]; // タグ配列
  allowedTools?: string[]; // 許可ツール
  dependencies?: string[]; // 依存スキル
  lastModified: Date; // ファイル更新日時
}
```

### 3.2 Anchor型

```typescript
export interface Anchor {
  source: string; // アンカー名（書籍名など）
  application: string; // 適用範囲
  purpose: string; // 目的
}
```

### 3.3 エラー型

```typescript
export interface SkillScanError {
  path: string; // 失敗したファイルパス
  error: string; // エラーメッセージ
}
```

---

## 4. エラーレスポンス形式

### 4.1 共通エラー形式

```typescript
interface IPCError {
  code: string; // エラーコード
  message: string; // ユーザー向けメッセージ
  details?: unknown; // デバッグ情報（開発時のみ）
}
```

### 4.2 エラーコード一覧

| コード             | 説明                             | HTTPステータス相当 |
| ------------------ | -------------------------------- | ------------------ |
| `VALIDATION_ERROR` | 入力バリデーションエラー         | 400                |
| `NOT_FOUND`        | リソースが見つからない           | 404                |
| `AUTH_ERROR`       | 認証エラー（IPC sender検証失敗） | 401                |
| `INTERNAL_ERROR`   | 内部エラー                       | 500                |
| `PATH_TRAVERSAL`   | パストラバーサル検出             | 400                |

### 4.3 エラー例

```typescript
// バリデーションエラー
{
  code: 'VALIDATION_ERROR',
  message: 'skillId is required',
  details: { field: 'skillId' }
}

// パストラバーサル検出
{
  code: 'PATH_TRAVERSAL',
  message: 'Invalid path detected',
  details: undefined // セキュリティ上詳細は返さない
}

// 認証エラー
{
  code: 'AUTH_ERROR',
  message: 'Unauthorized IPC call',
  details: undefined
}
```

---

## 5. セキュリティ要件

### 5.1 IPC sender検証

参照: `security-api-electron.md`

```typescript
// Main Process側での検証
function validateIPCSender(event: IpcMainInvokeEvent): boolean {
  const webContents = event.sender;
  const window = BrowserWindow.fromWebContents(webContents);

  // 1. BrowserWindowの存在確認
  if (!window) return false;

  // 2. DevToolsからの呼び出し検出
  if (
    webContents.isDevToolsOpened() &&
    webContents.devToolsWebContents === webContents
  ) {
    return false;
  }

  // 3. 許可されたウィンドウリストとの照合
  return allowedWindows.has(window.id);
}
```

### 5.2 パストラバーサル防止

```typescript
function isPathSafe(inputPath: string, basePath: string): boolean {
  const normalizedInput = path.normalize(inputPath);
  const normalizedBase = path.normalize(basePath);

  // ベースパス外へのアクセスを禁止
  return normalizedInput.startsWith(normalizedBase);
}
```

### 5.3 入力バリデーション

| フィールド | バリデーション                                       |
| ---------- | ---------------------------------------------------- |
| skillId    | 非空文字列、64文字以内、ハイフンケース               |
| skillIds   | 配列、各要素がskillIdバリデーションを通過            |
| basePath   | 絶対パス、存在するディレクトリ、パストラバーサルなし |

---

## 6. Preload公開API

```typescript
// preload/preload.ts
contextBridge.exposeInMainWorld("electronAPI", {
  agent: {
    scanAvailableSkills: (args?: { basePath?: string }) =>
      ipcRenderer.invoke("agent:scan-available-skills", args),
    getImportedSkills: () => ipcRenderer.invoke("agent:get-imported-skills"),
    importSkills: (args: { skillIds: string[] }) =>
      ipcRenderer.invoke("agent:import-skills", args),
    removeSkill: (args: { skillId: string }) =>
      ipcRenderer.invoke("agent:remove-skill", args),
    getSkillDetail: (args: { skillId: string }) =>
      ipcRenderer.invoke("agent:get-skill-detail", args),
  },
});
```

---

## 7. チャネルホワイトリスト

```typescript
// channels.ts
export const IPC_CHANNELS = {
  // ... 既存チャネル ...

  // Agent関連
  AGENT_SCAN_AVAILABLE_SKILLS: "agent:scan-available-skills",
  AGENT_GET_IMPORTED_SKILLS: "agent:get-imported-skills",
  AGENT_IMPORT_SKILLS: "agent:import-skills",
  AGENT_REMOVE_SKILL: "agent:remove-skill",
  AGENT_GET_SKILL_DETAIL: "agent:get-skill-detail",
} as const;
```
