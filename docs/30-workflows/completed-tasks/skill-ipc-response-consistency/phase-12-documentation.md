# Phase 12: ドキュメント更新 - タスク仕様書

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| タスクID   | UT-FIX-SKILL-IPC-RESPONSE-CONSISTENCY-001 |
| Phase      | 12                                        |
| Phase名    | ドキュメント更新                          |
| 前提Phase  | Phase 11 (手動テスト検証)                 |
| 後続Phase  | Phase 13 (完了処理・PR作成)               |
| ステータス | 完了（成果物更新済み）                    |
| 作成日     | 2026-02-27                                |
| 機能名     | skill-ipc-response-consistency            |

---

## 目的

システム仕様書更新、実装ガイド作成、未タスク検出、教訓反映を行う。

## 背景

Phase 12 は漏れが最も発生しやすい Phase。必ず全項目を逐次確認すること。P1/P2/P3/P4/P25/P26/P27/P28/P43 の教訓を反映する。

> **最重要**: 全チェックリスト項目を確認してから「完了」とすること（P4対策）。

---

## 使用スキル

> - `aiworkflow-requirements`: システム仕様書の検索・更新
> - `task-specification-creator`: 仕様書テンプレートの参照

---

## 参照資料

| 参照資料                  | パス                                                                                   | 内容                 |
| ------------------------- | -------------------------------------------------------------------------------------- | -------------------- |
| Phase 2 設計成果物        | `outputs/phase-2/design-document.md`                                                   | 仕様更新の設計根拠   |
| Phase 5 実装成果物        | `apps/desktop/src/main/ipc/skillHandlers.ts`                                           | 実装実態との同期確認 |
| Phase 5 実装成果物        | `apps/desktop/src/preload/skill-api.ts`                                                | 実装実態との同期確認 |
| Phase 6 テスト拡充結果    | `outputs/phase-6/test-expansion-report.md`                                             | テスト観点の記録     |
| Phase 7 カバレッジ結果    | `outputs/phase-7/coverage-report.md`                                                   | 品質指標の反映       |
| Phase 8 リファクタ結果    | `outputs/phase-8/refactoring-report.md`                                                | コード整理内容の反映 |
| Phase 9 品質結果          | `outputs/phase-9/quality-report.md`                                                    | 品質ゲートの証跡     |
| Phase 10 最終レビュー結果 | `outputs/phase-10/final-review-result.md`                                              | 判定結果と残課題     |
| Phase 11 手動テスト結果   | `outputs/phase-11/manual-test-result.md`                                               | 手動確認の証跡       |
| 仕様更新ワークフロー      | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`         | 更新手順             |
| Phase 11-12 ガイド        | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`            | 詳細ガイド           |
| 実装ガイドテンプレート    | `.claude/skills/task-specification-creator/assets/implementation-guide-template.md`    | テンプレート         |
| 変更履歴テンプレート      | `.claude/skills/task-specification-creator/assets/documentation-changelog-template.md` | テンプレート         |

---

## 成果物

| 成果物           | パス                                          | 必須 | ステータス |
| ---------------- | --------------------------------------------- | ---- | ---------- |
| 実装ガイド       | `outputs/phase-12/implementation-guide.md`    | ✅   | 完了       |
| IPC ドキュメント | `outputs/phase-12/ipc-documentation.md`       | ✅   | 完了       |
| 変更履歴         | `outputs/phase-12/documentation-changelog.md` | ✅   | 完了       |
| 仕様更新サマリー | `outputs/phase-12/spec-update-summary.md`     | ✅   | 完了       |
| 未タスクレポート | `outputs/phase-12/unassigned-task-report.md`  | ✅   | 完了       |
| スキルFBレポート | `outputs/phase-12/skill-feedback-report.md`   | ✅   | 完了       |

---

## 実行タスク

### Task 1: 実装ガイド作成【必須】

#### タスク1-1: Part 1（中学生レベル概念説明）

**目的**: 非技術者でも理解できる概念説明を作成する。

**手順**:

1. IPC契約統一を日常の例えで説明（例: 「お店のメニュー表示の統一」）
2. なぜ統一が重要かを身近な例で説明
3. 専門用語は使わない
4. `outputs/phase-12/implementation-guide.md` の Part 1 セクションに出力

**日常例えの方向性**:

