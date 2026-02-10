# Phase 1: 要件定義

## メタ情報

| 項目     | 値                                               |
| -------- | ------------------------------------------------ |
| Phase    | 1                                                |
| タスクID | TASK-FIX-15-1-EXECUTE-HANDLER-ROUTING            |
| 機能名   | SKILL_EXECUTEハンドラーのSkillExecutor委譲       |
| 作成日   | 2026-02-09                                       |
| 分類     | バグ修正（構造的断絶）                           |
| 規模     | 小規模                                           |
| 前提     | TASK-FIX-16-1-SDK-APIKEY-INFRASTRUCTURE 完了済み |
| 状態     | 未着手                                           |

## 目的

`skill:execute` IPCハンドラーが現在スタブ実装の `SkillService.executeSkill()` を呼び出しているが、
SDK統合済みの `SkillExecutor.execute()` を呼び出すよう修正し、実際のスキル実行を可能にする。

## 実行タスク

- 現状調査: ハンドラーとSkillExecutorの断絶状態を確認
- 要件抽出: 呼び出しチェーン変更の機能要件を定義
- 受け入れ基準作成: 検証可能な受け入れ基準を定義
- 型変換要件: リクエスト/レスポンス型の変換ロジックを定義

---

## 背景・現状

### 問題の概要

`skill:execute` IPCハンドラーの呼び出しチェーンに構造的な断絶が存在する:

| コンポーネント              | 状態                                 | 問題点               |
| --------------------------- | ------------------------------------ | -------------------- |
| SKILL_EXECUTE ハンドラー    | SkillService.executeSkill() 呼び出し | 正しくない委譲先     |
| SkillService.executeSkill() | スタブ実装                           | 固定文字列を返すだけ |
| SkillExecutor.execute()     | SDK統合済み                          | 完全に孤立している   |

### 現在のコード（skillHandlers.ts L185-213）

```typescript
// skill:execute - スキルを実行
ipcMain.handle(
  IPC_CHANNELS.SKILL_EXECUTE,
  async (
    event: IpcMainInvokeEvent,
    args: { skillId: string; params?: Record<string, unknown> },
  ) => {
    const validation = validateIpcSender(event, IPC_CHANNELS.SKILL_EXECUTE, {
      getAllowedWindows: () => [mainWindow],
    });
    if (!validation.valid) {
      throw toIPCValidationError(validation);
    }
    if (typeof args?.skillId !== "string" || args.skillId === "") {
      return { success: false, error: "skillId must be a string" };
    }
    try {
      const result = await skillService.executeSkill(args.skillId, args.params); // <- 問題: スタブ実装を呼んでいる
      return { success: true, data: result };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "スキル実行に失敗しました",
      };
    }
  },
);
```

### SkillService.executeSkill() の現状（スタブ）

```typescript
async executeSkill(
  skillId: string,
  _params?: Record<string, unknown>,
): Promise<SkillRunResult> {
  // ...validation...
  const output = `Skill "${skill.name}" executed successfully`;  // <- 固定文字列
  return {
    executionId,
    status: "success",
    output,
    startedAt,
    completedAt: new Date(),
  };
}
```

### 期待される呼び出しチェーン

```
SKILL_EXECUTE handler
  → バリデーション
  → スキル取得 (skillService.getSkillById)
  → SkillExecutionRequest 構築
  → _skillExecutorInstance.execute(request, skill)
  → SDK query() API
  → ストリーミングレスポンス
```

---

## 機能要件（FR）

| FR-ID | 要件                                                                 | 優先度 |
| ----- | -------------------------------------------------------------------- | ------ |
| FR-01 | SKILL_EXECUTE ハンドラーから SkillExecutor.execute() を呼び出す      | 高     |
| FR-02 | ハンドラー引数から SkillExecutionRequest を構築する                  | 高     |
| FR-03 | SkillExecutionResponse をハンドラーレスポンスに変換する              | 高     |
| FR-04 | スキル取得時にインポート状態を確認する                               | 高     |
| FR-05 | 既存のバリデーションロジック（送信元・引数）を保持する               | 高     |
| FR-06 | エラー発生時に適切なエラーレスポンスを返す                           | 高     |
| FR-07 | \_skillExecutorInstance が初期化されていない場合のエラーハンドリング | 中     |

