# Phase 9: 品質検証

## メタ情報

| 項目       | 値                                                     |
| ---------- | ------------------------------------------------------ |
| Phase      | 9                                                      |
| Phase名    | 品質検証                                               |
| タスクID   | TASK-SKILL-LIFECYCLE-05                                |
| タスク名   | 作成済みスキルを使う主導線                             |
| 機能名     | created-skill-usage-journey                            |
| 前提Phase  | [phase-8-refactoring.md](./phase-8-refactoring.md)     |
| 後続Phase  | [phase-10-final-review.md](./phase-10-final-review.md) |
| ステータス | not_started                                            |
| 作成日     | 2026-03-15                                             |

## 目的

本タスクは「設計タイプ」のため、Phase 9 の品質検証対象は設計文書そのものである。Phase 8 のリファクタリングを経た設計文書群（Phase 1-8 の全成果物）を対象として、以下の5観点で品質基準を満たしているかを確認する。

1. 仕様書品質基準（自己完結性・必須セクション順序・成果物パス命名規則）
2. 曖昧表現の除去（禁止語ID一覧に該当する表現が含まれていないか）
3. TypeScript 型定義の整合性（Phase 2 の型が Task04 型定義と矛盾しないか）
4. 参照リンクの有効性（全参照パスが実在するファイルを指しているか）
5. 既知の落とし穴（P31/P48/P42/P44/P45 準拠）への対策が設計に含まれているか

## 実行タスク

- タスク1: 仕様書品質基準チェック（自己完結性 / 必須セクション順序 / 成果物パス命名）
- タスク2: 曖昧表現チェック（禁止表現の検出と修正）
- タスク3: 型定義整合性チェック（Phase 2 TypeScript 型と Task04 型定義の突合）
- タスク4: 参照リンク有効性チェック（全参照パスの実在確認）
- タスク5: Pitfall 準拠チェック（P31/P48/P42/P44/P45 の対策が設計に含まれているか）

## 参照資料

| 参照資料             | パス                                                                                                                 | 説明                                              |
| -------------------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| Phase 1 要件定義     | [phase-1-requirements.md](./phase-1-requirements.md)                                                                 | 品質チェック対象                                  |
| Phase 2 設計         | [phase-2-design.md](./phase-2-design.md)                                                                             | 品質チェック対象（型定義・状態管理・IPC設計含む） |
| Phase 3 設計レビュー | [phase-3-design-review.md](./phase-3-design-review.md)                                                               | 品質チェック対象                                  |
| Phase 4 テスト設計   | [phase-4-test-creation.md](./phase-4-test-creation.md)                                                               | 品質チェック対象                                  |
| Phase 5 実装設計     | [phase-5-implementation.md](./phase-5-implementation.md)                                                             | 品質チェック対象                                  |
| Phase 6 テスト拡充   | [phase-6-test-expansion.md](./phase-6-test-expansion.md)                                                             | 品質チェック対象                                  |
| Phase 7 カバレッジ   | [phase-7-coverage-check.md](./phase-7-coverage-check.md)                                                             | 品質チェック対象                                  |
| Phase 8 リファクタ   | [phase-8-refactoring.md](./phase-8-refactoring.md)                                                                   | 品質チェック対象                                  |
| Task04 スコアモデル  | `../../../completed-tasks/step-03-seq-task-04-evaluation-and-scoring-gate/outputs/phase-2/scoring-gate-matrix.md`    | 型定義整合性の突合基準                            |
| Task04 ゲート遷移    | `../../../completed-tasks/step-03-seq-task-04-evaluation-and-scoring-gate/outputs/phase-2/gate-transition-design.md` | EP-3/EP-4 I/O 型の突合基準                        |
| 仕様書品質ルール     | `.claude/rules/05-task-execution.md`                                                                                 | 仕様書品質基準・必須セクション順序・命名規則      |
| コード品質ルール     | `.claude/rules/02-code-quality.md`                                                                                   | 曖昧表現禁止・TypeScript型安全ルール              |
| 既知の落とし穴       | `.claude/rules/06-known-pitfalls.md`                                                                                 | P31/P48/P42/P44/P45 の詳細                        |

### システム仕様（aiworkflow-requirements）

