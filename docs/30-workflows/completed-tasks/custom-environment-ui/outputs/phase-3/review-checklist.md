# 設計レビューチェックリスト: Custom Execution Environment UI

## メタ情報

| 項目       | 値                              |
| ---------- | ------------------------------- |
| タスクID   | AGENT-006                       |
| タスク名   | Custom Execution Environment UI |
| Phase      | 3                               |
| レビュー日 | 2026-01-13                      |

---

## 要件との整合性チェック

| チェック項目                     | 確認結果  | コメント                                                       |
| -------------------------------- | --------- | -------------------------------------------------------------- |
| FR-001: 環境タイプの自動選択     | ✅ OK     | Skill型にenvironmentフィールドが既存（skill.ts:78）            |
| FR-002: HTMLプレビュー環境       | ✅ OK     | HTMLPreviewEnvironmentコンポーネントが設計されている           |
| FR-003: リアルタイム更新         | ✅ OK     | デバウンス付きsetPreviewContentが設計に含まれる                |
| FR-004: 分割レイアウト           | ✅ OK     | SplitLayoutコンポーネントが設計されている                      |
| FR-005: 分割比率の調整           | ✅ OK     | splitRatio状態とonRatioChangeがProps設計に含まれる             |
| FR-006: 環境の手動切り替え       | ✅ OK     | EnvironmentSelectorコンポーネントが設計されている              |
| FR-007: Markdownプレビュー環境   | ✅ OK     | MarkdownPreviewEnvironmentが設計されている                     |
| FR-008: 更新のデバウンス         | ⚠️ 要修正 | 設計ではrefreshDebounce、既存はdebounce（命名不一致）→修正済み |
| NFR-001: セキュリティ（sandbox） | ✅ OK     | ALLOWED_SANDBOX_FLAGS = ["allow-same-origin"]が設計されている  |
| NFR-002: セキュリティ（CSP）     | ✅ OK     | CSP_DIRECTIVESがscript-src 'none'含めて設計されている          |
| NFR-003: パフォーマンス          | ✅ OK     | デバウンス(500ms)とメモ化戦略が設計されている                  |
| NFR-004: 拡張性                  | ✅ OK     | EnvironmentType union typeで新環境追加可能                     |
| NFR-005: アクセシビリティ        | ✅ OK     | Dividerのtabindex=0、aria属性、キーボード操作が設計に含まれる  |

---

## 既存パターンとの適合チェック

| チェック項目             | 確認結果 | コメント                                                        |
| ------------------------ | -------- | --------------------------------------------------------------- |
| Atomic Designパターン    | ✅ OK    | SplitLayout/ExecutionEnvironment: organisms、Selector: molecule |
| Zustand Sliceパターン    | ✅ OK    | agentSlice拡張が既存パターンに準拠                              |
| UIコンポーネント命名規則 | ✅ OK    | PascalCase、意味のある名前を使用                                |
| Props設計規則            | ✅ OK    | 必須/オプションが明確、TypeScript型定義あり                     |
| ファイル配置規則         | ✅ OK    | organisms/molecules配下に正しく配置                             |

---

## セキュリティレビューチェック

| チェック項目         | 確認結果 | コメント                                               |
| -------------------- | -------- | ------------------------------------------------------ |
| sandbox属性          | ✅ OK    | allow-same-originのみ許可、scripts無効化               |
| CSP script-src       | ✅ OK    | 'none'で完全禁止                                       |
| CSP connect-src      | ✅ OK    | 'none'で外部接続禁止                                   |
| CSP form-action      | ✅ OK    | 'none'でフォーム送信禁止                               |
| HTMLサニタイズ       | ✅ OK    | DOMPurifyでscript/iframe/object/embed/form/inputを除去 |
| イベントハンドラ除去 | ✅ OK    | FORBID_ATTRで全イベントハンドラを禁止                  |
| javascript: URL対策  | ✅ OK    | ALLOWED_URI_REGEXPでjavascript:スキームを禁止          |

---

## 依存関係検証チェック

| チェック項目                 | 確認結果 | コメント                                         |
| ---------------------------- | -------- | ------------------------------------------------ |
| AGENT-004（Skill Registry）  | ✅ OK    | Skill.environment既存（skill.ts:78）で互換性あり |
| AGENT-005（Agent Execution） | ✅ OK    | agentSlice.executionState拡張可能な構造          |
| 既存AgentExecutionView       | ✅ OK    | SplitLayoutを親として統合可能                    |
| 既存AgentChatInterface       | ✅ OK    | leftPanelとしてSplitLayoutに配置可能             |

---

## 設計の完全性チェック

| チェック項目                       | 確認結果 | コメント                                          |
| ---------------------------------- | -------- | ------------------------------------------------- |
| すべてのFR/NFRが設計でカバー       | ✅ OK    | 8つのFR、5つのNFRすべてに対応する設計あり         |
| 型定義が完全で曖昧さがない         | ✅ OK    | Props/State/Action全ての型が定義されている        |
| コンポーネント階層が明確           | ✅ OK    | AgentExecutionView→SplitLayout→各環境の階層       |
| データフローが明確に定義されている | ✅ OK    | プレビュー更新/環境切替の両フローが図示されている |

---

## 実装可能性チェック

| チェック項目                     | 確認結果 | コメント                                       |
| -------------------------------- | -------- | ---------------------------------------------- |
| 設計が実装可能なレベルで詳細化   | ✅ OK    | Props、状態管理、ファイル構成まで詳細          |
| 必要なライブラリが特定されている | ✅ OK    | DOMPurify、react-markdown、Prism.js            |
| 既存コードとの統合ポイントが明確 | ✅ OK    | agentSlice拡張、AgentExecutionView統合が明確   |
| テスト可能な設計になっている     | ✅ OK    | セキュリティテストケースが詳細に定義されている |

---

## 統合ポイントレビュー

| 統合ポイント               | 確認結果 | コメント                                             |
| -------------------------- | -------- | ---------------------------------------------------- |
| agentSlice拡張             | ✅ OK    | 既存フィールドとの競合なし、新規フィールドを追加可能 |
| SplitLayout↔親             | ✅ OK    | Props契約が明確、showRightPanelでプレビュー表示切替  |
| ExecutionEnvironment       | ✅ OK    | switch文による環境タイプ振り分けが正確               |
| HTMLPreviewEnvironment     | ✅ OK    | sandbox + CSP + DOMPurifyの多層防御                  |
| MarkdownPreviewEnvironment | ✅ OK    | react-markdown選定、HTMLタグ無効化                   |

---

## 総合評価

| 評価項目         | 結果     |
| ---------------- | -------- |
| 要件との整合性   | ✅ PASS  |
| 既存パターン適合 | ✅ PASS  |
| セキュリティ     | ✅ PASS  |
| 依存関係         | ✅ PASS  |
| 実装可能性       | ✅ PASS  |
| **総合判定**     | **PASS** |

---

## 発見された問題

| 問題ID  | 重要度 | 内容                                                               | 対応状況 |
| ------- | ------ | ------------------------------------------------------------------ | -------- |
| ISS-001 | 中     | EnvironmentType型に"none"がない（既存EnvironmentConfigとの不整合） | 解決済み |
| ISS-002 | 低     | debounce vs refreshDebounce の命名不一致                           | 解決済み |

---

## 完了確認

- [x] すべての要件との整合性が確認されている
- [x] 既存パターンとの適合が確認されている
- [x] セキュリティ設計がレビューされている
- [x] 依存タスクとの互換性が確認されている
- [x] 重大な問題がすべて解決されている
- [x] 統合ポイントがレビューされている
