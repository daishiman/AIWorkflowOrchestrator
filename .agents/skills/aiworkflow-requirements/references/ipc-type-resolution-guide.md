# IPC 型不整合 診断・解決ガイド

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/
>
> **親ドキュメント**: [architecture-implementation-patterns.md](./architecture-implementation-patterns.md)

---

## 概要

IPC（Inter-Process Communication）の型不整合は、Electron アプリケーションで最も検出が困難なバグの一つである。Main Process、Preload Bridge、Renderer の3層間でデータ型の契約が乖離すると、コンパイル時には検出されず、ランタイムで初めて問題が顕在化する。

本ガイドは、過去のインシデント（P5, P23, P32, P42, P44, P45）から得た教訓を統合し、IPC 型不整合の診断から解決までの標準ワークフローを提供する。v1.1.0 で Date 型シリアライズ、positional→object 引数移行、safeOn 購読パターンを追加。

---

## IPC 型不整合の分類

| 分類 | 説明 | 検出難易度 | 代表的な Pitfall |
|------|------|-----------|-----------------|
| **引数型不整合** | Main handler が期待する引数型と Preload が送信する引数型が異なる | 高（ランタイムのみ） | P44 |
| **戻り値型不整合** | Main handler の戻り値型と Renderer が期待する型が異なる | 高（ランタイムのみ） | P44（S13パターンで解決） |
| **引数命名ドリフト** | 引数名のセマンティクスと実際の値が異なる（例: skillId に skillName を渡す） | 中（コードレビューで発見可能） | P45 |
| **バリデーション漏れ** | .trim() チェックなど、空白文字列のバリデーションが不足 | 中 | P42 |
| **型定義ファイル乖離** | shared/types.ts と preload/types.ts の定義が異なる | 低（TypeCheck で検出可能） | P23, P32 |
| **Date型シリアライズ漏れ** | IPC境界でDate型を直接送信し、JSONシリアライズで形式が不定になる | 高（ランタイムのみ） | — (新規) |
| **引数形式不整合** | positional形式で引数を送信し、handler側でobject形式を期待する | 高（ランタイムのみ） | P44（拡張） |
| **IPC購読パターン漏れ** | safeOnの購読でcleanupやStrictMode対策が不足 | 中 | P5 |

---

## 診断ワークフロー

### Step 1: エラーメッセージの分析

| エラーパターン | 原因の可能性 | 調査対象 |
|---------------|-------------|---------|
| `skillIds must be an array` | 引数型不整合: Preload が文字列を送信、handler がオブジェクトを期待 | handler の引数型定義 vs Preload の `safeInvoke` 呼び出し |
| `skillId is required` | 引数型不整合: 同上パターン | 同上 |
| `Cannot read property 'xxx' of undefined` | 戻り値型不整合: handler の戻り値に期待するプロパティが存在しない | handler の return 型 vs Renderer の使用箇所 |
| `VALIDATION_ERROR` | バリデーション失敗: 入力値の型/形式が不正 | handler のバリデーションロジック |

### Step 2: 3層の契約確認

| 層 | 確認ファイル | 確認項目 |
|----|------------|---------|
| **Main handler** | `apps/desktop/src/main/ipc/skillHandlers.ts` | 引数の型アノテーション、バリデーションロジック、return 型 |
| **Preload API** | `apps/desktop/src/preload/skill-api.ts` | `safeInvoke` の第2引数（実際に送信される値） |
| **Renderer** | 各コンポーネント・Store | API呼び出し時の引数、レスポンスの使用方法 |

### Step 3: grep による影響範囲調査

```bash
# チャンネル名で全層を検索
grep -rn "skill:import" apps/desktop/src/

# 引数名の不一致を検索
grep -rn "skillId\|skillIds\|skillName" apps/desktop/src/main/ipc/
grep -rn "skillId\|skillIds\|skillName" apps/desktop/src/preload/

# 型定義の乖離を検索
grep -rn "ImportResult\|ImportedSkill" apps/desktop/src/ packages/shared/src/
```

---

## 解決パターン

### パターン A: 引数型の統一

**適用条件**: Main handler が期待する引数型と Preload の送信型が異なる場合

