# Phase 2: 設計

## メタ情報

| 項目       | 内容             |
| ---------- | ---------------- |
| Phase      | 2                |
| タスクID   | UT-CANCEL-004-01 |
| ステータス | 未実施           |
| 作成日     | 2026-04-22       |
| 入力       | Phase 1 成果物   |

## 目的

`signal` を Renderer 内の制御値としてのみ扱う設計を確定する。`createSkill(..., signal)` は導入するが、`window.electronAPI.skill.create()` の引数 shape は変えない。

## 実行タスク

### タスク 1: createSkill 契約設計

- `createSkill(description, options, context?, signal?)` の第4引数追加を定義する
- `signal?.aborted` の場合は IPC を呼ばず `""` を返す
- `signal` は IPC 引数へ含めない

### タスク 2: Wizard 受け渡し設計

- `const signal = startGeneration();` を `handleGenerate` で受け取る
- `createSkill(formData.purpose, SKILL_GENERATION_OPTIONS, skillContext, signal)` を呼ぶ

### タスク 3: 代替案比較

| 案  | 内容                             | 判定                                     |
| --- | -------------------------------- | ---------------------------------------- |
| A   | IPC に `signal` を含める         | 不採用（AbortSignal はシリアライズ不可） |
| B   | Renderer guard + 既存 cancel IPC | 採用                                     |
| C   | token/correlation-id 新設        | 今回は未採用（将来の拡張候補）           |

### タスク 4: validation matrix 定義

- typecheck
- lint
- focused test
- Phase 11 NON_VISUAL evidence

## 参照資料

| 参照資料       | パス                                                                                    | 内容                     |
| -------------- | --------------------------------------------------------------------------------------- | ------------------------ |
| Phase 1 成果物 | `outputs/phase-1/spec-extraction-map.md`                                                | 正本との対応表           |
| Renderer store | `apps/desktop/src/renderer/store/slices/agentSlice.ts`                                  | 実装対象                 |
| Wizard         | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`                      | 実装対象                 |
| Step 2 基準    | `.claude/skills/task-specification-creator/references/spec-update-step2-domain-sync.md` | Phase 12 Step 2 判定基準 |

## 実行手順

1. `createSkill` 第4引数の設計を確定する
2. Wizard 側の受け渡し設計を確定する
3. 代替案比較と採用理由を記録する
4. validation matrix を確定する

## 統合テスト連携

- Phase 4 の TC-01 は「第4引数として signal が store に届くこと」を検証する
- Phase 4 の TC-02 は「aborted signal で IPC が呼ばれないこと」を検証する
- Phase 4 の TC-WIZ-01 は「startGeneration の返値と第4引数が同一であること」を検証する

## 多角的チェック観点（AIが判断）

| 観点         | チェック内容                                   |
| ------------ | ---------------------------------------------- |
| 矛盾なし     | 設計本文と結論で IPC 非伝播が一貫しているか    |
| 漏れなし     | 契約、代替案、validation matrix が揃っているか |
| 整合性       | `index.md` と同じ current contract か          |
| 依存関係整合 | Main 側停止が cancel IPC に残っているか        |

## サブタスク管理

| サブタスクID | 内容                   | ステータス |
| ------------ | ---------------------- | ---------- |
| ST-2-01      | createSkill 契約設計   | 未実施     |
| ST-2-02      | Wizard 受け渡し設計    | 未実施     |
| ST-2-03      | 代替案比較             | 未実施     |
| ST-2-04      | validation matrix 定義 | 未実施     |

## 成果物

- `outputs/phase-2/design-doc.md`
- `outputs/phase-2/contract-decision.md`

## 完了条件

- [ ] `createSkill` の第4引数設計が確定している
- [ ] IPC 非伝播方針が明文化されている
- [ ] Wizard 側の受け渡し設計が確定している
- [ ] validation matrix が記録されている

## タスク 100% 実行確認【必須】

- [ ] 全タスクを実行した
- [ ] 設計矛盾が残っていない
- [ ] 成果物名が artifacts と一致している

## 次Phase

[phase-3-design-review.md](phase-3-design-review.md)
