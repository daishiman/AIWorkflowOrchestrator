# Phase 4: テスト作成（TDD: Red）

## メタ情報

| 項目         | 内容                           |
| ------------ | ------------------------------ |
| フェーズ     | 4                              |
| フェーズ名   | テスト作成                     |
| 目的         | TDD: Red（失敗するテスト作成） |
| 前提フェーズ | Phase 3: 設計レビューゲート    |
| 次フェーズ   | Phase 5: 実装                  |
| 想定成果物   | 単体テストファイル             |

---

## 1. 目的

セキュリティパターン定義の正確性を検証するためのテストを作成する。TDDのRedフェーズとして、実装前に失敗するテストを用意する。

---

## 2. テスト戦略

### 2.1 テスト対象

| カテゴリ         | テスト内容                            |
| ---------------- | ------------------------------------- |
| 定数存在確認     | DANGEROUS_PATTERNS, WHITELIST の存在  |
| 危険コマンド検出 | isDangerousCommand() の正常/異常系    |
| 保護パス検出     | isProtectedPath() の正常/異常系       |
| Globマッチ       | matchGlobPattern() のパターンマッチ   |
| ツール検証       | validateAllowedTools() の検証         |
| ツールフィルタ   | filterAllowedTools() のフィルタリング |

### 2.2 テストファイル構成

```
packages/shared/src/constants/__tests__/
└── security.test.ts              # 単体テスト
```

---

## 3. 実行タスク

### Task 4-1: 定数存在テスト作成

**目的**: 定数が正しく定義・エクスポートされていることを確認するテストを作成

**ファイル**: `packages/shared/src/constants/__tests__/security.test.ts`

```typescript
import { describe, it, expect } from "vitest";
import { DANGEROUS_PATTERNS, ALLOWED_TOOLS_WHITELIST } from "../security";

describe("Security Constants - Export Check", () => {
  describe("DANGEROUS_PATTERNS", () => {
    it("should export DANGEROUS_PATTERNS object", () => {
      expect(DANGEROUS_PATTERNS).toBeDefined();
    });

    it("should have BASH_COMMANDS array", () => {
      expect(DANGEROUS_PATTERNS.BASH_COMMANDS).toBeDefined();
      expect(Array.isArray(DANGEROUS_PATTERNS.BASH_COMMANDS)).toBe(true);
    });

    it("should have PROTECTED_PATHS array", () => {
      expect(DANGEROUS_PATTERNS.PROTECTED_PATHS).toBeDefined();
      expect(Array.isArray(DANGEROUS_PATTERNS.PROTECTED_PATHS)).toBe(true);
    });

    it("should contain all 18 dangerous bash commands", () => {
      expect(DANGEROUS_PATTERNS.BASH_COMMANDS.length).toBe(18);
    });

    it("should contain all 15 protected paths", () => {
      expect(DANGEROUS_PATTERNS.PROTECTED_PATHS.length).toBe(15);
    });
  });

  describe("ALLOWED_TOOLS_WHITELIST", () => {
    it("should export ALLOWED_TOOLS_WHITELIST array", () => {
      expect(ALLOWED_TOOLS_WHITELIST).toBeDefined();
      expect(Array.isArray(ALLOWED_TOOLS_WHITELIST)).toBe(true);
    });

    it("should contain all 11 allowed tools", () => {
      expect(ALLOWED_TOOLS_WHITELIST.length).toBe(11);
    });

    it("should include expected tools", () => {
      expect(ALLOWED_TOOLS_WHITELIST).toContain("Read");
      expect(ALLOWED_TOOLS_WHITELIST).toContain("Write");
      expect(ALLOWED_TOOLS_WHITELIST).toContain("Edit");
      expect(ALLOWED_TOOLS_WHITELIST).toContain("Bash");
      expect(ALLOWED_TOOLS_WHITELIST).toContain("Glob");
      expect(ALLOWED_TOOLS_WHITELIST).toContain("Grep");
      expect(ALLOWED_TOOLS_WHITELIST).toContain("LS");
      expect(ALLOWED_TOOLS_WHITELIST).toContain("Task");
      expect(ALLOWED_TOOLS_WHITELIST).toContain("WebSearch");
      expect(ALLOWED_TOOLS_WHITELIST).toContain("WebFetch");
      expect(ALLOWED_TOOLS_WHITELIST).toContain("TodoWrite");
    });
  });
});
```

