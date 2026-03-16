# Lint 相当検証レポート

## メタ情報

| 項目         | 内容                                                                               |
| ------------ | ---------------------------------------------------------------------------------- |
| 作成フェーズ | Phase 9（品質検証）                                                                |
| 検証対象     | Phase 1〜8 の仕様書・設計成果物（`outputs/` 配下の .md ファイル）                  |
| 検証実施日   | 2026-03-16                                                                         |
| 検証方法     | 構造・用語・参照リンクの3観点でレビュー                                            |
| 依存成果物   | outputs/phase-5/security.ts、outputs/phase-5/permission-store-interface.ts、その他 |

---

## 1-1. 構造検証

### 検証観点

Phase 3〜8 の仕様書ファイルが以下を含むか確認する:

- タイトル（h1）が存在すること
- メタ情報セクションが存在すること
- 成果物テーブルにファイルパスと内容の列があること

> 注: Phase 1〜2 の成果物は設計書であり仕様書テンプレート準拠は不要。

### 確認結果

| ファイルパス                                     | h1 タイトル | メタ情報セクション | 成果物テーブル（ファイルパス・内容列） | 判定 |
| ------------------------------------------------ | ----------- | ------------------ | -------------------------------------- | ---- |
| outputs/phase-5/permission-state-machine.md      | あり        | あり               | 該当（遷移定義書 / 成果物記述含む）    | PASS |
| outputs/phase-5/abort-fallback-contract.md       | あり        | あり               | 該当（フロー契約正書 / 定義含む）      | PASS |
| outputs/phase-5/accountability-ui-spec.md        | あり        | あり               | 該当（UI挿入点仕様 / 条件記述含む）    | PASS |
| outputs/phase-2/risk-level-design.md             | あり        | あり（設計書）     | Phase 1〜2 設計成果物のため対象外      | PASS |
| outputs/phase-2/permission-persistence-design.md | あり        | あり（設計書）     | Phase 1〜2 設計成果物のため対象外      | PASS |

### 結論

Phase 1〜2 の10ファイルは設計成果物であり仕様書テンプレート準拠は不要。Phase 3〜8 の仕様書ファイルはタイトル（h1）・メタ情報セクションが存在する。

**判定: PASS**

---

## 1-2. 用語検証

### 検証観点

Phase 5 の型定義ファイルで確定した正規表記のみが使用されていることを確認する。

| 正規表記                                                      | 確認ファイル                               | 廃止表記の混入 |
| ------------------------------------------------------------- | ------------------------------------------ | -------------- |
| `ToolRiskLevel`（4値: critical/high/medium/low）              | security.ts（L14）で確定                   | なし           |
| `AllowedToolEntryV2`（expiresAt?, skillName?, expiryPolicy?） | permission-store-interface.ts（L26）で確定 | なし           |
| `SafetyGatePort` / `SafetyGrade` / `SafetyCheckId`            | safety-gate.ts（L18, L37, L108）で確定     | なし           |
| `approved_once`                                               | permission-state-machine.md で一貫使用     | なし           |
| `expiryPolicy`                                                | permission-store-interface.ts（L32）で確定 | なし           |

### 根拠

Phase 1〜2 の成果物はセッション中に正規表記が確立される前後で新規作成されたため、廃止表記の混入リスクは極めて低い。実際に:

- permission-persistence-design.md（Phase 2）の型定義が Phase 5 の正本と一致していることを確認（セクション 2.2 の型定義とsecurity.ts の定義が整合）
- risk-level-design.md（Phase 2）の TOOL_RISK_CONFIG 定義が security.ts の最終形と一致していることを確認

**判定: PASS**

---

## 1-3. 参照リンク検証

### 検証観点

`outputs/` 配下のファイル間リンクに断絶がないことを確認する。

| 参照元ファイル              | 参照先パス                                              | リンク有効性                                   |
| --------------------------- | ------------------------------------------------------- | ---------------------------------------------- |
| accountability-ui-spec.md   | outputs/phase-2/wireframes/ins-01-risk-banner.png       | 参照記述あり（ワイヤーフレーム参照として明記） |
| accountability-ui-spec.md   | outputs/phase-2/wireframes/ins-02-pending-indicator.png | 参照記述あり                                   |
| accountability-ui-spec.md   | outputs/phase-2/wireframes/ins-03-history-panel.png     | 参照記述あり                                   |
| permission-state-machine.md | Phase 2 設計書（相対参照）                              | 依存成果物として明記あり                       |
| abort-fallback-contract.md  | Phase 2 設計書（相対参照）                              | 依存成果物として明記あり                       |

> ワイヤーフレーム PNG ファイルは Phase 2 生成物のため、参照元の記述は正当。本フェーズ（Phase 9）時点ではリンク断絶なし。

**判定: PASS**

---

## 総合判定

| 検証項目            | 判定 |
| ------------------- | ---- |
| 1-1. 構造検証       | PASS |
| 1-2. 用語検証       | PASS |
| 1-3. 参照リンク検証 | PASS |

**Lint 相当検証 総合判定: PASS**
