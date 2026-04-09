# Phase 8: リファクタリング

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| Phase      | 8                            |
| タスクID   | UT-SKILL-WIZARD-W3-seq-04    |
| 機能名     | 使用率計装（usage tracking） |
| 前提Phase  | Phase 7                      |
| 後続Phase  | Phase 9                      |
| 作成日     | 2026-04-07                   |
| ステータス | pending                      |

## 目的

計装実装を品質・可読性・拡張性の観点でリファクタリングし、全テストが Green のまま維持されることを確認する。

## リファクタリング観点

### 1. 型安全な trackEvent への移行

汎用的な `Record<string, unknown>` ペイロードから、型安全な実装へ移行する。

```typescript
// リファクタリング前
export function trackEvent(
  eventName: string,
  payload: Record<string, unknown>,
): void;

// リファクタリング後
type SkillWizardEvents = {
  skill_wizard_started: Record<never, never>;
  skill_wizard_step1_completed: {
    method: "complete" | "skip";
    skippedAtQuestion: number | null;
  };
  // ... 残り3イベント
};

export function trackEvent<K extends keyof SkillWizardEvents>(
  eventName: K,
  payload: SkillWizardEvents[K],
): void;
```

### 2. 計装コードの一箇所化

`SkillCreateWizard.tsx` 内に散在する `trackEvent` 呼び出しを、さらに hook へ寄せず、各処理の直前で発火する最小構成を維持する。

```typescript
// リファクタリング前（散在）
// handleGenerate 内に直接 trackEvent 呼び出し
// handleQualityFeedback 内に直接 trackEvent 呼び出し

// リファクタリング後（最小構成）
// まずは trackEvent の型安全化と各コンポーネント内の責務分離に留める。
// hook の追加は行わない。
```

### 3. CompleteStep の計装分離

`CompleteStep.tsx` 内のネクストアクション計装を props 経由に変更し、コンポーネントの疎結合を維持する。

```typescript
// リファクタリング前
// CompleteStep 内で直接 trackEvent を呼ぶ

// リファクタリング後
// CompleteStep には onNextAction コールバックのみ
// trackEvent は SkillCreateWizard 側で行う
```

### 4. 不要な console.info コメントの整理

スタブ実装のコメントをより明確にし、将来の差し替えポイントを明示する。

## 責務境界マップ

| ファイル                            | 責務                                    |
| ----------------------------------- | --------------------------------------- |
| `utils/trackEvent.ts`               | renderer-local の薄い計装スタブ         |
| `SkillCreateWizard.tsx`             | 計装呼び出し・ウィザード制御            |
| `wizard/CompleteStep.tsx`           | ネクストアクション UI（計装は外部委譲） |
| `SkillAnalytics` / `AnalyticsStore` | execution-centric の既存基盤として維持  |

## 統合テスト連携

- Phase 4 / 6 のテストが Green のままであることを前提に、Phase 8 では追加の振る舞い変更を入れない。
- `trackEvent` の型安全化は維持しつつ、`SkillCreateWizard` と `CompleteStep` の責務境界を崩さない。
- hook 追加は行わず、最小複雑性を優先する。

## 参照資料

| 資料名                 | パス                                              | 用途           |
| ---------------------- | ------------------------------------------------- | -------------- |
| 受け入れ基準           | `outputs/phase-1/acceptance-criteria.md`          | Phase 1 成果物 |
| カバレッジ計画         | `outputs/phase-7/coverage-plan.md`                | Phase 7 成果物 |
| 未到達分析             | `outputs/phase-7/uncovered-analysis-plan.md`      | Phase 7 成果物 |
| トレーサビリティ網羅率 | `outputs/phase-7/traceability-coverage-report.md` | Phase 7 成果物 |
| 実装サマリー           | `outputs/phase-5/implementation-summary.md`       | Phase 5 成果物 |
| 拡張テストケース       | `outputs/phase-6/expanded-test-cases.md`          | Phase 6 成果物 |
| 拡張設計書             | `outputs/phase-2/extension-design.md`             | Phase 2 成果物 |

## 実行タスク

1. Phase 7 成果物を確認する。
2. 型安全な `trackEvent` への移行を実施する。
3. 計装コードの一箇所化は行わず、hook 追加もしない。
4. リファクタリング後に全テストが Green であることを確認する。

## 成果物

| 成果物         | パス                                             | 説明                         |
| -------------- | ------------------------------------------------ | ---------------------------- |
| リファクタ計画 | `outputs/phase-8/refactoring-plan.md`            | リファクタリング内容と方針   |
| 再テスト計画   | `outputs/phase-8/post-refactor-test-plan.md`     | リファクタ後のテスト確認計画 |
| 責務境界マップ | `outputs/phase-8/responsibility-boundary-map.md` | 計装責務の整理               |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] `trackEvent` が型安全な実装になっていること
- [ ] リファクタリング後に全テストが Green であること
- [ ] 責務境界マップが完成していること
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. 型安全 trackEvent への移行
3. 計装コードの一箇所化を行わない方針の確認
4. リファクタ後テスト確認
5. 成果物出力

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 9: 品質保証
