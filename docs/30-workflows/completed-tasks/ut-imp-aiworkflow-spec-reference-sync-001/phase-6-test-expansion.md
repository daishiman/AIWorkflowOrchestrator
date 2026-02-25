# Phase 6: テスト拡充（検証実行） - タスク仕様書

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 6                                         |
| Phase名    | テスト拡充（検証実行）                    |
| 機能名     | ut-imp-aiworkflow-spec-reference-sync-001 |
| タスクID   | UT-IMP-AIWORKFLOW-SPEC-REFERENCE-SYNC-001 |
| 前提Phase  | Phase 5                                   |
| 後続Phase  | Phase 7                                   |
| ステータス | 未実施                                    |
| 作成日     | 2026-02-25                                |

## 目的

Phase 5 で更新した仕様書に対して、Phase 4 で設計した全検証シナリオ（VS-001〜VS-005）を実行し、仕様書の同期整合が正しく機能することを確認する。追加の検証シナリオとして、baseline/current 分離の動作確認も実施する。

## 背景

本タスクはコード実装を伴わない仕様書修正タスクである。通常の TDD テスト拡充の代わりに、検証スクリプトの実行、手動確認、および追加検証シナリオの実施を行う。

## 実行タスク

### タスク1: verify-unassigned-links.js の実行と結果確認（VS-001 / TC-001）

**目的**: `task-workflow.md` 内の `unassigned-task` 参照が全て実在するファイルを指していることを確認する

**実行手順**:

1. プロジェクトルートで以下のコマンドを実行する:

```bash
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
```

2. 出力を確認する:
   - `ALL_LINKS_EXIST` が出力され、exit code が 0 であること
   - `missing: 0` であること

3. 結果を `outputs/phase-6/coverage-report.md` の TC-001 行に記録する

**期待結果**:

- exit code: 0
- 出力末尾: `[verify-unassigned-links] ALL_LINKS_EXIST`
- missing: 0 件

**失敗時の対応**:

- missing ファイルのパスを特定する
- `task-workflow.md` 内の該当参照を修正するか、参照先ファイルを作成する
- Phase 5 に戻り修正を実施する

---

### タスク2: generate-index.js の実行と topic-map.md 更新確認（VS-002 / TC-002）

**目的**: 索引再生成スクリプトを実行し、`topic-map.md` が最新の状態であることを確認する

**実行手順**:

1. aiworkflow-requirements の索引を再生成する:

```bash
cd .claude/skills/aiworkflow-requirements && node scripts/generate-index.js
```

2. task-specification-creator の索引を再生成する:

```bash
cd .claude/skills/task-specification-creator && node scripts/generate-index.js
```

3. 差分を確認する:

```bash
git diff --stat -- .claude/skills/*/references/topic-map.md
```

4. 結果を `outputs/phase-6/coverage-report.md` の TC-002 行に記録する

**期待結果**:

- `generate-index.js` が正常終了する（exit code 0）
- `git diff --stat` で topic-map.md に差分がない（Phase 5 で既に再生成済みの場合）
- 差分がある場合は、Phase 5 での再生成漏れとして記録し、ここで再生成を確定する

**失敗時の対応**:

- 差分がある場合は `git add` して反映する
- Phase 5 の完了条件に「topic-map.md 再生成」を追加記載する

---

### タスク3: task-workflow.md 参照先実在確認（VS-003 / TC-003）

**目的**: `task-workflow.md` 内のバッククォート囲みファイルパス参照が全て実在することを確認する

**実行手順**:

1. 以下のコマンドで参照パスを抽出し、実在確認する:

```bash
grep -oP '`[^`]+\.md`' .claude/skills/aiworkflow-requirements/references/task-workflow.md | \
  tr -d '`' | while read -r p; do test -f "$p" || echo "MISSING: $p"; done
```

2. `MISSING:` 出力の件数を確認する
3. 結果を `outputs/phase-6/coverage-report.md` の TC-003 行に記録する

**期待結果**:

- `MISSING:` 出力が 0 件

**失敗時の対応**:

- 非実在パスの参照を修正するか、参照先ファイルを作成する
- 相対パスで記載されている場合は絶対パス（プロジェクトルート相対）に変換する

---

### タスク4: SKILL validator 実行結果確認（VS-004 / TC-004）

**目的**: SKILL.md のフォーマットが validator の期待に準拠していることを確認する

**実行手順**:

1. aiworkflow-requirements/SKILL.md の構造を確認する:
   - 変更履歴テーブルが存在するか
   - 本タスクの記録が含まれているか（Phase 12 での記録対象のため、現時点では未記録でも可）

2. task-specification-creator/SKILL.md の構造を確認する:
   - 変更履歴テーブルが存在するか
   - フォーマットが仕様に準拠しているか

3. SKILL validator スクリプトが存在する場合は実行する:

```bash
ls .claude/skills/*/scripts/validate-skill* 2>/dev/null
```

4. 結果を `outputs/phase-6/coverage-report.md` の TC-004 行に記録する

**期待結果**:

- SKILL.md の構造が validator 期待フォーマットに準拠している
- 変更履歴テーブルが存在し、フォーマットが正しい

**失敗時の対応**:

- SKILL.md のフォーマットを修正する
- validator エラーの詳細を記録する

---

### タスク5: 3点同期チェックリスト検証（VS-005 / TC-005）

**目的**: `task-workflow.md` / `SKILL.md` / `LOGS.md` の3点同期チェックリストが検証可能であることを確認する

**実行手順**:

1. 3点同期チェックリストで使用する grep コマンドの動作確認:

```bash
grep -c "UT-IMP-AIWORKFLOW-SPEC-REFERENCE-SYNC-001" \
  .claude/skills/aiworkflow-requirements/references/task-workflow.md \
  .claude/skills/aiworkflow-requirements/SKILL.md \
  .claude/skills/task-specification-creator/SKILL.md \
  .claude/skills/aiworkflow-requirements/LOGS.md \
  .claude/skills/task-specification-creator/LOGS.md
```

2. 現時点での結果を記録する（Phase 12 前のため、一部ファイルは0件で正常）
3. チェックリストの手順が実行可能であることを確認する
4. 結果を `outputs/phase-6/coverage-report.md` の TC-005 行に記録する

**期待結果**:

- grep コマンドが正常実行される（構文エラーなし）
- Phase 5 で追加したルールにより、チェックリストの手順が文書化されている
- 5つのファイルパスが全て実在する

**失敗時の対応**:

- ファイルパスが間違っている場合は Phase 5 のチェックリストを修正する
- grep コマンドが構文エラーになる場合はコマンドを修正する

---

### タスク6: baseline/current 分離動作の追加検証

**目的**: spec-update-workflow.md に追加した baseline/current 分離監査ルールが実用可能であることを確認する

**実行手順**:

1. 現在のブランチで変更されたファイルを特定する:

```bash
git diff --name-only main...HEAD -- .claude/skills/
```

2. 出力されたファイルリストを「current 変更ファイル」として記録する
3. `audit-unassigned-tasks` スクリプトが存在する場合は実行し、FAIL 項目を baseline/current に分類する:

```bash
ls .claude/skills/*/scripts/audit-unassigned-tasks* 2>/dev/null
```

4. 分類結果を以下のフォーマットで記録する:

```
audit-unassigned-tasks: 全体 <PASS/FAIL>（baseline: N件, current: M件）→ current <PASS/FAIL>
```

5. 結果を `outputs/phase-6/integration-test.md` に記録する

**期待結果**:

- baseline/current の分類が実施可能であること
- current 違反が0件であること
- 分類手順が spec-update-workflow.md の記載と一致すること

**失敗時の対応**:

- current 違反がある場合は Phase 5 に戻り該当ファイルを修正する
- 分類手順が不明確な場合は spec-update-workflow.md の記載を修正する

## 参照資料

| 参照資料                      | パス                                                                           | 内容                 |
| ----------------------------- | ------------------------------------------------------------------------------ | -------------------- |
| テスト仕様書（Phase 4成果物） | `outputs/phase-4/test-specification.md`                                        | 検証シナリオ設計     |
| テストケース（Phase 4成果物） | `outputs/phase-4/test-cases.md`                                                | テストケース詳細     |
| 更新済み task-workflow.md     | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`           | Phase 5 更新済み     |
| 更新済み spec-update-workflow | `.claude/skills/task-specification-creator/references/spec-update-workflow.md` | Phase 5 更新済み     |
| 更新済み phase-11-12-guide    | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`    | Phase 5 更新済み     |
| verify-unassigned-links.js    | `.claude/skills/task-specification-creator/scripts/verify-unassigned-links.js` | リンク検証スクリプト |
| generate-index.js（req）      | `.claude/skills/aiworkflow-requirements/scripts/generate-index.js`             | 索引再生成スクリプト |
| generate-index.js（spec）     | `.claude/skills/task-specification-creator/scripts/generate-index.js`          | 索引再生成スクリプト |
| integration-test-design       | `outputs/phase-4/integration-test-design.md`                                   | Phase 4 成果物       |
| baseline-current-template     | `outputs/phase-5/baseline-current-template.md`                                 | Phase 5 成果物       |
| design-deviation-record       | `outputs/phase-5/design-deviation-record.md`                                   | Phase 5 成果物       |
| operation-checklist           | `outputs/phase-5/operation-checklist.md`                                       | Phase 5 成果物       |
| specification-updates         | `outputs/phase-5/specification-updates.md`                                     | Phase 5 成果物       |

## システム仕様（aiworkflow-requirements + task-specification-creator）参照

| 仕様書                  | 参照セクション                             | 参照理由                       |
| ----------------------- | ------------------------------------------ | ------------------------------ |
| task-workflow.md        | 未タスク参照同期ルール（Phase 5追加分）    | 追加ルールの動作検証           |
| spec-update-workflow.md | baseline/current 分離監査（Phase 5追加分） | 分離判定の動作検証             |
| phase-11-12-guide.md    | 3点同期チェックリスト（Phase 5追加分）     | チェックリストの実行可能性検証 |

## 統合テスト連携

| 統合検証項目                  | 検証手段                          | 本Phase で実施  |
| ----------------------------- | --------------------------------- | --------------- |
| リンク検証スクリプト正常動作  | `verify-unassigned-links.js` 実行 | はい（タスク1） |
| 索引再生成スクリプト正常動作  | `generate-index.js` 実行          | はい（タスク2） |
| 参照先ファイル実在確認        | `test -f` + grep でパス抽出       | はい（タスク3） |
| SKILL validator 検証          | validator スクリプト実行          | はい（タスク4） |
| 3点同期 grep コマンド動作確認 | grep コマンド実行                 | はい（タスク5） |
| baseline/current 分離動作確認 | git diff + audit スクリプト       | はい（タスク6） |

## 多角的チェック観点

| 観点               | 確認内容                                                      | 判定基準                   |
| ------------------ | ------------------------------------------------------------- | -------------------------- |
| スクリプト動作     | verify-unassigned-links.js が exit code 0 で完了する          | exit code 0                |
| 索引最新化         | generate-index.js 実行後に topic-map.md 差分なし              | `git diff --stat` 出力が空 |
| 参照実在           | task-workflow.md 内の全参照パスが実在する                     | MISSING 出力 0 件          |
| フォーマット準拠   | SKILL.md が validator 期待フォーマットに準拠                  | validator PASS             |
| 検証手順実行可能性 | 3点同期チェックリストの grep コマンドが構文エラーなく実行可能 | grep 正常終了              |
| 分離判定実用性     | baseline/current 分離が手順書どおりに実施可能                 | 分類結果が記録可能         |

## 成果物

| 成果物                 | パス                                  | 内容                          |
| ---------------------- | ------------------------------------- | ----------------------------- |
| 検証カバレッジレポート | `outputs/phase-6/coverage-report.md`  | TC-001〜TC-005 実行結果       |
| 統合検証結果           | `outputs/phase-6/integration-test.md` | baseline/current 分離検証結果 |

## 完了条件

- [ ] TC-001: `verify-unassigned-links.js` が exit code 0 で `ALL_LINKS_EXIST` を出力した
- [ ] TC-002: `generate-index.js` が正常終了し、topic-map.md が最新化されている
- [ ] TC-003: `task-workflow.md` 内の全参照パスが実在する（MISSING 0 件）
- [ ] TC-004: SKILL.md が validator 期待フォーマットに準拠している
- [ ] TC-005: 3点同期チェックリストの grep コマンドが正常実行できる
- [ ] baseline/current 分離の動作確認結果が `outputs/phase-6/integration-test.md` に記録されている
- [ ] `outputs/phase-6/coverage-report.md` に全テストケースの結果が記録されている

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] `artifacts.json` の Phase 6 ステータスを `completed` に更新

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/completed-tasks/ut-imp-aiworkflow-spec-reference-sync-001/phase-7-coverage-check.md`
