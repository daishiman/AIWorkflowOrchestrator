# Phase 1: 要件定義 - 新関数テスト拡充（型アノテーション分析・マルチオブジェクトチャンネル解決）

## メタ情報

| 項目     | 値                                                           |
| -------- | ------------------------------------------------------------ |
| Phase    | 1                                                            |
| 機能名   | UT-TASK06-007-EXT-006-new-function-test-expansion            |
| 作成日   | 2026-03-21                                                   |
| タスクID | UT-TASK06-007-EXT-006                                        |
| 分類     | テスト品質改善                                               |
| 発見元   | UT-TASK06-007 Phase 7 カバレッジ改善セッション（2026-03-19） |

## 目的

linter（Hook）が `check-ipc-contracts.ts` に自動追加した5つの新関数・パターンに対し、現行実装と一致する境界値・エッジケーステストの要件を定義する。

## 実行タスク

- 要件抽出: 対象5関数/パターンの仕様を既存コードから抽出し、テスト要件を定義
- テスト戦略決定: 非export関数のテストアプローチ（export追加 + 直接テスト）を確定
- 受け入れ基準作成: 各テストグループに対する検証可能な受け入れ基準を定義

## 参照資料

| 資料名                       | パス                                                                                                                      | 説明                       |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| 対象スクリプト               | `apps/desktop/scripts/check-ipc-contracts.ts`                                                                             | テスト対象（584行）        |
| 既存テスト                   | `apps/desktop/scripts/__tests__/check-ipc-contracts.test.ts`                                                              | 既存49テスト               |
| タスク指示書                 | `docs/30-workflows/completed-tasks/ut-task06-007-ext-006-new-function-test-expansion.md`                                  | 元タスク指示書             |
| IPC drift detection パターン | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns-reference-ipc-drift-detection.md` | テスト戦略セクション       |
| 苦戦箇所記録                 | `.claude/skills/aiworkflow-requirements/references/lessons-learned-ipc-preload-runtime.md`                                | vi.mock制約と再利用知見    |
| 親タスク成果物               | `docs/30-workflows/completed-tasks/UT-TASK06-007-ipc-contract-drift-auto-detect/`                                         | 親タスクの仕様書・成果物群 |

### システム仕様（aiworkflow-requirements）

> 実装前に以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料              | パス                                                                          | 内容                     |
| --------------------- | ----------------------------------------------------------------------------- | ------------------------ |
| IPC契約チェックリスト | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md` | 既存の手動チェックリスト |
| 品質要件              | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`   | Phase 9品質ゲート基準    |

## 実行手順

### ステップ1: 対象関数の仕様確認

`check-ipc-contracts.ts` から以下5つの新関数/パターンの仕様を確認する:

| #   | 関数/パターン名               | 行番号   | export状態 | 役割                                                            |
| --- | ----------------------------- | -------- | ---------- | --------------------------------------------------------------- |
| 1   | `normalizeTypeAnnotation()`   | L68-73   | 非export   | 型アノテーションから arrow function / default / readonly を除去 |
| 2   | `isPrimitiveTypeAnnotation()` | L76-88   | 非export   | union 型の各パーツが `PRIMITIVE_TS_TYPES` に全て含まれるか判定  |
| 3   | `mergeChannelMaps()`          | L271-284 | 非export   | 複数ファイルからチャンネルマップをマージ（先勝ち）              |
| 4   | `CHANNEL_OBJECT_PATTERN`      | L53-54   | 非export   | `const XXX = { ... } as const` パターンの正規表現               |
| 5   | `PRELOAD_CALL_START_PATTERN`  | L56-57   | 非export   | `safeInvoke()` / `safeOn()` 開始箇所を検出する正規表現          |

### ステップ2: テスト戦略の決定

**テスト戦略: export追加 + 直接テスト**

理由:

1. `normalizeTypeAnnotation` と `isPrimitiveTypeAnnotation` は純粋関数であり、直接テストが最も効率的
2. 間接テスト（`extractMainHandlers` / `extractPreloadEntries` 経由）では境界値テストの意図がぼやける
3. `export` キーワードの追加はロジック変更ではなく、テストインフラ整備に留まる
4. `mergeChannelMaps` は `fs.readFileSync` に依存するため、実ファイルを使った単体テストが最短

**export追加対象:**

- `normalizeTypeAnnotation` → `export function normalizeTypeAnnotation`
- `isPrimitiveTypeAnnotation` → `export function isPrimitiveTypeAnnotation`
- `CHANNEL_OBJECT_PATTERN` → `export const CHANNEL_OBJECT_PATTERN`
- `PRELOAD_CALL_START_PATTERN` → `export const PRELOAD_CALL_START_PATTERN`
- `mergeChannelMaps` → `export function mergeChannelMaps`

### ステップ3: 機能要件定義

#### FR-1: normalizeTypeAnnotation テスト（5件）

| テストID | 入力                   | 期待出力     | 検証ポイント       |
| -------- | ---------------------- | ------------ | ------------------ |
| T-N-01   | `"string"`             | `"string"`   | パススルー         |
| T-N-02   | `"string => boolean"`  | `"string"`   | arrow function除去 |
| T-N-03   | `"string = 'default'"` | `"string"`   | default value除去  |
| T-N-04   | `"readonly string[]"`  | `"string[]"` | readonly除去       |
| T-N-05   | `"  string  "`         | `"string"`   | 前後空白のtrim     |

#### FR-2: isPrimitiveTypeAnnotation テスト（6件）

| テストID | 入力                 | 期待出力 | 検証ポイント                      |
| -------- | -------------------- | -------- | --------------------------------- |
| T-P-01   | `"string"`           | `true`   | 単体プリミティブ型 string         |
| T-P-02   | `"number"`           | `true`   | 単体プリミティブ型 number         |
| T-P-03   | `"string \| number"` | `true`   | union型（全パーツがプリミティブ） |
| T-P-04   | `"string \| null"`   | `true`   | nullable型                        |
| T-P-05   | `"{ id: string }"`   | `false`  | オブジェクト型                    |
| T-P-06   | `""`                 | `false`  | 空文字列                          |

#### FR-3: mergeChannelMaps テスト（4件）

| テストID | シナリオ                   | 期待動作                           |
| -------- | -------------------------- | ---------------------------------- |
| T-M-01   | 1ファイルマージ            | resolveChannelMap結果と同一        |
| T-M-02   | 重複キー                   | 先勝ち（最初のファイルの値を保持） |
| T-M-03   | 空ファイルリスト           | 空Mapが返る                        |
| T-M-04   | チャンネル定義なしファイル | 空Mapが返る                        |

#### FR-4: CHANNEL_OBJECT_PATTERN / PRELOAD_CALL_START_PATTERN テスト（5件）

| テストID | パターン対象               | 入力例                                                | 期待動作                   |
| -------- | -------------------------- | ----------------------------------------------------- | -------------------------- |
| T-R-01   | CHANNEL_OBJECT_PATTERN     | `const IPC = { A: 'a' } as const`                     | マッチする                 |
| T-R-02   | CHANNEL_OBJECT_PATTERN     | `export const IPC = { A: 'a' } as const`              | exportありでもマッチする   |
| T-R-03   | CHANNEL_OBJECT_PATTERN     | `const IPC = { A: 'a' }`（as constなし）              | マッチしない               |
| T-R-04   | CHANNEL_OBJECT_PATTERN     | 複数 const object + 空 body                           | 全件抽出できる             |
| T-R-05   | PRELOAD_CALL_START_PATTERN | `safeInvoke<{...}>(...)` / `safeOn<SystemTheme>(...)` | generic 付きでもマッチする |

### ステップ4: 非機能要件定義

| NFR-ID | 要件                        |
| ------ | --------------------------- |
| NFR-1  | 既存49テストが全PASS維持    |
| NFR-2  | Line Coverage 95%以上を維持 |
| NFR-3  | テスト追加数: 20件          |
| NFR-4  | テスト実行時間: 10秒以内    |

## 統合テスト連携（Phase 1〜11は必須）

Phase 1 では統合テスト対象はなし。Phase 4以降で既存49テストとの回帰テストを実施する。

## 多角的チェック観点（AIが判断）

| 観点               | 適用 | 理由                                 |
| ------------------ | ---- | ------------------------------------ |
| セキュリティ       | 不要 | テスト追加のみでセキュリティ影響なし |
| UI/UX              | 不要 | CLIスクリプトのテスト                |
| アーキテクチャ     | 不要 | 既存アーキテクチャの変更なし         |
| エラーハンドリング | 適用 | 境界値テストでエラーケースを網羅する |

## 成果物

| 成果物     | パス                              | 説明           |
| ---------- | --------------------------------- | -------------- |
| 要件定義書 | `outputs/phase-1/requirements.md` | 本ドキュメント |

## 完了条件

- [x] 対象5関数/パターンの仕様が確認されている
- [x] テスト戦略（export追加 + 直接テスト）が決定されている
- [x] FR-1〜FR-4の機能要件が定義されている（合計20件）
- [x] NFR-1〜NFR-4の非機能要件が定義されている
- [x] **本Phase内の全タスクを100%実行完了**

## 次Phase

Phase 2（設計）に進む。テスト構造とdescribeブロックの設計を行う。
