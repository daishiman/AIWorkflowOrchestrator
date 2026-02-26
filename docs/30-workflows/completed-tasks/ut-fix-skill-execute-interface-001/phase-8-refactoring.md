# Phase 8: リファクタリング - UT-FIX-SKILL-EXECUTE-INTERFACE-001

## メタ情報

| 項目      | 値                                          |
| --------- | ------------------------------------------- |
| タスクID  | UT-FIX-SKILL-EXECUTE-INTERFACE-001          |
| Phase     | 8                                           |
| Phase名   | リファクタリング                            |
| 機能名    | ut-fix-skill-execute-interface-001          |
| 作成日    | 2026-02-25                                  |
| 前提Phase | Phase 1, Phase 2, Phase 5, Phase 6, Phase 7 |

## 目的

契約修正後の可読性と保守性を維持するための規約を定義する。

## 実行タスク

- Task 8-1: 命名統一（skillName/skillId）の規約を定義する。
- Task 8-2: バリデーション記述統一ルールを定義する。

## Atent Team / SubAgent分担

| SubAgent   | 担当                                                    |
| ---------- | ------------------------------------------------------- |
| SubAgent-A | 契約監査（phase-8-refactoring.md）                      |
| SubAgent-B | サービス/セキュリティ観点監査（phase-8-refactoring.md） |
| SubAgent-C | テスト観点監査（phase-8-refactoring.md）                |
| SubAgent-D | 統合判定・品質監査（phase-8-refactoring.md）            |

## 参照資料

### システム仕様（aiworkflow-requirements）

| 参照資料                 | パス                                                                                      | 内容                               |
| ------------------------ | ----------------------------------------------------------------------------------------- | ---------------------------------- |
| Skill API契約            | .claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md           | skill:executeとPreload契約の正本   |
| Executor契約             | .claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor.md        | SkillService/SkillExecutorの型境界 |
| サービス設計             | .claude/skills/aiworkflow-requirements/references/arch-electron-services.md               | executeSkill引数と委譲フロー       |
| IPC一覧                  | .claude/skills/aiworkflow-requirements/references/api-endpoints.md                        | skill:executeチャネルの分類        |
| Agent IPC詳細            | .claude/skills/aiworkflow-requirements/references/api-ipc-agent.md                        | 関連IPC仕様の整合確認              |
| IPCセキュリティ          | .claude/skills/aiworkflow-requirements/references/security-skill-ipc.md                   | sender検証と入力バリデーション     |
| Electron IPCセキュリティ | .claude/skills/aiworkflow-requirements/references/security-electron-ipc.md                | P44/P45の契約ドリフト防止規約      |
| Electron APIセキュリティ | .claude/skills/aiworkflow-requirements/references/security-api-electron.md                | Preload公開境界とホワイトリスト    |
| IPC契約チェック          | .claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md               | 3層同時更新チェック                |
| IPC型解決ガイド          | .claude/skills/aiworkflow-requirements/references/ipc-type-resolution-guide.md            | P44/P45診断フロー                  |
| 実装パターン             | .claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md | IPC契約修正テンプレート            |
| エラーハンドリング       | .claude/skills/aiworkflow-requirements/references/error-handling.md                       | VALIDATION_ERROR運用               |
| 品質基準                 | .claude/skills/aiworkflow-requirements/references/quality-requirements.md                 | 品質ゲートとテスト基準             |
| 教訓集                   | .claude/skills/aiworkflow-requirements/references/lessons-learned.md                      | skillId/skillNameドリフト再発防止  |
| タスク運用               | .claude/skills/aiworkflow-requirements/references/task-workflow.md                        | Phase 12での成果物ステータス運用   |

### 前提Phase成果物

| 参照資料      | パス                      | 内容             |
| ------------- | ------------------------- | ---------------- |
| Phase 1成果物 | phase-1-requirements.md   | 前提成果物の確認 |
| Phase 2成果物 | phase-2-design.md         | 前提成果物の確認 |
| Phase 5成果物 | phase-5-implementation.md | 前提成果物の確認 |
| Phase 6成果物 | phase-6-test-expansion.md | 前提成果物の確認 |
| Phase 7成果物 | phase-7-coverage-check.md | 前提成果物の確認 |

## 実行手順

### ステップ1: 命名規約定義

セマンティクス準拠の命名規約を明文化する。

### ステップ2: 記述規約定義

バリデーション記述の統一フォーマットを定義する。

### ステップ3: レビュー項目化

レビューでの確認観点を追加する。

## 統合テスト連携（Phase 1〜11）

テスト可読性維持ルールを統合テストレビュー観点に追加する。

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断                           | 仕様参照先                                       |
| ------------------ | ---------------------------------- | ------------------------------------------------ |
| セキュリティ       | 必須（IPC入力・Preload公開が対象） | aiworkflow-requirements: security-\*.md          |
| UI/UX              | 非該当（UI変更なし）               | aiworkflow-requirements: ui-ux-\*.md             |
| アーキテクチャ     | 必須（Main/Preload/Shared契約）    | aiworkflow-requirements: architecture-\*.md      |
| API設計            | 必須（IPC契約設計）                | aiworkflow-requirements: api-\*.md               |
| データ整合性       | 非該当（DB更新なし）               | aiworkflow-requirements: database-\*.md          |
| エラーハンドリング | 必須（VALIDATION_ERROR契約）       | aiworkflow-requirements: error-handling.md       |
| パフォーマンス     | 低（仕様書品質観点のみ）           | aiworkflow-requirements: architecture-\*.md      |
| アクセシビリティ   | 非該当（UI実装なし）               | aiworkflow-requirements: ui-ux-\*.md             |
| テスタビリティ     | 必須（Phase 4-7連携）              | aiworkflow-requirements: quality-requirements.md |

### Electronデスクトップアプリ観点（本プロジェクト固有）

| 層                         | 適用判断             | 仕様参照先                                                               |
| -------------------------- | -------------------- | ------------------------------------------------------------------------ |
| フロントエンド（Renderer） | 契約消費側として確認 | aiworkflow-requirements: interfaces-agent-sdk-skill.md                   |
| バックエンド（Main）       | 必須                 | aiworkflow-requirements: arch-electron-services.md                       |
| IPC通信                    | 必須                 | aiworkflow-requirements: api-endpoints.md, api-ipc-agent.md              |
| Preload/セキュリティ       | 必須                 | aiworkflow-requirements: security-api-electron.md, security-skill-ipc.md |
| ローカルストレージ         | 非該当（DB変更なし） | aiworkflow-requirements: database-\*.md                                  |

## 成果物

| 成果物               | パス                                         | 説明           |
| -------------------- | -------------------------------------------- | -------------- |
| リファクタリング方針 | outputs/phase-8/refactoring-policy.md        | 保守性向上方針 |
| 記述正規化ルール     | outputs/phase-8/readability-normalization.md | レビュー規則   |

## 完了条件

- [ ] 命名規約が定義されている
- [ ] 記述規約が定義されている
- [ ] レビュー観点が定義されている
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次のPhase

Phase 9: 品質保証
