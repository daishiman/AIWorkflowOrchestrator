# Phase 2 設計書: TASK-P0-01 verify 実行エンジン Layer 1/2

## 1. 文書情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| タスクID   | TASK-P0-01                                     |
| 対象       | SkillCreatorVerificationEngine Layer 1/2       |
| ステータス | 実装済み（本文書は既存実装に基づく事後文書化） |
| 作成日     | 2026-04-04                                     |

## 2. モジュール設計

### 2.1 SkillCreatorVerificationEngine クラス

```
apps/desktop/src/main/services/runtime/SkillCreatorVerificationEngine.ts
```

#### クラス構造

```typescript
export class SkillCreatorVerificationEngine {
  async verify(skillDir: string): Promise<RuntimeSkillCreatorVerifyCheck[]>;
}
```

- **ステートレス設計**: インスタンスフィールドを持たない
- **単一公開メソッド**: `verify()` のみを公開し、内部ロジックはモジュールスコープ関数に委譲
- **レイヤー順次実行**: Layer 1 -> 2 -> 3 -> 4 の順に実行し、全結果を結合

#### 内部アーキテクチャ

```
SkillCreatorVerificationEngine.verify(skillDir)
  │
  ├── validateLayer1(skillDir) → RuntimeSkillCreatorVerifyCheck[]
  │     ├── L1-001: SKILL.md 存在
  │     ├── L1-002: agents/ 存在
  │     ├── L1-003: agents/ 非空
  │     ├── L1-004: references/ 存在
  │     └── L1-005: output-schema.json 存在
  │
  ├── validateLayer2(skillDir) → RuntimeSkillCreatorVerifyCheck[]
  │     ├── L2-001: SKILL.md H1 見出し
  │     ├── L2-002: 概要セクション
  │     ├── L2-003: Trigger セクション
  │     ├── L2-004: Anchors セクション
  │     ├── L2-005: agent H1 見出し（各 .md）
  │     ├── L2-006: agent 責務セクション（各 .md）
  │     └── L2-007: output-schema.json JSON 有効性
  │
  ├── validateLayer3(skillDir) → RuntimeSkillCreatorVerifyCheck[]
  │     ├── L3-001: $schema フィールド存在
  │     ├── L3-002: type フィールド有効性
  │     ├── L3-003: agent 責務記述品質（20文字以上）
  │     └── L3-004: Trigger セクション品質（10文字以上）
  │
  └── validateLayer4(skillDir) → RuntimeSkillCreatorVerifyCheck[]
        ├── L4-001: Anchors リスト項目存在
        ├── L4-002: references/ 参照整合性
        └── L4-003: agent ファイル名 SKILL.md 言及
```

### 2.2 ヘルパー関数設計

全てモジュールスコープ（非エクスポート）で定義:

| 関数名                  | 責務                                            | 引数                                           | 戻り値                    |
| ----------------------- | ----------------------------------------------- | ---------------------------------------------- | ------------------------- |
| `createCheck`           | RuntimeSkillCreatorVerifyCheck オブジェクト生成 | id, layer, severity, summary, evidenceSummary? | Check オブジェクト        |
| `fileExists`            | ファイル存在確認（fs.stat ベース）              | path: string                                   | Promise\<boolean\>        |
| `directoryExists`       | ディレクトリ存在確認（fs.stat ベース）          | path: string                                   | Promise\<boolean\>        |
| `readFileContent`       | ファイル内容読取（null 安全）                   | path: string                                   | Promise\<string \| null\> |
| `hasMarkdownSection`    | Markdown H2 セクション存在判定                  | content, heading: string                       | boolean                   |
| `hasH1Heading`          | Markdown H1 見出し存在判定                      | content: string                                | boolean                   |
| `escapeRegex`           | 正規表現特殊文字エスケープ                      | s: string                                      | string                    |
| `isObjectLikeRecord`    | オブジェクト型ガード（非 null、非 Array）       | value: unknown                                 | type guard                |
| `extractSectionContent` | Markdown セクションのボディ内容抽出             | content, heading: string                       | string \| null            |

### 2.3 formatVerifyChecksAsFeedback

```
apps/desktop/src/main/services/runtime/formatVerifyChecksAsFeedback.ts
```

- verify チェック結果を improve 用フィードバック文字列に変換
- severity !== "info" のチェックのみ抽出
- error -> warning の優先順でソート
- 出力形式: `[{SEVERITY}] {checkId}: {summary}`

## 3. 型設計

### 3.1 RuntimeSkillCreatorVerifyCheck

```typescript
// packages/shared/src/types/skillCreator.ts

type RuntimeSkillCreatorVerifyCheckSeverity = "info" | "warning" | "error";

interface RuntimeSkillCreatorVerifyCheck {
  id: string; // Check ID: "L1-001" 形式
  layer: "layer1" | "layer2" | "layer3" | "layer4"; // 検証レイヤー
  severity: RuntimeSkillCreatorVerifyCheckSeverity; // info=PASS, warning/error=FAIL
  summary: string; // 人間可読な結果要約
  evidenceSummary?: string; // オプション: 証跡情報
}
```

