# Phase 11 証跡インデックス

| ID    | 種別             | 証跡                                                                | 要点                                             |
| ----- | ---------------- | ------------------------------------------------------------------- | ------------------------------------------------ |
| EV-01 | コード差分       | `git diff --name-only`                                              | 変更の中心は `ipc/index.ts` と関連テスト         |
| EV-02 | テスト           | `pnpm --filter @repo/desktop test:run ...`                          | 76 tests PASS（実行ログ上は3 test files）        |
| EV-03 | 型検証           | `pnpm --filter @repo/desktop typecheck`                             | PASS                                             |
| EV-04 | 契約確認         | `apps/desktop/src/main/ipc/index.ts`                                | register/unregister に auth-key lifecycle を接続 |
| EV-05 | 冪等性確認       | `apps/desktop/src/main/ipc/__tests__/authKeyHandlers.test.ts`       | 未登録解除・再登録・複数サイクル PASS            |
| EV-06 | 画面証跡         | `outputs/phase-11/screenshots/TC-11-UI-01-root-navigation.png`      | ダッシュボード導線と情報階層を確認               |
| EV-07 | 画面証跡         | `outputs/phase-11/screenshots/TC-11-UI-02-skill-center-view.png`    | Skill Center のカード/検索導線を確認             |
| EV-08 | 画面証跡         | `outputs/phase-11/screenshots/TC-11-UI-03-ui-design-foundation.png` | UI Foundation の可読性と境界を確認               |
| EV-09 | カバレッジ検証   | `validate-phase11-screenshot-coverage.js --workflow ...`            | PASS（expected TC=3 / covered TC=3）             |
| EV-10 | 視覚品質レビュー | `outputs/phase-11/manual-test-result.md`                            | Apple UI/UX観点で重大問題なし                    |

## 補足

- 本タスクはIPC修正が主目的だが、回帰確認として視覚証跡を取得した。
- 後続UI改修タスクでは同様にTC単位のスクリーンショット（`outputs/phase-11/screenshots/`）を必須とする。
