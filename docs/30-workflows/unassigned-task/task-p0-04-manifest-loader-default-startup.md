# TASK-P0-04: ManifestLoader デフォルト起動の実装 - タスク実行仕様書

## メタ情報

```yaml
issue_number: 1722
```

## メタ情報

| 項目       | 値                                                         |
| ---------- | ---------------------------------------------------------- |
| タスクID   | TASK-P0-04                                                 |
| 機能名     | manifest-loader-default-startup                            |
| 作成日     | 2026-03-29                                                 |
| 優先度     | 高                                                         |
| 依存タスク | TASK-P0-03（workflow-manifest.json canonical/mirror 配置） |
| 後続タスク | TASK-P0-05（runtime pipeline フル統合）                    |
| パターン   | seq                                                        |

## 概要

ManifestLoader が runtime pipeline で本番 manifest（`.claude/skills/skill-creator/workflow-manifest.json`）を自動読み込みする機能を実装する。TASK-P0-03 で `.claude` canonical および `.agents` mirror 両方に `workflow-manifest.json` が配置された。本タスクではその manifest を ManifestLoader が起動時に自動的に読み込むデフォルト起動ロジックと、runtime pipeline への統合を行う。

## 問題の背景

- TASK-P0-03 完了により、`.claude/skills/skill-creator/workflow-manifest.json` および `.agents/skills/skill-creator/workflow-manifest.json` が配置された
- ManifestLoader（440行）は manifest の検証・読み込みロジックを実装済みだが、**呼び出し元が存在しない**（起動時にどの manifest を読み込むか指定されていない）
- runtime pipeline は現状 manifest を自動読み込みしておらず、skill-creator ワークフローを自動起動できない
- `apps/desktop/src/main/services/runtime/__tests__/ManifestLoader.production-manifest.test.ts` は本番 manifest の統合テストを定義済みだが、**デフォルト起動パスのテストは未存在**

## 苦戦箇所

### 1. ManifestLoader の複雑な検証ロジック（440行）

ManifestLoader は単純なファイル読み込みではなく、以下の多段階検証を実施する。

- **スキーマバージョン検証**: `schemaVersion` が `WORKFLOW_MANIFEST_SCHEMA_VERSION`（= 1）と一致しているか
- **workflowId 必須検証**: 空文字・undefined を拒否
- **phases 配列検証**: 1件以上、各 phase に `id / title / entryHookId / exitHookId` が必須
- **resources 配列検証**: 各 resource に `id / kind / path` が必須、`kind` は `agent/reference/schema/asset` のいずれか、`optional` は boolean のみ
- **entry/exit hooks 検証**: 各 hook に `id / command` が必須、1件以上の配列
- **参照整合性検証**:
  - `phases[].entryHookId` → `entry[]` に存在する hook を参照しているか
  - `phases[].exitHookId` → `exit[]` に存在する hook を参照しているか
  - `phases[].dependsOn` → 既存の phase ID かつ自身より前の phase か
  - `phases[].resourceIds` → `resources[]` に存在する resource ID か
  - `resources[].phaseIds` → `phases[]` に存在する phase ID か、かつ phase 側の `resourceIds` と双方向一致するか
- **resource path 実在確認**: `optional: false`（デフォルト）の resource は `fs.access()` でファイル存在を確認

この検証を通過する manifest を設計するには、**テストを先に読んで検証ルールを把握するアプローチ**が有効だった（TASK-P0-03 の教訓）。

### 2. canonical（.claude）と mirror（.agents）の二重管理ポリシー

- 正本は `.claude/skills/skill-creator/workflow-manifest.json`
- mirror は `.agents/skills/skill-creator/workflow-manifest.json`
- runtime が実際に読み込むパスと canonical/mirror どちらを参照するかで、実装設計が変わる
- デフォルト起動時のパス解決ロジックに canonical / mirror のどちらを優先するかを決定する必要がある

### 3. デフォルト起動パスの設計

