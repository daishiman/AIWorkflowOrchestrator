# Phase 11: 手動テスト

## メタ情報

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| タスク ID  | TASK-IMP-SKILLDETAIL-ACTION-BUTTONS-001 |
| 機能名     | skilldetail-action-buttons              |
| Phase      | 11                                      |
| 作成日     | 2026-03-17                              |
| 再実施日   | 2026-03-19                              |
| 依存 Phase | Phase 10 成果物（`outputs/phase-10/`）  |

## 目的

Electron main shell 上で `SkillDetailPanel` の action buttons を検証し、`SkillCenterView` から `skill-editor` / `skillAnalysis` への handoff が実導線で成立することを `TC-ID + スクリーンショット証跡` で固定する。

## 参照資料

| 参照資料                         | パス                                                                                                           | 用途                                                                  |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Phase 2 設計成果物               | `outputs/phase-2/` / `phase-2-design.md`                                                                       | 期待する UI 配置・遷移契約を確認する                                  |
| Phase 5 実装成果物               | `outputs/phase-5/`                                                                                             | 実装対象ファイルと Green 結果を確認する                               |
| Phase 6 テスト拡充成果物         | `outputs/phase-6/`                                                                                             | 回帰テスト観点を確認する                                              |
| Phase 7 カバレッジ成果物         | `outputs/phase-7/`                                                                                             | task scope coverage と gap を確認する                                 |
| Phase 8 リファクタリング成果物   | `outputs/phase-8/`                                                                                             | UI 責務の変化がないことを確認する                                     |
| Phase 9 品質検証成果物           | `outputs/phase-9/`                                                                                             | lint/typecheck/test の PASS を確認する                                |
| Phase 10 最終レビュー結果        | `outputs/phase-10/final-review-report.md`                                                                      | 手動確認の優先観点を確定する                                          |
| SkillDetailPanel 実装            | `apps/desktop/src/renderer/views/SkillCenterView/components/SkillDetailPanel/SkillDetailPanel.tsx`             | 表示条件・ラベル・キーボード動作を確認する                            |
| useSkillCenter 実装              | `apps/desktop/src/renderer/views/SkillCenterView/hooks/useSkillCenter.ts`                                      | handoff 契約と状態更新順序を確認する                                  |
| renderView foundation            | `.claude/skills/aiworkflow-requirements/references/workflow-skill-lifecycle-routing-render-view-foundation.md` | `skillAnalysis` / `skill-editor` 依存の routing foundation を照合する |
| aiworkflow-requirements: UI ナビ | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`                                        | ViewType 遷移契約を照合する                                           |

## 実行タスク

- タスク 1: Playwright main shell capture で desktop / mobile / keyboard 観点の証跡を再取得する
- タスク 2: `TC-11-01` から `TC-11-07` までの期待状態を確認する
- タスク 3: Apple UI/UX 観点の視覚レビューを `ui-sanity-visual-review.md` に記録する
- タスク 4: 発見事項を `issues.md` に記録し、次 Phase へ引き継ぐ

## 実行方法

```bash
pnpm --filter @repo/desktop run screenshot:skilldetail-action-buttons
```

- 開発用 Vite server は screenshot script が自動起動する
- 証跡保存先は `outputs/phase-11/screenshots/` とする
- handoff の補助ログは `outputs/phase-11/screenshots/phase11-handoff-diagnostics.json` に保存する
- capture 実行メタデータは `outputs/phase-11/phase11-capture-metadata.json` に保存する

## 統合テスト連携

- 手動テストの前提として、以下の targeted suite が PASS していることを確認する
  - `src/renderer/views/SkillCenterView/__tests__/SkillDetailPanel.test.tsx`
  - `src/renderer/views/SkillCenterView/__tests__/useSkillCenter.test.ts`
  - `src/renderer/views/SkillCenterView/hooks/__tests__/useSkillCenter.navigation.test.ts`
- 手動テストでは unit test で保証していない `main shell 上の handoff 成立` と `desktop/mobile の視覚整合` を補完確認する
- `phase11-handoff-diagnostics.json` を併用し、`getFileTree("imported-skill")` / `analyze("imported-skill")` の呼び出しが screenshot 証跡と矛盾しないことを確認する

## テストシナリオ

### シナリオ 1: imported detail panel の action buttons 表示

**前提条件:** imported skill card が 1 件以上存在する

**確認項目:**

- [ ] `エディタで開く` が表示される
- [ ] `分析する` が表示される
- [ ] `追加済み` 状態と併記してもレイアウトが崩れない

### シナリオ 2: unimported detail panel の action buttons 非表示

**前提条件:** 未追加スキルが 1 件以上存在する

**確認項目:**

- [ ] action zone が表示されない
- [ ] レイアウトに空白崩れがない

### シナリオ 3: edit handoff

**確認項目:**

- [ ] detail panel 起点で `skill-editor` に遷移する
- [ ] file tree が描画される
- [ ] `phase11-handoff-diagnostics.json` に `getFileTree("imported-skill")` 呼び出しが残る

### シナリオ 4: analyze handoff

**確認項目:**

- [ ] detail panel 起点で `skillAnalysis` に遷移する
- [ ] 分析結果 view が描画される
- [ ] `phase11-handoff-diagnostics.json` に `analyze("imported-skill")` 呼び出しが残る

### シナリオ 5: mobile bottom sheet

**確認項目:**

- [ ] 390px 幅でも action buttons が見切れない
- [ ] bottom sheet 内で危険操作と action zone が分離される

### シナリオ 6: keyboard focus

**確認項目:**

- [ ] `Tab` で `edit-skill-button` に到達できる
- [ ] focus ring が視認できる

### シナリオ 7: Escape close

**確認項目:**

- [ ] `Escape` で detail panel が閉じる
- [ ] shell が `SkillCenterView` 一覧状態へ戻る

## テストケース

| TC-ID    | 観点                    | 期待結果                                                              | 主証跡                                                     |
| -------- | ----------------------- | --------------------------------------------------------------------- | ---------------------------------------------------------- |
| TC-11-01 | imported detail panel   | `SkillDetailPanel` に `エディタで開く` と `分析する` が同時表示される | `screenshots/TC-11-01-desktop-imported-detail-panel.png`   |
| TC-11-02 | unimported detail panel | 未インポート skill では action zone が表示されない                    | `screenshots/TC-11-02-desktop-unimported-detail-panel.png` |
| TC-11-03 | edit handoff            | main shell 上で `skill-editor` に遷移し、file tree が開ける状態になる | `screenshots/TC-11-03-desktop-edit-handoff.png`            |
| TC-11-04 | analyze handoff         | main shell 上で `skillAnalysis` に遷移し、分析結果が描画される        | `screenshots/TC-11-04-desktop-analyze-handoff.png`         |
| TC-11-05 | mobile bottom sheet     | 390x844 でも action buttons がアクセス可能でレイアウト破綻しない      | `screenshots/TC-11-05-mobile-imported-bottom-sheet.png`    |
| TC-11-06 | keyboard focus ring     | `edit-skill-button` にフォーカスが移動し、視認できる                  | `screenshots/TC-11-06-keyboard-focus-ring.png`             |
| TC-11-07 | Escape close            | `Escape` で detail panel が閉じ、一覧状態に戻る                       | `screenshots/TC-11-07-escape-close.png`                    |

## 画面カバレッジマトリクス

| TC-ID    | Surface                              | Viewport | 状態                            | 証跡                                                       |
| -------- | ------------------------------------ | -------- | ------------------------------- | ---------------------------------------------------------- |
| TC-11-01 | SkillCenterView / SkillDetailPanel   | 1440x900 | desktop imported detail panel   | `screenshots/TC-11-01-desktop-imported-detail-panel.png`   |
| TC-11-02 | SkillCenterView / SkillDetailPanel   | 1440x900 | desktop unimported detail panel | `screenshots/TC-11-02-desktop-unimported-detail-panel.png` |
| TC-11-03 | SkillEditorView                      | 1440x900 | main shell edit handoff         | `screenshots/TC-11-03-desktop-edit-handoff.png`            |
| TC-11-04 | SkillAnalysisView                    | 1440x900 | main shell analyze handoff      | `screenshots/TC-11-04-desktop-analyze-handoff.png`         |
| TC-11-05 | SkillDetailPanel mobile bottom sheet | 390x844  | imported detail panel           | `screenshots/TC-11-05-mobile-imported-bottom-sheet.png`    |
| TC-11-06 | SkillDetailPanel keyboard state      | 1440x900 | focus ring visible              | `screenshots/TC-11-06-keyboard-focus-ring.png`             |
| TC-11-07 | SkillCenterView list state           | 1440x900 | panel closed after Escape       | `screenshots/TC-11-07-escape-close.png`                    |

## 問題発生時の対応

| 問題種別                   | 対応                                                      |
| -------------------------- | --------------------------------------------------------- |
| 視覚的なバグ（レイアウト） | Phase 5 実装を修正後 Phase 9 からやり直す                 |
| 機能的なバグ（遷移失敗）   | Phase 5 実装を修正後 Phase 9 からやり直す                 |
| アクセシビリティ問題       | Phase 5 実装を修正後 Phase 9 からやり直す                 |
| 軽微な見た目の改善         | current diff に残る場合のみ未タスク化して Phase 12 へ進む |

## 成果物

| ファイル                                                        | 内容                                |
| --------------------------------------------------------------- | ----------------------------------- |
| `outputs/phase-11/manual-test-result.md`                        | `TC-ID + 証跡` 形式の手動テスト結果 |
| `outputs/phase-11/manual-test-report.md`                        | 手動テストの要約・所見              |
| `outputs/phase-11/ui-sanity-visual-review.md`                   | Apple UI/UX 観点の視覚レビュー      |
| `outputs/phase-11/issues.md`                                    | 発見した問題の一覧（0件でも作成）   |
| `outputs/phase-11/phase11-capture-metadata.json`                | capture 実行時の証跡メタデータ      |
| `outputs/phase-11/screenshots/*.png`                            | Phase 11 画面証跡                   |
| `outputs/phase-11/screenshots/phase11-handoff-diagnostics.json` | edit/analyze 呼び出しログ           |

## 完了条件

- [ ] `TC-11-01` から `TC-11-07` の全観点を確認している
- [ ] imported / unimported / desktop / mobile / keyboard / Escape を実証跡化している
- [ ] `skill-editor` / `skillAnalysis` handoff を main shell 上で確認している
- [ ] `ui-sanity-visual-review.md` に Apple UI/UX 観点レビューを記録している
- [ ] `outputs/phase-11/manual-test-result.md` が作成されている
- [ ] `outputs/phase-11/manual-test-report.md` が作成されている
- [ ] `validate-phase11-screenshot-coverage` が PASS している

**本 Phase 内の全タスクを 100% 実行完了** してから次フェーズへ進むこと。

## 次 Phase

Phase 12（ドキュメント）へ進む。
