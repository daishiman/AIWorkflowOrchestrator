---
id: UT-FIX-SKILL-EXECUTE-INTERFACE-001
title: "skill:execute IPCハンドラ・Preloadインターフェース不整合修正"
tier: 2
depends_on: []
status: pending
priority: high
estimated_complexity: medium
tags: [backend, ipc, preload, bug-fix, P44, P45, P42, skill-execution]
---

# skill:execute IPCハンドラ・Preloadインターフェース不整合修正

## 1. Why（なぜ必要か）

### 1.1 背景

skill:execute の IPC ハンドラ（`skillHandlers.ts:215-248`）が期待する引数形式と、Preload 側（`skill-api.ts:223-224`）が実際に送信する引数形式が乖離しており、スキル実行が 100% 失敗する。P44（skill:import/remove インターフェース不整合）と同根異形のパターンである。P44 は「オブジェクト期待 vs 文字列送信」だったが、skill:execute は「同じオブジェクトだがフィールド名が異なる（`skillId` vs `skillName`）」という不整合であり、IPC 契約ドリフト（P45）の典型例でもある。

### 1.2 問題点

**引数形式の不整合（P44パターン）**:

| 層                                         | 期待する形式                                            | 実際に渡される形式                                                                       |
| ------------------------------------------ | ------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| **Main ハンドラ** (`skillHandlers.ts:220`) | `{ skillId: string; params?: Record<string, unknown> }` | —                                                                                        |
| **Preload** (`skill-api.ts:223-224`)       | —                                                       | `SkillExecutionRequest { skillName: string; prompt: string; workingDirectory?: string }` |

**結果**: ハンドラが `args.skillId` を参照 → 受信オブジェクトに `skillId` フィールドがない → `undefined` → バリデーション `typeof args?.skillId !== "string"` が true → `VALIDATION_ERROR: skillId must be a non-empty string`

**命名の契約ドリフト（P45パターン）**:

- ハンドラ: `skillId` を期待
- `@repo/shared` 型定義: `skillName` を使用（`packages/shared/src/types/skill.ts:306-315`）
- SkillExecutor ローカル型定義: `skillId` を使用（`apps/desktop/src/main/services/skill/SkillExecutor.ts:68-76`）

**型定義の三重定義（P32パターン拡張）**:

| 定義箇所                                                      | 型名                                | フィールド                                            |
| ------------------------------------------------------------- | ----------------------------------- | ----------------------------------------------------- |
| `packages/shared/src/types/skill.ts:306-315`                  | `SkillExecutionRequest`             | `skillName, prompt, workingDirectory?`                |
| `apps/desktop/src/main/services/skill/SkillExecutor.ts:68-76` | `SkillExecutionRequest`（ローカル） | `skillId, prompt, timeout?, sessionId?, retryConfig?` |
| `apps/desktop/src/main/ipc/skillHandlers.ts:220`              | インライン型                        | `{ skillId, params? }`                                |

### 1.3 放置した場合の影響

- Renderer から `electronAPI.skill.execute()` を呼び出すスキル実行が **100% 失敗**し続ける
- skill:import/remove で P44 を解決済みにもかかわらず、同一パターンが skill:execute に残存する
- SkillExecutor のローカル `SkillExecutionRequest` と `@repo/shared` の同名型が共存し、将来の型統合時に混乱が拡大する

---

## 2. What（何をするか）

### 2.1 目的

skill:execute の IPC ハンドラを Preload 側の送信形式（`@repo/shared` の `SkillExecutionRequest`）に合わせ、P42 準拠の 3 段バリデーションを適用する。P44/P45 を解消し、スキル実行を正常動作させる。

### 2.2 最終ゴール

- Renderer から `electronAPI.skill.execute({ skillName: "my-skill", prompt: "..." })` を呼び出すと、Main Process で正常にスキルが実行される
- ハンドラの引数型が `@repo/shared` の `SkillExecutionRequest` と一致する
- P42 準拠の 3 段バリデーション（型チェック → 空文字列 → トリム空文字列）が `skillName` に適用されている
- 既存テストが全 PASS し、新規テストが不整合修正をカバーする

### 2.3 スコープ

#### 含むもの

- `skillHandlers.ts` の skill:execute ハンドラ引数形式修正
- ハンドラ内バリデーションの `skillId` → `skillName` 変更
- `skillService.executeSkill()` 呼び出しの引数修正
- ハンドラのテスト修正・追加
- Preload 側の型整合性確認（変更が不要であることの検証）

#### 含まないもの

