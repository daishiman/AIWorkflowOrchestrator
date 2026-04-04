# Phase 11: 手動テスト検証 - Skill Runtime API Key Panel

## メタ情報

| 項目       | 値                     |
| ---------- | ---------------------- |
| タスクID   | TASK-RT-04             |
| Phase      | 11 - 手動テスト検証    |
| 前提Phase  | Phase 1, 2, 5〜10 完了 |
| 関連Issue  | #1881                  |
| タスク分類 | 手動確認が必要な task  |
| ステータス | completed              |

## 目的

Electron アプリ上で API キー設定導線の動作を current build capture で手動検証する。

## 実行タスク

- API キー未設定状態の表示を確認する
- API キー保存動作を確認する
- 無効なキー入力のエラー表示を確認する
- `SkillLifecyclePanel` の補助導線が通常フローを壊さないことを確認する

## 参照資料

| 資料名                    | パス                      | 用途                  |
| ------------------------- | ------------------------- | --------------------- |
| Phase 10 最終判定         | Phase 10                  | 受入判定の基準        |
| Phase 12 ドキュメント更新 | phase-12-documentation.md | 後続 close-out の要件 |

## 統合テスト連携

- 依存Phase: Phase 1, Phase 2, Phase 5, Phase 6, Phase 7, Phase 8, Phase 9, Phase 10
- current facts: `outputs/phase-11/screenshots/` に current build capture を保存する
- current facts: `SettingsView` 主導線 / `SkillLifecyclePanel` 補助導線 / `ApiKeySettingsPanel` の整合を Phase 12 へ引き継ぐ
- current facts: `manual-test-checklist.md` / `ui-sanity-visual-review.md` / `screenshot-plan.json` / `screenshot-coverage.md` / `phase11-capture-metadata.json` を Phase 11 outputs として保持する
- current facts: TC-11-04 は `SkillLifecyclePanel` の baseline capture を non-interference evidence として再利用する
- 手動テストの結果を Phase 12 へ引き継ぐ
- 記録結果と report の整合を確認する

## テストケース

| TC-ID    | 観点                                             | 期待結果                                       | 証跡                                                               |
| -------- | ------------------------------------------------ | ---------------------------------------------- | ------------------------------------------------------------------ |
| TC-11-01 | SettingsView の auth-key 主導線                  | `AuthKeySection` と source 表示が確認できる    | `outputs/phase-11/screenshots/TC-11-01-skill-authkey-initial.png`  |
| TC-11-02 | SkillLifecyclePanel の補助導線                   | `ApiKeySettingsPanel` が確認できる             | `outputs/phase-11/screenshots/TC-11-02-skill-authkey-action.png`   |
| TC-11-03 | 無効なキー入力                                   | マスク済みエラーが表示される                   | `outputs/phase-11/screenshots/TC-11-03-skill-authkey-fallback.png` |
| TC-11-04 | SkillLifecyclePanel の non-interference baseline | 補助導線が通常フローを壊さないことが確認できる | `outputs/phase-11/screenshots/TC-11-02-skill-authkey-action.png`   |

## 画面カバレッジマトリクス

| TC-ID    | 画面                                      | 期待証跡                                          | current fact                        |
| -------- | ----------------------------------------- | ------------------------------------------------- | ----------------------------------- |
| TC-11-01 | SettingsView / AuthKeySection             | `screenshots/TC-11-01-skill-authkey-initial.png`  | current build capture               |
| TC-11-02 | SkillLifecyclePanel / ApiKeySettingsPanel | `screenshots/TC-11-02-skill-authkey-action.png`   | current build capture               |
| TC-11-03 | SettingsView / SkillLifecyclePanel        | `screenshots/TC-11-03-skill-authkey-fallback.png` | current build capture               |
| TC-11-04 | SkillLifecyclePanel                       | `screenshots/TC-11-02-skill-authkey-action.png`   | baseline reuse for non-interference |

## 成果物

| 成果物                       | パス                                           |
| ---------------------------- | ---------------------------------------------- |
| 手動テストチェックリスト     | outputs/phase-11/manual-test-checklist.md      |
| 手動テスト結果               | outputs/phase-11/manual-test-result.md         |
| 手動テスト報告               | outputs/phase-11/manual-test-report.md         |
| 発見された問題               | outputs/phase-11/discovered-issues.md          |
| UI/UX 視覚レビュー           | outputs/phase-11/ui-sanity-visual-review.md    |
| スクリーンショット計画       | outputs/phase-11/screenshot-plan.json          |
| スクリーンショットカバレッジ | outputs/phase-11/screenshot-coverage.md        |
| キャプチャ証跡メタデータ     | outputs/phase-11/phase11-capture-metadata.json |

## 完了条件

- [x] 手動テストチェックリストが作成されている
- [x] 全項目が検証されている
- [x] 発見された問題が記録されている
- [x] UI/UX 視覚レビューと screenshot plan / coverage が記録されている
- [x] current build screenshots が `outputs/phase-11/screenshots/` に保存されている
- [x] 本Phase内の全タスクを100%実行完了
