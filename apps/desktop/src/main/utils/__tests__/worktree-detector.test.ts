import { describe, it, expect, vi, beforeEach } from "vitest";
import * as fs from "node:fs";

vi.mock("node:fs");

const mockedFs = vi.mocked(fs);

describe("isWorktreeEnvironment", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.resetModules();
  });

  it("UT-WD-01: .git がディレクトリの場合 false を返す", async () => {
    mockedFs.statSync.mockReturnValue({
      isFile: () => false,
      isDirectory: () => true,
    } as unknown as fs.Stats);

    const { isWorktreeEnvironment } = await import("../worktree-detector");
    expect(isWorktreeEnvironment("/test/project")).toBe(false);
  });

  it("UT-WD-02: .git がファイルの場合 true を返す", async () => {
    mockedFs.statSync.mockReturnValue({
      isFile: () => true,
    } as unknown as fs.Stats);
    mockedFs.readFileSync.mockReturnValue(
      "gitdir: /path/to/.git/worktrees/my-branch\n",
    );

    const { isWorktreeEnvironment } = await import("../worktree-detector");
    expect(isWorktreeEnvironment("/test/project")).toBe(true);
  });

  it("UT-WD-03: .git が存在しない場合 false を返す", async () => {
    mockedFs.statSync.mockImplementation(() => {
      const error = new Error("ENOENT") as NodeJS.ErrnoException;
      error.code = "ENOENT";
      throw error;
    });

    const { isWorktreeEnvironment } = await import("../worktree-detector");
    expect(isWorktreeEnvironment("/test/project")).toBe(false);
  });

  it("UT-WD-04: .git ファイルの内容が gitdir: で始まる場合 true を返す", async () => {
    mockedFs.statSync.mockReturnValue({
      isFile: () => true,
    } as unknown as fs.Stats);
    mockedFs.readFileSync.mockReturnValue(
      "gitdir: /absolute/path/.git/worktrees/branch-name\n",
    );

    const { isWorktreeEnvironment } = await import("../worktree-detector");
    expect(isWorktreeEnvironment("/test/project")).toBe(true);
  });

  it("UT-WD-05: .git ファイルの内容が不正な場合 false を返す", async () => {
    mockedFs.statSync.mockReturnValue({
      isFile: () => true,
    } as unknown as fs.Stats);
    mockedFs.readFileSync.mockReturnValue("invalid content\n");

    const { isWorktreeEnvironment } = await import("../worktree-detector");
    expect(isWorktreeEnvironment("/test/project")).toBe(false);
  });

  it("UT-WD-06: projectRoot に空文字列を指定した場合 path.join('', '.git') で .git を参照する", async () => {
    mockedFs.statSync.mockReturnValue({
      isFile: () => false,
      isDirectory: () => true,
    } as unknown as fs.Stats);

    const { isWorktreeEnvironment } = await import("../worktree-detector");
    expect(isWorktreeEnvironment("")).toBe(false);
    expect(mockedFs.statSync).toHaveBeenCalledWith(".git");
  });

  it("UT-WD-07: .git ファイルの内容が gitdir: のみ（パスなし）の場合 trim により false を返す", async () => {
    // "gitdir: " を trim() すると "gitdir:" になり、startsWith("gitdir: ") は false
    mockedFs.statSync.mockReturnValue({
      isFile: () => true,
    } as unknown as fs.Stats);
    mockedFs.readFileSync.mockReturnValue("gitdir: ");

    const { isWorktreeEnvironment } = await import("../worktree-detector");
    expect(isWorktreeEnvironment("/test/project")).toBe(false);
  });

  it("UT-WD-08: .git ファイルの内容が空白のみの場合 false を返す", async () => {
    mockedFs.statSync.mockReturnValue({
      isFile: () => true,
    } as unknown as fs.Stats);
    mockedFs.readFileSync.mockReturnValue("   \n\t  ");

    const { isWorktreeEnvironment } = await import("../worktree-detector");
    expect(isWorktreeEnvironment("/test/project")).toBe(false);
  });

  it("UT-WD-09: fs.readFileSync がエラーを throw した場合 false を返す", async () => {
    mockedFs.statSync.mockReturnValue({
      isFile: () => true,
    } as unknown as fs.Stats);
    mockedFs.readFileSync.mockImplementation(() => {
      const error = new Error("EACCES") as NodeJS.ErrnoException;
      error.code = "EACCES";
      throw error;
    });

    const { isWorktreeEnvironment } = await import("../worktree-detector");
    expect(isWorktreeEnvironment("/test/project")).toBe(false);
  });

  it("UT-WD-10: .git ファイルの内容に改行が含まれる場合 true を返す（trim で正規化）", async () => {
    mockedFs.statSync.mockReturnValue({
      isFile: () => true,
    } as unknown as fs.Stats);
    mockedFs.readFileSync.mockReturnValue(
      "\n  gitdir: /path/to/.git/worktrees/branch  \n\n",
    );

    const { isWorktreeEnvironment } = await import("../worktree-detector");
    expect(isWorktreeEnvironment("/test/project")).toBe(true);
  });

  it("UT-WD-11: projectRoot が存在しないディレクトリの場合 false を返す", async () => {
    mockedFs.statSync.mockImplementation(() => {
      const error = new Error("ENOENT") as NodeJS.ErrnoException;
      error.code = "ENOENT";
      throw error;
    });

    const { isWorktreeEnvironment } = await import("../worktree-detector");
    expect(isWorktreeEnvironment("/nonexistent/directory")).toBe(false);
  });
});

