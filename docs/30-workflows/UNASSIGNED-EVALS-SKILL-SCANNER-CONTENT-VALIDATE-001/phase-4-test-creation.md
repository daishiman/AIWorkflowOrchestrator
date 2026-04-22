# Phase 4: テスト作成（TDD Red フェーズ）

## メタ情報

| 項目       | 内容                                                |
| ---------- | --------------------------------------------------- |
| Phase      | 4                                                   |
| タスクID   | UNASSIGNED-EVALS-SKILL-SCANNER-CONTENT-VALIDATE-001 |
| 機能名     | evals-skill-scanner-content-validate                |
| タスク名   | SkillScanner EVALS.json 内容バリデーション追加      |
| 前提Phase  | Phase 3（ゲート PASS 確認済み）                     |
| 後続Phase  | Phase 5                                             |
| 作成日     | 2026-04-21                                          |
| ステータス | pending                                             |
| タスク種別 | NON_VISUAL（UI 変更なし）                           |

## 目的

TDD の Red フェーズとして、`SkillScanner.validateEvalsContent()` および `scanOtherFiles()` の内容バリデーション追加に対するテストを先行作成する。この時点では `validateEvalsContent()` が存在しないため、テストは「メソッド不在 / 期待値不一致」によって失敗（Red）する状態が正しい。

また、既存3テスト（`with-evals` / `with-all-others` / `with-sized-evals`）の assertion を「中身を期待しない」から「`evalsValidation` を持つ」へ更新し、これも実装前は Red 状態になることを確認する。

## テスト対象・テストファイルパス

| 対象メソッド                     | テストファイルパス                                                    | 操作     |
| -------------------------------- | --------------------------------------------------------------------- | -------- |
| `validateEvalsContent()`（新規） | `apps/desktop/src/main/services/skill/__tests__/SkillScanner.test.ts` | 新規追加 |
| `scanOtherFiles()` の挙動変更    | `apps/desktop/src/main/services/skill/__tests__/SkillScanner.test.ts` | 既存更新 |

既存テストファイル（変更なし・参照のみ）:

- `apps/desktop/src/main/services/skill/SkillScanner.ts`（実装対象・`validateEvalsContent()` 追加前）
- `packages/shared/`（`SkillOtherFile` 型・`EvalsValidationResult` 型の定義先）

## テストケース一覧

### 正常系: バリデーション通過ケース

| テストID       | EVALS.json の内容                                                  | 期待する `evalsValidation`               | 優先度 |
| -------------- | ------------------------------------------------------------------ | ---------------------------------------- | ------ |
| `EVS-VALID-01` | 正常 snake_case（`skill_name`, `current_level`, `metrics` 全あり） | `{ valid: true, dialect: "snake_case" }` | 必須   |
| `EVS-VALID-02` | 正常 camelCase（`skillName`, `currentLevel`, `metrics` 全あり）    | `{ valid: true, dialect: "camelCase" }`  | 必須   |

正常 snake_case フィクスチャ例:

```json
{
  "skill_name": "test-skill",
  "current_level": 1,
  "metrics": {
    "total_usage_count": 0,
    "success_count": 0,
    "failure_count": 0
  }
}
```

正常 camelCase フィクスチャ例:

```json
{
  "skillName": "test-skill",
  "currentLevel": 1,
  "metrics": {
    "totalUsageCount": 0,
    "successCount": 0,
    "failureCount": 0
  }
}
```

### 異常系: バリデーション失敗ケース

| テストID         | EVALS.json の内容                                            | 期待する `evalsValidation`                                                  | 優先度 |
| ---------------- | ------------------------------------------------------------ | --------------------------------------------------------------------------- | ------ |
| `EVS-INVALID-01` | `{}`（空オブジェクト）                                       | `{ valid: false, reason: "empty-object" }`                                  | 必須   |
| `EVS-INVALID-02` | `{broken json`（構文エラー）                                 | `{ valid: false, reason: "parse-error" }`                                   | 必須   |
| `EVS-INVALID-03` | `{ "skill_name": "foo" }`（`current_level`・`metrics` 欠落） | `{ valid: false, reason: "missing-required-keys", missingKeys: [...] }`     | 必須   |
| `EVS-INVALID-04` | `{ "skillName": "foo" }`（`currentLevel`・`metrics` 欠落）   | `{ valid: false, reason: "missing-required-keys", missingKeys: [...] }`     | 必須   |
| `EVS-INVALID-05` | `[]`（配列: オブジェクトではない）                           | `{ valid: false, reason: "empty-object" }` または `"missing-required-keys"` | 推奨   |

### 既存3テストの更新（契約変更）

既存テストのフィクスチャ内容は変更せず、assertion のみを追加・更新する。

| 既存テストケース   | 現在の EVALS.json 内容                  | 追加する assertion                                                      |
| ------------------ | --------------------------------------- | ----------------------------------------------------------------------- |
| `with-evals`       | `'{"evaluations": []}'`                 | `evalsFile.evalsValidation.valid === false`（必須キー欠落）             |
| `with-all-others`  | `'{}'`（空オブジェクト）                | `evalsFile.evalsValidation.valid === false`（`reason: "empty-object"`） |
| `with-sized-evals` | `'{"evaluations": ["test1", "test2"]}'` | `evalsFile.evalsValidation.valid === false`（必須キー欠落）             |

**注意**: `with-evals` / `with-sized-evals` の EVALS.json は `evaluations` キーを持つが、`skill_name` / `current_level` / `metrics`（または camelCase 同等）が欠落しているため invalid となる。

