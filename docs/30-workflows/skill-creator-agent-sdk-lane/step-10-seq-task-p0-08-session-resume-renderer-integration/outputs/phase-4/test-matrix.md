# Phase 4: テストマトリクス

## ユニットテスト (SessionResumePrompt)

| テストID | 対応AC | シナリオ                | 期待結果                           | 優先度 | ファイル                     |
| -------- | ------ | ----------------------- | ---------------------------------- | ------ | ---------------------------- |
| TC-U-01  | AC-1   | セッション一覧表示      | session-resume-prompt が存在する   | 高     | SessionResumePrompt.test.tsx |
| TC-U-02  | AC-1   | sessions が空           | プロンプト非表示 (null)            | 高     | SessionResumePrompt.test.tsx |
| TC-U-03  | AC-2   | ローディング状態        | session-resume-loading が表示      | 中     | SessionResumePrompt.test.tsx |
| TC-U-04  | AC-2,3 | 復元ボタンクリック      | onResume(checkpointId) 呼び出し    | 高     | SessionResumePrompt.test.tsx |
| TC-U-05  | AC-3   | スキップクリック        | onSkip() 呼び出し                  | 高     | SessionResumePrompt.test.tsx |
| TC-U-06  | AC-7,8 | compatible_with_warning | 復元ボタン + 警告テキスト表示      | 高     | SessionResumePrompt.test.tsx |
| TC-U-07  | AC-8   | incompatible セッション | 復元ボタン非表示、「非互換」バッジ | 高     | SessionResumePrompt.test.tsx |
| TC-U-08  | AC-4   | 削除ボタンクリック      | onDelete(checkpointId) 呼び出し    | 高     | SessionResumePrompt.test.tsx |
| TC-U-09  | AC-1   | 複数セッション表示      | listitem が3件                     | 中     | SessionResumePrompt.test.tsx |
| TC-U-10  | AC-1   | セッション情報表示      | フェーズ・種別・planId先頭8文字    | 中     | SessionResumePrompt.test.tsx |
| TC-U-11  | -      | アクセシビリティ        | region ロール + aria-label         | 低     | SessionResumePrompt.test.tsx |

## ユニットテスト (SessionIndicator)

| テストID | 対応AC | シナリオ            | 期待結果                 | 優先度 | ファイル                  |
| -------- | ------ | ------------------- | ------------------------ | ------ | ------------------------- |
| TC-U-12  | AC-5   | planId表示          | 先頭8文字が表示          | 高     | SessionIndicator.test.tsx |
| TC-U-13  | AC-5   | 経過時間表示        | "30分" 表示              | 高     | SessionIndicator.test.tsx |
| TC-U-14  | AC-5   | フェーズ表示        | 現在フェーズが表示       | 高     | SessionIndicator.test.tsx |
| TC-U-15  | AC-5   | 時間フォーマット    | "1時間45分"              | 中     | SessionIndicator.test.tsx |
| TC-U-16  | -      | data-testid         | session-indicator が存在 | 中     | SessionIndicator.test.tsx |
| TC-U-17  | -      | アクセシビリティ    | status ロール            | 低     | SessionIndicator.test.tsx |
| TC-U-18  | -      | pulseアニメーション | animate-pulse クラス     | 低     | SessionIndicator.test.tsx |

## IPC 統合テスト

| テストID | 対応AC   | シナリオ                     | 期待結果                        | 優先度 | ファイル                   |
| -------- | -------- | ---------------------------- | ------------------------------- | ------ | -------------------------- |
| TC-I-01  | AC-1     | listSessions() 呼び出し      | 正しいチャンネル + sessions返却 | 高     | session-resume-ipc.test.ts |
| TC-I-02  | AC-2,3,7 | resumeSession() 成功         | workflowSnapshot 返却           | 高     | session-resume-ipc.test.ts |
| TC-I-03  | AC-4     | deleteSession() 呼び出し     | 正しいチャンネル + 引数         | 高     | session-resume-ipc.test.ts |
| TC-I-04  | AC-6     | getSessionDetail() 呼び出し  | 正しいチャンネル                | 中     | session-resume-ipc.test.ts |
| TC-I-05  | AC-8     | resumeSession() 失敗         | success:false + error           | 高     | session-resume-ipc.test.ts |
| TC-I-06  | AC-9     | ALLOWED_INVOKE_CHANNELS 確認 | 4チャンネル全て含む             | 高     | session-resume-ipc.test.ts |
| TC-I-07  | AC-1     | listSessions() 空配列        | success:true + data:[]          | 中     | session-resume-ipc.test.ts |
| TC-I-08  | AC-1     | listSessions() 複数件        | 2件返却                         | 中     | session-resume-ipc.test.ts |

## IPC ハンドラテスト (creatorHandlers.sessionResume.test.ts)

TC-I-09〜TC-I-20: Facade 委譲・バリデーション・エラーハンドリングを検証（既存テスト）
