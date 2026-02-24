# Phase 3: 設計レビュー -- skill:ハンドラP42準拠バリデーション形式統一

## メタ情報

| 項目          | 内容                                                                               |
| ------------- | ---------------------------------------------------------------------------------- |
| タスクID      | UT-FIX-SKILL-VALIDATION-CONSISTENCY-001                                            |
| タスク名      | skill:ハンドラP42準拠バリデーション形式統一                                        |
| Phase         | 3 -- 設計レビュー                                                                  |
| 分類          | セキュリティ                                                                       |
| 優先度        | 中                                                                                 |
| 規模          | 小規模                                                                             |
| Issue         | #874                                                                               |
| 作成日        | 2026-02-24                                                                         |
| 前Phase成果物 | `docs/30-workflows/completed-tasks/skill-validation-consistency/phase-2-design.md` |

## 目的

Phase 2 で作成した設計が、Phase 1 の要件（FR1-FR3, NFR1-NFR5）を全て満たし、P42準拠パターンとの整合性が確保されていることをレビューする。throw 形式変更による Renderer 側への影響、skill:improve の `args.analysis` バリデーション修正、既存テストの回帰リスクを評価し、設計の妥当性を判定する。

## 実行タスク

- 要件カバレッジ検証: FR/NFRが設計で満たされることを確認する。
- P42整合性検証: 既存準拠パターンとの一致を確認する。
- 影響評価: throw形式変更の互換性リスクを評価する。
- テスト妥当性検証: 分岐網羅とテスト設計の妥当性を確認する。
- improve設計検証: `args.analysis` 検証設計の妥当性を確認する。
- テスト対象網羅性検証: 既存5テストファイルへの影響を確認する。
- ゲート判定: PASS/MINOR/MAJORを決定する。

| #   | タスク                              | 説明                                                          |
| --- | ----------------------------------- | ------------------------------------------------------------- |
| 1   | 要件カバレッジ検証                  | FR1-FR3、NFR1-NFR5 が設計で全て対応されていることを確認       |
| 2   | P42準拠パターン整合性検証           | skill:import/remove（準拠済み）と同一パターンであることを確認 |
| 3   | throw形式変更の影響評価             | Renderer側への影響と後方互換性のリスク評価                    |
| 4   | テスト設計の妥当性検証              | テストケースが全バリデーション分岐をカバーしているか確認      |
| 5   | skill:improve分析チェックの設計検証 | `args.analysis` バリデーション修正の妥当性確認                |
| 6   | テスト対象ファイル網羅性検証        | 5つの既存テストファイルへの影響が全て分析されているか確認     |
| 7   | レビューゲート判定                  | PASS / MINOR / MAJOR の判定                                   |

## 参照資料

### 前Phase成果物

- `docs/30-workflows/completed-tasks/skill-validation-consistency/phase-1-requirements.md` -- 要件定義書
- `docs/30-workflows/completed-tasks/skill-validation-consistency/phase-2-design.md` -- 設計書

### システム仕様

- `.claude/rules/06-known-pitfalls.md` -- P42: 文字列引数の.trim()バリデーション漏れ
- `.claude/rules/04-electron-security.md` -- IPCセキュリティ原則
- `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md` -- スキルIPCセキュリティ仕様
- `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md` -- IPC契約チェックリスト
- `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` -- Skill API契約の正本
- `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md` -- IPCチャネル仕様の正本
- `.claude/skills/aiworkflow-requirements/references/error-handling.md` -- VALIDATION_ERROR分類とエラーポリシー
- `docs/30-workflows/completed-tasks/task-skill-validation-consistency.md` -- 元タスク指示書（完了後移管）

### レビュー対象ソースコード

- `apps/desktop/src/main/ipc/skillHandlers.ts` -- 修正対象の実装ファイル
- `apps/desktop/src/main/ipc/__tests__/skillHandlers.test.ts` -- メインテストファイル
- `apps/desktop/src/main/ipc/__tests__/skillHandlers.execute.test.ts` -- executeテストファイル
- `apps/desktop/src/main/ipc/__tests__/skillHandlers.improve.test.ts` -- improve/analyzeテストファイル
- `apps/desktop/src/main/ipc/__tests__/skillHandlers.delegate.test.ts` -- abort/get-statusテストファイル
- `apps/desktop/src/main/ipc/__tests__/skillHandlers.integration.test.ts` -- 統合テストファイル

## 実行手順

