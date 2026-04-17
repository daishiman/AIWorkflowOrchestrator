# キャンセル時スキルディレクトリ自動クリーンアップ - タスク指示書

## メタ情報

```yaml
issue_number: 2227
```

## メタ情報

| 項目         | 内容                                             |
| ------------ | ------------------------------------------------ |
| タスクID     | TASK-SW-CANCEL-SKILL-CLEANUP                     |
| タスク名     | キャンセル時スキルディレクトリ自動クリーンアップ |
| 分類         | 改善                                             |
| 対象機能     | SkillCreator / キャンセル処理                    |
| 優先度       | 低                                               |
| 見積もり規模 | 小規模                                           |
| ステータス   | 未実施                                           |
| 発見元       | Phase 12 / 技術負債洗い出し                      |
| 発見日       | 2026-04-16                                       |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`SkillCreatorService.ts` には `cleanupCancelledSkillDir()` という private メソッドが存在し、`createSkill()` のキャンセル時にスキルディレクトリを削除する実装が既にある。しかし、この実装には以下の問題点が残存している。

1. **`executeTasks()` にキャンセルクリーンアップが存在しない**: `executeTasks()` メソッドには `AbortController` が渡されず、処理途中でのキャンセル対応自体が未実装である。
2. **一時ファイル（`tmpPlanPath`）のクリーンアップが `finally` で行われるが、キャンセル後の残存パターンが未検証**: `generateSkillMd()` の `finally` ブロックで `fs.unlink(tmpPlanPath)` を呼んでいるが、AbortError が throw された直後に `finally` が確実に実行されるかどうかの結合テストが存在しない。
3. **`cleanupCancelledSkillDir()` の呼び出し条件が `signal?.aborted` と `isAbortError(error)` の OR 条件のみ**: `collaborativeWorkflow` や `orchestrateWorkflow` 内部でファイルが作成された後、AbortError が throw される前にプロセスが終了した場合（例: Electron のクラッシュ）では、残存ディレクトリが回収されない。
4. **クリーンアップ失敗時のフォールバックがログのみ**: `cleanupCancelledSkillDir()` 内のクリーンアップ失敗は `logger.warn` で記録されるが、呼び出し元には通知されないため、クリーンアップ失敗が検出できない。

### 1.2 問題点・課題

**問題1: キャンセル時に半完成ディレクトリが `~/.claude/skills/<skill-name>/` に残る**

ユーザーがスキル作成途中でキャンセルした場合、`init_skill.js` がスキルディレクトリを作成した後に `SKILL.md` の生成が完了する前にキャンセルされると、`SKILL.md` が存在しない不完全なスキルディレクトリが残る。この状態のディレクトリは Claude Code の `skill-creator` スキルのスキャン対象となり得るため、予期しない挙動の原因となる可能性がある。

**問題2: `existedBefore` フラグの判定タイミング問題**

`skillDirExistedBefore` は `createSkill()` の最初に一度だけ取得される。しかし、スキル名の重複確認・上書き確認のロジックが別の場所にある場合、あるいは複数の `createSkill()` が並列に呼ばれた場合（現状は想定外だが将来的な拡張含め）、判定が競合する可能性がある。

**問題3: クリーンアップ処理の網羅性が不明確**

現在の実装では「スキルディレクトリごと `fs.rm(skillDir, { recursive: true, force: true })` で削除する」方式を採用している。しかし、削除すべきかどうかの判断は実装者に委ねられており、以下のケースが明示的にドキュメント化されていない：

- `existedBefore=true` の場合（既存スキルの update 中にキャンセル）: ディレクトリを**削除しない**が、部分的に書き換えられたファイルはそのまま残る
- `init_skill.js` がサブディレクトリを作成した場合: 同じく `recursive: true` で削除される
- `generate_skill_md.js` が `skillDir` 外にファイルを書いた場合: クリーンアップ対象外となる

### 1.3 放置した場合の影響

