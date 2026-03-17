# Phase 2: 設計

## メタ情報

| 項目     | 値                                                |
| -------- | ------------------------------------------------- |
| Phase    | 2                                                 |
| タスクID | TASK-IMP-IPC-LAYER-INTEGRITY-FIX-001              |
| 機能名   | skill-lifecycle-routing / ipc-layer-integrity-fix |
| 作成日   | 2026-03-17                                        |
| 前Phase  | [Phase 1: 要件定義](./phase-1-requirements.md)    |

## 目的

Phase 1 で確定した受入基準に基づき、IPC層不整合修正の具体的な設計を定義する。IPC契約チェックリスト Phase 1-6 の観点でハンドラ・Preload API・型定義・バリデーションの設計を決定する。

## 実行タスク

- IPC契約設計: SKILL_UPDATE ハンドラと SKILL_GET_DETAIL Preload API の契約を定義する
- バリデーション設計: P42準拠3段バリデーションの実装パターンを定義する
- 型定義設計: 引数・戻り値の型定義とP32準拠の二箇所同時更新計画を定義する
- ファイル変更計画: 変更対象ファイルと変更内容を決定する
- テスト設計方針: Phase 4 で作成するテストケースの方針を定義する

## 参照資料

### 一般

| 資料名                | パス                                                                          | 説明                      |
| --------------------- | ----------------------------------------------------------------------------- | ------------------------- |
| Phase 1 要件定義      | `outputs/phase-1/requirements.md`                                             | 確定した受入基準          |
| 現状調査結果          | `outputs/phase-1/current-state-survey.md`                                     | 既存コードの実装状態      |
| IPC契約チェックリスト | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md` | Phase 1-6 チェック項目    |
| 既知の落とし穴        | `.claude/rules/06-known-pitfalls.md`                                          | P42/P44/P45/P32/P5 の詳細 |
| セキュリティルール    | `.claude/rules/04-electron-security.md`                                       | IPC セキュリティ原則      |

### システム仕様（aiworkflow-requirements）

| 資料名                     | パス                                                                                        | 説明                        |
| -------------------------- | ------------------------------------------------------------------------------------------- | --------------------------- |
| IPC API仕様                | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                        | スキルIPC チャンネル定義    |
| スキルIPCセキュリティ      | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                   | IPCチャンネル検証テーブル   |
| Electron IPCセキュリティ   | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | IPC全般のセキュリティ原則   |
| スキルインターフェース定義 | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | SkillAPI型定義・統一API仕様 |
| アーキテクチャ概要         | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                | IPCハンドラ登録一覧         |
| 実装パターン               | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | IPC実装パターン集           |

## IPC契約設計

### 契約設計方針（IPC契約チェックリスト Phase 1-6 準拠）

#### Phase 1: 変更前の契約確認

変更前に以下の4箇所を確認する。

| 確認箇所                                                              | SKILL_UPDATE              | SKILL_GET_DETAIL          |
| --------------------------------------------------------------------- | ------------------------- | ------------------------- |
| Main Process ハンドラ（`apps/desktop/src/main/ipc/skillHandlers.ts`） | **存在しない** → 新規追加 | 実装済み（L242）          |
| Preload API（`apps/desktop/src/preload/skill-api.ts`）                | **存在しない** → 新規追加 | **存在しない** → 新規追加 |
| Preload 型定義（`apps/desktop/src/preload/types.ts`）                 | 更新が必要か確認          | 更新が必要か確認          |
| Shared 型定義（`packages/shared/src/ipc/channels.ts`）                | 定数あり（確認のみ）      | 定数あり（確認のみ）      |

#### SKILL_UPDATE ハンドラの設計

```typescript
// apps/desktop/src/main/ipc/skillHandlers.ts
ipcMain.handle(
  IPC_CHANNELS.SKILL_UPDATE,
  async (event, skillName: string, updates: Record<string, unknown>) => {
    // セキュリティ: 送信元ウィンドウ検証
    validateIpcSender(event);

    // P42準拠 3段バリデーション（skillName）
    if (
      typeof skillName !== "string" ||
      skillName === "" ||
      skillName.trim() === ""
    ) {
      throw {
        code: "VALIDATION_ERROR",
        message: "skillName must be a non-empty string",
      };
    }

    // updates のバリデーション
    if (
      updates === null ||
      typeof updates !== "object" ||
      Array.isArray(updates)
    ) {
      throw {
        code: "VALIDATION_ERROR",
        message: "updates must be a non-null object",
      };
    }

    return skillService.updateSkill(skillName, updates);
  },
);
```

**設計上の注意**:

- 引数命名を `skillName`（P45準拠: セマンティクスに一致する命名）とする
- `updates` の型はオープンな `Record<string, unknown>` として定義し、具体的なスキーマはサービス層で検証する
- `skillService.updateSkill()` が未実装の場合は、Phase 5 で実装スタブを追加する

#### SKILL_GET_DETAIL Preload API の設計

```typescript
// apps/desktop/src/preload/skill-api.ts
getDetail: (skillId: string) => {
  // P42準拠 3段バリデーション（Preload層での早期拒否）
  if (
    typeof skillId !== "string" ||
    skillId === "" ||
    skillId.trim() === ""
  ) {
    return Promise.reject({
      code: "VALIDATION_ERROR",
      message: "skillId must be a non-empty string",
    });
  }
  return safeInvoke(IPC_CHANNELS.SKILL_GET_DETAIL, skillId);
},
```

**設計上の注意**:

- 既存の `skillHandlers.ts` L242 のハンドラは `skillId` を引数として受け取ることを前提とする
- Phase 1 の現状調査でハンドラの実際の引数名を確認し、Preload 側と整合させる（P45対策）

#### SKILL_UPDATE Preload API の設計

```typescript
// apps/desktop/src/preload/skill-api.ts
update: (skillName: string, updates: Record<string, unknown>) => {
  // P42準拠 3段バリデーション（Preload層での早期拒否）
  if (
    typeof skillName !== "string" ||
    skillName === "" ||
    skillName.trim() === ""
  ) {
    return Promise.reject({
      code: "VALIDATION_ERROR",
      message: "skillName must be a non-empty string",
    });
  }
  if (updates === null || typeof updates !== "object" || Array.isArray(updates)) {
    return Promise.reject({
      code: "VALIDATION_ERROR",
      message: "updates must be a non-null object",
    });
  }
  return safeInvoke(IPC_CHANNELS.SKILL_UPDATE, skillName, updates);
},
```

### unregister 設計

`unregisterSkillHandlers()` への追加:

```typescript
// apps/desktop/src/main/ipc/skillHandlers.ts — unregisterSkillHandlers 内
ipcMain.removeHandler(IPC_CHANNELS.SKILL_UPDATE);
```

P5準拠: 二重登録防止のため、`registerSkillHandlers()` 呼び出し前に `unregisterSkillHandlers()` を実行するパターンを維持する。

## バリデーション設計

### P42準拠3段バリデーション標準パターン

本タスクで実装する全文字列引数に適用する標準パターン:

```typescript
// 標準パターン（コピー&ペーストして使用）
if (typeof value !== "string" || value === "" || value.trim() === "") {
  throw {
    code: "VALIDATION_ERROR",
    message: "value must be a non-empty string", // 変数名に合わせて変更
  };
}
```

### バリデーション適用箇所一覧

| 箇所                                     | 変数名      | バリデーション種別              |
| ---------------------------------------- | ----------- | ------------------------------- |
| skillHandlers.ts — SKILL_UPDATE ハンドラ | `skillName` | P42準拠3段                      |
| skill-api.ts — `getDetail()` メソッド    | `skillId`   | P42準拠3段（Preload側早期拒否） |
| skill-api.ts — `update()` メソッド       | `skillName` | P42準拠3段（Preload側早期拒否） |

### エラーコード設計

| エラー種別         | コード             | カテゴリ                   | リトライ |
| ------------------ | ------------------ | -------------------------- | -------- |
| バリデーション失敗 | `VALIDATION_ERROR` | 1000-1999 (Validation)     | 不可     |
| スキル未存在       | `SKILL_NOT_FOUND`  | 2000-2999 (Business)       | 不可     |
| 更新失敗           | `UPDATE_FAILED`    | 4000-4999 (Infrastructure) | 可能     |

## 型定義設計

### P32準拠: 二箇所同時更新計画

型定義の変更が必要な場合、以下の2ファイルを同時に更新する。

| ファイル                              | 更新内容                                        | 優先度   |
| ------------------------------------- | ----------------------------------------------- | -------- |
| `packages/shared/src/ipc/channels.ts` | チャンネル定数の確認・必要な場合のみ更新        | 確認のみ |
| `apps/desktop/src/preload/types.ts`   | SkillAPI の型定義に `getDetail`/`update` を追加 | 必須     |

### 型定義の追加内容（暫定）

```typescript
// apps/desktop/src/preload/types.ts — SkillAPI インターフェースへの追加
interface SkillAPI {
  // ... 既存メソッド ...
  getDetail: (skillId: string) => Promise<SkillDetail | null>; // 戻り値型は skillHandlers.ts L242 を確認して確定
  update: (
    skillName: string,
    updates: Record<string, unknown>,
  ) => Promise<void>; // 戻り値型は実装に合わせて確定
}
```

**注意**: 具体的な戻り値型（`SkillDetail` など）は Phase 1 の現状調査で `skillHandlers.ts` L242 の実装を確認してから確定する。P23準拠で型定義の乖離を防ぐ。

## ファイル変更計画

### Lane 1: Main Process ハンドラ

| ファイル                                     | 変更内容                                                                       | 変更規模 |
| -------------------------------------------- | ------------------------------------------------------------------------------ | -------- |
| `apps/desktop/src/main/ipc/skillHandlers.ts` | `ipcMain.handle(IPC_CHANNELS.SKILL_UPDATE, ...)` 追加                          | 小       |
| `apps/desktop/src/main/ipc/skillHandlers.ts` | `unregisterSkillHandlers()` に `removeHandler(IPC_CHANNELS.SKILL_UPDATE)` 追加 | 小       |

### Lane 2: Preload API

| ファイル                                | 変更内容                                      | 変更規模 |
| --------------------------------------- | --------------------------------------------- | -------- |
| `apps/desktop/src/preload/skill-api.ts` | `getDetail()` メソッド追加                    | 小       |
| `apps/desktop/src/preload/skill-api.ts` | `update()` メソッド追加                       | 小       |
| `apps/desktop/src/preload/types.ts`     | SkillAPI 型定義に `getDetail`/`update` を追加 | 小       |

### Lane 3: チャンネル定数確認・同期

| ファイル                               | 変更内容                                                       | 変更規模 |
| -------------------------------------- | -------------------------------------------------------------- | -------- |
| `apps/desktop/src/preload/channels.ts` | SKILL_UPDATE/SKILL_GET_DETAIL の値を確認（不整合があれば修正） | 確認のみ |
| `packages/shared/src/ipc/channels.ts`  | apps/desktop 側と値が一致することを確認（不整合があれば修正）  | 確認のみ |

> Lane 数は3以下に固定（phase-template-core.md Phase 2 のポイント準拠）。

## テスト設計方針（Phase 4 への引き継ぎ）

Phase 4 で作成するテストの方針を以下に定義する。

### テストカテゴリ

| カテゴリ          | 内容                                                       | ファイル                              |
| ----------------- | ---------------------------------------------------------- | ------------------------------------- |
| ハンドラ正常系    | 有効な `skillName` と `updates` で成功レスポンスを返す     | `skillHandlers.test.ts`               |
| ハンドラ異常系    | P42: 型不一致/空文字列/スペースのみ でバリデーションエラー | `skillHandlers.test.ts`               |
| Preload API正常系 | 有効な引数で `safeInvoke` を正しく呼び出す                 | `skill-api.test.ts`（新規または既存） |
| Preload API異常系 | P42: 型不一致/空文字列/スペースのみ でエラーを返す         | `skill-api.test.ts`（新規または既存） |
| セキュリティ      | sender検証が行われることを確認                             | `skillHandlers.test.ts`               |
| 既存テスト回帰    | 既存のスキルハンドラテストが引き続き PASS する             | 既存テストファイル全件                |

### バリデーションテストパターン（P42準拠）

各引数に対して以下の3パターンを必ずテストする:

```typescript
// パターン1: 型不一致
it("skillName が string でない場合はバリデーションエラー", async () => {
  await expect(handler(event, 123, {})).rejects.toMatchObject({
    code: "VALIDATION_ERROR",
  });
});

