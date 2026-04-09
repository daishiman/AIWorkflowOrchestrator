# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                                                 |
| ---------- | ---------------------------------------------------- |
| Phase      | 1                                                    |
| タスクID   | UT-SKILL-WIZARD-W3-seq-04                            |
| 機能名     | 使用率計装（usage tracking）                         |
| 前提Phase  | -                                                    |
| 後続Phase  | Phase 2                                              |
| 作成日     | 2026-04-07                                           |
| ステータス | pending                                              |
| タスク分類 | NON_VISUAL（Renderer 内部の計装のみ / 視覚差分なし） |

## 目的

5つの計装ポイントのイベントスキーマを確定し、trackEvent 実装の受け入れ基準を固定する。  
このタスクは見た目を変えない NON_VISUAL であり、後続の手動確認はスクリーンショットではなくコンソール証跡とチェックリストを主証跡にする。

## 背景

W2-seq-03aで改修された `SkillCreateWizard.tsx` と `CompleteStep.tsx` に対して、  
ウィザードの使用パターンを記録するための計装を追加する。  
既存の `SkillAnalytics` / `AnalyticsStore` は execution-centric のため、W3 の UI 計装はそれらに直結させず、renderer-local の薄い `trackEvent` 抽象として閉じる。

## 計装ポイント詳細

### イベント1: skill_wizard_started

```typescript
trackEvent("skill_wizard_started", {});
```

- 発火タイミング: ウィザードコンポーネントマウント時
- 目的: ウィザード起動の有無を最小コストで把握する

### イベント2: skill_wizard_step1_completed

```typescript
trackEvent("skill_wizard_step1_completed", {
  method: "complete" | "skip",
  skippedAtQuestion: number | null, // スキップ時に何問目で押したか
});
```

- 発火タイミング: Step 1完了時（全問回答またはスキップボタン押下時）
- 目的: 会話ラリーの完了率とスキップ傾向の把握

### イベント3: skill_wizard_generation_completed

```typescript
trackEvent("skill_wizard_generation_completed", {
  method: "complete" | "skip",
  category: SkillCategory,
  hasExternalIntegration: boolean,
});
```

- 発火タイミング: LLM生成完了時
- 目的: 生成成功率とカテゴリ分布の把握

### イベント4: skill_skeleton_quality_feedback

```typescript
trackEvent("skill_skeleton_quality_feedback", {
  satisfied: boolean,
  generationMethod: "complete" | "skip",
});
```

- 発火タイミング: 骨格品質フィードバック（👍/👎）送信時
- 目的: 生成品質の主観評価データ収集

### イベント5: skill_wizard_next_action

```typescript
trackEvent("skill_wizard_next_action", {
  action: "execute" | "open_editor" | "create_another",
});
```

- 発火タイミング: CompleteStep でのネクストアクション選択時
- 目的: ウィザード後の行動パターン把握

## 受け入れ基準

| AC-ID | 対象イベント                        | 受け入れ条件                                                                                      |
| ----- | ----------------------------------- | ------------------------------------------------------------------------------------------------- |
| AC-01 | `skill_wizard_started`              | ウィザード起動時に 1 回だけ記録され、payload が空オブジェクトである                               |
| AC-02 | `skill_wizard_step1_completed`      | Step 1 完了またはスキップ時に記録され、`method` と `skippedAtQuestion` の組み合わせが整合している |
| AC-03 | `skill_wizard_generation_completed` | LLM 生成完了後にのみ記録され、`category` と `hasExternalIntegration` が生成結果と一致する         |
| AC-04 | `skill_skeleton_quality_feedback`   | 👍 / 👎 の送信時に 1 回だけ記録され、`generationMethod` が生成時の方式と一致する                  |
| AC-05 | `skill_wizard_next_action`          | `execute` / `open_editor` / `create_another` のいずれかで記録され、3 種類すべてが検証対象になる   |

## 実行タスク

