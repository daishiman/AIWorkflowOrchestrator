# Phase 12: ドキュメント更新 — 実装ガイド・システム仕様更新・未タスク検出

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| タスクID   | TASK-9B-I-SDK-FORMAL-INTEGRATION               |
| Phase番号  | 12                                             |
| Phase名    | ドキュメント更新                               |
| 目的       | 実装ガイド作成・システム仕様更新・未タスク検出 |
| 前提Phase  | Phase 11（手動テスト検証 — 完了）              |
| 後続Phase  | Phase 13（完了・PR作成）                       |
| ステータス | 未実施                                         |
| ブランチ   | refactor/task-9b-i-sdk-formal-integration      |
| 関連Issue  | Issue #641                                     |
| 作成日     | 2026-02-12                                     |

---

## 目的

Phase 1〜11 で完了した `SkillExecutor.ts` の `as any` 除去と Claude Agent SDK 型安全統合について、実装ガイドの作成、システム仕様書の更新、未タスクの検出を行う。Phase 12 は漏れが最も発生しやすい Phase であるため、全4タスク・全サブステップを漏れなく逐次確認する。

---

## 依存関係

| 依存元   | 成果物                                       | 用途                          |
| -------- | -------------------------------------------- | ----------------------------- |
| Phase 1  | `outputs/phase-1/requirements-definition.md` | FR/NFR・スコープの参照        |
| Phase 2  | `outputs/phase-2/type-mapping.md`            | 型マッピング表の参照          |
| Phase 5  | 修正済み `SkillExecutor.ts`                  | 実装内容の参照                |
| Phase 9  | `outputs/phase-9/quality-report.md`          | 品質検証結果の参照            |
| Phase 10 | `outputs/phase-10/final-review-result.md`    | レビュー結果・MINOR指摘の参照 |
| Phase 11 | `outputs/phase-11/manual-test-report.md`     | 手動テスト結果の参照          |

---

## 実行タスク

### Task 1: 実装ガイド作成（2パート構成）

実装ガイドは2パートで構成する。Part 1 は中学生レベルで理解できる概念説明、Part 2 は開発者向けの技術詳細である。

#### Part 1: 概念説明（中学生レベル — 日常の例え話必須）

##### 「型安全」の説明

- **日常の例え**: コンセントの形が合わないと電気プラグが刺さらないのと同じで、プログラムでも「データの形」が合わないと動かないようにする仕組みを「型安全」と呼ぶ
- **TypeScript の役割**: プログラムを動かす前（書いている段階）で「形が合わないよ」と教えてくれる仕組み
- **メリット**: 実際に動かしてからエラーに気づくのではなく、書いている段階でミスを発見できる

##### 「as any」の説明

- **日常の例え**: 「どんなコンセントにも刺さる万能変換プラグ」のようなもの。一見便利だが、電圧や周波数が合わない電化製品を接続してしまう危険がある
- **なぜ危険か**: `as any` を使うと TypeScript の「形チェック」が無効になり、間違ったデータを渡しても書いている段階では気づけない。実際に動かして初めてエラーになる
- **今回やったこと**: この「万能変換プラグ」を外して、正しい形のコンセント（型定義）を用意した。これにより、間違った接続は書いている段階で検出される

##### 「動的 import」の説明

- **日常の例え**: 図書館で最初から全ての本を借りるのではなく、必要になった時に必要な本だけを取りに行く仕組み
- **なぜ使うのか**: Claude Agent SDK は大きなライブラリなので、必要になった時だけ読み込むことでアプリの起動を速くしている
- **今回の課題**: 「取りに行った本の内容」が分からない状態（`as any`）だったのを、「この本にはこういう内容が書いてある」と事前に分かるようにした（型定義を整備した）

#### Part 2: 開発者向け技術詳細

##### 変更前後のコード比較（Before/After）

**Before（変更前）**:

```typescript
// as any で型チェックが無効化されていた
const sdk = (await import("@anthropic-ai/claude-agent-sdk")) as any;
const { query } = sdk;
// query の引数・戻り値の型が any — 誤った引数でもコンパイル時に検出不可
```

**After（変更後）**:

```typescript
// 型安全な動的 import
const sdk = await import("@anthropic-ai/claude-agent-sdk");
const { query } = sdk;
// query の引数は QueryCallOptions, 戻り値は Conversation — コンパイル時に型チェックが有効
```

##### 型定義の変更内容

以下の型が `@anthropic-ai-claude-agent-sdk.d.ts` に追加・更新された:

| 型名               | 用途                            | 変更内容 |
| ------------------ | ------------------------------- | -------- |
| `QueryCallOptions` | `query()` 関数の引数型          | 新規追加 |
| `QueryConfig`      | query 設定のオプション部分      | 新規追加 |
| `Conversation`     | `query()` の戻り値型            | 新規追加 |
| `SDKMessage`       | `stream()` の yield 値型        | 新規追加 |
| `QueryOptions`     | 既存型 — 後方互換性のため維持   | 変更なし |
| `ClaudeSDK`        | 既存型 — AgentExecutor で使用中 | 変更なし |

##### 動的 import の型付けパターン解説

- `@anthropic-ai-claude-agent-sdk.d.ts` が `declare module` でモジュール全体の型を宣言しているため、`import()` 式の戻り値型が自動推論される
- `as any` を除去するだけで TypeScript の型推論が有効になる（追加の型アノテーション不要）

##### テストの修正・追加内容

- SDKモックファイル（`@anthropic-ai/claude-agent-sdk.ts`）を新型定義に合わせて更新
- 型安全テスト（TC-004/TC-005）を追加 — 不正引数でのコンパイルエラー検出を検証

##### エッジケースと注意点

- **後方互換性**: 既存の `QueryOptions` / `ClaudeSDK` 型は削除・変更していない。`AgentExecutor.ts` / `agent-client.ts` への影響はゼロ
- **SDK バージョン更新時**: SDK のシグネチャが変更された場合、`d.ts` の型定義も合わせて更新する必要がある。`pnpm typecheck` でコンパイルエラーとして検出される
- **P32（型定義の二箇所同時更新）**: 本タスクでは `packages/shared/src/agent/types.ts` と `apps/desktop/src/preload/types.ts` への変更は不要（スコープ外）

> **注記**: 本タスクは型定義のみの変更であり、新規 API・IPC チャンネル・UI コンポーネントの追加はないため、`api-documentation.md` / `ipc-documentation.md` / `component-documentation.md` の個別作成は不要。実装ガイド Part 2 に変更内容を集約する。

#### 成果物

| 成果物     | 配置先                                     |
| ---------- | ------------------------------------------ |
| 実装ガイド | `outputs/phase-12/implementation-guide.md` |

---

### Task 2: システム仕様書更新（spec-update-workflow.md 準拠）

4つのサブステップで構成される。全ステップを漏れなく実行すること。

#### Step 1-A: タスク完了記録

以下の全項目を更新する（**2ファイル更新が必要なものは両方**）:

| No. | 更新対象                              | 更新内容                                                      | 完了 |
| --- | ------------------------------------- | ------------------------------------------------------------- | ---- |
| 1   | `interfaces-agent-sdk-executor.md`    | 完了タスクセクションに TASK-9B-I 追加（as any除去、型安全化） | [ ]  |
| 2   | `interfaces-agent-sdk.md`             | 型定義変更内容を反映（QueryCallOptions等の新型追加記録）      | [ ]  |
| 3   | `interfaces-agent-sdk-skill.md`       | Skill実行関連の型安全化記録（該当する場合）                   | [ ]  |
| 4   | `aiworkflow-requirements/LOGS.md`     | TASK-9B-I 完了記録追加                                        | [ ]  |
| 5   | `task-specification-creator/LOGS.md`  | TASK-9B-I 完了記録追加（**No.4と両方必須**）                  | [ ]  |
| 6   | `aiworkflow-requirements/SKILL.md`    | 変更履歴テーブルに TASK-9B-I 追加                             | [ ]  |
| 7   | `task-specification-creator/SKILL.md` | 変更履歴テーブルに TASK-9B-I 追加（**No.6と両方必須**）       | [ ]  |

