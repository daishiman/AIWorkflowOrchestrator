# Phase 7: カバレッジ確認 - タスク仕様書

## メタ情報

| 項目       | 内容                                                          |
| ---------- | ------------------------------------------------------------- |
| Phase      | 7                                                             |
| Phase名    | カバレッジ確認                                                |
| タスクID   | TASK-IMP-WORKSPACE-CHAT-PANEL-AI-RUNTIME-001                  |
| 前提Phase  | Phase 4（テスト作成）、Phase 5（実装）、Phase 6（テスト拡充） |
| 後続Phase  | Phase 8（リファクタリング）                                   |
| ステータス | not_started                                                   |
| 作成日     | 2026-03-13                                                    |
| 更新日     | 2026-03-17                                                    |
| 機能名     | workspace-chat-panel-runtime-alignment                        |

## 目的

Phase 4 + Phase 6 のテストが、02-code-quality.md のカバレッジ基準を満たしているかを計測し、未達の場合は Phase 6 へ差し戻す。

## 実行タスク

### T7-1: カバレッジ計測

Vitest の v8 カバレッジプロバイダで対象ファイルのカバレッジを計測する。

### T7-2: カバレッジ基準照合

計測結果を 02-code-quality.md の基準テーブルと照合し、PASS / FAIL を判定する。

### T7-3: 未達分析

FAIL の場合、critical path の未計測箇所を抽出し、Phase 6 への差し戻し指示を作成する。

## カバレッジ基準テーブル

### プロジェクト全体基準（02-code-quality.md）

| 指標              | 最低基準 | 推奨基準 | 本タスクの目標 |
| ----------------- | -------- | -------- | -------------- |
| Line Coverage     | 80%      | 90%      | 80%            |
| Branch Coverage   | 60%      | 70%      | 60%            |
| Function Coverage | 80%      | 90%      | 80%            |

### ファイル別カバレッジ目標

| 対象ファイル                               | Line | Branch | Function | 根拠                                 |
| ------------------------------------------ | ---- | ------ | -------- | ------------------------------------ |
| useWorkspaceChatController.ts              | 85%  | 70%    | 90%      | controller の全 callback をテスト    |
| WorkspaceChatPanel.tsx                     | 80%  | 60%    | 80%      | 表示分岐をテスト                     |
| WorkspaceChatInput.tsx                     | 80%  | 60%    | 80%      | CTA 活性/非活性をテスト              |
| llm.ts (handleStreamChat/Cancel/SetConfig) | 85%  | 70%    | 90%      | 全エラーパスをテスト                 |
| GuidanceBlock.tsx（新規）                  | 90%  | 70%    | 90%      | 新規コンポーネントは高カバレッジ必須 |
| TranscriptProvenanceChip.tsx（新規）       | 90%  | 70%    | 90%      | 新規コンポーネントは高カバレッジ必須 |
| CompactLayout.tsx（新規）                  | 80%  | 60%    | 80%      | レイアウト切替の分岐をテスト         |

### カバレッジ計測対象除外

| 除外対象              | 理由               |
| --------------------- | ------------------ |
| index.tsx             | re-export のみ     |
| types.ts / types.d.ts | 型定義のみ         |
| \*.stories.tsx        | Storybook ファイル |

## カバレッジ計測コマンド

```bash
# 対象ファイルのカバレッジを計測
cd apps/desktop && pnpm vitest run --coverage \
  --coverage.include='src/renderer/views/WorkspaceView/**' \
  --coverage.include='src/main/handlers/llm.ts'

# 特定ファイルのみ
cd apps/desktop && pnpm vitest run --coverage \
  --coverage.include='src/renderer/views/WorkspaceView/hooks/useWorkspaceChatController.ts'
```

## 未達時の差し戻しフロー

```
Phase 7 カバレッジ計測
  |
  v
基準照合
  |
  +-- PASS (全ファイルが最低基準以上) --> Phase 8 へ進む
  |
  +-- FAIL (1ファイルでも最低基準未達)
        |
        v
      未達分析
        |
        v
      gap-list.md 作成（未計測箇所と必要テストケース）
        |
        v
      Phase 6 へ差し戻し（gap-list.md のケースを追加）
        |
        v
      再度 Phase 7 へ
```

