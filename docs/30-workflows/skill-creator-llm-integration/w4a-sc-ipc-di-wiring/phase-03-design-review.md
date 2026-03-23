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

| レビュー項目                                                      | 判定基準                                                                |
| ----------------------------------------------------------------- | ----------------------------------------------------------------------- |
| 3依存（skillFileManager, llmAdapter, resourceLoader）が注入される | コンストラクタ引数に3フィールドが含まれること                           |
| Graceful Degradation が維持される                                 | llmAdapter 取得失敗時に undefined が注入され、Facade 内で処理されること |
| 既存インターフェースとの互換性                                    | RuntimeSkillCreatorFacadeDeps の型定義を変更しないこと                  |
| P34（遅延初期化 DI）準拠                                          | 非同期で取得が必要な依存は try-catch で安全に取得すること               |
| P65（dead-end namespace）非該当                                   | 新しい IPC namespace を追加しないこと                                   |
| 修正対象が index.ts のみ                                          | Facade クラスや Deps 型を変更しないこと                                 |

### Task 2: セキュリティレビュー

| レビュー項目             | 判定基準                                                           |
| ------------------------ | ------------------------------------------------------------------ |
| API キーの扱い           | API キーは LLMAdapterFactory 内部の SecureStorage 経由で取得される |
| IPC チャンネルの変更なし | `skill-creator:*` のチャンネル構成に変更がないこと                 |
| ログへの機密情報出力なし | warn ログに API キーやトークンを含めないこと                       |

### Task 3: テスト影響レビュー

| レビュー項目                  | 判定基準                                                                                |
| ----------------------------- | --------------------------------------------------------------------------------------- |
| 既存テストとの互換性          | RuntimeSkillCreatorFacade のテストはモック注入を使用しているため影響なし                |
| IPC ハンドラテストとの互換性  | skillCreatorHandlers のテストは runtimeSkillCreatorService をモックしているため影響なし |
| track() の async 化による影響 | track() が async コールバックを正しく処理することを確認済みであること                   |

### Task 4: 判定

上記の全レビュー項目を PASS / MINOR / MAJOR で判定する。

- **PASS**: Phase 4 へ進む
- **MINOR**: 指摘箇所を修正後 Phase 4 へ進む
- **MAJOR（設計問題）**: Phase 2 へ戻る

## 参照資料

- Phase 1 要件定義（`phase-01-requirements.md`）
- Phase 2 設計（`phase-02-design.md`）
- `.claude/rules/04-electron-security.md`（IPC セキュリティ原則）
- `.claude/rules/06-known-pitfalls.md` P34, P65

## 成果物

- 設計レビュー結果（本仕様書に判定結果を記録）

## 完了条件

- [ ] 要件・設計の整合性レビュー全項目を確認した
- [ ] セキュリティレビュー全項目を確認した
- [ ] テスト影響レビュー全項目を確認した
- [ ] 判定結果（PASS / MINOR / MAJOR）を記録した

## 次のPhase

Phase 4: テスト作成
