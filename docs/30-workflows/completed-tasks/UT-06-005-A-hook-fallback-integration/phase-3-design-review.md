# Phase 3: 設計レビュー

## メタ情報

| 項目   | 値                                    |
| ------ | ------------------------------------- |
| Phase  | 3                                     |
| 機能名 | UT-06-005-A-hook-fallback-integration |
| 作成日 | 2026-03-17                            |

## 目的

Phase 1（要件定義）と Phase 2（設計）の成果物をレビューし、Phase 4 へ進めるかを判定する。要件カバレッジ、設計の妥当性、セキュリティ要件の充足を検証する。

## 実行タスク

- 要件カバレッジ検証: FR-101〜FR-105、NFR-101〜NFR-105 が設計で全てカバーされていることを確認する
- 設計妥当性検証: handlePermissionCheck メソッドの設計がセキュリティ要件（fail-closed）を満たすことを検証する
- 既存互換性確認: FR-001〜FR-003 への影響がないことを設計レベルで確認する
- リスク評価: 設計上のリスクを特定し、対策を確認する

## 参照資料

| 資料名               | パス                                         | 説明                               |
| -------------------- | -------------------------------------------- | ---------------------------------- |
| Phase 1 要件定義書   | `outputs/phase-1/requirements-definition.md` | 機能要件・非機能要件の定義         |
| Phase 1 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | 受け入れ条件                       |
| Phase 2 設計書       | `outputs/phase-2/architecture-design.md`     | 統合設計とシーケンス図             |
| Phase 2 API仕様      | `outputs/phase-2/api-specification.md`       | 新規メソッドのインターフェース仕様 |

### システム仕様（aiworkflow-requirements）

> 実装前に以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                            | パス                                                                                         | 内容                                    |
| ----------------------------------- | -------------------------------------------------------------------------------------------- | --------------------------------------- |
| Permission フォールバックフロー詳細 | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor-details.md` | abort/skip/retry の分岐ロジックと型定義 |
| fail-closed セキュリティ要件        | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md`              | フォールバック失敗時の安全側倒し原則    |

## 実行手順

### ステップ1: 要件カバレッジマトリクス

| 要件ID  | 要件内容                                             | 設計での対応箇所                                          | カバレッジ |
| ------- | ---------------------------------------------------- | --------------------------------------------------------- | ---------- |
| FR-101  | Permission 拒否時に processPermissionFallback        | handlePermissionCheck 内の拒否分岐                        | PASS       |
| FR-102  | タイムアウト時に executeAbortFlow("timeout")         | sendPermissionRequestWithTimeout + PermissionTimeoutError | PASS       |
| FR-103  | retry 時に sendPermissionRequest が再発行            | handlePermissionCheck 内の while ループ                   | PASS       |
| FR-104  | skip 時にツール実行がスキップされ継続                | handlePermissionCheck 内の skip 分岐                      | PASS       |
| FR-105  | abort 時にスキル実行が安全に停止                     | handlePermissionCheck 内の abort 分岐 + throw             | PASS       |
| FR-106  | max_retries 到達時に executeAbortFlow("max_retries") | retryCount >= maxRetries 分岐                             | PASS       |
| NFR-101 | 例外は fail-closed（abort）に倒す                    | catch (fallbackError) ブロック                            | PASS       |
| NFR-102 | タイムアウト値は `this.defaultTimeout` で管理可能    | 初期値 DEFAULT_TIMEOUT_MS=30000ms（30秒）                 | PASS       |
| NFR-103 | abort フローは冪等                                   | 既存 executeAbortFlow の冪等性保証                        | PASS       |
| NFR-104 | 既存テスト 275+ ケースが全 PASS                      | 設計で既存フローに影響なし                                | PASS       |
| NFR-105 | FR-001〜FR-003 に影響を与えない                      | Permission チェックを FR-003 後に挿入                     | PASS       |

### ステップ2: 設計妥当性チェック

| チェック項目                                                | 判定 | 備考                             |
| ----------------------------------------------------------- | ---- | -------------------------------- |
| handlePermissionCheck の while ループに上限があるか         | PASS | maxRetries で制限                |
| PermissionTimeoutError が clearTimeout でリーク防止されるか | PASS | AbortSignal でクリーンアップ     |
| fail-closed パスが全例外ケースをカバーしているか            | PASS | try-catch の二重構造で対応       |
| 既存 sendPermissionRequest に breaking change がないか      | PASS | ラッパーとして新メソッドを追加   |
| retry ループ内で retryCount が正しくインクリメントされるか  | PASS | processPermissionFallback が管理 |

### ステップ3: セキュリティレビュー

| セキュリティ項目                             | 判定 | 対策                                         |
| -------------------------------------------- | ---- | -------------------------------------------- |
| fail-closed 原則が全フォールバックパスで適用 | PASS | catch ブロックで executeAbortFlow を呼び出し |
| タイムアウトによる DoS 防止                  | PASS | コンフィグ可能な上限値                       |
| retry ループの上限による無限ループ防止       | PASS | PERMISSION_MAX_RETRIES = 3                   |
| abort フローの冪等性による二重実行防止       | PASS | abortedExecutions Set で管理                 |

