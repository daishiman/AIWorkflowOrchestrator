# Phase 1: 要件定義

## メタ情報

| 項目       | 値                                                        |
| ---------- | --------------------------------------------------------- |
| Phase      | 1                                                         |
| 機能名     | skill-execute-delegation                                  |
| タスクID   | TASK-FIX-7-1-EXECUTE-SKILL-DELEGATION                     |
| 作成日     | 2026-02-10                                                |
| 依存タスク | TASK-FIX-15-1, TASK-FIX-16-1, TASK-FIX-5-1 (全て完了済み) |

## 目的

SkillService.executeSkill() のスタブ実装を解消し、完全実装済みの SkillExecutor に実行を委譲することで、スキル実行機能を完成させる。

## 背景

### 現状の問題

1. **SkillService.executeSkill()**: 常に成功を返すスタブ実装

   ```typescript
   // 初期実装: 成功結果を返す
   // 将来的にはスキルの実際の実行ロジックを実装
   const output = `Skill "${skill.name}" executed successfully`;
   ```

2. **SkillExecutor.execute()**: 完全実装済み
   - SDK query() を使用したスキル実行
   - ストリーミング対応
   - リトライ対応
   - 中断（abort）対応
   - 権限管理（PermissionResolver/PermissionStore）
   - Hooks対応（PreToolUse/PostToolUse）
   - AuthKeyService統合（TASK-FIX-16-1）

3. **skill:execute IPCハンドラー**: SkillService.executeSkill() を呼んでいるため、SkillExecutor は使用されていない

### 依存タスクの完了状況

| タスクID      | 内容                              | ステータス |
| ------------- | --------------------------------- | ---------- |
| TASK-FIX-15-1 | SkillExecutor統合（基盤構築）     | 完了       |
| TASK-FIX-16-1 | AuthKeyService統合（SDK認証キー） | 完了       |
| TASK-FIX-5-1  | Skill API統一（IPC整備）          | 完了       |

## 実行タスク

- 要件抽出: スキル実行委譲に必要な機能要件・非機能要件を抽出
- 受け入れ基準作成: 各要件に対して検証可能な受け入れ基準を定義
- FR/NFR分類: 機能要件と非機能要件を分類し優先度を設定

---

## 実行手順

### Step 1: 現状コード調査

1. `SkillService.executeSkill()` のスタブ実装を確認
2. `SkillExecutor.execute()` の完全実装を確認
3. `skillHandlers.ts` の現在のIPCハンドラー構造を確認

### Step 2: システム仕様書から要件抽出

1. `interfaces-agent-sdk-executor.md` からSkillExecutor APIを抽出
2. `security-skill-ipc.md` からセキュリティ要件を抽出
3. `error-handling.md` からエラーコード体系を抽出

### Step 3: 機能要件の定義

1. 委譲パターンの要件（FR-001）
2. ストリーミング配信の要件（FR-002）
3. パラメータ引き継ぎの要件（FR-003）
4. 中断機能の要件（FR-004）
5. 状態取得の要件（FR-005）

### Step 4: 非機能要件の定義

1. セキュリティ要件（NFR-001）
2. エラーハンドリング要件（NFR-002）
3. 後方互換性要件（NFR-003）
4. パフォーマンス要件（NFR-004）

### Step 5: 受け入れ基準の作成

各要件に対して検証可能な基準を定義

---

## 参照資料

### 実装ファイル

| 資料名        | パス                                                    | 説明                     |
| ------------- | ------------------------------------------------------- | ------------------------ |
| SkillService  | `apps/desktop/src/main/services/skill/SkillService.ts`  | 現在のスタブ実装         |
| SkillExecutor | `apps/desktop/src/main/services/skill/SkillExecutor.ts` | 完全実装済み実行エンジン |
| skillHandlers | `apps/desktop/src/main/ipc/skillHandlers.ts`            | IPCハンドラー            |

### システム仕様書（aiworkflow-requirements）【必須参照】

| 資料名                                  | パス                                                                                        | 説明                                           |
| --------------------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| interfaces-agent-sdk-executor.md        | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor.md`        | SkillExecutor完全仕様（型定義・API・リトライ） |
| interfaces-agent-sdk-skill.md           | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | スキル管理API仕様                              |
| security-skill-execution.md             | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md`             | 危険コマンド・保護パス検出                     |
| security-skill-ipc.md                   | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                   | IPC通信セキュリティ（safeInvoke/safeOn）       |
| error-handling.md                       | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | エラーハンドリング仕様                         |
| architecture-implementation-patterns.md | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 実装パターン                                   |