- 繰り返しキャンセル操作を行うと `~/.claude/skills/` 配下に不完全なスキルディレクトリが累積する
- 不完全なスキルディレクトリが Claude Code のスキル検索結果に混入し、意図しないスキルが実行される可能性がある
- クリーンアップ失敗時に開発者が問題を検出できないため、本番環境でのデバッグコストが高い

---

## 2. 何を達成するか（What）

### 2.1 目的

`SkillCreatorService.ts` におけるキャンセル時クリーンアップ処理を明確化・テスト化し、半完成スキルディレクトリが残存しないことを保証する。既存の `cleanupCancelledSkillDir()` の動作をテストで検証した上で、未カバーのケース（クリーンアップ失敗の可視化・`existedBefore=true` 時の部分書き換えロールバック方針確定）に対処する。

### 2.2 最終ゴール

1. スキル作成をキャンセルした場合、`existedBefore=false` のスキルディレクトリが必ず削除されること（ユニットテストで保証）
2. `existedBefore=true` の場合（既存スキルの上書き中キャンセル）の挙動が仕様として確定し、コメントまたはドキュメントで明示されていること
3. `generateSkillMd()` の `finally` ブロックで一時ファイルが確実に削除されることがユニットテストで確認されていること
4. クリーンアップ失敗時のログ出力が構造化され、テストで検証可能な形式になっていること

### 2.3 スコープ

**含むもの**:

- `cleanupCancelledSkillDir()` の既存動作をカバーするユニットテスト追加
- `generateSkillMd()` のキャンセル時 `tmpPlanPath` クリーンアップをカバーするユニットテスト追加
- `existedBefore=true` 時の挙動をコードコメントで明示化
- クリーンアップ失敗時のログを構造化（オブジェクト形式に統一）
- `SkillCreatorService.test.ts` への新規テストケース追加

**含まないもの**:

- `executeTasks()` へのキャンセル機能追加（別タスクとして分離）
- Electron クラッシュ後の残存ディレクトリ回収（起動時クリーンアップ）
- `~/.claude/skills/` の定期クリーンアップ機能
- UI 側のキャンセルボタン実装（TASK-SC-07-IPC-CANCEL で対応済み）

### 2.4 成果物

- `apps/desktop/src/main/services/skill/SkillCreatorService.ts`（コメント追加・ログ改善）
- `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts`（新規テストケース追加）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `SkillCreatorService.ts` の現行実装を熟読し、`cleanupCancelledSkillDir()` の呼び出しフローを把握していること
- `fs/promises` の `rm()` / `access()` モックパターンを理解していること（Vitest の `vi.mock` 使用）
- `AbortController` / `AbortSignal` の基本動作を理解していること

### 3.2 依存タスク

| タスクID              | 関係     | 理由                                                          |
| --------------------- | -------- | ------------------------------------------------------------- |
| TASK-SC-07-IPC-CANCEL | 参照のみ | UI 側のキャンセル IPC 実装。本タスクは Service 層のみ対象     |
| TASK-SC-11            | 参照のみ | AbortController 管理方針の設計参照（UI 層との整合確認に使用） |

### 3.3 必要な知識

- `fs/promises` の `rm()` / `access()` / `unlink()` の基本動作
- Vitest における `vi.mock('fs/promises')` パターンと `vi.spyOn` の使い方
- `AbortController.abort()` が throw される前と後の実行タイミング（同期 `throwIfCancelled` と非同期スクリプト実行の差異）
- `path.join()` によるスキルディレクトリパス構築ロジック

### 3.4 推奨アプローチ

**テスト追加戦略**: 新規テストケースを既存の `SkillCreatorService.test.ts` に追加する。`describe('cleanup on cancel')` ブロックとして分離し、既存テストとの干渉を防ぐ。

**コメント追加戦略**: `existedBefore=true` 時の挙動を `cleanupCancelledSkillDir()` 内部の `return` 文の直前にコメントで明示する。外部ドキュメントへの言及も追記する。

---

