# Phase 7: カバレッジ確認

## メタ情報

| 項目       | 内容                                                       |
| ---------- | ---------------------------------------------------------- |
| Phase      | 7                                                          |
| タスクID   | UT-SKILL-WIZARD-W2-SKILL-CREATE-WIZARD-001                 |
| 機能名     | SkillCreateWizard.tsx 実装（オーケストレーション・Wave 2） |
| 前提Phase  | Phase 6                                                    |
| 後続Phase  | Phase 8                                                    |
| 作成日     | 2026-04-08                                                 |
| ステータス | 未実施                                                     |

---

## 目的

テストカバレッジが 90% 以上であることを確認する（AC-05）。

## 背景

Phase 5・Phase 6 のテストで TDD Green を達成した後、カバレッジ目標（Line/Function: 90% 以上、Branch: 80% 以上）を達成しているか確認する。未達成の場合は未到達パスを特定してテストを追加する。

---

## 実行タスク

### タスク1: カバレッジ計測の実行

**目的**: `SkillCreateWizard.tsx` のカバレッジを計測する

**実行手順**:

1. 以下のコマンドでカバレッジを計測する：
   ```bash
   cd apps/desktop && pnpm vitest run --coverage src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx
   ```
2. `SkillCreateWizard.tsx` の Line / Branch / Function カバレッジを記録する
3. カバレッジ結果を `outputs/phase-7/coverage-result.md` に記録する

**カバレッジ目標**:
| 指標 | 目標 |
| ---- | ---- |
| Line Coverage | 90% 以上 |
| Branch Coverage | 80% 以上 |
| Function Coverage | 90% 以上 |

**期待される成果物**:

- `outputs/phase-7/coverage-result.md`

---

### タスク2: 未到達パスの特定（90% 未満の場合）

**目的**: 90% 未満の場合、未到達のパスを特定してテストを追加する

**実行手順**:

1. カバレッジレポートで未到達行・分岐を確認する
2. 未到達パスに対応するテストケースを設計する
3. Phase 6 のテストファイルに追加する
4. カバレッジを再計測し、目標達成を確認する

**期待される成果物**:

- カバレッジ追加記録（`outputs/phase-7/coverage-result.md` に追記）

---

### タスク3: カバレッジ結果の記録

**目的**: 最終カバレッジ結果を記録し、Phase 7 完了とする

**実行手順**:

1. 最終カバレッジ結果（Line / Branch / Function）を記録する
2. 目標達成の確認を `outputs/phase-7/coverage-result.md` に記録する

**期待される成果物**:

- `outputs/phase-7/coverage-result.md`（最終値）

---

## 参照資料

| 参照資料             | パス                                                                              | 内容                 |
| -------------------- | --------------------------------------------------------------------------------- | -------------------- |
| Phase 4 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`                                          | AC-05 カバレッジ目標 |
| テストファイル       | `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx` | 計測対象テスト       |

---

## 成果物

| 成果物         | パス                                 | 内容                                        |
| -------------- | ------------------------------------ | ------------------------------------------- |
| カバレッジ結果 | `outputs/phase-7/coverage-result.md` | Line/Branch/Function の計測値と目標達成確認 |

---

## 統合テスト連携

- 統合テストの再実行結果をカバレッジ計測と合わせて確認する

---

## 完了条件

- [ ] `pnpm vitest run --coverage` でカバレッジを計測していること
- [ ] Line Coverage >= 90% を達成していること
- [ ] Branch Coverage >= 80% を達成していること
- [ ] Function Coverage >= 90% を達成していること
- [ ] 成果物（coverage-result.md）が作成されていること
- [ ] 本 Phase 内の全タスクを 100% 実行完了

---

## Phase末端アクション【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクを 100% 完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 6（テスト拡充）が完了していること
- **後続**: Phase 8（リファクタリング）へ進む
- **未達時**: Phase 6 へ戻りテストを追加する

---

## 次の Phase

完了後、以下のファイルを実行してください:

`docs/30-workflows/W2-seq-03a-skill-create-wizard-2/phase-8-refactoring.md`
