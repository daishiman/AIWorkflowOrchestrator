# Phase 6: テスト拡充（TDD: Green補完） — skill:ハンドラP42準拠バリデーション形式統一

## メタ情報

| 項目          | 内容                                                    |
| ------------- | ------------------------------------------------------- |
| タスクID      | UT-FIX-SKILL-VALIDATION-CONSISTENCY-001                 |
| タスク名      | skill:ハンドラP42準拠バリデーション形式統一             |
| Phase         | 6 — テスト拡充                                          |
| 分類          | セキュリティ                                            |
| 優先度        | 中                                                      |
| 規模          | 小規模                                                  |
| Issue         | #874                                                    |
| 作成日        | 2026-02-24                                              |
| ステータス    | 未着手                                                  |
| 前Phase成果物 | Phase 5（実装）完了、Phase 4 新規テスト28件が全て Green |
| 後続Phase     | Phase 7（カバレッジ確認）                               |
| 機能名        | skill-validation-consistency                            |

---

## 目的

Phase 4 で作成した基本テスト（P42準拠バリデーション: 空文字列・null・undefined・数値型・スペースのみ、合計28件）に加え、Phase 7 のカバレッジ基準（Line 80%+, Branch 60%+, Function 80%+）を達成するために不足しているテストを追加する。

具体的には以下の3種類のテスト拡充を実施する:

1. **エッジケーステスト追加**: タブ文字のみ `"\t\t"`、改行のみ `"\n\n"`、混合空白文字 `" \t\n "` 等の境界値テスト
2. **throw形式エラー伝播テスト追加**: return形式からthrow形式に変更した6ハンドラのエラーオブジェクト（`{ code, message }`）の正確性検証
3. **既存テストの期待値更新**: Phase 5 の return→throw 変更により Red になった既存テストを throw 形式に修正

## 背景

### Phase 5 の変更による影響

Phase 5 で6ハンドラのバリデーションエラーレスポンスを return 形式から throw 形式に変更した。この変更により、バリデーション失敗を return 形式（`{ success: false, error: "..." }` / `false` / `null`）で期待していた既存テストが Red になっている。

| テストID | ファイル                      | ハンドラ         | 旧期待値                         | 新期待値                  |
| -------- | ----------------------------- | ---------------- | -------------------------------- | ------------------------- |
| SH-GD-03 | skillHandlers.test.ts         | skill:get-detail | `return { success: false, ... }` | `throw { code, message }` |
| TC-4-006 | skillHandlers.execute.test.ts | skill:execute    | `return { success: false, ... }` | `throw { code, message }` |
| IPC-02   | skillHandlers.improve.test.ts | skill:analyze    | `return { success: false, ... }` | `throw { code, message }` |
| IPC-03   | skillHandlers.improve.test.ts | skill:improve    | `return { success: false, ... }` | `throw { code, message }` |

---

## 実行タスク

- カバレッジ差分特定: 未カバー行と分岐を特定する。
- 境界値追加: 空白系の境界値テストを追加する。
- 伝播検証追加: throwエラーの `code/message` 伝播を検証する。
- 既存期待値更新: return前提テストをthrow前提へ更新する。
- 回帰確認: 正常系フローが維持されることを確認する。

| #   | タスク                          | 説明                                                                           |
| --- | ------------------------------- | ------------------------------------------------------------------------------ |
| 1   | カバレッジ不足箇所の特定        | 現時点のカバレッジレポートを生成し、未カバー行・分岐を一覧化する               |
| 2   | エッジケーステストの追加        | タブ文字・改行・混合空白文字の境界値テストを全6ハンドラに追加する              |
| 3   | throw形式エラー伝播テストの追加 | throw されたエラーオブジェクトの code / message プロパティ検証テストを追加する |
| 4   | 既存テストの期待値更新          | return 形式を期待していた既存テスト4件を throw 形式（try-catch）に修正する     |
| 5   | 正常系テストの回帰確認          | バリデーション変更が正常系処理フローに影響していないことを確認する             |

