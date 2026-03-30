# Phase 8: リファクタリング

## メタ情報

| 項目       | 内容                                             |
| ---------- | ------------------------------------------------ |
| Phase      | 8                                                |
| Phase名    | リファクタリング                                 |
| 対象機能   | TASK-P0-02 verify→improve→re-verify 閉ループ修復 |
| 前提Phase  | Phase 7: カバレッジ確認                          |
| 次Phase    | Phase 9: 品質保証                                |
| ステータス | completed                                        |
| 作成日     | 2026-03-29                                       |
| 更新日     | 2026-03-30                                       |

## 目的

phase 遷移テーブルの構造を整理し、recordVerifyPass/Failure の対称性を高め、遷移ロジックの複雑性を最小化する。

## 実行タスク

### Task 1: phase 遷移テーブル整理

- 遷移テーブルを宣言的なデータ構造（Map または Record）に統一する
- 分岐ロジックが遷移テーブルとインラインコードに分散していないことを確認する
- 新規追加した improve→verify と verify(pass) の遷移が既存構造と統一されていることを確認する

### Task 2: recordVerifyPass/Failure 対称性

- 両メソッドのシグネチャ、前提条件チェック、戻り値が対称であることを確認する
- 共通ロジックがあれば private メソッドに抽出する
- エラーメッセージのフォーマットを統一する

### Task 3: requestReverify() 簡素化

- eligibility check の条件が増えすぎていないか確認する
- disabled conditions を定数または設定として外出しできるか検討する
- 新遷移との整合性を維持しつつ、冗長な条件分岐を削減する

### リファクタリング候補

以下を優先的に検討する:

1. **`recordVerifyPass()` と `recordVerifyFailure()` の共通ロジック抽出**: 前提条件チェック、phase 遷移、ログ出力といった共通パターンを private メソッドに抽出する
2. **遷移テーブルバリデーションの一元化**: 遷移テーブルの整合性チェック（不正遷移検出、dead state 検出）を単一のバリデーション関数に集約する
3. **verify 結果判定ロジックの境界確認**: verify 結果に基づく判定ロジックを runtime orchestration 層に留めるか、Engine 層へ寄せるかを検討する

## 参照資料

| 資料名         | パス                                                                   | 説明             |
| -------------- | ---------------------------------------------------------------------- | ---------------- |
| 要件成果物     | `outputs/phase-1/requirements-definition.md`                           | 守るべき AC      |
| 設計成果物     | `outputs/phase-2/design-document.md`                                   | 遷移テーブル設計 |
| 実装記録       | `outputs/phase-5/implementation-record.md`                             | 整理対象の本体   |
| カバレッジ     | `phase-7-coverage-check.md`                                            | 重複削減候補     |
| WorkflowEngine | `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts` | 整理対象         |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                  | パス                                                                                        | 内容                                  |
| ------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------- |
| Skill Creator Service仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-reference.md` | SkillCreatorService仕様との整合性確認 |
| IPC契約チェックリスト     | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`               | IPC修正時の整合性確認                 |

## 統合テスト連携

- リファクタ後も全遷移テストの観測点を変えない
- 遷移テーブルの構造変更がテスト expectation を壊していないことを確認する

## 成果物

| 成果物               | パス                                    | 説明                                     |
| -------------------- | --------------------------------------- | ---------------------------------------- |
| リファクタリング記録 | `outputs/phase-8/refactoring-record.md` | 遷移テーブル整理、対称性改善、簡素化判断 |

## 完了条件

- [x] 遷移テーブルが宣言的構造に統一されている
- [x] recordVerifyPass/Failure が対称である
- [x] requestReverify() の条件分岐が整理されている
- [x] 不要な分岐が増えていない
- [x] 最小複雑性の判断理由が記録されている
- [x] aiworkflow-requirements の関連仕様を確認した
- [x] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 各タスクの成果物が生成されている
- [x] artifacts.jsonが更新されている
- [x] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 9: 品質保証](./phase-9-quality-assurance.md)
