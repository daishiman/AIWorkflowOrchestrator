# Phase 8: リファクタリング

## メタ情報

| 項目       | 値                                                             |
| ---------- | -------------------------------------------------------------- |
| Phase      | 8                                                              |
| Phase名    | リファクタリング                                               |
| タスクID   | TASK-SKILL-LIFECYCLE-05                                        |
| タスク名   | 作成済みスキルを使う主導線                                     |
| 機能名     | created-skill-usage-journey                                    |
| 前提Phase  | [phase-7-coverage-check.md](./phase-7-coverage-check.md)       |
| 後続Phase  | [phase-9-quality-assurance.md](./phase-9-quality-assurance.md) |
| ステータス | not_started                                                    |
| 作成日     | 2026-03-15                                                     |

## 目的

本タスクは「設計タイプ」のため、Phase 8 のリファクタリング対象は設計文書そのものである。Phase 1-7 で作成した設計文書群（要件定義・設計・レビュー・テスト設計・実装設計・テスト拡充設計・カバレッジ設計）を対象として、以下の4点を改善する。

1. 設計文書間で用語が統一されていない箇所を修正する
2. 複数のPhase文書に分散・重複している仕様を一元化する
3. 3シナリオで共通するステップを抽出して統合フローを簡潔に表現する
4. 参照資料リンクの形式を相対パスに統一する

## 実行タスク

- タスク1: 設計文書間の用語統一（ScoringGate / ScoreDisplay 等の呼称統一）
- タスク2: コンポーネント仕様の重複排除（分散した仕様の一元化）
- タスク3: 画面遷移フローの簡素化（3シナリオの共通ステップ抽出・統合）
- タスク4: 参照資料リンクの正規化（相対パス / 絶対パスの統一）

## 参照資料

| 参照資料           | パス                                                     | 説明                                     |
| ------------------ | -------------------------------------------------------- | ---------------------------------------- |
| Phase 1 要件定義   | [phase-1-requirements.md](./phase-1-requirements.md)     | 用語の初出箇所・正式表記の基準           |
| Phase 2 設計       | [phase-2-design.md](./phase-2-design.md)                 | コンポーネント仕様・状態管理・IPC設計    |
| Phase 3 レビュー   | [phase-3-design-review.md](./phase-3-design-review.md)   | 指摘事項・用語揺れの検出結果             |
| Phase 4 テスト設計 | [phase-4-test-creation.md](./phase-4-test-creation.md)   | テストで使用する用語・型名               |
| Phase 5 実装設計   | [phase-5-implementation.md](./phase-5-implementation.md) | 実装で使用するコンポーネント名・型名     |
| Phase 6 テスト拡充 | [phase-6-test-expansion.md](./phase-6-test-expansion.md) | カバレッジ補完で追加したテスト設計       |
| Phase 7 カバレッジ | [phase-7-coverage-check.md](./phase-7-coverage-check.md) | カバレッジ確認結果・リファクタリング候補 |

### システム仕様（aiworkflow-requirements）

| 参照資料                   | パス                                                                              | 内容                           |
| -------------------------- | --------------------------------------------------------------------------------- | ------------------------------ |
| ui-ux-feature-components   | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`   | コンポーネント正式名称の基準   |
| interfaces-agent-sdk-skill | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | 型名・インターフェース正式名称 |
| arch-state-management      | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`      | Store / Slice の正式名称       |

## 実行手順

### ステップ1: 用語統一（タスク1）

Phase 1-7 の全設計文書を対象として、下記の用語揺れを特定し、正式表記に統一する。

#### 用語統一テーブル

