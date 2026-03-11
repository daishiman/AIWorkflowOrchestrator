# Evidence Index

## コード

| 区分               | パス                                                               | 内容                                                |
| ------------------ | ------------------------------------------------------------------ | --------------------------------------------------- |
| journey contract   | `apps/desktop/src/renderer/navigation/skillLifecycleJourney.ts`    | 一次導線、責務境界、advanced route policy、依存契約 |
| shell integration  | `apps/desktop/src/renderer/App.tsx`                                | `skill-center` alias 正規化                         |
| UI                 | `apps/desktop/src/renderer/views/SkillCenterView/index.tsx`        | journey panel / surface ownership panel             |
| screenshot capture | `apps/desktop/scripts/capture-task-skill-lifecycle-01-phase11.mjs` | Phase 11 証跡取得                                   |

## テスト

| 種別                | パス                                                                                 | 結果                                        |
| ------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------- |
| unit                | `apps/desktop/src/renderer/navigation/skillLifecycleJourney.test.ts`                 | journey / alias / advanced route 契約を確認 |
| unit                | `apps/desktop/src/renderer/views/SkillCenterView/__tests__/SkillCenterView.test.tsx` | journey panel / ownership panel 表示確認    |
| 手動                | `outputs/phase-11/manual-test-result.md`                                             | TC-11-01..06 PASS                           |
| screenshot coverage | `outputs/phase-11/screenshot-coverage.md`                                            | 6 / 6 (100%)                                |

## スクリーンショット

| ケース   | パス                                                              | 観点                |
| -------- | ----------------------------------------------------------------- | ------------------- |
| TC-11-01 | `outputs/phase-11/screenshots/TC-11-01-create-entry.png`          | create 入口         |
| TC-11-02 | `outputs/phase-11/screenshots/TC-11-02-execute-entry.png`         | use 入口            |
| TC-11-03 | `outputs/phase-11/screenshots/TC-11-03-improve-entry.png`         | improve 入口        |
| TC-11-04 | `outputs/phase-11/screenshots/TC-11-04-advanced-supporting.png`   | advanced 補助導線   |
| TC-11-05 | `outputs/phase-11/screenshots/TC-11-05-surface-ownership.png`     | 画面責務ボード      |
| TC-11-06 | `outputs/phase-11/screenshots/TC-11-06-settings-public-shell.png` | settings 公開 shell |

## 仕様同期

| 区分                      | パス                                                     | 内容                                    |
| ------------------------- | -------------------------------------------------------- | --------------------------------------- |
| implementation guide      | `outputs/phase-12/implementation-guide.md`               | Part 1/2 実装説明                       |
| spec update summary       | `outputs/phase-12/spec-update-summary.md`                | 正本仕様同期の要点                      |
| changelog                 | `outputs/phase-12/documentation-changelog.md`            | code/test/doc/spec/verify 変更一覧      |
| compliance                | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Phase 12 準拠証跡                       |
| unassigned task detection | `outputs/phase-12/unassigned-task-detection.md`          | 新規未タスク 0 件と legacy backlog 参照 |

## 検証メモ

- ユーザー申告のローカル実行: `pnpm typecheck`, `pnpm lint`, `pnpm --filter @repo/shared build`, `pnpm --filter @repo/desktop build`, `pnpm test --testTimeout=900000`
- verify 系は Phase 12 成果物に記録済み: `verify-all-specs PASS`, `verify-unassigned-links PASS`, `validate-phase12-implementation-guide PASS`
