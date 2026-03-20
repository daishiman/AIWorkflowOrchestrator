# Phase 11: 手動テスト - タスク仕様書

## メタ情報

| 項目       | 内容                                                      |
| ---------- | --------------------------------------------------------- |
| Phase      | 11                                                        |
| Phase 名   | 手動テスト                                                |
| タスクID   | TASK-IMP-EXECUTION-RESPONSIBILITY-CONTRACT-FOUNDATION-001 |
| 前提 Phase | Phase 10                                                  |
| 後続 Phase | Phase 12（ドキュメント）                                  |
| ステータス | completed                                                 |
| 作成日     | 2026-03-19                                                |
| 機能名     | execution-responsibility-contract-foundation              |

## 目的

capability 4状態（integratedRuntime / terminalSurface / both / none）別の manual walkthrough を実施し、UI状態語彙・CTA契約・silent fallback 不在を screenshot 証跡として記録する。

## テストケース

| テストケース | 画面 / 観点                              | 前提                                                                  | 期待結果                                                                                                                                 |
| ------------ | ---------------------------------------- | --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| TC-01        | integratedRuntime ready review board     | apiKeyValid=true, subscriptionValid=false, API接続成功                | Settings 側で integratedRuntime card が active、Main Chat 側で primary=`AI で実行` / secondary=`設定を開く`                              |
| TC-02        | terminalSurface ready review board       | apiKeyValid=false, subscriptionValid=true, terminal launcher 利用可能 | Settings 側で terminalSurface card が active、Main Chat 側で primary=`ターミナルで実行` / secondary=`コマンドをコピー`                   |
| TC-03        | both ready review board                  | apiKeyValid=true, subscriptionValid=true, 両 lane 利用可能            | Settings 側で integratedRuntime / terminalSurface の両 card が active、Main Chat 側で primary=`AI で実行` / secondary=`ターミナルで実行` |
| TC-04        | none unavailable review board            | apiKeyValid=false, subscriptionValid=false, hasResolutionAction=false | Main Chat 側で primary CTA を DOM に含めず、secondary=`セットアップガイド` と理由文だけを表示する                                        |
| TC-05        | blocked -> ready transition review board | before: none blocked / after: integratedRuntime ready                 | before で primary=`設定を開く`、after で primary=`AI で実行` に切り替わる                                                                |
| TC-06        | silent fallback guard review board       | capability=none, uiState=unavailable                                  | guard panel に `silent fallback` PASS と `primary CTA DOM guard` PASS が表示される                                                       |

## 画面カバレッジマトリクス

| テストケース | 画面状態                                       | 証跡                                                                 |
| ------------ | ---------------------------------------------- | -------------------------------------------------------------------- |
| TC-01        | integratedRuntime ready / settings + main chat | `outputs/phase-11/screenshots/TC-01-integrated-runtime-ready.png`    |
| TC-02        | terminalSurface ready / settings + main chat   | `outputs/phase-11/screenshots/TC-02-terminal-surface-ready.png`      |
| TC-03        | both ready / settings + main chat              | `outputs/phase-11/screenshots/TC-03-both-ready.png`                  |
| TC-04        | none unavailable / settings + main chat        | `outputs/phase-11/screenshots/TC-04-none-unavailable.png`            |
| TC-05        | blocked -> ready transition board              | `outputs/phase-11/screenshots/TC-05-blocked-to-ready-transition.png` |
| TC-06        | silent fallback guard board                    | `outputs/phase-11/screenshots/TC-06-silent-fallback-guard.png`       |

## 実行タスク

### walkthrough 設計（capability 状態別）

以下の6テストケースを定義し、step-by-step 手順を記述する。

- TC-01: integratedRuntime 状態（api-key設定済み、subscription なし）
  - Settings 画面で capability card に「AI統合実行」が表示されること
  - Main Chat で primary CTA が「AI実行」であること
  - secondary CTA が表示されないこと（terminalSurface 未設定のため）

