# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目       | 内容                               |
| ---------- | ---------------------------------- |
| Phase      | 6                                  |
| Phase名    | テスト拡充                         |
| 前提Phase  | Phase 5                            |
| 後続Phase  | Phase 7                            |
| ステータス | 未実施                             |
| 作成日     | 2026-04-14                         |
| 機能名     | UT-IMP-IPC-4LAYER-ALIGNMENT-CI-001 |
| タスク分類 | 改善（NON_VISUAL）                 |

---

## 目的

Phase 4-5 で作成した正常系テストに加え、fail path、回帰ガード、エッジケースのテストを追加する。境界条件や異常入力に対するスクリプトの堅牢性を検証し、本番運用で遭遇しうる全パターンをカバーする。

## 背景

Phase 5 で TDD Green を達成し、正常系の動作は保証された。しかし、本番環境では以下のようなエッジケースが発生しうる:

- チャネル定義ファイルが空の場合
- コメントアウトされたチャネルが残存する場合
- テンプレートリテラルによる動的チャネル生成が使用される場合
- ファイルフォーマットが想定外の場合

これらのケースに対してスクリプトが適切に振る舞うことを検証し、回帰テストとして定着させる。

---

## 実行タスク

> 以下のタスクを順番に実行してください。
>
> **Task / Step 分離ルール**
>
> - このセクションには plan のみを書く。
> - 実行結果、判定、取得値は `Phase実行記録` または `outputs/phase-6/` 配下の成果物へ記録する。

### タスク1: Fail Path テスト追加

**目的**: 各バリデーションルールの失敗経路を網羅的にテストする

**実行手順**:

1. Phase 4 のテスト仕様書（`outputs/phase-4/test-specification.md`）で定義した異常系パターンを確認する
2. 以下の Fail Path テストを追加する:

**Rule-1 Fail Path（shared → preload 不整合）**:

- shared に 1 件のチャネルが追加され preload に未登録の場合、該当チャネル名を含むエラーメッセージが出力されること
- shared に複数チャネルが追加され preload に一部のみ登録されている場合、未登録分のみがエラーとして報告されること
- エラー出力に対象ファイルパス（`apps/desktop/src/preload/channels.ts`）が含まれること

**Rule-2 Fail Path（preload → main 不整合）**:

- preload に登録済みだが main handler ファイルが存在しない場合のエラーハンドリング
- preload に登録済みだが対応する `ipcMain.handle` / `ipcMain.on` が未実装の場合のエラー出力
- 複数の Handler ファイルにまたがるチャネルの一部が欠損している場合の検出

**Rule-3 Fail Path（renderer → shared 不整合）**:

- renderer で使用されているが shared に未定義のチャネルがある場合のエラー出力
- `safeInvoke` と `safeOn` で異なる未定義チャネルが使用されている場合の複合検出

**複合 Fail Path**:

- Rule-1, Rule-2, Rule-3 が同時に失敗する場合、全ルールのエラーが漏れなく出力されること
- 複合エラー時の exit code が 1 であること
- エラーメッセージの出力順序が Rule-1 → Rule-2 → Rule-3 の順であること

**期待される成果物**:

- Fail Path テストケース一覧（`outputs/phase-6/expanded-test-cases.md` の「Fail Path」セクション）

---

### タスク2: 回帰ガードテスト追加

**目的**: FB-SC-13-1（ALLOWED_INVOKE_CHANNELS 追記漏れ）の再発を防止する回帰テストを追加する

**実行手順**:

1. FB-SC-13-1 の発生パターン（新チャネル追加時の preload whitelist 追記漏れ）を再現するテストフィクスチャを作成する
2. 以下の回帰テストを追加する:

**FB-SC-13-1 再発防止テスト**:

- `analytics:trackEvent` チャネルが shared に追加され preload に未登録の状態を再現し、Rule-1 で検出されること
- 新規チャネル追加のシミュレーション（フィクスチャに1チャネル追加）で不整合が検出されること

**チャネル削除時の回帰テスト**:

- shared からチャネルを削除したが preload に残存している場合の挙動（WARNING レベル）
- main handler からチャネル登録を削除したが preload に残存している場合の挙動

**チャネル名変更時の回帰テスト**:

- チャネル名を変更（例: `skill:execute` → `skill:run`）した際に、4層全てで変更されていない場合の検出
- shared で変更済み・preload で未変更の場合、旧名が preload 余剰として、新名が shared 不足として報告されること

**期待される成果物**:

- 回帰テスト結果（`outputs/phase-6/regression-test-result.md`）

---

### タスク3: エッジケーステスト追加

**目的**: 境界条件や異常入力に対するスクリプトの堅牢性を検証する