| 参照資料                      | パス                                                                                 | 内容                     |
| ----------------------------- | ------------------------------------------------------------------------------------ | ------------------------ |
| interfaces-agent-sdk-skill    | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`    | スキル型定義の正本       |
| interfaces-agent-sdk-executor | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor.md` | 実行結果型定義の正本     |
| arch-state-management         | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`         | Store / Slice 設計の正本 |

## 実行手順

### ステップ1: 仕様書品質基準チェック（タスク1）

`05-task-execution.md` の「仕様書品質基準」と「必須セクション順序」に基づき、Phase 1-8 の全設計文書を検証する。

#### 自己完結性チェックリスト

各Phase文書について以下を確認する。

| チェック項目                                                     | 対象文書         |
| ---------------------------------------------------------------- | ---------------- |
| 依存関係（前Phase成果物パス）が「前提Phase」欄に明示されているか | Phase 1-8 全文書 |
| 実行タスク名と目的が記載されているか                             | Phase 1-8 全文書 |
| 成果物パスが `outputs/phase-N/` 形式で明確に記載されているか     | Phase 1-8 全文書 |
| 完了条件がチェックリスト形式（`- [ ]`）で記載されているか        | Phase 1-8 全文書 |
| 「サブタスク管理」セクションが存在するか                         | Phase 1-8 全文書 |
| 「タスク100%実行確認【必須】」セクションが存在するか             | Phase 1-8 全文書 |
| 「次のPhase」セクションが最末尾にあるか                          | Phase 1-8 全文書 |

#### 必須セクション順序チェック

`05-task-execution.md` に定義された順序（タイトル → メタ情報 → 目的 → 実行タスク → 参照資料 → 実行手順 → 成果物 → 完了条件 → サブタスク管理 → タスク100%実行確認 → 次のPhase）に沿っているか確認する。

#### 成果物パス命名規則チェック

`05-task-execution.md` の命名規則 `docs/30-workflows/{{FEATURE_NAME}}/phase-{{N}}-{{英語名}}.md` に準拠しているか確認する。

| ファイル                    | 期待パターン                                       | 準拠   |
| --------------------------- | -------------------------------------------------- | ------ |
| `phase-1-requirements.md`   | `phase-1-requirements`（英語名: requirements）     | 未確認 |
| `phase-2-design.md`         | `phase-2-design`（英語名: design）                 | 未確認 |
| `phase-3-design-review.md`  | `phase-3-design-review`（英語名: design-review）   | 未確認 |
| `phase-4-test-creation.md`  | `phase-4-test-creation`（英語名: test-creation）   | 未確認 |
| `phase-5-implementation.md` | `phase-5-implementation`（英語名: implementation） | 未確認 |
| `phase-6-test-expansion.md` | `phase-6-test-expansion`（英語名: test-expansion） | 未確認 |
| `phase-7-coverage-check.md` | `phase-7-coverage-check`（英語名: coverage-check） | 未確認 |
| `phase-8-refactoring.md`    | `phase-8-refactoring`（英語名: refactoring）       | 未確認 |

---

### ステップ2: 曖昧表現チェック（タスク2）

`02-code-quality.md` の「仕様書・コメントに曖昧表現を使わない」ルールに基づき、Phase 1-8 の全設計文書から禁止表現を検出し修正する。

#### 禁止語IDテーブル

| ID  | 対象語の説明                 | 検索キー                    | 修正方針                                                |
| --- | ---------------------------- | --------------------------- | ------------------------------------------------------- |
| B1  | 方法・条件が未定義の曖昧副詞 | `BANNED_AMBIGUOUS_METHOD`   | 具体的な条件・基準・方法に置き換える                    |
| B2  | 条件が未定義の分岐表現       | `BANNED_CONDITIONAL_BRANCH` | 「〜の場合は〜する」という条件文に変換する              |
| B3  | 列挙範囲が不明な省略語       | `BANNED_ENUM_OMISSION`      | 列挙対象を明示するか「のみ」で範囲を限定する            |
| B4  | 実施タイミング未定義語       | `BANNED_TIMING_AMBIGUOUS`   | 具体的なタイミング・トリガーに置き換える                |
| B5  | 末尾省略記法                 | `BANNED_ETC_SUFFIX`         | 全列挙するか「に限る」で明示する                        |
| B6  | 成功条件未定義語             | `BANNED_SUCCESS_VAGUE`      | 成功の定義・条件を明示する                              |
| B7  | 値制約が未定義の表現         | `BANNED_VALUE_VAGUE`        | 型・範囲・形式を明示する（例: `1 以上 100 以下の整数`） |

#### 曖昧表現チェックの実施手順

1. Phase 1-8 の全設計文書に対して、上記禁止表現を検索する
2. 検出箇所を記録する（文書名・行番号・前後文脈）
3. 修正方針に従って書き換える
4. 書き換え後の文意が元の意図と一致することを確認する

---

### ステップ3: 型定義整合性チェック（タスク3）

Phase 2 で定義した TypeScript 型が、Task04 の型定義（`scoring-gate-matrix.md`）および システム仕様の型定義と矛盾しないかを確認する。

#### 型定義突合テーブル

| Phase 2 定義の型                  | 突合先型定義                                    | チェック項目                                                                              |
| --------------------------------- | ----------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `ScoringGate` (enum値4種)         | Task04 `ScoringGate` 型定義                     | 4段階の値（NEEDS_IMPROVEMENT / SAVE_ALLOWED / USE_ALLOWED / RECOMMENDED）が一致しているか |
| `ScoreGateBadgeProps.gate`        | Task04 `ScoringGate` 型定義                     | `gate` プロパティの型が `ScoringGate` と一致しているか                                    |
| `ScoreGateBadgeProps.score`       | Task04 スコアモデル（0-100）                    | `score` の型が `number` で範囲が 0-100 であるか                                           |
| `ScoringGateResult`               | Task04 `ScoringGateResult` インターフェース     | `gate`, `score`, `recommendation` フィールドが一致しているか                              |
| `ExecutionResultSummary`          | `interfaces-agent-sdk-executor.md` の実行結果型 | `status`, `duration`, `output` 等のフィールドが一致しているか                             |
| `PromptEvaluation`                | Task04 EP-3/EP-4 評価結果型                     | `skillName`, `gate`, `score`, `axes` フィールドが一致しているか                           |
| `favoriteSkillNames: Set<string>` | `interfaces-agent-sdk-skill.md` のスキル型      | スキル識別子が `name: string` であることを確認                                            |
| `recentlyUsedSkills` の要素型     | なし（Renderer Store 内部型）                   | `{ name: string; usedAt: string }` の形式が自己完結しているか                             |
| `GATE_BADGE_CONFIG` の `variant`  | `ui-ux-feature-components.md` の Badge variant  | `error / warning / success` の3値が Badge コンポーネント定義と一致しているか              |

#### 型定義整合性チェックの実施手順

1. Phase 2 ステップ3の `ScoreGateBadge` 型定義と Task04 `scoring-gate-matrix.md` を並べて確認する
2. `ScoringGate` の4値が完全に一致しているかを確認する
3. Phase 2 ステップ5の状態管理設計（`favoriteSkillNames`, `recentlyUsedSkills`, `lastExecutionResult`, `postExecutionScore`）の型と `interfaces-agent-sdk-skill.md` の型を突合する
4. 矛盾が見つかった場合は「型定義矛盾リスト」として記録し、修正方針を記載する

---

### ステップ4: 参照リンク有効性チェック（タスク4）

Phase 1-8 の全設計文書にある「参照資料」テーブルの全パスについて、参照先ファイルが実在するかを確認する。

#### 参照リンク有効性チェック対象分類

| 参照先の種類                                   | 確認方法                                                               |
| ---------------------------------------------- | ---------------------------------------------------------------------- |
| 同ディレクトリ内の別Phase文書                  | ファイル名が一覧に存在するかを確認                                     |
| `outputs/phase-N/` 配下の成果物ファイル        | `outputs/` ディレクトリの存在確認（未作成の場合は注記済みかを確認）    |
| `completed-tasks/` 配下の成果物ファイル        | 相対パスから実ファイルが存在するかを確認                               |
| `.claude/skills/aiworkflow-requirements/` 配下 | ファイルが存在するかを確認                                             |
| `apps/desktop/src/` 配下のソースファイル       | ファイルが存在するかを確認（参照のみ・実装変更の意図でないことを確認） |

#### 参照リンク有効性チェック結果テーブル（記入例）

| Phase文書            | 参照資料名          | パス                                                            | 実在確認 | 備考                           |
| -------------------- | ------------------- | --------------------------------------------------------------- | -------- | ------------------------------ |
| phase-1-requirements | Task01 一次導線     | `../../../completed-tasks/.../primary-journey-sequence.md`      | 未確認   | -                              |
| phase-1-requirements | Task01 画面責務     | `../../../completed-tasks/.../surface-responsibility-matrix.md` | 未確認   | -                              |
| phase-1-requirements | Task04 スコアモデル | `../../../completed-tasks/.../scoring-gate-matrix.md`           | 未確認   | -                              |
| phase-2-design       | Phase 1 要件定義    | `./phase-1-requirements.md`                                     | 未確認   | -                              |
| phase-2-design       | UI/UX Realization   | `../../ui-ux-realization.md`                                    | 未確認   | -                              |
| ※ 全Phase 全行を検証 | ※ 全参照資料        | ※ 全パス                                                        | 未確認   | 実行時に全行チェックを実施する |

#### 参照リンク有効性チェックの実施手順

1. 各Phase文書の「参照資料」テーブルを開く
2. 各パスの参照先ファイルが実在するかを確認する
3. 実在しない場合は「未作成（Phase N実行後に生成予定）」の注記があるかを確認する
4. 注記なしで実在しないファイルを参照している箇所を「無効リンクリスト」として記録する
5. 無効リンクに対して以下のいずれかで対処する:
   - 正しいパスに修正する
   - `※ 未作成（Phase N実行後に生成予定）` の注記を追加する
   - 参照自体が不要であれば削除する

---

### ステップ5: Pitfall 準拠チェック（タスク5）

`06-known-pitfalls.md` に記録された既知の落とし穴のうち、本タスクに関連する P31/P48/P42/P44/P45 について、対策が設計文書に明示されているかを確認する。

#### Pitfall 準拠チェックテーブル

| Pitfall ID | 内容                                                 | チェック対象文書                     | 確認項目                                                                                                                                |
| ---------- | ---------------------------------------------------- | ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| P31        | 合成Store Hookの無限ループ                           | Phase 2 ステップ5 状態管理設計       | 合成Hook（`useXxxStore()`）を使用せず、個別セレクタ（`useFavoriteSkillNames()` 等）を設計に明示しているか                               |
| P48        | 派生セレクタへの `useShallow` 未適用による無限ループ | Phase 2 ステップ5 状態管理設計       | `recentlyUsedSkills` の配列セレクタに `useShallow` の適用が設計に明示されているか                                                       |
| P42        | 文字列引数の `.trim()` バリデーション漏れ            | Phase 2 ステップ6 IPC連携設計        | `skill:favorite:toggle` のIPC引数（`skillName: string`）に3段バリデーション（型チェック → 空文字列 → トリム空文字列）が設計されているか |
| P44        | IPCハンドラとPreloadのインターフェース不整合         | Phase 2 ステップ6 IPC連携設計        | `skill:favorite:toggle` のハンドラ引数と Preload 側の呼び出し形式が一致する設計になっているか                                           |
| P45        | IPC引数命名の契約ドリフト                            | Phase 2 ステップ6 IPC連携設計        | IPC引数名が実際に渡される値のセマンティクスと一致しているか（例: `skillName` は名前、`skillId` はIDのみに使用）                         |
| P46        | HTMLAttributes との Props 衝突                       | Phase 2 ステップ3 ScoreGateBadge仕様 | `ScoreGateBadgeProps` が HTML 標準属性と衝突する名前（`content`, `color` 等）を持っていないか、または `Omit` で排除しているか           |
| P47        | CSS変数ベースのスタイルテストアサーション戦略        | Phase 4 テスト設計                   | `ScoreGateBadge` のスタイルテストが `Record<ScoringGate, string>` 定数をインポートする方式を採用しているか                              |
| P13        | タイマーテストの無限ループ                           | Phase 4 テスト設計                   | タイムアウト付きフロー（EP-3/EP-4の非同期処理）のテストに `advanceTimersByTime` を使用する設計があるか                                  |
| P39        | happy-dom 環境での `userEvent` 非互換                | Phase 4 テスト設計                   | UIインタラクションテストが `fireEvent` を使用し、`userEvent.setup()` を避ける設計になっているか                                         |

#### Pitfall 準拠チェックの実施手順

1. 各 Pitfall IDに対して、確認対象文書の該当箇所を開く
2. 確認項目が設計文書内に明示されているかをチェックする
3. 明示されていない場合は「Pitfall 非準拠リスト」として記録する（文書名・該当箇所・必要な修正内容）
4. 非準拠箇所は設計文書に該当する記述を追加して修正する
5. 修正後に再確認を行い、全Pitfallへの対策が揃っていることを確認する

#### P31/P48 対策の設計文書内明示例（確認ポイント）

Phase 2 ステップ5 の状態管理設計内に、以下の内容が含まれていることを確認する。

```typescript
// P31準拠: 個別セレクタを使用（合成Hook禁止）
export const useFavoriteSkillNames = () =>
  useAppStore((state) => state.favoriteSkillNames);

