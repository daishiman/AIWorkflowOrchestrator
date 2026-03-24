# Phase 3: 設計レビュー

## メタ情報

| 項目     | 値                     |
| -------- | ---------------------- |
| Phase    | 3                      |
| タスクID | UT-SC-05-IPC-DI-WIRING |
| 作成日   | 2026-03-23             |

## 目的

Phase 2 の設計が要件を満たし、既知の落とし穴（P34、P65）を回避していることを検証する。

## 実行タスク

### Task 1: 要件・設計の整合性レビュー

| レビュー項目                                                      | 判定基準                                                                | 結果                                                                        |
| ----------------------------------------------------------------- | ----------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| 3依存（skillFileManager, llmAdapter, resourceLoader）が注入される | コンストラクタ引数に3フィールドが含まれること                           | PASS: 設計上3依存が追加される                                               |
| Graceful Degradation が維持される                                 | llmAdapter 取得失敗時に undefined が注入され、Facade 内で処理されること | PASS: try-catch で undefined フォールバック、Facade L120/L257 で分岐        |
| 既存インターフェースとの互換性                                    | RuntimeSkillCreatorFacadeDeps の型定義を変更しないこと                  | PASS: 3フィールドとも既存の optional フィールド                             |
| P34（遅延初期化 DI）準拠                                          | 非同期で取得が必要な依存は try-catch で安全に取得すること               | MINOR: track() が `() => void` のみ対応のため IIFE パターンへ修正要（後述） |
| P65（dead-end namespace）非該当                                   | 新しい IPC namespace を追加しないこと                                   | PASS: 既存 `skill-creator:*` のみ使用                                       |
| 修正対象が index.ts のみ                                          | Facade クラスや Deps 型を変更しないこと                                 | PASS: index.ts の DI 配線箇所のみ修正                                       |

### Task 2: セキュリティレビュー

| レビュー項目             | 判定基準                                                           | 結果                                                                             |
| ------------------------ | ------------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| API キーの扱い           | API キーは LLMAdapterFactory 内部の SecureStorage 経由で取得される | PASS: getAdapter() 内部で SecureStorage.getApiKey() を呼び出し、外部に露出しない |
| IPC チャンネルの変更なし | `skill-creator:*` のチャンネル構成に変更がないこと                 | PASS: ハンドラ登録自体は既存の registerSkillCreatorHandlers() をそのまま使用     |
| ログへの機密情報出力なし | warn ログに API キーやトークンを含めないこと                       | PASS: warn メッセージは「LLM adapter not available」のみ、キー値は含まない       |

### Task 3: テスト影響レビュー

| レビュー項目                  | 判定基準                                                                                | 結果                                                                             |
| ----------------------------- | --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| 既存テストとの互換性          | RuntimeSkillCreatorFacade のテストはモック注入を使用しているため影響なし                | PASS: テストは Facade コンストラクタに直接モックを渡すため index.ts 変更に無関係 |
| IPC ハンドラテストとの互換性  | skillCreatorHandlers のテストは runtimeSkillCreatorService をモックしているため影響なし | PASS: ハンドラテストは registerSkillCreatorHandlers の引数をモック               |
| track() の async 化による影響 | track() が async コールバックを正しく処理することを確認済みであること                   | MINOR: track() は `fn: () => void` 型 — async callback は await されない（後述） |

### Task 4: 判定

**判定: MINOR**

指摘事項を修正後 Phase 4 へ進む。

#### MINOR 指摘 M-1: `track()` の `() => void` 型制約

- **現状**: `track()` (L546) は `fn: () => void` を受け取り、`safeRegister()` は `registerFn()` を同期呼び出し
- **問題**: Phase 2 設計の `async () => {` への変更は TypeScript 型的には通る（`Promise<void>` は `void` に assignable）が、`safeRegister()` が Promise を await しないため、`registerSkillCreatorHandlers()` の呼び出しが非同期完了まで遅延する
- **リスク**: 低い。Electron Main Process は BrowserWindow 作成前にハンドラを登録するため、実際に race condition が発生する可能性は極めて低い。また `LLMAdapterFactory.getAdapter()` はキャッシュヒット時は実質同期で返る
- **推奨**: Phase 5 Task 3 の IIFE パターンを主要パスとして採用。`successCount` の精度低下は許容（handler 登録自体は成功するため）

#### MINOR 指摘 M-2: Phase 2「変更前」コードの実態乖離

- **現状**: 実際の L899-906 には `const skillFileWriter = new SkillFileWriter(skillBasePath)` が存在し、コンストラクタ引数にも `skillFileWriter` が含まれている
- **Phase 2 の記載**: `skillFileWriter` が未記載
- **推奨**: Phase 2 の変更前/変更後コードを実態に合わせて更新する

