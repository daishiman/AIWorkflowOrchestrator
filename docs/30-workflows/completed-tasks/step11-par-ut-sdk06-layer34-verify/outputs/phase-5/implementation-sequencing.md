# Implementation Sequencing — UT-IMP-SDK-06 Phase 5

## 実装順

| 順序 | 対象                                                                      | 依存    | 完了                               |
| ---- | ------------------------------------------------------------------------- | ------- | ---------------------------------- |
| 1    | `packages/shared/src/types/skillCreator.ts` の layer 型確認               | なし    | PASS (既に layer3/layer4 定義済み) |
| 2    | `createSkillFixture` に `referenceFiles` / `skillMdReferenceLinks` を追加 | なし    | DONE                               |
| 3    | `SkillCreatorVerificationEngine.ts` の `createCheck()` layer 型を拡張     | なし    | DONE                               |
| 4    | `validateLayer3()` 実装（L3-001〜L3-004）                                 | なし    | DONE                               |
| 5    | `validateLayer4()` 実装（L4-001〜L4-003）                                 | なし    | DONE (Layer3 と並列実装可)         |
| 6    | `verify()` メソッドに layer3/layer4 追加                                  | 4, 5    | DONE                               |
| 7    | Layer3 テストケース（T-L3-01〜T-L3-10、T-L3-EC-01〜05）追加               | 2, 3, 4 | DONE                               |
| 8    | Layer4 テストケース（T-L4-01〜T-L4-08、T-L4-EC-01〜05）追加               | 2, 3, 5 | DONE                               |
| 9    | 結合テスト（T-LOOP-01〜04、T-LOOP-EC-01〜03）追加                         | 7, 8    | DONE                               |

## バグ修正

### extractSectionContent 正規表現バグ

- **問題**: `m` フラグ使用時に `$` が行末にマッチするため、非貪欲な `[\s\S]*?` が最初の改行でマッチを止めてしまい、複数行の Trigger セクション内容が空文字列と判定された
- **修正**: 2ステップ方式に変更。まず `^##\s+Heading$` でセクション開始位置を特定し、次に `^##\s` で次のセクション開始を検索してコンテンツを切り出す
- **影響テスト**: T-L3-EC-05（Trigger が複数行で合計 10 文字以上）

### output-schema JSON root / type 配列バグ

- **問題**: `output-schema.json` が object 以外の JSON 値（`true` など）や、`type: []` のような空配列を含む場合に、Layer3 の判定が crash または false-green になる可能性があった
- **修正**: object 以外の root は warning で安全にフォールバックし、`type` の配列判定は `length > 0` を必須に変更した
- **影響テスト**: T-L3-EC-01（object 以外 root の安全化）、T-L3-EC-02（空配列 `[]` を error）

## 変更ファイル

| ファイル                                                                                  | 変更内容                                                           |
| ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `apps/desktop/src/main/services/runtime/SkillCreatorVerificationEngine.ts`                | createCheck layer 型拡張、validateLayer3/4 実装、verify() 更新     |
| `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorVerificationEngine.test.ts` | createSkillFixture 拡張、Layer3/4 テストケース追加、結合テスト追加 |

## テスト結果

- 全 60 テストが pass
- 既存 Layer1/2 テスト（T-ENG-01〜T-FAC-02）のデグレなし
