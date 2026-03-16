# Phase 3 設計レビュー報告書 - Skill Docs Runtime Integration

## メタ情報

| 項目       | 内容                               |
| ---------- | ---------------------------------- |
| タスクID   | TASK-IMP-SKILL-DOCS-AI-RUNTIME-001 |
| Phase      | 3 - 設計レビュー                   |
| 作成日     | 2026-03-16                         |
| ステータス | completed                          |
| 総合判定   | **MINOR**                          |

---

## 1. 6観点レビュー結果

| #   | 観点                       | 判定  | 根拠                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| --- | -------------------------- | ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | stub 排除の完全性          | PASS  | stubQueryFn（ipc/index.ts L786-788）の排除計画が明確。LLMDocQueryAdapter の `query()` メソッドが production 経路を提供し、`await adapter.isAvailable()` で guidance-only 経路に分岐する設計。テスト環境では Constructor Injection により queryFn をモック差し替え可能（既存パターン維持）。stub が production 経路に残る設計パスは確認されなかった。                                                                                                     |
| 2   | 失敗ポリシーの明確性       | MINOR | 下記 MINOR-01 参照。7エラー種別のコード・カテゴリ・retryable フラグは整合しているが、リトライポリシー表で INFRASTRUCTURE（4000-4999）が retryable 対象として記載されている一方、失敗ポリシー分類表では 4001 に対応する IPC 通信エラーのみが定義されており、INFRASTRUCTURE カテゴリ全体のリトライ可否が曖昧。また擬似コード内の `lastResult!` に P48 違反あり。                                                                                           |
| 3   | Task01 契約との整合        | PASS  | Task01 の Access Matrix は 4 path（integratedRuntime / terminalSurface / both / none）を定義。本設計は Skill Docs 専用の 3 path（integrated-api / guidance-only / terminal-handoff）にマッピングしており、`both` は integrated-api として扱い、`none` は consumer subscription 拒否として guidance-only にマッピングする方針が合理的。fail-fast 原則（silent fallback 禁止）も遵守。consumer subscription は `none` を返すことで自動実行を防止する設計。 |
| 4   | TASK-9I 系既存仕様との衝突 | PASS  | UT-9I-001（LLM プロバイダ SDK 実装）との責務境界が明確に定義されている。本タスクはインターフェース定義のみで、SDK 実装は UT-9I-001 が担当。UT-9I-002（テンプレート CRUD）は OUT OF SCOPE として明示。既存 4 チャンネル IPC 契約の引数・戻り値型は変更なし。DocOperationResult は新規型としての追加のみで後方互換を維持。DocGenerationRequest へのフィールド追加は既存フィールド削除禁止で制約されている。                                                |
| 5   | セキュリティ要件の充足     | PASS  | 4層検証（sender / P42 / enum / エラー境界）は L1-L3 変更なし、L4 のみ DocOperationResult 対応で拡張する方針。エラーサニタイゼーションはコード 5001 で "Internal error occurred" に正規化し、パス・API key・スタックトレースを Renderer に送らない設計。export チャンネルではパストラバーサル防御が IPC 層（`outputPath.includes("..")`）と SkillDocGenerator 層（`validateOutputPath`）の二重防御で維持。P55 準拠の escapeRegExp も設計に含まれている。  |
| 6   | UI/UX 整合                 | MINOR | 下記 MINOR-02 参照。7状態の遷移図は明確で、マイクロコピー方針（破壊的表現の回避、同一ブロック表示）は妥当。Guidance Block / Handoff Card のコンポーネント分離も適切。ただし、error-guidance 状態で retryable=false（コード 5001）の場合の再試行ボタン非表示は設計されているが、コード 4001（INFRASTRUCTURE）は retryable=true でありながら terminal handoff 導線が Secondary CTA に含まれていない点が不整合。                                            |

---

## 2. 8 Pitfall チェック結果

