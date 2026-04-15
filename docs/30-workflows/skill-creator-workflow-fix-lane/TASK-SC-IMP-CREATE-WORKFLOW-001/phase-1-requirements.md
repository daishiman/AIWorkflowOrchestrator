# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 1                               |
| Phase名    | 要件定義                        |
| 対象機能   | TASK-SC-IMP-CREATE-WORKFLOW-001 |
| 前提Phase  | -（起点）                       |
| 次Phase    | Phase 2: 設計                   |
| ステータス | 完了                            |
| 作成日     | 2026-04-14                      |

## 目的

`SkillCreatorService.ts` の `runCreateWorkflow`（行 574-577）が空実装になっている問題を特定し、
修正に必要な要件と受入条件を明確化する。

## 問題

`runCreateWorkflow` は `void options` のみで即座にリターンする空実装。
`create` モードでスキルを作成しても LLM によるコンテンツ生成が行われない。

```typescript
// 現状（行 574-577）— 空実装
private async runCreateWorkflow(options: CreateSkillOptions): Promise<void> {
  void options; // unused warning回避
}
```

`collaborative` モードでは `runCollaborativeWorkflow` が `resourceLoader.loadAgent("hearing")` を
呼び出すパターンが確立されているが、`create` モード側に同等の実装がない。

## 実行タスク

### Task 1: 問題特定と影響範囲調査

1. `SkillCreatorService.ts` 行 574-577 のコードを確認
2. `createSkill()` → `runCreateWorkflow` 呼び出し経路を追跡
3. `runCollaborativeWorkflow` 実装を参照して設計指針を確認
4. `.agents/skills/skill-creator/agents/` 内の利用可能エージェントを確認

### Task 2: 受入条件の策定

1. `create` モードのユースケースを整理
2. フォールバック要件を明確化（`loadAgent` 失敗時の継続動作）
3. 既存テストへの影響を評価
4. 受入条件を5件策定

## 受入条件

| ID   | 条件                                                                                   |
| ---- | -------------------------------------------------------------------------------------- |
| AC-1 | mode:"create" で `createSkill()` を呼ぶと `resourceLoader.loadAgent` が呼ばれる        |
| AC-2 | `runCreateWorkflow` 完了後、`createSkill()` 後続処理が正常に続く                       |
| AC-3 | `loadAgent` が失敗した場合でも `createSkill()` は成功する（フォールバック：null 返却） |
| AC-4 | `void options` コメントが削除され、`options.description` が使用される                  |
| AC-5 | `collaborative` モードの既存テストが全てパスし続ける                                   |

## 参照資料

- `apps/desktop/src/main/services/skill/SkillCreatorService.ts` — 実装対象（行 574-577）
- `.agents/skills/skill-creator/agents/extract-purpose.md` — loadAgent 参照エージェント
- `TASK-SC-FIX-GENERATE-SKILL-MD-001/` — 先行タスクA（依存関係）

## 成果物

| 成果物          | パス                              |
| --------------- | --------------------------------- |
| requirements.md | `outputs/phase-1/requirements.md` |

## 完了条件

- [x] 問題の根本原因（行 574-577 の空実装）が特定されている
- [x] 受入条件（AC-1〜AC-5）が全件策定されている
- [x] タスクAへの依存関係が明記されている

## 次 Phase

→ [Phase 2: 設計](./phase-2-design.md)
