# Phase 5: 実装

## メタ情報

| 項目    | 値                                          |
| ------- | ------------------------------------------- |
| PhaseID | 5                                           |
| Phase名 | 実装                                        |
| Task ID | UT-TASK-SC-LLM-PURPOSE-WIRE-001-UPDATE-MODE |
| 前Phase | 4                                           |
| 次Phase | 6                                           |
| 作成日  | 2026-04-19                                  |

## 目的

Phase 4 で作成した Red テストを Green にする最小限の実装を行う。`update` / `improve-prompt` モード専用のプライベートメソッドを追加し、switch 文を修正して `init_skill.js` が誤って呼ばれないよう制御する。

## 実行タスク

### T-5-1: 修正ファイルリスト

| 種別 | ファイルパス                                                                 |
| ---- | ---------------------------------------------------------------------------- |
| 修正 | `apps/desktop/src/main/services/skill/SkillCreatorService.ts`                |
| 修正 | `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts` |

### T-5-2: `runUpdateWorkflow` メソッド実装

`SkillCreatorService.ts` にプライベートメソッドを追加する。

- シグネチャ: `private async runUpdateWorkflow(options: SkillCreateOptions, signal: AbortSignal): Promise<void>`
- update 用スクリプトが存在しない場合はスタブ実装で可
  - `this.logger.warn("runUpdateWorkflow: not yet implemented")` を出力する
  - `this.emitProgress(...)` で適切なフェーズを通知する
- AbortSignal を受け取り、abort 時には処理を中断できる構造にする

### T-5-3: `runImprovePromptWorkflow` メソッド実装

`SkillCreatorService.ts` にプライベートメソッドを追加する。

- シグネチャ: `private async runImprovePromptWorkflow(options: SkillCreateOptions, signal: AbortSignal): Promise<void>`
- improve-prompt 用スクリプトが存在しない場合はスタブ実装で可
  - `this.logger.warn("runImprovePromptWorkflow: not yet implemented")` を出力する
  - `this.emitProgress(...)` で適切なフェーズを通知する
- AbortSignal を受け取り、abort 時には処理を中断できる構造にする

### T-5-4: switch 文の case を修正

`runCreateSkill` 内の switch 文を以下の通り修正する。

```
case "update":
  await this.runUpdateWorkflow(options, signal);
  break;

case "improve-prompt":
  await this.runImprovePromptWorkflow(options, signal);
  break;
```

- 各 case が対応するメソッドを呼び出すことを確認する
- `break` または `return` で他の case に落ちないことを確認する

### T-5-5: `init_skill.js` が update / improve-prompt で呼ばれない制御

- `runUpdateWorkflow` および `runImprovePromptWorkflow` 内に `init_skill.js` の呼び出しを含めない
- create モード専用の処理パスに `init_skill.js` 呼び出しが限定されることを確認する
- 制御方式の選択肢（どちらか選択する）:
  - **early return 方式**: 各メソッドが独立しており `init_skill.js` 呼び出し箇所に到達しない
  - **フラグ方式**: `shouldSkipInit` フラグを使用して `init_skill.js` 呼び出しを条件分岐でスキップする

### T-5-6: TypeScript 型チェック

```bash
pnpm --filter @repo/desktop typecheck
```

- 型エラーが 0 件であることを確認する
- エラーがある場合は修正してから次のタスクへ進む

### T-5-7: テスト実行で Green 確認

```bash
pnpm --filter @repo/desktop test -- SkillCreatorService
```

- Phase 4 で作成した update / improve-prompt テストが **Green（成功）** になることを確認する
- 既存の create モードテストも引き続き Green であることを確認する
- 全件 Green であれば実装完了とする

## 実装方針

| 方針               | 詳細                                                                                                              |
| ------------------ | ----------------------------------------------------------------------------------------------------------------- |
| スタブ実装の許容   | update / improve-prompt 用の外部スクリプトが存在しない場合、`logger.warn` を出力するスタブ実装で構わない          |
| init_skill.js 制御 | early return 方式を優先する。各専用メソッドが独立しているため、`init_skill.js` 呼び出しに到達しない構造が望ましい |
| progress emit      | create モードと同様のフェーズ構成（start → processing → complete）を踏む                                          |
| AbortSignal 対応   | メソッドシグネチャで受け取り、abort チェックを適切な箇所に挿入する                                                |

## TDD サイクル確認

| ステップ | 状態     | 説明               |
| -------- | -------- | ------------------ |
| Red      | 完了     | Phase 4 で確認済み |
| Green    | 確認対象 | T-5-7 で確認する   |
| Refactor | 未着手   | Phase 8 で実施     |

## 参照資料

| 資料名             | パス                                                                                     |
| ------------------ | ---------------------------------------------------------------------------------------- |
| 対象サービス       | `apps/desktop/src/main/services/skill/SkillCreatorService.ts`                            |
| 対象テストファイル | `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts`             |
| Phase 4 仕様書     | `docs/30-workflows/UT-TASK-SC-LLM-PURPOSE-WIRE-001-UPDATE-MODE/phase-4-test-creation.md` |

## 成果物

| 成果物                        | 種別         | 説明                                                                 |
| ----------------------------- | ------------ | -------------------------------------------------------------------- |
| `SkillCreatorService.ts`      | ファイル変更 | `runUpdateWorkflow` / `runImprovePromptWorkflow` 追加、switch 文修正 |
| `SkillCreatorService.test.ts` | ファイル変更 | Phase 4 で追加済みテストがそのまま Green になる                      |

## 完了条件

- [ ] T-5-1: 修正対象ファイルを把握した
- [ ] T-5-2: `runUpdateWorkflow` メソッドを実装した
- [ ] T-5-3: `runImprovePromptWorkflow` メソッドを実装した
- [ ] T-5-4: switch 文の case "update" / "improve-prompt" を修正した
- [ ] T-5-5: `init_skill.js` が update / improve-prompt で呼ばれない制御を確認した
- [ ] T-5-6: TypeScript 型チェックが PASS した
- [ ] T-5-7: テストが全件 Green になった

## Phase 末端アクション

- 本ドキュメントの「TDD サイクル確認」テーブルの Green 欄を「完了」に更新する
- Phase 6（テスト拡充）へ移行する
