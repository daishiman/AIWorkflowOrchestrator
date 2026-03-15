# Phase 4: テスト作成

## メタ情報

| 項目       | 値                                                       |
| ---------- | -------------------------------------------------------- |
| Phase      | 4                                                        |
| Phase名    | テスト作成                                               |
| タスクID   | TASK-SKILL-LIFECYCLE-05                                  |
| タスク名   | 作成済みスキルを使う主導線                               |
| 機能名     | created-skill-usage-journey                              |
| 前提Phase  | [phase-3-design-review.md](./phase-3-design-review.md)   |
| 後続Phase  | [phase-5-implementation.md](./phase-5-implementation.md) |
| ステータス | not_started                                              |
| 作成日     | 2026-03-15                                               |

## 目的

設計タイプのタスクのため、「テスト作成」は設計検証テストの仕様化を意味する。Phase 1 の要件・Phase 2 の設計・Phase 3 のレビューを対象に、要件トレーサビリティ・ScoringGate × CTA 制御マトリクス・画面遷移フロー・状態管理・IPC 連携・アクセシビリティの6軸で設計検証テストケースを網羅的に定義する。

## 実行タスク

- タスク1: 要件-設計トレーサビリティテスト（Phase 1 の全要件が Phase 2 設計に追跡可能か）
- タスク2: ScoringGate × CTA 制御マトリクステスト（4段階 × 4CTA の16パターン検証）
- タスク3: 画面遷移フローテスト（3シナリオの E2E 遷移テストケース化）
- タスク4: 状態管理テスト（P31/P48 準拠のセレクタテスト設計）
- タスク5: IPC 連携テスト（EP-3/EP-4 呼び分けテスト設計）
- タスク6: アクセシビリティテスト（ScoreGateBadge / SkillCard / CTA の A11y テスト設計）

## 参照資料

| 参照資料             | パス                                                                                                                         | 説明                                        |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| Phase 1 要件定義     | [phase-1-requirements.md](./phase-1-requirements.md)                                                                         | 3シナリオ・導線比較・品質要件               |
| Phase 2 設計         | [phase-2-design.md](./phase-2-design.md)                                                                                     | 画面遷移・コンポーネント・状態管理・IPC設計 |
| Phase 3 設計レビュー | [phase-3-design-review.md](./phase-3-design-review.md)                                                                       | ゲート判定・指摘事項                        |
| Task04 スコアモデル  | `../../../completed-tasks/step-03-seq-task-04-evaluation-and-scoring-gate/outputs/phase-2/scoring-gate-matrix.md`            | ScoringGate 型定義・4段階ゲート             |
| Task04 ゲート遷移    | `../../../completed-tasks/step-03-seq-task-04-evaluation-and-scoring-gate/outputs/phase-2/gate-transition-design.md`         | EP-3/EP-4 フローと Task05 契約              |
| Task01 画面責務      | `../../../completed-tasks/step-01-seq-task-01-lifecycle-journey-foundation/outputs/phase-2/surface-responsibility-matrix.md` | 画面別責務・禁止事項                        |
| Task01 依存契約      | `../../../completed-tasks/step-01-seq-task-01-lifecycle-journey-foundation/outputs/phase-2/dependency-contracts.md`          | Task05 への入力・出力・禁止事項             |
| UI/UX Realization    | `../../ui-ux-realization.md`                                                                                                 | Reuse 導線・CTA 契約正本                    |
| UI/UX 図解           | `../../ui-ux-diagrams.md`                                                                                                    | 状態遷移・CTA flow 図                       |

### システム仕様（aiworkflow-requirements）

| 参照資料                   | パス                                                                              | 内容                               |
| -------------------------- | --------------------------------------------------------------------------------- | ---------------------------------- |
| ui-ux-agent-execution      | `.claude/skills/aiworkflow-requirements/references/ui-ux-agent-execution.md`      | Agent 実行画面の導線・進捗 surface |
| ui-ux-feature-components   | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`   | Skill Center / Workspace           |
| interfaces-agent-sdk-skill | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | スキル関連インターフェース契約     |
| arch-state-management      | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`      | 状態管理・Store 設計               |

## 実行手順