| 揺れのある表記例                                               | 正式表記                     | 根拠文書                                   |
| -------------------------------------------------------------- | ---------------------------- | ------------------------------------------ |
| ScoringGate / scoringGate / scoring-gate / Gate                | `ScoringGate`                | Phase 2 ステップ3 + Task04スコアモデル     |
| ScoreDisplay / scoreDisplay / score-display / Score表示        | `ScoreDisplay`               | Phase 2 ステップ3コンポーネント配置表      |
| ScoreGateBadge / ScoreBadge / GateBadge / バッジ               | `ScoreGateBadge`             | Phase 2 ステップ3 新規コンポーネント定義   |
| ScoreDelta / スコア変化 / delta / Δスコア                      | `ScoreDelta`                 | Phase 2 ステップ3コンポーネント配置表      |
| ScoringGateBanner / GateBanner / 品質バナー                    | `ScoringGateBanner`          | Phase 2 ステップ1 CTA仕様テーブル          |
| PostExecutionActionBar / 実行後アクションバー / ActionBar      | `PostExecutionActionBar`     | Phase 2 ステップ5 コンポーネントツリー     |
| SkillDetailPanel / スキル詳細 / DetailPanel                    | `SkillDetailPanel`           | Phase 2 ステップ2 スキル詳細パネル         |
| USE_ALLOWED / use_allowed / 利用可能                           | `USE_ALLOWED`                | Task04 ScoringGate型定義                   |
| NEEDS_IMPROVEMENT / needs_improvement / 改善必須               | `NEEDS_IMPROVEMENT`          | Task04 ScoringGate型定義                   |
| SAVE_ALLOWED / save_allowed / 保存可能                         | `SAVE_ALLOWED`               | Task04 ScoringGate型定義                   |
| RECOMMENDED / recommended / 推奨                               | `RECOMMENDED`                | Task04 ScoringGate型定義                   |
| EP-1 / ep-1 / 作成後採点 / 初回評価                            | `EP-1`                       | Phase 1 ステップ1 シナリオA                |
| EP-2 / ep-2 / 改善後採点 / 再採点                              | `EP-2`                       | Phase 1 ステップ4 改善フィードバックループ |
| EP-3 / ep-3 / 利用前評価 / 使用前チェック                      | `EP-3`                       | Phase 1 ステップ5 品質表示テーブル         |
| EP-4 / ep-4 / 利用後再評価 / 実行後評価                        | `EP-4`                       | Phase 1 ステップ4 改善フィードバックループ |
| favoriteSkillNames / favorites / お気に入り一覧                | `favoriteSkillNames`         | Phase 2 ステップ5 状態管理設計             |
| recentlyUsedSkills / recentSkills / 最近使ったスキル一覧       | `recentlyUsedSkills`         | Phase 2 ステップ5 状態管理設計             |
| lastExecutionResult / executionResult / 実行結果               | `lastExecutionResult`        | Phase 2 ステップ5 状態管理設計             |
| postExecutionScore / executionScore / 利用後スコア             | `postExecutionScore`         | Phase 2 ステップ5 状態管理設計             |
| Workspace → Agent二段構成 / Workspace/Agent二重導線 / 二段遷移 | `Workspace → Agent 二段構成` | Phase 1 ステップ2 主利用導線方針           |

#### 用語統一の実施手順

1. 各Phase文書を開き、上記テーブルの「揺れのある表記例」に該当する語を検索する
2. 正式表記に置換する
3. コードブロック内の型名・変数名は正式表記に統一し、コメントや説明文も統一する
4. 置換後に文意が通るか確認する（日本語説明文内では括弧書きで正式表記を補足可）

---

### ステップ2: コンポーネント仕様の重複排除（タスク2）

Phase 2 の設計では、`ScoreGateBadge` の仕様が複数箇所に分散している。また、`SkillCard` の仕様もステップ2と参照資料の両方に記載が存在する場合がある。重複を排除し、仕様の一元管理箇所を明確にする。

#### 重複仕様の特定と一元化先テーブル

| コンポーネント           | 現在の記載箇所                                                 | 一元化先                                            | 重複削除箇所                      |
| ------------------------ | -------------------------------------------------------------- | --------------------------------------------------- | --------------------------------- |
| `ScoreGateBadge`         | Phase 2 ステップ3（型定義）+ ステップ5（コンポーネントツリー） | Phase 2 ステップ3（型定義を正本とする）             | ステップ5では名称参照のみに簡略化 |
| `SkillCard`              | Phase 2 ステップ2（仕様テーブル）+ ステップ5（ツリー）         | Phase 2 ステップ2（仕様テーブルを正本とする）       | ステップ5では名称参照のみに簡略化 |
| `SkillDetailPanel`       | Phase 2 ステップ2（セクションテーブル）+ ステップ5（ツリー）   | Phase 2 ステップ2（セクションテーブルを正本とする） | ステップ5では名称参照のみに簡略化 |
| `PostExecutionActionBar` | Phase 2 ステップ4（アクションテーブル）+ ステップ5（ツリー）   | Phase 2 ステップ4（アクションテーブルを正本とする） | ステップ5では名称参照のみに簡略化 |
| CTA仕様テーブル          | Phase 2 ステップ1 + Phase 3 ステップ1突合マトリクス            | Phase 2 ステップ1（CTA仕様テーブルを正本とする）    | Phase 3では突合結果のみ記載       |

