# Phase 5: 実装

## メタ情報

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| Phase      | 5                                       |
| Phase名    | 実装                                    |
| 対象機能   | lifecycle-panel-primary-route-promotion |
| 前提Phase  | Phase 4: テスト作成                     |
| 次Phase    | Phase 6: テスト拡充                     |
| ステータス | pending                                 |
| 作成日     | 2026-04-06                              |

## 目的

Phase 4 で作成したテストを pass させるために、App.tsx のルート定義変更、`normalizeSkillLifecycleView()` の更新、`skillLifecycleJourney.ts` のナビゲーション定義変更、SkillManagementPanel の既存導線維持を実装する。

## 実行タスク

### Task 1: App.tsx ルート定義変更

- メインナビゲーション「スキル作成」のデフォルト遷移先を SkillLifecyclePanel に変更
- SkillLifecyclePanel への直接ルートを追加
- SkillCreateWizard への既存ルートは維持
- ルート優先順位の設定

### Task 2: normalizeSkillLifecycleView() 更新

- 新ルートからのアクセスを正しく正規化するロジック追加
- 既存の正規化ロジックとの共存
- 未定義ビュー値のデフォルト fallback 設定

### Task 3: skillLifecycleJourney.ts ナビゲーション定義変更

- 一次導線としてのエントリポイント追加
- ナビゲーション遷移パターンの更新
- デスクトップ/モバイル両対応の遷移定義

### Task 4: SkillManagementPanel 既存導線維持

- SkillManagementPanel → LifecyclePanel の既存遷移ロジック維持
- 導線の重複が発生しないことの確認
- props / パラメータの受け渡しが正常であることの確認

### Task 5: テスト実行 (TDD Green フェーズ)

- Phase 4 で作成したテストが全て pass することを確認
- 既存テストが全て pass することを確認（AC-6 対応）

## 参照資料

| 資料名                   | パス                                                                  | 説明                         |
| ------------------------ | --------------------------------------------------------------------- | ---------------------------- |
| Phase 2 設計文書         | `outputs/phase-2/design-document.md`                                  | 実装の根拠となる設計         |
| Phase 4 テストマトリクス | `outputs/phase-4/test-matrix.md`                                      | 実装で pass させるべきテスト |
| App.tsx                  | `apps/desktop/src/renderer/App.tsx`                                   | 変更対象                     |
| skillLifecycleJourney    | `apps/desktop/src/renderer/navigation/skillLifecycleJourney.ts`       | 変更対象                     |
| SkillManagementPanel     | `apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx` | 既存導線維持対象             |
| SkillLifecyclePanel      | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`  | 昇格対象（内部変更なし）     |
| SkillCreateWizard        | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`    | 後方互換維持対象（変更なし） |

## 実行手順

### ステップ1: App.tsx の変更

1. SkillLifecyclePanel への直接ルートを追加
2. メインナビゲーションのエントリポイントを更新
3. `normalizeSkillLifecycleView()` を更新

### ステップ2: skillLifecycleJourney.ts の変更

1. 一次導線エントリを追加
2. ナビゲーション遷移パターンを更新

### ステップ3: 既存導線の確認

1. SkillManagementPanel の遷移ロジックが維持されていることを確認
2. SkillCreateWizard への導線が維持されていることを確認

### ステップ4: テスト実行

1. `pnpm --filter @repo/desktop test` を実行
2. 全テスト pass を確認

## 成果物

| 成果物   | パス                                       | 説明                             |
| -------- | ------------------------------------------ | -------------------------------- |
| 実装記録 | `outputs/phase-5/implementation-record.md` | 変更ファイル一覧、変更内容サマリ |

## 完了条件

- [ ] App.tsx にルート定義が追加されている
- [ ] normalizeSkillLifecycleView() が更新されている
- [ ] skillLifecycleJourney.ts が更新されている
- [ ] SkillCreateWizard への既存導線が維持されている
- [ ] Phase 4 で作成したテストが全て pass する
- [ ] 既存テストが全て pass する
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 6: テスト拡充](./phase-6-test-expansion.md)
