# Phase 4: テストマトリクス

## タスクID: UT-SKILL-WIZARD-W1-par-02d

## 追加テストケース一覧

### describe: ウィザードボタンの表示

| TC-ID  | テスト内容                                            | data-testid                          | 期待結果                         |
| ------ | ----------------------------------------------------- | ------------------------------------ | -------------------------------- |
| TC-W01 | ウィザードボタンがdata-testidで取得できる             | `skill-lifecycle-open-wizard-button` | 存在する                         |
| TC-W02 | ウィザードボタンに正しいテキストが表示される          | `skill-lifecycle-open-wizard-button` | 「スキル作成ウィザードを開く →」 |
| TC-W03 | ウィザードボタンクリックでonOpenSkillWizardが呼ばれる | `skill-lifecycle-open-wizard-button` | onOpenSkillWizard が1回呼ばれる  |

### describe: 削除要素の非存在確認

| TC-ID  | テスト内容                             | data-testid                      | 期待結果 |
| ------ | -------------------------------------- | -------------------------------- | -------- |
| TC-D01 | テキストエリアが存在しない             | `skill-lifecycle-request-input`  | null     |
| TC-D02 | 「スキルを生成する」ボタンが存在しない | `skill-lifecycle-create-button`  | null     |
| TC-D03 | 「方針を決める」ボタンが存在しない     | `skill-lifecycle-prepare-button` | null     |

### describe: 既存機能の保持確認

| TC-ID  | テスト内容                                          | 期待結果                           |
| ------ | --------------------------------------------------- | ---------------------------------- |
| TC-K01 | onCloseが正しく渡せる                               | コンポーネントがレンダリングされる |
| TC-K02 | セクション見出し「1. スキルを作成する」が表示される | テキストが存在する                 |
| TC-K03 | 説明テキストが表示される                            | テキストが存在する                 |

### describe: エッジケース（Phase 6で追加）

| TC-ID  | テスト内容                                                         | 期待結果                  |
| ------ | ------------------------------------------------------------------ | ------------------------- |
| TC-E01 | onOpenSkillWizardが複数回クリックされても正常動作する              | 3回クリック → 3回呼ばれる |
| TC-E02 | onCloseとonOpenSkillWizardが同時に渡されても干渉しない             | 正常レンダリング          |
| TC-E03 | コンポーネントが再レンダリングされてもウィザードボタンが保持される | 存在する                  |

### describe: 回帰テスト（Phase 6で追加）

| TC-ID  | テスト内容                                        | 期待結果 |
| ------ | ------------------------------------------------- | -------- |
| TC-R01 | [回帰] テキストエリアが復活していない             | null     |
| TC-R02 | [回帰] 「スキルを生成する」ボタンが復活していない | null     |
| TC-R03 | [回帰] 「方針を決める」ボタンが復活していない     | null     |

### describe: アクセシビリティ（Phase 6で追加）

| TC-ID  | テスト内容                                        | 期待結果                                          |
| ------ | ------------------------------------------------- | ------------------------------------------------- |
| TC-A01 | ウィザードボタンに type='button' が付与されている | attribute "type"="button"                         |
| TC-A02 | セクション見出しが h3 要素として存在する          | tagName="H3"                                      |
| TC-A03 | 説明テキストが text-secondary クラスを持つ        | className contains text-\[var(--text-secondary)\] |

### describe: 既存セクションの保持確認（Phase 6で追加）

| TC-ID  | テスト内容                                          | 期待結果                                       |
| ------ | --------------------------------------------------- | ---------------------------------------------- |
| TC-S01 | 「2. 生成したスキルを実行する」セクションが存在する | テキストが存在する                             |
| TC-S02 | SkillLifecyclePanelの全体構造が崩れていない         | data-testid="skill-lifecycle-panel" が存在する |

## 削除したテストケース（旧）

| 削除理由                              | 削除テスト概要                                   |
| ------------------------------------- | ------------------------------------------------ |
| `skill-lifecycle-request-input` 参照  | 依頼文入力・detectMode 呼び出し確認テスト群      |
| `skill-lifecycle-create-button` 参照  | createSkill 呼び出し・生成成功・生成失敗テスト群 |
| `skill-lifecycle-prepare-button` 参照 | handlePrepare・plan 生成フローテスト群           |

## テストファイル

- 対象: `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.test.tsx`
- 型チェック: `tsc --noEmit` → PASS（エラーゼロ）
- ユニットテスト実行: esbuildバイナリ不一致（worktree固有の環境問題）のため実行保留。CI環境で検証予定。
