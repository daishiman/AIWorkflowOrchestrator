# Phase 10: 最終レビューゲート

## メタ情報

| 項目   | 値                                    |
| ------ | ------------------------------------- |
| Phase  | 10                                    |
| 機能名 | UT-06-005-A-hook-fallback-integration |
| 作成日 | 2026-03-17                            |

## 目的

Phase 9 の品質保証を経たコード・テスト・設計の多角的な品質・整合性レビューを実施し、PASS/MINOR/MAJOR/CRITICAL の4段階で品質ゲート判定を行う。MINOR 指摘はすべて未タスク仕様書に変換する（省略不可）。

## 実行タスク

- 要件充足レビュー: FR-101〜FR-105 / NFR-101〜NFR-105 の全要件が実装されているか確認する
- 設計整合レビュー: Phase 2 設計書との乖離がないか確認する
- コード品質レビュー: 可読性・保守性・SOLID 原則・既知落とし穴（P42/P45/P60/P61）への対応を確認する
- セキュリティレビュー: fail-closed・IPC セキュリティ・入力バリデーションを最終確認する
- テスト網羅性レビュー: AC-001〜AC-007 の全受け入れ基準がテストでカバーされているか確認する
- 統合テスト結果確認: 既存テスト 275+ ケースとの共存を確認する
- MINOR 指摘の未タスク変換: MINOR 判定の指摘を全て未タスク仕様書に変換する

## 参照資料