### 型変換要件

#### 入力変換: ハンドラー引数 → SkillExecutionRequest

| ハンドラー引数          | SkillExecutionRequest フィールド |
| ----------------------- | -------------------------------- |
| args.skillId            | skillId                          |
| args.params.prompt      | prompt                           |
| args.params.timeout     | timeout（オプション）            |
| args.params.sessionId   | sessionId（オプション）          |
| args.params.retryConfig | retryConfig（オプション）        |

#### 出力変換: SkillExecutionResponse → ハンドラーレスポンス

| SkillExecutionResponse | ハンドラーレスポンス                     |
| ---------------------- | ---------------------------------------- |
| success: true          | { success: true, data: { executionId } } |
| success: false + error | { success: false, error: string }        |

### SkillMetadata 構築

SkillExecutor.execute() の第2引数には SkillMetadata が必要:

```typescript
interface SkillMetadata extends Omit<Skill, "lastModified"> {
  // Skill型から継承: id, name, slug, description, path, triggers, anchors, allowedTools, etc.
}
```

Skill から SkillMetadata への変換:

- `lastModified` を除外してそのまま渡す

---

## 非機能要件（NFR）

| NFR-ID | 要件                                                  | 優先度 |
| ------ | ----------------------------------------------------- | ------ |
| NFR-01 | 既存テストが全て通過する                              | 高     |
| NFR-02 | 型チェックが通る（TypeScript strict）                 | 高     |
| NFR-03 | 既存のセキュリティチェック（validateIpcSender）を維持 | 高     |
| NFR-04 | SkillService との依存関係を最小化                     | 中     |
| NFR-05 | エラーメッセージをサニタイズ（内部情報を漏洩しない）  | 高     |

---

## 受け入れ基準

### AC-01: SkillExecutor.execute() 呼び出し

**Given**: SKILL_EXECUTE ハンドラーが呼び出される
**When**: バリデーションが成功し、スキルが取得できた
**Then**: \_skillExecutorInstance.execute(request, skill) が呼び出される

### AC-02: SkillExecutionRequest 構築

**Given**: ハンドラー引数 { skillId: "test-skill", params: { prompt: "Hello" } }
**When**: リクエストを構築する
**Then**: SkillExecutionRequest { skillId: "test-skill", prompt: "Hello" } が作成される

### AC-03: 成功レスポンス変換

**Given**: SkillExecutor.execute() が { executionId: "uuid", success: true } を返す
**When**: ハンドラーがレスポンスを返す
**Then**: { success: true, data: { executionId: "uuid" } } 形式で返す

### AC-04: エラーレスポンス変換

**Given**: SkillExecutor.execute() が success: false と error を返す
**When**: ハンドラーがレスポンスを返す
**Then**: { success: false, error: "<エラーメッセージ>" } 形式で返す

### AC-05: スキル未取得時のエラー

**Given**: skillService.getSkillById() が null を返す
**When**: ハンドラーが処理する
**Then**: { success: false, error: "スキルが見つかりません" } を返す

### AC-06: バリデーション保持

**Given**: IPC呼び出しが発生する
**When**: ハンドラーが呼び出される
**Then**: validateIpcSender による送信元検証が最初に実行される

### AC-07: SkillExecutor未初期化時のエラー

**Given**: \_skillExecutorInstance が null
**When**: ハンドラーが呼び出される
**Then**: { success: false, error: "スキル実行エンジンが初期化されていません" } を返す

### AC-08: prompt未指定時のエラー

**Given**: args.params.prompt が undefined または空文字
**When**: ハンドラーが引数を検証する
**Then**: { success: false, error: "prompt must be a non-empty string" } を返す

---

## スコープ定義

### 含むもの

- skillHandlers.ts の SKILL_EXECUTE ハンドラー修正
- SkillExecutionRequest 構築ロジック
- SkillExecutionResponse 変換ロジック
- エラーハンドリングの追加
- ユニットテストの追加・更新

### 含まないもの

- SkillService.executeSkill() の削除（将来タスクとして検討）
- SkillExecutor の修正（既存実装をそのまま使用）
- Renderer側の変更
- preload/channels.ts の変更

---

## 参照資料

