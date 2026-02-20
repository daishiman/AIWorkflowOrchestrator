# Phase 1: 要件定義 — SkillCreator IPCセキュリティ強化

## メタ情報

| 項目     | 内容                                                                                              |
| -------- | ------------------------------------------------------------------------------------------------- |
| タスクID | UT-9B-H-003                                                                                       |
| Phase    | 1                                                                                                 |
| タスク名 | SkillCreator IPCセキュリティ強化（パストラバーサル対策、sanitizeError、schemaNameホワイトリスト） |
| Issue    | #796                                                                                              |
| 作成日   | 2026-02-12                                                                                        |
| 優先度   | 高（security）                                                                                    |
| 規模     | 小規模                                                                                            |
| 親タスク | TASK-9B-H-SKILL-CREATOR-IPC（完了済み）                                                           |

## 目的

SkillCreator IPCハンドラー（`skillCreatorHandlers.ts`）に対して、3つのセキュリティ対策を追加する。具体的には、パストラバーサル攻撃の防止、エラーメッセージのサニタイズ、およびスキーマ名のホワイトリスト検証を実装し、Electron IPC 3層セキュリティの L3（引数バリデーション）を強化する。

## 実行タスク

- Task 1: セキュリティ要件抽出: 攻撃ベクトルと影響範囲を明確化する。
- Task 2: 受入基準定義: AC-01〜AC-10をテスト可能な形で確定する。
- Task 3: スコープ確認: 実施対象と非対象を明文化する。

### Task 1: セキュリティ要件抽出

#### 要件1: パストラバーサル防止

- **対象パラメータ**: `tasksDir`, `skillDir`（IPCハンドラーの引数として受け取るディレクトリパス）
- **攻撃ベクトル分析**:
  | 攻撃パターン | 例 | リスク |
  | ------------------- | ---------------------------- | ---------------------------------- |
  | 相対パス上位参照 | `../../etc/passwd` | アプリ外ディレクトリへのアクセス |
  | Windows バックスラッシュ | `..\windows\system32` | Windows環境での上位参照 |
  | NULLバイトインジェクション | `path\x00evil` | パス切断による意図しないファイルアクセス |
  | UNCパス | `\\\\server\\share` | ネットワーク上のリモートパスアクセス |
- **影響範囲**: `skill-creator:create`, `skill-creator:execute-tasks`, `skill-creator:validate` ハンドラー（パスパラメータを受け取る全チャンネル）

#### 要件2: エラーサニタイズ

- **対象**: すべてのSkillCreator IPCハンドラーのエラーレスポンス
- **攻撃ベクトル分析**:
  | 漏洩パターン | 例 | リスク |
  | ------------------- | ---------------------------------------- | ------------------------------ |
  | ファイルパス漏洩 | `/Users/username/projects/...` | ディレクトリ構造の推測 |
  | スタックトレース漏洩 | `at Function.execute (/app/src/...)` | 内部実装の推測 |
  | 環境変数漏洩 | `Error: API_KEY=xxx...` | 機密情報の漏洩 |
- **影響範囲**: 全6チャンネル（5 invoke + 1 progress）のエラーレスポンス

#### 要件3: schemaNameホワイトリスト

- **対象パラメータ**: `schemaName`（`skill-creator:validate-schema` ハンドラーの引数）
- **攻撃ベクトル分析**:
  | 攻撃パターン | 例 | リスク |
  | ------------------- | ---------------------------- | ---------------------------------- |
  | 未定義スキーマ名 | `unknown-schema` | バリデーションのバイパス |
  | パス挿入 | `../../malicious-schema` | スキーマファイルのパストラバーサル |
  | 空文字列 | `""` | バリデーション処理の異常動作 |
  | 特殊文字含有 | `schema;rm -rf /` | コマンドインジェクション（間接的） |
- **影響範囲**: `skill-creator:validate-schema` ハンドラー

### Task 2: 受入基準定義

