# UT-SC-02-006: SkillLifecyclePanel execute handoff UI 接続 - タスク指示書

## メタ情報

```yaml
issue_number: 1640
```

| 項目         | 内容                                                                     |
| ------------ | ------------------------------------------------------------------------ |
| タスクID     | UT-SC-02-006                                                             |
| タスク名     | SkillLifecyclePanel execute handoff UI 接続                              |
| 分類         | 改善                                                                     |
| 対象機能     | Skill Creator - execute terminal handoff renderer UI                     |
| 優先度       | 中                                                                       |
| 見積もり規模 | 小規模                                                                   |
| ステータス   | 未実施                                                                   |
| 発見元       | Phase 12（UT-SC-02-005 レビューでの未タスク検出）                        |
| 発見日       | 2026-03-26                                                               |
| 依存タスク   | UT-SC-02-005, UT-GUIDANCE-BLOCK-HANDOFF-CARD-RULE-001                    |
| GitHub       | [#1640](https://github.com/daishiman/AIWorkflowOrchestrator/issues/1640) |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`UT-SC-02-005` により `executePlan()` の戻り値型は `RuntimeSkillCreatorExecuteResponse` に統一され、`SkillLifecyclePanel.tsx` でも `terminal_handoff` を型安全に判定できるようになった。

しかし Renderer 側の実装は、`terminal_handoff` を受け取った際に `console.info()` を出して早期 return するだけで、ユーザーに handoff 内容を見せる UI へ接続していない。コード上にも `TODO(terminal-handoff-ui)` が残っており、契約は正しくても体験が未完了の状態である。

### 1.2 問題点・課題

| 問題                       | 詳細                                                                            |
| -------------------------- | ------------------------------------------------------------------------------- |
| handoff 情報が UI に出ない | `bundle` が state に保持されず、`TerminalHandoffCard` などへ渡っていない        |
| デバッグ依存の暫定挙動     | `console.info()` のみでは利用者が次アクションを理解できない                     |
| 既存成功パスとの両立が必要 | 通常成功時の `fetchSkills()` / `selectSkillByName()` フローは維持する必要がある |

### 1.3 放置した場合の影響

- `terminal_handoff` が返っても利用者は画面上で理由や次アクションを確認できない
- 将来の Skill Creator guidance 系 UI と責務がずれ、同種の handoff 表示が重複実装になりやすい
- `UT-SC-02-005` で解消した型契約整合が、最終的なユーザー体験へ結び付かない

---

## 2. 何を達成するか（What）

### 2.1 目的

`executePlan()` が `terminal_handoff` を返したとき、Renderer 側で handoff 情報を保持し、利用者が次アクションを理解できる guidance UI を表示する。

### 2.2 最終ゴール

- `SkillLifecyclePanel` が `terminal_handoff` の `bundle` を UI state に保持する
- `TerminalHandoffCard` または等価 UI に `bundle` が渡る
- 通常成功パスと失敗パスの挙動に回帰がない

### 2.3 スコープ

#### 含むもの

- `handleExecutePlan()` の `terminal_handoff` 分岐を UI state 更新へ接続
- 既存 guidance / handoff UI との責務整理
- Renderer テストの追加または更新

#### 含まないもの

- Main / Preload / shared 型契約の再変更
- `executePlan()` 自体の business logic 変更
- Skill Creator 以外の別画面 handoff UI の横展開

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `UT-SC-02-005` が完了しており、`executePlan()` が `RuntimeSkillCreatorExecuteResponse` を返すこと
- `UT-GUIDANCE-BLOCK-HANDOFF-CARD-RULE-001` の guidance / handoff 表示ルールを参照できること

### 3.2 推奨アプローチ

1. `SkillLifecyclePanel.tsx` の `terminal_handoff` 分岐で `bundle` を UI state へ保持する
2. 既存の表示コンポーネントを再利用できるか確認し、再利用できない場合のみ局所的な UI を追加する
3. 通常成功・失敗・handoff の 3 経路をテストで固定する

### 3.3 苦戦箇所と解き方

| 苦戦箇所                         | なぜ詰まりやすいか                                                                                     | 解き方                                                                        |
| -------------------------------- | ------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------- |
| handoff state の置き場           | `SkillLifecyclePanel` には既に generation / error / selection state が多く、安易に追加すると責務が散る | 既存 state を棚卸しし、`terminal_handoff` 専用 state を 1 箇所に閉じる        |
| `TerminalHandoffCard` との接続面 | 既存 guidance 系 UI の props 契約と `bundle` shape が完全一致しない可能性がある                        | まず shared 型を起点に adapter の要否を判断し、 local 型を増やさない          |
| 成功パス回帰                     | handoff 分岐追加時に `fetchSkills()` / `selectSkillByName()` の通常導線を壊しやすい                    | handoff 時の早期 return と integrated success path をテストで分離して固定する |

### 3.4 参考資料

| ファイル                                                                                                              | 用途                            |
| --------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                                                  | 対象実装                        |
| `docs/30-workflows/completed-tasks/UT-SC-02-005-preload-execute-type-update/outputs/phase-12/implementation-guide.md` | 現状の完了範囲と follow-up 根拠 |
| `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md`                                          | backlog 管理                    |

---

## 4. 実行手順

1. `SkillLifecyclePanel.tsx` の `handleExecutePlan()` と関連 state を棚卸しする
2. `terminal_handoff` 分岐で `bundle` を保持する state / adapter を追加する
3. `TerminalHandoffCard` または等価 UI へ `bundle` を渡す表示経路を接続する
4. 通常成功・失敗・handoff の 3 経路テストを追加または更新する

## 5. 完了条件チェックリスト

- [ ] `handleExecutePlan()` の `terminal_handoff` 分岐が UI 表示へ接続される
- [ ] `TerminalHandoffCard` または等価 UI に `bundle` が渡される
- [ ] 通常成功時の `fetchSkills()` / `selectSkillByName()` フローに回帰がない
- [ ] 関連テストが PASS する

## 6. 検証方法

- `pnpm exec vitest run apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx`
- `pnpm exec vitest run apps/desktop/src/preload/__tests__/skill-creator-api.runtime.test.ts`
- `pnpm exec tsc --noEmit`

## 7. リスクと対策

| リスク                                     | 対策                                                                   |
| ------------------------------------------ | ---------------------------------------------------------------------- |
| guidance UI と handoff UI の責務が重複する | 既存 `TerminalHandoffCard` の再利用を優先し、新規 local 型を増やさない |
| state 追加で既存 UI が複雑化する           | `terminal_handoff` 専用 state を 1 箇所に閉じ、成功 path と分離する    |
| UI だけ実装して contract がずれる          | shared 型を正本にし、Preload / Renderer テストで shape を固定する      |

## 8. 参照情報

- `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`
- `apps/desktop/src/renderer/components/organisms/TerminalHandoffCard/index.tsx`
- `docs/30-workflows/completed-tasks/UT-SC-02-005-preload-execute-type-update/outputs/phase-12/unassigned-task-detection.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md`

## 9. 備考

- 物理ファイル名は lowercase semantic filename を維持し、本文内のタスクIDは `UT-SC-02-006` を正本とする
