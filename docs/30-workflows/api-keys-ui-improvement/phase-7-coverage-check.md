# Phase 7: カバレッジ確認 - タスク仕様書

## メタ情報

| 項目       | 内容                        |
| ---------- | --------------------------- |
| Phase      | 7                           |
| Phase名    | カバレッジ確認              |
| 前提Phase  | Phase 6（テスト拡充）       |
| 後続Phase  | Phase 8（リファクタリング） |
| ステータス | 未実施                      |
| 作成日     | 2026-01-18                  |
| 機能名     | api-keys-ui-improvement     |

---

## 目的

追加したテストのカバレッジを測定し、基準達成を確認する。

## 背景

UI変更が小規模であっても、既存テストの範囲が十分であることを数値で確認する必要がある。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: カバレッジ計測

**目的**: ApiKeysSectionに関するカバレッジを計測する

**実行手順**:

1. カバレッジ計測コマンドを実行
2. ApiKeysSectionに関連するカバレッジ結果を抽出
3. `outputs/phase-7/coverage-report.md` に記録

**期待される成果物**:

- `outputs/phase-7/coverage-report.md`

---

### タスク2: ギャップ分析

**目的**: 目標値との差分を明確化する

**実行手順**:

1. 目標値（Line 80%, Branch 60%, Function 80%）と比較
2. 不足箇所を特定
3. `outputs/phase-7/coverage-gap-analysis.md` に記録

**期待される成果物**:

- `outputs/phase-7/coverage-gap-analysis.md`

---

### タスク3: ゲート判定

**目的**: カバレッジ達成可否を判定する

**実行手順**:

1. 目標値を満たしているか判定
2. 結果を `outputs/phase-7/gate-result.md` に記録
3. 未達の場合はPhase 6へ戻る

**期待される成果物**:

- `outputs/phase-7/gate-result.md`

---

## 参照資料

**システム仕様（aiworkflow-requirements）**

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料          | パス                                                                       | 内容                              |
| ----------------- | -------------------------------------------------------------------------- | --------------------------------- |
| APIキー設定UI設計 | `.claude/skills/aiworkflow-requirements/references/ui-ux-forms.md`         | APIキー設定と連携済み表示のUI仕様 |
| セキュリティ原則  | `.claude/skills/aiworkflow-requirements/references/security-principles.md` | APIキーの取り扱いと表示制約       |
| APIエンドポイント | `.claude/skills/aiworkflow-requirements/references/api-endpoints.md`       | APIキー取得/登録/削除のAPI仕様    |

**前Phase成果物**

| 参照資料       | パス                                       | 内容        |
| -------------- | ------------------------------------------ | ----------- |
| テスト拡充結果 | `outputs/phase-6/test-expansion-result.md` | Phase 6結果 |

---

**依存Phase成果物**

| 参照資料     | パス                                        | 内容         |
| ------------ | ------------------------------------------- | ------------ |
| Phase 5 実装 | `outputs/phase-5/implementation-summary.md` | 実装サマリー |

## 成果物

| 成果物             | パス                                       | 内容           |
| ------------------ | ------------------------------------------ | -------------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md`       | カバレッジ結果 |
| ギャップ分析       | `outputs/phase-7/coverage-gap-analysis.md` | 差分分析       |
| ゲート判定結果     | `outputs/phase-7/gate-result.md`           | 判定結果       |

---

## 統合テスト連携（Phase 1〜11は必須）

- 連携サービス表示との統合テスト観点がカバレッジ対象に含まれていることを確認
- 設定画面の表示変更が統合テストで検証できる状態であることを確認

---

## 完了条件

- [ ] カバレッジレポートが作成されている
- [ ] ギャップ分析が作成されている
- [ ] ゲート判定結果が記録されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施（Phase 1〜11）
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/api-keys-ui-improvement --phase 7
```

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 7 実行記録

### 実行タスク

- タスク1:
- タスク2:

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

## 依存関係

- **前提**: Phase 6（テスト拡充）の完了
- **後続**: Phase 8（リファクタリング）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/api-keys-ui-improvement/phase-8-refactoring.md`