## 4. 実行手順（Phase構成）

### Phase 1: 要件定義

- `SkillCreatorService.ts` の `createSkill()` の全フローを追跡し、ファイルシステムへの書き込みが発生するポイントを一覧化する
  - `init_skill.js` 実行（`skillDir` の作成）
  - `generate_skill_md.js` 実行（`SKILL.md` の作成）
  - `generateTaskSpecs()` 内のフォールバックファイル書き込み
  - `initializeSkillFallback()` の `fs.writeFile()` 呼び出し
- `cleanupCancelledSkillDir()` が実際に呼ばれるコードパス（`createSkill()` の `catch` ブロック）と呼ばれないコードパス（正常終了・`executeTasks()`）を確認する
- `existedBefore=true` / `existedBefore=false` の両ケースの期待動作を文書化する
- 既存テストファイル（`SkillCreatorService.test.ts`）のキャンセル関連テストケースを確認し、未カバーの入力組み合わせを洗い出す

### Phase 2: 設計

以下の設計事項を確定させる。

**設計事項1: `existedBefore=true` 時のロールバック方針**

既存スキルの update 中にキャンセルされた場合、部分的に書き換えられたファイルが残る。現行の `cleanupCancelledSkillDir()` はこのケースで `return` する（削除しない）が、その理由と意図をコードコメントで明示する。

例:

```typescript
// existedBefore=true の場合（既存スキルの更新中にキャンセル）:
// ディレクトリを削除しない。部分的に書き換えられたファイルが残る可能性があるが、
// 既存スキルを削除することはユーザーデータ損失につながるため、
// 削除よりも部分残留を許容するポリシーを採用している。
// 参照: TASK-SW-CANCEL-SKILL-CLEANUP
if (existedBefore) {
  return;
}
```

**設計事項2: テスト対象ケース一覧**

| テストID | 条件                                                  | 期待動作                                |
| -------- | ----------------------------------------------------- | --------------------------------------- |
| CL-01    | `existedBefore=false` かつ `signal.aborted=true`      | `fs.rm()` が呼ばれる                    |
| CL-02    | `existedBefore=false` かつ `isAbortError(error)=true` | `fs.rm()` が呼ばれる                    |
| CL-03    | `existedBefore=true` かつ `signal.aborted=true`       | `fs.rm()` が**呼ばれない**              |
| CL-04    | `existedBefore=false` かつ通常エラー                  | `fs.rm()` が**呼ばれない**              |
| CL-05    | `fs.rm()` 自体が失敗した場合                          | エラーを throw せず `logger.warn` のみ  |
| CL-06    | `generateSkillMd()` 内でキャンセル発生                | `finally` で `tmpPlanPath` が削除される |

**設計事項3: ログ構造化**

`cleanupCancelledSkillDir()` の `logger.warn` 呼び出しを以下の形式に統一する。

```typescript
this.logger.warn("cancelled skill dir cleanup failed", {
  skillDir,
  cleanupError:
    cleanupError instanceof Error
      ? { name: cleanupError.name, message: cleanupError.message }
      : String(cleanupError),
});
```

### Phase 3: 設計レビュー

- Phase 2 の設計事項 1〜3 を独立レビューする
- `existedBefore=true` のロールバック方針がユーザーデータ保護の観点から適切か確認する
- テストケース CL-01〜CL-06 が Phase 1 で洗い出した未カバーケースをすべて網羅しているか確認する
- ログ構造化の変更が既存テストの期待値に影響しないか確認する
- PASS / MINOR / MAJOR / CRITICAL の判定を行い、MAJOR 以上は Phase 2 に差し戻す

### Phase 4: テスト作成（TDD）

`apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts` に以下のテストブロックを追加する。

