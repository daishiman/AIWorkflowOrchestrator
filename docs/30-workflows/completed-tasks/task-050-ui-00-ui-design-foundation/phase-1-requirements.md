# Phase 1: 要件定義

## メタ情報

| 項目      | 値                                  |
| --------- | ----------------------------------- |
| Phase     | 1                                   |
| 機能名    | task-050-ui-00-ui-design-foundation |
| タスクID  | TASK-UI-00-DESIGN-FOUNDATION        |
| 作成日    | 2026-03-04                          |
| 前提Phase | なし                                |
| 後続Phase | Phase 2（設計）                     |

## 目的

`docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-050-ui-00-ui-design-foundation.md` を正本として、UI共通基盤の機能要件・非機能要件・受け入れ基準を実行可能な粒度へ分解する。後続Phaseが迷わず実装できる入力を確定する。

## 実行タスク

- 要件抽出: Task 1〜6、Task 5B/5C/5D を FR/NFR に分解する
- スコープ固定: 対象範囲と除外範囲を確定する
- 依存整理: 後続タスク（053〜061）との依存を固定する
- 受け入れ基準作成: 13 Phaseで検証可能な判定基準を定義する

## 参照資料

| 資料名                     | パス                                                                                                                 | 説明                       |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| タスク原本                 | `docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-050-ui-00-ui-design-foundation.md`            | UI基盤の正本仕様           |
| 実行インデックス           | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-000-master-index.md` | 依存順序の正本             |
| task-spec作成フロー        | `.claude/skills/task-specification-creator/references/create-workflow.md`                                            | 13Phase構造                |
| システム仕様リソースマップ | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                                                     | 参照仕様の抽出起点         |
| UIコンポーネント仕様       | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                                              | コンポーネント責務         |
| UIデザインシステム         | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`                                           | トークン規約               |
| UI設計原則                 | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`                                       | Apple HIG / WCAG基準       |
| 状態管理アーキテクチャ     | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                                         | P31対策                    |
| テスト品質基準             | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                                          | カバレッジ基準             |
| 抽出監査レポート           | `aiworkflow-requirements-extraction-report.md`                                                                       | 仕様抽出の監査結果         |
| 総合整合監査               | `comprehensive-consistency-and-strategy-report.md`                                                                   | 思考モード適用と整合性確認 |

## 実行手順

### ステップ1: FR/NFR分解

Task 1〜6 を FR と NFR に分割し、各項目にIDを付与する。

### ステップ2: スコープ境界定義

`kanagawa-wave` と `kanagawa-lotus` を本Phaseの除外対象として明示する。settingsSlice の制約解除は連携課題として記録する。

### ステップ3: 受け入れ基準定義

テーマ、コンポーネント、レスポンシブ、アクセシビリティ、テスト実行、品質ゲートの判定条件を定義する。

## 統合テスト連携

- UI基盤統合対象を先に固定する: `tokens.css`、Atoms、Molecules、Organisms
- 結合観点を定義する: テーマ切替、レスポンシブ切替、キーボード操作、ARIA属性、エラーステート
- Phase 4で Red テスト化する対象一覧を `outputs/phase-1/acceptance-criteria.md` に書き出す

## 成果物

| 成果物       | パス                                         | 説明               |
| ------------ | -------------------------------------------- | ------------------ |
| 要件定義     | `outputs/phase-1/requirements-definition.md` | FR/NFR一覧         |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | 対象境界と除外境界 |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | 検証可能な完了条件 |

## 完了条件

- [ ] Task 1〜6の要件がID付きで列挙されている
- [ ] スコープ外項目が明文化されている
- [ ] 受け入れ基準がテスト化可能な文で定義されている
- [ ] Phase 2へ引き渡す設計入力が成果物として保存されている
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

Phase 2: 設計
