# 実装計画: Task03〜Task09 変更順序と依存関係

## 実行順序図

```
Task03 (Settings/Shell Access Matrix)
  |
  +---> Task04 (Chat/Workspace Guidance/Action Wiring) ---> Task06 (Transcript-to-Chat Provenance)
  |                                                    |
  |                                                    +---> Task07 (ChatPanel Review Harness)
  |                                                    |
  |                                                    +---> Task08 (Slide Modifier Manual Fallback)
  |
  +---> Task05 (Terminal Handoff Surface Realization) [Task04と並列可]
  |
  v
Task09 (Canonical Bridge Ledger Governance) [全Task完了後]
```

## 各 Task の詳細

### Task03: Settings/Shell Access Matrix（最初に実施）

**目的**: IRuntimePolicyResolver インターフェース確定と SurfaceType 定義

**入力契約**:

- Phase 5 sanitize-type-addendum.md の型定義
- 既存の RuntimeResolver.ts の公開 API

**出力契約**:

- `IRuntimePolicyResolver` インターフェース（`resolve(surface: SurfaceType): RuntimeDecision`）
- `SurfaceType` 列挙型（`"ai_chat" | "agent_execution" | "skill_execution"`）
- `RuntimeDecision` 型（`packages/shared/src/types/runtime.ts`）
- `HealthCheckResult` 型（`packages/shared/src/types/health.ts` から参照確認）

**Policy Consumption Contract 4原則の適用**:

1. **Single Entry Point**: `IRuntimePolicyResolver.resolve()` が唯一の判定エントリポイント
2. **Surface Declaration**: 呼び出し元は自身の `SurfaceType` を宣言する
3. **No Local Override**: surface 側で resolve 結果を上書きしない
4. **Sanitized Relay**: Renderer に渡す場合は `sanitizeForRenderer()` を経由する

**前提条件**: なし（最初に実施）

---

### Task04: Chat/Workspace Guidance/Action Wiring（Task03 後）

**目的**: AI Chat ハンドラーに `resolve()` 組み込み

**入力契約**:

- Task03 で確定した `IRuntimePolicyResolver` インターフェース
- Task03 で確定した `SurfaceType` 定義
- 既存の `aiHandlers.ts` / `agentHandlers.ts` の公開 API

**出力契約**:

- `aiHandlers.ts`: `resolve("ai_chat")` を呼び出してから AI リクエストを実行
- `agentHandlers.ts`: `resolve("agent_execution")` を呼び出してから Agent 起動
- 各ハンドラーが `RuntimeDecision` に基づいて分岐（integrated_api / terminal_handoff）
- terminal_handoff 時は `sanitizeForRenderer()` 経由で Renderer に guidance を送信

**Policy Consumption Contract 4原則の適用**:

1. **Single Entry Point**: ハンドラー冒頭で `policyResolver.resolve(surface)` を1回だけ呼び出す
2. **Surface Declaration**: `"ai_chat"` / `"agent_execution"` を明示的に宣言
3. **No Local Override**: ハンドラー内で authMode や apiKey を直接参照して独自判定しない
4. **Sanitized Relay**: Renderer への IPC レスポンスには `RuntimeDecisionForRenderer` のみ含める

**前提条件**: Task03 完了

---

### Task05: Terminal Handoff Surface Realization（Task03 後、Task04 と並列可）

**目的**: buildForSurface 統一移行

**入力契約**:

- Task03 で確定した `IRuntimePolicyResolver` インターフェース
- Task03 で確定した `SurfaceType` 定義
- 既存の `TerminalHandoffBuilder.ts` の公開 API

**出力契約**:

- `TerminalHandoffBuilder.buildForSurface(surface: SurfaceType)` メソッド追加
- 旧メソッド `buildForAgentExecution()` / `buildForSkillExecution()` に `@deprecated` 付与
- `skillHandlers.ts`: `resolve("skill_execution")` を呼び出してから Skill 実行
- `HandoffGuidance` 変換ロジックの実装

**Policy Consumption Contract 4原則の適用**:

1. **Single Entry Point**: `buildForSurface()` が surface 別 bundle 生成の唯一のエントリポイント
2. **Surface Declaration**: `SurfaceType` を引数として受け取り、surface ごとの bundle を生成
3. **No Local Override**: builder 内で surface に応じた分岐は許容するが、policy 判定は行わない
4. **Sanitized Relay**: bundle から guidance への変換は `convertBundleToGuidance()` を使用

**前提条件**: Task03 完了（Task04 とは独立、並列実行可能）

---

### Task06: Transcript-to-Chat Provenance Linkage（Task04 後）

**目的**: トランスクリプトからチャットへの来歴リンク確立

**入力契約**:

- Task04 で組み込まれた `resolve()` の呼び出し結果
- AI Chat ハンドラーの RuntimeDecision 分岐ロジック

**出力契約**:

- トランスクリプト記録に `RuntimeDecision.type` を含める
- provenance metadata に surface 情報を付与
- integrated_api / terminal_handoff の来歴を区別して記録

