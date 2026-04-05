# Phase 仕様書フォーマットの Task/Step 分離と非 visual evidence ルール追加 - タスク指示書

## メタ情報

```yaml
issue_number: 1919
```

## メタ情報

| 項目         | 内容                                                                     |
| ------------ | ------------------------------------------------------------------------ |
| タスクID     | UT-PHASE-SPEC-FORMAT-IMPROVEMENT-001                                     |
| タスク名     | Phase 仕様書フォーマットの Task/Step 分離と非 visual evidence ルール追加 |
| 分類         | 改善                                                                     |
| 対象機能     | task-specification-creator / Phase 仕様書テンプレート                    |
| 優先度       | 中                                                                       |
| 見積もり規模 | 小規模                                                                   |
| ステータス   | 未実施                                                                   |
| 発見元       | TASK-P0-01 Phase 12 skill-feedback-report                                |
| 発見日       | 2026-04-04                                                               |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-P0-01（verify 実行エンジン Layer 1/2 コア + Layer 3/4 互換の仕様整合）の Phase 12 実施時に、Phase 仕様書のフォーマットに起因する 2 つの問題が顕在化した。

1 つ目は、Phase 12 の仕様書において Task 12-1〜12-5 の「実行タスク」と Step 1-A〜1-G / Step 2 の「検証ログ・成果物の具体的内容」が同一セクション内に混在し、plan（計画）と current fact（実行結果）の境界が不明瞭になった問題である。

2 つ目は、タスク種別が NON_VISUAL（表示層変更なし、バックエンドのみ）であるにもかかわらず、Phase 11 のテンプレートに screenshot-plan.json の生成前提が残っていたことで、不要な成果物が生成され、後続の手動テストで false green（形式的には PASS だが実質的な検証がされていない状態）が発生しやすくなった問題である。

これらは skill-feedback-report の「Phase 仕様書フォーマット」セクションの提案 1・提案 2 として記録されている。

### 1.2 問題点・課題

1. **Task と Step の混在**: `phase-12-documentation.md` では Task 12-1〜12-5 が実行すべきタスクの定義、Step 1-A〜1-G / Step 2 が Task 12-2 内のサブステップとして記述されているが、成果物（`system-spec-update-summary.md` 等）に書くべき判定根拠や実行ログと、仕様書が定義すべき計画が同じ階層に並んでいる。これにより実行者は「今どこまで完了したのか」「この記述は計画なのか結果なのか」を判別しにくい。

2. **NON_VISUAL タスクでの screenshot 前提残存**: Phase 11 のテンプレート（`phase-spec-template.md`）および Phase 仕様書生成ロジックでは、タスク種別に関わらず screenshot-plan.json の生成を前提としたセクションが存在する。NON_VISUAL タスクではスクリーンショットによる証跡が不可能なため、代替証跡（vitest / typecheck / lint の実行結果）を primary evidence とすべきだが、そのルールがテンプレートに明記されていない。

3. **evidence ルールの不在**: Phase 11 の仕様書テンプレートに「表示層変更なしなら screenshot 不要」という明示的なルールがなく、タスク種別判定と evidence 要件の対応関係が曖昧である。

### 1.3 放置した場合の影響

- **false green の発生**: NON_VISUAL タスクで screenshot 前提のテストチェックリストが残ると、「スクリーンショットを撮ったが何も表示変更がない → PASS」という形式的合格が続き、実質的な検証が行われないリスクが高まる。
- **Phase 12 実行時の混乱**: 今後 Phase 12 を実行するたびに plan と current fact の境界を実行者が毎回判断する必要があり、実行時間の増大と品質のばらつきが生じる。
- **テンプレートの信頼性低下**: 「100 人中 100 人が同じ理解で実行できる」というタスク指示書の品質基準を満たせなくなる。
- **不要な成果物の蓄積**: screenshot-plan.json のような不要ファイルがリポジトリに蓄積し、後続タスクのノイズになる。

---

## 2. 何を達成するか（What）

### 2.1 目的

Phase 仕様書テンプレートにおいて、Task（実行すべき作業の定義）と Step（Task 内のサブステップ・検証ログ）を構造的に分離し、plan と current fact の境界を明確にする。同時に、NON_VISUAL タスクにおける evidence ルールをテンプレートに組み込み、タスク種別に応じた適切な証跡収集を強制する。

### 2.2 最終ゴール

