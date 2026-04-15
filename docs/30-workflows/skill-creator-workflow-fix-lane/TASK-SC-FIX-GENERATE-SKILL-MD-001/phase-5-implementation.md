# Phase 5: 実装計画

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 5                                 |
| Phase名    | 実装計画                          |
| 対象機能   | TASK-SC-FIX-GENERATE-SKILL-MD-001 |
| 前提Phase  | Phase 4: テスト設計               |
| 次Phase    | Phase 6: テスト拡充（スコープ外） |
| ステータス | pending                           |
| 作成日     | 2026-04-14                        |

## 目的

Phase 4 で定義した fail-first テスト（TC-01〜TC-07）を pass に反転させるための
具体的な実装ステップを確定する。変更ファイルと変更行番号を明示する。

## 実行タスク

### Task 1: import 追加 — SkillCreatorService.ts

**変更ファイル**: `apps/desktop/src/main/services/skill/SkillCreatorService.ts`

**変更箇所**: 先頭の import ブロック（行 8-9 付近）

**変更内容**:

```typescript
// 変更前（行 8-9）
import path from "path";
import fs from "fs/promises";

// 変更後
import os from "os";
import path from "path";
import fs from "fs/promises";
```

`os` モジュールは Node.js 標準ライブラリのため、外部パッケージのインストールは不要。

### Task 2: SKILL.md 生成ブロックの置き換え — SkillCreatorService.ts

**変更ファイル**: `apps/desktop/src/main/services/skill/SkillCreatorService.ts`

**変更箇所**: 行 154-165（コメント「// SKILL.md生成」から閉じ括弧まで）

**変更前**:

```typescript
// SKILL.md生成
const generateResult = await this.scriptExecutor.execute(
  "generate_skill_md.js",
  ["--path", skillDir],
);
if (!generateResult.success) {
  await this.ensureSkillMdExists(skillDir, options.name, options.description);
}
```

**変更後**:

```typescript
// SKILL.md生成
const tmpPlanPath = path.join(os.tmpdir(), `skill-plan-${Date.now()}.json`);
try {
  const plan = {
    name: options.name,
    description: options.description,
    tasks: [],
  };
  await fs.writeFile(tmpPlanPath, JSON.stringify(plan), "utf-8");
  const generateResult = await this.scriptExecutor.execute(
    "generate_skill_md.js",
    ["--plan", tmpPlanPath, "--output", path.join(skillDir, "SKILL.md")],
  );
  if (!generateResult.success) {
    await this.ensureSkillMdExists(skillDir, options.name, options.description);
  }
} finally {
  await fs.unlink(tmpPlanPath).catch(() => {});
}
```

**行番号の変化**:

- 変更前: 行 154-165（12行）
- 変更後: 行 154-178 程度（+14行、try/finally と plan 変数宣言の追加分）
- 以降の行番号は 14 行後ろにずれる

### Task 3: テスト更新 — SkillCreatorService.test.ts

**変更ファイル**: `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts`

**変更内容**:

1. `fs` モジュールのモック追加：
   - `vi.mock("fs/promises")` で `writeFile` と `unlink` をスパイ可能にする
   - または既存のモック設定がある場合はそれを拡張する

2. TC-01〜TC-03 の追加（`--plan` / `--output` 引数検証）：

   ```typescript
   it("generate_skill_md.js を --plan と --output 引数で呼び出す", async () => {
     // arrange: scriptExecutor.execute を成功モックに設定
     // act: createSkill を呼び出す
     // assert: execute の第2引数に "--plan" と "--output" が含まれる
     // assert: "--path" が含まれない
   });
   ```

3. TC-04〜TC-05 の追加（フォールバック動作）：

   ```typescript
   it("generate_skill_md.js が失敗した場合に ensureSkillMdExists を呼ぶ", async () => {
     // arrange: execute を { success: false } で返すようモック
     // act: createSkill を呼び出す
     // assert: ensureSkillMdExists が呼ばれる
   });
   ```

4. TC-06〜TC-07 の追加（finally cleanup）：

   ```typescript
   it("スクリプト成功時に tmp json ファイルを削除する", async () => {
     // arrange: execute を成功モック、fs.unlink をスパイ
     // act: createSkill を呼び出す
     // assert: fs.unlink が tmpPlanPath で呼ばれる
   });

   it("スクリプト失敗時も tmp json ファイルを削除する", async () => {
     // arrange: execute を失敗モック、fs.unlink をスパイ
     // act: createSkill を呼び出す
     // assert: fs.unlink が呼ばれる
   });
   ```

### Task 4: 動作確認手順

実装完了後に以下を実行して全テストがパスすることを確認する：

```bash
# SkillCreatorService のテストのみ実行
pnpm --filter @repo/desktop test -- --testPathPattern="SkillCreatorService"

# 型チェック（import os の型解決確認）
pnpm --filter @repo/desktop typecheck

# Lint チェック
pnpm --filter @repo/desktop lint
```

## 変更ファイルと行番号サマリ

| ファイル                                                                     | 変更種別 | 対象行（変更前） | 内容                                           |
| ---------------------------------------------------------------------------- | -------- | ---------------- | ---------------------------------------------- |
| `apps/desktop/src/main/services/skill/SkillCreatorService.ts`                | 修正     | 行 8-9（import） | `import os from "os"` を追加                   |
| `apps/desktop/src/main/services/skill/SkillCreatorService.ts`                | 修正     | 行 154-165       | `--path` → `--plan` / `--output` + try/finally |
| `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts` | 修正     | 既存テスト末尾   | TC-01〜TC-07 のテストケース追加                |

## 参照資料

| 資料名              | パス                                                                         | 説明            |
| ------------------- | ---------------------------------------------------------------------------- | --------------- |
| 設計書              | `phase-2-design.md`                                                          | 修正方針        |
| テスト設計書        | `phase-4-test-creation.md`                                                   | fail-first 対象 |
| SkillCreatorService | `apps/desktop/src/main/services/skill/SkillCreatorService.ts`                | 修正対象        |
| 既存テスト          | `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts` | 更新対象        |

## 統合テスト連携

- Phase 4 で定義した fail-first ケース（TC-01〜TC-07）を pass に反転させる
- 既存テストが破壊されていないことをテスト実行で確認する

## 成果物

| 成果物     | パス                                     | 説明                       |
| ---------- | ---------------------------------------- | -------------------------- |
| 実装計画書 | `outputs/phase-5/implementation-plan.md` | 変更ファイル・行番号・手順 |

## 完了条件

- [ ] import 追加（`os`）の実装ステップが記述されている
- [ ] 行 154-165 の置き換え差分が明示されている
- [ ] テストファイルへの追加内容（TC-01〜TC-07）が記述されている
- [ ] 動作確認コマンドが記載されている
- [ ] 本 Phase 内の全タスクを 100% 実行完了

## タスク 100% 実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase 末端で各タスクを 100% 完了し、完了を明記している

## 次 Phase

→ Phase 6: テスト拡充（本仕様書のスコープ外）
