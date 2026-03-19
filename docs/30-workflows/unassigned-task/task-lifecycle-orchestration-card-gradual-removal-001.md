# UT-LIFECYCLE-ORCHESTRATION-CARD-GRADUAL-REMOVAL-001 内部オーケストレーション3カード段階的廃止 - タスク指示書

## メタ情報

```yaml
issue_number: 1389
```

## メタ情報

| 項目         | 内容                                                                 |
| ------------ | -------------------------------------------------------------------- |
| タスクID     | UT-LIFECYCLE-ORCHESTRATION-CARD-GRADUAL-REMOVAL-001                  |
| タスク名     | SkillLifecyclePanel 内部オーケストレーション3カードの段階的廃止      |
| 分類         | 改善                                                                 |
| 対象機能     | SkillLifecyclePanel（進行状況セクション）                            |
| 優先度       | 中                                                                   |
| 見積もり規模 | 中規模                                                               |
| ステータス   | 未実施                                                               |
| 発見元       | Task09-12 仕様書作成時のエレガンスレビュー（2026-03-18）             |
| 発見日       | 2026-03-18                                                           |
| 関連タスク   | TASK-IMP-LIFECYCLE-TERMINAL-INTEGRATION-001, TASK-SKILL-LIFECYCLE-03 |

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-IMP-LIFECYCLE-TERMINAL-INTEGRATION-001（Task09）の仕様書作成時に、SkillLifecyclePanelの「進行状況」セクション（旧「内部オーケストレーション」）が内部のPlanner/Executor/Improverの3カード構造をユーザーに間接的に露出していることが指摘された。ラベルは日本語化（「方針判定」「実行状況」「改善状況」）されたが、3カード構造自体が残存している。

### 1.2 問題点・課題

ui-ux-realization.mdのUX禁止事項「Planner / Executor / Improverをmode switchとして露出しない」に対して、ラベル変更は第一段階の対応にすぎない。3カード構造がそのまま残る限り、ユーザーは「方針判定」「実行状況」「改善状況」という3つの内部ロールを意識させられる。ui-ux-realization.mdの原則「UIはjobとnext actionだけを出す」と矛盾する。

### 1.3 放置した場合の影響

- ユーザーが「方針判定って何？」と混乱する可能性
- 内部オーケストレーションの変更（エージェント追加等）がUIに波及するカップリング
- Task09-12の実装完了後もUX禁止事項への完全準拠が達成されない

## 2. 何を達成するか（What）

### 2.1 目的

SkillLifecyclePanelの「進行状況」セクションを、ユーザーの仕事（create/execute/improve）を主語にした表示に再構成し、内部オーケストレーションの3カード構造を廃止する。

### 2.2 最終ゴール

- 「進行状況」セクションが単一のプログレス表示（ステップ進行率・現在のアクション）に置き換わっている
- PlannerCard/ExecutorCard/ImproverCardコンポーネントが削除されている
- ユーザーには「何をしているか」（例:「スキルを生成中...」「実行結果を分析中...」）のみが表示される

### 2.3 スコープ

| 含まれるもの                           | 含まれないもの                             |
| -------------------------------------- | ------------------------------------------ |
| 「進行状況」セクションのUI再設計       | 内部オーケストレーションロジック自体の変更 |
| 3カードコンポーネントの削除            | 新規オーケストレーションエンジンの実装     |
| プログレス表示コンポーネントの新規作成 | Task09-12の仕様書変更                      |

### 2.4 成果物

- 修正済み `SkillLifecyclePanel.tsx`（進行状況セクション）
- 新規 `SkillProgressIndicator` コンポーネント（atoms）
- 削除済み PlannerCard/ExecutorCard/ImproverCard コンポーネント
- 内部状態→ユーザー向けメッセージのマッピングアダプタ

## 3. どのように実現するか（How）

### 3.1 実装方針

1. PlannerCard/ExecutorCard/ImproverCardを統合した SkillProgressIndicator（atom）を新規作成
2. 内部のPlannerService/ExecutorService/ImproverServiceの状態を、ユーザー向けメッセージにマッピングするアダプタを作成
3. SkillLifecyclePanelの「進行状況」セクションをSkillProgressIndicatorに置き換え

### 3.2 苦戦箇所の教訓（P65関連）

本タスクはTask09仕様書作成時に発見された。P65（Phase 2設計での存在しないProps/型値の前提使用）を避けるため、Phase 1でSkillLifecyclePanelの現在のProps/状態構造を必ず確認し、設計の前提条件とすること。特にPlannerCard等の内部コンポーネントの依存関係（どのstoreからどの状態を取得しているか）を調査してから設計に着手すること。

### 3.3 前提条件

- Task09-12の実装完了後に着手する（「進行状況」セクションへの追加変更がTask09で行われるため）
- ui-ux-realization.mdの導線設計が確定していること
- TASK-SKILL-LIFECYCLE-03 の成果物（SkillLifecyclePanelの初期実装）が確定していること

### 3.4 依存タスク

- TASK-IMP-LIFECYCLE-TERMINAL-INTEGRATION-001（Task09）の完了が前提

### 3.5 必要な知識

- React コンポーネント設計（Atomic Design）
- Zustand Sliceからの状態取得パターン
- ui-ux-realization.mdの「UIはjobとnext actionだけを出す」原則

## 4. 実行手順

### Phase構成

調査 -> 設計 -> 実装 -> テスト -> 検証。

### Phase 1: 現行実装の調査

#### 目的

PlannerCard/ExecutorCard/ImproverCardの依存関係と状態取得経路を把握する。

