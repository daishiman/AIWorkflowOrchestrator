# API仕様書 - index.html→structure.md 逆同期機能

## メタ情報

| 項目     | 内容                             |
| -------- | -------------------------------- |
| 機能名   | slide-reverse-sync               |
| タスクID | task-feat-slide-reverse-sync-001 |
| 作成日   | 2026-01-10                       |
| Phase    | 2                                |
| スキル   | api-client-patterns              |

---

## 1. 概要

本仕様書では、逆同期機能における Claude Agent SDK との連携 API を定義する。
modifier skill は Agent SDK を経由して差分解析を実行し、その結果を structure.md に反映する。

---

## 2. Agent SDK 呼び出し仕様

### 2.1 modifier skill リクエスト

**エンドポイント**: Agent SDK `query` API

**入力インターフェース**:

```typescript
interface ModifierSkillRequest {
  prompt: string;
  options: {
    sessionId?: string;
    systemPrompt: string;
    timeout: number;
  };
}
```

**システムプロンプト（systemPrompt）**:

```
あなたはスライドプレゼンテーションの同期アシスタントです。
index.htmlの変更を分析し、structure.mdに反映すべき変更を特定してください。

入力:
1. 変更前のindex.html
2. 変更後のindex.html
3. 現在のstructure.md

出力形式:
JSON形式で以下の構造で出力してください:
{
  "success": true,
  "changes": [
    {
      "type": "add" | "modify" | "remove",
      "section": "セクション識別子",
      "content": "変更内容",
      "reason": "変更理由"
    }
  ],
  "updatedStructure": "更新後のstructure.md全文"
}

注意事項:
- HTMLの構造的変更のみを検出してください
- スタイルのみの変更は無視してください
- セマンティックな変更（テキスト内容、スライド順序、セクション追加/削除）を優先してください
```

**クエリプロンプト（prompt）構成**:

```typescript
const buildModifierPrompt = (context: ModifierContext): string => {
  return `
## 変更前のindex.html
\`\`\`html
${context.previousHtml}
\`\`\`

## 変更後のindex.html
\`\`\`html
${context.currentHtml}
\`\`\`

## 現在のstructure.md
\`\`\`markdown
${context.currentStructure}
\`\`\`

上記の変更を分析し、structure.mdの更新内容をJSON形式で出力してください。
`;
};
```

---

### 2.2 レスポンス仕様

**レスポンスインターフェース**:

```typescript
interface ModifierSkillResponse {
  success: boolean;
  changes?: StructureChange[];
  updatedStructure?: string;
  error?: string;
}

interface StructureChange {
  type: "add" | "modify" | "remove";
  section: string;
  content: string;
  reason: string;
}
```

**成功レスポンス例**:

```json
{
  "success": true,
  "changes": [
    {
      "type": "modify",
      "section": "slide-2",
      "content": "## 新機能紹介\n\n- AI アシスタント機能\n- リアルタイム同期",
      "reason": "スライド2のタイトルと箇条書きが更新された"
    },
    {
      "type": "add",
      "section": "slide-5",
      "content": "## まとめ\n\n本日の発表内容を振り返ります",
      "reason": "新しいスライドが追加された"
    }
  ],
  "updatedStructure": "# プレゼンテーション構造\n\n## スライド1\n..."
}
```

**エラーレスポンス例**:

```json
{
  "success": false,
  "error": "HTMLの解析に失敗しました: 不正なタグ構造が検出されました"
}
```

---

## 3. エラーハンドリング

### 3.1 エラー種別とコード

| エラーコード         | 説明                   | 対応方法                   |
| -------------------- | ---------------------- | -------------------------- |
| `AGENT_TIMEOUT`      | Agent SDK タイムアウト | リトライ（最大3回）        |
| `AGENT_QUERY_FAILED` | クエリ実行失敗         | リトライ後エラー通知       |
| `PARSE_ERROR`        | レスポンスパース失敗   | エラー通知                 |
| `VALIDATION_ERROR`   | 入力検証失敗           | ユーザーにエラー内容を通知 |
| `NETWORK_ERROR`      | ネットワーク障害       | リトライ後エラー通知       |

### 3.2 リトライ機構

```typescript
interface RetryConfig {
  maxRetries: number; // 3
  initialDelay: number; // 1000ms
  maxDelay: number; // 4000ms
  backoffMultiplier: number; // 2
}

const executeWithRetry = async <T>(
  fn: () => Promise<T>,
  config: RetryConfig,
): Promise<T> => {
  let lastError: Error | null = null;
  let delay = config.initialDelay;

  for (let attempt = 0; attempt < config.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < config.maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay = Math.min(delay * config.backoffMultiplier, config.maxDelay);
      }
    }
  }

  throw lastError;
};
```

---

## 4. タイムアウト設定

| 項目                        | 値    | 説明                               |
| --------------------------- | ----- | ---------------------------------- |
| Agent SDK デフォルト        | 30000 | 30秒（デフォルトタイムアウト）     |
| modifier skill タイムアウト | 30000 | 差分解析処理のタイムアウト         |
| 接続タイムアウト            | 10000 | SDK接続確立のタイムアウト          |
| レスポンス読み取り          | 30000 | ストリーミングレスポンスの最大待機 |

---

## 5. セッション管理

### 5.1 セッション使用方針

modifier skill は**シングルクエリモード**で動作し、セッション継続は行わない。

| 項目             | 設定           |
| ---------------- | -------------- |
| セッション作成   | 不要           |
| 会話履歴維持     | しない         |
| コンテキスト渡し | プロンプトのみ |

### 5.2 呼び出しパターン

```typescript
const executeModifierSkill = async (
  context: ModifierContext,
): Promise<ModifierSkillResponse> => {
  const prompt = buildModifierPrompt(context);
  const systemPrompt = MODIFIER_SYSTEM_PROMPT;

  // セッションなしの単発クエリ
  const response = await window.agentAPI.query(prompt, {
    systemPrompt,
    timeout: 30000,
  });

  return parseModifierResponse(response);
};
```

---

## 6. データ変換

### 6.1 入力データ準備

```typescript
interface ModifierContext {
  projectPath: string;
  previousHtml: string;
  currentHtml: string;
  currentStructure: string;
}

