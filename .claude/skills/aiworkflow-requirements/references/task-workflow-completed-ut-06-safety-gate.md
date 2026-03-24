# タスク実行仕様書生成ガイド / completed records (UT-06 safety gate)

> 親仕様書: [task-workflow-completed-skill-lifecycle.md](task-workflow-completed-skill-lifecycle.md)
> 役割: completed records (UT-06 safety gate サブタスク群アーカイブ)
> 分割元: `task-workflow-completed-skill-lifecycle.md`（500行超のため分割）
> 対象タスク: UT-06-001, UT-06-003, UT-06-005

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

## UT-06-003-PRELOAD-API-IMPL: evaluateSafety Preload API 追加完了記録（2026-03-23）

### タスク概要

| 項目         | 内容                                                                       |
| ------------ | -------------------------------------------------------------------------- |
| タスクID     | UT-06-003-PRELOAD-API-IMPL                                                 |
| 機能         | Preload 層に evaluateSafety safeInvoke 呼び出し追加（Renderer → Main 通信チェーン完成） |
| 実施日       | 2026-03-23                                                                 |
| ステータス   | completed（Phase 1-13）                                                    |
| ワークフロー | `docs/30-workflows/safety-gate-preload-api/`                               |
| テスト       | 6 tests PASS（skill-api.evaluateSafety.test.ts）                           |

### 実装内容

1. **evaluateSafety メソッド**: `skillAPI` に `evaluateSafety(skillName: string)` を追加。`safeInvoke` + `IPC_CHANNELS.SKILL_EVALUATE_SAFETY` で Main Process の SafetyGate を呼び出し
2. **ホワイトリスト登録**: `ALLOWED_INVOKE_CHANNELS` に `SKILL_EVALUATE_SAFETY` を追加
3. **型定義**: `SafetyGateResult` を `@repo/shared` からインポート、インターフェースに追加

### 成果物

| ファイル | 内容 |
| --- | --- |
| `apps/desktop/src/preload/skill-api.ts` | evaluateSafety interface + 実装 |
| `apps/desktop/src/preload/__tests__/skill-api.evaluateSafety.test.ts` | T-1〜T-6 テスト |

### 検証証跡

| 検証項目 | 結果 |
| --- | --- |
| テスト | 6テスト全PASS |
| P23（型二重定義なし） | PASS |
| P27（ハードコード文字列なし） | PASS |
| P42（Main側バリデーション） | PASS（スコープ外） |
| P60（レスポンス形式） | PASS |
| P61（DIP/SafetyGatePort） | PASS |

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

## UT-06-001: tool-risk-config-implementation 完了記録（2026-03-16）

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
