# スキル実行IPCセキュリティ / history bundle

> 親仕様書: [security-skill-ipc.md](security-skill-ipc.md)
> 役割: history bundle

## 完了タスク

| タスク | 完了日 | テスト数 |
|--------|--------|----------|
| TASK-FIX-5-1-SKILL-API-UNIFICATION SkillAPI統一 | 2026-02-06 | 138 |
| TASK-FIX-4-1-IPC-CONSOLIDATION IPCチャンネル統合 | 2026-02-05 | 42 |
| TASK-9B-H-SKILL-CREATOR-IPC SkillCreatorService IPC登録 | 2026-02-12 | 85 |
| TASK-9B SkillCreator IPC拡張同期 | 2026-02-26 | 追加回帰テスト実施 |

### TASK-9B: SkillCreator IPC拡張のセキュリティ同期（2026-02-26）

| 観点 | 実装 | 判定 |
| --- | --- | --- |
| Sender検証 | `skill-creator:*` の全12 invokeで `validateIpcSender` を適用 | PASS |
| 入力検証 | `create` を含む文字列入力に P42 3段バリデーション（型/空文字/trim空文字） | PASS |
| パス防御 | `validatePath()` による `tasksDir`/`skillDir` のパストラバーサル検知 | PASS |
| スキーマ防御 | `ALLOWED_SCHEMA_NAMES` による許可スキーマ名の制限 | PASS |
| エラー秘匿 | `sanitizeErrorMessage()` による内部パス/機密値のマスキング | PASS |

#### 仕様書別SubAgent分担（TASK-9B 再監査）

| SubAgent | 担当仕様書 | 主担当作業 |
| --- | --- | --- |
| SubAgent-A | `interfaces-agent-sdk-skill.md` | IPC契約（13チャンネル）と型I/Fの同期 |
| SubAgent-B | `security-skill-ipc.md` | sender/P42/パス/スキーマ/秘匿の検証要件同期 |
| SubAgent-C | `task-workflow.md` | 完了台帳と検証証跡の同期 |
| SubAgent-D | `lessons-learned.md` | 苦戦箇所と再利用手順の教訓化 |

#### 再監査時の苦戦箇所と解決策

| 苦戦箇所 | 問題 | 解決策 |
| --- | --- | --- |
| `create` ハンドラーの P42 未完了 | 型/空文字チェックはあるが `trim()` 空白検証が欠落し、空白入力が通過する余地があった | `skillCreatorHandlers.ts` の `create` に 3段バリデーションを追加し、空文字/空白回帰テストを実装 |
| セキュリティ仕様のチャンネル数ドリフト | 6チャンネル記述が残ると、sender検証適用範囲を過小評価しやすい | 13チャンネル（12 invoke + 1 progress）へ統一し、全12 invoke で `validateIpcSender` 適用を明記 |
| 監査結果の `current` / `baseline` 混同 | 全体監査の違反数を今回差分違反と誤認しやすい | `audit --diff-from HEAD` を合否判定の正本に固定し、全体監査は監視値として別記録 |

#### 同種課題の簡潔解決手順（5ステップ）

1. `channels.ts` と handler/preload 実装から実際のIPC契約数を先に確定する。  
2. 全invokeに `validateIpcSender` と P42 3段バリデーションを適用する。  
3. セキュリティ要件（パス防御/スキーマ防御/エラー秘匿）を1テーブルで同期する。  
4. `interfaces/security/task/lessons` を同一ターンで更新する。  
5. `audit --diff-from HEAD` の `currentViolations` を合否基準にし、baselineは別管理する。  

### UT-FIX-SKILL-EXECUTE-INTERFACE-001: `skill:execute` 検証要件同期（2026-02-25）

#### 実装反映

| 項目 | 内容 |
| --- | --- |
| 正式契約 | `SkillExecutionRequest`（`skillName`, `prompt`）を受理 |
| 後方互換 | 旧 `{ skillId, params }` を継続受理 |
| セキュリティ境界 | `validateIpcSender` + `skillName`/`skillId` の非空文字列検証（`trim()`） |
| 責務分離 | `prompt` の内容制約はサービス層・実行エンジン側で評価 |

#### 仕様書別SubAgent分担（同期反映）

| SubAgent | 担当仕様書 | 主担当作業 |
| --- | --- | --- |
| SubAgent-A | `interfaces-agent-sdk-skill.md` | 正式契約 + 後方互換契約の定義同期 |
| SubAgent-B | `security-skill-ipc.md` | sender/入力検証要件のセキュリティ観点明文化 |
| SubAgent-C | `task-workflow.md` | 完了記録・検証証跡・未タスク監査結果の台帳化 |
| SubAgent-D | `lessons-learned.md` | 苦戦箇所と再利用手順の教訓化 |

#### 実装時の苦戦箇所と解決策

