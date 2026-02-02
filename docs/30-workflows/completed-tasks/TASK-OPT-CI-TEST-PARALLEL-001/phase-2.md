# Phase 2: 設計

## メタ情報

| 項目   | 値                      |
| ------ | ----------------------- |
| Phase  | 2                       |
| 機能名 | CI テスト並列実行最適化 |
| 作成日 | 2026-02-02              |

## 目的

CI最適化の技術設計を行い、変更内容を明確化する。

## 実行タスク

### Task 1: シャード数最適化設計

**検討内容**:

1. 最適シャード数の決定（8 → 16）
2. GitHub Actions ランナー制約の確認
3. concurrency設定の調整

**設計判断**:

| 項目         | 現在  | 変更後 | 根拠                                   |
| ------------ | ----- | ------ | -------------------------------------- |
| シャード数   | 8     | 16     | 12,000テスト ÷ 16 = 750テスト/シャード |
| 同時実行上限 | なし  | 16     | GitHub無料枠の同時ジョブ制限考慮       |
| fail-fast    | false | false  | 維持（全シャードの結果を取得）         |

### Task 2: キャッシュ戦略設計

**shared packageビルドキャッシュ**:

| 設定項目     | 値                                                                                           |
| ------------ | -------------------------------------------------------------------------------------------- |
| path         | `packages/shared/dist`                                                                       |
| key          | `shared-build-${{ runner.os }}-${{ hashFiles('packages/shared/src/**', 'pnpm-lock.yaml') }}` |
| restore-keys | `shared-build-${{ runner.os }}-`                                                             |

**期待効果**: shared buildステップ（20秒）のスキップ

**pnpm storeキャッシュ改善**:

| 設定項目     | 現在           | 変更後                                                           |
| ------------ | -------------- | ---------------------------------------------------------------- |
| cache        | "pnpm"（自動） | 明示的なactions/cache使用                                        |
| key          | 自動生成       | `pnpm-store-${{ runner.os }}-${{ hashFiles('pnpm-lock.yaml') }}` |
| restore-keys | なし           | `pnpm-store-${{ runner.os }}-`                                   |

### Task 3: Vitest設定最適化設計

**変更項目**:

| 設定項目        | 現在  | 変更後 | 理由                                         |
| --------------- | ----- | ------ | -------------------------------------------- |
| maxForks        | 2     | 4      | GitHub Actionsランナー（2コア）でI/O待ち活用 |
| fileParallelism | false | true   | メモリ8GB割り当てで安定動作                  |
| pool            | forks | forks  | 維持（メモリリーク防止）                     |

**リスク対策**: メモリ不足時のフォールバック設定

```typescript
poolOptions: {
  forks: {
    maxForks: process.env.CI ? 4 : 2,
    isolate: true,
  },
},
```

### Task 4: カバレッジ条件分岐設計

**ci.yml の条件分岐**:

```yaml
- name: Run desktop app tests (shard ${{ matrix.shard }}/16)
  run: |
    if [ "${{ github.event_name }}" = "pull_request" ]; then
      pnpm --filter @repo/desktop test:run -- --shard=${{ matrix.shard }}/16
    else
      pnpm --filter @repo/desktop test:run -- --shard=${{ matrix.shard }}/16 --coverage
    fi
```

**カバレッジジョブの条件**:

```yaml
coverage:
  if: github.event_name == 'push' && github.ref == 'refs/heads/main'
```

### Task 5: 設計書作成

全変更内容を設計書にまとめる。

## 参照資料

| 資料名                     | パス                                         | 説明             |
| -------------------------- | -------------------------------------------- | ---------------- |
| 要件定義書                 | `outputs/phase-1/requirements-definition.md` | Phase 1成果物    |
| GitHub Actionsドキュメント | https://docs.github.com/en/actions           | 公式ドキュメント |
| Vitest設定                 | `apps/desktop/vitest.config.ts`              | 現状の設定       |

## 統合テスト連携

**統合ポイント設計**:

| 統合ポイント   | 契約定義                                     |
| -------------- | -------------------------------------------- |
| シャード分割   | Vitestの`--shard`オプション                  |
| キャッシュ連携 | actions/cacheとpnpm storeの整合性            |
| カバレッジ集約 | 16シャードのカバレッジアーティファクトマージ |

## 成果物

| 成果物             | パス                                      | 説明              |
| ------------------ | ----------------------------------------- | ----------------- |
| アーキテクチャ設計 | `outputs/phase-2/architecture-design.md`  | システム構造      |
| CI変更設計書       | `outputs/phase-2/ci-change-design.md`     | ci.yml変更詳細    |
| Vitest変更設計書   | `outputs/phase-2/vitest-change-design.md` | vitest.config変更 |

## 完了条件

- [ ] シャード数最適化の設計が完了している
- [ ] キャッシュ戦略が設計されている
- [ ] Vitest設定変更が設計されている
- [ ] カバレッジ条件分岐が設計されている
- [ ] 統合ポイント/契約が設計に反映されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 3: 設計レビューゲート