| ID    | 受入基準                                                                        | テスト方法     |
| ----- | ------------------------------------------------------------------------------- | -------------- |
| AC-01 | `../` を含むパスがIPCレベルで拒否され、サービス層に到達しない                   | ユニットテスト |
| AC-02 | `..\` を含むパスがIPCレベルで拒否され、サービス層に到達しない                   | ユニットテスト |
| AC-03 | NULLバイト（`\x00`）を含むパスがIPCレベルで拒否される                           | ユニットテスト |
| AC-04 | UNCパス（`\\\\server\\share`）がIPCレベルで拒否される                           | ユニットテスト |
| AC-05 | エラーレスポンスにファイルパスが含まれない                                      | ユニットテスト |
| AC-06 | エラーレスポンスにスタックトレースが含まれない                                  | ユニットテスト |
| AC-07 | 許可リスト外のスキーマ名が拒否される                                            | ユニットテスト |
| AC-08 | 空文字列のスキーマ名が拒否される                                                | ユニットテスト |
| AC-09 | 許可リスト内のスキーマ名（`task-spec`, `skill-spec`, `mode`）は正常に処理される | ユニットテスト |
| AC-10 | 既存の機能（スキル作成、タスク実行）が引き続き正常動作する                      | 回帰テスト     |

### Task 3: スコープ確認

#### 含むもの

- `apps/desktop/src/main/ipc/skillCreatorHandlers.ts` へのセキュリティロジック追加
  - `validatePath()` 関数の実装
  - `sanitizeErrorMessage()` 関数の実装
  - `ALLOWED_SCHEMA_NAMES` 定数の定義
  - 各ハンドラーへのバリデーション呼び出し追加
- `apps/desktop/src/main/ipc/__tests__/skillCreatorHandlers.security.test.ts` の新規作成
  - パストラバーサル攻撃テスト
  - エラーサニタイズテスト
  - schemaNameホワイトリストテスト

#### 含まないもの

- 他のIPCハンドラー（authModeHandlers, agentHandlers等）のセキュリティ強化
- Preload層（`preload/index.ts`）のセキュリティ変更
- IPC_CHANNELS定数やチャンネル定義の変更
- SkillCreatorService本体のロジック変更

## 参照資料

| 資料                       | パス                                                                                        | 参照目的                           |
| -------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------- |
| タスク指示書               | `docs/30-workflows/unassigned-task/task-9b-h-security-hardening.md`                         | タスク要件の正本                   |
| Electronセキュリティルール | `.claude/rules/04-electron-security.md`                                                     | IPCセキュリティ原則                |
| IPC セキュリティ仕様       | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | IPC 3層セキュリティ定義            |
| 実装パターン仕様           | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | IPC実装パターンと設計整合性        |
| エラーハンドリング仕様     | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | エラーカテゴリ・IpcResult型        |
| Skill Creator IPC定義      | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                        | IPCチャンネル定義                  |
| 失敗事例・教訓             | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                      | 過去の見落とし再発防止             |
| 既存パス検証実装           | `apps/desktop/src/main/services/skill/SkillFileManager.ts`                                  | validatePath()リファレンス         |
| 既存エラーサニタイズ実装   | `apps/desktop/src/main/ipc/authModeHandlers.ts`                                             | sanitizeErrorMessage()リファレンス |

## 統合テスト連携

| 層                   | テスト内容                                                    | 優先度 |
| -------------------- | ------------------------------------------------------------- | ------ |
| バックエンド（Main） | IPCハンドラーのセキュリティバリデーション（パス・スキーマ名） | 高     |
| IPC通信              | 攻撃パスがサービス層（SkillCreatorService）に到達しないこと   | 高     |
| Preload/セキュリティ | safeInvoke経由の呼び出しでも検証が機能すること                | 中     |
| エラーレスポンス     | サニタイズ済みエラーがRenderer側で確実に表示されること        | 中     |

## 多角的チェック観点

| 観点               | 仕様参照先               | 確認項目                                                           |
| ------------------ | ------------------------ | ------------------------------------------------------------------ |
| セキュリティ       | security-electron-ipc.md | IPC 3層セキュリティのL3引数バリデーション準拠                      |
| エラーハンドリング | error-handling.md        | エラーサニタイズ仕様準拠、IpcResult型でのレスポンス                |
| API設計            | api-ipc-agent.md         | Skill Creator IPCチャンネル定義（5 invoke + 1 progress）との整合性 |
| 既存パターン整合性 | SkillFileManager.ts      | validatePath()のロジック一貫性                                     |
| 既存パターン整合性 | authModeHandlers.ts      | sanitizeErrorMessage()のパターン一貫性                             |

## 成果物

| 成果物     | パス                                                                                       |
| ---------- | ------------------------------------------------------------------------------------------ |
| 要件定義書 | `docs/30-workflows/completed-tasks/ut-9b-h-003-security-hardening/phase-1-requirements.md` |

## 完了条件

- [ ] 3つのセキュリティ要件（パストラバーサル、エラーサニタイズ、schemaNameホワイトリスト）が明確に定義されている
- [ ] 各要件の攻撃ベクトルが表形式で文書化されている
- [ ] 受入基準（AC-01 ~ AC-10）がテスト可能な形式で記述されている
- [ ] スコープ（含む/含まない）が明確に定義されている
- [ ] 参照資料が全て列挙されている

## 次Phase

Phase 2: 設計（`phase-2-design.md`）
