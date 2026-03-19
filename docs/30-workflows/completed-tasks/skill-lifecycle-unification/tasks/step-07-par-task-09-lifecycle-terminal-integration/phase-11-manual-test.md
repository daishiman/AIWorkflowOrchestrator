# Phase 11 手動テスト - SkillLifecyclePanel Terminal 統合

## メタ情報

| 項目       | 内容                                                                                                                     |
| ---------- | ------------------------------------------------------------------------------------------------------------------------ |
| タスクID   | TASK-IMP-LIFECYCLE-TERMINAL-INTEGRATION-001                                                                              |
| Phase      | 11 - 手動テスト                                                                                                          |
| ステータス | 未着手                                                                                                                   |
| 前提 Phase | Phase 10 PASS または MINOR 指摘対応後 PASS（`outputs/phase-10/final-review-report.md` に PASS 判定が記録されていること） |
| 成果物     | `outputs/phase-11/manual-test-report.md`                                                                                 |
| 次 Phase   | Phase 12 ドキュメント (`phase-12-documentation.md`)                                                                      |

## タスク種別判定

本タスクは **UI 実装タスク** に分類される。以下の Phase 11 要件が適用される。

| 要件                       | 適用 | 詳細                                            |
| -------------------------- | ---- | ----------------------------------------------- |
| スクリーンショット撮影     | 必須 | screenshot-plan.json に基づく自動撮影を優先     |
| Apple UI/UX 視覚検証       | 必須 | Clarity / Deference / Depth の3観点で検証       |
| 画面カバレッジマトリクス   | 必須 | TC-xx と画面状態の対応表を作成                  |
| ウォークスルー発見事項分類 | 必須 | Blocker / Note / Info の3分類でリアルタイム記録 |

## サブタスク管理

本 Phase をサブエージェントに委譲する場合、以下のルールを厳守すること。

- サブエージェントの完了報告を待ってから、メインエージェントが成果物の存在を `ls` / `git diff --stat` で検証する

## 目的

Electron アプリを実際に起動し、Terminal ボタン・TerminalHandoffCard・improve→terminal handoff 要約転送の3機能について、UI 表示・操作フロー・キーボード操作・Screenshot 契約を E2E シナリオで検証する。

## テストシナリオ一覧

| シナリオID | カテゴリ                       | 前提条件                                                | 操作手順（概要）                                 | 期待結果                                                                         | 優先度   |
| ---------- | ------------------------------ | ------------------------------------------------------- | ------------------------------------------------ | -------------------------------------------------------------------------------- | -------- |
| TC-11-01   | Terminal ボタン視覚（create）  | create フェーズが表示されている                         | SkillLifecyclePanel ヘッダーを確認する           | "Terminal" ラベルのボタンが表示されている                                        | 必須     |
| TC-11-02   | Terminal ボタン視覚（execute） | execute フェーズが表示されている                        | SkillLifecyclePanel ヘッダーを確認する           | "Terminal" ラベルのボタンが表示されている                                        | 必須     |
| TC-11-03   | Terminal ボタン視覚（improve） | improve フェーズが表示されている                        | SkillLifecyclePanel ヘッダーを確認する           | "Terminal" ラベルのボタンが表示されている                                        | 必須     |
| TC-11-04   | Terminal ボタンスタイル        | create フェーズが表示されている                         | Terminal ボタンの視覚スタイルを確認する          | subtle スタイルで他の主 CTA と視覚的に区別される                                 | 推奨     |
| TC-11-05   | TerminalHandoffCard 表示       | create フェーズで Terminal ボタンが表示                 | Terminal ボタンをクリックする                    | TerminalHandoffCard が表示される                                                 | 必須     |
| TC-11-06   | TerminalHandoffCard 内容       | TC-11-05 のカードが表示されている                       | カードの各フィールドを確認する                   | terminalCommand・contextSummary・reason が表示される                             | 必須     |
| TC-11-07   | コマンドコピー操作             | TC-11-05 のカードが表示されている                       | 「コマンドをコピー」ボタンをクリックする         | クリッカブルであり、クリック後に視覚フィードバックがある                         | 必須     |
| TC-11-08   | カード Dismiss 操作            | TC-11-05 のカードが表示されている                       | Dismiss ボタンをクリックする                     | TerminalHandoffCard が非表示になる                                               | 必須     |
| TC-11-09   | improve→terminal 要約転送      | improve フェーズに到達している                          | improve フェーズで Terminal ボタンをクリックする | カードの contextSummary に "improve=true" が含まれる                             | 必須     |
| TC-11-10   | improve 要約内容の確認         | TC-11-09 のカードが表示されている                       | contextSummary の内容を確認する                  | 前回改善結果の要約文が含まれている                                               | 必須     |
| TC-11-11   | キーボード: Tab フォーカス     | SkillLifecyclePanel が表示されている                    | Tab キーを押してフォーカス移動する               | Terminal ボタンに Tab でフォーカスが当たる                                       | 必須     |
| TC-11-12   | キーボード: Enter 起動         | Terminal ボタンにフォーカスが当たっている               | Enter キーを押す                                 | TerminalHandoffCard が表示される                                                 | 必須     |
| TC-11-13   | キーボード: Escape クローズ    | TC-11-05 のカードが表示されている（実装されている場合） | Escape キーを押す                                | TerminalHandoffCard が非表示になる                                               | 条件付き |
| TC-11-14   | Screenshot 契約 LC-UX-04       | TC-11-05 のカードが表示されている                       | スクリーンショットを取得する                     | prompt bundle / open terminal / no auto-send が確認可能な状態で撮影できる        | 必須     |
| TC-11-15   | Screenshot 契約 LC-UX-05       | SkillLifecyclePanel が表示されている                    | スクリーンショットを取得する                     | persistent terminal launcher（Terminal ボタン）が visible である状態で撮影できる | 必須     |

