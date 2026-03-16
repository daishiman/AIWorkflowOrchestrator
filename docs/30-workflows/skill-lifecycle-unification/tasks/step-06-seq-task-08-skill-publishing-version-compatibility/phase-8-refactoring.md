# Phase 8: リファクタリング - タスク仕様書

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| Phase      | 8                            |
| Phase名    | リファクタリング             |
| 前提Phase  | Phase 7（カバレッジ確認）    |
| 後続Phase  | Phase 9（品質検証）          |
| ステータス | 未実施                       |
| 作成日     | 2026-03-16                   |
| 機能名     | スキル共有・公開・互換性統合 |
| タスクID   | TASK-SKILL-LIFECYCLE-08      |
| タスク種別 | 設計                         |

---

## 目的

Phase 5 の型定義・設計文書の重複を排除し、命名規則を統一し、共通パターンを抽出することで、後続の実装フェーズが1箇所の定義を参照できる状態にする。

## 背景

設計タスクのリファクタリングとは、実装コードの整理ではなく「型定義・インターフェース・設計文書の整理」を指す。Phase 2〜7 を経て複数の成果物に分散した型定義、命名揺れ、共通パターンを集約し、packages/shared への一元化設計を確定する。Phase 5 で先行実施した分離作業も本 Phase で記録・確認する。設計タスクのため TDD Refactor（テスト通過を維持しながらのコードリファクタリング）は該当しない。

---

## 実行タスク

### タスク1: 型定義の重複排除設計

**目的**: `SkillVisibility`, `SkillPublishingMetadata`, `CompatibilityCheckResult` 等が Phase 2〜5 の設計書内で複数定義されていないかを確認し、packages/shared への一元化計画を確定する。

**実行手順**:

1. 以下のファイルで型定義の重複を検索する:
   - `outputs/phase-2/publishing-metadata-design.md`
   - `outputs/phase-2/compatibility-check-design.md`
   - `outputs/phase-2/skill-center-flow-design.md`
   - `outputs/phase-2/distribution-operations-design.md`
   - `outputs/phase-2/publish-readiness-design.md`
2. 重複する型定義を列挙し、正規定義箇所を1箇所に特定する
3. 一元化先を `packages/shared/src/skill/types.ts` として確定し、各設計書からの参照方法を明記する
4. 削除対象の重複定義と残存する正規定義の対応テーブルを作成する

**期待される成果物**: `outputs/phase-8/dedup-plan.md`（重複型リスト・一元化先・対応テーブル）

---

### タスク2: 命名規則の統一確認

**目的**: skill-publishing 関連の型名・IPC チャンネル名・Zustand スライス名がプロジェクト命名規則と統一されているかを確認する。

**実行手順**:

1. 型名の命名規則確認:
   - PascalCase: `SkillVisibility`, `SkillPublishingMetadata`, `CompatibilityCheckResult`, `PublishReadiness`
   - union type 値: すべて lowercase（例: `"local" | "team" | "public"`）
2. IPC チャンネル名の命名規則確認:
   - 形式: `skill:{動詞}` または `skill:{名詞}:{動詞}`（既存チャンネルのパターンを踏襲）
   - 例: `skill:publish`, `skill:unpublish`, `skill:check-compatibility`
3. Zustand スライス名の命名規則確認:
   - 形式: `{機能名}Slice`（例: `skillPublishingSlice`）
4. 命名違反を発見した場合は修正案を記録し、修正対象ファイルパスを明記する

**期待される成果物**: `outputs/phase-8/naming-audit.md`（命名チェック結果・違反リスト・修正案）

---

### タスク3: 共通 metadata アクセスユーティリティの設計抽出

**目的**: 公開レベル遷移・互換性チェック・公開可否判定の3箇所で共通して使われる metadata アクセスパターンを共通ユーティリティとして設計する。

**実行手順**:

1. 以下の3つの処理フローを分析し、共通パターンを特定する:
   - 公開レベル遷移: metadata フィールドの充足チェック
   - 互換性チェック: 旧バージョンと新バージョンの metadata diff 取得
   - 公開可否判定: `SkillPublishingMetadata` の閾値フィールド参照