### 3.2 Severity 設計方針

| Severity  | 意味         | verify 判定 | 用途                             |
| --------- | ------------ | ----------- | -------------------------------- |
| `info`    | PASS         | 合格        | 正常確認結果                     |
| `warning` | 推奨要件違反 | 改善推奨    | references/ 不在、Anchors 不在等 |
| `error`   | 必須要件違反 | 不合格      | SKILL.md 不在、agents/ 不在等    |

### 3.3 PASS/FAIL 判定ロジック

```typescript
// verifyAndImproveLoop 内での判定
const allPassed = checks.every((c) => c.severity === "info");
```

- `severity === "info"` のみを PASS とする
- `warning` は FAIL として扱われ、improve ループのトリガーとなる

### 3.4 Check ID 命名規則

```
L{N}-{NNN}
```

- `L`: Layer プレフィックス（固定）
- `{N}`: Layer 番号（1-4）
- `{NNN}`: Layer 内 3 桁連番（001 開始）

## 4. 統合設計

### 4.1 Facade 注入パターン

```typescript
// RuntimeSkillCreatorFacade コンストラクタ DI
interface RuntimeSkillCreatorFacadeDeps {
  // ... 他の依存
  verificationEngine?: SkillCreatorVerificationEngine; // オプショナル注入
  maxImproveRetry?: number; // デフォルト: 3、上限: 10
}
```

#### 注入時の動作

```
Facade.verifySkill(skillDir)
  ├── Governance hooks: session_start
  ├── verificationEngine.verify(skillDir)
  ├── Governance hooks: session_end
  └── return RuntimeSkillCreatorVerifyCheck[]
```

#### 未注入時の動作（Graceful Degradation）

```
Facade.verifySkill(skillDir)
  ├── Governance hooks: session_start
  ├── session_end("Verify skipped: verificationEngine unavailable")
  └── return []  // 空配列
```

### 4.2 verifyAndImproveLoop 設計

```
verifyAndImproveLoop(planId, skillDir, skillName, authMode, apiKey?)
  │
  ├── while(true) ループ
  │     ├── Step 1: verifySkill(skillDir)
  │     │     └── 例外発生時 → return { finalStatus: "error" }
  │     │
  │     ├── Step 2: PASS 判定
  │     │     └── allPassed → recordVerifyPass() → return { finalStatus: "pass" }
  │     │
  │     ├── Step 3: maxRetry チェック
  │     │     └── attemptCount >= maxRetry → recordVerifyFailure() → return { finalStatus: "fail", loopExhausted: true }
  │     │
  │     ├── Step 4: improve 試行
  │     │     ├── recordImproveAttempt(planId, failedChecks)
  │     │     ├── attemptCount++
  │     │     ├── buildImproveFeedback(failedChecks, feedbackHistory)
  │     │     ├── improve(skillName, feedback, authMode, apiKey)
  │     │     ├── applyImprovement(skillName, suggestions)
  │     │     └── feedbackHistory.push(...)
  │     │
  │     └── Step 5: re-verify（ループ先頭に戻る）
  │
  └── return RuntimeSkillCreatorVerifyAndImproveResult
```

#### フィードバック履歴メカニズム

```typescript
interface ImproveFeedbackHistory {
  attempt: number; // 試行番号（1始まり）
  failedChecks: string[]; // 失敗チェックID一覧
  improveSummary: string; // 改善要約
}
```

- 過去の改善履歴を次回の feedback に含めることで、同一修正の反復を抑制
- 全試行で解決できていないチェックを「繰り返し失敗中のチェック」として強調

### 4.3 WorkflowEngine 連携

| Facade メソッド                | WorkflowEngine メソッド                      | タイミング      |
| ------------------------------ | -------------------------------------------- | --------------- |
| `verifyAndImproveLoop` PASS 時 | `recordVerifyPass(planId, checks)`           | 全チェック info |
| `verifyAndImproveLoop` FAIL 時 | `recordVerifyFailure(planId, msg)`           | maxRetry 到達   |
| improve 試行前                 | `recordImproveAttempt(planId, failedChecks)` | 各 attempt      |

### 4.4 Governance Hooks 連携

```typescript
// verifySkill() 内の Governance hooks
const governanceHooks = this.createGovernanceHooks("verify");
governanceHooks.onSessionStart({ sessionId: verifyId, provenance });
// ... verify 実行 ...
governanceHooks.onSessionEnd({ sessionId: verifyId, summary });
```

- phase: `"verify"` として Governance 監査イベントを記録
- AuditSink にイベントを蓄積し、`getGovernanceState()` で UI に公開

