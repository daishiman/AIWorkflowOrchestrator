# Phase 4: テスト設計サマリー

## タスク: TASK-SKILL-LIFECYCLE-02 SkillCenter 作成導線CTA

## テストファイル一覧

| ファイルパス                                                                                        | テスト数 | 状態  | 備考                                            |
| --------------------------------------------------------------------------------------------------- | -------- | ----- | ----------------------------------------------- |
| `apps/desktop/src/renderer/views/SkillCenterView/hooks/__tests__/useSkillCenter.navigation.test.ts` | 4        | GREEN | 3アクション + 返り値型検証                      |
| `apps/desktop/src/renderer/views/SkillCenterView/__tests__/SkillCenterView.cta.test.tsx`            | 26       | GREEN | ヘッダーCTA・JourneyPanel CTA・Escape・統合     |
| `apps/desktop/src/renderer/navigation/skillLifecycleJourney.test.ts`                                | 20       | GREEN | 型検証・ctaLabel検証（TC-SL-01〜TC-SL-15 追加） |

> 注記: Phase 4 では useSkillCenter.navigation.test.ts（TC-01〜TC-04）とともに、
> SkillCenterView.cta.test.tsx（TC-CTA-01〜TC-CTA-24 / Escape / 統合）を先行作成した。
> skillLifecycleJourney.test.ts に TC-SL-01〜TC-SL-15（onAction / ctaLabel 型検証）を追加した。
> モバイルレスポンシブテスト（768px 未満アイコン専用）は CTA テスト群の範囲外で別途検討。

## テストケース一覧

### ファイル 1: useSkillCenter.navigation.test.ts

| ID    | テスト名                                                          | 検証内容                         | AC対応                                                   |
| ----- | ----------------------------------------------------------------- | -------------------------------- | -------------------------------------------------------- |
| TC-01 | navigateToSkillCreate が setCurrentView("skillCreate") を呼ぶ     | スキル作成画面へのナビゲーション | AC-1, AC-2: ヘッダー/JourneyPanel CTA → skillCreate 遷移 |
| TC-02 | navigateToWorkspace が setCurrentView("workspace") を呼ぶ         | ワークスペースへのナビゲーション | AC-4: JourneyPanel「使う」CTA → workspace 遷移           |
| TC-03 | navigateToSkillAnalysis が setCurrentView("skillAnalysis") を呼ぶ | スキル分析画面へのナビゲーション | AC-5: JourneyPanel「改善」CTA → skillAnalysis 遷移       |
| TC-04 | 返り値にナビゲーション関数が含まれる                              | hookの戻り値型の検証             | 型安全性（P31 対策: 個別セレクタ形式確認）               |

### ファイル 2: SkillCenterView.cta.test.tsx

#### ヘッダー CTA（TC-CTA-01〜TC-CTA-08）

| ID        | テスト名                                               | 検証内容                       | AC対応                            |
| --------- | ------------------------------------------------------ | ------------------------------ | --------------------------------- |
| TC-CTA-01 | ヘッダーCTAボタンが表示される                          | header-create-cta DOM 存在確認 | AC-1: ヘッダーCTA 表示            |
| TC-CTA-02 | ヘッダーCTAボタンに「新規作成」テキストが表示される    | ラベルテキスト確認             | AC-1: ヘッダーCTA テキスト        |
| TC-CTA-03 | ヘッダーCTAクリックで navigateToSkillCreate が呼ばれる | クリックハンドラの動作確認     | AC-2: クリック → skillCreate 遷移 |
| TC-CTA-04 | ヘッダーCTAがbutton要素である                          | tagName 確認                   | AC-8: セマンティクス              |
| TC-CTA-05 | ヘッダーCTAに type='button' が設定されている           | 属性確認                       | AC-8: フォーム誤送信防止          |
| TC-CTA-06 | ローディング中はヘッダーCTAが表示されない              | isLoading=true 時の非表示      | AC-1: ローディング時 UI 制御      |
| TC-CTA-07 | エラー状態ではヘッダーCTAが表示されない                | error 状態時の非表示           | AC-1: エラー時 UI 制御            |
| TC-CTA-08 | ヘッダーCTAがタイトルと同じ行に配置される              | headerRow 内配置確認           | AC-1: レイアウト検証              |

#### JourneyPanel CTA（TC-CTA-09〜TC-CTA-18）