2. 共通パターンとして抽出するユーティリティ関数の型シグネチャを設計する:
   - `getRequiredFields(visibility: SkillVisibility): (keyof SkillPublishingMetadata)[]`
   - `checkMetadataCompleteness(metadata: SkillPublishingMetadata, visibility: SkillVisibility): { missing: string[] }`
3. 抽出ユーティリティの配置先を `packages/shared/src/skill/metadata-utils.ts` として確定する
4. Phase 5 で既に抽出済みの場合は「Phase 5 実施済み」として記録する

**期待される成果物**: `outputs/phase-8/common-utils-design.md`（ユーティリティ型シグネチャ・配置先・Phase 5 実施済み項目）

---

### タスク4: ナビゲーション整合確認

**目的**: Phase 1〜7 の成果物間の参照リンクが正しく、循環参照がないことを確認する。

**実行手順**:

1. 各 Phase 仕様書の「参照資料」テーブルのリンク先ファイルが実在するかを確認する
2. 循環参照（A→B→A のような参照ループ）がないかを確認する
3. 壊れたリンクまたは循環参照が見つかった場合は修正案を記録する
4. Phase 間の依存方向が「前 Phase への参照のみ」に限定されているかを確認する

**期待される成果物**: `outputs/phase-8/navigation-check.md`（リンク検証結果・問題箇所・修正案）

---

### タスク5: Phase 5 先行リファクタリング記録

**目的**: Phase 5（実装フェーズ）で先行して実施したリファクタリング項目を本 Phase の記録に統合し、二重作業を防ぐ。

**実行手順**:

1. `outputs/phase-5/` 配下の成果物を参照し、Phase 5 で実施した型整理・分離作業をリストアップする
2. 本 Phase（タスク1〜4）で対応不要な項目に「Phase 5 で実施済み」のマークを付ける
3. Phase 5 で未実施の項目のみを本 Phase の対応対象として確定する

**期待される成果物**: `outputs/phase-8/dedup-plan.md` に「Phase 5 実施済み」セクションを追加（既存ファイルへの追記）

---

## 参照資料

