# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                       |
| ---------- | -------------------------- |
| Phase      | 1                          |
| Phase名    | 要件定義                   |
| 前提Phase  | なし                       |
| 後続Phase  | Phase 2                    |
| ステータス | 未実施                     |
| 作成日     | 2026-01-10                 |
| 機能名     | agent-dashboard-foundation |

---

## 目的

タスクの目的、スコープ、受け入れ基準を明文化し、後続Phaseで実装すべき内容を定義する。

## 背景

Claude CodeのClaude Agent SDKを使用したエージェント機能をアプリケーションに統合するため、専用のダッシュボード画面が必要。現状はダッシュボード、エディタ、チャット、グラフ、設定の5つのビューのみ存在し、エージェント管理機能がない。

---

## 使用スキル

> 以下のスキルを順番に呼び出して実行してください。
> 各スキルは `.claude/skills/{{スキル名}}/SKILL.md` を参照してください。

### スキル1: acceptance-criteria-writing

**パス**: `.claude/skills/acceptance-criteria-writing/SKILL.md`

**選定理由**: Given-When-Then形式で受け入れ基準を定義し、テスト可能な完了条件を設計するため

**Trigger条件**:
受け入れ基準の作成、ユーザーストーリーの仕様化、テスト可能な要件定義を行う場合に使用

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:

- `outputs/phase-1/acceptance-criteria.md` - 受け入れ基準定義

---

## 参照資料

| 参照資料                   | パス                                                                         | 内容                     |
| -------------------------- | ---------------------------------------------------------------------------- | ------------------------ |
| タスク指示書               | `docs/30-workflows/unassigned-task/task-agent-01-dashboard-foundation.md`    | 元のタスク指示           |
| UI/UXナビゲーション        | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`      | ナビゲーションボタン仕様 |
| UI/UXコンポーネント        | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`      | コンポーネント設計原則   |
| Agent SDK インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md`  | Agent SDK型定義          |
| アーキテクチャパターン     | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md` | 機能追加パターン         |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料              | パス                                                                       | 内容                          |
| --------------------- | -------------------------------------------------------------------------- | ----------------------------- |
| UI/UXナビゲーション   | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`    | ナビゲーションボタン仕様      |
| UI/UXデザインシステム | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md` | Design Tokens、カラーシステム |

---

## 成果物

| 成果物       | パス                                         | 内容              |
| ------------ | -------------------------------------------- | ----------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | 機能・非機能要件  |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | AC定義（GWT形式） |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | 実装範囲          |

---

## 統合テスト連携【必須】

接続要件（IPC/状態管理/ナビゲーション）を要件に明記する:

| 接続要件カテゴリ | 記載内容                                        |
| ---------------- | ----------------------------------------------- |
| IPC接続          | agent:get-skills, agent:execute等のチャネル定義 |
| 状態管理         | Zustand agentSliceとnavigationSliceの連携       |
| ナビゲーション   | AppDock→AgentView遷移                           |

---

## 受け入れ基準（定義済み）

```gherkin
Feature: エージェントダッシュボード基盤

Scenario: AppDockにエージェントメニューが表示される
  Given ユーザーがアプリケーションにログインしている
  When メインダッシュボード画面を表示する
  Then AppDockに「Agent」アイコンが表示される
  And アイコンにホバーすると「Agent」ラベルが表示される

Scenario: エージェント画面に遷移できる
  Given ユーザーがメインダッシュボード画面を表示している
  When AppDockの「Agent」アイコンをクリックする
  Then AgentViewが表示される
  And currentViewが「agent」に更新される

Scenario: キーボードショートカットでエージェント画面に遷移できる
  Given ユーザーがアプリケーションを操作している
  When Cmd+5（Mac）またはCtrl+5（Win/Linux）を押下する
  Then AgentViewが表示される
```

---

## 完了条件

- [ ] 全要件が抽出されている
- [ ] 各要件に受け入れ基準がある（GWT形式）
- [ ] 機能要件/非機能要件が分類されている
- [ ] 接続要件（IPC/状態管理/ナビゲーション）が明記されている
- [ ] スコープが明確に定義されている
- [ ] **本Phase内の全スキルを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全スキルを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] スキルフィードバックが記録されている

---

## 依存関係

- **前提**: なし（起点タスク）
- **後続**: Phase 2（設計）へ進む

---

## スキルフィードバック記録（Phase完了後に記入）

Phase完了後、以下を記録してください:

```markdown
## Phase 1 実行記録

### 使用スキル

- acceptance-criteria-writing: {{result}}

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/agent-dashboard-foundation/phase-2-design.md`
