# ConversationRoundStep Q3 スケジュール設定 UI 詳細実装 - タスク指示書

## メタ情報

| 項目         | 内容                                                      |
| ------------ | --------------------------------------------------------- |
| タスクID     | UT-SKILL-WIZARD-W1-Q3-SCHEDULE-CONFIG-UI-001              |
| タスク名     | ConversationRoundStep Q3 スケジュール設定 UI 詳細実装     |
| 分類         | 機能追加                                                  |
| 対象機能     | skill-wizard / ConversationRoundStep.tsx                  |
| 優先度       | 中                                                        |
| 見積もり規模 | 中規模                                                    |
| ステータス   | 未実施                                                    |
| 発見元       | `UT-SKILL-WIZARD-W1-CONVERSATION-ROUND-STEP-001` Phase 12 |
| 発見日       | 2026-04-08                                                |
| Issue番号    | #2041                                                     |
| Lane         | skill-wizard-redesign-lane                                |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`ConversationRoundStep.tsx` の Q3「実行スケジュール」は現在 `scheduleConfig` の最小実装
（テキスト入力）のみで、タイマー設定・定期実行スケジューラの UI が未実装である。
W1-par-02b で ConversationRoundStep のコアは完成したが、Q3 の scheduleConfig UI は
将来タスクとしてスコープ外とした。ユーザーが直感的にスケジュールを設定できないまま残っている。

### 1.2 問題点・課題

- Q3 の scheduleConfig は現在テキスト入力フィールドのみ
- タイマー（分・時間・日単位）の UI 選択肢がない
- 定期実行パターン（毎日・毎週・毎月）のラジオボタンやドロップダウンがない
- `SkillInfoFormData.scheduleConfig` 型がスカラー値のみで複合型を想定していない

### 1.3 放置した場合の影響

- ユーザーが Q3 でスケジュールを直感的に設定できず、UX が低下したままになる
- 後続の W2-seq-03a（SkillCreateWizard 統合）が scheduleConfig の型不整合を引き継ぐリスクがある
- スマートデフォルト（`inferSmartDefaults()`）の返り値が UI と乖離したまま放置される

---

## 2. 何を達成するか（What）

### 2.1 目的

Q3「実行スケジュール」に専用の scheduleConfig UI（タイマー・定期実行セレクタ）を追加し、
ユーザーが視覚的にスケジュールを設定できるようにする。

### 2.2 最終ゴール

- Q3 UI にタイマー／定期実行ドロップダウンが表示され、選択内容が `ConversationAnswers` に保持される
- `ScheduleConfig` 型が `@repo/shared` に定義され、UI・ロジック・テストで共通利用される
- `buildInitialAnswers()` のスマートデフォルト変換が新型に対応している
- 対応テストが全 GREEN である

### 2.3 スコープ

#### 含むもの

- `ScheduleConfig` 型の定義（`packages/shared/src/types/skill-info-form-data.ts`）
- `ConversationRoundStep.tsx` Q3 セクションの UI 改善（タイマー／定期実行ドロップダウン）
- `buildInitialAnswers()` の scheduleConfig 変換更新
- `ConversationRoundStep.test.tsx` の対応テスト追加

#### 含まないもの

- スケジューラの実際の実行エンジン（バックエンド連携）
- W2-seq-03a の SkillCreateWizard.tsx 統合
- Q3 以外の設問 UI 変更

### 2.4 成果物

- 型定義ファイル更新（`packages/shared/src/types/skill-info-form-data.ts`）
- UI 改善済み `ConversationRoundStep.tsx`
- テスト追加済み `ConversationRoundStep.test.tsx`

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `UT-SKILL-WIZARD-W1-CONVERSATION-ROUND-STEP-001` が完了済みであること
- `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx` が存在すること
- `packages/shared/src/types/skill-info-form-data.ts` が存在すること

### 3.2 依存タスク

| タスクID                                       | 状態     | 関係 |
| ---------------------------------------------- | -------- | ---- |
| WT-SKILL-WIZARD-W1-CONVERSATION-ROUND-STEP-001 | 完了済み | 前提 |
| W2-seq-03a（SkillCreateWizard 統合）           | 未実施   | 後続 |

### 3.3 前タスクからの知見・苦戦箇所

#### 3.3.1 semantic default の正規化マッピング

