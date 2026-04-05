# Phase 2: 設計

## メタ情報

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| Phase      | 2                                       |
| Phase名    | 設計                                    |
| 対象機能   | lifecycle-panel-primary-route-promotion |
| 前提Phase  | Phase 1: 要件定義                       |
| 次Phase    | Phase 3: 設計レビュー                   |
| ステータス | pending                                 |
| 作成日     | 2026-04-06                              |

## 目的

Phase 1 で確定した要件に基づき、SkillLifecyclePanel を一次導線に昇格させるためのルーティング設計、`normalizeSkillLifecycleView()` の変更設計、ナビゲーション定義の変更設計を行う。

## 実行タスク

### Task 1: ルーティング設計

- App.tsx に追加するルート定義の設計
- メインナビゲーション「スキル作成」のエントリポイント変更設計
- SkillLifecyclePanel への直接ルートパス設計
- SkillCreateWizard への既存ルートパス維持設計

### Task 2: normalizeSkillLifecycleView() 変更設計

- 新ルートからのアクセス時の正規化ロジック設計
- 既存の SkillManagementPanel 経由アクセスとの共存設計
- ビュー状態遷移の正規化パターン設計

### Task 3: ナビゲーション定義変更設計

- `skillLifecycleJourney.ts` への一次導線エントリ追加設計
- ナビゲーション遷移パターンの更新設計
- モバイル/デスクトップ両対応のナビゲーション設計

### Task 4: 後方互換設計

- SkillCreateWizard への既存導線の維持方法設計
- SkillManagementPanel → LifecyclePanel 導線の維持方法設計
- ディープリンク / ブックマーク互換性設計

### Task 5: 状態管理影響分析

- ViewType 定義への影響評価
- 既存コンポーネント間の状態受け渡しへの影響評価
- 新ルート追加に伴う状態初期化パターン設計

## 参照資料

| 資料名                | パス                                                                    | 説明                                      |
| --------------------- | ----------------------------------------------------------------------- | ----------------------------------------- |
| Phase 1 成果物        | `outputs/phase-1/spec-extraction-map.md`                                | 4系統調査結果                             |
| Phase 1 要件          | `outputs/phase-1/requirements-checklist.md`                             | FR/NFR、AC マッピング                     |
| ナビゲーション契約    | `.agents/skills/aiworkflow-requirements/references/ui-ux-navigation.md` | UI/UX ナビゲーション仕様                  |
| App.tsx               | `apps/desktop/src/renderer/App.tsx`                                     | ルート定義、normalizeSkillLifecycleView() |
| skillLifecycleJourney | `apps/desktop/src/renderer/navigation/skillLifecycleJourney.ts`         | ナビゲーション定義                        |

## 実行手順

### ステップ1: ルーティングアーキテクチャ設計

1. 現行ルート定義を図示し、変更後のルート構造を設計する
2. 一次導線と二次導線の並存パターンを設計する

### ステップ2: ビュー正規化ロジック設計

1. `normalizeSkillLifecycleView()` に追加する分岐条件を設計する
2. 新旧ルートからのアクセスを統一的に扱うロジックを設計する

### ステップ3: ナビゲーション遷移設計

1. `skillLifecycleJourney.ts` の変更内容を設計する
2. デスクトップ/モバイル両対応の遷移パターンを設計する

### ステップ4: 設計文書作成

1. 上記設計を `outputs/phase-2/design-document.md` にまとめる

## 成果物

| 成果物   | パス                                 | 説明                                                     |
| -------- | ------------------------------------ | -------------------------------------------------------- |
| 設計文書 | `outputs/phase-2/design-document.md` | ルーティング設計、正規化ロジック設計、ナビゲーション設計 |

## 完了条件

- [ ] ルーティング設計が完了している
- [ ] normalizeSkillLifecycleView() の変更設計が完了している
- [ ] ナビゲーション定義の変更設計が完了している
- [ ] 後方互換性の維持方法が設計されている
- [ ] モバイル/デスクトップ両対応が考慮されている
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 3: 設計レビュー](./phase-3-design-review.md)
