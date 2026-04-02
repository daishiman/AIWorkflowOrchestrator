# UT-P0-09-PHASE11-SCREENSHOT-EVIDENCE-001: GovernanceSummaryPanel 手動スクリーンショット収集

```yaml
task_id: UT-P0-09-PHASE11-SCREENSHOT-EVIDENCE-001
task_name: GovernanceSummaryPanel 手動スクリーンショット収集
category: 品質保証
target_feature: GovernanceSummaryPanel (UT-P0-09-GOVERNANCE-RUNTIME-COVERAGE-AND-UI-SURFACE-001)
priority: 中
scale: 小規模
status: 未着手
source_phase: Phase 12
created_date: 2026-04-02
parent_task: UT-P0-09-GOVERNANCE-RUNTIME-COVERAGE-AND-UI-SURFACE-001
dependencies:
  - UT-P0-09-GOVERNANCE-RUNTIME-COVERAGE-AND-UI-SURFACE-001
```

| 項目      | 値                                                                             |
| --------- | ------------------------------------------------------------------------------ |
| タスクID  | UT-P0-09-PHASE11-SCREENSHOT-EVIDENCE-001                                       |
| 優先度    | 中                                                                             |
| 元タスク  | UT-P0-09-GOVERNANCE-RUNTIME-COVERAGE-AND-UI-SURFACE-001                        |
| 検出日    | 2026-04-02                                                                     |
| 由来      | Phase 12 unassigned-task-detection / worktree 環境制約による Phase 11 N/A 閉じ |
| Issue番号 | #1845                                                                          |

---

## 概要

`UT-P0-09-GOVERNANCE-RUNTIME-COVERAGE-AND-UI-SURFACE-001` で実装した `GovernanceSummaryPanel` は、
IPC ポーリングで `SkillCreatorGovernanceState` を取得し、denial reason / recent denials / session summary を
renderer に表示する UI コンポーネントである。

worktree 環境では Electron 実行環境がないため、Phase 11（手動テスト）でスクリーンショット収集を N/A として閉じた。
実際のビジュアル証跡（governance 状態の UI 表示確認）が未完のため、手動 QA 環境での再取得が必要。

---

## 背景・苦戦箇所

### 苦戦箇所 1: worktree 環境での Electron 起動制限

worktree ブランチでは `pnpm --filter @repo/desktop dev` を実行しても、Electron のレンダラープロセスが
メインブランチのビルドキャッシュと競合する可能性がある。UIコンポーネントを実装しても、
worktree 内からは視覚的証跡が取れない。

**知見**: スクリーンショット収集は main ブランチに変更をマージしてから、または手動 QA 環境で実施する。
Phase 11 を N/A で閉じる際は「worktree 制約による環境依存スキップ」として根拠を明示すること。

### 苦戦箇所 2: `validate-phase-output.js` での PNG 証跡 0 件判定

`validate-phase-output.js` は `outputs/phase-11/screenshots/` ディレクトリの PNG ファイル数を検証する。
スクリーンショット 0 件の状態では FAIL となるため、Phase 12 進行前にこのスクリプトへの対応が必要。

**知見**: Phase 11 を N/A 閉じにする場合は、`artifacts.json` の Phase 11 ステータスを `skipped` または
`not_applicable` として設定し、バリデーションスクリプトが N/A を許容するように設定を調整する。
あるいは、本タスク（UT-P0-09-PHASE11-SCREENSHOT-EVIDENCE-001）への参照リンクを残すことで
「意図的な先送り」として記録する。

### 苦戦箇所 3: Phase 11 N/A 閉じの根拠記録の粒度

「UI コンポーネントだが worktree では起動できないため N/A」という判断は正当だが、
粒度が揺れると将来の同様タスクで混乱が生じる。

**知見**: N/A 閉じの際は「環境制約の種別（worktree / CI / headless）」「UI の種別（visual / non-visual）」
「スクリーンショット対象コンポーネントの一覧」「本タスクへの参照」を必ず記録する。
これにより将来のタスク実施者が再現可能な手順で証跡取得できる。

---

## 1. なぜこのタスクが必要か (Why)

### 1.1 背景

`GovernanceSummaryPanel` は以下の 4 状態を持つ UI コンポーネントである：

