# E2Eフィクスチャ エッジケース拡充 - タスク指示書

## メタ情報

```yaml
issue_number: 629
```

## メタ情報

| 項目         | 内容                                            |
| ------------ | ----------------------------------------------- |
| タスクID     | task-imp-e2e-fixture-edge-cases-001             |
| タスク名     | E2Eフィクスチャ エッジケース拡充                |
| 分類         | 改善                                            |
| 対象機能     | SkillScanner E2Eテストフィクスチャ              |
| 優先度       | 低                                              |
| 見積もり規模 | 小規模                                          |
| ステータス   | 未実施                                          |
| 発見元       | システム仕様書Gap分析（quality-e2e-testing.md） |
| 発見日       | 2026-02-01                                      |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-8C-Eで作成されたE2Eフィクスチャは3種類のパターン（完全構成・最小構成・無効構成）で正常系・境界値・異常系の基本カバレッジを提供している。しかし、実運用で発生しうるエッジケース（特殊文字を含むスキル名、非常に長いdescription、allowed-toolsが空のスキル、Frontmatter不正のスキル等）についてはE2Eレベルでの検証が存在しない。

### 1.2 問題点・課題

| エッジケース                          | ユニットテスト | E2Eフィクスチャ | リスク           |
| ------------------------------------- | -------------- | --------------- | ---------------- |
| allowed-toolsが空配列のスキル         | なし           | なし            | UI表示の不具合   |
| descriptionが空のスキル               | なし           | なし            | 選択UIの表示崩れ |
| Frontmatterのみ（bodyなし）のSKILL.md | なし           | なし            | パースエラー     |
| 日本語名のスキル                      | なし           | なし            | エンコーディング |
| 大量サブリソース（10+件）を持つスキル | なし           | なし            | パフォーマンス   |

現在のフィクスチャ設計原則「3パターン網羅」は基本カバレッジとして有効だが、TASK-8C-B/C/D のE2Eテストが実際のUIフローを検証する際に、これらのエッジケースがUIレベルでの不具合として顕在化するリスクがある。

### 1.3 放置した場合の影響

- E2EテストでUIレベルのエッジケース不具合を検出できない
- SkillSelectorコンポーネントの空description/空allowed-tools表示がテストされない
- 将来のスキル追加時に予期しないパースエラーが発生する可能性
- ただし影響は限定的（ユニットテスト49件で主要パスはカバー済み）

---

## 2. 何を達成するか（What）

### 2.1 目的

E2Eフィクスチャにエッジケースパターンを追加し、SkillScannerの境界値処理とUIコンポーネントの耐久性をE2Eレベルで検証可能にする。

### 2.2 最終ゴール

- 3つ以上の新エッジケースフィクスチャが`__fixtures__/skills/`に追加されている
- 各エッジケースに対応するテストケースが`skills.fixture.test.ts`に追加されている
- 既存テストケースに回帰がない
- `quality-e2e-testing.md`のフィクスチャ仕様が更新されている

### 2.3 スコープ

#### 含むもの

- `empty-tools-skill/`: allowed-toolsが空配列`[]`のスキル
- `no-description-skill/`: descriptionが空文字のスキル
- `frontmatter-only-skill/`: Frontmatterのみ（bodyなし）のSKILL.md
- 各フィクスチャに対応するテストケース追加
- `quality-e2e-testing.md`フィクスチャ仕様更新

#### 含まないもの

- SkillScanner/SkillParser本体のコード修正
- 既存フィクスチャ（test-skill/another-skill/invalid-skill）の変更
- パフォーマンステスト用の大量サブリソースフィクスチャ
- 日本語スキル名のフィクスチャ（エンコーディングはユニットテストレベルで十分）

### 2.4 成果物

| 成果物                          | パス                                                                       |
| ------------------------------- | -------------------------------------------------------------------------- |
| empty-tools-skill/SKILL.md      | `src/__tests__/__fixtures__/skills/empty-tools-skill/`                     |
| no-description-skill/SKILL.md   | `src/__tests__/__fixtures__/skills/no-description-skill/`                  |
| frontmatter-only-skill/SKILL.md | `src/__tests__/__fixtures__/skills/frontmatter-only-skill/`                |
| テストケース追加                | `src/__tests__/fixtures/skills.fixture.test.ts`                            |
| 仕様書更新                      | `.claude/skills/aiworkflow-requirements/references/quality-e2e-testing.md` |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-8C-Eが完了していること（29テスト全PASS）
- SkillScannerの空allowed-tools/空descriptionのパース動作がユニットテストで確認済みであること