---

## 機能要件 (FR)

### FR-001: スキル実行委譲

| 項目         | 内容                                                                    |
| ------------ | ----------------------------------------------------------------------- |
| 優先度       | P0 (必須)                                                               |
| 説明         | skill:execute IPCハンドラーがSkillExecutor.execute()を呼び出す          |
| 受け入れ基準 | AC-001-1: IPCハンドラーがSkillExecutor.execute()を直接呼び出す          |
|              | AC-001-2: SkillService.executeSkill()のスタブが削除または非推奨化される |

### FR-002: ストリーミング応答の配信

| 項目         | 内容                                                                     |
| ------------ | ------------------------------------------------------------------------ |
| 優先度       | P0 (必須)                                                                |
| 説明         | スキル実行結果がストリーミングでRendererに配信される                     |
| 受け入れ基準 | AC-002-1: SKILL_CHANNELS.SKILL_STREAM経由でメッセージが配信される        |
|              | AC-002-2: text/tool_use/error/complete/retryの各タイプが正しく送信される |

### FR-003: 実行パラメータの引き継ぎ

| 項目         | 内容                                                                  |
| ------------ | --------------------------------------------------------------------- |
| 優先度       | P0 (必須)                                                             |
| 説明         | IPCハンドラーの引数（skillId, params）がSkillExecutorに正しく渡される |
| 受け入れ基準 | AC-003-1: skillIdからSkillMetadataが取得される                        |
|              | AC-003-2: paramsがSkillExecutionRequestのpromptに変換される           |

### FR-004: 中断機能の連携

| 項目         | 内容                                                      |
| ------------ | --------------------------------------------------------- |
| 優先度       | P1 (重要)                                                 |
| 説明         | skill:abortがSkillExecutor.abort()と正しく連携する        |
| 受け入れ基準 | AC-004-1: 実行中のスキルがabort()で中断できる             |
|              | AC-004-2: 中断時にABORTEDステータスがRendererに通知される |

### FR-005: 実行状態の取得

| 項目         | 内容                                                           |
| ------------ | -------------------------------------------------------------- |
| 優先度       | P1 (重要)                                                      |
| 説明         | skill:get-statusがSkillExecutor.getExecutionStatus()と連携する |
| 受け入れ基準 | AC-005-1: 実行中/完了/エラー状態が正しく取得できる             |

---

## 非機能要件 (NFR)

### NFR-001: セキュリティ

| 項目         | 内容                                                       |
| ------------ | ---------------------------------------------------------- |
| 優先度       | P0 (必須)                                                  |
| 説明         | 既存のセキュリティ機構を維持する                           |
| 受け入れ基準 | AC-N001-1: validateIpcSender()による送信元検証が維持される |
|              | AC-N001-2: safeInvoke/safeOnパターンが維持される           |
|              | AC-N001-3: IPC_CHANNELSホワイトリストが維持される          |

### NFR-002: エラーハンドリング

| 項目         | 内容                                                             |
| ------------ | ---------------------------------------------------------------- |
| 優先度       | P0 (必須)                                                        |
| 説明         | エラー発生時の適切なハンドリングとレスポンス                     |
| 受け入れ基準 | AC-N002-1: 認証エラー（AUTHENTICATION_ERROR）が適切に返される    |
|              | AC-N002-2: スキル未発見エラー（SKILL_NOT_FOUND）が適切に返される |
|              | AC-N002-3: エラー詳細が内部情報を漏洩しない（サニタイズ済み）    |
|              | AC-N002-4: エラーカテゴリに応じたコード範囲を使用                |

> **参照**: `aiworkflow-requirements/references/error-handling.md`

#### エラーカテゴリとコード範囲

| カテゴリ               | コード範囲 | 本タスクでの適用                           | リトライ |
| ---------------------- | ---------- | ------------------------------------------ | -------- |
| Validation Error       | 1000-1999  | skillId未指定、スキル未インポート          | 不可     |
| Business Error         | 2000-2999  | スキル未存在、SkillExecutor未初期化        | 不可     |
| External Service Error | 3000-3999  | SDK認証エラー、SDK実行エラー、タイムアウト | **可能** |
| Infrastructure Error   | 4000-4999  | -                                          | **可能** |
| Internal Error         | 5000-5999  | 予期せぬエラー                             | 不可     |

#### ログサニタイズ要件