1. **loading 状態**: IPC 応答待ち中のローディング表示（`data-testid="governance-loading"`）
2. **error 状態**: preload API 未接続またはエラー時のエラーバナー（`data-testid="governance-error"`）
3. **no-denials 状態**: denial 0 件のノーマル表示（`data-testid="governance-no-denials"`）
4. **with-denials 状態**: denial 1 件以上のリスト表示（`data-testid="governance-denials"`）

これらの状態はユニットテスト（`GovernanceSummaryPanel.test.tsx`）でカバー済みだが、
Electron 実環境での目視確認・スクリーンショット収集が未完のままとなっている。

### 1.2 問題点・課題

- Phase 11 が N/A のまま閉じられており、ビジュアル証跡が存在しない。
- `validate-phase-output.js` を実行すると、`outputs/phase-11/screenshots/` の PNG 件数が 0 のため FAIL する可能性がある。
- UI レビューアがコンポーネントの実際の見た目を確認できない。

### 1.3 放置した場合の影響

- governance 関連の UI 品質確認が「テストのみ」に依存し続け、視覚的デグレードを見落とすリスクが残る。
- 将来の UI 変更時に「元の状態の証跡がない」という問題が生じる。
- Phase 11 N/A の前例が増えることで、スクリーンショット収集の重要性が希薄化する。

---

## 2. 何を達成するか (What)

### 2.1 目的

手動 QA 環境（Electron アプリ実起動）で `GovernanceSummaryPanel` の各状態を再現し、
スクリーンショットを取得・整備することで、Phase 11 完了を正式に宣言する。

### 2.2 最終ゴール

1. 4 状態（loading / error / no-denials / with-denials）のスクリーンショットが `outputs/phase-11/screenshots/` に存在すること。
2. `manual-test-result.md` に各状態の pass/fail と証跡ファイル名が記録されていること。
3. `validate-phase-output.js` が PASS すること（またはバリデーション設定が N/A を許容していること）。
4. Phase 11 ステータスが `completed` に更新されていること。

### 2.3 スコープ

#### 含むもの

- 手動 QA 環境での Electron アプリ起動（`pnpm --filter @repo/desktop dev`）
- `GovernanceSummaryPanel` の 4 状態のスクリーンショット収集
- `outputs/phase-11/screenshots/` への PNG ファイル配置
- `manual-test-result.md` の実測値更新
- `artifacts.json` の Phase 11 ステータス更新

#### 含まないもの

- `GovernanceSummaryPanel.tsx` のコンポーネント実装変更
- ユニットテストの追加・変更
- IPC ハンドラーの変更
- `AdvancedSettingsPanel.tsx` の変更

### 2.4 成果物

| 成果物                     | パス                                                                                                               |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| スクリーンショット（4 件） | `docs/30-workflows/ut-p0-09-governance-runtime-coverage-and-ui-surface-001/outputs/phase-11/screenshots/`          |
| 手動テスト結果             | `docs/30-workflows/ut-p0-09-governance-runtime-coverage-and-ui-surface-001/outputs/phase-11/manual-test-result.md` |
| artifacts.json 更新        | `docs/30-workflows/ut-p0-09-governance-runtime-coverage-and-ui-surface-001/artifacts.json`                         |

---

## 3. どのように実行するか (How)

### 3.1 前提条件

- `UT-P0-09-GOVERNANCE-RUNTIME-COVERAGE-AND-UI-SURFACE-001` が main にマージ済みであること
- ローカル環境で `pnpm --filter @repo/desktop dev` が起動可能であること
- macOS の「画面収録」権限がターミナル / Electron に付与されていること

### 3.2 依存タスク

- `UT-P0-09-GOVERNANCE-RUNTIME-COVERAGE-AND-UI-SURFACE-001`（GovernanceSummaryPanel 実装）: 完了済み

### 3.3 取得対象スクリーンショット一覧

| TC ID | 状態         | 条件                                            | ファイル名                        |
| ----- | ------------ | ----------------------------------------------- | --------------------------------- |
| TC-01 | loading      | IPC 接続前（初回レンダリング直後）              | TC-01-governance-loading.png      |
| TC-02 | error        | preload API 未接続（`window.electronAPI` なし） | TC-02-governance-error.png        |
| TC-03 | no-denials   | governance 正常取得・denial 0 件                | TC-03-governance-no-denials.png   |
| TC-04 | with-denials | governance 正常取得・denial 1 件以上            | TC-04-governance-with-denials.png |

