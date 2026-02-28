# Phase 6: カバレッジ分析レポート - TASK-9I

## 実施日

2026-02-28

## 測定対象

| ファイル                                                    | 行数  | 責務                            |
| ----------------------------------------------------------- | ----- | ------------------------------- |
| `apps/desktop/src/main/services/skill/SkillDocGenerator.ts` | 284行 | ドキュメント生成サービス本体    |
| `apps/desktop/src/main/ipc/skillHandlers.ts`（docs 部分）   | 225行 | IPC ハンドラ（4チャネル）       |
| `packages/shared/src/types/skill-docs.ts`                   | 83行  | 共有型定義（5インターフェース） |
| `apps/desktop/src/preload/skill-api.ts`（docs 部分）        | 20行  | Preload API（4メソッド）        |

---

## 初回カバレッジ測定結果

Phase 4/5 テスト実行後の初回測定結果（Phase 6 テスト拡充前）。

### SkillDocGenerator.ts

| 指標              | 測定値 | 最低基準 | 推奨基準 | 判定         |
| ----------------- | ------ | -------- | -------- | ------------ |
| Line Coverage     | 78.2%  | 80%      | 90%      | 最低基準未達 |
| Branch Coverage   | 62.5%  | 60%      | 70%      | 最低基準達成 |
| Function Coverage | 71.4%  | 80%      | 90%      | 最低基準未達 |

### skillHandlers.ts（docs ハンドラー部分）

| 指標              | 測定値 | 最低基準 | 推奨基準 | 判定         |
| ----------------- | ------ | -------- | -------- | ------------ |
| Line Coverage     | 72.3%  | 80%      | 90%      | 最低基準未達 |
| Branch Coverage   | 55.0%  | 60%      | 70%      | 最低基準未達 |
| Function Coverage | 66.7%  | 80%      | 90%      | 最低基準未達 |

### skill-docs.ts（型定義）

型定義ファイルのため、ランタイムカバレッジの測定対象外。TypeScript コンパイル時の型チェックで検証済み。

---

## ギャップ分析

### 未カバー箇所の特定

#### SkillDocGenerator.ts

| 未カバー箇所                                    | 行番号（概算） | カテゴリ       |
| ----------------------------------------------- | -------------- | -------------- |
| `convertToHtml()` 内の正規表現分岐（h3 変換等） | 268-273        | 分岐カバレッジ |
| `analyzeSkillStructure()` エラー分岐（ENOENT）  | 223-232        | 異常系         |
| `analyzeSkillStructure()` listSkillFiles 失敗時 | 216-220        | 異常系         |
| `generateSection()` LLM タイムアウト分岐        | 248-256        | 異常系         |
| `validateOutputPath()` パストラバーサル検出     | 278-283        | セキュリティ   |
| `generate()` required セクション失敗パス        | 未実装         | 異常系         |

#### skillHandlers.ts（docs ハンドラー部分）

| 未カバー箇所                                                             | 行番号（概算） | カテゴリ           |
| ------------------------------------------------------------------------ | -------------- | ------------------ |
| 各ハンドラの `validateIpcSender` 失敗パス                                | 850-857 等     | セキュリティ       |
| `skill:docs:generate` の customSections 配列内非文字列要素検出           | 909-918        | バリデーション     |
| `skill:docs:export` のパストラバーサル検出（IPC 層）                     | 1008-1012      | セキュリティ       |
| `skill:docs:templates` の try/catch 内エラーパス                         | 1048-1052      | 異常系             |
| P41 インライン関数: `getAllowedWindows: () => [mainWindow]` コールバック | 853, 950 等    | P41 Function Count |

---

## テスト拡充計画

### Task 1: SkillDocGenerator 異常系・分岐テスト（6件）

| ID    | テスト項目                                                                      | 観点                 |
| ----- | ------------------------------------------------------------------------------- | -------------------- |
| EC-01 | `convertToHtml()` が h2, h3 見出しを正しく HTML タグに変換する                  | 正規表現分岐         |
| EC-02 | `convertToHtml()` が段落区切り（`\n\n`）を `</p><p>` に変換する                 | 正規表現分岐         |
| EC-03 | `analyzeSkillStructure()` でスキル未検出時に "Skill not found" エラーを送出する | 異常系               |
| EC-04 | `analyzeSkillStructure()` で listSkillFiles 失敗時にファイル一覧なしで続行する  | 異常系フォールバック |
| EC-05 | `generateSection()` で LLM タイムアウト発生時にエラーを送出する                 | タイムアウト         |
| EC-06 | `validateOutputPath()` で `..` を含むパスを拒否する                             | セキュリティ         |

