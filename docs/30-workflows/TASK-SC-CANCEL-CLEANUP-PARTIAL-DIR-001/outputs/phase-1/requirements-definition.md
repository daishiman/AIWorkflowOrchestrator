# 要件定義

## task ID / 種別

| 項目      | 値                                     |
| --------- | -------------------------------------- |
| task_id   | TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001 |
| task_type | NON_VISUAL code task                   |
| phase     | 1                                      |

## P50 チェック結果

### 実コード確認

**`SkillCreatorService.ts`** 内の cancel cleanup 実装:

```
cleanupCancelledSkillDir(skillDir, skillDirExistedBefore, operationSignal, error)
```

- `skillDirExistedBefore` を `pathExists(skillDir)` で事前取得
- `catch` ブロックで `cleanupCancelledSkillDir` を呼ぶ
- `finally` では `currentAbortController` リセットのみ（クリーンアップなし）
- `cleanupCancelledSkillDir` 内部: `existedBefore === true` なら即 return（作業開始時点で既存だった dir を保護）
- `signal.aborted === false` かつ AbortError でない場合も即 return（通常エラー時は削除しない）

**テスト（既存）**:

| テスト ID     | 観点                                                   | 結果 |
| ------------- | ------------------------------------------------------ | ---- |
| SC-CANCEL-001 | cancel 時に新規 dir が削除される（`fs.rm` が呼ばれる） | 既存 |
| SC-CANCEL-002 | 既存 dir では `fs.rm` が呼ばれない                     | 既存 |

### 判断

本 task は **差分確認型**: 未実装 bugfix ではなく、既存 `cleanupCancelledSkillDir` 実装を正しく説明できる task spec へ再構成することが目的。

## task classification

| 項目                 | 判定   | 理由                                              |
| -------------------- | ------ | ------------------------------------------------- |
| UI task              | いいえ | Renderer 変更がない                               |
| docs-only            | いいえ | 対象は code behavior の回帰確認                   |
| NON_VISUAL code task | はい   | 変更の主対象は Main Process の service とその検証 |

## 受入基準（確定）

| ID   | 基準                                                                     | 検証方法       |
| ---- | ------------------------------------------------------------------------ | -------------- |
| AC-1 | 仕様書が `cleanupCancelledSkillDir` ベースの実装実態に一致する           | diff review    |
| AC-2 | 作業開始時点で既存だったディレクトリを削除しない前提が明記される         | code/spec 照合 |
| AC-3 | `task-specification-creator` の mandatory artifacts と phase gate が揃う | spec review    |
| AC-4 | `NON_VISUAL code task` として Phase 11/12 の代替証跡方針が整合する       | phase review   |
| AC-5 | `artifacts.json` と `outputs/artifacts.json` の parity が成立する        | file check     |

## 改善優先順位

1. **artifacts parity**: `artifacts.json` と `outputs/artifacts.json` の整合
2. **task classification**: `NON_VISUAL code task` への再分類
3. **Phase 11/12**: `NON_VISUAL` 代替証跡の方針整備
4. **命名統一**: canonical artifact 名の統一

## Phase 2 への引き渡し

- 真の論点: 仕様書を `差分確認 + 回帰確認` 型へ再定義する
- 優先順位: artifacts parity → task classification → Phase 11/12 → 命名統一
- 既存コードの `cleanupCancelledSkillDir` + `skillDirExistedBefore` 前提を維持する