- runtime pipeline 起動時にどの manifest を読み込むかを設定ファイルまたは定数で指定するアーキテクチャ選択が必要
- プロジェクトルートからの相対パス vs 絶対パス vs 環境変数による切り替えのトレードオフ
- Electron の `app.getAppPath()` や `__dirname` など実行コンテキストに依存したパス解決

## 設計方針

### デフォルト起動ロジック

- runtime pipeline 初期化時に、固定のデフォルト manifest パスを読み込む設定定数を追加する
- canonical root（`.claude/skills/skill-creator/workflow-manifest.json`）を基準に、プロジェクトルート相対パスで指定する
- 設定定数は `apps/desktop/src/main/services/skill/constants.ts` または新設の `runtime/constants.ts` に配置する

### パス解決戦略

- `SKILL_CREATOR_MANIFEST_PATH` 定数でプロジェクトルート相対パスを管理
- Electron main process の `app.getPath('userData')` または `process.cwd()` / `__dirname` を起点にパスを解決する
- テスト環境では `projectRoot` からの相対パス解決が使えるよう、DI または設定注入で対応する

### タスク分類

**docs-only ではなくコード実装タスク**。以下の成果物がある。

- runtime pipeline への ManifestLoader デフォルト起動統合コード
- `constants.ts` へのデフォルト manifest パス定数追加
- 統合テスト（deault startup path テスト）

## スコープ

### 対象

- ManifestLoader のデフォルト起動ロジック実装（runtime pipeline 初期化時の自動読み込み）
- デフォルト manifest パス定数の追加（`constants.ts` または新設ファイル）
- 統合テスト：デフォルト起動パスから manifest を正常読み込みできることの確認
- Electron main process でのパス解決ロジック実装
- `ManifestLoader.production-manifest.test.ts` テストのパス（デフォルト起動統合テスト追加）

### 対象外

- ManifestLoader 自体の検証ロジック変更（TASK-P0-03 で設計済み・変更なし）
- workflow-manifest.json の内容変更
- `.agents` mirror 内容の更新（TASK-P0-03 の責務で完了済み）
- runtime pipeline のフル統合（TASK-P0-05 の責務）

## 依存関係

| 種別       | 参照先                                                     | 役割                                                   |
| ---------- | ---------------------------------------------------------- | ------------------------------------------------------ |
| upstream   | TASK-P0-03（workflow-manifest.json canonical/mirror 配置） | 本タスクで読み込む manifest ファイルの提供元           |
| upstream   | `apps/desktop/src/main/services/runtime/ManifestLoader.ts` | 使用するローダークラスの実装                           |
| upstream   | `apps/desktop/src/main/services/skill/constants.ts`        | パス定数の配置先候補                                   |
| peer       | TASK-P0-01/P0-02（verify engine layer1/2）                 | 並列実行可能。manifest loader との依存なし             |
| downstream | TASK-P0-05（runtime pipeline フル統合）                    | 本タスクのデフォルト起動ロジックを pipeline に組み込む |

## 現行コードアンカー

| ファイル                                                                                      | 現状の役割                                  | TASK-P0-04 での扱い                |
| --------------------------------------------------------------------------------------------- | ------------------------------------------- | ---------------------------------- |
| `apps/desktop/src/main/services/runtime/ManifestLoader.ts`                                    | manifest 検証・読み込みロジック（440行）    | 変更なし。呼び出し元を新設する     |
| `.claude/skills/skill-creator/workflow-manifest.json`                                         | canonical manifest（TASK-P0-03 で配置済み） | デフォルト起動で読み込む対象       |
| `.agents/skills/skill-creator/workflow-manifest.json`                                         | mirror manifest（TASK-P0-03 で配置済み）    | parity 確認の参照先                |
| `apps/desktop/src/main/services/runtime/__tests__/ManifestLoader.production-manifest.test.ts` | 本番 manifest 統合テスト                    | デフォルト起動パステストを追加     |
| `apps/desktop/src/main/services/skill/constants.ts`                                           | スキル関連パス定数の定義                    | デフォルト manifest パス定数を追加 |

