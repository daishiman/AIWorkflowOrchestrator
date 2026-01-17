# Claude Code CLI統合 - CLI調査レポート

## メタ情報

| 項目       | 値                          |
| ---------- | --------------------------- |
| 機能名     | claude-code-cli-integration |
| バージョン | 1.0.0                       |
| 作成日     | 2026-01-17                  |
| Phase      | 1                           |

---

## 1. 調査概要

### 1.1 調査目的

Claude Code CLIでスキルを実行するためのコマンド仕様を調査し、技術的実現可能性を評価する。

### 1.2 調査対象

- Claude Code CLI コマンド仕様
- `.claude/skills/` ディレクトリ構造
- スキル実行メカニズム
- 出力フォーマット

### 1.3 参照資料

| 資料              | パス/URL                                             |
| ----------------- | ---------------------------------------------------- |
| claude-code-guide | `.claude/skills/claude-code-guide/SKILL.md`          |
| Claude Code仕様   | `.claude/skills/aiworkflow-requirements/references/` |
| 18-skills.md      | プロジェクト内ドキュメント                           |

---

## 2. Claude Code CLI アーキテクチャ

### 2.1 3層アーキテクチャ

Claude Codeは以下の3層アーキテクチャで構成される：

```
┌─────────────────────────────────────────────────┐
│  Command Layer (UI/インターフェース)            │
│  - /ai:task-name コマンド                       │
│  - ユーザー入力の受付                           │
└─────────────────────────────────────────────────┘
                      │
                      ▼ (Task tool)
┌─────────────────────────────────────────────────┐
│  Agent Layer (タスク実行)                       │
│  - .claude/agents/agent-name.md                │
│  - ワークフロー制御                             │
└─────────────────────────────────────────────────┘
                      │
                      ▼ (reads)
┌─────────────────────────────────────────────────┐
│  Skill Layer (ドメイン知識)                     │
│  - .claude/skills/skill-name/SKILL.md          │
│  - スクリプト実行 (scripts/)                   │
│  - 参照情報 (references/)                      │
└─────────────────────────────────────────────────┘
```

**依存方向**: Command → Agent → Skill（一方向のみ許可）

### 2.2 スキル構造

```
skill-name/
├── SKILL.md           # 中央仕様書（≤500行）
├── agents/            # タスク仕様
├── scripts/           # 実行可能コード (Python/Bash/Node)
├── references/        # ナレッジベース
└── assets/            # 出力テンプレート・リソース
```

---

## 3. スキル実行メカニズム

### 3.1 実行フロー

スキルはCLIから**直接実行されない**。実行フローは以下の通り：

```
1. ユーザー: /ai:task-name コマンド入力
       ↓
2. Command: Task tool でエージェントを起動
       ↓
3. Agent: SKILL.md を読み込み、必要に応じて
   - references/ を参照
   - scripts/ を実行
       ↓
4. Skill: スクリプトが標準出力・終了コードを返す
       ↓
5. Agent: 結果を処理・レスポンス生成
       ↓
6. Command: ユーザーに結果を表示
```

### 3.2 スキル実行方式

**重要な発見**: Claude Code CLIでは、スキルはSkill toolまたはTask toolを介して読み込まれる。直接的な`claude skill execute <skill-name>`のようなコマンドは存在しない。

代わりに：

1. **Skill tool**: スキルをロードし、SKILL.mdの内容をコンテキストに追加
2. **Task tool**: エージェントを起動し、エージェントがスキルを参照

### 3.3 スクリプト実行

スキル内のスクリプトは以下の方法で実行される：

```bash
# Node.jsスクリプト
node .claude/skills/{{skill-name}}/scripts/script-name.mjs [args]

# Pythonスクリプト
python .claude/skills/{{skill-name}}/scripts/script-name.py [args]

# Bashスクリプト
bash .claude/skills/{{skill-name}}/scripts/script-name.sh [args]
```

---

## 4. SKILL.md フォーマット

### 4.1 Frontmatter仕様

```yaml
---
name: skill-name # kebab-case、最大64文字
description: | # 最大1024文字（トリガー含む）
  {{概要 (2-3行)}}

  Anchors:
  • {{reference}} / 適用: {{scope}} / 目的: {{purpose}}

  Trigger:
  Use when {{condition}}.
tags: [] # オプション：検索用タグ
dependencies: [] # オプション：依存スキル（参照のみ）
allowed-tools: [] # オプション：許可ツール
---
```

