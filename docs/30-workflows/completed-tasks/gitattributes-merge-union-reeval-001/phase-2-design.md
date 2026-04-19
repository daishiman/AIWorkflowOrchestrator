# Phase 2: 設計

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 2                                         |
| タスクID   | TASK-GITATTRIBUTES-MERGE-UNION-REEVAL-001 |
| 機能名     | gitattributes-merge-union-reeval          |
| 前提Phase  | Phase 1                                   |
| 後続Phase  | Phase 3                                   |
| 作成日     | 2026-04-19                                |
| ステータス | completed                                 |

## 目的

Phase 1 で確定した分類インベントリを基に、`.gitattributes` の glob 精緻化方針、マージ戦略選定基準、ドライバー設定戦略、既存コンポーネント再利用方針を設計し、Phase 3 のレビュー対象パッチ案として固定する。

## 背景

`.gitattributes` の現行パターンは `references/*.md` をまとめて `merge=union` 指定するため、構造化ドキュメントを巻き込んでしまう。一方で append-only ファイルでは `merge=union` の効果が大きいため、戦略を切り替える単純な置換ではなく「どの glob にどのドライバーを当てるか」を設計の中心に据える必要がある。また、`merge=ours` は Git 標準ではなくカスタムドライバーであり、`setup-merge-drivers.sh` を経由しないと未登録状態でマージが失敗するため、ドライバー設定戦略も同 Phase で確定する。

## 実行タスク

### タスク0: 既存 `.gitattributes` パターンの依存関係分析

**目的**: 現行パターンが影響するファイル群と想定マージ挙動を可視化する。

**実行手順**:

1. 現行パターン（current pattern）を列挙する。
2. 各パターンが対象とする実ファイル（影響ファイル）を Phase 1 のインベントリから引き当てる。
3. パターンごとに想定マージ挙動（行連結 / カスタムドライバー / デフォルト3-way）を3列で対照する。

**期待される成果物**:

- `outputs/phase-2/merge-strategy-design.md`

### タスク1: マージ戦略選定基準の設計

**目的**: `merge=union` / `merge=ours`（カスタム）/ デフォルト の使い分けルールを文章化する。

**実行手順**:

1. `merge=union` の適用条件を「末尾追記が支配的で行順序が意味を持たないファイル」と定義する。
2. `merge=ours`（カスタム）の適用条件を「自ブランチ側の状態を常に正とすべきファイル」と定義する。
3. デフォルト3-way の適用条件を「構造化されており、衝突は人手解決すべきファイル」と定義する。
4. 判断順序（まず append-only か → 次にカスタム ours が必要か → それ以外はデフォルト）を明記する。

**期待される成果物**:

- `outputs/phase-2/merge-strategy-design.md`

### タスク2: `.gitattributes` 修正パッチ案の作成

**目的**: before/after 差分と選択肢のトレードオフを設計する。

**実行手順**:

1. before（現行）/ after（候補）の差分を提示する。
2. 選択肢A: glob を細分割し、append-only と構造化を別パターンに分けて指定する案を整理する。
3. 選択肢B: glob は粗いまま、コメント注釈で運用上の意味を補強する案を整理する。
4. 評価軸（誤適用リスク / 可読性 / 追加ファイル時の事故率）で A/B を比較し、推奨案を選定する。

**期待される成果物**:

- `outputs/phase-2/gitattributes-patch-proposal.md`

### タスク3: ドライバー設定戦略の決定

**目的**: `setup-merge-drivers.sh` の実行タイミング方針を確定する。

**実行手順**:

1. 自動化案: `session-init.sh` から `setup-merge-drivers.sh` を呼び出す案を整理する。
2. 現状維持案: 手動実行のままとし、README / `references/` ドキュメントで明示する案を整理する。
3. 判断軸（実行コスト / 副作用 / 既存セッションへの影響）を提示する。
4. 本タスクでは「現状維持＋ドキュメント化」を推奨案として明記する。

**期待される成果物**:

- `outputs/phase-2/driver-setup-strategy.md`

### タスク4: 既存コンポーネント再利用可否の確認

**目的**: [FB-SDK-07-1] 対応として、新規スクリプトを作らず既存資産を再利用することを確定する。

**実行手順**:

1. `setup-merge-drivers.sh` を再利用対象として明示する。
2. 新規スクリプト・新規フックを作成しないことを明記する。
3. 変更対象を `.gitattributes` と必要最小限のドキュメントに限定する。

**期待される成果物**:

- `outputs/phase-2/driver-setup-strategy.md`

## 参照資料

| 参照資料              | パス                                                                             | 内容                       |
| --------------------- | -------------------------------------------------------------------------------- | -------------------------- |
| Phase 1 要件          | `docs/30-workflows/gitattributes-merge-union-reeval-001/phase-1-requirements.md` | scope / AC / 分類方針      |
| 分類インベントリ      | `outputs/phase-1/file-classification-inventory.md`                               | 分類根拠                   |
| `.gitattributes` 現状 | `.gitattributes`                                                                 | 既存パターン               |
| マージドライバ登録    | `.claude/scripts/setup-merge-drivers.sh`                                         | `merge.ours.driver` の登録 |
| 解決策設計書          | `docs/30-workflows/00-task-spec-design-docs/phase-2-solution.md`                 | 戦略選定の根拠             |
| 既完了タスク          | TASK-CONFLICT-PREVENT-001                                                        | 競合予防方針との整合       |

## 成果物

| 成果物                    | パス                                              | 内容                           |
| ------------------------- | ------------------------------------------------- | ------------------------------ |
| マージ戦略設計            | `outputs/phase-2/merge-strategy-design.md`        | 依存分析と選定基準             |
| `.gitattributes` パッチ案 | `outputs/phase-2/gitattributes-patch-proposal.md` | before/after 差分と A/B 評価   |
| ドライバー設定戦略        | `outputs/phase-2/driver-setup-strategy.md`        | 実行タイミング方針と再利用方針 |

## 統合テスト連携【必須】

| 判定項目                                           | 基準 | 結果    |
| -------------------------------------------------- | ---- | ------- |
| 現行パターン依存関係が3列で整理されている          | 完了 | pending |
| 戦略選定基準が判断順序付きで定義されている         | 完了 | pending |
| `.gitattributes` パッチ案で A/B 評価が完了している | 完了 | pending |
| ドライバー設定戦略が現状維持＋ドキュメント化で確定 | 完了 | pending |
| 新規スクリプト不要が明記されている                 | 完了 | pending |

## 完了条件

- [ ] 現行 `.gitattributes` の依存関係を分析している
- [ ] マージ戦略選定基準を文章化している
- [ ] `.gitattributes` 修正パッチ案を A/B 比較で提示している
- [ ] ドライバー設定戦略を確定している
- [ ] 既存コンポーネント再利用方針を明記している
