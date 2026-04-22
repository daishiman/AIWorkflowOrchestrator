# Phase 2: 設計

## メタ情報

| 項目       | 内容                                                |
| ---------- | --------------------------------------------------- |
| Phase      | 2                                                   |
| タスクID   | UNASSIGNED-EVALS-SKILL-SCANNER-CONTENT-VALIDATE-001 |
| 機能名     | evals-skill-scanner-content-validate                |
| タスク名   | SkillScanner EVALS.json 内容バリデーション追加      |
| 前提Phase  | Phase 1                                             |
| 後続Phase  | Phase 3                                             |
| 作成日     | 2026-04-21                                          |
| ステータス | pending                                             |

## 目的

`SkillScanner.ts` に EVALS.json 内容バリデーションフックを追加するためのアーキテクチャを設計する。Phase 1 で確定した受け入れ基準に基づき、以下を決定する：

1. バリデーション処理の挿入箇所（`scanOtherFiles()` 内 or 専用プライベートメソッド）
2. バリデーション結果を格納する型変更設計
3. camelCase / snake_case 両方言許容ポリシーのコード内コメント化
4. テスト戦略（既存3テストの契約更新 + 新規ケース）

## アーキテクチャ概要

### バリデーション追加箇所の設計

現状の `scanOtherFiles()` は `fs.stat()` でファイルサイズを取得するだけである。EVALS.json に対しては追加で内容バリデーションを実行する。

```
scanOtherFiles(skillPath)
  └─ for each { filename, type } in OTHER_FILES
       ├─ fs.stat(filePath) → size 取得
       ├─ [NEW] type === "evals" の場合 → validateEvalsContent(filePath) を呼び出す
       └─ otherFiles に { filename, type, size, evalsValidation? } を追加
```

### 専用プライベートメソッド `validateEvalsContent()`

```typescript
/**
 * EVALS.json の内容を検査し、バリデーション結果を返す
 *
 * [方言ポリシー]
 * EVALS.json は camelCase（skillName, currentLevel, metrics）と
 * snake_case（skill_name, current_level, metrics）の両方言を許容する。
 * 既存フィクスチャ（complete-skill/EVALS.json）が snake_case であるため、
 * snake_case を正準とするが、camelCase も valid として扱う。
 * どちらの方言であっても必須キーが存在すれば valid と判定する。
 */
private async validateEvalsContent(filePath: string): Promise<EvalsValidationResult>
```

### バリデーション処理フロー

```
validateEvalsContent(filePath)
  ├─ Step 1: fs.readFile() でファイル内容を読み込む
  ├─ Step 2: JSON.parse() でパース（失敗 → { valid: false, reason: "parse-error" }）
  ├─ Step 3: パース結果が空オブジェクト {} か確認（空 → { valid: false, reason: "empty-object" }）
  ├─ Step 4: 必須キーの存在確認（camelCase / snake_case 両方言を許容）
  │    必須キー（snake_case）: skill_name, current_level, metrics
  │    必須キー（camelCase）:  skillName,  currentLevel,  metrics
  │    → いずれかの方言で全キーが揃えば valid
  └─ Step 5: { valid: true, dialect: "snake_case" | "camelCase" } を返す
             または { valid: false, reason: "missing-required-keys", missingKeys: [...] }
```

## 型定義設計

### `EvalsValidationResult` 型（新規追加）

```typescript
/**
 * EVALS.json 内容バリデーション結果
 */
export type EvalsValidationResult =
  | {
      valid: true;
      /** 検出された方言（どちらの形式であるかを記録） */
      dialect: "snake_case" | "camelCase";
    }
  | {
      valid: false;
      /** バリデーション失敗理由 */
      reason: "parse-error" | "empty-object" | "missing-required-keys";
      /** 欠落しているキー名（reason が missing-required-keys の場合） */
      missingKeys?: string[];
    };
```

### `SkillOtherFile` 型への追加フィールド

`packages/shared/` の `SkillOtherFile` に `evalsValidation` フィールドを追加する。
既存フィールド（`filename`, `type`, `size`）は変更しない。

```typescript
export interface SkillOtherFile {
  filename: string;
  type: "evals" | "logs" | "package";
  size: number;
  /** EVALS.json の場合のみ設定される内容バリデーション結果 */
  evalsValidation?: EvalsValidationResult;
}
```

**後方互換性**: `evalsValidation` はオプショナル（`?`）であるため、既存コード・既存テストで `evalsValidation` を参照していない箇所は変更不要。

## camelCase / snake_case 両許容ポリシー

`validateEvalsContent()` 内に以下のコメントを配置し、ポリシーをコード内で明示する：

```typescript
// [EVALS.json 方言ポリシー]
// EVALS.json はプロジェクト内で snake_case と camelCase の両方言が混在している。
// 例: .agents/skills/*/EVALS.json → snake_case（skill_name, current_level）
//     将来的な camelCase 移行を考慮し、両方言を valid として扱う。
// 必須キーの存在確認は snake_case / camelCase のいずれかで全キーが揃えば valid とする。
// 方言の統一（snake_case → camelCase 移行）は別タスクのスコープとする。
const REQUIRED_KEYS_SNAKE = ["skill_name", "current_level", "metrics"] as const;
const REQUIRED_KEYS_CAMEL = ["skillName", "currentLevel", "metrics"] as const;
```

## SubAgent lane 設計

