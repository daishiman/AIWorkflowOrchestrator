# Phase 7 カバレッジ計画

## メタ情報

| 項目       | 内容                                                                                                               |
| ---------- | ------------------------------------------------------------------------------------------------------------------ |
| タスクID   | TASK-IMP-SKILL-AGENT-RUNTIME-ROUTING-001                                                                           |
| Phase      | 7                                                                                                                  |
| 成果物種別 | カバレッジ計画                                                                                                     |
| 作成日     | 2026-03-14                                                                                                         |
| ステータス | completed                                                                                                          |
| 前提       | Phase 5 実装計画（outputs/phase-5/implementation-plan.md）、Phase 6 回帰計画（outputs/phase-6/regression-plan.md） |
| 後続       | Phase 8 リファクタリング計画                                                                                       |

---

## 1. カバレッジ目標の根拠

`.claude/rules/02-code-quality.md` 準拠のカバレッジ基準を適用する。

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

新規作成ファイル（RuntimePolicyResolver・TerminalHandoffBuilder・SkillCreatorService）は単純なコア utility であるため、推奨基準（90%/70%/90%）を目標とする。既存ファイルへの変更（SkillExecutor・AgentExecutor・skillExecutionAuthPreflight）は最低基準を上回る目標を設定する。

---

## 2. 対象ファイルごとのカバレッジ目標

### 2-1. 対象ファイル一覧

| ファイル（apps/desktop/src/ 配下）                | 種別     | Line 目標 | Branch 目標 | Function 目標 |
| ------------------------------------------------- | -------- | --------- | ----------- | ------------- |
| `main/services/runtime/RuntimePolicyResolver.ts`  | 新規     | 90%       | 70%         | 90%           |
| `main/services/runtime/TerminalHandoffBuilder.ts` | 新規     | 90%       | 70%         | 90%           |
| `main/services/skill/SkillCreatorService.ts`      | 新規     | 80%       | 60%         | 80%           |
| `main/services/skill/SkillExecutor.ts`            | 既存変更 | 85%       | 65%         | 85%           |
| `main/services/agent/AgentExecutor.ts`            | 既存変更 | 85%       | 65%         | 85%           |
| `renderer/utils/skillExecutionAuthPreflight.ts`   | 既存変更 | 90%       | 70%         | 90%           |

---

### 2-2. RuntimePolicyResolver.ts（新規）

**目標**: Line 90% / Branch 70% / Function 90%

#### 測定対象関数

| 関数名      | 概要                                           | 測定すべきブランチ                                                                                                                                                       |
| ----------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `resolve()` | authMode と apiKey から RuntimeDecision を返す | 1. `integrated_api` + apiKey 非空 → `"integrated_api"` 2. `claude_code` → `"terminal_handoff"` 3. `integrated_api` + apiKey 空/未設定 → `"terminal_handoff"`（fallback） |

#### 補完必要な箇所

| 補完箇所                                                   | 理由                                                                   | 対応テストケース |
| ---------------------------------------------------------- | ---------------------------------------------------------------------- | ---------------- |
| `authMode === "integrated_api"` かつ apiKey が `""`        | fallback 分岐は成功系テストでは通らない                                | TC-4-02 相当     |
| `authMode === "integrated_api"` かつ apiKey が `undefined` | null 安全性の確認が必要                                                | 追加テスト必要   |
| `authMode === "integrated_api"` かつ apiKey が `"   "`     | P42 準拠: trim 後空文字は apiKey なしとして扱うか確認が必要            | 追加テスト必要   |
| `authMode === "claude_code"`                               | claude_code パスは TC-4-03 でカバーされるが、apiKey の有無を問わず確認 | TC-4-03 相当     |

---

### 2-3. TerminalHandoffBuilder.ts（新規）

**目標**: Line 90% / Branch 70% / Function 90%

#### 測定対象関数

| 関数名    | 概要                                                         | 測定すべきブランチ                                                                                   |
| --------- | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| `build()` | prompt / cwd / options から TerminalHandoffBundle を構築する | 1. options 指定あり 2. options 省略（デフォルト値適用） 3. prompt にシェルメタ文字あり（エスケープ） |

#### 補完必要な箇所

| 補完箇所                                             | 理由                                                       | 対応テストケース |
| ---------------------------------------------------- | ---------------------------------------------------------- | ---------------- |
| shell injection 対策のエスケープ処理（;・$()・&&等） | EC-6-06: REG-6-19 で確認必須。カバレッジが不足しやすい分岐 | REG-6-19         |
| `cwd` が存在しないパスの場合のフォールバック         | 実行時エラーを防ぐガードが実装されているか確認             | 追加テスト必要   |
| `suggestedCommand` のエスケープ後文字列の正確な形式  | Renderer 表示と一致するか確認                              | 追加テスト必要   |

---

### 2-4. SkillExecutor.ts（既存変更）