- イベントスキーマ確定: 各イベントのペイロード型を詳細化する
- 計装ポイント特定: W2-seq-03a成果物の実装コードから正確な発火タイミングを特定する
- 受け入れ基準定義: 各イベントが正しく発火することの検証基準を定義する
- タスク分類固定: NON_VISUAL 判定の理由と Phase 11 の証跡方針を固定する

## 参照資料

| 資料名                         | パス                                                                 | 用途                         |
| ------------------------------ | -------------------------------------------------------------------- | ---------------------------- |
| W2-seq-03a成果物（ウィザード） | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`   | 計装ポイントの特定           |
| CompleteStep                   | `apps/desktop/src/renderer/components/skill/wizard/CompleteStep.tsx` | ネクストアクション計装箇所   |
| 型定義（W0-seq-01成果物）      | `packages/shared/src/types/skill.ts`                                 | SkillCategory等の型確認      |
| 既存トラッキング実装           | `apps/desktop/src/main/services/skill/SkillAnalytics.ts`             | execution-centric 基盤の確認 |
| 既存ストア                     | `apps/desktop/src/main/services/skill/AnalyticsStore.ts`             | execution-centric 基盤の確認 |
| renderer-local util            | `apps/desktop/src/renderer/utils/` （trackEvent関連）                | UI 計装の薄い抽象            |
| レーンindex                    | `docs/30-workflows/skill-wizard-redesign-lane/index.md`              | タスク依存関係確認           |

## 統合テスト連携

| AC-ID | 連携先フェーズ / テスト      | 確認内容                                                            |
| ----- | ---------------------------- | ------------------------------------------------------------------- |
| AC-01 | Phase 4 / Phase 6 / Phase 11 | mount 時の単一発火と dev 環境のログ出力を確認する                   |
| AC-02 | Phase 4 / Phase 6 / Phase 11 | complete / skip の双方で 1 回だけ記録されることを確認する           |
| AC-03 | Phase 4 / Phase 6 / Phase 11 | 生成成功時のみ記録され、失敗時は発火しないことを確認する            |
| AC-04 | Phase 4 / Phase 6 / Phase 11 | フィードバックが送信ごとに正しい payload で記録されることを確認する |
| AC-05 | Phase 4 / Phase 6 / Phase 11 | 3 種類のネクストアクションすべてが記録されることを確認する          |

## 実行タスク

0. P50 チェックとして、対象ファイルの現在の実装状態と既存の trackEvent 実装有無を確認する。
1. W2-seq-03aが完了していることを確認する。
2. `SkillCreateWizard.tsx` と `CompleteStep.tsx` の実装を読み込み、5つの計装ポイントの正確な位置を特定する。
3. 既存の `SkillAnalytics` / `AnalyticsStore` の責務を確認し、renderer-local 抽象との境界を確認する。
4. 既存の `trackEvent` または類似関数の有無を調査する。
5. 各イベントのペイロード型を TypeScript で定義する。
6. 受け入れ基準を矛盾なし・漏れなしで固定する。

## 成果物

| 成果物               | パス                                         | 説明                        |
| -------------------- | -------------------------------------------- | --------------------------- |
| 要件定義書           | `outputs/phase-1/requirements-definition.md` | 機能要件・非機能要件        |
| 受け入れ基準         | `outputs/phase-1/acceptance-criteria.md`     | 検証可能なAC一覧            |
| イベントスキーマ定義 | `outputs/phase-1/event-schema-definition.md` | 5イベントのペイロード型定義 |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] 5つの計装ポイントと AC-01〜AC-05 が全て定義されていること
- [ ] 各イベントのペイロード型が TypeScript で定義されていること
- [ ] W2-seq-03aとの依存関係が確認されていること
- [ ] タスク分類が NON_VISUAL であることが明記されていること
- [ ] Phase 11 の証跡方針がスクリーンショット不要として固定されていること
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. 計装ポイントの特定
3. イベントスキーマの定義
4. 成果物出力
5. 完了条件判定

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 2: 設計
