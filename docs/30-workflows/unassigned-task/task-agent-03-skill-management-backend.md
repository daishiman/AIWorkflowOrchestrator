# スキル管理バックエンド - タスク指示書

## メタ情報

| 項目         | 内容                   |
| ------------ | ---------------------- |
| タスクID     | AGENT-003              |
| タスク名     | スキル管理バックエンド |
| 分類         | 要件                   |
| 対象機能     | エージェント機能       |
| 優先度       | 高                     |
| 見積もり規模 | 中規模                 |
| ステータス   | 未実施                 |
| 発見元       | ユーザー要求           |
| 発見日       | 2026-01-09             |

---

## 依存関係と並行実行

### 依存関係マップ

```
task-agent-01-dashboard-foundation.md (AGENT-001)
    │
    ├──► task-agent-02-skill-management-ui.md (AGENT-002) ※本タスクと並行可能
    │
    └──► task-agent-03-skill-management-backend.md (AGENT-003/本タスク)
              │
              └──► task-agent-04-execution-ui.md (AGENT-004)
                        │
              └──► task-agent-05-claude-code-integration.md (AGENT-005) ※04と並行可能
```

### 本タスクの位置づけ

| 項目                     | 内容                                                          |
| ------------------------ | ------------------------------------------------------------- |
| 直接依存                 | AGENT-001（エージェントダッシュボード基盤）                   |
| 並行実行可能             | AGENT-002（スキル管理UI）※フロントはモックで並行開発可        |
| 本タスク完了後に開始可能 | AGENT-004（エージェント実行UI）, AGENT-005（Claude Code統合） |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

フロントエンドからスキル情報を取得するためのバックエンド（Main Process）実装が必要。`.claude/skills/`ディレクトリ内のスキルを読み込み、SKILL.mdを解析してメタデータを抽出し、IPC経由でRendererに提供する。

### 1.2 問題点・課題

- スキルディレクトリを読み込むMain Process側の実装がない
- SKILL.mdファイルを解析するパーサーがない
- エージェント関連のIPCハンドラーが存在しない
- スキルメタデータのキャッシュ機構がない

### 1.3 放置した場合の影響

- フロントエンドがスキル情報を取得できない
- エージェント機能全体が動作不能
- スキル管理UIが機能しない

---

## 2. 何を達成するか（What）

### 2.1 目的

Main ProcessでClaude Codeのスキルを読み込み・解析し、ユーザーが選択したスキルをインポート・管理する機能を実装する。インポート設定は永続化され、アプリ再起動後も維持される。

### 2.2 最終ゴール

- `.claude/skills/`ディレクトリから利用可能なスキル一覧を取得できる
- SKILL.mdを解析してメタデータ（名前、説明、Trigger、Anchor）を抽出できる
- ユーザーが選択したスキルをインポート・削除できる
- インポート設定がローカルストレージに永続化される
- IPC経由でスキル一覧・詳細・インポート管理ができる

### 2.3 スコープ

#### 含むもの

- スキルディレクトリスキャナー（利用可能スキル一覧取得）
- SKILL.mdパーサー
- スキルインポート管理サービス
- インポート設定の永続化（electron-store）
- IPCハンドラー
  - `agent:scan-available-skills` - 利用可能スキル一覧取得
  - `agent:get-imported-skills` - インポート済みスキル一覧取得
  - `agent:import-skills` - スキルインポート
  - `agent:remove-skill` - スキル削除
  - `agent:get-skill-detail` - スキル詳細取得
- スキルメタデータキャッシュ
- スキルパス設定（設定可能）

#### 含まないもの

- スキル実行機能（別タスク: AGENT-005）
- 実行環境管理（別タスク: AGENT-007）
- スキル編集・作成機能（スコープ外）

### 2.4 成果物

| 成果物             | パス                                                         |
| ------------------ | ------------------------------------------------------------ |
| SkillScanner       | `apps/desktop/src/main/services/skill/SkillScanner.ts`       |
| SkillParser        | `apps/desktop/src/main/services/skill/SkillParser.ts`        |
| SkillImportManager | `apps/desktop/src/main/services/skill/SkillImportManager.ts` |
| SkillService       | `apps/desktop/src/main/services/skill/SkillService.ts`       |
| agentHandlers      | `apps/desktop/src/main/ipc/agentHandlers.ts`                 |
| IPCチャネル更新    | `apps/desktop/src/preload/channels.ts`                       |
| 型定義             | `packages/shared/src/types/agent.ts`                         |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- AGENT-001（エージェントダッシュボード基盤）でIPCチャネルが定義されている
- `.claude/skills/`ディレクトリの構造を理解している

