# Phase 9: 品質保証

## メタ情報

| 項目   | 値                                   |
| ------ | ------------------------------------ |
| Phase  | 9                                    |
| 機能名 | user-interaction-bridge-and-phase-ui |
| 作成日 | 2026-03-26                           |

## 目的

ユーザーが段階的に答えられる UX、engine owner 維持、visible handoff、graceful degradation が揃っているか確認する。

## 実行タスク

- question type と UI component の対応確認
- phase と surface の分離確認
- secret / free text / choice / confirm の扱い再点検
- handoff / provenance / verify summary の責務分離を確認

## 参照資料

| 資料名              | パス                             | 説明           |
| ------------------- | -------------------------------- | -------------- |
| Phase 5 実装        | `phase-5-implementation.md`      | 実装対象       |
| Phase 7 coverage    | `phase-7-coverage-check.md`      | coverage 観点  |
| Phase 8 refactoring | `phase-8-refactoring.md`         | 命名と責務整理 |
| test matrix         | `outputs/phase-4/test-matrix.md` | 検証一覧       |

## 品質観点

- ユーザーは不足情報を段階的に埋められる
- AI の質問が UI 上で actionable に見える
- 最初から全要件入力を強制しない
- renderer は phase owner にならない
- handoff 情報が console ではなく UI で見える
- secret 値は不必要に保存 / 表示されない

## 公式照合観点

- `skill-creator:*` public surface 維持と矛盾しない
- approvals / disclosure の考え方と UI bridge が衝突していない
- shared contract first と store-driven UI 原則に反していない
- missing handler 時も graceful degradation できる設計になっている

## 成果物

| 成果物  | パス                           | 説明               |
| ------- | ------------------------------ | ------------------ |
| QA note | `phase-9-quality-assurance.md` | 品質観点の最終整理 |

## 統合テスト連携

- missing handler と stale requestId を graceful degradation 観点へ入れる
- handoff visible 化は renderer regression と manual walkthrough の両方へ接続する
- approval / disclosure boundary は Task07 へ引き継ぐ QA note とする

## 完了条件

- [ ] 段階的回答 UX が前提化されている
- [ ] question type と UI surface の対応が読める
- [ ] safe input と approval/disclosure 導線の境界が明確
- [ ] handoff visible 化と provenance summary が品質観点に入っている
- [ ] **本Phase内の全タスクを100%実行完了**
