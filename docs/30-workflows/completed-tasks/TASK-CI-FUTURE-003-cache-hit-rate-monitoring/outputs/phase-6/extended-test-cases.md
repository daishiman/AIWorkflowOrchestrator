# 拡張テストケース

## メタ情報

| 項目   | 内容               |
| ------ | ------------------ |
| Phase  | 6                  |
| 機能名 | TASK-CI-FUTURE-003 |
| 作成日 | 2026-04-15         |

---

## Task 6-A: フェイルパス・境界条件テストケース

| Case | ID     | 状況                                                    | 期待する動作                                                      |
| ---- | ------ | ------------------------------------------------------- | ----------------------------------------------------------------- |
| 8    | TC-008 | `CACHE_HIT` 環境変数が未定義の場合                      | `[ -n "" ]` が偽になるためミスとして判定される                    |
| 9    | TC-009 | `CACHE_REASON` に特殊文字（スペース等）が含まれる場合   | 引用符付き変数参照 `"$CACHE_REASON"` で正常処理                   |
| 10   | TC-010 | `$GITHUB_STEP_SUMMARY` が利用不可（ローカル実行）の場合 | `continue-on-error: true` によりスキップ（CI はブロックされない） |
| 11   | TC-011 | キャッシュステップの直前ステップが失敗した場合          | `if: always()` により判定ステップが実行される                     |

### TC-008 の詳細

`CACHE_HIT` が空の場合の bash 評価：

```bash
CACHE_HIT=""
if [ "$CACHE_HIT" = "true" ]; then   # false
elif [ -n "$CACHE_REASON" ]; then     # CACHE_REASON も空ならfalse
else
  CACHE_STATUS="❌ キャッシュミス (Miss)"  # ← ミスとして判定される
fi
```

### TC-009 の詳細

`CACHE_REASON` にスペースが含まれる場合でも引用符付きで展開されるため安全：

```bash
CACHE_REASON="node_modules がフォールバック復元済み"  # スペース含む
echo "| 判定根拠 | ${CACHE_REASON:-（なし）} |"
# → "| 判定根拠 | node_modules がフォールバック復元済み |"（正常出力）
```

---

## Task 6-B: 回帰ガード定義・実行結果

| ガード ID | 対象                  | 検証内容                                            | 確認結果                                      |
| --------- | --------------------- | --------------------------------------------------- | --------------------------------------------- |
| RG-001    | 既存 lint ジョブ      | lint 結果が変更後も同じ合否結果になること           | ✅ 変化なし（判定ステップはモニタリングのみ） |
| RG-002    | 既存 typecheck ジョブ | typecheck 結果が変更後も同じ合否結果になること      | ✅ 変化なし                                   |
| RG-003    | 既存 test ジョブ      | test 結果が変更後も同じ合否結果になること           | ✅ 変化なし                                   |
| RG-004    | CI 実行時間           | 変更後の CI 実行時間が変更前と比べて 5 秒以内の増加 | ✅ bash スクリプト実行は 1 秒未満             |

**根拠**: `continue-on-error: true` と `if: always()` により、判定ステップの成否は既存ジョブの結果に影響しない。

---

## Task 6-C: 既存テストへの干渉確認

| 確認項目                                                                                      | 結果                                         |
| --------------------------------------------------------------------------------------------- | -------------------------------------------- |
| `id` 追加で既存の `steps.cache-node-modules.outputs.cache-hit != 'true'` 参照が壊れていないか | ✅ 既存参照は変更なし（id は元から設定済み） |
| 判定ステップが他のステップの output を上書きしていないか                                      | ✅ 独自 `id: check-cache-hit-rate` のみ使用  |
| `$GITHUB_STEP_SUMMARY` への書き込みが既存 Summary 内容を削除していないか                      | ✅ `>>` 追記形式のため削除なし               |

---

## Task 6-D: 補助コマンド

```bash
# キャッシュ状態の手動確認
gh cache list --repo daishiman/AIWorkflowOrchestrator

# 特定キャッシュの削除
gh cache delete <cache-id> --repo daishiman/AIWorkflowOrchestrator

# 全キャッシュ削除（TC-003 用）
gh cache delete --all --repo daishiman/AIWorkflowOrchestrator

# CI 実行結果確認
gh run list --workflow=ci.yml --limit=5

# 最新 CI 実行のログ確認
gh run view --log $(gh run list --workflow=ci.yml --limit=1 --json databaseId --jq '.[0].databaseId')
```
