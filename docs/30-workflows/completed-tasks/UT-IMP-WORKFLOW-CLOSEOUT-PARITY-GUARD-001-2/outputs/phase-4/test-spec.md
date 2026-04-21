# Phase 4 テスト仕様書

## 概要

タスク UT-IMP-WORKFLOW-CLOSEOUT-PARITY-GUARD-001 Phase 4 で作成したテストの仕様書。
TDD Red フェーズのため、validate-closeout-parity.js 実装前の状態でテストが FAIL することを確認。

---

## Fixture 一覧（FX-01〜FX-11）

配置先: `.claude/skills/task-specification-creator/scripts/__tests__/fixtures/closeout-parity/`

| Fixture ID | ディレクトリ名      | S1 (index.md)   | S2 (root json)          | S3 (outputs json)               | S4 (phase md) | 期待結果                              |
| ---------- | ------------------- | --------------- | ----------------------- | ------------------------------- | ------------- | ------------------------------------- |
| FX-01      | `normal/`           | completed       | completed               | completed                       | completed     | PARITY_OK / exit 0                    |
| FX-02      | `partial-drift-s1/` | pending         | completed               | completed                       | completed     | PARITY_DRIFT / exit 1                 |
| FX-03      | `partial-drift-s2/` | completed       | pending                 | completed                       | completed     | PARITY_DRIFT / exit 1                 |
| FX-04      | `partial-drift-s3/` | completed       | completed               | pending                         | completed     | PARITY_DRIFT / exit 1                 |
| FX-05      | `partial-drift-s4/` | completed       | completed               | completed                       | pending       | PARITY_DRIFT / exit 1                 |
| FX-06      | `full-drift/`       | pending         | in_progress             | completed                       | blocked       | PARITY_DRIFT / exit 1                 |
| FX-07      | `missing-s2/`       | pending         | （artifacts.json なし） | completed                       | completed     | MISSING_SOURCE / exit 2               |
| FX-08      | `missing-s3/`       | pending         | completed               | （outputs/artifacts.json なし） | completed     | MISSING_SOURCE / exit 2               |
| FX-09      | `invalid-status/`   | completed       | completed               | FOO                             | completed     | INVALID_STATUS_VALUE / exit 3         |
| FX-10      | `empty-workflow/`   | （Phase表なし） | 空 phases               | 空 phases                       | （なし）      | PARITY_OK / exit 0                    |
| FX-11      | `s1-dash-ok/`       | -               | pending                 | pending                         | pending       | PARITY_OK / exit 0（S1のみ `-` 許容） |

### Fixture ファイル構造

各 fixture は以下の構造を持つ（Phase 1 のみ）:

```
{fixture-dir}/
  index.md                  # Phase 表に status 列を持つ
  artifacts.json            # { "phases": { "1": { "status": "..." } } }
  outputs/
    artifacts.json          # 同形式
  phase-1-requirements.md   # frontmatter に | ステータス | ... | 行を持つ
```

---

## TC-P-01〜TC-P-17: validate-closeout-parity.js テスト

テストファイル: `.claude/skills/task-specification-creator/scripts/__tests__/validate-closeout-parity.test.js`

Node.js 組み込みテストランナー（`node:test`）を使用。`validate-closeout-parity.js` を `spawnSync` でブラックボックステスト。