### ステップ1: 要件-設計トレーサビリティテスト設計（タスク1）

設計検証テストの目的: Phase 1 で定義した全要件が Phase 2 の設計に漏れなく反映されているかを確認する。

#### TC-TRACE-01: 3シナリオ対応確認

| テストケース ID | TC-TRACE-01                                                                |
| --------------- | -------------------------------------------------------------------------- |
| テスト種別      | 設計検証テスト（トレーサビリティ）                                         |
| 対象要件        | Phase 1 ステップ1: シナリオ A/B/C の定義                                   |
| 検証対象        | Phase 2 ステップ1/2 の画面遷移フロー                                       |
| 前提条件        | Phase 1 要件定義書・Phase 2 設計書が存在すること                           |
| 期待結果        | シナリオ A/B/C それぞれに対応する画面遷移フローが Phase 2 に記載されている |
| 合否基準        | 3シナリオ全てに開始地点・完了地点・CTA が Phase 2 に定義されていれば PASS  |

#### TC-TRACE-02: 主利用導線対応確認

| テストケース ID | TC-TRACE-02                                                                        |
| --------------- | ---------------------------------------------------------------------------------- |
| テスト種別      | 設計検証テスト（トレーサビリティ）                                                 |
| 対象要件        | Phase 1 ステップ2: Workspace → Agent 二段構成                                      |
| 検証対象        | Phase 2 ステップ1 の画面遷移フロー + コンポーネントツリー                          |
| 前提条件        | Phase 2 設計書が存在すること                                                       |
| 期待結果        | Workspace を「実行準備」、Agent を「実行本体」とする二段構成が設計に反映されている |
| 合否基準        | Workspace と Agent の責務分担が Task01 画面責務と一致していれば PASS               |

#### TC-TRACE-03: 発見導線6経路対応確認

| テストケース ID | TC-TRACE-03                                                                            |
| --------------- | -------------------------------------------------------------------------------------- |
| テスト種別      | 設計検証テスト（トレーサビリティ）                                                     |
| 対象要件        | Phase 1 ステップ3: 6つの発見導線（一覧/検索/おすすめ/最近使った/お気に入り/履歴）      |
| 検証対象        | Phase 2 ステップ2 の Skill Center レイアウト                                           |
| 期待結果        | 6つの発見方法が Skill Center の設計（3セクション + 検索バー + 履歴タブ）に対応している |
| 合否基準        | 6経路全てに対応する UI 要素が Phase 2 に定義されていれば PASS                          |

#### TC-TRACE-04: 改善フィードバックループ対応確認

| テストケース ID | TC-TRACE-04                                                                          |
| --------------- | ------------------------------------------------------------------------------------ |
| テスト種別      | 設計検証テスト（トレーサビリティ）                                                   |
| 対象要件        | Phase 1 ステップ4: 実行結果 → EP-4 → 改善 → EP-2 → 再利用ループ                      |
| 検証対象        | Phase 2 ステップ4 の改善戻りショートカット設計                                       |
| 期待結果        | PostExecutionActionBar の「改善する」CTA が SkillAnalysisView への遷移を設計している |
| 合否基準        | 改善戻りの遷移先・渡すコンテキスト（skillName + 実行結果）が定義されていれば PASS    |

#### TC-TRACE-05: 品質表示7地点対応確認

| テストケース ID | TC-TRACE-05                                                                                     |
| --------------- | ----------------------------------------------------------------------------------------------- |
| テスト種別      | 設計検証テスト（トレーサビリティ）                                                              |
| 対象要件        | Phase 1 ステップ5: 品質表示の7地点定義                                                          |
| 検証対象        | Phase 2 ステップ3 の品質コンポーネント配置表                                                    |
| 期待結果        | 7地点全てに対応するコンポーネント（ScoreGateBadge/ScoreDisplay/ScoreDelta）が配置設計されている |
| 合否基準        | 7地点 × コンポーネント名 × 表示モードの全組み合わせが定義されていれば PASS                      |

---

### ステップ2: ScoringGate × CTA 制御マトリクステスト設計（タスク2）

ScoringGate 4段階 × CTA 4種 の16パターン全てについてテストケースを定義する。

#### 制御マトリクス全体定義

