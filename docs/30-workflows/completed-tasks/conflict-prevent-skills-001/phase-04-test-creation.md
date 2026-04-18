# Phase 4: テスト作成

## メタ情報

| 項目 | 値 |
| --- | --- |
| Phase | 4 |
| 機能名 | conflict-prevent-skills-001 |
| 作成日 | 2026-04-18 |

## 目的

merge policy、custom driver、generator、mirror parity、NON_VISUAL evidence を壊さずに検証できるテスト仕様を定義する。

## 実行タスク

1. custom `keep-ours` driver の挙動確認テストを設計する
2. `topic-map.md` の日付除去と行番号索引維持の snapshot / grep テストを設計する
3. `LOGS.md` の `union` 適用前提を検証するテストを設計する
4. mirror parity と regenerate command の動線テストを設計する
5. EVALS schema drift 禁止を guard test として明記する

## 参照資料

| 資料名 | パス | 用途 |
| --- | --- | --- |
| phase execution template | `.agents/skills/task-specification-creator/references/phase-template-execution.md` | Phase 4 骨格 |
| git attributes manual | `git help attributes` | merge simulation の期待値 |
| session init hook | `.claude/hooks/session-init.sh` | bootstrap warning 設計 |

## 実行手順

### ステップ1: テストスイートの定義

| TC | 対象 | 期待値 |
| --- | --- | --- |
| TC-4-01 | custom `keep-ours` driver | current branch 側を残して conflict marker を出さない |
| TC-4-02 | `union` on `LOGS.md` | 双方の追記が残る |
| TC-4-03 | `generate-index.js` | `topic-map.md` に日付行がなく、行番号索引契約は維持される |
| TC-4-04 | mirror parity | `.claude` と `.agents` の対象 file set 差分を検出できる |
| TC-4-05 | EVALS schema guard | 本 task が `EVALS.json` の schema を変えていないことを確認する |

### ステップ2: テスト操作媒体の明示

- Git merge simulation は一時 repo で行う
- generator regression は `rg` と snapshot で行う
- parity は `diff -qr` ではなく対象 path を限定した比較にする

## 統合テスト連携

- Phase 5 で作成・修正するスクリプトに 1:1 で接続する
- Phase 6 で edge case を追加する

## 多角的チェック観点（AIが判断）

- 垂直思考: 各テストがどの acceptance criteria を守るか明確か
- 2軸思考: 「副作用の大きさ × 再現容易性」でテスト優先度を決めているか
- 類推思考: 既存 hook / index regenerate テストの再利用余地があるか
- 改善思考: 失敗時に原因を一意に絞れるテストになっているか

## サブタスク管理

| SubTask | 内容 | 担当 |
| --- | --- | --- |
| ST-10 | merge simulation case 作成 | Lane A |
| ST-11 | generator regression case 作成 | Lane B |
| ST-12 | consumer audit guard 作成 | Lane C |

## 成果物

- `outputs/phase-4/test-scenarios.md`
- `outputs/phase-4/command-expectations.md`
- `outputs/phase-4/mirror-and-consumer-guard.md`

## 完了条件

- [ ] TC-4-01〜05 が定義されている
- [ ] acceptance criteria との対応が明確である
- [ ] EVALS の guard 条件が入っている

## タスク100%実行確認【必須】

- [ ] merge / regenerate / parity / guard を全て含めた
- [ ] test case と期待値を記載した
- [ ] Phase 5 実装へ接続した

## 次Phase

Phase 5 では、テストで定義した順に `.gitattributes`、driver setup、generator、warning/check を実装する。