---

## 4. 実行手順

### Phase 構成

Phase 1〜5 で収集実施、Phase 6〜9 で品質検証、Phase 10〜13 で完了処理を行う。

---

### Phase 1: Electron 環境の確認・起動準備

#### 目的

Electron アプリが起動可能な状態であることを確認し、スクリーンショット収集の準備を行う。

#### 手順

1. `UT-P0-09-GOVERNANCE-RUNTIME-COVERAGE-AND-UI-SURFACE-001` の変更が main にマージされていることを確認する。
2. `pnpm install` を実行し依存関係が最新であることを確認する。
3. `pnpm --filter @repo/desktop build` を実行しビルドエラーがないことを確認する。
4. macOS の「システム環境設定 > プライバシーとセキュリティ > 画面収録」でターミナル / Electron に権限が付与されていることを確認する。
5. `outputs/phase-11/screenshots/` ディレクトリを作成する（存在しない場合）。

#### 成果物

- 起動確認結果メモ（ビルド成功 / 失敗）

#### 完了条件

- [ ] `pnpm --filter @repo/desktop build` がエラーなし
- [ ] スクリーンショット保存先ディレクトリが存在する
- [ ] 画面収録権限が付与されている

---

### Phase 2: GovernanceSummaryPanel の画面仕様確認

#### 目的

スクリーンショット収集対象の画面仕様（4 状態・data-testid・CSS クラス）を確認する。

#### 手順

1. `GovernanceSummaryPanel.tsx` のソースを参照し、4 状態の条件を確認する。
   - `data-testid="governance-loading"`: `state === null && error === null`
   - `data-testid="governance-error"`: `error !== null`
   - `data-testid="governance-no-denials"`: `state.recentDenials.length === 0`
   - `data-testid="governance-denials"`: `state.recentDenials.length > 0`
2. 各状態を再現するための条件（IPC 状態・モック方法）を整理する。
3. `AdvancedSettingsPanel.tsx` 内の `GovernanceSummaryPanel` の組み込み位置を確認する。

#### 成果物

- 画面仕様確認メモ（4 状態の再現条件一覧）

#### 完了条件

- [ ] 4 状態の再現条件が明確になっている
- [ ] `GovernanceSummaryPanel` の画面上の位置が確認されている

---

### Phase 3: 設計レビュー（スクリーンショット収集計画）

#### 目的

取得対象 TC・状態再現手順・保存先命名規則を確定する。

#### 手順

1. TC-01〜TC-04 の取得順序と状態再現手順を確定する。
2. PNG ファイルの命名規則を確定する（`TC-{番号}-governance-{状態}.png`）。
3. loading 状態の再現タイミング（アプリ起動直後の一瞬）を確認し、キャプチャ手順を設計する。
4. error 状態の再現方法（`window.electronAPI` を devtools で無効化するなど）を確定する。

#### 成果物

- スクリーンショット収集計画書（TC 一覧・状態再現手順・ファイル命名規則）

#### 完了条件

- [ ] 4 状態の状態再現手順が確定している
- [ ] ファイル命名規則が確定している

---

### Phase 4: テスト作成（スクリーンショット確認スクリプト）

#### 目的

収集後の証跡品質を検証するためのスクリプトを作成する。

#### 手順

1. `outputs/phase-11/screenshots/` に 4 件の PNG が存在することを確認するスクリプトを作成する。
2. `validate-phase-output.js`（または相当スクリプト）が PASS することを確認するためのコマンドを整理する。
3. `manual-test-result.md` のフォーマットを確認し、記録テンプレートを作成する。

#### 成果物

- スクリーンショット存在確認スクリプト（シェルスクリプト or node スクリプト）
- `manual-test-result.md` 記録テンプレート

#### 完了条件

- [ ] 確認スクリプトが作成されている
- [ ] `manual-test-result.md` のテンプレートが準備されている

---

### Phase 5: スクリーンショット収集実施

#### 目的

