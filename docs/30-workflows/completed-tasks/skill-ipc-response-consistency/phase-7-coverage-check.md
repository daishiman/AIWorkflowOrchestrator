# Phase 7: カバレッジ確認

## メタ情報

| 項目       | 値                                        |
| ---------- | ----------------------------------------- |
| タスクID   | UT-FIX-SKILL-IPC-RESPONSE-CONSISTENCY-001 |
| Phase      | 7 / 13                                    |
| 前Phase    | Phase 6（テスト拡充）                     |
| 次Phase    | Phase 8（リファクタリング）               |
| 作成日     | 2026-02-27                                |
| ステータス | 未着手                                    |

## 目的

テストカバレッジが基準を満たしていることを確認する。未達の場合は Phase 6 に戻る。

契約統一の影響範囲が広いため、変更箇所のカバレッジを確実に確保する。

## 依存関係

| 依存先         | パス                                                                        | 用途                           |
| -------------- | --------------------------------------------------------------------------- | ------------------------------ |
| カバレッジ基準 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | 目標値                         |
| P41            | `.claude/rules/06-known-pitfalls.md`                                        | v8カバレッジプロバイダの注意点 |

## 参照資料

| 参照資料                 | パス                                                                              | 内容                         |
| ------------------------ | --------------------------------------------------------------------------------- | ---------------------------- |
| Phase 5 実装成果物       | `apps/desktop/src/main/ipc/skillHandlers.ts`                                      | カバレッジ測定対象           |
| Phase 5 実装成果物       | `apps/desktop/src/preload/skill-api.ts`                                           | カバレッジ測定対象           |
| Phase 6 テスト拡充成果物 | `apps/desktop/src/main/ipc/__tests__/skillHandlers*.test.ts`                      | 追加テストの反映範囲         |
| Phase 6 テスト拡充成果物 | `apps/desktop/src/preload/__tests__/skill-api*.test.ts`                           | 追加テストの反映範囲         |
| 品質・カバレッジ基準     | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`       | 閾値定義と品質ゲート         |
| テストパターン           | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` | 未達時の追加テスト設計方針   |
| P41 の既知の落とし穴対策 | `.claude/rules/06-known-pitfalls.md`                                              | カバレッジ測定時の誤判定防止 |

## カバレッジ基準

| 指標              | 最低基準 | 推奨基準 | 判定         |
| ----------------- | -------- | -------- | ------------ |
| Line Coverage     | 80%      | 90%      | 未達→Phase 6 |
| Branch Coverage   | 60%      | 70%      | 未達→Phase 6 |
| Function Coverage | 80%      | 90%      | 未達→Phase 6 |

## 実行タスク

- タスク1: カバレッジ計測を実施し、対象ファイルの指標を収集する
- タスク2: 収集した指標を閾値と比較し、進行可否を判定する
- タスク3: 未達時のみギャップ分析を実施し、Phase 6 へ戻す計画を作成する

### タスク1: カバレッジ計測

**目的**: 変更ファイルのカバレッジを計測する。

**手順**:

```bash
cd apps/desktop && pnpm vitest run --coverage src/main/ipc/skillHandlers.ts src/preload/skill-api.ts
```

1. Line Coverage / Branch Coverage / Function Coverage を計測する
2. 結果を `outputs/phase-7/coverage-report.md` に出力する

**計測対象ファイル**:

| ファイル                                     | 対象範囲                   |
| -------------------------------------------- | -------------------------- |
| `apps/desktop/src/main/ipc/skillHandlers.ts` | 全ハンドラ関数             |
| `apps/desktop/src/preload/skill-api.ts`      | 全Preload APIメソッド      |
| `apps/desktop/src/preload/types.ts`          | 型定義（カバレッジ対象外） |

**P41注意点**: Vitest の v8 カバレッジプロバイダは、インライン arrow function を独立した関数としてカウントする。validateIpcSender のオプションオブジェクト内のコールバックが実行されないと Function Coverage が大幅に低下する。

### タスク2: カバレッジ判定

**目的**: 基準値との比較を行う。

**手順**:

