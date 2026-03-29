# Phase 3: 設計レビュー

## メタ情報

| 項目       | 内容                                          |
| ---------- | --------------------------------------------- |
| Phase      | 3                                             |
| Phase名    | 設計レビュー                                  |
| 対象機能   | TASK-P0-04-manifest-loader-default-activation |
| 前提Phase  | Phase 2: 設計                                 |
| 次Phase    | Phase 4: テスト作成                           |
| ステータス | pending                                       |
| 作成日     | 2026-03-29                                    |

## 目的

設計が後方互換性を維持しつつ dynamic pipeline をデフォルト有効化できるかを gate 判定する。特に degradation path の安全性を重点的にレビューする。

## 実行タスク

### Task 1: 後方互換性検証

- 既存の static loader パスが設計変更で破壊されないことを確認する
- ipc/index.ts の既存 wiring が動作し続けることを確認する
- 外部から明示的に注入されたコンポーネントが自動インスタンスより優先されることを確認する

### Task 2: degradation path レビュー

- manifest 未発見時の fallback が static loader に正しく遷移することを確認する
- 3コンポーネントのいずれかが生成に失敗した場合のエラーハンドリングを確認する
- partial pipeline（一部のみ利用可能）の挙動が定義されていることを確認する

### Task 3: 4条件レビュー

- 矛盾なし: 自動インスタンス化と外部注入が競合しない
- 漏れなし: fallback、test、logging、doc が揃っている
- 整合性あり: ファイル名、メソッド名、成果物名が揃っている
- 依存関係整合: TASK-P0-03 の manifest に依存するが、manifest 不在でも動作する

### Task 4: gate 判定

- PASS: 最小変更で実装可能
- MINOR: 一部追加設計が必要だが実装に進める
- MAJOR: fallback chain に欠陥があり Phase 2 に差し戻す
- CRITICAL: 既存パスを破壊するリスクがあり設計を再構成する

## 参照資料

| 資料名 | パス                                                                  | 説明            |
| ------ | --------------------------------------------------------------------- | --------------- |
| 設計書 | `phase-2-design.md`                                                   | レビュー対象    |
| Facade | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | 既存パスの確認  |
| IPC    | `apps/desktop/src/main/ipc/index.ts`                                  | wiring の互換性 |

## 統合テスト連携

- Phase 4 のテスト観点が AC-1〜AC-7 を網羅していることを確認する
- degradation path のテスト可能性をここで担保する

## 成果物

| 成果物           | パス                               | 説明                          |
| ---------------- | ---------------------------------- | ----------------------------- |
| 設計レビュー結果 | `outputs/phase-3/review-result.md` | gate 判定、互換性確認、残論点 |

## 完了条件

- [ ] 後方互換性の PASS / FAIL が明示されている
- [ ] degradation path の安全性が確認されている
- [ ] 4条件判定が記録されている
- [ ] 実装に進める gate 結論がある
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 4: テスト作成](./phase-4-test-creation.md)
