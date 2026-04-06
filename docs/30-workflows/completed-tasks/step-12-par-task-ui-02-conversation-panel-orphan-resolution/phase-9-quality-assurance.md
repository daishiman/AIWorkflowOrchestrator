# Phase 9: 品質保証

## メタ情報

| 項目       | 内容                                  |
| ---------- | ------------------------------------- |
| Phase      | 9                                     |
| Phase名    | 品質保証                              |
| 対象機能   | TASK-UI-02 ConversationPanel 孤立解消 |
| 前提Phase  | Phase 8: リファクタリング             |
| 次Phase    | Phase 10: 最終レビュー                |
| ステータス | pending                               |
| 作成日     | 2026-04-06                            |
| 更新日     | 2026-04-06                            |

## 目的

コンポーネント統合の整合性、IPC 経路の安全性、ナビゲーションの一貫性を品質ゲートとして確認する。

## 実行タスク

### Task 1: コンポーネント整合性の検証

- 統合後のコンポーネントが全ての Props パターンで正しくレンダリングされることを確認する
- 共有コンポーネント（QuestionCard）が両方のコンテキスト（ConversationPanel / ConversationalInterview）で動作することを確認する
- コンポーネントの責務分離が明確であることを確認する
- 不要な依存関係が存在しないことを確認する

### Task 2: IPC 経路の安全性検証

- 選択した IPC 経路がセキュリティパターン（`security-skill-ipc-core.md`）に準拠していることを確認する
- IPC エラーハンドリングが graceful degradation を維持していることを確認する
- IPC タイムアウト設定が正本仕様と一致していることを確認する
- 未使用の IPC チャネルが残存していないことを確認する

### Task 3: ナビゲーション一貫性検証

- App.tsx のルーティングが `ui-ux-navigation.md` の契約に準拠していることを最終確認する
- ナビゲーション導線が一貫していることを確認する
- TASK-UI-01 のルート昇格結果との矛盾がないことを確認する
- 孤立ルート（到達不能なルート）が存在しないことを確認する

### Task 4: 実装品質チェック

- TypeScript strict mode でのエラーがないことを確認する
- ESLint の warning / error がないことを確認する
- Prettier のフォーマットが適用されていることを確認する
- コンポーネントの命名規則が統一されていることを確認する

```bash
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/desktop lint
pnpm --filter @repo/desktop test
```

### Task 5: 回帰テスト最終確認

- 全パッケージのテストを実行し pass することを確認する:
  ```bash
  pnpm test
  ```
- 型チェックを全パッケージで実行する:
  ```bash
  pnpm typecheck
  ```

## 参照資料

| 資料名               | パス                                       | 説明         |
| -------------------- | ------------------------------------------ | ------------ |
| リファクタリング記録 | `outputs/phase-8/refactoring-log.md`       | 整理後の状態 |
| 設計書               | `outputs/phase-2/design-document.md`       | 設計意図     |
| 実装記録             | `outputs/phase-5/implementation-record.md` | 変更点       |
| カバレッジレポート   | `outputs/phase-7/coverage-report.md`       | テスト網羅率 |

### システム仕様（aiworkflow-requirements）

| 参照資料                  | パス                                                                           | 内容                         |
| ------------------------- | ------------------------------------------------------------------------------ | ---------------------------- |
| UI/UX ナビゲーション契約  | `.agents/skills/aiworkflow-requirements/references/ui-ux-navigation.md`        | ナビゲーション準拠の最終確認 |
| IPC契約チェックリスト     | `.agents/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`  | IPC 整合性の最終確認         |
| スキル実行IPCセキュリティ | `.agents/skills/aiworkflow-requirements/references/security-skill-ipc-core.md` | セキュリティパターン準拠     |

## 統合テスト連携

- 品質保証結果を Phase 10 の最終レビューに持ち込む
- 全テスト pass の evidence を Phase 10 で提示する

## 成果物

| 成果物           | パス                           | 説明                                         |
| ---------------- | ------------------------------ | -------------------------------------------- |
| 品質保証レポート | `outputs/phase-9/qa-report.md` | 整合性、安全性、一貫性の検証結果、品質ゲート |

## 完了条件

- [ ] コンポーネント整合性が確認されている
- [ ] IPC 経路の安全性が確認されている
- [ ] ナビゲーション一貫性が確認されている
- [ ] lint / typecheck / test が全て pass する
- [ ] 回帰テストに問題がないことが確認されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 10: 最終レビュー](./phase-10-final-review.md)
