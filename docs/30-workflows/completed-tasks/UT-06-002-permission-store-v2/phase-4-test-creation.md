# Phase 4: テスト作成

## メタ情報

| 項目     | 値                            |
| -------- | ----------------------------- |
| Phase    | 4                             |
| 機能名   | UT-06-002-permission-store-v2 |
| 作成日   | 2026-03-23                    |
| タスクID | UT-06-002                     |

## 目的

Phase 2 設計書に基づき、V2 拡張のテストケースを設計・実装する（TDD: Red フェーズ）。

## 実行タスク

- Task 4-1: calcExpiresAt 単体テスト設計 — 4ポリシー（session, time_24h, time_7d, permanent）のテストケース TC-CEA-01〜04
- Task 4-2: isToolAllowed 6分岐フローテスト設計 — 全6分岐 + エッジケースの TC-ITA-01〜08
- Task 4-3: allowToolV2 テスト設計 — エントリ追加・上書きの TC-ATV-01〜04
- Task 4-4: revokeSessionEntries テスト設計 — session/permanent/time 混在パターンの TC-RSE-01〜04
- Task 4-5: V1→V2 マイグレーションテスト設計 — TC-MIG-01〜03
- Task 4-6: IPC ハンドラテスト設計 — permission:clear-session の正常系/異常系 TC-IPC-01〜04

## 参照資料

| 資料名     | パス                                                                                                                              | 説明                      |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| 設計書     | `outputs/phase-2/design.md`                                                                                                       | Phase 2 設計              |
| Phase 5 IF | `docs/30-workflows/completed-tasks/step-05-par-task-06-trust-permission-governance/outputs/phase-5/permission-store-interface.ts` | V2 インターフェース       |
| 既存テスト | `apps/desktop/src/main/services/skill/__tests__/PermissionStore.test.ts`                                                          | V1 テスト（存在する場合） |

## 実行手順

### ステップ1: テストケース設計

設計書の各メソッドに対してテストケースを設計し、テスト設計書に記録する。

### ステップ2: テストコード作成

テストケースをコードに実装する。配置先はプロジェクトの該当ディレクトリ（`outputs/` 配下ではない）。

| テストファイル                      | 対象                 | 配置先                                            |
| ----------------------------------- | -------------------- | ------------------------------------------------- |
| `calcExpiresAt.test.ts`             | `calcExpiresAt` 関数 | `packages/shared/src/types/__tests__/`            |
| `PermissionStore.test.ts`           | PermissionStore V2   | `apps/desktop/src/main/services/skill/__tests__/` |
| `permission-store-handlers.test.ts` | IPC ハンドラ         | `apps/desktop/src/main/ipc/__tests__/`            |

## 統合テスト連携

Phase 4 はテストコード作成フェーズ。テストは Red 状態（実装前のため失敗）を想定。

## 多角的チェック観点

| 観点         | 適用 | 確認内容                                                 |
| ------------ | ---- | -------------------------------------------------------- |
| セキュリティ | 適用 | P42準拠 3段バリデーションテスト（空文字列/スペースのみ） |
| IPC通信      | 適用 | IPC ハンドラレスポンス形式の一貫性（P60対策）            |
| データ整合性 | 適用 | V1→V2 マイグレーションの境界値テスト                     |

## 成果物

| 成果物       | パス                             | 説明             |
| ------------ | -------------------------------- | ---------------- |
| テスト設計書 | `outputs/phase-4/test-design.md` | テストケース設計 |

## 完了条件

- [ ] テストケースが全 FR をカバーしている
- [ ] 6分岐フローの全パスがテストケースに含まれている
- [ ] P42準拠 3段バリデーションテスト（空文字列/スペースのみ）が含まれている
- [ ] V1→V2 マイグレーションテストが含まれている
- [ ] テストファイルの配置先がコード成果物ディレクトリになっている（outputs/ ではない）
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 5: 実装
