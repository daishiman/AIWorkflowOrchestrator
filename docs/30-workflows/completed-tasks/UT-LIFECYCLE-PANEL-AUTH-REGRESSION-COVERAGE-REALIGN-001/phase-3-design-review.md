# Phase 3: 設計レビュー

## メタ情報

| 項目       | 内容                                                          |
| ---------- | ------------------------------------------------------------- |
| Phase      | 3                                                             |
| タスクID   | UT-LIFECYCLE-PANEL-AUTH-REGRESSION-COVERAGE-REALIGN-001       |
| ステータス | 未実施                                                        |
| 作成日     | 2026-04-19                                                    |
| 入力       | outputs/phase-2/test-design.md, outputs/phase-2/test-cases.md |

## 目的

Phase 2 で確定したテスト設計（責務境界テーブル・TC-06-NEW / TC-07-NEW / TC-GUARD-01a〜01c）の妥当性を、実装開始前に多角的な視点でレビューする。設計上の問題を早期発見してフィードバックループを最小化し、Phase 4 への進行可否を判定することが目的である。

## 実行タスク

## 統合テスト連携

Phase 3 は単体保証と統合保証の切り分けが破綻していないかを見直し、Phase 4 以降へ渡す gate とする。

- Phase 1 / Phase 2 成果物の整合を確認する
- 30種思考法で設計リスクを洗い出す

### Step 1: Phase 1・Phase 2 成果物の事前確認

レビューに先立ち、以下の成果物が揃っていることを確認する。

- [ ] `outputs/phase-1/responsibility-boundary.md` が存在し、全導線の分類が記載されている
- [ ] `outputs/phase-1/guarantee-points.md` が存在し、各保証点にモック戦略が記載されている
- [ ] `outputs/phase-1/spec-extraction-map.md` が存在し、現行テストの全件マップが記載されている
- [ ] `outputs/phase-2/test-design.md` が存在し、責務境界テーブルとテストファイル構造が記載されている
- [ ] `outputs/phase-2/test-cases.md` が存在し、TC-06-NEW / TC-07-NEW / TC-GUARD-01a〜01c の詳細仕様が記載されている

成果物が揃っていない場合は、該当 Phase へ差し戻す前にレビューを進めない。

### Step 2: 30種の思考法による多角的レビュー

以下の 30 種の思考法を全て 1 回以上適用し、`outputs/phase-3/thought-method-matrix.md` に「観点 / 発見 / 設計への反映要否 / 根拠」を記録する。

| カテゴリ     | 思考法                                                               |
| ------------ | -------------------------------------------------------------------- |
| 論理分析系   | 批判的思考、演繹思考、帰納的思考、アブダクション、垂直思考           |
| 構造分解系   | 要素分解、MECE、2軸思考、プロセス思考                                |
| メタ・抽象系 | メタ思考、抽象化思考、ダブル・ループ思考                             |
| 発想・拡張系 | ブレインストーミング、水平思考、逆説思考、類推思考、if思考、素人思考 |
| システム系   | システム思考、因果関係分析、因果ループ                               |
| 戦略・価値系 | トレードオン思考、プラスサム思考、価値提案思考、戦略的思考           |
| 問題解決系   | why思考、改善思考、仮説思考、論点思考、KJ法                          |

Step 2 の出力では、少なくとも以下を明示する。

- どの保証点が本質的論点か
- 単体テストと統合テストの責務境界に矛盾がないか
- テスト追加コストに対して価値が過不足ないか
- Phase 4 以降へ持ち越すべきリスクがあるか

### Step 3: レビュー実施

以下の5観点でレビューを実施し、各観点の結果を `outputs/phase-3/design-review-result.md` に記録する。Step 2 の thought-method matrix で出た指摘は、この 5 観点のどこに反映したかを明示する。

## レビュー観点

### 観点 1: 責務境界の妥当性

確認する内容:

- Phase 2 の責務境界テーブルが Phase 1 の `responsibility-boundary.md` と整合しているか
- 「単体テスト」と分類した導線が本当にモック境界内で完結しているか（wizard 内部実装に依存していないか）
- 「統合テスト」と分類した導線が単体テストで検証しようとしていないか
- `handleSessionStartNew` が `SessionResumePrompt` を経由する場合、単体テスト分類の根拠が説明できるか

判定基準:

- 責務境界テーブルの全行に「単体」または「統合」の分類と根拠が記載されている
- 「単体」分類の導線がモック境界内で完結することを確認した旨が記載されている

### 観点 2: TC-06-NEW（rapid click）の設計適合性

確認する内容:

- TC-06-NEW の再現手順が現行 `SkillLifecyclePanel.tsx` の実装に対して実行可能か
- 連打の起点となるボタン・アクションが `SkillLifecyclePanel` に実際に存在するか
- `auth:login` の非発火を `expect(mockAuthLogin).not.toHaveBeenCalled()` で検証できる状態か（モック設定が正しいか）
- 旧 TC-06 の prepare フロー依存が完全に排除された設計になっているか
- 連打間隔（0ms〜16ms）の設定が実装上の意味として妥当か

判定基準:

- 連打トリガーとなるユーザー操作が `SkillLifecyclePanel` のレンダリング結果に存在する
- モック設定が実装コードの `auth:login` 発火パスを正しくカバーしている

### 観点 3: TC-07-NEW（rerender）の設計適合性

確認する内容:

- TC-07-NEW の rerender トリガー（props 変化 or state 更新）が現行 `SkillLifecyclePanel.tsx` の実装に対して再現可能か
- `rerender()` で更新する props の候補が Phase 1 の調査で確認されているか
- `useEffect` の依存配列に `auth:login` 発火を引き起こす依存が含まれていないことの確認が Phase 1 で完了しているか
- 現行 UI で rerender が `auth:login` を誤発火させるリスクが設計上排除されているか