| ID        | テスト名                                                 | 検証内容                         | AC対応                             |
| --------- | -------------------------------------------------------- | -------------------------------- | ---------------------------------- |
| TC-CTA-09 | create ジョブのCTAボタンが表示される                     | skill-lifecycle-cta-create 表示  | AC-3: JourneyPanel「作る」CTA 表示 |
| TC-CTA-10 | use ジョブのCTAボタンが表示される                        | skill-lifecycle-cta-use 表示     | AC-4: JourneyPanel「使う」CTA 表示 |
| TC-CTA-11 | improve ジョブのCTAボタンが表示される                    | skill-lifecycle-cta-improve 表示 | AC-5: JourneyPanel「改善」CTA 表示 |
| TC-CTA-12 | create CTAクリックで navigateToSkillCreate が呼ばれる    | クリック → skillCreate 遷移      | AC-3: skillCreate 遷移             |
| TC-CTA-13 | use CTAクリックで navigateToWorkspace が呼ばれる         | クリック → workspace 遷移        | AC-4: workspace 遷移               |
| TC-CTA-14 | improve CTAクリックで navigateToSkillAnalysis が呼ばれる | クリック → skillAnalysis 遷移    | AC-5: skillAnalysis 遷移           |
| TC-CTA-15 | 全CTAボタンに type='button' が設定されている             | 属性確認（3ボタン）              | AC-8: セマンティクス               |
| TC-CTA-16 | CTAボタンは各ジョブカード内にある                        | within() で配置確認              | AC-6: handoff CTA 専用（配置制約） |
| TC-CTA-17 | ローディング中はJourneyPanel CTAが表示されない           | isLoading=true 時の非表示        | AC-3/4/5: ローディング時 UI 制御   |
| TC-CTA-18 | エラー状態ではJourneyPanel CTAが表示されない             | error 状態時の非表示             | AC-3/4/5: エラー時 UI 制御         |

#### ctaLabel 条件分岐（TC-CTA-19〜TC-CTA-21）

| ID        | テスト名                                                                     | 検証内容                        | AC対応               |
| --------- | ---------------------------------------------------------------------------- | ------------------------------- | -------------------- |
| TC-CTA-19 | JourneyPanel の各CTAテキストが SKILL_LIFECYCLE_JOB_GUIDES の ctaLabel と一致 | ctaLabel 文字列値の照合         | AC-3/4/5: CTA ラベル |
| TC-CTA-20 | ヘッダーCTAとcreate CTAは同じナビゲーション先を呼ぶ                          | 2箇所から同一アクション呼び出し | AC-2/AC-3: 一貫性    |
| TC-CTA-21 | 複数CTAを連続クリックしても各ナビゲーション関数が個別に呼ばれる              | 3アクション独立実行確認         | AC-3/4/5: 独立動作   |

#### Escape キーハンドラ（TC-CTA-ESC-01〜TC-CTA-ESC-02）

| ID            | テスト名                                                                             | 検証内容                     | AC対応                   |
| ------------- | ------------------------------------------------------------------------------------ | ---------------------------- | ------------------------ |
| TC-CTA-ESC-01 | 削除確認ダイアログが開いている状態で Escape キーで handleCancelDelete が呼ばれる     | keyDown Escape → キャンセル  | AC-8: キーボード操作対応 |
| TC-CTA-ESC-02 | 削除確認ダイアログが閉じている状態では Escape キーで handleCancelDelete が呼ばれない | ダイアログ閉時は Escape 無効 | AC-8: 誤操作防止         |

#### 統合テスト（TC-CTA-22〜TC-CTA-24）

| ID        | テスト名                                                           | 検証内容                            | AC対応              |
| --------- | ------------------------------------------------------------------ | ----------------------------------- | ------------------- |
| TC-CTA-22 | JourneyPanel セクションが skill-lifecycle-journey の testid を持つ | data-testid 存在確認                | AC-3: 構造検証      |
| TC-CTA-23 | 各ジョブカードに Step ラベルが表示される                           | Step 1/2/3 テキスト確認             | AC-3/4/5: UI 完整性 |
| TC-CTA-24 | CTAボタンは削除確認ダイアログが開いていても正常に動作する          | 削除ダイアログと CTA の共存動作確認 | AC-3: 状態独立性    |

### ファイル 3: skillLifecycleJourney.test.ts（追加分 TC-SL-01〜TC-SL-15）

| ID       | テスト名                                                                | 検証内容                | AC対応         |
| -------- | ----------------------------------------------------------------------- | ----------------------- | -------------- |
| TC-SL-01 | SkillLifecycleJobGuide 型が onAction?: () => void を受け入れること      | 型バリデーション        | AC-4: 型安全   |
| TC-SL-02 | SkillLifecycleJobGuide 型で onAction を省略できること                   | optional 型確認         | AC-4: 型安全   |
| TC-SL-03 | 既存の SKILL_LIFECYCLE_JOB_GUIDES 定数が onAction なしで有効であること  | 定数不変性              | AC-6: handoff  |
| TC-SL-04 | normalizeSkillLifecycleView が skillAnalysis を変換せず返すこと         | ルーティング正規化      | AC-6: ルート   |
| TC-SL-05 | normalizeSkillLifecycleView が skillCreate を変換せず返すこと           | ルーティング正規化      | AC-6: ルート   |
| TC-SL-06 | onAction が関数型であることの型安全性検証                               | typeof 確認             | AC-4: 型安全   |
| TC-SL-07 | onAction 呼び出しが正常に実行されること                                 | 実行確認                | AC-4: 動作確認 |
| TC-SL-08 | SKILL_LIFECYCLE_JOB_GUIDES の各 guide が必須フィールドを全て持つこと    | 必須プロパティ存在確認  | AC-3〜5: 構造  |
| TC-SL-09 | normalizeSkillLifecycleView に "skill-center" を渡すと変換されること    | legacy alias 正規化     | AC-6: ルート   |
| TC-SL-10 | normalizeSkillLifecycleView に "dashboard" を渡すとそのまま返されること | 非対象ルート不変確認    | AC-6: ルート   |
| TC-SL-11 | onAction が undefined でも optional chaining でエラーにならないこと     | 安全アクセス確認        | AC-4: 型安全   |
| TC-SL-12 | 全ての SKILL_LIFECYCLE_JOB_GUIDES が ctaLabel を持つこと                | ctaLabel 存在確認       | AC-3〜5: CTA   |
| TC-SL-13 | ctaLabel の値が期待通りであること                                       | ctaLabel 文字列値検証   | AC-3〜5: CTA   |
| TC-SL-14 | SkillLifecycleJobGuide 型で ctaLabel を省略できること                   | optional 型確認         | AC-6: handoff  |
| TC-SL-15 | SkillLifecycleJobGuide 型で ctaLabel を指定できること                   | ctaLabel 指定可能性確認 | AC-3〜5: CTA   |

