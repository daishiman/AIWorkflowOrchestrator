# Phase 1 Requirements

## FR

- FR-1: parent Phase 11 は visual / non-visual 判定を明示する
- FR-2: parent Phase 11 は `## テストケース` と `## 画面カバレッジマトリクス` を持つ
- FR-3: parent Phase 11 outputs は `TC-ID -> evidence path -> result` を追跡できる
- FR-4: parent Phase 12 は 6成果物の役割差分を明示する
- FR-5: parent `implementation-guide.md` は Part 1 / Part 2 の必須骨格を満たす
- FR-6: parent `phase12-task-spec-compliance-check.md` は Task 12-1〜12-5 を内容完了で判定する
- FR-7: validator PASS と human review PASS を別ゲートとして残す

## NFR

- NFR-1: placeholder PNG を current workflow に残さない
- NFR-2: review board PNG と metadata を current workflow 配下に固定する
- NFR-3: same-wave no-op の場合も根拠を Phase 12 に残す
- NFR-4: parent workflow の Phase 13 は blocked を維持する
- NFR-5: corrective workflow 自身も Phase 1〜12 の outputs を欠かさない

## AC

| ID   | 条件                                                                  |
| ---- | --------------------------------------------------------------------- |
| AC-1 | parent Phase 11 に visual / non-visual 判定ゲートがある               |
| AC-2 | parent Phase 11 に testcase と coverage matrix がある                 |
| AC-3 | parent Phase 12 に implementation guide の Part 1 / Part 2 要件がある |
| AC-4 | parent Phase 12 に 6成果物の役割差分がある                            |
| AC-5 | compliance check が存在確認だけで PASS にならない                     |
| AC-6 | placeholder 除去または non-visual 根拠の固定が完了条件に含まれる      |
| AC-7 | validator 実行計画が Phase 4 / 6 / 9 / 10 / 12 に配置される           |
| AC-8 | runtime code を変えずに docs close-out の信頼性を上げる               |
