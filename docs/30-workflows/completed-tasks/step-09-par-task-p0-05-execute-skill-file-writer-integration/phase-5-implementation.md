# Phase 5: 実装

## メタ情報

| 項目     | 値                                    |
| -------- | ------------------------------------- |
| Phase    | 5                                     |
| タスクID | TASK-P0-05                            |
| 機能名   | execute-skill-file-writer-integration |
| 作成日   | 2026-03-29                            |
| 更新日   | 2026-03-30                            |

## 目的

Phase 4 で作成した Red テストを Green にするために、LLM 応答パーサー、型拡張、Facade の persist 連携を実装する。実装順序は **型定義 → パーサー → Facade 変更** とし、各ステップでテストが段階的に Green になることを確認する。

## 実行タスク

### Task 5-1: ExecuteResult 型拡張（skillCreator.ts）

**対象ファイル:** `packages/shared/src/types/skillCreator.ts`

**変更内容:** `RuntimeSkillCreatorExecuteResult` に `persistResult` と `persistError` フィールドを追加する。

```typescript
// packages/shared/src/types/skillCreator.ts
// RuntimeSkillCreatorExecuteResult インターフェースに追加
export interface RuntimeSkillCreatorExecuteResult {
  // ... 既存フィールド（変更なし）...

  /** SkillFileWriter.persist() の結果。persist 未実行またはスキップ時は null */
  persistResult?: {
    skillPath: string;
    files: string[];
  } | null;

  /** persist 失敗時のエラーメッセージ。成功またはスキップ時は null */
  persistError?: string | null;
}
```

**判断ポイント:**

- `RuntimeSkillCreatorExecuteResult` では shared 境界を跨がない structural type を使う
- `SkillFileWriter.persist()` の戻り値は `PersistResult` としてローカルに残してよい
- 追加するのは `persistResult` と `persistError` の 2 フィールドだけに留める

**検証:** `pnpm --filter @repo/shared build` が成功すること

### Task 5-2: LLM 応答パーサー実装（parseLlmResponseToContent.ts）

**対象ファイル:** `apps/desktop/src/main/services/runtime/parseLlmResponseToContent.ts`（新規作成）

**実装手順:**

1. **テキスト結合**: `sdkEvents` から `eventType === 'assistant'` または `eventType === 'result'` のイベントを抽出し、`text` フィールドを結合
2. **コードブロック抽出**: 正規表現 ` ```(?:(\w+)\n)?([\s\S]*?)``` ` で全コードブロックを抽出
3. **見出し行解析**: 各コードブロック直前の行から `### filepath` パターンでファイルパスを抽出
4. **分類ロジック**:
   - 見出しが `SKILL.md` または見出しなしの最初のブロック → `skillMd`
   - `agents/` プレフィックス → `agents[]` に `{ name, content }` として追加
   - `scripts/` プレフィックス → `scripts[]`
   - `references/` プレフィックス → `references[]`
5. **null 返却**: コードブロックが 0 件の場合は `null`

````typescript
// apps/desktop/src/main/services/runtime/parseLlmResponseToContent.ts

import type {
  SkillCreatorSdkEvent,
  SkillGeneratedContent,
} from "@repo/shared/types";

/**
 * SDKイベント配列から LLM 応答テキストを結合し、
 * コードブロックを抽出して SkillGeneratedContent に変換する。
 *
 * コードブロックが 0 件の場合は null を返す（正常ケース）。
 */
