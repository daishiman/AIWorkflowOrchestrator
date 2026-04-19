# Phase 4: テスト作成

## メタ情報

| 項目    | 値                                          |
| ------- | ------------------------------------------- |
| PhaseID | 4                                           |
| Phase名 | テスト作成                                  |
| Task ID | UT-TASK-SC-LLM-PURPOSE-WIRE-001-UPDATE-MODE |
| 前Phase | 3                                           |
| 次Phase | 5                                           |
| 作成日  | 2026-04-19                                  |

## 目的

TDD Red 状態のテストを先に作成する。`update` / `improve-prompt` モードのユニットテストを実装前に書き、現状の誤った動作（`init_skill.js` が呼ばれる）を失敗として検出できる状態にする。

## 実行タスク

### T-4-1: 既存テストファイルのパターン確認

- `SkillCreatorService.purpose.test.ts` を参照し、テストの構造・モック方法・アサーションパターンを把握する
- 既存の `create` モードテストがどのようなスパイ設定をしているか確認する
- テストファイルのインポート構成と `beforeEach` / `afterEach` フックを確認する

### T-4-2: update モードのテストケース作成

以下の2ケースを `SkillCreatorService.test.ts` に追加する。

#### ケース 1: `runUpdateWorkflow` が呼ばれる

```
options.mode = "update" で runCreateSkill を呼び出した場合、
runUpdateWorkflow プライベートメソッドが1回呼ばれること
```

- `vi.spyOn` を用いて `runUpdateWorkflow` の呼び出しを検証する
- `expect(spy).toHaveBeenCalledOnce()` でアサートする

#### ケース 2: `init_skill.js` が呼ばれない

```
options.mode = "update" で runCreateSkill を呼び出した場合、
init_skill.js を実行するスクリプト呼び出しが発生しないこと
```

- `init_skill.js` を呼び出す内部処理をスパイまたはモックして、呼び出し回数が 0 であることを検証する

### T-4-3: improve-prompt モードのテストケース作成

以下の2ケースを `SkillCreatorService.test.ts` に追加する。

#### ケース 1: `runImprovePromptWorkflow` が呼ばれる

```
options.mode = "improve-prompt" で runCreateSkill を呼び出した場合、
runImprovePromptWorkflow プライベートメソッドが1回呼ばれること
```

- `vi.spyOn` を用いて `runImprovePromptWorkflow` の呼び出しを検証する
- `expect(spy).toHaveBeenCalledOnce()` でアサートする

#### ケース 2: `init_skill.js` が呼ばれない

```
options.mode = "improve-prompt" で runCreateSkill を呼び出した場合、
init_skill.js を実行するスクリプト呼び出しが発生しないこと
```

- `init_skill.js` を呼び出す内部処理をスパイまたはモックして、呼び出し回数が 0 であることを検証する

### T-4-4: create モード回帰テスト確認

- 既存の `create` モードテストが変更によって壊れていないことを確認する
- T-4-2 / T-4-3 のテスト追加後も既存テストがすべて通ることを期待する（現時点では既存テストはそのまま）

### T-4-5: テスト実行して Red 状態を確認

```bash
pnpm --filter @repo/desktop test -- SkillCreatorService
```

- T-4-2 / T-4-3 で追加したテストが **失敗（Red）** になることを確認する
- 既存の `create` モードテストは引き続き Green であることを確認する
- Red になった旨をコメントまたは本ドキュメントの成果物欄に記録する

## TDD サイクル確認

| ステップ | 状態     | 説明                                     |
| -------- | -------- | ---------------------------------------- |
| Red      | 確認済み | update / improve-prompt テストが失敗する |
| Green    | 未着手   | Phase 5 で実施                           |
| Refactor | 未着手   | Phase 8 で実施                           |

> Phase 4 完了時点で Red 状態であることが正しい。Green でない場合はテストが正しく書けていない可能性がある。

## 参照資料

| 資料名                | パス                                                                                 |
| --------------------- | ------------------------------------------------------------------------------------ |
| 対象サービス          | `apps/desktop/src/main/services/skill/SkillCreatorService.ts`                        |
| 既存テスト（purpose） | `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.purpose.test.ts` |
| 対象テストファイル    | `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts`         |

## 成果物

| 成果物                        | 種別         | 説明                                               |
| ----------------------------- | ------------ | -------------------------------------------------- |
| `SkillCreatorService.test.ts` | ファイル変更 | update / improve-prompt モードのテストケースを追加 |

## 完了条件

- [ ] T-4-1: 既存テストのパターンを把握した
- [ ] T-4-2: update モードの2テストケースを追加した
- [ ] T-4-3: improve-prompt モードの2テストケースを追加した
- [ ] T-4-4: create モード回帰テストが Green のままであることを確認した
- [ ] T-4-5: 追加した update / improve-prompt テストが Red（失敗）であることを確認した

## Phase 末端アクション

- 本ドキュメントの「TDD サイクル確認」テーブルの Red 欄を「確認済み」に更新する
- Phase 5（実装）へ移行する
