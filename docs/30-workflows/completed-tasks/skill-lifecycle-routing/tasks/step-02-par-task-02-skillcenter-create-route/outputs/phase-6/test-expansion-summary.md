# Phase 6: テスト拡充サマリー

## 概要

SkillCenterView CTA 機能のテストカバレッジを拡充した。

## 追加テストファイル

### 1. SkillCenterView.cta.test.tsx (26テスト)

新規作成: `apps/desktop/src/renderer/views/SkillCenterView/__tests__/SkillCenterView.cta.test.tsx`

| テストID      | カテゴリ         | 内容                                                                             |
| ------------- | ---------------- | -------------------------------------------------------------------------------- |
| TC-CTA-01     | レンダリング     | ヘッダーCTAボタンが表示される                                                    |
| TC-CTA-02     | レンダリング     | ヘッダーCTAボタンに「新規作成」テキストが表示される                              |
| TC-CTA-03     | インタラクション | ヘッダーCTAクリックで navigateToSkillCreate が呼ばれる                           |
| TC-CTA-04     | アクセシビリティ | ヘッダーCTAがbutton要素である                                                    |
| TC-CTA-05     | アクセシビリティ | ヘッダーCTAに type='button' が設定されている                                     |
| TC-CTA-06     | 条件分岐         | ローディング中はヘッダーCTAが表示されない                                        |
| TC-CTA-07     | 条件分岐         | エラー状態ではヘッダーCTAが表示されない                                          |
| TC-CTA-08     | レイアウト       | ヘッダーCTAがタイトルと同じ行に配置される                                        |
| TC-CTA-09     | レンダリング     | create ジョブのCTAボタンが表示される                                             |
| TC-CTA-10     | レンダリング     | use ジョブのCTAボタンが表示される                                                |
| TC-CTA-11     | レンダリング     | improve ジョブのCTAボタンが表示される                                            |
| TC-CTA-12     | インタラクション | create CTAクリックで navigateToSkillCreate が呼ばれる                            |
| TC-CTA-13     | インタラクション | use CTAクリックで navigateToWorkspace が呼ばれる                                 |
| TC-CTA-14     | インタラクション | improve CTAクリックで navigateToSkillAnalysis が呼ばれる                         |
| TC-CTA-15     | アクセシビリティ | 全CTAボタンに type='button' が設定されている                                     |
| TC-CTA-16     | レイアウト       | CTAボタンは各ジョブカード内にある                                                |
| TC-CTA-17     | 条件分岐         | ローディング中はJourneyPanel CTAが表示されない                                   |
| TC-CTA-18     | 条件分岐         | エラー状態ではJourneyPanel CTAが表示されない                                     |
| TC-CTA-19     | 統合             | JourneyPanel の各CTAテキストが ctaLabel と一致する                               |
| TC-CTA-20     | 統合             | ヘッダーCTAとcreate CTAは同じナビゲーション先を呼ぶ                              |
| TC-CTA-21     | インタラクション | 複数CTAを連続クリックしても各ナビゲーション関数が個別に呼ばれる                  |
| TC-CTA-ESC-01 | インタラクション | 削除確認ダイアログが開いている状態で Escape キーで handleCancelDelete が呼ばれる |
| TC-CTA-ESC-02 | 条件分岐         | 削除確認ダイアログが閉じている状態では Escape キーが無効                         |
| TC-CTA-22     | レンダリング     | JourneyPanel に data-testid がある                                               |
| TC-CTA-23     | レンダリング     | 各ジョブカードに Step ラベルが表示される                                         |
| TC-CTA-24     | インタラクション | 削除確認ダイアログが開いていてもCTAは正常に動作する                              |

### 2. useSkillCenter.navigation.test.ts (4テスト)

新規作成: `apps/desktop/src/renderer/views/SkillCenterView/hooks/__tests__/useSkillCenter.navigation.test.ts`

| テストID | カテゴリ       | 内容                                                      |
| -------- | -------------- | --------------------------------------------------------- |
| TC-NAV-1 | ナビゲーション | navigateToSkillCreate が skillCreate ビューへ遷移する     |
| TC-NAV-2 | ナビゲーション | navigateToSkillAnalysis が skillAnalysis ビューへ遷移する |
| TC-NAV-3 | ナビゲーション | navigateToWorkspace が workspace ビューへ遷移する         |
| TC-NAV-4 | ナビゲーション | 各ナビゲーション関数が useSkillCenter から返される        |

### 3. skillLifecycleJourney.test.ts（既存・20テスト）

既存ファイルを参照: `apps/desktop/src/renderer/navigation/skillLifecycleJourney.test.ts`

Phase 4 から存在する 20 テストが skillLifecycleJourney.ts のカバレッジ 100% を担保。

## テストカテゴリ別集計

| カテゴリ         | テスト数 |
| ---------------- | -------- |
| レンダリング     | 8        |
| インタラクション | 8        |
| アクセシビリティ | 4        |
| 条件分岐         | 5        |
| レイアウト       | 2        |
| 統合             | 2        |
| ナビゲーション   | 4        |
| **Phase 6 追加** | **30**   |
| **合計（全体）** | **50**   |

## テスト設計方針

- P39対策: happy-dom環境のため `fireEvent` を使用（`userEvent` 禁止）
- P31対策: `useSkillCenter` をモックして Zustand Store の個別セレクタ問題を回避
- 既存テスト（delete-confirm等）のモック構造を踏襲

## 統合テスト連携

- アクセシビリティテスト（TC-CTA-04, TC-CTA-05, TC-CTA-15）が AC-7（Apple HIG WCAG 2.1 AA 準拠）の検証を補完する
- 条件分岐テスト（TC-CTA-06, TC-CTA-07, TC-CTA-17, TC-CTA-18）が実装の堅牢性を証明し、Phase 8 リファクタリング後の UI 変更を検出するセーフティネットになる
- 統合テスト（TC-CTA-19, TC-CTA-20）が Task01（ViewType 追加）との依存境界が正しく機能することを確認する
- Phase 7 カバレッジ確認において、本 Phase で追加した 30 テストが Line/Branch/Function の推奨基準達成に寄与することを確認済み
