# Phase 10: 最終レビューゲート — skill:ハンドラP42準拠バリデーション形式統一

## メタ情報

| 項目          | 内容                                        |
| ------------- | ------------------------------------------- |
| タスクID      | UT-FIX-SKILL-VALIDATION-CONSISTENCY-001     |
| タスク名      | skill:ハンドラP42準拠バリデーション形式統一 |
| Phase         | 10 — 最終レビューゲート                     |
| 分類          | セキュリティ                                |
| 優先度        | 中                                          |
| 規模          | 小規模                                      |
| Issue         | #874                                        |
| 作成日        | 2026-02-24                                  |
| 前提Phase     | Phase 9（品質保証）                         |
| 後続Phase     | Phase 11（手動テスト検証）                  |
| ステータス    | 未着手                                      |
| 前Phase成果物 | `outputs/phase-9/quality-gate-result.md`    |
| 機能名        | skill-validation-consistency                |

---

## 目的

Phase 1〜9 で要件定義・設計・実装・テスト・品質保証を完了した P42 準拠バリデーション修正について、多角的品質・整合性検証を実施する。セキュリティ・コード一貫性・テスト品質・後方互換性の観点から最終確認を行い、手動テストフェーズに進む前の品質ゲートとする。

## 背景

skillHandlers.ts 内の6ハンドラ（skill:get-detail, skill:execute, skill:abort, skill:get-status, skill:analyze, skill:improve）に P42 準拠3段バリデーション（型チェック→空文字列→トリム空文字列）と throw 形式エラーレスポンスを追加した。既に準拠済みの5ハンドラ（skill:import, skill:remove, skill:optimize, skill:optimize:variants, skill:optimize:evaluate）と合わせて全11ハンドラでバリデーション形式が統一されたことを検証する。

---

## 実行タスク

- P42準拠検証: 修正6ハンドラの検証パターン準拠を確認する。
- throw統一検証: 全11ハンドラのエラー形式統一を確認する。
- セキュリティレビュー: IPC安全性と情報漏洩対策を確認する。
- テスト品質レビュー: カバレッジとエッジケース網羅を確認する。
- 後方互換性確認: safeInvoke経路の互換性を確認する。
- ゲート判定: PASS/MINOR/MAJOR/CRITICALを決定する。

> 以下の Step を Step 1 から Step 6 まで順番に実行する。各 Step の結果を記録してから次の Step に進むこと。

| #   | Step                       | 説明                                                            |
| --- | -------------------------- | --------------------------------------------------------------- |
| 1   | P42準拠性の検証            | 全6ハンドラのバリデーションコードがP42パターンに準拠しているか  |
| 2   | throw形式統一性の検証      | 既準拠5ハンドラと修正6ハンドラのパターン一致確認                |
| 3   | セキュリティ観点のレビュー | 04-electron-security.md準拠のIPC入力バリデーション確認          |
| 4   | テスト品質のレビュー       | カバレッジ基準達成・エッジケース網羅の確認                      |
| 5   | 後方互換性の確認           | Renderer側safeInvokeエラーハンドリングとの互換性確認            |
| 6   | レビューゲート判定         | PASS/MINOR/MAJOR/CRITICAL の判定。MINOR時は未タスク仕様書を作成 |

---

## 参照資料

### 前Phase成果物

| 参照資料          | パス                                                                                       | 内容                                 |
| ----------------- | ------------------------------------------------------------------------------------------ | ------------------------------------ |
| Phase 1要件定義   | `docs/30-workflows/completed-tasks/skill-validation-consistency/phase-1-requirements.md`   | 機能要件FR1-FR3、非機能要件NFR1-NFR5 |
| Phase 2設計       | `docs/30-workflows/completed-tasks/skill-validation-consistency/phase-2-design.md`         | 修正詳細設計                         |
| Phase 3レビュー   | `docs/30-workflows/completed-tasks/skill-validation-consistency/phase-3-design-review.md`  | 設計レビュー結果（PASS判定）         |
| Phase 5実装       | `docs/30-workflows/completed-tasks/skill-validation-consistency/phase-5-implementation.md` | 実装内容と修正範囲                   |
| Phase 9品質ゲート | `outputs/phase-9/quality-gate-result.md`                                                   | 品質保証結果                         |