#### 重複排除の実施手順

1. 一元化先の正本箇所を確認し、仕様が完全かチェックする
2. 重複削除箇所では、正本への参照リンクを添えた1行説明に置き換える
   - 例: `ScoreGateBadge の仕様は [Phase 2 ステップ3](./phase-2-design.md#ステップ3-品質表示の埋め込み設計) を参照`
3. 型定義のコードブロックはステップ3のみに残し、他のステップでは型名のみ記載する

---

### ステップ3: 画面遷移フローの簡素化（タスク3）

Phase 2 のシナリオA（作成直後）、シナリオB（あとから）、シナリオC（履歴から）は、それぞれ独立したフロー図を持つが、「Agent で実行 → 結果確認 → 改善/再実行/完了」の部分が共通している。この共通ステップを抽出して統合フローとして定義し、各シナリオのフロー図を簡潔にする。

#### 共通フロー（全シナリオ共通の末尾部分）

```
[共通: Agent 実行フロー]
    |
    v
Agent で実行開始
    |
    v
実行完了 → ExecutionResultSummary 表示
    |
    +--- ScoreDisplay (compact) + ScoreDelta 表示（EP-4 任意）
    |
    +--- PostExecutionActionBar
         ├── もう一度使う → Agent 再実行（共通フロー先頭に戻る）
         ├── 改善する → SkillAnalysisView (Task03 改善フロー)
         ├── 完了 → 履歴に記録
         └── terminal で続ける → Terminal Dock
```

#### 簡素化後のシナリオフロー表現

| シナリオ  | 固有部分（開始〜Agent到達まで）                                                        | 共通部分                   |
| --------- | -------------------------------------------------------------------------------------- | -------------------------- |
| シナリオA | EP-1完了 → CTA（gate別） → Workspace（文脈準備 + スキル自動選択） → Agent              | [共通: Agent実行フロー] へ |
| シナリオB | Skill Center → SkillCard クリック → SkillDetailPanel → 「使う」CTA → Workspace → Agent | [共通: Agent実行フロー] へ |
| シナリオC | Agent 履歴タブ → 履歴エントリ選択 → パラメータ確認/変更 → Agent                        | [共通: Agent実行フロー] へ |

#### 簡素化の実施手順

1. Phase 2 ステップ1のシナリオAフロー図に共通部分の参照を追加する
2. Phase 2 に「共通フロー」セクションを新設し、上記フロー定義を移動する
3. 各シナリオの既存フロー図の末尾部分を「→ [共通: Agent実行フロー] へ」に置き換える
4. Phase 4（テスト設計）・Phase 5（実装設計）の該当箇所も同様に参照方式に更新する

---

### ステップ4: 参照資料リンクの正規化（タスク4）

Phase 1-7 の設計文書では、参照資料テーブルのパス形式が混在している（相対パス・絶対パス・markdown リンク・プレーンテキスト）。下記ルールに従って正規化する。

#### 正規化ルール

