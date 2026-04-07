# Phase 11: 手動テスト

## メタ情報

| 項目       | 内容                                        |
| ---------- | ------------------------------------------- |
| Phase      | 11                                          |
| Phase名    | 手動テスト                                  |
| タスクID   | UT-SDK-07-SHARED-IPC-CHANNEL-CONTRACT-001   |
| タスク名   | Skill Creator runtime channel shared 正本化 |
| 前提Phase  | Phase 10: 最終レビューゲート                |
| 後続Phase  | Phase 12: ドキュメント更新                  |
| ステータス | 未実施                                      |
| 作成日     | 2026-04-06                                  |

## 目的

NON_VISUAL タスクとして自動テスト結果を代替証跡として記録する。UI 変更がないため Electron 起動は不要であり、vitest / typecheck / lint / cross-layer parity テストを primary evidence として使用する。

## 背景

本タスク（channel 定義の移行）は型安全性と文字列値の parity のみに関係し、画面上の変化はない。このため `NON_VISUAL` タスクとして分類し、スクリーンショットの代わりに自動テスト証跡・型チェック結果・lint 結果を手動テストの根拠として記録する。

## タスク分類

**NON_VISUAL**

NON_VISUAL である理由:

- `SKILL_CREATOR_RUNTIME_CHANNELS` の定義場所変更（preload → shared）は、channel の文字列値・型安全性・import パスの変更にとどまる
- renderer 側の表示コンポーネントや UI レイアウトには一切変更がない
- Electron アプリを起動しなくても vitest / typecheck / lint / parity テストで全ての受入基準を検証できる
- `screenshot-plan.json` は生成しない

## Phase 11 手動テスト方針（NON_VISUAL）

- `manual-test-checklist.md` を必ず作成する
- `discovered-issues.md` を必ず作成する
- `screenshot-plan.json` は生成しない（NON_VISUAL のため）
- primary evidence は vitest / typecheck / lint / cross-layer parity テスト
- `manual-test-result.md` には `TC-ID ↔ evidence`、NON_VISUAL である理由、代替 evidence を明記する

## 実行タスク

### タスク1: 自動テスト証跡の記録

**目的**: vitest・typecheck・lint の実行結果を NON_VISUAL 代替証跡として記録する

**実行手順**:

1. vitest を実行し、件数・PASS/FAIL を記録する

   ```bash
   pnpm --filter @repo/shared test:run
   pnpm --filter @repo/desktop test:run
   ```

2. typecheck を実行し、型エラーの有無を記録する

   ```bash
   pnpm --filter @repo/shared typecheck
   pnpm --filter @repo/desktop typecheck
   ```

3. lint を実行し、エラーの有無を記録する

   ```bash
   pnpm --filter @repo/shared lint
   pnpm --filter @repo/desktop lint
   ```

4. 結果を `outputs/phase-11/manual-test-result.md` に以下の形式で記録する：
   - TC-ID と対応する evidence（コマンド・出力サマリ）
   - NON_VISUAL である理由の明記
   - 代替 evidence の列挙

**テストケーステーブル**:

| TC-ID | 分類       | 確認内容                                      | evidence                                         |
| ----- | ---------- | --------------------------------------------- | ------------------------------------------------ |
| TC-1  | NON_VISUAL | shared vitest 全 PASS                         | `pnpm --filter @repo/shared test:run` 実行結果   |
| TC-2  | NON_VISUAL | desktop vitest 全 PASS                        | `pnpm --filter @repo/desktop test:run` 実行結果  |
| TC-3  | NON_VISUAL | cross-layer parity テスト 3 チャンネル全 PASS | governance-bundle.test.ts 実行結果               |
| TC-4  | NON_VISUAL | shared typecheck エラー 0 件                  | `pnpm --filter @repo/shared typecheck` 実行結果  |
| TC-5  | NON_VISUAL | desktop typecheck エラー 0 件                 | `pnpm --filter @repo/desktop typecheck` 実行結果 |
| TC-6  | NON_VISUAL | shared lint エラー 0 件                       | `pnpm --filter @repo/shared lint` 実行結果       |
| TC-7  | NON_VISUAL | desktop lint エラー 0 件                      | `pnpm --filter @repo/desktop lint` 実行結果      |

**期待される成果物**:

- `outputs/phase-11/manual-test-checklist.md`
- `outputs/phase-11/manual-test-result.md`

---

