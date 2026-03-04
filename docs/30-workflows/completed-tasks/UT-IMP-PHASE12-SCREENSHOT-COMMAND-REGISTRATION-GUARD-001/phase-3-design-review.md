# Phase 3: 設計レビューゲート

## メタ情報

| 項目       | 値                                                       |
| ---------- | -------------------------------------------------------- |
| Phase      | 3                                                        |
| 名称       | 設計レビューゲート                                       |
| タスクID   | UT-IMP-PHASE12-SCREENSHOT-COMMAND-REGISTRATION-GUARD-001 |
| 作成日     | 2026-03-04                                               |
| 依存       | Phase 1, Phase 2                                         |
| ステータス | Draft                                                    |

## 目的

Phase 2 の設計が再現性・追跡性・監査性を満たすかを判定し、Phase 4 へ進行できる状態を確定する。

## 実行タスク

- 設計整合レビュー: 要件と設計の対応関係を確認する。
- 監査性レビュー: コマンド検証と文書検証の記録方式を確認する。
- リスクレビュー: 命名衝突、文書残存、検証漏れの対策を確認する。
- ゲート判定: PASS/MINOR/MAJOR を決定する。

## 参照資料

| 資料               | パス                                                                   | 用途           |
| ------------------ | ---------------------------------------------------------------------- | -------------- |
| Phase 1            | `phase-1-requirements.md`                                              | 要件追跡       |
| Phase 2            | `phase-2-design.md`                                                    | 設計追跡       |
| Phase 1成果物      | `outputs/phase-1/requirements-definition.md`                           | 要件照合       |
| Phase 2成果物      | `outputs/phase-2/architecture-design.md`                               | 設計照合       |
| aiworkflow台帳     | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`   | 更新台帳ルール |
| aiworkflow教訓     | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` | 再発防止ルール |
| 受入基準           | `outputs/phase-1/acceptance-criteria.md`                               | Phase 1 成果物 |
| スコープ定義       | `outputs/phase-1/scope-definition.md`                                  | Phase 1 成果物 |
| 文書同期マトリクス | `outputs/phase-2/document-sync-matrix.md`                              | Phase 2 成果物 |
| 検証コマンド設計   | `outputs/phase-2/verification-commands.md`                             | Phase 2 成果物 |
| 仕様抽出マトリクス | `outputs/phase-2/aiworkflow-spec-extraction.md`                        | Phase 2 成果物 |

### システム仕様（aiworkflow-requirements）

| 参照資料     | パス                                                                                        | 内容              |
| ------------ | ------------------------------------------------------------------------------------------- | ----------------- |
| quality要件  | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | 品質ゲート基準    |
| 実装パターン | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | Phase 12 同期手順 |

## 実行手順

### Step 1: 要件トレーサビリティ確認

| 要件ID | 設計反映箇所   | 判定 |
| ------ | -------------- | ---- |
| FR-1   | Phase 2 Step 1 | PASS |
| FR-2   | Phase 2 Step 2 | PASS |
| FR-3   | Phase 2 Step 3 | PASS |
| NFR-1  | Phase 2 Step 3 | PASS |
| NFR-2  | Phase 2 Step 3 | PASS |
| NFR-3  | Phase 2 Step 3 | PASS |

### Step 2: レビュー項目判定

| 項目         | 判定基準                    | 結果 |
| ------------ | --------------------------- | ---- |
| 命名規約     | `screenshot:<feature>` 形式 | PASS |
| 文書同期     | 更新対象が具体パスで列挙    | PASS |
| 監査順序     | 実行順序が固定              | PASS |
| SubAgent分離 | 並列点と直列点が定義        | PASS |

### Step 3: ゲート判定

- PASS: 全項目 PASS かつ MAJOR 指摘 0 件。
- MINOR: 実装へ影響しない軽微指摘が 1 件以上。
- MAJOR: 要件不一致、または監査不能な設計欠陥が 1 件以上。

## 統合テスト連携

| 連携対象           | 判定基準                                      |
| ------------------ | --------------------------------------------- |
| Phase 4 テスト仕様 | FR/NFR ごとのケースが存在                     |
| Phase 5 実装仕様   | scripts 登録と文書同期の 2 系統が独立して定義 |

## 成果物

| 成果物           | パス                                      | 説明           |
| ---------------- | ----------------------------------------- | -------------- |
| 設計レビュー結果 | `outputs/phase-3/design-review-result.md` | 判定ログ       |
| 指摘一覧         | `outputs/phase-3/review-comments.md`      | 指摘と修正方針 |

## 完了条件

- [ ] FR/NFR 対応表が完成している
- [ ] レビュー項目 4 件の判定が記録されている
- [ ] ゲート判定が明記されている
- [ ] MAJOR 指摘の有無が明記されている
- [ ] Phase 4 へ進む条件が明記されている
- [ ] 本Phase内の全タスクを100%実行完了

## 次のPhase

Phase 4 でテスト仕様とケースを作成する。

## 多角的チェック観点

| 観点           | 適用内容                                                | 参照仕様                                                                                    |
| -------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| セキュリティ   | 実行コマンドの公開範囲が限定されているか                | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                |
| UI/UX証跡      | Phase 11 の証跡取得コマンドが一意か                     | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`             |
| アーキテクチャ | スクリプト実体と公開コマンドの責務が分離されているか    | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` |
| 品質           | verify/validate/coverage/audit の検証順序が維持されるか | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 |

## サブタスク管理

| サブタスク         | 状態    |
| ------------------ | ------- |
| 参照資料確認       | pending |
| 実行タスク実施     | pending |
| 統合テスト連携確認 | pending |
| 成果物定義確認     | pending |
| 完了条件確認       | pending |

## タスク100%実行確認【必須】

- [ ] 本Phaseの実行タスクをすべて実行した
- [ ] 本Phaseの成果物定義と参照資料を照合した
- [ ] 本Phaseの完了条件を全て満たした
- [ ] 次Phaseへ渡す入力を明記した