describe("getMainRepoPath", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.resetModules();
  });

  it("UT-WD-12: Worktree環境でメインリポジトリのパスを返す", async () => {
    mockedFs.statSync.mockReturnValue({
      isFile: () => true,
    } as unknown as fs.Stats);
    mockedFs.readFileSync.mockReturnValue(
      "gitdir: /path/to/repo/.git/worktrees/my-branch\n",
    );

    const { getMainRepoPath } = await import("../worktree-detector");
    expect(getMainRepoPath("/test/project")).toBe("/path/to/repo");
  });

  it("UT-WD-13: 通常リポジトリ（.gitがディレクトリ）の場合 null を返す", async () => {
    mockedFs.statSync.mockReturnValue({
      isFile: () => false,
      isDirectory: () => true,
    } as unknown as fs.Stats);

    const { getMainRepoPath } = await import("../worktree-detector");
    expect(getMainRepoPath("/test/project")).toBeNull();
  });

  it("UT-WD-14: .gitが存在しない場合 null を返す", async () => {
    mockedFs.statSync.mockImplementation(() => {
      const error = new Error("ENOENT") as NodeJS.ErrnoException;
      error.code = "ENOENT";
      throw error;
    });

    const { getMainRepoPath } = await import("../worktree-detector");
    expect(getMainRepoPath("/test/project")).toBeNull();
  });

  it("UT-WD-15: gitdirに.git/worktrees/パターンがない場合 null を返す", async () => {
    mockedFs.statSync.mockReturnValue({
      isFile: () => true,
    } as unknown as fs.Stats);
    mockedFs.readFileSync.mockReturnValue(
      "gitdir: /path/to/some/other/git/dir\n",
    );

    const { getMainRepoPath } = await import("../worktree-detector");
    expect(getMainRepoPath("/test/project")).toBeNull();
  });

  it("UT-WD-16: 深いパス構造のWorktreeでメインリポジトリパスを正しく返す", async () => {
    mockedFs.statSync.mockReturnValue({
      isFile: () => true,
    } as unknown as fs.Stats);
    mockedFs.readFileSync.mockReturnValue(
      "gitdir: /home/user/dev/projects/my-app/.git/worktrees/feature-xyz\n",
    );

    const { getMainRepoPath } = await import("../worktree-detector");
    expect(getMainRepoPath("/test/project")).toBe(
      "/home/user/dev/projects/my-app",
    );
  });

  it("UT-WD-17: projectRoot省略時に process.cwd() を使用する", async () => {
    mockedFs.statSync.mockReturnValue({
      isFile: () => false,
      isDirectory: () => true,
    } as unknown as fs.Stats);

    const { getMainRepoPath } = await import("../worktree-detector");
    const result = getMainRepoPath();
    expect(result).toBeNull();
    expect(mockedFs.statSync).toHaveBeenCalled();
  });
});

describe("getWorktreeName", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.resetModules();
  });

  it("UT-WD-18: Worktree名を正しく取得する", async () => {
    mockedFs.statSync.mockReturnValue({
      isFile: () => true,
    } as unknown as fs.Stats);
    mockedFs.readFileSync.mockReturnValue(
      "gitdir: /path/to/repo/.git/worktrees/my-branch\n",
    );

    const { getWorktreeName } = await import("../worktree-detector");
    expect(getWorktreeName("/test/project")).toBe("my-branch");
  });

  it("UT-WD-19: 通常リポジトリ（.gitがディレクトリ）の場合 null を返す", async () => {
    mockedFs.statSync.mockReturnValue({
      isFile: () => false,
      isDirectory: () => true,
    } as unknown as fs.Stats);

    const { getWorktreeName } = await import("../worktree-detector");
    expect(getWorktreeName("/test/project")).toBeNull();
  });

  it("UT-WD-20: .gitが存在しない場合 null を返す", async () => {
    mockedFs.statSync.mockImplementation(() => {
      const error = new Error("ENOENT") as NodeJS.ErrnoException;
      error.code = "ENOENT";
      throw error;
    });

    const { getWorktreeName } = await import("../worktree-detector");
    expect(getWorktreeName("/test/project")).toBeNull();
  });

  it("UT-WD-21: gitdirに.git/worktrees/パターンがない場合 null を返す", async () => {
    mockedFs.statSync.mockReturnValue({
      isFile: () => true,
    } as unknown as fs.Stats);
    mockedFs.readFileSync.mockReturnValue(
      "gitdir: /path/to/some/other/git/dir\n",
    );

    const { getWorktreeName } = await import("../worktree-detector");
    expect(getWorktreeName("/test/project")).toBeNull();
  });

  it("UT-WD-22: ハイフン・数字を含むWorktree名を正しく取得する", async () => {
    mockedFs.statSync.mockReturnValue({
      isFile: () => true,
    } as unknown as fs.Stats);
    mockedFs.readFileSync.mockReturnValue(
      "gitdir: /repo/.git/worktrees/task-20260301-195335-wt2\n",
    );

    const { getWorktreeName } = await import("../worktree-detector");
    expect(getWorktreeName("/test/project")).toBe("task-20260301-195335-wt2");
  });

  it("UT-WD-23: projectRoot省略時に process.cwd() を使用する", async () => {
    mockedFs.statSync.mockReturnValue({
      isFile: () => false,
      isDirectory: () => true,
    } as unknown as fs.Stats);

    const { getWorktreeName } = await import("../worktree-detector");
    const result = getWorktreeName();
    expect(result).toBeNull();
    expect(mockedFs.statSync).toHaveBeenCalled();
  });
});