- TC-02: terminalSurface 状態（subscription のみ、api-key 未設定）
  - Settings 画面で terminal launcher が有効であること
  - Main Chat で primary CTA が「ターミナルで実行」であること
  - integrated API への fallback が発生しないこと

- TC-03: both 状態（api-key設定済み + subscription 有効）
  - Settings 画面で integratedRuntime と terminalSurface の両 capability card が表示されること
  - Main Chat で primary CTA が「AI実行」、secondary CTA が「ターミナルで実行」であること
  - CTA の表示順序が contract-matrix の定義と一致していること

- TC-04: none 状態（api-key 未設定、subscription なし）
  - Settings 画面で capability が unavailable 表示であること
  - Main Chat で CTA が disabled（操作不可）であること
  - disabled 状態の理由テキストが表示されること

- TC-05: blocked → ready 遷移（api-key 入力後に capability 変化）
  - none 状態から api-key を入力した後、capability が integratedRuntime に変化すること
  - Main Chat の CTA が disabled から「AI実行」に即時更新されること（画面リロード不要）
  - 遷移アニメーションが 200-300ms 以内であること

- TC-06: silent fallback 不在確認
  - capability=none 時に integrated_api へ自動 fallback しないこと
  - CTA 操作をブロックする UI ガードが存在すること
  - エラーではなく「unavailable」状態メッセージが表示されること

### screenshot 設計

各 TC-ID に対応する capture 画面と期待要素を定義する。

- TC-01: Settings review board（capability card: integratedRuntime active）、Main Chat contract board（primary CTA: AI で実行）
- TC-02: Settings 画面（terminal launcher: enabled）、Main Chat（primary CTA: ターミナルで実行）
- TC-03: Settings 画面（両 capability card active）、Main Chat（primary + secondary CTA 両表示）
- TC-04: Settings 画面（capability: unavailable 表示）、Main Chat（primary CTA 非表示 + 理由テキスト + setup guide）
- TC-05: 遷移前の none blocked 状態と、api-key 入力後の integratedRuntime ready 状態を同一 board で比較
- TC-06: capability=none / unavailable 時の guard board（CTA hidden、fallback guard PASS）

P53 対策（CLI 環境では live preview 不可のため）:

- 本タスクでは dedicated review-board harness を Playwright `page.screenshot()` で自動取得する
- review-board harness は `packages/shared/src/types/execution-capability.ts` の pure function 実装結果を描画する
- `manual-test-result.md` と `screenshot-coverage.md` と `screenshots/*.png` を 1セットで保存する

### fallback 記録方針

- screenshot capture は `apps/desktop/scripts/capture-task-execution-responsibility-contract-foundation-phase11.ts` で取得する
- capture 後は `manual-test-result.md` と `phase11-capture-metadata.json` のファイル名を一致させる
- 証跡が不完全な TC-ID は `discovered-issues.md` の「証跡未取得」セクションへ記録する

## 参照資料

