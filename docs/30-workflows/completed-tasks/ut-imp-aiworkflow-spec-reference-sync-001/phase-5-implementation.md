# Phase 5: 実装（仕様書更新・運用手順書・チェックリスト整備） - タスク仕様書

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 5                                         |
| Phase名    | 実装（仕様書更新・運用手順書整備）        |
| 機能名     | ut-imp-aiworkflow-spec-reference-sync-001 |
| タスクID   | UT-IMP-AIWORKFLOW-SPEC-REFERENCE-SYNC-001 |
| 前提Phase  | Phase 4                                   |
| 後続Phase  | Phase 6                                   |
| ステータス | 未実施                                    |
| 作成日     | 2026-02-25                                |

## 目的

Phase 12 の仕様書更新プロセスで発生する同期漏れを防止するため、task-workflow.md / phase-11-12-guide.md / spec-update-workflow.md を更新し、3点同期チェックリスト・baseline/current 分離手順・検証コマンド実行手順・運用チェックリストを整備する。

## 背景

本タスクは仕様書修正のみタスクであり、`apps/` や `packages/` 配下のコード変更はない。Phase 5 の「実装」を「仕様書の更新・運用手順書の整備・チェックリストの作成」と読み替えて実行する。

## 更新対象ファイル

| ファイル                | パス                                                                           | 更新内容                                        |
| ----------------------- | ------------------------------------------------------------------------------ | ----------------------------------------------- |
| task-workflow.md        | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`           | 未タスク参照同期ルールセクション追加            |
| phase-11-12-guide.md    | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`    | 3点同期チェックリスト・baseline/current分離追加 |
| spec-update-workflow.md | `.claude/skills/task-specification-creator/references/spec-update-workflow.md` | 検証コマンド順次実行手順追加                    |

## 実行タスク

### タスク1: task-workflow.md 更新

**目的**: 未タスク参照同期ルールの強化セクションを追加する

**更新対象ファイル**: `.claude/skills/aiworkflow-requirements/references/task-workflow.md`

**実行手順**:

1. task-workflow.md の残課題テーブルセクション付近に「未タスク参照同期ルール」セクションを追加する
2. 以下の同期ルールを明文化する:
   - 未タスク完了時に残課題テーブルから該当行を削除（またはステータスを「完了」に更新）する
   - 完了したタスクは「完了タスクセクション」に移動する
   - `unassigned-task/` ディレクトリ内のファイルと残課題テーブルの行が 1:1 対応していることを確認する
   - 関連仕様書内の未タスク参照リンクが「完了タスク」セクションに移動されることを確認する
3. 検証コマンド `verify-unassigned-links.js` の実行手順を記載する
4. 更新トリガー（Phase 12 Task 4 完了時、未タスク指示書新規作成時、完了移管時）を記載する

**追加内容（概要）**:

````markdown
### 未タスク参照同期ルール

#### 参照整合チェック

残課題テーブル内の `unassigned-task/` 参照パスは、以下の条件を全て満たすこと:

1. 参照先ファイル（`docs/30-workflows/unassigned-task/<task-name>.md`）が実在する
2. 完了済みタスクの参照は残課題テーブルから削除し、`completed-tasks/` セクションに移動する
3. 参照パスの表記は `docs/30-workflows/unassigned-task/` をプレフィックスとする（相対パス不可）

#### 検証コマンド

```bash
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
```

出力が `ALL_LINKS_EXIST` であること。missing が1件以上ある場合は参照を修正する。

#### 更新トリガー

以下のイベントで参照整合チェックを実行すること:

- Phase 12 Task 4（未タスク検出）完了時
- 未タスク指示書の新規作成時
- 未タスク指示書の完了移管（`unassigned-task/` → `completed-tasks/`）時
````

**完了判定**:

