# Phase 10: 最終レビューゲート - TASK-9B

## メタ情報

| 項目               | 内容                         |
| ------------------ | ---------------------------- |
| Phase              | 10                           |
| Phase名            | 最終レビューゲート           |
| タスクID           | TASK-9B                      |
| 前提Phase          | phase-9-quality-assurance.md |
| 後続Phase          | Phase 11（手動テスト検証）   |
| ステータス         | pending                      |
| 作成日             | 2026-02-26                   |
| 機能名             | task-9b-skill-creator        |
| 成果物ディレクトリ | outputs/phase-10/            |

---

## 目的

実装完了後、要件充足度・アーキテクチャ整合性・IPC契約整合性・セキュリティ・既存機能影響・コード品質・テスト品質・ドキュメント準備の8観点から全体的な品質・整合性を多角的に検証する。手動テストフェーズに進む前の最終品質ゲートとして機能する。

## 背景

TASK-9Bは12機能を持つメタスキルであり、SkillCreatorServiceをFacadeとした5つのサブコンポーネント統合、複数のIPCハンドラー登録、Preload API拡張を含む大規模な実装である。既存のSkillService/SkillExecutorとの責務境界が明確であること、および全ての品質基準を達成していることを最終確認する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 要件充足度レビュー

**目的**: 12機能の受け入れ基準がすべて満たされているかを確認する

**実行手順**:

1. `outputs/phase-1/requirements-definition.md`を読み込む
2. `outputs/phase-1/acceptance-criteria.md`を読み込む
3. 12機能の各受け入れ基準に対して、テスト結果または実装確認で充足を判定する
4. 未充足の基準がある場合は記録し、影響範囲を評価する

**機能充足度マトリクス**:

| #   | 機能                  | コマンド                  | 受け入れ基準充足 | テストカバー | 結果 |
| --- | --------------------- | ------------------------- | ---------------- | ------------ | ---- |
| 1   | 対話的スキル作成      | `/skill-creator chat`     | -                | -            | -    |
| 2   | 外部API連携スキル生成 | `/skill-creator api`      | -                | -            | -    |
| 3   | 既存スキル改善        | `/skill-creator improve`  | -                | -            | -    |
| 4   | タスク実行            | `/skill-creator execute`  | -                | -            | -    |
| 5   | 即時使用              | `/skill-creator use`      | -                | -            | -    |
| 6   | スキルチェーン作成    | `/skill-creator chain`    | -                | -            | -    |
| 7   | スキルフォーク        | `/skill-creator fork`     | -                | -            | -    |
| 8   | スキル共有            | `/skill-creator share`    | -                | -            | -    |
| 9   | スケジュール設定      | `/skill-creator schedule` | -                | -            | -    |
| 10  | デバッグ実行          | `/skill-creator debug`    | -                | -            | -    |
| 11  | ドキュメント生成      | `/skill-creator docs`     | -                | -            | -    |
| 12  | 使用統計              | `/skill-creator stats`    | -                | -            | -    |

**期待される成果物**:

- `outputs/phase-10/requirements-review.md`

---

### タスク2: アーキテクチャ整合性レビュー

**目的**: Facadeパターン、DI設計、層分離が設計どおりであることを確認する

**実行手順**:

1. `outputs/phase-2/architecture-design.md`を読み込む
2. SkillCreatorServiceのFacadeパターンが設計どおりに実装されているか確認する
3. 5つのサブコンポーネントのDI注入が正しく実装されているか確認する
4. レイヤー依存方向（Renderer→Preload→Main）が守られていることを確認する
5. 既存のSkillService/SkillExecutorとの責務境界が明確であることを確認する

**アーキテクチャチェックリスト**:

| チェック項目              | 確認内容                                                                                           | 結果 |
| ------------------------- | -------------------------------------------------------------------------------------------------- | ---- |
| Facadeパターン            | SkillCreatorServiceが5つのサブコンポーネントを統合し、単一のエントリーポイントを提供している       | -    |
| DI設計                    | サブコンポーネントがコンストラクタまたはSetter Injectionで注入されている                           | -    |
| 層分離                    | Renderer→Preload→Mainの一方向依存が守られている                                                    | -    |
| ホワイトリスト            | 全skill-creatorチャンネルがALLOWED_INVOKE_CHANNELSに追加されている                                 | -    |
| ハンドラー登録            | registerSkillHandlers()にskill-creator関連ハンドラーが追加されている                               | -    |
| ハンドラー解除            | unregisterSkillHandlers()にskill-creator関連チャンネルが追加されている                             | -    |
| チャンネル定数一致        | packages/shared と apps/desktop のチャンネル値が一致している                                       | -    |
| contextBridge経由         | RendererからのAPIアクセスがcontextBridge経由である                                                 | -    |
| 責務境界（SkillService）  | SkillCreatorServiceがSkillServiceの既存責務（import, list, remove, scan）を侵食していない          | -    |
| 責務境界（SkillExecutor） | SkillCreatorServiceがSkillExecutorの既存責務（executeSkill）を侵食していない                       | -    |
| Claude Agent SDK使用      | query() APIが正しいパラメータで呼び出されている（プロンプト・モデル指定・権限設定）                | -    |
| Claude Agent SDK Hooks    | SDK Hooksが規定どおり設定されている（afterToolCall / preToolUse / postToolUse のコールバック設定） | -    |

**確認コマンド**:

```bash
# ホワイトリスト確認
grep -n "ALLOWED_INVOKE_CHANNELS" apps/desktop/src/preload/channels.ts

# ハンドラー登録・解除確認
grep -n "registerSkillHandlers\|unregisterSkillHandlers" apps/desktop/src/main/ipc/skillCreatorHandlers.ts

# 責務境界確認: SkillCreatorServiceがSkillServiceのメソッドを直接呼び出していないか
grep -n "skillService\.\|SkillService" apps/desktop/src/main/services/skill/SkillCreatorService.ts
```

**期待される成果物**:

- `outputs/phase-10/architecture-review.md`

---

### タスク3: IPC契約整合性レビュー

**目的**: ipc-contract-checklist.md Phase 1-6準拠の最終確認を行う

**実行手順**:

1. Phase 9のIPC契約レポート（`outputs/phase-9/ipc-contract-report.md`）を読み込む
2. Phase 9で全項目PASSであることを確認する
3. Phase 9以降の変更がIPC契約に影響していないことを確認する
4. P44/P45対策の完全性を再確認する

**IPC契約最終確認マトリクス**:

| チェック項目                                  | Phase 9結果 | Phase 10再確認 | 最終判定 |
| --------------------------------------------- | ----------- | -------------- | -------- |
| チャンネル定数定義（IPC_CHANNELS）            | -           | -              | -        |
| ホワイトリスト追加（ALLOWED_INVOKE_CHANNELS） | -           | -              | -        |
| ハンドラー引数型とPreload呼び出し型の一致     | -           | -              | -        |
| ハンドラー戻り値型とPreload期待型の一致       | -           | -              | -        |
| 引数名セマンティクス一致（P45対策）           | -           | -              | -        |
| validateIpcSender全ハンドラー適用             | -           | -              | -        |
| P42準拠3段バリデーション全文字列引数適用      | -           | -              | -        |
| unregisterハンドラー登録完備                  | -           | -              | -        |
| 二重登録防止（P5対策）                        | -           | -              | -        |
| sanitizeErrorMessage全catchブロック適用       | -           | -              | -        |

**P44/P45最終確認コマンド**:

```bash
# P44: ハンドラー引数形式確認（オブジェクト形式vs文字列形式）
grep -A 5 "ipcMain.handle.*skill-creator\|ipcMain.handle.*skillCreator" apps/desktop/src/main/ipc/skillCreatorHandlers.ts

# P45: 引数名セマンティクス確認
grep -n "skillId\|skillName" apps/desktop/src/main/ipc/skillCreatorHandlers.ts
grep -n "skillId\|skillName" apps/desktop/src/main/services/skill/SkillCreatorService.ts
```

**期待される成果物**:

- `outputs/phase-10/ipc-contract-review.md`

---

### タスク4: セキュリティレビュー

**目的**: P42/P44/P45対策の完全性を確認し、機密情報の取り扱いを最終検証する

**実行手順**:

1. Phase 9のセキュリティレポート（`outputs/phase-9/security-report.md`）を読み込む
2. 機密情報（APIキー等）の取り扱いパスを追跡し、Main Processに留まっていることを確認する
3. `/skill-creator api` コマンドでの認証情報管理が安全であることを確認する
4. エラーレスポンスに内部情報（ファイルパス、スタックトレース等）が含まれていないことを確認する

**セキュリティ最終確認チェックリスト**:

| チェック項目             | 確認内容                                                                          | 結果 |
| ------------------------ | --------------------------------------------------------------------------------- | ---- |
| P42準拠3段バリデーション | 全文字列引数に typeof→空文字列→trim空文字列 チェック適用済み                      | -    |
| P44対策                  | ハンドラー引数形式とPreload呼び出し形式が一致                                     | -    |
| P45対策                  | 引数名がセマンティクスに一致（skillName等）                                       | -    |
| sender検証               | 全ハンドラーでvalidateIpcSender適用済み                                           | -    |
| APIキー管理              | APIキーがMain Processのみで保持、Renderer送信なし                                 | -    |
| エラーサニタイズ         | sanitizeErrorMessageが全catchブロックで使用、内部パスやスタックトレースの漏洩なし | -    |
| パストラバーサル         | ファイルパスを受け取るハンドラーでvalidatePathが適用されている                    | -    |

**期待される成果物**:

- `outputs/phase-10/security-review.md`

---

### タスク5: 既存機能影響レビュー

**目的**: SkillCreatorServiceの追加が既存のSkillService/SkillExecutorの動作に影響を与えていないことを確認する

**実行手順**:

1. 既存のskill関連テスト（SkillService, SkillExecutor, SkillImportManager）を実行する
2. 既存のIPC関連テスト（skill:import, skill:remove, skill:list, skill:execute等）を実行する
3. 全テストが100% PASSであることを確認する
4. 新しいIPCハンドラー登録が既存ハンドラーの二重登録を引き起こしていないことを確認する

**コマンド**:

```bash
# 既存skill関連テスト実行
cd apps/desktop && pnpm vitest run src/main/services/skill/SkillService --reporter=verbose
cd apps/desktop && pnpm vitest run src/main/services/skill/SkillExecutor --reporter=verbose
cd apps/desktop && pnpm vitest run src/main/services/skill/SkillImportManager --reporter=verbose

# 既存IPC関連テスト実行
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers --reporter=verbose

# desktop全体テスト実行
cd apps/desktop && pnpm vitest run --reporter=verbose
```

**既存機能影響マトリクス**:

| 既存機能                                   | テストファイル             | テスト結果 | 影響 |
| ------------------------------------------ | -------------------------- | ---------- | ---- |
| SkillService（import, list, remove, scan） | SkillService.test.ts       | -          | -    |
| SkillExecutor（executeSkill）              | SkillExecutor.test.ts      | -          | -    |
| SkillImportManager                         | SkillImportManager.test.ts | -          | -    |
| skill IPCハンドラー（既存）                | skillHandlers.test.ts      | -          | -    |
| ハンドラー二重登録防止                     | P5対策確認                 | -          | -    |

**期待される成果物**:

- `outputs/phase-10/existing-feature-impact.md`

---

### タスク6: コード品質・テスト品質レビュー

**目的**: コード品質基準とテスト品質が達成されていることを最終確認する