- `SkillExecutor.ts` のローカル `SkillExecutionRequest` 型の `@repo/shared` 型への統合（別タスクとして切り出し）
- `SkillService.executeSkill()` の内部実装変更（シグネチャ変更が必要な場合のみスコープに含める）
- skill:execute の応答型（`{ success, data }` vs `SkillExecutionResponse`）の統一（別タスク候補）
- 他の IPC チャネルの修正

### 2.4 成果物

| 成果物           | パス                                                                        |
| ---------------- | --------------------------------------------------------------------------- |
| ハンドラ修正     | `apps/desktop/src/main/ipc/skillHandlers.ts`                                |
| テスト修正・追加 | `apps/desktop/src/main/ipc/__tests__/skillHandlers.test.ts`（該当ファイル） |

---

## 3. How（どう実現するか）

### 3.1 前提条件

- `@repo/shared` の `SkillExecutionRequest` 型が正本であること
- `skillService.executeSkill()` のシグネチャを確認し、引数の変換が必要か判断すること
- P44 解決済みの skill:import/remove の修正パターンを踏襲すること

### 3.2 依存タスク

| タスクID                                | 関係 | 説明                                             |
| --------------------------------------- | ---- | ------------------------------------------------ |
| UT-FIX-SKILL-IMPORT-INTERFACE-001       | 参考 | skill:import の同一パターン修正（解決済み）      |
| UT-FIX-SKILL-REMOVE-INTERFACE-001       | 参考 | skill:remove の同一パターン修正（解決済み）      |
| UT-FIX-SKILL-VALIDATION-CONSISTENCY-001 | 参考 | 6ハンドラ P42 準拠バリデーション統一（解決済み） |

### 3.3 必要な知識

- P44（IPC インターフェース不整合）パターンと解決方法
- P42（.trim() バリデーション）3段バリデーション
- P45（IPC 引数命名の契約ドリフト）セマンティクス一致原則
- `safeInvoke` 経由の IPC 引数受け渡しの仕組み

### 3.4 推奨アプローチ

**ハンドラ引数を `@repo/shared` の `SkillExecutionRequest` に合わせる**:

```typescript
// ❌ 現在（不整合）
ipcMain.handle(
  IPC_CHANNELS.SKILL_EXECUTE,
  async (
    event: IpcMainInvokeEvent,
    args: { skillId: string; params?: Record<string, unknown> },
  ) => {
    if (typeof args?.skillId !== "string" || args.skillId.trim() === "") {
      throw {
        code: "VALIDATION_ERROR",
        message: "skillId must be a non-empty string",
      };
    }
    const result = await skillService.executeSkill(args.skillId, args.params);
  },
);

// ✅ 修正後（Preload側と一致）
ipcMain.handle(
  IPC_CHANNELS.SKILL_EXECUTE,
  async (
    event: IpcMainInvokeEvent,
    args: SkillExecutionRequest, // @repo/shared から import
  ) => {
    // P42準拠3段バリデーション（skillName）
    if (typeof args?.skillName !== "string" || args.skillName.trim() === "") {
      throw {
        code: "VALIDATION_ERROR",
        message: "skillName must be a non-empty string",
      };
    }
    if (typeof args?.prompt !== "string" || args.prompt.trim() === "") {
      throw {
        code: "VALIDATION_ERROR",
        message: "prompt must be a non-empty string",
      };
    }
    // skillService.executeSkill() は第1引数に skillId を期待するが、
    // ここでは skillName を渡す。内部の getSkillById() が名前ベースで
    // 検索するか確認が必要（課題4参照）
    const result = await skillService.executeSkill(args.skillName, {
      prompt: args.prompt,
    });
  },
);
```

### 3.5 実装課題と解決策

#### 課題1: `skillService.executeSkill()` のシグネチャと内部検索ロジック

- **問題**: `SkillService.executeSkill(skillId, params)` は第1引数を `skillId` として受け取り、内部で `getSkillById(skillId)` と `importManager.isImported(skillId)` を呼んでいる（`SkillService.ts:180-229`）。修正後に `skillName` を `skillId` パラメータに渡すと、**ID ベースの検索が名前ベースの値で実行される**ため、スキルが見つからない可能性がある
- **解決策**: 以下の2つのアプローチから選択する:
  - **A（推奨）**: ハンドラ内で `skillName` → スキル検索 → `skillId` 取得 → `executeSkill(skillId, params)` と変換する
  - **B**: `executeSkill` のシグネチャを `skillName` ベースに変更する（スコープ拡大だが根本解決）

#### 課題2: SkillExecutor ローカル型との変換

