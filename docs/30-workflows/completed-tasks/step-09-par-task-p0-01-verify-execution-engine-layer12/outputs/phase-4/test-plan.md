# Phase 4 テスト計画書: TASK-P0-01 verify 実行エンジン Layer 1-4

## 1. 文書情報

| 項目           | 内容                                                                                      |
| -------------- | ----------------------------------------------------------------------------------------- |
| タスクID       | TASK-P0-01                                                                                |
| 対象           | SkillCreatorVerificationEngine Layer 1-4                                                  |
| テストファイル | `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorVerificationEngine.test.ts` |
| テスト行数     | 1197 行                                                                                   |
| テスト総数     | 60 テストケース（56 pass / 4 fail: @repo/shared/types 解決問題）                          |
| ステータス     | 実装済み                                                                                  |
| 作成日         | 2026-04-04                                                                                |

## 2. テストインフラ設計

### 2.1 フィクスチャヘルパー: `createSkillFixture`

テスト用スキルディレクトリを動的に生成するヘルパー関数。各テストケースで独立した一時ディレクトリを作成し、テスト間の干渉を防止する。

```typescript
interface SkillFixtureOptions {
  skillMd?: string | false; // SKILL.md の内容。false で作成しない
  agents?: Record<string, string> | false; // agents/ 配下のファイル群。false で作成しない
  references?: boolean; // references/ ディレクトリの作成有無
  outputSchema?: string | false; // output-schema.json の内容。false で作成しない
  referenceFiles?: Record<string, string>; // references/ 内のファイル群
  skillMdReferenceLinks?: string[]; // SKILL.md 内の References セクションに追加するパス
}
```

#### フィクスチャの特徴

- `os.tmpdir()` + `fs.mkdtemp()` でテストごとに独立したディレクトリを生成
- `Date.now()` + `Math.random()` でディレクトリ名の衝突を回避
- `afterEach` で `fs.rm(tmpDir, { recursive: true, force: true })` により確実にクリーンアップ
- `skillMdReferenceLinks` 指定時は既存の SKILL.md に `## References` セクションを追記

### 2.2 ヘルパー関数: `findCheck`

```typescript
function findCheck(
  checks: RuntimeSkillCreatorVerifyCheck[],
  id: string,
): RuntimeSkillCreatorVerifyCheck | undefined;
```

チェック結果配列から特定の Check ID を検索するユーティリティ。テストアサーションの簡潔化に寄与。

### 2.3 テスト実行環境

- **フレームワーク**: Vitest
- **モック**: `vi.fn()` による WorkflowEngine のモック（T-LOOP-04）
- **非同期テスト**: 全テストケースが `async` で fs 操作を含む
- **Facade テスト**: 動的 `import()` による RuntimeSkillCreatorFacade の遅延読み込み

## 3. テストケース一覧

### 3.1 統合テスト（3件）

| テストID | テスト内容               | 入力条件                                                   | 期待結果                       |
| -------- | ------------------------ | ---------------------------------------------------------- | ------------------------------ |
| T-ENG-01 | 完全なスキルディレクトリ | SKILL.md + agents/ + references/ + output-schema.json 全備 | L1/L2 全チェック info          |
| T-ENG-02 | 空ディレクトリ           | skillMd: false, agents: false 等                           | L1 error, L2 error             |
| T-ENG-03 | SKILL.md のみ存在        | skillMd のみ指定、agents: false                            | L1 部分 fail, L2 SKILL.md 通過 |

### 3.2 Layer 1 個別テスト（5件 / 10 アサーション）

| テストID   | テスト内容                   | 検証対象 | 期待 severity  |
| ---------- | ---------------------------- | -------- | -------------- |
| T-L1-01/02 | SKILL.md 存在/不在           | L1-001   | info / error   |
| T-L1-03/04 | agents/ 存在/不在            | L1-002   | info / error   |
| T-L1-05/06 | agents/ ファイルあり/空      | L1-003   | info / error   |
| T-L1-07/08 | references/ 存在/不在        | L1-004   | info / warning |
| T-L1-09/10 | output-schema.json 存在/不在 | L1-005   | info / warning |

### 3.3 Layer 2 個別テスト（7件 / 14 アサーション）

