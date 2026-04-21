# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 6                               |
| タスクID   | TASK-SC-CREATOR-UPDATE-IMPL-001 |
| ステータス | 未実施                          |
| 作成日     | 2026-04-21                      |
| タスク種別 | NON_VISUAL（UI変更なし）        |
| 前Phase    | 5: 実装（TDD Green フェーズ）   |
| 次Phase    | 7: カバレッジ確認               |

---

## 目的

Phase 5 で Green 化した `runUpdateWorkflow()` に対して、
fail path・回帰ガード・補助テストを追加し、実装の堅牢性を高める。
正常系の基本動作（UPD-NORMAL-01〜02）が保証された状態で、
エッジケース・エラー伝播・進捗イベントの順序保証を検証テストとして固める。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: ファイル読み込みエラーの fail path テスト追加

**目的**: `fs.readFile()` がエラーを返した場合に `runUpdateWorkflow()` が適切に処理することを検証する

**追加テストケース**:

#### UPD-FAIL-01: ENOENT エラー時に `null` を返すこと

- 前提: `fs.readFile()` が `ENOENT` エラーをスローする
- 検証:
  - `runUpdateWorkflow()` が `null` を返すこと（またはエラーをスローしないこと）
  - `fs.writeFile()` が呼ばれないこと
  - `emitProgress("done")` が呼ばれないこと

#### UPD-FAIL-02: 読み込みエラー（ENOENT 以外）時も `writeFile` が呼ばれないこと

- 前提: `fs.readFile()` が `EACCES`（アクセス権限エラー）をスローする
- 検証:
  - `fs.writeFile()` が呼ばれないこと
  - エラーが AbortError でない場合は `null` を返すこと

**対象ファイル**:

- `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.update.test.ts`（追記）

**実行確認**:

```bash
pnpm --filter @repo/desktop test SkillCreatorService.update
```

---

### タスク2: LLM 呼び出しエラー時のフォールバックテスト追加

**目的**: `extractPurposeWithLlm()` がエラーを返した場合でも SKILL.md の更新処理が継続されることを検証する

**追加テストケース**:

#### UPD-FAIL-03: LLM エラー時に purpose なしで SKILL.md が更新されること

- 前提: `llmClient` が存在し、`extractPurposeWithLlm()` がエラーをスローする
- 検証:
  - `runUpdateWorkflow()` がエラーをスローしないこと
  - `fs.writeFile()` が呼ばれること（purpose なしの内容で更新される）
  - `emitProgress("done")` が呼ばれること

#### UPD-FAIL-04: LLM タイムアウト時も処理が継続されること

- 前提: `llmClient.generate()` が `Promise.reject()` を返す
- 検証:
  - `fs.writeFile()` が呼ばれること
  - エラーがスローされないこと

**対象ファイル**:

- `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.update.test.ts`（追記）

---

### タスク3: AbortSignal 中断のエッジケーステスト追加

**目的**: 各ステップの境界での AbortSignal 中断が正確に機能することを検証する

**追加テストケース**:

#### UPD-ABORT-04: generating-skill 完了後（validating 直前）の中断

- 前提: `generating-skill` emitProgress 直後に `signal.abort()` が発火する
- 検証:
  - `throwIfAborted(signal)` が `validating` ステップ前で発火すること
  - `fs.writeFile()` が呼ばれないこと

#### UPD-ABORT-05: AbortError は `null` を返さずに再スローされること

- 前提: 中断が発生した場合
- 検証:
  - `isAbortError(error)` が `true` の場合は `throw error` が実行されること
  - 呼び出し元に AbortError が伝播すること（`null` に変換されないこと）

**対象ファイル**:

- `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.update.test.ts`（追記）

---

### タスク4: 進捗イベント（emitProgress）の発火順序テスト追加

**目的**: PROGRESS_FLOWS の順序（`loading-skill` → `analyzing` → `generating-skill` → `validating` → `done`）が保証されることを検証する

**追加テストケース**:

#### UPD-PROG-01: 正常完了時に全 progress イベントが正しい順序で発火すること

- 前提: `llmClient` なし、`fs.readFile()` が正常に完了する
- 検証:
  - `emitProgress` の呼び出し順序が `["loading-skill", "analyzing", "generating-skill", "validating", "done"]` と一致すること
  - `toHaveBeenNthCalledWith()` または呼び出し記録配列で順序を検証する

#### UPD-PROG-02: 中断時に `done` が発火しないこと

- 前提: `analyzing` ステップで中断が発生する
- 検証:
  - `emitProgress("done")` が呼ばれないこと
  - `emitProgress("loading-skill")` は呼ばれていること（中断前のステップは発火済み）