| ScoringGate       | スコア範囲 | 今すぐ使う       | 保存して後で使う  | 改善してから使う  | 改善を推奨        |
| ----------------- | ---------- | ---------------- | ----------------- | ----------------- | ----------------- |
| NEEDS_IMPROVEMENT | 0-59       | 無効（disabled） | 有効              | 有効（Primary）   | 非表示            |
| SAVE_ALLOWED      | 60-79      | 無効（disabled） | 有効（Primary）   | 有効（Secondary） | 表示（Text link） |
| USE_ALLOWED       | 80-99      | 有効（Primary）  | 有効（Secondary） | 非表示            | 表示（Text link） |
| RECOMMENDED       | 100        | 有効（Primary）  | 有効（Secondary） | 非表示            | 非表示            |

#### TC-MATRIX-01〜04: NEEDS_IMPROVEMENT ゲートの CTA 制御

| テストケース ID | 対象 CTA         | 期待する CTA 状態        | 検証方法                                                       |
| --------------- | ---------------- | ------------------------ | -------------------------------------------------------------- |
| TC-MATRIX-01    | 今すぐ使う       | disabled                 | CTA コンポーネントの `canUse` prop が `false` であることを確認 |
| TC-MATRIX-02    | 保存して後で使う | 有効                     | CTA コンポーネントの `canSave` prop が `true` であることを確認 |
| TC-MATRIX-03    | 改善してから使う | 有効（Primary スタイル） | variant が `warning` で disabled が `false` であることを確認   |
| TC-MATRIX-04    | 改善を推奨       | 非表示                   | CTA コンポーネントが DOM に存在しないことを確認                |

#### TC-MATRIX-05〜08: SAVE_ALLOWED ゲートの CTA 制御

| テストケース ID | 対象 CTA         | 期待する CTA 状態          | 検証方法                                                              |
| --------------- | ---------------- | -------------------------- | --------------------------------------------------------------------- |
| TC-MATRIX-05    | 今すぐ使う       | disabled                   | CTA コンポーネントの `canUse` prop が `false` であることを確認        |
| TC-MATRIX-06    | 保存して後で使う | 有効（Primary スタイル）   | variant が `primary` で disabled が `false` であることを確認          |
| TC-MATRIX-07    | 改善してから使う | 有効（Secondary スタイル） | variant が `secondary` で disabled が `false` であることを確認        |
| TC-MATRIX-08    | 改善を推奨       | 表示（Text link）          | CTA コンポーネントが DOM に存在し、variant が `text` であることを確認 |

#### TC-MATRIX-09〜12: USE_ALLOWED ゲートの CTA 制御

| テストケース ID | 対象 CTA         | 期待する CTA 状態          | 検証方法                                                              |
| --------------- | ---------------- | -------------------------- | --------------------------------------------------------------------- |
| TC-MATRIX-09    | 今すぐ使う       | 有効（Primary スタイル）   | variant が `primary` で disabled が `false` であることを確認          |
| TC-MATRIX-10    | 保存して後で使う | 有効（Secondary スタイル） | variant が `secondary` で disabled が `false` であることを確認        |
| TC-MATRIX-11    | 改善してから使う | 非表示                     | CTA コンポーネントが DOM に存在しないことを確認                       |
| TC-MATRIX-12    | 改善を推奨       | 表示（Text link）          | CTA コンポーネントが DOM に存在し、variant が `text` であることを確認 |

#### TC-MATRIX-13〜16: RECOMMENDED ゲートの CTA 制御

| テストケース ID | 対象 CTA         | 期待する CTA 状態          | 検証方法                                                       |
| --------------- | ---------------- | -------------------------- | -------------------------------------------------------------- |
| TC-MATRIX-13    | 今すぐ使う       | 有効（Primary スタイル）   | variant が `primary` で disabled が `false` であることを確認   |
| TC-MATRIX-14    | 保存して後で使う | 有効（Secondary スタイル） | variant が `secondary` で disabled が `false` であることを確認 |
| TC-MATRIX-15    | 改善してから使う | 非表示                     | CTA コンポーネントが DOM に存在しないことを確認                |
| TC-MATRIX-16    | 改善を推奨       | 非表示                     | CTA コンポーネントが DOM に存在しないことを確認                |