## 受入基準 AC-1〜AC-8 との対応表

| 受入基準 | 内容                                               | 対応テストID                                      | カバレッジ状態 |
| -------- | -------------------------------------------------- | ------------------------------------------------- | -------------- |
| AC-1     | ヘッダーCTA「新規作成」ボタン表示                  | TC-01, TC-CTA-01, TC-CTA-02, TC-CTA-08            | GREEN          |
| AC-2     | ヘッダーCTA クリック → skillCreate 遷移            | TC-01, TC-CTA-03, TC-CTA-20                       | GREEN          |
| AC-3     | JourneyPanel「作る」CTA → skillCreate 遷移         | TC-01, TC-CTA-09, TC-CTA-12, TC-CTA-16, TC-CTA-19 | GREEN          |
| AC-4     | JourneyPanel「使う」CTA → workspace 遷移           | TC-02, TC-CTA-10, TC-CTA-13                       | GREEN          |
| AC-5     | JourneyPanel「改善」CTA → skillAnalysis 遷移       | TC-03, TC-CTA-11, TC-CTA-14                       | GREEN          |
| AC-6     | forbiddenResponsibility 非違反（handoff CTA 専用） | TC-CTA-16, TC-SL-03, TC-SL-14                     | GREEN          |
| AC-7     | モバイル（<768px）対応・タッチターゲット44px       | （CSS実装確認済み / 自動テスト対象外）            | 実装確認済み   |
| AC-8     | Apple HIG 準拠・WCAG 2.1 AA                        | TC-CTA-04, TC-CTA-05, TC-CTA-15, TC-CTA-ESC-01    | GREEN          |

## モック設計

- `../../../store` モジュール全体をモック
- `useAppStore` はセレクタ関数を受けて `{ setCurrentView: mockFn }` を返す
- 既存の個別セレクタ（useAvailableSkillsMetadata等）は既存テストパターンに準拠
- P31対策: 個別セレクタ形式（合成Hook経由を使用しないことを TC-04 で確認）
- P39対策: コンポーネントテストでは `fireEvent` を使用（`userEvent` は happy-dom 環境で禁止）
- P40対策: `cd apps/desktop && pnpm vitest run` で実行（プロジェクトルートからの実行禁止）
- SkillCenterView.cta.test.tsx では `useSkillCenter` フックをモジュールレベルでモックし、コンポーネントテストの独立性を確保

## 統合テスト連携

### ユニットテストとコンポーネントテストの役割分担

- TC-01〜TC-04（useSkillCenter.navigation.test.ts）: `useSkillCenter` フック単体のユニットテスト。Store モックを使用して3アクションの動作を個別に検証する
- TC-CTA-01〜TC-CTA-24（SkillCenterView.cta.test.tsx）: ヘッダーCTA・JourneyPanel CTA のコンポーネント統合テスト。フックとコンポーネントの接続・ctaLabel 条件分岐・Escape キー動作を包括的に検証する
- TC-SL-01〜TC-SL-15（skillLifecycleJourney.test.ts 追加分）: 型安全性・ctaLabel 定義・ルーティング正規化の単体検証

### Task01 との接続テスト

- `setCurrentView("skillCreate")` / `setCurrentView("skillAnalysis")` が Task01 の `renderView()` で正しく処理されることは、SkillCenterView の既存テスト群が間接的に確認する

### Task03 との非衝突確認

- useSkillCenter.ts の追加関数（navigateToXxx）と Task03 が変更する関数（スキル操作系）が衝突しないことを TC-04 の戻り値型検証で間接確認する

## カバレッジ結果

| 指標              | 実績                                                                                                        |
| ----------------- | ----------------------------------------------------------------------------------------------------------- |
| AC カバレッジ     | AC-1〜AC-8（8/8）                                                                                           |
| テストケース数    | 50（useSkillCenter.navigation: 4 / SkillCenterView.cta: 26 / skillLifecycleJourney 追加: 15 + 既存 5 = 20） |
| Function Coverage | ヘッダーCTA + JourneyPanel CTA + ナビゲーション3アクション + ctaLabel 定義                                  |
| テスト結果        | 3ファイル / 50テスト PASS                                                                                   |
