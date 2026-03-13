# Onboarding Wizard テストハードニングと回帰ガード強化 - タスク指示書

## メタ情報

| 項目         | 内容                                                                                 |
| ------------ | ------------------------------------------------------------------------------------ |
| タスクID     | UT-IMP-ONBOARDING-TEST-HARDENING-GUARD-001                                           |
| タスク名     | Onboarding Wizard テストハードニングと回帰ガード強化                                 |
| 分類         | 改善                                                                                 |
| 対象機能     | Onboarding Wizard / Settings rerun / OnboardingGate / SettingsView integration tests |
| 優先度       | 中                                                                                   |
| 見積もり規模 | 中規模                                                                               |
| ステータス   | 未実施                                                                               |
| Issue        | #1191                                                                                |
| 発見元       | Phase 12                                                                             |
| 発見日       | 2026-03-13                                                                           |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-UI-09-ONBOARDING-WIZARD の Phase 12 再確認で、Onboarding Wizard の本体実装は完了している一方、テスト品質に軽微な残課題が残っていることが分かった。system spec には `function coverage 76.92%`、`act(...)` warning、rerun 系 integration の hardening 必要性を反映済みであり、次回類似 UI を短く直すために follow-up task として独立管理する必要がある。

### 1.2 問題点・課題

- Onboarding 関連テストの function coverage が 80% 未満で止まっている。
- `SettingsView.integration.test.tsx` と `OnboardingGate.test.tsx` 系で `act(...)` warning が残る。
- rerun 導線は `persist reset -> view handoff -> overlay 再評価` の連鎖を持つため、分岐が多く回帰しやすい。
- warning と coverage 不足を report の文章だけで残すと、次の担当者が着手点を特定しにくい。

### 1.3 放置した場合の影響

- rerun や初回表示の回帰が発生しても検出が遅れる。
- CI やローカル検証で warning ノイズが残り、本当に壊れた差分の判別が難しくなる。
- Onboarding 系 UI を再利用する際に、どの分岐を守るべきかがドキュメントだけでは伝わらない。

---

## 2. 何を達成するか（What）

### 2.1 目的

Onboarding Wizard 周辺のテストを hardening し、warning のない安定した回帰ガードを用意する。

### 2.2 最終ゴール

- Onboarding 関連の target test で `act(...)` warning が出ない。
- first launch / skip / complete / rerun / already-completed の主要分岐がテストで明示的に守られる。
- touched scope の function coverage が 80% 以上になる。
- completion 後に必要なら system spec / verification note に最終値を反映できる状態になる。

### 2.3 スコープ

#### 含むもの

- OnboardingGate / SettingsView rerun 導線の integration test 強化
- テストヘルパー、fixture、非同期待機の安定化
- warning 解消のための `act` / wait 制御見直し
- 結果として必要になる verification / documentation の同期

#### 含まないもの

- Onboarding Wizard の UI デザイン変更
- Settings rerun card の発見性改善
- onboarding step 内容の追加・削除

### 2.4 成果物

- 更新された Onboarding 関連テストファイル
- 必要に応じた test helper / harness
- 実行ログまたは検証メモ
- 必要に応じた system spec 更新差分

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-UI-09-ONBOARDING-WIZARD の実装が存在していること
- Onboarding rerun 契約が `onboarding.completed=false` reset と dashboard handoff で定義されていること
- system spec 側に Onboarding Wizard の実装内容と苦戦箇所が反映済みであること

### 3.2 依存タスク

- TASK-UI-09-ONBOARDING-WIZARD

### 3.3 必要な知識

- Vitest / React Testing Library / happy-dom
- React の `act(...)` と非同期状態更新
- persist state と navigation handoff の扱い
- `/.claude/skills/aiworkflow-requirements/` の UI / lessons / task-workflow 正本

### 3.4 推奨アプローチ

rerun 契約を 1 本のテストシナリオとしてではなく、`first launch`、`already completed`、`complete after walkthrough`、`rerun from settings`、`edge/error path` に分解して守る。非同期更新は helper 化し、warning を消すことと coverage を上げることを同じハーネスで達成する。

### 3.5 実装課題と解決策

| 実装課題                         | 内容                                                                               | 解決策                                                                         |
| -------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| rerun 契約が複数層にまたがる     | `persist reset -> dashboard handoff -> overlay 再表示` が 1 回の UI 操作に含まれる | helper で手順を固定し、分岐を個別テストに分解する                              |
| warning の原因が見えにくい       | state update と assertion の境界が曖昧だと `act(...)` warning が残る               | async wait と flush ポイントを明示し、暗黙待機を減らす                         |
| coverage gap が再発しやすい      | complete 済み分岐や rerun edge 分岐が後回しになりやすい                            | 主要 5 分岐を coverage 対象として列挙し、抜けを防ぐ                            |
| system spec との接続が切れやすい | report の数値だけでは後続担当が背景を読めない                                      | task-workflow / settings / lessons で同じ UT ID を参照し、完了時は同値更新する |