`inferSmartDefaults()` が返す scheduleConfig の値形式が UI ラベルと一致しないことがある。
`buildInitialAnswers()` の `normalizeSelectedOption()` で明示的な変換テーブルが必要。

**教訓**: semantic defaults と UI display labels は設計段階で 1 枚の対応表を用意すること。

#### 3.3.2 ページング状態管理

Q3 は Page 1（Q1-Q3）に属するため、Page 2 から戻った際に scheduleConfig が消えないよう
`useState<ConversationAnswers>()` で全 6 問を常時保持する設計が必要。

**教訓**: ページ分割 UI でも状態は一元管理すること。

### 3.4 推奨アプローチ

1. `packages/shared/src/types/skill-info-form-data.ts` で `ScheduleConfig` 型を定義する
2. `ConversationRoundStep.tsx` の Q3 セクションを SelectInput（ドロップダウン）+ 条件付き詳細入力に変更する
3. `buildInitialAnswers()` の scheduleConfig 変換を更新する
4. スケジュールタイプごとの初期値・選択・変更テストを追加する

---

## 4. 実行手順

### Phase 構成

| Phase | 内容                                | 目安 |
| ----- | ----------------------------------- | ---- |
| 1     | 型定義・設計                        | 1h   |
| 2     | 実装（SkillInfoFormData 拡張 + UI） | 3h   |
| 3     | テスト追加                          | 1h   |
| 4     | QA・レビュー                        | 0.5h |

### Phase 1: 型定義・設計

#### 目的

`ScheduleConfig` の型構造と UI コンポーネント設計を確定する。

#### 手順

1. `packages/shared/src/types/skill-info-form-data.ts` を読み、現行の `scheduleConfig` 型を確認する
2. `ScheduleConfig` の discriminated union（`type: 'timer' | 'recurring' | 'none'` 等）を設計する
3. `inferSmartDefaults()` の戻り値と UI ラベルの対応表を 1 枚のコメントとして記述する
4. Q3 UI コンポーネントの構成（ドロップダウン＋条件付き詳細入力）をスケッチする

#### 成果物

- `ScheduleConfig` 型の設計メモ（コードコメントまたは型定義草稿）

#### 完了条件

- `ScheduleConfig` の discriminated union 設計が確定している
- semantic default 値と UI ラベルの変換表が定義されている

### Phase 2: 実装（SkillInfoFormData 拡張 + UI）

#### 目的

型定義と Q3 UI を実装し、`buildInitialAnswers()` を新型に対応させる。

#### 手順

1. `packages/shared/src/types/skill-info-form-data.ts` に `ScheduleConfig` 型を追加する
2. `SkillInfoFormData.scheduleConfig` の型を `ScheduleConfig` に変更する
3. `ConversationRoundStep.tsx` の Q3 セクションを SelectInput＋条件付き詳細入力に書き換える
4. `buildInitialAnswers()` の `normalizeSelectedOption()` に scheduleConfig 変換テーブルを追加する
5. `useState<ConversationAnswers>()` で全 6 問の状態が Page 2 往復後も保持されることを確認する

#### 成果物

- 更新済み `packages/shared/src/types/skill-info-form-data.ts`
- 更新済み `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`

#### 完了条件

- Q3 UI にドロップダウン（タイマー/定期実行）が表示される
- スマートデフォルトが scheduleConfig UI に正しく反映される
- `buildInitialAnswers()` が新型に対応している

### Phase 3: テスト追加

#### 目的

scheduleConfig の各スケジュールタイプに対するテストを追加し、全 GREEN を確認する。

#### 手順

1. `apps/desktop/src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx` を開く
2. 以下のテストケースを追加する：
   - タイマータイプの初期値が正しく表示される
   - 定期実行タイプを選択したときに詳細入力が表示される
   - スマートデフォルトが scheduleConfig ドロップダウンに反映される
   - Page 2 往復後に scheduleConfig の選択が保持される
3. `pnpm --filter @repo/desktop test` を実行し、全テストが GREEN であることを確認する

#### 成果物

- テスト追加済み `ConversationRoundStep.test.tsx`

#### 完了条件

- 追加テストが全 GREEN
- 既存テストが新たに FAIL しない

### Phase 4: QA・レビュー

#### 目的

実装全体の品質を確認し、後続タスク（W2-seq-03a）への引き継ぎ準備を完了する。

#### 手順