## private method テスト方針

`validateEvalsContent()` は `private` メソッドであるため、直接呼び出しには TypeScript のキャストを使用する。

```typescript
// private メソッドのテスト用キャスト（Phase 2 設計に沿った方針）
type ScannerPrivate = {
  validateEvalsContent(filePath: string): Promise<EvalsValidationResult>;
};

const result = await (
  scanner as unknown as ScannerPrivate
).validateEvalsContent(filePath);
```

ただし、`validateEvalsContent()` は `scanOtherFiles()` 経由で間接的にもテストできるため、可能な限り `scanAll()` の統合テストとして検証することを優先する。private メソッド直接テストは「`scanAll()` 経由では再現困難なエッジケース」のみに限定する。

## テストファイルの構造仕様

`SkillScanner.test.ts` の末尾に以下の `describe` ブロックを追加する（既存の describe 構造を変更しない）：

```typescript
// ===========================================================================
// Phase: EVALS.json 内容バリデーション（UNASSIGNED-EVALS-SKILL-SCANNER-CONTENT-VALIDATE-001）
// ===========================================================================

describe("SkillScanner - EVALS.json 内容バリデーション", () => {
  // ...

  describe("正常系: valid EVALS.json", () => {
    it("EVS-VALID-01: snake_case 方言の正常 EVALS.json が valid 判定されること", ...);
    it("EVS-VALID-02: camelCase 方言の正常 EVALS.json が valid 判定されること", ...);
  });

  describe("異常系: invalid EVALS.json", () => {
    it("EVS-INVALID-01: 空オブジェクト {} が empty-object で invalid 判定されること", ...);
    it("EVS-INVALID-02: 破損 JSON が parse-error で invalid 判定されること", ...);
    it("EVS-INVALID-03: snake_case 必須キー欠落が missing-required-keys で invalid 判定されること", ...);
    it("EVS-INVALID-04: camelCase 必須キー欠落が missing-required-keys で invalid 判定されること", ...);
    it("EVS-INVALID-05: 配列型の EVALS.json が invalid 判定されること", ...);
  });

  describe("既存テスト契約更新", () => {
    it("with-evals フィクスチャが evalsValidation.valid === false を持つこと", ...);
    it("with-all-others の EVALS.json が evalsValidation.valid === false を持つこと", ...);
    it("with-sized-evals フィクスチャが evalsValidation.valid === false を持つこと", ...);
  });
});
```

## 依存関係整合確認

テスト作成前に以下のコマンドを実行し、型定義の変更（`EvalsValidationResult` 追加・`SkillOtherFile` 拡張）が `@repo/shared` でビルドされていることを確認する：

```bash
# shared パッケージのビルド（型変更の反映）
pnpm install
pnpm --filter @repo/shared build

# ビルドエラーがないことを確認後、テストを実行
pnpm --filter @repo/desktop test SkillScanner
```

**Phase 4 時点では `validateEvalsContent()` が実装されていないため、テストは Red（FAIL）になる。**
FAIL の原因が「実装が呼ばれない / 期待値不一致」であり「インポートエラー・モック設定エラー」でないことを確認すること。

## テストコマンド

```bash
# SkillScanner テストのみ実行（Red 確認用）
pnpm --filter @repo/desktop test SkillScanner

# 既存テスト全体への影響確認（最終確認用）
pnpm --filter @repo/desktop test
```

## 成果物

| 成果物                 | パス                                                                          | 説明                                               |
| ---------------------- | ----------------------------------------------------------------------------- | -------------------------------------------------- |
| テスト追加済みファイル | `apps/desktop/src/main/services/skill/__tests__/SkillScanner.test.ts`（更新） | 新規7ケース追加 + 既存3テスト assertion 更新       |
| Red テスト結果記録     | `outputs/phase-4/red-test-result.md`                                          | テスト実行ログ・FAIL の確認記録                    |
| フィクスチャ設計書     | `outputs/phase-4/fixture-design.md`                                           | 新規追加する EVALS.json フィクスチャの内容と配置先 |

## 完了条件

- [ ] `SkillScanner.test.ts` に `EVS-VALID-01`・`EVS-VALID-02` が追加されている
- [ ] `SkillScanner.test.ts` に `EVS-INVALID-01`〜`EVS-INVALID-05` が追加されている
- [ ] 既存3テスト（`with-evals`・`with-all-others`・`with-sized-evals`）の assertion が `evalsValidation` を検証するよう更新されている
- [ ] インポートエラー・モック設定エラーが発生していない（テストが「実行されて FAIL」している状態）
- [ ] `pnpm --filter @repo/shared build` が成功している
- [ ] `red-test-result.md` に FAIL の確認記録が記載されている
- [ ] 既存テスト（バリデーション無関係な項目）が引き続き PASS している

## タスク 100% 実行確認【必須】

1. テストID `EVS-VALID-01`〜`EVS-INVALID-05` が全て定義されているか
2. 既存3テスト（`with-evals`・`with-all-others`・`with-sized-evals`）の assertion が更新されているか
3. `pnpm --filter @repo/shared build` が成功しているか（型変更の反映確認）
4. モックエラー・インポートエラーなしで「実装が呼ばれないことによる FAIL」になっているか
5. `red-test-result.md` に実行ログを記録したか

## 次のPhase

Phase 5: 実装（Green フェーズ）。`validateEvalsContent()` の実装と `scanOtherFiles()` へのフック追加を行い、Red 状態のテストを全て PASS させる。