### 3.2 依存タスク

| タスク    | 内容                      | 状態 |
| --------- | ------------------------- | ---- |
| TASK-8C-E | E2Eテストフィクスチャ作成 | 完了 |

### 3.3 必要な知識

- SkillScannerのYAML Frontmatterパースロジック（`arch-electron-services.md` 参照）
- `gray-matter`ライブラリの空Frontmatter/空body動作
- `ScannedSkillMetadata`の各フィールドのデフォルト値ロジック

### 3.4 推奨アプローチ

1. まずSkillScannerのユニットテストで各エッジケースの期待動作を確認
2. 確認した期待動作に基づいてE2Eフィクスチャを作成
3. TDDアプローチ: テスト先行（Red → Green）
4. SkillScannerがスキップする場合とパースする場合を正確に区別

---

## 4. 実行手順

### Phase構成

| Phase | 名称             | 内容                                         |
| ----- | ---------------- | -------------------------------------------- |
| 1     | 動作調査         | SkillScannerの各エッジケース動作を確認       |
| 2     | テスト作成       | エッジケース検証テストケースを追加（Red）    |
| 3     | フィクスチャ作成 | 3つのエッジケースフィクスチャを作成（Green） |
| 4     | 品質確認         | 全テストPASS確認、ESLint、仕様書更新         |

### Phase 1: 動作調査

#### 目的

各エッジケースでSkillScannerがどう動作するか確認

#### 手順

1. SkillScannerのソースコード（`SkillScanner.ts`）を確認
2. 以下のケースの動作を特定:
   - `allowed-tools: []` → scanAll()結果に含まれるか？`allowedTools`は`[]`になるか？
   - `description: ""` → scanAll()結果に含まれるか？`description`は`""`になるか？
   - Frontmatterのみ（`---\n...\n---\n`、bodyなし） → パース可能か？
3. 各ケースの期待値をメモ

#### 成果物

エッジケース動作確認メモ

#### 完了条件

3ケースすべての期待動作が特定されていること

### Phase 2: テスト作成（Red）

#### 目的

Phase 1の調査結果に基づくテストケースを追加

#### 手順

1. `skills.fixture.test.ts`に`Edge Case Fixtures`describeブロックを追加
2. 各エッジケースの検証テストを記述
3. テスト実行 → 失敗（Red）を確認

#### 成果物

テストケース追加（フィクスチャ存在チェック + パース結果チェック）

#### 完了条件

新規テストがRED、既存テストがPASS

### Phase 3: フィクスチャ作成（Green）

#### 目的

テストを通すためのフィクスチャを作成

#### 手順

1. `empty-tools-skill/SKILL.md`を作成（`allowed-tools: []`）
2. `no-description-skill/SKILL.md`を作成（`description: ""`）
3. `frontmatter-only-skill/SKILL.md`を作成（bodyなし）
4. テスト実行 → 全PASS（Green）

#### 成果物

3つのフィクスチャディレクトリ

#### 完了条件

全テスト（既存 + 新規）がPASS

### Phase 4: 品質確認・仕様書更新

#### 目的

品質基準クリアと仕様書の最新化

#### 手順

1. ESLint実行（0エラー確認）
2. `quality-e2e-testing.md`にエッジケースフィクスチャの仕様を追加
3. テストケース一覧を更新

#### 成果物

更新済み仕様書

#### 完了条件

ESLint 0エラー、仕様書が実態と一致

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] empty-tools-skill/SKILL.md が存在し、SkillScannerで正しくパースされる
- [ ] no-description-skill/SKILL.md が存在し、SkillScannerで正しくパースされる
- [ ] frontmatter-only-skill/SKILL.md が存在し、SkillScannerで正しくパースされる
- [ ] 各エッジケースのscanAll()結果が期待通りである