---

### ステップ3: 画面遷移フローテスト設計（タスク3）

3シナリオのそれぞれについて E2E 遷移をテストケースとして定義する。

#### シナリオA: 作成直後に使う（Immediate Use）— TC-FLOW-A01〜A05

| ステップ | テストケース ID | 遷移元             | 遷移先            | 検証内容                                                                        |
| -------- | --------------- | ------------------ | ----------------- | ------------------------------------------------------------------------------- |
| A-1      | TC-FLOW-A01     | Skill Creator 完了 | EP-1 採点完了画面 | ScoringGate バッジが表示されること                                              |
| A-2      | TC-FLOW-A02     | EP-1 採点完了画面  | Workspace         | 「今すぐ使う」CTA クリックで Workspace へ遷移すること（USE_ALLOWED 以上の場合） |
| A-3      | TC-FLOW-A03     | Workspace          | Agent             | スキルが自動選択された状態で Agent へ遷移すること                               |
| A-4      | TC-FLOW-A04     | Agent 実行中       | Agent 実行結果    | 実行結果サマリーと PostExecutionActionBar が表示されること                      |
| A-5      | TC-FLOW-A05     | Agent 実行結果     | 履歴記録          | 「完了」クリックで履歴に記録されること                                          |

#### シナリオB: あとから使う（Deferred Use）— TC-FLOW-B01〜B06

| ステップ | テストケース ID | 遷移元                | 遷移先           | 検証内容                                                  |
| -------- | --------------- | --------------------- | ---------------- | --------------------------------------------------------- |
| B-1      | TC-FLOW-B01     | Skill Center 一覧     | SkillCard        | SkillCard にScoringGate バッジが表示されること            |
| B-2      | TC-FLOW-B02     | SkillCard             | SkillDetailPanel | クリックで詳細パネルが開き、ScoreDisplay が表示されること |
| B-3      | TC-FLOW-B03     | SkillDetailPanel      | Workspace        | 「使う」CTA クリックで Workspace へ遷移すること           |
| B-4      | TC-FLOW-B04     | Workspace             | Agent            | 文脈準備後に Agent へ遷移すること                         |
| B-5      | TC-FLOW-B05     | Agent 実行結果        | 履歴記録         | 実行後に「最近使ったスキル」が更新されること              |
| B-6      | TC-FLOW-B06     | Skill Center 検索バー | 検索結果一覧     | スキル名・説明・タグで絞り込み結果が正しく表示されること  |

#### シナリオC: 履歴から再利用する（History Reuse）— TC-FLOW-C01〜C05

| ステップ | テストケース ID | 遷移元                 | 遷移先                             | 検証内容                                                      |
| -------- | --------------- | ---------------------- | ---------------------------------- | ------------------------------------------------------------- |
| C-1      | TC-FLOW-C01     | Agent 履歴タブ         | 履歴エントリ一覧                   | 実行日時・結果サマリー・スコアが表示されること                |
| C-2      | TC-FLOW-C02     | 履歴エントリ           | Agent 再実行                       | 「もう一度使う」クリックで前回パラメータが復元されること      |
| C-3      | TC-FLOW-C03     | Agent 実行結果（不満） | SkillAnalysisView                  | 「改善する」CTA クリックで skillName と実行結果が渡されること |
| C-4      | TC-FLOW-C04     | SkillAnalysisView      | EP-2 改善後再採点                  | 改善完了後に新しい ScoringGate が反映されること               |
| C-5      | TC-FLOW-C05     | EP-2 再採点完了        | 再利用導線（Skill Center / Agent） | 改善完了後に再利用導線へ戻るパスが機能すること                |

---

### ステップ4: 状態管理テスト設計（タスク4）

P31/P48 に準拠した個別セレクタの設計検証テストを定義する。

#### TC-STATE-01: favoriteSkillNames セレクタ設計