---

## 参照資料

### 前Phase成果物

- `docs/30-workflows/completed-tasks/skill-validation-consistency/phase-1-requirements.md` — 要件定義書
- `docs/30-workflows/completed-tasks/skill-validation-consistency/phase-2-design.md` — 設計書
- `docs/30-workflows/completed-tasks/skill-validation-consistency/phase-3-design-review.md` — 設計レビュー結果書
- `docs/30-workflows/completed-tasks/skill-validation-consistency/phase-5-implementation.md` — 実装仕様書

### テストファイル（既存5ファイル）

| ファイル                                                                | 用途                     |
| ----------------------------------------------------------------------- | ------------------------ |
| `apps/desktop/src/main/ipc/__tests__/skillHandlers.test.ts`             | メインテスト             |
| `apps/desktop/src/main/ipc/__tests__/skillHandlers.execute.test.ts`     | skill:execute 専用テスト |
| `apps/desktop/src/main/ipc/__tests__/skillHandlers.improve.test.ts`     | skill:improve 専用テスト |
| `apps/desktop/src/main/ipc/__tests__/skillHandlers.delegate.test.ts`    | delegate 関連テスト      |
| `apps/desktop/src/main/ipc/__tests__/skillHandlers.integration.test.ts` | 統合テスト               |

### 新規テストファイル

| ファイル                                                               | 用途                                   |
| ---------------------------------------------------------------------- | -------------------------------------- |
| `apps/desktop/src/main/ipc/__tests__/skillHandlers.validation.test.ts` | P42バリデーション専用テスト（Phase 4） |

### システム仕様

- `.claude/rules/06-known-pitfalls.md` — P42: 文字列引数の.trim()バリデーション漏れ
- `.claude/rules/02-code-quality.md` — カバレッジ基準（Line 80%+, Branch 60%+, Function 80%+）
- `.claude/rules/04-electron-security.md` — IPCセキュリティ原則

### システム仕様（aiworkflow-requirements 抽出）

| 参照資料                      | パス                                                                              | 抽出した要件                                    |
| ----------------------------- | --------------------------------------------------------------------------------- | ----------------------------------------------- |
| security-skill-ipc.md         | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`         | P42準拠入力拒否とエラー返却のテスト観点         |
| api-ipc-agent.md              | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`              | IPCチャネル契約に対する失敗系テスト整合         |
| ipc-contract-checklist.md     | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`     | 異常系（空文字/空白/型不一致）テストの必須化    |
| interfaces-agent-sdk-skill.md | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | Skill APIの失敗時挙動（reject経路）との整合確認 |
| error-handling.md             | `.claude/skills/aiworkflow-requirements/references/error-handling.md`             | Validation Error分類に沿ったエラー検証          |

### 関連Pitfall

- P9: モジュールスコープ変数のテスト間リーク（テスト間で状態を共有しない）
- P39: happy-dom環境でのuserEvent非互換（テスト環境の制約として留意）
- P40: テスト実行ディレクトリ依存（`cd apps/desktop` で実行する必要がある）
- P41: v8カバレッジプロバイダのインライン関数カウント（Function Coverage に影響する可能性）

---

## 実行手順

### Step 1: カバレッジ不足箇所の特定

#### 1.1 カバレッジレポートの生成

以下のコマンドを **`apps/desktop` ディレクトリから** 実行する（P40準拠）:

```bash
cd apps/desktop && pnpm vitest run --coverage src/main/ipc/__tests__/skillHandlers
```

> **注意（P40）**: プロジェクトルートから `pnpm vitest run apps/desktop/src/...` を実行すると `vitest.config.ts` が正しく読み込まれず、`document is not defined` エラーが発生する。必ず `cd apps/desktop` してから実行すること。

#### 1.2 カバレッジ結果の記録

カバレッジレポートの出力から以下のテーブルを作成し、`outputs/phase-6/coverage-gap-analysis.md` に記録する:

```markdown
## Phase 6 開始時点のカバレッジ

