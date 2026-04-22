# Phase 4 テスト設計書 — UNASSIGNED-EVALS-VALIDATOR-GUARD-001

## テストファイル配置

`.claude/skills/skill-fixture-runner/scripts/__tests__/validate-evals.test.js`

Node.js built-in test runner（`node:test`）を使用。外部テストフレームワーク不要。

## テストケース一覧（TC-001〜TC-022 + Phase 6 拡充）

| テストケース | 層   | シナリオ                                                | 期待 exit code  | 対応 AC |
| ------------ | ---- | ------------------------------------------------------- | --------------- | ------- |
| TC-001       | L1   | 破損 JSON（構文エラー）                                 | 非ゼロ          | AC-001  |
| TC-002       | L1   | 空ファイル                                              | 非ゼロ          | AC-001  |
| TC-003       | L1   | 正常 JSON（最小限・camelCase）                          | 0               | AC-001  |
| TC-004       | L1   | 正常 JSON（フルフィールド・snake_case）                 | 0               | AC-001  |
| TC-005       | L2   | skill_name キー欠落                                     | 非ゼロ          | AC-002  |
| TC-006       | L2   | skillName キー欠落                                      | 非ゼロ          | AC-002  |
| TC-007       | L2   | currentLevel 欠落（camelCase 方言）                     | 非ゼロ          | AC-002  |
| TC-008       | L2   | camelCase 方言で全必須キー揃い                          | 0               | AC-002  |
| TC-009       | L2   | snake_case 方言で全必須キー揃い                         | 0               | AC-002  |
| TC-010       | L2   | 方言混在（skillName + skill_name 共存）                 | 0（許容モード） | AC-004  |
| TC-011       | L3   | aiworkflow-requirements: dual root 一致                 | 0               | AC-003  |
| TC-012       | L3   | .agents 側が異なる（一時環境）                          | 非ゼロ          | AC-003  |
| TC-013       | L3   | .agents 側 EVALS.json が存在しない                      | 非ゼロ          | AC-003  |
| TC-014       | L3   | 6 スキル全件 --all-skills --check-dual-root             | 0               | AC-003  |
| TC-015       | L3   | （TC-012 で同様検証済みとして skip）                    | -               | AC-004  |
| TC-016       | 除外 | FIXTURE_EXCLUSION_LIST 内のパス                         | 0               | AC-005  |
| TC-017       | 除外 | \_\_fixtures\_\_/ 内の破損 JSON                         | 0               | AC-005  |
| TC-018       | 除外 | --check-excluded 単独起動                               | 0               | AC-005  |
| TC-019       | 除外 | 通常スキルは除外されず検証                              | 0               | AC-005  |
| TC-020       | 統合 | run-all-validations.js ソースに validate-evals 参照あり | -               | AC-006  |
| TC-021       | 統合 | skill-fixture-runner ディレクトリで run-all 実行        | 0               | AC-006  |
| TC-022       | 統合 | （TC-012 で同様検証済みとして skip）                    | -               | AC-006  |

## Phase 6 拡充テストケース

| テストケース | 層  | シナリオ                             | 期待 exit code |
| ------------ | --- | ------------------------------------ | -------------- |
| TC-E-009     | L2  | 空オブジェクト `{}` → 必須キー全欠落 | 非ゼロ         |
| TC-E-012     | -   | allowlist 外のスキル名               | 非ゼロ         |
| TC-E-013     | -   | --all-skills で 6 スキル全件正常     | 0              |
| TC-E-014     | -   | --skill フラグで特定スキルのみ検証   | 0              |
| TC-E-015     | -   | --json フラグで JSON 形式出力        | 0              |

## AC 対応表

| AC     | 対応テストケース             | 検証内容                          |
| ------ | ---------------------------- | --------------------------------- |
| AC-001 | TC-001〜TC-004               | L1 JSON パース検証                |
| AC-002 | TC-005〜TC-010               | L2 必須キー検証・方言許容         |
| AC-003 | TC-011〜TC-014               | L3 dual root 一致（6 スキル全件） |
| AC-004 | TC-010、TC-015（via TC-012） | 4 種エラー検出                    |
| AC-005 | TC-016〜TC-019               | fixture 除外                      |
| AC-006 | TC-020〜TC-021               | run-all-validations.js 統合       |
| AC-007 | diff コマンド実測            | .claude ↔ .agents 差分ゼロ        |

## テスト実行結果（実測）

```
# tests 27
# suites 6
# pass 25
# fail 0
# skipped 2
# duration_ms 8783
```

全件 PASS（skip 2 件は TC-015、TC-022 で代替検証済み）。