**目標**: Line 85% / Branch 65% / Function 85%

#### 測定対象関数

| 関数名        | 概要                                                       | 測定すべきブランチ                                                                                                                                                                  |
| ------------- | ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `execute()`   | RuntimeDecision を受け取り SDK query または handoff を実行 | 1. `decision.type === "integrated_api"` → SDK 実行 2. `decision.type === "terminal_handoff"` → bundle 返却 3. `decision` 未指定（`undefined`）→ 既存 getApiKey() フロー（後方互換） |
| `abort()`     | executionId で進行中のストリームを中断する                 | 1. executionId が存在する場合 2. executionId が存在しない場合（no-op）                                                                                                              |
| `getApiKey()` | 既存の AuthKeyService 経由の API key 取得（後方互換維持）  | 1. キーあり 2. キーなし（AUTHENTICATION_ERROR）                                                                                                                                     |

#### 補完必要な箇所

| 補完箇所                                                           | 理由                                                                                   | 対応テストケース |
| ------------------------------------------------------------------ | -------------------------------------------------------------------------------------- | ---------------- |
| `decision` が `undefined` の場合（後方互換パス）                   | 既存コードとの後方互換確認。既存テストが `decision` なしで呼ぶパスを網羅しているか確認 | 後方互換テスト   |
| `decision.type === "terminal_handoff"` の場合の success レスポンス | TC-4-03 でカバーされるが、Phase 6 回帰で再確認                                         | REG-6-11         |
| `abort(executionId)` で存在しない executionId を渡した場合         | no-op となるはずだが、例外を投げないことを確認                                         | REG-6-04 の前提  |

---

### 2-5. AgentExecutor.ts（既存変更）

**目標**: Line 85% / Branch 65% / Function 85%

#### 測定対象関数

| 関数名    | 概要                                            | 測定すべきブランチ                                                                                                                                                                                                                  |
| --------- | ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `start()` | RuntimeDecision を受け取り SDK query を起動する | 1. `decision.type === "integrated_api"` → SDK の apiKey に `decision.apiKey` を渡す 2. `decision.type === "terminal_handoff"` → bundle を Renderer に通知 3. `decision` 未指定（`undefined`）→ 既存の静的 apiKey フロー（後方互換） |

#### 補完必要な箇所

| 補完箇所                                                              | 理由                                                                                       | 対応テストケース |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ---------------- |
| `decision.type === "terminal_handoff"` の Renderer 通知パス           | TC-4-05 は `integrated_api` のみカバー。terminal_handoff 分岐の AgentExecutor テストが不足 | 追加テスト必要   |
| `decision.apiKey` が SDK env への渡し方（環境変数 or コンストラクタ） | SDK の apiKey 設定方法によって分岐が増える可能性がある                                     | TC-4-05 拡充     |
| `decision` が `undefined` の場合（後方互換パス）                      | `AgentHandlerConfig.apiKey` を使う既存パスが引き続き動作することを確認                     | 後方互換テスト   |

---

### 2-6. skillExecutionAuthPreflight.ts（既存変更）

**目標**: Line 90% / Branch 70% / Function 90%

#### 測定対象関数

| 関数名                          | 概要                                                  | 測定すべきブランチ                                                                                                                                                                                                         |
| ------------------------------- | ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `preflightSkillExecutionAuth()` | auth-mode に応じて API key 確認または skip を判断する | 1. `authMode === "integrated_api"` + API key あり → `ok: true` 2. `authMode === "integrated_api"` + API key なし → `ok: false, reason: "NO_API_KEY"` 3. `authMode === "claude_code"` → API key 確認スキップして `ok: true` |

#### 補完必要な箇所

| 補完箇所                                                   | 理由                                                                            | 対応テストケース |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------- | ---------------- |
| `authMode === "claude_code"` の場合の早期 return           | TC-4-13 でカバーされるが、「API key が空でも ok: true」になる分岐を明示的に確認 | TC-4-13 拡充     |
| `authMode === "integrated_api"` + API key あり（正常系）   | 最も基本的なパスだが、Phase 4 テストで明示的に確認されているか確認              | TC-4-01 前提     |
| `authMode === "integrated_api"` + API key なし（エラー系） | `ok: false` と `reason` フィールドの両方が返ることを確認                        | TC-4-02 前提     |

---

## 3. 不足が予想される箇所と補完方針

### 3-1. 高リスク不足箇所

| 箇所                                                           | 不足リスク | 補完方針                                                                             |
| -------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------ |
| RuntimePolicyResolver の apiKey `undefined` / `"   "` ブランチ | 高         | `resolve()` のユニットテストに境界値テストを 2 件追加する                            |
| TerminalHandoffBuilder のシェルエスケープ分岐                  | 高         | REG-6-19 のテスト実装で shell injection パターンを 5 種類以上カバーする              |
| AgentExecutor の `terminal_handoff` 分岐                       | 高         | `start()` に `decision.type === "terminal_handoff"` を渡す新規テストを追加する       |
| SkillExecutor の `decision undefined`（後方互換）分岐          | 中         | 既存テストが `decision` なしで呼んでいる場合はそのまま保持し、新規ケースを追加しない |
| SkillCreatorService の Improver 単体カバレッジ                 | 中         | `improve()` を単体で呼び出すテストを REG-6-09 に追加する                             |

