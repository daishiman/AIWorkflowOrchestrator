# TASK-RALLY-009: getSkillCreatorApi()型ガード強化

## メタ情報

- 検出元: TASK-RALLY-001 Phase 12 レビュー・型安全性ギャップ分析
- 優先度: Low
- GitHub Issue: #2394
- Wave: 2（RALLY-004完了後、並列実行可）
- 前提タスク: RALLY-004（selectedOptionIds/selectedValues重複整理）
- 衝突ドメイン: skillCreator型定義 / API型ガード
- 実装種別: NON_VISUAL（UI変化なし）
- 関連ファイル:
  - `getSkillCreatorApi()` を呼び出す全ファイル（`rg` で特定）
  - `getSessionResumeApi()` を呼び出す全ファイル

## 目的

`getSkillCreatorApi()` と `getSessionResumeApi()` の戻り値に対する `as` キャストを排除し、型ガード（`instanceof` / discriminated union）による runtime 検証を追加する。RALLY-004 で型定義の正規化が完了した後に実施する。

## 背景

現状 `getSkillCreatorApi()` の戻り値を `as SomeType` でキャストしている箇所が存在し、runtime での型不一致が検出されない。RALLY-004 で `selectedOptionIds` が正規フィールドとして確定した後、型ガードを追加することで型安全性を高める。

## 実行タスク

- [ ] `getSkillCreatorApi()` と `getSessionResumeApi()` の全呼び出し箇所を `rg` で特定する
- [ ] `as` キャストを型ガード関数（`isSkillCreatorApi(x): x is SkillCreatorApi` 等）に置き換える
- [ ] runtime 検証失敗時の fallback 処理を設計・実装する
- [ ] 型ガードのユニットテストを追加する

## 完了条件

- [ ] `as` キャストが型ガード関数に置き換えられていること
- [ ] runtime 型検証が失敗した場合に適切なエラーまたはフォールバックが動作すること
- [ ] TypeScript 型チェック PASS（型アサーションなし）
- [ ] 既存テスト PASS

## 苦戦箇所（RALLY-001実装知見）

| 苦戦箇所                 | 問題                                                   | 解決策                                                                      |
| ------------------------ | ------------------------------------------------------ | --------------------------------------------------------------------------- |
| `as` キャスト依存の連鎖  | 1箇所を型ガードに変えると下流に型エラーが連鎖する      | 型ガード関数を先に定義し、型推論が自動で伝播するか確認してから進める        |
| runtime 検証コストの懸念 | 毎回 instanceof チェックがパフォーマンスに影響する懸念 | development ビルドのみ検証、production は型推論のみで省略するパターンも検討 |

## 参照

- 詳細Phase仕様書: `docs/30-workflows/skill-create-flow-gaps/wave2-par-RALLY-009/`
- 前提: TASK-RALLY-004（型定義正規化）