> **注意（P1/P25）**: LOGS.md は `aiworkflow-requirements/LOGS.md` と `task-specification-creator/LOGS.md` の**2ファイル両方**を更新すること。片方のみの更新は不完全。

> **注意（P29）**: SKILL.md の変更履歴テーブルも LOGS.md と同時に更新すること。

#### Step 1-B: 実装状況テーブル更新

| No. | 確認対象                       | 更新内容                               | 完了 |
| --- | ------------------------------ | -------------------------------------- | ---- |
| 1   | `api-endpoints.md`             | 該当なし（API エンドポイント変更なし） | [ ]  |
| 2   | 関連する実装ステータステーブル | 該当する場合はステータスを更新         | [ ]  |

> 本タスクは型レベルのみの変更のため、Step 1-B で更新対象がない可能性がある。その場合は「該当なし」と明記する。

#### Step 1-C: 関連タスクテーブル更新

以下の手順で関連仕様書を検索し、タスクテーブルを更新する:

```bash
# 関連仕様書の検索
grep -rn "TASK-9B-I" .claude/skills/aiworkflow-requirements/references/
grep -rn "TASK-9B-I" .claude/skills/task-specification-creator/references/
grep -rn "sdk-formal-integration" .claude/skills/aiworkflow-requirements/references/
```

| No. | 確認内容                                             | 完了 |
| --- | ---------------------------------------------------- | ---- |
| 1   | `grep` で関連仕様書を全件検索した                    | [ ]  |
| 2   | 発見した仕様書のタスクテーブルのステータスを更新した | [ ]  |
| 3   | 関連仕様書が0件の場合は「関連仕様書なし」と明記した  | [ ]  |

#### Step 1-D: topic-map.md 再生成

```bash
# topic-map.md の再生成
node .claude/skills/aiworkflow-requirements/generate-index.js
node .claude/skills/task-specification-creator/generate-index.js
```

| No. | 確認内容                                                     | 完了 |
| --- | ------------------------------------------------------------ | ---- |
| 1   | `generate-index.js` を実行して topic-map.md を再生成した     | [ ]  |
| 2   | 再生成後の topic-map.md に新規追加セクションが反映されている | [ ]  |

    - [ ] ESLint キャッシュをクリアして lint を再実行した（`pnpm --filter @repo/desktop lint --cache=false`）

> **注意（P2/P27）**: 仕様書に変更があった場合は**必ず** topic-map.md を再生成する。セクションの追加だけでなく、削除・更新も再生成トリガーに含める。

#### Step 2: システム仕様更新（条件付き）

型定義ファイル（`@anthropic-ai-claude-agent-sdk.d.ts`）の変更があるため、以下のシステム仕様書を更新する:

| No. | 更新対象                           | 更新内容                                                             | 完了 |
| --- | ---------------------------------- | -------------------------------------------------------------------- | ---- |
| 1   | `interfaces-agent-sdk.md`          | `QueryCallOptions`, `Conversation`, `SDKMessage` 等の新型定義を記録  | [ ]  |
| 2   | `interfaces-agent-sdk-executor.md` | SkillExecutor `callSDKQuery` の型安全化仕様を更新（as any → 型安全） | [ ]  |
| 3   | `arch-electron-services.md`        | SkillExecutor セクションの型安全性に関する記述を更新（該当する場合） | [ ]  |

> **注意（P31）**: 複数のシステム仕様書を同時に更新する必要がある。一部のファイル更新を忘れないこと。

#### 成果物

| 成果物                     | 配置先               |
| -------------------------- | -------------------- |
| 更新されたシステム仕様書群 | 各仕様書の元の配置先 |

---

### Task 3: ドキュメント更新履歴（documentation-changelog.md）

Phase 12 で更新した全仕様書の変更内容を documentation-changelog.md に記録する。

#### 記録必須項目

| No. | 記録項目                                               | 完了 |
| --- | ------------------------------------------------------ | ---- |
| 1   | 更新した全仕様書のファイル名と変更内容                 | [ ]  |
| 2   | Step 1-A の完了結果（各項目の更新内容を詳細に記録）    | [ ]  |
| 3   | Step 1-B の完了結果（「該当なし」の場合も明記）        | [ ]  |
| 4   | Step 1-C の完了結果（検索結果と更新内容を記録）        | [ ]  |
| 5   | Step 1-D の完了結果（topic-map.md の再生成結果を記録） | [ ]  |
| 6   | Step 2 の完了結果（各仕様書の更新内容を記録）          | [ ]  |
| 7   | Task 4 の検出結果（未タスク件数と対応状況を記録）      | [ ]  |