// パターン2: 空文字列
it("skillName が空文字列の場合はバリデーションエラー", async () => {
  await expect(handler(event, "", {})).rejects.toMatchObject({
    code: "VALIDATION_ERROR",
  });
});

// パターン3: スペースのみ（P42の核心）
it("skillName がスペースのみの場合はバリデーションエラー", async () => {
  await expect(handler(event, "   ", {})).rejects.toMatchObject({
    code: "VALIDATION_ERROR",
  });
});
```

## 統合テスト連携

| 確認項目                           | 確認方法                             | 期待結果       |
| ---------------------------------- | ------------------------------------ | -------------- |
| TypeScript 型チェック（設計段階）  | `pnpm typecheck`（実装後）           | エラー 0件     |
| IPC契約チェックリスト Phase 1 実施 | 手動確認（grep コマンドで4箇所確認） | 全項目確認済み |
| 設計仕様の参照資料との整合         | 手動確認                             | 矛盾なし       |

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断                  | 仕様参照先                                          |
| ------------------ | ------------------------- | --------------------------------------------------- |
| セキュリティ       | IPC引数バリデーション設計 | `aiworkflow-requirements: security-electron-ipc.md` |
| API設計            | IPC API 追加              | `aiworkflow-requirements: api-ipc-agent.md`         |
| エラーハンドリング | エラーコード定義          | `aiworkflow-requirements: error-handling.md`        |
| アーキテクチャ     | IPC層のレイヤ設計         | `aiworkflow-requirements: architecture-overview.md` |

**Electronデスクトップアプリ観点**:

| 層                   | 適用判断           | 仕様参照先                                                     |
| -------------------- | ------------------ | -------------------------------------------------------------- |
| バックエンド（Main） | IPCハンドラ設計    | `aiworkflow-requirements: architecture-overview.md`            |
| IPC通信              | チャンネル契約設計 | `aiworkflow-requirements: api-ipc-agent.md`, `interfaces-*.md` |
| Preload/セキュリティ | Preload API設計    | `aiworkflow-requirements: security-api-electron.md`            |

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認（Phase 1 成果物、ipc-contract-checklist.md）
2. IPC契約設計の実施（SKILL_UPDATE ハンドラ設計、SKILL_GET_DETAIL Preload 設計）
3. バリデーション設計の確定（P42準拠3段バリデーションパターン）
4. 型定義設計の確定（P32準拠の二箇所同時更新計画）
5. ファイル変更計画の作成（Lane 1-3）
6. テスト設計方針の定義（Phase 4 への引き継ぎ）
7. 成果物の作成
8. 完了条件の検証

## 成果物

| 成果物             | パス                                   | 説明                            |
| ------------------ | -------------------------------------- | ------------------------------- |
| 設計書             | `outputs/phase-2/design.md`            | IPC契約設計・型定義・変更計画   |
| バリデーション設計 | `outputs/phase-2/validation-design.md` | P42準拠バリデーションパターン集 |

## 完了条件

- [ ] IPC契約設計が完了している（SKILL_UPDATE ハンドラ、SKILL_GET_DETAIL Preload API、SKILL_UPDATE Preload API）
- [ ] P42準拠3段バリデーションパターンが全引数に定義されている
- [ ] 型定義の P32準拠二箇所同時更新計画が明確化されている
- [ ] ファイル変更計画（Lane 1-3）が作成されている
- [ ] テスト設計方針が Phase 4 への引き継ぎとして定義されている
- [ ] IPC契約チェックリスト Phase 1（変更前の契約確認）の観点で設計を検証済み
- [ ] `outputs/phase-2/design.md` が作成済み
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/skill-lifecycle-routing/tasks/step-02-par-task-05-ipc-layer-integrity-fix \
  --phase 2
```

## 次Phase

Phase 3: 設計レビュー（[phase-3-design-review.md](./phase-3-design-review.md)）

> **Gate**: Phase 2 完了前に Phase 3 へ進まないこと。Lane 1-3 の全変更計画が定義されていることを確認する。
