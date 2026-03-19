# Phase 11/12 実行ガイダンス

> 読み込み条件:
> Phase 11 または Phase 12 を開始する時。

## split guide

| file | 使う場面 | 内容 |
| --- | --- | --- |
| [phase-11-screenshot-guide.md](phase-11-screenshot-guide.md) | manual test、UI evidence、docs walkthrough | Phase 11 の execution detail |
| [phase-11-test-report-template.md](phase-11-test-report-template.md) | テスト結果記録 | テストカテゴリ別結果・未タスク出力テンプレート |
| [phase-12-documentation-guide.md](phase-12-documentation-guide.md) | implementation guide、spec sync、feedback | Phase 12 の 5 task（概要） |
| [phase-12-tasks-guide.md](phase-12-tasks-guide.md) | Task 1〜5 の詳細手順 | Phase 12 各タスクの詳細・コマンド・漏れやすいポイント |
| [phase-12-completion-checklist.md](phase-12-completion-checklist.md) | Phase 12 完了前 | 完了条件チェックリスト全項目 |
| [spec-update-workflow.md](spec-update-workflow.md) | Task 12-2 | Step 1 / Step 2 index |
| [spec-update-validation-matrix.md](spec-update-validation-matrix.md) | final validation | validator と pass 基準 |

## 使い分け

```
1. 関連する自動テストを全て実行して確認
   ↓
2. テストカテゴリを特定（機能/エラーハンドリング/アクセシビリティ/統合）
   ↓
3. 各カテゴリのテスト項目を実行・記録
   ↓
4. UI/UX変更タスクの場合: 画面カバレッジマトリクスを作成
   4-1. git diff で変更コンポーネント一覧を洗い出す
   4-2. 各コンポーネントの全UI状態（表示/インタラクション/テーマ）を列挙
   4-3. 該当しない状態にN/A理由を記録（暗黙スキップ禁止）
   ↓
5. 結果を outputs/phase-11/manual-test-result.md に出力
   ↓
6. Phase 12 は phase-12-tasks-guide.md を参照して Task 1〜5 を実施
   ↓
7. Phase 12 完了前に phase-12-completion-checklist.md で全項目確認
```

### Phase 11

- docs-only task: navigation、archive discoverability、mirror parity を確認する。
- UI task: 上記に加えて screenshot と Apple UI/UX 視覚検証を行う。
- representative evidence は workflow 配下 `outputs/phase-11/` に置く。

### Phase 12

- Task 12-1〜12-5 を順に閉じる。
- `artifacts.json`、`outputs/artifacts.json`、phase 本文、`index.md` を同一ターンで同期する。
- `current` / `baseline` の二層判定を changelog と quality report に残す。

## 注意事項

1. UI task で screenshot を省略しない。
2. docs-only task では screenshot を要求せず、manual walkthrough と mirror parity を証跡化する。
3. user が root を明示した場合はその root を canonical として扱う。
4. completed workflow では planned wording を残さない。

## 変更履歴

| Date | Changes |
| --- | --- |
| 2026-03-18 | Phase 12 の 5 タスク詳細と完了チェックリストを独立ファイルへ分離 |
| 2026-03-12 | Phase 11 と Phase 12 の detail を別ファイルへ分離 |