| テストケース ID | TC-STATE-01                                                                                                |
| --------------- | ---------------------------------------------------------------------------------------------------------- |
| テスト種別      | 設計検証テスト（状態管理）                                                                                 |
| 検証対象        | `useFavoriteSkillNames` セレクタの設計                                                                     |
| 前提条件        | Phase 2 ステップ5 の状態管理設計書が存在すること                                                           |
| 期待設計        | `useFavoriteSkillNames` は `useAppStore((state) => state.favoriteSkillNames)` として定義され、Set 型を返す |
| P31 準拠確認    | 合成 Hook（`useSkillStore()`）を経由していないことを確認                                                   |
| P48 準拠確認    | Set 型は参照が変わらないため `useShallow` 不要（ただし Set の中身変化は別途確認）                          |
| 合否基準        | 個別セレクタ形式で定義され、合成 Hook の使用がなければ PASS                                                |

#### TC-STATE-02: recentlyUsedSkills セレクタ設計（P48 チェック）

| テストケース ID | TC-STATE-02                                                                                                         |
| --------------- | ------------------------------------------------------------------------------------------------------------------- |
| テスト種別      | 設計検証テスト（状態管理）                                                                                          |
| 検証対象        | `useRecentlyUsedSkills` セレクタの設計                                                                              |
| 期待設計        | `useAppStore(useShallow((state) => state.recentlyUsedSkills))` として定義され、配列に `useShallow` が適用されている |
| P48 準拠確認    | 配列を返すセレクタには `useShallow` が必ず適用されていることを確認                                                  |
| 合否基準        | `useShallow` が適用されていれば PASS、未適用なら FAIL（無限ループリスク）                                           |

#### TC-STATE-03: lastExecutionResult セレクタ設計

| テストケース ID | TC-STATE-03                                                                                  |
| --------------- | -------------------------------------------------------------------------------------------- |
| テスト種別      | 設計検証テスト（状態管理）                                                                   |
| 検証対象        | `agentSlice.lastExecutionResult` と `agentSlice.postExecutionScore` のリセットタイミング設計 |
| 期待設計        | 新規スキル実行開始時に `lastExecutionResult` が `null` にリセットされる設計が定義されている  |
| 合否基準        | リセットタイミング（実行開始時・画面離脱時の2地点）が設計書に明記されていれば PASS           |

#### TC-STATE-04: Zustand persist の Set 型対応

| テストケース ID | TC-STATE-04                                                                                                     |
| --------------- | --------------------------------------------------------------------------------------------------------------- |
| テスト種別      | 設計検証テスト（状態管理）                                                                                      |
| 検証対象        | `favoriteSkillNames: Set<string>` の Zustand persist `customStorage` 対応                                       |
| 期待設計        | `customStorage` が Set 型のシリアライズ（JSON.stringify で配列化）とデシリアライズ（`new Set()`）を実装している |
| 合否基準        | customStorage に Set 対応の実装が設計書に含まれていれば PASS                                                    |

---

### ステップ5: IPC 連携テスト設計（タスク5）

EP-3（利用前評価）と EP-4（利用後再評価）の呼び分けテストを定義する。

#### TC-IPC-01: EP-3 呼び出し設計確認（Workspace スキル選択時）

| テストケース ID    | TC-IPC-01                                                                                    |
| ------------------ | -------------------------------------------------------------------------------------------- |
| テスト種別         | 設計検証テスト（IPC）                                                                        |
| 対象 IPC           | `skill:optimize:evaluate`（既存チャネル再利用）                                              |
| 呼び出しタイミング | Workspace のスキル選択ドロップダウン展開時                                                   |
| 期待引数           | `skillName: string`（trim 検証済み）                                                         |
| 期待戻り値         | `PromptEvaluation`（ScoringGate 結果を含む）                                                 |
| P42 準拠確認       | 引数に型チェック → 空文字列チェック → trim 空文字列チェックの3段バリデーション設計があること |
| 合否基準           | EP-3 呼び出しの引数型・バリデーション設計が Phase 2 に定義されていれば PASS                  |

#### TC-IPC-02: EP-4 呼び出し設計確認（Agent 実行結果後）

