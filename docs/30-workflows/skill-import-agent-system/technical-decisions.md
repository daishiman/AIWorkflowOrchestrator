# 技術選定・設計判断

## 1. Claude Agent SDK vs Direct SDK

### 1.1 比較表

| 観点               | Claude Agent SDK                              | Direct SDK (@anthropic-ai/sdk) |
| ------------------ | --------------------------------------------- | ------------------------------ |
| パッケージ         | `@anthropic-ai/claude-agent-sdk`              | `@anthropic-ai/sdk`            |
| バージョン         | 0.2.15                                        | 0.x.x                          |
| Hooks              | ✅ PreToolUse, PostToolUse, PermissionRequest | ❌ なし                        |
| ツール実行         | ✅ 組み込み（Bash, Read, Edit等）             | ❌ 自前実装                    |
| Permission Control | ✅ 4層システム                                | ❌ 自前実装                    |
| ストリーミング     | ✅ stream() メソッド                          | ✅ stream: true                |
| セッション管理     | ✅ V2 Preview（不安定）                       | ❌ なし                        |
| 適用場面           | 対話型エージェント                            | バッチ処理/シンプルクエリ      |

### 1.2 選定結果

**Claude Agent SDK を採用**

理由:

1. スキル実行にはツール使用（Read, Edit, Bash等）が必須
2. Hooksによる権限制御・UI統合が必要
3. 既存の`AgentExecutor`がSDK使用パターンを採用済み
4. スキルの`allowed-tools`との親和性が高い

### 1.3 既存実装との関係

```
既存実装:
├── AgentExecutor.ts     ← Claude Agent SDK (query() API)
├── agent-client.ts      ← Direct SDK (Anthropic)
└── SkillExecutor.ts     ← 新規 (Claude Agent SDK)
```

- `SkillExecutor`は`AgentExecutor`のパターンを踏襲
- スキル固有のプロンプト構築・コンテキスト注入を追加

---

## 2. スキル検出方式

### 2.1 オプション比較

| 方式                        | メリット               | デメリット           |
| --------------------------- | ---------------------- | -------------------- |
| A: ファイルシステムスキャン | シンプル、追加設定不要 | 起動時オーバーヘッド |
| B: 設定ファイル定義         | 明示的、起動高速       | 手動メンテナンス必要 |
| C: ハイブリッド             | 柔軟性                 | 複雑                 |

### 2.2 選定結果

**A: ファイルシステムスキャン を採用**

理由:

1. Claude Code本体と同様のアプローチ
2. スキル追加時の手動設定が不要
3. `~/.claude/skills/` の標準パスを使用
4. SKILL.md frontmatterから必要な情報を取得可能

### 2.3 スキャンタイミング

```
[アプリ起動時]
    │
    ▼ SkillScanner.scan()
[メモリにキャッシュ]
    │
    ▼ ファイル変更監視 (chokidar)
[変更検知時に再スキャン]
```

---

## 3. インポート永続化

### 3.1 オプション比較

| 方式                | メリット               | デメリット       |
| ------------------- | ---------------------- | ---------------- |
| A: electron-store   | シンプル、既存利用実績 | JSON形式のみ     |
| B: SQLite (Drizzle) | リレーション、クエリ   | オーバースペック |
| C: ファイルシステム | 透明性                 | 管理複雑         |

### 3.2 選定結果

**A: electron-store を採用**

理由:

1. 既存の設定管理と統一
2. インポート情報は単純なKey-Value
3. アプリ設定と同じ場所に保存
4. 暗号化オプションあり（将来の認証情報保存用）

---

## 4. UI コンポーネント設計

### 4.1 スキル選択UI

```typescript
// 既存のLLMセレクターパターンを踏襲
interface SkillSelectorProps {
  skills: ImportedSkill[];
  selectedSkill: string | null;
  onSelect: (skillName: string | null) => void;
  onImport: () => void;
}
```

### 4.2 既存コンポーネントとの関係

```
ChatPanel
├── ModelSelector     ← 既存
├── SkillSelector     ← 新規（ModelSelectorと同じ行）
├── MessageList       ← 既存（拡張: スキル実行結果表示）
└── InputArea         ← 既存
```

### 4.3 状態管理

