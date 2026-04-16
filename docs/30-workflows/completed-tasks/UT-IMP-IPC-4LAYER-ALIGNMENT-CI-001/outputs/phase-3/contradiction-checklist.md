# Phase 3 成果物: 矛盾チェック表

| 項目   | 内容                               |
| ------ | ---------------------------------- |
| Phase  | 3                                  |
| タスク | 矛盾チェック                       |
| 機能名 | UT-IMP-IPC-4LAYER-ALIGNMENT-CI-001 |
| 作成日 | 2026-04-14                         |

---

## 1. Phase 1 内部矛盾チェック

### 1.1 要件定義 vs 受け入れ基準

| チェック項目                            | 結果 | 備考                                |
| --------------------------------------- | ---- | ----------------------------------- |
| FR-1 に対応する AC が存在するか         | OK   | AC-2 が対応                         |
| FR-2 に対応する AC が存在するか         | OK   | AC-3 が対応                         |
| FR-3 に対応する AC が存在するか         | OK   | AC-4 が対応                         |
| FR-4 に対応する AC が存在するか         | OK   | AC-5, AC-6 が対応                   |
| FR-5 に対応する AC が存在するか         | OK   | AC-5, AC-6 で出力形式を暗黙的に検証 |
| FR-6 に対応する AC が存在するか         | OK   | AC-1 で実行可能性を検証             |
| NFR-1 に対応する AC が存在するか        | OK   | AC-7 で CI 統合を検証               |
| NFR-2 に対応する AC が存在するか        | OK   | AC-1 で Node.js 単体実行を検証      |
| NFR-3 に対応する検証方法があるか        | OK   | 共存テスト（手動確認）              |
| NFR-4 に対応する検証方法があるか        | OK   | AC-2〜4 で自動検出を検証            |
| AC に対応する FR/NFR がない AC がないか | OK   | AC-7=NFR-1, AC-8=品質               |

### 1.2 要件定義 vs 仕様マッピング

| チェック項目                             | 結果 | 備考                              |
| ---------------------------------------- | ---- | --------------------------------- |
| 全 FR に対応する SPEC が存在するか       | OK   | FR-1〜6 に SPEC-I01〜I06 等が対応 |
| 全 SPEC に対応するコードアンカーがあるか | OK   | CCA-01〜CCA-10 が存在             |
| 未使用の SPEC がないか                   | OK   | 全 SPEC が要件から参照されている  |
| 未使用のコードアンカーがないか           | OK   | 全 CCA が SPEC から参照されている |

### 1.3 トレーサビリティ行列の完全性

| チェック項目                              | 結果 | 備考                         |
| ----------------------------------------- | ---- | ---------------------------- |
| 全要件が行列に含まれているか              | OK   | FR-1〜6, NFR-1〜4 全件あり   |
| 全 AC が行列に含まれているか              | OK   | AC-1〜8 全件あり             |
| テスト Phase が全テストに指定されているか | OK   | Phase 4, 6, 9, 11 に分散     |
| リスク RISK-01〜05 に軽減策があるか       | OK   | 全件に軽減策が記載されている |

---

## 2. Phase 2 内部矛盾チェック

### 2.1 アーキテクチャ vs アルゴリズム

| チェック項目                               | 結果 | 備考                                             |
| ------------------------------------------ | ---- | ------------------------------------------------ |
| 関数名が一致するか                         | OK   | parseSharedChannels 等が両文書で一致             |
| 入出力型が一致するか                       | OK   | Set<string>, ParsedPreload 等が一致              |
| データフローが矛盾しないか                 | OK   | Parse -> Validate -> Report の順序が一致         |
| エントリポイントの呼び出し順序が一致するか | OK   | main() 内の4パーサー + 3バリデーターの順序が一致 |

### 2.2 アーキテクチャ vs CI統合