### Task 2: IPC ハンドラ セキュリティ・バリデーションテスト（8件）

| ID    | テスト項目                                                                          | 観点             |
| ----- | ----------------------------------------------------------------------------------- | ---------------- |
| HS-01 | 全4ハンドラで sender 検証失敗時にエラーレスポンスを返す                             | IPC 安全性       |
| HS-02 | `skill:docs:generate` で customSections 内に非文字列要素がある場合にエラーを返す    | バリデーション   |
| HS-03 | `skill:docs:export` で `..` を含む outputPath を拒否する                            | パストラバーサル |
| HS-04 | `skill:docs:export` で doc が null の場合にエラーを返す                             | バリデーション   |
| HS-05 | 予期しない Error のスタックトレースが漏洩しない                                     | 情報漏洩防止     |
| HS-06 | 予期しない Error のファイルパス情報が漏洩しない                                     | 情報漏洩防止     |
| HS-07 | `validateIpcSender` の `getAllowedWindows` コールバックが正しく呼ばれる（P41 対策） | P41 準拠         |
| HS-08 | `skill:docs:templates` のエラーパスで "Internal error" を返す                       | エラー処理       |

### Task 3: 境界値・エッジケーステスト（4件）

| ID    | テスト項目                                                                    | 観点   |
| ----- | ----------------------------------------------------------------------------- | ------ |
| BV-01 | `generate()` で includeExamples: false の場合 examples セクションが除外される | 分岐   |
| BV-02 | `generate()` で includeApiReference: false の場合 api セクションが除外される  | 分岐   |
| BV-03 | `generate()` で customSections に複数セクションを指定した場合に全て追加される | 正常系 |
| BV-04 | `preview()` でカスタムテンプレート指定時にそのテンプレートが使用される        | 正常系 |

---

## テスト拡充結果

### テスト追加サマリ

| テストファイル                          | Phase 4/5 テスト数 | Phase 6 追加数  | 合計テスト数 | 結果        |
| --------------------------------------- | ------------------ | --------------- | ------------ | ----------- |
| `SkillDocGenerator.test.ts`             | 10                 | 10 (EC+BV)      | 20           | 20 PASS     |
| `skillDocsHandlers.test.ts`             | 8                  | 8 (HS-01~HS-08) | 16           | 16 PASS     |
| `skill-docs.test.ts`（shared 型テスト） | 5                  | 0               | 5            | 5 PASS      |
| **合計**                                | **23**             | **18**          | **41**       | **41 PASS** |

### Phase 6 拡充後カバレッジ

#### SkillDocGenerator.ts

| 指標              | Phase 4/5 | Phase 6 後 | 最低基準 | 推奨基準 | 判定         |
| ----------------- | --------- | ---------- | -------- | -------- | ------------ |
| Line Coverage     | 78.2%     | 91.5%      | 80%      | 90%      | 推奨基準達成 |
| Branch Coverage   | 62.5%     | 75.0%      | 60%      | 70%      | 推奨基準達成 |
| Function Coverage | 71.4%     | 100.0%     | 80%      | 90%      | 推奨基準達成 |

#### skillHandlers.ts（docs ハンドラー部分）

| 指標              | Phase 4/5 | Phase 6 後 | 最低基準 | 推奨基準 | 判定         |
| ----------------- | --------- | ---------- | -------- | -------- | ------------ |
| Line Coverage     | 72.3%     | 88.9%      | 80%      | 90%      | 最低基準達成 |
| Branch Coverage   | 55.0%     | 72.2%      | 60%      | 70%      | 推奨基準達成 |
| Function Coverage | 66.7%     | 87.5%      | 80%      | 90%      | 最低基準達成 |

---

## P41 対策確認

全4ハンドラの `getAllowedWindows: () => [mainWindow]` インライン関数のコールバック戻り値を HS-07 テストで明示的に検証済み。`mockValidateIpcSender.mock.calls[i][2].getAllowedWindows()` で呼び出しを確認し、v8 カバレッジプロバイダの Function Coverage 低下を防止している。

## Phase 6 で追加したテスト観点

- **正規表現分岐テスト**: `convertToHtml()` の h2/h3 変換、段落区切り変換
- **異常系テスト**: スキル未検出、listSkillFiles 失敗フォールバック、LLM タイムアウト
- **セキュリティテスト**: パストラバーサル防止、IPC sender 検証、情報漏洩防止（P41/P42 準拠）
- **バリデーションテスト**: customSections 非文字列要素、doc null チェック
- **境界値テスト**: セクション除外（examples/api）、カスタムセクション複数追加、カスタムテンプレート指定
