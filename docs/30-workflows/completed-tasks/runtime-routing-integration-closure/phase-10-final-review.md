# Phase 10: 最終レビュー - タスク仕様書

## メタ情報

| 項目       | 内容                                                       |
| ---------- | ---------------------------------------------------------- |
| Phase      | 10                                                         |
| Phase名    | 最終レビュー                                               |
| タスクID   | UT-IMP-SKILL-AGENT-RUNTIME-ROUTING-INTEGRATION-CLOSURE-001 |
| 前提Phase  | Phase 9（品質検証）                                        |
| 後続Phase  | Phase 11（手動テスト）                                     |
| ステータス | completed                                                  |
| 作成日     | 2026-03-14                                                 |
| 機能名     | runtime-routing-integration-closure                        |

## 目的

実装完了後、全体的な品質・整合性を多角的に検証し、Phase 11 へ進む判定を行う。要件充足・設計忠実度・テスト品質・既存保証・セキュリティ・IPC 契約の9観点で評価する。

## 実行タスク

- **要件充足確認**: Phase 1 で定義した全要件（3実行パスの runtime routing 分岐、authMode 参照、TerminalHandoffCard 表示）が実装で満たされているかを確認する
- **設計忠実度確認**: Phase 2 の設計（RuntimeResolver 共通化、DI 設計、状態管理設計）が Phase 5-8 の実装で正確に反映されているかを確認する
- **テスト品質確認**: Phase 9 のカバレッジレポートで基準を達成していること、境界値・異常系がカバーされていることを確認する
- **既存保証確認**: preflight / permission / streaming 契約が実装後も維持されていることを確認する
- **DI 設計確認**: P5 準拠でリスナー二重登録がないことを確認する
- **状態管理確認**: P31 / P48 準拠で個別セレクタと useShallow が明示的に使用されていることを確認する
- **UI/UX 確認**: TerminalHandoffCard が Apple HIG / WCAG 2.1 AA に準拠していることを確認する
- **セキュリティ確認**: API Key が TerminalHandoffCard / ログに漏洩していないことを Phase 9 の結果で確認する
- **IPC 契約確認**: P42 / P44 / P45 準拠で全ハンドラのバリデーションと引数形式が整合していることを確認する

## 参照資料

| 参照資料                 | パス                                                                           | 内容                                       |
| ------------------------ | ------------------------------------------------------------------------------ | ------------------------------------------ |
| Phase 1 要件定義書       | `outputs/phase-1/requirements-definition.md`                                   | gap マトリクスと受入基準                   |
| Phase 2 設計サマリー     | `outputs/phase-2/design-summary.md`                                            | 全設計の概要と判断根拠                     |
| Phase 2 契約マトリクス   | `outputs/phase-2/contract-matrix.md`                                           | 変更前後のインターフェース契約対照表       |
| Phase 2 UI/UX 実現仕様   | `outputs/phase-2/ui-ux-realization.md`                                         | TerminalHandoffCard の UI 仕様             |
| Phase 3 設計レビュー結果 | `outputs/phase-3/design-review-result.md`                                      | レビュー判定と指摘事項（MINOR 対応確認用） |
| Phase 5 実装サマリー     | `outputs/phase-5/implementation-summary.md`                                    | 実装した変更点の一覧                       |
| Phase 9 品質レポート     | `outputs/phase-9/quality-report.md`                                            | 品質ゲート表（全9項目の結果）              |
| TerminalHandoffCard      | `apps/desktop/src/renderer/components/organisms/TerminalHandoffCard/index.tsx` | UI コンポーネント実装                      |
| useSkillExecution        | `apps/desktop/src/renderer/hooks/useSkillExecution.ts`                         | authMode 分岐追加後の実装                  |
| useAgent                 | `apps/desktop/src/renderer/hooks/useAgent.ts`                                  | authMode 分岐追加後の実装                  |

### システム仕様（aiworkflow-requirements）

| 参照資料                      | パス                                                                                 | 内容                           |
| ----------------------------- | ------------------------------------------------------------------------------------ | ------------------------------ |
| interfaces-agent-sdk-executor | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor.md` | execute 契約と error code 正本 |
| interfaces-agent-sdk-ui       | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-ui.md`       | Agent SDK UI / Hook の正本     |
| security-skill-execution      | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md`      | permission と trust 境界の正本 |
| arch-electron-services        | `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md`        | Main service DI の正本         |
| arch-state-management         | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`         | Zustand Store 設計の正本       |
| ui-ux-agent-execution         | `.claude/skills/aiworkflow-requirements/references/ui-ux-agent-execution.md`         | Agent surface の UI 契約       |

## 実行手順

### ステップ1: 要件充足マトリクスの確認

Phase 1 の要件に対して実装が対応していることを確認する:

| 要件ID | 要件内容                                    | 実装対応箇所                                   | 充足判定 |
| ------ | ------------------------------------------- | ---------------------------------------------- | -------- |
| REQ-1  | SkillExecutor の runtime routing 分岐       | SkillExecutor.ts + RuntimeResolver.ts          | -        |
| REQ-2  | AgentExecutor の runtime routing 分岐       | AgentExecutor.ts + RuntimeResolver.ts          | -        |
| REQ-3  | SkillCreatorService の runtime routing 分岐 | SkillCreatorService.ts + RuntimeResolver.ts    | -        |
| REQ-4  | useSkillExecution の authMode 分岐          | useSkillExecution.ts                           | -        |
| REQ-5  | useAgent の authMode 分岐                   | useAgent.ts                                    | -        |
| REQ-6  | TerminalHandoffCard の表示（handoff 時）    | TerminalHandoffCard/index.tsx                  | -        |
| REQ-7  | preflight 契約の維持                        | skillExecutionAuthPreflight.ts（変更なし確認） | -        |
| REQ-8  | permission 契約の維持                       | 既存 permission ハンドラ（変更なし確認）       | -        |
| REQ-9  | streaming 契約の維持                        | 既存 streaming ハンドラ（変更なし確認）        | -        |

### ステップ2: 設計忠実度の確認

Phase 2 で確定した設計が実装に反映されているかを確認する:

| 設計項目                     | 設計内容（Phase 2）                                              | 実装確認                                | 一致判定 |
| ---------------------------- | ---------------------------------------------------------------- | --------------------------------------- | -------- |
| RuntimeResolver 配置先       | `services/runtime/RuntimeResolver.ts`                            | ファイル存在確認                        | -        |
| DI 方式                      | composition root で1回生成、各ハンドラに注入                     | `registerAllIpcHandlers` の DI 実装確認 | -        |
| handoff 状態の Store 管理    | `agentSlice` に `handoffGuidance: HandoffGuidance / null` を追加 | Store slice の実装確認                  | -        |
| TerminalHandoffCard の Props | `guidance`, `onCopyCommand`, `onDismiss`                         | コンポーネント Props 型定義確認         | -        |
| useHandoffGuidance セレクタ  | 個別セレクタとして追加（P31 準拠）                               | セレクタ実装確認                        | -        |

### ステップ3: 多角的レビューチェックリストの実行

| レビュー観点           | チェック項目                                                                               | 結果 | 指摘 |
| ---------------------- | ------------------------------------------------------------------------------------------ | ---- | ---- |
| 要件充足               | Phase 1 の全9要件が実装でカバーされている                                                  | -    | -    |
| 設計忠実度             | Phase 2 の全設計項目が実装に反映されている                                                 | -    | -    |
| テスト品質             | Line 80%+, Branch 60%+, Function 80%+ 達成。境界値（`handoffGuidance === null`）カバー済み | -    | -    |
| 既存保証（preflight）  | `skillExecutionAuthPreflight.ts` の API Key 確認ロジックが変更されていない                 | -    | -    |
| 既存保証（permission） | permission ダイアログの表示契約が維持されている                                            | -    | -    |
| 既存保証（streaming）  | streaming 完了コールバックの契約が維持されている                                           | -    | -    |
| DI 設計（P5）          | RuntimeResolver が composition root で1回だけ生成されている（二重登録なし）                | -    | -    |
| 状態管理（P31）        | `useHandoffGuidance()` 等の個別セレクタを使用している（合成 Hook 未使用）                  | -    | -    |
| 状態管理（P48）        | 派生セレクタに `useShallow` が適用されている（配列返却セレクタが存在する場合）             | -    | -    |
| UI/UX（Apple HIG）     | 角丸 8-12px、スペーシング 8px グリッド、Apple システムカラー準拠                           | -    | -    |
| アクセシビリティ       | コントラスト比 4.5:1 以上（通常テキスト）。ARIA ラベル付与済み                             | -    | -    |
| セキュリティ           | API Key が TerminalHandoffCard props / ログに含まれていない（Phase 9 確認済み）            | -    | -    |
| IPC 契約（P42）        | 全文字列 IPC 引数に3段バリデーション（型 → 空文字列 → トリム空文字列）                     | -    | -    |
| IPC 契約（P44/P45）    | ハンドラ引数形式と Preload 呼び出し形式が一致。引数名のセマンティクスが一致                | -    | -    |

### ステップ4: 判定基準に従ってレビュー判定を行う