### Task 4-2: isDangerousCommand テスト作成

**目的**: isDangerousCommand() の正常系・異常系をテスト

```typescript
import { isDangerousCommand } from "../security";

describe("isDangerousCommand", () => {
  describe("should detect dangerous commands", () => {
    it("should detect rm -rf", () => {
      expect(isDangerousCommand("rm -rf /")).toBe(true);
      expect(isDangerousCommand("rm -rf .")).toBe(true);
    });

    it("should detect rm -r", () => {
      expect(isDangerousCommand("rm -r /home")).toBe(true);
    });

    it("should detect sudo", () => {
      expect(isDangerousCommand("sudo apt-get install")).toBe(true);
    });

    it("should detect su commands", () => {
      expect(isDangerousCommand("su -")).toBe(true);
      expect(isDangerousCommand("su root")).toBe(true);
    });

    it("should detect command substitution", () => {
      expect(isDangerousCommand("echo $(whoami)")).toBe(true);
      expect(isDangerousCommand("echo `whoami`")).toBe(true);
    });

    it("should detect dangerous shell execution", () => {
      expect(isDangerousCommand("/bin/sh -c 'ls'")).toBe(true);
      expect(isDangerousCommand("/bin/bash script.sh")).toBe(true);
      expect(isDangerousCommand("bash -c 'echo test'")).toBe(true);
      expect(isDangerousCommand("sh -c 'echo test'")).toBe(true);
    });

    it("should detect eval/exec/source", () => {
      expect(isDangerousCommand("eval 'echo test'")).toBe(true);
      expect(isDangerousCommand("exec ls")).toBe(true);
      expect(isDangerousCommand("source ~/.bashrc")).toBe(true);
    });

    it("should detect fork bomb", () => {
      expect(isDangerousCommand(":(){ :|:& };:")).toBe(true);
    });

    it("should detect crontab/at", () => {
      expect(isDangerousCommand("crontab -e")).toBe(true);
      expect(isDangerousCommand("at now")).toBe(true);
    });

    it("should detect chmod 777/chown root", () => {
      expect(isDangerousCommand("chmod 777 /tmp")).toBe(true);
      expect(isDangerousCommand("chown root:root /file")).toBe(true);
    });

    it("should detect dd/mkfs", () => {
      expect(isDangerousCommand("dd if=/dev/zero of=/dev/sda")).toBe(true);
      expect(isDangerousCommand("mkfs.ext4 /dev/sda1")).toBe(true);
    });

    it("should detect > /dev/", () => {
      expect(isDangerousCommand("cat file > /dev/sda")).toBe(true);
    });
  });

  describe("should allow safe commands", () => {
    it("should allow ls", () => {
      expect(isDangerousCommand("ls -la")).toBe(false);
    });

    it("should allow cat", () => {
      expect(isDangerousCommand("cat file.txt")).toBe(false);
    });

    it("should allow echo without substitution", () => {
      expect(isDangerousCommand("echo 'hello world'")).toBe(false);
    });

    it("should allow mkdir", () => {
      expect(isDangerousCommand("mkdir -p /tmp/test")).toBe(false);
    });

    it("should allow git commands", () => {
      expect(isDangerousCommand("git status")).toBe(false);
      expect(isDangerousCommand("git commit -m 'test'")).toBe(false);
    });

    it("should allow npm/pnpm commands", () => {
      expect(isDangerousCommand("npm install")).toBe(false);
      expect(isDangerousCommand("pnpm build")).toBe(false);
    });
  });

  describe("edge cases", () => {
    it("should return false for empty string", () => {
      expect(isDangerousCommand("")).toBe(false);
    });

    it("should handle partial matches correctly", () => {
      // "rm" だけでは危険ではない（rm -rf が必要）
      expect(isDangerousCommand("rm file.txt")).toBe(false);
    });
  });
});
```