## 要件レビュー一次結論

| 観点                 | 結論                                                                                                                                                                     |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 真の論点             | ManifestLoader は実装済みで manifest も配置済みだが、**呼び出す主体が存在しない**。デフォルト起動ロジックを追加することで、runtime pipeline が manifest を自動認識できる |
| 依存関係・責務境界   | 本タスクは「デフォルト起動ロジックの追加」と「パス定数の定義」に限定。runtime pipeline フル統合は TASK-P0-05 の責務に分離する                                            |
| 価値とコストの不均衡 | 実装コスト自体は小さいが、パス解決ロジックの設計を誤ると Electron 本番環境と開発環境・テスト環境で動作差異が生じるリスクがある                                           |
| 改善優先順位         | 1. ManifestLoader の呼び出しインターフェースと既存コードの読了 2. デフォルトパス定数の設計 3. デフォルト起動ロジックの実装 4. テスト追加 5. 統合確認                     |
| 4条件評価            | 価値性: 高（P0）/ 実現性: 高（ManifestLoader 実装済み）/ 整合性: `.claude` 正本方針に準拠 / 運用性: 統合テストと定数管理で監査可能                                       |

## 受入基準

| ID   | 基準                                                                                       |
| ---- | ------------------------------------------------------------------------------------------ |
| AC-1 | runtime pipeline 初期化時にデフォルト manifest パスが自動解決・読み込まれる                |
| AC-2 | `SKILL_CREATOR_MANIFEST_PATH`（または同等の）定数が `constants.ts` に追加される            |
| AC-3 | Electron main process の実行コンテキストでパスが正しく解決される（絶対パス変換が機能する） |
| AC-4 | 統合テストでデフォルト起動パスからの manifest 読み込みが検証される                         |
| AC-5 | `ManifestLoader.loadManifest()` 呼び出しがエラーなく完了する                               |
| AC-6 | テスト環境（`projectRoot` 相対）でも本番環境と同じコードパスが使用できる                   |
| AC-7 | manifest が存在しない場合の起動時エラーハンドリングが実装される（適切なエラーメッセージ）  |

## Phase 一覧

| Phase | 名称             | ステータス |
| ----- | ---------------- | ---------- |
| 1     | 要件定義         | pending    |
| 2     | 設計             | pending    |
| 3     | 設計レビュー     | pending    |
| 4     | テスト作成       | pending    |
| 5     | 実装             | pending    |
| 6     | テスト拡充       | pending    |
| 7     | カバレッジ確認   | pending    |
| 8     | リファクタリング | pending    |
| 9     | 品質保証         | pending    |
| 10    | 最終レビュー     | pending    |
| 11    | 手動テスト       | pending    |
| 12    | ドキュメント更新 | pending    |
| 13    | PR作成           | blocked    |

## Phase 詳細

### Phase 1: 要件定義

**目的**: スコープ・受入条件・タスク分類・artifact 命名 canonical 一覧を固定する

**実行タスク**:

1. 既存コード読了: `ManifestLoader.ts`（440行）の `loadManifest()` シグネチャと呼び出しインターフェースを確認する
2. 既存定数確認: `apps/desktop/src/main/services/skill/constants.ts` の現在の定数一覧を調査する
3. runtime pipeline の現状調査: ManifestLoader を呼び出すコードが既に存在するか確認する（grep で `ManifestLoader` 使用箇所を全探索）
4. タスク分類の記録: **コード実装タスク**（UI 変更なし）として確定する
5. artifact 命名 canonical 一覧を確定し、`artifacts.json` の骨格を作成する

**成果物**:

- `outputs/phase-1/requirements-summary.md`（要件・スコープ・タスク分類・artifact 命名一覧）
- `artifacts.json`（初期骨格）

**完了条件**: AC-1〜AC-7 の受入基準が要件として明文化され、スコープ外が確定していること

---

### Phase 2: 設計

**目的**: デフォルト起動ロジックのアーキテクチャ設計とパス解決戦略を確定する

**実行タスク**:

1. Electron main process のパス解決戦略を設計する
   - `app.getAppPath()` / `process.cwd()` / `__dirname` の違いを整理する
   - dev / prod / test 環境でのパスが一致するアプローチを選定する
2. 定数設計: `SKILL_CREATOR_MANIFEST_PATH` の型・値・モジュール配置先を設計する
3. デフォルト起動ロジックの設計: 初期化タイミング（app ready / first request）と呼び出し元の設計
4. エラーハンドリング設計: manifest が存在しない場合の振る舞い（起動失敗 vs 遅延読み込み）
5. テスト容易性の設計: DI パターンまたはパスオーバーライド仕組みの設計

**成果物**:

- `outputs/phase-2/design-document.md`（設計書: アーキテクチャ・パス解決戦略・定数設計・エラーハンドリング設計）

**完了条件**: Phase 3 レビューに必要な設計情報が揃っていること

---

### Phase 3: 設計レビュー

**目的**: Phase 2 設計の整合性を確認し、Phase 4 へ進めるかを判定する

**実行タスク**:

1. 設計レビュー: 以下の観点でレビューを実施する
   - パス解決ロジックが Electron dev / prod / test 環境で動作するか
   - DI または設定注入がテストで使用できるか
   - 既存の `constants.ts` との整合性
   - エラーハンドリングがユーザーへの適切なフィードバックになるか
2. MINOR/MAJOR 判定: 問題があれば分類し、MINOR は未タスク化する

**成果物**:

- `outputs/phase-3/design-review.md`（PASS/FAIL 判定 + 指摘事項一覧）

**完了条件**: PASS 判定が得られ、MAJOR 指摘が 0 件であること

---

### Phase 4: テスト作成

**目的**: デフォルト起動ロジックの統合テストを **テストファースト** で作成する

**実行タスク**:

1. 既存テストの確認: `ManifestLoader.production-manifest.test.ts`（317行）のテスト構造を読了する
2. 新規テストケースの設計（以下を `ManifestLoader.production-manifest.test.ts` に追記する）:
   - `TC-10`: デフォルト起動パス定数から manifest が読み込める
   - `TC-11`: Electron app context でのパス解決が正しく動作する（モック使用）
   - `TC-12`: manifest が存在しない場合にエラーが throw される
   - `TC-13`: 定数 `SKILL_CREATOR_MANIFEST_PATH` が空文字でないことを確認する
3. テストを実行して **Red（失敗）** を確認する（テストファースト）

**コード成果物**（`outputs/` 配下ではなく実ファイルに配置）:

- `apps/desktop/src/main/services/runtime/__tests__/ManifestLoader.production-manifest.test.ts`（TC-10〜TC-13 を追加）

**ドキュメント成果物**:

- `outputs/phase-4/test-plan.md`（テストケース一覧・Red 確認記録）

**完了条件**: 追加したテストが Red（実装前で失敗）であることを確認できること

---

### Phase 5: 実装

**目的**: デフォルト起動ロジックと定数を実装し、Phase 4 のテストを Green にする

**実行タスク**:

1. 定数追加: `apps/desktop/src/main/services/skill/constants.ts` に `SKILL_CREATOR_MANIFEST_PATH` を追加する
2. デフォルト起動ロジック実装: runtime pipeline 初期化処理にデフォルト manifest 読み込みを追加する
3. パス解決実装: Electron main process の実行コンテキストでプロジェクトルートからの相対パスを絶対パスに変換するユーティリティを実装する
4. エラーハンドリング実装: manifest が存在しない場合の適切なエラーメッセージと処理を実装する
5. `pnpm --filter @repo/desktop test` を実行し、Phase 4 のテストが Green になることを確認する

**コード成果物**（実ファイルに配置）:

- `apps/desktop/src/main/services/skill/constants.ts`（`SKILL_CREATOR_MANIFEST_PATH` 追加）
- runtime pipeline 初期化ファイル（既存ファイルに追記）

**ドキュメント成果物**:

- `outputs/phase-5/implementation-summary.md`（実装内容・変更ファイル一覧・テスト結果）

**完了条件**: Phase 4 のテストが全て Green、TypeScript 型チェックが通ること

---

### Phase 6: テスト拡充

**目的**: fail path・回帰 guard・edge case テストを追加し、テストカバレッジを強化する

**実行タスク**:

1. エラーパステスト追加:
   - `EC-10`: パス定数が存在しないファイルを指す場合の振る舞い
   - `EC-11`: manifest ファイルが破損している（JSON parse エラー）場合の振る舞い
   - `EC-12`: `schemaVersion` が不正な manifest を渡した場合の振る舞い
2. キャッシュ動作テスト: デフォルト起動後に invalidate/reload が正しく動作するか
3. 回帰 guard: TASK-P0-03 で定義済みの TC-01〜TC-09 が引き続き通ることを確認する

**コード成果物**:

- `apps/desktop/src/main/services/runtime/__tests__/ManifestLoader.production-manifest.test.ts`（EC-10〜EC-12 追加）

**ドキュメント成果物**:

- `outputs/phase-6/test-expansion-report.md`（追加テスト一覧・全テスト Pass 確認）

**完了条件**: 全テストが Green であること

---

### Phase 7: カバレッジ確認

**目的**: デフォルト起動ロジックのコードカバレッジを可視化し、未テストのブランチを特定する

**実行タスク**:

1. `pnpm --filter @repo/desktop test --coverage` を実行する
2. `ManifestLoader.ts` および新設ファイルのカバレッジレポートを確認する
3. カバレッジが基準値（Lines 80%、Branches 70%）を満たさない場合はテスト追加の候補を記録する

**成果物**:

- `outputs/phase-7/coverage-report.md`（カバレッジ数値・未カバーブランチ・補強候補一覧）

**完了条件**: カバレッジが基準値を満たし、critical branch（エラーパス等）が全て covered であること

---

### Phase 8: リファクタリング

**目的**: 重複・ナビゲーションドリフト・設計課題を解消する

**実行タスク**:

1. Phase 5 実装コードのリファクタリング候補を確認する:
   - パス解決ユーティリティの重複がないか
   - 定数命名が既存コードスタイルと一致するか
   - エラーメッセージが i18n 対応可能なフォーマットか
2. 実装が Phase 2 設計と乖離していないか確認し、設計ドリフトがあれば是正する

**成果物**:

- `outputs/phase-8/refactoring-report.md`（変更内容・リファクタリング根拠）

**完了条件**: リファクタリング後も全テストが Green であること

---

### Phase 9: 品質保証

**目的**: line budget・link・型整合性・mirror parity を一括判定する

**実行タスク**:

1. TypeScript 型チェック: `pnpm --filter @repo/desktop typecheck` を実行する
2. ESLint チェック: `pnpm --filter @repo/desktop lint` を実行する
3. `constants.ts` の変更が downstream に影響しないか確認する
4. `.agents` mirror parity 確認: `.claude` 側の変更が `.agents` に反映されているか（manifest ファイルは TASK-P0-03 完了済みなので確認のみ）

**成果物**:

- `outputs/phase-9/quality-report.md`（typecheck/lint/mirror parity の結果一覧）

**完了条件**: typecheck・lint が PASS、mirror parity が確認されること

---

### Phase 10: 最終レビュー

**目的**: 受入基準（AC-1〜AC-7）の達成状況を確認し、Phase 11 へ進めるかを判定する

**実行タスク**:

1. 受入基準チェックリストを一項目ずつ確認する（AC-1〜AC-7）
2. 残課題を MINOR/MAJOR に分類する
3. MAJOR があれば Phase 5/6 へ戻る
4. MINOR は未タスク候補として記録する

**成果物**:

- `outputs/phase-10/final-review.md`（AC チェックリスト・残課題一覧・PASS/FAIL 判定）

**完了条件**: AC-1〜AC-7 が全て PASS、MAJOR 課題が 0 件であること

---

### Phase 11: 手動テスト

