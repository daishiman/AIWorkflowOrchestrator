# Phase 6: 回帰拡張計画

## メタ情報

| 項目     | 内容                                                      |
| -------- | --------------------------------------------------------- |
| タスクID | TASK-IMP-EXECUTION-RESPONSIBILITY-CONTRACT-FOUNDATION-001 |
| Phase    | 6                                                         |
| 作成日   | 2026-03-20                                                |

## 回帰テスト設計（禁止事項の regression test）

### R-1: silent fallback 検出

- **入力**: subscription 未認証 + API Key null（capability = none を導出する条件）
- **検証**: `RuntimePolicyResolver.resolve()` の返り値が `"none"` であること
- **失敗パターン**: `"integrated_api"` / `"integratedRuntime"` / `"terminal_handoff"` / `"terminalSurface"` が返された場合を回帰とする
- **コードパス**: `RuntimePolicyResolver.ts` L57-80

### R-2: auto-send 検出

- **入力**: capability = terminalSurface で terminal handoff が発生したとき、ユーザー操作なしで送信が実行されないことを確認
- **検証**: `TerminalHandoffBuilder.build()` の呼び出しがユーザー UI イベント（click / keypress）に紐づいていること
- **失敗パターン**: IPC 送信ハンドラが自動実行された場合（ユーザーイベントなしで `build()` が呼ばれた場合）を回帰とする
- **コードパス**: `TerminalHandoffBuilder.ts` L36-54

### R-3: hidden injection 検出

- **入力**: ユーザー入力テキスト「テスト送信」のみを持つ handoff bundle を生成する
- **検証**: bundle の `promptBundle` フィールドがユーザー入力テキスト（sanitize 後）のみを含むこと
- **失敗パターン**: システムプロンプト・hidden context・metadata が bundle に混入した場合を回帰とする
- **コードパス**: `TerminalHandoffBuilder.ts` L36-54, L111-118

### R-4: no-op CTA 検出（FR-3 追加分）

- **入力**: capability = none, uiState = blocked の状態で CTA コンポーネントを描画
- **検証**: primary CTA がクリック可能であり、クリック時に settings 画面遷移が実行されること
- **失敗パターン**: primary CTA が `disabled` 属性を持つ、または `onClick` ハンドラが空 / noop である場合を回帰とする
- **コードパス**: CTA コンポーネント（Task03 以降で実装）

## 性能・安定性観点

### P31/P48 対策: capability 再計算による不要な再レンダー防止

- **検証方法**: `renderCount` をカウントするテストラッパーを使用し、AuthModeStatus が同値で更新された場合（例: capability = integratedRuntime -> integratedRuntime）に Renderer コンポーネントが再レンダーしないことを確認する
- **対策パターン**: `.filter()` / `.map()` を返す派生セレクタには `useShallow` を適用する

### P5 対策: IPC リスナー二重登録防止

- **検証方法**: capability 変更イベントのリスナー登録関数を 2 回連続で呼び出し、登録カウントが 1 のままであることを確認する
- **対策パターン**: モジュールレベルの登録済みフラグでガードする

### P42 対策: API Key 空文字列 / スペースのみバリデーション

- **検証方法**: API Key が `""` / `"   "` / `null` の場合に capability が `none` となることを確認する
- **対策パターン**: `typeof === "string" && apiKey.trim() !== ""` の 3 段バリデーション

## Phase 7 への未到達ケースの明示

以下のケースは Phase 6 で設計済みだが、Phase 7 の coverage gate で未到達と判定される可能性がある:

| ケース   | 理由                                                 | Phase 7 での対応                        |
| -------- | ---------------------------------------------------- | --------------------------------------- |
| E-3      | API Key 不正形式の期待動作が Phase 2 で未確定        | Phase 9 で Phase 2 設計書を参照して確定 |
| E-5, E-6 | IPC timeout の mock 実装が Phase 6 時点で未作成      | Phase 9 で vi.useFakeTimers を使用      |
| R-2      | auto-send 検証が UI イベント依存（E2E テストが必要） | Phase 9 で Playwright 補完を検討        |