判定基準:

- rerender トリガーとなる props または state の変化が具体的に定義されている
- Phase 1 の調査結果を根拠として TC-07-NEW の設計が現行 UI に適合している

### 観点 4: TC-GUARD-01a〜01c の非発火保証設計の十分性

確認する内容:

- TC-GUARD-01a（`onOpenSkillWizard`）/ TC-GUARD-01b（`onOpenWizard`）/ TC-GUARD-01c（`handleSessionStartNew`）が互いに独立したテストとして設計されているか
- 各テストが「副作用の非混入検証のみ」に絞られており、主目的の動作確認と混在していないか
- `ipcRenderer.send` または `auth:login` チャンネルのモック設定が各テストで正しく初期化されているか（`beforeEach` での `vi.clearAllMocks()` 等）
- 3テストの合計で、Phase 1 の `guarantee-points.md` に定義した保証点がすべてカバーされているか

判定基準:

- 3テストが独立して実行可能で、実行順序に依存しない設計になっている
- `guarantee-points.md` の保証点と TC-GUARD の対応が `test-cases.md` に明記されている

### 観点 5: 既存テストとの役割重複チェック

確認する内容:

- 新規テストケース（TC-06-NEW / TC-07-NEW / TC-GUARD-01a〜01c）が既存テストケース（TC-01a / TC-01b / TC-01c / TC-08 等）と保証内容を重複していないか
- TC-GUARD-01a〜01c が既存 TC-01a〜01c と同一の保証をしていないか（TC-01 が「wizard が開く」保証、TC-GUARD が「auth:login が発火しない」保証として明確に分離されているか）
- Phase 1 の `spec-extraction-map.md` で確認した既存テスト番号と新規テストIDが重複していないか
- traceability マトリクスの更新対象として、旧 TC-06 / TC-07 との対応関係が `test-design.md` に記載されているか

判定基準:

- 新規テストIDが既存テストIDと重複しない（採番規則が一意性を保証している）
- TC-GUARD と既存 TC-01 の保証内容が明確に分離されており、重複排除または役割分担が `test-design.md` に記載されている

## Gate: Phase 4 への進行判定

以下の全条件を満たした場合に Phase 4 へ進行する。条件を満たさない場合は指定 Phase へ差し戻す。

| Gate 条件                                                   | 判定 | 差し戻し先         |
| ----------------------------------------------------------- | ---- | ------------------ |
| 責務境界テーブルの妥当性がレビューで承認された              | -    | Phase 2 Step 1     |
| TC-06-NEW の設計が現行 UI に適合していると確認された        | -    | Phase 2 Step 2     |
| TC-07-NEW の設計が現行 UI に適合していると確認された        | -    | Phase 2 Step 2     |
| TC-GUARD-01a〜01c が独立性・十分性の観点で承認された        | -    | Phase 2 Step 3     |
| 既存テストとの役割重複が解消または許容と判断された          | -    | Phase 2 Step 4     |
| Phase 1 の成果物（全3ファイル）が揃っていることが確認された | -    | Phase 1 へ差し戻し |
| 30種の思考法が `thought-method-matrix.md` に記録されている  | -    | Phase 3 Step 2     |

## 参照資料

- `outputs/phase-1/responsibility-boundary.md`（責務境界テーブルの入力）
- `outputs/phase-1/guarantee-points.md`（保証点定義の入力）
- `outputs/phase-1/spec-extraction-map.md`（既存テストIDとの重複確認）
- `outputs/phase-2/test-design.md`（レビュー対象: 責務境界テーブル確定版）
- `outputs/phase-2/test-cases.md`（レビュー対象: 新規テストケース詳細仕様）
- `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx`（既存テストとの役割重複確認）
- `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`（実装適合性の確認）

## 成果物

- `outputs/phase-3/design-review-result.md`（5観点のレビュー結果・各観点の判定（承認/差し戻し）・差し戻しがある場合の修正内容を記載）
- `outputs/phase-3/thought-method-matrix.md`（30種の思考法の適用結果と反映判断を記載）

## 完了条件

- [ ] 5つの観点すべてにレビューコメントが記載されている
- [ ] 各 Gate 条件に対して「承認」または「差し戻し」の判定が記載されている
- [ ] 30種の思考法すべてが `thought-method-matrix.md` に記録されている
- [ ] 差し戻しがある場合、差し戻し先の Phase/Step と修正内容が具体的に記載されている
- [ ] `design-review-result.md` に最終判定（Phase 4 進行可 / 差し戻し）と判定日が記載されている
- [ ] Phase 1・Phase 2 の成果物（全5ファイル）の存在確認が完了している

## タスク 100% 実行確認【必須】

以下を順番に確認すること:

1. Phase 1・Phase 2 の成果物（全5ファイル）が揃っていることを実際に確認したか
2. 5つのレビュー観点すべてに対してコメントを記入したか
3. Gate 条件の全7項目に判定を記入したか
4. 30種の思考法それぞれに対して「発見」と「反映要否」を記録したか
5. 差し戻しが発生した場合、Phase 1 または Phase 2 の該当 Step を修正し再レビューを実施したか
6. `design-review-result.md` に判定日・最終判定（進行可/差し戻し）が記載されているか

## 次 Phase

Gate 判定が「進行可」の場合、Phase 4（テスト作成 Red）へ進む。`test-cases.md` の詳細仕様に基づき、TC-06-NEW / TC-07-NEW / TC-GUARD-01a〜01c を `SkillLifecyclePanel.auth-regression.test.tsx` へ実装する（最初は意図的に Red にする）。差し戻しがある場合は Phase 2 または Phase 1 の指定 Step を修正してから本 Phase を再実施する。
