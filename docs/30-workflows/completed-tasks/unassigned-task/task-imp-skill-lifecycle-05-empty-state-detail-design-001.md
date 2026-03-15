# TASK-IMP-SKILL-LIFECYCLE-05-EMPTY-STATE-DETAIL-DESIGN-001

## メタ情報

```yaml
issue_number: 1245
```

## メタ情報

| 項目       | 値                                                        |
| ---------- | --------------------------------------------------------- |
| タスクID   | TASK-IMP-SKILL-LIFECYCLE-05-EMPTY-STATE-DETAIL-DESIGN-001 |
| カテゴリ   | req（要件）                                               |
| 優先度     | 低                                                        |
| 規模       | medium                                                    |
| ステータス | 未着手                                                    |
| 発見源     | TASK-SKILL-LIFECYCLE-05 Phase 11 エッジケース検証         |
| 作成日     | 2026-03-15                                                |

## 1. なぜこのタスクが必要か（Why）

### 背景

TASK-SKILL-LIFECYCLE-05 の Phase 11 手動テストで、Skill Center の各セクション（おすすめ/最近使った/保存済み）がゼロ件の場合の Empty State UI が未定義であることが検出された。3シナリオ（Immediate Use / Deferred Use / History Reuse）の導線設計は完了しているが、初回起動時の体験が欠落している。

### 問題点

初回利用ユーザーが Skill Center を開いた際に全セクションが空表示となり、次の行動指針が失われる。CTA が表示されないため「スキルを作成する」への導線が存在せず、ユーザーが離脱する。

### 放置時の影響

- 新規ユーザーのオンボーディング体験が破綻する
- 3シナリオの起点となる Skill Center が機能しない初期状態が放置される
- Apple HIG の「Clarity」原則に違反し、行動可能な選択肢が提示されない

## 2. 何を達成するか（What）

### 目的

おすすめ/最近使った/保存済みの0件表示を、UI 文言・CTA・イラストまで含めて具体化する。

### 最終ゴール

全セクション空、セクション個別空、混合状態の3パターンで Empty State が定義され、ユーザーが次の行動を取れる CTA が表示される。

### スコープ

- **含む**: Skill Center の各セクション Empty State 設計、CTA 遷移先定義、light/dark/mobile 対応
- **含まない**: スキル作成フロー自体の設計、既存セクションのレイアウト変更

### 成果物

| 名前               | 説明                                                      |
| ------------------ | --------------------------------------------------------- |
| Empty State 設計書 | セクション別 + 統合の Empty State 定義（文言/CTA/遷移先） |
| CTA contract 表    | Empty State CTA と ScoringGate CTA の関係定義             |
| 画面証跡           | light/dark/mobile の Empty State スクリーンショット       |

## 3. どのように実行するか（How）

### 前提条件

- TASK-SKILL-LIFECYCLE-05 の3シナリオ導線設計が完了している
- `cta-visibility.ts` の CTA 制御マトリクスが実装済み
- Apple HIG System Colors が定義済み

### 推奨アプローチ

セクション別 Empty State と全体 Empty State を分離設計し、create/use 導線を明示する。Empty State の CTA は ScoringGate CTA とは独立した静的定義とする。

### 3.5. 苦戦しやすいポイント（TASK-SKILL-LIFECYCLE-05 実体験ベース）

- **設計タスクでの実装判断**: TASK-SKILL-LIFECYCLE-05 では設計タスクだが `cta-visibility.ts` の実装が必要になった。Empty State でも同様に、設計段階で CTA の遷移先コンポーネントパスまで定義する必要がある。設計書に「遷移先は実装時に決定」と書くと曖昧表現になる
- **0件状態の条件網羅**: セクションごとの0件判定条件が不整合になりやすい。`Record<SectionType, EmptyStateConfig>` パターンで全セクションの網羅を TypeScript に強制する
- **CTA contract の二重定義回避**: ScoringGate CTA（16パターン）と Empty State CTA は異なる文脈。混同すると CTA の表示条件が衝突する

### 推奨 Empty State 定義

