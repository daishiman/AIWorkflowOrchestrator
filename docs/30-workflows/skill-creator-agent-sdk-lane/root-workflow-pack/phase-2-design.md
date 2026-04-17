# Phase 2: 設計

## メタ情報

| 項目   | 値                           |
| ------ | ---------------------------- |
| Phase  | 2                            |
| 機能名 | skill-creator-agent-sdk-lane |
| 作成日 | 2026-03-26                   |

## 目的

root workflow と child task 群の topology、依存順、lane 分離、親子責務を設計する。

## 実行タスク

- root / child の責務分離
- `seq/par` 命名規約の適用
- 初回スコープの優先順位付け
- task 間依存の設計

## 参照資料

| 資料名             | パス                                                                      | 説明           |
| ------------------ | ------------------------------------------------------------------------- | -------------- |
| root index 草案    | `index.md`                                                                | 親パック設計   |
| 要件草案           | `../requirements-draft.md`                                                | 要件前提       |
| task-spec workflow | `.agents/skills/task-specification-creator/references/create-workflow.md` | task-spec 正本 |

## 実行手順

### ステップ1: root / child 分離

- root は Phase 1-13 の親仕様
- child は責務別 task spec

### ステップ2: 依存順設計

- Task01 → Task02 を直列
- Task03 / Task04 を並列
- Task05 / Task06 を並列
- Task07 → Task08 を直列
- Task02 で `workflow state owner`、`lane response baseline`、`workflow state envelope` を固定する
- Task03 は dynamic source discovery、resource / budget 起因の degrade trigger までを定義し、lane choice / disclosure は Task07 へ渡す
- Task05 / Task06 は shared lifecycle state contract を同期してから並列化する
- Task07 は Task02 / 03 / 04 / 05 / 06 の出力を前提に governance bundle を適用・hardening する
- Task08 は Task02 の state envelope と Task07 の route state 境界、Task03 の source snapshot を前提に compatibility を閉じる

並列化の判断基準:

- Task03 / Task04 は resource selection と interaction bridge で主責務が分かれるため同時進行しやすい
- Task03 が source discovery / provenance を先に固定すると、Task04 以降は「何を表示・記録するか」だけに論点を絞れる
- Task05 / Task06 は create 主導線と verify/improve surface で変更面が一部近いが、shared lifecycle state contract を先に揃えれば並列化可能
- Task01 / Task02 は manifest 契約と engine 契約が密結合なので直列維持が妥当
- Task07 / Task08 は governance / session の横断修正になりやすく、後段で直列化する方が競合を減らせる
- Task07 は lane contract の初定義 task ではなく、foundation で固定した baseline の適用・整合 task として扱う

### ステップ3: 初回スコープ設計

- manifest は phase / resource / entry-exit のみに限定
- verify は Layer 1 / 2 優先
- UI は主導線一本化を優先
- session は compatibility contract を優先し、本実装確定は後続へ回す

## 統合テスト連携

- task 依存順が root index と child index で一致することを確認する
- dependency matrix と child task の predecessor 記述が一致することを確認する
- `seq/par` 命名が実行順と一致することを確認する

## 成果物

| 成果物             | パス                | 説明                   |
| ------------------ | ------------------- | ---------------------- |
| 設計書             | `phase-2-design.md` | topology と lane 設計  |
| workflow inventory | `artifacts.json`    | phase / task inventory |

## 完了条件

- [ ] root と child の責務境界が明記されている
- [ ] task 依存順が設計されている
- [ ] `seq/par` 命名が一貫している
- [ ] 初回スコープ縮小方針が task に反映されている
- [ ] 並列化可能範囲と非推奨範囲の理由が明記されている
- [ ] **本Phase内の全タスクを100%実行完了**
