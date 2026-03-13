import { describe, expect, it } from "vitest";
import {
  buildSearchResults,
  resolveQuickFileSearchViewState,
  scoreFilePath,
} from "../utils/quickFileSearchResilience";

describe("quickFileSearchResilience", () => {
  it("一致しない query は score=0 のまま候補に残さない", () => {
    expect(scoreFilePath("/workspace/src/app.ts", "zzz")).toBe(0);
    expect(buildSearchResults(["/workspace/src/app.ts"], "zzz", 10)).toEqual(
      [],
    );
  });

  it("同一 score は path 順で deterministic に並ぶ", () => {
    const results = buildSearchResults(
      ["/workspace/b/index.ts", "/workspace/a/index.ts"],
      "index.ts",
      10,
    );

    expect(results.map((result) => result.path)).toEqual([
      "/workspace/a/index.ts",
      "/workspace/b/index.ts",
    ]);
  });

  it("view state は idle / no-match / results を分ける", () => {
    expect(resolveQuickFileSearchViewState("", 0)).toMatchObject({
      kind: "idle",
      emptyMessage: "検索語を入力してください。",
    });
    expect(resolveQuickFileSearchViewState("missing", 0)).toMatchObject({
      kind: "no-match",
      emptyMessage: "一致するファイルは見つかりませんでした。",
    });
    expect(resolveQuickFileSearchViewState("app", 2)).toMatchObject({
      kind: "results",
      liveRegionText: "2 件ヒット",
    });
  });
});
