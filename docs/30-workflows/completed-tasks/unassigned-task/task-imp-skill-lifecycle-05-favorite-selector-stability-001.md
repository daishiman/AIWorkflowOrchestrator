# TASK-IMP-SKILL-LIFECYCLE-05-FAVORITE-SELECTOR-STABILITY-001

## メタ情報

```yaml
issue_number: 1246
```

## メタ情報

| 項目       | 値                                                          |
| ---------- | ----------------------------------------------------------- |
| タスクID   | TASK-IMP-SKILL-LIFECYCLE-05-FAVORITE-SELECTOR-STABILITY-001 |
| カテゴリ   | perf（パフォーマンス）                                      |
| 優先度     | 低                                                          |
| 規模       | small                                                       |
| ステータス | 未着手                                                      |
| 発見源     | TASK-SKILL-LIFECYCLE-05 Phase 3 MINOR-03                    |
| 作成日     | 2026-03-15                                                  |

## 1. なぜこのタスクが必要か（Why）

### 背景

TASK-SKILL-LIFECYCLE-05 の状態管理設計で `useIsFavorite(skillName)` セレクタを定義した。Set.has() の結果（boolean プリミティブ）を返すため参照安定性自体は問題ないが、Set 自体の再生成タイミング（他のスキルのお気に入りトグル操作時）によっては関係ないコンポーネントの不要再レンダーが発生する可能性がある。

### 問題点

SkillCard 一覧で多数のカードが同時にレンダーされる場面で、1つのスキルの favorite トグルが全 SkillCard の再レンダーをトリガーする可能性がある。Zustand の `Object.is` 比較では Set オブジェクトの参照が変わると全セレクタが再実行される。

### 放置時の影響

- SkillCard が50枚以上の場面で favorite 切替の応答性が低下する
- P48 パターン（派生セレクタ無限ループ）の発生リスクが潜在する
- 他の Set ベースセレクタ（recentlyUsedSkills 等）にも同様の問題が波及する

## 2. 何を達成するか（What）

### 目的

`useIsFavorite` と関連セレクタの再レンダー特性を計測し、問題が再現した場合のみ最小の最適化を適用する。

### 最終ゴール

favorite トグル時に関係ない SkillCard の再レンダーが発生しないことを Profiler 計測で確認する。

### スコープ

- **含む**: `useIsFavorite` セレクタの再レンダー計測と必要時の最適化
- **含まない**: 他のセレクタの最適化、コンポーネント構造の変更

### 成果物

| 名前                   | 説明                                                     |
| ---------------------- | -------------------------------------------------------- |
| Profiler 計測ログ      | favorite toggle 10回の再レンダー回数記録                 |
| 最適化実装（条件付き） | 問題が再現した場合のみ selector 分離または memo 化を適用 |
| 計測比較レポート       | 改修前後のレンダー回数比較                               |

## 3. どのように実行するか（How）

### 前提条件

- P31（Zustand Store Hooks 無限ループ）が解決済みで個別セレクタベースに移行済み
- P48（useShallow 未適用による派生セレクタ無限ループ）のパターンが既知

### 推奨アプローチ

Profiler 計測を先に行い、問題が再現した場合のみ `React.memo` / selector 分離を適用する。計測なしに先行最適化しない（YAGNI 原則）。

### 3.5. 苦戦しやすいポイント（TASK-SKILL-LIFECYCLE-05 実体験ベース）

- **P48 パターンの適用判断**: `useIsFavorite` は boolean を返すため通常 `useShallow` 不要だが、親 Store の Set が変更されるケースで Zustand がセレクタを再実行するかの挙動は実測が必要。TASK-SKILL-LIFECYCLE-05 で `Record<ScoringGate, CTAVisibility>` の網羅性検証に苦戦した経験から、「仕様の挙動は推測せず実測する」原則を適用する
- **過剰最適化の罠**: 先に `React.memo` や `useShallow` を入れて複雑化しやすい。計測結果がある変更のみ採用する
- **計測環境が再現できない**: happy-dom 環境では React DevTools Profiler が動作しない。実機（Electron アプリ起動）での計測が必要

## 4. 実行手順

1. Electron アプリを起動し、React DevTools Profiler を有効にする
2. SkillCard 一覧（10枚以上）で favorite 切替のレンダー回数を計測する
3. 関係ないカード再描画が起きる条件を特定する（Set 参照変更 → セレクタ再実行）
4. 問題がある場合のみ以下のいずれかを適用する:
   - `useIsFavorite` 内部で `useRef` + 前回値比較で boolean 変化時のみ再レンダー
   - `React.memo` で SkillCard を memo 化
5. 改修前後でレンダー回数を比較し、計測ログを残す

## 5. 完了条件チェックリスト

- [ ] Profiler 計測ログが記録されている
- [ ] 不要再レンダーの有無が判定されている（定量値付き）
- [ ] 必要な場合のみ最適化が適用されている
- [ ] 最適化適用時は改修前後の比較データが記録されている
- [ ] UI 挙動とテストが維持されている（回帰テスト PASS）

## 6. 検証方法

```bash
# React DevTools Profiler 計測（favorite toggle 10回）
# Electron アプリ起動後、DevTools > Profiler タブで実施

# SkillCenter テスト
pnpm --filter @repo/desktop exec vitest run src/renderer/views/**/SkillCenter*.test.tsx

# Store テスト
pnpm --filter @repo/desktop exec vitest run src/renderer/store/**/*.test.ts
```

## 7. リスクと対策

| リスク                      | 影響度 | 確率 | 対策                                 |
| --------------------------- | ------ | ---- | ------------------------------------ |
| 過剰最適化で可読性が低下    | 中     | 中   | 計測結果がある変更のみ採用する       |
| selector 変更で表示更新漏れ | 高     | 低   | toggle 系回帰テストを先に固定する    |
| 計測環境が再現できない      | 低     | 低   | 計測手順と条件を document に記録する |

## 8. 参照情報

| ドキュメント              | パス                                                                                                                           |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Phase 12 未タスクレポート | `docs/30-workflows/completed-tasks/step-04-seq-task-05-created-skill-usage-journey/outputs/phase-12/unassigned-task-report.md` |
| 状態管理仕様              | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                                                   |
| workflow 正本             | `.claude/skills/aiworkflow-requirements/references/workflow-skill-lifecycle-created-skill-usage-journey.md`                    |
| P31 パターン              | `.claude/rules/06-known-pitfalls.md#P31`                                                                                       |
| P48 パターン              | `.claude/rules/06-known-pitfalls.md#P48`                                                                                       |
| CTA 実装                  | `packages/shared/src/types/cta-visibility.ts`                                                                                  |

## 9. 備考

- 性能改善は current workflow の回帰テスト通過を必須とする
- 問題が再現しない場合は「計測完了・問題なし」として Close する
- TASK-SKILL-LIFECYCLE-05 で「推測せず実測する」原則の有効性を確認した経験を本タスクに適用する