**実行手順**:

1. Phase 2 テスト戦略書のエッジケース一覧を確認する
2. 以下のエッジケーステストを追加する:

**空のチャネル定義**:

- shared channels.ts にチャネル定義が 0 件の場合、エラーではなく正常終了（exit 0）すること
- preload whitelist が空の場合、shared にチャネルが存在すれば Rule-1 エラーが報告されること
- main handler ファイルが 0 件の場合の挙動

**コメントアウトされたチャネル**:

- `// 'channel:name'` のように行コメントされたチャネルが抽出対象外であること
- `/* ... 'channel:name' ... */` のようにブロックコメントされたチャネルが抽出対象外であること
- コメントと有効なチャネルが混在する場合、有効なチャネルのみが抽出されること

**動的生成チャネル**:

- テンプレートリテラル（`` `${prefix}:${action}` ``）で生成されたチャネル名が検出された場合、WARNING として報告されること（静的解析の限界として）
- 変数参照によるチャネル名指定（`const ch = getChannel(); ipcMain.handle(ch, ...)`）が検出された場合、WARNING として報告されること

**フォーマット不正ファイル**:

- UTF-8 BOM 付きファイルが正しく読み取れること
- Windows 改行コード（CRLF）のファイルが正しく処理されること
- 対象ファイルが存在しない場合、明確なエラーメッセージと共に exit 1 で終了すること
- 対象ファイルの読み取り権限がない場合の適切なエラーハンドリング

**大規模チャネル定義**:

- チャネル数が 100 件を超える場合でも NFR-1（30 秒以内）を満たすこと
- 重複チャネル名がある場合の処理（Set による自動重複排除の確認）

**期待される成果物**:

- エッジケーステスト結果（`outputs/phase-6/edge-case-result.md`）

---

### タスク4: テスト実行・結果集約

**目的**: Phase 4 の既存テストと本 Phase で追加した全テストを実行し、結果を集約する

**実行手順**:

1. 全テストスイートを実行する
2. 追加テストのうち、実装で対応済みのケースが Green であることを確認する
3. 実装で未対応のケース（WARNING レベルの動的チャネル検出など）がある場合、対応方針を記録する
4. テストカバレッジの概要を記録する

**実行コマンド**:

```bash
pnpm vitest run scripts/__tests__/verify-ipc-4layer/ --reporter=verbose 2>&1
```

**判定基準**:

- Phase 4 の既存テストが全件 PASS を維持していること（回帰なし）
- 新規追加テストの PASS/FAIL 状況が記録されていること
- FAIL のテストがある場合、原因が「未実装機能」であり「実装バグ」ではないことが明確であること

**期待される成果物**:

- 各成果物ファイルにテスト実行結果を記録

---

### タスク5: テスト拡充に伴う実装修正

**目的**: エッジケーステストで発見された未対応パターンに対する実装修正を行う

**実行手順**:

1. タスク4 で FAIL となったテストケースを分類する:
   - カテゴリA: 即時修正が必要なケース（ファイル不存在時のエラーハンドリングなど）
   - カテゴリB: 設計判断が必要なケース（動的チャネルの WARNING 出力など）
   - カテゴリC: Phase 8（リファクタリング）で対応するケース
2. カテゴリA のケースに対して実装を修正する
3. カテゴリB のケースに対して対応方針を記録する
4. 修正後、全テストを再実行して回帰がないことを確認する

**期待される成果物**:

- 実装修正内容の記録（`outputs/phase-6/expanded-test-cases.md` の「実装修正」セクション）

---

## 参照資料

| 参照資料                   | パス                                             | 内容                           |
| -------------------------- | ------------------------------------------------ | ------------------------------ |
| Phase 1 要件定義書         | `outputs/phase-1/requirements-definition.md`     | 機能要件・非機能要件           |
| Phase 1 受け入れ基準       | `outputs/phase-1/acceptance-criteria.md`         | AC-1〜AC-8                     |
| Phase 2 アーキテクチャ設計 | `outputs/phase-2/architecture-design.md`         | モジュール構成・責務分離       |
| Phase 2 検証アルゴリズム   | `outputs/phase-2/validation-algorithm-design.md` | 正規表現パターン・検証ロジック |
| Phase 2 テスト戦略         | `outputs/phase-2/test-strategy.md`               | テスト分類・エッジケース方針   |
| Phase 4 テスト仕様書       | `outputs/phase-4/test-specification.md`          | 全テストケースの設計・仕様     |
| Phase 4 Red テスト結果     | `outputs/phase-4/red-test-result.md`             | TDD Red 確認結果               |
| Phase 4 統合テスト計画     | `outputs/phase-4/integration-test-plan.md`       | 層間連携テストシナリオ         |
| Phase 5 実装サマリー       | `outputs/phase-5/implementation-summary.md`      | 実装内容・TDD Green 確認       |
| Phase 5 変更ファイル一覧   | `outputs/phase-5/changed-files.md`               | 新規作成・修正ファイル一覧     |
| Phase 5 契約差分記録       | `outputs/phase-5/contract-diff.md`               | IPC契約への影響差分            |

