# Phase 6: テスト拡充（エッジケース）

## メタ情報

| 項目       | 内容                                              |
| ---------- | ------------------------------------------------- |
| Phase      | 6                                                 |
| タスクID   | UT-SKILL-WIZARD-NOTION-SPECIAL-CASE-ELIMINATE-001 |
| 実行日     | 2026-04-15                                        |
| ステータス | completed                                         |

## 追加済みエッジケーステスト

既存テストファイル（`skill-wizard-label-map.test.ts`）に以下のエッジケースが網羅されていることを確認済み:

| TC番号 | テストケース                                       | カバー内容                          |
| ------ | -------------------------------------------------- | ----------------------------------- |
| TC-01  | notion → `{ label: "その他", freeText: "Notion" }` | オブジェクトエントリ変換（AC-1）    |
| TC-02  | slack → `{ label: "Slack" }`                       | stringエントリのオブジェクト変換    |
| TC-03  | github → `{ label: "GitHub" }`                     | stringエントリのオブジェクト変換    |
| TC-04  | zapier（未登録）→ `{ label: "zapier" }`            | 未登録値のフォールバック            |
| TC-05  | undefined → `undefined`                            | undefined の安全処理                |
| TC-06  | q99（未登録 questionId）→ `{ label: value }`       | 未登録 questionId のフォールバック  |
| TC-07  | カスタム labelMap で変換                           | 依存注入テスト可能性の検証          |
| TC-08  | q1 "自分だけ" → "自分のみ"（後方互換）             | resolveSemanticLabel の後方互換確認 |
| TC-09  | q3 "scheduled" → "定期実行"（後方互換）            | resolveSemanticLabel の後方互換確認 |
| TC-10  | q6 "週次" → "週に1回"（後方互換）                  | resolveSemanticLabel の後方互換確認 |
| TC-11  | notion → "その他"（resolveSemanticLabel）          | freeText を含まない string 返却確認 |
| TC-12  | undefined → undefined（resolveSemanticLabel）      | undefined の安全処理確認            |
| TC-13  | SEMANTIC_LABEL_MAP.q5.notion がオブジェクト        | マップの実際のデータ構造確認        |
| TC-14  | SEMANTIC_LABEL_MAP.q5.slack が string              | stringエントリの確認                |

## 評価

全 14 テストケースが PASS（vitest run 確認済み）。エッジケースは Phase 4 テスト作成時点で網羅されていたため追加テストは不要。
