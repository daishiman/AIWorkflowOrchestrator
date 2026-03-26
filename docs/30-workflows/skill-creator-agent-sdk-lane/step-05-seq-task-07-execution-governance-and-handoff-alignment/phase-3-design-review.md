# Phase 3: 設計レビュー

## メタ情報

| 項目   | 値                                         |
| ------ | ------------------------------------------ |
| Phase  | 3                                          |
| 機能名 | execution-governance-and-handoff-alignment |
| 作成日 | 2026-03-26                                 |

## レビュー目的

Phase 1-2 の要件と設計が、execution responsibility 系 system spec、advanced console safety governance、Task03-06 の surface 境界、Task08 の downstream 期待に対して妥当かを判定する。

## 目的

要件と設計の妥当性を gate 観点で確認し、Phase 4 以降へ渡す blocker と follow-up を固定する。

## 実行タスク

- Phase 1 要件と Phase 2 設計の整合を確認する
- shared `HandoffGuidance` / approval / disclosure contract 再利用方針を確認する
- simpler alternative の検討結果と blocker を整理する

## 参照資料

| 資料名                            | パス                                                   | 説明                |
| --------------------------------- | ------------------------------------------------------ | ------------------- |
| Phase 1 要件                      | `phase-1-requirements.md`                              | governance 要件     |
| Phase 2 設計                      | `phase-2-design.md`                                    | topology / boundary |
| governance bundle matrix          | `outputs/phase-2/governance-bundle-matrix.md`          | owner / contract    |
| route approval disclosure mapping | `outputs/phase-2/route-approval-disclosure-mapping.md` | IPC / UI slot       |

## レビュー観点

- `integrated_api` primary / `terminal_handoff` secondary が崩れていないか
- Skill Creator が shared approval / disclosure surface を再利用しているか
- Manual Boundary MB-1〜MB-4 が design wording に落ちているか
- Task05 / Task06 / Task08 と責務衝突していないか

## 自己完結レビュー表

| 観点                   | 結論 | レビュー根拠                                                                                                                |
| ---------------------- | ---- | --------------------------------------------------------------------------------------------------------------------------- |
| route authority        | PASS | decision owner は `RuntimePolicyResolver` / `RuntimeSkillCreatorFacade` に残す                                              |
| shared contract 再利用 | PASS | `HandoffGuidance` / `approval:*` / `execution:get-disclosure-info` を再利用し、専用 channel を増やさない                    |
| Manual Boundary        | PASS | MB-1 headless 自動実行禁止、MB-2 credential passthrough 禁止、MB-3 approval/disclosure 分離、MB-4 Renderer 再生成禁止を保持 |
| downstream handoff     | PASS | Task08 は下記 canonical 前提のみを受け取り、route / guard を再設計しない                                                    |

## 判定

PASS。Task07 を governance bundle 専任に分離する判断は妥当であり、既存 runtime / advanced console 契約を Skill Creator へ接続するだけで必要十分なスコープに収まっている。

## 判定根拠

1. route authority は `RuntimePolicyResolver` と `RuntimeSkillCreatorFacade` に残り、Renderer へ移動しない。
2. handoff DTO は shared `HandoffGuidance` を再利用し、Skill Creator 独自 DTO 増殖を防げている。
3. approval と disclosure は既存 shared channel を利用する設計で、surface ごとの専用実装重複を避けられる。
4. Task05/06 が host surface、Task07 が governance、Task08 が persistence と責務分離できている。

## Task08 へ渡す canonical 前提

`route authority は Main owner のまま維持し、Skill Creator は shared `HandoffGuidance`/`approval:\*`/`execution:get-disclosure-info` を再利用する。Renderer は visible handoff と disclosure summary の表示に留まり、manual boundary と consumer auth guard を上書きしない。`

## simpler alternative の検討結果

| 案                                                                  | 判定 | 理由                                      |
| ------------------------------------------------------------------- | ---- | ----------------------------------------- |
| Skill Creator 専用 `approval:*` / `disclosure:*` channel を追加する | 却下 | shared governance と二重正本になりやすい  |
| handoff reason を Renderer で再生成する                             | 却下 | Main authority と drift しやすい          |
| consumer token を handoff へ自動変換して許容する                    | 却下 | guard を弱め、auth semantics を曖昧にする |

## 注意事項

- `SkillLifecyclePanel.tsx` に残る console-only TODO は Task07 scope で visible handoff へ収束させる
- approval / disclosure の UI polish まで抱え込まず、shared hook / existing console surface を優先する

## 成果物

| 成果物                               | パス                                                      | 説明                    |
| ------------------------------------ | --------------------------------------------------------- | ----------------------- |
| design review gate                   | `outputs/phase-3/design-review-gate.md`                   | 判定と follow-up        |
| skill compliance and elegance review | `outputs/phase-3/skill-compliance-and-elegance-review.md` | skill / spec 適合性確認 |

## 統合テスト連携

- Phase 4 の test matrix へ route decision、approval token、handoff visible 化、disclosure fetch を落とす
- Phase 10 の最終判定では AC-1〜AC-6 を gate 条件とする

## 完了条件

- [ ] 設計レビュー結果が文書化されている
- [ ] blocker / simpler alternative / downstream 委譲境界が整理されている
- [ ] Phase 4 以降へ渡すテスト観点が抽出されている
- [ ] **本Phase内の全タスクを100%実行完了**
