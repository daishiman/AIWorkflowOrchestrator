# Phase 7: テストカバレッジ確認

## メタ情報

| 項目       | 内容                                             |
| ---------- | ------------------------------------------------ |
| Phase      | 7                                                |
| 機能名     | 06-TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001   |
| タスク名   | 設定画面 apiKey.list 契約防御と providers 正規化 |
| 作成日     | 2026-03-06                                       |
| ステータス | 未実施                                           |

## 目的

Phase 4-6 で追加したテストが、防御ガードの全分岐を十分にカバーしているか数値で確認し、未達箇所を特定する。

## カバレッジ目標

### 対象ファイル別目標

| 対象ファイル                            | Line | Branch | Function | 根拠                   |
| --------------------------------------- | ---- | ------ | -------- | ---------------------- |
| `ApiKeysSection/index.tsx`              | 90%+ | 70%+   | 90%+     | Renderer 防御の主対象  |
| `apiKeyHandlers.ts`                     | 80%+ | 60%+   | 80%+     | Main 側バリデーション  |
| `profileHandlers.ts`（identities 部分） | 80%+ | 60%+   | 80%+     | 防御パターン統一の確認 |

### プロジェクト全体基準（quality-requirements.md 準拠）

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

## 実行タスク

- Task 1: カバレッジ計測の実行
- Task 2: gap-log の作成
- Task 3: P41（v8カバレッジ注意事項）確認
- Task 4: Phase 6 差戻し判定

### Task 1: カバレッジ計測の実行

```bash
# ApiKeysSection のカバレッジ計測
cd apps/desktop && pnpm vitest run \
  src/renderer/components/organisms/ApiKeysSection/__tests__/ApiKeysSection.test.tsx \
  --coverage --coverage.reporter=text --coverage.reporter=json

# apiKeyHandlers のカバレッジ計測
cd apps/desktop && pnpm vitest run \
  src/main/ipc/__tests__/apiKeyHandlers.test.ts \
  --coverage --coverage.reporter=text
```

### Task 2: gap-log の作成

計測結果から未カバー行を特定し、以下のテンプレートで記録する。

| gap ID  | ファイル                 | 未カバー行 | 分岐条件                             | 優先度 | 対応方針   |
| ------- | ------------------------ | ---------- | ------------------------------------ | ------ | ---------- |
| GAP-001 | ApiKeysSection/index.tsx | L**-**     | `result.data === undefined` パス     | HIGH   | Phase 6    |
| GAP-002 | apiKeyHandlers.ts        | L**-**     | providers 配列要素 validation 未実施 | MEDIUM | 未タスク化 |
| GAP-003 | profileHandlers.ts       | L**-**     | `identities` が非配列値の場合        | LOW    | 未タスク化 |

### Task 3: P41（v8 カバレッジプロバイダ注意事項）の確認

> **P41**: Vitest の v8 カバレッジプロバイダは、インライン arrow function を独立した関数としてカウントする。

- ApiKeysSection 内のインライン arrow function（`.map()`, `.filter()` コールバック等）が Function Coverage を下げる可能性がある
- カバレッジ数値が不自然に低い場合は、v8 プロバイダのカウント特性を確認してから Phase 6 への差戻しを判断する

### Task 4: Phase 6 差戻し判定

| 条件                                 | 判定           |
| ------------------------------------ | -------------- |
| Line Coverage < 80%                  | Phase 6 差戻し |
| Branch Coverage < 60%                | Phase 6 差戻し |
| Function Coverage < 80%（P41除外後） | Phase 6 差戻し |
| 全基準充足                           | Phase 8 へ進行 |

## 参照資料

| 資料名               | パス                                                                        | 用途                          |
| -------------------- | --------------------------------------------------------------------------- | ----------------------------- |
| quality-requirements | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | カバレッジ基準                |
| known-pitfalls P41   | `.claude/rules/06-known-pitfalls.md`                                        | v8 カバレッジのインライン関数 |
| Phase 5 成果物       | `outputs/phase-5/changed-files-plan.md`                                     | 実装差分の対象確認            |
| Phase 6 成果物       | `outputs/phase-6/`                                                          | 追加テストの確認              |

## 成果物

| 成果物         | パス                                  | 説明                           |
| -------------- | ------------------------------------- | ------------------------------ |
| coverage 結果  | `outputs/phase-7/coverage-results.md` | 対象ファイル別カバレッジ数値   |
| gap log        | `outputs/phase-7/gap-log.md`          | 未カバー行と補完方針           |
| 差戻し判定結果 | `outputs/phase-7/gate-decision.md`    | Phase 6 差戻し or Phase 8 進行 |

## 完了条件

- [ ] 対象 3 ファイルのカバレッジが数値で記録されている
- [ ] gap-log に未カバー行が具体的に記載されている
- [ ] P41 の影響を考慮した差戻し判定が行われている
- [ ] Phase 6 差戻し or Phase 8 進行の判定が gate-decision に記録されている
- [ ] 本 Phase 内の全タスクを 100% 実行完了

## タスク 100% 実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase 末端で完了内容を実行記録へ残している

## 次の Phase

Phase 8: リファクタリング

## 統合テスト連携

- 本Phaseの結果は `apps/desktop` の対象Vitest実行（`apiKeyHandlers.list` / `profileHandlers.identities` / `ApiKeysSection`）と連動して判定する。
- Phase 11 ではスクリーンショット証跡（TC-11-01〜03）を統合テスト結果と同じ実装リビジョンで取得する。
