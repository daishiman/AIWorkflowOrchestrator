# skill-creator検証ゲート整合化（quick_validate実行経路統一 + 警告ノイズ制御） - タスク指示書

## メタ情報

| 項目         | 内容                                                                                |
| ------------ | ----------------------------------------------------------------------------------- |
| タスクID     | UT-IMP-SKILL-VALIDATION-GATE-ALIGNMENT-001                                          |
| タスク名     | skill-creator検証ゲート整合化（quick_validate実行経路統一 + 警告ノイズ制御）        |
| 分類         | 改善                                                                                |
| 対象機能     | task-specification-creator / aiworkflow-requirements / skill-creator 連携運用       |
| 優先度       | 中                                                                                  |
| 見積もり規模 | 中規模                                                                              |
| ステータス   | 未実施                                                                              |
| 発見元       | UT-IMP-AIWORKFLOW-SPEC-REFERENCE-SYNC-001 Phase 12 再監査（実装・検証時の苦戦箇所） |
| 発見日       | 2026-02-25                                                                          |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

Phase 12 再監査で `skill-creator` の検証コマンドを実行したところ、同じ「スキル検証」でも `quick_validate.py`（.codex配下）と `quick_validate.js`（repo配下）で実行経路・判定粒度が異なり、手順の判断コストが高かった。加えて `aiworkflow-requirements` は `quick_validate.js` で大量の参照リンク警告が継続発生し、実際の異常（Error）と運用ノイズ（Warning）が混在して読みづらい状態になっている。

### 1.2 問題点・課題

- 検証コマンドが複数経路（`.py` / `.js`）で、どちらを正とするか運用が曖昧
- `aiworkflow-requirements` で warning が常時多発し、真の失敗検出が埋もれる
- Phase 12 の手順書に「実行経路の優先順位」と「warningの扱い基準」が不足
- 仕様更新時に毎回同じ判断を人手で繰り返すため、再現性が低い

### 1.3 放置した場合の影響

- 将来の Phase 12 で検証結果の解釈が担当者依存になる
- warning見逃し/過剰対応の両方が発生し、工数が増える
- スキル品質ゲートの信頼性が下がり、仕様同期の抜け漏れを誘発する

---

## 2. 何を達成するか（What）

### 2.1 目的

`quick_validate` 実行経路と判定基準を統一し、Phase 12 で「同じ入力なら同じ判定」が出る運用を確立する。

### 2.2 最終ゴール

- 検証コマンドの正規経路（優先順）が `task-specification-creator` 側で明文化されている
- `aiworkflow-requirements` の warning運用基準（許容/要対応）がドキュメント化されている
- Phase 12 から一発で再利用できる検証手順（コマンド + 判定条件）が整備されている

### 2.3 スコープ

#### 含むもの

- 検証実行経路の統一ルール策定（`.js` / `.py` の優先順位・使い分け）
- warning運用ルールの整備（Error優先、warning分類、対応閾値）
- Phase 12 ガイドと spec-update-workflow への反映
- 必要に応じた `quick_validate.js` 仕様改善案の定義（大規模 reference スキル向け）

#### 含まないもの

- 全 warning の即時ゼロ化（大量の既存資産を含むため段階対応）
- `aiworkflow-requirements/references/*.md` の全面再編
- unrelated skill の構造変更

### 2.4 成果物

