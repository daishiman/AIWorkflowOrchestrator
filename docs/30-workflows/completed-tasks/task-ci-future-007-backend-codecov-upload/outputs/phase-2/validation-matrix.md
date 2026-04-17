# Phase 2: Validation Matrix

## 作成日

2026-04-16

---

## Validation Matrix（Case A〜C）

| パターン | 実行条件        | `VITEST_SHARDED_COVERAGE` | `--coverage` | アーティファクト           | Codecov アップロード   |
| -------- | --------------- | ------------------------- | ------------ | -------------------------- | ---------------------- |
| Case A   | PR              | 未設定                    | なし         | 生成なし                   | なし                   |
| Case B   | main push       | `true`（シェル変数）      | 付与         | `backend-coverage-{shard}` | -（test-web ジョブ外） |
| Case C   | coverage ジョブ | -                         | -            | ダウンロード済み           | `backend` フラグで実施 |

---

## Case A: PR 実行（カバレッジなし）

```
trigger: pull_request
→ test-web ジョブ起動
→ if pull_request → pnpm vitest run --shard=X/2（--coverage なし）
→ Upload backend coverage artifact: スキップ（if: != pull_request）
→ coverage ジョブ: 実行なし（if: push && refs/heads/main）
```

**期待動作**: PR 時の `test-web` 実行時間はカバレッジなしと同等

---

## Case B: main push 実行（カバレッジあり）

```
trigger: push (main)
→ test-web ジョブ起動
→ else → VITEST_SHARDED_COVERAGE=true pnpm vitest run --shard=X/2 --coverage
→ apps/backend/coverage/ にカバレッジファイル生成
→ Upload backend coverage artifact: backend-coverage-{shard} をアップロード
```

**期待動作**: 各シャードのカバレッジアーティファクトが GitHub Actions に保存される

---

## Case C: coverage ジョブ実行（アーティファクトダウンロード + Codecov）

```
trigger: push (main) かつ test-shared / test-desktop / test-web 完了後
→ Download desktop coverage artifacts → coverage/desktop/
→ Upload desktop coverage to Codecov (flags: desktop, directory: coverage/desktop)
→ Download backend coverage artifacts → coverage/backend/
→ Upload backend coverage to Codecov (flags: backend, directory: coverage/backend)
```

**期待動作**: Codecov に desktop と backend 両方のフラグでカバレッジがアップロードされる