## 実行タスク

### Task 11-1: Terminal ボタン視覚テスト（TC-11-01〜TC-11-04）

**前提条件**:

- Electron アプリが起動していること
- SkillLifecyclePanel が表示される画面に遷移していること

**TC-11-01 操作手順**:

1. create フェーズ（スキル未作成状態）に遷移する
2. SkillLifecyclePanel のヘッダー領域を目視確認する
3. "Terminal" と表示されたボタンの存在を確認する

**TC-11-01 期待結果**:

- ヘッダー領域に "Terminal" ラベルのボタンが1個表示されている
- ボタンは "詳細ウィザード" ボタンや "一覧へ戻る" ボタンと同一ヘッダー行に配置されている

**TC-11-02 操作手順**:

1. スキルを選択し execute フェーズに遷移する
2. SkillLifecyclePanel のヘッダー領域を目視確認する
3. "Terminal" ボタンの存在を確認する

**TC-11-02 期待結果**:

- execute フェーズでも "Terminal" ラベルのボタンが1個表示されている

**TC-11-03 操作手順**:

1. スキルを実行し improve フェーズに遷移する
2. SkillLifecyclePanel のヘッダー領域を目視確認する
3. "Terminal" ボタンの存在を確認する

**TC-11-03 期待結果**:

- improve フェーズでも "Terminal" ラベルのボタンが1個表示されている

**TC-11-04 操作手順**:

1. create フェーズで Terminal ボタンと主 CTA（スキルを作る）ボタンを見比べる

**TC-11-04 期待結果**:

- Terminal ボタンが subtle スタイル（視覚的に目立たない控えめなスタイル）で表示されている
- 主 CTA ボタン（filled/primary）と視覚的に区別されている

### Task 11-2: TerminalHandoffCard 表示テスト（TC-11-05〜TC-11-08）

**前提条件**:

- create フェーズで Terminal ボタンが表示されていること

**TC-11-05 操作手順**:

1. Terminal ボタンをクリックする
2. SkillLifecyclePanel 内の表示を確認する

**TC-11-05 期待結果**:

- TerminalHandoffCard がパネル内（フェーズ情報グリッド直下または適切な位置）に表示される
- カードが表示されるまでに 500ms 以内（体感上のラグなし）

**TC-11-06 操作手順**:

1. TC-11-05 のカードが表示されている状態で、カード内の各フィールドを確認する

**TC-11-06 期待結果**:

- `reason` フィールドに内容が表示されている（空文字列でない）
- `contextSummary` フィールドに内容が表示されている（空文字列でない）
- `terminalCommand` フィールドに `claude` から始まるコマンド文字列が表示されている