| 成果物                 | パス                                                                                                |
| ---------------------- | --------------------------------------------------------------------------------------------------- |
| 未タスク仕様書（本書） | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-skill-validation-gate-alignment-001.md` |
| 運用反映（残課題台帳） | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                |
| 実行ログ               | `.claude/skills/aiworkflow-requirements/LOGS.md`                                                    |
| 変更履歴               | `.claude/skills/aiworkflow-requirements/SKILL.md`                                                   |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `task-specification-creator` と `aiworkflow-requirements` の最新状態が取得済み
- `node` 実行環境が利用可能
- Phase 12 の検証フロー（`verify-unassigned-links`, `validate-phase-output`）が通ること

### 3.2 依存タスク

| タスクID                                  | 状態 | 依存種別                   |
| ----------------------------------------- | ---- | -------------------------- |
| UT-IMP-AIWORKFLOW-SPEC-REFERENCE-SYNC-001 | 完了 | 親タスク（苦戦箇所の源泉） |

### 3.3 必要な知識

- `skill-creator/scripts/quick_validate.js` の検証仕様
- Phase 12 の Step 1-G / Step 1-G-4（検証コマンド順序）
- `aiworkflow-requirements` における未タスク台帳の更新ルール

### 3.4 推奨アプローチ

1. まず現行フローで `.js` と `.py` の差分を棚卸しする
2. 次に「正規経路」「fallback経路」「warning運用」を3層で定義する
3. 最後に Phase 12 ガイドへ機械実行可能なコマンド列として固定化する

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                                      | 発見経緯                                                   | 解決策                                                            | 教訓                                 |
| --------------------------------------------------------- | ---------------------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------ |
| `quick_validate.py` と `quick_validate.js` の実行経路混在 | Phase 12 再監査で同名検証の入口が複数存在                  | 正規コマンドを `.js` 基準で定義し、`.py` は互換fallbackとして明記 | 同名ツールは「正本経路」を先に決める |
| `aiworkflow-requirements` の warning 大量出力             | `quick_validate.js` 実行時、referencesリンク警告が多数発生 | warning を「既知ノイズ/新規異常」に分類し、判定ルールを文書化     | Error と Warning を同列で扱わない    |
| 手順の都度判断で工数が増加                                | セッションごとに運用判断を再実施                           | Phase 12 の検証順序と合否判定をテンプレート化                     | 判断をテンプレート化すると再発が減る |
| スキル本体の行数制約と履歴蓄積の衝突                      | `task-specification-creator` で500行制約に抵触             | 履歴アーカイブ分離（changelog-archive）を標準パターン化           | 長寿命SKILLは履歴分離前提で設計する  |

---

## 4. 実行手順

### Phase構成

本タスクは Phase 1-2（分析・設計）+ Phase 12（運用仕様反映）を中心に実施する。

### Phase 1: 現状分析

#### 目的

検証経路と warning 発生源の現状を可視化する。

#### 手順

1. `quick_validate.js` と `.py` の実行結果・判定差分を比較
2. warningの種類（description / referencesリンク等）を分類
3. 既存ガイド（phase-11-12-guide / spec-update-workflow）との差分を抽出

#### 成果物

- 検証経路差分メモ
- warning分類表

#### 完了条件

- 差分と分類が第三者に説明できる形で記録されている

### Phase 2: 統一方針設計

#### 目的

実行経路・合否基準・warning運用を一貫した方針として定義する。

#### 手順

1. 正規経路（primary）と補助経路（fallback）を定義
2. warningの扱いを「許容」「要監視」「要対応」に区分
3. Phase 12 手順へ組み込むコマンド順序を設計

#### 成果物

- 検証運用方針（primary/fallback + 判定基準）

#### 完了条件

- 再実行時に担当者が迷わない手順になっている

### Phase 12: システム仕様反映

#### 目的

統一方針をシステム仕様へ反映し、再発防止を固定化する。

#### 手順

1. `task-specification-creator` の該当ガイドに実行経路ルールを追記
2. `aiworkflow-requirements` の関連仕様に運用ルールを反映
3. 検証コマンド実行とログ記録を実施

#### 成果物

- 更新済み仕様書
- 検証ログ

#### 完了条件

- `quick_validate` 実行経路が仕様書で一意に解釈できる
- Phase 12 再監査で同種の混乱が再現しない

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 検証実行経路（primary/fallback）が明文化されている
- [ ] warning運用ルール（許容/要監視/要対応）が明文化されている
- [ ] Phase 12 で再利用可能な検証コマンド列が定義されている

### 品質要件

- [ ] 既存ワークフローで検証手順を再実行し、結果が再現する
- [ ] `verify-unassigned-links` で参照切れが増えていない
- [ ] 新規ドキュメントが `unassigned-task` テンプレート見出しを満たす

### ドキュメント要件

- [ ] 本未タスク指示書に苦戦箇所（3.5）が記録されている
- [ ] `task-workflow.md` 残課題テーブルへ登録済み
- [ ] `SKILL.md` / `LOGS.md` に登録記録が反映済み

---

## 6. 検証方法

### テストケース

| テストケース                            | 期待結果                                   |
| --------------------------------------- | ------------------------------------------ |
| `quick_validate.js` 実行                | 実行可、結果形式が安定                     |
| `verify-unassigned-links.js` 実行       | `ALL_LINKS_EXIST`                          |
| `audit-unassigned-tasks.js --json` 実行 | 新規作成ファイルの見出し違反が増えていない |

### 検証手順

1. `node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/task-specification-creator` を実行
2. `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js` を実行
3. `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json` を実行し、違反件数の増加有無を確認

---

## 7. リスクと対策

| リスク                                           | 影響度 | 発生確率 | 対策                                                                        |
| ------------------------------------------------ | ------ | -------- | --------------------------------------------------------------------------- |
| warningゼロ化を目標化してスコープが肥大化する    | 中     | 中       | まずは運用基準の整備を先行し、warning解消は段階タスク化                     |
| `.py` / `.js` の両経路を同時改修して複雑化する   | 中     | 中       | primary/fallbackを固定し、一度に片方だけ正規化                              |
| 既存巨大スキルへの一括適用でレビュー負荷が増える | 低     | 中       | 変更対象を `task-specification-creator` と `aiworkflow-requirements` に限定 |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント                                                                         | 用途                           |
| ------------------------------------------------------------------------------------ | ------------------------------ |
| `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md` | 未タスク指示書フォーマット基準 |
| `.claude/skills/task-specification-creator/references/spec-update-workflow.md`       | Phase 12 検証コマンド運用      |
| `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`          | Step 1-G / 1-G-4 連携          |
| `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                 | 残課題台帳の登録先             |
| `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`               | 親タスクの苦戦箇所参照         |
| `.claude/skills/skill-creator/scripts/quick_validate.js`                             | 検証コマンド正本               |

### 参考資料

- `UT-IMP-AIWORKFLOW-SPEC-REFERENCE-SYNC-001` の Phase 12 成果物（再監査ログ）

---

## 9. 備考

### 補足事項

- 本タスクは「warningの完全除去」ではなく「検証運用の再現性向上」を主目的とする。
- warning削減を実施する場合は、影響範囲ごとに追加未タスクへ分割して管理する。
