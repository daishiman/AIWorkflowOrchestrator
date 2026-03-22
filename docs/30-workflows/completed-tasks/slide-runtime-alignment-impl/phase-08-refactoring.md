# Phase 8: リファクタリング

## メタ情報

| 項目   | 値                           |
| ------ | ---------------------------- |
| Phase  | 8                            |
| 機能名 | slide-runtime-alignment-impl |
| 作成日 | 2026-03-22                   |
| Issue  | #1363                        |

## 目的

Phase 5（実装）で追加したコードの品質を改善する。DRY化・switch文による分岐整理・不要 export の削除・未使用 import の整理を行い、保守性を高める。

## 実行タスク

| タスク | 内容                                          | 対象ファイル                     |
| ------ | --------------------------------------------- | -------------------------------- |
| R-1    | 共通バリデーションヘルパーの抽出（DRY化）     | `main/slide/ipc-handlers.ts`     |
| R-2    | phase 分岐整理（switch文化）                  | `main/slide/skill-executor.ts`   |
| R-3    | 不要 export の削除                            | `main/slide/modifier-skill.ts`   |
| R-4    | 未使用 import の削除（全 slide 関連ファイル） | slide ディレクトリ配下全ファイル |

## 参照資料

| 資料名           | パス                                                                                |
| ---------------- | ----------------------------------------------------------------------------------- |
| Phase 2 設計書   | `docs/30-workflows/slide-runtime-alignment-impl/phase-02-design.md`                 |
| Phase 5 実装書   | `docs/30-workflows/slide-runtime-alignment-impl/phase-05-implementation.md`         |
| コード品質ルール | `.claude/rules/02-code-quality.md`                                                  |
| 既知の落とし穴   | `.claude/rules/06-known-pitfalls.md`（P42: trim バリデーション、P54: safeRegister） |

## 実行手順

### R-1: 共通バリデーションヘルパーの抽出

**対象**: `apps/desktop/src/main/slide/ipc-handlers.ts`

**背景**: 6本の invoke ハンドラに `validateIpcSender` + P42 3段バリデーション + `detectPathTraversal` の同一パターンが繰り返し記述されている。

**リファクタリング内容**:

`validateSlideRequest()` ヘルパーを抽出し、全ハンドラで再利用する。

```typescript
// リファクタリング前（各ハンドラで繰り返し記述）
ipcMain.handle(
  SLIDE_INVOKE_CHANNELS.WATCH_START,
  async (event, projectPath: string) => {
    validateIpcSender(event, "slide:watch-start", {
      getAllowedWindows: () => [mainWindow],
    });
    if (typeof projectPath !== "string" || projectPath.trim() === "") {
      return {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "projectPath must be a non-empty string",
        },
      };
    }
    if (detectPathTraversal(projectPath)) {
      return {
        success: false,
        error: { code: "SECURITY_ERROR", message: "Invalid path" },
      };
    }
    // ...
  },
);

// リファクタリング後（ヘルパー抽出）
type SlideRequestValidationResult =
  | { valid: true; projectPath: string }
  | { valid: false; response: SlideIpcResponse };

function validateSlideRequest(
  event: IpcMainInvokeEvent,
  channelName: string,
  projectPath: unknown,
  mainWindow: BrowserWindow,
): SlideRequestValidationResult {
  // 1. sender 検証
  validateIpcSender(event, channelName, {
    getAllowedWindows: () => [mainWindow],
  });

  // 2. P42 3段バリデーション
  if (typeof projectPath !== "string" || projectPath.trim() === "") {
    return {
      valid: false,
      response: {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "projectPath must be a non-empty string",
        },
      },
    };
  }

  // 3. path traversal guard
  if (detectPathTraversal(projectPath)) {
    return {
      valid: false,
      response: {
        success: false,
        error: { code: "SECURITY_ERROR", message: "Invalid path" },
      },
    };
  }

  return { valid: true, projectPath: projectPath.trim() };
}
```

**適用後のハンドラ例**:

```typescript
ipcMain.handle(
  SLIDE_INVOKE_CHANNELS.WATCH_START,
  async (event, projectPath: unknown) => {
    const validation = validateSlideRequest(
      event,
      "slide:watch-start",
      projectPath,
      mainWindow,
    );
    if (!validation.valid) return validation.response;
    // business logic
    try {
      await watchManager.start(validation.projectPath);
      return { success: true, data: null };
    } catch (error) {
      return { success: false, error: sanitizeError(error) };
    }
  },
);
```

**注意**: `slide:executePhase` ハンドラは `phase` 引数も追加バリデーションが必要なため、`validateSlideRequest()` 呼び出し後に `phase` のバリデーションを続けて記述する。

`validateSlideRequest()` は projectPath の有無で 2 バリアントに分離する:

- `validateSlideSenderOnly(event, channel, mainWindow)` — watch-stop, cancel 用
- `validateSlideRequestWithPath(event, channel, projectPath, mainWindow)` — executePhase, watch-start, sync-status, reverse-sync 用

これにより projectPath を持たないハンドラに誤って path guard が適用されることを防ぐ。

### R-2: phase 分岐の switch 文化

**対象**: `apps/desktop/src/main/slide/skill-executor.ts`

**背景**: `executeIntegrated()` 内の phase 分岐が if-else チェーンになっている場合、switch 文に整理して各 phase の処理を明確に分離する。

**リファクタリング内容**:

```typescript
// リファクタリング前（if-else チェーン）
async function executeIntegrated(
  phase: SkillPhase,
  projectPath: string,
): Promise<SkillExecutionResult> {
  if (phase === "hearing") {
    return executeHearing(projectPath);
  } else if (phase === "structure") {
    return executeStructure(projectPath);
  } else if (phase === "html") {
    return executeHtml(projectPath);
  } else if (phase === "modifier") {
    // modifier-skill.ts のロジック
    const context = await buildModifierContext(projectPath);
    const prompt = buildModifierPrompt(context);
    const response = await runtimeClient.complete(prompt);
    const parsed = parseModifierResponse(response);
    return { success: true, phase, data: parsed };
  } else {
    return {
      success: false,
      phase,
      error: { code: "UNKNOWN_PHASE", message: `Unknown phase: ${phase}` },
    };
  }
}

// リファクタリング後（switch 文）
async function executeIntegrated(
  phase: SkillPhase,
  projectPath: string,
): Promise<SkillExecutionResult> {
  switch (phase) {
    case "hearing":
      return executeHearing(projectPath);
    case "structure":
      return executeStructure(projectPath);
    case "html":
      return executeHtml(projectPath);
    case "modifier": {
      const context = await buildModifierContext(projectPath);
      const prompt = buildModifierPrompt(context);
      const response = await runtimeClient.complete(prompt);
      const parsed = parseModifierResponse(response);
      return { success: true, phase, data: parsed };
    }
    default: {
      const exhaustiveCheck: never = phase;
      return {
        success: false,
        phase: exhaustiveCheck,
        error: {
          code: "UNKNOWN_PHASE",
          message: `Unknown phase: ${String(phase)}`,
        },
      };
    }
  }
}
```

**ポイント**: `default` に `never` 型チェックを追加することで、`SkillPhase` 型に新しい値が追加された際にコンパイルエラーで検出できるようにする。

### R-3: modifier-skill.ts の不要 export 削除

**対象**: `apps/desktop/src/main/slide/modifier-skill.ts`

**背景**: Phase 5 の統合後、`modifier-skill.ts` は `buildModifierPrompt()` と `parseModifierResponse()` のみを `skill-executor.ts` に提供する utility モジュールとなった。使用されていない interface や型定義が残存している場合は削除する。

**実施内容**:

1. `modifier-skill.ts` の全 export を列挙する
2. `grep -rn "from.*modifier-skill" apps/desktop/src/` で実際の利用箇所を確認する
3. `buildModifierPrompt()` と `parseModifierResponse()` 以外で利用されていない export を削除する

**残すもの**:

- `buildModifierPrompt(context: ModifierContext): string`
- `parseModifierResponse(response: string): ModifierResult`
- 上記2関数が必要とする型定義（`ModifierContext`, `ModifierResult`）

**削除候補**:

- 独立した class や Service として定義されていた場合の class export
- 旧 `ModifierSkill` class（もし存在する場合）
- 呼び出し元が0件の interface や type

### R-4: 未使用 import の削除

**対象**: slide ディレクトリ配下の全ファイル

```bash
# 対象ファイル確認
find apps/desktop/src/main/slide -name "*.ts" | sort
```

**実施手順**:

1. 各ファイルで未使用 import がないか `pnpm --filter @repo/desktop lint` の出力で確認する
2. `no-unused-vars` / `@typescript-eslint/no-unused-vars` の警告対象を修正する
3. import の順序を整理する（Node.js 標準 → 外部パッケージ → 内部モジュール）

**特に確認が必要な箇所**:

- `agent-client.ts` 廃止後に `ipc-handlers.ts` に残存する import
- `skill-executor.ts` への統合後に `modifier-skill.ts` のインポートが `skill-executor.ts` に正しく追加されているか
- `preload/channels.ts` の rename 後に旧チャネル名を参照している import

## 統合テスト連携

Phase 9 で ESLint・TypeCheck・テスト実行を行うため、本 Phase での変更はコード品質改善のみとし、機能変更を含まないことを確認する。

**確認コマンド**（リファクタリング後に実行）:

```bash
# 型チェック
pnpm --filter @repo/desktop typecheck

# テスト（リグレッションなしの確認）
cd apps/desktop && pnpm vitest run src/main/slide/
```

## 成果物

| 成果物                                 | パス                                            | 説明                              |
| -------------------------------------- | ----------------------------------------------- | --------------------------------- |
| リファクタリング済み ipc-handlers.ts   | `apps/desktop/src/main/slide/ipc-handlers.ts`   | validateSlideRequest ヘルパー抽出 |
| リファクタリング済み skill-executor.ts | `apps/desktop/src/main/slide/skill-executor.ts` | switch 文整理 + never チェック    |
| 整理済み modifier-skill.ts             | `apps/desktop/src/main/slide/modifier-skill.ts` | 不要 export 削除                  |

## 完了条件

- [ ] `validateSlideRequest()` ヘルパーが抽出され、全6本の invoke ハンドラで使用されている
- [ ] `executeIntegrated()` の phase 分岐が switch 文に整理され、`default` に `never` チェックがある
- [ ] `modifier-skill.ts` の export が `buildModifierPrompt()` と `parseModifierResponse()`（および必要な型）のみになっている
- [ ] slide ディレクトリ配下のファイルに未使用 import がない
- [ ] リファクタリング前後でテスト結果が変わらない（regression なし）
- [ ] `pnpm --filter @repo/desktop typecheck` が PASS する

## 次のPhase

Phase 9（品質検証）へ進む。