### Task 4-3: isProtectedPath テスト作成

**目的**: isProtectedPath() のパス検出をテスト

```typescript
import { isProtectedPath } from "../security";

describe("isProtectedPath", () => {
  describe("should detect protected system directories", () => {
    it("should protect /etc", () => {
      expect(isProtectedPath("/etc/passwd")).toBe(true);
      expect(isProtectedPath("/etc/shadow")).toBe(true);
      expect(isProtectedPath("/etc/hosts")).toBe(true);
    });

    it("should protect /usr", () => {
      expect(isProtectedPath("/usr/bin/node")).toBe(true);
      expect(isProtectedPath("/usr/local/bin")).toBe(true);
    });

    it("should protect /var", () => {
      expect(isProtectedPath("/var/log/syslog")).toBe(true);
    });

    it("should protect /sys and /proc", () => {
      expect(isProtectedPath("/sys/class")).toBe(true);
      expect(isProtectedPath("/proc/1/cmdline")).toBe(true);
    });

    it("should protect /boot and /root", () => {
      expect(isProtectedPath("/boot/grub")).toBe(true);
      expect(isProtectedPath("/root/.bashrc")).toBe(true);
    });
  });

  describe("should detect protected shell config files", () => {
    it("should protect .bashrc", () => {
      expect(isProtectedPath("/home/user/.bashrc")).toBe(true);
      expect(isProtectedPath("~/.bashrc")).toBe(true);
    });

    it("should protect .zshrc", () => {
      expect(isProtectedPath("/home/user/.zshrc")).toBe(true);
    });

    it("should protect .profile", () => {
      expect(isProtectedPath("/home/user/.profile")).toBe(true);
    });
  });

  describe("should detect protected auth files", () => {
    it("should protect ~/.ssh", () => {
      expect(isProtectedPath("~/.ssh/id_rsa")).toBe(true);
      expect(isProtectedPath("~/.ssh/authorized_keys")).toBe(true);
    });

    it("should protect ~/.gnupg", () => {
      expect(isProtectedPath("~/.gnupg/private-keys")).toBe(true);
    });
  });

  describe("should detect protected cloud credentials", () => {
    it("should protect ~/.aws", () => {
      expect(isProtectedPath("~/.aws/credentials")).toBe(true);
    });

    it("should protect ~/.azure", () => {
      expect(isProtectedPath("~/.azure/config")).toBe(true);
    });

    it("should protect ~/.kube", () => {
      expect(isProtectedPath("~/.kube/config")).toBe(true);
    });

    it("should protect ~/.config/gcloud", () => {
      expect(isProtectedPath("~/.config/gcloud/credentials")).toBe(true);
    });
  });

  describe("should detect protected .env files", () => {
    it("should protect .env", () => {
      expect(isProtectedPath("/project/.env")).toBe(true);
      expect(isProtectedPath("/app/config/.env")).toBe(true);
    });

    it("should protect .env.local", () => {
      expect(isProtectedPath("/project/.env.local")).toBe(true);
    });

    it("should protect .env.production", () => {
      expect(isProtectedPath("/project/.env.production")).toBe(true);
    });

    it("should protect credentials.json", () => {
      expect(isProtectedPath("/project/credentials.json")).toBe(true);
    });

    it("should protect secrets.json", () => {
      expect(isProtectedPath("/project/secrets.json")).toBe(true);
    });
  });

  describe("should allow normal paths", () => {
    it("should allow project directories", () => {
      expect(isProtectedPath("/home/user/projects/myapp/src")).toBe(false);
    });

    it("should allow /tmp", () => {
      expect(isProtectedPath("/tmp/test.txt")).toBe(false);
    });

    it("should allow normal config files", () => {
      expect(isProtectedPath("/project/tsconfig.json")).toBe(false);
      expect(isProtectedPath("/project/package.json")).toBe(false);
    });
  });

  describe("edge cases", () => {
    it("should return false for empty string", () => {
      expect(isProtectedPath("")).toBe(false);
    });
  });
});
```

