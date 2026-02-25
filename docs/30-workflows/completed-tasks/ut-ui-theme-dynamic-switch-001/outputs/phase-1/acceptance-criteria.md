# Phase 1 受け入れ基準

- タスクID: UT-UI-THEME-DYNAMIC-SWITCH-001
- 作成日: 2026-02-25
- 担当: SubAgent-D

## AC-01 4モード切替

```gherkin
Scenario: 設定画面でテーマモードを変更する
  Given 設定画面が開いている
  When kanagawa-dragon / light / dark / system のいずれかを選択する
  Then store.themeMode が選択値になる
  And 必要に応じて resolvedTheme が更新される
```

## AC-02 system解決

```gherkin
Scenario: systemモードの解決
  Given themeMode が system
  When OSテーマが dark のとき
  Then resolvedTheme は dark になる
  When OSテーマが light のとき
  Then resolvedTheme は light になる
```

## AC-03 永続化と復元

```gherkin
Scenario: テーマ選択の復元
  Given electron-store に theme.mode が保存されている
  When initializeTheme を実行する
  Then 保存値が復元される
```

## AC-04 異常値フォールバック

```gherkin
Scenario: 保存値またはIPC値が不正
  Given 無効なテーマ値が返る
  When initializeTheme または setThemeMode を実行する
  Then kanagawa-dragon にフォールバックする
```

## AC-05 DOM同期

```gherkin
Scenario: テーマ適用時のDOM同期
  Given resolvedTheme が更新された
  When applyThemeToDOM が走る
  Then html[data-theme] が一致する
  And style.colorScheme が light または dark になる
```

## AC-06 IPC契約

```gherkin
Scenario: Main/Preload/Rendererで契約一致
  Given IPC_CHANNELS のテーマ関連4チャネルが定義されている
  When themeHandlers と preload types を参照する
  Then request/response 仕様が一致する
```

## AC-07 品質基準

```gherkin
Scenario: 品質ゲート
  Given テーマ関連テストを実行する
  When vitest/typecheck/eslint を実行する
  Then テスト127件がPASSする
  And typecheck/lint がPASSする
```