### ステップ4: simpler alternative の検討

Phase 2 の設計に対して、より単純な代替アプローチを検討した結果を記録する。

| 代替案                                                  | 内容                                                | 採用しない理由                                                            |
| ------------------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------- |
| `sendPermissionRequest` を直接 PreToolUse Hook 内に展開 | タイムアウトロジックをフック内に直接記述            | 既存の FR-001〜FR-003 と混在し可読性・テスタビリティが低下する            |
| グローバルなタイムアウト設定のみ                        | `PermissionResolver` のデフォルトタイムアウトに委譲 | `handlePermissionCheck` レベルでの制御が失われ、FR-102 の独立テストが困難 |
| タイムアウト時に `{ proceed: false }` を返す            | AbortError ではなく非スロー形式で処理               | fail-closed 原則に反する（タイムアウトは安全側=abort への遷移が必要）     |

**結論**: Phase 2 の設計（`handlePermissionCheck` メソッド + `sendPermissionRequestWithTimeout` ラッパー）が最もテスタブルで fail-closed 原則を満たす。

### ステップ5: MINOR 追跡テーブル

| MINOR-ID             | 指摘内容 | 解決予定Phase | 解決確認Phase | 備考 |
| -------------------- | -------- | ------------- | ------------- | ---- |
| （レビュー時に記入） |          |               |               |      |

### ステップ6: Phase 進行条件

**Phase 4 開始条件:**

- [ ] 判定が PASS または MINOR である
- [ ] MINOR の場合、全指摘が未タスク仕様書に変換済み
- [ ] 要件カバレッジマトリクスで FR-101〜FR-106、NFR-101〜NFR-105 が全カバー確認済み
- [ ] セキュリティレビューの全項目が確認済み

**Phase 13 blocked 条件（この Phase で発見された場合）:**

- 設計で解決できない根本的な要件問題（CRITICAL 判定時）
- 既存 FR-001〜FR-003 に breaking change が発生することが判明した場合

### ステップ7: 判定

| 判定  | 条件             | 対応                      |
| ----- | ---------------- | ------------------------- |
| PASS  | 全観点で問題なし | Phase 4 へ進行            |
| MINOR | 軽微な指摘あり   | 指摘対応後 Phase 4 へ進行 |
| MAJOR | 要件問題         | Phase 1 へ戻る            |
| MAJOR | 設計問題         | Phase 2 へ戻る            |

## 統合テスト連携（Phase 1〜11は必須）

Phase 3 では統合テスト観点をレビューする:

- Phase 2 設計で定義されたテスト対象がAC-001〜AC-007を網羅しているか
- P13（タイマーテスト無限ループ）の対策が設計に含まれているか
- P60（IPC テスト応答形式不一致）の対策が設計に含まれているか

## 多角的チェック観点（AIが判断）

| 観点           | 適用判断 | 仕様参照先                                                          |
| -------------- | -------- | ------------------------------------------------------------------- |
| セキュリティ   | 適用     | `aiworkflow-requirements: security-skill-execution.md`              |
| API設計        | 適用     | `aiworkflow-requirements: interfaces-agent-sdk-executor-details.md` |
| アーキテクチャ | 適用     | `aiworkflow-requirements: architecture-overview.md`                 |

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認（Phase 1-2 成果物 + システム仕様）
2. 要件カバレッジマトリクス作成
3. 設計妥当性チェック
4. セキュリティレビュー
5. simpler alternative 検討結果の記録
6. MINOR 追跡テーブル記入
7. Phase 進行条件の確認
8. 判定結果の記録
9. 成果物の作成・配置
10. 完了条件の検証

## 成果物

| 成果物       | パス                                      | 説明             |
| ------------ | ----------------------------------------- | ---------------- |
| レビュー結果 | `outputs/phase-3/design-review-result.md` | 設計レビュー判定 |

## 完了条件

- [ ] 要件カバレッジマトリクスで全FR/NFR（FR-101〜FR-106、NFR-101〜NFR-105）がカバーされていることを確認済み
- [ ] 設計妥当性チェックの全項目が確認済み
- [ ] セキュリティレビューの全項目が確認済み
- [ ] simpler alternative 検討結果が記録されている
- [ ] MINOR 追跡テーブルが記入済み（指摘なしの場合は「指摘なし」を明記）
- [ ] Phase 4 開始条件と Phase 13 blocked 条件が確認済み
- [ ] 判定結果が記録されている（PASS/MINOR/MAJOR のいずれか）
- [ ] 判定が PASS または MINOR の場合、Phase 4 進行が承認されている
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/UT-06-005-A-hook-fallback-integration --phase 3
```

## 次のPhase

Phase 4: テスト作成（TDD: Red）