**目的**: Electron 実行環境での動作を人手で確認し、非視覚的な動作（ログ・起動順序）を検証する

**タスク分類**: **NON_VISUAL**（UI 変更なし、コンソールログと runtime 動作確認のみ）

**実行タスク**:

1. Electron 開発環境起動: `pnpm --filter @repo/desktop dev` でアプリを起動する
2. 起動ログ確認: ManifestLoader がデフォルト manifest を読み込んでいることを main process ログで確認する
3. manifest 不在テスト: `.claude/skills/skill-creator/workflow-manifest.json` を一時退避してアプリを再起動し、適切なエラーメッセージが表示されることを確認する（確認後、ファイルを復元する）
4. ウォークスルー記録: 確認内容と結果をテキストで記録する

**成果物**:

- `outputs/phase-11/manual-test-result.md`（ウォークスルー記録・確認項目と結果）

**注意**: NON_VISUAL のため `screenshots/` ディレクトリは不要。`.gitkeep` も配置しないこと。

**完了条件**: 起動ログで manifest 読み込みが確認でき、エラーハンドリングが正しく動作することを確認できること

---

### Phase 12: ドキュメント更新

**目的**: 実装ガイド・システム仕様更新・ドキュメント変更履歴・未タスク検出・スキルフィードバックを完了する

#### Task 12-1: 実装ガイド作成（2パート構成）

**Part 1: 中学生でもわかるレベルの説明**

---

**「自動で準備してくれる設定担当」を作った話**

たとえば、学校のクラブ活動を始める前に「今日は何をするか」の予定表が必要だとします。毎回、部員が自分で予定表を探してきて「今日はこの予定表を使う」と言わないといけないのは面倒ですよね？

そこで、「クラブが始まったら自動的に今日の予定表を取ってくる係」を決めると便利です。

このタスクでやっていることは、まさにそれです。

- **ManifestLoader**（設定読み込み係）は以前から存在していたけれど、誰も「この設定ファイルを読んで」と指示していませんでした
- **TASK-P0-03**（前のタスク）で、「設定ファイル」（`workflow-manifest.json`）を決まった場所に置きました
- **このタスク（TASK-P0-04）**では、「アプリが起動したら自動的にその設定ファイルを読み込む」仕組みを作りました

具体的には：

1. 「設定ファイルはここにある」という**住所（定数）** を決めました
2. アプリが起動したときに**自動でその住所へ取りに行く**処理を追加しました
3. もし住所に設定ファイルがない場合は**わかりやすいエラーを表示する**ようにしました

これで、毎回手動で「この設定を使って」と指定しなくても、アプリが自分で設定を読み込んでくれるようになりました。

---

**Part 2: 技術者向け詳細**

```typescript
// constants.ts に追加する定数
/** skill-creator の workflow manifest デフォルトパス（プロジェクトルート相対） */
export const SKILL_CREATOR_MANIFEST_PATH =
  ".claude/skills/skill-creator/workflow-manifest.json";

// runtime pipeline 初期化での使用例
import { ManifestLoader } from "./ManifestLoader";
import { SKILL_CREATOR_MANIFEST_PATH } from "../skill/constants";
import path from "path";

const loader = new ManifestLoader();
const manifestAbsPath = path.resolve(
  app.getAppPath(), // Electron: プロジェクトルート
  SKILL_CREATOR_MANIFEST_PATH,
);
const manifest = await loader.loadManifest(manifestAbsPath);
```

**エラーハンドリング**:

- `ENOENT`: manifest ファイルが存在しない → 起動失敗 + エラーログ出力
- `SyntaxError`: JSON パースエラー → エラーログ + スタックトレース

**テスト容易性**:

- パス定数を DI で上書き可能にするか、テスト用に `projectRoot` 相対パスを使用する

---

#### Task 12-2: システム仕様更新

