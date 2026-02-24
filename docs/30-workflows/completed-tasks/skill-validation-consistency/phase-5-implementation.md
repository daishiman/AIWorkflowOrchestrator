# Phase 5: 実装 - UT-FIX-SKILL-VALIDATION-CONSISTENCY-001

## メタ情報

| 項目               | 内容                                                                   |
| ------------------ | ---------------------------------------------------------------------- |
| タスクID           | UT-FIX-SKILL-VALIDATION-CONSISTENCY-001                                |
| タスク名           | skill:ハンドラP42準拠バリデーション形式統一                            |
| Phase              | 5（実装）                                                              |
| Issue              | #874                                                                   |
| 分類               | セキュリティ                                                           |
| 規模               | 小規模                                                                 |
| 前提Phase          | Phase 4（テスト作成）完了、新規テスト30件が Red                        |
| 前Phase成果物      | `apps/desktop/src/main/ipc/__tests__/skillHandlers.validation.test.ts` |
| 目的               | 6ハンドラをP42準拠3段バリデーション+throw形式に統一                    |
| 成果物ディレクトリ | `apps/desktop/src/main/ipc/`                                           |
| 作成日             | 2026-02-24                                                             |

## 目的

Phase 4 で作成した Red テスト（30件 FAIL）を Green にするために、`skillHandlers.ts` 内の6つの未準拠ハンドラのバリデーションロジックを P42 準拠の3段バリデーション（型チェック → 空文字列 → トリム空文字列）に統一し、エラーレスポンスを throw 形式に変更する。

TDD の Green Phase として、テストを通す最小限の実装変更のみを行う。バリデーション以外の既存ロジックには一切手を加えない。

## 背景

### P42準拠の標準パターン（skill:import / skill:remove で実証済み）

```typescript
// skillHandlers.ts 行130-136 (skill:import) — 完全準拠リファレンス
if (typeof skillName !== "string" || skillName.trim() === "") {
  throw {
    code: "VALIDATION_ERROR",
    message: "skillName must be a non-empty string",
  };
}
```

### 修正対象サマリ

| #   | ハンドラ         | 行番号 | パラメータ名   | 修正前エラー形式                          | 修正後エラー形式                              |
| --- | ---------------- | ------ | -------------- | ----------------------------------------- | --------------------------------------------- |
| 1   | skill:get-detail | L193   | args.skillId   | `return { success: false, error: "..." }` | `throw { code: "VALIDATION_ERROR", message }` |
| 2   | skill:execute    | L225   | args.skillId   | `return { success: false, error: "..." }` | `throw { code: "VALIDATION_ERROR", message }` |
| 3   | skill:abort      | L254   | executionId    | `return false`                            | `throw { code: "VALIDATION_ERROR", message }` |
| 4   | skill:get-status | L278   | executionId    | `return null`                             | `throw { code: "VALIDATION_ERROR", message }` |
| 5   | skill:analyze    | L308   | args.skillName | `return { success: false, error: "..." }` | `throw { code: "VALIDATION_ERROR", message }` |
| 6   | skill:improve    | L338   | args.skillName | `return { success: false, error: "..." }` | `throw { code: "VALIDATION_ERROR", message }` |

## 実行タスク

- get-detail修正: `skillId` のP42準拠検証とthrow化を行う。
- execute修正: `skillId` のP42準拠検証とthrow化を行う。
- abort修正: `executionId` のP42準拠検証とthrow化を行う。
- get-status修正: `executionId` のP42準拠検証とthrow化を行う。
- analyze修正: `skillName` のP42準拠検証とthrow化を行う。
- improve修正: `skillName` のP42準拠検証とthrow化を行う。

修正は1ファイル（`apps/desktop/src/main/ipc/skillHandlers.ts`）内の6箇所に対して、統一パターンを適用する。各修正は独立しており、順序依存はない。ただし、修正後のテスト実行確認は全修正後に一括で行う。

