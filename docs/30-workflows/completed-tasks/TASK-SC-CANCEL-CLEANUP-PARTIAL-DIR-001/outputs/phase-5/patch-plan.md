# パッチ計画

## 方針

コード本体の挙動変更は不要。今回は **tests + spec（仕様書）** を更新する。

## 修正対象一覧

| 対象ファイル                                                                         | 修正内容                                                 | 優先度 |
| ------------------------------------------------------------------------------------ | -------------------------------------------------------- | ------ |
| `docs/30-workflows/TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001/index.md`                  | Phase 一覧の status を `pending` から実際の状態に更新    | High   |
| `docs/30-workflows/TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001/phase-5-implementation.md` | 「実装」の定義を差分確認型に修正                         | High   |
| `docs/30-workflows/TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001/artifacts.json`            | root / outputs の status と currentPhase を同期          | High   |
| `outputs/artifacts.json`                                                             | root と同じ status / currentPhase / targetedTests へ更新 | High   |
| `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts`         | cancel cleanup の未カバー分岐テストを追加                | High   |

## 修正内容詳細

### index.md の更新

- Phase 一覧の `current_phase` を実行フェーズに合わせて更新する
- `status` / `current_phase` を branch 内レビューの実態に合わせて更新する
- Canonical Artifacts テーブルを `artifact-canonical-list.md` と一致させる

### phase-5-implementation.md の更新

旧記述（削除対象）:

```
「コードを実装する」
「finally ブロックでのクリーンアップ」
「createdByThisRun フラグを使用する」
```

新記述:

```
「実装とは: 既存コードとの差分確認と spec 修正」
「cleanupCancelledSkillDir は catch ブロックで実行される」
「skillDirExistedBefore フラグで既存 dir を保護する」
```

### artifacts.json / outputs/artifacts.json の更新

root / outputs の両方で artifact 名に加え `status` / `currentPhase` を揃える。

### SkillCreatorService.test.ts の更新

- `AbortError` 経路でも cleanup することを追加確認
- 通常エラーでは cleanup しないことを追加確認
- cleanup 失敗時に warn ログで吸収することを追加確認

## コード本体は変更なし

以下のファイルは**変更しない**:

- `apps/desktop/src/main/services/skill/SkillCreatorService.ts`

理由: 既存実装は維持しつつ、回帰の保証密度は test 追加で補強する。
