# API仕様: SkillAnalysisView Preload API拡張

## メタ情報

| 項目     | 値         |
| -------- | ---------- |
| タスクID | TASK-10A-B |
| 作成日   | 2026-03-02 |
| Phase    | 2          |

---

## 1. Preload API 拡張メソッド

`apps/desktop/src/preload/skill-api.ts` の `SkillAPI` インターフェースに以下3メソッドを追加する。

### 1.1 analyze

| 項目     | 値                                 |
| -------- | ---------------------------------- |
| メソッド | `window.electronAPI.skill.analyze` |
| IPC      | `IPC_CHANNELS.SKILL_ANALYZE`       |
| 引数     | `skillName: string`                |
| 戻り値   | `Promise<SkillAnalysis>`           |
| パターン | `safeInvoke`                       |

```typescript
analyze: (skillName: string): Promise<SkillAnalysis> =>
  safeInvoke(IPC_CHANNELS.SKILL_ANALYZE, skillName),
```

### 1.2 applyImprovements

| 項目     | 値                                             |
| -------- | ---------------------------------------------- |
| メソッド | `window.electronAPI.skill.applyImprovements`   |
| IPC      | `IPC_CHANNELS.SKILL_IMPROVE`                   |
| 引数     | `skillName: string, suggestions: Suggestion[]` |
| 戻り値   | `Promise<ImprovementResult>`                   |
| パターン | `safeInvoke`                                   |

```typescript
applyImprovements: (skillName: string, suggestions: Suggestion[]): Promise<ImprovementResult> =>
  safeInvoke(IPC_CHANNELS.SKILL_IMPROVE, { skillName, suggestions }),
```

### 1.3 autoImprove

| 項目     | 値                                     |
| -------- | -------------------------------------- |
| メソッド | `window.electronAPI.skill.autoImprove` |
| IPC      | `IPC_CHANNELS.SKILL_OPTIMIZE`          |
| 引数     | `skillName: string`                    |
| 戻り値   | `Promise<ImprovementResult>`           |
| パターン | `safeInvoke`                           |

```typescript
autoImprove: (skillName: string): Promise<ImprovementResult> =>
  safeInvoke(IPC_CHANNELS.SKILL_OPTIMIZE, skillName),
```

---

## 2. Main Process ハンドラ バリデーション仕様（P42準拠3段バリデーション）

全ハンドラで P42 準拠の3段バリデーション（型チェック → 空文字列 → トリム空文字列）を実施する。

### 2.1 skill:analyze ハンドラ

```typescript
ipcMain.handle(IPC_CHANNELS.SKILL_ANALYZE, async (event, skillName: string) => {
  // Step 1: 型チェック
  if (typeof skillName !== "string") {
    throw {
      code: "VALIDATION_ERROR",
      message: "skillName must be a string",
    };
  }
  // Step 2: 空文字列チェック
  if (skillName === "") {
    throw {
      code: "VALIDATION_ERROR",
      message: "skillName must not be empty",
    };
  }
  // Step 3: トリム空文字列チェック
  if (skillName.trim() === "") {
    throw {
      code: "VALIDATION_ERROR",
      message: "skillName must not be whitespace only",
    };
  }

  // sender検証
  validateIpcSender(event, {
    /* options */
  });

  return skillAnalyzer.analyze(skillName.trim());
});
```

### 2.2 skill:improve ハンドラ

```typescript
ipcMain.handle(
  IPC_CHANNELS.SKILL_IMPROVE,
  async (event, args: { skillName: string; suggestions: Suggestion[] }) => {
    // skillName バリデーション（P42準拠3段）
    if (typeof args?.skillName !== "string") {
      throw {
        code: "VALIDATION_ERROR",
        message: "skillName must be a string",
      };
    }
    if (args.skillName === "") {
      throw {
        code: "VALIDATION_ERROR",
        message: "skillName must not be empty",
      };
    }
    if (args.skillName.trim() === "") {
      throw {
        code: "VALIDATION_ERROR",
        message: "skillName must not be whitespace only",
      };
    }

    // suggestions バリデーション
    if (!Array.isArray(args?.suggestions)) {
      throw {
        code: "VALIDATION_ERROR",
        message: "suggestions must be an array",
      };
    }
    if (args.suggestions.length === 0) {
      throw {
        code: "VALIDATION_ERROR",
        message: "suggestions must be a non-empty array",
      };
    }

    // sender検証
    validateIpcSender(event, {
      /* options */
    });

    return skillImprover.applyImprovements(
      args.skillName.trim(),
      args.suggestions,
    );
  },
);
```

### 2.3 skill:optimize ハンドラ