- 同期ルールがチェックリスト形式で記載されている
- 各ルールに「何を」「どのファイルで」「どう確認するか」の3要素が含まれている
- 曖昧表現（禁止語一覧は `.claude/rules/02-code-quality.md` 参照）が含まれていない
- 既存の残課題テーブル構造が変更されていない

---

### タスク2: phase-11-12-guide.md 更新

**目的**: 3点同期チェックリストと baseline/current 分離手順を追加する

**更新対象ファイル**: `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`

**実行手順**:

1. Phase 12 の Task 2（システム仕様書更新）セクションに「3点同期チェックリスト」を追加する
2. チェックリストは以下の5ファイルの更新を個別チェックボックスで管理する:
   - [ ] `task-workflow.md` の残課題テーブル・完了タスクセクション更新
   - [ ] `aiworkflow-requirements/SKILL.md` の変更履歴テーブル更新
   - [ ] `task-specification-creator/SKILL.md` の変更履歴テーブル更新
   - [ ] `aiworkflow-requirements/LOGS.md` にタスク完了エントリ追加
   - [ ] `task-specification-creator/LOGS.md` にタスク完了記録追加
3. 同期検証コマンドを記載する:
   ```bash
   grep -c "<TASK_ID>" \
     .claude/skills/aiworkflow-requirements/references/task-workflow.md \
     .claude/skills/aiworkflow-requirements/SKILL.md \
     .claude/skills/task-specification-creator/SKILL.md \
     .claude/skills/aiworkflow-requirements/LOGS.md \
     .claude/skills/task-specification-creator/LOGS.md
   ```
   全5ファイルで1件以上のマッチがあること。0件のファイルがある場合は更新漏れ。
4. LOGS.md 更新タイミングルール（P43教訓適用）を追加する:
   - 禁止: LOGS.md に「完了」を先に記録してから他ファイルを更新する
   - 推奨: task-workflow.md -> SKILL.md x2 -> その他仕様書 -> topic-map.md再生成 -> 最後にLOGS.md x2
5. baseline/current 分離手順セクションを追加する:
   - baseline: 監査スクリプト実行時に検出された既存の問題。今回のスコープ外として記録する
   - current: 今回の変更で新たに生じた問題。今回のタスクで修正必須とする
   - 分離手順: `git diff --name-only main...HEAD` で今回の変更ファイルリストを取得し、監査出力と突合する
6. baseline/current 分離記録テンプレートを追加する

**baseline/current 分離記録テンプレート**:

```markdown
### 監査結果分類

#### baseline（既存課題・スコープ外）

| 検出内容       | 該当ファイル | 対応方針                 |
| -------------- | ------------ | ------------------------ |
| （例）参照切れ | xxx.md       | 既存課題として未タスク化 |

#### current（今回修正必須）

| 検出内容         | 該当ファイル | 修正内容       | 修正完了 |
| ---------------- | ------------ | -------------- | -------- |
| （例）リンク切れ | yyy.md       | リンク先を修正 | [ ]      |

#### 最終判定

audit-unassigned-tasks: 全体 <PASS/FAIL>（baseline: N件, current: M件）→ current <PASS/FAIL>
```

**完了判定**:

- 3点同期チェックリストが5項目全て記載されている
- LOGS.md 更新タイミングルールが記載されている
- baseline/current 分離手順が記載されている
- 分離記録テンプレートが記載されている
- 関連する落とし穴（P1, P25, P29, P43）への参照が含まれている
- 既存の Phase 12 セクション構造が破壊されていない

---

### タスク3: spec-update-workflow.md 更新

**目的**: 検証コマンド実行手順（リンク検証 -> 索引再生成 -> SKILL検証）を追加する

**更新対象ファイル**: `.claude/skills/task-specification-creator/references/spec-update-workflow.md`

**実行手順**:

1. Step 1-D（topic-map.md 再生成）の後に「Step 1-E: 検証コマンド順次実行」セクションを追加する
2. 以下の3つの検証コマンドを実行順序付きで記載する:

