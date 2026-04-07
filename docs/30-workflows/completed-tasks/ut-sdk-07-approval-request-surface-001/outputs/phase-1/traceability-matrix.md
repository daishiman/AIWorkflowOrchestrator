# トレーサビリティ行列 - UT-SDK-07-APPROVAL-REQUEST-SURFACE-001

## 作成日: 2026-04-06

---

## 要件 vs 設計 対応表

| 要件ID | 要件内容                                                | 設計要素                                           | 実装ファイル              | テストケース                       |
| ------ | ------------------------------------------------------- | -------------------------------------------------- | ------------------------- | ---------------------------------- |
| FR-01  | `SkillCreatorAPI` interface に `onApprovalRequest` 追加 | interface 定義追加                                 | `skill-creator-api.ts`    | TC-APPR-01                         |
| FR-02  | `APPROVAL_REQUEST` チャンネルを `safeOn` で購読         | `safeOn(IPC_CHANNELS.APPROVAL_REQUEST, callback)`  | `skill-creator-api.ts`    | TC-APPR-02                         |
| FR-03  | アンサブスクライブ関数 `() => void` を返す              | `safeOn` の戻り値を返す                            | `skill-creator-api.ts`    | TC-APPR-03, TC-APPR-04, TC-APPR-05 |
| FR-04  | `SkillLifecyclePanel.tsx` で `ApprovalSheet` を表示     | `pendingApproval` state + 条件レンダリング         | `SkillLifecyclePanel.tsx` | TC-APPR-06, TC-APPR-07             |
| FR-05  | approve/reject を `respondToApproval` に接続            | `handleApprove` / `handleReject` ハンドラ          | `SkillLifecyclePanel.tsx` | TC-APPR-08, TC-APPR-09             |
| FR-06  | `getSkillCreatorApi()` 経由で対称 surface               | 既存 `getSkillCreatorApi()` ヘルパー再利用         | `SkillLifecyclePanel.tsx` | TC-APPR-06                         |
| NFR-01 | TypeScript strict mode                                  | 型エラーなし                                       | 全変更ファイル            | `pnpm typecheck`                   |
| NFR-02 | 既存メソッド非影響                                      | `respondToApproval` / `getDisclosureInfo` 変更なし | `skill-creator-api.ts`    | TC-APPR-14, TC-APPR-15             |
| NFR-03 | `ALLOWED_ON_CHANNELS` 変更なし                          | channels.ts 変更不要                               | `channels.ts`（変更なし） | -                                  |
| NFR-04 | Vitest 全テスト PASS                                    | -                                                  | -                         | TC-APPR-01〜18                     |

---

## AC vs テストケース 対応表

| AC-ID | 確認方法                 | 対応テスト             |
| ----- | ------------------------ | ---------------------- |
| AC-01 | interface 目視確認       | TC-APPR-01             |
| AC-02 | 実装オブジェクト目視確認 | TC-APPR-01, TC-APPR-02 |
| AC-03 | TC-APPR-02 PASS          | TC-APPR-02             |
| AC-04 | TC-APPR-07 PASS          | TC-APPR-07             |
| AC-05 | TC-APPR-08/09 PASS       | TC-APPR-08, TC-APPR-09 |
| AC-06 | 型シグネチャ比較         | -                      |
| AC-07 | `pnpm typecheck` PASS    | -                      |
| AC-08 | `pnpm lint` PASS         | -                      |
| AC-09 | Vitest 全件 PASS         | TC-APPR-01〜18         |
