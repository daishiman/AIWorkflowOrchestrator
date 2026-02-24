# Phase 9: 品質保証 - タスク仕様書

## メタ情報

| 項目             | 内容                                                                              |
| ---------------- | --------------------------------------------------------------------------------- |
| Phase            | 9                                                                                 |
| Phase名          | 品質保証                                                                          |
| タスクID         | UT-FIX-SKILL-VALIDATION-CONSISTENCY-001                                           |
| タスク名         | skill:ハンドラP42準拠バリデーション形式統一                                       |
| 分類             | セキュリティ                                                                      |
| 優先度           | 中                                                                                |
| 規模             | 小規模                                                                            |
| Issue            | #874                                                                              |
| 前提Phase        | Phase 8（リファクタリング）                                                       |
| 後続Phase        | Phase 10（最終レビューゲート）                                                    |
| ステータス       | 未着手                                                                            |
| 作成日           | 2026-02-24                                                                        |
| 機能名           | skill-validation-consistency                                                      |
| 前Phase成果物    | `docs/30-workflows/completed-tasks/skill-validation-consistency/outputs/phase-8/` |
| 修正対象ファイル | `apps/desktop/src/main/ipc/skillHandlers.ts`                                      |
| テストファイル   | `apps/desktop/src/main/ipc/__tests__/skillHandlers*.test.ts`（5ファイル）         |

---

## 目的

TypeScript 型チェック、ESLint、セキュリティ検証、テスト実行の4観点からコード品質を網羅的に検証し、品質ゲートを通過させる。

全11ハンドラが P42 準拠3段バリデーション（型チェック → 空文字列 → トリム空文字列）と throw 形式エラーレスポンスを正しく実装し、プロジェクト品質基準（Line Coverage 80%+、Branch Coverage 60%+、Function Coverage 80%+）を満たしていることを確認する。

**本Phaseの位置付け**: Phase 8（リファクタリング）で改善されたコードが、プロジェクト全体の品質基準を満たしているかの最終確認ゲートである。1項目でも基準未達の場合は、該当するPhaseに戻って修正する。

---

## 実行タスク

- 型検証: TypeScript型エラー0件を確認する。
- 静的検証: ESLintエラー0件を確認する。
- セキュリティ検証: P42/IPC観点の実装準拠を確認する。
- テスト検証: 対象テストとカバレッジ基準達成を確認する。
- 品質判定: 品質ゲート総合判定を確定する。

> 以下のタスクを **順番に** 実行してください。前のタスクが失敗した場合は、失敗対応を完了してから次のタスクに進んでください。

### タスク1: TypeScript 型チェック

**目的**: TypeScript コンパイラによる型エラーが0件であることを確認する

**実行手順**:

1. 以下のコマンドを実行する
2. 出力を確認し、エラーが0件であることを確認する
3. エラーがある場合は修正する

**コマンド**:

```bash
# 実行ディレクトリ: リポジトリルート
pnpm typecheck
```

**確認ポイント**:

| チェック項目                                          | 確認内容                                                                             |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `skillHandlers.ts` の型エラー                         | バリデーション追加・throw形式変更に起因する型エラーが0件                             |
| ヘルパー関数の `asserts` 型（Phase 8 で導入した場合） | `asserts value is string` の型ナローイングが TypeScript コンパイラで正しく検証される |
| throw 形式エラーオブジェクトの型                      | `{ code: string; message: string }` 形式の型互換性が保たれている                     |
| Renderer 側への型影響                                 | throw 形式変更が `apps/desktop/src/preload/` 配下の型に影響していない                |

**成功時の出力例**:

```
$ pnpm typecheck
（エラー出力なし、もしくは "Found 0 errors."）
```

**失敗時のアクション**:

- 型エラーが `skillHandlers.ts` に起因する場合: 該当行を修正し、再度 `pnpm typecheck` を実行する
- 型エラーが他ファイルに起因する場合: Phase 8 のリファクタリングが波及した可能性を調査する。影響範囲が `skillHandlers.ts` 内であれば修正する。影響範囲が他ファイルに及ぶ場合は Phase 5 に戻る

**期待される成果物**: `outputs/phase-9/typecheck-report.md`

以下の内容を記録すること:

- 実行コマンドと実行ディレクトリ
- 出力結果（成功の場合は「エラー0件」、失敗の場合はエラー全文）
- 修正した場合は修正内容

---

### タスク2: ESLint チェック

**目的**: ESLint ルールへの完全準拠を確認する

**実行手順**:

1. 以下のコマンドを実行する
2. エラー・警告を確認する
3. エラーがある場合は自動修正を試み、残ったエラーは手動で修正する

**コマンド**:

```bash
# 実行ディレクトリ: リポジトリルート
# Step 1: Lint実行（エラー確認）
pnpm --filter @repo/desktop lint

# Step 2: 自動修正（エラーがある場合のみ）
pnpm --filter @repo/desktop lint -- --fix
```

**検証対象ファイル**:

| ファイル                                     | 確認項目                                             |
| -------------------------------------------- | ---------------------------------------------------- |
| `apps/desktop/src/main/ipc/skillHandlers.ts` | 全11ハンドラのバリデーション部分が ESLint ルール準拠 |

**重点チェック項目**:

| ESLint ルール                        | 確認内容                                                      |
| ------------------------------------ | ------------------------------------------------------------- |
| `no-unused-vars`                     | 未使用の変数・インポートが残っていないか                      |
| `@typescript-eslint/no-explicit-any` | `any` 型が使用されていないか                                  |
| `no-console`                         | `console.log` が残っていないか（`electron-log` を使用すべき） |
| `prefer-const`                       | 再代入しない変数が `const` で宣言されているか                 |

**成功時の出力例**:

```
$ pnpm --filter @repo/desktop lint
（エラー・警告なし）
```

**失敗時のアクション**:

- 自動修正可能なエラー（フォーマット系）: `--fix` で自動修正する
- 自動修正不可のエラー: 手動で修正し、再度 Lint を実行する
- 修正後は必ず `cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers --reporter=verbose` でテストが PASS することを確認する

**期待される成果物**: `outputs/phase-9/lint-report.md`

以下の内容を記録すること:

- 実行コマンドと実行ディレクトリ
- 出力結果（エラー0件 or エラー内容）
- 自動修正・手動修正の内容（修正した場合）

---

### タスク3: セキュリティ検証

**目的**: 全11ハンドラの P42 準拠バリデーションと IPC セキュリティ要件が満たされていることを、コード読み取りにより確認する

**実行手順**:

1. `apps/desktop/src/main/ipc/skillHandlers.ts` を開く
2. 全11ハンドラについて、以下の「P42準拠バリデーションマトリクス」を埋める
3. 全セルが OK であることを確認する
4. NG がある場合は Phase 5 に戻り修正する

**P42準拠バリデーションマトリクス**:

以下のテーブルの各セルを、実際のコードを目視で確認して `OK` / `NG` / `N/A` のいずれかで埋めること。

| ハンドラ                | typeof チェック | trim チェック | throw 形式 | validateIpcSender | IPC_CHANNELS 定数使用 |
| ----------------------- | --------------- | ------------- | ---------- | ----------------- | --------------------- |
| skill:list              | N/A（引数なし） | N/A           | N/A        | -（確認して記入） | -                     |
| skill:scan              | N/A（引数なし） | N/A           | N/A        | -                 | -                     |
| skill:getImported       | N/A（引数なし） | N/A           | N/A        | -                 | -                     |
| skill:import            | -               | -             | -          | -                 | -                     |
| skill:remove            | -               | -             | -          | -                 | -                     |
| skill:get-detail        | -               | -             | -          | -                 | -                     |
| skill:execute           | -               | -             | -          | -                 | -                     |
| skill:abort             | -               | -             | -          | -                 | -                     |
| skill:get-status        | -               | -             | -          | -                 | -                     |
| skill:analyze           | -               | -             | -          | -                 | -                     |
| skill:improve           | -               | -             | -          | -                 | -                     |
| skill:optimize          | -               | -             | -          | -                 | -                     |
| skill:optimize:variants | -               | -             | -          | -                 | -                     |
| skill:optimize:evaluate | -               | -             | -          | -                 | -                     |

**ハードコード文字列検出コマンド**:

```bash
# 実行ディレクトリ: リポジトリルート
# P27対策: safeInvoke/safeOn でハードコード文字列が使われていないか確認
grep -n "safeInvoke\|safeOn" apps/desktop/src/preload/skill-api.ts | grep -v "IPC_CHANNELS"

# skillHandlers.ts 内でハードコードチャンネル名が使われていないか確認
grep -n "ipcMain.handle\|ipcMain.on" apps/desktop/src/main/ipc/skillHandlers.ts | grep -v "IPC_CHANNELS"
```

**エラー情報非漏洩の確認**:

throw 形式のエラーオブジェクトに、以下の内部情報が含まれていないことを確認する。

| 漏洩してはならない情報 | 確認方法                                                               |
| ---------------------- | ---------------------------------------------------------------------- |
| ファイルパス           | エラーメッセージに `/Users/` や `C:\` 等のパスが含まれていないか       |
| スタックトレース       | エラーオブジェクトに `stack` プロパティが含まれていないか              |
| API キー・トークン     | エラーメッセージに認証情報が含まれていないか                           |
| 内部関数名             | エラーメッセージに `SkillService.xxx` 等の内部実装名が含まれていないか |

**失敗時のアクション**:

- P42 準拠バリデーションが不足しているハンドラがある場合: Phase 5 に戻り、該当ハンドラにバリデーションを追加する
- validateIpcSender が不足しているハンドラがある場合: Phase 5 に戻り追加する
- ハードコード文字列が検出された場合: `IPC_CHANNELS` 定数に置き換える

**期待される成果物**: `outputs/phase-9/security-report.md`

以下の内容を記録すること:

- P42準拠バリデーションマトリクス（全セル記入済み）
- ハードコード文字列検出コマンドの実行結果
- エラー情報非漏洩の確認結果
- NG がある場合の対応方針

---

### タスク4: テスト実行・カバレッジ確認

**目的**: 対象テストファイル（5ファイル）の全テストが成功し、カバレッジ基準を満たしていることを確認する

**実行手順**:

1. 対象テストを verbose モードで実行し、全テスト名と結果を確認する
2. カバレッジ付きで実行し、基準との照合を行う
3. デスクトップアプリ全体のテストを実行し、リグレッションがないことを確認する

**コマンド**:

```bash
# ====================================================================
# Step 1: 対象テストの実行（verbose モードで全テスト名を確認）
# 実行ディレクトリ: apps/desktop（P40対策）
# ====================================================================
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers --reporter=verbose

# ====================================================================
# Step 2: カバレッジ付き実行
# 実行ディレクトリ: apps/desktop（P40対策）
# ====================================================================
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers --coverage