### タスク2: IPC handler 後方互換性ウォークスルー

**目的**: 既存の IPC handler が変更なく動作していること、および ALLOWED_ON_CHANNELS が正しく 3 チャンネルを含んでいることをコードレビューで確認する

**実行手順**:

1. `apps/desktop/src/preload/channels.ts` を開き、以下を確認する：
   - `SKILL_CREATOR_RUNTIME_CHANNELS` が `@repo/shared/src/ipc/channels` から import されていること
   - 3 チャンネルの直書き定義が除去されていること
   - `ALLOWED_ON_CHANNELS` に 3 チャンネルが正しく含まれていること

2. `packages/shared/src/ipc/channels.ts` を開き、以下を確認する：
   - `SKILL_CREATOR_RUNTIME_CHANNELS` オブジェクトに 3 チャンネルが定義されていること
   - 文字列値が正しいこと（`"skill-creator:progress"` 等）
   - `IPC_CHANNELS` スプレッドに `SKILL_CREATOR_RUNTIME_CHANNELS` が含まれていること

3. 既存の IPC handler（`approvalHandlers`、`executionHandlers`）のソースコードを確認し、本タスクの変更による影響がないことを確認する

4. 発見事項を `outputs/phase-11/discovered-issues.md` に記録する（0件でも記録）

**期待される成果物**:

- `outputs/phase-11/discovered-issues.md`

---

## 参照資料

| 参照資料                  | パス                                                                         | 用途                    |
| ------------------------- | ---------------------------------------------------------------------------- | ----------------------- |
| Phase 10 最終レビュー結果 | `outputs/phase-10/final-review-result.md`                                    | ゲート判定確認          |
| Phase 10 受入基準照合表   | `outputs/phase-10/acceptance-criteria-check.md`                              | AC-1〜AC-7 確認結果     |
| shared channels           | `packages/shared/src/ipc/channels.ts`                                        | shared 側チャンネル定義 |
| desktop preload channels  | `apps/desktop/src/preload/channels.ts`                                       | preload 側チャンネル    |
| governance bundle test    | `apps/desktop/src/main/services/runtime/__tests__/governance-bundle.test.ts` | parity テスト           |
| shared channels test      | `packages/shared/src/ipc/__tests__/channels.test.ts`                         | shared チャンネルテスト |
| Phase 1 受入基準          | `phase-1-requirements.md`                                                    | 受入基準の原本          |

## 統合テスト連携

- Phase 11 では NON_VISUAL 代替証跡として自動テスト結果を記録する
- cross-layer parity テストの結果が TC-3 の primary evidence となる
- Phase 12 へ manual-test-result.md と discovered-issues.md を渡す

## 成果物

| 成果物                   | パス                                        | 内容                                                  |
| ------------------------ | ------------------------------------------- | ----------------------------------------------------- |
| 手動テストチェックリスト | `outputs/phase-11/manual-test-checklist.md` | NON_VISUAL テストケース一覧                           |
| 手動テスト結果           | `outputs/phase-11/manual-test-result.md`    | TC-ID ↔ evidence、NON_VISUAL 理由、代替 evidence 記録 |
| 発見課題                 | `outputs/phase-11/discovered-issues.md`     | ウォークスルーで発見した問題（0件でも記録）           |

## 完了条件

- [ ] NON_VISUAL 代替証跡が記録されている（vitest / typecheck / lint 結果）
- [ ] `manual-test-result.md` に `TC-ID ↔ evidence` が記録されている
- [ ] `manual-test-result.md` に NON_VISUAL である理由が明記されている
- [ ] `discovered-issues.md` が作成されている（0件でも記録）
- [ ] BLOCKER 問題なし（BLOCKER がある場合は Phase 12 への移行を阻止）
- [ ] IPC handler 後方互換性ウォークスルーが完了している
- [ ] `outputs/phase-11/manual-test-checklist.md` が生成されている
- [ ] `outputs/phase-11/manual-test-result.md` が生成されている
- [ ] `outputs/phase-11/discovered-issues.md` が生成されている

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクを 100% 完了し、完了を明記
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 依存関係

| 依存 Phase | 依存成果物                                      |
| ---------- | ----------------------------------------------- |
| Phase 10   | `outputs/phase-10/final-review-result.md`       |
| Phase 10   | `outputs/phase-10/acceptance-criteria-check.md` |

## 次のPhase

Phase 12: ドキュメント更新 → `phase-12-documentation.md`