### Step 1: 要件カバレッジ検証

#### 1.1 機能要件の設計対応

| 要件 | 内容                              | 設計対応箇所                            | チェック項目                                                  | 判定 |
| ---- | --------------------------------- | --------------------------------------- | ------------------------------------------------------------- | ---- |
| FR1  | P42準拠3段バリデーション追加      | Step 2: 修正詳細テーブル（6ハンドラ分） | 全6ハンドラに `.trim() === ""` が含まれているか               |      |
| FR2  | エラーレスポンスをthrow形式に統一 | Step 3: エラーレスポンス形式の設計      | 全6ハンドラの return 形式が throw 形式に変更されているか      |      |
| FR3  | スペースのみ入力の拒否            | Step 1: `.trim() === ""` パターン       | テストケースにスペースのみ `"   "` の入力パターンが含まれるか |      |

**各要件の詳細検証:**

FR1 検証: 修正詳細テーブル（Step 2.1）で全6ハンドラの修正後条件に `.trim() === ""` が含まれている。Step 2.2 で各ハンドラの修正前・修正後コードが明示されている。

FR2 検証: Step 2.2 の全6ハンドラで `return { success: false }` / `return false` / `return null` が `throw { code: "VALIDATION_ERROR", message: "..." }` に変更されている。加えて skill:improve の `args.analysis` チェック（L341）も throw 形式に統一されている。

FR3 検証: Step 4.1 のテストケース設計に `"   "` (スペース3つ) の入力パターンが含まれ、期待結果が `throw VALIDATION_ERROR` と定義されている。

#### 1.2 非機能要件の設計対応

| 要件 | 内容                     | 設計対応箇所                               | チェック項目                                             | 判定 |
| ---- | ------------------------ | ------------------------------------------ | -------------------------------------------------------- | ---- |
| NFR1 | TypeCheck 0エラー        | 修正は条件式変更のみ、型互換性あり         | 条件式の変更が型エラーを引き起こさないか                 |      |
| NFR2 | ESLint 0エラー           | 標準パターンに準拠、ESLint違反なし         | throw オブジェクトリテラルが ESLint ルールに違反しないか |      |
| NFR3 | 全テストPASS             | Step 4: テスト設計方針で既存テスト修正含む | 既存テスト修正方針が全テストファイルをカバーしているか   |      |
| NFR4 | バリデーションカバレッジ | Step 4: describe.each で全分岐カバー       | 6ハンドラ x 5パターン = 30テストケースが設計されているか |      |
| NFR5 | 後方互換性               | Step 3: Renderer側影響分析済み             | safeInvoke の reject ハンドリングが確認されているか      |      |

### Step 2: P42準拠パターン整合性検証

#### 2.1 準拠済みハンドラ（skill:import）との比較

```typescript
// skill:import（準拠済み -- 参照実装 -- skillHandlers.ts L130-136）
// P42準拠: 3段バリデーション（型チェック -> 空文字列 -> トリム空文字列）
if (typeof skillName !== "string" || skillName.trim() === "") {
  throw {
    code: "VALIDATION_ERROR",
    message: "skillName must be a non-empty string",
  };
}
```

#### 2.2 設計で提案された修正パターンとの比較

| 確認項目        | skill:import（準拠済み）              | 設計の修正パターン                    | 整合性 |
| --------------- | ------------------------------------- | ------------------------------------- | ------ |
| typeof チェック | `typeof !== "string"`                 | `typeof !== "string"`                 |        |
| trim チェック   | `.trim() === ""`                      | `.trim() === ""`                      |        |
| エラー形式      | throw { code, message }               | throw { code, message }               |        |
| code 値         | `"VALIDATION_ERROR"`                  | `"VALIDATION_ERROR"`                  |        |
| message 形式    | `${param} must be a non-empty string` | `${param} must be a non-empty string` |        |

#### 2.3 引数アクセスパターンの妥当性

| パターン       | 設計の扱い                                                          | 妥当性評価 |
| -------------- | ------------------------------------------------------------------- | ---------- |
| オブジェクト型 | `args?.skillId` -- Optional chaining で null/undefined を安全に処理 |            |
| 直接引数型     | `executionId` -- 直接 typeof チェック                               |            |

**オブジェクト型の安全性確認:**

`typeof args?.skillId !== "string"` は以下の全ケースを正しく拒否する:

- `args` が `undefined` の場合: `typeof undefined !== "string"` -> true（拒否）
- `args` が `null` の場合: `typeof undefined !== "string"` -> true（拒否）
- `args.skillId` が `undefined` の場合: `typeof undefined !== "string"` -> true（拒否）
- `args.skillId` が `123` の場合: `typeof 123 !== "string"` -> true（拒否）

### Step 3: throw形式変更の影響評価

#### 3.1 リスク評価マトリクス

| リスク項目                                                    | 影響度 | 発生確率 | リスクレベル | 対策                                      |
| ------------------------------------------------------------- | ------ | -------- | ------------ | ----------------------------------------- |
| skill:abort の `return false` -> throw で呼び出し元が破壊     | 中     | 低       | 低           | バリデーションエラーは不正入力時のみ発生  |
| skill:get-status の `return null` -> throw で呼び出し元が破壊 | 中     | 低       | 低           | 同上                                      |
| 既存テストが return 形式を期待して失敗                        | 中     | 高       | 中           | テスト修正を Phase 4 で実施（設計済み）   |
| safeInvoke が throw を正しくハンドリングしない                | 高     | 極低     | 低           | safeInvoke は reject ハンドリング設計済み |
| skill:improve の `args.analysis` throw でRenderer破壊         | 中     | 低       | 低           | 不正入力時のみ発生、正常フロー影響なし    |

#### 3.2 throw形式変更の正当性

1. **一貫性**: skill:import / skill:remove は既に throw 形式。他のハンドラも統一することでコードベースの一貫性が向上
2. **セキュリティ**: throw 形式は IPC バリデーションエラーの標準パターン（`toIPCValidationError` も throw 形式）
3. **デバッグ効率**: `{ code, message }` 形式でエラーカテゴリが明確化され、問題切り分けが容易
4. **Renderer互換性**: safeInvoke は reject を catch する設計であり、throw 形式は設計に沿った動作

#### 3.3 skill:abort / skill:get-status の特殊ケース

| ハンドラ         | 変更前         | 変更後 | 影響分析                                                                                                                                    |
| ---------------- | -------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| skill:abort      | `return false` | throw  | `false` はabort不可を意味していたが、バリデーションエラーとabort不可は異なるセマンティクス。throwにより不正入力を明確にエラーとして報告可能 |
| skill:get-status | `return null`  | throw  | `null` はステータスなしを意味していたが、不正入力に対してnullを返すのはサイレントな失敗。throwにより明確なエラー報告が可能                  |

**評価: throw 形式への変更は意味的にも正当。不正入力は明確にエラーとして報告すべき。**

### Step 4: テスト設計の妥当性検証

#### 4.1 テストケースカバレッジ

| テスト入力           | skill:get-detail | skill:execute | skill:abort | skill:get-status | skill:analyze | skill:improve |
| -------------------- | ---------------- | ------------- | ----------- | ---------------- | ------------- | ------------- |
| スペースのみ `"   "` |                  |               |             |                  |               |               |
| 空文字列 `""`        |                  |               |             |                  |               |               |
| `null`               |                  |               |             |                  |               |               |
| `undefined`          |                  |               |             |                  |               |               |
| 数値型 `123`         |                  |               |             |                  |               |               |

合計: 6ハンドラ x 5テスト = **30テストケース**

#### 4.2 describe.each 設計の妥当性

検証項目:

1. **DRY原則**: 6ハンドラ x 5テストを `describe.each` で一括定義 -- 重複コードを排除
2. **引数パターン吸収**: `isDirect` フラグでオブジェクト型 / 直接引数型の違いを吸収 -- 設計上妥当
3. **パラメータ名反映**: `param` 変数でエラーメッセージの期待値を動的生成 -- テスト精度が高い
4. **テスト配置先**: メインテストファイル（`skillHandlers.test.ts`）に集約 -- 横断的テストとして妥当

#### 4.3 既存テスト修正の影響範囲

| テストファイル                      | 修正が必要なテスト                             | 修正内容                                           | 影響度 |
| ----------------------------------- | ---------------------------------------------- | -------------------------------------------------- | ------ |
| `skillHandlers.test.ts`             | SH-GD-03（skill:get-detail バリデーション）    | try-catch -> `rejects.toMatchObject()` に変更      | 低     |
| `skillHandlers.execute.test.ts`     | sender validationテスト（L299）                | throw形式は既にtry-catchで検出されるため影響限定的 | 低     |
| `skillHandlers.improve.test.ts`     | バリデーション関連テストなし（grepで確認済み） | 修正不要                                           | なし   |
| `skillHandlers.delegate.test.ts`    | 影響確認が必要                                 | Phase 4 で精査                                     | 要確認 |
| `skillHandlers.integration.test.ts` | 影響確認が必要                                 | Phase 4 で精査                                     | 要確認 |