| 参照資料             | パス                                                                                        | 確認する内容                                                           |
| -------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| 親パック index       | docs/30-workflows/ai-runtime-execution-responsibility-realignment/index.md                  | 依存順・並列可否・設計ゲート                                           |
| Task index           | docs/30-workflows/step-01-seq-task-01-execution-responsibility-contract-foundation/index.md | 対象 task のメタ情報と受入基準（AC-1〜AC-4）                           |
| Phase 2              | phase-2-design.md                                                                           | contract-matrix の capability × state × CTA 全組み合わせ               |
| Phase 3              | phase-3-design-review.md                                                                    | gate-decision の PASS 判定（walkthrough scope 確定）                   |
| Phase 4              | phase-4-test-creation.md                                                                    | TC-ID と test-matrix（walkthrough の期待値基準）                       |
| Phase 10             | phase-10-final-review.md                                                                    | final-gate-decision の PASS 判定（Phase 11 開始条件）                  |
| Phase 5 outputs      | outputs/phase-5/implementation-plan.md / outputs/phase-5/file-change-scope.md               | 実装順序・consumer 境界                                                |
| Phase 6 outputs      | outputs/phase-6/regression-expansion-plan.md / outputs/phase-6/edge-case-matrix.md          | fail path / edge case の前提                                           |
| Phase 7 outputs      | outputs/phase-7/coverage-targets.md / outputs/phase-7/integration-gate.md                   | walkthrough gate の前提                                                |
| Phase 8 outputs      | outputs/phase-8/refactor-boundaries.md / outputs/phase-8/simplification-candidates.md       | refactor 後 invariants                                                 |
| Phase 9 outputs      | outputs/phase-9/quality-checklist.md / outputs/phase-9/risk-register.md                     | residual risk と release readiness                                     |
| 親 UI/UX 正本        | docs/30-workflows/ai-runtime-execution-responsibility-realignment/ui-ux-realization.md      | 状態語彙・CTA・handoff 契約（比較基準）                                |
| 親 UI/UX 図解        | docs/30-workflows/ai-runtime-execution-responsibility-realignment/ui-ux-diagrams.md         | 状態遷移・画面構成・導線図（walkthrough シナリオ参照）                 |
| ui-ux-navigation     | .claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md                       | `settings` public shell / `ViewType` / `renderView()` の consumer 境界 |
| interfaces-auth-core | .claude/skills/aiworkflow-requirements/references/interfaces-auth-core.md                   | capability と auth 型の具体契約（TC 期待値の根拠）                     |
| api-ipc-system-core  | .claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md                    | health / selected-config の優先度（TC-05 遷移確認）                    |

## 実行手順

### ステップ1: Phase 10 の final-gate-decision を確認する

`outputs/phase-10/final-gate-decision.md` を読み、PASS 判定であることを確認する。MAJOR/CRITICAL 判定の場合は Phase 11 を開始せず、該当 Phase に戻る。

### ステップ2: Phase 2 の contract-matrix から walkthrough シナリオを確定する

`outputs/phase-2/` の contract-matrix を読み、capability × state × CTA の全組み合わせを把握する。TC-01〜TC-06 が全組み合わせをカバーしていることを確認する。不足があれば TC を追加する。

### ステップ3: TC-01〜TC-06 の手動テスト手順を step-by-step で記述する

各 TC-ID について以下の形式で `outputs/phase-11/manual-test-plan.md` に記述する:

- 前提条件（capability state の設定方法）
- review-board harness 実行手順（capture script と対象 TC）
- 期待結果（検証可能な状態の文章）
- 実行結果記録欄（PASS / FAIL / BLOCKED）

### ステップ4: screenshot-plan.json を TC-ID × 画面状態 × 期待要素で作成する

`outputs/phase-11/screenshot-plan.json` に以下の構造で記録する:

```json
{
  "TC-01": {
    "screens": ["settings-capability-card", "main-chat-primary-cta"],
    "expected_elements": [
      "capability:integratedRuntime:active",
      "cta:primary:AI実行"
    ]
  }
}
```

### ステップ5: walkthrough を実行し discovered-issues.md に記録する

TC-01〜TC-06 を順番に実施し、発見した問題（仕様との差異・CTA ラベルの不一致・fallback 検出）を `outputs/phase-11/discovered-issues.md` に記録する。UI review-board screenshot の保存先、`manual-test-result.md`、`screenshot-coverage.md` も同時に更新する。発見がなくても「発見事項なし」として出力する。

### ステップ6: fallback capture 方針を記録し Phase 12 handoff を確認する

screenshot 取得方法（Playwright / capturePage / DOM snapshot）の実績を discovered-issues.md の「証跡取得方法」セクションに記録する。

## 統合テスト連携

walkthrough の TC-ID は Phase 4 の test-matrix の TC-ID と対応関係を持つ。以下の対応表で Phase 4 の自動テストと Phase 11 の手動テストが補完関係にあることを確認する。

