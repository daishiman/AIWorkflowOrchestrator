# Claude Code CLI統合 - アーキテクチャ設計書

## メタ情報

| 項目       | 値                          |
| ---------- | --------------------------- |
| 機能名     | claude-code-cli-integration |
| バージョン | 1.0.0                       |
| 作成日     | 2026-01-17                  |
| Phase      | 2                           |

---

## 1. システム概要

### 1.1 目的

Electronデスクトップアプリから、ローカルのClaude Code CLIを呼び出し、`.claude/skills/`配下のスキルを実行し、その結果をストリーミングで取得できる統合基盤を構築する。

### 1.2 設計原則

| 原則                   | 説明                                         |
| ---------------------- | -------------------------------------------- |
| 単一責任               | 各コンポーネントは1つの明確な責務を持つ      |
| 依存性逆転             | 上位モジュールは下位モジュールの抽象に依存   |
| インターフェース分離   | クライアントが使用しないメソッドに依存しない |
| セキュリティファースト | IPC通信は最小権限、ホワイトリスト方式        |

---

## 2. 全体アーキテクチャ

### 2.1 レイヤー構成図

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Renderer Process                              │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                        React UI Layer                          │  │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌───────────────┐  │  │
│  │  │   SkillPanel    │  │   OutputViewer  │  │ SessionStatus │  │  │
│  │  └────────┬────────┘  └────────┬────────┘  └───────┬───────┘  │  │
│  └───────────┼────────────────────┼───────────────────┼──────────┘  │
│              │                    │                   │              │
│  ┌───────────┴────────────────────┴───────────────────┴──────────┐  │
│  │              Zustand Store (claudeCliSlice)                    │  │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌───────────────┐  │  │
│  │  │     skills      │  │    sessions     │  │   streaming   │  │  │
│  │  │  SkillInfo[]    │  │  Session[]      │  │   output[]    │  │  │
│  │  └─────────────────┘  └─────────────────┘  └───────────────┘  │  │
│  └───────────────────────────────┬───────────────────────────────┘  │
│                                  │                                   │
│  ┌───────────────────────────────┴───────────────────────────────┐  │
│  │              window.claudeCliAPI (contextBridge)               │  │
│  │  - checkInstallation()    - executeScript()                    │  │
│  │  - listSkills()           - onOutputStream()                   │  │
│  │  - getSkillDetail()       - terminateSession()                 │  │
│  └───────────────────────────────┬───────────────────────────────┘  │
└──────────────────────────────────┼───────────────────────────────────┘
                                   │ IPC (invoke/on)
                                   ▼
┌──────────────────────────────────────────────────────────────────────┐
│                          Main Process                                 │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │                    IPC Handler Layer                            │  │
│  │  ┌──────────────────────────────────────────────────────────┐  │  │
│  │  │              ClaudeCliIpcHandler                          │  │  │
│  │  │  - validateIpcSender()                                    │  │  │
│  │  │  - handleCheckInstallation()                              │  │  │
│  │  │  - handleListSkills()                                     │  │  │
│  │  │  - handleExecuteScript()                                  │  │  │
│  │  │  - handleTerminateSession()                               │  │  │
│  │  └──────────────────────────────────────────────────────────┘  │  │
│  └─────────────────────────────────┬──────────────────────────────┘  │
│                                    │                                  │
│  ┌─────────────────────────────────┼──────────────────────────────┐  │
│  │                    Service Layer                                │  │
│  │  ┌──────────────────┐  ┌───────┴────────┐  ┌────────────────┐  │  │
│  │  │   CliDetector    │  │ ClaudeCliManager│  │ SkillScanner   │  │  │
│  │  │                  │  │                 │  │                │  │  │
│  │  │ - checkVersion() │  │ - executeScript()│ │ - scanSkills() │  │  │
│  │  │ - getCliPath()   │  │ - getSession()  │  │ - parseSkill() │  │  │
│  │  │ - validateCli()  │  │ - cleanup()     │  │ - validate()   │  │  │
│  │  └──────────────────┘  └────────┬────────┘  └────────────────┘  │  │
│  └─────────────────────────────────┼──────────────────────────────┘  │
│                                    │                                  │
│  ┌─────────────────────────────────┼──────────────────────────────┐  │
│  │                    Domain Layer                                 │  │
│  │  ┌──────────────────┐  ┌───────┴────────┐  ┌────────────────┐  │  │
│  │  │  SessionManager  │  │ ProcessManager │  │  OutputParser  │  │  │
│  │  │                  │  │                │  │                │  │  │
│  │  │ - create()       │  │ - spawn()      │  │ - parseLine()  │  │  │
│  │  │ - get()          │  │ - kill()       │  │ - parseChunk() │  │  │
│  │  │ - terminate()    │  │ - onData()     │  │ - encode()     │  │  │
│  │  │ - cleanupAll()   │  │ - onExit()     │  │ - validate()   │  │  │
│  │  └──────────────────┘  └────────────────┘  └────────────────┘  │  │
│  └────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────┬───────────────────────────────────┘
                                   │ child_process.spawn()
                                   ▼