### 3.2 依存タスク

- AGENT-001: エージェントダッシュボード基盤（IPCチャネル定義）

### 3.3 必要な知識・スキル

- Node.js / TypeScript
- ファイルシステム操作
- Markdown解析
- Electron IPC

### 3.4 推奨アプローチ

1. 型定義をpackages/sharedに追加
2. SkillScannerを実装（ディレクトリスキャン）
3. SkillParserを実装（SKILL.md解析）
4. SkillServiceで統合（キャッシュ含む）
5. agentHandlersでIPC公開
6. Preloadのホワイトリスト更新

---

## 4. 実行手順

### Phase構成

Phase 1-13の標準フローに従って実装する。

### Phase 1: 要件定義

#### 使用スキル

| スキル名                    | パス                                                  | 選定理由                                |
| --------------------------- | ----------------------------------------------------- | --------------------------------------- |
| acceptance-criteria-writing | `.claude/skills/acceptance-criteria-writing/SKILL.md` | Given-When-Then形式で受け入れ基準を定義 |

#### 受け入れ基準（Given-When-Then）

```gherkin
Feature: スキル管理バックエンド

Scenario: 利用可能なスキル一覧を取得できる
  Given アプリケーションが起動している
  And .claude/skills/ ディレクトリに10個のスキルが存在する
  When Rendererがagent:scan-available-skillsを呼び出す
  Then 10個のスキルメタデータが返される
  And 各スキルにはid, name, description, path, triggersが含まれる

Scenario: スキルをインポートできる
  Given 利用可能なスキル一覧が取得済みである
  And スキルIDの配列を指定する
  When Rendererがagent:import-skills { skillIds }を呼び出す
  Then 指定したスキルがインポートされる
  And インポート設定がelectron-storeに永続化される

Scenario: インポート済みスキル一覧を取得できる
  Given 3つのスキルがインポート済みである
  When Rendererがagent:get-imported-skillsを呼び出す
  Then インポート済みの3つのスキルのみ返される

Scenario: インポート済みスキルを削除できる
  Given スキルがインポート済みである
  When Rendererがagent:remove-skill { skillId }を呼び出す
  Then スキルがインポート一覧から削除される
  And 設定が永続化される

Scenario: スキル詳細を取得できる
  Given スキルがインポート済みである
  When Rendererがagent:get-skill-detail { skillId }を呼び出す
  Then 指定したスキルの詳細情報が返される
  And anchorsの配列が含まれる

Scenario: SKILL.mdがないディレクトリは除外される
  Given .claude/skills/に無効なディレクトリがある（SKILL.mdなし）
  When 利用可能スキル一覧を取得する
  Then 無効なディレクトリは結果に含まれない

Scenario: アプリ再起動後もインポート設定が維持される
  Given 5つのスキルがインポート済みである
  When アプリケーションを再起動する
  And インポート済みスキル一覧を取得する
  Then 同じ5つのスキルが返される

Scenario: スキルパスを設定できる
  Given 設定画面でスキルパスを変更する
  When 利用可能スキル一覧を取得する
  Then 指定されたパスからスキルが読み込まれる
```

#### 成果物

- `outputs/phase-1/requirements.md`

#### 完了条件

- [ ] 受け入れ基準がGiven-When-Then形式で定義されている
- [ ] SKILL.mdのフォーマット仕様が明確化されている

---

### Phase 2: 設計

#### 使用スキル

| スキル名           | パス                                         | 選定理由                 |
| ------------------ | -------------------------------------------- | ------------------------ |
| domain-modeling    | `.claude/skills/domain-modeling/SKILL.md`    | スキルドメインモデル設計 |
| transaction-script | `.claude/skills/transaction-script/SKILL.md` | サービス層設計           |

#### 設計内容

**1. 型定義（packages/shared）**

```typescript
// packages/shared/src/types/agent.ts

export interface Skill {
  id: string; // パスから生成したハッシュ
  name: string; // SKILL.md内の# タイトル
  slug: string; // ディレクトリ名
  description: string; // ## 概要 セクション
  path: string; // SKILL.mdへの絶対パス
  triggers: string[]; // Trigger: キーワード
  anchors: Anchor[]; // Anchors セクション
  category?: string; // カテゴリ（推論）
  environment?: EnvironmentConfig;
  lastModified: Date;
}

export interface Anchor {
  source: string; // 文献名
  application: string; // 適用方法
  purpose: string; // 目的
}

export interface SkillScanResult {
  skills: Skill[];
  errors: SkillScanError[];
  scannedAt: Date;
}

export interface SkillScanError {
  path: string;
  error: string;
}
```