```typescript
ipcMain.handle(
  IPC_CHANNELS.SKILL_OPTIMIZE,
  async (event, skillName: string) => {
    // P42準拠3段バリデーション（skill:analyze と同様）
    if (typeof skillName !== "string") {
      throw {
        code: "VALIDATION_ERROR",
        message: "skillName must be a string",
      };
    }
    if (skillName === "") {
      throw {
        code: "VALIDATION_ERROR",
        message: "skillName must not be empty",
      };
    }
    if (skillName.trim() === "") {
      throw {
        code: "VALIDATION_ERROR",
        message: "skillName must not be whitespace only",
      };
    }

    // sender検証
    validateIpcSender(event, {
      /* options */
    });

    return skillImprover.autoImprove(skillName.trim());
  },
);
```

---

## 3. 型整合性テーブル（Shared / Preload / Main 3層）

### 3.1 型定義の正本と参照先

| 型名                | 正本ファイル                                  | Shared | Preload              | Main               |
| ------------------- | --------------------------------------------- | ------ | -------------------- | ------------------ |
| `SkillAnalysis`     | `packages/shared/src/types/skill-improver.ts` | 定義   | import from shared   | import from shared |
| `Suggestion`        | 同上                                          | 定義   | import from shared   | import from shared |
| `ImprovementResult` | 同上                                          | 定義   | import from shared   | import from shared |
| `Risk`              | 同上                                          | 定義   | import from shared   | import from shared |
| `AnalysisCategory`  | 同上                                          | 定義   | import from shared   | import from shared |
| `SkillAPI`          | `apps/desktop/src/preload/types.ts`           | -      | インターフェース更新 | -                  |

### 3.2 チャネル別型整合性

| チャネル       | Preload引数型                                      | Main Handler引数型                                 | Preload戻り値型     | Main Handler戻り値型 | 整合性 |
| -------------- | -------------------------------------------------- | -------------------------------------------------- | ------------------- | -------------------- | ------ |
| skill:analyze  | `string`                                           | `string`                                           | `SkillAnalysis`     | `SkillAnalysis`      | 一致   |
| skill:improve  | `{ skillName: string, suggestions: Suggestion[] }` | `{ skillName: string, suggestions: Suggestion[] }` | `ImprovementResult` | `ImprovementResult`  | 一致   |
| skill:optimize | `string`                                           | `string`                                           | `ImprovementResult` | `ImprovementResult`  | 一致   |

### 3.3 引数名セマンティクス整合性（P45準拠）

| チャネル       | 引数名      | 実際に渡される値       | セマンティクス一致 |
| -------------- | ----------- | ---------------------- | ------------------ |
| skill:analyze  | skillName   | スキルの名前（文字列） | 一致               |
| skill:improve  | skillName   | スキルの名前（文字列） | 一致               |
| skill:improve  | suggestions | 選択された提案の配列   | 一致               |
| skill:optimize | skillName   | スキルの名前（文字列） | 一致               |

---

## 4. エラーレスポンス仕様

### 4.1 エラーコード一覧

| エラーコード       | 条件                         | エラーカテゴリ   | コード範囲 | リトライ |
| ------------------ | ---------------------------- | ---------------- | ---------- | -------- |
| VALIDATION_ERROR   | 引数バリデーション失敗       | Validation Error | 1000-1999  | 不可     |
| NOT_FOUND          | 指定されたスキルが存在しない | Business Error   | 2000-2999  | 不可     |
| ANALYSIS_FAILED    | 分析処理中の内部エラー       | Internal Error   | 5000-5999  | 不可     |
| IMPROVEMENT_FAILED | 改善適用中の内部エラー       | Internal Error   | 5000-5999  | 不可     |
| NETWORK_ERROR      | 外部サービスとの通信失敗     | External Service | 3000-3999  | 可能     |

### 4.2 エラーレスポンス形式

```typescript
interface IpcError {
  code: string;
  message: string;
}
```

エラーはサニタイズしてから Renderer に送る（04-electron-security.md 準拠）。内部実装の詳細（スタックトレース、ファイルパス）は含めない。

---

## 5. P42準拠3段バリデーション仕様

全文字列引数に対して以下の3ステップを順番に実施する:

| ステップ | チェック内容              | エラーメッセージ例                        |
| -------- | ------------------------- | ----------------------------------------- |
| Step 1   | `typeof arg !== "string"` | `"skillName must be a string"`            |
| Step 2   | `arg === ""`              | `"skillName must not be empty"`           |
| Step 3   | `arg.trim() === ""`       | `"skillName must not be whitespace only"` |

バリデーション通過後は `.trim()` した値をサービス層に渡す。

### 配列引数の追加バリデーション（skill:improve）

| ステップ | チェック内容                        | エラーメッセージ例                        |
| -------- | ----------------------------------- | ----------------------------------------- |
| Step A   | `!Array.isArray(args?.suggestions)` | `"suggestions must be an array"`          |
| Step B   | `args.suggestions.length === 0`     | `"suggestions must be a non-empty array"` |
