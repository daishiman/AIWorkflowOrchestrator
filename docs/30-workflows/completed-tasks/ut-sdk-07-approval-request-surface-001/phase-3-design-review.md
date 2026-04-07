# Phase 3: 設計レビューゲート

## メタ情報

| 項目       | 内容                                        |
| ---------- | ------------------------------------------- |
| Phase      | 3                                           |
| 機能名     | UT-SDK-07-APPROVAL-REQUEST-SURFACE-001      |
| タスク名   | Skill Creator approval request surface 接続 |
| 前提Phase  | Phase 2                                     |
| 後続Phase  | Phase 4                                     |
| 作成日     | 2026-04-06                                  |
| ステータス | pending                                     |

## 目的

Phase 2 設計書をレビューし、Phase 4（テスト作成）へ進めるかを判定するゲートを通過する。

## 背景

Phase 1-2 で確定した要件・設計に矛盾・漏れ・整合性問題がないかをレビューし、PASS/FAIL を記録する。

## SubAgentチーム編成

| SubAgent   | 関心ごと             | 主担当                           |
| ---------- | -------------------- | -------------------------------- |
| SubAgent-A | Preload設計レビュー  | interface 拡張設計の妥当性確認   |
| SubAgent-B | Renderer設計レビュー | UI設計の妥当性確認               |
| SubAgent-C | テスト設計レビュー   | テスト戦略の妥当性確認           |
| SubAgent-D | 統合レビュー         | 矛盾・漏れ・整合・依存の最終判定 |

## 実行タスク

- 設計レビュー: Phase 2 全成果物を多角的観点でレビューする
- 矛盾チェック: 要件 vs 設計の矛盾を検査する
- ゲート判定: PASS/FAIL/CONDITIONAL_PASS を判定する

## レビューチェックリスト

### 機能設計チェック

| チェック項目                                                     | 判定基準                               |
| ---------------------------------------------------------------- | -------------------------------------- |
| `onApprovalRequest` の型シグネチャが `preload/index.ts` と対称か | 型定義が一致している                   |
| `safeOn` パターンが既存実装（`onProgress` 等）と一致するか       | 既存パターンを踏襲している             |
| `ALLOWED_ON_CHANNELS` に `APPROVAL_REQUEST` が含まれるか         | channels.ts line 777 で確認済み        |
| `SkillLifecyclePanel.tsx` の `useEffect` cleanup が正しいか      | unsubscribe 関数が return されている   |
| `respondToApproval` との接続が切れていないか                     | approve/reject action が正しく渡される |

### 責務境界チェック

| チェック項目                            | 判定基準                                                   |
| --------------------------------------- | ---------------------------------------------------------- |
| Main Process 変更が不要であることを確認 | approvalHandlers.ts は変更不要                             |
| 型定義変更が最小限か                    | shared 新規型は不要、payload shape は local alias で閉じる |
| channels.ts 変更が不要であることを確認  | ALLOWED_ON_CHANNELS は登録済み                             |

### リスク評価

| リスク                                                    | 深刻度 | 対策                                         |
| --------------------------------------------------------- | ------ | -------------------------------------------- |
| approval request payload shape の drift が発生する        | HIGH   | shared 化せず local alias で実在形状に揃える |
| `SkillLifecyclePanel.tsx` の既存 approval UI との二重表示 | MEDIUM | Phase 2 アーキテクチャ設計で確認する         |
| cleanup 漏れによるメモリリーク                            | LOW    | useEffect return で unsubscribe を強制       |

## 参照資料

| 参照資料             | パス                                               | 説明           |
| -------------------- | -------------------------------------------------- | -------------- |
| アーキテクチャ設計   | `outputs/phase-2/architecture-design.md`           | Phase 2 成果物 |
| IPC契約設計          | `outputs/phase-2/ipc-contract-design.md`           | Phase 2 成果物 |
| テスト戦略           | `outputs/phase-2/test-strategy.md`                 | Phase 2 成果物 |
| 依存整合マトリクス   | `outputs/phase-2/dependency-consistency-matrix.md` | Phase 2 成果物 |
| 要件定義書           | `outputs/phase-1/requirements-definition.md`       | Phase 1 成果物 |
| 受け入れ基準         | `outputs/phase-1/acceptance-criteria.md`           | Phase 1 成果物 |
| トレーサビリティ行列 | `outputs/phase-1/traceability-matrix.md`           | Phase 1 成果物 |

## 実行手順

1. Phase 2 全成果物を読み込む。
2. レビューチェックリストを全項目実行する。
3. MAJOR/MINOR/PASS を判定する。
4. MAJOR が 1 件以上あれば Phase 2 へ差し戻す。
5. MINOR は未タスク候補として記録し PASS とする。
6. ゲート判定を `outputs/phase-3/gate-decision.md` に記録する。

## ゲート判定基準

| 判定             | 条件                     | アクション                 |
| ---------------- | ------------------------ | -------------------------- |
| PASS             | MAJOR 0件                | Phase 4 へ進む             |
| CONDITIONAL_PASS | MAJOR 0件・MINOR 1件以上 | MINOR を未タスク化して進む |
| FAIL             | MAJOR 1件以上            | Phase 2 へ差し戻す         |

## 成果物

| 成果物           | パス                                         | 説明               |
| ---------------- | -------------------------------------------- | ------------------ |
| 設計レビュー結果 | `outputs/phase-3/design-review-result.md`    | レビュー詳細結果   |
| ゲート判定       | `outputs/phase-3/gate-decision.md`           | PASS/FAIL判定記録  |
| 矛盾チェック表   | `outputs/phase-3/contradiction-checklist.md` | 矛盾・漏れ確認結果 |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] ゲート判定が記録されている（PASS / CONDITIONAL_PASS / FAIL）
- [ ] MAJOR 指摘が 0 件であることを確認（または差し戻し）
- [ ] MINOR 指摘が未タスク候補として記録されている
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 整合性が取れていることを確認
- [ ] 依存関係が取れていることを確認
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. SubAgent-A/B/C の並列レビュー
3. SubAgent-D の統合判定
4. 成果物出力
5. ゲート判定記録

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/ut-sdk-07-approval-request-surface-001
```

## 次のPhase

Phase 4: テスト作成