### 4.2 パース方法

Frontmatterは標準的なYAML形式でパース可能：

```typescript
import matter from "gray-matter";
import { readFileSync } from "fs";

const content = readFileSync("SKILL.md", "utf-8");
const { data, content: body } = matter(content);

// data: { name, description, tags, dependencies, allowedTools }
```

---

## 5. 出力フォーマット

### 5.1 スクリプト出力仕様

| 項目       | 仕様                                   |
| ---------- | -------------------------------------- |
| 標準出力   | 通常の実行結果を`stdout`に出力         |
| エラー出力 | 詳細なエラーメッセージを`stderr`に出力 |
| 冪等性     | 同じ入力 → 同じ出力（毎回）            |
| ヘルプ     | `-h`/`--help`フラグをサポート          |

### 5.2 出力形式

スクリプトの出力形式はスキルにより異なる：

- **プレーンテキスト**: 人間可読な結果
- **JSON**: 構造化データ
- **Markdown**: ドキュメント生成

出力形式の判定は、スクリプトの実装に依存する。

---

## 6. 終了コード体系

### 6.1 標準終了コード

| 終了コード | 意味           | 使用場面                     |
| ---------- | -------------- | ---------------------------- |
| 0          | 成功           | タスクが正常完了             |
| 1          | 一般エラー     | 予期しない失敗               |
| 2          | 引数エラー     | 無効/不足の引数              |
| 3          | ファイル未発見 | 必要なファイルが見つからない |
| 4          | 検証失敗       | データ検証エラー             |
| 5          | 依存関係エラー | 依存関係が見つからない       |

### 6.2 終了コード処理

```typescript
import { spawn } from "child_process";

const process = spawn("node", ["script.mjs", ...args]);

process.on("exit", (code) => {
  switch (code) {
    case 0:
      // 成功処理
      break;
    case 1:
      // 一般エラー処理
      break;
    // ...
  }
});
```

---

## 7. プログレッシブディスクロージャー

### 7.1 段階的ロード

スキルはコンテキスト効率のため段階的にロードされる：

| レベル | 内容                      | ロードタイミング     |
| ------ | ------------------------- | -------------------- |
| 1      | メタデータ（name + desc） | スキル検出フェーズ   |
| 2      | SKILL.md内容              | 基本的な使用時       |
| 3      | agents/, references/      | タスク仕様が必要な時 |
| 4      | scripts/, assets/         | 実行/出力が必要な時  |

### 7.2 実装への示唆

- スキル一覧取得時はLevel 1のみパース
- 詳細情報取得時にLevel 2をロード
- 実行時にLevel 3-4を必要に応じてロード

---

## 8. エラーハンドリング

### 8.1 リカバリー戦略

| 方法             | 確実性 | 適用場面               |
| ---------------- | ------ | ---------------------- |
| 終了コード検査   | 確実   | スクリプト失敗検出     |
| git rollback     | 確実   | ファイル変更の取り消し |
| スクリプト再試行 | 部分的 | 一時的な失敗のみ       |
| AI自動診断       | 不確実 | 依存せず手動検証       |

### 8.2 エラーレスポンスプロトコル

1. `stderr`出力をキャプチャ
2. 終了コードを仕様と照合
3. 非ゼロの場合：適切なリカバリー適用
4. LOGS.mdにエラーを記録（フィードバックループ）

---

## 9. 技術的実現可能性評価

### 9.1 実現可能な機能

| 機能                 | 実現性 | 方法                                      |
| -------------------- | ------ | ----------------------------------------- |
| スキル一覧取得       | ○      | ファイルシステムスキャン + SKILL.mdパース |
| スキルメタデータ取得 | ○      | gray-matterによるfrontmatterパース        |
| スクリプト実行       | ○      | child_process.spawn()                     |
| 出力ストリーミング   | ○      | stdout/stderrのpipe処理                   |
| 終了コード取得       | ○      | プロセスexitイベント                      |
| セッション管理       | ○      | プロセスID追跡 + Mapによる管理            |

### 9.2 制約事項

| 制約               | 詳細                                   | 対応策                   |
| ------------------ | -------------------------------------- | ------------------------ |
| 直接スキル実行不可 | CLIにはスキル直接実行コマンドがない    | スクリプト直接実行で代替 |
| Agent経由の制約    | 本来のフローはAgent経由                | スクリプトレベルで対応   |
| コンテキスト管理   | プログレッシブディスクロージャーの模倣 | 段階的ロードの実装       |