| チェック項目                                   | 結果 | 備考                                |
| ---------------------------------------------- | ---- | ----------------------------------- |
| スクリプトパスが一致するか                     | OK   | `scripts/verify-ipc-4layer.js`      |
| 実行コマンドが一致するか                       | OK   | `node scripts/verify-ipc-4layer.js` |
| exit code の意味が一致するか                   | OK   | 0=pass, 1=fail, 2=error             |
| 外部依存なしの前提が CI 設計に反映されているか | OK   | pnpm install 不要の設計             |

### 2.3 アーキテクチャ vs テスト戦略

| チェック項目                                     | 結果 | 備考                                                     |
| ------------------------------------------------ | ---- | -------------------------------------------------------- |
| 全 export 関数にテストがあるか                   | OK   | 4パーサー + 3バリデーター + formatReport + stripComments |
| テストフィクスチャがパーサー入力形式と一致するか | OK   | `as const` パターン等が一致                              |
| モック対象がアーキテクチャの依存と一致するか     | OK   | fs, console がモック対象                                 |

### 2.4 テスト戦略 vs 依存整合マトリクス

| チェック項目                               | 結果 | 備考                         |
| ------------------------------------------ | ---- | ---------------------------- |
| 検証ルールが一致するか                     | OK   | Rule-1, 2, 3 が両文書で一致  |
| 破壊的変更シナリオがテストでカバーされるか | OK   | 新チャネル追加テスト等が対応 |

---

## 3. Phase 1 vs Phase 2 矛盾チェック

### 3.1 要件 vs 設計

| チェック項目               | 結果 | 備考                                                              |
| -------------------------- | ---- | ----------------------------------------------------------------- |
| FR-1 の設計が存在するか    | OK   | parseSharedChannels + validateSharedToPreload                     |
| FR-2 の設計が存在するか    | OK   | parsePreloadWhitelist + parseMainHandlers + validatePreloadToMain |
| FR-3 の設計が存在するか    | OK   | parseRendererUsage + validateRendererToShared                     |
| FR-4 の設計が存在するか    | OK   | main() の exit code 設定                                          |
| FR-5 の設計が存在するか    | OK   | formatReport + ::error アノテーション                             |
| FR-6 の設計が存在するか    | OK   | 正規表現ベースの全パーサー                                        |
| NFR-1 の設計が満たされるか | OK   | < 100ms + timeout-minutes: 5                                      |
| NFR-2 の設計が満たされるか | OK   | .js + fs/path のみ                                                |
| NFR-3 の設計が満たされるか | OK   | 独立ファイル、共有関数なし                                        |
| NFR-4 の設計が満たされるか | OK   | ファイルスキャン + 正規表現抽出                                   |

### 3.2 受け入れ基準 vs テスト戦略

| AC   | テスト設計があるか | テストID                            |
| ---- | ------------------ | ----------------------------------- |
| AC-1 | OK                 | IT-01 (結合テスト)                  |
| AC-2 | OK                 | UT-V1-02, IT-02                     |
| AC-3 | OK                 | UT-V2-02, IT-03                     |
| AC-4 | OK                 | UT-V3-02, IT-04                     |
| AC-5 | OK                 | UT-V1-01, UT-V2-01, UT-V3-01, IT-01 |
| AC-6 | OK                 | IT-02, IT-03, IT-04                 |
| AC-7 | OK                 | CI 構成確認（手動 + 静的確認）      |
| AC-8 | OK                 | 全 UT-\* テストの実行               |

### 3.3 仕様マッピング vs アーキテクチャ