| Step     | 内容                                                                                   | 状態 |
| -------- | -------------------------------------------------------------------------------------- | ---- |
| Step 1-A | タスク完了記録（aiworkflow-requirements LOGS.md ×2 更新）                              | 実施 |
| Step 1-B | 実装状況テーブル更新（`completed` に変更）                                             | 実施 |
| Step 1-C | 関連タスクテーブル更新（TASK-P0-03 との後続関係を明記）                                | 実施 |
| Step 2   | 新規インターフェース追加なし → **N/A**（`SKILL_CREATOR_MANIFEST_PATH` は内部定数のみ） | 実施 |

#### Task 12-3: ドキュメント更新履歴

- `outputs/phase-12/documentation-changelog.md` を作成し、Step 1-A〜1-C と Step 2（N/A）を記録する

#### Task 12-4: 未タスク検出レポート（0件でも出力必須）

以下を確認し、`outputs/phase-12/unassigned-task-detection.md` を出力する:

- Phase 3/10 MINOR 指摘
- Phase 11 スコープ外発見事項
- コードコメント内の TODO/FIXME

#### Task 12-5: スキルフィードバックレポート（改善点なしでも出力必須）

- `outputs/phase-12/skill-feedback-report.md` を出力する

---

### Phase 13: PR作成

**目的**: ユーザーの明示的な許可を得てから PR を作成する

**重要**: PR 作成はユーザーの明示的な承認後のみ実施する。自動実行禁止。

**実行タスク**:

1. ユーザーの承認を確認する
2. `pnpm lint` と `pnpm typecheck` を最終確認する
3. `git diff --stat` で変更ファイルを確認する
4. PR タイトルと概要を作成する（英語または日本語、プロジェクト規約に従う）
5. `gh pr create` で PR を作成する

**成果物**:

- GitHub PR URL

**完了条件**: ユーザーが承認し、CI がパスすること

---

## 実行順

1. Phase 1-3 で設計とアーキテクチャを固定する
2. Phase 4 でテストを先に作成し、Red を確認する（テストファースト）
3. Phase 5 で実装し、テストを Green にする
4. Phase 6-9 で edge case・カバレッジ・品質を確認する
5. Phase 10-11 で最終レビューと手動確認を行う
6. Phase 12 でドキュメントを更新する
7. Phase 13 はユーザー指示があるまで blocked のまま維持する

## 完了定義

| 状態                   | 意味                                                                                      |
| ---------------------- | ----------------------------------------------------------------------------------------- |
| `implementation_ready` | Phase 1-3 gate が閉じ、実行担当者が Phase 4 へ進める状態                                  |
| `completed`            | デフォルト起動ロジックが実装され、統合テストが全 Green、TypeScript 型チェックが通った状態 |

## 注意事項

- **テストファーストを徹底する**: Phase 4 でテストを先に書いて Red を確認し、Phase 5 で Green にする（TASK-P0-03 の教訓：ManifestLoader の 440 行の検証ルールをテストで把握してから実装するアプローチが有効）
- **パス解決は Electron 環境を意識する**: `process.cwd()` と `app.getAppPath()` は環境によって異なる場合があり、dev/prod/test で同一パスになるよう設計する
- **ManifestLoader のコードは変更しない**: このタスクは呼び出し元の追加のみを担当する
- **Phase 13 はユーザー承認後のみ**: `--no-verify` オプションの使用は絶対禁止

## 関連ファイル

| ファイル                                                                                      | 役割                                        |
| --------------------------------------------------------------------------------------------- | ------------------------------------------- |
| `apps/desktop/src/main/services/runtime/ManifestLoader.ts`                                    | 使用するローダークラス（変更なし）          |
| `.claude/skills/skill-creator/workflow-manifest.json`                                         | デフォルト起動で読み込む canonical manifest |
| `.agents/skills/skill-creator/workflow-manifest.json`                                         | mirror manifest（parity 確認用）            |
| `apps/desktop/src/main/services/runtime/__tests__/ManifestLoader.production-manifest.test.ts` | 統合テスト（TC-10〜TC-13 追加対象）         |
| `apps/desktop/src/main/services/skill/constants.ts`                                           | デフォルト manifest パス定数の追加先        |