┌──────────────────────────────────────────────────────────────────────┐
│                        External Process                               │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │  node/python/bash .claude/skills/xxx/scripts/yyy.mjs           │  │
│  │                                                                 │  │
│  │  stdin  ← (arguments, prompts)                                  │  │
│  │  stdout → (streaming output)                                    │  │
│  │  stderr → (error messages)                                      │  │
│  │  exit   → (exit code: 0-5)                                      │  │
│  └────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
```

### 2.2 コンポーネント責務

| コンポーネント      | 責務                                       | 配置場所                            |
| ------------------- | ------------------------------------------ | ----------------------------------- |
| claudeCliSlice      | UI状態管理（スキル一覧、セッション、出力） | `apps/desktop/src/renderer/store/`  |
| claudeCliAPI        | Renderer→Main IPC通信インターフェース      | `apps/desktop/src/preload/`         |
| ClaudeCliIpcHandler | IPCリクエスト処理、セキュリティ検証        | `apps/desktop/src/main/ipc/`        |
| ClaudeCliManager    | CLI統合のファサード、外部API               | `apps/desktop/src/main/claude-cli/` |
| CliDetector         | CLIインストール検出・バージョン確認        | `apps/desktop/src/main/claude-cli/` |
| SkillScanner        | スキルディレクトリスキャン・メタデータ抽出 | `apps/desktop/src/main/claude-cli/` |
| SessionManager      | セッションライフサイクル管理               | `apps/desktop/src/main/claude-cli/` |
| ProcessManager      | 子プロセス生成・監視・終了                 | `apps/desktop/src/main/claude-cli/` |
| OutputParser        | stdout/stderr解析・エンコーディング処理    | `apps/desktop/src/main/claude-cli/` |

---

## 3. コンポーネント詳細設計

### 3.1 CliDetector

```typescript
// apps/desktop/src/main/claude-cli/CliDetector.ts

interface CliDetectorConfig {
  customPath?: string;
  timeoutMs?: number;
}

interface CliInstallationStatus {
  installed: boolean;
  version: string | null;
  path: string | null;
  error: string | null;
}

class CliDetector {
  private config: CliDetectorConfig;
  private cachedStatus: CliInstallationStatus | null = null;
  private cacheExpiry: number = 0;

  constructor(config: CliDetectorConfig = {}) {
    this.config = {
      timeoutMs: 5000,
      ...config,
    };
  }