Electron アプリ上で 4 状態を再現し、スクリーンショットを取得する。

#### 手順

1. `pnpm --filter @repo/desktop dev` で Electron アプリを起動する。
2. **TC-01 (loading)**: アプリ起動直後の GovernanceSummaryPanel の「読み込み中...」表示をキャプチャする。
3. **TC-02 (error)**: devtools または環境設定で `window.electronAPI.skillCreator.getGovernanceState` を無効化した状態でキャプチャする。
4. **TC-03 (no-denials)**: governance が正常接続・denial 0 件の状態でキャプチャする（通常起動時）。
5. **TC-04 (with-denials)**: 意図的に拒否が発生する操作（スキルルート外へのファイル書き込みなど）を行い、denial リスト表示をキャプチャする。
6. 各 PNG を `outputs/phase-11/screenshots/` に保存する。

#### 成果物

- TC-01〜TC-04 の PNG ファイル（計 4 件）

#### 完了条件

- [ ] `outputs/phase-11/screenshots/` に TC-01〜TC-04 の PNG が存在する
- [ ] 各 PNG が対象状態を正しく示している

---

### Phase 6: 証跡品質確認

#### 目的

収集したスクリーンショットが要求する品質基準を満たしていることを確認する。

#### 手順

1. 各 PNG が `data-testid` で特定した状態（loading / error / no-denials / with-denials）を示していることを目視確認する。
2. 解像度・ファイルサイズが適切であることを確認する（最低 800x600px）。
3. 文字が判読可能であることを確認する。
4. 各状態の UI 要素（フェーズ名・許可モード・セッションイベント数・denial 一覧）が正しく表示されていることを確認する。

#### 成果物

- 証跡品質確認メモ（各 TC の pass/fail 判定）

#### 完了条件

- [ ] 4 件の PNG が全て目視確認 PASS
- [ ] 解像度・文字判読性に問題なし

---

### Phase 7: validate-phase-output.js でのバリデーション確認

#### 目的

バリデーションスクリプトが PASS することを確認する。

#### 手順

1. `validate-phase-output.js`（または相当スクリプト）の存在を確認する。
2. スクリプトを実行し、`outputs/phase-11/screenshots/` の PNG 件数が期待値（4 件）と一致することを確認する。
3. スクリプトが存在しない場合は、Phase 4 で作成したシェルスクリプトで代替確認を行う。
4. `artifacts.json` の Phase 11 ステータスを `completed` に更新する。

#### 成果物

- バリデーション結果（PASS / FAIL）

#### 完了条件

- [ ] バリデーションスクリプトが PASS している（または代替確認が完了している）
- [ ] `artifacts.json` の Phase 11 ステータスが `completed` に更新されている

---

### Phase 8: リファクタリング不要（スキップ可）

#### 目的

本タスクはコンポーネント実装の変更を含まないため、リファクタリングは対象外。

#### 手順

1. Phase 1〜7 の成果物（スクリーンショット・テキストファイル）に誤字・命名ミスがないことを確認する。
2. ファイル命名規則が TC 一覧と一致していることを確認する。

#### 成果物

- なし（確認のみ）

#### 完了条件

- [ ] ファイル命名・内容に誤りがないことを確認済み

---

### Phase 9: 品質保証

#### 目的

スクリーンショット収集の完全性を最終確認する。

#### 手順

1. TC-01〜TC-04 の 4 件の PNG が全て存在することを確認する。
2. `manual-test-result.md` に各 TC の pass/fail と証跡ファイル名が記録されていることを確認する。
3. `artifacts.json` の Phase 11 が `completed` であることを確認する。
4. バリデーションスクリプトが PASS することを再確認する。

#### 成果物

- 品質保証確認レポート

#### 完了条件

- [ ] TC-01〜TC-04 の PNG が全て存在する
- [ ] `manual-test-result.md` が実測値で記録されている
- [ ] バリデーションスクリプトが PASS している

---

### Phase 10: 最終レビュー

#### 目的

Phase 11 完了宣言の準備を行い、完了条件を全て満たしていることを確認する。

#### 手順

