# Phase 11: 発見事項

## メタ情報

| 項目     | 内容                                                  |
| -------- | ----------------------------------------------------- |
| タスクID | TASK-IMP-SLIDE-MODIFIER-MANUAL-FALLBACK-ALIGNMENT-001 |
| Phase    | 11                                                    |
| 作成日   | 2026-03-23                                            |
| タイプ   | 設計タスク（プロダクションコード変更なし）            |

## 注記

本タスクはプロダクションコードを変更しない設計タスクのため、
実際の UI Walkthrough（Electron アプリ起動）は実施できない。

本ファイルには、設計 walkthrough（ドキュメントの目視確認）で発見した
「実装時の確認事項」を記録する。

---

## 1. 設計 Walkthrough の発見事項

### 発見事項 D-01: progress row のアニメーション仕様が未定義

| 項目     | 内容                                                                           |
| -------- | ------------------------------------------------------------------------------ |
| 発見箇所 | contract-matrix.md セクション2（running 行: progress row = show）              |
| 内容     | running 状態での progress row の「アニメーション」仕様が設計に記載されていない |
| 影響     | UT-SLIDE-UI-001 が任意のアニメーション実装を採用するリスク                     |
| 分類     | 実装時の確認事項（設計補完が必要）                                             |
| 対応案   | UT-SLIDE-UI-001 Phase 2 でアニメーション仕様（duration / easing）を追記する    |
| 重要度   | LOW（Apple HIG の 200-300ms アニメーション原則があるため許容範囲）             |

### 発見事項 D-02: fallback card の CTA ボタンラベルが未定義

| 項目     | 内容                                                                            |
| -------- | ------------------------------------------------------------------------------- |
| 発見箇所 | contract-matrix.md セクション5（UX-07-S03 の画面要素）                          |
| 内容     | fallback card の CTA ボタンのラベルテキストが設計ドキュメントに記載されていない |
| 影響     | UT-SLIDE-UI-001 が任意のラベルテキストを採用するリスク                          |
| 分類     | 実装時の確認事項（コピーライティング仕様が必要）                                |
| 対応案   | UT-SLIDE-UI-001 Phase 2 でボタンラベルを確定する（例: 「手動で対応する」）      |
| 重要度   | LOW（UX の明確性に影響するが、機能を壊すものではない）                          |

### 発見事項 D-03: terminal launcher のコマンドテンプレートが未定義

| 項目     | 内容                                                                            |
| -------- | ------------------------------------------------------------------------------- |
| 発見箇所 | contract-matrix.md セクション4（TerminalHandoffCard.target フィールド）         |
| 内容     | TerminalHandoffCard.target に格納されるターミナルコマンドのテンプレートが未定義 |
| 影響     | UT-SLIDE-HANDOFF-DUP-001 が任意のコマンドテンプレートを採用するリスク           |
| 分類     | 実装時の確認事項（Task05 との整合性確認が必要）                                 |
| 対応案   | TASK-IMP-TERMINAL-HANDOFF-SURFACE-REALIZATION-001 の設計を参照して確定する      |
| 重要度   | MEDIUM（Task05 との整合性に影響する）                                           |

### 発見事項 D-04: blockedReason の表示形式が未定義

| 項目     | 内容                                                                                             |
| -------- | ------------------------------------------------------------------------------------------------ |
| 発見箇所 | contract-matrix.md セクション4（SlideCapabilityDTO.blockedReason フィールド）                    |
| 内容     | blockedReason の文字列が UI のどのコンポーネントに表示されるかが未定義                           |
| 影響     | UT-SLIDE-UI-001 が blockedReason を guidance block か fallback card か任意の場所に表示するリスク |
| 分類     | 実装時の確認事項（表示先コンポーネントの明示が必要）                                             |
| 対応案   | UT-SLIDE-UI-001 Phase 2 で blockedReason の表示先（guidance block 内の説明テキスト）を明示する   |
| 重要度   | LOW（機能を壊すものではない）                                                                    |

---

## 2. 発見事項サマリー

| ID   | タイトル                                     | 重要度 | 対応先                   |
| ---- | -------------------------------------------- | ------ | ------------------------ |
| D-01 | progress row アニメーション仕様未定義        | LOW    | UT-SLIDE-UI-001          |
| D-02 | fallback card CTA ボタンラベル未定義         | LOW    | UT-SLIDE-UI-001          |
| D-03 | terminal launcher コマンドテンプレート未定義 | MEDIUM | UT-SLIDE-HANDOFF-DUP-001 |
| D-04 | blockedReason 表示先コンポーネント未定義     | LOW    | UT-SLIDE-UI-001          |

**CRITICAL / HIGH 発見事項: なし**
**MEDIUM 発見事項: 1件（D-03 は Task05 との整合性確認で解決可）**

---

## 3. 実際の UI Walkthrough 実施時の留意事項

UT-SLIDE-UI-001 の Phase 11 では、以下の追加確認を実施すること。

- D-01: running 状態のアニメーションが Apple HIG（200〜300ms）に準拠しているか
- D-02: fallback card の CTA ラベルがユーザーにとって明確な行動を示しているか
- D-03: terminal launcher が Task05 の TerminalHandoffCard と重複していないか
- D-04: blockedReason のテキストが guidance block 内に自然に配置されているか
