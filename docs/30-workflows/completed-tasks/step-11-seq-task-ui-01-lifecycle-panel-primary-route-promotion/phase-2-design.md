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

Phase 1 で確定した要件に基づき、`SkillLifecyclePanel` を一次導線に昇格させるためのルーティング設計、`normalizeSkillLifecycleView()` の正規化設計、`skillLifecycleJourney.ts` のナビゲーション設計を行う。あわせて、Phase 3 で 30思考法レビューに渡す論点を、並列に扱える単位へ分割する。

## 実行タスク

### Task 1: ルーティング設計

- `App.tsx` に追加するルート定義を設計する
- メインナビゲーション「スキル作成」のエントリポイント変更を設計する
- `SkillLifecyclePanel` への直接ルートパスを設計する
- `SkillCreateWizard` への既存ルートパス維持を設計する

### Task 2: `normalizeSkillLifecycleView()` 変更設計

- 新ルートからのアクセス時の正規化ロジックを設計する
- 既存の `SkillManagementPanel` 経由アクセスとの共存を設計する
- ビュー状態遷移の正規化パターンを設計する

### Task 3: ナビゲーション定義変更設計

- `skillLifecycleJourney.ts` への一次導線エントリ追加を設計する
- ナビゲーション遷移パターンの更新を設計する
- モバイル / デスクトップ両対応のナビゲーションを設計する

### Task 4: 後方互換設計

- `SkillCreateWizard` への既存導線の維持方法を設計する
- `SkillManagementPanel` → `SkillLifecyclePanel` 導線の維持方法を設計する
- ディープリンク / ブックマーク互換性を設計する

### Task 5: 状態管理影響分析

- `ViewType` 定義への影響を評価する
- 既存コンポーネント間の状態受け渡しへの影響を評価する
- 新ルート追加に伴う状態初期化パターンを設計する

### Task 6: SubAgent 分割設計

- ルーティング、正規化、ナビ定義、互換性、状態影響を別 lane に分ける
- 独立して書けるものは並列、統合が必要なものは直列にする
- Phase 3 に渡す論点を「設計レビューで検証可能な最小単位」に固定する

## 並列化方針

| SubAgent | 担当       | 並列性 | 主な責務                                           |
| -------- | ---------- | ------ | -------------------------------------------------- |
| A        | Task 1     | 可     | ルート構造と入口の変更を設計する                   |
| B        | Task 2     | 可     | `normalizeSkillLifecycleView()` の分岐を設計する   |
| C        | Task 3     | 可     | `skillLifecycleJourney.ts` の定義変更を設計する    |
| D        | Task 4     | 可     | 後方互換と deep link を設計する                    |
| E        | Task 5 / 6 | 直列   | 状態影響を統合し、Phase 3 への受け渡し単位を固める |

## 参照資料

| 資料名                  | パス                                                                                   | 説明                                        |
| ----------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------- |
| Phase 1 成果物          | `outputs/phase-1/spec-extraction-map.md`                                               | 4系統調査結果                               |
| Phase 1 要件            | `outputs/phase-1/requirements-checklist.md`                                            | FR/NFR、AC マッピング                       |
| ナビゲーション契約      | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`                | UI/UX ナビゲーション仕様                    |
| App.tsx                 | `apps/desktop/src/renderer/App.tsx`                                                    | ルート定義、`normalizeSkillLifecycleView()` |
| skillLifecycleJourney   | `apps/desktop/src/renderer/navigation/skillLifecycleJourney.ts`                        | ナビゲーション定義                          |
| skill-spec 監査         | `.claude/skills/aiworkflow-requirements/references/spec-elegance-consistency-audit.md` | 4条件と最小複雑性の監査                     |
| Phase 12 ガイド         | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`            | Phase 12 の必須成果物と同期順序             |
| Phase 12 チェックリスト | `.claude/skills/task-specification-creator/references/phase12-checklist-definition.md` | 実体確認と validator 基準                   |

## 実行手順

### ステップ1: ルーティングアーキテクチャ設計

1. 現行ルート定義を図示し、変更後のルート構造を設計する
2. 一次導線と二次導線の並存パターンを設計する

### ステップ2: ビュー正規化ロジック設計

1. `normalizeSkillLifecycleView()` に追加する分岐条件を設計する
2. 新旧ルートからのアクセスを統一的に扱うロジックを設計する

### ステップ3: ナビゲーション遷移設計

1. `skillLifecycleJourney.ts` の変更内容を設計する
2. デスクトップ / モバイル両対応の遷移パターンを設計する

### ステップ4: 並列設計の統合

1. Task 1〜4 の並列成果を統合し、責務境界を確認する
2. Task 5 の状態影響と Task 6 の SubAgent 分割をひとつの設計文書にまとめる

### ステップ5: 設計文書作成

1. 上記設計を `outputs/phase-2/design-document.md` にまとめる

## 成果物

| 成果物   | パス                                 | 説明                                                     |
| -------- | ------------------------------------ | -------------------------------------------------------- |
| 設計文書 | `outputs/phase-2/design-document.md` | ルーティング設計、正規化ロジック設計、ナビゲーション設計 |

## 完了条件

- [ ] ルーティング設計が完了している
- [ ] `normalizeSkillLifecycleView()` の変更設計が完了している
- [ ] ナビゲーション定義の変更設計が完了している
- [ ] 後方互換性の維持方法が設計されている
- [ ] モバイル / デスクトップ両対応が考慮されている
- [ ] SubAgent の分割と統合点が明確である
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase 末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 3: 設計レビュー](./phase-3-design-review.md)