**TC-11-07 操作手順**:

1. TC-11-05 のカードが表示されている状態で「コマンドをコピー」ボタンをクリックする

**TC-11-07 期待結果**:

- ボタンがクリック可能（disabled 状態でない）である
- クリック後にボタン文言が変化する（例: "コピーしました" 等）またはその他の視覚フィードバックがある

**TC-11-08 操作手順**:

1. TC-11-05 のカードが表示されている状態で Dismiss ボタン（閉じるボタン）をクリックする

**TC-11-08 期待結果**:

- TerminalHandoffCard が非表示になる（DOM から除去またはクラスで非表示）
- Terminal ボタンは引き続きヘッダーに表示されたままである（カードが閉じても Terminal ボタンは消えない）

### Task 11-3: improve→terminal handoff 要約転送テスト（TC-11-09〜TC-11-10）

**前提条件**:

- スキルが実行済みで improve フェーズに到達していること
- 前回の改善結果データが存在すること

**TC-11-09 操作手順**:

1. improve フェーズで Terminal ボタンをクリックする
2. 表示された TerminalHandoffCard の contextSummary を確認する

**TC-11-09 期待結果**:

- contextSummary に `improve=true` という文字列が含まれている

**TC-11-10 操作手順**:

1. TC-11-09 のカードが表示されている状態で terminalCommand を確認する

**TC-11-10 期待結果**:

- terminalCommand に前回改善結果の要約内容（improvementSummary）が反映されている
- create フェーズで生成される terminalCommand と内容が異なる（改善観点が含まれている）

### Task 11-4: キーボード操作テスト（TC-11-11〜TC-11-13）

**前提条件**:

- create フェーズで SkillLifecyclePanel が表示されていること

**TC-11-11 操作手順**:

1. SkillLifecyclePanel 内の任意の要素にフォーカスを当てる
2. Tab キーを複数回押してフォーカスを移動する
3. Terminal ボタンにフォーカスが当たることを確認する

**TC-11-11 期待結果**:

- Terminal ボタンが Tab キーによるフォーカス移動の対象に含まれている
- フォーカス時に視覚的なフォーカスリング（アウトライン）が表示される

**TC-11-12 操作手順**:

1. TC-11-11 で Terminal ボタンにフォーカスを当てた状態で Enter キーを押す

**TC-11-12 期待結果**:

- TerminalHandoffCard が表示される（マウスクリックと同一の動作）

**TC-11-13 操作手順**（実装されている場合のみ実施）:

1. TC-11-05 で TerminalHandoffCard が表示されている状態で Escape キーを押す

**TC-11-13 期待結果**（実装されている場合）:

- TerminalHandoffCard が非表示になる（TC-11-08 の Dismiss ボタンクリックと同一の動作）

### Task 11-5: Screenshot 契約確認（TC-11-14〜TC-11-15）

**前提条件**:

- TC-11-05 のカードが表示されている状態（TC-11-14 用）
- create フェーズで SkillLifecyclePanel が表示されている状態（TC-11-15 用）

**CLI 環境での制約（P53 準拠）**:

- CLI 環境では Electron アプリの実画面キャプチャが直接取得できない
- 以下のいずれかの方法で自動取得を試みること:
  - Playwright の `page.screenshot()` を使用したスクリプト化
  - Electron の `webContents.capturePage()` を使用したスクリプト化
  - `xvfb-run`（Linux 環境）または Electron の headless モードでの対応
- 上記が実行不可能な場合は「CLI 環境制約により自動取得不可」として記録し、テスト内容の代替検証（自動テスト結果）を記録する

**TC-11-14 操作手順**:

1. TC-11-05 の手順で TerminalHandoffCard を表示する
2. スクリーンショットを取得する（自動または手動）

**TC-11-14 期待結果**（LC-UX-04 準拠）:

- スクリーンショットに以下の3要素が全て確認できること:
  - prompt bundle（terminalCommand フィールドの内容）が表示されている
  - open terminal のための操作が可能な状態（コマンドコピーボタン等）が表示されている
  - 「自動実行しない（no auto-send）」旨が画面上で確認できる（reason または contextSummary 内）