> **注意（P4）**: 全 Step の確認が完了するまで「Phase 12 完了」と記載しない。各 Step の完了結果を逐次記録し、全 Step 完了後に初めて「完了」と記載する。

#### 成果物

| 成果物               | 配置先                                        |
| -------------------- | --------------------------------------------- |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-changelog.md` |

---

### Task 4: 未タスク検出レポート（0件でも出力必須）

本タスクの実装過程およびレビュー結果から、スコープ外の未解決課題を検出する。**0件の場合でもレポートの作成は必須**。

#### 検出ソース

| No. | 検出ソース                              | 確認方法                                                                                          | 完了 |
| --- | --------------------------------------- | ------------------------------------------------------------------------------------------------- | ---- |
| 1   | Phase 1 スコープ外項目                  | `outputs/phase-1/requirements-definition.md` のスコープ外セクションを確認                         | [ ]  |
| 2   | Phase 10 レビュー MINOR 指摘事項        | `outputs/phase-10/final-review-result.md` の MINOR 指摘を確認                                     | [ ]  |
| 3   | Phase 11 手動テストのスコープ外発見事項 | `outputs/phase-11/manual-test-report.md` のスコープ外項目を確認                                   | [ ]  |
| 4   | ソースコード内の TODO/FIXME コメント    | `grep -rn "TODO\|FIXME\|HACK\|XXX" apps/desktop/src/main/services/skill/SkillExecutor.ts`         | [ ]  |
| 5   | 型定義ファイル内の TODO/FIXME コメント  | `grep -rn "TODO\|FIXME\|HACK\|XXX" packages/shared/src/agent/@anthropic-ai-claude-agent-sdk.d.ts` | [ ]  |

#### 未タスク発見時の3ステップ（全完了必須）

未タスクを発見した場合は、以下の3ステップを**全て完了**する:

| ステップ | 内容                                                  | 完了 |
| -------- | ----------------------------------------------------- | ---- |
| 1        | `unassigned-task/` ディレクトリに未タスク指示書を作成 | [ ]  |
| 2        | `task-workflow.md` の残課題テーブルに登録             | [ ]  |
| 3        | 関連仕様書に参照リンクを追加                          | [ ]  |

> **注意（P3）**: 指示書の作成だけでは不完全。3ステップ全てを完了すること。

#### 未タスク候補（Phase 1 スコープ外からの参考）

| 候補                                       | 検出元             | 対応要否の判断 |
| ------------------------------------------ | ------------------ | -------------- |
| SDK 機能追加（新規メソッド呼び出し）       | Phase 1 スコープ外 | 要確認         |
| SkillExecutor のビジネスロジック変更       | Phase 1 スコープ外 | 要確認         |
| AgentExecutor / agent-client の修正        | Phase 1 スコープ外 | 要確認         |
| SDK バージョンアップ（^0.2.5 → 最新）      | Phase 1 スコープ外 | 要確認         |
| 動的 import から top-level import への変更 | Phase 1 スコープ外 | 要確認         |

#### 成果物

| 成果物               | 配置先                                          |
| -------------------- | ----------------------------------------------- |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-detection.md` |

---

## Phase 12 固有の注意事項（漏れやすいポイント）