### システム仕様（aiworkflow-requirements）

> テスト拡充時に以下のシステム仕様を参照し、エッジケースがシステム仕様の想定範囲と整合することを確認してください。

| 参照資料     | パス                                                                                                                      | 内容                      |
| ------------ | ------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| IPC命名監査  | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns-reference-ipc-naming.md`          | 命名規則と監査パターン    |
| IPC契約監査  | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns-reference-ipc-contract-audits.md` | データフロー型ギャップ    |
| 実装パターン | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns-core.md`                          | IPCライフサイクルパターン |
| 品質要件     | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                                               | 回帰検証基準              |
| 教訓         | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                                                    | 過去の回帰教訓            |

### FB-SC-13-1 関連資料

| 参照資料          | パス                                                   | 内容                                       |
| ----------------- | ------------------------------------------------------ | ------------------------------------------ |
| FB-SC-13-1 発生元 | Issue #2117 / UT-SKILL-WIZARD-W4-ANALYTICS-BACKEND-001 | ALLOWED_INVOKE_CHANNELS 追記漏れの発生経緯 |

---

## 成果物

| 成果物               | パス                                        | 内容                                      |
| -------------------- | ------------------------------------------- | ----------------------------------------- |
| 拡張テストケース一覧 | `outputs/phase-6/expanded-test-cases.md`    | Fail Path・回帰・エッジケースのテスト一覧 |
| 回帰テスト結果       | `outputs/phase-6/regression-test-result.md` | FB-SC-13-1 回帰ガード検証結果             |
| エッジケース結果     | `outputs/phase-6/edge-case-result.md`       | 境界条件・異常入力テスト結果              |

---

## 統合テスト連携（Phase 1〜11は必須）

- 回帰ガード連携: FB-SC-13-1 の再発シナリオが検証スクリプトで自動検出されることをテストで保証する
- エッジケース連携: ファイル不存在・フォーマット不正などの異常系でスクリプトが適切に exit 1 を返すことを保証する
- CI 連携: 拡充テストが CI 環境（GitHub Actions）でも正常に実行されることを確認する
- Phase 4 テスト回帰: 本 Phase のテスト追加により、Phase 4 の既存テストが壊れていないことを確認する

---

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] Fail Path テストが全バリデーションルール（Rule-1〜Rule-3）に対して追加されている
- [ ] 複合 Fail Path テスト（複数ルール同時失敗）が追加されている
- [ ] FB-SC-13-1 回帰ガードテストが追加され PASS している
- [ ] エッジケーステスト（空定義、コメントアウト、動的生成、フォーマット不正）が追加されている
- [ ] Phase 4 の既存テストが全件 PASS を維持している（回帰なし）
- [ ] カテゴリA の即時修正が完了し、対応テストが Green
- [ ] カテゴリB の対応方針が記録されている
- [ ] 全テストスイートの実行結果が記録されている
- [ ] 本Phase内の全タスクを100%実行完了

---

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] Phase 4 既存テストの回帰なしが確認されていること

---

## 依存関係

- **前提**: Phase 5 が完了していること（TDD Green 達成済み）
- **後続**: Phase 7 へ進む

---

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 6 実行記録

### 実行タスク

- タスク1 Fail Path テスト追加: {{result}}
- タスク2 回帰ガードテスト追加: {{result}}
- タスク3 エッジケーステスト追加: {{result}}
- タスク4 テスト実行・結果集約: {{result}}
- タスク5 テスト拡充に伴う実装修正: {{result}}

### テスト実行結果サマリー

- 既存テスト（Phase 4）: {{count}}件 PASS / {{count}}件 FAIL
- Fail Path テスト: {{count}}件 PASS / {{count}}件 FAIL
- 回帰テスト: {{count}}件 PASS / {{count}}件 FAIL
- エッジケーステスト: {{count}}件 PASS / {{count}}件 FAIL
- 合計: {{count}}件 PASS / {{count}}件 FAIL

### 実装修正

- カテゴリA（即時修正）: {{count}}件
- カテゴリB（設計判断要）: {{count}}件
- カテゴリC（Phase 8 対応）: {{count}}件

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/UT-IMP-IPC-4LAYER-ALIGNMENT-CI-001/phase-7-coverage-check.md`