```typescript
describe("cleanup on cancel", () => {
  // CL-01: existedBefore=false + signal.aborted=true → fs.rm が呼ばれる
  it("should remove skill dir when cancel is triggered and dir did not exist before", async () => {
    // 実装
  });

  // CL-02: existedBefore=false + AbortError → fs.rm が呼ばれる
  it("should remove skill dir when AbortError is thrown and dir did not exist before", async () => {
    // 実装
  });

  // CL-03: existedBefore=true + signal.aborted=true → fs.rm が呼ばれない
  it("should NOT remove skill dir when dir existed before and cancel is triggered", async () => {
    // 実装
  });

  // CL-04: existedBefore=false + 通常エラー → fs.rm が呼ばれない
  it("should NOT remove skill dir when non-abort error is thrown", async () => {
    // 実装
  });

  // CL-05: fs.rm が失敗 → throw せず logger.warn のみ
  it("should not throw when fs.rm fails during cleanup", async () => {
    // 実装
  });

  // CL-06: generateSkillMd キャンセル時に tmpPlanPath が削除される
  it("should cleanup tmpPlanPath in finally block when generateSkillMd is cancelled", async () => {
    // 実装
  });
});
```

### Phase 5: 実装

**Step 1: `existedBefore=true` コメント追加**

`cleanupCancelledSkillDir()` の `if (existedBefore) { return; }` の直前に、設計事項1のコメントを追加する。

**Step 2: ログ構造化**

`cleanupCancelledSkillDir()` の `logger.warn` の `cleanupError` フィールドを設計事項3の形式に変更する。

**Step 3: テスト実装**

Phase 4 で作成したテストスケルトンを実装する。`fs/promises` を `vi.mock()` でモックし、`fs.rm` / `fs.unlink` / `fs.access` の呼び出し検証を行う。

モックパターンの例:

```typescript
import { vi } from "vitest";
import * as fs from "fs/promises";

vi.mock("fs/promises");

const mockFsRm = vi.spyOn(fs, "rm").mockResolvedValue(undefined);
const mockFsAccess = vi
  .spyOn(fs, "access")
  .mockRejectedValue(Object.assign(new Error("ENOENT"), { code: "ENOENT" }));
```

### Phase 6: テスト拡充

- CL-01〜CL-06 のテストが PASS することを確認する
- 各テストケースに `it.each` を使って境界値（`skillDir` が空文字、`skillDir` がパストラバーサル文字列を含む）を追加する
- `createSkill()` を通じた結合的なキャンセルフローテストを1件追加する（モックした `init_skill.js` が実行後にキャンセルが発火するシナリオ）

### Phase 7: カバレッジ確認

```bash
pnpm --filter @repo/desktop test --coverage -- --reporter=verbose apps/desktop/src/main/services/skill/SkillCreatorService.ts
```

- `cleanupCancelledSkillDir()` の全分岐（`existedBefore=true` / `signal.aborted=false && isAbortError=false` / 正常削除 / 削除失敗）が 100% カバーされていることを確認する
- `generateSkillMd()` の `finally` ブロックがカバーされていることを確認する

### Phase 8: リファクタリング

- CL-05（`fs.rm` 失敗時）の `cleanupError` オブジェクト生成ロジックを private ヘルパー（例: `serializeError(e: unknown)`）に抽出することを検討する
- テストの重複モックセットアップを `beforeEach` に抽出する
- 不要な `as unknown as` 型アサーションや `any` の除去

### Phase 9: 品質保証

```bash
# 型チェック
pnpm --filter @repo/desktop typecheck

# Lint
pnpm --filter @repo/desktop lint

# テスト（全件）
pnpm --filter @repo/desktop test

# キャンセル関連テストのみ実行
pnpm --filter @repo/desktop test -- --grep "cleanup on cancel"
```

### Phase 10: 最終レビュー

- Phase 2 の設計事項 1〜3 がすべて実装に反映されていることを確認する
- CL-01〜CL-06 のテストが全件 PASS していることを確認する
- `cleanupCancelledSkillDir()` のコメントが意図を正確に伝えているか確認する
- PASS / MINOR は Phase 11 へ進む。MAJOR は Phase 8 に差し戻す

### Phase 11: 手動テスト