  /**
   * CLIインストール状態を確認
   */
  async checkInstallation(): Promise<CliInstallationStatus> {
    // キャッシュ有効期限内ならキャッシュを返す
    if (this.cachedStatus && Date.now() < this.cacheExpiry) {
      return this.cachedStatus;
    }

    try {
      const version = await this.executeVersionCommand();
      const cliPath = await this.resolveCliPath();

      this.cachedStatus = {
        installed: true,
        version,
        path: cliPath,
        error: null,
      };
    } catch (error) {
      this.cachedStatus = {
        installed: false,
        version: null,
        path: null,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }

    this.cacheExpiry = Date.now() + 60000; // 1分間キャッシュ
    return this.cachedStatus;
  }

  /**
   * claude --version を実行してバージョン取得
   */
  private async executeVersionCommand(): Promise<string> {
    // 実装詳細は ProcessManager に委譲
  }

  /**
   * CLI実行パスを解決
   */
  private async resolveCliPath(): Promise<string> {
    // which/where コマンドでパス解決
  }

  /**
   * キャッシュをクリア
   */
  clearCache(): void {
    this.cachedStatus = null;
    this.cacheExpiry = 0;
  }
}
```

### 3.2 SkillScanner

```typescript
// apps/desktop/src/main/claude-cli/SkillScanner.ts

interface SkillScannerConfig {
  basePath: string;
  maxDepth?: number;
  includeDisabled?: boolean;
}

interface SkillMetadata {
  name: string;
  path: string;
  description: string;
  tags: string[];
  triggers: string[];
  dependencies: string[];
  allowedTools: string[];
  hasScripts: boolean;
  hasReferences: boolean;
}

interface ScanResult {
  skills: SkillMetadata[];
  errors: ScanError[];
  scannedAt: number;
}

class SkillScanner {
  private config: SkillScannerConfig;
  private cachedResult: ScanResult | null = null;

  constructor(config: SkillScannerConfig) {
    this.config = {
      maxDepth: 2,
      includeDisabled: false,
      ...config,
    };
  }