export function parseLlmResponseToContent(
  sdkEvents: SkillCreatorSdkEvent[],
): SkillGeneratedContent | null {
  // Step 1: テキスト結合
  const fullText = sdkEvents
    .filter((e) => e.eventType === "assistant" || e.eventType === "result")
    .map((e) => e.text ?? "")
    .join("");

  // Step 2: コードブロック抽出（見出し行付き）
  // パターン: 見出し行（オプション）+ コードブロック
  const blockPattern =
    /(?:^|\n)(?:###?\s+(.+?)\s*\n)?```(?:\w+)?\n([\s\S]*?)```/g;
  const blocks: Array<{ heading: string | null; content: string }> = [];
  let match: RegExpExecArray | null;

  while ((match = blockPattern.exec(fullText)) !== null) {
    blocks.push({
      heading: match[1]?.trim() ?? null,
      content: match[2].trim(),
    });
  }

  // Step 3: コードブロック 0 件 → null
  if (blocks.length === 0) {
    return null;
  }

  // Step 4: 分類
  const result: SkillGeneratedContent = {
    skillMd: "",
    agents: [],
    scripts: [],
    references: [],
  };

  for (const block of blocks) {
    const heading = block.heading;

    if (!heading || heading === "SKILL.md") {
      // SKILL.md として扱う（最初のもののみ）
      if (!result.skillMd) {
        result.skillMd = block.content;
      }
    } else if (heading.startsWith("agents/")) {
      const name = heading.replace("agents/", "");
      result.agents.push({ name, content: block.content });
    } else if (heading.startsWith("scripts/")) {
      const name = heading.replace("scripts/", "");
      result.scripts.push({ name, content: block.content });
    } else if (heading.startsWith("references/")) {
      const name = heading.replace("references/", "");
      result.references.push({ name, content: block.content });
    } else {
      // 分類不能なブロック: skillMd が未設定なら skillMd に割り当て
      if (!result.skillMd) {
        result.skillMd = block.content;
      }
    }
  }

  return result;
}
````

**検証:** `pnpm vitest run parseLlmResponseToContent.test.ts` で P-01〜P-06 が Green になること

### Task 5-3: Facade execute() 変更（RuntimeSkillCreatorFacade.ts）

**対象ファイル:** `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`

**変更箇所:** `execute()` メソッド内、SDKイベント正規化（Step 3）の後、結果返却（Step 5）の前に Step 3.5 と Step 3.6 を挿入する。

**実装手順:**

1. **import 追加**: `parseLlmResponseToContent` を import
2. **DI 型拡張**: Facade コンストラクタの deps 型に `skillFileWriter?` が既に含まれていることを確認（Phase 1 で確認済み）
3. **Step 3.5 挿入**: `parseLlmResponseToContent(normalizedEvents)` を呼び出し
4. **Step 3.6 挿入**: `skillFileWriter.persist()` を呼び出し（try-catch で囲む）
5. **結果拡張**: 返却オブジェクトに `persistResult` と `persistError` を追加

```typescript
// execute() メソッド内の変更箇所（擬似コード）

// === 既存コード: SDKイベント正規化 ===
const normalizedEvents = normalizeSkillCreatorSdkEvents(response.messages);

// === Step 3.5-3.6: 新規追加 ===
let persistResult: { skillPath: string; files: string[] } | null = null;
let persistError: string | null = null;

if (response.success) {
  try {
    const content = parseLlmResponseToContent(normalizedEvents);

    if (content && this.deps.skillFileWriter) {
      persistResult = await this.deps.skillFileWriter.persist(
        request.skillName,
        content,
        { overwrite: true },
      );
    } else if (content && !this.deps.skillFileWriter) {
      // MR-01 対応: skillFileWriter 未DI 時の警告ログ
      console.warn(
        "[RuntimeSkillCreatorFacade] skillFileWriter is not injected. " +
          "Skipping persist for generated content.",
      );
    }
  } catch (err) {
    persistError = err instanceof Error ? err.message : String(err);
  }
}

// === 既存コード: 結果返却（拡張） ===
return {
  ...existingResult,
  persistResult,
  persistError,
};
```

**MR-01 対応:** `skillFileWriter` が DI されていない場合に `console.warn` を出力する。これにより設定ミスの早期発見が可能になる。

**検証:** `pnpm vitest run RuntimeSkillCreatorFacade.persist-integration.test.ts` で F-01〜F-06 が Green になること

### Task 5-4: 既存テストの回帰確認

```bash
# 既存 Facade テスト全体を実行して回帰がないことを確認
cd apps/desktop && pnpm vitest run src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade

# shared パッケージのビルド確認（型変更の後方互換性）
pnpm --filter @repo/shared build
```

**確認ポイント:**

- 既存の `RuntimeSkillCreatorFacade.test.ts` が全て PASS すること
- `RuntimeSkillCreatorFacade.plan.test.ts` 等が影響を受けていないこと
- shared パッケージのビルドが成功すること

## 実装順序まとめ

| 順序 | タスク   | 対象                                        | Green になるテスト   |
| ---- | -------- | ------------------------------------------- | -------------------- |
| 1    | Task 5-1 | 型拡張（skillCreator.ts）                   | コンパイルエラー解消 |
| 2    | Task 5-2 | パーサー（parseLlmResponseToContent.ts）    | P-01〜P-06           |
| 3    | Task 5-3 | Facade 変更（RuntimeSkillCreatorFacade.ts） | F-01〜F-06           |
| 4    | Task 5-4 | 回帰確認                                    | 既存テスト全件       |

## 参照資料

| 資料名           | パス                                                                  | 説明                                       |
| ---------------- | --------------------------------------------------------------------- | ------------------------------------------ |
| Phase 2 設計     | `phase-2-design.md`                                                   | パーサー設計、execute フロー設計           |
| Phase 3 レビュー | `phase-3-design-review.md`                                            | MR-01 指摘（console.warn 追加）            |
| Phase 4 テスト   | `phase-4-test-creation.md`                                            | テストケース P-01〜P-06, F-01〜F-06        |
| Facade 実装      | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | execute() の現行実装                       |
| SkillFileWriter  | `apps/desktop/src/main/services/skill/SkillFileWriter.ts`             | persist() のシグネチャ                     |
| 型定義           | `packages/shared/src/types/skillCreator.ts`                           | ExecuteResult 型、SkillGeneratedContent 型 |

## 統合テスト連携

| テスト種別     | 対象                         | 方針                              |
| -------------- | ---------------------------- | --------------------------------- |
| パーサー単体   | P-01〜P-06                   | Task 5-2 完了時に全て Green       |
| Facade persist | F-01〜F-06                   | Task 5-3 完了時に全て Green       |
| 既存テスト回帰 | RuntimeSkillCreatorFacade.\* | Task 5-4 で全て PASS 確認         |
| Phase 6 拡充   | エッジケース                 | Phase 6 で追加テスト Green を確認 |

## 多角的チェック観点

| 観点               | 適用   | チェック内容                                                                          |
| ------------------ | ------ | ------------------------------------------------------------------------------------- |
| エラーハンドリング | 該当   | persist 失敗時に execute 全体が fail しないこと。try-catch の範囲が適切であること     |
| 後方互換性         | 該当   | `persistResult?` / `persistError?` がオプショナルであり、既存コードに影響しないこと   |
| MR-01 対応         | 該当   | `skillFileWriter` 未DI時に `console.warn` が出力されること                            |
| パフォーマンス     | 非該当 | パーサーの正規表現は通常サイズの LLM 応答で十分高速。Phase 6 で大規模応答テストを追加 |

## 成果物

| 成果物      | パス                                                                  | 説明                        |
| ----------- | --------------------------------------------------------------------- | --------------------------- |
| 実装仕様書  | `phase-5-implementation.md`（本ファイル）                             | 実装手順                    |
| 型拡張      | `packages/shared/src/types/skillCreator.ts`                           | persistResult, persistError |
| パーサー    | `apps/desktop/src/main/services/runtime/parseLlmResponseToContent.ts` | LLM 応答パーサー（新規）    |
| Facade 変更 | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | execute() persist 連携      |

## 完了条件

- [ ] `RuntimeSkillCreatorExecuteResult` に `persistResult` と `persistError` が追加されている
- [ ] `parseLlmResponseToContent.ts` が新規作成され、P-01〜P-06 が Green
- [ ] `RuntimeSkillCreatorFacade.ts` の `execute()` に Step 3.5-3.6 が挿入され、F-01〜F-06 が Green
- [ ] MR-01 対応: `skillFileWriter` 未DI時に `console.warn` が出力される
- [ ] 既存 Facade テストが全て PASS（回帰なし）
- [ ] shared パッケージのビルドが成功する
- [ ] コード成果物が `outputs/` 配下ではなくプロジェクトの該当ディレクトリに配置されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 6: テスト拡充
