# Phase 11: 手動テスト検証 - UT-FIX-SKILL-EXECUTE-INTERFACE-001

## メタ情報

| 項目      | 値                                                                      |
| --------- | ----------------------------------------------------------------------- |
| タスクID  | UT-FIX-SKILL-EXECUTE-INTERFACE-001                                      |
| Phase     | 11                                                                      |
| Phase名   | 手動テスト検証                                                          |
| 機能名    | ut-fix-skill-execute-interface-001                                      |
| 作成日    | 2026-02-25                                                              |
| 前提Phase | Phase 1, Phase 2, Phase 5, Phase 6, Phase 7, Phase 8, Phase 9, Phase 10 |

## 目的

実装前に仕様書の手動点検観点と引き継ぎ条件を定義する。

## 実行タスク

- Task 11-1: 手動点検シナリオを定義する。
- Task 11-2: 引き継ぎチェックリストを作成する。

## Atent Team / SubAgent分担

| SubAgent   | 担当                                                     |
| ---------- | -------------------------------------------------------- |
| SubAgent-A | 契約監査（phase-11-manual-test.md）                      |
| SubAgent-B | サービス/セキュリティ観点監査（phase-11-manual-test.md） |
| SubAgent-C | テスト観点監査（phase-11-manual-test.md）                |
| SubAgent-D | 統合判定・品質監査（phase-11-manual-test.md）            |

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

| 参照資料       | パス                         | 内容             |
| -------------- | ---------------------------- | ---------------- |
| Phase 1成果物  | phase-1-requirements.md      | 前提成果物の確認 |
| Phase 2成果物  | phase-2-design.md            | 前提成果物の確認 |
| Phase 5成果物  | phase-5-implementation.md    | 前提成果物の確認 |
| Phase 6成果物  | phase-6-test-expansion.md    | 前提成果物の確認 |
| Phase 7成果物  | phase-7-coverage-check.md    | 前提成果物の確認 |
| Phase 8成果物  | phase-8-refactoring.md       | 前提成果物の確認 |
| Phase 9成果物  | phase-9-quality-assurance.md | 前提成果物の確認 |
| Phase 10成果物 | phase-10-final-review.md     | 前提成果物の確認 |

## 実行手順

### ステップ1: 点検シナリオ作成

仕様書読解順と確認観点を定義する。

### ステップ2: 引き継ぎ整理

実装担当への引き継ぎ項目を整理する。

### ステップ3: 抜け漏れ確認

引き継ぎに必要な情報の不足を確認する。

## 統合テスト連携（Phase 1〜11）

Main/Preload/Sharedの確認順序を手動点検フローに固定する。

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

| 成果物                 | パス                                   | 説明             |
| ---------------------- | -------------------------------------- | ---------------- |
| 手動テスト計画         | outputs/phase-11/manual-test-plan.md   | 手動確認シナリオ |
| 引き継ぎチェックリスト | outputs/phase-11/handover-checklist.md | 移管前確認項目   |

## 完了条件

- [ ] 手動点検観点が定義されている
- [ ] 引き継ぎ項目が整理されている
- [ ] 抜け漏れ確認が完了している
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

Phase 12: ドキュメント更新
