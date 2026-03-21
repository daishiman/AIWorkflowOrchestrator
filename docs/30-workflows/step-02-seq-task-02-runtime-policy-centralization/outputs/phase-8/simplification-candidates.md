# 簡素化候補分析

## メタ情報

| 項目       | 値                                    |
| ---------- | ------------------------------------- |
| Phase      | 8 - リファクタリング                  |
| タスク     | TASK-02-RUNTIME-POLICY-CENTRALIZATION |
| 作成日     | 2026-03-21                            |
| 前提成果物 | phase-4 ~ phase-7 の全設計成果物      |

---

## 1. DD-1 ~ DD-6 と Policy Consumption Contract 4原則の整合性

### Policy Consumption Contract 4原則

1. **Single Entry**: runtime 判定は `IRuntimePolicyResolver.resolve()` のみ
2. **No Direct Store Access**: Renderer は Store の authMode/apiKey を直接参照しない
3. **Sanitized Output**: IPC 経由のレスポンスは `sanitizeForRenderer()` を経由
4. **Surface Independence**: 各 surface の判定は独立しステートレス

### DD-1 ~ DD-6 との整合確認

| DD   | 設計判断内容                              | 原則 1 | 原則 2 | 原則 3 | 原則 4 | 矛盾 |
| ---- | ----------------------------------------- | ------ | ------ | ------ | ------ | ---- |
| DD-1 | resolve() を単一エントリーポイントに集約  | 適合   | -      | -      | -      | なし |
| DD-2 | apiKey を Renderer に送信しない           | -      | 適合   | 適合   | -      | なし |
| DD-3 | llm:check-health を primary health route  | 適合   | -      | -      | -      | なし |
| DD-4 | AI_CHECK_CONNECTION を新規参照禁止        | 適合   | -      | -      | -      | なし |
| DD-5 | SurfaceType で surface を型安全に分類     | -      | -      | -      | 適合   | なし |
| DD-6 | HandoffGuidance を packages/shared に配置 | -      | -      | -      | 適合   | なし |

**結論**: DD-1 ~ DD-6 は Policy Consumption Contract 4原則と矛盾なく実装可能。

---

## 2. RuntimePolicyResolver と RuntimeResolver の二重管理リスク

### 現状分析

| 項目            | RuntimeResolver（既存）                  | RuntimePolicyResolver（新規）  |
| --------------- | ---------------------------------------- | ------------------------------ |
| 責務            | LLM runtime の解決（provider/model選択） | runtime 実行可否の policy 判定 |
| 入力            | 設定情報                                 | authMode, apiKey               |
| 出力            | runtime 設定                             | RuntimeDecision                |
| 配置            | Main Process                             | Main Process                   |
| deprecated 予定 | Task03 で deprecated 宣言予定            | -                              |

### テスト設計への影響

- RuntimeResolver と RuntimePolicyResolver は**責務が異なる**ため、二重管理には該当しない
- RuntimeResolver は「どの provider/model を使うか」を解決し、RuntimePolicyResolver は「実行してよいか」を判定する
- テスト設計においても、それぞれ独立したテストスイートで検証可能
- RuntimeResolver の deprecated 宣言が Task03 で実施されるまでは、両方のテストを維持する必要がある

**結論**: 二重管理ではなく責務分離。テスト設計への複雑性追加は最小限。

---

## 3. SurfaceType の 4値の拡張性評価

### 現在の 4値

| 値              | 対応 surface   | 用途                        |
| --------------- | -------------- | --------------------------- |
| `agent`         | Agent 実行画面 | Agent SDK 経由の LLM 呼出   |
| `skill`         | スキル実行     | スキル定義に基づく LLM 呼出 |
| `chat`          | チャット画面   | 直接の LLM 対話             |
| `skill-creator` | スキル作成画面 | スキル定義の生成支援        |

### 将来の拡張候補

| 候補       | 追加可能性 | 影響範囲                                             |
| ---------- | ---------- | ---------------------------------------------------- |
| `review`   | 中         | コードレビュー機能追加時。buildForSurface に分岐追加 |
| `workflow` | 低         | ワークフロー自動実行時。現状は agent で代替可能      |
| `batch`    | 低         | バッチ処理時。現状はスコープ外                       |

### 拡張時の影響

- SurfaceType にリテラル値を追加すると、exhaustive check により `buildForSurface` 等の switch 文でコンパイルエラーが発生する（意図的な強制）
- テストケースも SurfaceType の全値をカバーする設計のため、新値追加時にテスト追加が必要
- 4値は現在のアプリケーション surface を過不足なくカバーしている

**結論**: 4値は現時点で十分。exhaustive check による型安全な拡張メカニズムが確保されている。

---

## 4. 簡素化提案

**簡素化候補なし。**

理由:

1. DD-1 ~ DD-6 は4原則と矛盾なく、設計判断の削減余地がない
2. RuntimePolicyResolver と RuntimeResolver は責務が明確に分離されており、統合は不適切
3. SurfaceType の 4値は必要十分であり、削減すると surface 固有の policy 制御が不可能になる
4. Phase 4-7 のテスト設計は Ownership 4カテゴリに対応しており、冗長な重複がない
