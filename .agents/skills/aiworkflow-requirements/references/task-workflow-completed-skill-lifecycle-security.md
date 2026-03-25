# タスク実行仕様書生成ガイド / completed records (skill lifecycle - security)

> 親仕様書: [task-workflow-completed-skill-lifecycle.md](task-workflow-completed-skill-lifecycle.md)
> 役割: completed records - セキュリティ・権限ガバナンス系
> 対象タスク: UT-06-003, UT-06-005, TASK-SKILL-LIFECYCLE-06, UT-06-001

## UT-06-003: DefaultSafetyGate 具象クラス実装完了記録（2026-03-16）

### タスク概要

| 項目         | 内容                                                                       |
| ------------ | -------------------------------------------------------------------------- |
| タスクID     | UT-06-003                                                                  |
| 機能         | SafetyGatePort 具象クラス DefaultSafetyGate の Main Process 実装            |
| 実施日       | 2026-03-16                                                                 |
| ステータス   | completed（Phase 1-12）                                                    |
| ワークフロー | `docs/30-workflows/safety-gate-implementation/`                            |
| テスト       | 36 tests PASS（カバレッジ全100%）                                          |

### 実装内容

1. **DefaultSafetyGate**: SafetyGatePort の具象クラスとして5つのセキュリティチェック（critical/high/no-approval/all-low/protected-path）+ グレード集約ロジックを実装
2. **IPC ハンドラ**: `skill:evaluate-safety` チャンネルを追加し、Renderer から SafetyGate 評価を呼び出し可能に
3. **型定義拡充**: `packages/shared/src/types/safety-gate.ts` に SafetyGrade / SafetyGateResult / SafetyCheckId 等の実装型を追加

### 成果物

| ファイル | 内容 |
| --- | --- |
| `packages/shared/src/types/safety-gate.ts` | SafetyGate 関連型定義 |
| `apps/desktop/src/main/permissions/default-safety-gate.ts` | DefaultSafetyGate 具象クラス |
| `apps/desktop/src/main/ipc/safetyGateHandlers.ts` | IPC ハンドラ（skill:evaluate-safety） |

### 検証証跡

| 検証項目 | 結果 |
| --- | --- |
| テスト | 36テスト全PASS |
| Line Coverage | 100% |
| Branch Coverage | 100% |
| Function Coverage | 100% |

---

## UT-06-005: abort/skip/retry/timeout Permission Fallback 実装完了記録（2026-03-16）

### タスク概要

| 項目         | 内容                                                                       |
| ------------ | -------------------------------------------------------------------------- |
| タスクID     | UT-06-005                                                                  |
| 機能         | SkillExecutor の Permission 拒否時 fallback 制御（abort/skip/retry/timeout） |
| 実施日       | 2026-03-16                                                                 |
| ステータス   | completed（Phase 1-12）                                                    |
| ワークフロー | `docs/30-workflows/UT-06-005-abort-skip-retry-fallback/`                   |
| テスト       | 23 tests PASS（SkillExecutor.fallback.test.ts）                            |

### 苦戦箇所

| ID     | 内容                                                | 解決策                                                    |
| ------ | --------------------------------------------------- | --------------------------------------------------------- |
| S-PF-1 | 既実装コードの4ステップ abort フロー発見遅延         | Phase 1 で git log + grep で既存実装有無を確認する         |
| S-PF-2 | revokeSessionEntries スタブ実装の設計判断             | UT-06-005-B として未タスク化、Phase 2 に判断根拠記録       |
| S-PF-3 | PERMISSION_MAX_RETRIES デッドコードと Set メモリリーク | 定数参照統一 + セッション単位 clear 機構追加               |

### 派生未タスク（3件）

| タスクID    | 内容                                  | 優先度 |
| ----------- | ------------------------------------- | ------ |
| UT-06-005-A | PreToolUse Hook への fallback 統合    | 高     |
| UT-06-005-B | revokeSessionEntries セッション別実装 | 中     |
| UT-06-005-C | SkillStreamMessageType abort/skip 追加 | 中    |

### 検証証跡

- Phase 12 全 Task PASS（phase12-task-spec-compliance-check.md）
- 未タスク 3件検出、3ステップ完了（指示書 + backlog + 仕様書リンク）
- `workflow-permission-fallback-abort-skip-retry.md` に統合正本を作成

---

## TASK-SKILL-LIFECYCLE-06: 信頼・権限ガバナンス（設計タスク）完了記録（2026-03-16）

| 項目 | 内容 |
| --- | --- |
| タスクID | TASK-SKILL-LIFECYCLE-06 |
| タスク種別 | design |
| ステータス | spec_created |
| 完了日 | 2026-03-16 |
| Phase完了 | 1-12 完了、13（PR作成）未実施 |
| 成果物ディレクトリ | `docs/30-workflows/skill-lifecycle-unification/tasks/step-05-par-task-06-trust-permission-governance/` |