### MINOR 追跡テーブル

| MINOR ID | 指摘内容                                             | 解決予定 Phase | 解決確認 Phase | 備考                                                          |
| -------- | ---------------------------------------------------- | -------------- | -------------- | ------------------------------------------------------------- |
| M-1      | `track()` の `() => void` 型制約 → IIFE パターン採用 | Phase 5        | Phase 9        | Phase 5 実装で IIFE パターン適用、Phase 9 lint/typecheck 確認 |
| M-2      | 変更前コードの実態乖離（`skillFileWriter` 未記載）   | Phase 2        | Phase 3        | Phase 2 を実態に合わせて更新済み（本レビューで確認）          |

## 参照資料

- Phase 1 要件定義（`phase-01-requirements.md`）
- Phase 2 設計（`phase-02-design.md`）
- `.claude/rules/04-electron-security.md`（IPC セキュリティ原則）
- `.claude/rules/06-known-pitfalls.md` P34, P65

## 統合テスト連携

Phase 3 は設計レビューフェーズであり、テストコードはこの段階では作成しない。Phase 4 以降で作成するテストに対する、本レビューからの指摘事項への対応要件を整理する。

| MINOR ID | テスト対応要件                                                                                                                          | 作成予定 Phase |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| M-1      | IIFE パターン適用後の `index.ts` で、IIFE 内の非同期処理（`getAdapter()` 呼び出し）が完了後にハンドラが登録されることを検証すること     | Phase 4        |
| M-1      | `safeRegister` の `successCount` が IIFE 開始時点でカウントされることは許容とし、テストでは実際のハンドラ登録完了を非同期で確認すること | Phase 4        |
| M-2      | Phase 2 の変更前コードが実態に合致していることを確認した上で、テストの期待値を設定すること                                              | Phase 4        |

## 多角的チェック観点（AIが判断）

本レビューは Phase 2 設計の妥当性検証であるため、以下のドメインを参照してレビューを実施する。

| ドメイン                      | 参照資料                                                       | 確認内容                                                                                                |
| ----------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| IPC 通信（Main-Renderer連携） | `aiworkflow-requirements: api-ipc-agent.md`, `interfaces-*.md` | 設計変更後も `skill-creator:*` ハンドラの契約（引数/戻り値）が変更されないこと                          |
| セキュリティ                  | `aiworkflow-requirements: security-api-electron.md`            | IIFE 内の warn ログに API キーが含まれないこと、SecureStorage 経由が維持されること                      |
| アーキテクチャ                | `aiworkflow-requirements: architecture-overview.md`            | DI 注入対象（index.ts IPC 層）→ Facade（サービス層）の依存方向が設計通りであること                      |
| 既知の落とし穴                | `.claude/rules/06-known-pitfalls.md` P34, P54, P65             | 設計が P34（遅延初期化 DI）、P54（safeRegister 意味的同期）、P65（dead-end namespace 回避）を満たすこと |

## サブタスク管理

| サブタスクID | タスク名                      | 完了条件                                          | ステータス |
| ------------ | ----------------------------- | ------------------------------------------------- | ---------- |
| P3-T1        | 要件・設計の整合性レビュー    | 全6項目を評価し判定結果を記録                     | 完了       |
| P3-T2        | セキュリティレビュー          | 全3項目を評価し判定結果を記録                     | 完了       |
| P3-T3        | テスト影響レビュー            | 全3項目を評価し判定結果を記録                     | 完了       |
| P3-T4        | 判定と MINOR 追跡テーブル作成 | 判定 MINOR を記録し、M-1/M-2 の追跡テーブルを作成 | 完了       |

## タスク100%実行確認【必須】

- [x] Task 1: 要件・設計の整合性レビュー 6 項目を全て評価した
- [x] Task 2: セキュリティレビュー 3 項目を全て評価した
- [x] Task 3: テスト影響レビュー 3 項目を全て評価した
- [x] Task 4: 判定結果を MINOR として記録した
- [x] Task 4: MINOR 追跡テーブル（M-1/M-2）を作成した（解決予定 Phase / 解決確認 Phase / 備考を含む）
- [x] Phase 2 への M-2 フィードバック（変更前コード修正）が完了していることを確認した

## 成果物

- 設計レビュー結果（本仕様書に判定結果を記録）

## 完了条件

- [x] 要件・設計の整合性レビュー全項目を確認した
- [x] セキュリティレビュー全項目を確認した
- [x] テスト影響レビュー全項目を確認した
- [x] 判定結果を記録した: **MINOR**（M-1: IIFE パターン修正、M-2: 変更前コード実態乖離）

## 次のPhase

Phase 4: テスト作成