**TC-11-15 操作手順**:

1. create フェーズの SkillLifecyclePanel が表示された状態でスクリーンショットを取得する（自動または手動）

**TC-11-15 期待結果**（LC-UX-05 準拠）:

- スクリーンショットに "Terminal" ボタン（persistent terminal launcher）が visible な状態で確認できること
- TerminalHandoffCard が表示されていない状態でも Terminal ボタンが見えていること

### ウォークスルー発見事項リアルタイム分類

テスト実行中に発見した事項をリアルタイムで分類・記録する。

| 発見番号               | 分類              | TC-ID | 発見内容 | 対応 |
| ---------------------- | ----------------- | ----- | -------- | ---- |
| （テスト実行時に記録） | Blocker/Note/Info |       |          |      |

- **Blocker**: テスト続行不可または受入基準に直接影響する問題 → Phase 10 へ差し戻し検討
- **Note**: 機能影響は軽微だが改善推奨の事項 → 未タスクとして記録
- **Info**: 参考情報として記録するのみ

## 参照資料

| 資料                            | パス                                                                                         | 参照目的                                         |
| ------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| Phase 10 成果物（最終レビュー） | `outputs/phase-10/final-review-report.md`                                                    | PASS 判定の前提確認                              |
| UI/UX 正本（terminal handoff）  | `docs/30-workflows/skill-lifecycle-unification/ui-ux-realization.md` L42-50                  | terminal handoff 5契約と手動テスト項目の対応確認 |
| UI/UX 正本（Screenshot 契約）   | `docs/30-workflows/skill-lifecycle-unification/ui-ux-realization.md` L73-85                  | LC-UX-04・LC-UX-05 の撮影条件確認                |
| TerminalHandoffCard             | `apps/desktop/src/renderer/components/organisms/TerminalHandoffCard/TerminalHandoffCard.tsx` | カード表示内容の確認基準                         |
| SkillLifecyclePanel             | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                         | Terminal ボタン・カード配置の確認基準            |
| P53 スクリーンショット制約      | `.claude/rules/06-known-pitfalls.md#P53`                                                     | CLI 環境での代替検証方針                         |

## 実行手順

1. `outputs/phase-10/final-review-report.md` を読み取り、Phase 10 PASS の前提を確認する
2. Electron アプリを起動する（`pnpm --filter @repo/desktop dev`）
3. Task 11-1: TC-11-01〜TC-11-04 を順番に実施し、結果を記録する
4. Task 11-2: TC-11-05〜TC-11-08 を順番に実施し、結果を記録する
5. Task 11-3: improve フェーズに遷移後、TC-11-09〜TC-11-10 を実施し、結果を記録する
6. Task 11-4: TC-11-11〜TC-11-13 をキーボード操作で実施し、結果を記録する
7. Task 11-5: TC-11-14〜TC-11-15 のスクリーンショット取得を試みる（CLI 環境制約がある場合は P53 準拠で代替記録）
8. 全シナリオの PASS / FAIL / SKIP（CLI 制約による）を集計する
9. FAIL のシナリオがある場合は、問題のある実装箇所（ファイル・行番号）を特定して記録する
10. `outputs/phase-11/manual-test-result.md` に全シナリオの結果・スクリーンショット（取得できた場合）・FAIL 時の問題箇所を記録する

## 成果物テーブル

| 成果物                | パス                                     | 完了条件                                                                                       |
| --------------------- | ---------------------------------------- | ---------------------------------------------------------------------------------------------- |
| manual-test-result.md | `outputs/phase-11/manual-test-result.md` | 全必須シナリオ（TC-11-01〜TC-11-12・TC-11-14・TC-11-15）の PASS / FAIL / SKIP が記録されている |
| discovered-issues.md  | `outputs/phase-11/discovered-issues.md`  | ウォークスルーで発見した Blocker / Note 事項が記録されている（0件でも作成必須）                |
| screenshot-plan.json  | `outputs/phase-11/screenshot-plan.json`  | TC-11-14・TC-11-15 のスクリーンショット取得計画が JSON 形式で記録されている                    |

## 画面カバレッジマトリクス