| Phase 11 TC-ID | Phase 4 test-matrix 対応   | 検証内容                           |
| -------------- | -------------------------- | ---------------------------------- |
| TC-01          | integratedRuntime 系テスト | capability card 表示 + primary CTA |
| TC-02          | terminalSurface 系テスト   | terminal launcher + primary CTA    |
| TC-03          | both 系テスト              | 両 CTA の並列表示                  |
| TC-04          | none 系テスト              | unavailable 表示 + CTA disabled    |
| TC-05          | 状態遷移系テスト           | blocked→ready の即時更新           |
| TC-06          | fallback 禁止テスト        | silent fallback 不在               |

## 多角的チェック観点（AIが判断）

| 観点                   | 適用判断                                         | 仕様参照先                                                            |
| ---------------------- | ------------------------------------------------ | --------------------------------------------------------------------- |
| UI/UX                  | capability 状態別の CTA 表示・状態語彙が対象     | `aiworkflow-requirements: ui-ux-*`                                    |
| アーキテクチャ         | capability 状態遷移と state 管理を確認する場合   | `aiworkflow-requirements: arch-*`                                     |
| IPC/Preload            | capability 変化の即時反映（TC-05）を確認する場合 | `aiworkflow-requirements: api-ipc-*`, `security-electron-ipc-core.md` |
| ワークフローガバナンス | discovered-issues を未タスク化する場合           | `aiworkflow-requirements: task-workflow*`, `lessons-learned*`         |

**この task 固有の重点**: 語彙 drift / state drift / simpler alternative の 3 方向で設計を叩く

## サブタスク管理

Phase 実行開始時に、TodoWrite 相当で以下のサブタスクを作成すること:

1. Phase 10 final-gate-decision の確認
2. Phase 2 contract-matrix からの walkthrough シナリオ確定
3. TC-01〜TC-06 の手動テスト手順記述（manual-test-plan.md）
4. screenshot-plan.json の作成
5. walkthrough 実行と discovered-issues.md への記録
6. fallback capture 方針の記録と Phase 12 handoff 確認
7. 成果物パスと outputs/phase-11 の整合確認
8. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐに completed に更新すること。

## 成果物

| 成果物                 | パス                                    | 内容                                        |
| ---------------------- | --------------------------------------- | ------------------------------------------- |
| 手動テスト計画         | outputs/phase-11/manual-test-plan.md    | TC-01〜TC-06 の step-by-step 手順と期待結果 |
| 手動テスト結果         | outputs/phase-11/manual-test-result.md  | TC-01〜TC-06 の結果と証跡                   |
| スクリーンショット計画 | outputs/phase-11/screenshot-plan.json   | TC-ID × capture 対象 × 期待要素の JSON      |
| 画面カバレッジ         | outputs/phase-11/screenshot-coverage.md | TC と証跡の対応表                           |
| 発見事項               | outputs/phase-11/discovered-issues.md   | walkthrough 中の発見事項（0件でも出力）     |

## 完了条件

- [ ] manual-test-plan.md に TC-01〜TC-06 の全手順が記述されている
- [ ] manual-test-result.md に TC-01〜TC-06 の結果と証跡が記録されている
- [ ] screenshot-plan.json に全 TC-ID の capture 計画が定義されている
- [ ] screenshot-coverage.md に全 TC-ID の証跡対応が記録されている
- [ ] discovered-issues.md が存在する（発見事項 0 件でも「発見事項なし」として出力）
- [ ] fallback capture 方針（P53 対策）が manual-test-plan.md または discovered-issues.md に記述されている
- [ ] TC-06 で silent fallback 不在が確認されている
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各成果物パスが `outputs/phase-11/` と一致している
- [ ] Phase 10 final-gate-decision が PASS であることを確認済み
- [ ] TC-01〜TC-06 の全実行結果が PASS / FAIL / BLOCKED のいずれかで記録されている

## 次のPhase

- [Phase 12（ドキュメント）](./phase-12-documentation.md)
