# アーキテクチャ設計 - スキル実行機能

## Phase 2 - タスク1: アーキテクチャ分析

### 作成日

2026-01-18

---

## 現状のスキル管理アーキテクチャ

```
┌─────────────────────────────────────────────────────────────────┐
│ Renderer Process                                                │
│ ┌─────────────────────┐    ┌──────────────────────────────────┐│
│ │     AgentView       │───>│  skillAPI (renderer/preload)     ││
│ │ handleExecute       │    │  - listAvailable()               ││
│ │ (TODO未実装)        │    │  - listImported()                ││
│ │                     │    │  - import()                      ││
│ │ selectedSkill       │    │  - remove()                      ││
│ │ isLoading           │    │  - getDetail()                   ││
│ │ error               │    │  - execute() ← 【追加必要】       ││
│ └─────────────────────┘    └──────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ IPC (skill:execute) ← 【追加必要】
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ Main Process                                                    │
│ ┌──────────────────────────────────────────────────────────────┐│
│ │  skillHandlers.ts                                            ││
│ │  - handle("skill:list-available", ...)                       ││
│ │  - handle("skill:list-imported", ...)                        ││
│ │  - handle("skill:import", ...)                               ││
│ │  - handle("skill:remove", ...)                               ││
│ │  - handle("skill:get-detail", ...)                           ││
│ │  - handle("skill:execute", ...) ← 【追加必要】                ││
│ └──────────────────────────────────────────────────────────────┘│
│                              │                                  │
│                              ▼                                  │
│ ┌──────────────────────────────────────────────────────────────┐│
│ │  SkillService.ts (Facade)                                    ││
│ │  - scanAvailableSkills()                                     ││
│ │  - getImportedSkills()                                       ││
│ │  - importSkills()                                            ││
│ │  - removeSkill()                                             ││
│ │  - getSkillById()                                            ││
│ │  - executeSkill() ← 【追加必要】                              ││
│ └──────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

---

## スキル実行機能のデータフロー

### 正常系フロー

```
┌─────────────┐
│ User Click  │
│ "実行"ボタン │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────┐
│ AgentView.handleExecute()       │
│ 1. setExecutingSkillId(skill.id)│
│ 2. await skillAPI.execute()     │
└──────┬──────────────────────────┘
       │
       │ IPC invoke("skill:execute", { skillId, params })
       ▼
┌─────────────────────────────────┐
│ skillHandlers.ts                │
│ 1. validateIpcSender()          │
│ 2. validate args                │
│ 3. skillService.executeSkill()  │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│ SkillService.executeSkill()     │
│ 1. getSkillById(skillId)        │
│ 2. 実行ロジック                  │
│ 3. return SkillExecutionResult  │
└──────┬──────────────────────────┘
       │
       │ IPC response (OperationResult<SkillExecutionResult>)
       ▼
┌─────────────────────────────────┐
│ AgentView                       │
│ 1. setExecutingSkillId(null)    │
│ 2. showToast("success", ...)    │
└─────────────────────────────────┘
```

---

### 異常系フロー

```
┌─────────────────────────────────┐
│ Error occurs at any step        │
└──────┬──────────────────────────┘
       │
       │ IPC response { success: false, error: "..." }
       ▼
┌─────────────────────────────────┐
│ AgentView                       │
│ 1. setExecutingSkillId(null)    │
│ 2. showToast("error", ...)      │
└─────────────────────────────────┘
```

---

## レイヤー構成

| レイヤー        | コンポーネント | 責務                                        |
| --------------- | -------------- | ------------------------------------------- |
| UI層            | AgentView      | ユーザー操作の受付、状態表示                |
| API層 (Preload) | skillAPI       | IPC通信の抽象化                             |
| IPC層           | skillHandlers  | IPC受信、セキュリティ検証、サービス呼び出し |
| サービス層      | SkillService   | ビジネスロジック（スキル実行）              |

---

## 修正対象ファイル

| ファイル                                               | 修正内容                      |
| ------------------------------------------------------ | ----------------------------- |
| `apps/desktop/src/preload/channels.ts`                 | SKILL_EXECUTE チャンネル追加  |
| `apps/desktop/src/renderer/preload/index.ts`           | skillAPI.execute メソッド追加 |
| `apps/desktop/src/main/ipc/skillHandlers.ts`           | skill:execute ハンドラー追加  |
| `apps/desktop/src/main/services/skill/SkillService.ts` | executeSkill メソッド追加     |
| `apps/desktop/src/renderer/views/AgentView/index.tsx`  | handleExecute 実装            |

---

## 統合ポイント

### IPC通信契約

| 項目       | 値                                                      |
| ---------- | ------------------------------------------------------- |
| チャンネル | `skill:execute`                                         |
| 引数       | `{ skillId: string, params?: Record<string, unknown> }` |
| 戻り値     | `OperationResult<SkillExecutionResult>`                 |

### セキュリティ

- validateIpcSender による sender 検証必須
- ALLOWED_INVOKE_CHANNELS へのチャンネル追加必須

---

## 完了確認

- [x] 現状のRenderer → Main Processのスキル通信フローを確認
- [x] アーキテクチャ図を作成
- [x] 修正対象ファイルを特定
- [x] 統合ポイントを明記
- [x] outputs/phase-2/architecture.md に出力