| テストケース ID    | TC-IPC-02                                                                  |
| ------------------ | -------------------------------------------------------------------------- |
| テスト種別         | 設計検証テスト（IPC）                                                      |
| 対象 IPC           | `skill:optimize:evaluate`（既存チャネル再利用）                            |
| 呼び出しタイミング | Agent 実行完了後の「改善する」CTA クリック時（任意実行）                   |
| 期待引数           | `skillName: string`                                                        |
| 期待戻り値         | `PromptEvaluation`（ScoreDelta の計算に使用）                              |
| EP-3 との区別      | 呼び出しコンテキスト（利用前 vs 利用後）を区別する設計が定義されていること |
| 合否基準           | EP-3 と EP-4 の呼び分けが設計書に明示されていれば PASS                     |

#### TC-IPC-03: お気に入り管理の IPC 不要確認

| テストケース ID | TC-IPC-03                                                                                           |
| --------------- | --------------------------------------------------------------------------------------------------- |
| テスト種別      | 設計検証テスト（IPC）                                                                               |
| 検証対象        | `skill:favorite:toggle` の新規 IPC チャネル要否                                                     |
| 期待設計        | Zustand persist でお気に入りを管理するため新規 IPC チャネルが不要であることが設計書に明記されている |
| 合否基準        | IPC 不要の理由と代替手段（Zustand persist）が設計書に記載されていれば PASS                          |

#### TC-IPC-04: P44/P45 引数命名セマンティクス確認

| テストケース ID  | TC-IPC-04                                                                                   |
| ---------------- | ------------------------------------------------------------------------------------------- |
| テスト種別       | 設計検証テスト（IPC）                                                                       |
| 検証対象         | IPC 引数名が実際の値のセマンティクスと一致しているか                                        |
| チェックポイント | 引数名 `skillName` が実際にスキルの「名前」を渡していること（`skillId` との混同がないこと） |
| 合否基準         | 全 IPC 引数名がセマンティクスに一致していれば PASS                                          |

---

### ステップ6: アクセシビリティテスト設計（タスク6）

ScoreGateBadge / SkillCard / CTA ボタンの A11y テストケースを定義する。

#### TC-A11Y-01: ScoreGateBadge の3重表現確認

| テストケース ID    | TC-A11Y-01                                                                                                                         |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| テスト種別         | 設計検証テスト（アクセシビリティ）                                                                                                 |
| 対象コンポーネント | `ScoreGateBadge`                                                                                                                   |
| 期待設計           | 色（error/warning/success）+ ラベル（文字列）+ アイコン（alert-circle/save/check-circle/star）の3重表現が Props 定義に含まれている |
| WCAG 2.1 AA        | 色のみで情報を伝えず、テキストとアイコンを併用することを確認                                                                       |
| 合否基準           | `showLabel` prop がデフォルト `true`、アイコン名が設計に含まれていれば PASS                                                        |

#### TC-A11Y-02: ScoreGateBadge の ARIA ラベル設計

| テストケース ID    | TC-A11Y-02                                                                                                 |
| ------------------ | ---------------------------------------------------------------------------------------------------------- |
| テスト種別         | 設計検証テスト（アクセシビリティ）                                                                         |
| 対象コンポーネント | `ScoreGateBadge`                                                                                           |
| 期待設計           | スコア数値が `aria-label="スコア: 85 (利用可)"` のようなスクリーンリーダー向けラベルを持つ設計になっている |
| 合否基準           | ARIA ラベルの形式が設計書に定義されていれば PASS                                                           |

#### TC-A11Y-03: SkillCard のキーボード操作設計

| テストケース ID    | TC-A11Y-03                                                                                   |
| ------------------ | -------------------------------------------------------------------------------------------- |
| テスト種別         | 設計検証テスト（アクセシビリティ）                                                           |
| 対象コンポーネント | `SkillCard`                                                                                  |
| 期待設計           | SkillCard が `tabIndex={0}` を持ち、Enter/Space キーでクリック動作が発火する設計になっている |
| 合否基準           | キーボードフォーカスとキー操作の設計が Component 仕様に含まれていれば PASS                   |

#### TC-A11Y-04: CTA ボタンのフォーカス状態設計

| テストケース ID    | TC-A11Y-04                                                                                          |
| ------------------ | --------------------------------------------------------------------------------------------------- |
| テスト種別         | 設計検証テスト（アクセシビリティ）                                                                  |
| 対象コンポーネント | 全 CTA ボタン（今すぐ使う / 保存して後で使う / 改善する / もう一度使う）                            |
| 期待設計           | フォーカス状態が視覚的に識別可能なスタイル（`focus:ring-2` とコントラスト確保）が設計に含まれている |
| 合否基準           | 全 CTA ボタンにフォーカス状態スタイルが定義されていれば PASS                                        |