### ソースコード

| 参照資料          | パス                                                         | 内容                            |
| ----------------- | ------------------------------------------------------------ | ------------------------------- |
| IPCハンドラー実装 | `apps/desktop/src/main/ipc/skillHandlers.ts`                 | Main Process ハンドラー（11個） |
| Preload API       | `apps/desktop/src/preload/skill-api.ts`                      | Preload API 実装                |
| テストファイル    | `apps/desktop/src/main/ipc/__tests__/skillHandlers*.test.ts` | テストコード                    |

### システム仕様

| 参照資料         | パス                                                                              | 内容                      |
| ---------------- | --------------------------------------------------------------------------------- | ------------------------- |
| P42: trim漏れ    | `.claude/rules/06-known-pitfalls.md` (P42)                                        | 3段バリデーション標準     |
| セキュリティ原則 | `.claude/rules/04-electron-security.md`                                           | IPC入力バリデーション原則 |
| セキュリティ詳細 | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`         | スキルIPCセキュリティ仕様 |
| IPC契約チェック  | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`     | IPC契約ドリフト防止       |
| Skill API契約    | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | Preload契約との整合確認   |
| IPC API仕様      | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`              | IPCチャネル仕様の最終確認 |
| エラー分類       | `.claude/skills/aiworkflow-requirements/references/error-handling.md`             | Validation Error判定基準  |
| コード品質基準   | `.claude/rules/02-code-quality.md`                                                | 品質ルール                |

---

## 実行手順

### Step 1: P42準拠性の検証

**目的**: 修正対象6ハンドラの全文字列引数に P42 準拠3段バリデーション（型チェック→空文字列→トリム空文字列）が実装されていることを確認する

**実行手順**:

1. `apps/desktop/src/main/ipc/skillHandlers.ts` を読み込む
2. 修正対象6ハンドラのバリデーションコードを1つずつ確認する
3. 各ハンドラで以下の P42 準拠パターンが実装されているか検証する:
   - `typeof value !== "string"` — 文字列型であることを検証
   - `value.trim() === ""` — 空文字列およびスペースのみの入力を拒否
   - `throw { code: "VALIDATION_ERROR", message: "..." }` — 統一エラー形式

**P42準拠3段バリデーション検証マトリクス**:

以下の各セルについて、実装コードと照合して結果（PASS/FAIL）を記入する。

| ハンドラ         | 値アクセス        | typeof チェック                       | .trim() === "" チェック        | throw形式               | エラーコード       | エラーメッセージ                         | 結果 |
| ---------------- | ----------------- | ------------------------------------- | ------------------------------ | ----------------------- | ------------------ | ---------------------------------------- | ---- |
| skill:get-detail | `args?.skillId`   | `typeof args?.skillId !== "string"`   | `args.skillId.trim() === ""`   | throw { code, message } | `VALIDATION_ERROR` | `skillId must be a non-empty string`     | -    |
| skill:execute    | `args?.skillId`   | `typeof args?.skillId !== "string"`   | `args.skillId.trim() === ""`   | throw { code, message } | `VALIDATION_ERROR` | `skillId must be a non-empty string`     | -    |
| skill:abort      | `executionId`     | `typeof executionId !== "string"`     | `executionId.trim() === ""`    | throw { code, message } | `VALIDATION_ERROR` | `executionId must be a non-empty string` | -    |
| skill:get-status | `executionId`     | `typeof executionId !== "string"`     | `executionId.trim() === ""`    | throw { code, message } | `VALIDATION_ERROR` | `executionId must be a non-empty string` | -    |
| skill:analyze    | `args?.skillName` | `typeof args?.skillName !== "string"` | `args.skillName.trim() === ""` | throw { code, message } | `VALIDATION_ERROR` | `skillName must be a non-empty string`   | -    |
| skill:improve    | `args?.skillName` | `typeof args?.skillName !== "string"` | `args.skillName.trim() === ""` | throw { code, message } | `VALIDATION_ERROR` | `skillName must be a non-empty string`   | -    |

**検証コマンド**:

```bash
# 各ハンドラのバリデーション部分を確認
grep -n "trim()" apps/desktop/src/main/ipc/skillHandlers.ts
grep -n "VALIDATION_ERROR" apps/desktop/src/main/ipc/skillHandlers.ts
```

**判定基準**: 全6ハンドラの全カラムが PASS であること。1つでも FAIL の場合は MAJOR 判定（Phase 5 へ差し戻し）。

**期待される成果物**: `outputs/phase-10/p42-compliance-review.md`

---

### Step 2: throw形式統一性の検証

**目的**: 修正した6ハンドラと既に P42 準拠済みの5ハンドラ（skill:import, skill:remove, skill:optimize, skill:optimize:variants, skill:optimize:evaluate）が同一のバリデーションパターンであることを確認する

**実行手順**:

1. 準拠済みハンドラのバリデーションコードを参照実装として読み込む（skill:import を基準とする）
2. 修正6ハンドラのバリデーションコードと1つずつ比較する
3. 以下の4項目が全て一致していることを確認する

**参照実装（skill:import のバリデーションコード）**:

```typescript
// skill:import（準拠済み — 参照実装）
if (typeof skillName !== "string" || skillName.trim() === "") {
  throw {
    code: "VALIDATION_ERROR",
    message: "skillName must be a non-empty string",
  };
}
```

**パターン一致確認テーブル**:

| 比較項目                       | 準拠済みパターン（skill:import参照）                 | 修正6ハンドラと一致するか | 結果 |
| ------------------------------ | ---------------------------------------------------- | ------------------------- | ---- |
| バリデーション条件式の構造     | `typeof x !== "string" \|\| x.trim() === ""`         | -                         | -    |
| throw オブジェクトの形式       | `throw { code: "VALIDATION_ERROR", message: "..." }` | -                         | -    |
| エラーメッセージのフォーマット | `${paramName} must be a non-empty string`            | -                         | -    |
| バリデーション実行タイミング   | ハンドラ先頭（validateIpcSender直後）                | -                         | -    |

**全11ハンドラ統一確認マトリクス**:

| #   | ハンドラ                | P42準拠 | throw形式 | パターン統一 | 結果 |
| --- | ----------------------- | ------- | --------- | ------------ | ---- |
| 1   | skill:import            | 既準拠  | 既準拠    | 参照実装     | -    |
| 2   | skill:remove            | 既準拠  | 既準拠    | -            | -    |
| 3   | skill:get-detail        | 修正済  | 修正済    | -            | -    |
| 4   | skill:execute           | 修正済  | 修正済    | -            | -    |
| 5   | skill:abort             | 修正済  | 修正済    | -            | -    |
| 6   | skill:get-status        | 修正済  | 修正済    | -            | -    |
| 7   | skill:analyze           | 修正済  | 修正済    | -            | -    |
| 8   | skill:improve           | 修正済  | 修正済    | -            | -    |
| 9   | skill:optimize          | 既準拠  | 既準拠    | -            | -    |
| 10  | skill:optimize:variants | 既準拠  | 既準拠    | -            | -    |
| 11  | skill:optimize:evaluate | 既準拠  | 既準拠    | -            | -    |

**判定基準**: 全11ハンドラのバリデーションパターンが統一されていること。パターン不一致がある場合は MAJOR 判定（Phase 5 へ差し戻し）。

**期待される成果物**: `outputs/phase-10/throw-consistency-review.md`

---

### Step 3: セキュリティ観点のレビュー

**目的**: 04-electron-security.md に規定された IPC セキュリティ原則への準拠を確認する

**実行手順**:

1. 全11ハンドラで `validateIpcSender()` が実施されていることを確認する
2. エラーレスポンスに内部情報（スタックトレース、ファイルパス、クラス名）が含まれていないことを確認する
3. チャンネル名が `IPC_CHANNELS` 定数で参照されていることを確認する（P27 対策）
4. Preload 側で safeInvoke が `IPC_CHANNELS` 定数を使用していることを確認する

**セキュリティレビューマトリクス**:

| #   | ハンドラ                | validateIpcSender | IPC_CHANNELS定数 | エラー情報非漏洩 | 結果 |
| --- | ----------------------- | ----------------- | ---------------- | ---------------- | ---- |
| 1   | skill:list              | -                 | -                | -                | -    |
| 2   | skill:import            | -                 | -                | -                | -    |
| 3   | skill:remove            | -                 | -                | -                | -    |
| 4   | skill:get-detail        | -                 | -                | -                | -    |
| 5   | skill:execute           | -                 | -                | -                | -    |
| 6   | skill:abort             | -                 | -                | -                | -    |
| 7   | skill:get-status        | -                 | -                | -                | -    |
| 8   | skill:analyze           | -                 | -                | -                | -    |
| 9   | skill:improve           | -                 | -                | -                | -    |
| 10  | skill:optimize          | -                 | -                | -                | -    |
| 11  | skill:optimize:variants | -                 | -                | -                | -    |

**ハードコード文字列検出コマンド**:

```bash
# safeInvokeでハードコード文字列が使われていないか確認（P27対策）
grep -rn "safeInvoke\|safeOn" apps/desktop/src/preload/skill-api.ts | grep -v "IPC_CHANNELS"
```

**エラー情報漏洩チェックリスト**:

| チェック項目                                       | 確認方法                                                  | 結果 |
| -------------------------------------------------- | --------------------------------------------------------- | ---- |
| エラーメッセージにファイルパスが含まれていない     | throw オブジェクトの `message` フィールドを全ハンドラ確認 | -    |
| エラーメッセージにスタックトレースが含まれていない | throw オブジェクトに `stack` プロパティがないことを確認   | -    |
| エラーメッセージに内部クラス名が含まれていない     | `message` フィールドの文言を目視確認                      | -    |

**判定基準**: 全セキュリティチェックが PASS であること。validateIpcSender 未実施またはエラー情報漏洩がある場合は CRITICAL 判定（Phase 1 へ差し戻し）。

**期待される成果物**: `outputs/phase-10/security-review.md`

---

### Step 4: テスト品質のレビュー

**目的**: テストカバレッジ基準の達成とエッジケース網羅を確認する

**実行手順**:

1. Phase 9 の品質ゲート結果（`outputs/phase-9/quality-gate-result.md`）を読み込む
2. カバレッジ基準との照合を行う
3. 修正6ハンドラのバリデーションテストが全入力パターンをカバーしているか確認する
4. 既存テストの throw 形式への更新が完了しているか確認する

**カバレッジ基準確認テーブル**:

| 指標              | 最低基準 | 推奨基準 | Phase 9 実績 | 判定 |
| ----------------- | -------- | -------- | ------------ | ---- |
| Line Coverage     | 80%      | 90%      | -            | -    |
| Branch Coverage   | 60%      | 70%      | -            | -    |
| Function Coverage | 80%      | 90%      | -            | -    |

**バリデーションテスト網羅性マトリクス**:

各ハンドラのテストファイルで、以下の全入力パターンのテストケースが存在し PASS していることを確認する。

| 入力パターン           | skill:get-detail | skill:execute | skill:abort | skill:get-status | skill:analyze | skill:improve |
| ---------------------- | ---------------- | ------------- | ----------- | ---------------- | ------------- | ------------- |
| `"   "` (スペースのみ) | -                | -             | -           | -                | -             | -             |
| `""` (空文字列)        | -                | -             | -           | -                | -             | -             |
| `null`                 | -                | -             | -           | -                | -             | -             |
| `undefined`            | -                | -             | -           | -                | -             | -             |
| `123` (数値型)         | -                | -             | -           | -                | -             | -             |

合計: 6ハンドラ x 5パターン = **30テストケース**

**既存テスト更新確認**:

| 確認項目                                                       | 確認方法                                           | 結果 |
| -------------------------------------------------------------- | -------------------------------------------------- | ---- |
| return形式を期待するテストがthrow形式に更新されているか        | `rejects.toMatchObject` でのアサーションを確認     | -    |
| skill:abort の `return false` 期待テストが更新されているか     | abort テストで `rejects.toMatchObject` を確認      | -    |
| skill:get-status の `return null` 期待テストが更新されているか | get-status テストで `rejects.toMatchObject` を確認 | -    |

**テスト実行確認コマンド**:

```bash
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers --reporter=verbose
```

**判定基準**: カバレッジが最低基準以上であり、30テストケースが全て存在し PASS であること。カバレッジ未達の場合は Phase 6（テスト拡充）に差し戻し。テストケース不足の場合は Phase 4（テスト作成）に差し戻し。

**期待される成果物**: `outputs/phase-10/test-quality-review.md`

---

### Step 5: 後方互換性の確認

**目的**: throw 形式への変更が Renderer 側の safeInvoke エラーハンドリングに悪影響を与えないことを確認する

**実行手順**:

1. `apps/desktop/src/preload/skill-api.ts` を読み込み、safeInvoke の使用箇所を確認する
2. safeInvoke が throw（reject）を受け取った場合の動作を確認する
3. Renderer 側で各ハンドラを呼び出しているコンポーネントのエラーハンドリングを確認する
4. 以下の特殊ケースの互換性を検証する

**throw形式変更の影響分析テーブル**:

| ハンドラ         | 変更前の戻り値                     | 変更後の戻り値          | safeInvoke 互換 | Renderer 影響 |
| ---------------- | ---------------------------------- | ----------------------- | --------------- | ------------- |
| skill:get-detail | `{ success: false, error: "..." }` | throw { code, message } | -               | -             |
| skill:execute    | `{ success: false, error: "..." }` | throw { code, message } | -               | -             |
| skill:abort      | `false`                            | throw { code, message } | -               | -             |
| skill:get-status | `null`                             | throw { code, message } | -               | -             |
| skill:analyze    | `{ success: false, error: "..." }` | throw { code, message } | -               | -             |
| skill:improve    | `{ success: false, error: "..." }` | throw { code, message } | -               | -             |

**特殊ケース検証**:

以下3件は throw 形式変更により動作が変わる可能性があるため、重点確認する。

| #   | 特殊ケース                                                   | 検証内容                                                                                                                  | 結果 |
| --- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- | ---- |
| 1   | skill:abort で `return false` → throw に変更した影響         | Renderer 側で abort の戻り値 `false` を「中止不可」として処理しているコードがある場合、バリデーションエラーとの区別が必要 | -    |
| 2   | skill:get-status で `return null` → throw に変更した影響     | Renderer 側で `null` を「ステータスなし」として処理しているコードがある場合、バリデーションエラーとの区別が必要           | -    |
| 3   | safeInvoke が reject を catch した際のエラーオブジェクト形式 | `{ code, message }` 形式がそのまま Renderer に伝播するか、safeInvoke がラップするかを確認                                 | -    |

**safeInvoke 動作確認コマンド**:

```bash
# safeInvoke のエラーハンドリング実装を確認
grep -A 15 "function safeInvoke\|const safeInvoke\|export.*safeInvoke" apps/desktop/src/preload/ipc-utils.ts
```

**Renderer側呼び出し元の確認コマンド**:

```bash
# Renderer側でskill関連APIを呼び出している箇所を検索
grep -rn "electronAPI\.skill\." apps/desktop/src/renderer/
grep -rn "\.abort\|\.getStatus\|\.getDetail\|\.execute\|\.analyze\|\.improve" apps/desktop/src/renderer/ --include="*.ts" --include="*.tsx"
```

**互換性リスク評価**:

バリデーションエラーは通常、Renderer から不正な入力が送信された場合にのみ発生する。正常な使用フローでは空文字列やスペースのみの入力は UI バリデーションで防止されるため、実質的な影響は限定的である。safeInvoke は reject を catch する設計であり、throw 形式は設計に沿った正常な動作である。

**判定基準**: safeInvoke が throw 形式を正しくハンドリングすること。Renderer 側に修正が必要な互換性問題がある場合は MAJOR 判定（Phase 2 へ差し戻し）。

**期待される成果物**: `outputs/phase-10/backward-compatibility-review.md`

---

### Step 6: レビューゲート判定

**目的**: Step 1〜5 の結果を統合し、最終判定（PASS/MINOR/MAJOR/CRITICAL）を決定する

**実行手順**:

1. Step 1〜5 の結果を統合し、問題を重要度別に分類する
2. 判定基準テーブルに基づいて最終判定を決定する
3. MINOR 判定の場合は全ての指摘を未タスク仕様書に変換する（**省略不可**）
4. 判定結果を成果物として記録する

**判定基準テーブル**:

| 判定     | 条件                                               | 次のアクション                                              |
| -------- | -------------------------------------------------- | ----------------------------------------------------------- |
| PASS     | Step 1〜5 の全項目で問題なし                       | Phase 11（手動テスト検証）へ進行                            |
| MINOR    | 軽微な指摘あり（機能・セキュリティに影響なし）     | 全指摘を未タスク仕様書に変換後、Phase 11 へ（**省略不可**） |
| MAJOR    | 重大な問題あり（セキュリティ・機能影響）           | 影響範囲に応じて Phase 1-5 へ戻る                           |
| CRITICAL | 致命的な問題あり（バリデーション欠落・データ漏洩） | Phase 1 へ戻り要件再確認                                    |

**MINOR判定時の未タスク化手順（3ステップ全て必須 — P3 対策）**:

1. 指摘内容を `docs/30-workflows/unassigned-task/` に指示書として作成する
2. `.claude/skills/aiworkflow-requirements/references/task-workflow.md` の残課題テーブルに登録する
3. 関連仕様書に参照リンクを追加する

> 3ステップのうち1つでも未実施の場合、Phase 12 で漏れが発生するため全て必須（P3 再発防止）

**戻り先決定基準**:

| 問題の種類                                 | 戻り先                      |
| ------------------------------------------ | --------------------------- |
| P42準拠バリデーション要件の未充足          | Phase 1（要件定義）         |
| バリデーションパターン設計の問題           | Phase 2（設計）             |
| テスト設計の不足                           | Phase 4（テスト作成）       |
| 実装の問題（バリデーションロジックエラー） | Phase 5（実装）             |
| テストカバレッジ未達                       | Phase 6（テスト拡充）       |
| コード品質の問題（命名不統一等）           | Phase 8（リファクタリング） |

**レビュー結果サマリーテーブル**:

| #   | レビュー観点    | Step   | 結果 | 指摘事項 | 重要度 |
| --- | --------------- | ------ | ---- | -------- | ------ |
| 1   | P42準拠性       | Step 1 | -    | -        | -      |
| 2   | throw形式統一性 | Step 2 | -    | -        | -      |
| 3   | セキュリティ    | Step 3 | -    | -        | -      |
| 4   | テスト品質      | Step 4 | -    | -        | -      |
| 5   | 後方互換性      | Step 5 | -    | -        | -      |
| -   | **最終判定**    | -      | -    | -        | -      |

**期待される成果物**: `outputs/phase-10/final-review-result.md`

---

## 統合テスト連携【必須】

> 最終レビューで統合テスト結果を確認する

| 確認項目                     | 基準                                                   |
| ---------------------------- | ------------------------------------------------------ |
| 全テスト                     | 100% パス                                              |
| P42準拠バリデーションテスト  | 全6ハンドラでtrim空文字列拒否テスト PASS               |
| throw形式テスト              | バリデーションエラー時のthrow形式レスポンステスト PASS |
| 既存テスト回帰               | return→throw変更後も全既存テスト PASS                  |
| Renderer側エラーハンドリング | safeInvoke 経由でのエラー受信に影響なし                |

---

## 多角的チェック観点テーブル

| #   | 観点             | 確認ポイント                                                                | Step   | 結果 |
| --- | ---------------- | --------------------------------------------------------------------------- | ------ | ---- |
| 1   | P42パターン準拠  | 全6ハンドラで `typeof → .trim() === ""` の3段バリデーションが実装されている | Step 1 | -    |
| 2   | コード一貫性     | 修正6ハンドラと既準拠5ハンドラが同一パターンで統一されている                | Step 2 | -    |
| 3   | セキュリティ     | validateIpcSender実施、IPC_CHANNELS定数使用、エラー情報非漏洩               | Step 3 | -    |
| 4   | テスト網羅性     | 6ハンドラ x 5入力パターン = 30テストケースが全て PASS                       | Step 4 | -    |
| 5   | カバレッジ       | Line 80%+、Branch 60%+、Function 80%+ 達成                                  | Step 4 | -    |
| 6   | 後方互換性       | throw形式変更が safeInvoke 経由の Renderer エラーハンドリングに影響しない   | Step 5 | -    |
| 7   | エラーメッセージ | パラメータ名が各ハンドラで正確に反映（skillId / executionId / skillName）   | Step 1 | -    |
| 8   | IPC契約整合性    | 04-electron-security.md の IPC 入力バリデーション原則との整合性             | Step 3 | -    |

---

## 成果物

| #   | 成果物                  | パス                                                | 内容                           |
| --- | ----------------------- | --------------------------------------------------- | ------------------------------ |
| 1   | P42準拠性レビュー       | `outputs/phase-10/p42-compliance-review.md`         | 6ハンドラのP42準拠確認         |
| 2   | throw形式統一性レビュー | `outputs/phase-10/throw-consistency-review.md`      | 全11ハンドラのパターン統一確認 |
| 3   | セキュリティレビュー    | `outputs/phase-10/security-review.md`               | IPC セキュリティ検証           |
| 4   | テスト品質レビュー      | `outputs/phase-10/test-quality-review.md`           | カバレッジ・テスト網羅性       |
| 5   | 後方互換性レビュー      | `outputs/phase-10/backward-compatibility-review.md` | Renderer 互換性確認            |
| 6   | 最終判定結果            | `outputs/phase-10/final-review-result.md`           | PASS/MINOR/MAJOR/CRITICAL 判定 |

---

## 完了条件チェックリスト

- [ ] Step 1: P42準拠3段バリデーションが全6ハンドラで確認済み
- [ ] Step 2: 修正6ハンドラと既準拠5ハンドラのパターンが統一されている
- [ ] Step 3: セキュリティレビューで全11ハンドラが要件を満たしている
- [ ] Step 4: テストカバレッジ基準（Line 80%+, Branch 60%+, Function 80%+）を達成している
- [ ] Step 4: 30テストケース（6ハンドラ x 5パターン）が全て PASS している
- [ ] Step 5: throw形式変更による Renderer 側への悪影響がないことを確認済み
- [ ] Step 6: 最終判定が PASS または MINOR である
- [ ] Step 6: MINOR判定の場合は未タスク仕様書が3ステップ全て完了している
- [ ] 成果物（6ファイル）が全て生成されている
- [ ] **本Phase内の全Step（6 Step）を100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全Step（Step 1〜6）を100%実行完了
- [ ] 各Stepを100%完了し、完了を明記
- [ ] 成果物（6ファイル）が全て生成されていることを確認
- [ ] 判定結果が PASS/MINOR であることを確認（MAJOR/CRITICAL の場合は差し戻し先を記録）
- [ ] `artifacts.json` の Phase 10 ステータスを更新

---

## 依存関係

| 方向 | Phase / タスク         | 内容                      |
| ---- | ---------------------- | ------------------------- |
| 前提 | Phase 9（品質保証）    | 品質ゲート全項目 PASS     |
| 後続 | Phase 11（手動テスト） | PASS/MINOR 判定の場合のみ |

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/completed-tasks/skill-validation-consistency/phase-11-manual-test.md`
