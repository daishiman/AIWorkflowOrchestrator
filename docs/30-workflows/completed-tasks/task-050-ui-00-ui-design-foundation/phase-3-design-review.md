# Phase 3: 設計レビューゲート

## メタ情報

| 項目      | 値                                  |
| --------- | ----------------------------------- |
| Phase     | 3                                   |
| 機能名    | task-050-ui-00-ui-design-foundation |
| タスクID  | TASK-UI-00-DESIGN-FOUNDATION        |
| 作成日    | 2026-03-04                          |
| 前提Phase | Phase 2（設計）                     |
| 後続Phase | Phase 4（テスト作成）               |

## 目的

Phase 2設計を品質ゲートで審査し、Redテスト作成へ進める設計だけを通過させる。曖昧な仕様、責務衝突、検証不能条件をこの段階で排除する。

## 実行タスク

- 設計整合レビュー: トークン設計とコンポーネント設計の矛盾を排除する
- 規約準拠レビュー: Apple HIG / WCAG / P31対策 / テスト方針の準拠を判定する
- 実行可能性レビュー: Phase 4で失敗テストへ落とせる粒度か判定する
- ゲート判定: `PASS` / `MINOR` / `MAJOR` を出力する

## 参照資料

| 資料名                   | パス                                                                           | 説明               |
| ------------------------ | ------------------------------------------------------------------------------ | ------------------ |
| Phase 1成果物            | `outputs/phase-1/requirements-definition.md`                                   | 要件整合の確認元   |
| Phase 2成果物            | `outputs/phase-2/architecture-design.md`                                       | 対象設計           |
| Phase 2成果物            | `outputs/phase-2/subagent-assignment.md`                                       | 分担整合           |
| レビュー基準             | `.claude/skills/task-specification-creator/references/review-gate-criteria.md` | ゲート判定基準     |
| 品質基準                 | `.claude/skills/task-specification-creator/references/quality-standards.md`    | Phase品質の正本    |
| UI設計原則               | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md` | HIG/WCAG判定       |
| セキュリティIPC          | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`   | UI-IPC境界の安全性 |
| acceptance-criteria      | `outputs/phase-1/acceptance-criteria.md`                                       | Phase 1 成果物     |
| scope-definition         | `outputs/phase-1/scope-definition.md`                                          | Phase 1 成果物     |
| integration-design-notes | `outputs/phase-2/integration-design-notes.md`                                  | Phase 2 成果物     |

## 実行手順

### ステップ1: レビューチェックリスト適用

設計文書を以下の観点で評価する: 仕様の具体性、命名統一、責務分離、テスト可能性、依存関係の明瞭性。

### ステップ2: 指摘分類

指摘を `MAJOR` と `MINOR` に分類する。`MAJOR` が1件でもある場合は Phase 2へ戻す。

### ステップ3: ゲート結果出力

`outputs/phase-3/design-review-result.md` に判定、根拠、戻し先タスクを記載する。

## 統合テスト連携

- Redテスト対象IDをレビュー結果に固定する
- テスト不能項目を0件にする
- Phase 4へ渡す試験ケースIDを採番する（TC-UI-00-###）

## 成果物

| 成果物       | パス                                      | 説明            |
| ------------ | ----------------------------------------- | --------------- |
| レビュー結果 | `outputs/phase-3/design-review-result.md` | ゲート判定      |
| 指摘一覧     | `outputs/phase-3/review-findings.md`      | MAJOR/MINOR分類 |

## 完了条件

- [ ] 設計レビュー結果が判定付きで記録されている
- [ ] MAJOR指摘の扱いが明記されている
- [ ] Phase 4へ引き渡すテストケースIDが確定している
- [ ] 設計戻し条件が明文化されている
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

Phase 4: テスト作成