**Policy Consumption Contract 4原則の適用**:

1. **Single Entry Point**: provenance 記録は Task04 の resolve 結果を受け取るのみ
2. **Surface Declaration**: provenance metadata に元の surface を記録
3. **No Local Override**: provenance 側で runtime 判定を再実行しない
4. **Sanitized Relay**: provenance ログに apiKey を含めない

**前提条件**: Task04 完了

---

### Task07: ChatPanel Review Harness Alignment（Task04 後）

**目的**: ChatPanel レビューハーネスの整合性確保

**入力契約**:

- Task04 で確定した AI Chat ハンドラーの分岐ロジック
- `RuntimeDecisionForRenderer` 型

**出力契約**:

- ChatPanel が `RuntimeDecisionForRenderer` を受け取って表示を切り替え
- integrated_api 時: 通常のチャット UI
- terminal_handoff 時: HandoffGuidance に基づく案内 UI

**Policy Consumption Contract 4原則の適用**:

1. **Single Entry Point**: ChatPanel は IPC 経由で受け取った `RuntimeDecisionForRenderer` のみ参照
2. **Surface Declaration**: Renderer 側では surface を宣言しない（Main で解決済み）
3. **No Local Override**: ChatPanel 側で runtime 種別を独自判定しない
4. **Sanitized Relay**: `RuntimeDecisionForRenderer` のみ使用（`RuntimeDecision` を直接参照しない）

**前提条件**: Task04 完了

---

### Task08: Slide Modifier Manual Fallback Alignment（Task04 後）

**目的**: スライド修正の手動フォールバック整合性確保

**入力契約**:

- Task04 で確定した resolve 結果の分岐パターン
- `RuntimeDecisionForRenderer` 型

**出力契約**:

- terminal_handoff 時のスライド修正フォールバック UI
- 手動操作への案内表示（HandoffGuidance ベース）

**Policy Consumption Contract 4原則の適用**:

1. **Single Entry Point**: フォールバック判定は resolve 結果に基づく
2. **Surface Declaration**: フォールバック側では surface を再宣言しない
3. **No Local Override**: フォールバック側で独自の runtime 判定を行わない
4. **Sanitized Relay**: Renderer に渡すのは `RuntimeDecisionForRenderer` のみ

**前提条件**: Task04 完了

---

### Task09: Canonical Bridge Ledger Governance（全Task完了後）

**目的**: 旧 RuntimeResolver の deprecated 化と最終整理

**入力契約**:

- Task03〜Task08 の全成果物
- 旧 `RuntimeResolver.ts` の参照箇所が0件であること

**出力契約**:

- `RuntimeResolver.ts` の削除（全参照が `IRuntimePolicyResolver` に移行済みの場合）
- または `@deprecated` 注釈付きで残存（移行未完了箇所がある場合）
- `AI_CHECK_CONNECTION` の参照箇所が新規コードから0件であることの検証
- Bridge Ledger（台帳）に全 Task の移行結果を記録

**Policy Consumption Contract 4原則の適用**:

1. **Single Entry Point**: 旧エントリポイントが完全に廃止されていることを検証
2. **Surface Declaration**: 全 surface が `SurfaceType` で宣言されていることを検証
3. **No Local Override**: 全 surface でローカル判定が排除されていることを検証
4. **Sanitized Relay**: 全 Renderer 通信でサニタイズが適用されていることを検証

**前提条件**: Task03〜Task08 全完了

---

## 禁止事項チェックリスト

以下の項目は全 Task の実装時に遵守すること。違反が検出された場合はレビューで MAJOR 判定とする。

- [ ] surface 内での silent fallback（DEFAULT_CONFIG への暗黙 fallback）禁止（P62 対策）
- [ ] surface 内でのローカル runtime 判定（policy を経由しない直接判定）禁止
- [ ] ハンドラが no-op で正常終了するパターン（P62 対策）禁止
- [ ] `AI_CHECK_CONNECTION` を新規コードから参照すること禁止
- [ ] `buildForAgentExecution` / `buildForSkillExecution` を新規コードで使用すること禁止
- [ ] Renderer から `TerminalHandoffBundle` / `RuntimeResolution` を import すること禁止

## 禁止事項の検出コマンド

```bash
# silent fallback 検出
grep -rn "DEFAULT_CONFIG\|defaultConfig" apps/desktop/src/main/handlers/

# ローカル runtime 判定検出
grep -rn "authMode\|apiKey" apps/desktop/src/main/handlers/ | grep -v "policyResolver\|resolve("

# AI_CHECK_CONNECTION 新規参照検出
grep -rn "AI_CHECK_CONNECTION" apps/desktop/src/ --include="*.ts" --include="*.tsx"

# 旧メソッド使用検出
grep -rn "buildForAgentExecution\|buildForSkillExecution" apps/desktop/src/ --include="*.ts"

# Renderer からの禁止 import 検出
grep -rn "TerminalHandoffBundle\|RuntimeResolution" apps/desktop/src/renderer/ --include="*.ts" --include="*.tsx"
```