| リンク対象                                             | 形式                                         | 例                                                                                      |
| ------------------------------------------------------ | -------------------------------------------- | --------------------------------------------------------------------------------------- |
| 同ディレクトリ内の別Phaseファイル                      | 相対パス markdown リンク                     | `[phase-2-design.md](./phase-2-design.md)`                                              |
| 同タスクディレクトリ内の outputs ファイル              | 相対パス markdown リンク                     | `[screen-transition-design.md](./outputs/phase-2/screen-transition-design.md)`          |
| 別タスク（completed-tasks）の成果物                    | 相対パス（`../../../` 起点）プレーンテキスト | `../../../completed-tasks/step-01-seq-task-01-lifecycle-journey-foundation/outputs/...` |
| システム仕様（.claude/skills/aiworkflow-requirements） | プレーンテキスト（絶対化しない）             | `.claude/skills/aiworkflow-requirements/references/ui-ux-agent-execution.md`            |
| プロジェクトルート配下のソースファイル                 | プレーンテキスト（絶対化しない）             | `apps/desktop/src/renderer/views/AgentView/index.tsx`                                   |

#### 正規化の実施手順

1. 各Phase文書の「参照資料」テーブルを開き、「パス」列のリンク形式を確認する
2. 同ディレクトリ内ファイルで markdown リンクが使われていない箇所を修正する
3. 絶対パス（`/Users/...` で始まる）が使われている箇所を相対パスに変更する
4. 参照先ファイルが実在するかを `outputs/` ディレクトリの存在確認で検証する（存在しない場合は `※ 未作成（Phase N実行後に生成予定）` と注記する）

## 統合テスト連携

| 観点         | 連携内容                                                                                       |
| ------------ | ---------------------------------------------------------------------------------------------- |
| 用語統一     | 本Phaseで統一した語彙を Phase 9 曖昧表現チェックと型名整合チェックの辞書として利用する         |
| 重複排除     | 一元化した仕様参照先を Phase 10 最終レビュー時の「参照切れゼロ」判定基準へ反映する             |
| フロー簡素化 | 共通化した実行フローを Phase 11 walkthrough シナリオの観察順序に合わせ、証跡取得手順を短縮する |
| リンク正規化 | 相対パス化ルールを Phase 13 のコミット前チェック（内部リンク整合性確認）へ接続する             |

## 成果物

| 成果物                          | パス                                                     | 説明                                   |
| ------------------------------- | -------------------------------------------------------- | -------------------------------------- |
| 用語統一適用レポート            | `outputs/phase-8/terminology-unification.md`             | 用語揺れの一覧・修正前後の対応表       |
| 重複排除適用レポート            | `outputs/phase-8/duplication-removal.md`                 | 削除した重複仕様の一覧・一元化先の記録 |
| 共通フロー定義                  | `outputs/phase-8/common-execution-flow.md`               | Agent実行フローの共通部分の正本定義    |
| リンク正規化チェックリスト      | `outputs/phase-8/link-normalization-checklist.md`        | 各Phase文書のリンク形式修正結果        |
| リファクタリング済みPhase文書群 | `phase-1-requirements.md` 〜 `phase-7-coverage-check.md` | 上記4タスクを適用した更新済み文書      |

## 完了条件

- [ ] 用語統一テーブルの全項目（20語）について、Phase 1-7 の全設計文書内の表記が正式表記に統一されている
- [ ] コンポーネント仕様の重複が排除されており、各コンポーネントの正本参照箇所が1箇所に集約されている
- [ ] Phase 2 に「共通: Agent実行フロー」セクションが新設されており、3シナリオのフロー図が共通部分を参照する形式になっている
- [ ] Phase 1-7 の全参照資料テーブルで、同ディレクトリ内ファイルが markdown 相対リンク形式で記載されている
- [ ] 未作成の outputs ファイルへのリンクに `※ 未作成（Phase N実行後に生成予定）` の注記がある
- [ ] リファクタリング適用後に文意が通ることを目視確認している
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

- [ ] 参照資料確認（Phase 1-7 全設計文書）
- [ ] タスク1: 用語統一（20語の検索・置換・確認）
- [ ] タスク2: コンポーネント仕様重複排除（5コンポーネント）
- [ ] タスク3: 画面遷移フロー簡素化（共通フロー抽出・3シナリオ更新）
- [ ] タスク4: 参照資料リンク正規化（Phase 1-7 全文書）
- [ ] 成果物作成（outputs/phase-8/ 配下の4ファイル）
- [ ] 完了条件検証

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json の Phase 8 ステータスが更新されている

## 次のPhase

Phase 9: [phase-9-quality-assurance.md](./phase-9-quality-assurance.md)