| 項目                 | 方針                                               |
| -------------------- | -------------------------------------------------- |
| APIキー              | ログ出力禁止（`[REDACTED]` に置換）                |
| ユーザー入力(prompt) | 最初の50文字のみログ出力                           |
| スタック情報         | 本番環境ではユーザー向けエラーに含めない           |
| エラーメッセージ     | 内部詳細を含めない（サニタイズ後に Renderer 送信） |

### NFR-003: 後方互換性

| 項目         | 内容                                                 |
| ------------ | ---------------------------------------------------- |
| 優先度       | P1 (重要)                                            |
| 説明         | 既存のRenderer側コードが変更なしで動作する           |
| 受け入れ基準 | AC-N003-1: skill:executeのレスポンス形式が維持される |
|              | AC-N003-2: 既存のuseSkillExecutionフックが動作する   |

### NFR-004: パフォーマンス

| 項目         | 内容                                          |
| ------------ | --------------------------------------------- |
| 優先度       | P2 (望ましい)                                 |
| 説明         | スキル実行のレイテンシを維持する              |
| 受け入れ基準 | AC-N004-1: 委譲による追加レイテンシが50ms以下 |

---

## 統合テスト連携【必須】

接続要件（API/認証/データフロー）を要件に明記する:

| 接続要件カテゴリ | 記載内容                                                   |
| ---------------- | ---------------------------------------------------------- |
| API接続          | skill:execute, skill:abort, skill:get-status, skill:stream |
| 認証フロー       | AuthKeyService経由でAnthropic APIキー取得                  |
| データフロー     | Renderer → IPC → SkillExecutor → SDK → Stream → Renderer   |

---

## アーキテクチャ層別要件

| 層                         | 確認観点                                            |
| -------------------------- | --------------------------------------------------- |
| フロントエンド（Renderer） | useSkillExecutionフックの互換性維持、ストリーム受信 |
| バックエンド（Main）       | SkillExecutor.execute()呼び出し、エラーハンドリング |
| IPC通信                    | skill:executeハンドラーの変更、レスポンス形式維持   |
| セキュリティ               | validateIpcSender維持、safeInvoke/safeOnパターン    |
| データ                     | SkillMetadata取得、PermissionStore連携              |

---

## スコープ定義

### スコープ内

1. skill:execute IPCハンドラーの修正
2. SkillService.executeSkill()のスタブ削除または非推奨化
3. 必要なテストの追加・修正
4. E2Eスモークテストの実施

### スコープ外

1. SkillExecutorの機能追加
2. 新しいIPCチャンネルの追加
3. Renderer側コンポーネントの変更
4. PermissionStore/PermissionResolverの変更

---

## 成果物

| 成果物     | パス                                                                        | 説明           |
| ---------- | --------------------------------------------------------------------------- | -------------- |
| 要件定義書 | `docs/30-workflows/skill-execute-delegation/phases/phase-1-requirements.md` | 本ドキュメント |

---

## 完了条件

- [x] 全要件が抽出されている
- [x] 各要件に受け入れ基準がある
- [x] FR/NFRが分類されている
- [x] 接続要件（API/認証/データフロー）が明記されている
- [x] アーキテクチャ層別の要件が整理されている
- [x] スコープが明確に定義されている
- [x] **本Phase内の全タスクを100%実行完了**

---

## 多角的チェック観点（AIが判断）

タスクの性質に応じて、以下の観点を確認する。
**具体的なチェック項目はAIがタスク内容に応じて判断・適用する。**

| 観点               | 適用判断                          | 仕様参照先                                                         |
| ------------------ | --------------------------------- | ------------------------------------------------------------------ |
| セキュリティ       | ✅ IPC通信・認証要件              | `aiworkflow-requirements: security-skill-ipc.md`                   |
| アーキテクチャ     | ✅ SkillExecutor委譲設計          | `aiworkflow-requirements: architecture-implementation-patterns.md` |
| API設計            | ✅ SkillExecutionRequest/Response | `aiworkflow-requirements: interfaces-agent-sdk-executor.md`        |
| エラーハンドリング | ✅ エラーコード・サニタイズ       | `aiworkflow-requirements: error-handling.md`                       |

📖 詳細: `references/quality-standards.md` セクション8

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認（既存実装、aiworkflow-requirements仕様書）
2. 機能要件（FR）の抽出
3. 非機能要件（NFR）の抽出
4. 受け入れ基準の定義
5. スコープ定義
6. 統合テスト連携の実施
7. 成果物の作成・配置
8. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/skill-execute-delegation --phase 1
```

---

## 次のPhase

Phase 2: 設計
