# Phase 10: 最終レビューゲート

## メタ情報

| 項目      | 値                     |
| --------- | ---------------------- |
| Phase     | 10                     |
| 機能名    | search-replace-ui      |
| タスクID  | task-imp-search-ui-001 |
| 関連Issue | #366                   |
| 作成日    | 2026-02-04             |

## 目的

実装完了後、全体的な品質・整合性を検証する。

## 判定基準

| 判定     | 条件             | 対応                                   |
| -------- | ---------------- | -------------------------------------- |
| PASS     | 全観点で問題なし | Phase 11へ進行                         |
| MINOR    | 軽微な指摘あり   | 未完了タスクとして記録後Phase 11へ進行 |
| MAJOR    | 重大な問題あり   | 影響範囲に応じて戻り先を決定           |
| CRITICAL | 致命的な問題あり | Phase 1へ戻りユーザーと要件を再確認    |

## 実行タスク

### Task 10-1: 機能要件の最終確認

全ての機能要件が実装されていることを確認する。

| 要件                           | 確認項目                         | 結果 |
| ------------------------------ | -------------------------------- | ---- |
| FR-1: ファイル内検索           | SearchPanelで検索機能が動作      | TBD  |
| FR-2: ファイル内置換           | 単一/全置換が動作                | TBD  |
| FR-3: ワークスペース検索       | WorkspaceSearchPanelで検索が動作 | TBD  |
| FR-4: キーボードショートカット | Cmd+F/Cmd+Shift+Fが動作          | TBD  |
| FR-5: 検索オプション           | 大文字小文字/正規表現/単語が動作 | TBD  |
| FR-6: ハイライト               | マッチ箇所がハイライトされる     | TBD  |
| FR-7: ナビゲーション           | 前/次のマッチへの移動が動作      | TBD  |

### Task 10-2: 非機能要件の最終確認

| 要件                    | 確認項目             | 結果 |
| ----------------------- | -------------------- | ---- |
| NFR-1: パフォーマンス   | 検索応答200ms以内    | TBD  |
| NFR-2: アクセシビリティ | WCAG 2.1 AA準拠      | TBD  |
| NFR-3: キー操作         | Escape/Enterが動作   | TBD  |
| NFR-4: 状態保持         | 検索状態が保持される | TBD  |

### Task 10-3: テスト結果の確認

```bash
pnpm --filter @repo/desktop test:run
pnpm --filter @repo/desktop test:e2e
```

| テストカテゴリ | 結果 | 件数 |
| -------------- | ---- | ---- |
| ユニットテスト | TBD  | TBD  |
| 統合テスト     | TBD  | TBD  |
| E2Eテスト      | TBD  | TBD  |
| 全テスト合計   | TBD  | TBD  |

### Task 10-4: 品質メトリクスの確認

```bash
pnpm --filter @repo/desktop lint
pnpm --filter @repo/desktop typecheck
```

| 項目            | 基準        | 結果 |
| --------------- | ----------- | ---- |
| ESLint          | 警告0件     | TBD  |
| TypeScript      | 型エラー0件 | TBD  |
| Line Coverage   | 80%以上     | TBD  |
| Branch Coverage | 60%以上     | TBD  |

## 統合テスト連携【必須】

最終レビューで統合テスト結果を確認:

| レビュー項目 | 確認内容                           | 結果 |
| ------------ | ---------------------------------- | ---- |
| 全テスト結果 | ユニット/統合/E2E全て成功          | TBD  |
| カバレッジ   | 基準達成（Line 80%+, Branch 60%+） | TBD  |
| 接続テスト   | IPC通信（Main-Renderer）成功       | TBD  |
| 認証連携     | 該当なし（検索機能）               | N/A  |
| 状態同期     | 検索状態の永続化・復元             | TBD  |

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断 | 確認内容                               | 仕様参照先                                   |
| ------------------ | -------- | -------------------------------------- | -------------------------------------------- |
| セキュリティ       | 適用     | ReDoS対策、パストラバーサル検証        | `aiworkflow-requirements: security-*.md`     |
| UI/UX              | 適用     | WCAG 2.1 AA準拠、ショートカット一貫性  | `aiworkflow-requirements: ui-ux-*.md`        |
| アーキテクチャ     | 適用     | IPC通信パターン、Main/Renderer分離     | `aiworkflow-requirements: architecture-*.md` |
| API設計            | 適用     | IPCチャンネル定義、エラーコード        | `aiworkflow-requirements: api-*.md`          |
| パフォーマンス     | 適用     | 検索応答200ms、デバウンス150-300ms     | `aiworkflow-requirements: architecture-*.md` |
| エラーハンドリング | 適用     | INVALID_PATTERN, TIMEOUT等のエラー表示 | `aiworkflow-requirements: error-handling.md` |

**Electronデスクトップアプリ観点**:

| 層                         | 確認内容                                   | 結果 |
| -------------------------- | ------------------------------------------ | ---- |
| フロントエンド（Renderer） | SearchPanel/WorkspaceSearchPanelが正常動作 | TBD  |
| バックエンド（Main）       | 検索サービスがMain Processで正常動作       | TBD  |
| IPC通信                    | search:workspace等のチャンネルが正常通信   | TBD  |
| Preload/セキュリティ       | contextBridge経由のAPI公開が安全           | TBD  |

## ゲート判定

| 判定項目     | 基準           | 結果 |
| ------------ | -------------- | ---- |
| 機能要件     | 全要件実装完了 | TBD  |
| 非機能要件   | 全要件達成     | TBD  |
| テスト       | 全テスト成功   | TBD  |
| 品質         | 基準達成       | TBD  |
| **最終判定** | **全項目PASS** | TBD  |

## 成果物

| 成果物           | パス                                      | 説明         |
| ---------------- | ----------------------------------------- | ------------ |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md` | レビュー結果 |

## 完了条件

- [ ] 全機能要件が確認済み
- [ ] 全非機能要件が確認済み
- [ ] 全テストが成功
- [ ] コード品質基準を達成
- [ ] 統合テスト結果が確認されている
- [ ] 最終レビュー結果が出力されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 機能要件の最終確認（Task 10-1）
2. 非機能要件の最終確認（Task 10-2）
3. テスト結果の確認（Task 10-3）
4. 品質メトリクスの確認（Task 10-4）
5. 統合テスト連携の確認
6. ゲート判定と成果物作成

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスク（Task 10-1〜10-4）を100%実行完了
- [ ] 各タスクの確認結果が記録されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/search-replace-ui --phase 10
```

## 次のPhase

Phase 11: 手動テスト検証