## P41 対策: v8 カバレッジの特殊カウント

v8 カバレッジプロバイダは以下をカウントするため、Function Coverage が想定より低くなりやすい。

| パターン                     | カウント方法               | 対策                                          |
| ---------------------------- | -------------------------- | --------------------------------------------- |
| インライン arrow function    | 独立した関数としてカウント | コールバック内部のテストを追加する            |
| オプションオブジェクトの関数 | 独立した関数としてカウント | mock.calls でコールバック呼び出しを検証する   |
| useCallback の返り値         | 独立した関数としてカウント | renderHook で各 callback を明示的にテストする |

## 参照資料

| 参照資料                   | パス                                                                                | 内容                                 |
| -------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------ |
| Phase 5（実装）            | `phase-5-implementation.md`                                                         | coverage 対象の変更点を確認する      |
| Phase 6（テスト拡充）      | `phase-6-test-expansion.md`                                                         | 追加回帰ケースを確認する             |
| 02-code-quality.md         | `.claude/rules/02-code-quality.md`                                                  | カバレッジ基準の正本                 |
| useWorkspaceChatController | `apps/desktop/src/renderer/views/WorkspaceView/hooks/useWorkspaceChatController.ts` | renderer 側 critical path を確認する |
| llm handlers               | `apps/desktop/src/main/handlers/llm.ts`                                             | Main 側 critical path を確認する     |

## 統合テスト連携

stream、cancel、selected files、conversation 保存の coverage gap を確認し、Phase 6 のテスト追加と合わせて基準を満たす。

Phase 7 完了時に計測結果をこのテーブルに記録すること（`{{RESULT}}` を実測値に置き換える）。

| 判定項目               | 基準 | 結果（計測後に記入）           |
| ---------------------- | ---- | ------------------------------ |
| ユニットテストLine     | 80%+ | 未計測（Phase 7 実行時に記入） |
| ユニットテストBranch   | 60%+ | 未計測（Phase 7 実行時に記入） |
| ユニットテストFunction | 80%+ | 未計測（Phase 7 実行時に記入） |

### ファイル別カバレッジ基準（統合テスト用）

Phase 4 + Phase 6 テストの合計が以下の基準を満たすことを確認する。

| 対象ファイル                               | Line 基準 | Branch 基準 | Function 基準 | PASS/FAIL（記入欄） |
| ------------------------------------------ | --------- | ----------- | ------------- | ------------------- |
| useWorkspaceChatController.ts              | 85%       | 70%         | 90%           |                     |
| WorkspaceChatPanel.tsx                     | 80%       | 60%         | 80%           |                     |
| WorkspaceChatInput.tsx                     | 80%       | 60%         | 80%           |                     |
| llm.ts (handleStreamChat/Cancel/SetConfig) | 85%       | 70%         | 90%           |                     |
| GuidanceBlock.tsx（新規）                  | 90%       | 70%         | 90%           |                     |
| TranscriptProvenanceChip.tsx（新規）       | 90%       | 70%         | 90%           |                     |
| CompactLayout.tsx（新規）                  | 80%       | 60%         | 80%           |                     |

## 多角的チェック観点（AIが判断）

タスクの性質に応じて、以下の観点を確認する。
**具体的なチェック項目はAIがタスク内容に応じて判断・適用する。**

| 観点               | 適用判断                           | 仕様参照先                                   |
| ------------------ | ---------------------------------- | -------------------------------------------- |
| セキュリティ       | 認証・認可・入力検証が関係する場合 | `aiworkflow-requirements: security-*.md`     |
| UI/UX              | フロントエンド実装の場合           | `aiworkflow-requirements: ui-ux-*.md`        |
| アーキテクチャ     | 設計・構造変更の場合               | `aiworkflow-requirements: architecture-*.md` |
| API設計            | API実装・変更の場合                | `aiworkflow-requirements: api-*.md`          |
| データ整合性       | DB操作の場合                       | `aiworkflow-requirements: database-*.md`     |
| エラーハンドリング | 例外処理が必要な場合               | `aiworkflow-requirements: error-handling.md` |
| パフォーマンス     | 性能要件がある場合                 | `aiworkflow-requirements: architecture-*.md` |
| アクセシビリティ   | UI実装の場合                       | `aiworkflow-requirements: ui-ux-*.md`        |

