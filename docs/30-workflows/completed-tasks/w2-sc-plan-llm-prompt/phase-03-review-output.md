# Phase 3: 設計レビュー - 出力文書

## メタ情報

| 項目     | 値                         |
| -------- | -------------------------- |
| Phase    | 3                          |
| タスクID | TASK-SC-03-PLAN-LLM-PROMPT |
| 作成日   | 2026-03-23                 |

## 1. 要件適合性チェック

### AC-1: 自然言語入力 → 構造計画生成

| チェック項目                                   | 結果 | 根拠                                                       |
| ---------------------------------------------- | ---- | ---------------------------------------------------------- |
| 自然言語テキストを受け取る                     | PASS | plan(skillSpec) で string 型の入力を受け取る               |
| agent 仕様書を system prompt に注入する        | PASS | buildPlanSystemPrompt() で3ファイルを連結                  |
| LLM に構造化 JSON を返させる                   | PASS | RESPONSE FORMAT セクションで JSON スキーマを指定           |
| RuntimeSkillCreatorPlanResult にマッピングする | PASS | parsePlanResponse() で型ガード検証後にマッピング           |
| skillName/description/agents/scripts 等を返す  | PASS | RuntimeSkillCreatorPlanResult 拡充型で全フィールド定義済み |

**判定: AC-1 充足**

### AC-4: TerminalHandoff 非破壊

| チェック項目                               | 結果 | 根拠                                   |
| ------------------------------------------ | ---- | -------------------------------------- |
| terminal_handoff 分岐のコードを変更しない  | PASS | 変更対象は integrated_api 分岐のみ     |
| RuntimePolicyResolver を変更しない         | PASS | resolveDecision() は呼び出すだけ       |
| TerminalHandoffBuilder を変更しない        | PASS | 設計書で「変更しないコード領域」に明記 |
| terminal_handoff テストが Green を維持する | PASS | 既存テストへの影響なし                 |

**判定: AC-4 充足**

### FR-1 対応

| 機能要件                        | 設計対応                                   | 結果 |
| ------------------------------- | ------------------------------------------ | ---- |
| agent 仕様書を動的に読み込む    | ResourceLoader.loadAgent() で3ファイル読込 | PASS |
| LLM に plan 生成を依頼する      | ILLMAdapter.sendChat() で API 呼び出し     | PASS |
| JSON レスポンスをパースする     | parsePlanResponse() + 型ガード             | PASS |
| エラー時に graceful degradation | llmAdapter 未注入時はスタブ返却            | PASS |

## 2. コンテキスト長検証

### Agent 仕様書の合計トークン

| ファイル            | 行数    | 推定トークン数 |
| ------------------- | ------- | -------------- |
| discover-problem.md | 220     | ~12,000        |
| design-workflow.md  | 157     | ~9,000         |
| plan-structure.md   | 172     | ~10,000        |
| JSON スキーマ指示   | ~30     | ~500           |
| **合計**            | **579** | **~31,500**    |

### Claude API 入力上限との比較

- 入力上限: 200,000 tokens
- System Prompt: ~31,500 tokens (15.8%)
- User Prompt（平均的な skillSpec）: ~200 tokens
- **余裕: ~168,300 tokens (84.2%)**
- **判定: 上限内に十分収まる。分割読み込みは不要**

## 3. プロンプト設計レビュー

### 3.1 構造の評価

| 評価項目                | 結果 | コメント                                               |
| ----------------------- | ---- | ------------------------------------------------------ |
| 区切り文字の明確さ      | PASS | `=== AGENT: {name} ===` は LLM が容易に区別可能        |
| 連結順序の妥当性        | PASS | 問題発見 → 設計 → 構造 の順序は論理的                  |
| JSON スキーマ指示の位置 | PASS | system prompt 末尾に配置、LLM の最終出力指示として適切 |
| JSON-only 出力指示      | PASS | "respond with ONLY a valid JSON object" で明示         |

### 3.2 JSON スキーマとの RuntimeSkillCreatorPlanResult 整合性

| JSON フィールド | PlanResult フィールド | 型一致 | 備考                  |
| --------------- | --------------------- | ------ | --------------------- |
| skillName       | skillName             | PASS   | string                |
| description     | description           | PASS   | string                |
| agents          | agents                | PASS   | Array<{name,role}>    |
| scripts         | scripts               | PASS   | Array<{name,purpose}> |
| triggers        | triggers              | PASS   | string[]              |
| anchors         | anchors               | PASS   | string[]              |
| -               | planId                | N/A    | 生成値                |
| -               | skillSpec             | N/A    | 入力コピー            |
| -               | estimatedSteps        | N/A    | 計算値                |

**判定: 整合**

### 3.3 プロンプトインジェクション耐性

| 攻撃ベクトル               | 防御                                                         | 結果 |
| -------------------------- | ------------------------------------------------------------ | ---- |
| skillSpec に指示注入       | system prompt の JSON スキーマ制約により出力形式が固定される | PASS |
| skillSpec に区切り文字注入 | user prompt は system とは別セクション、LLM は区別可能       | PASS |
| agent 仕様書の改竄         | ResourceLoader はローカルファイルのみ読み込み                | PASS |

## 4. DI 設計レビュー

### 4.1 テスタビリティ

| 評価項目                                | 結果  | コメント                                                       |
| --------------------------------------- | ----- | -------------------------------------------------------------- |
| ILLMAdapter インターフェースで DI (P61) | PASS  | 具象クラス依存なし、モック差し替え容易                         |
| ResourceLoader は直接型で DI            | MINOR | インターフェース型がない。テストではモック可能だが理想的でない |
| deps オブジェクトパターンとの整合       | PASS  | 既存パターンに追従                                             |
| オプション注入 (P54)                    | PASS  | llmAdapter/resourceLoader 未注入時のフォールバックあり         |

### 4.2 既存ファクトリとの整合

| 評価項目                   | 結果  | コメント                                                                                                 |
| -------------------------- | ----- | -------------------------------------------------------------------------------------------------------- |
| LLMAdapterFactory との整合 | MINOR | LLMAdapterFactory.getAdapter() は apiKey 設定済みアダプタを返す。plan() 実行時の apiKey と不整合の可能性 |
| ResourceLoader の生成方法  | PASS  | DEFAULT_SKILL_CREATOR_PATH で新規インスタンス化は妥当                                                    |
| ipc/index.ts の配線追加量  | PASS  | 2行追加のみ（最小限）                                                                                    |

## 5. 判定

### 総合判定: PASS (MINOR 2件)

### MINOR 指摘リスト

| #   | 指摘                                         | 影響度 | 対応方針                                                                                                                                     |
| --- | -------------------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | ResourceLoader のインターフェース型不在      | 低     | 現時点ではモック化で対応可能。将来的に IResourceLoader を定義する未タスクとする                                                              |
| 2   | LLMAdapterFactory と plan() 時の apiKey 整合 | 低     | plan() は decision.apiKey を使用するが、DI 時点の apiKey と異なる可能性がある。apiKey を plan() 実行時に動的に設定する仕組みを未タスクとする |

### MINOR 指摘の未タスク化

- **UT-SC-03-001**: IResourceLoader インターフェース定義と DI パターン統一
- **UT-SC-03-002**: plan() 実行時の動的 apiKey 設定メカニズム

## 6. 次のステップ

MINOR 指摘は未タスク化済み。Phase 4（テスト作成）へ進む。
