# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                    |
| ---------- | ----------------------- |
| Phase      | 2                       |
| Phase名    | 設計                    |
| 前提Phase  | Phase 1（要件定義）     |
| 後続Phase  | Phase 3（設計レビュー） |
| ステータス | 未実施                  |
| 作成日     | 2026-01-18              |
| 機能名     | api-keys-ui-improvement |

---

## 目的

APIキー設定UIを連携サービス表示と同じ視覚構造にするための設計を確定する。

## 背景

Phase 1で整理した要件を実装可能なUI設計に落とし込み、ApiKeysSectionの変更点を明確化する必要がある。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: スタイルマッピング設計

**目的**: 連携サービス表示のスタイルをAPIキー設定へ適用する設計を作成する

**実行手順**:

1. `apps/desktop/src/renderer/components/organisms/AccountSection/index.tsx` の登録済み表示を確認
2. 使用しているクラス名と構造を抽出
3. ApiKeysSectionへ適用するスタイル対応表を `outputs/phase-2/ui-style-design.md` に記載

**期待される成果物**:

- `outputs/phase-2/ui-style-design.md`

---

### タスク2: コンポーネント変更計画

**目的**: ApiKeysSectionの具体的な変更点を明記する

**実行手順**:

1. ApiKeysSectionの登録済みカード表示位置を特定
2. バッジとアクション領域の配置変更点を記載
3. 変更対象のJSXブロックとクラス更新内容を `outputs/phase-2/component-change-plan.md` にまとめる

**期待される成果物**:

- `outputs/phase-2/component-change-plan.md`

---

### タスク3: 設計ドキュメント作成

**目的**: 要件と設計を統合した設計書を作成する

**実行手順**:

1. Phase 1成果物とスタイルマッピングを統合
2. APIキーの表示制約（マスク表示、ログ禁止）を明記
3. `outputs/phase-2/design-document.md` を作成

**期待される成果物**:

- `outputs/phase-2/design-document.md`

---

## 参照資料

**システム仕様（aiworkflow-requirements）**

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料          | パス                                                                       | 内容                              |
| ----------------- | -------------------------------------------------------------------------- | --------------------------------- |
| APIキー設定UI設計 | `.claude/skills/aiworkflow-requirements/references/ui-ux-forms.md`         | APIキー設定と連携済み表示のUI仕様 |
| セキュリティ原則  | `.claude/skills/aiworkflow-requirements/references/security-principles.md` | APIキーの取り扱いと表示制約       |
| APIエンドポイント | `.claude/skills/aiworkflow-requirements/references/api-endpoints.md`       | APIキー取得/登録/削除のAPI仕様    |

**前Phase成果物**

| 参照資料     | パス                                         | 内容         |
| ------------ | -------------------------------------------- | ------------ |
| 要件定義     | `outputs/phase-1/requirements-definition.md` | UI要件整理   |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | 合否判定基準 |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | 対象範囲     |

---

## 成果物

| 成果物           | パス                                       | 内容           |
| ---------------- | ------------------------------------------ | -------------- |
| UIスタイル設計   | `outputs/phase-2/ui-style-design.md`       | スタイル対応表 |
| 変更計画         | `outputs/phase-2/component-change-plan.md` | 変更点一覧     |
| 設計ドキュメント | `outputs/phase-2/design-document.md`       | 統合設計書     |

---

## 統合テスト連携（Phase 1〜11は必須）

- 連携サービス表示とAPIキー表示の視覚整合を設計書に記載
- UI状態別の統合テスト観点を設計に反映

---

## 完了条件

- [ ] スタイルマッピングが作成されている
- [ ] ApiKeysSectionの変更点が明確化されている
- [ ] 設計ドキュメントが作成されている
- [ ] 参照仕様との整合が確認されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施（Phase 1〜11）
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/api-keys-ui-improvement --phase 2
```

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 2 実行記録

### 実行タスク

- タスク1:
- タスク2:

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

## 依存関係

- **前提**: Phase 1（要件定義）の完了
- **後続**: Phase 3（設計レビュー）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/api-keys-ui-improvement/phase-3-design-review.md`
