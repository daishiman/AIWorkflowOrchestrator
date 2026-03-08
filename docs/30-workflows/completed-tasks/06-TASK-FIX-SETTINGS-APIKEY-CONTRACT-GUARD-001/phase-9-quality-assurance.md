# Phase 9: 品質保証

## メタ情報

| 項目       | 内容                                             |
| ---------- | ------------------------------------------------ |
| Phase      | 9                                                |
| 機能名     | 06-TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001   |
| タスク名   | 設定画面 apiKey.list 契約防御と providers 正規化 |
| 作成日     | 2026-03-06                                       |
| ステータス | 未実施                                           |

## 目的

Phase 5-8 の全成果物に対して品質チェックを実施し、Phase 10（最終レビュー）に進行可能か判断する。

## 実行タスク

### Task 1: 品質チェックの実行

以下のコマンドを順次実行し、全 PASS を確認する。

```bash
# 1. Lint チェック
pnpm lint

# 2. TypeScript 型チェック
pnpm typecheck

# 3. 関連テストの実行
cd apps/desktop && pnpm vitest run \
  src/renderer/components/organisms/ApiKeysSection/__tests__/ApiKeysSection.test.tsx \
  src/main/ipc/__tests__/apiKeyHandlers.test.ts

# 4. 全テスト実行（回帰確認）
pnpm --filter @repo/desktop test
```

**合格基準**:

| チェック項目     | 合格条件                        |
| ---------------- | ------------------------------- |
| `pnpm lint`      | エラー 0 件                     |
| `pnpm typecheck` | エラー 0 件                     |
| 関連テスト       | 全 PASS                         |
| 全テスト         | 全 PASS（既存テストの回帰なし） |

### Task 2: Pitfall 再発チェック

以下の既知パターンが再発していないか確認する。

| Pitfall | チェック内容                                    | 確認コマンド / 方法                                                                            |
| ------- | ----------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| P42     | 文字列引数の `.trim()` バリデーション漏れ       | `grep -rn "typeof.*string.*===" apps/desktop/src/main/ipc/apiKeyHandlers.ts` で `.trim()` 確認 |
| P44     | IPC ハンドラと Preload のインターフェース不整合 | ハンドラ引数形式と `skill-api.ts` の呼び出し形式を照合                                         |
| P45     | IPC 引数命名の契約ドリフト                      | 引数名のセマンティクスが実際の値と一致するか確認                                               |
| P48     | Non-null assertion (`!`) による安全性偽装       | `grep -rn "\.data\!" apps/desktop/src/renderer/` で `!` 使用箇所を確認                         |

### Task 3: IPC 契約チェックリスト（Phase 5-6）の実行

`ipc-contract-checklist.md` の以下の Phase を実行する。

**Phase 5: ランタイム検証**

- [ ] `apiKey:list` ハンドラの戻り値が `IPCResponse<ProviderListResult>` の envelope に準拠
- [ ] `result.success === false` 時の `error` フィールドが `IPCError { code, message }` 形式
- [ ] `result.data.providers` が `ProviderStatus[]` 型の配列

**Phase 6: 回帰防止**

- [ ] Phase 4-6 のテストが防御ガードの全分岐をカバー
- [ ] テストデータファクトリが正常系・異常系の両方を生成可能
- [ ] malformed response ケースが regression fixture として固定されている

### Task 4: リスク登録簿の作成

| リスク ID | リスク内容                                       | 発生条件                                    | 影響度 | 回避策                           |
| --------- | ------------------------------------------------ | ------------------------------------------- | ------ | -------------------------------- |
| RSK-001   | Main 側 providers 配列要素バリデーション未実施   | apiKeyValidator が不正な shape を返した場合 | MEDIUM | 未タスク化して後続対応           |
| RSK-002   | profileHandlers の identities 防御パターン不統一 | identities が非配列値の場合                 | LOW    | Phase 8 で統一方針決定済み       |
| RSK-003   | structured clone による型情報欠落                | contextBridge 経由でメソッドが消失する場合  | LOW    | P48 準拠の実行時型検証で防御済み |

## 参照資料

| 資料名                 | パス                                                                          | 用途                   |
| ---------------------- | ----------------------------------------------------------------------------- | ---------------------- |
| ipc-contract-checklist | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md` | IPC 契約チェックリスト |
| known-pitfalls         | `.claude/rules/06-known-pitfalls.md`                                          | P42/P44/P45/P48 確認   |
| quality-requirements   | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`   | 品質基準               |
| Phase 5-8 成果物       | `outputs/phase-5/` 〜 `outputs/phase-8/`                                      | 品質チェックの入力     |

## 成果物

| 成果物             | パス                                   | 説明                 |
| ------------------ | -------------------------------------- | -------------------- |
| 品質チェックリスト | `outputs/phase-9/quality-checklist.md` | 全チェック項目と結果 |
| リスク登録簿       | `outputs/phase-9/risk-register.md`     | 残存リスクと回避策   |

## 完了条件

- [ ] `pnpm lint` / `pnpm typecheck` / 全テストが PASS
- [ ] P42/P44/P45/P48 の再発チェックが実施されている
- [ ] IPC 契約チェックリスト Phase 5-6 が完了している
- [ ] リスク登録簿に残存リスクが分類されている（blocking / non-blocking）
- [ ] 本 Phase 内の全タスクを 100% 実行完了

## タスク 100% 実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase 末端で完了内容を実行記録へ残している

## 次の Phase

Phase 10: 最終レビューゲート

## 統合テスト連携

- 本Phaseの結果は `apps/desktop` の対象Vitest実行（`apiKeyHandlers.list` / `profileHandlers.identities` / `ApiKeysSection`）と連動して判定する。
- Phase 11 ではスクリーンショット証跡（TC-11-01〜03）を統合テスト結果と同じ実装リビジョンで取得する。