| ステップ | 作業 | ファイル |
|---------|------|---------|
| 1 | Preload 側の送信値を確認し、「実際に使われている型」を正として決定 | `preload/skill-api.ts` |
| 2 | Main handler の引数型を Preload に合わせて変更 | `main/ipc/skillHandlers.ts` |
| 3 | P42 準拠の3段バリデーションを追加 | 同上 |
| 4 | テストの引数を新しい型に合わせて更新 | `__tests__/skillHandlers.test.ts` |

### パターン B: 戻り値型の2ステップ変換（S13）

**適用条件**: Main handler の戻り値型と Renderer の期待型が完全に異なる場合（共有フィールドがない場合）

| ステップ | 作業 | 説明 |
|---------|------|------|
| 1 | 操作実行 | `importSkills([skillName])` で操作を完了 |
| 2 | データ取得 | `getSkillByName(skillName)` で期待型のオブジェクトを取得 |
| 3 | null チェック | 取得失敗時は `IMPORT_ERROR` を throw |
| 4 | 返却 | `ImportedSkill` 型のオブジェクトを返却 |

```typescript
// ✅ 2ステップ変換パターン
const importResult = await skillService.importSkills([skillName]);
if (!importResult.success || importResult.importedCount === 0) {
  throw { code: "IMPORT_ERROR", message: `Failed to import skill: ${skillName}` };
}
const importedSkill = await skillService.getSkillByName(skillName);
if (!importedSkill) {
  throw { code: "IMPORT_ERROR", message: `Skill imported but not found: ${skillName}` };
}
return importedSkill;
```

### パターン C: 引数命名の統一（P45 対策）

**適用条件**: 引数名と実際の値のセマンティクスが異なる場合

| ステップ | 作業 |
|---------|------|
| 1 | Preload で渡される値の実際のセマンティクスを確認 |
| 2 | 全レイヤー（handler → service → manager）で引数名を統一 |
| 3 | テストの変数名も合わせて更新 |

### パターン D: Date型シリアライズ統一（ISO 8601）

**適用条件**: IPC境界でDate型フィールドを送信する場合

| ステップ | 作業 | 説明 |
|---------|------|------|
| 1 | 全Date型フィールドを特定 | `grep -rn "Date" task-*.md` で対象フィールドをリストアップ |
| 2 | 型注記を追加 | `Date` → `string; // ISO 8601` に変換 |
| 3 | Main Process変換パターン追記 | `.toISOString()` 変換をハンドラ戻り値に記載 |
| 4 | Renderer復元パターン追記 | `new Date(isoString)` 復元をコンポーネント側に記載 |

```typescript
// Main Process（送信側）
return {
  createdAt: record.createdAt.toISOString(),  // Date → string
  updatedAt: record.updatedAt.toISOString(),
  scheduledAt: record.scheduledAt?.toISOString() ?? null,  // nullable対応
};

// Renderer（受信側）
const createdAt = new Date(data.createdAt);  // string → Date
const scheduledAt = data.scheduledAt ? new Date(data.scheduledAt) : null;
```

**注意**: nullable な Date フィールド（`Date | null`）は `string | null; // ISO 8601` として型定義し、変換時に null チェックを含める。

### パターン E: positional→object形式IPC引数移行

**適用条件**: 既存のpositional引数（`safeInvoke(channel, arg1, arg2)`）をobject形式に統一する場合

| ステップ | 作業 | ファイル |
|---------|------|---------|
| 1 | Args型定義を新規作成 | `packages/shared/src/` または仕様書内 |
| 2 | ハンドラの引数型をobject形式に変更 | `main/ipc/*.ts` |
| 3 | P42準拠3段バリデーションを各フィールドに追加 | 同上 |
| 4 | Preload側のsafeInvoke呼び出しをobject形式に変更 | `preload/*.ts` |
| 5 | テストの引数を新しい型に合わせて更新 | `__tests__/*.test.ts` |

```typescript
// Before: positional形式
safeInvoke(IPC_CHANNELS.SKILL_EDITOR_READ, skillName, relativePath);

// After: object形式 + Args型定義
interface SkillEditorReadArgs {
  skillName: string;
  relativePath: string;
}
safeInvoke(IPC_CHANNELS.SKILL_EDITOR_READ, { skillName, relativePath });

// ハンドラ側（P42準拠3段バリデーション）
ipcMain.handle('skill:editor:read', async (event, args: SkillEditorReadArgs) => {
  if (typeof args?.skillName !== 'string' || args.skillName.trim() === '') {
    throw { code: 'VALIDATION_ERROR', message: 'skillName must be a non-empty string' };
  }
  if (typeof args?.relativePath !== 'string' || args.relativePath.trim() === '') {
    throw { code: 'VALIDATION_ERROR', message: 'relativePath must be a non-empty string' };
  }
  return skillEditorService.readFile(args.skillName.trim(), args.relativePath.trim());
});
```