> お店ごとに注文の返事の仕方がバラバラだったら、お客さんは混乱しますよね。
> あるお店は「注文番号だけ」を言い、別のお店は「注文番号と値段」を言う。
> これを統一して、どのお店でも同じ形式で返事するようにしたのが今回の変更です。

#### タスク1-2: Part 2（開発者向け実装詳細）

**目的**: 実装の技術詳細を記録する。

**手順**:

1. 契約プロファイル表の詳細
2. 各チャネルの変更内容（AS-IS → TO-BE）
3. TypeScript型定義のAPIシグネチャ
4. 使用例・コードサンプル
5. `outputs/phase-12/implementation-guide.md` の Part 2 セクションに出力

#### タスク1-3: IPC ドキュメント作成

**目的**: IPC 契約変更の詳細ドキュメントを作成する。

**手順**:

1. 変更されたチャネルの一覧と変更内容
2. Preload API の新しい契約
3. `outputs/phase-12/ipc-documentation.md` に出力

---

### Task 2: システム仕様書更新【必須】（spec-update-workflow.md 準拠）

#### タスク2-1: Step 1-A タスク完了記録【必須・全タスク】

**目的**: 完了記録を全必要箇所に追加する。

**手順**:

| #   | 更新対象                                         | 内容                                | 必須 |
| --- | ------------------------------------------------ | ----------------------------------- | ---- |
| 1   | 該当仕様書（`interfaces-agent-sdk-skill.md` 等） | タスク完了記録セクション追加        | ✅   |
| 2   | `aiworkflow-requirements/LOGS.md`                | エントリ追加 **（1つ目）**          | ✅   |
| 3   | `task-specification-creator/LOGS.md`             | 記録追加 **（2つ目 - P1/P25対策）** | ✅   |
| 4   | `aiworkflow-requirements/SKILL.md`               | 変更履歴テーブル更新                | ✅   |
| 5   | `task-specification-creator/SKILL.md`            | 変更履歴テーブル更新                | ✅   |

> ⚠️ **P1/P25対策**: LOGS.md は2ファイル**両方**の更新が必須。片方の更新忘れが過去に複数回発生している。

#### タスク2-2: Step 1-B 実装状況テーブル更新

**目的**: api-endpoints.md 等の実装ステータスを更新する。

**手順**:

1. `api-ipc-agent.md` の実装状況テーブルを確認
2. 変更されたチャネルのステータスを更新

#### タスク2-3: Step 1-C 関連タスクテーブル更新

**目的**: 関連仕様書のタスク参照を更新する。

**手順**:

```bash
# 関連仕様書を検索
grep -rn "UT-FIX-SKILL-IPC-RESPONSE-CONSISTENCY" .claude/skills/aiworkflow-requirements/references/
```

各仕様書のタスクテーブルを更新する。

#### タスク2-4: Step 1-D topic-map.md 再生成【P2/P27対策】

**目的**: インデックスを最新化する。

**手順**:

```bash
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
```

> ⚠️ **P2/P27対策**: 仕様書に変更があれば必ず再生成を実行。セクションの追加だけでなく、削除・更新も再生成トリガー。

#### タスク2-5: Step 2 システム仕様更新

**目的**: IPC契約変更に伴うシステム仕様を更新する。

**手順**:

| #   | 更新対象                        | 更新内容                           |
| --- | ------------------------------- | ---------------------------------- |
| 1   | `interfaces-agent-sdk-skill.md` | 戻り値テーブルを実装実態へ同期     |
| 2   | `api-ipc-agent.md`              | 関連表を同期                       |
| 3   | `security-skill-ipc.md`         | 検証テーブルを同期（該当する場合） |
| 4   | `arch-electron-services.md`     | 関連表を同期（該当する場合）       |
| 5   | `task-workflow.md`              | 本タスク参照整合を維持             |

> ⚠️ **P26対策**: Phase 12完了時点でシステム仕様書を更新する。PRマージを待たない。
> ⚠️ **P43対策**: 仕様書更新は3ファイル以下/エージェントに分割する。

#### タスク2-6: Step 3 IPC契約検証【IPC修正タスクのため必須】

**目的**: IPC契約の整合性を検証する。

**手順**:

- [ ] `ipc-contract-checklist.md` Phase 1-6 を実施
- [ ] ハンドラ引数形式と Preload 側の呼び出し形式が一致
- [ ] 引数名のセマンティクスが実際の値と一致（P45対策）
- [ ] P42準拠3段バリデーション（型チェック → 空文字列 → トリム空文字列）