1. 最低基準と比較する: Line 80% / Branch 60% / Function 80%
2. 推奨基準と比較する: Line 90% / Branch 70% / Function 90%
3. 未達の場合は Phase 6 に戻る

**判定フロー**:

```
カバレッジ計測
    ↓
最低基準を満たすか？
    ├── Yes → 推奨基準を満たすか？
    │           ├── Yes → Phase 8 へ進む
    │           └── No  → ギャップ分析後 Phase 8 へ進む（推奨基準未達は記録のみ）
    └── No  → Phase 6 に戻る
```

### タスク3: カバレッジギャップ分析（未達の場合）

**目的**: 未カバーの箇所を特定する。

**手順**:

1. uncovered lines/branches を特定する
2. テスト追加計画を `outputs/phase-7/coverage-gap-analysis.md` に出力する

**ギャップ分析テンプレート**:

```markdown
## カバレッジギャップ分析

### 未カバー箇所一覧

| ファイル | 行番号 | 種別（Line/Branch/Function） | 理由 | テスト追加計画 |
| -------- | ------ | ---------------------------- | ---- | -------------- |
|          |        |                              |      |                |

### Phase 6 戻り時の追加テスト計画

1. ...
2. ...
```

## SubAgent 分担

| SubAgent   | 担当                                                       |
| ---------- | ---------------------------------------------------------- |
| SubAgent-A | タスク1（カバレッジ計測）                                  |
| SubAgent-B | タスク2（閾値判定）+ タスク3（未達時ギャップ分析）         |
| SubAgent-C | Phase進行判定（Phase 8 進行 / Phase 6 戻り）+ レポート集約 |

## 成果物

| 成果物                 | パス                                       | 内容             |
| ---------------------- | ------------------------------------------ | ---------------- |
| カバレッジレポート     | `outputs/phase-7/coverage-report.md`       | 計測結果         |
| ギャップ分析（該当時） | `outputs/phase-7/coverage-gap-analysis.md` | 未カバー箇所特定 |

## 統合テスト連携

統合テストの再実行とゲート判定。カバレッジ基準が統合テストを含めて達成されていることを確認する。

## 完了条件

- [ ] カバレッジ計測が完了している
- [ ] Line Coverage ≥ 80%（最低基準）
- [ ] Branch Coverage ≥ 60%（最低基準）
- [ ] Function Coverage ≥ 80%（最低基準）
- [ ] カバレッジレポートが出力されている
- [ ] 未達の場合は Phase 6 へ戻るか、ギャップ分析が完了している

---

## サブタスク管理

Phase 実行開始時に以下のサブタスクを作成すること:

- [ ] タスク1: カバレッジ計測
- [ ] タスク2: カバレッジ判定
- [ ] タスク3: カバレッジギャップ分析（該当時のみ）

## タスク100%実行確認【必須】チェックリスト

Phase 完了前に以下を全て確認すること:

- [ ] 全タスク（タスク1〜2、該当時タスク3）が完了している
- [ ] 成果物が全て所定のパスに出力されている
- [ ] カバレッジ基準（最低基準）が全て満たされている
- [ ] P41の注意点（v8カバレッジプロバイダのインライン関数カウント）を考慮している
- [ ] 完了条件が全て満たされている

## Phase実行記録

| 項目              | 記録 |
| ----------------- | ---- |
| 実行開始日時      |      |
| 実行完了日時      |      |
| 実行者            |      |
| Line Coverage     | %    |
| Branch Coverage   | %    |
| Function Coverage | %    |
| 判定結果          |      |
| Phase 6 戻り回数  |      |
| 備考              |      |

## Phase末端アクション【必須】

1. `artifacts.json` の Phase 7 ステータスを更新する
2. 本仕様書の完了条件チェックリストを全て埋める
3. Phase実行記録を記入する
4. カバレッジ基準達成 → 次 Phase（Phase 8: リファクタリング）に進む
5. カバレッジ基準未達 → Phase 6 に戻る

## 次Phase

→ [Phase 8: リファクタリング](./phase-8-refactoring.md)

（カバレッジ未達の場合）
→ [Phase 6: テスト拡充](./phase-6-test-expansion.md)（戻り）