1. 本タスクの完了条件チェックリストを全項目確認する。
2. `GovernanceSummaryPanel` の 4 状態が全て証跡として記録されていることを確認する。
3. 苦戦箇所 2 で述べた「将来の同様タスクへの知見」が記録されていることを確認する。
4. PR 作成に向けた変更ファイル一覧を確認する（スクリーンショット PNG・md ファイル・json ファイルのみ）。

#### 成果物

- 最終レビュー結果

#### 完了条件

- [ ] 完了条件チェックリストが全項目 PASS
- [ ] スクリーンショット 4 件が揃っている

---

### Phase 11: 手動テスト（スクリーンショット自体が成果物）

#### 目的

本タスクはスクリーンショット収集自体が手動テストの成果物であるため、Phase 5 での収集が Phase 11 の実施に相当する。

#### 手順

1. Phase 5 で収集した 4 件のスクリーンショットを最終確認する。
2. 各状態の表示が期待通りであることを目視で再確認する。
3. `manual-test-result.md` を Phase 11 完了として更新する。

#### 成果物

- `manual-test-result.md`（Phase 11 completed 記録）

#### 完了条件

- [ ] 4 件の PNG が Phase 11 の手動テスト証跡として確認されている
- [ ] `manual-test-result.md` が `passed` 状態で更新されている

---

### Phase 12: ドキュメント更新（Phase 11 証跡を正式な成果物として記録）

#### 目的

Phase 11 証跡（スクリーンショット）を正式な成果物として記録し、`UT-P0-09` の Phase 11 close-out を完了する。

#### 手順

1. `artifacts.json` の Phase 11 ステータスを `completed` に更新する。
2. Phase 11 の証跡サマリーを `implementation-guide.md` または `unassigned-task-detection.md` に追記する。
3. 本タスク仕様書（`UT-P0-09-PHASE11-SCREENSHOT-EVIDENCE-001.md`）のステータスを「完了」に更新する。
4. 苦戦箇所セクションの知見を lessons-learned として記録する（worktree 制約・N/A 閉じの粒度）。

#### 中学生レベルの概念説明

このタスクで何をしているか、身近な例で説明します。

**例え: 料理の写真撮影**

料理レシピを作るとき、完成した料理の写真を撮ることで「本当にこの通りに作れる」という証拠になります。

`GovernanceSummaryPanel` は、AIが「どのツールを使ってよいか・使ってはいけないか」を管理するシステムの状態を画面に表示するコンポーネントです。
コードを書いてテストも全部通ったのですが、「実際に画面でどう見えるか」の写真（スクリーンショット）を撮り忘れていました。

このタスクは、その「料理の写真撮影」を改めて行うタスクです。

- ローディング中の画面（料理を作っている途中）
- エラー画面（料理が失敗した状態）
- 正常な画面（料理が完成した状態）
- 拒否リストが表示された画面（「この材料は使えません」という警告が出た状態）

4 枚の写真を撮って保存することで、「ちゃんと動いていた」という公式な記録が完成します。

#### 成果物

- 更新済み `artifacts.json`
- ステータス更新済みの本仕様書

#### 完了条件

- [ ] `artifacts.json` の Phase 11 が `completed` になっている
- [ ] 本仕様書のステータスが「完了」になっている

---

### Phase 13: PR 作成

#### 目的

スクリーンショット・証跡ドキュメントを main ブランチにマージする PR を作成する。

#### 手順

1. ブランチが最新の main と同期されていることを確認する。
2. 変更ファイルが PNG・md・json のみであることを確認する（ソースコード変更なし）。
3. PR を作成する。タイトル: `docs(governance): UT-P0-09-PHASE11-SCREENSHOT-EVIDENCE-001 GovernanceSummaryPanel Phase 11 証跡`
4. PR 本文にスクリーンショット 4 件の概要と Phase 11 close-out を記載する。
5. CI が全 PASS であることを確認する（ソースコード変更なしのため型・lint エラーなし）。

#### 成果物

- GitHub PR

#### 完了条件

- [ ] PR が作成されている
- [ ] CI が全 PASS

---

## 5. 完了条件チェックリスト

### 成果物要件

- [ ] `TC-01-governance-loading.png` が存在する
- [ ] `TC-02-governance-error.png` が存在する
- [ ] `TC-03-governance-no-denials.png` が存在する
- [ ] `TC-04-governance-with-denials.png` が存在する
- [ ] `manual-test-result.md` に各 TC の結果が記録されている
- [ ] `artifacts.json` の Phase 11 が `completed` になっている

