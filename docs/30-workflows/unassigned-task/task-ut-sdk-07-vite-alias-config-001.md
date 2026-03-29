# UT-SDK-07-VITE-ALIAS-CONFIG-001: @repo/shared 動的インポートの vite エイリアス解決調査

## メタ情報

```yaml
issue_number: 1715
task_id: UT-SDK-07-VITE-ALIAS-CONFIG-001
task_name: "@repo/shared 動的インポートの vite エイリアス解決調査"
category: DX改善
target_feature: apps/desktop/vitest.config.ts エイリアス設定
priority: 低
scale: 小規模
status: 未実施
source_phase: UT-SDK-07 Phase 12 unassigned-task-detection（2026-03-29）
created_date: 2026-03-29
dependencies: [UT-SDK-07]
```

| 項目         | 内容                                                                |
| ------------ | ------------------------------------------------------------------- |
| タスクID     | UT-SDK-07-VITE-ALIAS-CONFIG-001                                     |
| タスク名     | @repo/shared 動的インポートの vite エイリアス解決調査               |
| 分類         | DX改善                                                              |
| 対象機能     | `apps/desktop/vitest.config.ts` エイリアス設定 / `@repo/shared/ipc` |
| 優先度       | 低                                                                  |
| 見積もり規模 | 小規模                                                              |
| ステータス   | 未実施                                                              |
| 発見元       | UT-SDK-07 Phase 12 — APPROVAL/EXECUTION チャネルを shared に移管後  |
| 発見日       | 2026-03-29                                                          |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

UT-SDK-07 で `APPROVAL_CHANNELS` / `EXECUTION_CHANNELS` を `packages/shared/src/ipc/channels.ts` に移管した結果、`@repo/shared/ipc` サブパスが vitest の alias 設定に含まれているかを確認する必要が生じた。`apps/desktop/vitest.config.ts` の alias は手動管理であり、新サブパスが追加されると alias 漏れが再発するリスクがある。

### 1.2 問題点・課題

- `@repo/shared/ipc` が `apps/desktop/vitest.config.ts` の alias リストに含まれているか未確認
- vitest 実行時に `Failed to resolve entry for package "@repo/shared"` が再発する可能性がある
- `@repo/shared` 動的インポート（`await import('@repo/shared/ipc/channels')`）が正しく解決されないケースがある

### 1.3 放置した場合の影響

- UT-SDK-07 で追加した governance-bundle テスト（`preload/channels.test.ts` など）が alias 不足で失敗する
- テスト失敗時の原因切り分けに時間がかかる

---

## 2. 何を達成するか（What）

### 2.1 目的

`@repo/shared/ipc` サブパスが vitest alias に登録されていることを確認し、未登録であれば追加する。また、動的インポートの解決が vitest 環境で正常に動作することを確認する。

### 2.2 最終ゴール

- `@repo/shared/ipc` alias が `apps/desktop/vitest.config.ts` に登録されている
- UT-SDK-07 の governance-bundle テストが alias 起因で失敗しない
- 動的インポートパターンの vitest 解決手順が documented されている

---

## 3. 実行手順

1. `apps/desktop/vitest.config.ts` の alias 一覧に `@repo/shared/ipc` エントリがあるか確認
2. `packages/shared/src/ipc/channels.ts` の export 構造を確認
3. alias が未登録の場合は `@repo/shared/ipc` → `packages/shared/src/ipc/index.ts`（または相当パス）を追加
4. `pnpm --filter @repo/desktop test:run -- src/preload/channels.test.ts` で動作確認
5. 動的インポートパターンが有効な場合は vitest.config.ts のコメントに記載

---

## 3.5 苦戦箇所と解決策

| 苦戦箇所                                                                        | 原因                                                                                | 解決策                                                                                                |
| ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| alias 追加後も動的インポートが失敗する                                          | vitest の transform 設定や cache が古い場合、alias 追加だけでは解決しないことがある | `node_modules/.vite` のキャッシュを削除して再実行する                                                 |
| `@repo/shared/ipc` vs `@repo/shared/ipc/channels` どちらを alias に登録すべきか | exports フィールドの設定によって解決パスが変わる                                    | `packages/shared/package.json` の exports フィールドを確認し、公開エントリに合わせた alias を登録する |

---

## 4. 完了条件チェックリスト

- [ ] `@repo/shared/ipc` の alias が vitest.config.ts に登録されている
- [ ] `pnpm --filter @repo/desktop test:run -- src/preload/channels.test.ts` が通る
- [ ] `governance-bundle.test.ts` が alias 起因エラーなしで実行できる

---

## 5. 参照情報

- `apps/desktop/vitest.config.ts`（alias 定義）
- `packages/shared/src/ipc/channels.ts`（UT-SDK-07 で追加された APPROVAL/EXECUTION チャネル）
- `packages/shared/package.json`（exports フィールド）
- `apps/desktop/src/preload/channels.test.ts`（UT-SDK-07 で追加されたテスト）
- `apps/desktop/src/main/services/runtime/__tests__/governance-bundle.test.ts`（UT-SDK-07 の契約テスト）
- Issue #1715: [UT-SDK-07-VITE-ALIAS-CONFIG-001]
- 関連: `docs/30-workflows/unassigned-task/task-imp-vitest-alias-sync-automation-001.md`（alias 整合自動化タスク）

## 6. 備考

本タスクは調査系（Low）。alias 追加作業自体は小規模だが、動的インポートの解決パターンを文書化することで同種の問題を予防する効果がある。
`task-imp-vitest-alias-sync-automation-001.md` の自動化タスクと組み合わせて着手すると効率的。
