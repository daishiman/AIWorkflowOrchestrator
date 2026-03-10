# task-spec generate-index / artifacts schema 互換改善 - タスク指示書

## メタ情報

| 項目         | 内容                                                 |
| ------------ | ---------------------------------------------------- |
| タスクID     | UT-IMP-TASK-SPEC-GENERATE-INDEX-SCHEMA-COMPAT-001    |
| タスク名     | task-spec generate-index / artifacts schema 互換改善 |
| 分類         | 改善                                                 |
| 対象機能     | task-specification-creator workflow index 生成       |
| 優先度       | 中                                                   |
| 見積もり規模 | 中規模                                               |
| ステータス   | 未実施                                               |
| 発見元       | TASK-10A-G Phase 12 再監査                           |
| 発見日       | 2026-03-10                                           |

## 1. なぜこのタスクが必要か（Why）

- `node .claude/skills/task-specification-creator/scripts/generate-index.js --workflow ... --regenerate` を current workflow に対して実行したところ、`index.md` が `機能名=undefined`、Phase 1〜13 がすべて `未実施` に崩れた
- 原因は、workflow 側 `artifacts.json` が `phase-1` 形式のキーと独自メタ情報を持つ一方、generator が別スキーマ前提で解釈しているため
- いまは手動同期で復旧できるが、同種 workflow で再発すると Phase 12 完了判定や引き継ぎ資料が壊れる

## 2. 何を達成するか（What）

- `generate-index.js` が current workflow の `artifacts.json` を正しく解釈し、`index.md` を破壊せず再生成できるようにする
- `artifacts.json` / `outputs/artifacts.json` / `index.md` の整合を機械的に検証できる状態にする
- 必要なら `artifact-definition.json` と workflow テンプレートの差分も整理し、後続タスクで迷わない状態にする

## 3. どのように実行するか（How）

- `generate-index.js` の入力スキーマを調査し、`"1"` / `"phase-1"` の両形式を吸収する互換層を追加する
- `complete-phase.js` / `init-artifacts.js` / `schemas/artifact-definition.json` / workflow 実例のどこを正本にするか決める
- 壊れた `index.md` を fixture にして、`undefined` / 全Phase未実施化を再現する回帰テストを追加する

## 4. 実行手順

1. `.claude/skills/task-specification-creator/scripts/generate-index.js` の期待スキーマを特定する
2. `artifacts.json` 実例を複数抽出し、互換対象パターンを整理する
3. generator 側で互換変換、または artifacts 正規化のどちらを採るか決める
4. `generate-index.js` の自動テストを追加し、`TASK-10A-G` 相当ケースを fixture 化する
5. `references/spec-update-workflow.md` / `references/phase-11-12-guide.md` に正しい運用を反映する

## 5. 完了条件チェックリスト

- [ ] `generate-index.js --workflow ... --regenerate` で `index.md` が `undefined` / 全Phase `未実施` にならない
- [ ] `artifacts.json` が `"phase-1"` 形式でも `"1"` 形式でも正しく解釈される、または正規化方針が仕様化されている
- [ ] 自動テストで今回の再発ケースを固定している
- [ ] `verify-all-specs` / `validate-phase-output` と矛盾しない
- [ ] 関連仕様書と運用ガイドが更新されている

## 6. 検証方法

- `node .claude/skills/task-specification-creator/scripts/generate-index.js --workflow <fixture> --regenerate`
- `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow <fixture> --strict`
- `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js <fixture>`
- generator の追加ユニットテスト

## 7. リスクと対策

| リスク                           | 内容                                          | 対策                                              |
| -------------------------------- | --------------------------------------------- | ------------------------------------------------- |
| 互換層の過剰複雑化               | 旧新スキーマを両対応しすぎて保守しづらくなる  | 正本スキーマを1つ決め、互換層は移行期間限定にする |
| 既存 completed workflow への影響 | generator 変更で別 workflow の index が変わる | fixture を複数用意して回帰確認する                |
| 手動同期との二重運用             | script と手動運用が分岐して再び drift する    | 運用ガイドで優先手順を固定する                    |

## 8. 参照情報

| 種別              | パス                                                                              | 用途                    |
| ----------------- | --------------------------------------------------------------------------------- | ----------------------- |
| 現象発生 workflow | `docs/30-workflows/completed-tasks/task-045-task-10a-g-lifecycle-test-hardening/` | 再現ケース              |
| generator         | `.claude/skills/task-specification-creator/scripts/generate-index.js`             | 修正対象                |
| phase 完了更新    | `.claude/skills/task-specification-creator/scripts/complete-phase.js`             | 台帳更新との整合確認    |
| スキーマ          | `.claude/skills/task-specification-creator/schemas/artifact-definition.json`      | 正本候補                |
| 先行事例          | `docs/30-workflows/completed-tasks/getfiletree-ipc/spec-alignment-review.md`      | Phaseキー互換の既知対処 |

## 9. 備考

- TASK-10A-G では feature 完了を優先し、`index.md` は手動同期で復旧した
- 問題は current workflow だけでなく task-specification-creator の汎用 generator 側にあるため、後続改善タスクとして切り出す
