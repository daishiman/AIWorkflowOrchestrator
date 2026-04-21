# Phase 4: テスト作成（TDD Red フェーズ）

## メタ情報

| 項目       | 内容                                 |
| ---------- | ------------------------------------ |
| Phase      | 4                                    |
| タスクID   | TASK-SC-CREATOR-UPDATE-IMPL-001      |
| ステータス | 未実施                               |
| 作成日     | 2026-04-21                           |
| タスク種別 | NON_VISUAL（UI変更なし）             |
| 入力       | Phase 3 ゲート判定（進行可確認済み） |

## 目的

TDD の Red フェーズとして、`SkillCreatorService.runUpdateWorkflow()` の実処理実装に対する
テストファイルを先行作成する。この時点では `runUpdateWorkflow` がスタブ実装（`break` のみ）
のため、テストは期待値不一致によって失敗する状態（Red）が正しい。
テストファイルの構造・命名・テストID が設計と一致していることを確認し、
Phase 5 の Green 化へ受け渡す。

## テストファイル

| 対象メソッド        | テストファイルパス                                                                              |
| ------------------- | ----------------------------------------------------------------------------------------------- |
| `runUpdateWorkflow` | `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.update.test.ts`（新規作成） |

既存テストファイル（変更なし・参照のみ）:

- `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts`
- `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.purpose.test.ts`
- `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService-cancel.test.ts`
- `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.integration.test.ts`

## テストケース定義

### UPD-NORMAL-01: LLMなしで SKILL.md が更新されること

- 対象: `runUpdateWorkflow()` が `llmClient` なし（`null`）で呼ばれた場合
- 前提: 既存の SKILL.md ファイルが対象スキルディレクトリに存在する
- 検証:
  - `fs.readFile()` で既存 SKILL.md が読み込まれること
  - `fs.writeFile()` で更新後の内容が書き戻されること
  - `emitProgress` が `loading-skill(10%)` → `analyzing(30%)` → `generating-skill(60%)` → `validating(90%)` → `done(100%)` の順で発火すること
- 失敗条件: `break` のみのスタブ実装では `fs.writeFile()` が呼ばれない

### UPD-NORMAL-02: LLMありで purpose が再生成されること

- 対象: `runUpdateWorkflow()` が `llmClient` あり（モック済み）で呼ばれた場合
- 前提: 既存の SKILL.md ファイルが対象スキルディレクトリに存在する
- 検証:
  - `extractPurposeWithLlm()` が呼ばれること
  - LLM が返した purpose が更新後の SKILL.md に反映されること
  - `fs.writeFile()` が正しい内容で呼ばれること
- 失敗条件: スタブ実装では LLM が呼ばれない

### UPD-ABORT-01: AbortSignal 中断が loading-skill ステップで機能すること

- 対象: `signal.aborted` が `true` の状態で `runUpdateWorkflow()` が呼ばれた場合
- 検証:
  - `throwIfAborted(signal)` が発火し、処理が中断されること
  - `fs.writeFile()` が呼ばれないこと
- 失敗条件: スタブ実装では中断検知が行われない

### UPD-ABORT-02: AbortSignal 中断が analyzing ステップで機能すること

- 対象: `loading-skill` 完了後に `signal.abort()` が発火するシナリオ
- 検証:
  - `throwIfAborted(signal)` が `analyzing` ステップ前に発火し、処理が中断されること
  - `fs.writeFile()` が呼ばれないこと

### UPD-ABORT-03: AbortSignal 中断が generating-skill ステップで機能すること

- 対象: `analyzing` 完了後に `signal.abort()` が発火するシナリオ
- 検証:
  - `throwIfAborted(signal)` が `generating-skill` ステップ前に発火し、処理が中断されること
  - `fs.writeFile()` が呼ばれないこと

### UPD-ERROR-01: SKILL.md が存在しない場合のエラーハンドリング

- 対象: `fs.readFile()` が `ENOENT` エラーを返した場合
- 検証:
  - エラーがスローされるか、またはエラーが適切にハンドリングされてメソッドが `null` を返すこと
  - `fs.writeFile()` が呼ばれないこと
  - 進捗イベントが `done` まで到達しないこと

## テストファイルの構造仕様

`SkillCreatorService.update.test.ts` は以下の構造に準拠して作成する（既存テストファイルと同等の骨格）。

ファイル冒頭のコメントブロックに含める情報:

- タスクID: TASK-SC-CREATOR-UPDATE-IMPL-001
- 対象メソッド: `runUpdateWorkflow`
- テストID一覧（UPD-NORMAL-01 〜 UPD-ERROR-01）
- GitHub Issue: #2318

モック設定:

- `vi.hoisted()` で `mockFsReadFile`・`mockFsWriteFile`・`mockLlmClient` を定義する
- `vi.mock("fs/promises", ...)` で `readFile`・`writeFile` をモックする
- `AbortController` を使用して `signal` の中断テストを実装する
- `emitProgress` の発火順序を記録するスパイを設定する

テスト構造:

- `describe("SkillCreatorService - runUpdateWorkflow", ...)` をトップレベルに置く
- `describe("UPD-NORMAL-01〜02: 正常系", ...)` の中にLLMあり/なしケースを配置する
- `describe("UPD-ABORT-01〜03: AbortSignal 中断", ...)` をネストする
- `describe("UPD-ERROR-01: 異常系", ...)` をネストする

## 実行手順

1. `apps/desktop/src/main/services/skill/__tests__/` 配下に `SkillCreatorService.update.test.ts` を作成する
2. 上記の構造仕様に準拠したテストコードを記述する（実装はスタブのまま）
3. `pnpm --filter @repo/desktop test SkillCreatorService.update` でテストを実行し、Red 状態（期待値不一致による FAIL）を確認する
4. FAIL が「期待した処理が呼ばれない」によるものであり、インポートエラー・モック設定エラーが発生していないことを確認する
5. エラーがある場合はモック設定・インポートパスを修正してから Phase 5 へ進む

## 参照資料

- `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts`（既存テストパターン参考）
- `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService-cancel.test.ts`（AbortSignal テストパターン参考）
- `apps/desktop/src/main/services/skill/SkillCreatorService.ts`（実装対象・スタブ確認）

## 成果物

- `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.update.test.ts`（新規・Red 状態）
- `outputs/phase-4/red-test-result.md`（Red 状態確認の実行ログ記録）

## 完了条件

- [ ] `SkillCreatorService.update.test.ts` が `apps/desktop/src/main/services/skill/__tests__/` 配下に作成されている
- [ ] テストID `UPD-NORMAL-01`・`UPD-NORMAL-02`・`UPD-ABORT-01`〜`UPD-ABORT-03`・`UPD-ERROR-01` が定義されている
- [ ] インポートエラー・モック設定エラーが発生していない（テストが「実行されて FAIL」している状態）
- [ ] `red-test-result.md` に FAIL の確認記録が記載されている
- [ ] 既存テスト群が引き続き PASS している（`pnpm --filter @repo/desktop test` 全体実行で確認）

## タスク100%実行確認【必須】

1. テストID `UPD-NORMAL-01`〜`UPD-ERROR-01` が全て定義されているか
2. モックエラー・インポートエラーなしで「実装が呼ばれないことによる FAIL」になっているか
3. `red-test-result.md` に実行ログを記録したか
4. 既存テストが全 PASS であることを確認したか

## 次Phase

Phase 5（実装 Green フェーズ）へ進む。`runUpdateWorkflow()` の実処理を実装し、
Red 状態のテストを全て PASS させる。
