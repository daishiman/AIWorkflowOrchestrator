# Phase 11: 手動テスト検証

## メタ情報

| 項目       | 内容                                        |
| ---------- | ------------------------------------------- |
| Phase      | 11                                          |
| 機能名     | UT-SDK-07-APPROVAL-REQUEST-SURFACE-001      |
| タスク名   | Skill Creator approval request surface 接続 |
| 前提Phase  | Phase 10                                    |
| 後続Phase  | Phase 12                                    |
| 作成日     | 2026-04-06                                  |
| ステータス | pending                                     |
| タスク分類 | UI task（VISUAL）                           |

## 目的

approval request UI の実地動作を3層評価（Semantic / Visual / AI UX）で確認し、TC 単位の画面証跡と判定根拠を固定する。

この Phase は UI/UX 変更タスクとして扱い、`manual-test-checklist.md`、`manual-test-result.md`、`manual-test-report.md`、`ui-sanity-visual-review.md`、`screenshot-plan.json`、`screenshot-coverage.md`、`phase11-capture-metadata.json` を current workflow 配下に残す。

## タスク分類確認

Phase 1 で UI task と分類。`SkillLifecyclePanel.tsx` に approval UI（approve/reject ボタン）が追加されるため **VISUAL** として扱う。スクリーンショット証跡が必要。

## SubAgentチーム編成

| SubAgent   | 関心ごと      | 主担当                                |
| ---------- | ------------- | ------------------------------------- |
| SubAgent-A | Semantic 検証 | approval UI の意味的整合性確認        |
| SubAgent-B | Visual 検証   | スクリーンショット取得・UI 表示確認   |
| SubAgent-C | AI UX 検証    | approval フローの UX 評価             |
| SubAgent-D | 統合判定      | PASS/FAIL 判定・HIGH 問題の未タスク化 |

## テストケース一覧

### 視覚テストケース

| TC-ID       | 種別 | 観点                              | 期待結果                                                 |
| ----------- | ---- | --------------------------------- | -------------------------------------------------------- |
| TC-11-UI-01 | 視覚 | approval request 受信時の UI 表示 | approve/reject ボタンが SkillLifecyclePanel に表示される |
| TC-11-UI-02 | 視覚 | approve 操作後の UI 状態          | approval UI が非表示になり通常状態に戻る                 |
| TC-11-UI-03 | 視覚 | reject 操作後の UI 状態           | approval UI が非表示になり通常状態に戻る                 |
| TC-11-UI-04 | 視覚 | approval UI のレイアウト整合性    | 既存 disclosure summary との視覚的バランスが保たれる     |

### 非視覚テストケース（補助）

| ケースID | 観点               | 手順                                          | 期待結果                                        |
| -------- | ------------------ | --------------------------------------------- | ----------------------------------------------- |
| NV-11-01 | IPC 疎通確認       | Main Process から approval:request を送信する | SkillLifecyclePanel に approval UI が表示される |
| NV-11-02 | cleanup 確認       | SkillLifecyclePanel をアンマウントする        | ipcRenderer.removeListener が呼ばれる           |
| NV-11-03 | セッション継続確認 | approval 後に Skill Creator フローが継続する  | approval 応答後もフローが正常に進む             |

## 画面カバレッジマトリクス

| TC-ID       | 対象画面/状態                             | 証跡パス                                                        | 判定基準                                      |
| ----------- | ----------------------------------------- | --------------------------------------------------------------- | --------------------------------------------- |
| TC-11-UI-01 | SkillLifecyclePanel - approval 受信状態   | `outputs/phase-11/screenshots/TC-11-UI-01-approval-request.png` | approve/reject ボタン可視・レイアウト破綻なし |
| TC-11-UI-02 | SkillLifecyclePanel - approve 後状態      | `outputs/phase-11/screenshots/TC-11-UI-02-after-approve.png`    | approval UI 非表示・通常状態に復帰            |
| TC-11-UI-03 | SkillLifecyclePanel - reject 後状態       | `outputs/phase-11/screenshots/TC-11-UI-03-after-reject.png`     | approval UI 非表示・通常状態に復帰            |
| TC-11-UI-04 | SkillLifecyclePanel - disclosure との並存 | `outputs/phase-11/screenshots/TC-11-UI-04-with-disclosure.png`  | disclosure summary との視覚バランス維持       |

## スクリーンショット取得手順

```bash
# Electronアプリ起動後、SkillLifecyclePanel の approval UI を手動操作して証跡取得
# または自動テスト（Playwright）で取得する
pnpm --filter @repo/desktop dev
# → SkillLifecyclePanel を表示し、approval:request をシミュレートして撮影
```