## 5. Layer 1/2 境界設計

### 5.1 Layer 間の責務分離

| Layer | 責務       | 検証対象                  | fs 操作       |
| ----- | ---------- | ------------------------- | ------------- |
| 1     | 構造検証   | ファイル/ディレクトリ存在 | stat, readdir |
| 2     | コンテンツ | ファイル内部構造          | readFile      |

### 5.2 Layer 間の依存関係

- Layer 2 は Layer 1 の結果に**暗黙的に**依存する（SKILL.md が存在しなければ内容検証不可）
- ただし Layer 2 は Layer 1 の結果を参照せず、**独立して**実行する
- SKILL.md が読取不可の場合、Layer 2 は L2-001 ~ L2-004 全てを error として emit
- agents/ が存在しない場合、Layer 2 のエージェント検証（L2-005, L2-006）は emit しない

### 5.3 チェック emit 条件

| 条件                              | Layer 1 の挙動               | Layer 2 の挙動                         |
| --------------------------------- | ---------------------------- | -------------------------------------- |
| SKILL.md 不在                     | L1-001: error                | L2-001~L2-004: 全て error              |
| agents/ 不在                      | L1-002: error, L1-003: error | L2-005/L2-006: emit しない             |
| agents/ 空                        | L1-003: error                | L2-005/L2-006: emit しない（.md なし） |
| agents/ に .md なし（.json のみ） | L1-003: info                 | L2-005/L2-006: emit しない             |
| output-schema.json 不在           | L1-005: warning              | L2-007: emit しない                    |

## 6. テスト戦略

### 6.1 テストファイル

```
apps/desktop/src/main/services/runtime/__tests__/SkillCreatorVerificationEngine.test.ts
```

### 6.2 テストケース一覧（15 テストケース + 追加エッジケース）

#### 統合テスト（3件）

| テストID | テスト内容               | 期待結果                               |
| -------- | ------------------------ | -------------------------------------- |
| T-ENG-01 | 完全なスキルディレクトリ | L1/L2 全チェック info                  |
| T-ENG-02 | 空ディレクトリ           | L1 error, L2 error                     |
| T-ENG-03 | SKILL.md のみ存在        | L1 部分 fail, L2 SKILL.md チェック通過 |

#### Layer 1 個別テスト（5件）

| テストID   | テスト内容                   | 期待結果       |
| ---------- | ---------------------------- | -------------- |
| T-L1-01/02 | SKILL.md 存在/不在           | info / error   |
| T-L1-03/04 | agents/ 存在/不在            | info / error   |
| T-L1-05/06 | agents/ ファイルあり/空      | info / error   |
| T-L1-07/08 | references/ 存在/不在        | info / warning |
| T-L1-09/10 | output-schema.json 存在/不在 | info / warning |

#### Layer 2 個別テスト（7件）

| テストID   | テスト内容                   | 期待結果       |
| ---------- | ---------------------------- | -------------- |
| T-L2-01/02 | SKILL.md H1 あり/なし        | info / error   |
| T-L2-03/04 | 概要セクション あり/なし     | info / error   |
| T-L2-05/06 | Trigger セクション あり/なし | info / error   |
| T-L2-07/08 | Anchors セクション あり/なし | info / warning |
| T-L2-09/10 | agent H1 あり/なし           | info / error   |
| T-L2-11/12 | agent 責務 あり/なし         | info / warning |
| T-L2-13/14 | output-schema.json 有効/無効 | info / error   |

#### エッジケーステスト

| テスト内容                       | 期待結果                               |
| -------------------------------- | -------------------------------------- |
| agents/ に非 .md ファイルのみ    | L1-003: info, L2-005/L2-006: emit なし |
| 空 SKILL.md                      | L1-001: info, L2-001~L2-003: error     |
| 存在しないディレクトリ           | 全チェック graceful fail               |
| 日本語/スペースパス              | 正常動作                               |
| output-schema.json 空文字列      | L2-007: error                          |
| output-schema.json 切り詰め JSON | L2-007: error                          |
| agent .md 0バイト                | L2-005: error                          |

#### Facade 統合テスト（2件）

| テストID | テスト内容                    | 期待結果                   |
| -------- | ----------------------------- | -------------------------- |
| T-FAC-01 | Engine 注入時の verifySkill   | Layer 1/2 チェック結果あり |
| T-FAC-02 | Engine 未注入時の verifySkill | 空配列                     |

### 6.3 テストインフラ

- **フレームワーク**: Vitest
- **テンポラリディレクトリ**: `os.tmpdir()` + `fs.mkdtemp()` で各テスト独立
- **フィクスチャヘルパー**: `createSkillFixture()` 関数でスキルディレクトリを動的生成
- **クリーンアップ**: `afterEach` で `fs.rm(tmpDir, { recursive: true, force: true })`
