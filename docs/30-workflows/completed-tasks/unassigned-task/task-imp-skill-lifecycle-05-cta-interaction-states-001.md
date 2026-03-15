# TASK-IMP-SKILL-LIFECYCLE-05-CTA-INTERACTION-STATES-001

## メタ情報

```yaml
issue_number: 1242
```

## メタ情報

| 項目       | 値                                                     |
| ---------- | ------------------------------------------------------ |
| タスクID   | TASK-IMP-SKILL-LIFECYCLE-05-CTA-INTERACTION-STATES-001 |
| カテゴリ   | imp（改善）                                            |
| 優先度     | 低                                                     |
| 規模       | small                                                  |
| ステータス | 未着手                                                 |
| 発見源     | TASK-SKILL-LIFECYCLE-05 Phase 3 MINOR-01               |
| 作成日     | 2026-03-15                                             |

## 1. なぜこのタスクが必要か（Why）

### 背景

TASK-SKILL-LIFECYCLE-05 で定義した CTA ボタン（「今すぐ使う」「保存して後で使う」「改善する」「もう一度使う」）は、ScoringGate 4段階 × 4CTA の16パターンマトリクスでロジックを実装した。しかし Phase 3 設計レビューで hover/active/focus-visible の視覚フィードバック定義が欠如していることが MINOR-01 として検出された。

### 問題点

CTA ボタンの状態変化（hover/active/focus-visible）が未定義のため、ユーザーが操作対象を視認できず誤操作を誘発する。特に16パターンの CTA には Primary/Secondary/Warning/Hidden の4つの `CTAState` があり、状態ごとのフィードバック差分が一貫していない。

### 放置時の影響

- Apple HIG「すべての操作にフィードバック」原則違反
- WCAG 2.1 AA の focus-visible 要件未充足（コントラスト比 3:1 以上が必要）
- SkillCard 一覧で複数 CTA が並ぶ場面で操作対象が不明瞭になる

## 2. 何を達成するか（What）

### 目的

Skill Center / Agent の CTA ボタンに hover/active/focus-visible の状態定義を追加し、視覚フィードバックを16パターン全体で統一する。

### 最終ゴール

全 CTA ボタンが Apple HIG System Colors 準拠のホバー/アクティブ状態を持ち、キーボード操作時に focus-visible リングが表示される。

### スコープ

- **含む**: PostExecutionActionBar / SkillDetailPanel / SkillCard 内の CTA ボタン
- **含まない**: ScoreGateBadge（読取専用）、ナビゲーションリンク

### 成果物

| 名前               | 説明                                                  |
| ------------------ | ----------------------------------------------------- |
| CTA 状態遷移表     | CTAState × インタラクション状態のカラー定義表         |
| コンポーネント更新 | Tailwind hover:/active:/focus-visible: バリアント適用 |
| 回帰テスト         | 状態ごとのクラス適用テスト                            |

## 3. どのように実行するか（How）

### 前提条件

- `packages/shared/src/types/cta-visibility.ts` の `CTAState` 型定義が存在する
- Apple HIG System Colors が `01-architecture.md` に定義済み

### 推奨アプローチ

既存 Button 系トークンに準拠し、`variantStyles` を `Record<CTAState, string>` 型で定義する（P47 準拠）。テスト側もこの定数を import して期待値を生成する。

### 3.5. 苦戦しやすいポイント（TASK-SKILL-LIFECYCLE-05 実体験ベース）

- **Record パターン網羅性**: `cta-visibility.ts` で `Record<ScoringGate, CTAVisibility>` を使うことで4段階の網羅を TypeScript に強制できた。同様に hover/active 状態も `Record<CTAState, string>` で定義し、漏れを防ぐ
- **focus-visible と hover の混同**: focus-visible を hover と同一扱いにするとキーボードユーザーの操作性を損なう。`focus-visible:ring-2` は hover とは独立定義する
- **P47 パターン**: CSS変数ベースのスタイルテストでは `variantStyles` 定数を export してテスト側で import する方式が有効

## 4. 実行手順

1. `PostExecutionActionBar` / `SkillDetailPanel` / `SkillCard` の CTA を棚卸しする
2. `CTAState` × インタラクション状態（default/hover/active/focus-visible/disabled）の状態遷移表を Apple HIG System Colors ベースで作成する
3. `Record<CTAState, string>` 型の `variantStyles` 定数をコンポーネントモジュールスコープに定義する
4. Tailwind の hover:/active:/focus-visible: バリアントとしてコンポーネントに適用する
5. テスト側で `variantStyles` を import し、クラス適用をアサーションする
6. light/dark 両モードでスクリーンショットを撮影し証跡を残す

## 5. 完了条件チェックリスト

- [ ] CTAState × インタラクション状態の遷移表が作成されている
- [ ] hover/active/focus-visible が全 CTA に適用されている
- [ ] `Record<CTAState, string>` で状態定義が網羅的に管理されている
- [ ] 既存 UI とトークン衝突がない
- [ ] light/dark 両モードで WCAG 2.1 AA コントラスト比を充足している
- [ ] 回帰テストとスクリーンショットで検証済み

## 6. 検証方法

```bash
# コンポーネントテスト
pnpm --filter @repo/desktop exec vitest run src/renderer/components/**/PostExecutionActionBar*.test.tsx
pnpm --filter @repo/desktop exec vitest run src/renderer/components/**/SkillCard*.test.tsx

# 型チェック
pnpm --filter @repo/desktop typecheck

# Phase 11 screenshot 比較（light/dark + keyboard focus）
```

## 7. リスクと対策

| リスク                                 | 影響度 | 確率 | 対策                                                                                      |
| -------------------------------------- | ------ | ---- | ----------------------------------------------------------------------------------------- |
| 状態色がブランド基準と衝突             | 中     | 低   | `01-architecture.md` の Apple HIG System Colors 表に準拠し差分レビューする                |
| 一部 CTA のみ更新される                | 中     | 中   | `Record<CTAState, string>` で TypeScript が網羅を強制するため、コンパイルエラーで検出可能 |
| P47 パターン未適用で文字列ハードコード | 低     | 中   | `variantStyles` を export し、テスト側で import する方式を徹底する                        |

## 8. 参照情報

| ドキュメント              | パス                                                                                                                           |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Phase 12 未タスクレポート | `docs/30-workflows/completed-tasks/step-04-seq-task-05-created-skill-usage-journey/outputs/phase-12/unassigned-task-report.md` |
| CTA制御マトリクス実装     | `packages/shared/src/types/cta-visibility.ts`                                                                                  |
| UI コンポーネント仕様     | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`                                                |
| workflow 正本             | `.claude/skills/aiworkflow-requirements/references/workflow-skill-lifecycle-created-skill-usage-journey.md`                    |
| ScoringGate 正本          | `.claude/skills/aiworkflow-requirements/references/workflow-skill-lifecycle-evaluation-scoring-gate.md`                        |
| P47 パターン              | `.claude/rules/06-known-pitfalls.md#P47`                                                                                       |
| Apple HIG カラー定義      | `.claude/rules/01-architecture.md#カラーパレット`                                                                              |

## 9. 備考

- 本タスクは UI 品質改善タスクであり、新規 IPC 追加は対象外
- TASK-SKILL-LIFECYCLE-05 で `Record<ScoringGate, CTAVisibility>` パターンが有効であった経験を、`Record<CTAState, string>` に展開する
- `CTAState` 型は `cta-visibility.ts` で定義済みのため、同ファイルから import する