### Task 4-4: matchGlobPattern テスト作成

**目的**: matchGlobPattern() のGlobマッチングをテスト

```typescript
import { matchGlobPattern } from "../security";

describe("matchGlobPattern", () => {
  describe("** pattern (any path)", () => {
    it("should match /etc/**", () => {
      expect(matchGlobPattern("/etc/passwd", "/etc/**")).toBe(true);
      expect(matchGlobPattern("/etc/nginx/nginx.conf", "/etc/**")).toBe(true);
    });

    it("should match **/.bashrc", () => {
      expect(matchGlobPattern("/home/user/.bashrc", "**/.bashrc")).toBe(true);
      expect(matchGlobPattern("/root/.bashrc", "**/.bashrc")).toBe(true);
    });
  });

  describe("* pattern (single level)", () => {
    it("should match single level wildcards", () => {
      expect(matchGlobPattern("/etc/passwd", "/etc/*")).toBe(true);
      expect(matchGlobPattern("/etc/nginx/conf", "/etc/*")).toBe(false);
    });
  });

  describe("~ expansion", () => {
    it("should expand ~ to HOME directory", () => {
      const homeDir = process.env.HOME || "";
      expect(matchGlobPattern(`${homeDir}/.ssh/id_rsa`, "~/.ssh/**")).toBe(
        true,
      );
    });
  });

  describe("edge cases", () => {
    it("should handle exact matches", () => {
      expect(matchGlobPattern("/etc/passwd", "/etc/passwd")).toBe(true);
      expect(matchGlobPattern("/etc/shadow", "/etc/passwd")).toBe(false);
    });

    it("should handle empty pattern gracefully", () => {
      expect(matchGlobPattern("", "")).toBe(true);
    });
  });
});
```

### Task 4-5: validateAllowedTools テスト作成

**目的**: validateAllowedTools() のツール検証をテスト

```typescript
import { validateAllowedTools } from "../security";

describe("validateAllowedTools", () => {
  describe("should accept valid tools", () => {
    it("should accept single valid tool", () => {
      expect(validateAllowedTools(["Read"])).toBe(true);
    });

    it("should accept multiple valid tools", () => {
      expect(validateAllowedTools(["Read", "Write", "Edit"])).toBe(true);
    });

    it("should accept all allowed tools", () => {
      expect(
        validateAllowedTools([
          "Read",
          "Write",
          "Edit",
          "Bash",
          "Glob",
          "Grep",
          "LS",
          "Task",
          "WebSearch",
          "WebFetch",
          "TodoWrite",
        ]),
      ).toBe(true);
    });
  });

  describe("should reject invalid tools", () => {
    it("should reject unknown tool", () => {
      expect(validateAllowedTools(["UnknownTool"])).toBe(false);
    });

    it("should reject if any tool is invalid", () => {
      expect(validateAllowedTools(["Read", "InvalidTool"])).toBe(false);
    });

    it("should reject case-sensitive mismatch", () => {
      expect(validateAllowedTools(["read"])).toBe(false);
      expect(validateAllowedTools(["READ"])).toBe(false);
    });
  });

  describe("edge cases", () => {
    it("should accept empty array (all tools allowed)", () => {
      expect(validateAllowedTools([])).toBe(true);
    });
  });
});
```

### Task 4-6: filterAllowedTools テスト作成

**目的**: filterAllowedTools() のフィルタリングをテスト