Electron アプリを起動し、以下のシナリオを手動実行する。

1. スキル作成ウィザードで新規スキル名を入力し、スキル作成を開始する
2. 「初期化しています」フェーズ（percentage=40）が表示されたタイミングでキャンセルボタンを押す
3. `~/.claude/skills/<入力したスキル名>/` ディレクトリが存在しないことを確認する

```bash
# 確認コマンド（macOS）
ls ~/.claude/skills/ | grep "<入力したスキル名>"
# 出力がなければ OK
```

4. キャンセル後に同じスキル名で再度スキル作成を開始し、正常に完了することを確認する

### Phase 12: ドキュメント更新

本タスクで変更した内容を以下のドキュメントに反映する。

- `cleanupCancelledSkillDir()` の JSDoc コメントに `@remarks` セクションを追加し、`existedBefore=true` 時のポリシーを明記する
- 本タスク仕様書（`TASK-SW-CANCEL-SKILL-CLEANUP.md`）の「ステータス」を「実施済み」に更新する

### Phase 13: PR作成

ユーザーの明示的承認を得た後に実施する。

```bash
# ブランチ作成
git checkout -b fix/task-sw-cancel-skill-cleanup

# コミット
git commit -m "fix(skill-creator): TASK-SW-CANCEL-SKILL-CLEANUP キャンセル時スキルディレクトリクリーンアップのテスト追加とコメント整備"

# push
git push -u origin fix/task-sw-cancel-skill-cleanup

# PR 作成
gh pr create \
  --title "fix(skill-creator): TASK-SW-CANCEL-SKILL-CLEANUP キャンセル時スキルディレクトリクリーンアップのテスト追加" \
  --body "..."
```

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] キャンセル時（`existedBefore=false`）にスキルディレクトリが削除されることがユニットテストで保証されている（CL-01, CL-02）
- [ ] `existedBefore=true` 時にスキルディレクトリが削除されないことがユニットテストで保証されている（CL-03）
- [ ] 通常エラー時にスキルディレクトリが削除されないことがユニットテストで保証されている（CL-04）
- [ ] `fs.rm()` 失敗時にエラーが伝播せず `logger.warn` のみが呼ばれることがユニットテストで保証されている（CL-05）
- [ ] `generateSkillMd()` キャンセル時に `tmpPlanPath` が `finally` ブロックで削除されることがユニットテストで保証されている（CL-06）
- [ ] `existedBefore=true` 時のロールバック方針がコードコメントで明示されている

### 品質要件

- [ ] `pnpm --filter @repo/desktop typecheck` がエラーなしで通過する
- [ ] `pnpm --filter @repo/desktop lint` がエラーなしで通過する
- [ ] `pnpm --filter @repo/desktop test` が全件パスする
- [ ] `cleanupCancelledSkillDir()` の全分岐がテストカバレッジで 100% カバーされている
- [ ] `any` 型の新規使用がない
- [ ] 手動テストシナリオ（Phase 11）が完了している

### ドキュメント要件

- [ ] `cleanupCancelledSkillDir()` に `@remarks` コメントが追加されている
- [ ] 本タスク仕様書のステータスが「実施済み」に更新されている

---

## 6. 検証方法

### テストケース

