# Phase 11: 手動テスト（NON_VISUAL） - タスク仕様書

## メタ情報

| 項目       | 内容                               |
| ---------- | ---------------------------------- |
| Phase      | 11                                 |
| Phase名    | 手動テスト（NON_VISUAL）           |
| 前提Phase  | Phase 10                           |
| 後続Phase  | Phase 12                           |
| ステータス | 未実施                             |
| 作成日     | 2026-04-14                         |
| 機能名     | UT-IMP-IPC-4LAYER-ALIGNMENT-CI-001 |
| タスク分類 | 改善（NON_VISUAL）                 |

---

## 目的

CI スクリプト `scripts/verify-ipc-4layer.js` の実環境動作を手動で確認し、自動テストでは検証しきれない統合的な動作保証を得る。NON_VISUAL タスクであるため、UI スクリーンショットではなく、コマンド実行結果・テスト結果・型チェック結果を代替証跡として記録する。

## 背景

Phase 10 の最終レビューゲートを PASS した時点で、自動テスト（Phase 4〜9）による検証は完了している。Phase 11 では、実際のプロジェクトファイルに対してスクリプトを実行し、期待どおりの検出・報告動作が行われることを確認する。本タスクは NON_VISUAL（UIコンポーネントを含まない CI スクリプト実装）であるため、手動テストの証跡は全てコマンド実行結果で代替する。

---

## Phase 11 手動テスト方針（NON_VISUAL）

**分類: NON_VISUAL（非UIタスク）**

本タスクは IPC 4層整合検証 CI スクリプトの実装であり、UIコンポーネントの変更を含まない。

| 項目                      | 内容                                                                        |
| ------------------------- | --------------------------------------------------------------------------- |
| NON_VISUAL である理由     | 対象は Node.js CLI スクリプトであり、UI 描画を伴わない                      |
| primary evidence          | `vitest` 実行結果 / `typecheck` 結果 / `lint` 結果 / スクリプト直接実行結果 |
| screenshot-plan.json      | 生成しない（NON_VISUAL のため不要）                                         |
| screenshots/ ディレクトリ | 作成しない（NON_VISUAL のため不要）                                         |
| placeholder-only 証跡     | PASS 扱いにしない                                                           |

> **注意**: `manual-test-result.md` には各 TC-ID に対する evidence を明記し、NON_VISUAL である理由と代替 evidence の正当性を記載すること。

---

## 実行タスク

> 以下のタスクを順番に実行してください。
>
> **Task / Step 分離ルール**
>
> - このセクションには plan のみを書く。
> - 実行結果、判定、取得値は `Phase実行記録` または `outputs/phase-11/` 配下の成果物へ記録する。

### タスク1: テストケース TC-11-01 実行（全チャネル整合時の正常終了確認）

**目的**: 全4層のチャネルが整合している状態で `verify-ipc-4layer.js` が exit code 0 で正常終了することを確認する

**実行手順**:

1. 現在のプロジェクトで4層のチャネル定義が整合していることを事前確認する
2. `node scripts/verify-ipc-4layer.js` を実行する
3. exit code が 0 であることを確認する
4. stdout に整合性サマリーが出力されていることを確認する
5. 実行結果（コマンド出力全文、exit code）を証跡として記録する

**期待結果**:

- exit code: 0
- stdout: 整合性確認サマリー（チャネル数、検証結果）

**代替 evidence**: スクリプト実行の stdout/stderr キャプチャ + exit code 記録

---

### タスク2: テストケース TC-11-02 実行（preload whitelist 欠損時のエラー検出確認）

**目的**: preload whitelist にチャネルが欠損している状態でエラーが正しく検出されることを確認する

**実行手順**:

1. テスト用の一時的な状態を作成する（フィクスチャファイル使用 or 一時的なファイル変更）
2. shared channels に定義されているが preload whitelist に未登録のチャネルが存在する状態を再現する
3. `node scripts/verify-ipc-4layer.js` を実行する
4. exit code が 1 であることを確認する
5. stderr に未登録チャネル名を含むエラーメッセージが出力されていることを確認する
6. テスト後に変更を元に戻す（変更した場合）
7. 実行結果を証跡として記録する

