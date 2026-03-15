# Phase 3: 設計レビュー - タスク仕様書

## メタ情報

| 項目       | 内容                                                       |
| ---------- | ---------------------------------------------------------- |
| Phase      | 3                                                          |
| Phase名    | 設計レビュー                                               |
| タスクID   | UT-IMP-SKILL-AGENT-RUNTIME-ROUTING-INTEGRATION-CLOSURE-001 |
| 前提Phase  | Phase 2（設計）                                            |
| 後続Phase  | Phase 4（テスト作成）                                      |
| ステータス | completed                                                  |
| 作成日     | 2026-03-14                                                 |
| 機能名     | runtime-routing-integration-closure                        |

## 目的

Phase 2 の設計が要件を満たし、既存の保証（preflight / permission / streaming）を破壊しないことを多角的に検証する。

## 実行タスク

- 要件充足検証: Phase 1 の要件と受入基準が Phase 2 の設計で全てカバーされているかを検証する
- 契約整合性検証: 既存の preflight / permission / streaming 契約が設計で維持されていることを検証する
- DI 設計検証: RuntimeResolver の共通化と composition root への DI が P5（二重登録防止）に準拠していることを検証する
- UI/UX 検証: TerminalHandoffCard が Apple HIG / WCAG 2.1 AA に準拠していることを検証する
- 状態管理検証: Zustand Store の handoff 状態管理が P31 / P48 に準拠していることを検証する
- セキュリティ検証: authMode / API Key の取扱いが security-skill-execution.md に準拠していることを検証する

## 参照資料

| 参照資料               | パス                                         | 内容                                 |
| ---------------------- | -------------------------------------------- | ------------------------------------ |
| Phase 1 要件定義書     | `outputs/phase-1/requirements-definition.md` | 要件と受入基準                       |
| Phase 1 スコープ定義   | `outputs/phase-1/scope-definition.md`        | 対象範囲と除外範囲                   |
| Phase 2 設計サマリー   | `outputs/phase-2/design-summary.md`          | 全設計の概要と判断根拠               |
| Phase 2 契約マトリクス | `outputs/phase-2/contract-matrix.md`         | 変更前後のインターフェース契約対照表 |
| Phase 2 UI/UX 実現     | `outputs/phase-2/ui-ux-realization.md`       | TerminalHandoffCard の UI 仕様       |

### システム仕様（aiworkflow-requirements）

> 設計レビューで以下の正本仕様との整合を確認する。

| 参照資料                      | パス                                                                                 | 内容                           |
| ----------------------------- | ------------------------------------------------------------------------------------ | ------------------------------ |
| interfaces-agent-sdk-executor | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor.md` | execute 契約と error code 正本 |
| interfaces-agent-sdk-ui       | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-ui.md`       | Agent SDK UI / Hook の正本     |
| security-skill-execution      | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md`      | permission と trust 境界の正本 |
| arch-electron-services        | `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md`        | Main service DI の正本         |
| arch-state-management         | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`         | Zustand Store 設計の正本       |
| ui-ux-agent-execution         | `.claude/skills/aiworkflow-requirements/references/ui-ux-agent-execution.md`         | Agent surface の UI 契約       |

## 実行手順

### ステップ1: 要件充足マトリクスを作成する

Phase 1 の各要件に対して、Phase 2 の設計がどのように対応しているかをマトリクスで検証する。

| 要件ID | 要件内容                      | 設計対応箇所               | 充足判定 |
| ------ | ----------------------------- | -------------------------- | -------- |
| REQ-1  | runtime routing 分岐（3パス） | RuntimeResolver 共通化設計 | -        |
| REQ-2  | authMode 参照（Hook）         | Hook 分岐設計              | -        |
| REQ-3  | TerminalHandoffCard 表示      | UI コンポーネント設計      | -        |
| REQ-4  | preflight 契約維持            | 契約マトリクス             | -        |
| REQ-5  | permission 契約維持           | 契約マトリクス             | -        |

### ステップ2: レビュー観点チェックリストを実行する

| レビュー観点        | チェック項目                                                     | 結果 |
| ------------------- | ---------------------------------------------------------------- | ---- |
| 要件充足            | 全要件が設計でカバーされている                                   | -    |
| 既存保証維持        | preflight / permission / streaming 契約が維持されている          | -    |
| DI 設計（P5）       | リスナー二重登録のリスクがない                                   | -    |
| 状態管理（P31/P48） | 合成 Hook 未使用、useShallow 適用が必要な箇所が特定されている    | -    |
| UI/UX（Apple HIG）  | 角丸、スペーシング、カラーが Apple HIG 準拠                      | -    |
| アクセシビリティ    | コントラスト比 4.5:1 以上、ARIA ラベル付与                       | -    |
| セキュリティ        | API Key が TerminalHandoffCard / ログに漏洩しない                | -    |
| IPC 契約            | ハンドラ引数と Preload 呼び出し形式が一致（P44/P45 対策）        | -    |
| P42 バリデーション  | 文字列引数に 3段バリデーション（型 → 空文字列 → トリム空文字列） | -    |

### ステップ3: レビュー判定を行う

| 判定  | 条件                                         | 対応                      |
| ----- | -------------------------------------------- | ------------------------- |
| PASS  | 全レビュー観点で問題なし                     | Phase 4 へ進行            |
| MINOR | 軽微な指摘あり（機能影響なし）               | 指摘対応後 Phase 4 へ進行 |
| MAJOR | 重大な問題あり（要件未充足 or 既存保証破壊） | Phase 2 へ戻り設計修正    |

## 統合テスト連携

レビューで統合テストの接続点を確認する:

- RuntimeResolver と各ハンドラの DI 接続設計が統合テスト可能な構造であること
- TerminalHandoffCard と Store の接続が単体テスト・統合テスト両方で検証可能であること
- Renderer Hook の authMode 分岐がモック可能な構造であること

## 成果物

| 成果物           | パス                                      | 内容                   |
| ---------------- | ----------------------------------------- | ---------------------- |
| 設計レビュー結果 | `outputs/phase-3/design-review-result.md` | レビュー判定と指摘事項 |

## 完了条件

- [ ] 要件充足マトリクスが作成され、全要件が設計でカバーされている
- [ ] レビュー観点チェックリストの全項目が確認済み
- [ ] レビュー判定（PASS / MINOR / MAJOR）が記録されている
- [ ] MINOR 指摘がある場合、対応方針が記録されている
- [ ] MAJOR 判定の場合、Phase 2 への戻り理由が記録されている
- [ ] 既存 preflight / permission / streaming 契約の維持が設計レベルで確認されている
- [ ] P5 / P31 / P42 / P44 / P45 / P48 の各 Pitfall 対策が設計に反映されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

- [Phase 4（テスト作成）](./phase-4-test-creation.md) に進む