**2. SKILL.md解析仕様**

```markdown
# スキル名

<!-- ↑ name として抽出 -->

## 概要

<!-- description として抽出 -->

## Anchors

<!-- テーブル形式で解析 -->

| Source     | Application | Purpose |
| ---------- | ----------- | ------- |
| Clean Code | ...         | ...     |

## Trigger

<!-- キーワードリストとして解析 -->

keyword1, keyword2, keyword3

## Environment

<!-- 実行環境設定 -->

| Type | AutoRefresh | Debounce |
| ---- | ----------- | -------- |
| html | true        | 500ms    |
```

**3. クラス設計**

```typescript
// SkillScanner.ts
export class SkillScanner {
  constructor(private basePath: string) {}

  async scanDirectory(): Promise<string[]> {
    // .claude/skills/ 配下のディレクトリを列挙
    // SKILL.md が存在するディレクトリのみ返す
  }
}

// SkillParser.ts
export class SkillParser {
  async parse(skillMdPath: string): Promise<Skill> {
    // SKILL.md を読み込み、Skill オブジェクトに変換
  }

  private parseAnchors(content: string): Anchor[] {}
  private parseTriggers(content: string): string[] {}
  private parseEnvironment(content: string): EnvironmentConfig | undefined {}
}

// SkillService.ts
export class SkillService {
  private cache: Map<string, Skill> = new Map();
  private lastScanTime: Date | null = null;

  constructor(
    private scanner: SkillScanner,
    private parser: SkillParser,
  ) {}

  async getAllSkills(forceRefresh = false): Promise<SkillScanResult> {}
  async getSkillById(id: string): Promise<Skill | null> {}
  clearCache(): void {}
}
```

**4. IPCハンドラー設計**

```typescript
// agentHandlers.ts
export function registerAgentHandlers(): void {
  // agent:get-skills
  ipcMain.handle(IPC_CHANNELS.AGENT_GET_SKILLS, async () => {
    return skillService.getAllSkills();
  });

  // agent:get-skill-detail
  ipcMain.handle(
    IPC_CHANNELS.AGENT_GET_SKILL_DETAIL,
    async (_e, { skillId }) => {
      return skillService.getSkillById(skillId);
    },
  );

  // agent:refresh-skills
  ipcMain.handle(IPC_CHANNELS.AGENT_REFRESH_SKILLS, async () => {
    skillService.clearCache();
    return skillService.getAllSkills(true);
  });
}
```

**5. IPCチャネル定義**

```typescript
// channels.ts に追加
AGENT_GET_SKILLS: "agent:get-skills",
AGENT_GET_SKILL_DETAIL: "agent:get-skill-detail",
AGENT_REFRESH_SKILLS: "agent:refresh-skills",
```

#### 成果物

- `outputs/phase-2/design.md`
- クラス図

#### 完了条件

- [ ] 型定義が完成している
- [ ] クラス設計が完成している
- [ ] SKILL.md解析仕様が定義されている

---

### Phase 3: 設計レビューゲート

#### 使用スキル

| スキル名             | パス                                           | 選定理由         |
| -------------------- | ---------------------------------------------- | ---------------- |
| code-smell-detection | `.claude/skills/code-smell-detection/SKILL.md` | 設計品質チェック |

#### 完了条件

- [ ] 既存のMain Processパターンと整合している
- [ ] セキュリティ（パストラバーサル対策）が考慮されている
- [ ] エラーハンドリングが設計されている

---

### Phase 4: テスト作成

#### 使用スキル

| スキル名       | パス                                     | 選定理由        |
| -------------- | ---------------------------------------- | --------------- |
| tdd-principles | `.claude/skills/tdd-principles/SKILL.md` | TDDでテスト先行 |

#### テストケース

```typescript
// SkillScanner.test.ts
describe("SkillScanner", () => {
  it("should find directories with SKILL.md", async () => {});
  it("should ignore directories without SKILL.md", async () => {});
  it("should handle empty directory", async () => {});
  it("should handle non-existent base path", async () => {});
});

// SkillParser.test.ts
describe("SkillParser", () => {
  it("should parse skill name from h1", async () => {});
  it("should parse description from 概要 section", async () => {});
  it("should parse anchors table", async () => {});
  it("should parse trigger keywords", async () => {});
  it("should parse environment config", async () => {});
  it("should handle missing sections gracefully", async () => {});
  it("should generate consistent id from path", async () => {});
});

// SkillService.test.ts
describe("SkillService", () => {
  it("should return all skills", async () => {});
  it("should cache skills after first fetch", async () => {});
  it("should force refresh when requested", async () => {});
  it("should return skill by id", async () => {});
  it("should return null for unknown id", async () => {});
  it("should collect errors for invalid skills", async () => {});
});

// agentHandlers.test.ts
describe("agentHandlers", () => {
  it("should handle agent:get-skills", async () => {});
  it("should handle agent:get-skill-detail", async () => {});
  it("should handle agent:refresh-skills", async () => {});
});
```