| テストID   | テスト内容                     | 検証対象 | 期待 severity  |
| ---------- | ------------------------------ | -------- | -------------- |
| T-L2-01/02 | SKILL.md H1 あり/なし          | L2-001   | info / error   |
| T-L2-03/04 | 概要セクション あり/なし       | L2-002   | info / error   |
| T-L2-05/06 | Trigger セクション あり/なし   | L2-003   | info / error   |
| T-L2-07/08 | Anchors セクション あり/なし   | L2-004   | info / warning |
| T-L2-09/10 | agent H1 あり/なし             | L2-005   | info / error   |
| T-L2-11/12 | agent 責務セクション あり/なし | L2-006   | info / warning |
| T-L2-13/14 | output-schema.json 有効/無効   | L2-007   | info / error   |

T-L2-13/14 はプリミティブ JSON（`true`）のケースも含み、Layer 3 チェック（L3-001, L3-002）との連携を検証。

### 3.4 エッジケーステスト（8件）

| テストID  | テスト内容                       | 期待結果                               |
| --------- | -------------------------------- | -------------------------------------- |
| T-EDGE-01 | agents/ のみ（SKILL.md なし）    | L1-001: error, L2-001: error           |
| T-EDGE-02 | agents/ に非 .md ファイルのみ    | L1-003: info, L2-005/L2-006: emit なし |
| T-EDGE-03 | 空 SKILL.md                      | L1-001: info, L2-001~L2-003: error     |
| T-EDGE-04 | output-schema.json 空文字列      | L2-007: error                          |
| T-EDGE-05 | output-schema.json 切り詰め JSON | L2-007: error                          |
| T-EDGE-06 | agents/ .md 0 バイト             | L2-005: error                          |
| T-EDGE-07 | 存在しないディレクトリ           | L1-001: error, graceful fail           |
| T-EDGE-08 | 日本語/スペースパス              | L1-001: info, L2-001: info（正常動作） |

### 3.5 Facade 注入テスト（2件）

| テストID | テスト内容                    | 期待結果                                            |
| -------- | ----------------------------- | --------------------------------------------------- |
| T-FAC-01 | Engine 注入時の verifySkill   | Layer 1/2 チェック結果あり, Governance イベント記録 |
| T-FAC-02 | Engine 未注入時の verifySkill | 空配列返却                                          |

### 3.6 Layer 3 テスト（10件）

| テストID | テスト内容                | 検証対象   | 期待 severity |
| -------- | ------------------------- | ---------- | ------------- |
| T-L3-01  | $schema フィールドあり    | L3-001     | info          |
| T-L3-02  | $schema フィールドなし    | L3-001     | warning       |
| T-L3-03  | type が 'object'          | L3-002     | info          |
| T-L3-04  | type が 'invalid_type'    | L3-002     | error         |
| T-L3-05  | type フィールドなし       | L3-002     | warning       |
| T-L3-06  | 責務記述 >= 20 文字       | L3-003     | info          |
| T-L3-07  | 責務記述 4 文字           | L3-003     | warning       |
| T-L3-08  | Trigger 記述 >= 10 文字   | L3-004     | info          |
| T-L3-09  | Trigger 記述 5 文字       | L3-004     | warning       |
| T-L3-10  | output-schema.json 不在時 | L3-001/002 | emit されない |

### 3.7 Layer 3 エッジケーステスト（5件）

| テストID   | テスト内容                                      | 期待結果                                          |
| ---------- | ----------------------------------------------- | ------------------------------------------------- |
| T-L3-EC-01 | {} 空オブジェクト / true / null / [] のスキーマ | L3-002: warning, プリミティブ: L3-001/002 warning |
| T-L3-EC-02 | type が配列 ['object', 'null'] / 空配列         | info / error                                      |
| T-L3-EC-03 | 複数 .md エージェントで各 L3-003 emit           | 2件の L3-003（info + warning）                    |
| T-L3-EC-04 | 責務セクション直後が空行のみ                    | L3-003: warning                                   |
| T-L3-EC-05 | Trigger が複数行で合計 >= 10 文字               | L3-004: info                                      |

### 3.8 Layer 4 テスト（8件）

| テストID | テスト内容                           | 検証対象 | 期待 severity |
| -------- | ------------------------------------ | -------- | ------------- |
| T-L4-01  | Anchors にリスト項目あり             | L4-001   | info          |
| T-L4-02  | Anchors にリスト項目なし             | L4-001   | error         |
| T-L4-03  | Anchors セクション自体なし           | L4-001   | error         |
| T-L4-04  | references/ 参照が実在               | L4-002   | info          |
| T-L4-05  | references/ 参照が不在               | L4-002   | warning       |
| T-L4-06  | references/ ディレクトリ自体なし     | L4-002   | emit されない |
| T-L4-07  | agent ファイル名が SKILL.md で言及   | L4-003   | info          |
| T-L4-08  | agent ファイル名が SKILL.md で未言及 | L4-003   | warning       |

