# Phase 8: リファクタリング（TDD: Refactor） - タスク仕様書

## メタ情報

| 項目             | 内容                                                                              |
| ---------------- | --------------------------------------------------------------------------------- |
| Phase            | 8                                                                                 |
| Phase名          | リファクタリング（TDD: Refactor）                                                 |
| タスクID         | UT-FIX-SKILL-VALIDATION-CONSISTENCY-001                                           |
| タスク名         | skill:ハンドラP42準拠バリデーション形式統一                                       |
| 分類             | セキュリティ                                                                      |
| 優先度           | 中                                                                                |
| 規模             | 小規模                                                                            |
| Issue            | #874                                                                              |
| 前提Phase        | Phase 7（テストカバレッジ確認）                                                   |
| 後続Phase        | Phase 9（品質保証）                                                               |
| ステータス       | 未着手                                                                            |
| 作成日           | 2026-02-24                                                                        |
| 機能名           | skill-validation-consistency                                                      |
| 前Phase成果物    | `docs/30-workflows/completed-tasks/skill-validation-consistency/outputs/phase-7/` |
| 修正対象ファイル | `apps/desktop/src/main/ipc/skillHandlers.ts`                                      |
| テストファイル   | `apps/desktop/src/main/ipc/__tests__/skillHandlers*.test.ts`（5ファイル）         |

---

## 目的

TDD の Refactor フェーズとして、**テストが全て通る状態（Green）を維持しながら**、`skillHandlers.ts` 内の11ハンドラのバリデーションコードの品質を改善する。

Phase 5 で6ハンドラに追加した P42 準拠3段バリデーション（型チェック → 空文字列 → トリム空文字列）と、既存5ハンドラ（skill:import, skill:remove 等）のバリデーションで、共通パターンの抽出可否を判断し、重複コードの削減・エラーメッセージの一貫性確認・命名規則の統一を実施する。

**制約**: リファクタリングはコードの外部振る舞いを変更しない。テストが1つでも失敗した場合は即座にリファクタリングを中断し、原因を特定して修正する。

---

## 実行タスク

- 共通化検討: バリデーション共通関数抽出の可否を判断する。
- 文言統一確認: エラーメッセージ形式の一貫性を確認する。
- 命名規約確認: P45観点で命名整合を確認する。
- 回帰確認: リファクタ後の全テストGreenを確認する。

> 以下のタスクを **順番に** 実行してください。各タスク完了後にテストを実行し、Green状態を維持していることを確認してください。

### タスク1: 共通バリデーション関数の抽出検討

**目的**: 6ハンドラ（Phase 5 で修正したもの）で重複する3段バリデーションロジックを共通関数に抽出するかどうかを判断する

**実行手順**:

1. `apps/desktop/src/main/ipc/skillHandlers.ts` を開き、全11ハンドラのバリデーションコードを読み取る
2. 以下の「重複パターン分析テーブル」を埋める
3. 分析結果に基づき、共通関数を抽出するか判断する

**重複パターン分析テーブル**:

以下のテーブルの各セルを、実際のコードを確認して埋めること。

| ハンドラ                | 引数アクセス方式         | typeof チェック    | 空文字列チェック   | trim チェック      | エラー形式         | エラーメッセージ |
| ----------------------- | ------------------------ | ------------------ | ------------------ | ------------------ | ------------------ | ---------------- |
| skill:import            | 直接引数 `skillName`     | - （確認して記入） | - （確認して記入） | - （確認して記入） | - （確認して記入） | -                |
| skill:remove            | 直接引数 `skillName`     | -                  | -                  | -                  | -                  | -                |
| skill:get-detail        | オブジェクト `args?.xxx` | -                  | -                  | -                  | -                  | -                |
| skill:execute           | オブジェクト `args?.xxx` | -                  | -                  | -                  | -                  | -                |
| skill:abort             | 直接引数 `executionId`   | -                  | -                  | -                  | -                  | -                |
| skill:get-status        | 直接引数 `executionId`   | -                  | -                  | -                  | -                  | -                |
| skill:analyze           | オブジェクト `args?.xxx` | -                  | -                  | -                  | -                  | -                |
| skill:improve           | オブジェクト `args?.xxx` | -                  | -                  | -                  | -                  | -                |
| skill:optimize          | オブジェクト `args?.xxx` | -                  | -                  | -                  | -                  | -                |
| skill:optimize:variants | オブジェクト `args?.xxx` | -                  | -                  | -                  | -                  | -                |
| skill:optimize:evaluate | オブジェクト `args?.xxx` | -                  | -                  | -                  | -                  | -                |

