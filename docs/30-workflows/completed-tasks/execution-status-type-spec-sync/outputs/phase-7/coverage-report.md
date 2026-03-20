# Phase 7: カバレッジレポート

> タスク: UT-LIFECYCLE-EXECUTION-STATUS-TYPE-SPEC-SYNC-001
> 実行日: 2026-03-20

---

## 軸1: refs coverage

### 一次情報 coverage

| 参照対象                                      | workflow 内参照数  | 判定    |
| --------------------------------------------- | ------------------ | ------- |
| Task12 一次情報 (`TASK-IMP-LIFECYCLE-*`)      | 50件（15ファイル） | COVERED |
| lessons-learned (`lessons-learned-current-*`) | 含まれる           | COVERED |

### 更新対象 coverage

| 更新対象ファイル                      | Phase 1 で特定 | Phase 5 で更新 | Phase 6 で検証      | 判定    |
| ------------------------------------- | -------------- | -------------- | ------------------- | ------- |
| `interfaces-agent-sdk-integration.md` | FR-01/FR-02    | L310-322 更新  | T4-1/T4-3/T6-4 PASS | COVERED |
| `arch-state-management-core.md`       | FR-03          | L504-527 追記  | T4-2 PASS           | COVERED |

### index coverage

| index ファイル                         | workflow 内参照数             | 判定    |
| -------------------------------------- | ----------------------------- | ------- |
| `resource-map`                         | 含まれる（複数 Phase で参照） | COVERED |
| `topic-map`                            | 66件（24ファイル）            | COVERED |
| `quick-reference-search-patterns-code` | 含まれる                      | COVERED |

**refs coverage 判定: PASS** - 一次情報・更新対象・index の3項目全て COVERED。

---

## 軸2: validator coverage

### 必須コマンドの出現と引き継ぎ

| validator コマンド         | Phase 5 | Phase 6 | Phase 9 | Phase 11 | Phase 12 | 判定    |
| -------------------------- | ------- | ------- | ------- | -------- | -------- | ------- |
| `validate-phase-output.js` | 7件     | 9件     | 10件    | 6件      | 5件      | COVERED |
| `verify-all-specs.js`      | -       | 含む    | 含む    | -        | 含む     | COVERED |
| `diff -qr`                 | 7件     | 9件     | 10件    | 6件      | 5件      | COVERED |

validator コマンドの出現状況（全体）:

- `validate-phase-output` / `diff -qr` / `generate-index`: 58件 / 15ファイル

**validator coverage 判定: PASS** - 3つの必須コマンドが Phase 5 から Phase 12 まで継承されている。

---

## 軸3: 分岐 coverage（ready / blocked）

### Phase 別 ready/blocked 出現

| Phase    | ready 出現                                    | blocked 出現                                               | 判定    |
| -------- | --------------------------------------------- | ---------------------------------------------------------- | ------- |
| Phase 5  | ready path ステップ2 で定義（仕様書更新手順） | blocked path ステップ3 で定義（停止記録手順）              | COVERED |
| Phase 10 | ready/blocked の総合判定を実施                | M10-03 で blocked record 補強を追跡                        | COVERED |
| Phase 12 | ready 時の仕様書更新手順を記載                | blocked 時の documentation-changelog 記録を定義            | COVERED |
| Phase 13 | `ready to create` ステータス定義              | `blocked` ステータス + blocked record table（5項目）を定義 | COVERED |

Phase 5/10/12/13 の全てで ready / blocked の**両分岐**が明示的に扱われている。

**分岐 coverage 判定: PASS** - 4 Phase 全てで両分岐が存在。

---

## 軸4: dependency edge coverage

### Phase 2 lane 設計と Phase 3 review gate からの edge 検証

| edge                                          | 起点                                                           | 終点                                                        | 接続確認                                                | 判定      |
| --------------------------------------------- | -------------------------------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------- | --------- |
| Phase 1 抽出 -> Phase 4 テスト                | Phase 1 requirements.md: FR-01〜FR-05                          | Phase 4 test-cases.md: T4-1〜T4-12                          | T4-1 が FR-01 の readiness を検証、T4-5 が FR-04 を検証 | CONNECTED |
| Phase 4 テスト -> Phase 5 実装                | Phase 4 test-cases.md: T4-7 ready 判定                         | Phase 5 implementation-summary.md: ready path 実施          | T4-7 の ready 判定が Phase 5 ステップ2 のトリガー       | CONNECTED |
| Phase 5 実装 -> Phase 6 validator             | Phase 5: index/mirror/validator 実行                           | Phase 6: T6-1〜T6-3 で parity + validator 前提を拡充確認    | Phase 5 の初回検証結果を Phase 6 が回帰テストで再確認   | CONNECTED |
| Phase 10 MINOR -> Phase 11/12 handoff         | Phase 10: M10-03 blocked record 追跡                           | Phase 12: blocker 記録手順 / Phase 13: blocked record table | M10-03 が Phase 13 の blocked record 補強を指示         | CONNECTED |
| Phase 12 docs 契約 -> Phase 13 blocked record | Phase 12: system-spec-update-summary / documentation-changelog | Phase 13: blocked record table + pr-info.md                 | Phase 12 の更新記録が Phase 13 の readiness 判定材料    | CONNECTED |

**dependency edge coverage 判定: PASS** - 5 edge 全て接続確認済み。handoff の切断なし。

---

## カバレッジサマリー

| 軸                       | 測定結果                               | 判定     |
| ------------------------ | -------------------------------------- | -------- |
| refs coverage            | 一次情報 + 更新対象 + index 全 COVERED | **PASS** |
| validator coverage       | 3コマンドが Phase 5-12 で継承          | **PASS** |
| 分岐 coverage            | Phase 5/10/12/13 で両分岐存在          | **PASS** |
| dependency edge coverage | 5 edge 全て CONNECTED                  | **PASS** |

**総合判定: PASS** - 4軸カバレッジ全て充足。参照漏れ・handoff 切断なし。

---

## 補足: 条件付き事項

| 事項                            | 影響                                                                     | 対応予定             |
| ------------------------------- | ------------------------------------------------------------------------ | -------------------- |
| T6-1 indexes/keywords.json 差分 | 低（自動生成ファイル）                                                   | Phase 12 mirror sync |
| T6-10/T6-11 スクリプト不存在    | なし（代替の validate-phase-output / verify-all-specs で coverage 確保） | N/A                  |
| outputs/artifacts.json 欠如     | 低（全体構造問題）                                                       | Phase 13             |