| 参照資料                   | パス                                                                              | 内容                         |
| -------------------------- | --------------------------------------------------------------------------------- | ---------------------------- |
| Phase 1 要件定義           | `./phase-1-requirements.md`                                                       | 受入基準・機能要件           |
| Phase 2 設計               | `./phase-2-design.md`                                                             | 5 つの設計書（重複検索対象） |
| Phase 3 レビュー           | `./phase-3-design-review.md`                                                      | レビュー結果・MINOR 追跡     |
| Phase 4 テスト仕様         | `./phase-4-test-creation.md`                                                      | テスト仕様（命名確認対象）   |
| Phase 5 型定義確定書       | `./phase-5-implementation.md`                                                     | 型定義の全フィールド         |
| Phase 6 拡充テスト仕様     | `./phase-6-test-expansion.md`                                                     | 境界テスト仕様               |
| Phase 7 カバレッジ         | `./phase-7-coverage-check.md`                                                     | カバレッジ結果               |
| interfaces-agent-sdk-skill | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | 型命名規則の基準             |
| security-skill-execution   | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md`   | セキュリティ型体系           |

---

## 統合テスト連携

Phase 8 はリファクタリングフェーズのため、新規テストコードを作成しない。ただし、以下の引き継ぎ事項を Phase 9 に渡す:

- タスク1 で特定した一元化対象型を Phase 9 の型整合性検証の対象として明記する
- タスク2 で検出した命名違反の修正案を Phase 9 の仕様書品質検証に含める
- タスク3 で設計した共通ユーティリティの型シグネチャを Phase 9 のコンパイル擬似検証の対象とする

---

## 成果物

| 成果物                         | パス                                     | 内容                                         |
| ------------------------------ | ---------------------------------------- | -------------------------------------------- |
| 型定義重複排除計画             | `outputs/phase-8/dedup-plan.md`          | 重複型リスト・一元化先・Phase 5 実施済み項目 |
| 命名規則監査レポート           | `outputs/phase-8/naming-audit.md`        | 命名チェック結果・違反リスト・修正案         |
| 共通ユーティリティ設計         | `outputs/phase-8/common-utils-design.md` | 型シグネチャ・配置先・抽出根拠               |
| ナビゲーション整合確認レポート | `outputs/phase-8/navigation-check.md`    | リンク検証結果・循環参照確認                 |

---

## 完了条件

- [ ] 重複する型定義が全て特定され、一元化先が確定している
- [ ] 命名規則違反が全て特定され、修正案が記録されている（違反 0 件または修正案付き）
- [ ] 共通ユーティリティ関数の型シグネチャが設計され、配置先が確定している
- [ ] Phase 1〜7 成果物間の全リンクが有効であることが確認されている
- [ ] Phase 5 で先行実施したリファクタリング項目が記録されている
- [ ] 4 つの成果物ファイルが全て生成されている

---

## タスク100%実行確認【必須】

| #   | 確認項目                                          | 合否基準                                   |
| --- | ------------------------------------------------- | ------------------------------------------ |
| 1   | タスク1〜5 の全成果物が生成されている             | 4 ファイル全て存在（dedup-plan は2回追記） |
| 2   | 型定義の一元化先が packages/shared に確定している | 配置先パスが明記されている                 |
| 3   | 命名規則チェックが全型名・チャンネル名対象        | チェック漏れ 0 件                          |
| 4   | Phase 間リンクの有効性が全 Phase で確認されている | 壊れたリンク 0 件またはすべて修正案付き    |
| 5   | Phase 5 実施済み項目が重複作業なく記録されている  | 「Phase 5 実施済み」セクションが存在する   |

---

## 多角的チェック観点（AIが判断）

- 重複する型定義が完全に特定され、一元化先（`packages/shared`）が明確か
- 命名規則が既存のプロジェクト規約（boolean: is/has/can プレフィックス等）と統一されているか
- 共通ユーティリティ関数が過剰な抽象化になっていないか（3箇所以上の使用箇所があるか）
- Phase 間のリンクが全て有効で、壊れたリンクが0件か
- Phase 5 で先行実施したリファクタリングとの重複作業がないか

---

## サブタスク管理

| #   | タスク名                                       | ステータス | 完了基準                   |
| --- | ---------------------------------------------- | ---------- | -------------------------- |
| 1   | 型定義の重複排除設計                           | 未実施     | 一元化先が全て確定         |
| 2   | 命名規則の統一確認                             | 未実施     | 違反0件または修正案付き    |
| 3   | 共通 metadata アクセスユーティリティの設計抽出 | 未実施     | 型シグネチャと配置先が確定 |
| 4   | ナビゲーション整合確認                         | 未実施     | Phase 間リンク全て有効     |
| 5   | Phase 5 先行リファクタリング記録               | 未実施     | 重複作業なく記録済み       |

---

## TDD検証

本タスクは設計タスクのため、リファクタリングは設計文書レベルで実施する。コードの実リファクタリングは後続の実装タスクで実施する。

**確認項目**:

- [ ] リファクタリング後の型定義が Phase 4/6 のテスト仕様と整合している
- [ ] 命名変更が Phase 4/6 のテスト仕様書内の参照名と一致している

---

## 依存関係

- **前提**: Phase 7（カバレッジ確認）が完了していること
- **後続**: Phase 9（品質検証）へ進む

---

## Phase実行記録

Phase完了後、以下を記録してください:

```markdown
### 実行タスク

- タスク1（型定義の重複排除設計）: （結果を記録）
- タスク2（命名規則の統一確認）: （結果を記録）
- タスク3（共通 metadata アクセスユーティリティの設計抽出）: （結果を記録）
- タスク4（ナビゲーション整合確認）: （結果を記録）
- タスク5（Phase 5 先行リファクタリング記録）: （結果を記録）

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

---

## 次Phase

Phase 8 の完了条件が全て満たされた後、以下のファイルを実行してください:

`docs/30-workflows/skill-lifecycle-unification/tasks/step-06-seq-task-08-skill-publishing-version-compatibility/phase-9-quality-assurance.md`

Phase 9 では、Phase 8 で整理された型定義と設計文書を対象に、型整合性・仕様書品質・テスト仕様網羅性・セキュリティの4観点から品質検証を実施し、Phase 10 への進行可否を判定する。