**実行手順**:

1. Phase 9の品質ゲート結果（`outputs/phase-9/quality-report.md`）を読み込む
2. `any`型0件、`@ts-ignore`0件、unused import 0件を再確認する
3. テスト間の状態共有がないことを確認する（P9対策）
4. カバレッジ基準が達成されていることを確認する

**コード品質最終確認**:

| チェック項目                    | 基準                                 | 結果 |
| ------------------------------- | ------------------------------------ | ---- |
| `any`型使用                     | 0件                                  | -    |
| `@ts-ignore`/`@ts-expect-error` | 0件（または理由コメントあり）        | -    |
| unused import                   | 0件                                  | -    |
| Line Coverage                   | 80%+                                 | -    |
| Branch Coverage                 | 60%+                                 | -    |
| Function Coverage               | 80%+                                 | -    |
| テスト間状態共有                | なし（各テストでbeforeEachリセット） | -    |
| Claude Agent SDK query()使用    | 正しいプロンプト・モデル指定で呼出し | -    |
| Claude Agent SDK Hooks設定      | afterToolCall等のコールバック適切    | -    |
| Claude Agent SDK権限設定        | PermissionMode設定が適切             | -    |

**確認コマンド**:

```bash
# any型の最終確認
grep -rn ": any\b" apps/desktop/src/main/services/skill/ --include="*.ts" | grep -v "\.test\." | grep -v "node_modules"

# unused import確認
pnpm --filter @repo/desktop lint 2>&1 | grep "no-unused"

# テスト間状態共有確認
grep -rn "beforeEach\|afterEach" apps/desktop/src/main/services/skill/__tests__/ --include="*.ts"

# Claude Agent SDK query() 使用箇所確認
grep -rn "query(" apps/desktop/src/main/services/skill/ --include="*.ts" | grep -v "\.test\."

# Claude Agent SDK Hooks 設定確認
grep -rn "afterToolCall\|beforeToolCall\|hooks" apps/desktop/src/main/services/skill/ --include="*.ts" | grep -v "\.test\."

# Claude Agent SDK PermissionMode 設定確認
grep -rn "permissionMode\|PermissionMode" apps/desktop/src/main/services/skill/ --include="*.ts" | grep -v "\.test\."
```

**期待される成果物**:

- `outputs/phase-10/quality-coverage-review.md`

---

### タスク7: ドキュメント準備確認

**目的**: Phase 12で必要な情報が揃っているかを確認する

**実行手順**:

1. Phase 1〜9の成果物が全て存在することを確認する
2. implementation-guide.md作成に必要な情報（アーキテクチャ図、API仕様、セキュリティ要件）が揃っていることを確認する
3. 不足情報がある場合は記録する

**ドキュメント準備チェックリスト**:

| 情報項目                 | 出典Phase | 存在確認 |
| ------------------------ | --------- | -------- |
| 要件定義書               | Phase 1   | -        |
| 受け入れ基準             | Phase 1   | -        |
| アーキテクチャ設計       | Phase 2   | -        |
| API設計                  | Phase 2   | -        |
| 設計レビュー結果         | Phase 3   | -        |
| テスト仕様書             | Phase 4   | -        |
| 実装コード               | Phase 5   | -        |
| カバレッジレポート       | Phase 7   | -        |
| リファクタリングレポート | Phase 8   | -        |
| 品質レポート             | Phase 9   | -        |

**期待される成果物**:

- `outputs/phase-10/documentation-readiness.md`

---

### タスク8: 最終判定

**目的**: 最終レビュー結果を判定する

**実行手順**:

1. タスク1〜7の結果を統合する
2. 問題を重要度別に分類する
3. 判定結果（PASS/MINOR/MAJOR/CRITICAL）を決定する
4. MINOR判定の場合は全指摘事項を未タスク仕様書に変換する

**判定基準**:

| 判定     | 条件                                     | 次のアクション                                     |
| -------- | ---------------------------------------- | -------------------------------------------------- |
| PASS     | 全レビュー観点で問題なし                 | Phase 11へ進行                                     |
| MINOR    | 軽微な指摘あり（機能に影響なし）         | 未タスク仕様書に変換後、Phase 11へ（**省略不可**） |
| MAJOR    | 重大な問題あり（セキュリティ・機能影響） | 影響範囲に応じてPhase 1-5へ戻る                    |
| CRITICAL | 致命的な問題あり（データ漏洩リスク）     | Phase 1へ戻り要件再確認                            |

**MINOR判定時の未タスク化手順（全ステップ必須）**:

1. 指摘内容を`docs/30-workflows/unassigned-task/`に指示書として作成する
2. `task-workflow.md`の残課題テーブルに登録する
3. 関連仕様書に参照リンクを追加する

> **重要**: MINOR判定の指摘事項は**全て**未タスク仕様書に変換すること。「機能に影響なし」は未タスク化省略の理由にならない。

**戻り先決定基準**:

| 問題の種類                               | 戻り先                               |
| ---------------------------------------- | ------------------------------------ |
| 要件の未充足（12機能の受け入れ基準未達） | Phase 1（要件定義）                  |
| Facadeパターン・DI設計の問題             | Phase 2（設計）                      |
| IPC契約の不整合                          | Phase 2（設計）またはPhase 5（実装） |
| テスト設計の不足                         | Phase 4（テスト作成）                |
| 実装の問題（ロジックエラー）             | Phase 5（実装）                      |
| コード品質の問題                         | Phase 8（リファクタ）                |

**レビュー結果サマリー**:

| レビュー観点             | 結果 | 指摘事項 |
| ------------------------ | ---- | -------- |
| 要件充足度（12機能）     | -    | -        |
| アーキテクチャ整合性     | -    | -        |
| IPC契約整合性            | -    | -        |
| セキュリティ             | -    | -        |
| 既存機能影響             | -    | -        |
| コード品質/テスト品質    | -    | -        |
| Claude Agent SDK適切使用 | -    | -        |
| ドキュメント準備         | -    | -        |
| **最終判定**             | -    | -        |

**期待される成果物**:

- `outputs/phase-10/final-review-result.md`

---

## SubAgent分担

| SubAgent   | 担当                                                                       |
| ---------- | -------------------------------------------------------------------------- |
| SubAgent-A | タスク1（要件充足度レビュー）+ タスク2（アーキテクチャ整合性レビュー）     |
| SubAgent-B | タスク3（IPC契約整合性レビュー）+ タスク4（セキュリティレビュー）          |
| SubAgent-C | タスク5（既存機能影響レビュー）+ タスク6（コード品質・テスト品質レビュー） |
| SubAgent-D | タスク7（ドキュメント準備確認）+ タスク8（最終判定）+ 最終レビュー結果統合 |

---

## 参照資料

### システム仕様（aiworkflow-requirements）