| Pitfall | 判定 | 詳細                                                                                                                                                                                                                                                                                                         |
| ------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| P23     | PASS | 型定義の更新対象ファイルが明確にリストアップされている（contract-matrix.md セクション6）。`packages/shared/src/types/skill-docs.ts` を正本とし、Preload 側は re-export が必要な場合のみ更新する方針。更新順序も shared -> preload -> 実装の順で明示。                                                        |
| P32     | PASS | shared と preload types の同時更新が設計に含まれている（contract-matrix.md セクション6 "型定義更新箇所 P23/P32 準拠"）。同一コミットでの更新が明記されている。                                                                                                                                               |
| P34     | PASS | 遅延初期化が不要であることが根拠付きで説明されている。AuthKeyService と RuntimeResolver は IPC 初期化時点で利用可能なため、Constructor Injection で十分との判断は妥当。DI 注入タイミング表で順序 1-7 が明確に定義されている。                                                                                |
| P42     | PASS | 既存 4 層セキュリティの Layer 2（P42 準拠 3 段バリデーション）を維持する方針。新規入力フィールドにも適用することが明記されている。現行実装のコードレビューでも validateStringArg による 3 段バリデーションが確認済み。                                                                                       |
| P44     | PASS | IPC ハンドラと Preload API のインターフェースは shared types で統一する設計。既存 4 チャンネルの引数・戻り値型は変更なし。registerSkillDocsHandlers への第 3 引数追加は既存呼び出し元の修正が 1 箇所のみで影響範囲が限定的。                                                                                 |
| P45     | PASS | 引数名がセマンティクスに一致している。skillName はスキル名、outputPath は出力パス、promptContext は prompt のコンテキスト。SkillDocsCapability 型の値名も "integrated-api" / "guidance-only" / "terminal-handoff" と動作を正確に表現している。                                                               |
| P48     | FAIL | design-summary.md T-2-2 のリトライ擬似コード（L191）で `return lastResult!;` が使用されている。P48 準拠では non-null assertion を禁止し、実行時型検証に置換する必要がある。下記 MINOR-03 参照。                                                                                                              |
| P54     | PASS | safeRegister パターンの適用判断が contract-matrix.md Pitfall 対策テーブルで明示されている。「戻り値不要のハンドラは safeRegister、要のものは個別 try-catch を使用する」方針。registerSkillDocsHandlers は戻り値を返さないため safeRegister 適用可能。現行 ipc/index.ts でも `track()` 関数で登録されている。 |

---

## 3. 総合判定

**MINOR** - 指摘事項を記録して Phase 4 へ進む。

---

## 4. MINOR 指摘一覧

### MINOR-01: INFRASTRUCTURE カテゴリのリトライ対象範囲が曖昧

**箇所**: design-summary.md T-2-2 リトライポリシー表

**指摘内容**: リトライポリシー表では「retryable エラー（3000-3999: EXTERNAL_SERVICE, 4000-4999: INFRASTRUCTURE）」と記載されているが、失敗ポリシー分類表では INFRASTRUCTURE に属するエラーは 4001（IPC 通信エラー）の 1 件のみ定義されている。4002 以降のエラーコードが将来追加される場合のリトライ可否の判断基準が不明確。

**改善案**: 失敗ポリシー分類表に「INFRASTRUCTURE カテゴリは個別にリトライ可否を判定する。retryable フラグに従う」旨の注記を追加する。または、リトライポリシー表を「retryable === true のエラーのみ」という表現に統一し、カテゴリベースではなくフラグベースの判定であることを明確にする。

**Phase 4 への影響**: テスト設計時にリトライ対象のエッジケースを retryable フラグベースで設計すれば対応可能。

---

### MINOR-02: error-guidance 状態のコード 4001 における terminal handoff 導線の欠如

**箇所**: ui-ux-realization.md セクション 2-6 および design-summary.md T-2-2 失敗ポリシー分類表

**指摘内容**: 失敗ポリシー分類表ではコード 4001（IPC 通信エラー）の Secondary CTA が「-」（なし）となっている。しかし、IPC 通信エラーが持続する場合、ユーザーには terminal handoff 経由でのドキュメント生成という代替手段を提示すべき。他の retryable エラー（3001, 3002, 3003）では全て terminal handoff 導線が用意されている。

