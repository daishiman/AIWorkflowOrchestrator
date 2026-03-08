# Phase 3: 設計レビュー結果

## メタ情報

| 項目     | 内容                                                     |
| -------- | -------------------------------------------------------- |
| タスク名 | 08-TASK-IMP-SETTINGS-INTEGRATION-REGRESSION-COVERAGE-001 |
| Phase    | 3                                                        |
| 作成日   | 2026-03-08                                               |
| 作成者   | SubAgent-Lead-Sync                                       |
| 入力     | Phase 1 成果物 + Phase 2 成果物                          |

---

## レビュー観点1: 統合粒度

### 確認内容

component test と integration test の責務が重複していないか。

### 判定: PASS

**根拠**:

1. **責務の明確な分離**: Phase 2 design-decisions.md の「設計判断3」で、既存 unit test（`SettingsView.test.tsx`）と新規 integration test（`SettingsView.integration.test.tsx`）の責務が明確に分離されている。
   - Unit test: セクション存在確認 + store action 呼び出し + P31 対策検証
   - Integration test: real composition での統合動作 + IPC レスポンス防御ガード + AC 検証

2. **重複テストケースの排除方針**: 「テーマ変更で setThemeMode が呼ばれる」等の既存 unit test でカバー済みの検証は integration test に含めない方針が明記されている。

3. **モック境界の差異**: unit test は3コンポーネント + store をモック、integration test は electronAPI + store 初期状態のみモック。モック粒度が異なるため、同じコンポーネントを描画しても検証目的が明確に異なる。

### 指摘事項

なし。

---

## レビュー観点2: 証跡妥当性

### 確認内容

manual evidence が実際の画面構成を通っているか。

### 判定: PASS

**根拠**:

1. **AC-04 の定義**: acceptance-criteria.md で「settings shell への到達が必須条件」が Yes/No 判定可能な形で定義されている。

2. **3つの必須条件**: 手動テスト手順に「SettingsView を表示する」ステップ、証跡の必須項目に「設定画面全体の表示」、個別コンポーネント単体での検証を不可とする記述の3条件が明記されている。

3. **先行タスクとの差異の認識**: 現状分析で task-03/04 の手動証跡が settings shell を経由していない問題が明確に識別されている。

### 指摘事項

なし。

---

## レビュー観点3: 保守性

### 確認内容

electronAPI mock と store harness の再利用可能性。

### 判定: PASS（MINOR 指摘1件付き）

**根拠**:

1. **harness の設計**: settings-test-harness.ts が `SettingsHarnessOptions` インターフェースでパラメータ化されており、テストケースごとにカスタマイズ可能な設計になっている。

2. **mock 境界の一本化**: AC-06 に基づき、store mock と electronAPI mock の初期化が harness 内の単一関数で管理される設計になっている。

3. **再利用性**: harness は `storeOverrides` と `electronApiOverrides` を受け取る設計であり、将来的に他のテストファイルからも利用可能。

### MINOR 指摘

**M-01: AccountSection の store mock デフォルト値の網羅性**

AccountSection は 18 個の store セレクタを使用する。harness のデフォルト値に全 18 個が含まれていることを Phase 5 実装時に確認する必要がある。設計判断書には「AccountSection が使用する 18 個の store セレクタは全て harness 内でデフォルト値を提供する」と記載されているが、具体的なデフォルト値のリストが Phase 2 成果物に含まれていない。

- **対応方針**: Phase 4 の Red テスト作成時に、AccountSection が使用する全セレクタのデフォルト値を harness に定義する。Phase 5 実装完了後に全セレクタがカバーされていることを検証する。
- **影響度**: 低（実装フェーズで対応可能）
- **差戻し不要**: Phase 4 以降で対応可能な粒度のため、Phase 2 への差戻しは不要

---

## レビュー観点4: 追跡性

### 確認内容

05/06/07 の AC が test case ID へ対応付いているか。

### 判定: PASS

**根拠**:

1. **対応行列の存在**: design-decisions.md に「テストケース ID と AC の対応行列」が2つのテーブルで明記されている。
   - テーブル1: テストケース ID (INT-01 ~ INT-05) と AC-01 ~ AC-06 のマトリクス
   - テーブル2: 先行タスク AC と テストケース ID の直接対応

2. **全先行タスクのカバー**:
   - task-05 AC → INT-02（auth-mode 切替 UI 導線）
   - task-06 AC → INT-03（malformed apiKey response fallback）
   - task-07 AC → INT-05（corrupted state recovery）

3. **requirements-definition.md との整合**: FR-04 のテーブルと design-decisions.md のテーブルが一致している。

### 指摘事項

なし。

---

## レビュー結果まとめ

| 観点       | 判定 | 指摘数 | 指摘内容                              |
| ---------- | ---- | ------ | ------------------------------------- |
| 統合粒度   | PASS | 0      | -                                     |
| 証跡妥当性 | PASS | 0      | -                                     |
| 保守性     | PASS | 1      | M-01: store mock デフォルト値の網羅性 |
| 追跡性     | PASS | 0      | -                                     |

---

## 先行タスクとの境界チェック

| チェック項目                                        | 結果 | 備考                                                                    |
| --------------------------------------------------- | ---- | ----------------------------------------------------------------------- |
| task-05 との責務重複がないか                        | OK   | 05 は UI 導線改善、08 は統合テスト検証。責務が異なる                    |
| task-06 との責務重複がないか                        | OK   | 06 は防御ガード実装、08 は防御ガードの統合動作検証。責務が異なる        |
| task-07 との責務重複がないか                        | OK   | 07 は persist ハードニング実装、08 は recovery の統合検証。責務が異なる |
| 08 のテストが先行タスクの実装詳細に依存していないか | OK   | AC レベルで追跡し、実装詳細には依存しない設計                           |
| プロダクションコードの変更がないか                  | OK   | 08 はテスト + ドキュメントのみの変更                                    |