## 参照資料

| 参照資料           | パス                                              | 説明            |
| ------------------ | ------------------------------------------------- | --------------- |
| 最終レビュー結果   | `outputs/phase-10/final-review-result.md`         | Phase 10 成果物 |
| 出荷準備チェック   | `outputs/phase-10/release-readiness-checklist.md` | Phase 10 成果物 |
| 受け入れ基準       | `outputs/phase-1/acceptance-criteria.md`          | Phase 1 成果物  |
| アーキテクチャ設計 | `outputs/phase-2/architecture-design.md`          | Phase 2 成果物  |
| 実装サマリー       | `outputs/phase-5/implementation-summary.md`       | Phase 5 成果物  |

## 実行手順

1. Phase 10 成果物を確認する。
2. `manual-test-checklist.md` と `screenshot-plan.json` を作成し、TC-ID / state / evidence を固定する。
3. SubAgent-A/B/C を並列で実行する（Semantic/Visual/AI UX 3層評価）。
4. 視覚テストケース（TC-11-UI-01〜04）のスクリーンショットを取得する。
5. 非視覚テストケース（NV-11-01〜03）を実行して結果を記録する。
6. `manual-test-result.md`、`manual-test-report.md`、`ui-sanity-visual-review.md`、`phase11-capture-metadata.json`、`screenshot-coverage.md`、`discovered-issues.md` を記録する。
7. SubAgent-D が統合判定を行う。
8. HIGH 問題があれば `unassigned-task/` へ自動生成する。
9. 成果物を記録する。

## 成果物

| 成果物                   | パス                                             | 説明                                |
| ------------------------ | ------------------------------------------------ | ----------------------------------- |
| 手動テストチェックリスト | `outputs/phase-11/manual-test-checklist.md`      | TC-ID / evidence / 判定             |
| 手動テスト結果           | `outputs/phase-11/manual-test-result.md`         | 手動検証結果（証跡付き）            |
| 手動テストレポート       | `outputs/phase-11/manual-test-report.md`         | 実施概要と所見                      |
| 証跡インデックス         | `outputs/phase-11/evidence-index.md`             | 証跡ファイル一覧                    |
| スクリーンショット計画   | `outputs/phase-11/screenshot-plan.md`            | 撮影計画（narrative）               |
| スクリーンショット計画   | `outputs/phase-11/screenshot-plan.json`          | 撮影計画（machine readable）        |
| UI/UX視覚レビュー        | `outputs/phase-11/ui-sanity-visual-review.md`    | Apple UI/UX 視覚レビュー            |
| capture metadata         | `outputs/phase-11/phase11-capture-metadata.json` | capture 実行時の evidence inventory |
| 画面カバレッジ           | `outputs/phase-11/screenshot-coverage.md`        | TC / png の紐付け確認               |
| 発見事項                 | `outputs/phase-11/discovered-issues.md`          | HIGH/MEDIUM 問題一覧                |
| スクリーンショット実体   | `outputs/phase-11/screenshots/*.png`             | TC 単位の画面証跡                   |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] `manual-test-checklist.md` が作成されている
- [ ] TC-11-UI-01〜04 のスクリーンショット（PNG）が全件取得済み
- [ ] `manual-test-result.md` が作成されている
- [ ] `manual-test-report.md` が作成されている
- [ ] `ui-sanity-visual-review.md` が作成されている
- [ ] `screenshot-plan.json` が作成されている
- [ ] `phase11-capture-metadata.json` が作成されている
- [ ] `screenshot-coverage.md` が作成されている
- [ ] `discovered-issues.md` が作成されている（0件でも必須）
- [ ] `screenshot-plan.md` に証跡の主ソースと取得理由が明記されている
- [ ] HIGH 問題があれば未タスク化済み
- [ ] `validate-phase11-screenshot-coverage` が PASS
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/ut-sdk-07-approval-request-surface-001
```

## 実行タスク

- 手動テストチェックリスト作成（TC-11-UI-01〜04、NV-11-01〜03）
- CAPTURE_BLOCKED 理由の記録と unassigned-task への formalize
- evidence-index.md・discovered-issues.md・screenshot-coverage.md の作成
- outputs/phase-11/ 全成果物の確認

## 統合テスト連携

Phase 4〜6 で作成した TC-APPR-01〜18（vitest 19/19 PASS）を UI 挙動の代替 evidence として参照する。
Phase 12 ドキュメント更新で本 Phase の証跡ファイルパスを記録する。

## 次のPhase

Phase 12: ドキュメント更新
