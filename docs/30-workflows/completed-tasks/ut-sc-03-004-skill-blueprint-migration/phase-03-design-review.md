# Phase 3: 設計レビュー

## メタ情報

| 項目     | 値                                     |
| -------- | -------------------------------------- |
| Phase    | 3                                      |
| 機能名   | ut-sc-03-004-skill-blueprint-migration |
| タスクID | UT-SC-03-004                           |
| 作成日   | 2026-03-24                             |
| 更新日   | 2026-03-24                             |

## 目的

Phase 1（要件定義）と Phase 2（設計）の成果物を多角的にレビューし、設計の妥当性を検証する。正本 index.md との整合性、後方互換性、P23/P32/P42 準拠を重点的に確認する。

## レビュー観点

### 1. 正本整合性チェック

| 検証項目                      | 正本定義（index.md）                         | 設計（Phase 2）                      | 一致 |
| ----------------------------- | -------------------------------------------- | ------------------------------------ | ---- |
| SkillBlueprint.skillName      | string                                       | string                               | -    |
| SkillBlueprint.description    | string                                       | string                               | -    |
| SkillBlueprint.category       | SkillCategory (5値)                          | SkillCategory (5値)                  | -    |
| SkillBlueprint.customizations | additionalDirectories/Files/excludedDefaults | 同上                                 | -    |
| SkillBlueprint.files          | PlannedFile[]                                | PlannedFile[]                        | -    |
| SkillBlueprint.reasoning      | string                                       | string                               | -    |
| CATEGORY_TEMPLATES            | 5カテゴリ定義                                | 同上                                 | -    |
| SkillFileWriter.create() 入力 | (skillName, blueprint, contents)             | SkillBlueprint は extends 経由で提供 | -    |

### 2. 後方互換性チェック

- [ ] `RuntimeSkillCreatorPlanResult` の既存フィールド（planId, skillSpec, estimatedSteps, skillName, description, agents, scripts, triggers, anchors）が全て保持されている
- [ ] `RuntimeSkillCreatorPlanResponse` union 型（通常経路 | terminal_handoff 経路）が変更されていない
- [ ] Preload 側の `planSkill()` 戻り値型が `IpcResult<RuntimeSkillCreatorPlanResponse>` のまま（型変更が shared 型から自動伝播する設計）
- [ ] Renderer 側で `result.data.skillName` 等の既存フィールドアクセスが壊れない
- [ ] terminal_handoff 経路（L97-109）に影響がない

### 3. Pitfall 準拠チェック

| Pitfall | 内容                       | 設計での対策                                                | 判定 |
| ------- | -------------------------- | ----------------------------------------------------------- | ---- |
| P23     | API二重定義の型管理        | shared 型を正本とし、preload は自動伝播                     | -    |
| P32     | 型定義の二箇所同時更新     | shared 型変更 → preload/types.ts の同期確認                 | -    |
| P42     | .trim() 3段バリデーション  | 新フィールドの isValidPlanResponse() に適用                 | -    |
| P44/P45 | IPC インターフェース不整合 | IPC は RuntimeSkillCreatorPlanResponse のまま（型変更のみ） | -    |
| P60     | IPC テスト応答形式不一致   | wrapper 形式（success/error）は変更なし                     | -    |

### 4. 設計品質チェック

- [ ] **SRP**: SkillBlueprint は「計画の構造」のみを表現し、メタ情報（planId, skillSpec）は拡張型に分離されている
- [ ] **DIP**: SkillBlueprint はインターフェース型として定義され、具象クラスに依存していない
- [ ] **Graceful degradation**: LLM が新フィールドを返さない場合のデフォルト値が設計されている
- [ ] **estimatedSteps @deprecated**: files.length で代替可能だが後方互換のため保持する方針が明記されている

### 5. テスト影響チェック