```markdown
### Step 1-E: 検証コマンド順次実行

#### 1. リンク検証

node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js

- 正常時: ALL_LINKS_EXIST が出力され、exit code 0
- 異常時: missing ファイルパスが列挙され、exit code 非0 → 該当参照を修正してから再実行

#### 2. 索引再生成

cd .claude/skills/aiworkflow-requirements && node scripts/generate-index.js
cd .claude/skills/task-specification-creator && node scripts/generate-index.js
git diff --stat -- .claude/skills/\*/references/topic-map.md

- 正常時: exit code 0、topic-map.md に差分なし（Step 1-D で再生成済みの場合）
- 異常時: 差分がある場合は Step 1-D の再生成漏れ → git add して反映

#### 3. SKILL 検証

各 SKILL.md の validator セクションに従い有効判定を確認する。

- 正常時: 対象スキルが有効判定（PASS）
- 異常時: フォーマット不備 → SKILL.md を修正してから再実行
```

3. baseline/current 分離監査セクションを追加する:

```markdown
### baseline / current 分離監査

#### 用語定義

| 用語     | 定義                                                   |
| -------- | ------------------------------------------------------ |
| baseline | 今回のタスク着手前から存在していた監査違反（既存違反） |
| current  | 今回のタスクで新たに発生した監査違反（今回差分起因）   |

#### 判定フロー

1. 監査スクリプトを実行し、全体結果を記録する
2. FAIL の場合、各違反項目について以下を判定する:
   - git diff main...HEAD -- <path> で該当ファイルが今回変更されたか確認する
   - 変更されていない場合: baseline 違反（今回のタスクでは対処不要）
   - 変更された場合: current 違反（今回のタスクで修正が必要）
3. current 違反が0件の場合、全体判定は PASS とする
4. current 違反が1件以上の場合、該当ファイルを修正してから再判定する
```

4. 異常時の対応手順（差し戻し判定）を記載する

**完了判定**:

- 3つの検証コマンドが実行順序付きで記載されている
- 各コマンドの正常時・異常時の出力が明記されている
- 異常時の対応手順が記載されている
- baseline/current 分離監査セクションが追加されている
- 既存の判断フローチャートが変更されていない

---

### タスク4: 運用チェックリスト作成

**目的**: Phase 12 実行時の同期確認チェックリストを成果物として作成する

**成果物ファイル**: `outputs/phase-5/operation-checklist.md`

**実行手順**:

1. Phase 12 実行時に使用する統合チェックリストを作成する
2. チェックリストは以下の6ステップ構成とする:

```markdown
# Phase 12 同期確認チェックリスト

## Step 1: 仕様書更新前の準備

- [ ] 更新対象ファイルのリストを作成する
- [ ] baseline 監査を実行し、既存の問題を記録する

## Step 2: 仕様書更新（3点同期）

- [ ] task-workflow.md の残課題テーブルを更新する
- [ ] task-workflow.md の完了タスクセクションを更新する
- [ ] aiworkflow-requirements/SKILL.md の変更履歴テーブルを更新する
- [ ] task-specification-creator/SKILL.md の変更履歴テーブルを更新する
- [ ] aiworkflow-requirements/LOGS.md にタスク完了エントリを追加する
- [ ] task-specification-creator/LOGS.md にタスク完了記録を追加する

## Step 3: 索引再生成

- [ ] aiworkflow-requirements の generate-index.js を実行する
- [ ] task-specification-creator の generate-index.js を実行する
- [ ] topic-map.md が最新であることを確認する（git diff で差分なし）

## Step 4: 検証コマンド実行

- [ ] verify-unassigned-links.js を実行し、参照切れ 0 件（ALL_LINKS_EXIST）を確認する
- [ ] SKILL validator を実行し、有効判定（PASS）を確認する

## Step 5: baseline/current 分離判定

- [ ] baseline 違反を「既存課題」として記録する
- [ ] current 違反を「修正必須」として記録する
- [ ] current 違反が 0 件であることを確認する（0 件でない場合は修正する）

## Step 6: 最終確認

- [ ] 3点同期（task-workflow.md / SKILL.md / LOGS.md）が一致していることを grep で確認する
- [ ] 苦戦箇所が検出された場合、未タスク指示書への転記を完了する（P3準拠3ステップ: 1. unassigned-task/に指示書作成2. 残課題テーブル登録3. 関連仕様書リンク追加）
- [ ] 苦戦箇所が0件の場合、「苦戦箇所なし」と明記する
```