| 苦戦箇所 | 問題 | 解決策 |
| --- | --- | --- |
| `skillName` と `skillId` の二重契約 | 一方を優先すると既存呼び出しを壊しやすい | 正式契約/後方互換契約を明示し、type guardで経路分離 |
| 検証責務の過剰集約 | `prompt` 内容制約までIPC層に寄せると責務が肥大化 | IPC層は sender + 識別子検証のみ、内容検証は下位層へ委譲 |
| 仕様書同期の順序依存 | interfaces/security/task台帳が別ターン更新でドリフトしやすい | 仕様書ごとにSubAgent担当を固定し、同一ターンで同期 |

#### 同種課題の簡潔解決手順（4ステップ）

1. IPC正式契約と後方互換契約を同時に定義する。  
2. ハンドラー層では sender + 入力形式のみ検証し、業務ルールは下位層へ分離する。  
3. 新旧契約の正常系/異常系テストを同一ターンで追加する。  
4. interfaces/security/task/lessons の4仕様書を SubAgent 分担で同時更新する。  

### TASK-FIX-5-1-SKILL-API-UNIFICATION safeInvoke/safeOnパターン

**実装場所**: `apps/desktop/src/preload/skill-api.ts`

SkillAPI統一により、全13メソッドが `safeInvoke` / `safeOn` セキュリティパターンを通じてIPC通信を行う（safeInvoke 9件 + safeOn 4件）。

パターン実装の詳細（チャンネル一覧、検証ステップ、セキュリティ効果）は以下を参照:

> **正本**: [architecture-implementation-patterns.md - SkillAPI統一パターン](./architecture-implementation-patterns.md#skillapi統一パターンtask-fix-5-1-2026-02-06実装)

### TASK-FIX-4-1-IPC-CONSOLIDATION 実装課題と解決策

| 苦戦箇所               | 問題                                                                          | 解決策                                                                |
| ---------------------- | ----------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| ハードコード文字列発見 | `"skill:complete" as string` のようなコードで型チェックとホワイトリストをバイパス | Grep で `as string` パターンを検出し、`IPC_CHANNELS.SKILL_COMPLETE` 定数に置換 |
| 重複定義の整理         | `preload/channels.ts` と `shared/ipc/channels.ts` に同じチャンネルが定義されていた | Single Source of Truth パターンで `preload/channels.ts` に統合         |
| ホワイトリスト更新漏れ | 旧チャンネル名 `skill:list-available` が `ALLOWED_INVOKE_CHANNELS` に残存       | テストで旧チャンネル名が含まれないことを検証するアサーション追加       |
| テスト独立性           | 既存テストがグローバル状態に依存していた                                        | beforeEach で明示的にリセットし、各テストが独立して実行できるよう改善  |

**教訓**:
- `as string` を使った型キャストはセキュリティ上危険（ホワイトリスト検証をバイパス）
- IPC チャンネル定義は必ず Single Source of Truth パターンで管理
- ホワイトリストの更新は必ずテストで検証

**関連パターン**: [architecture-implementation-patterns.md](./architecture-implementation-patterns.md) - IPCチャンネル統合パターン

| TASK-8C-A IPC統合テスト（skillHandlers） | 2026-02-02 | 41 |
| TASK-5-1 SkillAPI Preload実装 | 2026-01-27 | 67 |
| TASK-4-1 スキルインポートIPCチャネル | 2026-01-25 | 60 |
| TASK-3-2 SkillExecutor IPC Handler | 2026-01-25 | 192 |
| TASK-3-1-D Permission Dialog UI | 2026-01-26 | 93 |
| claude-code-cli-integration | 2026-01-17 | 240 |

---

## 残課題

| タスクID | タスク名 | 優先度 | 状態 |
|----------|----------|--------|------|
| TASK-IPC-SHARED-CHANNELS-REFACTORING | packages/shared/ipc/channels.ts 整理 | 低 | 未実施 |
| ~~UT-FIX-SKILL-VALIDATION-P42-001~~ | ~~skillHandlers P42準拠バリデーション横展開（6ハンドラの`.trim()`追加）~~ | ~~中~~ | **完了: 2026-02-24（UT-FIX-SKILL-VALIDATION-CONSISTENCY-001 で実施）** |
| UT-FIX-SKILL-IPC-ERROR-RESPONSE-001 | skillHandlers IPCバリデーションエラー応答パターン統一（throw vs return不統一） | 中 | 未実施 |
| ~~UT-IMP-TASK9B-SPEC-CONTRACT-GUARD-001~~ | ~~TASK-9B 仕様契約再監査ガード強化（13ch同期/P42 create/current-baseline判定）~~ | ~~中~~ | **完了: 2026-02-26（completed-tasks/unassigned-task へ移管）** |

> **Note**: TASK-FIX-4-1-IPC-CONSOLIDATION で preload/channels.ts への統合は完了したが、packages/shared 配下の整理は他パッケージへの影響調査が必要なため、別タスクとして分離。
>
> **指示書**: [task-ipc-shared-channels-refactoring.md](../../../../docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-ipc-shared-channels-refactoring.md)

---

## 関連ドキュメント

- [スキル実行セキュリティ定数](./security-skill-execution.md)
- [APIセキュリティ](./security-api.md)
- [Electron IPCセキュリティ](./security-electron-ipc.md)
- [TASK-FIX-5-1 実装ガイド](../../../../docs/30-workflows/completed-tasks/TASK-FIX-5-1-SKILL-API-UNIFICATION/outputs/phase-12/implementation-guide.md)
- [TASK-FIX-4-1 実装ガイド](../../../../docs/30-workflows/completed-tasks/TASK-FIX-4-1-IPC-CONSOLIDATION/outputs/phase-12/implementation-guide.md)
- [TASK-9B-H 実装ガイド](../../../../docs/30-workflows/completed-tasks/skill-creator-ipc/outputs/phase-12/implementation-guide.md)
- [TASK-9B 実装ガイド](../../../../docs/30-workflows/completed-tasks/task-9b-skill-creator/outputs/phase-12/implementation-guide.md)

---

## 変更履歴

| バージョン | 日付       | 変更内容                                     |
| ---------- | ---------- | -------------------------------------------- |
| v1.16.0    | 2026-02-27 | UT-FIX-SKILL-IPC-RESPONSE-CONSISTENCY-001 再監査反映: `skill:optimize*` 3チャネルのP42検証要件（return→throw統一）を追加し、`sanitizeErrorMessage()` によるエラー秘匿の適用範囲とデフォルト文言を明文化 |
| v1.15.0    | 2026-02-26 | TASK-9B 完了移管に同期: `UT-IMP-TASK9B-SPEC-CONTRACT-GUARD-001` を完了化し、TASK-9B 実装ガイド参照を `completed-tasks/task-9b-skill-creator/` へ更新 |
| v1.14.0    | 2026-02-26 | TASK-9B 再監査の苦戦箇所を未タスク化: 残課題に `UT-IMP-TASK9B-SPEC-CONTRACT-GUARD-001` を追加（13chドリフト/P42 `create` 3段検証/current-baseline判定の再発防止） |
| v1.13.0    | 2026-02-26 | TASK-9B再監査追補: `create` のP42 3段バリデーション補完、13チャンネル前提の検証範囲統一、`current/baseline` 分離運用を苦戦箇所と再利用5ステップとして追加 |
| v1.12.0    | 2026-02-26 | TASK-9B反映: SkillCreator IPC拡張（12 invoke + 1 progress）のセキュリティ要件を同期。Sender検証・P42・パス防御・スキーマ防御・エラー秘匿の実装適用範囲を更新 |
| v1.11.0    | 2026-02-25 | UT-FIX-SKILL-EXECUTE-INTERFACE-001 追補: `skill:execute` 実装反映（正式契約 + 後方互換）、苦戦箇所、仕様書別SubAgent分担、再利用4ステップを追加 |
| v1.10.0    | 2026-02-25 | UT-FIX-SKILL-EXECUTE-INTERFACE-001反映: `skill:execute` の検証要件を `skillName` 正式契約 + `skillId` 後方互換へ更新（`prompt` の内容制約はサービス層責務） |
| v1.9.0     | 2026-02-24 | UT-FIX-SKILL-VALIDATION-CONSISTENCY-001完了反映: 残課題 `UT-FIX-SKILL-VALIDATION-P42-001` を完了化（補完タスクで実施済みとして同期） |
| v1.8.0     | 2026-02-21 | UT-FIX-SKILL-IMPORT-INTERFACE-001反映: `skill:import` の検証要件を `skillName` 非空文字列（`trim()` 含む3段バリデーション）に更新 |
| v1.0.0     | 2026-01-25 | 初版作成                                     |
| v1.1.0     | 2026-01-26 | コードブロックを表形式・文章に変換（ガイドライン準拠） |
| v1.2.0     | 2026-01-27 | TASK-5-1 SkillAPI Preload実装セクション追加  |
| v1.3.0     | 2026-02-02 | TASK-8C-A完了記録追加（41テスト、IPC統合テスト）       |
| v1.8.0     | 2026-02-21 | UT-FIX-SKILL-IMPORT-RETURN-TYPE-001反映: `skill:import` の検証要件を `skillName` 非空文字列（`trim()` 含む3段バリデーション）に更新。引数形式を `skillIds: string[]` → `skillName: string` に変更 |
| v1.7.0     | 2026-02-20 | UT-FIX-SKILL-REMOVE-INTERFACE-001反映: `skill:remove` の検証要件を `skillName` 非空文字列（`trim()` 含む3段バリデーション）に更新 |
| v1.6.0     | 2026-02-12 | TASK-9B-H-SKILL-CREATOR-IPC完了: SkillCreatorService IPCチャネルセキュリティセクション追加（6チャンネル、validateIpcSender適用、引数バリデーション、エラーサニタイズ）|
| v1.4.0     | 2026-02-04 | TASK-FIX-4-1-IPC-CONSOLIDATION完了（旧チャンネル削除、42テスト） |
| v1.5.0     | 2026-02-09 | テンプレート準拠（概要追加、変更履歴を末尾に移動） |