| #   | タスク名                            | 対象行 | テスト対象                 |
| --- | ----------------------------------- | ------ | -------------------------- |
| 1   | skill:get-detail バリデーション修正 | L193   | SH-GD-V02〜V06（5テスト）  |
| 2   | skill:execute バリデーション修正    | L225   | SH-EXE-V02〜V06（5テスト） |
| 3   | skill:abort バリデーション修正      | L254   | SH-ABT-V02〜V06（5テスト） |
| 4   | skill:get-status バリデーション修正 | L278   | SH-GS-V02〜V06（5テスト）  |
| 5   | skill:analyze バリデーション修正    | L308   | SH-ANZ-V02〜V06（5テスト） |
| 6   | skill:improve バリデーション修正    | L338   | SH-IVE-V02〜V06（5テスト） |

## 参照資料

| 資料                                              | 用途                          |
| ------------------------------------------------- | ----------------------------- |
| Phase 4 成果物 `skillHandlers.validation.test.ts` | Red テストの一覧              |
| `.claude/rules/06-known-pitfalls.md` P42          | trim()バリデーション漏れ防止  |
| `.claude/rules/06-known-pitfalls.md` P44          | IPCインターフェース不整合防止 |
| `.claude/rules/06-known-pitfalls.md` P45          | 引数命名の契約ドリフト防止    |
| `.claude/rules/04-electron-security.md`           | IPC セキュリティ原則          |
| `skillHandlers.ts` L130-136 (skill:import)        | P42準拠リファレンス実装       |
| `skillHandlers.ts` L170-176 (skill:remove)        | P42準拠リファレンス実装       |

### システム仕様（aiworkflow-requirements 抽出）

| 参照資料                      | パス                                                                              | 抽出した要件                                                    |
| ----------------------------- | --------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| security-skill-ipc.md         | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`         | skill系IPCはsender検証 + 文字列引数のtrim検証を適用             |
| security-api-electron.md      | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`      | contextIsolation/安全IPC前提でMain側入力検証を必須化            |
| interfaces-agent-sdk-skill.md | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | Skill API契約に合わせてthrow形式の失敗パターンを統一            |
| api-ipc-agent.md              | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`              | IPCチャネル契約のリクエスト/レスポンス整合性チェック            |
| ipc-contract-checklist.md     | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`     | Main/Preload/テストの3箇所同時更新とP42準拠を実装時に確認       |
| error-handling.md             | `.claude/skills/aiworkflow-requirements/references/error-handling.md`             | Validation Error分類（`VALIDATION_ERROR`）とthrow方針の整合確認 |

## 実行手順

### Task 5-1: skill:get-detail バリデーション修正

**対象ファイル**: `apps/desktop/src/main/ipc/skillHandlers.ts`
**対象行**: L193-195

**修正前**（現在のコード）:

```typescript
    async (event: IpcMainInvokeEvent, args: { skillId: string }) => {
      const validation = validateIpcSender(
        event,
        IPC_CHANNELS.SKILL_GET_DETAIL,
        { getAllowedWindows: () => [mainWindow] },
      );
      if (!validation.valid) {
        throw toIPCValidationError(validation);
      }
      if (typeof args?.skillId !== "string") {
        return { success: false, error: "skillId must be a string" };
      }
```

**修正後**:

```typescript
    async (event: IpcMainInvokeEvent, args: { skillId: string }) => {
      const validation = validateIpcSender(
        event,
        IPC_CHANNELS.SKILL_GET_DETAIL,
        { getAllowedWindows: () => [mainWindow] },
      );
      if (!validation.valid) {
        throw toIPCValidationError(validation);
      }
      // P42準拠: 3段バリデーション（型チェック → 空文字列 → トリム空文字列）
      if (typeof args?.skillId !== "string" || args.skillId.trim() === "") {
        throw {
          code: "VALIDATION_ERROR",
          message: "skillId must be a non-empty string",
        };
      }
```

**変更点**:

1. `trim() === ""` チェックを追加（P42準拠: スペースのみ文字列の拒否）
2. `return { success: false, error }` を `throw { code, message }` に変更（throw形式統一）
3. エラーメッセージを `"skillId must be a non-empty string"` に変更（統一フォーマット）
4. コメントを追加（`// P42準拠: 3段バリデーション`）