| セクション          | 文言                                                 | CTA                                | 遷移先             |
| ------------------- | ---------------------------------------------------- | ---------------------------------- | ------------------ |
| おすすめ（0件）     | 「スキルを作成すると、ここにおすすめが表示されます」 | 「スキルを作成する」Secondary      | SkillCreator       |
| 最近使った（0件）   | 「まだスキルを使っていません」                       | なし（他セクションへの自然な誘導） | -                  |
| 保存済み（0件）     | 「保存したスキルはここに表示されます」               | 「Skill Center を探す」Tertiary    | SkillCenter トップ |
| 全セクション（0件） | 「最初のスキルを作りましょう」                       | 「スキルを作成する」Primary        | SkillCreator       |

## 4. 実行手順

1. Skill Center の各セクション（おすすめ/最近使った/保存済み）で0件条件を定義する
2. セクション単位の Empty State 文言と CTA を `Record<SectionType, EmptyStateConfig>` 型で設計する
3. 全セクション0件時の統合 Empty State を設計する
4. CTA 遷移先をコンポーネントパスまで具体化する
5. light/dark/mobile の可読性を検証し証跡を残す
6. CTA contract 表で ScoringGate CTA との関係を明示する

## 5. 完了条件チェックリスト

- [ ] セクション別 Empty State（3パターン）が設計されている
- [ ] 全セクション0件の統合 Empty State が設計されている
- [ ] CTA 遷移先がコンポーネントパスまで定義されている
- [ ] CTA contract 表で ScoringGate CTA との関係が明示されている
- [ ] light/dark/mobile の画面証跡が記録されている
- [ ] 文書同期が完了している（仕様書・テスト設計書）

## 6. 検証方法

```bash
# SkillCenter テスト
pnpm --filter @repo/desktop exec vitest run src/renderer/views/**/SkillCenter*.test.tsx

# 曖昧語チェック（Empty State 設計書内）
rg -n "適切に|正しく|必要に応じて|など" \
  docs/30-workflows/completed-tasks/unassigned-task/task-imp-skill-lifecycle-05-empty-state-detail-design-001.md

# Phase 11 screenshot（empty state 3ケース + full empty 1ケース）
```

## 7. リスクと対策

| リスク                         | 影響度 | 確率 | 対策                                                                |
| ------------------------------ | ------ | ---- | ------------------------------------------------------------------- |
| 文言だけ更新して遷移先が不一致 | 高     | 中   | CTA contract 表を同時更新し、遷移先をコンポーネントパスで固定       |
| モバイルでレイアウト崩れ       | 中     | 中   | mobile viewport screenshot を完了条件に含める                       |
| ScoringGate CTA との衝突       | 中     | 低   | Empty State CTA は ScoringGate 非依存の静的定義とし、名前空間を分離 |

## 8. 参照情報

| ドキュメント              | パス                                                                                                                           |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Phase 12 未タスクレポート | `docs/30-workflows/completed-tasks/step-04-seq-task-05-created-skill-usage-journey/outputs/phase-12/unassigned-task-report.md` |
| UI コンポーネント仕様     | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`                                                |
| ナビゲーション仕様        | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`                                                        |
| workflow 正本             | `.claude/skills/aiworkflow-requirements/references/workflow-skill-lifecycle-created-skill-usage-journey.md`                    |
| ScoringGate 正本          | `.claude/skills/aiworkflow-requirements/references/workflow-skill-lifecycle-evaluation-scoring-gate.md`                        |
| CTA 制御マトリクス        | `packages/shared/src/types/cta-visibility.ts`                                                                                  |
| Apple HIG カラー定義      | `.claude/rules/01-architecture.md#カラーパレット`                                                                              |

## 9. 備考

- 本タスクは設計補完タスク。実装時に selector を先に固定してから画面キャプチャする
- `Record<SectionType, EmptyStateConfig>` パターンは TASK-SKILL-LIFECYCLE-05 の `Record<ScoringGate, CTAVisibility>` の成功経験を応用する
- 統合 Empty State（全0件）は新規ユーザーのファーストインプレッションに直結するため、コピーテキストの品質が重要