**注記:** `skillHandlers.improve.test.ts` はバリデーション関連のテストを含んでいない（grep で `validation|VALIDATION|skillName.*===|success: false.*error` を検索し該当なし）。`skillHandlers.execute.test.ts` は sender validation テスト（L299）があるが、throw 形式への変更とは直接関係しない。`skillHandlers.delegate.test.ts` と `skillHandlers.integration.test.ts` の影響は Phase 4 で精査する。

### Step 5: skill:improve 分析チェックの設計検証

#### 5.1 `args.analysis` バリデーションの修正妥当性

| 確認項目             | 設計内容                                                                                                  | 評価                                                     |
| -------------------- | --------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| P42準拠対象外の判断  | `args.analysis` はオブジェクト型であり、P42（文字列3段バリデーション）の対象外                            | 妥当                                                     |
| throw形式統一の適用  | `return { success: false }` -> `throw { code, message }` への変更を適用                                   | 妥当                                                     |
| エラーメッセージ統一 | 日本語 `"分析結果が指定されていません"` -> 英語 `"analysis must be provided"`                             | 妥当                                                     |
| message形式          | `"analysis must be provided"` は他のメッセージ形式（`${param} must be a non-empty string`）と微妙に異なる | 許容（オブジェクト型なので `non-empty string` は不適切） |

#### 5.2 スコープ判断の妥当性

設計書でスコープ内・外が明確に区別されている:

- **スコープ内**: 文字列パラメータの P42 準拠 + 全バリデーションの throw 形式統一
- **スコープ外**: `args.analysis` への P42 パターン適用（オブジェクト型のため対象外）
- **スコープ内（追加）**: `args.analysis` の return -> throw 変更（形式統一の一環）

この判断は Phase 1 のスコープ定義と整合している。

### Step 6: テスト対象ファイル網羅性検証

#### 6.1 テストファイル影響分析の網羅性

| テストファイル                      | Phase 2 設計で影響分析されているか            | 具体的な修正内容が記載されているか           |
| ----------------------------------- | --------------------------------------------- | -------------------------------------------- |
| `skillHandlers.test.ts`             | はい -- Step 4.2 で SH-GD-03 の修正内容が記載 | はい -- try-catch -> rejects.toMatchObject() |
| `skillHandlers.execute.test.ts`     | はい -- テスト対象ファイルテーブルに記載      | 部分的 -- 「該当箇所あれば」と記載           |
| `skillHandlers.improve.test.ts`     | はい -- テスト対象ファイルテーブルに記載      | 部分的 -- 「該当箇所あれば」と記載           |
| `skillHandlers.delegate.test.ts`    | はい -- テスト対象ファイルテーブルに記載      | 部分的 -- 「影響確認」と記載                 |
| `skillHandlers.integration.test.ts` | はい -- テスト対象ファイルテーブルに記載      | 部分的 -- 「影響確認」と記載                 |

**評価:** 5つ全てのテストファイルが設計書に記載されている。ただし、`skillHandlers.delegate.test.ts` と `skillHandlers.integration.test.ts` の具体的な修正内容は Phase 4 で精査する方針となっている。小規模タスクとしてはこの方針で妥当（Phase 4 でテストを実際に実行して影響を確認する）。

### Step 7: レビューゲート判定

#### 7.1 判定基準

| 判定              | 条件                               |
| ----------------- | ---------------------------------- |
| PASS              | 全検証項目が問題なし               |
| MINOR             | 軽微な改善点あり、Phase 4 進行可能 |
| MAJOR（要件問題） | 要件の不備あり -> Phase 1 へ戻る   |
| MAJOR（設計問題） | 設計の不備あり -> Phase 2 へ戻る   |

#### 7.2 レビュー結果サマリ

