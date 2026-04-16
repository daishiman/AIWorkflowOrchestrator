# テスト計画 - Phase 4

## 実行日時

2026-04-16

## テストシナリオ一覧

| シナリオID | シナリオ名                  | 種別     | 対象Rule   | 期待結果                |
| ---------- | --------------------------- | -------- | ---------- | ----------------------- |
| TS-01      | ローカル全PASS確認          | 事前確認 | Rule-1/2/3 | `Failed: 0`             |
| TS-02      | CI通常フロー（違反なし）    | CI確認   | -          | 全ジョブGREEN           |
| TS-03      | CI異常フロー Rule-1違反混入 | CI確認   | Rule-1     | `verify-ipc-4layer` RED |
| TS-04      | CI異常フロー Rule-2違反混入 | CI確認   | Rule-2     | `verify-ipc-4layer` RED |
| TS-05      | CI異常フロー Rule-3違反混入 | CI確認   | Rule-3     | `verify-ipc-4layer` RED |

## 実施チェックリスト

- [x] TS-01: ローカルで `node scripts/verify-ipc-4layer.cjs` を実行し `Failed: 0` を確認
  - 結果: PASS（Rule-1/2/3 全PASS, Failed: 0, 終了コード: 0）
- [ ] TS-02: PRのCI結果で `verify-ipc-4layer` ジョブがPASSしたことを確認（実装後に実施）
- [ ] TS-03: Rule-1違反混入シナリオ（任意・推奨）
- [ ] TS-04: Rule-2違反混入シナリオ（任意・推奨）
- [ ] TS-05: Rule-3違反混入シナリオ（任意・推奨）

## 実施優先度

| 優先度 | シナリオID | 理由                                                 |
| ------ | ---------- | ---------------------------------------------------- |
| 必須   | TS-01      | 実装前に必ず実施（誤検知リスク排除）→ 完了           |
| 必須   | TS-02      | 変更後の正常動作確認                                 |
| 推奨   | TS-03〜05  | Guard機能の動作証明（少なくとも1シナリオを実施推奨） |

## TS-01 実施結果

```
=== IPC 4-Layer Alignment Verification ===

[Rule-1] shared で定義されたチャネルが preload ホワイトリストに未登録: PASS
[Rule-2] preload invoke ホワイトリストのチャネルが main ハンドラに未実装: PASS
[Rule-3] renderer で使用されたチャネルが shared/preload に未定義: PASS

--- Summary ---
Total rules: 3
Passed: 3
Failed: 0

Exit code: 0
```

## Phase末端アクション確認

- [x] タスク1完了: TS-01（ローカル全PASS確認）の手順を定義し、実施した
- [x] タスク2完了: TS-02（CI通常フロー確認）のトリガー方法・確認手順・期待結果を定義した
- [x] タスク3完了: TS-03〜05（IPC違反混入シナリオ）のRule別混入方法・期待動作・復元手順を定義した
- [x] タスク4完了: テストシナリオ一覧と実施チェックリストを作成した
