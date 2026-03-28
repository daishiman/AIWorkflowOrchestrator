# Phase 3: 設計レビュー

## メタ情報

| 項目   | 値                                      |
| ------ | --------------------------------------- |
| Phase  | 3                                       |
| 機能名 | session-persistence-and-resume-contract |
| 作成日 | 2026-03-26                              |

## 目的

Task08 の設計が Task02 / Task07 と衝突せず、silent resume を防げる品質かを判定する。

## 実行タスク

- persisted contract の責務境界を判定する
- compatibility evaluator の reject 条件を判定する
- generic session 基盤再利用の妥当性を判定する

## 参照資料

| 資料名               | パス                                                  | 説明                          |
| -------------------- | ----------------------------------------------------- | ----------------------------- |
| Phase 1 要件         | `phase-1-requirements.md`                             | save target / invalidation    |
| Phase 2 設計         | `phase-2-design.md`                                   | persisted contract / topology |
| compatibility matrix | `outputs/phase-2/persistence-compatibility-matrix.md` | 判定ルール                    |
| checkpoint topology  | `outputs/phase-2/checkpoint-topology.md`              | restore boundary              |

## 判定

PASS

## Gate Summary

| Gate                          | 結果 | 根拠                                                                                              |
| ----------------------------- | ---- | ------------------------------------------------------------------------------------------------- |
| G-01 state owner preservation | PASS | `SkillCreatorWorkflowEngine` を state owner のまま維持し、facade を persistence owner にしない    |
| G-02 silent resume prevention | PASS | version / route / hash / lease 差分を explicit に reject または warning へ分離した                |
| G-03 scope control            | PASS | UI / governance / chat history redesign / fork を scope 外へ分離した                              |
| G-04 generic session reuse    | PASS | `SessionPersistenceService` / `SessionStorage` の再利用を前提にしつつ workflow payload を分離した |
| G-05 API boundary separation  | PASS | `agent:resumeSession` と Skill Creator workflow resume を混同しない方針を固定した                 |

## Minor Notes

| 項目                                | 行き先               |
| ----------------------------------- | -------------------- |
| workflow session list UI の具体配置 | 後続 UI task         |
| cross-version migration tool の詳細 | follow-up 実装 wave  |
| resumed warning 表示文言            | Task05 / Task06 連携 |

## 統合テスト連携

- Phase 4 の matrix に version / route / hash / lease / revision の 5 系統が入っていることを確認する。
- Phase 9 の QA で silent resume が残っていないことを再監査する。

## Phase 4 開始条件

- save target、checkpoint 種別、compatibility 結果種別が Phase 4 の test case へ変換できること
- `agent:resumeSession` と混同しない channel / API 方針が説明できること

## Phase 13 blocked 条件

- ユーザー承認がない限り PR / commit は実行しない
- spec_created のため、local check と change summary までで止める

## 成果物

| 成果物             | パス                                                      | 説明                    |
| ------------------ | --------------------------------------------------------- | ----------------------- |
| design review gate | `outputs/phase-3/design-review-gate.md`                   | gate summary            |
| elegance review    | `outputs/phase-3/skill-compliance-and-elegance-review.md` | simplicity と整合性監査 |

## 完了条件

- [ ] reject 条件と warning 条件が明確に分離されている
- [ ] Task02 / Task07 との責務衝突がない
- [ ] generic session 再利用と workflow payload 分離が両立している
- [ ] **本Phase内の全タスクを100%実行完了**
