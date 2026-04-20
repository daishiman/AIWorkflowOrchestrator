# テストシナリオ定義

## テストマトリクス

| TC    | 観点                                              | 種別     | 根拠           | 状態              |
| ----- | ------------------------------------------------- | -------- | -------------- | ----------------- |
| TC-01 | cancel 時に新規 dir が削除される                  | 既存     | SC-CANCEL-001  | ✓ 既存テスト      |
| TC-02 | 既存 dir は削除されない                           | 既存     | SC-CANCEL-002  | ✓ 既存テスト      |
| TC-03 | `cleanupCancelledSkillDir` 前提と spec が一致する | 追加確認 | code/spec diff | ✓ 本 Phase で定義 |
| TC-04 | artifact 名と phase 間参照が一致する              | 追加確認 | docs review    | ✓ 本 Phase で定義 |

## TC-01 詳細（SC-CANCEL-001）

**テスト観点**: キャンセル時に新規作成したスキルディレクトリが削除される

**前提条件**:

- `fsPromises.access` が ENOENT を返す（スキルディレクトリが存在しない）
- `scriptExecutor.execute` が AbortSignal に反応して reject する

**期待動作**:

1. `cancelCurrentOperation()` を呼ぶ
2. `createSkill()` が AbortError で reject する
3. `fs.rm(skillDir, { recursive: true, force: true })` が呼ばれる

**既存テストコード**: `SkillCreatorService.test.ts` の `SC-CANCEL-001`

## TC-02 詳細（SC-CANCEL-002）

**テスト観点**: 既存ディレクトリがある場合はキャンセルしても削除されない

**前提条件**:

- `fsPromises.access` が `undefined` を返す（スキルディレクトリが既存）

**期待動作**:

1. `cancelCurrentOperation()` を呼ぶ
2. `createSkill()` が AbortError で reject する
3. `fs.rm` が**呼ばれない**

**既存テストコード**: `SkillCreatorService.test.ts` の `SC-CANCEL-002`

## TC-03 詳細（spec 整合確認）

**確認内容**:

| 確認項目           | 実コード                     | spec 記述要件                |
| ------------------ | ---------------------------- | ---------------------------- |
| cleanup 実行位置   | `catch` ブロック             | `catch` ブロックで実行と明記 |
| 保護フラグ名       | `skillDirExistedBefore`      | このフラグ名を spec に記載   |
| `finally` の内容   | AbortController リセットのみ | cleanup を行わないと明記     |
| `createdByThisRun` | 使用なし                     | spec から削除済みであること  |

## TC-04 詳細（artifact 参照整合確認）

**確認内容**:

| チェック対象                               | 確認方法                                           |
| ------------------------------------------ | -------------------------------------------------- |
| `index.md` の Canonical Artifacts テーブル | 全 phase の artifact 名が canonical 一覧と一致する |
| `artifacts.json` の artifacts 配列         | `outputs/artifacts.json` と parity                 |
| 各 phase spec の成果物欄                   | canonical 名と一致する                             |