**抽出候補の共通関数**:

```typescript
/**
 * P42準拠: 文字列引数の3段バリデーション
 * 型チェック → 空文字列チェック → トリム空文字列チェック
 *
 * @param value バリデーション対象の値
 * @param paramName パラメータ名（エラーメッセージに使用）
 * @throws {{ code: "VALIDATION_ERROR"; message: string }} バリデーション失敗時
 */
function validateStringArg(
  value: unknown,
  paramName: string,
): asserts value is string {
  if (typeof value !== "string" || value.trim() === "") {
    throw {
      code: "VALIDATION_ERROR",
      message: `${paramName} must be a non-empty string`,
    };
  }
}
```

**判断基準**:

| 判断       | 条件                                                                                                                                   | 根拠                                             |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| 抽出する   | 3行以上の完全に同一のコードブロックが4箇所以上あり、引数名のみが異なる場合                                                             | DRY原則に基づく保守性向上                        |
| 抽出しない | 各ハンドラの引数アクセス方式（直接引数 vs オブジェクト型）が異なり、共通関数化すると呼び出し側のコードが増えて可読性が下がる場合       | over-engineering回避、KISS原則                   |
| 部分抽出   | 直接引数パターン（skill:import/remove/abort/get-status）のみ共通化し、オブジェクト型（skill:get-detail/execute/analyze/improve）は別途 | 引数アクセス方式の違いに応じた適切な抽象化レベル |

**注意事項**:

- 共通関数を `skillHandlers.ts` のファイル先頭（`registerSkillHandlers` 関数の外側）に配置すること
- 共通関数をファイル外部にエクスポートしないこと（このファイル内でのみ使用するプライベートヘルパーとする）
- `asserts value is string` の型ナローイングが正しく機能し、共通関数呼び出し後の `value` が `string` 型として推論されることを TypeScript コンパイラで確認すること

**テスト確認コマンド**（抽出を実施した場合のみ）:

```bash
# 実行ディレクトリ: リポジトリルート
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers --reporter=verbose
```

> **P40対策**: 必ず `apps/desktop` ディレクトリに移動してからテストを実行すること。リポジトリルートから `pnpm vitest run apps/desktop/src/...` を実行すると `vitest.config.ts` の設定が読み込まれず失敗する。

**期待される成果物**: `outputs/phase-8/validation-pattern-analysis.md`

以下の内容を記録すること:

- 上記の重複パターン分析テーブル（全セル記入済み）
- 抽出する/しない/部分抽出の判断結果
- 判断の根拠（上記判断基準テーブルのどの条件に該当したか）

---

### タスク2: エラーメッセージの一貫性確認

**目的**: 全11ハンドラのバリデーションエラーメッセージが統一された形式で記述されていることを確認する

**実行手順**:

1. `apps/desktop/src/main/ipc/skillHandlers.ts` を開く
2. 全ハンドラのバリデーションエラーメッセージを抽出する
3. 以下のエラーメッセージ一覧テーブルを埋める
4. 不統一な箇所があれば修正する
5. 修正した場合はテストを実行して Green 状態を確認する

**エラーメッセージ一覧テーブル**:

| ハンドラ                | エラーコード      | エラーメッセージ  | 形式統一 |
| ----------------------- | ----------------- | ----------------- | -------- |
| skill:import            | -（確認して記入） | -（確認して記入） | -        |
| skill:remove            | -                 | -                 | -        |
| skill:get-detail        | -                 | -                 | -        |
| skill:execute           | -                 | -                 | -        |
| skill:abort             | -                 | -                 | -        |
| skill:get-status        | -                 | -                 | -        |
| skill:analyze           | -                 | -                 | -        |
| skill:improve           | -                 | -                 | -        |
| skill:optimize          | -                 | -                 | -        |
| skill:optimize:variants | -                 | -                 | -        |
| skill:optimize:evaluate | -                 | -                 | -        |

