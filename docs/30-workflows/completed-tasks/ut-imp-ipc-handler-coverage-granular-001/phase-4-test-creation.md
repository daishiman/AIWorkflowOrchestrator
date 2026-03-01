# Phase 4: テスト作成（TDD: Red） — IPCハンドラ単位カバレッジ測定基盤構築

## メタ情報

| 項目               | 値                                                                              |
| ------------------ | ------------------------------------------------------------------------------- |
| タスクID           | UT-IMP-IPC-HANDLER-COVERAGE-GRANULAR-001                                        |
| Phase              | 4（テスト作成）                                                                 |
| 機能名             | IPCハンドラ単位カバレッジ測定基盤構築                                           |
| 作成日             | 2026-02-28                                                                      |
| Issue              | #854                                                                            |
| 前提Phase          | phase-1-requirements.md                                                         |
| 目的               | カバレッジ集計スクリプトのテストケースを設計・テストコードを作成する（Red状態） |
| 成果物ディレクトリ | docs/30-workflows/ut-imp-ipc-handler-coverage-granular-001/outputs/phase-4/     |

## 目的

Phase 1 で定義した機能要件（FR-001〜FR-007）と非機能要件（NFR-001〜NFR-007）に基づき、カバレッジ集計スクリプト `coverage-by-handler.ts` のテストケースを設計し、テストコードを作成する。

TDD の Red フェーズとして、全テストが失敗状態（実装が存在しないため）で存在することを確認する。

## 実行タスク

### Task 4-1: v8カバレッジJSONのサンプルデータ取得

- `skillHandlers.ts` に対してカバレッジ付きテスト実行し、v8 カバレッジ JSON の構造を把握する
- サンプルデータからテスト用のフィクスチャデータを作成する
- フィクスチャに含める情報: `ranges`, `count`, `functionName`, `startOffset`, `endOffset`

**実行コマンド:**

```bash
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers.test.ts --coverage --coverage.reporter=json
```

### Task 4-2: ハンドラブロック抽出のテストケース設計（TC-001, TC-002, TC-007）

Phase 1 要件 FR-001（ハンドラ境界検出）に対応するテストケースを設計する。

| TC-ID  | 検証項目                                             | 期待結果                                           | 対応要件 |
| ------ | ---------------------------------------------------- | -------------------------------------------------- | -------- |
| TC-001 | `skillHandlers.ts` の全ハンドラが検出される          | 23個のハンドラがチャンネル名付きでリストされる     | FR-001   |
| TC-002 | 各ハンドラの行範囲（startLine, endLine）が正確である | ソースコードの実際の行範囲と一致する               | FR-001   |
| TC-007 | ハンドラが存在しないファイルを入力した場合           | エラーメッセージ「ハンドラが検出されませんでした」 | NFR-002  |

### Task 4-3: カバレッジ算出のテストケース設計（TC-003, TC-004, TC-005）

Phase 1 要件 FR-002, FR-003, FR-006 に対応するテストケースを設計する。

| TC-ID  | 検証項目                                          | 期待結果                                       | 対応要件       |
| ------ | ------------------------------------------------- | ---------------------------------------------- | -------------- |
| TC-003 | 全テストカバー済みハンドラの Line Coverage が高い | `skill:remove` ハンドラの Lines が90%以上      | FR-003         |
| TC-004 | 未テストハンドラの Line Coverage が低い           | テスト未実施ハンドラの Lines が10%以下         | FR-003         |
| TC-005 | P41 インラインアロー関数が注記される              | `getAllowedWindows` が影響関数として検出される | FR-003/NFR-004 |

### Task 4-4: レポート出力のテストケース設計（TC-006）

Phase 1 要件 FR-004 に対応するテストケースを設計する。

| TC-ID  | 検証項目                          | 期待結果                       | 対応要件 |
| ------ | --------------------------------- | ------------------------------ | -------- |
| TC-006 | Markdown テーブル形式で出力される | 有効な Markdown テーブルが出力 | FR-004   |

- Markdown テーブルのヘッダ行が `| # | チャンネル名 | 行範囲 | Line% | Branch% | Func% | 判定 |` を含む
- 各ハンドラの行が `|` 区切りで正しくフォーマットされている
- JSON 出力が `{ filePath, handlers, summary, p41Note }` 構造を持つ

### Task 4-5: エラーハンドリングのテストケース設計（TC-008）

Phase 1 要件 NFR-002 に対応するテストケースを設計する。

| TC-ID  | 検証項目                         | 期待結果                                             | 対応要件 |
| ------ | -------------------------------- | ---------------------------------------------------- | -------- |
| TC-008 | カバレッジ JSON が存在しない場合 | エラーメッセージ「カバレッジデータが見つかりません」 | NFR-002  |

- 存在しないファイルパスを指定した場合のエラーハンドリング
- 不正な JSON（構文エラー）を入力した場合のエラーハンドリング
- AST 解析対象ファイルが存在しない場合のエラーハンドリング

### Task 4-6: テストコード作成

`apps/desktop/scripts/coverage-by-handler.test.ts` を作成する。

テストファイルの構成:

```
describe("coverage-by-handler")
  ├── describe("extractHandlers - ハンドラブロック抽出")
  │   ├── it("skillHandlers.tsの全ハンドラが検出される") ── TC-001
  │   ├── it("各ハンドラの行範囲が正確である") ── TC-002
  │   └── it("ハンドラが存在しないファイルでエラーを返す") ── TC-007
  ├── describe("calculateCoverage - カバレッジ算出")
  │   ├── it("テストカバー済みハンドラのLine Coverageが90%以上") ── TC-003
  │   ├── it("未テストハンドラのLine Coverageが10%以下") ── TC-004
  │   └── it("P41インラインアロー関数が影響関数として検出される") ── TC-005
  ├── describe("generateReport - レポート出力")
  │   └── it("Markdownテーブル形式で出力される") ── TC-006
  └── describe("エラーハンドリング")
      └── it("カバレッジJSONが存在しない場合エラーを返す") ── TC-008
```

## 参照資料

### タスク固有参照

| 参照資料         | パス                                                                                        | 内容                           |
| ---------------- | ------------------------------------------------------------------------------------------- | ------------------------------ |
| Phase 1 要件定義 | `docs/30-workflows/ut-imp-ipc-handler-coverage-granular-001/phase-1-requirements.md`        | FR/NFR/受け入れ基準            |
| Phase 2 設計     | `docs/30-workflows/ut-imp-ipc-handler-coverage-granular-001/phase-2-design.md`              | モジュール構造・型設計         |
| Phase 3 レビュー | `docs/30-workflows/ut-imp-ipc-handler-coverage-granular-001/phase-3-design-review.md`       | 設計レビュー観点と判定基準     |
| skillHandlers.ts | `apps/desktop/src/main/ipc/skillHandlers.ts`                                                | AST解析の対象ファイル          |
| カバレッジ基準   | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | カバレッジ閾値の定義           |
| P41 記録         | `.claude/rules/06-known-pitfalls.md#P41`                                                    | v8 インライン関数カウント問題  |
| P40 記録         | `.claude/rules/06-known-pitfalls.md#P40`                                                    | テスト実行ディレクトリ依存     |
| 実装パターン     | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | テスト設計パターンの参考       |
| 既知の落とし穴   | `.claude/rules/06-known-pitfalls.md`                                                        | P9, P13 等のテスト設計注意事項 |

## 統合テスト連携

- Phase 5（実装）でテストが Green 状態になることを検証する
- テストフィクスチャデータは実際の v8 カバレッジ JSON 構造に基づいて作成する
- `extractHandlers`, `calculateCoverage`, `generateReport` の各関数インターフェースをテストコードで定義する

## 多角的チェック観点

| 観点               | 適用判断                 | 仕様参照先                                          |
| ------------------ | ------------------------ | --------------------------------------------------- |
| セキュリティ       | 非該当（内部スクリプト） | `.claude/rules/04-electron-security.md`             |
| UI/UX              | 非該当                   | —                                                   |
| アーキテクチャ     | 限定的（モジュール構造） | `.claude/rules/01-architecture.md`                  |
| API設計            | 適用（関数IF設計）       | Phase 1 FR-004, FR-007                              |
| データ整合性       | 適用（JSON解析）         | Phase 1 FR-002                                      |
| エラーハンドリング | 必須                     | `.claude/rules/02-code-quality.md`                  |
| パフォーマンス     | 限定的（NFR-001）        | Phase 1 NFR-001                                     |
| テスタビリティ     | 必須                     | `.claude/rules/02-code-quality.md#テスト設計の注意` |

## 実行手順

1. `skillHandlers.ts` に対してカバレッジ付きテスト実行し、v8 カバレッジ JSON の構造を把握する
2. テスト用フィクスチャデータ（模擬的な v8 JSON とソースファイル）を設計する
3. TC-001〜TC-008 の各テストケースを設計し、期待値を確定する
4. `apps/desktop/scripts/coverage-by-handler.test.ts` にテストコードを記述する
5. テスト実行し、全テストが Red 状態（失敗）であることを確認する

**テスト実行コマンド:**

```bash
cd apps/desktop && pnpm vitest run scripts/coverage-by-handler.test.ts
```

## 成果物

| 成果物           | パス                                               | 説明                             |
| ---------------- | -------------------------------------------------- | -------------------------------- |
| テスト仕様書     | `outputs/phase-4/test-specification.md`            | テスト設計方針とケース一覧       |
| テストケース一覧 | `outputs/phase-4/test-cases.md`                    | TC-001〜TC-008 の詳細定義        |
| テストコード     | `apps/desktop/scripts/coverage-by-handler.test.ts` | カバレッジ集計スクリプトのテスト |

## 完了条件

- [ ] TC-001〜TC-008 の全テストケースがテストコードとして実装されている
- [ ] テストファイル `coverage-by-handler.test.ts` が `apps/desktop/scripts/` に作成されている
- [ ] テストが Red 状態（全テスト失敗）で実行される（実装未着手のため）
- [ ] テストフィクスチャデータが v8 カバレッジ JSON の実構造に基づいている
- [ ] P41 対策のテストケース（TC-005）がインラインアロー関数の影響を検証している
- [ ] テスト仕様書・テストケース一覧が成果物ディレクトリに作成されている

## TDD検証

| 検証項目           | 期待状態 | 実行コマンド                                                             |
| ------------------ | -------- | ------------------------------------------------------------------------ |
| テスト実行結果     | 全FAIL   | `cd apps/desktop && pnpm vitest run scripts/coverage-by-handler.test.ts` |
| テストファイル存在 | あり     | `ls apps/desktop/scripts/coverage-by-handler.test.ts`                    |
| テストケース数     | 8件以上  | `grep -c "it(" apps/desktop/scripts/coverage-by-handler.test.ts`         |

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスク（Task 4-1〜4-6）を100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase 末端で完了状態を明記している

## 次のPhase

→ [Phase 5: 実装](./phase-5-implementation.md)
