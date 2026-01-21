# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                    |
| ---------- | ----------------------- |
| Phase      | 5                       |
| Phase名    | 実装                    |
| 前提Phase  | Phase 4（テスト作成）   |
| 後続Phase  | Phase 6（テスト拡充）   |
| ステータス | 未実施                  |
| 作成日     | 2026-01-18              |
| 機能名     | api-keys-ui-improvement |

---

## 目的

ApiKeysSectionの登録済み表示を連携サービスと同じ視覚フォーマットに更新する。

## 背景

テストで定義した期待値を満たすために、UI構造とスタイルを更新する必要がある。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 登録済みカードのスタイル更新

**目的**: 登録済み状態のカードに緑のボーダーと背景を適用する

**実行手順**:

1. `apps/desktop/src/renderer/components/organisms/ApiKeysSection/index.tsx` を更新
2. 登録済み判定ブロックに `bg-green-500/10` と `border-green-500/20` を適用
3. 余白と角丸を連携サービスと同じ値に合わせる
4. 変更点を `outputs/phase-5/implementation-summary.md` に記録

**期待される成果物**:

- `outputs/phase-5/implementation-summary.md`

---

### タスク2: 登録済みバッジの更新

**目的**: チェック付き「登録済み」バッジを表示する

**実行手順**:

1. 既存の登録済み表示をチェックアイコン付きバッジへ置換
2. バッジのラベルは「登録済み」を維持
3. アクションボタン（編集/削除）の配置を維持
4. 変更点を実装サマリーに追記

**期待される成果物**:

- `outputs/phase-5/implementation-summary.md`

---

### タスク3: テストのGreen確認

**目的**: Phase 4で作成したテストがGreenになることを確認する

**実行手順**:

1. ApiKeysSectionのテストを実行
2. 失敗がないことを確認
3. 結果を `outputs/phase-5/test-green-status.md` に記録

**期待される成果物**:

- `outputs/phase-5/test-green-status.md`

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

| 参照資料     | パス                                    | 内容       |
| ------------ | --------------------------------------- | ---------- |
| テスト仕様書 | `outputs/phase-4/test-specification.md` | テスト観点 |
| Red状態確認  | `outputs/phase-4/test-red-status.md`    | Red結果    |

---

## 成果物

| 成果物        | パス                                        | 内容       |
| ------------- | ------------------------------------------- | ---------- |
| 実装サマリー  | `outputs/phase-5/implementation-summary.md` | 実装変更点 |
| Green状態確認 | `outputs/phase-5/test-green-status.md`      | Green結果  |

---

## 統合テスト連携（Phase 1〜11は必須）

- 設定画面のAPIキー表示が連携サービス表示と同じ構造であることを確認
- APIキー編集/削除操作がUI変更後も成立することを確認

---

## 完了条件

- [ ] 登録済みカードのスタイルが更新されている
- [ ] 登録済みバッジにチェックアイコンが表示されている
- [ ] 編集/削除ボタンの表示と動作が維持されている
- [ ] テストがGreenである

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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/api-keys-ui-improvement --phase 5
```

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 5 実行記録

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

- **前提**: Phase 4（テスト作成）の完了
- **後続**: Phase 6（テスト拡充）へ進む

---

## TDD検証（Phase 4, 5, 8 の場合）

### TDD サイクル確認

```bash
pnpm --filter @repo/desktop test -- ApiKeysSection
```

**確認項目**:

- [ ] テストが成功することを確認（Green状態）

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/api-keys-ui-improvement/phase-6-test-expansion.md`