| 資料名                 | パス                                                                | 説明                                        |
| ---------------------- | ------------------------------------------------------------------- | ------------------------------------------- |
| スキルハンドラー       | apps/desktop/src/main/ipc/skillHandlers.ts                          | 修正対象ファイル                            |
| SkillService           | apps/desktop/src/main/services/skill/SkillService.ts                | スタブ実装（参照）                          |
| SkillExecutor          | apps/desktop/src/main/services/skill/SkillExecutor.ts               | SDK統合済み実装                             |
| 型定義                 | packages/shared/src/types/skill.ts                                  | スキル関連型定義                            |
| IPCセキュリティルール  | .claude/rules/04-electron-security.md                               | IPC セキュリティ原則                        |
| エラーハンドリング仕様 | .claude/skills/aiworkflow-requirements/references/error-handling.md | エラーコード体系                            |
| IPC セキュリティ仕様   | `aiworkflow-requirements: security-skill-ipc.md`                    | IPC Sender検証、チャンネルホワイトリスト    |
| SkillExecutor仕様      | `aiworkflow-requirements: interfaces-agent-sdk-executor.md`         | execute()シグネチャ、戻り値型               |
| エラーハンドリング定義 | `aiworkflow-requirements: error-handling.md`                        | SkillExecutionErrorCode定義（SE-01〜SE-07） |
| スキル実行セキュリティ | `aiworkflow-requirements: security-skill-execution.md`              | 危険パターン検出、権限確認                  |

---

## アーキテクチャ層別要件

| 層           | 要件                                                         |
| ------------ | ------------------------------------------------------------ |
| Main Process | SKILL_EXECUTE ハンドラーを修正、SkillExecutor を委譲先に変更 |
| IPC通信      | 既存のチャンネル・型定義をそのまま使用                       |
| Preload      | 変更不要                                                     |
| Renderer     | 変更不要（ストリーミングレスポンスは既存の仕組みで受信）     |

---

## 統合テスト連携【必須】

| 接続要件カテゴリ   | 記載内容                                             |
| ------------------ | ---------------------------------------------------- |
| IPCチャンネル      | skill:execute（IPC_CHANNELS.SKILL_EXECUTE）          |
| 依存コンポーネント | SkillExecutor.execute(), SkillService.getSkillById() |
| セキュリティ       | validateIpcSender による送信元検証                   |
| ストリーミング     | SKILL_CHANNELS.SKILL_STREAM 経由でRenderer通知       |

---

## 多角的チェック観点（AIが判断）

本タスク（SKILL_EXECUTEハンドラーのSkillExecutor委譲）では以下の観点を適用：

| 観点                 | 確認内容                                    | 仕様参照先                                                  |
| -------------------- | ------------------------------------------- | ----------------------------------------------------------- |
| セキュリティ         | IPC送信元検証、エラーメッセージのサニタイズ | `aiworkflow-requirements: security-skill-ipc.md`            |
| API設計              | チャンネル定義、入出力型の統一性            | `aiworkflow-requirements: interfaces-agent-sdk-executor.md` |
| エラーハンドリング   | SkillExecutionErrorCode準拠                 | `aiworkflow-requirements: error-handling.md`                |
| Electronセキュリティ | Main Process実装、validateIpcSender使用     | `aiworkflow-requirements: security-api-electron.md`         |

**Electronデスクトップアプリ観点**:

| 層                   | 確認内容                           | 仕様参照先                    |
| -------------------- | ---------------------------------- | ----------------------------- |
| バックエンド（Main） | 要件定義の網羅性、スコープ明確化   | `architecture-*.md`           |
| IPC通信              | skill:execute チャンネル、型安全性 | `interfaces-*.md`, `api-*.md` |

---

## 成果物

| 成果物     | パス                                                                             | 説明           |
| ---------- | -------------------------------------------------------------------------------- | -------------- |
| 要件定義書 | docs/30-workflows/task-fix-15-1-execute-handler-routing/phase-01-requirements.md | 本ドキュメント |

---

## 完了条件

- [x] 全要件が抽出されている
- [x] 各要件に受け入れ基準がある
- [x] FR/NFRが分類されている
- [x] 型変換要件が定義されている
- [x] スコープが定義されている
- [x] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 2: 設計