主要設計成果物:
- `outputs/phase-2/` : 型定義設計（ToolRiskLevel / AllowedToolEntryV2 / SafetyGatePort / PERMISSION_HISTORY_MAX_ENTRIES）
- `outputs/phase-12/implementation-guide.md` : Part 1（概念説明）/ Part 2（実装詳細）

Phase 10 ゲート判定: PASS
Phase 11 ウォークスルー: 実施済み

未タスク検出: UT-06-001〜UT-06-008（8件）登録済み

---

### UT-06-001 (tool-risk-config-implementation)

| タスクID | UT-06-001 |
| タスク種別 | implementation |
| ステータス | completed |
| 完了日 | 2026-03-16 |
| Phase完了 | 1-12 完了、13（PR作成）未実施 |
| GitHub Issue | #1251 |
| 成果物ディレクトリ | `docs/30-workflows/tool-risk-config-implementation/` |

主要実装成果物:
- `packages/shared/src/constants/security.ts` : RiskLevel 型・ToolRiskConfigEntry interface・TOOL_RISK_CONFIG 定数（Object.freeze 深層凍結）
- `packages/shared/src/constants/security.test.ts` : 18テスト ALL PASS
- `packages/shared/src/constants/index.ts` : 型・定数の re-export 追加

セキュリティ不変条件:
- `TOOL_RISK_CONFIG.high.allowPermanent === false`（恒久許可禁止）
- `TOOL_RISK_CONFIG.high.allowTime24h === false`（24時間許可禁止）
- `TOOL_RISK_CONFIG.high.allowTime7d === false`（7日間許可禁止）

Phase 10 ゲート判定: PASS
Phase 11 手動テスト: NON_VISUAL（CLI環境、UI変更なし）

後続ブロッカー解消: UT-06-004（PermissionDialog）、TASK-SKILL-LIFECYCLE-08

## UT-06-002: AllowedToolEntryV2 PermissionStore V2 拡張完了記録（2026-03-23）

### メタ情報

| 項目         | 値                                                                         |
| ------------ | -------------------------------------------------------------------------- |
| タスクID     | UT-06-002                                                                  |
| タスク名     | AllowedToolEntryV2 PermissionStore 適用                                    |
| ワークフロー | `docs/30-workflows/UT-06-002-permission-store-v2/`                         |
| 完了日       | 2026-03-23                                                                 |
| ステータス   | Phase 1-12 完了（Phase 13 PR待ち）                                         |

### 実装サマリ

- **AllowedToolEntryV2**: V1 拡張。expiresAt / skillName / expiryPolicy フィールド追加
- **ExpiryPolicy**: `"session"` / `"time_24h"` / `"time_7d"` / `"permanent"` の4種
- **isToolAllowed 6分岐フロー**: Lazy eviction パターンで期限切れエントリを遅延削除
- **allowToolV2**: ExpiryPolicy に応じた expiresAt 自動計算（calcExpiresAt）
- **permission:clear-session IPC**: セッション終了時のセッションスコープ権限一括クリア
- **V1→V2 マイグレーション**: 起動時に V1 エントリを自動的に V2 形式へアップグレード
- **revokeSessionEntries (V2)**: セッション別の権限エントリ取消
- **getAllowedToolEntriesV2**: V2 形式での全エントリ取得

### 新規型定義

- `AllowedToolEntryV2` / `ExpiryPolicy` / `IPermissionStoreV2` / `PermissionStoreSchemaV2` / `ClearSessionResponse`

### 新規関数

- `calcExpiresAt(policy: ExpiryPolicy): number | null`

### 未タスク検出

| ID             | 内容                    | 優先度 |
| -------------- | ----------------------- | ------ |
| ~~UT-06-002-UT-1~~ | ~~sender 検証追加~~ | ~~中~~ | **完了**（2026-03-24、withValidation 全4ハンドラ適用、42テスト全PASS） |
| UT-06-002-UT-2 | before-quit フック      | 中     |
| UT-06-002-UT-3 | calcExpiresAtLocal 重複解消 | 低 |
| UT-06-002-UT-4 | ロガー統一              | 低     |
| ~~UT-06-002-UT-5~~ | ~~revokeTool P42バリデーション~~ | ~~低~~ | **再評価クローズ**（2026-03-25、UT-1レビュー改善FIX-3で実装済み） |
| UT-06-002-UT-6 | handler type V2         | 低     |
| ~~UT-06-002-UT-7~~ | ~~unregister テスト追加~~ | ~~低~~ | **再評価クローズ**（2026-03-25、UT-1レビュー改善FIX-5で実装済み） |

Phase 10 ゲート判定: PASS
Phase 11 手動テスト: NON_VISUAL（CLI環境、UI変更なし）