### 3-2. 補完テストの追加方針

- 既存テストファイル（TC-4-xx / REG-6-xx）に `describe` ブロックを追加する形で補完する
- 新規ファイルを作らず、対応するテストファイルのエンドに追記する（P9 準拠: beforeEach でリセット）
- v8 カバレッジプロバイダを使用するため、inline arrow function も独立した関数としてカウントされることに注意する（P41 準拠）
- `validateIpcSender` のコールバック（`getAllowedWindows: () => [mainWindow]`）は明示的に呼び出してカバレッジに含める（P41 対策）

---

## 4. 測定コマンド

### 4-1. runtime サービス層（RuntimePolicyResolver / TerminalHandoffBuilder）

```bash
pnpm --filter @repo/desktop exec vitest run --coverage apps/desktop/src/main/services/runtime/
```

### 4-2. SkillExecutor

```bash
pnpm --filter @repo/desktop exec vitest run --coverage apps/desktop/src/main/services/skill/SkillExecutor
```

### 4-3. AgentExecutor

```bash
pnpm --filter @repo/desktop exec vitest run --coverage apps/desktop/src/main/services/agent/AgentExecutor
```

### 4-4. SkillCreatorService

```bash
pnpm --filter @repo/desktop exec vitest run --coverage apps/desktop/src/main/services/skill/SkillCreatorService
```

### 4-5. skillExecutionAuthPreflight

```bash
pnpm --filter @repo/desktop exec vitest run --coverage apps/desktop/src/renderer/utils/skillExecutionAuthPreflight
```

### 4-6. 全対象ファイル一括測定

```bash
pnpm --filter @repo/desktop exec vitest run --coverage \
  apps/desktop/src/main/services/runtime/ \
  apps/desktop/src/main/services/skill/SkillExecutor \
  apps/desktop/src/main/services/skill/SkillCreatorService \
  apps/desktop/src/main/services/agent/AgentExecutor \
  apps/desktop/src/renderer/utils/skillExecutionAuthPreflight
```

> 注意（P40 準拠）: 上記コマンドは `apps/desktop/` ディレクトリから実行するか、`pnpm --filter @repo/desktop exec` を使用する。プロジェクトルートから直接 `pnpm vitest run` を実行すると `apps/desktop/vitest.config.ts` の `environment` 設定が読み込まれない。

---

## 5. カバレッジ結果の記録方法

測定後、以下のフォーマットで結果を記録する。Phase 8（リファクタリング）開始前にこのテーブルを埋める。

| ファイル                       | 実測 Line | 目標 Line | 実測 Branch | 目標 Branch | 実測 Function | 目標 Function | 判定   |
| ------------------------------ | --------- | --------- | ----------- | ----------- | ------------- | ------------- | ------ |
| RuntimePolicyResolver.ts       | -         | 90%       | -           | 70%         | -             | 90%           | 未測定 |
| TerminalHandoffBuilder.ts      | -         | 90%       | -           | 70%         | -             | 90%           | 未測定 |
| SkillCreatorService.ts         | -         | 80%       | -           | 60%         | -             | 80%           | 未測定 |
| SkillExecutor.ts               | -         | 85%       | -           | 65%         | -             | 85%           | 未測定 |
| AgentExecutor.ts               | -         | 85%       | -           | 65%         | -             | 85%           | 未測定 |
| skillExecutionAuthPreflight.ts | -         | 90%       | -           | 70%         | -             | 90%           | 未測定 |

---

## 6. 未達時の対処フロー

カバレッジが目標を下回った場合は Phase 6（テスト拡充）へ戻り、以下の手順で対応する。

```
カバレッジ未達検出
    ↓
未達ファイルの未カバーブランチを特定（vitest --coverage の html レポートで確認）
    ↓
対応する Phase 6 テストファイルに補完テストを追記
    ↓
再測定で目標を超えたことを確認
    ↓
Phase 7 完了・Phase 8 に進む
```

---

## 7. 完了条件

- [x] カバレッジ目標（.claude/rules/02-code-quality.md 準拠）が全ファイルに設定されている
- [x] 対象ファイルごとの測定対象関数と必要ブランチが明記されている
- [x] 補完必要な箇所と補完方針が記述されている
- [x] 測定コマンド（ファイル別 / 一括）が記載されている
- [x] カバレッジ結果記録テーブルが準備されている
- [x] 未達時の対処フロー（Phase 6 へ戻るルート）が記述されている