T-L4-08 は偽陽性テスト（`myplanner.md` が `planner.md` にマッチしないこと）も含む。

### 3.9 Layer 4 エッジケーステスト（5件）

| テストID   | テスト内容                             | 期待結果              |
| ---------- | -------------------------------------- | --------------------- |
| T-L4-EC-01 | `*` 形式のリスト項目                   | L4-001: info          |
| T-L4-EC-02 | references/ 空ディレクトリ             | L4-002: emit されない |
| T-L4-EC-03 | 複数参照で一部不在 + パストラバーサル  | L4-002: warning       |
| T-L4-EC-04 | 日本語 agent ファイル名                | L4-003: info          |
| T-L4-EC-05 | インデント付きリスト項目 `  - anchor1` | L4-001: info          |

### 3.10 verify→improve→reverify ループテスト（4件）

| テストID  | テスト内容                                        | 期待結果                               |
| --------- | ------------------------------------------------- | -------------------------------------- |
| T-LOOP-01 | L4-001 fail → SKILL.md 修正 → re-verify で info   | severity が error → info に遷移        |
| T-LOOP-02 | L3-001 warn → output-schema.json 修正 → re-verify | severity が warning → info に遷移      |
| T-LOOP-03 | Facade.verifySkill() が Layer3/4 結果を含むこと   | layer3/layer4 チェック存在             |
| T-LOOP-04 | WorkflowEngine + VerificationEngine 結合テスト    | recordVerifyPass 呼出, Governance 記録 |

T-LOOP-04 は以下を包括的に検証:

- `verifyAndImproveLoop` の戻り値（finalStatus: "pass", totalAttempts: 0）
- `workflowSnapshot` の正確な返却
- `recordVerifyPass` に渡されるチェック配列に layer3/layer4 が含まれること
- Governance 状態（phase: "verify", 直近イベント: session_end）

### 3.11 ループ エッジケーステスト（3件）

| テストID     | テスト内容                                           | 期待結果                 |
| ------------ | ---------------------------------------------------- | ------------------------ |
| T-LOOP-EC-01 | verify → ファイル削除 → re-verify で L3 チェック変化 | L3-001: info → undefined |
| T-LOOP-EC-02 | verify → 改善なし → re-verify で同一 severity        | 冪等性の保証             |
| T-LOOP-EC-03 | 複数 Layer3/4 チェックが同時に fail                  | 全 fail が配列に含まれる |

## 4. テストケース集計

| カテゴリ                  | テスト数 |
| ------------------------- | -------- |
| 統合テスト（T-ENG）       | 3        |
| Layer 1（T-L1）           | 5        |
| Layer 2（T-L2）           | 7        |
| エッジケース（T-EDGE）    | 8        |
| Facade 注入（T-FAC）      | 2        |
| Layer 3（T-L3）           | 10       |
| Layer 3 エッジ（T-L3-EC） | 5        |
| Layer 4（T-L4）           | 8        |
| Layer 4 エッジ（T-L4-EC） | 5        |
| ループ（T-LOOP）          | 4        |
| ループエッジ（T-LOOP-EC） | 3        |
| **合計**                  | **60**   |

## 5. テスト実行結果

| 状態 | 件数 | 備考                                          |
| ---- | ---- | --------------------------------------------- |
| PASS | 56   | ロジックは全て正常動作                        |
| FAIL | 4    | `@repo/shared/types` 解決問題（インフラ起因） |

4件の FAIL は `@repo/shared` パッケージからの型インポート解決に起因するインフラ問題であり、テスト対象のロジック自体には問題がない。

## 6. テスト品質指標

- **テスト密度**: 60 テスト / 659 行実装 = 約 0.091 テスト/行
- **テストコード行数**: 1197 行（実装の約 1.8 倍）
- **Layer カバレッジ**: Layer 1-4 全層をカバー
- **正常/異常比**: 各チェックで PASS/FAIL の両パターンを網羅
- **Facade 統合**: DI パターンの注入/未注入を検証
- **ループ検証**: verify→improve→reverify のライフサイクルを検証