#### 完了条件

- [ ] 各クラス/関数のユニットテストがある
- [ ] IPCハンドラーのテストがある
- [ ] すべてのテストが失敗状態（Red）

---

### Phase 5: 実装

#### 使用スキル

| スキル名        | パス                                      | 選定理由     |
| --------------- | ----------------------------------------- | ------------ |
| domain-modeling | `.claude/skills/domain-modeling/SKILL.md` | サービス実装 |

#### 実装ファイル

1. `packages/shared/src/types/agent.ts`
2. `apps/desktop/src/main/services/skill/SkillScanner.ts`
3. `apps/desktop/src/main/services/skill/SkillParser.ts`
4. `apps/desktop/src/main/services/skill/SkillService.ts`
5. `apps/desktop/src/main/services/skill/index.ts`
6. `apps/desktop/src/main/ipc/agentHandlers.ts`
7. `apps/desktop/src/main/ipc/index.ts`（更新：ハンドラー登録）
8. `apps/desktop/src/preload/channels.ts`（更新：ホワイトリスト）

#### 完了条件

- [ ] 全クラスが実装されている
- [ ] IPCハンドラーが動作する
- [ ] キャッシュが機能する
- [ ] テストがすべて通過（Green）

---

### Phase 6-13: 標準フロー

標準のPhase 6-13フローに従って実装を完了する。

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] スキル一覧を取得できる
- [ ] スキル詳細を取得できる
- [ ] SKILL.mdが正しく解析される
- [ ] キャッシュが機能する
- [ ] キャッシュを更新できる

### 品質要件

- [ ] テストカバレッジ: Line 80%以上
- [ ] TypeScript型エラーなし
- [ ] ESLint/Prettierエラーなし

### セキュリティ要件

- [ ] パストラバーサル攻撃が防止されている
- [ ] エラーメッセージから機密情報が漏洩しない

### ドキュメント要件

- [ ] SKILL.md解析仕様が文書化されている
- [ ] 実装ガイドが作成されている

---

## 6. 検証方法

### テストケース

```bash
# ユニットテスト
pnpm --filter @repo/desktop test src/main/services/skill/
pnpm --filter @repo/desktop test src/main/ipc/agentHandlers.test.ts
```

### 検証手順

1. アプリを起動
2. DevToolsからIPC呼び出しを確認
   ```javascript
   await window.electronAPI.invoke("agent:get-skills");
   ```
3. スキル一覧が返されることを確認
4. スキル詳細が返されることを確認
5. キャッシュ動作を確認（2回目の呼び出しが高速）

---

## 7. リスクと対策

| リスク                       | 影響度 | 発生確率 | 対策                                   |
| ---------------------------- | ------ | -------- | -------------------------------------- |
| SKILL.md形式の不統一         | 中     | 高       | 堅牢なパーサー、fallback値、エラー収集 |
| 大量スキルでのパフォーマンス | 中     | 低       | キャッシュ、遅延読み込み               |
| パストラバーサル攻撃         | 高     | 低       | ベースパス検証、パス正規化             |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/skill-list.md` - 既存スキル一覧
- `apps/desktop/src/main/ipc/` - 既存IPCハンドラー参照
- `apps/desktop/src/preload/channels.ts` - チャネル定義

### 参考資料

- [marked](https://marked.js.org/) - Markdownパーサー候補
- [gray-matter](https://github.com/jonschlinkert/gray-matter) - Front-matter解析

---

## 9. 備考

### SKILL.md解析の堅牢性

```typescript
// 解析失敗時のfallback
const defaultSkill: Partial<Skill> = {
  name: "Unknown Skill",
  description: "Description not available",
  triggers: [],
  anchors: [],
};
```

### キャッシュ戦略

- 初回読み込み時に全スキルをキャッシュ
- TTL: 設定可能（デフォルト: 無制限、手動更新のみ）
- ファイル変更監視は将来検討（複雑さのため初期実装では除外）

### スキルパス設定

```typescript
// 環境変数または設定ファイルから取得
const skillBasePath =
  process.env.SKILL_PATH || path.join(homedir(), ".claude", "skills");
```
