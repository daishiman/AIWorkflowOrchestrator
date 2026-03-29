# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                                          |
| ---------- | --------------------------------------------- |
| Phase      | 6                                             |
| Phase名    | テスト拡充                                    |
| 対象機能   | TASK-P0-04-manifest-loader-default-activation |
| 前提Phase  | Phase 5: 実装                                 |
| 次Phase    | Phase 7: カバレッジ確認                       |
| ステータス | pending                                       |
| 作成日     | 2026-03-29                                    |

## 目的

実装で見落としやすい境界条件を補強する。特に manifest なしシナリオ、partial pipeline、concurrent access を重点的にテストする。

## 実行タスク

### Task 1: manifest なしシナリオ

- manifest ファイルが存在しない場合の pipeline 挙動を検証する
- source resolver candidates が全て空の場合の挙動を検証する
- manifest ファイルが不正な形式の場合のエラーハンドリングを検証する

### Task 2: partial pipeline テスト

- sourceResolver のみ利用可能な場合の挙動を検証する
- resourcePlanner のみ利用可能な場合の挙動を検証する
- 2つのコンポーネントが利用可能で1つが欠落している場合の挙動を検証する

### Task 3: concurrent access テスト

- 複数の plan() 呼び出しが同時に行われた場合の pipeline 状態を検証する
- 初期化中に plan() が呼ばれた場合の挙動を検証する

### Task 4: 外部注入との共存テスト

- 外部注入コンポーネントと自動インスタンスの優先順位を検証する
- 外部注入後に自動インスタンスが上書きされないことを検証する

## 参照資料

| 資料名   | パス                                                                  | 説明                |
| -------- | --------------------------------------------------------------------- | ------------------- |
| 実装記録 | `phase-5-implementation.md`                                           | 実装後の観測点      |
| Facade   | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | テスト対象          |
| 設計書   | `outputs/phase-2/design-document.md`                                  | fallback chain 仕様 |

## 統合テスト連携

- partial pipeline の各パターンが fallback chain の正しい段階に到達することを確認する
- concurrent access でデータ破壊が起きないことを検証する

## 成果物

| 成果物         | パス                                      | 説明                                                     |
| -------------- | ----------------------------------------- | -------------------------------------------------------- |
| テスト拡充記録 | `outputs/phase-6/extended-test-record.md` | manifest なし、partial pipeline、concurrent のケース一覧 |

## 完了条件

- [ ] manifest なしシナリオが網羅されている
- [ ] partial pipeline の各パターンがテストされている
- [ ] concurrent access の安全性が確認されている
- [ ] 外部注入との共存が確認されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 7: カバレッジ確認](./phase-7-coverage-check.md)
