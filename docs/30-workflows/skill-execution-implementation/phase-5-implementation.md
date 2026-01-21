# Phase 5: 実装（TDD Green） - タスク仕様書

## メタ情報

| 項目       | 内容                           |
| ---------- | ------------------------------ |
| Phase      | 5                              |
| Phase名    | 実装                           |
| 前提Phase  | Phase 4                        |
| 後続Phase  | Phase 6                        |
| ステータス | 未実施                         |
| 作成日     | 2026-01-18                     |
| 機能名     | skill-execution-implementation |

---

## 目的

Phase 4で作成したテストをパスさせるための実装を行う（TDD Green）。

## 背景

TDD（Test-Driven Development）のGreenフェーズとして、失敗しているテストをパスさせる
最小限の実装を行う。既存のスキル管理アーキテクチャに execute 機能を追加する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: IPC チャンネル追加

**目的**: skill:execute IPCチャンネルを定義する

**実行手順**:

1. `apps/desktop/src/preload/channels.ts` を編集
2. Skill management operations に追加:

```typescript
SKILL_EXECUTE: "skill:execute",
```

3. ALLOWED_INVOKE_CHANNELS に追加:

```typescript
IPC_CHANNELS.SKILL_EXECUTE,
```

**期待される成果物**:

- channels.ts 修正

---

### タスク2: skillAPI.execute 実装

**目的**: Renderer Process側のskillAPI.execute を実装する

**実行手順**:

1. `apps/desktop/src/renderer/preload/index.ts` を編集
2. SkillExecutionResult インターフェースを追加
3. skillAPI に execute メソッドを追加:

```typescript
execute: async (skillId: string, params?: Record<string, unknown>) => {
  if (hasElectronAPI(window)) {
    return window.electronAPI.invoke<OperationResult<SkillExecutionResult>>(
      "skill:execute",
      { skillId, params },
    );
  }
  return { success: false, error: "Electron API not available" };
},
```

**期待される成果物**:

- skillAPI.execute 実装

---

### タスク3: SkillService.executeSkill 実装

**目的**: Main Process側のSkillService.executeSkill を実装する

**実行手順**:

1. `apps/desktop/src/main/services/skill/SkillService.ts` を編集
2. executeSkill メソッドを追加:

```typescript
async executeSkill(
  skillId: string,
  params?: Record<string, unknown>,
): Promise<OperationResult<SkillExecutionResult>> {
  const skill = await this.getSkillById(skillId);
  if (!skill) {
    return { success: false, error: "スキルが見つかりません" };
  }
  // 実行ロジック実装
}
```

**期待される成果物**:

- SkillService.executeSkill 実装

---

### タスク4: skillHandlers に execute ハンドラー追加

**目的**: IPC ハンドラーを実装する

**実行手順**:

1. `apps/desktop/src/main/ipc/skillHandlers.ts` を編集
2. skill:execute ハンドラーを追加（sender検証含む）
3. unregisterSkillHandlers に removeHandler を追加

**期待される成果物**:

- skillHandlers 修正

---

### タスク5: AgentView の handleExecute 実装

**目的**: UI側の実行ハンドラーを実装する

**実行手順**:

1. `apps/desktop/src/renderer/views/AgentView/index.tsx` を編集
2. executingSkillId state を追加
3. handleExecute を実装（ローディング状態管理、トースト通知）

**期待される成果物**:

- AgentView handleExecute 実装

---

### タスク6: テスト実行（成功確認）

**目的**: TDD Greenフェーズとしてテストが成功することを確認する

**実行手順**:

1. テストを実行

```bash
pnpm --filter @repo/desktop test -- --run
```

2. 全テストが成功することを確認
3. 成功結果を `outputs/phase-5/test-green-result.md` に記録

**期待される成果物**:

- テスト成功結果ドキュメント

---

## 参照資料

| 参照資料               | パス                                                                           | 内容                      |
| ---------------------- | ------------------------------------------------------------------------------ | ------------------------- |
| Phase 2設計成果物      | `outputs/phase-2/`                                                             | 実装設計                  |
| Phase 4テスト成果物    | `apps/desktop/src/**/__tests__/`                                               | 作成済みテスト            |
| IPC Handler Pattern    | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md`   | IPCハンドラー登録パターン |
| セキュリティ実装ガイド | `.claude/skills/aiworkflow-requirements/references/security-implementation.md` | sender検証パターン        |

---

## 成果物

| 成果物                    | 配置先                                                 | 内容                  |
| ------------------------- | ------------------------------------------------------ | --------------------- |
| channels.ts 修正          | `apps/desktop/src/preload/channels.ts`                 | SKILL_EXECUTE追加     |
| skillAPI.execute 実装     | `apps/desktop/src/renderer/preload/index.ts`           | execute メソッド      |
| SkillService.executeSkill | `apps/desktop/src/main/services/skill/SkillService.ts` | executeSkill メソッド |
| skillHandlers 修正        | `apps/desktop/src/main/ipc/skillHandlers.ts`           | execute ハンドラー    |
| AgentView 修正            | `apps/desktop/src/renderer/views/AgentView/index.tsx`  | handleExecute 実装    |
| テスト成功結果            | `outputs/phase-5/test-green-result.md`                 | Green確認結果         |
| 実装サマリー              | `outputs/phase-5/implementation-summary.md`            | 実装概要              |

---

## 統合テスト連携

| アクション                | 詳細                                                 |
| ------------------------- | ---------------------------------------------------- |
| フロント/バック接続の実装 | skillAPI → IPC → skillHandlers → SkillService の接続 |
| テスト支援コード整備      | モック、スタブの整備                                 |

---

## 完了条件

- [ ] IPC チャンネルが追加されている
- [ ] skillAPI.execute が実装されている
- [ ] SkillService.executeSkill が実装されている
- [ ] skillHandlers に execute ハンドラーが追加されている
- [ ] AgentView の handleExecute が実装されている
- [ ] 全てのテストがパスする（TDD Green）
- [ ] 統合テスト連携アクションが実施されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（タスク1〜6）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] outputs/phase-5/ ディレクトリに全成果物を配置

---

## 依存関係

- **前提**: Phase 4（テスト作成）が完了していること
- **後続**: Phase 6（テスト拡充）へ進む

---

## TDD検証

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test -- --run
```

**確認項目**:

- [ ] テストが成功することを確認（Green状態）

---

## Phase実行記録

Phase完了後、以下を記録してください:

```markdown
## Phase 5 実行記録

### 実行タスク

- タスク1: IPCチャンネル追加 - [完了/未完了]
- タスク2: skillAPI.execute実装 - [完了/未完了]
- タスク3: SkillService.executeSkill実装 - [完了/未完了]
- タスク4: skillHandlers修正 - [完了/未完了]
- タスク5: AgentView handleExecute実装 - [完了/未完了]
- タスク6: テスト実行（成功確認） - [完了/未完了]

### TDD Green状態確認

- テスト成功数:
- 全テストパス: [Yes/No]

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phaseへの引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/skill-execution-implementation/phase-6-test-expansion.md`