**テスト通過対象**: SH-GD-V02〜V06（5テスト Green化）

---

### Task 5-2: skill:execute バリデーション修正

**対象ファイル**: `apps/desktop/src/main/ipc/skillHandlers.ts`
**対象行**: L225-227

**修正前**（現在のコード）:

```typescript
    async (
      event: IpcMainInvokeEvent,
      args: { skillId: string; params?: Record<string, unknown> },
    ) => {
      const validation = validateIpcSender(event, IPC_CHANNELS.SKILL_EXECUTE, {
        getAllowedWindows: () => [mainWindow],
      });
      if (!validation.valid) {
        throw toIPCValidationError(validation);
      }
      if (typeof args?.skillId !== "string" || args.skillId === "") {
        return { success: false, error: "skillId must be a string" };
      }
```

**修正後**:

```typescript
    async (
      event: IpcMainInvokeEvent,
      args: { skillId: string; params?: Record<string, unknown> },
    ) => {
      const validation = validateIpcSender(event, IPC_CHANNELS.SKILL_EXECUTE, {
        getAllowedWindows: () => [mainWindow],
      });
      if (!validation.valid) {
        throw toIPCValidationError(validation);
      }
      // P42準拠: 3段バリデーション（型チェック → 空文字列 → トリム空文字列）
      if (typeof args?.skillId !== "string" || args.skillId.trim() === "") {
        throw {
          code: "VALIDATION_ERROR",
          message: "skillId must be a non-empty string",
        };
      }
```

**変更点**:

1. `args.skillId === ""` を `args.skillId.trim() === ""` に変更（P42準拠）
2. `return { success: false, error }` を `throw { code, message }` に変更（throw形式統一）
3. エラーメッセージを `"skillId must be a non-empty string"` に変更
4. コメントを追加

**テスト通過対象**: SH-EXE-V02〜V06（5テスト Green化）

---

### Task 5-3: skill:abort バリデーション修正

**対象ファイル**: `apps/desktop/src/main/ipc/skillHandlers.ts`
**対象行**: L254-256

**修正前**（現在のコード）:

```typescript
    async (event: IpcMainInvokeEvent, executionId: string) => {
      const validation = validateIpcSender(event, IPC_CHANNELS.SKILL_ABORT, {
        getAllowedWindows: () => [mainWindow],
      });
      if (!validation.valid) {
        throw toIPCValidationError(validation);
      }
      if (typeof executionId !== "string" || executionId === "") {
        return false;
      }
```

**修正後**:

```typescript
    async (event: IpcMainInvokeEvent, executionId: string) => {
      const validation = validateIpcSender(event, IPC_CHANNELS.SKILL_ABORT, {
        getAllowedWindows: () => [mainWindow],
      });
      if (!validation.valid) {
        throw toIPCValidationError(validation);
      }
      // P42準拠: 3段バリデーション（型チェック → 空文字列 → トリム空文字列）
      if (typeof executionId !== "string" || executionId.trim() === "") {
        throw {
          code: "VALIDATION_ERROR",
          message: "executionId must be a non-empty string",
        };
      }
```

**変更点**:

1. `executionId === ""` を `executionId.trim() === ""` に変更（P42準拠）
2. `return false` を `throw { code, message }` に変更（throw形式統一）
3. コメントを追加

**セマンティクスの変更について**:

- 変更前: 不正な入力に対して `false`（abort不可）を返すサイレントな失敗
- 変更後: 不正な入力に対して明示的に VALIDATION_ERROR を throw
- Phase 3 設計レビューで「不正入力は明確にエラーとして報告すべき」と判定済み

**テスト通過対象**: SH-ABT-V02〜V06（5テスト Green化）

---

### Task 5-4: skill:get-status バリデーション修正

**対象ファイル**: `apps/desktop/src/main/ipc/skillHandlers.ts`
**対象行**: L278-280

**修正前**（現在のコード）:

```typescript
    async (event: IpcMainInvokeEvent, executionId: string) => {
      const validation = validateIpcSender(
        event,
        IPC_CHANNELS.SKILL_GET_STATUS,
        {
          getAllowedWindows: () => [mainWindow],
        },
      );
      if (!validation.valid) {
        throw toIPCValidationError(validation);
      }
      if (typeof executionId !== "string" || executionId === "") {
        return null;
      }
```

**修正後**:

```typescript
    async (event: IpcMainInvokeEvent, executionId: string) => {
      const validation = validateIpcSender(
        event,
        IPC_CHANNELS.SKILL_GET_STATUS,
        {
          getAllowedWindows: () => [mainWindow],
        },
      );
      if (!validation.valid) {
        throw toIPCValidationError(validation);
      }
      // P42準拠: 3段バリデーション（型チェック → 空文字列 → トリム空文字列）
      if (typeof executionId !== "string" || executionId.trim() === "") {
        throw {
          code: "VALIDATION_ERROR",
          message: "executionId must be a non-empty string",
        };
      }
```

**変更点**:

1. `executionId === ""` を `executionId.trim() === ""` に変更（P42準拠）
2. `return null` を `throw { code, message }` に変更（throw形式統一）
3. コメントを追加

**セマンティクスの変更について**:

- 変更前: 不正な入力に対して `null`（ステータスなし）を返すサイレントな失敗
- 変更後: 不正な入力に対して明示的に VALIDATION_ERROR を throw
- Phase 3 設計レビューで判定済み

**テスト通過対象**: SH-GS-V02〜V06（5テスト Green化）

---

### Task 5-5: skill:analyze バリデーション修正

**対象ファイル**: `apps/desktop/src/main/ipc/skillHandlers.ts`
**対象行**: L308-310

**修正前**（現在のコード）:

```typescript
    async (event: IpcMainInvokeEvent, args: SkillAnalyzeRequest) => {
      const validation = validateIpcSender(event, IPC_CHANNELS.SKILL_ANALYZE, {
        getAllowedWindows: () => [mainWindow],
      });
      if (!validation.valid) {
        throw toIPCValidationError(validation);
      }
      if (typeof args?.skillName !== "string" || args.skillName === "") {
        return { success: false, error: "スキル名が指定されていません" };
      }
```

**修正後**:

```typescript
    async (event: IpcMainInvokeEvent, args: SkillAnalyzeRequest) => {
      const validation = validateIpcSender(event, IPC_CHANNELS.SKILL_ANALYZE, {
        getAllowedWindows: () => [mainWindow],
      });
      if (!validation.valid) {
        throw toIPCValidationError(validation);
      }
      // P42準拠: 3段バリデーション（型チェック → 空文字列 → トリム空文字列）
      if (typeof args?.skillName !== "string" || args.skillName.trim() === "") {
        throw {
          code: "VALIDATION_ERROR",
          message: "skillName must be a non-empty string",
        };
      }
```

**変更点**:

1. `args.skillName === ""` を `args.skillName.trim() === ""` に変更（P42準拠）
2. `return { success: false, error }` を `throw { code, message }` に変更（throw形式統一）
3. 日本語メッセージ `"スキル名が指定されていません"` を英語統一メッセージ `"skillName must be a non-empty string"` に変更（他ハンドラとの一貫性）
4. コメントを追加

**テスト通過対象**: SH-ANZ-V02〜V06（5テスト Green化）

---

### Task 5-6: skill:improve バリデーション修正

**対象ファイル**: `apps/desktop/src/main/ipc/skillHandlers.ts`
**対象行**: L338-340

**修正前**（現在のコード）:

```typescript
    async (event: IpcMainInvokeEvent, args: SkillImproveRequest) => {
      const validation = validateIpcSender(event, IPC_CHANNELS.SKILL_IMPROVE, {
        getAllowedWindows: () => [mainWindow],
      });
      if (!validation.valid) {
        throw toIPCValidationError(validation);
      }
      if (typeof args?.skillName !== "string" || args.skillName === "") {
        return { success: false, error: "スキル名が指定されていません" };
      }
```