**改善案**: コード 4001 の Secondary CTA を「terminal で作成」に変更し、他の retryable エラーと同様の handoff 導線を提供する。DocErrorMapper の 4001 マッピングで `handoffAvailable: true` に変更する（現状の設計ではコード 4001 の guidance が定義されていない）。

**Phase 4 への影響**: テスト設計時にコード 4001 の handoff 導線テストケースを追加すれば対応可能。

---

### MINOR-03: リトライ擬似コードでの non-null assertion (P48 違反)

**箇所**: design-summary.md T-2-2 リトライ擬似コード L191

**指摘内容**: `return lastResult!;` は P48 準拠に違反する。for ループの構造上 `lastResult` は必ず初期化されるが、TypeScript コンパイラはそれを保証できないため、non-null assertion が使用されている。

**改善案**: 以下のいずれかで対応する。

1. `lastResult` の初期値を設定する: `let lastResult: DocOperationResult<string> = { success: false, error: { code: 5001, category: 'INTERNAL', message: 'Retry exhausted', retryable: false } };`
2. ループ外で初期化済みチェックを追加: `if (!lastResult) throw new Error('Unexpected: no result after retry loop');`

**Phase 4 への影響**: 実装時に初期値パターンを採用すれば対応可能。テスト設計への影響なし。

---

### MINOR-04: SkillDocGenerator の constructor シグネチャに関する設計書の不正確な記述

**箇所**: design-summary.md T-2-1

**指摘内容**: 設計書のコメントに `constructor(queryFn: LLMQueryFn) のまま維持` と記載されているが、実際の SkillDocGenerator の constructor は `constructor(queryFn: LLMQueryFn, skillFileManager: SkillFileManager)` と 2 引数を取る。設計書の DI 経路図でも `SkillDocGenerator(queryFn)` と 1 引数のみ記載されている。

**改善案**: 設計書のコメントを `constructor(queryFn: LLMQueryFn, skillFileManager: SkillFileManager) のまま維持` に修正する。DI 経路図も `SkillDocGenerator(queryFn, skillFileManager)` に更新する。

**Phase 4 への影響**: テスト設計時に正しい constructor シグネチャを参照すれば対応可能。既存テストが正しいシグネチャで記述されているため実装への影響はない。

---

### MINOR-05: DocOperationResult の error フィールドの後方互換に関する潜在リスク

**箇所**: contract-matrix.md セクション 2 "後方互換マッピング"

**指摘内容**: 既存の `{ success: false, error: string }` 形式から `{ success: false, error: DocError }` への移行で、Renderer 側の既存コードが `result.error` を文字列として直接使用している場合（例: `alert(result.error)` や `element.textContent = result.error`）に暗黙的な型変換が発生し `[object Object]` が表示される。contract-matrix では「`result.error?.message` で文字列取得可能」と記載されているが、既存 Renderer 側コードの移行漏れリスクが残る。

**改善案**: Phase 4 のテスト設計で、Renderer 側の `result.error` 参照箇所を `grep -rn "result\.error" apps/desktop/src/renderer/` で全件調査し、文字列直接参照がないことを確認するテスト観点を追加する。

**Phase 4 への影響**: テスト設計時に Renderer 側の error 参照パターン調査を含めれば対応可能。

---

## 5. 設計品質サマリー

| 評価項目                   | 評価                             |
| -------------------------- | -------------------------------- |
| 要件定義との一貫性         | 良好                             |
| 既存契約の保全             | 良好                             |
| DI 設計の妥当性            | 良好                             |
| エラーハンドリングの網羅性 | 良好（MINOR 指摘あり）           |
| Pitfall 対策の充足度       | 良好（P48 の擬似コード修正必要） |
| UI/UX 設計の完成度         | 良好（MINOR 指摘あり）           |
| セキュリティの維持         | 良好                             |

---

## 6. 次 Phase

MINOR 指摘 5 件を記録した上で Phase 4（テスト作成）に進む。各 MINOR 指摘は Phase 4-5 での対応が可能であり、Phase 1-2 への差し戻しは不要。