| ファイル         | Line Coverage | Branch Coverage | Function Coverage | 未カバー行 |
| ---------------- | ------------- | --------------- | ----------------- | ---------- |
| skillHandlers.ts | \_\_\_%       | \_\_\_%         | \_\_\_%           | L**-L**    |
```

#### 1.3 未カバー箇所の分類

未カバー行を以下のカテゴリに分類し、各カテゴリの対応方針を決定する:

| カテゴリ               | 説明                                       | 対応方針                        |
| ---------------------- | ------------------------------------------ | ------------------------------- |
| バリデーション分岐     | P42準拠バリデーションの条件分岐が未テスト  | Step 2 でエッジケーステスト追加 |
| throw伝播              | throw されたエラーの伝播パスが未テスト     | Step 3 でエラー伝播テスト追加   |
| 既存テスト期待値不一致 | return → throw 変更に伴う既存テストの失敗  | Step 4 で既存テスト修正         |
| サービス層呼び出し     | バリデーション通過後のサービス呼び出しパス | Phase 4 テストで既にカバー済み  |
| validateIpcSender      | sender検証のインライン関数（P41対象）      | セキュリティテストで別途カバー  |

---

### Step 2: エッジケーステストの追加

#### 2.1 追加テストケース一覧

以下の境界値テストを既存テストファイルおよび新規バリデーションテストファイルに追加する。全6ハンドラに対して同一のエッジケースを検証する:

| #   | テストID | ハンドラ         | 入力値                | 期待結果               | 検証目的                                  |
| --- | -------- | ---------------- | --------------------- | ---------------------- | ----------------------------------------- |
| 1   | SH-BV-01 | skill:get-detail | `"\t"` (タブのみ)     | throw VALIDATION_ERROR | `.trim()` がタブ文字を除去することを検証  |
| 2   | SH-BV-02 | skill:get-detail | `"\n"` (改行のみ)     | throw VALIDATION_ERROR | `.trim()` が改行文字を除去することを検証  |
| 3   | SH-BV-03 | skill:get-detail | `"\t \n"` (混合空白)  | throw VALIDATION_ERROR | `.trim()` が混合空白を除去することを検証  |
| 4   | SH-BV-04 | skill:execute    | `"\t"` (タブのみ)     | throw VALIDATION_ERROR | `.trim()` がタブ文字を除去することを検証  |
| 5   | SH-BV-05 | skill:execute    | `"\n\r"` (改行のみ)   | throw VALIDATION_ERROR | `.trim()` がCR+LFを除去することを検証     |
| 6   | SH-BV-06 | skill:abort      | `"\t"` (タブのみ)     | throw VALIDATION_ERROR | `.trim()` がタブ文字を除去することを検証  |
| 7   | SH-BV-07 | skill:abort      | `" \t\n "` (混合空白) | throw VALIDATION_ERROR | `.trim()` が混合空白を除去することを検証  |
| 8   | SH-BV-08 | skill:get-status | `"\t"` (タブのみ)     | throw VALIDATION_ERROR | `.trim()` がタブ文字を除去することを検証  |
| 9   | SH-BV-09 | skill:get-status | `" \t\n "` (混合空白) | throw VALIDATION_ERROR | `.trim()` が混合空白を除去することを検証  |
| 10  | SH-BV-10 | skill:analyze    | `"\t\n"` (タブ+改行)  | throw VALIDATION_ERROR | `.trim()` がタブ+改行を除去することを検証 |
| 11  | SH-BV-11 | skill:improve    | `"\t\n"` (タブ+改行)  | throw VALIDATION_ERROR | `.trim()` がタブ+改行を除去することを検証 |

#### 2.2 テスト配置先

| テストID     | 配置先ファイル                | セクション         |
| ------------ | ----------------------------- | ------------------ |
| SH-BV-01〜03 | skillHandlers.test.ts         | skill:get-detail内 |
| SH-BV-04〜05 | skillHandlers.execute.test.ts | skill:execute内    |
| SH-BV-06〜07 | skillHandlers.test.ts         | skill:abort内      |
| SH-BV-08〜09 | skillHandlers.test.ts         | skill:get-status内 |
| SH-BV-10     | skillHandlers.improve.test.ts | skill:analyze内    |
| SH-BV-11     | skillHandlers.improve.test.ts | skill:improve内    |

#### 2.3 テスト実装パターン

以下のパターンで各テストを実装する。skill:import の RT-12 テストパターンを参考にする:

```typescript
it("SH-BV-01: should reject tab-only skillId (P42 boundary)", async () => {
  try {
    await handler(mockEvent, { skillId: "\t" });
    throw new Error("Expected VALIDATION_ERROR");
  } catch (error) {
    expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
    expect((error as { message: string }).message).toBe(
      "skillId must be a non-empty string",
    );
  }
});
```

**直接引数型ハンドラ（skill:abort / skill:get-status）の場合:**

```typescript
it("SH-BV-06: should reject tab-only executionId (P42 boundary)", async () => {
  try {
    await handler(mockEvent, "\t");
    throw new Error("Expected VALIDATION_ERROR");
  } catch (error) {
    expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
    expect((error as { message: string }).message).toBe(
      "executionId must be a non-empty string",
    );
  }
});
```

#### 2.4 エッジケーステスト数

- 境界値テスト合計: **11テスト**

---

### Step 3: throw形式エラー伝播テストの追加

#### 3.1 目的

Phase 5 で return 形式から throw 形式に変更した6ハンドラについて、throw されたエラーオブジェクトが以下の2つのプロパティを正確に持つことを個別に検証する:

| プロパティ | 期待値                                                 | 検証目的                               |
| ---------- | ------------------------------------------------------ | -------------------------------------- |
| `code`     | `"VALIDATION_ERROR"` — 文字列完全一致                  | エラーカテゴリが正しいことを確認       |
| `message`  | `"${paramName} must be a non-empty string"` — 完全一致 | パラメータ名が正しく含まれることを確認 |

#### 3.2 各ハンドラの期待エラーメッセージ

| ハンドラ         | パラメータ名 | 期待 message                               |
| ---------------- | ------------ | ------------------------------------------ |
| skill:get-detail | skillId      | `"skillId must be a non-empty string"`     |
| skill:execute    | skillId      | `"skillId must be a non-empty string"`     |
| skill:abort      | executionId  | `"executionId must be a non-empty string"` |
| skill:get-status | executionId  | `"executionId must be a non-empty string"` |
| skill:analyze    | skillName    | `"skillName must be a non-empty string"`   |
| skill:improve    | skillName    | `"skillName must be a non-empty string"`   |

#### 3.3 追加テストケース

以下のテストを `skillHandlers.validation.test.ts` に追加する:

```typescript
describe("throw形式エラー伝播 — code / message プロパティ検証", () => {
  describe.each([
    {
      handler: "skill:get-detail",
      param: "skillId",
      makeArgs: (val: unknown) => ({ skillId: val }),
      expectedMessage: "skillId must be a non-empty string",
    },
    {
      handler: "skill:execute",
      param: "skillId",
      makeArgs: (val: unknown) => ({ skillId: val }),
      expectedMessage: "skillId must be a non-empty string",
    },
    {
      handler: "skill:abort",
      param: "executionId",
      makeArgs: (val: unknown) => val,
      expectedMessage: "executionId must be a non-empty string",
    },
    {
      handler: "skill:get-status",
      param: "executionId",
      makeArgs: (val: unknown) => val,
      expectedMessage: "executionId must be a non-empty string",
    },
    {
      handler: "skill:analyze",
      param: "skillName",
      makeArgs: (val: unknown) => ({ skillName: val }),
      expectedMessage: "skillName must be a non-empty string",
    },
    {
      handler: "skill:improve",
      param: "skillName",
      makeArgs: (val: unknown) => ({ skillName: val }),
      expectedMessage: "skillName must be a non-empty string",
    },
  ])("$handler", ({ makeArgs, expectedMessage }) => {
    it("throw されたエラーオブジェクトの code が VALIDATION_ERROR である", async () => {
      try {
        await handler(mockEvent, makeArgs(""));
        throw new Error("Expected VALIDATION_ERROR");
      } catch (error) {
        expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
      }
    });

    it("throw されたエラーオブジェクトの message がパラメータ名を正確に含む", async () => {
      try {
        await handler(mockEvent, makeArgs("   "));
        throw new Error("Expected VALIDATION_ERROR");
      } catch (error) {
        expect((error as { message: string }).message).toBe(expectedMessage);
      }
    });
  });
});
```

#### 3.4 throw伝播テスト数

- 6ハンドラ x 2テスト（code検証 + message検証） = **12テスト**

---

### Step 4: 既存テストの期待値更新

#### 4.1 修正対象の特定方法

以下のコマンドで、return 形式のバリデーションエラー期待値を使用している既存テストを検索する:

```bash
cd apps/desktop && grep -rn "success: false" src/main/ipc/__tests__/skillHandlers*.test.ts
cd apps/desktop && grep -rn "toEqual(false)" src/main/ipc/__tests__/skillHandlers*.test.ts
cd apps/desktop && grep -rn "toBeNull()" src/main/ipc/__tests__/skillHandlers*.test.ts
cd apps/desktop && grep -rn "toBe(false)" src/main/ipc/__tests__/skillHandlers*.test.ts
```

#### 4.2 修正対象テスト一覧

| #   | テストID | ファイル                      | ハンドラ         | 修正内容                                    |
| --- | -------- | ----------------------------- | ---------------- | ------------------------------------------- |
| 1   | SH-GD-03 | skillHandlers.test.ts         | skill:get-detail | `{ success: false }` → try-catch throw 形式 |
| 2   | TC-4-006 | skillHandlers.execute.test.ts | skill:execute    | `{ success: false }` → try-catch throw 形式 |
| 3   | IPC-02   | skillHandlers.improve.test.ts | skill:analyze    | `{ success: false }` → try-catch throw 形式 |
| 4   | IPC-03   | skillHandlers.improve.test.ts | skill:improve    | `{ success: false }` → try-catch throw 形式 |

#### 4.3 修正パターン

##### パターンA: `{ success: false, error: "..." }` を期待するテスト → throw 形式

```typescript
// ❌ 修正前（return形式を期待）
const result = await handler(mockEvent, { skillId: "" });
expect(result).toEqual({ success: false, error: "skillId must be a string" });