**完了判定**:

- チェックリストが6ステップ構成で作成されている
- 各ステップのチェック項目に曖昧表現が含まれていない
- 苦戦箇所の転記手順が P3 準拠3ステップで記載されている

---

### タスク5: baseline/current 分離記録テンプレート作成

**目的**: 監査結果の baseline/current 分類を記録するテンプレートを作成する

**成果物ファイル**: `outputs/phase-5/baseline-current-template.md`

**実行手順**:

1. baseline（既存課題）と current（今回修正必須）を分離して記録するテンプレートを作成する
2. テンプレートには以下の要素を含める:
   - タスクID・実行日
   - 監査スクリプト実行コマンドと出力
   - 変更ファイルリスト取得コマンド（`git diff --name-only main...HEAD -- .claude/skills/`）
   - baseline/current の分類テーブル
   - current 違反の修正記録
   - 最終判定（current 違反 0 件の確認）

**完了判定**:

- テンプレートに baseline と current の分離テーブルが含まれている
- 分離判定に使用する git diff コマンドが記載されている
- current 違反の修正記録欄が含まれている
- 最終判定の記録欄が含まれている

---

### タスク6: 設計変更記録

**目的**: Phase 2 の設計から乖離した箇所を記録する

**成果物ファイル**: `outputs/phase-5/design-deviation-record.md`

**実行手順**:

1. Phase 2（設計）で定義した内容と、Phase 5（実装）で実際に行った変更を比較する
2. 設計から乖離した箇所があればその理由を記録する
3. 乖離がない場合は「設計からの乖離なし」と明記する

**完了判定**:

- Phase 2 設計と Phase 5 実装の比較結果が記録されている
- 乖離がある場合は理由が記録されている

---

### タスク7: topic-map.md 再生成

**目的**: 更新した仕様書の索引を再生成する

**実行手順**:

1. `cd .claude/skills/aiworkflow-requirements && node scripts/generate-index.js` を実行する
2. `cd .claude/skills/task-specification-creator && node scripts/generate-index.js` を実行する
3. `git diff --stat -- .claude/skills/*/references/topic-map.md` で差分を確認する
4. topic-map.md が再生成されたことを確認する

**完了判定**:

- generate-index.js が正常終了する（exit code 0）
- topic-map.md が最新の状態になっている

## 参照資料