const prepareModifierContext = async (
  projectPath: string,
): Promise<ModifierContext> => {
  // キャッシュから前回のHTMLを取得
  const previousHtml = htmlCache.get(projectPath) ?? "";

  // 現在のファイル内容を読み取り
  const htmlPath = path.join(projectPath, "index.html");
  const structurePath = path.join(projectPath, "structure.md");

  const [currentHtml, currentStructure] = await Promise.all([
    fs.readFile(htmlPath, "utf-8"),
    fs.readFile(structurePath, "utf-8"),
  ]);

  return {
    projectPath,
    previousHtml,
    currentHtml,
    currentStructure,
  };
};
```

### 6.2 レスポンスパース

````typescript
const parseModifierResponse = (rawResponse: string): ModifierSkillResponse => {
  try {
    // JSONブロックを抽出
    const jsonMatch = rawResponse.match(/```json\n([\s\S]*?)\n```/);
    const jsonString = jsonMatch ? jsonMatch[1] : rawResponse;

    const parsed = JSON.parse(jsonString);

    // バリデーション
    if (typeof parsed.success !== "boolean") {
      throw new Error("Invalid response: missing success field");
    }

    return parsed as ModifierSkillResponse;
  } catch (error) {
    return {
      success: false,
      error: `レスポンスのパースに失敗: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
};
````

---

## 7. キャッシュ管理

### 7.1 HTMLキャッシュ仕様

| 項目           | 設定              |
| -------------- | ----------------- |
| キャッシュ方式 | インメモリ（Map） |
| キー           | projectPath       |
| 値             | index.html内容    |
| サイズ制限     | 10MB              |
| 有効期限       | アプリ終了まで    |

### 7.2 キャッシュ更新タイミング

```typescript
// スキル実行後にキャッシュ更新
const updateHtmlCache = (projectPath: string, html: string): void => {
  // サイズチェック
  const size = Buffer.byteLength(html, "utf-8");
  if (size > MAX_CACHE_SIZE) {
    console.warn(`HTML cache exceeded limit: ${size} bytes`);
    return;
  }

  htmlCache.set(projectPath, html);
};

// キャッシュクリア（プロジェクト閉じる時）
const clearHtmlCache = (projectPath: string): void => {
  htmlCache.delete(projectPath);
};
```

---

## 8. バリデーション

### 8.1 入力バリデーション

```typescript
import { z } from "zod";

const modifierContextSchema = z.object({
  projectPath: z.string().min(1),
  previousHtml: z.string(),
  currentHtml: z.string().min(1),
  currentStructure: z.string().min(1),
});

const structureChangeSchema = z.object({
  type: z.enum(["add", "modify", "remove"]),
  section: z.string().min(1),
  content: z.string(),
  reason: z.string(),
});

const modifierResponseSchema = z.object({
  success: z.boolean(),
  changes: z.array(structureChangeSchema).optional(),
  updatedStructure: z.string().optional(),
  error: z.string().optional(),
});
```

### 8.2 ファイルサイズ制限

| ファイル       | 最大サイズ | 超過時の動作             |
| -------------- | ---------- | ------------------------ |
| index.html     | 10MB       | エラー通知、処理スキップ |
| structure.md   | 1MB        | エラー通知、処理スキップ |
| プロンプト全体 | 100KB      | 分割送信検討（将来対応） |

---

## 9. 進捗通知

### 9.1 進捗ステージ

| ステージ | 進捗(%) | 説明                     |
| -------- | ------- | ------------------------ |
| 準備     | 0-10    | ファイル読み込み中       |
| 解析     | 10-70   | Agent SDK差分解析中      |
| 適用     | 70-90   | structure.md更新中       |
| 完了     | 90-100  | キャッシュ更新、完了処理 |

### 9.2 進捗コールバック

```typescript
type ProgressCallback = (progress: number, message: string) => void;

const executeModifierWithProgress = async (
  context: ModifierContext,
  onProgress: ProgressCallback,
): Promise<ModifierSkillResponse> => {
  onProgress(5, "ファイル読み込み中...");

  // コンテキスト準備
  const preparedContext = await prepareModifierContext(context.projectPath);
  onProgress(10, "差分解析開始...");

  // Agent SDK呼び出し
  const response = await executeWithRetry(
    () => executeModifierSkill(preparedContext),
    RETRY_CONFIG,
  );
  onProgress(70, "解析完了、更新適用中...");

  // structure.md更新
  if (response.success && response.updatedStructure) {
    await applyStructureUpdate(context.projectPath, response.updatedStructure);
  }
  onProgress(90, "更新完了、後処理中...");

  // キャッシュ更新
  updateHtmlCache(context.projectPath, preparedContext.currentHtml);
  onProgress(100, "完了");

  return response;
};
```

---

## 10. 関連ドキュメント

| ドキュメント         | パス                                                                        |
| -------------------- | --------------------------------------------------------------------------- |
| Agent SDK仕様        | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md` |
| APIエンドポイント    | `.claude/skills/aiworkflow-requirements/references/api-endpoints.md`        |
| アーキテクチャ設計書 | `outputs/phase-2/architecture-design.md`                                    |
| ドメインモデル       | `outputs/phase-2/domain-model.md`                                           |
| IPC設計書            | `outputs/phase-2/ipc-design.md`                                             |
