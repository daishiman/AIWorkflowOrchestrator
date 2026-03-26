# Phase 10: 最終レビュー

## メタ情報

| 項目   | 値                                      |
| ------ | --------------------------------------- |
| Phase  | 10                                      |
| 機能名 | session-persistence-and-resume-contract |
| 作成日 | 2026-03-26                              |

## 目的

Task08 の persisted contract が実装 wave へ渡せる品質かを最終判定する。

## 実行タスク

- persisted contract の妥当性を判定する
- invalidation rule の妥当性を判定する
- downstream implementation handoff の十分性を判定する

## 参照資料

| 資料名         | パス                             | 説明               |
| -------------- | -------------------------------- | ------------------ |
| Phase 2 設計   | `phase-2-design.md`              | persisted contract |
| Phase 3 review | `phase-3-design-review.md`       | gate 結果          |
| Phase 4 matrix | `outputs/phase-4/test-matrix.md` | test 観点          |
| Phase 5 実装   | `phase-5-implementation.md`      | 実装責務           |
| Phase 9 QA     | `phase-9-quality-assurance.md`   | quality gate       |

## 判定

PASS

## 妥当性根拠

- `phase-5-implementation.md` の shared contract / repository / restore entrypoint 分離が review 根拠と矛盾しない
- memory owner と persistence owner の分離が保たれている
- generic session 基盤再利用と workflow payload 分離が両立している
- route / provenance / manifest drift を explicit に reject または warning へ分けている
- phase boundary checkpoint に絞って scope を保っている
- Agent SDK session と混同しない API 境界がある

## 次 task / 次 wave への引き継ぎ

- shared types 実装時に generic / workflow の責務を混ぜない
- session store schema extension か wrapper store かを実装前に確定する
- public preload を増やす場合は `skill-creator:*` namespace で 4 層整合を同 wave で通す
- warning UI は Task05 / Task06 の surface と衝突させない

## 未決のまま残してよい事項

- cross-version migration UI
- rewind / fork / branch resume
- multi-checkpoint history の保持数最適化
- renderer 側の resume session list UI

## 統合テスト連携

- Phase 4 / 6 / 7 / 9 の観点が final gate へ取り込まれていることを確認する。
- Phase 12 へ handoff 先と no-op 根拠を記録する。

## 成果物

| 成果物       | パス                       | 説明         |
| ------------ | -------------------------- | ------------ |
| final review | `phase-10-final-review.md` | 最終判定本文 |

## 完了条件

- [ ] persisted contract と invalidation rule が揃っている
- [ ] downstream 実装 wave への handoff が明記されている
- [ ] 未決事項が Task08 の責務外に閉じている
- [ ] **本Phase内の全タスクを100%実行完了**