**統一形式の基準**:

| 項目           | 基準値                                               |
| -------------- | ---------------------------------------------------- |
| エラーコード   | `"VALIDATION_ERROR"`（全ハンドラ共通）               |
| メッセージ言語 | 英語（`${paramName} must be a non-empty string`）    |
| メッセージ形式 | `{引数名} must be a non-empty string`                |
| throw形式      | `throw { code: "VALIDATION_ERROR", message: "..." }` |

**不統一の例（修正が必要なケース）**:

```typescript
// NG: 日本語メッセージ
return { success: false, error: "スキル名が指定されていません" };

// NG: return形式（throw形式であるべき）
return { success: false, error: "skillId must be a string" };

// OK: 統一形式
throw {
  code: "VALIDATION_ERROR",
  message: "skillName must be a non-empty string",
};
```

**修正後のテスト確認コマンド**:

```bash
# 実行ディレクトリ: apps/desktop
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers --reporter=verbose
```

**期待される成果物**: `outputs/phase-8/error-message-consistency.md`

以下の内容を記録すること:

- 上記のエラーメッセージ一覧テーブル（全セル記入済み）
- 不統一箇所の有無と修正内容（修正した場合）
- テスト結果（修正した場合）

---

### タスク3: コードスタイル・命名規則の統一確認

**目的**: 全ハンドラで命名規則が統一され、P45準拠（引数名が実際の値のセマンティクスと一致）であることを確認する

**実行手順**:

1. `apps/desktop/src/main/ipc/skillHandlers.ts` を開く
2. 以下の命名規則チェックリストに基づいて全ハンドラを確認する
3. P45違反（引数名と実際の値のセマンティクス不一致）がないか確認する
4. 問題があれば修正し、テストを実行して Green 状態を確認する

**命名規則チェックリスト**:

| チェック項目   | 基準                                                   | 確認コマンド                                                                           |
| -------------- | ------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| ハンドラ引数名 | 実際の値のセマンティクスと一致（P45準拠）              | `grep -n "skillId\|executionId\|skillName" apps/desktop/src/main/ipc/skillHandlers.ts` |
| 変数名         | camelCase                                              | 目視確認                                                                               |
| 定数名         | UPPER_SNAKE_CASE（例: `IPC_CHANNELS.SKILL_READ_FILE`） | 目視確認                                                                               |
| boolean変数名  | `is`/`has`/`can`/`should` プレフィックス               | `grep -n "const.*=.*true\|const.*=.*false" apps/desktop/src/main/ipc/skillHandlers.ts` |

**P45違反の検出**:

以下のコマンドを実行して、`skillId` が引数名として残っていないか確認する。`skillId` は P45 により `skillName` に統一されるべき（ただし、get-detail/execute ハンドラは本タスクのスコープ外の UT-FIX-SKILL-GETDETAIL-NAMING-DRIFT-001 で対応予定のため、現時点では記録のみ）。

```bash
# 実行ディレクトリ: リポジトリルート
grep -n "skillId" apps/desktop/src/main/ipc/skillHandlers.ts
```

**判断基準**:

- 本タスク（UT-FIX-SKILL-VALIDATION-CONSISTENCY-001）のスコープ内で修正すべき命名問題のみ修正する
- `skillId` → `skillName` の命名変更は UT-FIX-SKILL-GETDETAIL-NAMING-DRIFT-001 のスコープであるため、ここでは記録のみとする
- バリデーションエラーメッセージ内の引数名（例: `"skillId must be a non-empty string"`）は、実際の引数名と一致させる

**テスト確認コマンド**（修正した場合のみ）:

```bash
# 実行ディレクトリ: apps/desktop
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers --reporter=verbose
```

**期待される成果物**: `outputs/phase-8/naming-style-review.md`

以下の内容を記録すること:

- 命名規則チェックリストの全項目の確認結果
- P45違反の有無と対応方針（本タスクで修正 or 別タスクに委譲）
- テスト結果（修正した場合）

---

### タスク4: テスト全PASSの最終確認（リグレッション確認）

**目的**: タスク1-3のリファクタリングが完了した後、全テストがパスし、カバレッジがリファクタ前と同等以上であることを確認する

**実行手順**:

1. 対象テストファイル（5ファイル）を全て実行する
2. テスト結果を確認する（全テスト PASS であること）
3. カバレッジがリファクタ前（Phase 7 の結果）と同等以上であることを確認する

**テスト実行コマンド**:

```bash
# 実行ディレクトリ: apps/desktop
# Step 1: 対象テストの実行（verbose表示で全テスト名を確認）
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers --reporter=verbose

# Step 2: カバレッジ付き実行（Phase 7 との比較用）
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers --coverage
```

> **P40対策**: 必ず `cd apps/desktop` してから実行すること。

**確認チェックリスト**:

| 確認項目                          | 基準                     | 結果 |
| --------------------------------- | ------------------------ | ---- |
| skillHandlers.test.ts             | 全テスト PASS            | -    |
| skillHandlers.execute.test.ts     | 全テスト PASS            | -    |
| skillHandlers.delegate.test.ts    | 全テスト PASS            | -    |
| skillHandlers.improve.test.ts     | 全テスト PASS            | -    |
| skillHandlers.integration.test.ts | 全テスト PASS            | -    |
| Line Coverage                     | Phase 7 の結果と同等以上 | -    |
| Branch Coverage                   | Phase 7 の結果と同等以上 | -    |
| Function Coverage                 | Phase 7 の結果と同等以上 | -    |

**失敗時のアクション**:

- テストが1つでも失敗した場合: リファクタリングの変更を `git diff` で確認し、失敗原因を特定する。原因がリファクタリングに起因する場合は変更を元に戻し、別のアプローチでリファクタリングをやり直す
- カバレッジが低下した場合: 共通関数の抽出によりカバレッジ計算が変化した可能性がある。カバレッジレポートを確認し、未カバーの行を特定する。Phase 6 に戻る必要がある場合はその旨を記録する

**期待される成果物**: `outputs/phase-8/regression-test-result.md`

以下の内容を記録すること:

- テスト実行結果（全テストファイルの PASS/FAIL）
- カバレッジ値（Line/Branch/Function）と Phase 7 との比較
- 失敗があった場合の原因と対応内容

---

## 参照資料

### 前Phase成果物

| 参照資料         | パス                                                                                     | 内容               |
| ---------------- | ---------------------------------------------------------------------------------------- | ------------------ |
| Phase 1 要件定義 | `docs/30-workflows/completed-tasks/skill-validation-consistency/phase-1-requirements.md` | 要件・受入基準     |
| Phase 2 設計     | `docs/30-workflows/completed-tasks/skill-validation-consistency/phase-2-design.md`       | 設計判断・修正方針 |
| Phase 7 成果物   | `docs/30-workflows/completed-tasks/skill-validation-consistency/outputs/phase-7/`        | カバレッジ確認結果 |
| Phase 5 成果物   | `docs/30-workflows/completed-tasks/skill-validation-consistency/outputs/phase-5/`        | 実装結果           |
| Phase 6 成果物   | `docs/30-workflows/completed-tasks/skill-validation-consistency/outputs/phase-6/`        | テスト拡充結果     |

### 実装ファイル

| 参照資料        | パス                                                                    | 内容                 |
| --------------- | ----------------------------------------------------------------------- | -------------------- |
| IPCハンドラ実装 | `apps/desktop/src/main/ipc/skillHandlers.ts`                            | Main Processハンドラ |
| テストファイル  | `apps/desktop/src/main/ipc/__tests__/skillHandlers.test.ts`             | メインテスト         |
| テストファイル  | `apps/desktop/src/main/ipc/__tests__/skillHandlers.execute.test.ts`     | 実行テスト           |
| テストファイル  | `apps/desktop/src/main/ipc/__tests__/skillHandlers.delegate.test.ts`    | 委譲テスト           |
| テストファイル  | `apps/desktop/src/main/ipc/__tests__/skillHandlers.improve.test.ts`     | 改善テスト           |
| テストファイル  | `apps/desktop/src/main/ipc/__tests__/skillHandlers.integration.test.ts` | 統合テスト           |

### システム仕様参照

