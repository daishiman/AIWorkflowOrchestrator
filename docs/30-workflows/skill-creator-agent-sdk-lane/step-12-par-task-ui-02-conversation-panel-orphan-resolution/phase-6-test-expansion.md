# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                                  |
| ---------- | ------------------------------------- |
| Phase      | 6                                     |
| Phase名    | テスト拡充                            |
| 対象機能   | TASK-UI-02 ConversationPanel 孤立解消 |
| 前提Phase  | Phase 5: 実装                         |
| 次Phase    | Phase 7: カバレッジ確認               |
| ステータス | pending                               |
| 作成日     | 2026-04-06                            |
| 更新日     | 2026-04-06                            |

## 目的

5 つの UserInputKind テスト、IPC 経路切り替えのエッジケース、ナビゲーション境界条件を補強する。

## 実行タスク

### Task 1: UserInputKind 5 種類の網羅テスト

QuestionCard コンポーネントの全 UserInputKind をテストする:

| UserInputKind | テスト内容                                                 |
| ------------- | ---------------------------------------------------------- |
| text          | テキスト入力フィールドの描画、入力値の反映、バリデーション |
| select        | セレクトボックスの描画、選択肢表示、選択時のコールバック   |
| multiSelect   | 複数選択 UI の描画、複数選択時の値管理                     |
| confirm       | 確認ダイアログの描画、Yes/No のコールバック                |
| freeform      | 自由入力フィールドの描画、マルチライン対応                 |

各 UserInputKind で以下の観点をテストする:

- 正常系: 適切な Props で正しくレンダリングされる
- 異常系: 不正な Props で graceful にエラーハンドリングされる
- インタラクション: ユーザー操作に正しく応答する

### Task 2: IPC 経路切り替えのエッジケース

- session IPC が利用不可の場合の fallback 動作をテストする
- runtime IPC が利用不可の場合の fallback 動作をテストする
- IPC タイムアウト時の挙動をテストする
- IPC エラーレスポンス時のエラー表示をテストする
- 連続した IPC 呼び出し（debounce / throttle）の挙動をテストする

### Task 3: ナビゲーション境界条件

- 直接 URL アクセスでの ConversationPanel 到達をテストする
- ブラウザバック/フォワード時のナビゲーション維持をテストする
- 未認証状態でのルートアクセス制御をテストする（該当する場合）
- ルート遷移中のコンポーネントアンマウント/リマウントをテストする

### Task 4: 統合テスト

- ConversationPanel と SkillLifecyclePanel の共存をテストする
- 両方のパネルを切り替えた際の状態維持をテストする
- 共有コンポーネント（QuestionCard）が両方のコンテキストで正しく動作することをテストする

### Task 5: 回帰テスト

- 既存の ConversationalInterview テストが全て pass することを再確認する
- SkillLifecyclePanel の既存テストが影響を受けていないことを確認する
- 共有型定義の変更が他のコンポーネントに影響していないことを確認する

## 参照資料

| 資料名                  | パス                                                                     | 説明                     |
| ----------------------- | ------------------------------------------------------------------------ | ------------------------ |
| 実装記録                | `outputs/phase-5/implementation-record.md`                               | 実装後の変更点           |
| テストマトリクス        | `outputs/phase-4/test-matrix.md`                                         | 基本テストの対応表       |
| QuestionCard            | `apps/desktop/src/renderer/components/skill-creator/QuestionCard.tsx`    | UserInputKind テスト対象 |
| ConversationalInterview | `apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx` | 統合テスト対象           |

### システム仕様（aiworkflow-requirements）

> テスト拡充前に以下の仕様を確認してください。

| 参照資料                  | パス                                                                                                  | 内容                 |
| ------------------------- | ----------------------------------------------------------------------------------------------------- | -------------------- |
| テスト標準化              | `.agents/skills/aiworkflow-requirements/references/lessons-learned-skill-lifecycle-test-hardening.md` | テスト標準化パターン |
| Skill Creator Service仕様 | `.agents/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-reference.md`           | IPC テスト設計の参照 |

## 統合テスト連携

- UserInputKind 全種テストが Phase 7 のカバレッジ確認に反映される
- IPC エッジケーステストが Phase 9 の品質保証で再確認される

## 成果物

| 成果物         | パス                                | 説明                                             |
| -------------- | ----------------------------------- | ------------------------------------------------ |
| テスト拡充記録 | `outputs/phase-6/test-expansion.md` | UserInputKind 全種、IPC エッジケース、回帰テスト |

## 完了条件

- [ ] UserInputKind 5 種類全てのテストが追加されている
- [ ] IPC 経路切り替えのエッジケーステストが追加されている
- [ ] ナビゲーション境界条件テストが追加されている
- [ ] 統合テスト（ConversationPanel と SkillLifecyclePanel の共存）が追加されている
- [ ] 既存テストの回帰がないことが確認されている
- [ ] aiworkflow-requirements の関連仕様を確認した
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 7: カバレッジ確認](./phase-7-coverage-check.md)