1. `phase-spec-template.md` に Task と Step の構造分離ガイドラインが記載されている
2. Phase 11 テンプレートに NON_VISUAL タスク向けの evidence ルール（「表示層変更なしなら screenshot 不要、vitest / typecheck / lint を primary evidence とする」）が明記されている
3. Phase 12 テンプレートに「実行タスク」セクションと「検証ログ」セクションの分離構造が定義されている
4. 新規タスク仕様書生成時に、タスク種別判定（VISUAL / NON_VISUAL）に応じた evidence テンプレートが自動適用される仕組みが存在する

### 2.3 スコープ

#### 含むもの

- `phase-spec-template.md` の構造改善（Task/Step 分離ガイドライン追加）
- Phase 11 テンプレート（手動テスト検証）への NON_VISUAL evidence ルール追記
- Phase 12 テンプレート（ドキュメント更新）への「実行タスク」と「検証ログ」の分離構造定義
- `unassigned-task-template.md` への苦戦箇所記載欄の明確化（既存の「備考」セクション内）
- テンプレート変更に伴う既存 Phase 仕様書への影響調査と記録

#### 含まないもの

- 既存の完了済み Phase 仕様書（TASK-P0-01 等）の遡及修正
- Phase 仕様書生成スクリプト（`detect-unassigned-tasks.js` 等）のロジック変更
- `skill-fixture-runner` のフィクスチャ追加（別タスクとして管理）
- `implementation-guide.md` テンプレートの使用例必須化（skill-feedback-report の別提案）

### 2.4 成果物

| 成果物                          | パス                                                                      |
| ------------------------------- | ------------------------------------------------------------------------- |
| 改修済み phase-spec-template.md | `.claude/skills/task-specification-creator/assets/phase-spec-template.md` |
| NON_VISUAL evidence ルール追記  | Phase 11 テンプレート該当セクション                                       |
| Task/Step 分離構造定義          | Phase 12 テンプレート該当セクション                                       |
| 影響調査レポート                | 本タスクの Phase 12 成果物として出力                                      |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `task-specification-creator` スキルの assets ディレクトリにアクセスできること
- TASK-P0-01 の Phase 12 成果物（特に `skill-feedback-report.md`）を参照できること
- Phase 仕様書テンプレートの Handlebars 構文を理解していること

### 3.2 依存タスク

- なし（本タスクは独立して実行可能）

### 3.3 必要な知識

- Phase 仕様書テンプレート（`phase-spec-template.md`）の Handlebars 構文と構造
- `task-specification-creator` スキルのテンプレート適用フロー
- Phase 11（手動テスト検証）と Phase 12（ドキュメント更新）の役割
- VISUAL / NON_VISUAL タスク種別の判定基準

### 3.4 推奨アプローチ

1. **既存テンプレートの分析**: `phase-spec-template.md` の現行構造を把握し、Task と Step が混在しやすいポイントを特定する
2. **Task/Step 分離ガイドライン設計**: Phase 12 の実例（Task 12-1〜12-5 と Step 1-A〜1-G）をもとに、汎用的な分離ルールを定義する
3. **NON_VISUAL evidence ルール設計**: タスク種別判定と evidence 要件の対応表を作成し、Phase 11 テンプレートに組み込む
4. **テンプレート改修**: 上記 2 点をテンプレートに反映する
5. **影響調査**: 変更が既存の未完了タスク仕様書に与える影響を確認する

---

## 4. 実行手順

### Phase 構成

本タスクは小規模改善のため、3 Phase 構成とする。

| Phase | 名称             | 概要                                            |
| ----- | ---------------- | ----------------------------------------------- |
| 1     | 調査・設計       | 現行テンプレートの分析と改善設計                |
| 2     | テンプレート改修 | phase-spec-template.md と関連テンプレートの修正 |
| 3     | 検証・文書化     | 改修結果の検証とドキュメント更新                |

### Phase 1: 調査・設計

#### 目的

現行の Phase 仕様書テンプレートを分析し、Task/Step 分離ガイドラインと NON_VISUAL evidence ルールの設計を行う。

#### 手順

1. `phase-spec-template.md` を読み込み、現行の Task/Step 記述構造を把握する
2. TASK-P0-01 の `phase-12-documentation.md` を参照し、Task と Step が混在した具体例を抽出する
3. TASK-P0-01 の `phase-11-manual-test.md` を参照し、NON_VISUAL タスクでの evidence 記述の実態を確認する
4. Task/Step 分離ガイドライン案を作成する（「実行タスク」セクションと「検証ログ / 実行記録」セクションの分離方法）
5. NON_VISUAL evidence ルール案を作成する（タスク種別と evidence 要件の対応表）

#### 成果物

- 調査レポート（Task/Step 混在の具体例と改善案）
- NON_VISUAL evidence ルール設計書