| 資料名               | パス                                                                 | 説明                                |
| -------------------- | -------------------------------------------------------------------- | ----------------------------------- |
| Phase 1 要件定義書   | `outputs/phase-1/requirements-definition.md`                         | 機能要件・非機能要件（照合基準）    |
| Phase 1 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`                             | AC-001〜AC-007（テスト照合基準）    |
| Phase 2 設計書       | `outputs/phase-2/architecture-design.md`                             | 設計との乖離チェック基準            |
| Phase 5 実装成果物   | `outputs/phase-5/implementation-summary.md`                          | 実装根拠の確認                      |
| Phase 9 品質チェック | `outputs/phase-9/quality-gate-result.md`                             | 品質ゲート通過確認済み結果          |
| Phase 8 コード品質   | `outputs/phase-8/refactoring-log.md`                                 | リファクタリング実施記録            |
| タスク実行ルール     | `.claude/rules/05-task-execution.md`                                 | Phase 10 最終レビューゲート判定基準 |
| タスク台帳           | `.claude/skills/aiworkflow-requirements/references/task-workflow.md` | 未タスク・完了タスク管理            |
| 既知の落とし穴       | `.claude/rules/06-known-pitfalls.md`                                 | P42/P45/P60/P61 等のレビュー観点    |

### システム仕様（aiworkflow-requirements）

| 参照資料                            | パス                                                                                         | 内容                                    |
| ----------------------------------- | -------------------------------------------------------------------------------------------- | --------------------------------------- |
| Permission フォールバックフロー詳細 | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor-details.md` | abort/skip/retry の分岐ロジックと型定義 |
| fail-closed セキュリティ要件        | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md`              | フォールバック失敗時の安全側倒し原則    |
| アーキテクチャ概要                  | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                 | SkillExecutor の IPC 統合ポイント       |

## 依存フェーズ

- Phase 9: `outputs/phase-9/quality-gate-result.md`（品質ゲート判定）
- Phase 8: `outputs/phase-8/refactoring-log.md`（最終リファクタリング記録）
- Phase 2: `outputs/phase-2/architecture-design.md`（設計整合）
- Phase 1: `outputs/phase-1/requirements-definition.md`（要件充足の起点）
- Phase 5: `outputs/phase-5/implementation-summary.md`（実装根拠）

## 実行手順

### ステップ1: 要件充足レビュー

#### 1-1. 機能要件（FR）の充足確認

| FR-ID  | 要件                                                                                    | 実装確認 | 判定 |
| ------ | --------------------------------------------------------------------------------------- | -------- | ---- |
| FR-101 | PreToolUse Hook で Permission 拒否時に `processPermissionFallback` が呼ばれること       | -        | -    |
| FR-102 | `sendPermissionRequest` のタイムアウト時に `executeAbortFlow("timeout")` が呼ばれること | -        | -    |
| FR-103 | retry フォールバック時に `sendPermissionRequest` が再発行されること（最大3回）          | -        | -    |
| FR-104 | skip フォールバック時にツール実行がスキップされ、後続処理が継続すること                 | -        | -    |
| FR-105 | abort フォールバック時にスキル実行が安全に停止すること                                  | -        | -    |

#### 1-2. 非機能要件（NFR）の充足確認

| NFR-ID  | 要件                                                          | 実装確認 | 判定 |
| ------- | ------------------------------------------------------------- | -------- | ---- |
| NFR-101 | フォールバック処理自体の例外は fail-closed（abort）に倒すこと | -        | -    |
| NFR-102 | タイムアウト値はコンフィグ可能（デフォルト 30000ms）          | -        | -    |
| NFR-103 | abort フローは冪等であること（二重 abort でエラー非発生）     | -        | -    |
| NFR-104 | 既存テスト 275+ ケースが全 PASS 維持されること                | -        | -    |
| NFR-105 | 既存の FR-001〜FR-003 の動作に影響を与えないこと              | -        | -    |

### ステップ2: 受け入れ基準（AC）の充足確認

| AC-ID  | 受け入れ基準                                                  | テストケース | 判定 |
| ------ | ------------------------------------------------------------- | ------------ | ---- |
| AC-001 | Permission 拒否時に `processPermissionFallback` が1回呼ばれる | -            | -    |
| AC-002 | timeout 発生時に `executeAbortFlow("timeout")` が呼ばれる     | -            | -    |
| AC-003 | retry 時に `sendPermissionRequest` が再度呼ばれる（最大3回）  | -            | -    |
| AC-004 | skip 時に `{ proceed: false, message: "..." }` が返される     | -            | -    |
| AC-005 | abort 時にスキル実行が停止し、エラーがスローされる            | -            | -    |
| AC-006 | フォールバック処理の例外時に abort に遷移する（fail-closed）  | -            | -    |
| AC-007 | 既存テスト 275+ ケースが全 PASS である                        | -            | -    |

### ステップ3: 設計整合レビュー

Phase 2 設計書と実装の乖離を確認する:

| 設計観点                           | Phase 2 設計                                 | 実装確認 | 乖離 |
| ---------------------------------- | -------------------------------------------- | -------- | ---- |
| `handlePermissionCheck` の引数     | `executionId, toolName, args, signal?`       | -        | -    |
| `sendPermissionRequestWithTimeout` | `Promise.race` + タイムアウト                | -        | -    |
| `PermissionTimeoutError` の構造    | `Error` 継承、`timeoutMs: number` フィールド | -        | -    |
| retry ループの上限                 | `PERMISSION_MAX_RETRIES`（最大3回）          | -        | -    |
| fail-closed の実装位置             | フォールバック例外の catch 内                | -        | -    |
| permissionStore 存在チェック       | null の場合は Permission チェックをスキップ  | -        | -    |

**P60 準拠確認**: IPC レスポンスの wrapper 形式（`{ success: boolean, data?, error? }`）がテストアサーションと一致しているか確認する:

```bash
# IPC レスポンス形式の確認
grep -n "success:\|result\.error\|result\.data" \
  apps/desktop/src/main/services/skill/__tests__/SkillExecutor.hook-fallback.test.ts | head -20