**期待結果**:

- exit code: 1
- stderr: 未登録チャネル名を含むエラーメッセージ

**代替 evidence**: スクリプト実行の stdout/stderr キャプチャ + exit code 記録、または対応する vitest テスト結果

---

### タスク3: テストケース TC-11-03 実行（main handler 未実装時のエラー検出確認）

**目的**: main handler にチャネルが未実装の状態でエラーが正しく検出されることを確認する

**実行手順**:

1. テスト用の一時的な状態を作成する（フィクスチャファイル使用 or 一時的なファイル変更）
2. preload whitelist に登録されているが main handler に未実装のチャネルが存在する状態を再現する
3. `node scripts/verify-ipc-4layer.js` を実行する
4. exit code が 1 であることを確認する
5. stderr に未実装チャネル名を含むエラーメッセージが出力されていることを確認する
6. テスト後に変更を元に戻す（変更した場合）
7. 実行結果を証跡として記録する

**期待結果**:

- exit code: 1
- stderr: 未実装チャネル名を含むエラーメッセージ

**代替 evidence**: スクリプト実行の stdout/stderr キャプチャ + exit code 記録、または対応する vitest テスト結果

---

### タスク4: テストケース TC-11-04 実行（GitHub Actions ワークフロー定義の構文検証）

**目的**: GitHub Actions ワークフロー定義が正しい YAML 構文であり、検証ステップが含まれていることを確認する

**実行手順**:

1. `.github/workflows/` 配下の関連ワークフローファイルを特定する
2. ワークフロー定義に `verify-ipc-4layer.js` を実行するステップが含まれていることを確認する
3. YAML 構文が正しいことを確認する（`actionlint` または手動確認）
4. トリガー条件（PR 時 / push 時）が設計どおりであることを確認する
5. 確認結果を証跡として記録する

**期待結果**:

- ワークフロー定義に検証ステップが存在する
- YAML 構文エラーがない
- トリガー条件が設計書（Phase 2）と一致する

**代替 evidence**: ワークフローファイルの該当行抜粋 + 構文チェック結果

---

### タスク5: 手動テスト結果記録

**目的**: 全テストケースの結果を統合し、手動テスト結果ファイルと証跡インデックスを作成する

**実行手順**:

1. TC-11-01〜TC-11-04 の結果を集約する
2. `manual-test-result.md` に以下を記録する:
   - NON_VISUAL 判定理由
   - 代替 evidence の正当性説明
   - 各 TC-ID の判定結果と evidence へのリンク
3. `evidence-index.md` に証跡一覧を記録する
4. 全 TC が PASS であることを確認する

**期待される成果物**:

- 手動テスト結果（`outputs/phase-11/manual-test-result.md`）
- 証跡インデックス（`outputs/phase-11/evidence-index.md`）

---

## テストケースサマリー

| TC-ID    | テスト名                                 | 検証対象               | 期待結果    | 代替 evidence                    |
| -------- | ---------------------------------------- | ---------------------- | ----------- | -------------------------------- |
| TC-11-01 | 全チャネル整合時の正常終了確認           | FR-5, AC-5             | exit code 0 | スクリプト実行結果               |
| TC-11-02 | preload whitelist 欠損時のエラー検出確認 | FR-1, FR-4, AC-2, AC-6 | exit code 1 | スクリプト実行結果 / vitest 結果 |
| TC-11-03 | main handler 未実装時のエラー検出確認    | FR-2, FR-4, AC-3, AC-6 | exit code 1 | スクリプト実行結果 / vitest 結果 |
| TC-11-04 | GitHub Actions ワークフロー構文検証      | AC-7                   | 構文正常    | ワークフロー定義確認             |

---

## 参照資料