---

### Task 3: documentation-changelog.md【必須】

#### タスク3-1: 変更履歴作成

**目的**: 更新した全仕様書の変更内容を記録する。

**手順**:

1. 各Stepの完了結果を詳細に記録
2. `outputs/phase-12/documentation-changelog.md` に出力

> ⚠️ **P4対策**: **全Step確認前に「完了」と記載しない。** 全チェック項目を確認してから最後に記録する。

---

### Task 4: 未タスク検出【必須】

#### タスク4-1: 未タスク検出レポート

**目的**: 未タスクの検出と登録（0件でも必須）。

**手順**:

1. 実装中に発見した課題を収集
2. `outputs/phase-12/unassigned-task-report.md` を作成

検出した未タスクは**3ステップ全完了**が必要（P3/P38対策）:

| ステップ | 内容                                    | 必須 |
| -------- | --------------------------------------- | ---- |
| 1        | `unassigned-task/` に指示書作成         | ✅   |
| 2        | `task-workflow.md` 残課題テーブルに登録 | ✅   |
| 3        | 関連仕様書に参照リンク追加              | ✅   |

追加の更新:

- [ ] `unassigned-task-report.md` の件数・ステータス更新
- [ ] `artifacts.json` の Phase 12 ステータスを更新

---

### Task 5: スキルフィードバックレポート【必須】

#### タスク5-1: スキル改善検討

**目的**: ワークフロー改善点の記録（改善点なしでも必須 - P28対策）。

**手順**:

1. 本タスクの実行で得た知見を記録
2. タスク仕様書作成スキルの改善点を検討
3. `outputs/phase-12/skill-feedback-report.md` に出力

> ⚠️ **P28対策**: 改善点がなくても「改善点なし」としてレポートを作成する。

---

## SubAgent 分担

| SubAgent   | 担当                                                                |
| ---------- | ------------------------------------------------------------------- |
| SubAgent-A | Task 1（実装ガイド/IPCドキュメント作成）                            |
| SubAgent-B | Task 2（システム仕様書更新 Step 1-A〜Step 3）                       |
| SubAgent-C | Task 3-5（changelog / 未タスク検出 / フィードバック）+ 最終チェック |

## 統合テスト連携【必須】

本Phaseはドキュメント作成のため、統合テスト連携は実行対象外。
ただし、Phase 11で確認された統合テスト結果をドキュメントに反映する。

| テスト観点       | 確認内容                                 |
| ---------------- | ---------------------------------------- |
| IPC契約整合      | ハンドラ・Preload・テストの3箇所同時更新 |
| 戻り値形式       | 契約プロファイルへの準拠状況             |
| エラーレスポンス | サニタイズ済みエラーの形式統一           |

---

## Phase 12 必須チェックリスト【全項目確認してから完了とする】

### Task 1 チェック

- [ ] `implementation-guide.md` Part 1（中学生レベル・日常例え必須）が作成されている
- [ ] `implementation-guide.md` Part 2（技術詳細）が作成されている
- [ ] `ipc-documentation.md`（IPC契約変更詳細）が作成されている

### Task 2 チェック

- [ ] LOGS.md が **2ファイル両方** 更新されている（P1/P25対策）
- [ ] SKILL.md が **2ファイル両方** 更新されている（P29対策）
- [ ] 該当仕様書にタスク完了記録が追加されている
- [ ] `api-ipc-agent.md` の実装状況テーブルが確認・更新されている
- [ ] `grep -rn` で関連タスクテーブルが更新されている
- [ ] `topic-map.md` が再生成されている（P2/P27対策）
- [ ] `interfaces-agent-sdk-skill.md` 等のシステム仕様が更新されている（P26対策）
- [ ] IPC契約検証（`ipc-contract-checklist.md` Phase 1-6）が完了している

### Task 3 チェック

- [ ] `documentation-changelog.md` が作成されている
- [ ] 全Step確認後に「完了」が記載されている（P4対策）

### Task 4 チェック

- [ ] `unassigned-task-report.md` が作成されている（0件でも必須）
- [ ] 未タスクの3ステップが全て完了している（P3/P38対策）
- [ ] `unassigned-task-report.md` の件数・ステータスが更新されている
- [ ] `artifacts.json` の Phase 12 ステータスが更新されている

### Task 5 チェック

- [ ] `skill-feedback-report.md` が作成されている（P28対策）

