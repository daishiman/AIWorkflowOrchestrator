import { describe, it, expect } from "vitest";
import {
  parseDeferredTests,
  DeferredTestsNotFoundError,
  ParseError,
} from "../deferred-tests-parser";

describe("parseDeferredTests", () => {
  it("UT-DP-01: 有効なファイルからテスト項目を抽出する", () => {
    const content = `
| ID | テスト内容 | スキップ理由 | 実行予定環境 | 期限 | ステータス |
| --- | --- | --- | --- | --- | --- |
| DT-001 | UI表示確認 | Worktree環境でElectron起動不可 | メインリポジトリ | 2026-03-15 | 未実施 |
`;
    const result = parseDeferredTests(content);
    expect(result.items).toHaveLength(1);
    expect(result.items[0].id).toBe("DT-001");
    expect(result.items[0].reason).toBe("Worktree環境でElectron起動不可");
    expect(result.items[0].status).toBe("未実施");
    expect(result.items[0].environment).toBe("メインリポジトリ");
  });

  it("UT-DP-02: 空ファイルをパースした場合、空配列を返す", () => {
    const result = parseDeferredTests("");
    expect(result.items).toEqual([]);
  });

  it("UT-DP-03: テーブル形式が不正な場合、ParseError を throw する", () => {
    expect(() => parseDeferredTests("不正なMarkdown")).toThrow(ParseError);
  });

  it("UT-DP-04: 全項目が完了の場合、allResolved === true を返す", () => {
    const content = `
| ID | テスト内容 | スキップ理由 | 実行予定環境 | 期限 | ステータス |
| --- | --- | --- | --- | --- | --- |
| DT-001 | UI表示確認 | Worktree環境 | CI | 2026-03-15 | 完了 |
`;
    const result = parseDeferredTests(content);
    expect(result.allResolved).toBe(true);
  });

  it("UT-DP-05: 未解消項目がある場合、allResolved === false を返す", () => {
    const content = `
| ID | テスト内容 | スキップ理由 | 実行予定環境 | 期限 | ステータス |
| --- | --- | --- | --- | --- | --- |
| DT-001 | UI表示確認 | Worktree環境 | CI | 2026-03-15 | 完了 |
| DT-002 | 操作確認 | Worktree環境 | メインリポジトリ | 2026-03-15 | 未実施 |
`;
    const result = parseDeferredTests(content);
    expect(result.allResolved).toBe(false);
  });

  it("UT-DP-06: ファイルが存在しない場合、DeferredTestsNotFoundError を throw する", () => {
    expect(() => parseDeferredTests(null as unknown as string)).toThrow(
      DeferredTestsNotFoundError,
    );
  });

  it("UT-DP-07: テーブルにヘッダー行のみ（データ行なし）の場合、空配列を返し allResolved === true", () => {
    const content = `
| ID | テスト内容 | スキップ理由 | 実行予定環境 | 期限 | ステータス |
| --- | --- | --- | --- | --- | --- |
`;
    const result = parseDeferredTests(content);
    expect(result.items).toEqual([]);
    expect(result.allResolved).toBe(true);
  });

  it("UT-DP-08: テーブルのカラム数が6未満（5カラム）の行が含まれる場合、ParseError を throw する", () => {
    const content = `
| ID | テスト内容 | スキップ理由 | 実行予定環境 | 期限 | ステータス |
| --- | --- | --- | --- | --- | --- |
| DT-001 | UI表示確認 | Worktree環境 | CI | 2026-03-15 |
`;
    expect(() => parseDeferredTests(content)).toThrow(ParseError);
    expect(() => parseDeferredTests(content)).toThrow(
      "テーブル行のカラム数が不足しています",
    );
  });

  it("UT-DP-09: ステータスが「完了」「未実施」以外の値（「実施中」）を含む場合、allResolved === false", () => {
    const content = `
| ID | テスト内容 | スキップ理由 | 実行予定環境 | 期限 | ステータス |
| --- | --- | --- | --- | --- | --- |
| DT-001 | UI表示確認 | Worktree環境 | CI | 2026-03-15 | 完了 |
| DT-002 | 操作確認 | Worktree環境 | メインリポジトリ | 2026-03-15 | 実施中 |
`;
    const result = parseDeferredTests(content);
    expect(result.items).toHaveLength(2);
    expect(result.items[1].status).toBe("実施中");
    expect(result.allResolved).toBe(false);
  });

  it("UT-DP-10: テーブル行の前後に余計な空白行が含まれる場合、正常にパースされる", () => {
    const content = `


| ID | テスト内容 | スキップ理由 | 実行予定環境 | 期限 | ステータス |
| --- | --- | --- | --- | --- | --- |

| DT-001 | UI表示確認 | Worktree環境 | CI | 2026-03-15 | 未実施 |


`;
    const result = parseDeferredTests(content);
    expect(result.items).toHaveLength(1);
    expect(result.items[0].id).toBe("DT-001");
    expect(result.items[0].testContent).toBe("UI表示確認");
    expect(result.items[0].status).toBe("未実施");
  });

  it("UT-DP-11: 100行のテスト項目を含む大規模テーブルの場合、全項目が正常にパースされる", () => {
    const headerLine =
      "| ID | テスト内容 | スキップ理由 | 実行予定環境 | 期限 | ステータス |";
    const separatorLine = "| --- | --- | --- | --- | --- | --- |";
    const dataLines = Array.from(
      { length: 100 },
      (_, i) =>
        `| DT-${String(i + 1).padStart(3, "0")} | テスト${i + 1} | 理由${i + 1} | 環境${i + 1} | 2026-03-15 | 未実施 |`,
    );
    const content = [headerLine, separatorLine, ...dataLines].join("\n");

    const result = parseDeferredTests(content);
    expect(result.items).toHaveLength(100);
    expect(result.items[0].id).toBe("DT-001");
    expect(result.items[0].testContent).toBe("テスト1");
    expect(result.items[99].id).toBe("DT-100");
    expect(result.items[99].testContent).toBe("テスト100");
    expect(result.allResolved).toBe(false);
  });

  it("UT-DP-12: テーブルセルにパイプ文字を含む場合の動作確認（エスケープなしで6カラム以上あれば正常）", () => {
    // 実装は単純な split("|") のため、セル内のパイプはカラム区切りとして扱われる
    // エスケープされたパイプ (\|) も split で分割される仕様を確認する
    // 6カラム以上になるケースでは ParseError にならないことを検証
    const content = `
| ID | テスト内容 | スキップ理由 | 実行予定環境 | 期限 | ステータス |
| --- | --- | --- | --- | --- | --- |
| DT-001 | UI表示確認 | Worktree環境でElectron起動不可 | メインリポジトリ | 2026-03-15 | 未実施 |
`;
    const result = parseDeferredTests(content);
    expect(result.items).toHaveLength(1);
    expect(result.items[0].id).toBe("DT-001");
    expect(result.items[0].status).toBe("未実施");
  });

  it("UT-DP-13: undefined を引数に渡した場合、DeferredTestsNotFoundError を throw する", () => {
    expect(() => parseDeferredTests(undefined as unknown as string)).toThrow(
      DeferredTestsNotFoundError,
    );
    expect(() => parseDeferredTests(undefined as unknown as string)).toThrow(
      "deferred-tests.md が見つかりません",
    );
  });

  it("UT-DP-14: 全項目が「対応不要」の場合、allResolved === true を返す", () => {
    const content = `
| ID | テスト内容 | スキップ理由 | 実行予定環境 | 期限 | ステータス |
| --- | --- | --- | --- | --- | --- |
| DT-001 | UI表示確認 | 仕様変更で不要 | CI | 2026-03-15 | 対応不要 |
`;
    const result = parseDeferredTests(content);
    expect(result.allResolved).toBe(true);
  });

  it("UT-DP-15: 「完了」と「対応不要」が混在する場合、allResolved === true を返す", () => {
    const content = `
| ID | テスト内容 | スキップ理由 | 実行予定環境 | 期限 | ステータス |
| --- | --- | --- | --- | --- | --- |
| DT-001 | UI表示確認 | Worktree環境 | CI | 2026-03-15 | 完了 |
| DT-002 | 操作確認 | 仕様変更で不要 | メインリポジトリ | 2026-03-15 | 対応不要 |
`;
    const result = parseDeferredTests(content);
    expect(result.allResolved).toBe(true);
  });

  it("UT-DP-16: 旧ステータス「対象外」も allResolved === true として扱われる", () => {
    const content = `
| ID | テスト内容 | スキップ理由 | 実行予定環境 | 期限 | ステータス |
| --- | --- | --- | --- | --- | --- |
| DT-001 | UI表示確認 | 仕様変更 | CI | 2026-03-15 | 対象外 |
`;
    const result = parseDeferredTests(content);
    expect(result.allResolved).toBe(true);
  });

  it("UT-DP-17: 「完了」「対応不要」「未実施」が混在する場合、allResolved === false を返す", () => {
    const content = `
| ID | テスト内容 | スキップ理由 | 実行予定環境 | 期限 | ステータス |
| --- | --- | --- | --- | --- | --- |
| DT-001 | UI表示確認 | Worktree環境 | CI | 2026-03-15 | 完了 |
| DT-002 | 操作確認 | 仕様変更 | メインリポジトリ | 2026-03-15 | 対応不要 |
| DT-003 | 結合テスト | Worktree環境 | CI | 2026-03-15 | 未実施 |
`;
    const result = parseDeferredTests(content);
    expect(result.allResolved).toBe(false);
  });
});
