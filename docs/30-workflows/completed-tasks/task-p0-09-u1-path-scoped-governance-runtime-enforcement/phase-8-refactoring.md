# Phase 8: リファクタリング

## メタ情報

| 項目       | 値                                         |
| ---------- | ------------------------------------------ |
| Phase      | 8                                          |
| Phase名    | リファクタリング                           |
| 前提Phase  | Phase 7                                    |
| 後続Phase  | Phase 9                                    |
| ステータス | 完了                                       |
| 作成日     | 2026-04-06                                 |
| 機能名     | path-scoped-governance-runtime-enforcement |

---

## 目的

コードの可読性・保守性を向上させる（テストは引き続き PASS）。

---

## 実行タスク

### タスク1: 重複コードの抽出

**目的**: `execute` と `improve` phase の `canUseTool` で重複があれば共通 helper に切り出す

**確認内容**:

- `createExecuteGovernanceCanUseTool` と `createImproveGovernanceCanUseTool` に重複する `targetPath` 抽出ロジックがあるか確認する
- 重複がある場合は `extractTargetPath(input)` ユーティリティ関数として定義する

**変更記録形式（対象/Before/After/理由）**:

| 対象                      | Before                             | After                                   | 理由                             |
| ------------------------- | ---------------------------------- | --------------------------------------- | -------------------------------- |
| `targetPath` 抽出ロジック | `execute`/`improve` それぞれに記述 | `extractTargetPath(input)` として共通化 | DRY原則・SDKキー名変更時の保守性 |

**実行手順**:

1. `execute` と `improve` の両メソッドに同じ抽出ロジックがあることを確認する
2. `private extractTargetPath(input: Record<string, unknown>): string | undefined` を定義する
3. 両メソッドで `extractTargetPath(input)` を呼び出すよう変更する
4. テストが引き続き PASS することを確認する

**期待される成果物**:

- リファクタリング済み `RuntimeSkillCreatorFacade.ts`

### タスク2: リファクタリング後のテスト確認

**目的**: リファクタリング後も全テストが PASS することを確認する

**実行コマンド**:

```bash
cd apps/desktop && npx vitest run src/main/services/runtime/__tests__/governance/
```

**確認項目**:

- [ ] TC-PATH-01〜TC-PATH-06 が PASS している
- [ ] 既存 90 件テストが PASS している

**期待される成果物**:

- リファクタリング後のテスト結果記録

### タスク3: リファクタリング記録

**目的**: 変更内容を記録して次のフェーズへの引き継ぎを確保する

**実行手順**:

1. 実施したリファクタリングを「対象/Before/After/理由」テーブル形式で記録する
2. 重複がなかった場合は「変更なし」として記録する

**期待される成果物**:

- `outputs/phase-8/refactoring-log.md`（変更なしでも記録必須）

---

## 参照資料

| 参照資料           | パス                                                                  | 内容           |
| ------------------ | --------------------------------------------------------------------- | -------------- |
| Phase 7 カバレッジ | `outputs/phase-7/coverage-report.txt`                                 | カバレッジ確認 |
| Phase 5 実装       | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | リファクタ対象 |

---

## 成果物

| 成果物             | パス                                 | 内容                          |
| ------------------ | ------------------------------------ | ----------------------------- |
| refactoring-log.md | `outputs/phase-8/refactoring-log.md` | Before/After/理由テーブル形式 |

---

## 統合テスト連携

リファクタ後の統合テスト継続成功を確認する（全 governance テスト PASS）。

---

## 完了条件

- [ ] `execute`/`improve` の重複ロジックが共通 helper に切り出されている（または重複なしと記録されている）
- [ ] リファクタリング後も TC-PATH-01〜TC-PATH-06 が PASS している
- [ ] リファクタリング後も既存 90 件テストが PASS している
- [ ] `outputs/phase-8/refactoring-log.md` が作成されている（「対象/Before/After/理由」テーブル形式）
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 7 が完了していること（カバレッジ 80%+ 達成）
- **後続**: Phase 9（品質保証）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`phase-9-quality-assurance.md`