| TC ID   | fixture                  | 引数              | 期待 exit | 期待 stdout                           | 説明                                            |
| ------- | ------------------------ | ----------------- | --------- | ------------------------------------- | ----------------------------------------------- |
| TC-P-01 | FX-01 (normal)           | なし              | 0         | PARITY_OK                             | 正常系：全ソース一致                            |
| TC-P-02 | FX-02 (partial-drift-s1) | なし              | 1         | PARITY_DRIFT                          | S1（index.md）のみ drift                        |
| TC-P-03 | FX-03 (partial-drift-s2) | なし              | 1         | PARITY_DRIFT                          | S2（root json）のみ drift                       |
| TC-P-04 | FX-04 (partial-drift-s3) | なし              | 1         | PARITY_DRIFT                          | S3（outputs json）のみ drift                    |
| TC-P-05 | FX-05 (partial-drift-s4) | なし              | 1         | PARITY_DRIFT                          | S4（phase md）のみ drift                        |
| TC-P-06 | FX-06 (full-drift)       | なし              | 1         | PARITY_DRIFT                          | 全ソース drift                                  |
| TC-P-07 | FX-07 (missing-s2)       | なし              | 2         | MISSING_SOURCE                        | root artifacts.json が存在しない                |
| TC-P-08 | FX-08 (missing-s3)       | なし              | 2         | MISSING_SOURCE                        | outputs/artifacts.json が存在しない             |
| TC-P-09 | FX-09 (invalid-status)   | なし              | 3         | INVALID_STATUS_VALUE                  | 無効なステータス値 FOO                          |
| TC-P-10 | FX-10 (empty-workflow)   | なし              | 0         | PARITY_OK                             | 空ワークフロー（Phase なし）                    |
| TC-P-11 | FX-11 (s1-dash-ok)       | なし              | 0         | PARITY_OK                             | S1 の `-` は pending と同義                     |
| TC-P-12 | FX-02                    | --json なし       | 1         | 人間可読テキスト                      | phase/ソース/期待値/実測値を含む                |
| TC-P-13 | FX-02                    | --json            | 1         | JSON スキーマ一致                     | result/phases/generatedAt/sourcesChecked を含む |
| TC-P-14 | -                        | --workflow 未指定 | 非0       | -                                     | 引数エラー                                      |
| TC-P-15 | FX-01                    | --json            | 0         | sourcesChecked: ["S1","S2","S3","S4"] | 全ソース確認済みリスト                          |
| TC-P-16 | FX-01                    | --json            | 0         | generatedAt: ISO8601                  | タイムスタンプ形式確認                          |
| TC-P-17 | FX-01                    | なし              | 0         | -                                     | fixture ファイルの mtime 不変（read-only）      |

---

## TC-C-01〜TC-C-07: complete-phase.js parity テスト

テストファイル: `.claude/skills/task-specification-creator/scripts/__tests__/complete-phase.parity.test.js`

| TC ID   | 説明                                              | 期待結果                     | 現状                                                         |
| ------- | ------------------------------------------------- | ---------------------------- | ------------------------------------------------------------ |
| TC-C-01 | Phase N 完了後に S1/S2/S3/S4 の status が全て一致 | PASS（root json 更新を確認） | 既存動作で PASS 可能性あり                                   |
| TC-C-02 | S3 書き込み失敗 → ロールバック                    | ロールバック確認             | 既存動作では outputs/artifacts.json を更新しないため条件付き |
| TC-C-03 | 書き込み後 parity 検証 FAIL → ロールバック        | ロールバック確認             | validate-closeout-parity.js 未実装のため FAIL                |
| TC-C-04 | 未知フラグ --skip-parity-check → usage error      | exit 非0                     | 現在は無視されるため FAIL（新機能）                          |
| TC-C-05 | 既存 --workflow/--phase 引数の後方互換性          | exit 0                       | 既存動作で PASS                                              |
| TC-C-06 | S4（phase frontmatter）の ステータス 更新確認     | completed に更新             | 既存動作で未対応のため FAIL 可能性あり                       |
| TC-C-07 | 存在しないphase番号指定 → exit 非0                | exit 非0                     | 既存は warning のみで続行するため FAIL                       |

---

## AC 対応表

| AC ID | 内容                                                                     | 対応 TC                            |
| ----- | ------------------------------------------------------------------------ | ---------------------------------- |
| AC-1  | parity guard が S1/S2/S3 drift を検出して exit 1 を返す                  | TC-P-01, TC-P-02, TC-P-06          |
| AC-2  | JSON / テキスト出力の両方をサポートし、generatedAt/sourcesChecked を含む | TC-P-12, TC-P-13, TC-P-15, TC-P-16 |
| AC-4  | complete-phase.js 完了後にS4（phase md）のステータスが更新される         | TC-C-01, TC-C-06                   |

---

## テスト実行コマンド

```bash
# validate-closeout-parity.js が存在しないことを確認
ls .claude/skills/task-specification-creator/scripts/validate-closeout-parity.js 2>/dev/null || echo "NOT FOUND (expected)"

# TC-P テスト実行（FAILが期待結果）
node --test .claude/skills/task-specification-creator/scripts/__tests__/validate-closeout-parity.test.js 2>&1 | tail -20

# TC-C テスト実行
node --test .claude/skills/task-specification-creator/scripts/__tests__/complete-phase.parity.test.js 2>&1 | tail -20
```