| SubAgent   | 担当設計項目                                                      | 出力                                   |
| ---------- | ----------------------------------------------------------------- | -------------------------------------- |
| SubAgent-A | `EvalsValidationResult` 型・`SkillOtherFile` 型拡張               | `outputs/phase-2/type-design.md`       |
| SubAgent-B | `validateEvalsContent()` バリデーション処理フロー設計             | `outputs/phase-2/validation-flow.md`   |
| SubAgent-C | テスト戦略（既存3テスト更新方針 + 新規ケース設計）                | `outputs/phase-2/test-strategy.md`     |
| SubAgent-D | 依存整合マトリクス（shared パッケージ変更影響・既存コード互換性） | `outputs/phase-2/dependency-matrix.md` |

## テスト戦略

### 既存3テストの契約更新方針

| テストID           | 現在の EVALS.json 内容                  | 更新後の追加検証                                             |
| ------------------ | --------------------------------------- | ------------------------------------------------------------ |
| `with-evals`       | `'{"evaluations": []}'`                 | `evalsValidation.valid === false`（`missing-required-keys`） |
| `with-all-others`  | `'{}'`                                  | `evalsValidation.valid === false`（`empty-object`）          |
| `with-sized-evals` | `'{"evaluations": ["test1", "test2"]}'` | `evalsValidation.valid === false`（`missing-required-keys`） |

既存テストの EVALS.json フィクスチャ内容は変更せず、テストの **期待値**（assertion）のみを更新する。

### 新規テストケース

| テストID             | EVALS.json 内容                                              | 期待する `evalsValidation`                          |
| -------------------- | ------------------------------------------------------------ | --------------------------------------------------- |
| `evals-valid-snake`  | 正常 snake_case（全必須キーあり）                            | `{ valid: true, dialect: "snake_case" }`            |
| `evals-valid-camel`  | 正常 camelCase（全必須キーあり）                             | `{ valid: true, dialect: "camelCase" }`             |
| `evals-empty-object` | `{}`                                                         | `{ valid: false, reason: "empty-object" }`          |
| `evals-broken-json`  | `{broken json`                                               | `{ valid: false, reason: "parse-error" }`           |
| `evals-missing-keys` | `{ "skill_name": "foo" }`（`current_level`・`metrics` 欠落） | `{ valid: false, reason: "missing-required-keys" }` |

## 依存整合マトリクス

| 変更対象                                      | 変更内容                              | 影響先                                               | 後方互換性        |
| --------------------------------------------- | ------------------------------------- | ---------------------------------------------------- | ----------------- |
| `packages/shared/` の `SkillOtherFile`        | `evalsValidation?` フィールド追加     | `SkillScanner.ts`・`SkillService`・UI コンポーネント | ✅ optional       |
| `SkillScanner.ts` の `scanOtherFiles()`       | `validateEvalsContent()` 呼び出し追加 | テスト（既存3ケース）                                | ⚠️ 契約更新が必要 |
| `SkillScanner.ts` の `validateEvalsContent()` | 新規プライベートメソッド追加          | なし（内部のみ）                                     | ✅                |
| `EvalsValidationResult` 型（新規）            | 新規型定義                            | `packages/shared/` 経由でエクスポート                | ✅ 新規追加       |

## 参照資料

| 資料名                 | パス                                                                  | 用途                     |
| ---------------------- | --------------------------------------------------------------------- | ------------------------ |
| Phase 1 コード棚卸し   | `outputs/phase-1/code-audit.md`                                       | 現状コード確認結果の参照 |
| Phase 1 スキーマ分析   | `outputs/phase-1/evals-schema-analysis.md`                            | 必須キー・方言情報の参照 |
| Phase 1 テスト契約現状 | `outputs/phase-1/test-contract-audit.md`                              | 既存3テストの現状記録    |
| SkillScanner 実装      | `apps/desktop/src/main/services/skill/SkillScanner.ts`                | 設計の適用先             |
| SkillScanner テスト    | `apps/desktop/src/main/services/skill/__tests__/SkillScanner.test.ts` | テスト更新の対象         |
| SkillOtherFile 型定義  | `packages/shared/`（grep で特定）                                     | 型拡張の適用先           |

## 成果物

| 成果物               | パス                                   | 説明                                                        |
| -------------------- | -------------------------------------- | ----------------------------------------------------------- |
| 型設計書             | `outputs/phase-2/type-design.md`       | `EvalsValidationResult` 型・`SkillOtherFile` 拡張の設計詳細 |
| バリデーションフロー | `outputs/phase-2/validation-flow.md`   | `validateEvalsContent()` の処理フロー・方言ポリシー設計     |
| テスト戦略書         | `outputs/phase-2/test-strategy.md`     | 既存3テスト更新方針 + 新規5テストケース設計                 |
| 依存整合マトリクス   | `outputs/phase-2/dependency-matrix.md` | 変更による影響範囲・後方互換性の確認表                      |

## 完了条件

- [ ] `EvalsValidationResult` 型の設計が確定した（valid/invalid の union 型）
- [ ] `SkillOtherFile` への `evalsValidation?` 追加による後方互換性を確認した
- [ ] `validateEvalsContent()` のバリデーション処理フロー（5ステップ）が設計された
- [ ] camelCase / snake_case 両許容ポリシーがコメント文として確定した
- [ ] 既存3テストの契約更新方針（期待値の変更内容）が記録された
- [ ] 新規5テストケースの設計が記録された
- [ ] 依存整合マトリクスで後方互換性が全て確認された
- [ ] 成果物テーブル記載のファイルを全件生成した

## タスク 100% 実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] Phase 1 成果物との整合性が確認されていること
- [ ] Phase 3 レビューゲートの入力として十分な情報が揃っていること

## 次のPhase

Phase 3: 設計レビュー