| 参照資料                 | パス                                                                                        | 内容                                   |
| ------------------------ | ------------------------------------------------------------------------------------------- | -------------------------------------- |
| Skillインターフェース    | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | Renderer-Preload-Main間のSkill API契約 |
| Electronサービス設計     | `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md`               | Facadeパターン・DI設計方針             |
| アーキテクチャ概要       | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                | レイヤー依存方向・全体構成             |
| IPC セキュリティ         | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                   | 3段バリデーション・sender検証          |
| Electron APIセキュリティ | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`                | contextBridge・公開API制約             |
| Skill実行セキュリティ    | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md`             | Skill実行時のセキュリティ制約          |
| IPC契約チェック          | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`               | P23/P32/P42/P44/P45統合チェック        |
| 実装パターン             | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | IPC/DI/テストパターン                  |
| 品質基準                 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | コード品質・カバレッジ基準             |
| エラーハンドリング       | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | Result<T,E>パターン・エラーカテゴリ    |
| 教訓集                   | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                      | 過去の苦戦箇所と解決策                 |
| 既知の落とし穴           | `.claude/rules/06-known-pitfalls.md`                                                        | P5/P42/P44/P45/P34/P35対策             |

### タスク固有参照

| 参照資料                    | パス                                                                                                  | 内容                 |
| --------------------------- | ----------------------------------------------------------------------------------------------------- | -------------------- |
| Phase 1-9全成果物           | `outputs/phase-1/` 〜 `outputs/phase-9/`                                                              | 各Phase成果物        |
| Phase 5実装成果物           | `outputs/phase-5/design-changes.md`                                                                   | 実装内容の最終確認   |
| 元タスク仕様書              | `docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-020a-task-9b-skill-creator.md` | 分割前の元仕様       |
| Phase 9品質レポート         | `outputs/phase-9/quality-report.md`                                                                   | 品質ゲート結果       |
| Phase 9 IPC契約レポート     | `outputs/phase-9/ipc-contract-report.md`                                                              | IPC契約整合性結果    |
| Phase 9セキュリティレポート | `outputs/phase-9/security-report.md`                                                                  | セキュリティ検証結果 |
| Phase 2アーキテクチャ設計   | `outputs/phase-2/architecture-design.md`                                                              | 設計正本             |
| Phase 1要件定義             | `outputs/phase-1/requirements-definition.md`                                                          | 要件正本             |

---

## 成果物

| 成果物                   | パス                                          | 内容                                  |
| ------------------------ | --------------------------------------------- | ------------------------------------- |
| 要件充足度レビュー       | `outputs/phase-10/requirements-review.md`     | 12機能の受け入れ基準充足確認          |
| アーキテクチャレビュー   | `outputs/phase-10/architecture-review.md`     | Facade/DI/層分離確認                  |
| IPC契約レビュー          | `outputs/phase-10/ipc-contract-review.md`     | IPC契約最終確認                       |
| セキュリティレビュー     | `outputs/phase-10/security-review.md`         | P42/P44/P45対策完全性確認             |
| 既存機能影響レビュー     | `outputs/phase-10/existing-feature-impact.md` | 既存テスト全件PASS確認                |
| 品質・カバレッジレビュー | `outputs/phase-10/quality-coverage-review.md` | コード品質・テスト品質最終確認        |
| ドキュメント準備確認     | `outputs/phase-10/documentation-readiness.md` | Phase 12準備状況                      |
| 最終レビュー結果         | `outputs/phase-10/final-review-result.md`     | 判定結果（PASS/MINOR/MAJOR/CRITICAL） |

---

## 統合テスト連携【必須】

> 最終レビューで統合テスト結果を確認する

| レビュー項目       | 確認内容                                                     | 結果 |
| ------------------ | ------------------------------------------------------------ | ---- |
| 全テスト結果       | ユニット/統合テスト全て成功                                  | -    |
| カバレッジ         | Line 80%+, Branch 60%+, Function 80%+                        | -    |
| IPC契約            | ハンドラー引数形式とPreload呼び出し形式の一致                | -    |
| 既存テスト         | SkillService/SkillExecutor/既存IPCハンドラーのテスト全件PASS | -    |
| セキュリティテスト | 3段バリデーション・sender検証・エラーサニタイズ全件PASS      | -    |

---

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断                                        | 仕様参照先                                         |
| ------------------ | ----------------------------------------------- | -------------------------------------------------- |
| セキュリティ       | 必須（P42/P44/P45対策完全性・機密情報管理確認） | aiworkflow-requirements: security-skill-ipc.md     |
| UI/UX              | 非該当（バックエンド最終レビューのみ）          | -                                                  |
| アーキテクチャ     | 必須（Facade/DI/層分離・責務境界確認）          | aiworkflow-requirements: arch-electron-services.md |
| API設計            | 必須（IPC契約最終整合性確認）                   | aiworkflow-requirements: api-ipc-agent.md          |
| データ整合性       | 非該当（DB変更なし）                            | -                                                  |
| エラーハンドリング | 必須（エラーサニタイズ最終確認）                | aiworkflow-requirements: error-handling.md         |
| パフォーマンス     | 対象限定（スキル生成60秒以内の設計妥当性確認）  | aiworkflow-requirements: quality-requirements.md   |
| アクセシビリティ   | 非該当（UI実装なし）                            | -                                                  |
| テスタビリティ     | 必須（テスト品質・カバレッジ最終確認）          | aiworkflow-requirements: quality-requirements.md   |

### Electronデスクトップアプリ観点

| 層                         | 適用判断                                   | 仕様参照先                                             |
| -------------------------- | ------------------------------------------ | ------------------------------------------------------ |
| フロントエンド（Renderer） | 契約確認のみ（Preload型定義の最終整合性）  | aiworkflow-requirements: interfaces-agent-sdk-skill.md |
| バックエンド（Main）       | 必須（SkillCreatorService全体レビュー）    | aiworkflow-requirements: arch-electron-services.md     |
| IPC通信                    | 必須（IPC契約最終確認・P44/P45対策）       | aiworkflow-requirements: api-ipc-agent.md              |
| Preload/セキュリティ       | 必須（ホワイトリスト・safeInvoke最終確認） | aiworkflow-requirements: security-api-electron.md      |
| ローカルストレージ         | 非該当（DB変更なし）                       | -                                                      |

---

## 実行手順

1. タスク1〜7を実行し、8つのレビュー観点を検証する
2. タスク8で最終判定を実施する
3. MINOR判定の場合は全指摘事項を未タスク仕様書に変換する（3ステップ: 指示書作成→残課題テーブル登録→関連仕様書リンク追加）
4. Phase完了時の検証コマンドを実行する

**Phase完了時の検証コマンド**:

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-9b-skill-creator --phase 10
```