#### 完了条件

- 現行テンプレートの問題点が具体例とともに文書化されている
- Task/Step 分離ガイドラインの設計案が策定されている
- NON_VISUAL evidence ルールの設計案が策定されている

### Phase 2: テンプレート改修

#### 目的

Phase 1 の設計に基づき、Phase 仕様書テンプレートを改修する。

#### 手順

1. `phase-spec-template.md` に以下を追加する:
   - Task と Step の構造分離ガイドライン（「実行タスク」と「検証ログ」を別セクションとして定義）
   - Handlebars 条件分岐による VISUAL / NON_VISUAL の切り替え構造
2. Phase 11 テンプレート相当のセクションに以下を追加する:
   - 「タスク種別が NON_VISUAL の場合、screenshot は不要。vitest / typecheck / lint の実行結果を primary evidence とする」旨のルール
   - NON_VISUAL 時の成果物テーブルから screenshot-plan.json を除外する条件分岐
3. Phase 12 テンプレート相当のセクションに以下を追加する:
   - 「実行タスク」セクション（plan: 何をやるべきか）
   - 「検証ログ」セクション（current fact: 何が実際に行われたか）
   - 両セクションの記述ルール（plan には未来形・命令形、current fact には過去形・完了形を使用する等）
4. 改修したテンプレートの Handlebars 構文が正しいことを確認する

#### 成果物

- 改修済み `phase-spec-template.md`
- 改修差分の記録

#### 完了条件

- Task/Step 分離ガイドラインがテンプレートに反映されている
- NON_VISUAL evidence ルールがテンプレートに反映されている
- Handlebars 構文エラーがない

### Phase 3: 検証・文書化

#### 目的

改修したテンプレートの妥当性を検証し、ドキュメントを更新する。

#### 手順

1. 改修済みテンプレートを用いて、TASK-P0-01 の Phase 12 相当の仕様書を仮生成し、Task/Step が分離されていることを確認する
2. NON_VISUAL タスクの Phase 11 仕様書を仮生成し、screenshot 関連のセクションが除外されていることを確認する
3. 既存の未完了タスク仕様書への影響を調査し、影響がある場合はその内容を記録する
4. 変更履歴をドキュメント更新履歴に記録する

#### 成果物

- 検証結果レポート
- 影響調査レポート
- ドキュメント更新履歴

#### 完了条件

- テンプレート仮生成で Task/Step 分離が確認できている
- NON_VISUAL evidence ルールの適用が確認できている
- 影響調査が完了している

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `phase-spec-template.md` に Task/Step 分離ガイドラインが追加されている
- [ ] Phase 11 テンプレート相当のセクションに「NON_VISUAL の場合 screenshot 不要、vitest / typecheck / lint を primary evidence とする」ルールが明記されている
- [ ] Phase 12 テンプレート相当のセクションに「実行タスク」と「検証ログ」の分離構造が定義されている
- [ ] Handlebars 条件分岐による VISUAL / NON_VISUAL の切り替えが正しく動作する

### 品質要件

- [ ] テンプレートの Handlebars 構文にエラーがない
- [ ] 改修済みテンプレートで仮生成した仕様書が既存フォーマットと互換性を保っている
- [ ] 100 人中 100 人が同じ理解で Task と Step を区別できる記述粒度になっている

### ドキュメント要件

- [ ] 改修内容がドキュメント更新履歴に記録されている
- [ ] 影響調査レポートが作成されている
- [ ] 本タスク指示書の備考に苦戦箇所が記録されている

---

## 6. 検証方法

### テストケース

| TC    | 検証内容                                       | 期待結果                                          |
| ----- | ---------------------------------------------- | ------------------------------------------------- |
| TC-01 | 改修済みテンプレートで Phase 12 仕様書を仮生成 | 「実行タスク」と「検証ログ」が別セクションに分離  |
| TC-02 | NON_VISUAL タスクで Phase 11 仕様書を仮生成    | screenshot-plan.json が成果物テーブルに含まれない |
| TC-03 | VISUAL タスクで Phase 11 仕様書を仮生成        | screenshot-plan.json が成果物テーブルに含まれる   |
| TC-04 | Task/Step 分離ガイドラインの可読性確認         | plan と current fact の境界が一読で判別できる     |
| TC-05 | Handlebars 構文の妥当性確認                    | テンプレートエンジンでエラーが発生しない          |

### 検証手順