#### 手順

1. `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` を読み込み、進行状況セクションの構造を確認する
2. PlannerCard/ExecutorCard/ImproverCardが参照しているstoreとpropsを列挙する
3. 各カードが表示する状態値のリストを作成する

#### 成果物

- 依存関係マトリクス（カード × store × state）

#### 完了条件

- 3カードすべての依存関係が明確になっている

### Phase 2: SkillProgressIndicator の設計

#### 目的

ユーザーの仕事を主語にした単一プログレス表示コンポーネントを設計する。

#### 手順

1. Phase 1で得た状態値をユーザー向けメッセージにマッピングするルールを定義する
2. SkillProgressIndicatorのPropsインターフェースを設計する（P65対策: 既存のskillStoreの型定義を必ず参照する）
3. ui-ux-realization.mdのUX禁止事項に準拠しているかレビューする

#### 成果物

- SkillProgressIndicator の Props インターフェース定義
- 内部状態→ユーザー向けメッセージのマッピングテーブル

#### 完了条件

- Propsに内部オーケストレーションの概念（Planner/Executor/Improver）が露出していない

### Phase 3: 実装

#### 目的

設計に基づいてコンポーネントを実装し、既存の3カードを置き換える。

#### 手順

1. `SkillProgressIndicator` コンポーネントを `atoms/` 配下に新規作成する
2. マッピングアダプタを実装する
3. `SkillLifecyclePanel.tsx` の進行状況セクションを SkillProgressIndicator に置き換える
4. PlannerCard/ExecutorCard/ImproverCard コンポーネントを削除する

#### 成果物

- `SkillProgressIndicator.tsx`（新規）
- 修正済み `SkillLifecyclePanel.tsx`
- 削除済み 3カードコンポーネント

#### 完了条件

- 既存のSkillLifecyclePanelテストがPASSしている
- `pnpm typecheck` がPASSしている

## 5. 完了条件チェックリスト

### 機能要件

- [ ] PlannerCard/ExecutorCard/ImproverCardコンポーネントがSkillLifecyclePanelから削除されている
- [ ] SkillProgressIndicator（またはそれに相当するコンポーネント）がユーザーの仕事を主語にした表示を提供している
- [ ] ui-ux-realization.mdのUX禁止事項「内部ロールの露出禁止」に完全準拠している

### 品質要件

- [ ] 既存のSkillLifecyclePanelテストがリファクタリング後もPASSしている
- [ ] `pnpm typecheck` がPASSしている
- [ ] `pnpm lint` がPASSしている

### ドキュメント要件

- [ ] 変更内容が変更履歴に記録されている
- [ ] ui-ux-realization.mdの該当セクションに実装完了が記録されている

## 6. 検証方法

### テストケース

- Case 1: SkillLifecyclePanelに「方針判定」「実行状況」「改善状況」という文字列が表示されない
- Case 2: SkillProgressIndicatorがskillの現在フェーズに応じたユーザー向けメッセージを表示する
- Case 3: `grep -rn "PlannerCard\|ExecutorCard\|ImproverCard" apps/desktop/src/renderer/` が0件

### 検証手順

1. 対象ファイルで3カードコンポーネントの残存を grep 確認する
2. SkillProgressIndicatorがui-ux-realization.mdのメッセージ定義に沿っていることを目視確認する
3. 既存テストを実行してリグレッションがないことを確認する

## 7. リスクと対策

| リスク                                                 | 影響度 | 発生確率 | 対策                                                                           |
| ------------------------------------------------------ | ------ | -------- | ------------------------------------------------------------------------------ |
| Task09の実装変更により進行状況セクションの構造が変わる | 中     | 高       | Task09完了後に本タスクを着手する。Phase 1の調査を実施してから設計に入る        |
| マッピングアダプタが状態変化に追従できない             | 中     | 中       | Zustand storeのセレクタをP48準拠（useShallow）で実装し、不要な再レンダーを防ぐ |
| SkillProgressIndicatorのProps設計でP65が再発する       | 低     | 中       | Phase 2でskillStoreの型定義を必ず参照し、存在しない型値を使用しない            |

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/skill-lifecycle-unification/ui-ux-realization.md` — UX禁止事項・導線原則
- `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` — 現行実装
- `docs/30-workflows/skill-lifecycle-unification/tasks/step-07-par-task-09-lifecycle-terminal-integration/phase-2-design.md` — ラベル日本語化仕様
- `.claude/skills/aiworkflow-requirements/references/lessons-learned-current.md` — P65 Props前提確認の教訓

### 参考資料

- `.claude/rules/01-architecture.md#UI/UXデザイン哲学` — Apple HIG準拠原則
- `.claude/rules/06-known-pitfalls.md#P48` — useShallow未適用による無限ループ
- `.claude/rules/02-code-quality.md#コーディング規約` — Atomic Design原則

## 9. 備考

### 発見経緯

Task09（TASK-IMP-LIFECYCLE-TERMINAL-INTEGRATION-001）の仕様書作成中、SkillLifecyclePanelの進行状況セクションのラベル日本語化を検討した際に、3カード構造自体が内部オーケストレーションの露出であることが判明した。ラベル変更（第一段階）はTask09のスコープ内で対応し、構造廃止（第二段階）として本タスクに切り出した。

### 補足事項

本タスクの完了により、SkillLifecyclePanelはui-ux-realization.mdの「UIはjobとnext actionだけを出す」原則に完全準拠する。Task09-12の完了後に着手することで、二重実装のリスクを回避できる。