| 参照資料                        | パス                                                                           | 内容                                |
| ------------------------------- | ------------------------------------------------------------------------------ | ----------------------------------- |
| 要件定義（Phase 1成果物）       | `outputs/phase-1/requirements-definition.md`                                   | 機能要件・非機能要件                |
| 設計書（Phase 2成果物）         | `outputs/phase-2/architecture-design.md`                                       | 同期ルール・チェックリスト設計      |
| 設計レビュー（Phase 3成果物）   | `outputs/phase-3/design-review-result.md`                                      | 設計妥当性検証結果                  |
| テスト仕様（Phase 4成果物）     | `outputs/phase-4/test-specification.md`                                        | 検証シナリオ・テストケース          |
| テストケース（Phase 4成果物）   | `outputs/phase-4/test-cases.md`                                                | テストケース詳細                    |
| 統合テスト設計（Phase 4成果物） | `outputs/phase-4/integration-test-design.md`                                   | 統合検証シナリオ                    |
| task-workflow.md                | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`           | 更新対象仕様書（未タスク管理）      |
| spec-update-workflow.md         | `.claude/skills/task-specification-creator/references/spec-update-workflow.md` | 更新対象仕様書（仕様更新手順）      |
| phase-11-12-guide.md            | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`    | 更新対象仕様書（Phase 11/12ガイド） |
| lessons-learned.md              | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`         | 過去の教訓（P1, P25, P29, P43）     |
| verify-unassigned-links.js      | `.claude/skills/task-specification-creator/scripts/verify-unassigned-links.js` | リンク検証スクリプト                |
| generate-index.js（req）        | `.claude/skills/aiworkflow-requirements/scripts/generate-index.js`             | 索引再生成スクリプト                |
| generate-index.js（spec）       | `.claude/skills/task-specification-creator/scripts/generate-index.js`          | 索引再生成スクリプト                |

## システム仕様（aiworkflow-requirements + task-specification-creator）参照

| 仕様書                  | 参照セクション                       | 参照理由                      |
| ----------------------- | ------------------------------------ | ----------------------------- |
| task-workflow.md        | 残課題テーブル、完了タスクセクション | 更新対象                      |
| spec-update-workflow.md | Step 1-A 〜 Step 1-D                 | 検証コマンド手順の追加先      |
| phase-11-12-guide.md    | Phase 12 Task 2                      | 3点同期チェックリストの追加先 |
| lessons-learned.md      | P1, P25, P29, P43                    | 過去の落とし穴の再発防止確認  |

## 実行手順

### ステップ 1: 更新対象ファイルの確認

1. task-workflow.md の現在の構造を確認する
2. phase-11-12-guide.md の現在の構造を確認する
3. spec-update-workflow.md の現在の構造を確認する
4. 各ファイルの更新箇所を特定する

### ステップ 2: 仕様書更新（タスク1 〜 タスク3）

1. task-workflow.md に未タスク参照同期ルールセクションを追加する（タスク1）
2. phase-11-12-guide.md に3点同期チェックリスト・LOGS.md更新タイミングルール・baseline/current 分離手順を追加する（タスク2）
3. spec-update-workflow.md に検証コマンド順次実行手順・baseline/current分離監査セクションを追加する（タスク3）

### ステップ 3: 成果物作成（タスク4 〜 タスク6）

1. 運用チェックリストを作成する（タスク4）
2. baseline/current 分離記録テンプレートを作成する（タスク5）
3. 設計変更記録を作成する（タスク6）

### ステップ 4: 索引再生成（タスク7）

1. aiworkflow-requirements の generate-index.js を実行する
2. task-specification-creator の generate-index.js を実行する
3. topic-map.md が再生成されたことを確認する

### ステップ 5: セルフレビュー

1. 更新した3ファイル（task-workflow.md, phase-11-12-guide.md, spec-update-workflow.md）に曖昧表現が含まれていないことを確認する
2. チェックリスト項目が「何を」「どのファイルで」「どう確認するか」の3要素を含んでいることを確認する
3. 既存のチェックリスト項目・セクション構造が破壊されていないことを確認する
4. Phase 4 のテストケース（TC-001 〜 TC-006, IT-001）で検証可能であることを確認する

## 統合テスト連携

更新した仕様書が既存の検証スクリプトで検証可能であることを Phase 6 で確認する:

| 統合検証項目                    | 検証手段                          | Phase 6 で実施 |
| ------------------------------- | --------------------------------- | -------------- |
| task-workflow.md の参照先実在   | `test -f <path>` 全件確認         | はい           |
| topic-map.md の索引同期         | `generate-index.js` 実行後の diff | はい           |
| 3点同期のタスクID突合           | grep コマンドによる検索           | はい           |
| verify-unassigned-links.js 正常 | スクリプト実行                    | はい           |
| baseline/current 分離動作確認   | git diff + 監査出力の突合         | はい           |

## 多角的チェック観点

| 観点       | 確認内容                                                        | 判定基準                            |
| ---------- | --------------------------------------------------------------- | ----------------------------------- |
| 完全性     | 3つの仕様書ファイルが全て更新されている                         | 3/3 ファイル更新済み                |
| 一貫性     | 3点同期チェックリストの項目が task-workflow.md の構造と一致する | 項目と構造の対応が確認できる        |
| 明確性     | チェックリスト項目に曖昧表現が含まれていない                    | grep で曖昧表現が 0 件              |
| 実行可能性 | 検証コマンドの手順がコピー&ペーストで実行可能                   | 全コマンド実行可能                  |
| 後方互換性 | 既存のチェックリスト項目・セクション構造が破壊されていない      | 既存項目の削除・変更がない          |
| 設計準拠   | Phase 2 の設計に沿った実装であること（乖離があれば記録）        | 設計変更記録が作成されている        |
| 教訓反映   | P1, P25, P29, P43 の教訓が追加ルールに反映されている            | 4件の教訓全てが対応するルールを持つ |

## 成果物

| 成果物                           | パス                                                                           | 内容                            |
| -------------------------------- | ------------------------------------------------------------------------------ | ------------------------------- |
| 更新済み task-workflow.md        | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`           | 未タスク参照同期ルール追加      |
| 更新済み phase-11-12-guide.md    | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`    | 3点同期チェックリスト追加       |
| 更新済み spec-update-workflow.md | `.claude/skills/task-specification-creator/references/spec-update-workflow.md` | 検証コマンド実行手順追加        |
| 運用チェックリスト               | `outputs/phase-5/operation-checklist.md`                                       | Phase 12 同期確認チェックリスト |
| baseline/current テンプレート    | `outputs/phase-5/baseline-current-template.md`                                 | 監査結果分離記録テンプレート    |
| 設計変更記録                     | `outputs/phase-5/design-deviation-record.md`                                   | Phase 2 設計との乖離記録        |

## 完了条件

- [ ] task-workflow.md に「未タスク参照同期ルール」セクションが追加されている
- [ ] task-workflow.md の追加セクションに検証コマンドと更新トリガーが明記されている
- [ ] phase-11-12-guide.md に「3点同期チェックリスト」（5項目）が追加されている
- [ ] phase-11-12-guide.md に「LOGS.md 更新タイミングルール」が追加されている
- [ ] phase-11-12-guide.md に baseline/current 分離手順と記録テンプレートが追加されている
- [ ] spec-update-workflow.md に「Step 1-E: 検証コマンド順次実行」が追加されている（3コマンド）
- [ ] spec-update-workflow.md に「baseline / current 分離監査」セクションが追加されている
- [ ] 各検証コマンドの正常時・異常時の出力が明記されている
- [ ] 運用チェックリスト（6ステップ構成）が `outputs/phase-5/operation-checklist.md` に作成されている
- [ ] baseline/current 分離記録テンプレートが `outputs/phase-5/baseline-current-template.md` に作成されている
- [ ] 設計変更記録が `outputs/phase-5/design-deviation-record.md` に作成されている
- [ ] チェックリスト全項目に曖昧表現（禁止語一覧は `.claude/rules/02-code-quality.md` 参照）が含まれていない
- [ ] topic-map.md が再生成されている（generate-index.js 実行済み）
- [ ] 既存のチェックリスト項目・セクション構造が破壊されていない（後方互換性確認済み）

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（タスク1 〜 タスク7）を100%実行完了
- [ ] 各タスクの完了を明記
- [ ] 成果物6件が全て生成されていることを確認
- [ ] `artifacts.json` の Phase 5 ステータスを `completed` に更新

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/completed-tasks/ut-imp-aiworkflow-spec-reference-sync-001/phase-6-test-expansion.md`