1. TC-01〜TC-03: 改修済みテンプレートに対してサンプルデータを流し込み、生成された仕様書の構造を目視確認する
2. TC-04: 第三者（または別セッションの AI）に生成済み仕様書を読ませ、Task と Step の区別が明確かを確認する
3. TC-05: Handlebars テンプレートエンジンでパースエラーが出ないことを確認する

---

## 7. リスクと対策

| リスク                                                    | 影響度 | 発生確率 | 対策                                                                                    |
| --------------------------------------------------------- | ------ | -------- | --------------------------------------------------------------------------------------- |
| テンプレート改修による既存仕様書との非互換                | 中     | 低       | 既存仕様書は遡及修正しない方針とし、影響調査で問題がないことを確認                      |
| NON_VISUAL 判定が曖昧なタスクでの evidence ルール適用漏れ | 中     | 中       | タスク種別判定の基準を明文化し、判断に迷う場合のフォールバック（VISUAL 扱い）を定義する |
| Handlebars 条件分岐の複雑化によるテンプレート保守性低下   | 低     | 中       | 条件分岐は最小限に留め、コメントで判断基準を明記する                                    |
| Plan と current fact の記述ルールが形骸化する             | 中     | 中       | validator スクリプトで未来形/過去形の混在を検出する仕組みを推奨する                     |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/task-specification-creator/assets/phase-spec-template.md` — Phase 仕様書テンプレート（改修対象）
- `.claude/skills/task-specification-creator/assets/unassigned-task-template.md` — 未タスク指示書テンプレート
- `docs/30-workflows/step-09-par-task-p0-01-verify-execution-engine-layer12/phase-12-documentation.md` — Task/Step 混在の実例
- `docs/30-workflows/step-09-par-task-p0-01-verify-execution-engine-layer12/phase-11-manual-test.md` — NON_VISUAL evidence 運用の実例
- `docs/30-workflows/step-09-par-task-p0-01-verify-execution-engine-layer12/outputs/phase-12/skill-feedback-report.md` — 発見元のフィードバックレポート
- `docs/30-workflows/step-09-par-task-p0-01-verify-execution-engine-layer12/outputs/phase-11/screenshot-plan.json` — NON_VISUAL タスクで生成された不要成果物の実例

### 参考資料

- TASK-P0-01 Phase 12 skill-feedback-report「Phase 仕様書フォーマット」セクション提案 1・提案 2

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
### 提案1: Task 12-1〜12-5 と Step 1-A〜1-G / Step 2 を別枠で書く

仕様書本文と成果物本文が混ざると、どこまでが plan でどこからが current fact かが見えにくくなる。

改善案:
- `phase-12-documentation.md` に「実行タスク」と「検証ログ」を分ける
- `system-spec-update-summary.md` に `Step 1-A〜1-G` と `Step 2` の判定根拠を別テーブルで残す
- `phase12-task-spec-compliance-check.md` に root parity / artifacts 同期 / validator 結果を 1 つの表で集約する

### 提案2: 非 visual task の evidence ルールを一文で固定する

NON_VISUAL なのに screenshot 前提を残すと、後続の manual test が false green になりやすい。

改善案:
- Phase 11 の説明文に「表示層変更なしなら screenshot 不要」を明記する
- 代替証跡として `vitest` / `typecheck` / `lint` を primary evidence にする
```

### 苦戦箇所

TASK-P0-01 Phase 12 の実施において、以下の点で苦戦が発生した:

1. **Task と Step の境界の曖昧さ**: Phase 12 の仕様書では Task 12-1〜12-5 が最上位の実行タスクとして定義され、その中で Step 1-A〜1-G / Step 2 が Task 12-2 のサブステップとして記述されていた。しかし成果物（`system-spec-update-summary.md`）に書くべき判定根拠が仕様書本文に混入し、「どこまで実行したか」「この記述は計画なのか結果なのか」の判別に時間を要した。plan と current fact が同じ文書内で混在する構造が根本原因である。

2. **NON_VISUAL タスクでの screenshot-plan.json 生成**: タスク種別判定で NON_VISUAL と判定されているにもかかわらず、Phase 11 のテンプレートに screenshot 前提のセクションが残っていたため、`outputs/phase-11/screenshot-plan.json` が生成された。このファイルは実質的に空（または形式的な内容のみ）であり、後続の手動テスト検証で false green のリスクを高める無駄な成果物となった。

### 補足事項

- 本タスクは TASK-P0-01 の Phase 12 完了後に発見されたプロセス改善であり、機能実装ではなくテンプレート・ワークフローの改善である
- 改修対象は `task-specification-creator` スキルの assets 配下のテンプレートファイルが中心
- 既存の完了済み仕様書への遡及修正は本タスクのスコープ外とする