| テストID | 対象                         | 入力/操作                                                               | 期待結果                                                        | 備考                               |
| -------- | ---------------------------- | ----------------------------------------------------------------------- | --------------------------------------------------------------- | ---------------------------------- |
| CL-01    | `cleanupCancelledSkillDir()` | `existedBefore=false`, `signal.aborted=true`                            | `fs.rm(skillDir, {recursive:true,force:true})` が1回呼ばれる    | 基本キャンセルクリーンアップ       |
| CL-02    | `cleanupCancelledSkillDir()` | `existedBefore=false`, `error=new DOMException("Aborted","AbortError")` | `fs.rm()` が1回呼ばれる                                         | AbortError 由来のクリーンアップ    |
| CL-03    | `cleanupCancelledSkillDir()` | `existedBefore=true`, `signal.aborted=true`                             | `fs.rm()` が**呼ばれない**                                      | 既存スキル保護                     |
| CL-04    | `cleanupCancelledSkillDir()` | `existedBefore=false`, `error=new Error("some error")`                  | `fs.rm()` が**呼ばれない**                                      | 通常エラー時は削除しない           |
| CL-05    | `cleanupCancelledSkillDir()` | `existedBefore=false`, `signal.aborted=true`, `fs.rm` が reject         | エラーが throw されず `logger.warn` が呼ばれる                  | クリーンアップ失敗の安全処理       |
| CL-06    | `generateSkillMd()`          | `signal.aborted=true` で中断                                            | `fs.unlink(tmpPlanPath)` が `finally` で呼ばれる                | 一時ファイルのクリーンアップ確認   |
| CL-07    | `createSkill()` 結合テスト   | `init_skill.js` 実行後に `cancelCurrentOperation()` を呼ぶ              | `cleanupCancelledSkillDir()` が呼ばれ、ディレクトリが削除される | 結合テスト（createSkill 全フロー） |
| CL-08    | 手動テスト（Phase 11）       | ウィザードで途中キャンセル                                              | `~/.claude/skills/<skill-name>/` が存在しない                   | 実機確認                           |

### 実行コマンド

```bash
# キャンセルクリーンアップのテストのみ実行
pnpm --filter @repo/desktop test -- --grep "cleanup on cancel"

# SkillCreatorService の全テストを実行
pnpm --filter @repo/desktop test -- SkillCreatorService

# カバレッジ付きで実行
pnpm --filter @repo/desktop test --coverage -- SkillCreatorService
```

---

## 7. リスクと対策

| リスク                                                                      | 影響度 | 発生確率 | 対策                                                                                              |
| --------------------------------------------------------------------------- | ------ | -------- | ------------------------------------------------------------------------------------------------- |
| `fs.rm()` のモックが他のテストケースに影響する                              | 中     | 中       | 各テストの `afterEach` で `vi.restoreAllMocks()` を呼び、モックの汚染を防ぐ                       |
| `existedBefore=true` 時に部分書き換えされたファイルをユーザーが発見する     | 低     | 低       | Phase 2 の設計事項1でコメントを追加し「既存スキル保護のための意図的な仕様」であることを明示する   |
| `generateSkillMd()` の `finally` がキャンセル時に実行されないバグが潜在する | 中     | 低       | CL-06 のテストを追加し、`finally` の実行を明示的に検証する                                        |
| ログ構造化の変更（設計事項3）が既存のスナップショットテストを壊す           | 低     | 低       | `SkillCreatorService.test.ts` に `logger.warn` のスナップショットテストが存在しないか事前確認する |
| `path.join(this.skillsDir, options.name)` のパス解決が OS により異なる      | 低     | 低       | テストでは `path.join` の実際の結果値を使って期待値を構築し、ハードコードしない                   |

---

## 8. 参照情報

### 関連ドキュメント

| 資料名                      | パス                                                                           | 説明                                         |
| --------------------------- | ------------------------------------------------------------------------------ | -------------------------------------------- |
| TASK-SC-07-IPC-CANCEL       | `docs/30-workflows/unassigned-task/TASK-SC-07-IPC-CANCEL.md`                   | UI 側のキャンセル IPC 実装（本タスクと連携） |
| TASK-SC-11-ABORT-CONTROLLER | `docs/30-workflows/unassigned-task/TASK-SC-11-ABORT-CONTROLLER-PLAN-CANCEL.md` | AbortController 管理方針の設計参照           |

### 関連ファイル

| ファイル                                                                     | 変更種別 | 内容                                |
| ---------------------------------------------------------------------------- | -------- | ----------------------------------- |
| `apps/desktop/src/main/services/skill/SkillCreatorService.ts`                | 修正     | コメント追加・ログ構造化            |
| `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts` | 修正     | キャンセルクリーンアップ テスト追加 |

