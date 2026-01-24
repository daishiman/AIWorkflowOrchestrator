import { describe, it, expect } from "vitest";
import {
  DANGEROUS_PATTERNS,
  ALLOWED_TOOLS_WHITELIST,
  isDangerousCommand,
  isProtectedPath,
  matchGlobPattern,
  validateAllowedTools,
  filterAllowedTools,
} from "../security";

// ============================================
// Task 4-1: 定数存在テスト
// ============================================

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

    it("should contain all 24 dangerous bash commands", () => {
      expect(DANGEROUS_PATTERNS.BASH_COMMANDS.length).toBe(24);
    });

    it("should contain all 25 protected paths", () => {
      expect(DANGEROUS_PATTERNS.PROTECTED_PATHS.length).toBe(25);
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

// ============================================
// Task 4-2: isDangerousCommand テスト
// ============================================

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

// ============================================
// Task 4-3: isProtectedPath テスト
// ============================================

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
    });

    it("should protect .zshrc", () => {
      expect(isProtectedPath("/home/user/.zshrc")).toBe(true);
    });

    it("should protect .profile", () => {
      expect(isProtectedPath("/home/user/.profile")).toBe(true);
    });
  });

  describe("should detect protected auth files", () => {
    it("should protect ~/.ssh with HOME expansion", () => {
      const homeDir = process.env.HOME || "";
      expect(isProtectedPath(`${homeDir}/.ssh/id_rsa`)).toBe(true);
      expect(isProtectedPath(`${homeDir}/.ssh/authorized_keys`)).toBe(true);
    });

    it("should protect ~/.gnupg with HOME expansion", () => {
      const homeDir = process.env.HOME || "";
      expect(isProtectedPath(`${homeDir}/.gnupg/private-keys`)).toBe(true);
    });
  });

  describe("should detect protected cloud credentials", () => {
    it("should protect ~/.aws with HOME expansion", () => {
      const homeDir = process.env.HOME || "";
      expect(isProtectedPath(`${homeDir}/.aws/credentials`)).toBe(true);
    });

    it("should protect ~/.azure with HOME expansion", () => {
      const homeDir = process.env.HOME || "";
      expect(isProtectedPath(`${homeDir}/.azure/config`)).toBe(true);
    });

    it("should protect ~/.kube with HOME expansion", () => {
      const homeDir = process.env.HOME || "";
      expect(isProtectedPath(`${homeDir}/.kube/config`)).toBe(true);
    });

    it("should protect ~/.config/gcloud with HOME expansion", () => {
      const homeDir = process.env.HOME || "";
      expect(isProtectedPath(`${homeDir}/.config/gcloud/credentials`)).toBe(
        true,
      );
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

// ============================================
// Task 4-4: matchGlobPattern テスト
// ============================================

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

// ============================================
// Task 4-5: validateAllowedTools テスト
// ============================================

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

// ============================================
// Task 4-6: filterAllowedTools テスト
// ============================================

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

// ============================================
// Phase 6: エッジケーステスト追加
// ============================================

// Task 6-1: isDangerousCommand エッジケース
describe("isDangerousCommand - Edge Cases", () => {
  it("should handle whitespace variations", () => {
    expect(isDangerousCommand("  rm -rf  /")).toBe(true);
    expect(isDangerousCommand("sudo  apt-get")).toBe(true);
  });

  it("should handle commands in different positions", () => {
    // コマンドの先頭
    expect(isDangerousCommand("rm -rf / && ls")).toBe(true);
    // コマンドの中間
    expect(isDangerousCommand("ls && rm -rf /")).toBe(true);
    // コマンドの末尾
    expect(isDangerousCommand("cd / ; rm -rf")).toBe(true);
  });

  it("should detect dangerous patterns in complex commands", () => {
    expect(isDangerousCommand("bash -c 'rm -rf /'")).toBe(true);
    expect(isDangerousCommand("nohup sudo apt-get &")).toBe(true);
  });

  it("should not false-positive on similar but safe patterns", () => {
    // "su" を含むが "su -" や "su " ではない
    expect(isDangerousCommand("suspend")).toBe(false);
    expect(isDangerousCommand("sudo-less")).toBe(false);
  });
});

// Task 6-2: isProtectedPath エッジケース
describe("isProtectedPath - Edge Cases", () => {
  it("should handle paths with trailing slashes", () => {
    expect(isProtectedPath("/etc/")).toBe(true);
  });

  it("should handle deeply nested paths", () => {
    expect(isProtectedPath("/etc/nginx/sites-available/default")).toBe(true);
    expect(isProtectedPath("/var/log/nginx/access.log")).toBe(true);
  });

  it("should handle relative-like paths", () => {
    // **/.bashrc パターンは相対パスにもマッチする（セキュリティ上正しい動作）
    expect(isProtectedPath("./home/user/.bashrc")).toBe(true);
    // 保護パターンに該当しない相対パス
    expect(isProtectedPath("./home/user/code.ts")).toBe(false);
  });

  it("should handle paths with special characters", () => {
    expect(isProtectedPath("/etc/my-config.d/file")).toBe(true);
    expect(isProtectedPath("/var/log/app.2024-01-01.log")).toBe(true);
  });
});

// Task 6-3: matchGlobPattern エッジケース
describe("matchGlobPattern - Edge Cases", () => {
  it("should handle multiple ** in pattern", () => {
    expect(matchGlobPattern("/a/b/c/d/e", "/**/c/**")).toBe(true);
  });

  it("should handle adjacent wildcards", () => {
    expect(matchGlobPattern("/etc/passwd", "/**/*")).toBe(true);
  });

  it("should handle patterns without wildcards", () => {
    expect(matchGlobPattern("/exact/path", "/exact/path")).toBe(true);
    expect(matchGlobPattern("/exact/path", "/different/path")).toBe(false);
  });

  it("should handle HOME not set", () => {
    const originalHome = process.env.HOME;
    delete process.env.HOME;

    try {
      // HOME未設定時は ~ が空文字に展開される
      expect(matchGlobPattern("/.ssh/id_rsa", "~/.ssh/**")).toBe(true);
    } finally {
      process.env.HOME = originalHome;
    }
  });

  it("should handle regex special characters in path", () => {
    expect(matchGlobPattern("/path/with.dot", "/path/with.dot")).toBe(true);
    expect(matchGlobPattern("/path/with+plus", "/path/with+plus")).toBe(true);
    expect(matchGlobPattern("/path/with(paren)", "/path/with(paren)")).toBe(
      true,
    );
  });
});

// Task 6-4: ツール検証エッジケース
describe("validateAllowedTools - Edge Cases", () => {
  it("should handle duplicate tools", () => {
    expect(validateAllowedTools(["Read", "Read", "Write"])).toBe(true);
  });

  it("should handle whitespace in tool names", () => {
    expect(validateAllowedTools([" Read"])).toBe(false);
    expect(validateAllowedTools(["Read "])).toBe(false);
    expect(validateAllowedTools(["Re ad"])).toBe(false);
  });
});

describe("filterAllowedTools - Edge Cases", () => {
  it("should handle duplicate tools", () => {
    expect(filterAllowedTools(["Read", "Read", "Write"])).toEqual([
      "Read",
      "Read",
      "Write",
    ]);
  });

  it("should preserve order", () => {
    expect(filterAllowedTools(["Write", "Invalid", "Read"])).toEqual([
      "Write",
      "Read",
    ]);
  });
});

// Task 6-5: パフォーマンステスト
describe("Performance Tests", () => {
  it("should handle many tool checks efficiently", () => {
    const tools = Array(1000).fill("Read");
    const start = performance.now();
    validateAllowedTools(tools);
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(100); // 100ms以内
  });

  it("should handle long command strings efficiently", () => {
    const longCommand = "ls ".repeat(10000);
    const start = performance.now();
    isDangerousCommand(longCommand);
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(100); // 100ms以内
  });
});