**修正後**:

```typescript
    async (event: IpcMainInvokeEvent, args: SkillImproveRequest) => {
      const validation = validateIpcSender(event, IPC_CHANNELS.SKILL_IMPROVE, {
        getAllowedWindows: () => [mainWindow],
      });
      if (!validation.valid) {
        throw toIPCValidationError(validation);
      }
      // P42準拠: 3段バリデーション（型チェック → 空文字列 → トリム空文字列）
      if (typeof args?.skillName !== "string" || args.skillName.trim() === "") {
        throw {
          code: "VALIDATION_ERROR",
          message: "skillName must be a non-empty string",
        };
      }
```

**変更点**:

1. `args.skillName === ""` を `args.skillName.trim() === ""` に変更（P42準拠）
2. `return { success: false, error }` を `throw { code, message }` に変更（throw形式統一）
3. 日本語メッセージを英語統一メッセージに変更
4. コメントを追加

**スコープ外の注意**: skill:improve には追加で `args.analysis` のバリデーション（L341-343）がある。この `args.analysis` のバリデーションは本タスクのスコープ外（文字列パラメータではないため P42 の対象外）。既存のまま維持する。

**テスト通過対象**: SH-IVE-V02〜V06（5テスト Green化）

---

### テスト実行確認

全6箇所の修正後、以下のコマンドで Phase 4 の新規テスト36件が全て Green であることを確認する。

```bash
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers.validation.test.ts
```

**期待される結果**:

- 36テスト全て PASS（Green）
- 正常系テスト（V01）: 6件 PASS
- 異常系テスト（V02〜V06）: 30件 PASS

次に、既存テストの影響を確認する。

```bash
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers
```

**期待される結果**:

- `skillHandlers.validation.test.ts`: 36件 PASS
- `skillHandlers.test.ts`: SH-GD-03 が FAIL（return形式を期待しているため）
- `skillHandlers.execute.test.ts`: TC-4-006 の4件が FAIL（return形式を期待しているため）
- `skillHandlers.improve.test.ts`: IPC-02, IPC-03 が FAIL（return形式を期待しているため）
- `skillHandlers.delegate.test.ts`: 全件 PASS（影響なし）
- `skillHandlers.integration.test.ts`: 全件 PASS（影響なし）

既存テストの FAIL は Phase 6（テスト拡充）で修正する。Phase 5 の完了条件としては、**新規テスト36件が全て Green** であれば完了。

## 既知のPitfall対策

### P42: 文字列引数の .trim() バリデーション漏れ

**対策**: 全6ハンドラで `.trim() === ""` チェックを追加。修正後は以下のコマンドで全ハンドラの trim 適用を確認する。

```bash
# 修正対象6ハンドラのtrimチェックを確認
cd apps/desktop && grep -n "\.trim() === " src/main/ipc/skillHandlers.ts
```

**期待される出力**: 8行（修正前の skill:import + skill:remove の2行 + 修正後の6行）

### P44: IPCハンドラとPreloadのインターフェース不整合

**対策**: 本タスクではバリデーションロジックのみを変更し、ハンドラの引数形式（オブジェクト型 / 直接引数型）は変更しない。引数の受け取り方は既存のまま維持するため、Preload側との不整合は発生しない。

### P45: IPC引数命名の契約ドリフト

**対策**: 本タスクでは引数名（skillId / executionId / skillName）を変更しない。エラーメッセージ内のパラメータ名は実際の引数名と一致させる。

| ハンドラ         | 引数名      | エラーメッセージ内のパラメータ名 | 一致 |
| ---------------- | ----------- | -------------------------------- | ---- |
| skill:get-detail | skillId     | `"skillId must be ..."`          | 一致 |
| skill:execute    | skillId     | `"skillId must be ..."`          | 一致 |
| skill:abort      | executionId | `"executionId must be ..."`      | 一致 |
| skill:get-status | executionId | `"executionId must be ..."`      | 一致 |
| skill:analyze    | skillName   | `"skillName must be ..."`        | 一致 |
| skill:improve    | skillName   | `"skillName must be ..."`        | 一致 |

