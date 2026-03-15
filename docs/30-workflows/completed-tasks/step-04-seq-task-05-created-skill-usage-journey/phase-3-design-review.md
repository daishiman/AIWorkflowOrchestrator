# Phase 3: 設計レビュー

## メタ情報

| 項目       | 値                                                     |
| ---------- | ------------------------------------------------------ |
| Phase      | 3                                                      |
| Phase名    | 設計レビュー                                           |
| タスクID   | TASK-SKILL-LIFECYCLE-05                                |
| タスク名   | 作成済みスキルを使う主導線                             |
| 機能名     | created-skill-usage-journey                            |
| 前提Phase  | [phase-2-design.md](./phase-2-design.md)               |
| 後続Phase  | [phase-4-test-creation.md](./phase-4-test-creation.md) |
| ステータス | not_started                                            |
| 作成日     | 2026-03-15                                             |

## 目的

Phase 1（要件定義）と Phase 2（設計）の妥当性を多角的に検証し、Phase 4 以降に進むべきか判定する。特に Task01-04 の依存契約との整合性、UI/UX の一貫性、IPC 再利用の安全性を重点的に確認する。

## 実行タスク

- タスク1: Phase 1 要件と Phase 2 設計の突合検証（全要件が設計に反映されているか）
- タスク2: Task01-04 依存契約との整合性検証
- タスク3: UI/UX 設計の多角的レビュー
- タスク4: IPC連携・状態管理設計の技術妥当性レビュー
- タスク5: ゲート判定と指摘事項の記録

## 参照資料

| 参照資料            | パス                                                                                                                         | 説明                                        |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| Phase 1 要件定義    | [phase-1-requirements.md](./phase-1-requirements.md)                                                                         | 3シナリオ・導線比較・品質要件               |
| Phase 2 設計        | [phase-2-design.md](./phase-2-design.md)                                                                                     | 画面遷移・コンポーネント・状態管理・IPC設計 |
| Task01 画面責務     | `../../../completed-tasks/step-01-seq-task-01-lifecycle-journey-foundation/outputs/phase-2/surface-responsibility-matrix.md` | 画面別責務・禁止事項                        |
| Task01 依存契約     | `../../../completed-tasks/step-01-seq-task-01-lifecycle-journey-foundation/outputs/phase-2/dependency-contracts.md`          | Task05への入力・出力・禁止事項              |
| Task04 ゲート遷移   | `../../../completed-tasks/step-03-seq-task-04-evaluation-and-scoring-gate/outputs/phase-2/gate-transition-design.md`         | EP-3/EP-4フロー                             |
| Task04 スコアモデル | `../../../completed-tasks/step-03-seq-task-04-evaluation-and-scoring-gate/outputs/phase-2/scoring-gate-matrix.md`            | ScoringGate型定義                           |
| UI/UX Realization   | `../../ui-ux-realization.md`                                                                                                 | 導線・CTA契約正本                           |

### システム仕様（aiworkflow-requirements）

