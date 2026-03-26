# UT-SC-02-005: Preload execute 戻り値型更新 実装ガイド

## Part 1: 中学生でもわかる説明

### なぜ必要か

Preload は、画面側とアプリの裏側の間にある受付窓口のような役目です。たとえば、受付が「この箱には本しか入りません」と説明しているのに、実際には「本か、端末で続きの作業をしてほしい案内」のどちらかが届くと、受け取る側は想定外の箱をうまく扱えません。

今回の問題はまさにそれで、Main 側は `executePlan` の結果として「通常成功」だけでなく `terminal_handoff` という別パターンも返せるようになっていたのに、Preload 側の型説明だけが古いままでした。これだと Renderer 側が安全に分岐できず、後から型ずれが再発しやすくなります。

### 何をしたか

受付窓口である Preload の説明書を、「通常成功だけでなく `terminal_handoff` も返る」と正しく書き直しました。さらに受け取り側の Renderer に「もし `terminal_handoff` が来たら、通常完了の後続処理には進まず、専用の扱いをする」という判定ルールを追加しました。

その結果、Main、Preload、Renderer の3か所が同じ説明書を参照する形になり、途中のどこかだけ古い型に戻る事故を防ぎやすくなりました。

## Part 2: 技術的詳細

### 変更した契約

- shared 型の正本: `RuntimeSkillCreatorExecuteResponse`
- Preload `executePlan`: `Promise<IpcResult<RuntimeSkillCreatorExecuteResponse>>`
- Renderer `executePlan`: shared union 型をそのまま受け取り、型ガードで分岐

### 型ナロイングの実装

`SkillLifecyclePanel.tsx` に `isExecuteTerminalHandoff()` を追加し、`terminal_handoff` 分岐を明示した。これにより、早期リターン後の通常成功パスでは `skillName` など通常レスポンス用プロパティを安全に扱える。

### 変更ファイル一覧

| ファイル                                                                                           | 役割                                                                |
| -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `apps/desktop/src/preload/skill-creator-api.ts`                                                    | Preload 側 `executePlan` の戻り値型を shared union に更新           |
| `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                               | execute response の型ガード追加、Renderer ローカル execute 型の解消 |
| `apps/desktop/src/preload/__tests__/skill-creator-api.runtime.test.ts`                             | 実 bundle shape と失敗 envelope のテスト追加                        |
| `apps/desktop/src/preload/__tests__/skill-creator-api.test.ts`                                     | 関連 Preload API の委譲契約テスト追加                               |
| `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx` | `terminal_handoff` / `success:false` / 空 data fallback を検証      |

### 検証結果

| チェック              | 結果                                       |
| --------------------- | ------------------------------------------ |
| 対象4ファイルのテスト | 54/54 PASS                                 |
| TypeScript            | PASS                                       |
| ESLint                | PASS                                       |
| Coverage              | Line 89.56 / Branch 80.88 / Function 88.88 |

### 補足

- `terminal_handoff` 専用 UI の追加は本タスク外であり、follow-up として `UT-SC-02-006` に切り出した。
- 画面見た目の変更はないため、Phase 11 では実画面キャプチャを実施していない。一方で validator 整合用の証跡として `outputs/phase-11/screenshots/non-visual-placeholder.png` を保存し、理由は `outputs/phase-11/manual-test-report.md` と `outputs/phase-11/screenshots/README.md` に記録した。