- **問題**: `SkillExecutor.ts:68-76` のローカル `SkillExecutionRequest` は `skillId` フィールドを使用している。ハンドラ修正後、`skillName` → `skillId` の変換が必要
- **解決策**: ハンドラまたは SkillService 内で `@repo/shared` の `SkillExecutionRequest.skillName` を `SkillExecutor` のローカル型 `skillId` にマッピングする。ローカル型の統合は別タスクとする

#### 課題3: テストモックの修正

- **問題**: 既存テストが `{ skillId: "test-skill" }` 形式でハンドラを呼び出している。テストファイルは `skillHandlers.execute.test.ts`、`skillHandlers.validation.test.ts`、`skillHandlers.delegate.test.ts`、`skillIpc.integration.test.ts` の4ファイル
- **解決策**: テスト内の呼び出しを `{ skillName: "test-skill", prompt: "test prompt" }` 形式に変更する

#### 課題4: `getSkillById()` と `skillName` のセマンティクス不一致

- **問題**: `SkillService.executeSkill()` 内部で `getSkillById(skillId)` を呼んでいるが、Preload から渡されるのは `skillName`（スキル名）であり `skillId`（ハッシュ値）ではない。P44（skill:import で `skill.id` を `skillName` として渡して100%失敗した事例）の再発リスク
- **解決策**: Step 1 で `getSkillById()` の実装を確認し、名前ベースで検索可能かを判断する。不可能な場合は `getSkillByName()` メソッドの追加、または `skillList` から名前で検索するロジックをハンドラ内に実装する

---

## 4. Steps（実行手順）

### Step 1: 影響範囲の確認

1. `skillService.executeSkill()` のシグネチャと内部処理を確認
2. `getSkillById()` の実装を確認し、`skillName` を渡した場合の動作を検証（課題4）
3. `grep -rn "skill:execute\|SKILL_EXECUTE" apps/desktop/src/` で全使用箇所を特定
4. 既存テストファイルで skill:execute に関連するテストケースを確認（4ファイル: execute, validation, delegate, integration）

### Step 2: ハンドラ引数形式の修正

1. `skillHandlers.ts` の skill:execute ハンドラの `args` 型を `SkillExecutionRequest`（`@repo/shared`）に変更
2. P42 準拠 3 段バリデーションを `skillName` と `prompt` に適用
3. `skillService.executeSkill()` 呼び出しの引数を修正

### Step 3: テスト修正・追加

1. 既存テストの引数形式を `{ skillName, prompt }` に変更
2. 以下のテストケースを追加:
   - `skillName` が空文字列の場合にバリデーションエラー
   - `skillName` がスペースのみの場合にバリデーションエラー（P42）
   - `prompt` が空文字列の場合にバリデーションエラー
   - 正常な `SkillExecutionRequest` でスキル実行が成功

### Step 4: 型整合性の検証

1. `pnpm typecheck` で型エラーがないことを確認
2. Preload 側（`skill-api.ts`）に変更が不要であることを確認

### Step 5: 全テスト実行

1. `pnpm --filter @repo/desktop test` で全テスト PASS を確認
2. `pnpm lint` で lint エラーがないことを確認

---

## 5. Checklist（チェックリスト）

### コード修正

- [ ] `skillHandlers.ts` の skill:execute ハンドラ引数型を `SkillExecutionRequest`（`@repo/shared`）に変更
- [ ] バリデーションエラーメッセージが `skillName` を参照している
- [ ] `prompt` フィールドにも P42 準拠バリデーションが適用されている
- [ ] `skillService.executeSkill()` 呼び出しの引数が修正されている
- [ ] `@repo/shared` から `SkillExecutionRequest` を import している

### テスト

- [ ] 既存テストの引数形式が `{ skillName, prompt }` に更新されている
- [ ] `skillName` 空文字列テストが存在する
- [ ] `skillName` トリム空文字列テストが存在する（P42）
- [ ] `prompt` 空文字列テストが存在する
- [ ] 正常系テストが `SkillExecutionRequest` 形式で呼び出している

### 品質

- [ ] `pnpm typecheck` PASS
- [ ] `pnpm lint` PASS
- [ ] 関連テスト全 PASS

---

## 6. Verification（検証方法）

```bash
# 型チェック
pnpm typecheck

# skill:execute 関連テストの実行
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers

# 全テスト実行
pnpm --filter @repo/desktop test

# lint チェック
pnpm lint

# 修正確認: skillId がハンドラに残っていないことを確認
grep -rn "skillId" apps/desktop/src/main/ipc/skillHandlers.ts
# → skill:execute ハンドラ内に "skillId" が残存していないこと
```

---

## 7. Risks（リスクと対策）