### 品質要件

- [ ] 全テストケースがPASS
- [ ] 既存テストケースに回帰なし
- [ ] ESLint 0エラー
- [ ] TODO/FIXME/HACK/XXXコメントなし

### ドキュメント要件

- [ ] quality-e2e-testing.md のフィクスチャ仕様にエッジケースが追加されている
- [ ] quality-e2e-testing.md のテストケース一覧が更新されている

---

## 6. 検証方法

### テストケース

| TC  | テスト内容                                       | 期待結果                             |
| --- | ------------------------------------------------ | ------------------------------------ |
| 1   | empty-tools-skill/SKILL.md が存在する            | ファイルが存在                       |
| 2   | empty-tools-skill がscanAll()結果に含まれる      | スキルリストに存在                   |
| 3   | empty-tools-skill のallowedToolsが空配列         | `allowedTools.length === 0`          |
| 4   | no-description-skill/SKILL.md が存在する         | ファイルが存在                       |
| 5   | no-description-skill がscanAll()結果に含まれる   | スキルリストに存在                   |
| 6   | no-description-skill のdescriptionが空文字       | `description === ""`                 |
| 7   | frontmatter-only-skill/SKILL.md が存在する       | ファイルが存在                       |
| 8   | frontmatter-only-skill がscanAll()結果に含まれる | スキルリストに存在（bodyなしでもOK） |

### 検証手順

```bash
# テスト実行
cd apps/desktop
npx vitest run src/__tests__/fixtures/skills.fixture.test.ts

# ESLint確認
npx eslint src/__tests__/fixtures/skills.fixture.test.ts

# SkillScannerユニットテスト影響確認
npx vitest run src/main/services/skill/__tests__/
```

---

## 7. リスクと対策

| リスク                                              | 影響度 | 発生確率 | 対策                                                        |
| --------------------------------------------------- | ------ | -------- | ----------------------------------------------------------- |
| SkillScannerが空allowed-tools/descriptionを拒否する | 中     | 中       | Phase 1の動作調査で事前確認、必要ならパース仕様を確認       |
| Frontmatterのみのファイルがパースエラーになる       | 中     | 中       | gray-matterの動作を確認、エラーならテスト期待値を調整       |
| scanAll()の結果件数が変わり既存TC-009が失敗         | 高     | 高       | TC-009の期待値を「2件→N件」に更新、または動的カウントに変更 |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント                    | 内容                                  |
| ------------------------------- | ------------------------------------- |
| `quality-e2e-testing.md`        | E2Eテスト仕様（フィクスチャ設計原則） |
| `arch-electron-services.md`     | SkillScanner仕様                      |
| `interfaces-agent-sdk-skill.md` | ScannedSkillMetadata型定義            |
| TASK-8C-E outputs               | 既存フィクスチャ設計判断              |

### 参考資料

| 資料                                                        | 用途                         |
| ----------------------------------------------------------- | ---------------------------- |
| `src/__tests__/__fixtures__/skills/test-skill/SKILL.md`     | 正常なFrontmatter構造の参考  |
| `src/__tests__/__fixtures__/skills/invalid-skill/README.md` | 無効ケースフィクスチャの参考 |

---

## 9. 備考

### 発見の経緯

TASK-8C-Eのシステム仕様書反映（quality-e2e-testing.md作成）時に、フィクスチャ設計原則「3パターン網羅」が正常系・基本異常系をカバーしているものの、エッジケース（空配列、空文字、bodyなし等）のE2Eレベル検証が存在しないことを確認。

### 補足事項

- 本タスクの優先度は「低」。TASK-8C-B/C/Dの基本E2Eテストが先行すべき
- Phase 1（動作調査）の結果、SkillScannerがエッジケースをスキップ（結果に含めない）する場合は、テストの期待値を「結果に含まれない」に調整する
- TC-009（scanAll()が2件を返す）の期待値更新が必要になる点に注意。新フィクスチャ追加数に応じて期待件数を更新する
- `task-imp-e2e-fixture-subresource-expansion-001`と併せて実施する場合、フィクスチャ総数の期待値を統合的に管理すること