| 参照資料                    | パス                                              | 内容                         |
| --------------------------- | ------------------------------------------------- | ---------------------------- |
| Phase 10 最終レビュー結果   | `outputs/phase-10/final-review-result.md`         | AC 照合・総合判定            |
| Phase 10 是正アクション計画 | `outputs/phase-10/corrective-action-plan.md`      | 是正タスク（該当時）         |
| Phase 10 リリース準備       | `outputs/phase-10/release-readiness-checklist.md` | Phase 11 進行前の確認リスト  |
| Phase 1 受け入れ基準        | `outputs/phase-1/acceptance-criteria.md`          | AC-1〜AC-8                   |
| Phase 2 CI統合設計          | `outputs/phase-2/ci-integration-design.md`        | GitHub Actions 統合方式      |
| Phase 2 テスト戦略          | `outputs/phase-2/test-strategy.md`                | テスト分類・テストデータ方針 |
| Phase 9 品質レポート        | `outputs/phase-9/quality-report.md`               | 品質ゲート結果               |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料    | パス                                                                                                                      | 内容                   |
| ----------- | ------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| IPC命名監査 | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns-reference-ipc-naming.md`          | 命名規則と監査パターン |
| IPC契約監査 | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns-reference-ipc-contract-audits.md` | データフロー型ギャップ |

---

## 成果物

| 成果物           | パス                                     | 内容                                          |
| ---------------- | ---------------------------------------- | --------------------------------------------- |
| 手動テスト結果   | `outputs/phase-11/manual-test-result.md` | NON_VISUAL 宣言・TC 判定結果・evidence リンク |
| 証跡インデックス | `outputs/phase-11/evidence-index.md`     | 全証跡の一覧と参照先                          |

---

## 統合テスト連携（Phase 1〜11は必須）

- スクリプト実行確認: `node scripts/verify-ipc-4layer.js` を実プロジェクトファイルに対して実行し、4層ファイル読み取りの統合動作を確認する
- CI 統合確認: GitHub Actions ワークフロー定義が正しく構成されていることを確認する
- 既存スクリプト共存: `check-ipc-contracts.ts` と `verify-ipc-4layer.js` の両方が同一環境で実行可能であることを確認する

---

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] TC-11-01〜TC-11-04 の全テストケースが実行済み
- [ ] 各 TC の判定結果が PASS/FAIL で記録されている
- [ ] NON_VISUAL 判定理由が `manual-test-result.md` に明記されている
- [ ] 代替 evidence が各 TC に紐づけて記録されている
- [ ] placeholder-only の証跡が PASS 扱いになっていない
- [ ] `screenshots/` ディレクトリを作成していない（NON_VISUAL）
- [ ] `screenshot-plan.json` を生成していない（NON_VISUAL）
- [ ] `outputs/phase-11/manual-test-result.md` が作成済み
- [ ] `outputs/phase-11/evidence-index.md` が作成済み
- [ ] 本Phase内の全タスクを100%実行完了

---

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 10 が PASS または MINOR で完了していること
- **後続**: Phase 12 へ進む

---

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 11 実行記録

### 実行タスク

- タスク1 TC-11-01 全チャネル整合時の正常終了確認: {{result}}
- タスク2 TC-11-02 preload whitelist 欠損時のエラー検出確認: {{result}}
- タスク3 TC-11-03 main handler 未実装時のエラー検出確認: {{result}}
- タスク4 TC-11-04 GitHub Actions ワークフロー構文検証: {{result}}
- タスク5 手動テスト結果記録: {{result}}

### テスト結果サマリー

| TC-ID    | 判定    | evidence               |
| -------- | ------- | ---------------------- |
| TC-11-01 | {{P/F}} | {{evidence reference}} |
| TC-11-02 | {{P/F}} | {{evidence reference}} |
| TC-11-03 | {{P/F}} | {{evidence reference}} |
| TC-11-04 | {{P/F}} | {{evidence reference}} |

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

`docs/30-workflows/UT-IMP-IPC-4LAYER-ALIGNMENT-CI-001/phase-12-documentation.md`