**対象ファイル**:

- `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.update.test.ts`（追記）

---

### タスク5: 既存テスト全体の PASS 確認（回帰ガード）

**目的**: タスク1〜4 の追加テストが既存テストを壊していないことを確認する

**実行手順**:

1. 以下のコマンドを実行して拡充後のテストが全 PASS することを確認する

```bash
pnpm --filter @repo/desktop test SkillCreatorService.update
```

2. 全体テストで回帰がないことを確認する

```bash
pnpm --filter @repo/desktop test
```

3. 失敗したテストがある場合は原因を特定し修正する
4. 全 PASS を確認したらその結果を記録する

---

## 参照資料

| 参照資料                    | パス                                                                                 | 内容                                  |
| --------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------- |
| update テスト（Green 状態） | `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.update.test.ts`  | Phase 5 で Green 化したテストファイル |
| cancel テストパターン       | `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService-cancel.test.ts`  | AbortSignal テストの参考実装          |
| purpose テストパターン      | `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.purpose.test.ts` | LLM フォールバックテストの参考実装    |
| SkillCreatorService 実装    | `apps/desktop/src/main/services/skill/SkillCreatorService.ts`                        | `runUpdateWorkflow()` の実装確認      |

---

## 成果物

| 成果物                 | パス                                                                                | 内容                                      |
| ---------------------- | ----------------------------------------------------------------------------------- | ----------------------------------------- |
| 拡充済み update テスト | `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.update.test.ts` | fail path・回帰ガード・補助テスト追加済み |
| テスト拡充結果レポート | `outputs/phase-6/expansion-test-result.md`                                          | 追加テストID・PASS 確認・実行時間を記載   |

---

## 統合テスト連携

**Phase 6 の統合テスト連携アクション**:

- fail path テスト追加により、`runUpdateWorkflow()` のエラーハンドリングの CI 検出を強化する
- AbortSignal エッジケーステスト追加により、キャンセル処理の回帰ガードを確立する
- 進捗イベント順序テスト追加により、PROGRESS_FLOWS 仕様との乖離を CI で検出できるようにする
- 本フェーズで追加した全テストが `pnpm --filter @repo/desktop test` で PASS することを統合確認する

---

## 多角的チェック観点（AIが判断）

| 観点               | チェック内容                                                                   |
| ------------------ | ------------------------------------------------------------------------------ |
| fail path 網羅性   | `fs.readFile()` エラー・LLM エラーの両パスがテストされているか                 |
| AbortSignal 境界   | 全ステップの境界（4箇所）で中断テストが定義されているか                        |
| 進捗順序の保証     | PROGRESS_FLOWS の完全な順序（5ステップ）が検証されているか                     |
| エラー伝播の正確性 | AbortError が `null` に変換されず再スローされることが検証されているか          |
| テスト独立性       | 各テストが `beforeEach` で状態をリセットし、他テストに依存していないか         |
| 既存テストへの影響 | 追加テストが既存テストファイル（cancel・purpose・integration）を壊していないか |

---

## サブタスク管理

| サブタスクID | 内容                                  | ステータス |
| ------------ | ------------------------------------- | ---------- |
| ST-6-01      | ファイル読み込みエラー fail path 追加 | 未実施     |
| ST-6-02      | LLM エラーフォールバックテスト追加    | 未実施     |
| ST-6-03      | AbortSignal エッジケーステスト追加    | 未実施     |
| ST-6-04      | 進捗イベント発火順序テスト追加        | 未実施     |
| ST-6-05      | 回帰ガード（全体テスト PASS 確認）    | 未実施     |

---

## 完了条件

- [ ] `UPD-FAIL-01`〜`UPD-FAIL-04` が `SkillCreatorService.update.test.ts` に追加されている
- [ ] `UPD-ABORT-04`〜`UPD-ABORT-05` が追加されている
- [ ] `UPD-PROG-01`〜`UPD-PROG-02` が追加されている
- [ ] 追加した全テストが `pnpm --filter @repo/desktop test SkillCreatorService.update` で PASS している
- [ ] `pnpm --filter @repo/desktop test` 全体実行で既存テストが引き続き PASS している
- [ ] `expansion-test-result.md` に追加テストID・PASS 確認・実行時間が記載されている

---

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクを 100% 完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 次Phase

完了後、以下のファイルを実行してください:

`docs/30-workflows/TASK-SC-CREATOR-UPDATE-IMPL-001/phase-7-coverage.md`
