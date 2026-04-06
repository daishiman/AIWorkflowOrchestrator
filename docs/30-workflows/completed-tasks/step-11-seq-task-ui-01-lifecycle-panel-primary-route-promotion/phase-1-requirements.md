# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| Phase      | 1                                       |
| Phase名    | 要件定義                                |
| 対象機能   | lifecycle-panel-primary-route-promotion |
| 前提Phase  | -                                       |
| 次Phase    | Phase 2: 設計                           |
| ステータス | pending                                 |
| 作成日     | 2026-04-06                              |

## 目的

SkillLifecyclePanel の一次導線昇格に必要な機能要件・非機能要件を定義し、ルーティング変更の受入条件を固定する。現行のルート所有者、既存ハンドオフ、状態管理者、対象ビューの4系統を調査し、変更の影響範囲を明確化する。

## 実行タスク

### Task 1: ルート所有者の調査

- `App.tsx` のルート定義を調査し、現在「スキル作成」に紐づくコンポーネントを特定する
- `normalizeSkillLifecycleView()` の現在の正規化ロジックを記録する
- SkillLifecyclePanel への現在のアクセス経路（SkillManagementPanel 経由）を記録する

### Task 2: 既存ハンドオフの調査

- SkillCreateWizard から他コンポーネントへの遷移パターンを調査する
- SkillManagementPanel → SkillLifecyclePanel の遷移ロジックを記録する
- メインナビゲーションからの遷移パターンを記録する

### Task 3: 状態管理者の調査

- `skillLifecycleJourney.ts` のナビゲーション状態定義を調査する
- ViewType 定義（`packages/shared/src/types/skillCreator.ts`）の現行値を記録する
- ナビゲーション状態の遷移パターンを記録する

### Task 4: 対象ビューの調査

- SkillLifecyclePanel が受け取る props / パラメータを調査する
- SkillCreateWizard が受け取る props / パラメータを調査する
- 両コンポーネントの初期化要件の差異を記録する

### Task 5: 受入条件マッピング

- AC-1 → SkillLifecyclePanel が一次導線として直接アクセス可能
- AC-2 → 既存 SkillCreateWizard への導線維持（後方互換）
- AC-3 → `normalizeSkillLifecycleView()` が新ルーティングをハンドル
- AC-4 → `skillLifecycleJourney.ts` のナビゲーション定義更新
- AC-5 → モバイル/デスクトップ両ナビゲーション対応
- AC-6 → 既存テスト pass

### Task 6: スコープ境界の確定

- 含む: ルート定義追加、normalizeSkillLifecycleView() 更新、ナビゲーション定義更新、既存導線維持
- 含まない: SkillCreateWizard 廃止、LifecyclePanel 内部変更、新UIコンポーネント作成、バックエンド変更

### Task 7: skill 準拠基準の固定

- `task-specification-creator` の Phase 12 必須 6 成果物と blocked PR boundary を確認する
- `aiworkflow-requirements` の canonical root、same-wave sync、current / baseline 分離を確認する
- Phase 3 の 30思考法レビューと Phase 12 の close-out をつなぐ評価軸を固定する

## 参照資料

| 資料名                     | パス                                                                                        | 説明                                      |
| -------------------------- | ------------------------------------------------------------------------------------------- | ----------------------------------------- |
| SkillCreateWizard          | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`                          | 現在の一次導線 UI                         |
| SkillLifecyclePanel        | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                        | 昇格対象の UI コンポーネント              |
| App.tsx                    | `apps/desktop/src/renderer/App.tsx`                                                         | ルート定義、normalizeSkillLifecycleView() |
| skillLifecycleJourney      | `apps/desktop/src/renderer/navigation/skillLifecycleJourney.ts`                             | ナビゲーション定義                        |
| SkillManagementPanel       | `apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx`                       | 現在の LifecyclePanel エントリポイント    |
| ViewType 定義              | `packages/shared/src/types/skillCreator.ts`                                                 | ViewType 定義                             |
| task-specification-creator | `.claude/skills/task-specification-creator/SKILL.md`                                        | Phase 12 の必須構造と close-out 基準      |
| aiworkflow-requirements    | `.claude/skills/aiworkflow-requirements/SKILL.md`                                           | 正本仕様、台帳同期、同一 wave ルール      |
| ナビゲーション契約         | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`                     | UI/UX ナビゲーション仕様                  |
| Skill Creator サービス仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-reference.md` | サービスインターフェース仕様              |
| エレガンス監査             | `.claude/skills/aiworkflow-requirements/references/spec-elegance-consistency-audit.md`      | 4条件と最小複雑性の監査                   |
| Phase 12 ガイド            | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`                 | Phase 12 の必須 6 成果物                  |
| Phase 12 チェックリスト    | `.claude/skills/task-specification-creator/references/phase12-checklist-definition.md`      | 実体確認と validator 基準                 |

## 実行手順

### ステップ1: コードアンカー調査

1. `App.tsx` を読み込み、現在のルート定義と `normalizeSkillLifecycleView()` のロジックを確認
2. `skillLifecycleJourney.ts` を読み込み、ナビゲーション定義を確認
3. `SkillManagementPanel.tsx` を読み込み、LifecyclePanel への遷移ロジックを確認

### ステップ2: ViewType / Props 調査

1. `skillCreator.ts` の ViewType 定義を確認
2. SkillLifecyclePanel / SkillCreateWizard の props を確認

### ステップ3: 要件定義書作成

1. 上記調査結果を `outputs/phase-1/spec-extraction-map.md` にまとめる
2. AC-1〜AC-6 と FR/NFR のマッピングを `outputs/phase-1/requirements-checklist.md` にまとめる

## 成果物

| 成果物             | パス                                        | 説明                                        |
| ------------------ | ------------------------------------------- | ------------------------------------------- |
| 仕様抽出マップ     | `outputs/phase-1/spec-extraction-map.md`    | 4系統調査結果、影響範囲、コードアンカー詳細 |
| 要件チェックリスト | `outputs/phase-1/requirements-checklist.md` | FR/NFR 定義、AC マッピング、スコープ境界    |

## 完了条件

- [ ] ルート所有者の調査が完了している
- [ ] 既存ハンドオフの調査が完了している
- [ ] 状態管理者の調査が完了している
- [ ] 対象ビューの調査が完了している
- [ ] AC-1〜AC-6 と FR/NFR のマッピングが完了している
- [ ] 含む / 含まないが明確である
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 2: 設計](./phase-2-design.md)