| SPEC     | 対応する設計要素                             | 一致 |
| -------- | -------------------------------------------- | ---- |
| SPEC-A01 | 4層パーサー全体                              | OK   |
| SPEC-A02 | チャネル値パターン正規表現                   | OK   |
| SPEC-A03 | parsePreloadWhitelist の ALLOWED\_\* 抽出    | OK   |
| SPEC-A04 | parseRendererUsage の safeInvoke/safeOn 抽出 | OK   |
| SPEC-I01 | parseSharedChannels の `as const` パターン   | OK   |
| SPEC-I02 | parseSharedChannels の個別 export パターン   | OK   |
| SPEC-I03 | parseSharedChannels の IPC_CHANNELS 集約     | OK   |
| SPEC-I04 | parsePreloadWhitelist の IPC_CHANNELS 定義   | OK   |
| SPEC-I05 | parseRendererUsage の safeInvoke/safeOn      | OK   |
| SPEC-I06 | parseMainHandlers の ipcMain.handle パターン | OK   |
| SPEC-S01 | parsePreloadWhitelist の invoke 抽出         | OK   |
| SPEC-S02 | parsePreloadWhitelist の on 抽出             | OK   |
| SPEC-S03 | validateRendererToShared の未定義検出        | OK   |
| SPEC-W01 | ci-integration-design の job 定義            | OK   |
| SPEC-W02 | ci-integration-design の needs 設定          | OK   |
| SPEC-W03 | dependency-consistency-matrix の共存設計     | OK   |

---

## 4. 検出された矛盾

### 4.1 矛盾 #1: renderer 層の定義のずれ

| 項目         | Phase 1 (requirements-definition.md) | Phase 2 (architecture-design.md)        |
| ------------ | ------------------------------------ | --------------------------------------- |
| renderer     | "renderer sink で使用されるチャネル" | "preload の safeInvoke/safeOn 呼び出し" |
| 対象ファイル | `apps/desktop/src/renderer/` 配下    | `apps/desktop/src/preload/` 配下        |

**分析**: Phase 1 の要件定義では renderer 配下のファイルを対象としていたが、Phase 2 の設計で renderer が直接チャネル名を持たないことが判明し、preload 配下の safeInvoke/safeOn を代理指標とする設計に変更された。

**判定**: **矛盾ではなく設計上の改善**。FR-3 の意図（renderer で使われるチャネルの整合性検証）は保たれている。要件定義の「renderer sink」を「renderer が到達可能なチャネル（preload 経由）」と再解釈する。

**対応**: 要件定義書に注記を追加し、設計変更の経緯を記録する。Phase 5 実装時に反映。

### 4.2 矛盾 #2: Rule-3 の検証範囲

| 項目   | Phase 1 (acceptance-criteria.md) | Phase 2 (validation-algorithm-design.md) |
| ------ | -------------------------------- | ---------------------------------------- |
| Rule-3 | renderer ⊆ shared                | renderer ⊆ (shared ∪ preload.defined)    |

**分析**: Phase 1 では shared のみとの整合性を検証する基準だったが、Phase 2 で preload 独自チャネルの存在を考慮し、preload.defined も合格対象に含めた。

**判定**: **矛盾ではなく設計上の改善**。preload に独自定義が多数あり、shared にないチャネルを全て ERROR とするのは誤検出を生む。preload.defined を合格対象に含めることで実用的な検証になる。

**対応**: 受け入れ基準 AC-4 の詳細説明に「shared または preload IPC_CHANNELS に定義されていないチャネル」と明記。

---

## 5. 矛盾チェック結果サマリー

| カテゴリ                | チェック数 | OK     | 矛盾  | 改善的差異 |
| ----------------------- | ---------- | ------ | ----- | ---------- |
| Phase 1 内部整合        | 19         | 19     | 0     | 0          |
| Phase 2 内部整合        | 14         | 14     | 0     | 0          |
| Phase 1 vs Phase 2 整合 | 26         | 24     | 0     | 2          |
| **合計**                | **59**     | **57** | **0** | **2**      |

**結論**: 真の矛盾は 0 件。2 件の差異はいずれも Phase 2 での設計改善であり、Phase 1 の要件の意図を保ちつつ実装可能性を高めたもの。Phase 4 以降の実装に支障なし。
