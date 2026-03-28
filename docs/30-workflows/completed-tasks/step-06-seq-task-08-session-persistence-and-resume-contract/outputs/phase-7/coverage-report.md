# Phase 7: カバレッジ報告

## 実装日: 2026-03-28

## Save Target Coverage

| save target           | テスト有無 | テストケース                |
| --------------------- | ---------- | --------------------------- |
| `currentPhase`        | ✅         | hydrate → currentPhase 復元 |
| `awaitingUserInput`   | ✅         | review-ready hydrate        |
| `verifyResult`        | ✅         | verify-fail hydrate         |
| `phaseArtifacts`      | ✅         | phaseArtifacts 復元 (2件)   |
| `resumeTokenEnvelope` | ✅         | resumeTokenEnvelope 復元    |
| `routeSnapshot`       | ✅         | compatibility snapshot 比較 |
| `sourceProvenance`    | ✅         | provenance drift 判定       |
| `revision` / `lease`  | ✅         | stale write guard 系        |
| `handoffBundle`       | ✅         | handoff-ready hydrate       |

## Invalidation Reason Coverage

| reason                              | テスト有無 | テストケース                      |
| ----------------------------------- | ---------- | --------------------------------- |
| `version_mismatch`                  | ✅         | engineVersion major 差分          |
| `route_type_mismatch`               | ✅         | route type 差分                   |
| `manifest_cache_key_mismatch`       | ✅         | manifestCacheKey 差分             |
| `resource_descriptor_hash_mismatch` | ✅         | hash 差分                         |
| `root_relocation_warning`           | ✅         | root のみ変更                     |
| `revision_mismatch`                 | ✅         | save 時 revision guard            |
| `active_lease_conflict`             | ✅         | 他者 active lease                 |
| `checkpoint_not_found`              | ✅         | invalidated / nonexistent         |
| `missing_workflow_payload`          | ✅         | malformed payload graceful reject |

## Checkpoint Type Coverage

| checkpoint type    | テスト有無 | テストケース               |
| ------------------ | ---------- | -------------------------- |
| `review-ready`     | ✅         | RG-01                      |
| `execute-complete` | ✅         | execute-complete save/load |
| `verify-fail`      | ✅         | verify-fail hydrate        |
| `handoff-ready`    | ✅         | RG-02                      |

## 結果サマリー

- save target: **9/9** (100%)
- invalidation reason: **9/9** (100%)
- checkpoint type: **4/4** (100%)
- テスト合計: **39 tests, 39 passed**

## 完了条件チェック

- [x] save target 群が coverage 対象にある
- [x] warning / reject / conflict reason が coverage 対象にある
- [x] checkpoint 種別が coverage 対象にある
- [x] 本Phase内の全タスクを100%実行完了
