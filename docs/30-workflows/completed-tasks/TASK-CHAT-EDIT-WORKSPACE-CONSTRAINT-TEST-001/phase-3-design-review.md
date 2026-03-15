# Phase 3: 設計レビュー

## メタ情報

| 項目   | 値                                           |
| ------ | -------------------------------------------- |
| Phase  | 3                                            |
| 機能名 | TASK-CHAT-EDIT-WORKSPACE-CONSTRAINT-TEST-001 |
| 作成日 | 2026-03-14                                   |

## 目的

Phase 1（要件定義）と Phase 2（設計）の成果物を多角的に検証し、Phase 4 以降の実行を承認する。

## 実行タスク

- 要件妥当性検証: FR/NFR が元のタスク指示書の要求を網羅しているか確認
- 設計妥当性検証: テストアーキテクチャ・モック戦略が適切か確認
- simpler alternative の検討: より単純な設計代替案の有無を検証

## 参照資料

| 資料名         | パス                                                                                | 説明       |
| -------------- | ----------------------------------------------------------------------------------- | ---------- |
| Phase 1 成果物 | `outputs/phase-1/requirements.md`                                                   | 要件定義   |
| Phase 2 成果物 | `outputs/phase-2/design.md`                                                         | 設計書     |
| タスク指示書   | `docs/30-workflows/completed-tasks/task-chat-edit-workspace-constraint-test-001.md` | 元の指示書 |

## 実行手順

### ステップ1: 要件カバレッジ確認

タスク指示書の受入基準と Phase 1 の FR/NFR を突き合わせる。

| タスク指示書の受入基準                                          | Phase 1 FR/NFR | カバー状況 |
| --------------------------------------------------------------- | -------------- | ---------- |
| TC-WS-01: workspace 内ファイルは PASS                           | FR-001         | 確認       |
| TC-WS-02: workspace 外ファイルは PERMISSION_DENIED              | FR-002         | 確認       |
| TC-WS-03: workspacePath 未指定時、isAllowedPath 未呼び出し      | FR-003         | 確認       |
| TC-WS-04: パストラバーサル攻撃で PERMISSION_DENIED              | FR-004         | 確認       |
| TC-WS-05: 複数コンテキストの 1 つが外なら全体 PERMISSION_DENIED | FR-005         | 確認       |
| TC-WS-06: 空コンテキスト配列で isAllowedPath 未呼び出し         | FR-006         | 確認       |
| Branch Coverage 70%以上                                         | NFR-001        | 確認       |
| 既存テストへの影響なし                                          | NFR-002        | 確認       |
| P42: .trim() バリデーション確認                                 | -              | 確認       |

### ステップ2: 設計レビュー観点

#### 2.1 テストファイル分離の妥当性

- 新規ファイル `chatEditHandlers.workspace-constraint.test.ts` としての分離は適切か
- 既存 `chatEditHandlers.security.test.ts` に追加する方が良いケースがないか検討
- **判断**: workspace 制約は独立した関心事であるため、分離が適切

#### 2.2 モック戦略の妥当性

- `vi.hoisted()` による electron・ipc-validator のモックは既存パターンと一致
- `isAllowedPath` を `vi.spyOn` で実装保持しつつ呼び出し検証する戦略は適切
- RuntimeResolver のモックで `type: "integrated"` を返す設計は正しいか
  - **確認**: 実装では `resolution.type === "handoff"` の分岐があるため、"integrated" でない場合もテストすべきか検討 → 本タスクスコープは workspacePath 検証のみなので不要

#### 2.3 simpler alternative の検討

| 代替案                                     | 評価     | 理由                                           |
| ------------------------------------------ | -------- | ---------------------------------------------- |
| isAllowedPath を直接テスト                 | 不採用   | ハンドラ内での呼び出しパターンが検証できない   |
| chatEditHandlers.security.test.ts に追加   | 不採用   | 既存テストへの影響リスク（NFR-002 違反）       |
| PathValidator.test.ts として独立テスト     | 不採用   | ハンドラ統合の検証が目的のため不適切           |
| 新規ファイルでハンドラ直接テスト（採用案） | **採用** | 関心事分離・状態隔離・影響回避の全要件を満たす |

### ステップ3: レビュー判定

| 判定基準                         | 結果 |
| -------------------------------- | ---- |
| 要件カバレッジ: 全 TC がカバー   | PASS |
| 設計整合性: 既存パターン踏襲     | PASS |
| simpler alternative 検討済み     | PASS |
| P57/P58/P59/P61 対策が設計に反映 | PASS |

#### 判定基準

| 判定              | 対応                  |
| ----------------- | --------------------- |
| PASS              | Phase 4 へ            |
| MINOR             | 指摘対応後 Phase 4 へ |
| MAJOR（要件問題） | Phase 1 へ戻る        |
| MAJOR（設計問題） | Phase 2 へ戻る        |

## 統合テスト連携（Phase 3）

- 設計レビューでテスト設計の統合テスト観点を確認
- 既存テスト実行コマンドが正しいことを確認

## 多角的チェック観点（AIが判断）

| 観点         | 適用判断                             | 仕様参照先                                          |
| ------------ | ------------------------------------ | --------------------------------------------------- |
| セキュリティ | パストラバーサル攻撃防止のテスト設計 | `aiworkflow-requirements: security-electron-ipc.md` |
| IPC通信      | IPC ハンドラのモック設計の妥当性     | `aiworkflow-requirements: api-ipc-agent.md`         |

## 成果物

| 成果物       | パス                                      | 説明         |
| ------------ | ----------------------------------------- | ------------ |
| レビュー結果 | `outputs/phase-3/design-review-result.md` | レビュー判定 |

## 完了条件

- [ ] 要件カバレッジ: タスク指示書の全受入基準が FR/NFR でカバーされている
- [ ] 設計妥当性: モック戦略・テストファイル構成が適切
- [ ] simpler alternative の検討結果が記録されている
- [ ] レビュー判定（PASS/MINOR/MAJOR）が記録されている
- [ ] Phase 4 開始条件が明確に定義されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

1. 参照資料の確認
2. 要件カバレッジ確認
3. 設計レビュー観点の検証
4. simpler alternative の検討
5. レビュー判定の記録
6. 成果物の作成・配置
7. 完了条件の検証

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次のPhase

Phase 4: テスト作成