```

### ステップ4: コード品質レビュー

#### 4-1. 既知落とし穴チェック（重点確認）

| 落とし穴 | 確認内容                                                             | 確認コマンド                                                          |
| -------- | -------------------------------------------------------------------- | --------------------------------------------------------------------- | ------ |
| P42      | 文字列引数の3段バリデーション（型・空文字・トリム）                  | `grep -n "trim()" SkillExecutor.ts`                                   |
| P45      | 引数命名のセマンティクスが実際の値と一致（executionId vs skillName） | `grep -n "executionId\|skillId\|skillName" SkillExecutor.ts`          |
| P60      | IPC テスト応答形式の一致（設計書とテストのアサーション）             | `grep -n "success:\|error\.code" *.test.ts`                           |
| P61      | IPC ハンドラの DIP 準拠（具象クラスではなくインターフェース依存）    | `grep -n "DefaultSafetyGate\|new.*Gate\|new.*Store" SkillExecutor.ts` |
| P13      | タイマーテストで `vi.runAllTimers()` 不使用                          | `grep -n "runAllTimers" *.test.ts`                                    |
| P41      | v8 カバレッジのインライン関数カウント漏れ                            | `grep -n "=>" SkillExecutor.ts                                        | wc -l` |

#### 4-2. 可読性・保守性チェック

| 観点                    | チェック内容                                                                       |
| ----------------------- | ---------------------------------------------------------------------------------- |
| コメント                | `handlePermissionCheck` に FR/NFR 番号参照のコメントがあるか                       |
| 定数                    | `PERMISSION_MAX_RETRIES`・`permissionTimeoutMs` が明示的に定義されているか         |
| エラーメッセージ        | abort/skip 時のメッセージが明確でデバッグに役立つか                                |
| P55（パスのエスケープ） | エラーメッセージに正規表現メタ文字を含むパスが含まれる場合はエスケープされているか |

### ステップ5: セキュリティレビュー

| セキュリティ観点                         | 確認内容                                                  | 期待状態 |
| ---------------------------------------- | --------------------------------------------------------- | -------- |
| fail-closed（NFR-101）                   | フォールバック処理の例外時に必ず abort フローに遷移するか | 実装済み |
| フェイルセキュア（04-electron-security） | 障害時は安全側（abort）に倒す設計になっているか           | 設計済み |
| IPC チャンネル名                         | ホワイトリスト定数（`IPC_CHANNELS`）経由か（P27）         | 確認済み |
| 入力バリデーション                       | P42 の3段バリデーションが実装されているか                 | 確認済み |
| エラーサニタイズ                         | Renderer に返すエラーに内部情報が含まれていないか         | 確認済み |
| タイムアウト後のリソースクリーンアップ   | `AbortSignal` でタイマーがクリーンアップされているか      | 実装済み |

### ステップ6: 統合テスト結果確認

```bash
# 全テスト実行で統合確認
pnpm --filter @repo/desktop exec vitest run \
  src/main/services/skill/__tests__/

