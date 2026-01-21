# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                    |
| ---------- | ----------------------- |
| Phase      | 1                       |
| Phase名    | 要件定義                |
| 前提Phase  | なし（開始Phase）       |
| 後続Phase  | Phase 2（設計）         |
| ステータス | 未実施                  |
| 作成日     | 2026-01-18              |
| 機能名     | api-keys-ui-improvement |

---

## 目的

APIキー設定UIの統一要件と受け入れ基準を明文化し、設計と実装の判断基準を固定する。

## 背景

連携サービスは緑の枠線とチェック付きの登録済みバッジで表示されているが、APIキー設定は別スタイルである。ui-ux-forms.mdの「連携済みプロバイダー表示」仕様に合わせ、UIの一貫性を確保するために要件を整理する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: UI要件の抽出

**目的**: 登録済み表示に必要なUI要件を整理する

**実行手順**:

1. `ui-ux-forms.md` の「連携済みプロバイダー表示」仕様を確認
2. APIキー設定に必要な視覚要件を列挙
   - 緑のボーダー
   - チェック付き「登録済み」バッジ
   - ボタン配置の維持（編集/削除）
3. 要件を `outputs/phase-1/requirements-definition.md` に記載

**期待される成果物**:

- `outputs/phase-1/requirements-definition.md`

---

### タスク2: 受け入れ基準の定義

**目的**: 実装後に検証できる受け入れ基準を定義する

**実行手順**:

1. 登録済み表示の判定条件を定義
2. UI差分の合否判定を文章化
3. `outputs/phase-1/acceptance-criteria.md` に記録

**期待される成果物**:

- `outputs/phase-1/acceptance-criteria.md`

---

### タスク3: スコープ定義

**目的**: 変更範囲と非対象範囲を明確にする

**実行手順**:

1. UI変更対象（ApiKeysSection）の範囲を整理
2. 非対象範囲（APIキー保存処理、バックエンド）を明記
3. `outputs/phase-1/scope-definition.md` に記録

**期待される成果物**:

- `outputs/phase-1/scope-definition.md`

---

## 参照資料

**システム仕様（aiworkflow-requirements）**

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料          | パス                                                                       | 内容                              |
| ----------------- | -------------------------------------------------------------------------- | --------------------------------- |
| APIキー設定UI設計 | `.claude/skills/aiworkflow-requirements/references/ui-ux-forms.md`         | APIキー設定と連携済み表示のUI仕様 |
| セキュリティ原則  | `.claude/skills/aiworkflow-requirements/references/security-principles.md` | APIキーの取り扱いと表示制約       |
| APIエンドポイント | `.claude/skills/aiworkflow-requirements/references/api-endpoints.md`       | APIキー取得/登録/削除のAPI仕様    |

**ユーザー指示**

| 参照資料 | パス         | 内容                               |
| -------- | ------------ | ---------------------------------- |
| 元の指示 | （会話ログ） | 連携サービスと同じフォーマット要求 |

---

## 成果物

| 成果物       | パス                                         | 内容              |
| ------------ | -------------------------------------------- | ----------------- |
| 要件定義     | `outputs/phase-1/requirements-definition.md` | UI要件の整理      |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | 合否判定基準      |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | 対象/非対象の範囲 |

---

## 統合テスト連携（Phase 1〜11は必須）

- APIキー登録済み/未登録の状態が既存UIテストで判定可能であることを要件に明記
- 連携サービス表示との視覚整合を統合テスト観点に追加

---

## 完了条件

- [ ] UI要件が明文化されている
- [ ] 受け入れ基準が検証可能な形で定義されている
- [ ] スコープが明確化されている
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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/api-keys-ui-improvement --phase 1
```

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 1 実行記録

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

- **前提**: なし（開始Phase）
- **後続**: Phase 2（設計）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/api-keys-ui-improvement/phase-2-design.md`
