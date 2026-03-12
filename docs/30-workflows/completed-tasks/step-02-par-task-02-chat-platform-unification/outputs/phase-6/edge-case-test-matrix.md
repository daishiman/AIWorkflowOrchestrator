# 境界ケーステストマトリクス

| ケース                         | テスト                                        | 結果 |
| ------------------------------ | --------------------------------------------- | ---- |
| model 未選択                   | `chatSlice.test.ts`                           | PASS |
| stream start error             | `ChatView.test.tsx` + Phase11 `TC-02-02`      | PASS |
| abort/cancel                   | `chatSlice.test.ts`                           | PASS |
| workspace context merge        | `chatSlice.test.ts`, `WorkspaceView.test.tsx` | PASS |
| skill-lifecycle session 再利用 | `chatSlice.test.ts`                           | PASS |
| recent session 復帰            | `ChatView.test.tsx`                           | PASS |
| light theme readability        | Phase11 screenshot                            | PASS |
