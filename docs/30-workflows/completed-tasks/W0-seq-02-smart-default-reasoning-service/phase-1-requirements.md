# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| Phase      | 1                                              |
| タスクID   | UT-SKILL-WIZARD-W0-SMART-DEFAULT-REASONING-001 |
| 機能名     | スマートデフォルト推論サービス実装             |
| 前提Phase  | -                                              |
| 後続Phase  | Phase 2                                        |
| 作成日     | 2026-04-08                                     |
| ステータス | completed                                      |

## 目的

`SmartDefaultResult` を生成する推論サービスが未実装（スタブ状態）であることの影響範囲を確定し、
独立サービスとして実装するための受け入れ基準を固定する。

## 実行タスク

1. W0-seq-01 の完成済み型定義を参照し、current contract を固定する。
2. 新規サービス・ユニットテスト・barrel 変更の影響範囲を列挙する。
3. AC-1〜AC-4 を検証可能な粒度で定義する。

## 統合テスト連携

- Phase 4 では purpose / category / null fallback の分岐を Red テストへ落とし込む。
- Phase 11 は NON_VISUAL として REPL / CLI 確認を記録し、画面証跡は作らない。

## 背景

W0-seq-01 で `SmartDefaultResult` / `SkillInfoFormData` の型定義は完了済み。
しかし型定義のみで、実際に `SmartDefaultResult` の値を生成するロジックが存在しない。

W2-seq-03a（SkillCreateWizard 更新）では `inferSmartDefaults()` 関数を
`SkillCreateWizard.tsx` 内にインライン実装する想定だったが、以下の問題がある：

- コンポーネント内に推論ロジックが混在し、テスト・再利用が困難
- LLM 推論オプションへの拡張が考慮されていない
- フォールバック挙動が未定義

本タスクでは推論ロジックを `packages/shared/` に独立サービスとして分離・実装する。

## 影響範囲分析

### 新規作成対象

| ファイル                                                                                   | 種別 | 内容             |
| ------------------------------------------------------------------------------------------ | ---- | ---------------- |
| `packages/shared/src/services/skillCreator/smartDefaultReasoningService.ts`                | 新規 | 推論サービス本体 |
| `packages/shared/src/services/skillCreator/__tests__/smartDefaultReasoningService.test.ts` | 新規 | ユニットテスト   |

### 変更対象（既存ファイル）

| ファイル                                                               | 変更内容                               |
| ---------------------------------------------------------------------- | -------------------------------------- |
| `packages/shared/src/services/skillCreator/index.ts`（barrel or 同等） | 推論サービスのエクスポート追加         |
| `packages/shared/index.ts`                                             | `@repo/shared` root への再 export 追加 |
| `packages/shared/src/types/skillCreator.ts`                            | 型整合確認のみ（変更不要の場合あり）   |

### 影響を受けるコンポーネント（将来の依存先）

| コンポーネント/タスク   | 依存内容                                                   |
| ----------------------- | ---------------------------------------------------------- |
| `SkillCreateWizard.tsx` | W2-seq-03a で本サービスをインポートして利用する            |
| W2-seq-03a              | 本タスク完了後、インライン実装を本サービスに置き換えられる |

## 受け入れ基準（AC）

| AC番号 | 内容                                                                                             | 検証方法                              |
| ------ | ------------------------------------------------------------------------------------------------ | ------------------------------------- |
| AC-1   | `inferSmartDefaults(input: SkillInfoFormData): SmartDefaultResult` 関数が実装されること          | 関数シグネチャ確認・型チェック        |
| AC-2   | スキル名・目的から適切なカテゴリ・ツール・タイミング・フォーマットのデフォルト値が提案されること | ユニットテスト                        |
| AC-3   | ユニットテストが全件 PASS すること                                                               | `pnpm --filter @repo/shared test:run` |
| AC-4   | 推論不能時のフォールバック挙動が定義・実装されること（null フィールド・空 inferenceLog）         | ユニットテスト                        |

## 機能要件

| 要件ID | 内容                                                                                                                   |
| ------ | ---------------------------------------------------------------------------------------------------------------------- |
| FR-01  | `SkillInfoFormData` を入力として受け取り、`SmartDefaultResult` を返すこと                                              |
| FR-02  | purpose テキストから tool（slack/github/notion）を推論すること                                                         |
| FR-03  | purpose テキストから timing（scheduled/realtime）を推論すること                                                        |
| FR-04  | category から format（code/structured）を推論すること                                                                  |
| FR-05  | 推論根拠を `inferenceLog: string[]` に記録すること                                                                     |
| FR-06  | 推論対象キーワードが含まれない場合、該当フィールドを `null` で返すこと（`purpose` が空でも `category` は独立評価する） |
| FR-07  | 推論件数が0件でも `inferenceLog` は空配列 `[]` として返すこと（エラーにしない）                                        |

## 非機能要件

| 要件ID | 内容                                                                     |
| ------ | ------------------------------------------------------------------------ |
| NFR-01 | TypeScript strict モードに準拠すること                                   |
| NFR-02 | `any` 型を使用しないこと                                                 |
| NFR-03 | 外部ライブラリ（LLM API等）への依存なし（規則ベース実装のみ）            |
| NFR-04 | `packages/shared/` に配置し、デスクトップ/Web 両方から利用可能であること |

## タスク分類

- **タスク種別**: NON_VISUAL（UIコンポーネント変更なし、推論ロジックのみ）
- **Phase 11 方針**: REPL / CLI 確認を主証跡とし、スクリーンショット不要

## 参照資料

| 資料名                    | パス                                                                         | 用途                         |
| ------------------------- | ---------------------------------------------------------------------------- | ---------------------------- |
| 型定義（W0-seq-01成果物） | `packages/shared/src/types/skillCreator.ts`                                  | SmartDefaultResult等の型確認 |
| W0-seq-01 index           | `docs/30-workflows/completed-tasks/W0-seq-01-types-skill-info-form/index.md` | 先行タスクの成果物確認       |
| Issue #2003               | GitHub Issue                                                                 | 要件・受け入れ基準の出典     |

## 実行手順

1. `packages/shared/src/types/skillCreator.ts` を読み込み、`SmartDefaultResult` / `SkillInfoFormData` の型定義を確認する。
2. `packages/shared/src/services/skillCreator/` ディレクトリの現状を確認する（存在しない場合は新規作成が必要）。
3. `packages/shared/` の barrel ファイル（`index.ts` 等）の現状を確認する。
4. AC-1〜AC-4 の検証方法を確定する。
5. 機能要件・非機能要件を矛盾なく固定する。

## 成果物

| 成果物         | パス                                         | 説明                           |
| -------------- | -------------------------------------------- | ------------------------------ |
| 要件定義書     | `outputs/phase-1/requirements-definition.md` | 機能要件・非機能要件           |
| 受け入れ基準   | `outputs/phase-1/acceptance-criteria.md`     | 検証可能な AC-1〜AC-4 一覧     |
| 影響範囲マップ | `outputs/phase-1/impact-scope-map.md`        | 新規作成・変更対象ファイル一覧 |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] `SmartDefaultResult` / `SkillInfoFormData` 型定義が確認されていること
- [ ] `packages/shared/src/services/skillCreator/` のディレクトリ状態が確認されていること
- [ ] AC-1〜AC-4 が矛盾なく定義されていること
- [ ] 機能要件・非機能要件が全て記載されていること
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 2: 設計