# ====================================================================
# Step 3: デスクトップアプリ全体のテスト実行（リグレッション確認）
# 実行ディレクトリ: apps/desktop（P40対策）
# ====================================================================
cd apps/desktop && pnpm vitest run
```

> **P40対策**: 3つのコマンド全てで `cd apps/desktop` してから実行すること。リポジトリルートから `pnpm vitest run apps/desktop/src/...` を実行すると `apps/desktop/vitest.config.ts` の `environment: "happy-dom"` 設定と `setupFiles` が読み込まれず、`document is not defined` エラーで全テストが失敗する。

**Step 1 の確認チェックリスト**:

| テストファイル                    | 期待される結果 | 実際の結果 |
| --------------------------------- | -------------- | ---------- |
| skillHandlers.test.ts             | 全テスト PASS  | -          |
| skillHandlers.execute.test.ts     | 全テスト PASS  | -          |
| skillHandlers.delegate.test.ts    | 全テスト PASS  | -          |
| skillHandlers.improve.test.ts     | 全テスト PASS  | -          |
| skillHandlers.integration.test.ts | 全テスト PASS  | -          |

**Step 2 のカバレッジ基準**:

| 指標              | 最低基準 | 推奨基準 | 実績 | 判定 |
| ----------------- | -------- | -------- | ---- | ---- |
| Line Coverage     | 80%      | 90%      | -    | -    |
| Branch Coverage   | 60%      | 70%      | -    | -    |
| Function Coverage | 80%      | 90%      | -    | -    |

**Step 3 の確認事項**:

| 確認項目   | 基準             | 実際の結果 |
| ---------- | ---------------- | ---------- |
| テスト総数 | -（記録）        | -          |
| 成功数     | テスト総数と一致 | -          |
| 失敗数     | 0                | -          |
| スキップ数 | -（記録）        | -          |

**失敗時のアクション**:

| 失敗パターン                             | アクション                                                                                        |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Step 1: 対象テストが失敗                 | 失敗テストのエラーメッセージを確認し、Phase 5（実装）または Phase 6（テスト拡充）に戻って修正する |
| Step 2: カバレッジ基準未達               | `outputs/phase-9/test-coverage-report.md` に未カバー行を記録し、Phase 6（テスト拡充）に戻る       |
| Step 3: 他テストが失敗（リグレッション） | `git diff` で変更内容を確認し、リグレッションの原因を特定する。Phase 5 に戻って修正する           |

**期待される成果物**: `outputs/phase-9/test-coverage-report.md`

以下の内容を記録すること:

- Step 1: 各テストファイルの PASS/FAIL 結果と全テスト名一覧
- Step 2: カバレッジ値（Line/Branch/Function）と基準との照合結果
- Step 3: 全体テストの結果サマリ（テスト総数/成功数/失敗数/スキップ数）
- 失敗があった場合の原因と対応内容

---

### タスク5: 品質ゲート総合判定

**目的**: タスク1-4の結果を統合し、品質ゲートの全項目を通過しているか総合判定する

**実行手順**:

1. タスク1-4の成果物（4ファイル）を全て確認する
2. 以下の「品質ゲートチェックリスト」の全項目を埋める
3. 総合判定を記録する

**品質ゲートチェックリスト**:

#### 機能検証

- [ ] 全ユニットテスト成功（5テストファイル、失敗0件）
- [ ] 11ハンドラ全てのバリデーションテストが PASS
- [ ] Phase 5 で新規追加したバリデーションテスト（6ハンドラ x 5パターン = 30ケース）が PASS

#### コード品質

- [ ] TypeScript 型エラーが0件（`pnpm typecheck` 成功）
- [ ] ESLint エラーが0件（`pnpm --filter @repo/desktop lint` 成功）
- [ ] コードフォーマットが Prettier 適用済み

#### テスト網羅性

- [ ] Line Coverage 80% 以上達成
- [ ] Branch Coverage 60% 以上達成
- [ ] Function Coverage 80% 以上達成

#### セキュリティ

- [ ] 全11ハンドラで P42 準拠3段バリデーション実施確認済み（引数を持つ全ハンドラ）
- [ ] 全14ハンドラで validateIpcSender 実施確認済み
- [ ] throw 形式エラーレスポンスで内部情報非漏洩確認済み
- [ ] チャンネル名のハードコード文字列なし確認済み（P27対策）

#### リグレッション

- [ ] デスクトップアプリ全体テスト（`cd apps/desktop && pnpm vitest run`）で失敗0件

**総合判定テーブル**:

| 品質項目           | 結果  | 備考 |
| ------------------ | ----- | ---- |
| TypeCheck          | -     | -    |
| Lint               | -     | -    |
| Security (P42準拠) | -     | -    |
| Test (対象テスト)  | -     | -    |
| Coverage           | -     | -    |
| Regression (全体)  | -     | -    |
| **総合判定**       | **-** | -    |

**総合判定の基準**:

| 判定 | 条件           | 次のアクション          |
| ---- | -------------- | ----------------------- |
| PASS | 全項目が OK    | Phase 10 へ進む         |
| FAIL | 1項目以上が NG | NG項目の原因Phaseに戻る |

**期待される成果物**: `outputs/phase-9/quality-gate-result.md`

以下の内容を記録すること:

- 品質ゲートチェックリスト（全項目チェック済み）
- 総合判定テーブル（全セル記入済み）
- 総合判定結果（PASS or FAIL）
- FAIL の場合: NG 項目の一覧と、戻り先の Phase

---

## 参照資料

### 前Phase成果物

| 参照資料       | パス                                                                              | 内容                 |
| -------------- | --------------------------------------------------------------------------------- | -------------------- |
| Phase 8 成果物 | `docs/30-workflows/completed-tasks/skill-validation-consistency/outputs/phase-8/` | リファクタリング結果 |
| Phase 7 成果物 | `docs/30-workflows/completed-tasks/skill-validation-consistency/outputs/phase-7/` | カバレッジ確認結果   |
| Phase 5 成果物 | `docs/30-workflows/completed-tasks/skill-validation-consistency/outputs/phase-5/` | 実装結果             |

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
| P27: ハードコード | `.claude/rules/06-known-pitfalls.md` (P27)                                        | Preloadハードコード文字列   |
| セキュリティ原則  | `.claude/rules/04-electron-security.md`                                           | IPC入力バリデーション       |
| セキュリティ詳細  | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`         | スキルIPC セキュリティ仕様  |
| IPC契約チェック   | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`     | 契約ドリフト防止の検証観点  |
| Skill API契約     | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | API契約の整合確認           |
| IPC API仕様       | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`              | IPCチャネル仕様との整合確認 |
| エラー分類        | `.claude/skills/aiworkflow-requirements/references/error-handling.md`             | Validation Error判定基準    |
| コード品質基準    | `.claude/rules/02-code-quality.md`                                                | 品質ルール                  |

