# Phase 12 Task 4: 未タスク検出レポート

## 実行日: 2026-03-25

## P59対策: 0件でも必ずレポートを出力

## 検出結果

| #   | 未タスク候補                                 | 優先度 | 対応方針                                          |
| --- | -------------------------------------------- | ------ | ------------------------------------------------- |
| 1   | GenerateStep と SkillCreateWizard の接続統合 | HIGH   | 次タスクで対応（ウィザードフローの状態遷移統合）  |
| 2   | RuntimeSkillCreatorFacade との進捗IPC実接続  | HIGH   | facade側の execute 実行時にIPCイベント発火を確認  |
| 3   | Electron実機での視覚テスト                   | MEDIUM | CLI環境では自動テスト代替済み。実機確認は別途実施 |

## 検出方法

1. Phase 10 最終レビューの指摘事項を確認 → MINOR判定の指摘なし
2. Phase 11 手動テスト結果の発見事項を確認 → 問題なし（CLI代替のため実機テスト未実施）
3. コンポーネント間の接続点を分析 → GenerateStep は Props 受け取り型のため、親コンポーネントとの統合が未タスク

## 未タスク詳細

### 未タスク #1: GenerateStep ウィザード統合

- **概要**: GenerateStep コンポーネントは Props ベースで設計済みだが、SkillCreateWizard からの状態注入（useStreamingProgress Hook の戻り値を Props にマッピング）は未実装
- **スコープ**: SkillCreateWizard.tsx 内での Hook 呼び出しと Props 渡し
- **3ステップ**: 本タスクのスコープ外（既存のウィザード統合タスクで対応予定）

### 未タスク #2: RuntimeSkillCreatorFacade IPC連携

- **概要**: facade の plan/execute が発火する SKILL_CREATOR_PROGRESS イベントと useStreamingProgress Hook の受信が正しく連携するかの結合テスト
- **スコープ**: Main Process → Preload → Renderer の E2E フロー
- **3ステップ**: 本タスクのスコープ外（結合テストタスクで対応予定）

### 未タスク #3: Electron実機視覚テスト

- **概要**: CLI環境のため Phase 11 は自動テスト代替で実施。プログレスバーのアニメーション・色・レイアウトの視覚確認が未実施
- **スコープ**: Electron dev モードでの手動確認
- **3ステップ**: 本タスクのスコープ外（リリース前QAで対応）

## P3対策

上記3件はいずれも本タスク（TASK-SC-07）のスコープ外であり、既存の後続タスクまたはQAプロセスでカバーされるため、新規タスク仕様書の作成・task-workflow.md 登録・仕様書リンク追加の3ステップは不要と判断。

---

## 追加検出: 2026-03-25（実装レビューによる発見）

| #   | タスクID                    | 未タスク候補                           | 優先度 | 対象ファイル                                                           |
| --- | --------------------------- | -------------------------------------- | ------ | ---------------------------------------------------------------------- |
| 4   | TASK-SC-07-IPC-CANCEL       | `skill-creator:cancel` IPC送信の実装   | HIGH   | `apps/desktop/src/renderer/hooks/useCancelGeneration.ts`               |
| 5   | TASK-SC-07-DEBOUNCE         | ストリーミング進捗更新のデバウンス実装 | MEDIUM | `apps/desktop/src/renderer/store/slices/generationProgressSlice.ts` 等 |
| 6   | TASK-SC-07-OPEN-SETTINGS    | API_KEY_ERROR 時の設定画面遷移実装     | MEDIUM | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`     |
| 7   | TASK-SC-07-PARSE-ERROR-CODE | エラーコード判定の構造化               | MEDIUM | `apps/desktop/src/renderer/hooks/useStreamingProgress.ts`              |

### 未タスク #4: TASK-SC-07-IPC-CANCEL — `skill-creator:cancel` IPC送信

- **影響度**: 高
- **概要**: `useCancelGeneration.ts` で `AbortController.abort()` のみ実装されているが、Phase 2/5 設計で要求された `skill-creator:cancel` IPC チャンネルへの送信が未実装。
- **問題**: キャンセルボタン押下時に Main プロセスの LLM 処理が継続し続ける。Renderer 側のみキャンセルされ、リソースリークが発生する可能性がある。
- **対象ファイル**: `apps/desktop/src/renderer/hooks/useCancelGeneration.ts`

### 未タスク #5: TASK-SC-07-DEBOUNCE — ストリーミング進捗更新のデバウンス

- **影響度**: 中
- **概要**: Phase 1 NFR「高速連続更新に対するデバウンス処理（100ms）」が未実装。
- **問題**: 高速ストリーミング時に UI 描画負荷が増大するリスクがある。
- **対象ファイル**: `apps/desktop/src/renderer/store/slices/generationProgressSlice.ts` または `apps/desktop/src/renderer/hooks/useStreamingProgress.ts`

### 未タスク #6: TASK-SC-07-OPEN-SETTINGS — API_KEY_ERROR 時の設定画面遷移

- **影響度**: 中
- **概要**: `GenerateStep` の `onOpenSettings` prop が `SkillCreateWizard` から未接続。
- **問題**: `API_KEY_NOT_SET` エラー時に表示される「設定を開く」ボタンが機能しない。ユーザーが設定画面に遷移できず、エラーを解消できない。
- **対象ファイル**: `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`

### 未タスク #7: TASK-SC-07-PARSE-ERROR-CODE — エラーコード判定の構造化

- **影響度**: 中
- **概要**: `parseErrorCode` が文字列マッチング（`includes("API_KEY")`）でエラーコードを判定しているため、誤判定リスクがある。
- **問題**: IPC ペイロードに構造化された `code` フィールドを持たせることで、より堅牢なエラーハンドリングが実現できる。
- **対象ファイル**: `apps/desktop/src/renderer/hooks/useStreamingProgress.ts`