| リスク                                                        | 影響度 | 発生確率 | 対策                                                                                                    |
| ------------------------------------------------------------- | ------ | -------- | ------------------------------------------------------------------------------------------------------- |
| `skillService.executeSkill()` のシグネチャ変更が必要          | 中     | 中       | Step 1 で事前確認し、変更が大きい場合はスコープを再評価                                                 |
| `getSkillById(skillName)` で検索失敗（P44 skill:import 再発） | **高** | **高**   | Step 1 で `getSkillById` の検索ロジックを確認。名前検索不可なら変換ロジックをハンドラ内に実装（課題4）  |
| SkillExecutor ローカル型との変換で情報欠落                    | 中     | 低       | `@repo/shared` の `SkillExecutionRequest` フィールドが SkillExecutor に正しくマッピングされることを確認 |
| 既存テストの修正漏れ（4ファイル）                             | 低     | 中       | `grep -rn "skillId.*execute\|SKILL_EXECUTE" apps/desktop/src/` で全箇所を事前に特定                     |
| `prompt` バリデーション追加による既存フローへの影響           | 低     | 低       | 既存の Renderer 呼び出し元（`agentSlice`, `AgentView`）が必ず `prompt` を含んでいることを確認済み       |

---

## 8. References（参照）

| ドキュメント                | パス                                                                          |
| --------------------------- | ----------------------------------------------------------------------------- |
| P44（IPC不整合）            | `.claude/rules/06-known-pitfalls.md#P44`                                      |
| P45（引数命名ドリフト）     | `.claude/rules/06-known-pitfalls.md#P45`                                      |
| P42（trimバリデーション）   | `.claude/rules/06-known-pitfalls.md#P42`                                      |
| P32（型定義二箇所更新）     | `.claude/rules/06-known-pitfalls.md#P32`                                      |
| IPC契約チェックリスト       | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md` |
| セキュリティルール          | `.claude/rules/04-electron-security.md`                                       |
| SkillExecutionRequest型定義 | `packages/shared/src/types/skill.ts:306-315`                                  |
| skillHandlers.ts            | `apps/desktop/src/main/ipc/skillHandlers.ts:215-248`                          |
| skill-api.ts                | `apps/desktop/src/preload/skill-api.ts:223-224`                               |
| SkillExecutor型定義         | `apps/desktop/src/main/services/skill/SkillExecutor.ts:68-76`                 |

### 関連タスク

| タスクID                                | 関係 | 説明                                        |
| --------------------------------------- | ---- | ------------------------------------------- |
| UT-FIX-SKILL-IMPORT-INTERFACE-001       | 参考 | skill:import P44修正（解決済み）            |
| UT-FIX-SKILL-REMOVE-INTERFACE-001       | 参考 | skill:remove P44修正（解決済み）            |
| UT-FIX-SKILL-VALIDATION-CONSISTENCY-001 | 参考 | 6ハンドラ P42バリデーション統一（解決済み） |
| UT-SKILL-IPC-PRELOAD-EXTENSION-001      | 関連 | 30チャネル IPC/Preload 拡張計画（pending）  |

---

## 9. Notes（補足）

### 未タスク候補

本タスクの実装中に以下の未タスク候補が検出される可能性がある:

| 候補                                            | 説明                                                                                                                                                         |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| SkillExecutor ローカル型統合                    | `SkillExecutor.ts:68-76` のローカル `SkillExecutionRequest` を `@repo/shared` の型に統合する                                                                 |
| skill:execute 応答型統一                        | ハンドラの `{ success, data }` ラッパーと `SkillExecutionResponse` 型の統一                                                                                  |
| `useSkillExecution.ts` セマンティクス不整合修正 | `useSkillExecution.ts:134` で `skillName: skillId` と記述されており、変数名 `skillId` の値がスキル名として使用されている。P45 パターンの Renderer 側残存箇所 |
| `skill:get-detail` ハンドラ P44 同パターン修正  | `skill:get-detail` ハンドラがオブジェクト形式の引数を期待している可能性がある。skill:execute と同一の P44 パターンが存在する場合、同時修正が望ましい         |

### P44 解決済みチャネルとの対比

| チャネル          | 修正前の問題                                                     | 修正方法                                      | ステータス      |
| ----------------- | ---------------------------------------------------------------- | --------------------------------------------- | --------------- |
| skill:import      | `{ skillIds: string[] }` を期待、`string` が送信                 | ハンドラを `string` に変更                    | ✅ 解決済み     |
| skill:remove      | `{ skillId: string }` を期待、`string` が送信                    | ハンドラを `string` に変更                    | ✅ 解決済み     |
| **skill:execute** | **`{ skillId, params }` を期待、`SkillExecutionRequest` が送信** | **ハンドラを `SkillExecutionRequest` に変更** | **⬜ 本タスク** |