# 期待: 全 PASS（Phase 4-6 新規テスト + 既存 275+ テスト）
```

| テスト確認項目                                           | 結果 |
| -------------------------------------------------------- | ---- |
| `SkillExecutor.hook-fallback.test.ts` 全 PASS            | -    |
| 既存 `SkillExecutor.*.test.ts` 全 PASS（退行なし）       | -    |
| FR-001〜FR-003 の既存テストが PASS（新機能との共存確認） | -    |

### ステップ7: 総合判定

#### 判定基準

| 判定     | 条件                                                                  |
| -------- | --------------------------------------------------------------------- |
| PASS     | 全 FR/NFR/AC が充足、設計整合あり、コード品質・セキュリティに問題なし |
| MINOR    | 機能への影響はないが、改善推奨の指摘がある（命名・コメント等）        |
| MAJOR    | 機能要件の未充足または重大な設計乖離がある                            |
| CRITICAL | セキュリティ上の重大な問題または fail-closed 原則の違反がある         |

#### 対応テーブル

| 判定     | 対応                                                        |
| -------- | ----------------------------------------------------------- |
| PASS     | Phase 11（手動テスト）へ進む                                |
| MINOR    | 全指摘を未タスク仕様書に変換後、Phase 11 へ（**省略不可**） |
| MAJOR    | 影響範囲に応じて Phase 1-5 へ戻る                           |
| CRITICAL | Phase 1 へ戻り要件再確認                                    |

### ステップ8: MINOR 指摘の未タスク変換（MINOR 判定時）

MINOR 指摘が1件でもある場合、以下の3ステップを全て実施する（省略不可）:

1. `docs/30-workflows/unassigned-task/` に指示書を作成する
2. `.claude/skills/aiworkflow-requirements/references/task-workflow.md` の残課題テーブルに登録する
3. 関連仕様書に参照リンクを追加する

**P3/P38 対策**: 指示書は必ず `unassigned-task/` 配下に配置すること（「本レポート内で完了」は不可）。

```bash
# 未タスク指示書の配置先確認
ls docs/30-workflows/unassigned-task/
```

## 統合テスト連携（Phase 1〜11は必須）

Phase 10 では以下の観点で統合テストの最終確認を行う:

- 全テスト（既存 275+ + 新規）の PASS 確認
- FR-001〜FR-003（既存 PreToolUse Hook 機能）への影響がないことの確認
- FR-101〜FR-105（新規 Permission チェック機能）の全受け入れ基準の充足確認
- NFR-101（fail-closed）の動作確認

## 多角的チェック観点

| 観点           | 内容                                                                            | 参照先                                                   |
| -------------- | ------------------------------------------------------------------------------- | -------------------------------------------------------- |
| 要件充足       | FR-101〜FR-105 / NFR-101〜NFR-105 が全て実装されているか                        | `outputs/phase-1/requirements-definition.md`             |
| 受け入れ基準   | AC-001〜AC-007 がテストで検証されているか                                       | `outputs/phase-1/acceptance-criteria.md`                 |
| 設計整合       | Phase 2 設計書との乖離がないか（特に IPC レスポンス形式 P60）                   | `outputs/phase-2/architecture-design.md`                 |
| セキュリティ   | fail-closed・タイムアウト後クリーンアップ・IPC ホワイトリストが実装されているか | `04-electron-security.md`, `security-skill-execution.md` |
| 既知落とし穴   | P42/P45/P60/P61/P13/P41 への対応が確認されているか                              | `06-known-pitfalls.md`                                   |
| MINOR 指摘変換 | MINOR 指摘が全て3ステップ（指示書/残課題/リンク）で未タスク化されているか       | `.claude/rules/05-task-execution.md`（Task 4）           |

**Electronデスクトップアプリ観点**:

| 層                   | 確認内容                                                               | 仕様参照先                                 |
| -------------------- | ---------------------------------------------------------------------- | ------------------------------------------ |
| バックエンド（Main） | SkillExecutor の全機能が要件通りに動作し、全テストが PASS              | `architecture-overview.md`                 |
| IPC通信              | Permission 関連 IPC チャンネルのホワイトリスト管理と入力バリデーション | `04-electron-security.md`                  |
| Preload              | contextBridge 経由の Permission レスポンスが安全に受け渡しされているか | `interfaces-agent-sdk-executor-details.md` |

## 成果物

| 成果物               | パス                                          | 説明                                                 |
| -------------------- | --------------------------------------------- | ---------------------------------------------------- |
| 最終レビューレポート | `outputs/phase-10/final-review-report.md`     | PASS/MINOR/MAJOR/CRITICAL 判定と根拠の記録           |
| MINOR 指摘リスト     | `outputs/phase-10/minor-issues.md`            | MINOR 指摘の詳細（未タスク変換済みであることを記録） |
| 統合テスト確認結果   | `outputs/phase-10/integration-test-result.md` | 全テスト実行結果（ケース数・PASS率）                 |

## 完了条件

- [ ] FR-101〜FR-105 の全機能要件が充足確認済み
- [ ] NFR-101〜NFR-105 の全非機能要件が充足確認済み
- [ ] AC-001〜AC-007 の全受け入れ基準がテストで検証済み
- [ ] Phase 2 設計書との乖離がないことを確認済み（P60 IPC レスポンス形式含む）
- [ ] P42/P45/P60/P61/P13/P41 の既知落とし穴への対応が確認済み
- [ ] セキュリティ観点（fail-closed・IPC セキュリティ・入力バリデーション）が全 PASS
- [ ] 全テスト（既存 275+ + 新規）が PASS
- [ ] 総合判定が記録されている（PASS/MINOR/MAJOR/CRITICAL）
- [ ] MINOR 判定の場合: 全指摘が未タスク仕様書（3ステップ）に変換済み（省略不可、P3/P38対策）
- [ ] MAJOR/CRITICAL 判定の場合: 戻り先 Phase が特定されている
- [ ] 成果物が `outputs/phase-10/` に記録済み
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase 実行開始時に、以下のサブタスクを作成すること:

1. 要件充足レビュー（FR-101〜FR-105）
2. 要件充足レビュー（NFR-101〜NFR-105）
3. 受け入れ基準（AC-001〜AC-007）の充足確認
4. 設計整合レビュー（Phase 2 設計書との照合）
5. コード品質レビュー（P42/P45/P60/P61/P13/P41）
6. セキュリティレビュー（fail-closed・IPC・バリデーション）
7. 統合テスト結果確認（全テスト PASS）
8. 総合判定（PASS/MINOR/MAJOR/CRITICAL）
9. MINOR 指摘の未タスク変換（3ステップ全実施）
10. 成果物の作成・配置
11. 完了条件の検証

## タスク100%実行確認【必須】

Phase 完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase 末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/UT-06-005-A-hook-fallback-integration --phase 10
```

## 次のPhase

- **PASS / MINOR（未タスク変換完了後）**: Phase 11（手動テスト）へ
- **MAJOR（要件問題）**: Phase 1（要件定義）へ戻る
- **MAJOR（設計問題）**: Phase 2（設計）へ戻る
- **MAJOR（実装問題）**: Phase 5（実装）へ戻る
- **CRITICAL**: Phase 1（要件定義）へ戻り要件再確認