// P48準拠: 配列派生セレクタには useShallow を適用
export const useRecentlyUsedSkills = () =>
  useAppStore(useShallow((state) => state.recentlyUsedSkills));
```

#### P42 対策の設計文書内明示例（確認ポイント）

Phase 2 ステップ6 の IPC 連携設計内に、以下の3段バリデーション設計が含まれていることを確認する。

```typescript
// P42準拠: 3段バリデーション（型チェック → 空文字列 → トリム空文字列）
ipcMain.handle("skill:favorite:toggle", async (event, skillName: string) => {
  if (
    typeof skillName !== "string" ||
    skillName === "" ||
    skillName.trim() === ""
  ) {
    throw {
      code: "VALIDATION_ERROR",
      message: "skillName must be a non-empty string",
    };
  }
  // ...
});
```

## 統合テスト連携

| 観点             | 連携内容                                                                                              |
| ---------------- | ----------------------------------------------------------------------------------------------------- |
| 品質チェック結果 | 本Phaseで検出した品質課題を Phase 10 判定テーブル（CRITICAL/MAJOR/MINOR）へ転記し、判定根拠を固定する |
| 型整合性検証     | 型差分結果を Phase 12 Step 2 の system spec 更新対象判定（必要/不要）に連動する                       |
| 参照リンク検証   | 参照切れ候補を Phase 13 のコミット前チェックに引き継ぎ、最終段で再確認する                            |
| Pitfall 準拠     | P31/P42/P48 対策の確認結果を lessons-learned 追記候補として Phase 12 Task 5 に渡す                    |

## 成果物

| 成果物                       | パス                                                  | 説明                                                 |
| ---------------------------- | ----------------------------------------------------- | ---------------------------------------------------- |
| 仕様書品質チェックレポート   | `outputs/phase-9/spec-quality-report.md`              | 自己完結性・セクション順序・命名規則の確認結果       |
| 曖昧表現検出・修正レポート   | `outputs/phase-9/ambiguity-detection-report.md`       | 禁止表現の検出箇所・修正前後の対応表                 |
| 型定義整合性レポート         | `outputs/phase-9/type-consistency-report.md`          | Phase 2 型 × Task04 型の突合結果・矛盾箇所（あれば） |
| 参照リンク有効性レポート     | `outputs/phase-9/link-validity-report.md`             | 全参照パスの実在確認結果・無効リンク一覧（あれば）   |
| Pitfall 準拠チェックレポート | `outputs/phase-9/pitfall-compliance-report.md`        | P31/P48/P42/P44/P45 等の対策確認結果・修正内容       |
| 品質検証済みPhase文書群      | `phase-1-requirements.md` 〜 `phase-8-refactoring.md` | 曖昧表現修正・Pitfall対策追加を適用した更新済み文書  |

## 完了条件

- [ ] Phase 1-8 の全設計文書について自己完結性チェックリスト（7項目）を全て確認している
- [ ] 必須セクション順序（11項目）が全Phase文書で守られていることを確認している
- [ ] 成果物パス命名規則（`phase-N-英語名.md`）が全Phase文書で守られていることを確認している
- [ ] 禁止語ID（B1〜B7）に該当する曖昧表現が全設計文書から除去されている
- [ ] Phase 2 の全 TypeScript 型が Task04 型定義と矛盾なく整合していることを確認している
- [ ] Phase 1-8 の全参照資料リンクについて、実在確認または未作成注記の追加が完了している
- [ ] P31 対策（個別セレクタ使用）が Phase 2 状態管理設計に明示されている
- [ ] P48 対策（`useShallow` 適用）が Phase 2 状態管理設計の配列セレクタに明示されている
- [ ] P42 対策（3段バリデーション）が Phase 2 IPC連携設計に明示されている
- [ ] P44 対策（ハンドラとPreloadのI/F一致）が Phase 2 IPC連携設計に明示されている
- [ ] P45 対策（引数命名のセマンティクス一致）が Phase 2 IPC連携設計に明示されている
- [ ] 全Pitfallチェックの非準拠箇所が設計文書に修正・追記されている
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

- [ ] 参照資料確認（Task04成果物・システム仕様・ルール文書）
- [ ] タスク1: 仕様書品質基準チェック（Phase 1-8 全文書 × 7項目）
- [ ] タスク2: 曖昧表現チェック（Phase 1-8 全文書 × 禁止語ID B1〜B7）
- [ ] タスク3: 型定義整合性チェック（Phase 2 全型 × Task04型定義）
- [ ] タスク4: 参照リンク有効性チェック（Phase 1-8 全参照パス）
- [ ] タスク5: Pitfall 準拠チェック（P31/P48/P42/P44/P45/P46/P47/P13/P39）
- [ ] 非準拠箇所の修正（設計文書への追記）
- [ ] 成果物作成（outputs/phase-9/ 配下の5ファイル）
- [ ] 完了条件検証

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json の Phase 9 ステータスが更新されている

## 次のPhase

Phase 10: [phase-10-final-review.md](./phase-10-final-review.md)