### P11: PostToolUse フックによる Edit 失敗

**対策**: 大量編集後は `git diff --stat` で変更数を検証する。本タスクの修正は1ファイル6箇所のみで、各修正は2-4行の変更であるため、リスクは低い。

```bash
# 修正後の変更量確認
git diff --stat -- apps/desktop/src/main/ipc/skillHandlers.ts
```

## 統合テスト連携

### throw形式変更による既存テスト影響

エラーレスポンス形式が return → throw に変更されるため、既存テストで `return` 値を期待しているテストは Phase 6 で修正が必要。

| 既存テストID | ファイル                      | 現在の期待値（修正前）        | Phase 6 修正方向                  |
| ------------ | ----------------------------- | ----------------------------- | --------------------------------- |
| SH-GD-03     | skillHandlers.test.ts         | `expect(error).toBeDefined()` | try-catch で VALIDATION_ERROR検証 |
| TC-4-006 (1) | skillHandlers.execute.test.ts | `opResult.success === false`  | try-catch で VALIDATION_ERROR検証 |
| TC-4-006 (2) | skillHandlers.execute.test.ts | `opResult.success === false`  | try-catch で VALIDATION_ERROR検証 |
| TC-4-006 (3) | skillHandlers.execute.test.ts | `opResult.success === false`  | try-catch で VALIDATION_ERROR検証 |
| TC-4-006 (4) | skillHandlers.execute.test.ts | `opResult.success === false`  | try-catch で VALIDATION_ERROR検証 |
| IPC-02       | skillHandlers.improve.test.ts | `result.success === false`    | try-catch で VALIDATION_ERROR検証 |
| IPC-03       | skillHandlers.improve.test.ts | `result.success === false`    | try-catch で VALIDATION_ERROR検証 |

### TDD検証手順（Red → Green）

1. Phase 4 の新規テスト30件が Red であることを再確認
2. Task 5-1〜5-6 の修正を `skillHandlers.ts` に一括適用
3. `cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers.validation.test.ts` を実行
4. **新規テスト36件が全て Green** であることを確認
5. `cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers` で全テスト結果を記録
6. 既存テストの FAIL 箇所を Phase 6 修正リストに記録

## 多角的チェック観点

| 観点           | 確認内容                                                         |
| -------------- | ---------------------------------------------------------------- |
| P42準拠        | 全6ハンドラで `.trim() === ""` チェックが含まれている            |
| エラー形式統一 | 全6ハンドラが throw { code: "VALIDATION_ERROR", message } を使用 |
| メッセージ統一 | `"${paramName} must be a non-empty string"` パターンで統一       |
| 既存ロジック   | バリデーション以外の既存ロジックに変更がないこと                 |
| P11対策        | Prettier/ESLint の自動修正で Edit が失敗しないよう注意           |
| P44対策        | ハンドラ引数形式（型）に変更がないこと                           |
| P45対策        | エラーメッセージ内のパラメータ名が実際の引数名と一致             |
| コメント       | 各修正箇所に `// P42準拠` コメントが付与されている               |

## 修正前後の全体比較

### skill:get-detail（L193）

| 項目         | 修正前                                                         | 修正後                                                                              |
| ------------ | -------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| 条件式       | `typeof args?.skillId !== "string"`                            | `typeof args?.skillId !== "string" \|\| args.skillId.trim() === ""`                 |
| エラー応答   | `return { success: false, error: "skillId must be a string" }` | `throw { code: "VALIDATION_ERROR", message: "skillId must be a non-empty string" }` |
| 空文字列     | typeof通過 → サービス呼出                                      | throw VALIDATION_ERROR                                                              |
| スペースのみ | typeof通過 → サービス呼出                                      | throw VALIDATION_ERROR                                                              |

### skill:execute（L225）