#### TC-A11Y-05: Apple HIG 準拠確認

| テストケース ID  | TC-A11Y-05                                                                                              |
| ---------------- | ------------------------------------------------------------------------------------------------------- |
| テスト種別       | 設計検証テスト（UI/UX 品質）                                                                            |
| チェックポイント | SkillCard 角丸 8-12px / 8px グリッドスペーシング / システムカラー使用 / 全 CTA にホバー・アクティブ状態 |
| 合否基準         | 4項目全てが Component 仕様に含まれていれば PASS                                                         |

---

## 統合テスト連携

| 観点                 | 連携内容                                                                                                 |
| -------------------- | -------------------------------------------------------------------------------------------------------- |
| テスト設計の引き継ぎ | 本Phaseの `TC-TRACE/TC-MATRIX/TC-FLOW/TC-STATE/TC-IPC/TC-A11Y` を Phase 6 拡充ケースの親IDとして使用する |
| カバレッジ管理       | テストケース総数を Phase 7 の coverage matrix の基準値として固定し、未対応セルを可視化する               |
| 回帰ガード           | Task04 由来の ScoringGate/ScoreDelta 契約を Phase 9 品質検証の型整合チェックに再利用する                 |
| 手動検証             | 画面遷移ケース（TC-FLOW-\*）を Phase 11 walkthrough のシナリオA/B/C にマッピングする                     |

## 成果物

| 成果物                         | パス                                              | 説明                             |
| ------------------------------ | ------------------------------------------------- | -------------------------------- |
| 要件トレーサビリティテスト設計 | `outputs/phase-4/traceability-test-design.md`     | TC-TRACE-01〜05 の詳細テスト仕様 |
| ScoringGate×CTAマトリクス設計  | `outputs/phase-4/scoring-gate-cta-matrix.md`      | 16パターンのテストケース一覧     |
| 画面遷移フローテスト設計       | `outputs/phase-4/flow-test-design.md`             | 3シナリオ × E2E 遷移テストケース |
| 状態管理テスト設計             | `outputs/phase-4/state-management-test-design.md` | P31/P48 準拠セレクタテスト仕様   |
| IPC 連携テスト設計             | `outputs/phase-4/ipc-test-design.md`              | EP-3/EP-4 呼び分けテスト仕様     |
| アクセシビリティテスト設計     | `outputs/phase-4/accessibility-test-design.md`    | TC-A11Y-01〜05 の詳細テスト仕様  |

## 完了条件

- [ ] 要件-設計トレーサビリティテスト（TC-TRACE-01〜05）が設計されている
- [ ] ScoringGate × CTA 制御マトリクス（16パターン）が全て定義されている
- [ ] 3シナリオの E2E 遷移テストケース（TC-FLOW-A01〜A05 / B01〜B06 / C01〜C05）が定義されている
- [ ] P31/P48 準拠の状態管理テスト（TC-STATE-01〜04）が設計されている
- [ ] EP-3/EP-4 呼び分けテスト（TC-IPC-01〜04）が設計されている
- [ ] A11y テスト（TC-A11Y-01〜05）が設計されている
- [ ] 全テストケースに合否基準（PASS/FAIL 判定条件）が明記されている
- [ ] 本 Phase 内の全タスクを 100% 実行完了

## サブタスク管理

- [ ] 参照資料確認（Phase 1/2/3 + Task01/04 成果物 + システム仕様）
- [ ] タスク1: 要件-設計トレーサビリティテスト設計
- [ ] タスク2: ScoringGate × CTA 制御マトリクステスト設計
- [ ] タスク3: 画面遷移フローテスト設計
- [ ] タスク4: 状態管理テスト設計
- [ ] タスク5: IPC 連携テスト設計
- [ ] タスク6: アクセシビリティテスト設計
- [ ] 成果物作成
- [ ] 完了条件検証

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている

## 次のPhase

Phase 5: [phase-5-implementation.md](./phase-5-implementation.md)