| 参照資料                   | パス                                                                              | 内容                   |
| -------------------------- | --------------------------------------------------------------------------------- | ---------------------- |
| ui-ux-agent-execution      | `.claude/skills/aiworkflow-requirements/references/ui-ux-agent-execution.md`      | Agent実行画面導線      |
| ui-ux-navigation           | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`           | ナビゲーション正本     |
| ui-ux-feature-components   | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`   | 画面コンポーネント仕様 |
| interfaces-agent-sdk-skill | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | スキルインターフェース |
| arch-state-management      | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`      | Store設計              |

## 実行手順

### ステップ1: 要件-設計突合マトリクス

Phase 1 の全要件が Phase 2 の設計に反映されているかを突合検証する。

| Phase 1 要件                                 | Phase 2 設計箇所                        | 突合結果 |
| -------------------------------------------- | --------------------------------------- | -------- |
| シナリオA: 作成直後に使う                    | ステップ1: CTA遷移フロー                | 未検証   |
| シナリオB: あとから使う                      | ステップ2: Skill Center一覧             | 未検証   |
| シナリオC: 履歴から再利用                    | ステップ2: 履歴エントリ                 | 未検証   |
| 主利用導線: Workspace→Agent二段構成          | ステップ1: 画面遷移フロー               | 未検証   |
| 発見導線: 一覧/検索/おすすめ/履歴/お気に入り | ステップ2: SkillCenter レイアウト       | 未検証   |
| 改善フィードバックループ                     | ステップ4: 改善戻りショートカット       | 未検証   |
| 品質表示 7地点                               | ステップ3: 品質コンポーネント配置表     | 未検証   |
| EP-3 利用前評価                              | ステップ6: IPC連携                      | 未検証   |
| EP-4 利用後再評価                            | ステップ6: IPC連携 + ステップ4 改善戻り | 未検証   |
| 仕様抽出マップ全項目                         | 各ステップの参照資料テーブル            | 未検証   |

### ステップ2: Task01-04 依存契約の突合

#### Task01 依存契約チェック

| 契約項目                                                 | Phase 2 対応                                     | 適合   |
| -------------------------------------------------------- | ------------------------------------------------ | ------ |
| 入力: Phase 11/12 の証跡要件を参照する                   | Phase 11/12 で手動テスト・ドキュメントの証跡生成 | 未検証 |
| 出力: 履歴データとフィードバック情報                     | agentSlice.lastExecutionResult + 履歴記録        | 未検証 |
| 禁止: settings例外の一般化をしない                       | 設計に settings バイパスが含まれていないこと     | 未検証 |
| Workspace: 文脈準備（Primary）                           | Workspace経由で文脈統合後にAgentへ遷移           | 未検証 |
| Workspace: 探索一覧・最終実行判断を含まない（Forbidden） | Skill Center で発見、Agent で実行                | 未検証 |
| Agent: 実行・履歴確認・改善判断（Primary）               | PostExecutionActionBar で3動作提供               | 未検証 |
| Agent: 探索一覧・作成本体を含まない（Forbidden）         | Skill Center / Skill Creator に分離              | 未検証 |

#### Task04 契約チェック

| 契約項目                                          | Phase 2 対応                           | 適合   |
| ------------------------------------------------- | -------------------------------------- | ------ |
| EP-3 I/O: skillName → ScoringGateResult           | IPC `skill:optimize:evaluate` 再利用   | 未検証 |
| EP-4 I/O: executionResult → PromptEvaluation      | IPC `skill:optimize:evaluate` 再利用   | 未検証 |
| ScoringGate 4段階の CTA 制御                      | CTA仕様テーブルで4段階定義             | 未検証 |
| ScoreDisplay / ScoreDelta の表示                  | 品質コンポーネント配置表で全地点定義   | 未検証 |
| ゲート遷移が非ブロッキングであること（EP-3/EP-4） | EP-3はバナー表示のみ、EP-4は任意再評価 | 未検証 |

### ステップ3: UI/UX 多角的レビュー

以下の観点でレビューを実施する。

#### 3-1: CTA の視認性と一貫性

| チェック項目                                            | 判定   |
| ------------------------------------------------------- | ------ |
| 「今すぐ使う」CTA が作成直後画面で最も目立つか          | 未検証 |
| CTA ラベルが動詞始まりで統一されているか                | 未検証 |
| Primary/Secondary/Warning のスタイル階層が明確か        | 未検証 |
| ScoringGate `NEEDS_IMPROVEMENT` でCTA無効化が機能するか | 未検証 |

#### 3-2: 再利用入口の発見可能性

| チェック項目                                                               | 判定   |
| -------------------------------------------------------------------------- | ------ |
| Skill Center に「おすすめ」「最近使った」「保存済み」の3セクションがあるか | 未検証 |
| SkillCard のクリックで詳細パネルが開き、CTAに到達できるか                  | 未検証 |
| 検索バーがスキル名・説明・タグの3要素で検索可能か                          | 未検証 |
| Agent 履歴タブから過去の実行を再実行できるか                               | 未検証 |

#### 3-3: 改善戻りの自然さ

| チェック項目                                                                  | 判定   |
| ----------------------------------------------------------------------------- | ------ |
| Agent 実行結果画面に「改善する」CTAが表示されるか                             | 未検証 |
| 改善CTA クリック時に skillName + 実行結果 がコンテキストとして渡されるか      | 未検証 |
| 改善後の再評価（EP-2）→ 再利用導線への戻りパスがあるか                        | 未検証 |
| 改善フローが Skill Creator / SkillAnalysisView のどちらで開始されるかが明確か | 未検証 |

#### 3-4: アクセシビリティ（WCAG 2.1 AA）

| チェック項目                                                       | 判定   |
| ------------------------------------------------------------------ | ------ |
| ScoreGateBadge が色 + ラベル + アイコンの3重表現か                 | 未検証 |
| SkillCard のキーボードフォーカスが可能か                           | 未検証 |
| CTA のフォーカス状態が視覚的に識別可能か                           | 未検証 |
| スコア数値がスクリーンリーダーで読み上げ可能な ARIA ラベルを持つか | 未検証 |

#### 3-5: Apple HIG 準拠

| チェック項目                                                 | 判定   |
| ------------------------------------------------------------ | ------ |
| SkillCard の角丸が 8-12px 範囲か                             | 未検証 |
| 8px グリッドのスペーシング統一                               | 未検証 |
| ライト/ダークモードで Apple System Colors を使用しているか   | 未検証 |
| 操作フィードバック（ホバー / アクティブ状態）が全CTAにあるか | 未検証 |

### ステップ4: 技術妥当性レビュー

#### 4-1: IPC連携

| チェック項目                                                                      | 判定   |
| --------------------------------------------------------------------------------- | ------ |
| `skill:optimize:evaluate` の既存引数型がEP-3/EP-4に対応できるか                   | 未検証 |
| EP-3（利用前）とEP-4（利用後）の呼び出しを区別する手段があるか                    | 未検証 |
| お気に入り管理が Zustand persist で完結し新規IPC不要か                            | 未検証 |
| P42準拠: 全IPC引数に3段バリデーション（型 → 空文字列 → trim空文字列）設計があるか | 未検証 |
| P44/P45準拠: 引数名がセマンティクスに一致しているか                               | 未検証 |

#### 4-2: 状態管理

| チェック項目                                                                         | 判定   |
| ------------------------------------------------------------------------------------ | ------ |
| `favoriteSkillNames: Set<string>` が Zustand persist の customStorage 対応か         | 未検証 |
| `recentlyUsedSkills` 配列の個別セレクタに useShallow が適用されているか（P48）       | 未検証 |
| `lastExecutionResult` と `postExecutionScore` のリセットタイミングが定義されているか | 未検証 |
| 合成 Hook（useXxxStore()）を使用していないか（P31）                                  | 未検証 |
| skillSlice と agentSlice にまたがる状態参照がないか                                  | 未検証 |

#### 4-3: コンポーネント設計

| チェック項目                                               | 判定   |
| ---------------------------------------------------------- | ------ |
| ScoreGateBadge が Atomic Design の atoms レベルか          | 未検証 |
| SkillCard が molecules レベルで適切か                      | 未検証 |
| PostExecutionActionBar が organisms レベルで適切か         | 未検証 |
| P46準拠: HTMLAttributes との Props 衝突がないか            | 未検証 |
| P47準拠: CSS変数ベーススタイルの Record 定数がテスタブルか | 未検証 |

### ステップ5: ゲート判定

#### 判定基準

| 判定              | 条件                                                   | 対応                  |
| ----------------- | ------------------------------------------------------ | --------------------- |
| PASS              | MAJOR 指摘 0 件、MINOR 指摘 3 件以下                   | Phase 4 へ            |
| MINOR             | MAJOR 指摘 0 件、MINOR 指摘 4 件以上                   | 指摘対応後 Phase 4 へ |
| MAJOR（要件問題） | 3シナリオの定義漏れ、依存契約違反                      | Phase 1 へ戻る        |
| MAJOR（設計問題） | 画面遷移の矛盾、IPC型不整合、状態管理設計のP31/P48違反 | Phase 2 へ戻る        |

#### MAJOR 判定チェックリスト

- [ ] 3シナリオ（作成直後 / あとから / 履歴から）全てに画面遷移フローが定義されている
- [ ] Task01 依存契約の禁止事項（settings例外一般化、Workspace探索一覧、Agent作成本体）に違反していない
- [ ] Task04 契約の EP-3/EP-4 I/O 仕様と IPC 設計が整合している
- [ ] ScoringGate 4段階全てに CTA の表示条件が定義されている
- [ ] 状態管理が P31/P48 に準拠した個別セレクタ設計になっている
- [ ] Workspace → Agent の二段構成が ui-ux-realization.md と矛盾しない

#### 指摘記録テンプレート

```markdown
### 指摘 #N