| 項目         | 修正前                                                         | 修正後                                                                              |
| ------------ | -------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| 条件式       | `typeof args?.skillId !== "string" \|\| args.skillId === ""`   | `typeof args?.skillId !== "string" \|\| args.skillId.trim() === ""`                 |
| エラー応答   | `return { success: false, error: "skillId must be a string" }` | `throw { code: "VALIDATION_ERROR", message: "skillId must be a non-empty string" }` |
| スペースのみ | === "" 通過 → サービス呼出                                     | throw VALIDATION_ERROR                                                              |

### skill:abort（L254）

| 項目         | 修正前                                                    | 修正後                                                                                  |
| ------------ | --------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| 条件式       | `typeof executionId !== "string" \|\| executionId === ""` | `typeof executionId !== "string" \|\| executionId.trim() === ""`                        |
| エラー応答   | `return false`                                            | `throw { code: "VALIDATION_ERROR", message: "executionId must be a non-empty string" }` |
| スペースのみ | === "" 通過 → executor呼出                                | throw VALIDATION_ERROR                                                                  |

### skill:get-status（L278）

| 項目         | 修正前                                                    | 修正後                                                                                  |
| ------------ | --------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| 条件式       | `typeof executionId !== "string" \|\| executionId === ""` | `typeof executionId !== "string" \|\| executionId.trim() === ""`                        |
| エラー応答   | `return null`                                             | `throw { code: "VALIDATION_ERROR", message: "executionId must be a non-empty string" }` |
| スペースのみ | === "" 通過 → executor呼出                                | throw VALIDATION_ERROR                                                                  |

### skill:analyze（L308）

| 項目         | 修正前                                                             | 修正後                                                                                |
| ------------ | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| 条件式       | `typeof args?.skillName !== "string" \|\| args.skillName === ""`   | `typeof args?.skillName !== "string" \|\| args.skillName.trim() === ""`               |
| エラー応答   | `return { success: false, error: "スキル名が指定されていません" }` | `throw { code: "VALIDATION_ERROR", message: "skillName must be a non-empty string" }` |
| スペースのみ | === "" 通過 → サービス呼出                                         | throw VALIDATION_ERROR                                                                |

### skill:improve（L338）

| 項目         | 修正前                                                             | 修正後                                                                                |
| ------------ | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| 条件式       | `typeof args?.skillName !== "string" \|\| args.skillName === ""`   | `typeof args?.skillName !== "string" \|\| args.skillName.trim() === ""`               |
| エラー応答   | `return { success: false, error: "スキル名が指定されていません" }` | `throw { code: "VALIDATION_ERROR", message: "skillName must be a non-empty string" }` |
| スペースのみ | === "" 通過 → サービス呼出                                         | throw VALIDATION_ERROR                                                                |

## 成果物

| #   | 名称                         | パス                                         | 種別     |
| --- | ---------------------------- | -------------------------------------------- | -------- |
| 1   | skillHandlers.ts（修正済み） | `apps/desktop/src/main/ipc/skillHandlers.ts` | 実装修正 |

## 完了条件チェックリスト

- [ ] 全6ハンドラのバリデーションが P42 準拠の3段バリデーションに修正されている
- [ ] 全6ハンドラのエラーレスポンスが `throw { code: "VALIDATION_ERROR", message }` 形式に統一されている
- [ ] エラーメッセージが `"${paramName} must be a non-empty string"` パターンで統一されている
- [ ] 各修正箇所に `// P42準拠: 3段バリデーション` コメントが付与されている
- [ ] バリデーション以外の既存ロジックに変更がないこと
- [ ] Phase 4 の新規テスト36件が全て Green（PASS）であること
- [ ] `cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers.validation.test.ts` で実行確認済み
- [ ] 既存テストの FAIL 箇所が Phase 6 修正リストに記録されている
- [ ] `grep -n "\.trim() === " apps/desktop/src/main/ipc/skillHandlers.ts` で8行が出力されること（import + remove の2行 + 新規6行）

## 次のPhase

Phase 6（テスト拡充）へ進む。throw 形式変更により Red になった既存テスト（SH-GD-03, TC-4-006, IPC-02, IPC-03）の修正と、境界値テストの追加を行う。