### 品質要件

- [ ] 各スクリーンショットが対象状態を正しく示している（目視確認 PASS）
- [ ] バリデーションスクリプトが PASS している

### ドキュメント要件

- [ ] 本仕様書のステータスが「完了」になっている
- [ ] lessons-learned として stale 知見が記録されている

---

## 6. 検証方法

### スクリーンショット存在確認

```bash
ls docs/30-workflows/ut-p0-09-governance-runtime-coverage-and-ui-surface-001/outputs/phase-11/screenshots/
# → TC-01-governance-loading.png
# → TC-02-governance-error.png
# → TC-03-governance-no-denials.png
# → TC-04-governance-with-denials.png
```

### artifacts.json 確認

```bash
cat docs/30-workflows/ut-p0-09-governance-runtime-coverage-and-ui-surface-001/artifacts.json \
  | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('phases', {}).get('11', 'not found'))"
# → "completed" であること
```

### Electron アプリ起動

```bash
pnpm --filter @repo/desktop dev
```

---

## 7. リスクと対策

| リスク                                                       | 影響度 | 発生確率 | 対策                                                                                                    |
| ------------------------------------------------------------ | ------ | -------- | ------------------------------------------------------------------------------------------------------- |
| Electron アプリのビルドが壊れていて起動できない              | 高     | 低       | `pnpm --filter @repo/desktop build` を先に実行してエラーを確認する                                      |
| macOS の画面収録権限エラーでスクリーンショットが取得できない | 中     | 中       | システム環境設定 > プライバシーとセキュリティ > 画面収録 でターミナル/Electron に権限を付与する         |
| with-denials 状態（TC-04）の再現が困難                       | 中     | 中       | path-scoped enforcement が有効な状態でスキルルート外への書き込みを試みるか、devtools でモックを注入する |
| loading 状態（TC-01）の一瞬をキャプチャできない              | 低     | 中       | ネットワーク遅延や IPC 応答を意図的に遅らせるか、React DevTools でコンポーネント状態を操作する          |
| `validate-phase-output.js` が本タスク実施後も FAIL する      | 中     | 低       | スクリプトの期待ファイル名と実ファイル名の一致を Phase 4 で事前確認する                                 |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント                                 | パス                                                                                                 |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| GovernanceSummaryPanel 実装                  | `apps/desktop/src/renderer/components/organisms/AgentView/GovernanceSummaryPanel.tsx`                |
| GovernanceSummaryPanel テスト                | `apps/desktop/src/renderer/components/organisms/AgentView/__tests__/GovernanceSummaryPanel.test.tsx` |
| AdvancedSettingsPanel（組み込み親）          | `apps/desktop/src/renderer/components/organisms/AgentView/AdvancedSettingsPanel.tsx`                 |
| UT-P0-08 Phase 11 仕様書（参考フォーマット） | `docs/30-workflows/unassigned-task/UT-P0-08-PHASE11-SCREENSHOT-EVIDENCE-001.md`                      |

### 参考資料

- `GovernanceSummaryPanel` の `data-testid` 一覧: `governance-panel`, `governance-loading`, `governance-error`, `governance-no-denials`, `governance-denials`, `governance-phase`, `governance-permission-mode`, `governance-session-summary`

---

## 9. 備考

### 苦戦箇所の原文（worktree 制約による N/A 閉じの記録）

```
Phase 11 は worktree 環境（Electron 起動不可）のため N/A として閉じた。
GovernanceSummaryPanel は UI コンポーネントを追加しているが、
視覚的証跡が未完のため UT-P0-09-PHASE11-SCREENSHOT-EVIDENCE-001 として
unassigned-task に追加し、手動 QA 環境での再取得を後続タスクとした。
```

### 補足事項

- 本タスクはソースコード変更を一切含まない。変更対象はスクリーンショット PNG・md・json ファイルのみ。
- `GovernanceSummaryPanel` の 4 状態はユニットテストで既に全て GREEN であることが確認済み。
- loading 状態の再現が困難な場合は、React DevTools の `state` パネルで `state` を `null` に強制設定することで代替可能。
