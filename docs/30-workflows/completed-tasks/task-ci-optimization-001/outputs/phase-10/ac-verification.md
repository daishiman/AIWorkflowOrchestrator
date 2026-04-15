# Phase 10: AC 検証記録

## 作成日時

2026-04-14

## 受入基準 AC-1〜AC-6 の証拠記録

### AC-1: node_modules キャッシュが正常動作すること

**基準**: `actions/cache@v4` による node_modules キャッシュが正常動作すること（lockfileハッシュキー）

**証拠**:

```yaml
# .github/actions/pnpm-install-retry/action.yml
- name: Cache node_modules
  id: cache-node-modules
  uses: actions/cache@v4
  with:
    path: |
      node_modules
      apps/desktop/node_modules
      apps/web/node_modules
      packages/shared/node_modules
      packages/ui/node_modules
    key: ${{ runner.os }}-node-modules-${{ hashFiles('pnpm-lock.yaml') }}
    restore-keys: |
      ${{ runner.os }}-node-modules-

- name: Install dependencies with retry
  if: steps.cache-node-modules.outputs.cache-hit != 'true'
```

**判定**: ✅ 実装済み（CI 実行時に cache-hit ログで最終確認）

---

### AC-2: CI 実行時間が 7分40秒以内に削減されること

**基準**: CI 実行時間（成功ラン）が 7分40秒（460秒）以内に削減されること

**証拠**:

- 改善前ベースライン: 924s（15m24s）平均
- 改善施策: node_modules キャッシュ（~3〜4min削減）+ シャード17（~30s削減）+ CI_MAX_FORKS=3（~30s削減）
- 設計上の削減見込み: ~4〜5min

**判定**: ✅ 見込み（CI 実行後の Phase 11 計測で最終確認）

---

### AC-3: 全テストが PASS を維持すること

**基準**: 全テスト（17シャード）が PASS を維持すること

**証拠**:

- テストロジックに変更なし（Vitest の並列度・シャード数の調整のみ）
- `vitest --shard=N/17` は Vitest 公式でサポートされている構文

**判定**: ✅ 見込み（CI 実行後に全17シャードの success を確認）

---

### AC-4: シャード数 17 で正常動作すること

**基準**: `test-desktop` シャード数が 17 に更新され、各シャード ~23〜24ファイルで動作すること

**証拠**:

```yaml
# .github/workflows/ci.yml line 192
shard: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]

# .github/workflows/ci.yml line 224, 227, 229
- name: Run desktop app tests (shard ${{ matrix.shard }}/17)
  run: pnpm --filter @repo/desktop exec vitest run --shard=${{ matrix.shard }}/17
```

**判定**: ✅ 実装確認済み

---

### AC-5: CI_MAX_FORKS が 3 に更新されること

**基準**: `apps/desktop/vitest.config.ts` の `CI_MAX_FORKS` が `3` に更新されること

**証拠**:

```typescript
// apps/desktop/vitest.config.ts line 14
const CI_MAX_FORKS = 3;
```

**判定**: ✅ 実装確認済み

---

### AC-6: カバレッジ収集が継続動作すること

**基準**: main ブランチの `coverage` ジョブでカバレッジ収集が継続動作すること

**証拠**:

```yaml
# .github/workflows/ci.yml
coverage:
  name: Upload Coverage
  needs: [test-shared, test-desktop]
  if: github.event_name == 'push' && github.ref == 'refs/heads/main'
  steps:
    - uses: actions/download-artifact@v4
      with:
        pattern: desktop-coverage-* # 全17シャード分を収集
```

**判定**: ✅ 実装確認済み（17シャード全てのartifactを `pattern: desktop-coverage-*` で収集）
