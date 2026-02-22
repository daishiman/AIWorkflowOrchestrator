# Phase 2: 設計サマリー

## メタ情報

| 項目       | 値                                                                           |
| ---------- | ---------------------------------------------------------------------------- |
| Phase      | 2                                                                            |
| タスクID   | UT-FIX-SKILL-IMPORT-RETURN-TYPE-001                                          |
| タスク名   | skill:import IPCハンドラ戻り値型不整合修正（ImportResult→ImportedSkill変換） |
| ステータス | 完了                                                                         |
| 作成日     | 2026-02-21                                                                   |

## 概要

ハンドラ内で2ステップの変換ロジックを実装する。第1ステップでインポート実行、第2ステップでスキル詳細情報を取得し、`ImportedSkill`型として返却する。

## 修正後のハンドラロジック（4ステップ）

### Step 1: P42準拠3段バリデーション

```typescript
// 型チェック → 空文字列チェック → トリム空文字列チェック
if (typeof skillName !== "string" || skillName.trim() === "") {
  throw {
    code: "VALIDATION_ERROR",
    message: "skillName must be a non-empty string",
  };
}
```

### Step 2: インポート実行 → 成功確認

```typescript
const importResult = await skillService.importSkills([skillName]);
if (!importResult.success) {
  throw {
    code: "IMPORT_ERROR",
    message:
      importResult.errors.join(", ") || "スキルのインポートに失敗しました",
  };
}
```

### Step 3: ImportedSkill取得

```typescript
const importedSkill = await skillService.getSkillByName(skillName);
if (!importedSkill) {
  throw {
    code: "SKILL_NOT_FOUND",
    message: `インポート後のスキル '${skillName}' が見つかりません`,
  };
}
```

### Step 4: 返却

```typescript
return importedSkill; // ImportedSkill型
```

## エラーハンドリング設計

| パターン       | エラーコード       | メッセージ例                                  |
| -------------- | ------------------ | --------------------------------------------- |
| 型チェック失敗 | `VALIDATION_ERROR` | "skillName must be a non-empty string"        |
| トリム失敗     | `VALIDATION_ERROR` | "skillName must be a non-empty string"        |
| インポート失敗 | `IMPORT_ERROR`     | "スキルのインポートに失敗しました: ..."       |
| スキル未検出   | `SKILL_NOT_FOUND`  | "インポート後のスキル 'xxx' が見つかりません" |

## IPC契約の修正前後

### 修正前（不整合）

| 軸     | ハンドラ側               | Preload側                | 状態   |
| ------ | ------------------------ | ------------------------ | ------ |
| 引数   | `{ skillIds: string[] }` | `skillName: string`      | 不整合 |
| 戻り値 | `ImportResult`           | `Promise<ImportedSkill>` | 不整合 |
| エラー | 未定義                   | 型未定義                 | 不整合 |

### 修正後（整合）

| 軸     | ハンドラ側          | Preload側                | 状態 |
| ------ | ------------------- | ------------------------ | ---- |
| 引数   | `skillName: string` | `skillName: string`      | 整合 |
| 戻り値 | `ImportedSkill`     | `Promise<ImportedSkill>` | 整合 |
| エラー | `{ code, message }` | reject(Error)            | 整合 |

## Date型シリアライゼーション考慮

Electron IPCは`structuredClone`を使用してデータをシリアライズする。

| 項目         | 判断                                             | 理由                              |
| ------------ | ------------------------------------------------ | --------------------------------- |
| `importedAt` | `new Date()`をそのまま返す                       | structuredCloneはDate型をサポート |
| テスト検証   | `expect(result.importedAt).toBeInstanceOf(Date)` | Date型であることを明示的に検証    |

## テスト修正計画

### skillHandlers.test.ts（6テスト修正 + 2テスト追加）

| テストID     | 修正内容                                          |
| ------------ | ------------------------------------------------- |
| SH-IMP-01    | ImportedSkillプロパティ検証に修正                 |
| SH-IMP-02    | 3段バリデーション検証に修正                       |
| SH-IMP-03    | 空文字列バリデーション検証に修正                  |
| SH-IMP-04~06 | 単一string引数のため削除または修正                |
| 新規         | importSkills失敗時のIMPORT_ERRORテスト追加        |
| 新規         | getSkillByNameがnull時のSKILL_NOT_FOUNDテスト追加 |

### agentSlice.skill-integration.test.ts（モック修正）

| 修正箇所              | 内容                                                 |
| --------------------- | ---------------------------------------------------- |
| mockSkillImport戻り値 | `ImportResult` → `ImportedSkill`型モックデータに変更 |

## 変更影響範囲

### 直接修正（3ファイル）

- `skillHandlers.ts` - ロジック修正
- `skillHandlers.test.ts` - テスト修正
- `agentSlice.skill-integration.test.ts` - モック修正

### 変更不要（4ファイル、整合性確認のみ）

- `skill-api.ts` - Preload型宣言は既に正しい
- `agentSlice.ts` - Rendererロジックは変更不要
- `packages/shared/src/types/skill.ts` - 型定義は変更不要
- `SkillService.ts` - getSkillByName()は既に実装済み

## 完了条件

- [x] 2ステップ変換ロジック（importSkills → getSkillByName）が設計されている
- [x] エラーハンドリング（3エラーコード）が定義されている
- [x] IPC契約の修正前後が明確化されている
- [x] Date型シリアライゼーション対応が記載されている
- [x] P42準拠3段バリデーション設計が含まれている
- [x] テスト修正計画が詳細に定義されている
- [x] 変更影響範囲が特定されている

## 次フェーズ

→ Phase 3: 設計レビューゲート（phase-3-design-review.md）
