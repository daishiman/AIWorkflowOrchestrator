# AgentView 型アサーション解消 - タスク指示書

## メタ情報

| 項目         | 内容                                                 |
| ------------ | ---------------------------------------------------- |
| タスクID     | task-ut-fix-5-1-001-agentview-type-assertion         |
| タスク名     | AgentView型アサーション解消（ImportedSkill→Skill）   |
| 分類         | リファクタリング                                     |
| 対象機能     | AgentView / Skill 型整合性                           |
| 優先度       | 低                                                   |
| 見積もり規模 | 小規模                                               |
| ステータス   | 未実施                                               |
| 発見元       | TASK-FIX-5-1-SKILL-API-UNIFICATION Phase 10（MINOR） |
| 発見日       | 2026-02-06                                           |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`AgentView` では `importedSkills` と `availableSkillsMetadata` を `Skill[]` として扱うために、`as unknown as Skill[]` の型アサーションを使用している。これは実装を進めるための暫定回避であり、型の整合性をコンパイラで保証できていない。

### 1.2 問題点・課題

- 型アサーションにより、実際のデータ形が `Skill` とずれていてもコンパイル時に検知できない
- 将来のフィールド追加・変更時にランタイム不整合が潜在化する
- P24（型不整合）を温存し、同様の `unknown as` が増殖するリスクがある

### 1.3 放置した場合の影響

- 表示・フィルタ・実行時に予期しない `undefined` アクセスが発生する
- 仕様変更時の回帰検知が弱くなる
- 型安全性を前提にしたリファクタリングが難しくなる

---

## 2. 何を達成するか（What）

### 2.1 目的

`AgentView` から `as unknown as Skill[]` を除去し、`ImportedSkill` と `Skill` の差分を明示的な型変換関数で吸収する。

### 2.2 最終ゴール

- `AgentView` で `unknown` 型アサーションを使用しない
- 変換ロジックが1箇所に集約され、単体テストで保証される
- `pnpm --filter @repo/desktop exec vitest run src/renderer/views/AgentView/__tests__/AgentView.test.tsx` がPASS

### 2.3 スコープ

#### 含むもの

- `AgentView` 周辺の型変換ロジック追加
- 必要最小限の型定義調整（`@repo/shared/types/skill` / slice側型）
- 変換ロジックの単体テスト追加

#### 含まないもの

- Skill API 全体の再設計
- unrelated コンポーネントの型改修
- IPCチャンネル仕様変更

### 2.4 成果物

| 成果物               | 説明                                   |
| -------------------- | -------------------------------------- |
| 型変換ユーティリティ | ImportedSkill→Skill を安全変換する関数 |
| AgentView修正        | 型アサーションの除去                   |
| テスト               | 変換関数とAgentViewの回帰テスト        |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `UT-FIX-AGENTVIEW-INFINITE-LOOP-001` が完了していること
- 現行 `AgentView` テストがPASSしていること

### 3.2 依存タスク

| タスクID                           | 状態 |
| ---------------------------------- | ---- |
| UT-FIX-AGENTVIEW-INFINITE-LOOP-001 | 完了 |
| TASK-FIX-5-1-SKILL-API-UNIFICATION | 完了 |

### 3.3 推奨アプローチ

1. `ImportedSkill` と `Skill` の差分フィールド一覧を作る
2. `toSkillViewModel()` のような明示的変換関数を作る
3. `AgentView` 内の `as unknown as Skill[]` を置換する
4. 変換関数の異常系（欠損フィールド）テストを追加する

### 3.4 実装課題と解決策（親タスクからの学び）

| 課題                                             | 原因                                               | 解決策                                                          |
| ------------------------------------------------ | -------------------------------------------------- | --------------------------------------------------------------- |
| 型を急いで通すため `unknown as` が残る           | リリース優先で型境界の設計が後回しになりやすい     | 変換関数を境界に固定し、UIではViewModelのみ使う                 |
| 仕様書に未タスクを記録してもファイル実体が漏れる | Phase 12で表更新とファイル配置の確認が分離している | `task-workflow.md` のパスを機械検証し、物理ファイル確認を必須化 |

---

## 4. 実行手順

### Phase 1: 要件定義

- `ImportedSkill` / `Skill` 差分を列挙
- 変換責務の境界（どこで変換するか）を決定

### Phase 2-5: 設計〜実装

- 変換関数を追加
- `AgentView` を変換済み型に置換
- 不要な型アサーションを削除

### Phase 6-9: 品質

- 変換関数テスト追加
- 既存 AgentView テスト回帰確認
- lint/typecheck/test 実行

### Phase 12: ドキュメント

- `arch-state-management.md` と `task-workflow.md` の該当行を更新
- 完了時に本ファイルのステータスを更新

---

## 5. 完了条件チェックリスト

- [ ] `AgentView` から `as unknown as Skill[]` が消えている
- [ ] 変換関数が1箇所に集約されている
- [ ] 変換関数の正常系/異常系テストがある
- [ ] lint/typecheck/test がPASS
- [ ] `task-workflow.md` の未タスク参照が最新化されている

---

## 6. 検証方法

1. `rg -n "as unknown as Skill\[\]" apps/desktop/src/renderer/views/AgentView -S` が0件
2. `pnpm --filter @repo/desktop exec vitest run src/renderer/views/AgentView/__tests__/AgentView.test.tsx` がPASS
3. `pnpm --filter @repo/desktop typecheck` がPASS

---

## 7. 参照資料

- `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `docs/30-workflows/completed-tasks/UT-FIX-AGENTVIEW-INFINITE-LOOP-001/outputs/phase-12/unassigned-task-detection.md`
- `docs/30-workflows/unassigned-task/task-9b-h-api-dual-publishing-unification.md`
