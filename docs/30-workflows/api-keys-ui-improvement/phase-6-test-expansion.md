# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目       | 内容                      |
| ---------- | ------------------------- |
| Phase      | 6                         |
| Phase名    | テスト拡充                |
| 前提Phase  | Phase 5（実装）           |
| 後続Phase  | Phase 7（カバレッジ確認） |
| ステータス | 未実施                    |
| 作成日     | 2026-01-18                |
| 機能名     | api-keys-ui-improvement   |

---

## 目的

UI変更の品質を高めるためにアクセシビリティとエッジケースのテストを追加する。

## 背景

登録済み表示の変更は視覚要素の更新が中心であり、既存のa11yテストやエッジケースの再確認が必要になる。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: アクセシビリティテストの追加

**目的**: 登録済みバッジのアクセシビリティを確認する

**実行手順**:

1. `ApiKeysSection` のa11yテストを更新
2. 登録済みバッジに適切なラベルが付与されていることを検証
3. 結果を `outputs/phase-6/a11y-test.md` に記録

**期待される成果物**:

- `outputs/phase-6/a11y-test.md`

---

### タスク2: エッジケーステストの追加

**目的**: 複数プロバイダー表示時のレイアウトを検証する

**実行手順**:

1. 複数の登録済みAPIキーが並ぶケースを追加
2. 各カードのバッジとボタンが崩れないことを検証
3. 結果を `outputs/phase-6/edge-case-tests.md` に記録

**期待される成果物**:

- `outputs/phase-6/edge-case-tests.md`

---

### タスク3: テスト拡充結果の記録

**目的**: テスト拡充の結果をまとめる

**実行手順**:

1. 追加したテストの合否を整理
2. Phase 6の結果を `outputs/phase-6/test-expansion-result.md` に記録

**期待される成果物**:

- `outputs/phase-6/test-expansion-result.md`

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

| 参照資料      | パス                                        | 内容       |
| ------------- | ------------------------------------------- | ---------- |
| 実装サマリー  | `outputs/phase-5/implementation-summary.md` | 実装結果   |
| Green状態確認 | `outputs/phase-5/test-green-status.md`      | テスト結果 |

---

## 成果物

| 成果物                 | パス                                       | 内容           |
| ---------------------- | ------------------------------------------ | -------------- |
| アクセシビリティテスト | `outputs/phase-6/a11y-test.md`             | a11y結果       |
| エッジケーステスト     | `outputs/phase-6/edge-case-tests.md`       | 追加テスト結果 |
| テスト拡充結果         | `outputs/phase-6/test-expansion-result.md` | Phase 6まとめ  |

---

## 統合テスト連携（Phase 1〜11は必須）

- 連携サービス表示との同時表示でUIが崩れないことを確認
- 登録済みと未登録が混在する状態の表示をテストシナリオに追加

---

## 完了条件

- [ ] a11yテストが追加されている
- [ ] エッジケーステストが追加されている
- [ ] テスト拡充結果が記録されている

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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/api-keys-ui-improvement --phase 6
```

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 6 実行記録

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

- **前提**: Phase 5（実装）の完了
- **後続**: Phase 7（カバレッジ確認）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/api-keys-ui-improvement/phase-7-coverage-check.md`
