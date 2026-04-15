# Phase 4: テスト設計

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 4                                 |
| Phase名    | テスト設計                        |
| 対象機能   | TASK-SC-FIX-GENERATE-SKILL-MD-001 |
| 前提Phase  | Phase 3: 設計レビュー             |
| 次Phase    | Phase 5: 実装計画                 |
| ステータス | pending                           |
| 作成日     | 2026-04-14                        |

## 目的

AC-1〜AC-5 の再発を検出するテストを実装より先に定義し、
`generate_skill_md.js` が `--plan` / `--output` 引数で呼ばれること・
finally クリーンアップ・フォールバック動作の検証可能性を確保する。

## 実行タスク

### Task 1: AC-1 対応テスト — generate_skill_md.js が --plan / --output で呼ばれること

検証方針:

- `scriptExecutor.execute` をモックし、呼び出し時の第 2 引数（args 配列）を記録する
- args に `"--plan"` と `"--output"` が含まれていることをアサートする
- args に `"--path"` が含まれていないことをアサートする（旧引数の排除確認）
- `--plan` の次の要素が `os.tmpdir()` 配下のパス文字列であることを確認する
- `--output` の次の要素が `skillDir/SKILL.md` であることを確認する

### Task 2: AC-2 対応テスト — 生成 SKILL.md に ## Task一覧 セクションが含まれること

検証方針:

- `generate_skill_md.js` が終了コード 0 で完了したケースでは `ensureSkillMdExists` が呼ばれないことを確認する
- スクリプトが実際に `## Task一覧` セクションを含む SKILL.md を生成することは統合テストで確認する（ユニットテストではモック経由でスクリプト成功をシミュレート）

### Task 3: AC-3 対応テスト — 生成 SKILL.md に YAML フロントマターが含まれること

検証方針:

- AC-2 と同様にスクリプト成功ケースでのフォールバック非実行を確認する
- YAML フロントマター（`---` ブロック）の有無はスクリプト出力依存のため統合テストで確認

### Task 4: AC-4 対応テスト — スクリプト不在時フォールバックが機能すること

検証方針:

- `scriptExecutor.execute` がスクリプト不在エラー（`success: false`）を返すようモックする
- `ensureSkillMdExists` が呼び出されることをスパイで確認する
- フォールバック後もエラーが throw されないことを確認する

### Task 5: AC-5 対応テスト — tmp json ファイルが finally で削除されること

検証方針:

- `fs.writeFile` と `fs.unlink` をモックする
- スクリプト **成功** 時に `fs.unlink` が `tmpPlanPath` で呼ばれることを確認する
- スクリプト **失敗** 時（`success: false`）に `fs.unlink` が呼ばれることを確認する
- `fs.writeFile` が例外を投げた場合にも `fs.unlink` が呼ばれることを確認する（finally 節の保証）

## テストケース一覧（TC-01〜TC-07）

| テスト ID | 対象 AC | 入力条件                                                   | 期待結果                                                                                 | 備考                                     |
| --------- | ------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------- |
| TC-01     | AC-1    | `createSkill` を正常呼び出し                               | `execute("generate_skill_md.js", args)` の args に `"--plan"` と `"--output"` が含まれる | 旧引数 `"--path"` が含まれないことも確認 |
| TC-02     | AC-1    | `createSkill` を正常呼び出し                               | `--plan` の次要素が `os.tmpdir()` 配下のパス文字列である                                 | tmp ファイルパスの形式確認               |
| TC-03     | AC-1    | `createSkill` を正常呼び出し                               | `--output` の次要素が `skillDir/SKILL.md` である                                         | 出力パスの確認                           |
| TC-04     | AC-4    | `execute` が `{ success: false }` を返す（スクリプト失敗） | `ensureSkillMdExists` が呼び出される                                                     | フォールバック動作の確認                 |
| TC-05     | AC-4    | `execute` が スクリプト不在エラーを返す                    | `ensureSkillMdExists` が呼び出され、例外が throw されない                                | isMissingScriptError 経路の確認          |
| TC-06     | AC-5    | `execute` が `{ success: true }` を返す（スクリプト成功）  | `fs.unlink(tmpPlanPath)` が呼び出される                                                  | 成功時 cleanup 確認                      |
| TC-07     | AC-5    | `execute` が `{ success: false }` を返す（スクリプト失敗） | `fs.unlink(tmpPlanPath)` が呼び出される                                                  | 失敗時も cleanup される確認              |

## 参照資料

| 資料名              | パス                                                                         | 説明           |
| ------------------- | ---------------------------------------------------------------------------- | -------------- |
| 設計レビュー        | `phase-3-design-review.md`                                                   | ゲート結果     |
| 設計書              | `phase-2-design.md`                                                          | テスト観測点   |
| SkillCreatorService | `apps/desktop/src/main/services/skill/SkillCreatorService.ts`                | テスト対象     |
| 既存テスト          | `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts` | 既存テスト確認 |

## 統合テスト連携

- Phase 10 の最終レビューで AC-1〜AC-5 との対応表を再確認する
- スクリプト成功→SKILL.md 内容確認は統合テストとして分離し、ユニットテストはモック経由に限定する

## 成果物

| 成果物       | パス                             | 説明                       |
| ------------ | -------------------------------- | -------------------------- |
| テスト設計書 | `outputs/phase-4/test-design.md` | テストケース一覧 TC-01〜07 |

## 完了条件

- [ ] AC-1〜AC-5 のすべてに対応するテストケースが定義されている
- [ ] `--plan` / `--output` 引数の検証テストが含まれている
- [ ] finally cleanup の検証テストが含まれている（成功・失敗の両経路）
- [ ] フォールバック動作のテストが含まれている
- [ ] 実装前に fail-first 観点が記録されている
- [ ] 本 Phase 内の全タスクを 100% 実行完了

## タスク 100% 実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase 末端で各タスクを 100% 完了し、完了を明記している

## TDD 検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test -- --testPathPattern="SkillCreatorService"
```

**確認項目**:

- [ ] 実装前にテストが失敗することを確認（Red 状態）
- [ ] 実装後にテストが成功することを確認（Green 状態）

## 次 Phase

→ [Phase 5: 実装計画](./phase-5-implementation.md)
