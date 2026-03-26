# Phase 4: テスト作成

## メタ情報

| 項目   | 値                                         |
| ------ | ------------------------------------------ |
| Phase  | 4                                          |
| 機能名 | execution-governance-and-handoff-alignment |
| 作成日 | 2026-03-26                                 |

## 目的

route decision、handoff guidance、approval token、disclosure fetch、visible handoff を検証する test matrix を定義する。

## 実行タスク

- runtime policy と consumer auth guard の test case を定義する
- approval / disclosure の IPC 連携観点を定義する
- Skill Creator public surface と renderer regression の観点を定義する

## テスト対象カテゴリ

| カテゴリ       | 対象例                                                                                          |
| -------------- | ----------------------------------------------------------------------------------------------- |
| Runtime policy | API key あり / なし、subscription fallback、degraded、consumer token                            |
| Main service   | `RuntimeSkillCreatorFacade` early return、`TerminalHandoffBuilder` sanitize、`ApprovalGate` TTL |
| Main IPC       | `creatorHandlers.ts` / `approvalHandlers.ts` / `disclosureHandlers.ts`                          |
| Preload        | `channels.ts` allowlist、`skill-creator-api.ts` runtime wrapper                                 |
| Renderer       | `SkillLifecyclePanel` の visible handoff、reason 表示、console-only 排除                        |

## 参照資料

| 資料名           | パス                                    | 説明             |
| ---------------- | --------------------------------------- | ---------------- |
| Phase 1 要件     | `phase-1-requirements.md`               | AC-1〜AC-6       |
| Phase 2 設計     | `phase-2-design.md`                     | topology / owner |
| Phase 3 レビュー | `outputs/phase-3/design-review-gate.md` | review 結果      |

## 成果物

| 成果物      | パス                             | 説明                     |
| ----------- | -------------------------------- | ------------------------ |
| test matrix | `outputs/phase-4/test-matrix.md` | test case 一覧と期待結果 |

## 統合テスト連携

- `RuntimePolicyResolver` / `RuntimeSkillCreatorFacade` / IPC / preload / renderer の 5 層にケースを分配する
- approval / disclosure の shared contract は Skill Creator 専用実装を増やさない回帰観点にする
- visible handoff は `SkillLifecyclePanel` regression の必須観点にする

## 完了条件

- [ ] governance 観点の test matrix が定義されている
- [ ] approval / disclosure / handoff / consumer auth guard が含まれている
- [ ] visible handoff の regression 観点が含まれている
- [ ] **本Phase内の全タスクを100%実行完了**