| 判定     | 条件                                                             | 対応                                                   |
| -------- | ---------------------------------------------------------------- | ------------------------------------------------------ |
| PASS     | 全14観点で問題なし                                               | Phase 11 へ進行                                        |
| MINOR    | 軽微な指摘あり（機能影響なし・将来の保守性への影響のみ）         | 未タスク仕様書に変換後 Phase 11 へ進行（**省略不可**） |
| MAJOR    | 重大な問題あり（要件未充足・既存保証破壊・セキュリティ問題）     | 影響範囲に応じて Phase 1-5 へ戻る                      |
| CRITICAL | 致命的な問題あり（API Key 漏洩・データ破壊リスク・契約根本破壊） | Phase 1 へ戻り要件再確認                               |

**MINOR 指摘の取扱い**:

- MINOR 指摘は「機能影響なし」であっても省略不可
- 各 MINOR 指摘に対して `docs/30-workflows/unassigned-task/` に指示書を作成する
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md` の残課題テーブルに登録する
- 関連仕様書に参照リンクを追加する

### ステップ5: 全テスト結果・カバレッジの最終確認

```bash
# 最終テスト実行（Phase 9 から変更がある場合）
pnpm --filter @repo/desktop test -- --coverage
```

Phase 9 の `quality-report.md` の品質ゲート表が全9項目 PASS であることを確認し、最終レビュー結果に記録する。

## 統合テスト連携

全テスト結果の最終確認とカバレッジの最終確認を行う。以下の統合テストを明示的に最終確認する:

- RuntimeResolver が `integrated` を返す場合の SkillExecutor / AgentExecutor / SkillCreatorService の動作
- RuntimeResolver が `handoff` を返す場合の TerminalHandoffCard 表示フロー（IPC → Preload → Hook → Store → コンポーネント）
- `handoffGuidance` が `null` の場合に TerminalHandoffCard が表示されないこと
- preflight 失敗時に runtime routing が呼ばれずに早期リターンすること

## 多角的チェック観点（AIが判断）

| 観点                        | 適用判断                                       | 仕様参照先                                                  |
| --------------------------- | ---------------------------------------------- | ----------------------------------------------------------- |
| 要件充足                    | 該当（Phase 1 全要件の実装確認）               | `outputs/phase-1/requirements-definition.md`                |
| 設計忠実度                  | 該当（Phase 2 全設計の実装確認）               | `outputs/phase-2/design-summary.md`                         |
| テスト品質                  | 該当（カバレッジ基準達成確認）                 | `outputs/phase-9/quality-report.md`                         |
| 既存保証（preflight）       | 該当（API Key Preflight 契約維持確認）         | `aiworkflow-requirements: security-skill-execution.md`      |
| DI 設計（P5）               | 該当（リスナー二重登録なし確認）               | `aiworkflow-requirements: arch-electron-services.md`        |
| 状態管理（P31/P48）         | 該当（個別セレクタ + useShallow 適用確認）     | `aiworkflow-requirements: arch-state-management.md`         |
| UI/UX（Apple HIG）          | 該当（TerminalHandoffCard の視覚仕様確認）     | `aiworkflow-requirements: ui-ux-agent-execution.md`         |
| アクセシビリティ（WCAG AA） | 該当（コントラスト比 4.5:1, ARIA ラベル確認）  | `aiworkflow-requirements: ui-ux-agent-execution.md`         |
| セキュリティ                | 該当（API Key 非漏洩の最終確認）               | `aiworkflow-requirements: security-skill-execution.md`      |
| IPC 契約（P42/P44/P45）     | 該当（バリデーション・引数形式整合の最終確認） | `aiworkflow-requirements: interfaces-agent-sdk-executor.md` |

## 成果物

| 成果物           | パス                                      | 内容                                                                    |
| ---------------- | ----------------------------------------- | ----------------------------------------------------------------------- |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md` | レビュー判定（PASS/MINOR/MAJOR/CRITICAL）、観点別チェック結果、指摘事項 |

## 完了条件

- [ ] 要件充足マトリクスが作成され、Phase 1 の全9要件が実装でカバーされていることが確認されている
- [ ] 設計忠実度の確認が完了し、Phase 2 の全設計項目が実装に反映されていることが確認されている
- [ ] 多角的レビューチェックリストの全14観点が確認されている
- [ ] レビュー判定（PASS / MINOR / MAJOR / CRITICAL）が `final-review-result.md` に記録されている
- [ ] MINOR 判定の指摘がある場合、全指摘に対して未タスク仕様書（`docs/30-workflows/unassigned-task/`）が作成されている（省略不可）
- [ ] MAJOR / CRITICAL 判定の場合、戻る Phase とその理由が `final-review-result.md` に記録されている
- [ ] 既存の preflight / permission / streaming 契約が実装後も維持されていることが確認されている
- [ ] Phase 9 の品質レポートで全品質ゲートが PASS していることが最終確認されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

- [Phase 11（手動テスト）](./phase-11-manual-test.md) に進む
