# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 内容                          |
| ---------- | ----------------------------- |
| Phase      | 4                             |
| Phase名    | テスト作成                    |
| 前提Phase  | Phase 3（設計レビューゲート） |
| 後続Phase  | Phase 5（実装）               |
| ステータス | 未実施                        |
| 作成日     | 2026-01-18                    |
| 機能名     | api-keys-ui-improvement       |

---

## 目的

APIキー設定UIの統一表示を検証するテストを先に作成し、Red状態を確認する。

## 背景

表示仕様の変更は視覚差分を伴うため、先にテストを作成して期待値を固定する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 登録済み表示テストの作成

**目的**: 登録済みAPIキーのUIスタイルを検証するテストを作成する

**実行手順**:

1. `ApiKeysSection` の登録済み状態を再現するテストデータを作成
2. 緑のボーダーとチェック付き「登録済み」バッジが表示されることを検証
3. `apps/desktop/src/renderer/components/organisms/ApiKeysSection/__tests__/` 配下にテストを追加
4. テスト仕様を `outputs/phase-4/test-specification.md` に記載

**期待される成果物**:

- `outputs/phase-4/test-specification.md`

---

### タスク2: アクションボタン表示テストの作成

**目的**: 編集/削除ボタンが表示されることを検証する

**実行手順**:

1. 登録済み状態で「編集」「削除」ボタンが表示されるテストを追加
2. ボタンのクリックハンドラが呼ばれることを検証
3. テスト仕様を更新

**期待される成果物**:

- `outputs/phase-4/test-specification.md`

---

### タスク3: 未登録表示テストの作成

**目的**: 未登録状態で登録済みスタイルが適用されないことを確認する

**実行手順**:

1. APIキー未登録の状態を再現
2. 緑のボーダーと登録済みバッジが表示されないことを検証
3. テスト仕様を更新

**期待される成果物**:

- `outputs/phase-4/test-specification.md`

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

| 参照資料         | パス                                 | 内容         |
| ---------------- | ------------------------------------ | ------------ |
| 設計ドキュメント | `outputs/phase-2/design-document.md` | UI設計       |
| UIスタイル設計   | `outputs/phase-2/ui-style-design.md` | スタイル対応 |

---

**依存Phase成果物**

| 参照資料             | パス                                         | 内容         |
| -------------------- | -------------------------------------------- | ------------ |
| Phase 1 要件定義     | `outputs/phase-1/requirements-definition.md` | 要件整理     |
| Phase 3 設計レビュー | `outputs/phase-3/design-review-result.md`    | レビュー結果 |

## 成果物

| 成果物       | パス                                    | 内容        |
| ------------ | --------------------------------------- | ----------- |
| テスト仕様書 | `outputs/phase-4/test-specification.md` | テスト観点  |
| Red状態確認  | `outputs/phase-4/test-red-status.md`    | Red結果記録 |

---

## 統合テスト連携（Phase 1〜11は必須）

- 設定画面のAPIキー表示が統合テストで再現できるよう状態準備手順を記載
- 連携サービス表示とAPIキー表示の比較観点をテスト仕様に追加

---

## 完了条件

- [ ] 登録済み表示テストが作成されている
- [ ] アクションボタン表示テストが作成されている
- [ ] 未登録状態のテストが作成されている
- [ ] Red状態が記録されている

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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/api-keys-ui-improvement --phase 4
```

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 4 実行記録

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

- **前提**: Phase 3（設計レビューゲート）の完了
- **後続**: Phase 5（実装）へ進む

---

## TDD検証（Phase 4, 5, 8 の場合）

### TDD サイクル確認

```bash
pnpm --filter @repo/desktop test -- ApiKeysSection
```

**確認項目**:

- [ ] テストが失敗することを確認（Red状態）

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/api-keys-ui-improvement/phase-5-implementation.md`