### 対象コードの位置

| メソッド名                     | 行番号（参考） | 内容                                             |
| ------------------------------ | -------------- | ------------------------------------------------ |
| `cleanupCancelledSkillDir()`   | L102-L123      | キャンセル時クリーンアップの本体                 |
| `createSkill()` catch ブロック | L356-L363      | `cleanupCancelledSkillDir()` の呼び出し箇所      |
| `generateSkillMd()` finally    | L920-L922      | `tmpPlanPath` の削除処理                         |
| `cancelCurrentOperation()`     | L465-L469      | 外部からキャンセルを発火させるパブリックメソッド |

---

## 9. 備考

### 苦戦箇所【記入必須】

| 苦戦箇所                                                              | 問題                                                                                                                                                                                                                                                                                                                                                                                       | 解決方針                                                                                                                                                                        |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| キャンセル後にどこまで削除すべきかの判断                              | `init_skill.js` 実行後にキャンセルした場合、ディレクトリを丸ごと削除すれば「なかったことにできる」が、将来的に `update` モードで既存スキルのサブディレクトリを追加する場合、`existedBefore=true` でも部分削除が必要になる可能性がある。現在の「`existedBefore=false` なら全削除、`existedBefore=true` なら削除しない」の二択は単純だが、将来の update ユースケースと整合しない可能性がある | 本タスクでは現行の二択方針を維持し、`existedBefore=true` の部分ロールバックは別タスクとして分離する。コメントで「update モードのロールバックは未実装」と明記しておく            |
| `fs.rm()` モックと `fs.access()` モックの干渉                         | `SkillCreatorService` は `pathExists()` 内で `fs.access()` を呼ぶため、テスト中に `fs.access` をモックすると `pathExists()` の結果も変わる。`skillDirExistedBefore` の値が意図せず変化し、テストの期待値がずれるリスクがある                                                                                                                                                               | `vi.spyOn(fs, 'access')` は各テストケースごとに異なる戻り値を返すよう個別設定する。`existedBefore=false` を想定するテストでは `access` が `ENOENT` を reject するよう設定する   |
| `generateSkillMd()` の `finally` が `AbortError` 後に実行されるか不明 | `throwIfCancelled()` が `DOMException` を throw した場合、その後の `finally` ブロックが確実に実行されるかは JavaScript の仕様では保証されているが、テストで明示的に検証されていない。特に `ScriptExecutor.execute()` 内部で別の非同期処理が走る場合、`finally` のタイミングが複雑になる                                                                                                    | `generateSkillMd()` のテスト（CL-06）で `throwIfCancelled` の直後に mock を throw させ、`fs.unlink` が呼ばれることを検証する。`ScriptExecutor` は mock で置き換えてから検証する |
| クリーンアップ失敗がサイレントに無視される設計の妥当性                | 現行の `cleanupCancelledSkillDir()` はクリーンアップ失敗を `logger.warn` で記録するだけで、呼び出し元に失敗を通知しない。この設計は「クリーンアップ失敗はスキル作成成功/失敗の判定に影響させない」という意図だが、運用時に残存ディレクトリを検出する手段がない                                                                                                                             | 本タスクではこの設計を維持しつつ、ログに `taskId: 'TASK-SW-CANCEL-SKILL-CLEANUP'` を追加して将来のログ集計・アラート設定を容易にする。メトリクス収集は別タスクとして分離する    |

### 発見経緯

Phase 12 技術負債洗い出しにおいて、`SkillCreatorService.ts` のキャンセル処理を調査した結果、`cleanupCancelledSkillDir()` が実装されているにもかかわらず、そのテストカバレッジが不十分であることが判明した。また、`existedBefore=true` 時の挙動が暗黙的なポリシーとして実装されており、コードを読むだけでは意図が分かりにくい状態であった。機能的な問題は潜在的には存在するが、現時点では顕在化していないため優先度を「低」と設定した。