| 画面状態                   | TC-11-01 | TC-11-02 | TC-11-03 | TC-11-05 | TC-11-06 | TC-11-07 | TC-11-08 | TC-11-09 | TC-11-14 | TC-11-15 |
| -------------------------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- |
| create フェーズ            | x        |          |          | x        | x        | x        | x        |          |          | x        |
| execute フェーズ           |          | x        |          |          |          |          |          |          |          |          |
| improve フェーズ           |          |          | x        |          |          |          |          | x        | x        |          |
| TerminalHandoffCard 表示中 |          |          |          | x        | x        | x        | x        | x        | x        |          |

## タスク100%実行確認【必須】

本 Phase の全タスクを完全に実行したことを確認する。

- [ ] 上記「実行タスク」セクションの全タスク（Task 11-1〜11-5）を実行した
- [ ] 各タスクの結果が manual-test-result.md に記録されている
- [ ] ウォークスルー発見事項が discovered-issues.md に記録されている（0件でも作成必須）
- [ ] スクリーンショット計画が screenshot-plan.json に記録されている

## 統合テスト連携

本 Phase の手動テスト結果は、Phase 12 のドキュメント作成で使用される。

- TC-11-xx のテスト結果は Phase 12 の implementation-guide.md で参照される
- 発見された Blocker 事項は Phase 10 の判定見直しの根拠となる
- Phase 13 の完了条件「Blocker 0 件」の判定に使用される

## 多角的チェック観点

| 観点               | 確認内容                                                                      |
| ------------------ | ----------------------------------------------------------------------------- |
| Apple UI/UX        | Clarity（読みやすさ）・Deference（コンテンツ優先）・Depth（奥行き）の3観点    |
| ダーク/ライト      | 両テーマで Terminal ボタンと TerminalHandoffCard の視認性が確保されていること |
| キーボード操作     | Tab フォーカス・Enter 起動・Escape 閉じるが正常に動作すること                 |
| スクリーンショット | TC-11-01〜TC-11-05 の必須撮影と screenshot-plan.json の存在                   |

## 完了条件チェックリスト

- [ ] Task 11-1: TC-11-01（create）・TC-11-02（execute）・TC-11-03（improve）の全フェーズで Terminal ボタンの存在が確認されている
- [ ] Task 11-1: TC-11-04 で Terminal ボタンが subtle スタイルであることが確認されている（推奨）
- [ ] Task 11-2: TC-11-05 で Terminal ボタンクリック後に TerminalHandoffCard が表示されることが確認されている
- [ ] Task 11-2: TC-11-06 で terminalCommand・contextSummary・reason の全フィールドが空でないことが確認されている
- [ ] Task 11-2: TC-11-07 で「コマンドをコピー」ボタンがクリック可能であることが確認されている
- [ ] Task 11-2: TC-11-08 で Dismiss 後に TerminalHandoffCard が非表示になることが確認されている
- [ ] Task 11-3: TC-11-09 で contextSummary に "improve=true" が含まれることが確認されている
- [ ] Task 11-3: TC-11-10 で terminalCommand に前回改善結果の要約が含まれることが確認されている
- [ ] Task 11-4: TC-11-11 で Terminal ボタンへの Tab フォーカスが確認されている
- [ ] Task 11-4: TC-11-12 で Enter キーによる TerminalHandoffCard 表示が確認されている
- [ ] Task 11-4: TC-11-13 は「実装されている場合のみ」として SKIP 可（SKIP 理由を記録すること）
- [ ] Task 11-5: TC-11-14（LC-UX-04）のスクリーンショットまたは代替記録が存在する
- [ ] Task 11-5: TC-11-15（LC-UX-05）のスクリーンショットまたは代替記録が存在する
- [ ] FAIL シナリオがある場合、問題箇所（ファイル・行番号）が特定されている
- [ ] `outputs/phase-11/manual-test-result.md` が作成されている
- [ ] `outputs/phase-11/discovered-issues.md` が作成されている（0件でも必須）
- [ ] `outputs/phase-11/screenshot-plan.json` が作成されている

## 次 Phase

Phase 12 ドキュメント (`phase-12-documentation.md`)

- 入力: `outputs/phase-11/manual-test-report.md`
- 目的: 実装ガイド作成・システム仕様書更新・未タスク検出