---

## 完了条件

- [ ] 12機能の受け入れ基準充足度が全て確認されている
- [ ] アーキテクチャレビュー（Facade/DI/層分離/責務境界）が完了している
- [ ] IPC契約チェックリストPhase 1-6の全項目がPASSしている
- [ ] セキュリティレビュー（P42/P44/P45対策・機密情報管理）が完了している
- [ ] 既存機能（SkillService/SkillExecutor/既存IPCハンドラー）のテストが全件PASSしている
- [ ] コード品質基準（any型0件、@ts-ignore 0件、unused import 0件）を達成している
- [ ] テストカバレッジ基準（Line 80%+, Branch 60%+, Function 80%+）を達成している
- [ ] Claude Agent SDK query() APIが正しく使用されている（プロンプト・モデル指定・権限設定）
- [ ] ドキュメント準備状況が確認されている
- [ ] 最終判定がPASSまたはMINORである
- [ ] MINOR判定の場合は全指摘事項の未タスク化が完了している（3ステップ全完了）
- [ ] 最終レビュー結果（8ファイル）が全て生成されている

---

## サブタスク管理

- [ ] 全8タスクの完了確認
- [ ] 各タスクの成果物が生成されていることを確認
- [ ] タスク間の依存関係（タスク1〜7→タスク8）が守られていることを確認
- [ ] SubAgent分担に従い、並列実行可能なタスクは並列で実施

---

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスク（8タスク）を100%実行完了
- [ ] 各タスクの成果物（8ファイル）が全て生成されている
- [ ] artifacts.jsonのphase-10ステータスが更新されている
- [ ] 判定結果がPASS/MINORであることを確認

---

## 次Phase

Phase 11（手動テスト検証）へ進む（PASS/MINORの場合）。

完了後、以下のファイルを実行してください:

`docs/30-workflows/completed-tasks/task-9b-skill-creator/phase-11-manual-test.md`