| No. | 漏れパターン                     | 防止策                                                                          | 関連Pitfall |
| --- | -------------------------------- | ------------------------------------------------------------------------------- | ----------- |
| 1   | LOGS.md 片方のみ更新             | 2ファイル（aiworkflow-requirements / task-specification-creator）両方を更新する | P1/P25      |
| 2   | SKILL.md 変更履歴の更新漏れ      | LOGS.md と同時に SKILL.md も更新する                                            | P29         |
| 3   | topic-map.md 未再生成            | 仕様書に変更があれば**必ず** `generate-index.js` を実行                         | P2/P27      |
| 4   | 未タスク3ステップ不完全          | 指示書 -> テーブル -> リンクの3ステップ全完了を確認                             | P3          |
| 5   | documentation-changelog 早期完了 | 全 Step 確認後に初めて「完了」と記載する                                        | P4          |
| 6   | システム仕様書の一部更新忘れ     | 更新対象仕様書リスト（Step 1-A/Step 2）を全件チェック                           | P31         |
| 7   | 型定義変更時の関連仕様書漏れ     | `interfaces-*.md` と `arch-*.md` の両方を確認                                   | P31/P32     |

---

## 参照資料

| 参照資料                      | パス                                                                                              | 内容                               |
| ----------------------------- | ------------------------------------------------------------------------------------------------- | ---------------------------------- |
| Phase 1 要件定義書            | `outputs/phase-1/requirements-definition.md`                                                      | FR/NFR・スコープの参照             |
| Phase 2 型マッピング          | `outputs/phase-2/type-mapping.md`                                                                 | 型の対応表                         |
| Phase 5 実装成果物            | 修正済み `SkillExecutor.ts`, 更新済み型定義ファイル                                               | 実装内容の参照                     |
| Phase 9 品質レポート          | `outputs/phase-9/quality-report.md`                                                               | 品質検証結果の参照                 |
| Phase 10 レビュー結果         | `outputs/phase-10/final-review-result.md`                                                         | MINOR 指摘の参照                   |
| Phase 11 手動テスト結果       | `outputs/phase-11/manual-test-report.md`                                                          | 手動テスト結果の参照               |
| spec-update-workflow          | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`                    | システム仕様書更新手順             |
| 既知の落とし穴                | `.claude/rules/06-known-pitfalls.md`                                                              | P1-P4, P25, P27, P29, P31, P32     |
| interfaces-agent-sdk          | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md`                       | SDK型定義仕様                      |
| interfaces-agent-sdk-executor | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor.md`              | SkillExecutor インターフェース仕様 |
| interfaces-agent-sdk-skill    | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`                 | Skill実行関連仕様                  |
| arch-electron-services        | `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md`                     | Electronサービスアーキテクチャ     |
| タスクワークフロー            | `../../.claude/skills/aiworkflow-requirements/references/task-workflow.md`                        | 未タスク登録先の残課題テーブル     |
| 開発ガイドライン              | `../../.claude/skills/aiworkflow-requirements/references/development-guidelines.md`               | TypeScript 型安全開発原則          |
| 実装パターン集                | `../../.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | P32 型定義二箇所同時更新パターン   |

---

## 実行手順

### Step 1: Task 1 — 実装ガイド作成

1. Phase 1〜11 の全成果物を参照し、実装の全体像を把握する
2. Part 1（概念説明）を作成する — 日常の例え話を3つ以上含める
3. Part 2（技術詳細）を作成する — Before/After コード比較を必ず含める
4. `outputs/phase-12/implementation-guide.md` に配置する

### Step 2: Task 2 — システム仕様書更新

1. **Step 1-A**: タスク完了記録（7項目全て更新）
   - LOGS.md を**2ファイル**更新する
   - SKILL.md を**2ファイル**更新する
   - `interfaces-agent-sdk-executor.md` に完了タスク追加
   - `interfaces-agent-sdk.md` に型定義変更を反映
2. **Step 1-B**: 実装状況テーブル更新（該当なしの場合も明記）
3. **Step 1-C**: `grep` で関連仕様書を検索し、タスクテーブルを更新
4. **Step 1-D**: `generate-index.js` を実行して topic-map.md を再生成
5. **Step 2**: `interfaces-agent-sdk.md` / `interfaces-agent-sdk-executor.md` のシステム仕様を更新

### Step 3: Task 3 — documentation-changelog.md 作成

1. Step 2 までに更新した全仕様書の変更内容を記録する
2. 各 Step（1-A/1-B/1-C/1-D/Step 2）の完了結果を詳細に記録する
3. 「該当なし」の項目も明記する
4. **全 Step の結果が記録されるまで「完了」と記載しない**

### Step 4: Task 4 — 未タスク検出レポート作成

1. 5つの検出ソースを全て確認する
2. 未タスクが発見された場合は3ステップを全完了する
3. 未タスクが0件の場合も「未タスク 0 件」としてレポートを作成する
4. `outputs/phase-12/unassigned-task-detection.md` に配置する

### Step 5: artifacts.json 更新

1. `artifacts.json` の Phase 12 ステータスを `completed` に更新する
2. 成果物パスを artifacts 配列に追加する

---

## 成果物

| 成果物                 | 説明                                            | 配置先                                          |
| ---------------------- | ----------------------------------------------- | ----------------------------------------------- |
| 実装ガイド             | Part 1（概念説明）+ Part 2（技術詳細）          | `outputs/phase-12/implementation-guide.md`      |
| ドキュメント更新履歴   | 全仕様書の変更内容と各 Step の完了結果          | `outputs/phase-12/documentation-changelog.md`   |
| 未タスク検出レポート   | 検出結果と対応状況（0件でも出力必須）           | `outputs/phase-12/unassigned-task-detection.md` |
| 更新済みシステム仕様書 | interfaces-agent-sdk\*.md, LOGS.md, SKILL.md 等 | 各仕様書の元の配置先                            |

---

## 苦戦箇所の記録【推奨】

Phase 1-11 の実行中に苦戦した箇所を記録し、`task-specification-creator/references/patterns.md` に成功/失敗パターンとして追加する。

| 記録項目         | 内容             |
| ---------------- | ---------------- |
| 苦戦した Phase   | （実行時に記録） |
| 問題の概要       | （実行時に記録） |
| 解決策           | （実行時に記録） |
| パターン化の可否 | （実行時に記録） |

---

## 完了条件

### Task 1: 実装ガイド

- [ ] Part 1（概念説明）に日常の例え話が3つ以上含まれている
- [ ] Part 1 で専門用語を使う場合は即座に説明が付いている
- [ ] Part 2（技術詳細）に Before/After コード比較が含まれている
- [ ] Part 2 に型定義の変更内容テーブルが含まれている
- [ ] Part 2 にエッジケースと注意点が記載されている
- [ ] `outputs/phase-12/implementation-guide.md` に配置されている

### Task 2: システム仕様書更新

- [ ] `interfaces-agent-sdk-executor.md` に完了タスクセクションが追加されている
- [ ] `interfaces-agent-sdk.md` に型定義変更が反映されている
- [ ] `aiworkflow-requirements/LOGS.md` が更新されている
- [ ] `task-specification-creator/LOGS.md` が更新されている（**2ファイル両方**）
- [ ] `aiworkflow-requirements/SKILL.md` の変更履歴が更新されている
- [ ] `task-specification-creator/SKILL.md` の変更履歴が更新されている（**2ファイル両方**）
- [ ] Step 1-B の実装状況テーブルが確認されている（該当なしの場合も明記）
- [ ] Step 1-C の関連タスクテーブルが `grep` で検索・更新されている
- [ ] Step 1-D で topic-map.md が再生成されている
- [ ] Step 2 でシステム仕様が更新されている

### Task 3: documentation-changelog.md

- [ ] 更新した全仕様書の変更内容が記録されている
- [ ] 各 Step の完了結果が詳細に記録されている
- [ ] 「該当なし」の項目が明記されている
- [ ] 全 Step 確認後に「完了」と記載されている（早期記載でない）
- [ ] `outputs/phase-12/documentation-changelog.md` に配置されている

### Task 4: 未タスク検出レポート

- [ ] 5つの検出ソースが全て確認されている
- [ ] 未タスクが発見された場合は3ステップ全完了している（指示書 -> テーブル -> リンク）
- [ ] 未タスクが0件の場合もレポートが作成されている
- [ ] `outputs/phase-12/unassigned-task-detection.md` に配置されている

### 全体

- [ ] `artifacts.json` の Phase 12 ステータスが更新されている
- [ ] 全4タスクの成果物が所定の配置先に存在する
- [ ] 本Phase内の全タスクを100%実行完了した

---

## 次Phase

**Phase 13: 完了・PR作成** — 成果物最終確認とPR準備