1. `pnpm --filter @repo/desktop typecheck` を実行し、型エラーがないことを確認する
2. `pnpm --filter @repo/desktop lint` を実行し、lint エラーがないことを確認する
3. Q3 UI を手動で操作し、ドロップダウンの表示・選択・状態保持を目視確認する
4. `unassigned-task-detection.md` の formalized 欄を更新する

#### 成果物

- typecheck / lint PASS 証跡
- 手動確認メモ

#### 完了条件

- typecheck・lint が全 PASS
- Q3 UI の手動動作確認が完了している
- `unassigned-task-detection.md` の formalized 欄が更新されている

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `ScheduleConfig` 型が `@repo/shared` に定義済み
- [ ] Q3 UI にドロップダウン（タイマー/定期実行）が表示される
- [ ] スマートデフォルトが scheduleConfig UI に正しく反映される
- [ ] `buildInitialAnswers()` が新型に対応している
- [ ] Page 2 往復後に scheduleConfig の選択が保持される

### 品質要件

- [ ] 追加テスト（TC-xx）が全 GREEN
- [ ] 既存テストが新たに FAIL しない
- [ ] `pnpm --filter @repo/desktop typecheck` が PASS
- [ ] `pnpm --filter @repo/desktop lint` が PASS

### ドキュメント要件

- [ ] Phase 4 QA 完了時に `unassigned-task-detection.md` の formalized 欄を更新する

---

## 6. 検証方法

### テストケース

| テストID               | 内容                                               | 確認コマンド                                             |
| ---------------------- | -------------------------------------------------- | -------------------------------------------------------- |
| TC-Q3-INIT-TIMER       | タイマータイプの初期値が Q3 ドロップダウンに表示   | `pnpm --filter @repo/desktop test ConversationRoundStep` |
| TC-Q3-SELECT-RECURRING | 定期実行タイプ選択時に詳細入力が表示される         | 同上                                                     |
| TC-Q3-SMART-DEFAULT    | inferSmartDefaults の値が Q3 UI に正しく反映される | 同上                                                     |
| TC-Q3-PAGE-PERSIST     | Page 2 往復後に scheduleConfig 選択が保持される    | 同上                                                     |

### 検証手順

```bash
# ユニットテスト実行
pnpm --filter @repo/desktop test ConversationRoundStep

# 型チェック
pnpm --filter @repo/desktop typecheck

# lint
pnpm --filter @repo/desktop lint
```

---

## 7. リスクと対策

| リスク                                               | 影響度 | 発生確率 | 対策                                                                         |
| ---------------------------------------------------- | ------ | -------- | ---------------------------------------------------------------------------- |
| semantic default 値と UI ラベルの不一致              | 高     | 中       | Phase 1 で変換テーブルを設計段階で確定し、`normalizeSelectedOption()` に実装 |
| Page 2 往復後の scheduleConfig 状態消失              | 高     | 中       | `useState<ConversationAnswers>()` で全 6 問を一元管理する設計を維持          |
| `SkillInfoFormData` 型変更による既存コードの型エラー | 中     | 中       | typecheck を Phase 2 完了直後に実行し、型エラーを即時修正する                |
| W2-seq-03a との型インターフェース不整合              | 中     | 低       | `ScheduleConfig` 型を `@repo/shared` に配置し、共有型として設計する          |

---

## 8. 参照情報

### 関連ファイル

- `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`
- `apps/desktop/src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx`
- `packages/shared/src/types/skill-info-form-data.ts`
- `docs/30-workflows/skill-wizard-redesign-lane/index.md`
- `docs/30-workflows/skill-wizard-redesign-lane/W2-seq-03a-skill-create-wizard/`

### 関連タスク

- `docs/30-workflows/unassigned-task/UT-SKILL-WIZARD-W1-CONVERSATION-ROUND-STEP-001.md`（前提・完了済み）
- `docs/30-workflows/unassigned-task/UT-SKILL-WIZARD-W1-par-02b.md`（W1 コア実装）

---

## 9. 備考

### 発見の経緯

`UT-SKILL-WIZARD-W1-CONVERSATION-ROUND-STEP-001` Phase 12 close-out 時に、
Q3 の scheduleConfig UI が最小実装のまま残っていることを確認。
将来タスクとして本タスクを作成した。

### Phase 12 close-out 対応

本タスクを formalize した後、
`docs/30-workflows/skill-wizard-redesign-lane/index.md` の未タスク検出表で
本タスクが formalized 扱いであることを確認すること。
