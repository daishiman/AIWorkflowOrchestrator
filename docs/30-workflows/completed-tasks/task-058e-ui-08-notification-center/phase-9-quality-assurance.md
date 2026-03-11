# Phase 9: 品質保証

## メタ情報

| 項目   | 値                                  |
| ------ | ----------------------------------- |
| Phase  | 9                                   |
| 機能名 | task-058e-ui-08-notification-center |
| 作成日 | 2026-03-11                          |
| 前提   | Phase 5                             |

## 目的

058e の品質保証観点を、UI、IPC、a11y、theme、P 系落とし穴の 5 軸で固定する。

## 実行タスク

- UI品質確認: 文言、relative time、motion、empty state を確認する。
- IPC品質確認: delete 追加後の validation と allowlist を確認する。
- a11y品質確認: keyboard と `aria-*` を確認する。
- theme品質確認: light / dark / kanagawa-dragon を確認する。
- pitfall品質確認: P5 / P31 / P39 / P40 / P42 を確認する。

## 参照資料

| 参照資料        | パス                                                                         | 説明           |
| --------------- | ---------------------------------------------------------------------------- | -------------- |
| Phase 5 実装    | `outputs/phase-5/implementation-summary.md`                                  | 実装結果       |
| Phase 6 a11y    | `outputs/phase-6/accessibility-cases.md`                                     | a11y 観点      |
| Phase 8 境界    | `outputs/phase-8/boundary-checklist.md`                                      | 境界確認       |
| security 正本   | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md` | IPC 品質       |
| P50差分収束計画 | `outputs/phase-5/p50-gap-closure-plan.md`                                    | Phase 5 成果物 |
| IPC差分対応     | `outputs/phase-5/ipc-channel-migration.md`                                   | Phase 5 成果物 |
| リファクタ記録  | `outputs/phase-8/refactoring-log.md`                                         | Phase 8 成果物 |

## 実行手順

### ステップ1: 品質軸ごとの確認

| 品質軸  | 確認内容                                             |
| ------- | ---------------------------------------------------- |
| UI      | title、button label、relative time、swipe affordance |
| IPC     | delete validation、sender 検証、sanitized error      |
| a11y    | Escape、focus trap、live region、icon label          |
| theme   | 3 theme で unread dot と badge のコントラスト        |
| pitfall | P5、P31、P39、P40、P42                               |

## 統合テスト連携

| 観点  | 内容                                                |
| ----- | --------------------------------------------------- |
| UI    | Bell から item delete まで一連で確認する            |
| IPC   | preload / main / renderer の delete flow を確認する |
| Theme | 3 theme で badge と popover を確認する              |

## 成果物

| 成果物              | パス                                    | 説明       |
| ------------------- | --------------------------------------- | ---------- |
| 品質レポート        | `outputs/phase-9/quality-report.md`     | 品質まとめ |
| IPCセキュリティ確認 | `outputs/phase-9/ipc-security-check.md` | IPC 品質   |

## 完了条件

- [ ] UI / IPC / a11y / theme / pitfall の 5 軸を確認している
- [ ] delete channel を品質確認対象に含めている
- [ ] 3 theme を確認対象に含めている
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. UI 品質確認
2. IPC 品質確認
3. a11y / theme 品質確認
4. pitfall 確認
5. 完了条件の確認

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] `outputs/phase-9/` の成果物名を固定済み
- [ ] `artifacts.json` の Phase 9 と整合している

## 次のPhase

[Phase 10: 最終レビューゲート](./phase-10-final-review.md)