| レビュー観点              | 結果 | 備考                                                                 |
| ------------------------- | ---- | -------------------------------------------------------------------- |
| 要件カバレッジ            | PASS | FR1-FR3、NFR1-NFR5 全て設計で対応                                    |
| P42準拠パターン整合性     | PASS | skill:import/remove と完全に同一パターン                             |
| throw形式変更の影響       | PASS | Renderer側修正不要、safeInvoke の設計に沿った動作                    |
| テスト設計の妥当性        | PASS | 6ハンドラ x 5パターン = 30テストケースで全分岐カバー                 |
| 既存テスト回帰リスク      | PASS | 修正量限定的、Phase 4 で対応可能                                     |
| セキュリティ要件充足      | PASS | IPC層での早期拒否、内部情報非漏洩                                    |
| skill:improve分析チェック | PASS | throw形式統一が適用、P42対象外判断も妥当                             |
| テストファイル網羅性      | PASS | 5テストファイル全てが設計に記載、詳細はPhase 4で精査する方針で妥当   |
| バリデーション共通化判断  | PASS | 共通化しない判断は妥当（Phase 8で再評価の方針も記載済み）            |
| エラーメッセージ統一      | PASS | 英語・パラメータ名含む形式で統一、エラーメッセージ統一テーブルが完備 |

#### 7.3 判定

## **判定: PASS**

全レビュー観点で問題なし。Phase 4（テスト作成）に進行する。

### 指摘事項

指摘事項なし。

## 統合テスト連携

### Phase 4 への引き継ぎ事項

1. テスト作成時は `describe.each` を使用して6ハンドラ分のテストを DRY に記述する
2. 既存テストの return 形式期待値を throw 形式（`rejects.toMatchObject()`）に修正する
3. 引数パターンの違い（オブジェクト型 / 直接引数型）を `isDirect` フラグで吸収する
4. `skillHandlers.delegate.test.ts` と `skillHandlers.integration.test.ts` は Phase 4 でテスト実行して影響を確認する
5. skill:improve の `args.analysis` throw 変更に対応するテストも追加する
6. 新規P42バリデーションテストは `skillHandlers.test.ts` に集約する

### 回帰テスト確認項目

- 既存の正常系テスト（正常な文字列引数での処理）が影響を受けないこと
- バリデーション部分のテストのみ修正が必要
- skill:import / skill:remove の既存テストが変更されていないこと（準拠済みのため修正不要）

## 多角的チェック観点

| 観点                      | 確認結果                                                              | 判定 |
| ------------------------- | --------------------------------------------------------------------- | ---- |
| P42準拠                   | skill:import/remove と同一パターンで整合性あり                        | PASS |
| throw形式影響             | safeInvoke 設計に沿った動作、Renderer修正不要                         | PASS |
| 既存テスト回帰            | バリデーション部分のみ修正、正常系は影響なし                          | PASS |
| セキュリティ              | IPC層早期拒否、スペースのみ入力拒否で P42 パターン解消                | PASS |
| コード一貫性              | 全11ハンドラのバリデーション形式が統一される                          | PASS |
| エラーメッセージ          | 各ハンドラでパラメータ名が正確に反映（skillId/executionId/skillName） | PASS |
| skill:improve分析チェック | throw形式統一が適用、P42対象外判断も妥当                              | PASS |
| テストファイル網羅性      | 5ファイル全てが設計に記載                                             | PASS |
| バリデーション共通化      | インライン記述で一貫性を優先する判断は妥当                            | PASS |
| 後方互換性                | バリデーションエラーは不正入力時のみ発生、正常フロー影響なし          | PASS |

## 成果物

| #   | 成果物             | パス                                                                                    | 形式     |
| --- | ------------------ | --------------------------------------------------------------------------------------- | -------- |
| 1   | 設計レビュー結果書 | docs/30-workflows/completed-tasks/skill-validation-consistency/phase-3-design-review.md | Markdown |

## 完了条件チェックリスト

- [ ] 要件カバレッジ検証が完了している（FR1-FR3、NFR1-NFR5）
- [ ] P42準拠パターンとの整合性が確認されている（5項目全て検証）
- [ ] throw形式変更のRenderer側影響が評価されている（リスク評価マトリクス完成）
- [ ] テスト設計の妥当性が検証されている（30テストケースのカバレッジ確認）
- [ ] 既存テスト回帰リスクが評価されている（5テストファイル全て確認）
- [ ] skill:improve の `args.analysis` バリデーション修正が検証されている
- [ ] テスト対象ファイル網羅性が検証されている（5ファイル全て記載確認）
- [ ] レビューゲート判定（PASS/MINOR/MAJOR）が記録されている
- [ ] Phase 4 への引き継ぎ事項が明記されている

## 次のPhase

-> Phase 4: テスト作成（`phase-4-test-creation.md`）