---

## 完了条件

- [ ] Task 1（実装ガイド）: Part 1/Part 2/IPC ドキュメントが作成されている
- [ ] Task 2（システム仕様書更新）: Step 1-A〜1-D, Step 2, Step 3 が全て完了している
- [ ] Task 3（documentation-changelog）: 全Step完了後に記録されている
- [ ] Task 4（未タスク検出）: レポートが作成され、3ステップが完了している
- [ ] Task 5（スキルFB）: レポートが作成されている
- [ ] Phase 12 必須チェックリストが全て完了している
- [ ] **本Phase内の全タスクを100%実行完了**

---

## サブタスク管理

| #   | タスク                      | 必須 | ステータス |
| --- | --------------------------- | ---- | ---------- |
| 1-1 | Part 1 概念説明作成         | ✅   | 未実施     |
| 1-2 | Part 2 技術詳細作成         | ✅   | 未実施     |
| 1-3 | IPC ドキュメント作成        | ✅   | 未実施     |
| 2-1 | Step 1-A タスク完了記録     | ✅   | 未実施     |
| 2-2 | Step 1-B 実装状況テーブル   | ✅   | 未実施     |
| 2-3 | Step 1-C 関連タスクテーブル | ✅   | 未実施     |
| 2-4 | Step 1-D topic-map.md再生成 | ✅   | 未実施     |
| 2-5 | Step 2 システム仕様更新     | ✅   | 未実施     |
| 2-6 | Step 3 IPC契約検証          | ✅   | 未実施     |
| 3-1 | documentation-changelog作成 | ✅   | 未実施     |
| 4-1 | 未タスク検出レポート        | ✅   | 未実施     |
| 5-1 | スキルFBレポート            | ✅   | 未実施     |

---

## タスク100%実行確認【必須】チェックリスト

- [ ] タスク1-1（Part 1 概念説明）を実行した
- [ ] タスク1-2（Part 2 技術詳細）を実行した
- [ ] タスク1-3（IPC ドキュメント）を実行した
- [ ] タスク2-1（Step 1-A）を実行した — LOGS.md **2ファイル両方**を確認
- [ ] タスク2-2（Step 1-B）を実行した
- [ ] タスク2-3（Step 1-C）を実行した
- [ ] タスク2-4（Step 1-D）を実行した — topic-map.md 再生成を確認
- [ ] タスク2-5（Step 2）を実行した
- [ ] タスク2-6（Step 3）を実行した — IPC契約検証を確認
- [ ] タスク3-1（変更履歴）を実行した — 全Step確認後に「完了」記載
- [ ] タスク4-1（未タスク検出）を実行した — 3ステップ全完了を確認
- [ ] タスク5-1（スキルFB）を実行した

---

## Phase実行記録テンプレート

```markdown
## Phase 12 実行記録

### Task 1: 実装ガイド

- Part 1 作成: {{完了/未完了}}
- Part 2 作成: {{完了/未完了}}
- IPC ドキュメント作成: {{完了/未完了}}

### Task 2: システム仕様書更新

- Step 1-A LOGS.md (aiworkflow-requirements): {{完了/未完了}}
- Step 1-A LOGS.md (task-specification-creator): {{完了/未完了}}
- Step 1-A SKILL.md (aiworkflow-requirements): {{完了/未完了}}
- Step 1-A SKILL.md (task-specification-creator): {{完了/未完了}}
- Step 1-B 実装状況テーブル: {{完了/該当なし}}
- Step 1-C 関連タスクテーブル: {{完了/該当なし}}
- Step 1-D topic-map.md再生成: {{完了/未完了}}
- Step 2 システム仕様更新: {{完了/未完了}}
- Step 3 IPC契約検証: {{完了/未完了}}

### Task 3: documentation-changelog

- 変更履歴作成: {{完了/未完了}}
- 全Step確認後に「完了」記載: {{はい/いいえ}}

### Task 4: 未タスク検出

- 検出件数: {{N}}件
- 3ステップ完了: {{はい/いいえ}}
- artifacts.json更新: {{完了/未完了}}

### Task 5: スキルFB

- レポート作成: {{完了/未完了}}

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:
```

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] Phase 12 必須チェックリストが全て完了
- [ ] 全成果物が出力されている
- [ ] artifacts.json が更新されている

---

## 次のPhase

Phase 13: 完了処理（PR作成） → `phase-13-pr-creation.md`