---

## 成果物

| #   | 成果物               | パス                                      | 内容                     |
| --- | -------------------- | ----------------------------------------- | ------------------------ |
| 1   | 型チェックレポート   | `outputs/phase-9/typecheck-report.md`     | TypeScript型チェック結果 |
| 2   | Lintレポート         | `outputs/phase-9/lint-report.md`          | ESLint結果               |
| 3   | セキュリティレポート | `outputs/phase-9/security-report.md`      | P42準拠・IPC安全性確認   |
| 4   | テスト・カバレッジ   | `outputs/phase-9/test-coverage-report.md` | テスト結果とカバレッジ   |
| 5   | 品質ゲート結果       | `outputs/phase-9/quality-gate-result.md`  | 総合判定                 |

---

## 統合テスト連携【必須】

> 品質保証で全テスト結果を確認する

| 確認項目                    | 基準                                                        |
| --------------------------- | ----------------------------------------------------------- |
| 全テスト                    | 5テストファイル 100% PASS                                   |
| P42準拠バリデーションテスト | 全11ハンドラでtrim空文字列拒否テスト PASS（引数ありのもの） |
| throw形式テスト             | バリデーションエラー時の throw 形式レスポンステスト PASS    |
| エラーハンドリングテスト    | Renderer 側でのエラー受信テスト影響なし                     |
| リグレッションテスト        | デスクトップアプリ全体テスト失敗0件                         |

---

## 多角的チェック観点

| 観点               | 確認ポイント                                                                            |
| ------------------ | --------------------------------------------------------------------------------------- |
| セキュリティ       | P42準拠3段バリデーションが全ハンドラの全 string 引数に適用されている                    |
| エラーハンドリング | throw 形式変更が Renderer 側の既存エラーハンドリングコード（safeInvoke の catch）と互換 |
| IPC契約整合性      | 04-electron-security.md の IPC 入力バリデーション原則との整合性                         |
| カバレッジ         | Line 80%+, Branch 60%+, Function 80%+ の3指標全てが基準を満たしている                   |
| リグレッション     | 本タスクの変更が skill 以外のハンドラ・コンポーネントに影響していない                   |

---

## 完了条件

- [ ] タスク1: TypeScript 型チェックがエラー0件で通過している
- [ ] タスク2: ESLint チェックがエラー0件で通過している
- [ ] タスク3: 全ハンドラの P42 準拠バリデーションマトリクスが全て OK / N/A である
- [ ] タスク4: 全テストが PASS し、カバレッジ基準（Line 80%+, Branch 60%+, Function 80%+）を達成している
- [ ] タスク4: デスクトップアプリ全体テストでリグレッションが0件である
- [ ] タスク5: 品質ゲート総合判定が PASS である
- [ ] 成果物（5ファイル）が全て `outputs/phase-9/` に生成されている
- [ ] **本Phase内の全タスク（5タスク）を100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（5タスク）を100%実行完了
- [ ] 各タスクを100%完了し、成果物に完了を明記
- [ ] 成果物（5ファイル）が全て生成されていることを確認
- [ ] 品質ゲート全項目 PASS を確認
- [ ] `artifacts.json` の Phase 9 ステータスを `completed` に更新

---

## 依存関係

- **前提**: Phase 8（リファクタリング）が完了していること
- **後続**: Phase 10（最終レビューゲート）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/completed-tasks/skill-validation-consistency/phase-10-final-review.md`
