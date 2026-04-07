# Phase 1: aiworkflow-requirements 仕様抽出結果

## タスクID: TASK-SDK-04-U1-F1

## 抽出元: SkillCreatorUserInputRequest 型契約

### 型定義（packages/shared/src/types/skillCreator.ts）

```typescript
export interface SkillCreatorUserInputRequest {
  requestId: string;
  reason: SkillCreatorAwaitingUserInputReason;
  title: string;
  prompt: string;
  kind: SkillCreatorUserInputKind; // "single_select" | "multi_select" | "free_text" | ...
  options?: SkillCreatorUserInputOption[];
  placeholder?: string;
  allowSkip?: boolean;
  requestedAt: string;
}

export interface SkillCreatorUserInputSubmission {
  planId: string;
  requestId: string;
  selectedOptionId?: string; // single_select 用
  selectedOptionIds?: string[];
  selectedValues?: string[];
  textValue?: string; // free_text 用
  secretValue?: string;
  confirmed?: boolean;
}
```

### 必須項目（本タスクへの適用）

| 項目                    | 適用内容                                                    |
| ----------------------- | ----------------------------------------------------------- |
| `kind: "single_select"` | `createVerificationReviewRequest()` で使用                  |
| `options`               | approve/improve/reject の3選択肢                            |
| `selectedOptionId`      | テスト submission から `textValue` を除去し、こちらのみ使用 |
| NFR-3 no-op fallback    | verification_review の未知 option は許容                    |

### 禁止項目

| 項目                        | 理由                                                     |
| --------------------------- | -------------------------------------------------------- |
| 新規 IPC チャンネル追加     | 本タスクスコープ外（既存 single_select handling で動作） |
| Renderer コンポーネント変更 | 既存 single_select handling で動作                       |
| `textValue` の必須化        | submission 型では optional のままで問題なし              |

## task-specification-creator 必須項目

| 必須項目                   | 適用                                                   |
| -------------------------- | ------------------------------------------------------ |
| Phase 1-13 の順序実行      | Phase 1→2→3(gate)→4→5→6→7→8→9→10(gate)→11→12→13 を遵守 |
| 全フェーズで outputs/ 出力 | 省略禁止                                               |
| 設計→テスト→実装の順序     | Phase 3 gate 通過後にのみ Phase 4 に進む               |
| Feedback P0-09-U1          | private method テストは public API 経由でテスト        |
| Feedback RT-03             | 実装計画に変更ファイルパス一覧を必須記載               |
| Feedback 7 (カバレッジ)    | 変更した関数/ブロックに限定                            |
