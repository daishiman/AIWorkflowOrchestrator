# 実装仕様トレーサビリティ行列

## メタ情報

| 項目       | 内容                                                                        |
| ---------- | --------------------------------------------------------------------------- |
| Phase      | 1                                                                           |
| 機能名     | TASK-SC-08-ON-PROGRESS-REALTIME-UPDATE                                      |
| タスク名   | onProgressコールバック接続・useStreamingProgressモード別phaseマッピング拡張 |
| 作成日     | 2026-04-19                                                                  |
| ステータス | completed                                                                   |

---

## トレーサビリティ行列

| 要件ID | 要件内容                            | 仕様ファイル                          | 実装ファイル                                  | AC         | テストケース |
| ------ | ----------------------------------- | ------------------------------------- | --------------------------------------------- | ---------- | ------------ |
| FR-01  | PHASE_TO_STAGEマップに4エントリ追加 | requirements-definition.md            | `useStreamingProgress.ts` (PHASE_TO_STAGE)    | AC-1〜AC-3 | TC-01〜TC-04 |
| FR-02  | フォールバック動作の維持            | requirements-definition.md            | `useStreamingProgress.ts` (mapPhaseToStage)   | AC-5       | TC-07        |
| FR-03  | onProgressコールバック接続確認      | aiworkflow-requirements-extraction.md | `useStreamingProgress.ts` (useEffect)         | AC-1〜AC-3 | TC-08        |
| FR-04  | GenerateStep動的メッセージ表示      | aiworkflow-requirements-extraction.md | `GenerateStep.tsx` (currentMessage)           | -          | TC-09        |
| FR-05  | generationProgressSlice型変更不要   | aiworkflow-requirements-extraction.md | `generationProgressSlice.ts`                  | AC-6       | -            |
| NFR-01 | TypeScript型安全性                  | requirements-definition.md            | `useStreamingProgress.ts` (PHASE_TO_STAGE型)  | AC-6       | typecheck    |
| NFR-02 | onProgressリスナー二重登録防止      | aiworkflow-requirements-extraction.md | `useStreamingProgress.ts` (useEffect cleanup) | -          | TC-08        |
| NFR-03 | createモード後方互換性              | requirements-definition.md            | `useStreamingProgress.ts` (既存エントリ維持)  | AC-4       | TC-05, TC-06 |
| NFR-04 | コード品質（lint/format）           | requirements-definition.md            | `useStreamingProgress.ts`                     | AC-6       | lint         |
| NFR-05 | テスト可能性                        | requirements-definition.md            | `useStreamingProgress.ts` (mapPhaseToStage)   | AC-1〜AC-5 | TC-01〜TC-07 |

---

## 要件 → AC マッピング

| 要件ID | AC-1 | AC-2 | AC-3 | AC-4 | AC-5 | AC-6 |
| ------ | ---- | ---- | ---- | ---- | ---- | ---- |
| FR-01  | ○    | ○    | ○    | -    | -    | -    |
| FR-02  | -    | -    | -    | -    | ○    | -    |
| FR-03  | ○    | ○    | ○    | -    | -    | -    |
| FR-04  | -    | -    | -    | -    | -    | -    |
| FR-05  | -    | -    | -    | -    | -    | ○    |
| NFR-01 | -    | -    | -    | -    | -    | ○    |
| NFR-02 | -    | -    | -    | -    | -    | -    |
| NFR-03 | -    | -    | -    | ○    | -    | -    |
| NFR-04 | -    | -    | -    | -    | -    | ○    |
| NFR-05 | ○    | ○    | ○    | ○    | ○    | -    |

---

## AC → テストケース マッピング

| AC   | TC-01 | TC-02 | TC-03 | TC-04 | TC-05 | TC-06 | TC-07 | TC-08 | TC-09 |
| ---- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| AC-1 | ○     | ○     | -     | -     | -     | -     | -     | -     | -     |
| AC-2 | -     | -     | ○     | -     | -     | -     | -     | -     | -     |
| AC-3 | -     | -     | -     | ○     | -     | -     | -     | -     | -     |
| AC-4 | -     | -     | -     | -     | ○     | ○     | -     | -     | -     |
| AC-5 | -     | -     | -     | -     | -     | -     | ○     | -     | -     |
| AC-6 | -     | -     | -     | -     | -     | -     | -     | -     | -     |

---

## カバレッジ評価

| 観点                 | 結果 | 備考                                            |
| -------------------- | ---- | ----------------------------------------------- |
| 要件 → AC の全対応   | PASS | FR-01〜FR-05, NFR-01〜NFR-05 が AC に紐付き     |
| AC → テストの全対応  | PASS | AC-1〜AC-5 がテストケースに紐付き               |
| 孤立要件なし         | PASS | 全要件が実装ファイルに対応                      |
| 孤立テストなし       | PASS | 全 TC が AC に対応                              |
| 実装ファイルの最小化 | PASS | 変更は `useStreamingProgress.ts` 1 ファイルのみ |
