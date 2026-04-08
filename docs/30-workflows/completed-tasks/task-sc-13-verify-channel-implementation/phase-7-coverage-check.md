# Phase 7: カバレッジ確認

## メタ情報

| 項目       | 値                                       |
| ---------- | ---------------------------------------- |
| Phase      | 7                                        |
| Phase名    | カバレッジ確認                           |
| 前提Phase  | Phase 6                                  |
| 後続Phase  | Phase 8                                  |
| ステータス | 未実施                                   |
| 作成日     | 2026-04-08                               |
| 機能名     | task-sc-13-verify-channel-implementation |

---

## 目的

変更ファイル（5ファイル）の line / branch カバレッジを計測し、Phase 1 で定義した目標値を
満たしているかを確認する。広域指定ではなく、変更した関数・ブロックのカバレッジに集中する
（Feedback BEFORE-QUIT-002 対応）。

---

## カバレッジ目標

**計測対象ファイル**（変更ファイルに限定）:

| ファイル                                          | Line Coverage 目標 | Branch Coverage 目標 |
| ------------------------------------------------- | ------------------ | -------------------- |
| `creatorHandlers.ts`（verify 追加部分）           | 90%+               | 80%+                 |
| `RuntimeSkillCreatorFacade.ts`（verify メソッド） | 85%+               | 75%+                 |
| `skill-creator-api.ts`（verifySkill 追加部分）    | 90%+               | -                    |
| `channels.ts`（SKILL_CREATOR_VERIFY 追加）        | 100%               | -                    |
| `skillCreator.ts`（VerifyResult 型追加）          | N/A（型のみ）      | N/A                  |

---

## 実行タスク

### タスク1: カバレッジ計測

**目的**: 変更ファイルのカバレッジを計測する

**実行手順**:

1. vitest coverage を変更ファイルに対象を絞って実行する
2. 計測結果を `outputs/phase-7/coverage-report.md` に記録する

**重要**: Phase 7 のカバレッジ目標は「変更した関数/ブロック」に絞る。全ファイル一律指定は
避ける（Feedback BEFORE-QUIT-002）。

```bash
# verify ハンドラのカバレッジ計測（targeted）
pnpm --filter @repo/desktop test \
  --coverage \
  --coverage.include="apps/desktop/src/main/ipc/creatorHandlers.ts" \
  --coverage.include="apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts" \
  --coverage.include="apps/desktop/src/preload/skill-creator-api.ts" \
  apps/desktop/src/main/ipc/__tests__/creatorHandlers.verify.test.ts
```

**記録すべき実測値**:

- `creatorHandlers.ts` の verify ハンドラ付近の line カバレッジ（実数）
- `creatorHandlers.ts` の verify ハンドラ付近の branch カバレッジ（実数）
- `RuntimeSkillCreatorFacade.verify()` の line / branch カバレッジ（実数）

---

### タスク2: カバレッジ目標未達時の対応

**目的**: 目標未達の場合、Phase 6 に戻って不足テストを追加する

**判定基準**:

| 結果                     | 次のアクション                 |
| ------------------------ | ------------------------------ |
| 全ファイルが目標値を達成 | Phase 8 へ進む                 |
| 一部ファイルが目標未達   | Phase 6 に戻り追加テストを作成 |
| 計測コマンド自体が失敗   | 設定を確認して再計測           |

---

## 成果物

| 成果物             | パス                                 | 内容                                  |
| ------------------ | ------------------------------------ | ------------------------------------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` | 変更ファイル別の実測値（line/branch） |

---

## 参照資料

| 参照資料           | パス                                                                                   | 内容                          |
| ------------------ | -------------------------------------------------------------------------------------- | ----------------------------- |
| Phase 6 テスト拡充 | `docs/30-workflows/task-sc-13-verify-channel-implementation/phase-6-test-expansion.md` | 追加テストの前提              |
| テスト拡充結果     | `outputs/phase-6/test-expansion-result.md`                                             | fail path / 回帰 guard の証跡 |
| 実装フェーズ       | `docs/30-workflows/task-sc-13-verify-channel-implementation/phase-5-implementation.md` | カバレッジ対象の実装本体      |
| Green 確認         | `outputs/phase-5/green-confirmation.md`                                                | 実装完了時の PASS 証跡        |

## 統合テスト連携

- 統合テストの再実行とゲート判定（Phase 7 役割）
- カバレッジ計測と同時に統合テスト全件 PASS を確認する

---

## 完了条件

- [ ] 変更ファイル（`creatorHandlers.ts` の verify 部分 / `RuntimeSkillCreatorFacade.verify()`）のカバレッジを計測済みであること
- [ ] `creatorHandlers.ts` verify 部分の line カバレッジ ≥ 90% であること
- [ ] `creatorHandlers.ts` verify 部分の branch カバレッジ ≥ 80% であること
- [ ] `RuntimeSkillCreatorFacade.verify()` の line カバレッジ ≥ 85% であること
- [ ] `outputs/phase-7/coverage-report.md` に実測値が記録されていること

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 6 が完了していること
- **後続**: Phase 8 へ進む（未達時は Phase 6 に戻る）

---

## 次Phase

**Phase 8: リファクタリング** — 重複や navigation drift を削除し、コード品質を向上させる。