- [ ] 既存テスト（parsePlanResponse, isValidPlanResponse, plan() テスト）への影響範囲を特定
- [ ] 新フィールドのバリデーションテスト追加が Phase 4 で計画されている
- [ ] Graceful degradation（デフォルト値フォールバック）のテストが計画されている

## レビュー判定基準

| 判定              | 対応                                |
| ----------------- | ----------------------------------- |
| PASS              | Phase 4 へ                          |
| MINOR             | 指摘対応後 Phase 4 へ（未タスク化） |
| MAJOR（要件問題） | Phase 1 へ戻る                      |
| MAJOR（設計問題） | Phase 2 へ戻る                      |

## 実行タスク

1. Phase 1 成果物（要件定義書）の完全性を検証する
2. Phase 2 成果物（設計書）の正本整合性を検証する
3. 後方互換性チェックリストを全項目実施する
4. Pitfall 準拠チェックリストを全項目実施する
5. 設計品質チェックリストを全項目実施する
6. テスト影響チェックリストを全項目実施する
7. レビュー判定を下す
8. MINOR 指摘がある場合は未タスク仕様書に変換する

## 参照資料

- `docs/30-workflows/ut-sc-03-004-skill-blueprint-migration/phase-01-requirements.md`
- `docs/30-workflows/ut-sc-03-004-skill-blueprint-migration/phase-02-design.md`
- `docs/30-workflows/skill-creator-llm-integration/index.md`（正本）
- `.claude/rules/06-known-pitfalls.md`

## 成果物

- `docs/30-workflows/ut-sc-03-004-skill-blueprint-migration/outputs/phase-03-review-output.md`（レビュー結果）
  - 各チェック項目の PASS/FAIL 判定
  - MINOR/MAJOR 指摘事項
  - 最終レビュー判定

## 完了条件

- [ ] 正本整合性チェックの全項目を実施した
- [ ] 後方互換性チェックの全項目を実施した
- [ ] Pitfall 準拠チェックの全項目を実施した
- [ ] 設計品質チェックの全項目を実施した
- [ ] テスト影響チェックの全項目を実施した
- [ ] レビュー判定（PASS/MINOR/MAJOR）を下した
- [ ] MINOR 指摘がある場合、未タスク仕様書に変換した
- [ ] **本Phase内の全タスクを100%実行完了**

## 統合テスト連携（Phase 1〜11は必須）

本Phaseは設計レビューフェーズであり、プロダクションコードの変更は行わない。

| 判定項目               | 基準 | 結果                  |
| ---------------------- | ---- | --------------------- |
| ユニットテストLine     | 80%+ | N/A（コード変更なし） |
| ユニットテストBranch   | 60%+ | N/A（コード変更なし） |
| ユニットテストFunction | 80%+ | N/A（コード変更なし） |

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断                                     | 仕様参照先                           |
| ------------------ | -------------------------------------------- | ------------------------------------ |
| セキュリティ       | 非適用（型変更のみ）                         | -                                    |
| アーキテクチャ     | **適用**: 型継承設計・レイヤー間契約の妥当性 | `06-known-pitfalls.md`               |
| エラーハンドリング | **適用**: Graceful degradation の妥当性      | -                                    |
| UI/UX              | 非適用                                       | -                                    |
| データ整合性       | **適用**: P32 準拠確認                       | `.claude/rules/06-known-pitfalls.md` |
| パフォーマンス     | 非適用                                       | -                                    |
| アクセシビリティ   | 非適用                                       | -                                    |

## サブタスク管理

Phase実行開始時に、TaskCreateツールで以下のサブタスクを作成すること:

1. Phase 1 成果物の完全性検証
2. Phase 2 成果物の正本整合性検証
3. 後方互換性チェック
4. Pitfall 準拠チェック
5. 設計品質チェック
6. テスト影響チェック
7. レビュー判定
8. MINOR 指摘の未タスク化（該当する場合）
9. レビュー結果ドキュメント作成
10. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次のPhase

Phase 4: テスト作成
