# Phase 2: 設計

## メタ情報

| 項目      | 値                                  |
| --------- | ----------------------------------- |
| Phase     | 2                                   |
| 機能名    | task-050-ui-00-ui-design-foundation |
| タスクID  | TASK-UI-00-DESIGN-FOUNDATION        |
| 作成日    | 2026-03-04                          |
| 前提Phase | Phase 1（要件定義）                 |
| 後続Phase | Phase 3（設計レビューゲート）       |

## 目的

Phase 1の要件を、実装班がそのまま着手できる設計仕様に変換する。トークン設計、Atomic Design、アイコン体系、レスポンシブ、アクセシビリティ、テスト設計を一つの設計束へ統合する。

## 実行タスク

- トークン設計: `light` / `dark` を Apple HIG 色体系へ置換する設計を固定する
- コンポーネント設計: Atoms / Molecules / Organisms の責務境界を定義する
- UI動作設計: 4ブレークポイント、マイクロインタラクション、UX文言方針を固定する
- 検証設計: Phase 4で失敗させるRedテスト観点を粒度付きで定義する

## 参照資料

| 資料名                 | パス                                                                                                      | 説明               |
| ---------------------- | --------------------------------------------------------------------------------------------------------- | ------------------ |
| Phase 1成果物          | `outputs/phase-1/requirements-definition.md`                                                              | 要件入力           |
| Phase 1成果物          | `outputs/phase-1/acceptance-criteria.md`                                                                  | AC入力             |
| タスク原本             | `docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-050-ui-00-ui-design-foundation.md` | セクション別仕様   |
| UI機能別仕様           | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`                           | 画面横断の部品定義 |
| UIアーキテクチャ       | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`                                 | Atomic責務分離     |
| アーキテクチャ概要     | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                              | Renderer/Main境界  |
| テストパターン         | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`                         | テスト実装方式     |
| アクセシビリティテスト | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`                              | WCAG試験観点       |
| scope-definition       | `outputs/phase-1/scope-definition.md`                                                                     | Phase 1 成果物     |

## 実行手順

### ステップ1: 設計分割（SubAgentチーム定義）

- SubAgent A（Design Tokens）: Task 1, Task 5C
- SubAgent B（Component Catalog）: Task 2, Task 3
- SubAgent C（UX/A11y/Responsive）: Task 4, Task 5, Task 5B, Task 5D
- SubAgent D（Test Strategy）: Task 6

### ステップ2: 並列可能部分の固定

A/B/C/D の成果物を並列で作成し、競合点を `outputs/phase-2/integration-design-notes.md` に集約する。

### ステップ3: 直列統合

並列成果物を統合し、命名規約・トークン命名・Props設計・判定基準を一つの設計文書へ確定する。

## 統合テスト連携

- Theme横断試験: 3テーマで同一UIをレンダリング
- Responsive試験: mobile/tablet/desktop/wide で崩れがないことを検証
- A11y試験: role/aria/focus-visible の自動検証を組み込む
- Interaction試験: hover/active/success/error アニメーション状態を検証

## 成果物

| 成果物     | パス                                          | 説明               |
| ---------- | --------------------------------------------- | ------------------ |
| 設計仕様   | `outputs/phase-2/architecture-design.md`      | 全設計統合文書     |
| 並列分担表 | `outputs/phase-2/subagent-assignment.md`      | 関心分離の実行計画 |
| 統合ノート | `outputs/phase-2/integration-design-notes.md` | 並列成果の統合記録 |

## 完了条件

- [ ] SubAgent責務が重複なく分離されている
- [ ] Theme/Component/Responsive/A11y/Testの全設計が定義されている
- [ ] 並列実行と直列統合の順序が明文化されている
- [ ] Phase 3レビュー基準へ接続できる成果物が保存されている
- [ ] 本Phase内の全タスクを100%実行完了

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断                             | 仕様参照先                                                                   |
| ------------------ | ------------------------------------ | ---------------------------------------------------------------------------- |
| セキュリティ       | 入力検証や権限境界を含む場合         | `.claude/skills/aiworkflow-requirements/references/security-*.md`            |
| UI/UX              | フロントエンド仕様を扱う場合         | `.claude/skills/aiworkflow-requirements/references/ui-ux-*.md`               |
| アーキテクチャ     | 構造や責務分離を扱う場合             | `.claude/skills/aiworkflow-requirements/references/architecture-*.md`        |
| API設計            | IPC/API契約に影響する場合            | `.claude/skills/aiworkflow-requirements/references/api-*.md`                 |
| データ整合性       | 永続化や台帳更新を含む場合           | `.claude/skills/aiworkflow-requirements/references/database-*.md`            |
| エラーハンドリング | 失敗時UI/処理を含む場合              | `.claude/skills/aiworkflow-requirements/references/error-handling.md`        |
| パフォーマンス     | レンダリングや処理時間要件がある場合 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`  |
| アクセシビリティ   | キーボード操作やARIAを扱う場合       | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md` |

| 層                         | 適用判断                    | 仕様参照先                                                                   |
| -------------------------- | --------------------------- | ---------------------------------------------------------------------------- |
| フロントエンド（Renderer） | UI実装時                    | `.claude/skills/aiworkflow-requirements/references/ui-ux-*.md`               |
| バックエンド（Main）       | サービス連携がある場合      | `.claude/skills/aiworkflow-requirements/references/architecture-*.md`        |
| IPC通信                    | Main-Renderer連携がある場合 | `.claude/skills/aiworkflow-requirements/references/api-*.md`                 |
| Preload/セキュリティ       | API公開面がある場合         | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md` |
| ローカルストレージ         | 永続化がある場合            | `.claude/skills/aiworkflow-requirements/references/database-*.md`            |

## サブタスク管理

Phase実行開始時に以下のサブタスクを作成し、完了ごとに更新する。

1. 参照資料確認
2. 実行タスク実施
3. 統合テスト連携（Phase 1〜11）
4. 成果物作成・配置
5. 完了条件検証

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase末端で完了状態を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js   docs/30-workflows/completed-tasks/task-050-ui-00-ui-design-foundation
```

## 次のPhase

Phase 3: 設計レビューゲート
