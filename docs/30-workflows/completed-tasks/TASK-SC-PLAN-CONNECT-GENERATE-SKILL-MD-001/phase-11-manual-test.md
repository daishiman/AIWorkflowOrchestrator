# Phase 11: 手動テスト

## メタ情報

| 項目       | 内容                                         |
| ---------- | -------------------------------------------- |
| Phase      | 11                                           |
| タスクID   | TASK-SC-PLAN-CONNECT-GENERATE-SKILL-MD-001   |
| 機能名     | runCreateWorkflow-to-generateSkillMd-connect |
| 前提Phase  | Phase 10（最終レビューゲート PASS）          |
| 後続Phase  | Phase 12                                     |
| 作成日     | 2026-04-16                                   |
| ステータス | pending                                      |

## 目的

実際の動作を手動で検証する。
`runCreateWorkflow` 戻り値の `generateSkillMd` への接続が、Electron アプリ上で正しく動作することを確認する。

## タスク分類

**分類: NON_VISUAL（非UI タスク）**

`SkillCreatorService.ts` の内部ロジック（`structurePlan` の受け取りと `generateSkillMd` への受け渡し）を確認するタスクであり、
見た目や画面差分は変更しない。証跡の主ソースは自動テスト・型チェック・ビルドログ・実際のスキル作成動作確認とする。

## 実行タスク

### タスク1: 手動テストチェックリスト作成（manual-test-checklist.md）

`outputs/phase-11/manual-test-checklist.md` に以下の MTC を記録する。

| MTC ID | テスト内容                                                        | 確認方法                                                                |
| ------ | ----------------------------------------------------------------- | ----------------------------------------------------------------------- |
| MTC-1  | create モードでスキル作成を実行し、SKILL.md が生成されること      | Electron アプリ起動 → create モードでスキル作成 → SKILL.md 生成を確認   |
| MTC-2  | `generate_skill_md.js` の `--plan` オプションが正しく動作すること | `node generate_skill_md.js --plan <json> --output <dir>` の実行結果確認 |
| MTC-3  | `structurePlan` が null の場合にエラーログが出力されること        | テストコードまたはデバッグ実行でエラーログ出力を確認                    |
| MTC-4  | 既存の collaborative / orchestrate モードが影響を受けないこと     | `pnpm --filter @repo/desktop test` の全件 PASS で確認                   |

### タスク2: 手動テスト実施

```bash
# targeted vitest 実行（SkillCreatorService のテスト）
pnpm --filter @repo/desktop exec vitest run \
  src/main/services/skill/__tests__/SkillCreatorService.test.ts

# 型チェック
pnpm --filter @repo/desktop typecheck

# ビルド確認
pnpm --filter @repo/desktop build

# void structurePlan; が削除されていることを確認
grep -n "void structurePlan" \
  apps/desktop/src/main/services/skill/SkillCreatorService.ts
# 期待: 出力なし

# generateSkillMd の呼び出しが存在することを確認
grep -n "generateSkillMd\|if.*structurePlan" \
  apps/desktop/src/main/services/skill/SkillCreatorService.ts
```

Electron アプリを起動してスキル作成（create モード）を実行し、以下を確認する。

- ログ確認（structurePlan の null/非null 分岐）
- SKILL.md の生成確認

### タスク3: 発見事項記録（discovered-issues.md）

テスト中に発見した不具合や改善点を `outputs/phase-11/discovered-issues.md` に記録する。

- 不具合・改善点がない場合でも「発見事項なし」として記録する
- 発見した問題は Phase 5〜8 への戻り判断基準を明確にする

## NON_VISUAL タスクの証跡方針

- `outputs/phase-11/manual-test-checklist.md` を必ず作成する
- `outputs/phase-11/discovered-issues.md` を必ず作成する
- screenshot-plan.json は生成しない
- primary evidence は vitest / typecheck / lint / 実際のスキル作成動作確認
- `outputs/phase-11/manual-test-result.md` に TC-ID（MTC-ID）↔ evidence の対応を明記する
- placeholder-only の証跡は PASS 扱いにしない

## 参照資料

| 資料名           | パス                                                          | 用途                 |
| ---------------- | ------------------------------------------------------------- | -------------------- |
| Phase 10 成果物  | `outputs/phase-10/final-review-result.md`                     | 最終レビュー結果確認 |
| 対象実装ファイル | `apps/desktop/src/main/services/skill/SkillCreatorService.ts` | 動作確認対象         |
| 関連スクリプト   | `generate_skill_md.js`                                        | MTC-2 確認対象       |

- 依存 Phase 参照: Phase 2 / Phase 5 / Phase 6 / Phase 7 / Phase 8 / Phase 9 の成果物を前提にする

## 統合テスト連携【必須】

| 判定項目                                  | 基準 | 結果 |
| ----------------------------------------- | ---- | ---- |
| targeted vitest（SkillCreatorService）    | PASS | -    |
| `pnpm --filter @repo/desktop typecheck`   | PASS | -    |
| `pnpm --filter @repo/desktop build`       | PASS | -    |
| MTC-1: create モードで SKILL.md 生成確認  | PASS | -    |
| MTC-2: --plan オプション動作確認          | PASS | -    |
| MTC-3: null 時エラーログ確認              | PASS | -    |
| MTC-4: collaborative/orchestrate 影響なし | PASS | -    |

## 多角的チェック観点

| 観点       | 確認内容                                                         |
| ---------- | ---------------------------------------------------------------- |
| 機能正常性 | create モードで SKILL.md が実際に生成されること                  |
| 後退なし   | collaborative / orchestrate モードの既存テストが崩れていないこと |
| 型安全性   | 型接続後もコンパイルエラーが発生しないこと                       |
| ビルド成功 | desktop の build が正常に完了すること                            |
| 証跡最小化 | UI 変更がないため screenshot を作らずに証跡を閉じられること      |

## 成果物

| 成果物                   | パス                                        | 説明                                    |
| ------------------------ | ------------------------------------------- | --------------------------------------- |
| 手動テストチェックリスト | `outputs/phase-11/manual-test-checklist.md` | MTC-1〜MTC-4 の確認項目                 |
| 手動テスト結果           | `outputs/phase-11/manual-test-result.md`    | MTC-ID ↔ evidence 対応・NON_VISUAL 理由 |
| 発見事項                 | `outputs/phase-11/discovered-issues.md`     | 不具合・改善点（0 件でも必須）          |

## 完了条件

- [ ] MTC-1〜MTC-4 が全て実施されている
- [ ] `manual-test-checklist.md` が作成されている
- [ ] `manual-test-result.md` に MTC-ID ↔ evidence の対応が記載されている
- [ ] `discovered-issues.md` が作成されている（空でも可）
- [ ] placeholder-only の証跡がない
- [ ] スクリーンショットを作らない理由（NON_VISUAL）が明記されている
- [ ] 本 Phase 内の全タスクを 100% 実行完了

## サブタスク管理

1. 手動テストチェックリスト作成（MTC-1〜MTC-4）
2. targeted vitest 実行
3. 型チェック・ビルド確認
4. Electron アプリ動作確認（create モード）
5. 発見事項記録
6. 手動テスト結果記録（MTC-ID ↔ evidence）

## タスク 100% 実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 12: ドキュメント更新