| 項目     | 内容                                                    |
| -------- | ------------------------------------------------------- |
| 重要度   | MAJOR / MINOR                                           |
| カテゴリ | 要件 / 設計 / UI/UX / IPC / 状態管理 / アクセシビリティ |
| 対象     | Phase 1 / Phase 2                                       |
| 箇所     | （具体的なセクション名）                                |
| 内容     | （指摘の詳細）                                          |
| 提案     | （修正案）                                              |
```

## 統合テスト連携

| 観点             | 連携内容                                                                               |
| ---------------- | -------------------------------------------------------------------------------------- |
| 要件-設計突合    | 本Phaseで確定した要件反映結果を Phase 4 の `TC-TRACE-*` へ 1:1 で引き継ぐ              |
| 依存契約レビュー | Task01/Task04 との契約差分を Phase 4 の `TC-IPC-*` と Phase 6 の失敗系ケースへ反映する |
| UI/UX 指摘       | MINOR 指摘を Phase 8 の改善項目と Phase 11 walkthrough チェック項目へ転記する          |
| ゲート判定       | CRITICAL/MAJOR/MINOR 判定結果を Phase 10 判定基準と未タスク検出テンプレートに接続する  |

## 成果物

| 成果物                  | パス                                            | 説明                             |
| ----------------------- | ----------------------------------------------- | -------------------------------- |
| 要件-設計突合マトリクス | `outputs/phase-3/requirements-design-matrix.md` | Phase 1 全要件の設計反映状況     |
| 依存契約適合レポート    | `outputs/phase-3/dependency-contract-report.md` | Task01-04 契約との整合性検証結果 |
| UI/UXレビューレポート   | `outputs/phase-3/ui-ux-review-report.md`        | CTA / 発見性 / 改善戻り / A11y   |
| 技術妥当性レポート      | `outputs/phase-3/technical-review-report.md`    | IPC / 状態管理 / コンポーネント  |
| ゲート判定記録          | `outputs/phase-3/gate-decision.md`              | PASS/MINOR/MAJOR 判定と指摘一覧  |

## 完了条件

- [ ] Phase 1 全要件が Phase 2 設計に反映されていることを突合確認している
- [ ] Task01 依存契約（入力 / 出力 / 禁止事項）との整合性を検証している
- [ ] Task04 契約（EP-3/EP-4 I/O、ScoringGate CTA制御）との整合性を検証している
- [ ] UI/UX レビュー（CTA視認性 / 再利用入口 / 改善戻り / A11y / Apple HIG）を実施している
- [ ] IPC連携の技術妥当性（既存チャネル再利用 / P42バリデーション / P44/P45命名）を検証している
- [ ] 状態管理の技術妥当性（P31/P48準拠 / persist対応 / セレクタ設計）を検証している
- [ ] コンポーネント設計の Atomic Design レベル整合性を検証している
- [ ] ゲート判定（PASS / MINOR / MAJOR）が記録されている
- [ ] MAJOR 指摘が 0 件であること（0件でない場合は Phase 1 または Phase 2 に戻る）
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

- [ ] 参照資料確認（Phase 1/2 + Task01-04 成果物 + システム仕様）
- [ ] タスク1: 要件-設計突合マトリクス作成
- [ ] タスク2: Task01-04 依存契約検証
- [ ] タスク3: UI/UX 多角的レビュー
- [ ] タスク4: IPC・状態管理・コンポーネントの技術妥当性レビュー
- [ ] タスク5: ゲート判定と指摘記録
- [ ] 成果物作成
- [ ] 完了条件検証

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている

## 次のPhase

Phase 4: [phase-4-test-creation.md](./phase-4-test-creation.md)
