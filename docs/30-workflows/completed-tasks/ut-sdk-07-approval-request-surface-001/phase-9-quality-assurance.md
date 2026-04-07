# Phase 9: 品質保証

## メタ情報

| 項目       | 内容                                        |
| ---------- | ------------------------------------------- |
| Phase      | 9                                           |
| 機能名     | UT-SDK-07-APPROVAL-REQUEST-SURFACE-001      |
| タスク名   | Skill Creator approval request surface 接続 |
| 前提Phase  | Phase 8                                     |
| 後続Phase  | Phase 10                                    |
| 作成日     | 2026-04-06                                  |
| ステータス | pending                                     |

## 目的

line budget・リンク・mirror parity を一括判定し、Phase 10 ゲートへ提出できる品質水準に達していることを確認する。

## 実行タスク

- 品質チェック: lint・typecheck・テスト全件 PASS を確認する
- リスク評価: 残存リスクを特定し台帳に記録する
- 因果ループ監査: 修正が新たな問題を生む循環がないかを確認する
- mirror parity 確認: `.claude` 正本と `.agents` mirror の parity を確認する

## 品質チェックリスト

| チェック項目          | コマンド                                         | 期待結果   |
| --------------------- | ------------------------------------------------ | ---------- |
| TypeScript 型チェック | `pnpm typecheck`                                 | エラー 0件 |
| ESLint                | `pnpm lint`                                      | エラー 0件 |
| Vitest 全テスト       | `pnpm vitest run`                                | 全件 PASS  |
| カバレッジ目標達成    | `pnpm vitest run --coverage`（対象ブロック限定） | 目標値以上 |
| validate-phase-output | `node scripts/validate-phase-output.js`          | PASS       |

## リスク評価

| リスクID | リスク内容                                                | 深刻度 | 対策状況                             |
| -------- | --------------------------------------------------------- | ------ | ------------------------------------ |
| RISK-01  | approval request payload shape の drift                   | MEDIUM | local alias と実payload を一致させる |
| RISK-02  | `SkillLifecyclePanel.tsx` の既存 approval UI との二重表示 | LOW    | Phase 2 設計で解消済み               |
| RISK-03  | cleanup 漏れによるメモリリーク                            | LOW    | TC-APPR-10 で検証済み                |

## 因果ループ監査

| ループ                 | 確認内容                                                                     |
| ---------------------- | ---------------------------------------------------------------------------- |
| 強化ループ（正）       | `onApprovalRequest` 追加 → approval flow 完結 → UX 向上                      |
| バランスループ（抑制） | cleanup 未実装 → メモリリーク → パフォーマンス低下 → useEffect return で抑制 |

## 参照資料

| 参照資料       | パス                                             | 説明           |
| -------------- | ------------------------------------------------ | -------------- |
| リファクタ計画 | `outputs/phase-8/refactoring-plan.md`            | Phase 8 成果物 |
| 再テスト計画   | `outputs/phase-8/post-refactor-test-plan.md`     | Phase 8 成果物 |
| 責務境界マップ | `outputs/phase-8/responsibility-boundary-map.md` | Phase 8 成果物 |
| 契約差分       | `outputs/phase-5/contract-diff.md`               | Phase 5 成果物 |

## 実行手順

1. Phase 8 成果物を確認する。
2. 品質チェックリストを全項目実行する。
3. リスク評価を行い、残存リスクを台帳に記録する。
4. 因果ループ監査を実施する。
5. 成果物を記録する。

## 成果物

| 成果物         | パス                                   | 説明                    |
| -------------- | -------------------------------------- | ----------------------- |
| 品質レポート   | `outputs/phase-9/quality-report.md`    | 品質チェック全結果      |
| リスク台帳     | `outputs/phase-9/risk-register.md`     | 残存リスク一覧          |
| 因果ループ監査 | `outputs/phase-9/causal-loop-check.md` | 強化/バランスループ確認 |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] `pnpm typecheck` PASS
- [ ] `pnpm lint` PASS
- [ ] Vitest 全件 PASS
- [ ] カバレッジ目標達成
- [ ] リスク台帳が記録されている
- [ ] 因果ループ監査が完了している
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/ut-sdk-07-approval-request-surface-001
```

## 次のPhase

Phase 10: 最終レビューゲート