```typescript
import { filterAllowedTools } from "../security";

describe("filterAllowedTools", () => {
  describe("should filter out invalid tools", () => {
    it("should filter unknown tools", () => {
      expect(filterAllowedTools(["Read", "InvalidTool"])).toEqual(["Read"]);
    });

    it("should filter multiple invalid tools", () => {
      expect(
        filterAllowedTools(["Read", "Invalid1", "Write", "Invalid2"]),
      ).toEqual(["Read", "Write"]);
    });

    it("should return empty array if all invalid", () => {
      expect(filterAllowedTools(["Invalid1", "Invalid2"])).toEqual([]);
    });
  });

  describe("should keep valid tools", () => {
    it("should keep all valid tools", () => {
      expect(filterAllowedTools(["Read", "Write", "Edit"])).toEqual([
        "Read",
        "Write",
        "Edit",
      ]);
    });

    it("should maintain order", () => {
      expect(filterAllowedTools(["Write", "Read"])).toEqual(["Write", "Read"]);
    });
  });

  describe("edge cases", () => {
    it("should return empty array for empty input", () => {
      expect(filterAllowedTools([])).toEqual([]);
    });
  });
});
```

---

## 4. テスト実行コマンド

```bash
# 全テストを実行
pnpm --filter @repo/shared test -- --run

# 特定のテストファイルのみ実行
pnpm --filter @repo/shared test -- --run security.test.ts

# ウォッチモードで実行
pnpm --filter @repo/shared test -- security.test.ts
```

---

## 5. 期待する結果

### 5.1 Phase 4 終了時点

| 期待結果                         | 状態        |
| -------------------------------- | ----------- |
| テストファイルが作成されている   | ○           |
| テストが未実装でコンパイルエラー | Red（失敗） |
| 全テストケースが網羅されている   | ○           |

### 5.2 Phase 5 終了後

| 期待結果         | 状態          |
| ---------------- | ------------- |
| テストが全てパス | Green（成功） |
| 型チェックがパス | Green（成功） |

---

## 6. 参照資料

| 資料名     | パス                                                                             |
| ---------- | -------------------------------------------------------------------------------- |
| 設計書     | `./phase-2-design.md`                                                            |
| 機能仕様書 | `docs/30-workflows/skill-import-agent-system/specification.md`                   |
| タスク定義 | `docs/30-workflows/skill-import-agent-system/tasks/task-2c-security-patterns.md` |

---

## 7. 完了条件

- [ ] Task 4-1 完了: 定数存在テスト作成
- [ ] Task 4-2 完了: isDangerousCommand テスト作成
- [ ] Task 4-3 完了: isProtectedPath テスト作成
- [ ] Task 4-4 完了: matchGlobPattern テスト作成
- [ ] Task 4-5 完了: validateAllowedTools テスト作成
- [ ] Task 4-6 完了: filterAllowedTools テスト作成
- [ ] テストファイルがコンパイル可能（実装は未定義でも）

---

## 8. 統合テスト連携【必須】

> **N/A**: 本タスクは定数・ユーティリティ関数のみのため、統合テスト連携は対象外です。

---

## 9. 成果物

| 成果物             | パス                                                       | 状態     |
| ------------------ | ---------------------------------------------------------- | -------- |
| 単体テストファイル | `packages/shared/src/constants/__tests__/security.test.ts` | 作成待ち |

---

## 10. TDD 検証

```bash
# テスト実行コマンド
pnpm --filter @repo/shared test -- --run

# 確認項目
# - [ ] テストが失敗することを確認（Red状態）
```

---

## 11. Phase末端アクション【必須】

- [ ] 本 Phase 内の全タスクを 100%実行完了
- [ ] 各タスクを 100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 12. サブタスク管理

Phase 実行開始時に、TodoWrite ツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. Task 4-1: 定数存在テスト作成
3. Task 4-2: isDangerousCommand テスト作成
4. Task 4-3: isProtectedPath テスト作成
5. Task 4-4: matchGlobPattern テスト作成
6. Task 4-5: validateAllowedTools テスト作成
7. Task 4-6: filterAllowedTools テスト作成
8. TDD 検証（Red 状態確認）
9. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐに completed に更新すること。

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-24 | 初版作成 |