### パターン F: safeOn購読パターン（P5対策付き）

**適用条件**: Renderer側でIPCイベント（`safeOn`）を購読する場合

| ステップ | 作業 | 説明 |
|---------|------|------|
| 1 | useEffect内で購読を登録 | React StrictMode対策のためcleanup関数を必ず返す |
| 2 | cleanup関数でリスナー解除 | `electronAPI.skill.offDebugEvent(handler)` |
| 3 | Main Process側の二重登録防止 | `unregisterAllIpcHandlers()` → `registerAllIpcHandlers()` パターン |

```typescript
// ✅ P5対策付き safeOn購読パターン
useEffect(() => {
  const handler = (event: DebugEvent) => {
    setDebugEvents((prev) => [...prev, event]);
  };

  // 購読登録
  window.electronAPI.skill.onDebugEvent(handler);

  // cleanup（React StrictMode二重実行対策）
  return () => {
    window.electronAPI.skill.offDebugEvent(handler);
  };
}, []); // 依存配列は空（P31対策：Zustandアクションを含めない）
```

---

## 予防策チェックリスト

新規 IPC ハンドラ作成時、または既存ハンドラ修正時に確認するチェックリスト:

| # | チェック項目 | 関連 Pitfall |
|---|------------|-------------|
| 1 | Preload の `safeInvoke` 第2引数の型と、handler の引数型が一致するか | P44 |
| 2 | handler の return 型と、Renderer が期待する型が一致するか | P44, S13 |
| 3 | 引数名が実際の値のセマンティクスと一致するか（例: skillId ≠ skillName） | P45 |
| 4 | 文字列引数に `.trim() === ""` チェックが含まれるか | P42 |
| 5 | `packages/shared/src/` の型定義と `preload/types.ts` の型定義が一致するか | P23, P32 |
| 6 | テストで実際の型形状（プロパティの存在確認）を検証しているか | - |

---

## 関連ドキュメント

| ドキュメント | 内容 |
|-------------|------|
| [architecture-implementation-patterns.md](./architecture-implementation-patterns.md) | S13: IPC 戻り値型2ステップ変換パターン |
| [ipc-contract-checklist.md](./ipc-contract-checklist.md) | IPC 契約チェックリスト |
| [security-skill-ipc.md](./security-skill-ipc.md) | スキル IPC セキュリティ仕様 |
| [interfaces-agent-sdk-skill.md](./interfaces-agent-sdk-skill.md) | スキル SDK インターフェース定義 |

---

## 適用実績

| タスクID | 不整合の分類 | 適用パターン | 完了日 |
|---------|-------------|-------------|--------|
| UT-FIX-SKILL-IMPORT-INTERFACE-001 | 引数型不整合 | パターン A + C | 2026-02-20 |
| UT-FIX-SKILL-REMOVE-INTERFACE-001 | 引数型不整合 + 命名ドリフト | パターン A + C | 2026-02-20 |
| UT-FIX-SKILL-IMPORT-RETURN-TYPE-001 | 戻り値型不整合 | パターン B（S13） | 2026-02-21 |
| UT-IPC-DATA-FLOW-TYPE-GAPS-001 | Date型シリアライズ漏れ + 引数形式不整合 + 購読パターン漏れ | パターン D + E + F | 2026-02-24（仕様書修正のみ） |

---

## 変更履歴

| Version | Date | Changes |
|---------|------|---------|
| **v1.1.0** | **2026-02-24** | **パターンD/E/F追加**: UT-IPC-DATA-FLOW-TYPE-GAPS-001の実装経験に基づくDate型シリアライズ統一、positional→object引数移行、safeOn購読パターンの3解決パターンを追加 |
| **v1.0.0** | **2026-02-21** | **初版作成**: P23/P32/P42/P44/P45の教訓を統合した IPC 型不整合 診断・解決ガイド。UT-FIX-SKILL-IMPORT-RETURN-TYPE-001の実装経験に基づく |