### 9.3 リスク評価

| リスク                 | 影響度 | 確率 | 対策                             |
| ---------------------- | ------ | ---- | -------------------------------- |
| CLI仕様変更            | 高     | 中   | バージョンピニング、互換性テスト |
| スキルフォーマット変更 | 中     | 低   | フォーマット検証、フォールバック |
| パフォーマンス問題     | 中     | 中   | キャッシュ、並列処理             |

---

## 10. 推奨アーキテクチャ

### 10.1 コンポーネント構成

```
┌─────────────────────────────────────────────────────────────┐
│                    Renderer Process                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  claudeCliAPI (via contextBridge)                    │  │
│  │  - checkInstallation()                               │  │
│  │  - listSkills()                                      │  │
│  │  - executeSkill(name, args)                          │  │
│  │  - onOutput(callback)                                │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           │ IPC
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Main Process                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  ClaudeCliManager                                    │  │
│  │  - checkInstallation(): Promise<InstallationStatus>  │  │
│  │  - scanSkills(): Promise<SkillMetadata[]>            │  │
│  │  - createSession(): Promise<Session>                 │  │
│  │  - executeScript(skillName, script, args): Stream    │  │
│  │  - terminateSession(sessionId): Promise<void>        │  │
│  └──────────────────────────────────────────────────────┘  │
│                           │                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  SkillScanner                                        │  │
│  │  - scan(basePath): Promise<SkillInfo[]>              │  │
│  │  - parseSkillMd(path): Promise<SkillMetadata>        │  │
│  │  - validateSkill(path): boolean                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                           │                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  SessionManager                                      │  │
│  │  - sessions: Map<string, Session>                    │  │
│  │  - create(): Session                                 │  │
│  │  - get(id): Session | undefined                      │  │
│  │  - terminate(id): void                               │  │
│  │  - terminateAll(): void                              │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼ child_process.spawn()
┌─────────────────────────────────────────────────────────────┐
│                    Child Process                            │
│  node/python/bash .claude/skills/xxx/scripts/yyy.mjs       │
│  - stdout → Streaming                                       │
│  - stderr → Error capture                                   │
│  - exit code → Status                                       │
└─────────────────────────────────────────────────────────────┘
```

### 10.2 IPC チャンネル設計

```typescript
// チャンネル定義
export const CLAUDE_CLI_CHANNELS = {
  // Invoke/Handle パターン
  CHECK_INSTALLATION: "claude-cli:check-installation",
  LIST_SKILLS: "claude-cli:list-skills",
  GET_SKILL_DETAIL: "claude-cli:get-skill-detail",
  CREATE_SESSION: "claude-cli:create-session",
  EXECUTE_SCRIPT: "claude-cli:execute-script",
  TERMINATE_SESSION: "claude-cli:terminate-session",

  // On/Send パターン（ストリーミング）
  OUTPUT_STREAM: "claude-cli:output-stream",
  SESSION_STATUS: "claude-cli:session-status",
} as const;
```

---

## 11. 結論

### 11.1 技術的実現可能性

**評価: 実現可能**

Claude Code CLIとの直接的なスキル実行コマンドは存在しないが、以下の方法で同等の機能を実現可能：

1. **スキルスキャン**: ファイルシステムAPIで`.claude/skills/`をスキャン
2. **メタデータパース**: gray-matterでSKILL.mdのfrontmatterをパース
3. **スクリプト実行**: child_process.spawn()でスキル内スクリプトを直接実行
4. **出力キャプチャ**: stdout/stderrをストリーミングでキャプチャ
5. **セッション管理**: プロセスIDベースでセッションを管理

### 11.2 推奨アプローチ

1. スキルのスクリプトを直接実行する方式を採用
2. SKILL.mdのメタデータを活用してスキル選択・フィルタリングを実現
3. プログレッシブディスクロージャーを実装してパフォーマンスを最適化
4. 標準的なElectron IPC パターンでRenderer-Main間通信を実装

### 11.3 次ステップ

1. Phase 2: 詳細設計（クラス図、シーケンス図）
2. Phase 3: 設計レビュー
3. Phase 4: テスト作成（TDD）
4. Phase 5: 実装開始

---

## 変更履歴

| 日付       | バージョン | 変更内容 |
| ---------- | ---------- | -------- |
| 2026-01-17 | 1.0.0      | 初版作成 |