```typescript
// React Context for skill state
interface SkillContextValue {
  // 利用可能スキル（インポート済み + 未インポート）
  availableSkills: SkillMetadata[];
  // インポート済みスキル
  importedSkills: ImportedSkill[];
  // 選択中のスキル
  selectedSkill: string | null;
  // 実行中の状態
  isExecuting: boolean;
  // アクション
  importSkill: (name: string) => Promise<void>;
  removeSkill: (name: string) => Promise<void>;
  selectSkill: (name: string | null) => void;
  executeSkill: (prompt: string) => Promise<void>;
  abortExecution: () => void;
}
```

---

## 5. プロンプト構築戦略

### 5.1 構造

```
<command-name>/{skill-name}</command-name>

{SKILL.md 全文}

ARGUMENTS: {user-input}
```

### 5.2 コンテキスト読み込み

Claude Code本体のスキル実行と同様に:

1. SKILL.md 本文をコンテキストとして注入
2. agents/, references/ は必要時にLLMが読み込む（Progressive Disclosure）
3. scripts/ はBashツールで実行

### 5.3 Progressive Disclosure

```
[初期コンテキスト]
└── SKILL.md 本文のみ（500行以内）

[LLMが必要に応じて読み込み]
├── agents/{task}.md      ← Task実行時
├── references/{ref}.md   ← 詳細知識が必要時
└── assets/{template}     ← 出力生成時
```

---

## 6. エラーハンドリング

### 6.1 エラー分類

| カテゴリ       | 例            | 対処                        |
| -------------- | ------------- | --------------------------- |
| スキル読み込み | SKILL.md不正  | インポート拒否 + エラー表示 |
| SDK初期化      | APIキー未設定 | 設定画面へ誘導              |
| 実行時         | ツール失敗    | リトライ or ユーザー確認    |
| タイムアウト   | 長時間無応答  | AbortSignalで中断           |

### 6.2 リトライ戦略

```typescript
const RETRY_CONFIG = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
};
```

---

## 7. セキュリティ設計

### 7.1 ツール使用制限

```typescript
// スキルのallowed-toolsをホワイトリストとして使用
const ALLOWED_TOOLS = ["Read", "Edit", "Write", "Bash", "Glob", "Grep"];

function validateAllowedTools(tools: string[]): string[] {
  return tools.filter((t) => ALLOWED_TOOLS.includes(t));
}
```

### 7.2 危険コマンドブロック

```typescript
const DANGEROUS_PATTERNS = [
  "rm -rf",
  "sudo",
  "chmod 777",
  "dd if=",
  ":(){:|:&};:", // fork bomb
];

function isDangerousCommand(command: string): boolean {
  return DANGEROUS_PATTERNS.some((p) => command.includes(p));
}
```

### 7.3 ファイルアクセス制限

- 作業ディレクトリ外へのアクセスは要確認
- システムディレクトリ（/etc, /sys等）は禁止
- 隠しファイル（.env等）は警告

---

## 8. パフォーマンス考慮

### 8.1 スキルスキャン最適化

```typescript
// スキャン結果をメモリキャッシュ
const skillCache = new Map<string, SkillMetadata>();

// ファイル変更時のみ再スキャン
const watcher = chokidar.watch("~/.claude/skills/**/SKILL.md");
watcher.on("change", (path) => {
  invalidateCache(path);
});
```

### 8.2 SKILL.md コンテンツキャッシュ

```typescript
// インポート時にSKILL.md本文もキャッシュ
interface ImportedSkill {
  // ...
  content?: string; // SKILL.md 本文
  contentHash?: string; // 変更検知用
}
```

---

## 9. 将来拡張性

### 9.1 Phase 2: エージェント固有出力

```typescript
// スキル別の出力ハンドラー
interface SkillOutputHandler {
  // 出力タイプ
  type: "html" | "slide" | "file" | "chart";
  // 出力処理
  handle(output: unknown): Promise<void>;
}

// presentation-slide-generator の場合
const slideHandler: SkillOutputHandler = {
  type: "slide",
  async handle(output) {
    // スライドプレビュー表示
    await showSlidePreview(output as SlideData);
  },
};
```

### 9.2 Phase 3: 複数エージェント連携

```typescript
// パイプライン実行
interface SkillPipeline {
  steps: Array<{
    skill: string;
    inputMapping: (prev: unknown) => string;
  }>;
}
```

---

## 10. 関連ドキュメント

- [仕様書](./specification.md)
- [Claude Agent SDK リファレンス](/.claude/skills/claude-agent-sdk/references/query-api.md)
- [既存AgentExecutor](../../../apps/desktop/src/main/services/agent/AgentExecutor.ts)