  /**
   * スキルディレクトリをスキャン
   */
  async scan(): Promise<ScanResult> {
    const skills: SkillMetadata[] = [];
    const errors: ScanError[] = [];

    // .claude/skills/ 配下のディレクトリを列挙
    const skillDirs = await this.listSkillDirectories();

    for (const dir of skillDirs) {
      try {
        const skillMdPath = path.join(dir, "SKILL.md");

        // SKILL.md 存在確認
        if (!(await this.fileExists(skillMdPath))) {
          continue;
        }

        // パストラバーサル検証
        this.validatePath(skillMdPath);

        // メタデータ抽出
        const metadata = await this.parseSkillMd(skillMdPath);
        skills.push(metadata);
      } catch (error) {
        errors.push({
          path: dir,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    const result: ScanResult = {
      skills,
      errors,
      scannedAt: Date.now(),
    };

    this.cachedResult = result;
    return result;
  }

  /**
   * SKILL.md をパースしてメタデータ抽出
   */
  private async parseSkillMd(skillMdPath: string): Promise<SkillMetadata> {
    const content = await fs.readFile(skillMdPath, "utf-8");
    const { data, content: body } = matter(content);

    return {
      name: data.name || path.basename(path.dirname(skillMdPath)),
      path: path.dirname(skillMdPath),
      description: this.extractDescription(data.description || ""),
      tags: data.tags || [],
      triggers: this.extractTriggers(data.description || ""),
      dependencies: data.dependencies || [],
      allowedTools: data["allowed-tools"] || [],
      hasScripts: await this.hasDirectory(
        path.join(path.dirname(skillMdPath), "scripts"),
      ),
      hasReferences: await this.hasDirectory(
        path.join(path.dirname(skillMdPath), "references"),
      ),
    };
  }

  /**
   * パストラバーサル検証
   */
  private validatePath(targetPath: string): void {
    const normalized = path.normalize(targetPath);
    const resolved = path.resolve(this.config.basePath, normalized);

    if (!resolved.startsWith(path.resolve(this.config.basePath))) {
      throw new Error("PATH_TRAVERSAL_DETECTED");
    }
  }

  /**
   * 名前・タグ・説明でフィルタリング
   */
  filter(criteria: FilterCriteria): SkillMetadata[] {
    if (!this.cachedResult) {
      throw new Error("SCAN_NOT_PERFORMED");
    }

    return this.cachedResult.skills.filter((skill) => {
      if (criteria.name && !skill.name.includes(criteria.name)) {
        return false;
      }
      if (
        criteria.tags?.length &&
        !criteria.tags.some((tag) => skill.tags.includes(tag))
      ) {
        return false;
      }
      if (
        criteria.keyword &&
        !skill.description
          .toLowerCase()
          .includes(criteria.keyword.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }
}
```

### 3.3 SessionManager

```typescript
// apps/desktop/src/main/claude-cli/SessionManager.ts

interface SessionConfig {
  maxSessions?: number;
  defaultTimeoutMs?: number;
}

interface Session {
  id: string;
  skillName: string;
  status: SessionStatus;
  process: ChildProcess | null;
  startedAt: number;
  completedAt: number | null;
  exitCode: number | null;
  output: string[];
  error: string[];
}

type SessionStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "terminated";

class SessionManager {
  private sessions: Map<string, Session> = new Map();
  private config: SessionConfig;
  private processManager: ProcessManager;

  constructor(processManager: ProcessManager, config: SessionConfig = {}) {
    this.processManager = processManager;
    this.config = {
      maxSessions: 10,
      defaultTimeoutMs: 30 * 60 * 1000, // 30分
      ...config,
    };
  }

  /**
   * 新しいセッションを作成
   */
  create(skillName: string): Session {
    // 最大セッション数チェック
    if (this.sessions.size >= this.config.maxSessions!) {
      this.evictOldestSession();
    }

    const session: Session = {
      id: crypto.randomUUID(),
      skillName,
      status: "pending",
      process: null,
      startedAt: Date.now(),
      completedAt: null,
      exitCode: null,
      output: [],
      error: [],
    };

    this.sessions.set(session.id, session);
    return session;
  }

  /**
   * セッションを取得
   */
  get(sessionId: string): Session | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * 全セッション一覧を取得
   */
  list(): Session[] {
    return Array.from(this.sessions.values());
  }

  /**
   * セッションを終了
   */
  async terminate(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error("SESSION_NOT_FOUND");
    }

    if (session.process) {
      await this.processManager.kill(session.process);
    }

    session.status = "terminated";
    session.completedAt = Date.now();
  }

  /**
   * 全セッションをクリーンアップ
   */
  async cleanupAll(): Promise<void> {
    const promises = Array.from(this.sessions.keys()).map((id) =>
      this.terminate(id).catch(() => {}),
    );
    await Promise.all(promises);
    this.sessions.clear();
  }

  /**
   * 最も古いセッションを削除（LRU方式）
   */
  private evictOldestSession(): void {
    let oldest: Session | null = null;

    for (const session of this.sessions.values()) {
      if (session.status === "completed" || session.status === "terminated") {
        if (!oldest || session.completedAt! < oldest.completedAt!) {
          oldest = session;
        }
      }
    }

    if (oldest) {
      this.sessions.delete(oldest.id);
    } else {
      // 完了セッションがない場合は最も古い実行中セッションを終了
      let oldestRunning: Session | null = null;
      for (const session of this.sessions.values()) {
        if (!oldestRunning || session.startedAt < oldestRunning.startedAt) {
          oldestRunning = session;
        }
      }
      if (oldestRunning) {
        this.terminate(oldestRunning.id);
      }
    }
  }
}
```

### 3.4 ProcessManager

```typescript
// apps/desktop/src/main/claude-cli/ProcessManager.ts

interface SpawnOptions {
  cwd?: string;
  env?: NodeJS.ProcessEnv;
  timeoutMs?: number;
}

interface ProcessResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}

class ProcessManager {
  private runningProcesses: Map<number, ChildProcess> = new Map();

  /**
   * 子プロセスをスポーン
   */
  spawn(
    command: string,
    args: string[],
    options: SpawnOptions = {},
  ): ChildProcess {
    const childProcess = spawn(command, args, {
      cwd: options.cwd,
      env: { ...process.env, ...options.env },
      stdio: ["pipe", "pipe", "pipe"],
      shell: false, // シェルインジェクション防止
    });

    if (childProcess.pid) {
      this.runningProcesses.set(childProcess.pid, childProcess);
    }

    // プロセス終了時にマップから削除
    childProcess.on("exit", () => {
      if (childProcess.pid) {
        this.runningProcesses.delete(childProcess.pid);
      }
    });

    // タイムアウト設定
    if (options.timeoutMs) {
      setTimeout(() => {
        if (childProcess.pid && this.runningProcesses.has(childProcess.pid)) {
          this.kill(childProcess);
        }
      }, options.timeoutMs);
    }

    return childProcess;
  }

  /**
   * プロセスを終了（graceful → force）
   */
  async kill(childProcess: ChildProcess): Promise<void> {
    return new Promise((resolve) => {
      const pid = childProcess.pid;
      if (!pid) {
        resolve();
        return;
      }

      // まずSIGTERMを送信
      childProcess.kill("SIGTERM");

      // 5秒後にまだ生きていればSIGKILL
      const forceKillTimeout = setTimeout(() => {
        if (this.runningProcesses.has(pid)) {
          childProcess.kill("SIGKILL");
        }
      }, 5000);

      childProcess.on("exit", () => {
        clearTimeout(forceKillTimeout);
        this.runningProcesses.delete(pid);
        resolve();
      });
    });
  }

  /**
   * コマンドを実行して結果を取得（同期的に完了を待つ）
   */
  async execute(
    command: string,
    args: string[],
    options: SpawnOptions = {},
  ): Promise<ProcessResult> {
    return new Promise((resolve, reject) => {
      const childProcess = this.spawn(command, args, options);

      let stdout = "";
      let stderr = "";

      childProcess.stdout?.on("data", (data) => {
        stdout += data.toString();
      });

      childProcess.stderr?.on("data", (data) => {
        stderr += data.toString();
      });

      childProcess.on("error", (error) => {
        reject(error);
      });

      childProcess.on("exit", (code) => {
        resolve({
          exitCode: code ?? 1,
          stdout,
          stderr,
        });
      });
    });
  }

  /**
   * 全プロセスを終了
   */
  async killAll(): Promise<void> {
    const promises = Array.from(this.runningProcesses.values()).map((process) =>
      this.kill(process),
    );
    await Promise.all(promises);
  }
}
```

### 3.5 ClaudeCliManager（ファサード）

```typescript
// apps/desktop/src/main/claude-cli/ClaudeCliManager.ts

interface ClaudeCliManagerConfig {
  skillsBasePath: string;
  maxSessions?: number;
  defaultTimeoutMs?: number;
}

class ClaudeCliManager {
  private cliDetector: CliDetector;
  private skillScanner: SkillScanner;
  private sessionManager: SessionManager;
  private processManager: ProcessManager;
  private outputParser: OutputParser;
  private config: ClaudeCliManagerConfig;

  constructor(config: ClaudeCliManagerConfig) {
    this.config = config;
    this.processManager = new ProcessManager();
    this.cliDetector = new CliDetector();
    this.skillScanner = new SkillScanner({
      basePath: config.skillsBasePath,
    });
    this.sessionManager = new SessionManager(this.processManager, {
      maxSessions: config.maxSessions,
      defaultTimeoutMs: config.defaultTimeoutMs,
    });
    this.outputParser = new OutputParser();
  }

  /**
   * CLIインストール状態を確認
   */
  async checkInstallation(): Promise<CliInstallationStatus> {
    return this.cliDetector.checkInstallation();
  }

  /**
   * スキル一覧を取得
   */
  async listSkills(): Promise<ScanResult> {
    return this.skillScanner.scan();
  }

  /**
   * スキルをフィルタリング
   */
  filterSkills(criteria: FilterCriteria): SkillMetadata[] {
    return this.skillScanner.filter(criteria);
  }

  /**
   * スキルのスクリプトを実行
   */
  async executeScript(
    skillName: string,
    scriptPath: string,
    args: string[],
    onOutput: (message: StreamMessage) => void,
  ): Promise<Session> {
    // セッション作成
    const session = this.sessionManager.create(skillName);

    try {
      // スクリプトパス検証
      const fullScriptPath = path.join(
        this.config.skillsBasePath,
        skillName,
        "scripts",
        scriptPath,
      );

      // パストラバーサル検証
      if (
        !fullScriptPath.startsWith(path.resolve(this.config.skillsBasePath))
      ) {
        throw new Error("PATH_TRAVERSAL_DETECTED");
      }

      // スクリプト存在確認
      await fs.access(fullScriptPath);

      // 実行コマンド決定
      const { command, execArgs } = this.resolveExecutor(fullScriptPath, args);

      // プロセス起動
      session.status = "running";
      const childProcess = this.processManager.spawn(command, execArgs, {
        cwd: path.dirname(fullScriptPath),
        timeoutMs: this.config.defaultTimeoutMs,
      });

      session.process = childProcess;

      // stdout ストリーミング
      childProcess.stdout?.on("data", (data) => {
        const content = data.toString();
        session.output.push(content);
        onOutput({
          sessionId: session.id,
          type: "stdout",
          content,
          timestamp: Date.now(),
        });
      });

      // stderr ストリーミング
      childProcess.stderr?.on("data", (data) => {
        const content = data.toString();
        session.error.push(content);
        onOutput({
          sessionId: session.id,
          type: "stderr",
          content,
          timestamp: Date.now(),
        });
      });

      // プロセス終了処理
      childProcess.on("exit", (code) => {
        session.exitCode = code ?? 1;
        session.completedAt = Date.now();
        session.status = code === 0 ? "completed" : "failed";
        session.process = null;

        onOutput({
          sessionId: session.id,
          type: "exit",
          content: String(code),
          timestamp: Date.now(),
        });
      });

      return session;
    } catch (error) {
      session.status = "failed";
      session.completedAt = Date.now();
      session.error.push(
        error instanceof Error ? error.message : "Unknown error",
      );
      throw error;
    }
  }

  /**
   * スクリプト拡張子に基づいて実行コマンドを決定
   */
  private resolveExecutor(
    scriptPath: string,
    args: string[],
  ): { command: string; execArgs: string[] } {
    const ext = path.extname(scriptPath).toLowerCase();

    switch (ext) {
      case ".mjs":
      case ".js":
        return { command: "node", execArgs: [scriptPath, ...args] };
      case ".py":
        return { command: "python", execArgs: [scriptPath, ...args] };
      case ".sh":
        return { command: "bash", execArgs: [scriptPath, ...args] };
      case ".ts":
        return { command: "npx", execArgs: ["tsx", scriptPath, ...args] };
      default:
        throw new Error(`UNSUPPORTED_SCRIPT_TYPE: ${ext}`);
    }
  }

  /**
   * セッションを取得
   */
  getSession(sessionId: string): Session | undefined {
    return this.sessionManager.get(sessionId);
  }

  /**
   * セッション一覧を取得
   */
  listSessions(): Session[] {
    return this.sessionManager.list();
  }

  /**
   * セッションを終了
   */
  async terminateSession(sessionId: string): Promise<void> {
    return this.sessionManager.terminate(sessionId);
  }

  /**
   * 全リソースをクリーンアップ
   */
  async cleanup(): Promise<void> {
    await this.sessionManager.cleanupAll();
    await this.processManager.killAll();
  }
}
```

---

## 4. データフロー

### 4.1 スキル実行フロー

```
┌────────────┐      ┌─────────────┐      ┌─────────────────┐
│  React UI  │      │ claudeCliAPI│      │ IpcHandler      │
└─────┬──────┘      └──────┬──────┘      └────────┬────────┘
      │                    │                      │
      │ executeScript()    │                      │
      │───────────────────>│                      │
      │                    │                      │
      │                    │ invoke("execute")    │
      │                    │─────────────────────>│
      │                    │                      │
      │                    │                      │  validateSender()
      │                    │                      │─────────┐
      │                    │                      │<────────┘
      │                    │                      │
┌─────┴──────┐      ┌──────┴──────┐      ┌───────┴─────────┐
│  Zustand   │      │  preload    │      │ ClaudeCliManager│
└─────┬──────┘      └──────┬──────┘      └────────┬────────┘
      │                    │                      │
      │                    │                      │ createSession()
      │                    │                      │────────────────┐
      │                    │                      │<───────────────┘
      │                    │                      │
      │                    │                      │ spawn(script)
      │                    │                      │
┌─────┴──────┐      ┌──────┴──────┐      ┌───────┴─────────┐
│   Store    │      │  IPC on()   │      │ ProcessManager  │
└─────┬──────┘      └──────┬──────┘      └────────┬────────┘
      │                    │                      │
      │                    │  stream("output")    │ stdout.on("data")
      │                    │<─────────────────────│
      │                    │                      │
      │ updateOutput()     │                      │
      │<───────────────────│                      │
      │                    │                      │
      │                    │  stream("complete")  │ on("exit")
      │                    │<─────────────────────│
      │                    │                      │
      │ setCompleted()     │                      │
      │<───────────────────│                      │
      │                    │                      │
```

### 4.2 スキルスキャンフロー

```
┌────────────┐      ┌─────────────┐      ┌─────────────────┐
│  React UI  │      │ claudeCliAPI│      │ SkillScanner    │
└─────┬──────┘      └──────┬──────┘      └────────┬────────┘
      │                    │                      │
      │ listSkills()       │                      │
      │───────────────────>│                      │
      │                    │                      │
      │                    │ invoke("list")       │
      │                    │─────────────────────>│
      │                    │                      │
      │                    │                      │ readdir(.claude/skills/)
      │                    │                      │───────────────────────┐
      │                    │                      │<──────────────────────┘
      │                    │                      │
      │                    │                      │ for each skill:
      │                    │                      │   validatePath()
      │                    │                      │   parseSkillMd()
      │                    │                      │
      │                    │ Result<SkillInfo[]>  │
      │                    │<─────────────────────│
      │                    │                      │
      │ skills             │                      │
      │<───────────────────│                      │
      │                    │                      │
```

---

## 5. ディレクトリ構造

```
apps/desktop/
├── src/
│   ├── main/
│   │   ├── claude-cli/
│   │   │   ├── index.ts                    # エクスポート
│   │   │   ├── ClaudeCliManager.ts         # ファサード
│   │   │   ├── CliDetector.ts              # CLI検出
│   │   │   ├── SkillScanner.ts             # スキルスキャン
│   │   │   ├── SessionManager.ts           # セッション管理
│   │   │   ├── ProcessManager.ts           # プロセス管理
│   │   │   ├── OutputParser.ts             # 出力パース
│   │   │   └── __tests__/
│   │   │       ├── ClaudeCliManager.test.ts
│   │   │       ├── CliDetector.test.ts
│   │   │       ├── SkillScanner.test.ts
│   │   │       ├── SessionManager.test.ts
│   │   │       └── ProcessManager.test.ts
│   │   │
│   │   └── ipc/
│   │       └── claude-cli/
│   │           ├── index.ts                # IPCハンドラー登録
│   │           ├── handlers.ts             # ハンドラー実装
│   │           └── channels.ts             # チャンネル定義
│   │
│   ├── preload/
│   │   ├── index.ts                        # 既存preload
│   │   └── claude-cli.ts                   # claudeCliAPI公開
│   │
│   └── renderer/
│       └── store/
│           └── slices/
│               └── claudeCliSlice.ts       # Zustand slice
│
packages/shared/
└── src/
    └── claude-cli/
        ├── index.ts                        # エクスポート
        └── types.ts                        # 共有型定義
```

---

## 6. 依存関係図

```
┌─────────────────────────────────────────────────────────────┐
│                      packages/shared                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  @repo/shared/claude-cli                                │ │
│  │  - CliInstallationStatus                                │ │
│  │  - SkillMetadata, ScanResult                            │ │
│  │  - Session, SessionStatus                               │ │
│  │  - StreamMessage                                        │ │
│  │  - CliError, CliErrorCode                               │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ imports
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ apps/desktop/   │  │ apps/desktop/   │  │ apps/desktop/   │
│ main/claude-cli │  │ preload/        │  │ renderer/store  │
│                 │  │                 │  │                 │
│ - CliDetector   │  │ - claudeCliAPI  │  │ - claudeCliSlice│
│ - SkillScanner  │  │                 │  │                 │
│ - SessionMgr    │  │                 │  │                 │
│ - ProcessMgr    │  │                 │  │                 │
│ - ClaudeCliMgr  │  │                 │  │                 │
└─────────────────┘  └─────────────────┘  └─────────────────┘
          │
          │ uses
          ▼
┌─────────────────┐
│ Node.js APIs    │
│ - child_process │
│ - fs/promises   │
│ - path          │
│ - crypto        │
└─────────────────┘
```

---

## 7. セキュリティ設計

### 7.1 セキュリティレイヤー

| レイヤー     | 対策                                   |
| ------------ | -------------------------------------- |
| IPC通信      | チャンネルホワイトリスト、sender検証   |
| パス操作     | パストラバーサル検証、basePathチェック |
| プロセス起動 | shell: false、引数エスケープ           |
| 入力検証     | Zodスキーマによるバリデーション        |

### 7.2 IPC sender検証

```typescript
// apps/desktop/src/main/ipc/claude-cli/handlers.ts

import { BrowserWindow } from "electron";

function validateIpcSender(event: IpcMainInvokeEvent): void {
  const webContents = event.sender;
  const win = BrowserWindow.fromWebContents(webContents);

  // DevToolsからの呼び出し拒否
  if (!win || webContents.isDevToolsOpened()) {
    throw new Error("IPC_SENDER_INVALID");
  }

  // 許可されたウィンドウか確認
  const mainWindow = getMainWindow();
  if (win !== mainWindow) {
    throw new Error("IPC_SENDER_UNAUTHORIZED");
  }
}
```

### 7.3 パストラバーサル防止

```typescript
// 共通検証関数
function validateSkillPath(basePath: string, targetPath: string): void {
  const TRAVERSAL_PATTERNS = ["..", "%2e%2e", "%2e.", ".%2e", "..%c0%af", "\0"];

  const normalized = path.normalize(targetPath);
  const resolved = path.resolve(basePath, normalized);

  // ベースパス外への参照を検出
  if (!resolved.startsWith(path.resolve(basePath))) {
    throw new Error("PATH_TRAVERSAL_DETECTED");
  }

  // 既知の攻撃パターンを検出
  const decoded = decodeURIComponent(normalized);
  for (const pattern of TRAVERSAL_PATTERNS) {
    if (decoded.includes(pattern) || normalized.includes(pattern)) {
      throw new Error("PATH_TRAVERSAL_DETECTED");
    }
  }
}
```

---

## 8. エラーハンドリング設計

### 8.1 エラーコード体系

| カテゴリ     | コード範囲      | 例                               |
| ------------ | --------------- | -------------------------------- |
| CLI関連      | CLI_001-099     | CLI_NOT_INSTALLED, CLI_TIMEOUT   |
| スキル関連   | SKILL_001-099   | SKILL_NOT_FOUND, SKILL_INVALID   |
| セッション   | SESSION_001-099 | SESSION_NOT_FOUND, SESSION_LIMIT |
| セキュリティ | SEC_001-099     | PATH_TRAVERSAL, SENDER_INVALID   |
| システム     | SYS_001-099     | PROCESS_SPAWN_FAILED             |

### 8.2 Result型によるエラー処理

```typescript
// packages/shared/src/claude-cli/types.ts

type Result<T, E = CliError> =
  | { success: true; data: T }
  | { success: false; error: E };

interface CliError {
  code: CliErrorCode;
  message: string;
  details?: unknown;
}

// 使用例
async function listSkills(): Promise<Result<SkillMetadata[]>> {
  try {
    const result = await this.skillScanner.scan();
    return { success: true, data: result.skills };
  } catch (error) {
    return {
      success: false,
      error: {
        code: "SKILL_SCAN_FAILED",
        message: error instanceof Error ? error.message : "Unknown error",
        details: error,
      },
    };
  }
}
```

---

## 変更履歴

| 日付       | バージョン | 変更内容 |
| ---------- | ---------- | -------- |
| 2026-01-17 | 1.0.0      | 初版作成 |
