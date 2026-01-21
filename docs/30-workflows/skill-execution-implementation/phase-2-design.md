# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                           |
| ---------- | ------------------------------ |
| Phase      | 2                              |
| Phase名    | 設計                           |
| 前提Phase  | Phase 1                        |
| 後続Phase  | Phase 3                        |
| ステータス | 未実施                         |
| 作成日     | 2026-01-18                     |
| 機能名     | skill-execution-implementation |

---

## 目的

スキル実行機能の技術設計を行い、実装方針を決定する。

## 背景

Phase 1で定義された要件に基づき、Electron IPCパターンを使用したスキル実行機能の設計を行う。
既存のスキル管理アーキテクチャ（skillAPI, skillHandlers, SkillService）を拡張する形で設計する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: アーキテクチャ分析

**目的**: 既存のスキル管理アーキテクチャを分析する

**実行手順**:

1. 現状のRenderer Process → Main Processのスキル通信フローを確認
2. 以下のアーキテクチャ図を作成

```
┌─────────────────────────────────────────────────────────────┐
│ Renderer Process                                              │
│ ┌─────────────────┐    ┌──────────────────────────────────┐  │
│ │   AgentView     │───>│  skillAPI (renderer/preload)      │  │
│ │ handleExecute   │    │  - listAvailable()                │  │
│ │ (TODO未実装)    │    │  - listImported()                 │  │
│ └─────────────────┘    │  - import()                       │  │
│                        │  - remove()                       │  │
│                        │  - getDetail()                    │  │
│                        │  - execute() ← 追加必要           │  │
│                        └──────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              ↓ IPC (skill:execute)
┌─────────────────────────────────────────────────────────────┐
│ Main Process                                                  │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │  skillHandlers.ts                                         │ │
│ │  - handle("skill:execute", ...) ← 追加必要               │ │
│ └──────────────────────────────────────────────────────────┘ │
│                              ↓                                │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │  SkillService.ts                                          │ │
│ │  - executeSkill() ← 追加必要                              │ │
│ └──────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

3. `outputs/phase-2/architecture.md` に出力

**期待される成果物**:

- アーキテクチャ設計図

---

### タスク2: インターフェース設計

**目的**: skillAPI.execute と関連する型定義を設計する

**実行手順**:

1. 以下のインターフェースを設計

```typescript
interface SkillAPI {
  execute: (
    skillId: string,
    params?: Record<string, unknown>,
  ) => Promise<OperationResult<SkillExecutionResult>>;
}

interface SkillExecutionResult {
  executionId: string;
  status: "success" | "failed";
  output?: string;
  error?: string;
  startedAt: Date;
  completedAt: Date;
}
```

2. `outputs/phase-2/interface-design.md` に出力

**期待される成果物**:

- インターフェース設計ドキュメント

---

### タスク3: IPCハンドラー設計

**目的**: skill:execute IPCハンドラーを設計する

**実行手順**:

1. IPC Channel定義を設計: `SKILL_EXECUTE: "skill:execute"`
2. ハンドラー処理フローを設計（sender検証、引数検証、サービス呼び出し）
3. `outputs/phase-2/ipc-handler-design.md` に出力

**期待される成果物**:

- IPCハンドラー設計ドキュメント

---

### タスク4: SkillService設計

**目的**: SkillService.executeSkill メソッドを設計する

**実行手順**:

1. executeSkill メソッドのシグネチャを設計
2. スキル実行ロジックのフローを設計
3. エラーハンドリング方針を決定
4. `outputs/phase-2/skill-service-design.md` に出力

**期待される成果物**:

- SkillService設計ドキュメント

---

### タスク5: AgentView設計

**目的**: handleExecute の実装設計を行う

**実行手順**:

1. 実行中状態管理（executingSkillId state）を設計
2. トースト通知のパターンを設計
3. エラーハンドリングUIを設計
4. `outputs/phase-2/agent-view-design.md` に出力

**期待される成果物**:

- AgentView設計ドキュメント

---

## 参照資料

| 参照資料               | パス                                                                           | 内容                      |
| ---------------------- | ------------------------------------------------------------------------------ | ------------------------- |
| IPC Handler Pattern    | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md`   | IPCハンドラー登録パターン |
| セキュリティ実装ガイド | `.claude/skills/aiworkflow-requirements/references/security-implementation.md` | IPC sender検証要件        |
| 既存skillAPI実装       | `apps/desktop/src/renderer/preload/index.ts`                                   | 現行skillAPI実装          |
| 既存skillHandlers実装  | `apps/desktop/src/main/ipc/skillHandlers.ts`                                   | 現行IPCハンドラー実装     |
| 既存SkillService実装   | `apps/desktop/src/main/services/skill/SkillService.ts`                         | 現行SkillService実装      |

---

## 成果物

| 成果物               | 配置先                                    | 内容                         |
| -------------------- | ----------------------------------------- | ---------------------------- |
| アーキテクチャ設計図 | `outputs/phase-2/architecture.md`         | スキル実行のデータフロー     |
| インターフェース設計 | `outputs/phase-2/interface-design.md`     | 型定義、API設計              |
| IPCハンドラー設計    | `outputs/phase-2/ipc-handler-design.md`   | skill:execute ハンドラー設計 |
| SkillService設計     | `outputs/phase-2/skill-service-design.md` | executeSkill メソッド設計    |
| AgentView設計        | `outputs/phase-2/agent-view-design.md`    | UI実装設計                   |

---

## 統合テスト連携

| アクション                                     | 詳細                                                  |
| ---------------------------------------------- | ----------------------------------------------------- |
| preload/mainプロセス間の実行フローを設計に反映 | skillAPI.execute → IPC → skillHandlers → SkillService |
| 統合ポイント/契約を設計に明記                  | IPC Channel、引数形式、戻り値形式を定義               |

---

## 完了条件

- [ ] アーキテクチャ設計が完了している
- [ ] インターフェース設計が完了している
- [ ] IPCハンドラー設計が完了している
- [ ] SkillService設計が完了している
- [ ] AgentView設計が完了している
- [ ] 統合テスト連携アクションが実施されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（タスク1〜5）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] outputs/phase-2/ ディレクトリに全成果物を配置

---

## 依存関係

- **前提**: Phase 1（要件定義）が完了していること
- **後続**: Phase 3（設計レビューゲート）へ進む

---

## Phase実行記録

Phase完了後、以下を記録してください:

```markdown
## Phase 2 実行記録

### 実行タスク

- タスク1: アーキテクチャ分析 - [完了/未完了]
- タスク2: インターフェース設計 - [完了/未完了]
- タスク3: IPCハンドラー設計 - [完了/未完了]
- タスク4: SkillService設計 - [完了/未完了]
- タスク5: AgentView設計 - [完了/未完了]

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

`docs/30-workflows/skill-execution-implementation/phase-3-design-review.md`