| 参照資料          | パス                                                                              | 内容                        |
| ----------------- | --------------------------------------------------------------------------------- | --------------------------- |
| P42: trim漏れ     | `.claude/rules/06-known-pitfalls.md` (P42)                                        | 3段バリデーション標準       |
| P45: 命名ドリフト | `.claude/rules/06-known-pitfalls.md` (P45)                                        | 引数名セマンティクス一致    |
| セキュリティ原則  | `.claude/rules/04-electron-security.md`                                           | IPC入力バリデーション       |
| セキュリティ詳細  | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`         | スキルIPC セキュリティ仕様  |
| IPC契約チェック   | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`     | 契約ドリフト防止チェック    |
| Skill API契約     | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | Preload契約との整合確認     |
| IPC API仕様       | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`              | IPCチャネル仕様との整合確認 |
| エラー分類        | `.claude/skills/aiworkflow-requirements/references/error-handling.md`             | Validation Error方針        |

---

## 成果物

| #   | 成果物                     | パス                                             | 内容                               |
| --- | -------------------------- | ------------------------------------------------ | ---------------------------------- |
| 1   | バリデーションパターン分析 | `outputs/phase-8/validation-pattern-analysis.md` | 重複パターン分析と共通関数抽出判断 |
| 2   | エラーメッセージ一貫性確認 | `outputs/phase-8/error-message-consistency.md`   | エラーメッセージ形式の統一確認結果 |
| 3   | 命名・スタイル確認         | `outputs/phase-8/naming-style-review.md`         | 命名規則・コードスタイルの確認結果 |
| 4   | リグレッションテスト結果   | `outputs/phase-8/regression-test-result.md`      | リファクタリング後の全テスト結果   |

---

## 統合テスト連携【必須】

> リファクタリング後の統合テスト継続成功を確認する

| 確認項目                    | 基準                                       |
| --------------------------- | ------------------------------------------ |
| 全ユニットテスト            | 5テストファイル全テストケース 100% PASS    |
| P42準拠バリデーションテスト | 6ハンドラ × 5パターン = 30ケース PASS      |
| sender検証テスト            | 全ハンドラの validateIpcSender テスト PASS |
| カバレッジ維持              | Phase 7 と同等以上                         |

---

## 多角的チェック観点

| 観点               | 確認ポイント                                                                                         |
| ------------------ | ---------------------------------------------------------------------------------------------------- |
| セキュリティ       | P42準拠3段バリデーションが全ハンドラで維持されている（共通関数化しても各ハンドラで呼び出されている） |
| アーキテクチャ     | 共通関数導入時はファイル内プライベートヘルパーとして配置し、外部エクスポートしない                   |
| エラーハンドリング | throw形式変更・エラーメッセージ統一が Renderer 側のエラーハンドリングに影響しない                    |
| 型安全             | `asserts value is string` 型ナローイングが正しく機能し、共通関数呼び出し後に型推論が効いている       |
| パフォーマンス     | 共通関数への委譲による関数呼び出しオーバーヘッドは IPC 通信コストと比較して無視できるレベル          |
| 可読性             | 共通関数を導入しても各ハンドラの意図が明確に読み取れる                                               |

---

## 完了条件

- [ ] タスク1: バリデーションパターンの重複分析テーブルが全セル記入済みで、共通関数の抽出判断と根拠が記録されている
- [ ] タスク2: エラーメッセージの一覧テーブルが全セル記入済みで、不統一箇所があれば修正済みである
- [ ] タスク3: 命名規則チェックリストの全項目が確認済みで、P45違反の有無と対応方針が記録されている
- [ ] タスク4: 5テストファイル全てが PASS し、カバレッジが Phase 7 と同等以上である
- [ ] 成果物（4ファイル）が全て `outputs/phase-8/` に生成されている
- [ ] **本Phase内の全タスク（4タスク）を100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（4タスク）を100%実行完了
- [ ] 各タスクを100%完了し、成果物に完了を明記
- [ ] 成果物（4ファイル）が全て生成されていることを確認
- [ ] テストが継続して Green 状態であることを確認
- [ ] `artifacts.json` の Phase 8 ステータスを `completed` に更新

---

## 依存関係

- **前提**: Phase 7（テストカバレッジ確認）が完了していること
- **後続**: Phase 9（品質保証）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/completed-tasks/skill-validation-consistency/phase-9-quality-assurance.md`