// ✅ 修正後（throw形式を期待）
try {
  await handler(mockEvent, { skillId: "" });
  throw new Error("Expected VALIDATION_ERROR");
} catch (error) {
  expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
  expect((error as { message: string }).message).toBe(
    "skillId must be a non-empty string",
  );
}
```

##### パターンB: `return false` を期待するテスト → throw 形式（skill:abort）

```typescript
// ❌ 修正前
const result = await handler(mockEvent, "");
expect(result).toBe(false);

// ✅ 修正後
try {
  await handler(mockEvent, "");
  throw new Error("Expected VALIDATION_ERROR");
} catch (error) {
  expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
  expect((error as { message: string }).message).toBe(
    "executionId must be a non-empty string",
  );
}
```

##### パターンC: `return null` を期待するテスト → throw 形式（skill:get-status）

```typescript
// ❌ 修正前
const result = await handler(mockEvent, "");
expect(result).toBeNull();

// ✅ 修正後
try {
  await handler(mockEvent, "");
  throw new Error("Expected VALIDATION_ERROR");
} catch (error) {
  expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
  expect((error as { message: string }).message).toBe(
    "executionId must be a non-empty string",
  );
}
```

#### 4.4 修正対象ハンドラと期待値の対応

| ハンドラ         | 修正前の期待値                     | 修正後のエラー code  | 修正後のエラー message                     |
| ---------------- | ---------------------------------- | -------------------- | ------------------------------------------ |
| skill:get-detail | `{ success: false, error: "..." }` | `"VALIDATION_ERROR"` | `"skillId must be a non-empty string"`     |
| skill:execute    | `{ success: false, error: "..." }` | `"VALIDATION_ERROR"` | `"skillId must be a non-empty string"`     |
| skill:abort      | `false`                            | `"VALIDATION_ERROR"` | `"executionId must be a non-empty string"` |
| skill:get-status | `null`                             | `"VALIDATION_ERROR"` | `"executionId must be a non-empty string"` |
| skill:analyze    | `{ success: false, error: "..." }` | `"VALIDATION_ERROR"` | `"skillName must be a non-empty string"`   |
| skill:improve    | `{ success: false, error: "..." }` | `"VALIDATION_ERROR"` | `"skillName must be a non-empty string"`   |

#### 4.5 修正後の確認コマンド

```bash
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers --reporter=verbose
```

**合格基準**: 全テストケースが PASS（0 failed）

---

### Step 5: 正常系テストの回帰確認

#### 5.1 目的

バリデーション変更（return → throw）が正常系の処理フローに影響していないことを確認する。

#### 5.2 回帰確認対象テスト

| #   | ハンドラ         | テストID   | 確認内容                                               |
| --- | ---------------- | ---------- | ------------------------------------------------------ |
| 1   | skill:get-detail | SH-GD-01   | 有効な skillId で正常にスキル詳細が返ること            |
| 2   | skill:get-detail | SH-GD-02   | 存在しない skillId でエラーレスポンスが返ること        |
| 3   | skill:execute    | TC-4-005   | 有効な skillId で正常に実行されること                  |
| 4   | skill:analyze    | IPC-01     | 有効な skillName で正常に分析結果が返ること            |
| 5   | skill:improve    | IPC-04〜07 | 有効な skillName + analysis で正常に改善結果が返ること |

#### 5.3 実行手順

1. `cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers --reporter=verbose` で全テスト実行
2. 上記正常系テストが全て Green であることを確認
3. 失敗するテストがあれば原因を調査（バリデーション変更の副作用か、既存バグかを切り分ける）

#### 5.4 追加テスト数の集計

| カテゴリ                  | テスト数 | 説明                                       |
| ------------------------- | -------- | ------------------------------------------ |
| 境界値テスト（Step 2）    | 11件     | SH-BV-01〜SH-BV-11                         |
| throw伝播テスト（Step 3） | 12件     | 6ハンドラ x 2（code検証 + message検証）    |
| 既存テスト修正（Step 4）  | 4件      | SH-GD-03, TC-4-006, IPC-02, IPC-03（修正） |
| **合計新規追加**          | **23件** | 11 + 12                                    |
| **合計修正**              | **4件**  | 既存テスト期待値更新                       |

---

## 統合テスト連携【必須】

### Renderer側への影響確認

throw形式変更後のテストにより、以下のIPCエラー伝播フローが正しく動作することを間接的に検証する:

```
skillHandlers.ts (throw) → ipcMain.handle (reject) → ipcRenderer.invoke (reject) → safeInvoke (catch)
```

### 回帰テスト

| 確認項目                 | 確認コマンド                                                                                  | 期待結果 |
| ------------------------ | --------------------------------------------------------------------------------------------- | -------- |
| メインテスト             | `cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers.test.ts`             | 全 PASS  |
| skill:execute テスト     | `cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers.execute.test.ts`     | 全 PASS  |
| skill:improve テスト     | `cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers.improve.test.ts`     | 全 PASS  |
| delegate テスト          | `cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers.delegate.test.ts`    | 全 PASS  |
| 統合テスト               | `cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers.integration.test.ts` | 全 PASS  |
| バリデーション専用テスト | `cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers.validation.test.ts`  | 全 PASS  |
| **全テスト一括**         | `cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers`                     | 全 PASS  |

### 統合テストファイルへの影響

| ファイル                          | 影響確認                                                  |
| --------------------------------- | --------------------------------------------------------- |
| skillHandlers.integration.test.ts | バリデーションエラーの形式が throw に変更された影響を確認 |
| skillHandlers.delegate.test.ts    | skill:delegate は対象外だが、共通モック設定の影響を確認   |

---

## 多角的チェック観点

| 観点             | 確認事項                                                                              |
| ---------------- | ------------------------------------------------------------------------------------- |
| エッジケース網羅 | タブ・改行・混合空白の各パターンが全6ハンドラでテストされているか                     |
| throw形式伝播    | throw されたエラーの code / message プロパティが完全一致でアサートされているか        |
| 既存テスト互換   | return → throw 変更に伴う期待値修正が全4箇所で完了しているか                          |
| 正常系回帰       | バリデーション変更が正常系テスト（SH-GD-01, TC-4-005, IPC-01等）に影響していないか    |
| テスト実行環境   | `cd apps/desktop` から実行しているか（P40準拠）                                       |
| テスト独立性     | テスト間で状態を共有していないか（P9準拠 — `beforeEach` でリセット）                  |
| テスト環境互換   | happy-dom 環境で userEvent を使用していないか（P39準拠）                              |
| P41対策          | Function Coverage 低下がインライン関数（validateIpcSender等）に起因する場合は記録する |

---

## 成果物

| #   | 成果物                                     | パス                                                                                                      | 形式       |
| --- | ------------------------------------------ | --------------------------------------------------------------------------------------------------------- | ---------- |
| 1   | カバレッジ不足箇所分析レポート             | `docs/30-workflows/completed-tasks/skill-validation-consistency/outputs/phase-6/coverage-gap-analysis.md` | Markdown   |
| 2   | skillHandlers.test.ts（修正+追加）         | `apps/desktop/src/main/ipc/__tests__/skillHandlers.test.ts`                                               | TypeScript |
| 3   | skillHandlers.execute.test.ts（修正+追加） | `apps/desktop/src/main/ipc/__tests__/skillHandlers.execute.test.ts`                                       | TypeScript |
| 4   | skillHandlers.improve.test.ts（修正+追加） | `apps/desktop/src/main/ipc/__tests__/skillHandlers.improve.test.ts`                                       | TypeScript |
| 5   | skillHandlers.validation.test.ts（追加）   | `apps/desktop/src/main/ipc/__tests__/skillHandlers.validation.test.ts`                                    | TypeScript |

---

## 完了条件チェックリスト

- [ ] Step 1: カバレッジ不足箇所が特定・分類されている（`outputs/phase-6/coverage-gap-analysis.md` に記録）
- [ ] Step 2: 境界値テスト11件（SH-BV-01〜SH-BV-11）が全て追加されている
- [ ] Step 3: throw形式エラー伝播テスト12件（6ハンドラ x 2 検証項目）が追加されている
- [ ] Step 4: 既存テスト4件（SH-GD-03, TC-4-006, IPC-02, IPC-03）の期待値が throw 形式に更新されている
- [ ] Step 5: 正常系テスト（SH-GD-01〜02, TC-4-005, IPC-01, IPC-04〜07）が全て Green であること
- [ ] 全テストファイル（6ファイル）で全テストが PASS している（0 failed）
- [ ] テスト間で状態を共有していない（`beforeEach` でリセット — P9準拠）
- [ ] テスト実行は `cd apps/desktop` から行っている（P40準拠）
- [ ] `cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers --reporter=verbose` で全テスト PASS

---

## 次のPhase

-> Phase 7: カバレッジ確認（`phase-7-coverage-check.md`）