**Electronデスクトップアプリ観点**（本プロジェクト固有）:

| 層                         | 適用判断                    | 仕様参照先                                             |
| -------------------------- | --------------------------- | ------------------------------------------------------ |
| フロントエンド（Renderer） | UI/React実装の場合          | `aiworkflow-requirements: ui-ux-*.md`                  |
| バックエンド（Main）       | サービス/ロジック実装の場合 | `aiworkflow-requirements: architecture-*.md`           |
| IPC通信                    | Main-Renderer連携の場合     | `aiworkflow-requirements: api-*.md`, `interfaces-*.md` |
| Preload/セキュリティ       | API公開の場合               | `aiworkflow-requirements: security-api-electron.md`    |
| ローカルストレージ         | データ永続化の場合          | `aiworkflow-requirements: database-*.md`               |

## 実行手順

### ステップ1: カバレッジ計測の実行

上記コマンドで対象ファイルのカバレッジを計測する。

### ステップ2: 基準テーブルとの照合

計測結果をファイル別カバレッジ目標テーブルと照合し、各ファイルの PASS / FAIL を判定する。

### ステップ3: PASS 判定

全ファイルが最低基準以上であれば、coverage-plan.md に計測結果を記録して Phase 8 へ進む。

### ステップ4: FAIL 判定（該当する場合）

未達ファイルの未計測箇所を分析し、gap-list.md に必要テストケースを記録する。Phase 6 へ差し戻し、gap-list.md のケースを追加した後、再度 Phase 7 を実行する。

### ステップ5: 成果物と完了条件の確認

coverage-plan.md に全ファイルの計測結果と PASS/FAIL 判定を記録する。

## 成果物

| 成果物         | パス                               | 内容                                          |
| -------------- | ---------------------------------- | --------------------------------------------- |
| カバレッジ計画 | `outputs/phase-7/coverage-plan.md` | coverage 目標、計測結果、PASS/FAIL 判定を記録 |
| ギャップリスト | `outputs/phase-7/gap-list.md`      | 未達時の未計測箇所と必要テストケースを記録    |

## 完了条件

- [ ] 全対象ファイルの Line Coverage が 80% 以上
- [ ] 全対象ファイルの Branch Coverage が 60% 以上
- [ ] 全対象ファイルの Function Coverage が 80% 以上
- [ ] critical path（sendMessage / cancelStream / buildFileContextBlock / handleStreamChat）のカバレッジが個別に確認されている
- [ ] P41 対策（インライン関数のカバレッジ）が考慮されている
- [ ] 未達の場合は gap-list.md が作成され Phase 6 への差し戻し指示が記録されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

| サブタスク | 内容               | 依存                | ステータス  |
| ---------- | ------------------ | ------------------- | ----------- |
| T7-1       | カバレッジ計測     | Phase 5,6 完了      | not_started |
| T7-2       | カバレッジ基準照合 | T7-1                | not_started |
| T7-3       | 未達分析           | T7-2（FAIL 時のみ） | not_started |

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] T7-1 ~ T7-2 が完了している（T7-3 は FAIL 時のみ）
- [ ] coverage-plan.md が作成されている
- [ ] 完了条件の全チェックボックスが true であるか、Phase 6 差し戻しが実行されている
- [ ] 各タスクの成果物が生成されている
- [ ] 本Phase内の全タスクを100%実行完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
ls -la outputs/phase-7/coverage-plan.md
cd apps/desktop && pnpm vitest run --coverage \
  --coverage.include='src/renderer/views/WorkspaceView/**' \
  --coverage.include='src/main/handlers/llm.ts' 2>&1 | tail -15
```

## 次のPhase

- カバレッジ基準 PASS の場合: [Phase 8（リファクタリング）](./phase-8-refactoring.md) に進む
- カバレッジ基準 FAIL の場合: [Phase 6（テスト拡充）](./phase-6-test-expansion.md) に戻る
