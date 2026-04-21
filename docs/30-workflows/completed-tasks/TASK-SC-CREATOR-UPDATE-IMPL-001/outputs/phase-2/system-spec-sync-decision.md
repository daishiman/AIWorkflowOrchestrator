# システム仕様同期判断 — TASK-SC-CREATOR-UPDATE-IMPL-001

> Phase 2 成果物 / 作成日: 2026-04-21

---

## 1. Phase 12 Step 2 要否判断

### 判定結果: **N/A（不要）**

| 判定軸                             | 内容                                                                                           | 判定 |
| ---------------------------------- | ---------------------------------------------------------------------------------------------- | ---- |
| 公開 API の変更                    | `SkillCreatorService` の public メソッド（`createSkill`, `detectMode` 等）のシグネチャ変更なし | 不要 |
| IPC ハンドラーの変更               | `SKILL_CREATOR_CREATE` / `SKILL_CREATOR_CANCEL` の IPC チャンネル定義・ハンドラー変更なし      | 不要 |
| 型定義ファイルの変更               | `@repo/shared/types` の `SkillCreatorMode`, `CreateSkillOptions`, `StructurePlanJson` 変更なし | 不要 |
| UI 層への影響                      | `PROGRESS_FLOWS.update` は既存定義のまま。フロントエンドが受け取る progress 形式に変更なし     | 不要 |
| 外部スクリプトインターフェース変更 | `generate_skill_md.js --plan` / `validate_all.js` の呼び出し引数変更なし                       | 不要 |
| ドキュメント仕様書の更新           | `runUpdateWorkflow()` は private 実装。外部向け仕様書への記載対象外                            | 不要 |

### 根拠

変更対象は `SkillCreatorService` クラス内部の private 実装のみ：

- 新規追加: `runUpdateWorkflow()` private メソッド
- 変更: `case "update":` 内の2行（`break` 前に `runUpdateWorkflow()` 呼び出しを追加）

どちらも外部から観測可能な契約（public API / IPC / 型定義 / progress フォーマット）を変更しない。  
Phase 12 Step 2（system spec 同期）は内部実装変更には適用されない。

---

## 2. Simpler Alternative 採否

### 候補 A: `runCreateWorkflow()` の共通化（共有実装）

**内容**: `runCreateWorkflow()` と `runUpdateWorkflow()` の共通ロジックを抽出し、  
単一メソッド `runBaseWorkflow(options, existingContent?, signal?)` として共通化する。

| 項目             | 評価                                                      |
| ---------------- | --------------------------------------------------------- |
| コード重複の削減 | 中程度（purpose 解決ロジックが共有可能）                  |
| 影響範囲         | `runCreateWorkflow()` の変更が必要 → テスト影響リスクあり |
| 複雑性           | 分岐が増加し可読性が低下する恐れ                          |
| リスク           | 既存 `create` モードの動作に意図しない変更が入るリスク    |

**採否: 不採用**

### 候補 B: `runUpdateWorkflow()` の独立実装（採用）

**内容**: `runCreateWorkflow()` を参照モデルとして、`runUpdateWorkflow()` を独立した private メソッドとして実装する。  
コードの一部重複は許容し、各モードの関心事を分離する。

| 項目             | 評価                                                        |
| ---------------- | ----------------------------------------------------------- | ---- |
| 影響範囲         | `SkillCreatorService.ts` への追加のみ。既存メソッド変更なし | 最小 |
| テストへの影響   | 既存テスト（SC-020 等）がそのまま動作する                   | 安全 |
| 可読性           | 各モードのワークフローが独立して読める                      | 高   |
| 将来の変更容易性 | update モード固有の変更が create モードに影響しない         | 良好 |

**採否: 採用**

### 採用理由のまとめ

```
目標: スタブ解消（stub → 実装）を最小影響範囲で達成する
制約: 既存テスト（purpose.test.ts / cancel.test.ts）を壊さない
判断: 独立実装を採用。共通化は Phase 8（リファクタリング）の候補として記録する
```

---

## 3. 影響範囲の最終確認

| レイヤー                         | 変更あり                   | 変更内容                                           |
| -------------------------------- | -------------------------- | -------------------------------------------------- |
| `SkillCreatorService.ts`         | あり                       | `runUpdateWorkflow()` 追加 / `case "update":` 更新 |
| `@repo/shared/types`             | なし                       | —                                                  |
| IPC ハンドラー                   | なし                       | —                                                  |
| フロントエンド（web/desktop UI） | なし                       | —                                                  |
| テストファイル                   | なし（既存 pass 確認のみ） | 新規テスト追加は Phase 4 の責務                    |
| 外部スクリプト                   | なし                       | —                                                  |
| ドキュメント（system spec）      | なし                       | —                                                  |

---

## 4. リスク記録

| リスク                                      | 発生確率 | 影響 | 対処方針                                                  |
| ------------------------------------------- | -------- | ---- | --------------------------------------------------------- |
| `runCreateWorkflow()` との動作乖離          | 低       | 中   | architecture-design.md の比較テーブルを参照し実装時に確認 |
| `fs.readFile()` の例外ケース漏れ            | 中       | 低   | try/catch で全例外を捕捉し null フォールバック            |
| `extractPurposeWithLlm()` の abort 伝播漏れ | 低       | 高   | `isAbortError()` チェックを catch 先頭に配置              |
| purpose 解決優先順位の実装ミス              | 中       | 中   | validation-matrix.md TC-UP-02 でユニットテスト確認        |