---

## 4. 実行手順

### Phase構成

3フェーズで進める。`再現と分岐棚卸し`、`hardening 実装`、`検証と文書同期` の順に進める。

### Phase 1: 再現と分岐棚卸し

#### 目的

warning と coverage gap の正確な発生点を固定する。

#### 手順

1. Onboarding 関連 target test を実行し、warning 発生箇所を記録する。
2. first launch / skip / complete / rerun / already-completed の未保証分岐を洗い出す。
3. shared helper 化すべき待機処理と fixture を決める。

#### 成果物

- warning 発生箇所メモ
- target branch 一覧

#### 完了条件

- どのテストが warning を出しているか説明できる。
- coverage を埋める対象分岐が列挙されている。

### Phase 2: テストとハーネスの hardening

#### 目的

warning を消し、主要分岐の回帰ガードを実装する。

#### 手順

1. rerun 契約用 helper / fixture を追加または整理する。
2. target branch ごとにテストを追加し、暗黙待機を明示待機へ置き換える。
3. `act(...)` warning が消えるまで state update の境界を調整する。

#### 成果物

- 更新済みテスト
- helper / harness 差分

#### 完了条件

- warning の再現が止まっている。
- 主要分岐のテストが揃っている。

### Phase 3: 検証と文書同期

#### 目的

数値と文書の整合を閉じる。

#### 手順

1. target test と coverage を再実行し、最終値を確認する。
2. 必要に応じて verification note と system spec を更新する。
3. 未タスク完了時は task-workflow の参照先とステータスを更新する。

#### 成果物

- 検証ログ
- 必要に応じた system spec 更新

#### 完了条件

- function coverage 80% 以上を確認できる。
- target scope で `act(...)` warning が出ない。

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] first launch を守るテストがある
- [ ] complete 後に再表示されないことを守るテストがある
- [ ] Settings rerun を守るテストがある
- [ ] already-completed 分岐を守るテストがある

### 品質要件

- [ ] target scope の function coverage が 80% 以上
- [ ] target scope で `act(...)` warning が 0 件
- [ ] helper / harness の責務が分離されている

### ドキュメント要件

- [ ] 必要なら `task-workflow.md` に完了反映を行う
- [ ] 必要なら `ui-ux-settings.md` / `lessons-learned.md` に再利用知識を追記する
- [ ] 実行ログまたは検証メモに最終値を残す

---

## 6. 検証方法

### テストケース

| テストケース      | 目的                                                            |
| ----------------- | --------------------------------------------------------------- |
| 初回表示          | 初回起動時のみ wizard が出ることを確認する                      |
| 完了後抑止        | walkthrough 完了後は再表示されないことを確認する                |
| rerun             | Settings から rerun すると overlay が再表示されることを確認する |
| already-completed | completed state では通常画面へ進むことを確認する                |
| edge path         | async handoff 中の warning や未待機更新が残らないことを確認する |

### 検証手順

1. `pnpm --filter @repo/desktop exec vitest run <onboarding-target-tests>` を実行する。
2. warning が 0 件であることを確認する。
3. target scope の coverage を確認する。
4. 文書を更新した場合は `verify-unassigned-links.js` で参照切れがないことを確認する。

---

## 7. リスクと対策

| リスク                                             | 影響度 | 発生確率 | 対策                                                      |
| -------------------------------------------------- | ------ | -------- | --------------------------------------------------------- |
| warning を消すために実装コードへ不要な調整を入れる | 中     | 中       | まず test helper と待機制御で解消し、実装変更は最小化する |
| coverage 数値だけを追ってテスト意図が弱くなる      | 中     | 中       | 分岐ごとに目的を書いたテストへ分解する                    |
| rerun 契約の責務が再び混ざる                       | 高     | 中       | reset と表示判定の責務分離を守る                          |

---

## 8. 参照情報

### 関連ドキュメント

- `/.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `/.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`
- `/.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md`
- `/.claude/skills/aiworkflow-requirements/references/lessons-learned.md`
- `/.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`

### 参考資料

- TASK-UI-09-ONBOARDING-WIZARD の Phase 12 検証結果
- Onboarding Wizard の representative screenshot 証跡

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

`function coverage 76.92%`、`act(...) warning`、rerun 導線の hardening 必要性が Phase 12 で検出された。

### 補足事項

このタスクは UI デザイン変更ではなく、回帰しやすい状態遷移を test/harness で安定化することが主目的である。
