# Phase 10 MINOR 指摘一覧

- 作成日: 2026-03-20
- 対応方針: 全件を未タスク仕様書に変換して Phase 11 へ進む（05-task-execution.md MINOR 対応規則準拠）

---

## 指摘一覧

### M-1: SkillAnalysisView「選択を適用」ボタンへの aria-label 追加

- ファイル: `apps/desktop/src/renderer/components/skill/SkillAnalysisView.tsx` L148
- 内容: `<button onClick={handleApplySelected} disabled={...}>選択を適用</button>` に `aria-label` が未付与
- 機能影響: なし（スクリーンリーダーはテキスト「選択を適用」を読み上げる）
- 推奨対応: `aria-label="選択を適用"` を追加

---

### M-2: SkillAnalysisView「全自動改善」ボタンへの aria-label 追加

- ファイル: `apps/desktop/src/renderer/components/skill/SkillAnalysisView.tsx` L157
- 内容: `<button onClick={handleAutoImprove} disabled={...}>全自動改善</button>` に `aria-label` が未付与
- 機能影響: なし
- 推奨対応: `aria-label="全自動改善"` を追加

---

### M-3: SkillAnalysisView エラー時「再試行」ボタンへの aria-label 追加

- ファイル: `apps/desktop/src/renderer/components/skill/SkillAnalysisView.tsx` L115
- 内容: エラー状態の `<button onClick={handleAnalyze}>再試行</button>` に `aria-label` が未付与
- 機能影響: なし
- 推奨対応: `aria-label="再試行"` を追加

---

### M-4: AgentView「インポート」ボタンへの aria-label 追加

- ファイル: `apps/desktop/src/renderer/views/AgentView/index.tsx` L132
- 内容: `AgentHeader` 内の `<button type="button" onClick={onImportClick}>インポート</button>` に `aria-label` が未付与
- 機能影響: なし（テキスト「インポート」が visible）
- 推奨対応: `aria-label="スキルをインポート"` を追加（より具体的な説明が望ましい）

---

### M-5: App.tsx の console.log 残存（タスクスコープ外）

- ファイル: `apps/desktop/src/renderer/App.tsx` L67
- 内容: `console.log("🔍 [App] Initializing auth...")` が本番コードに残存（P20 パターン）
- 機能影響: なし（ログ汚染のみ）
- 推奨対応: 別タスクで `process.env.NODE_ENV !== 'production'` ガードまたは削除
- 備考: タスクスコープ外の既存コードのため今回タスクでの修正は対象外

---

### M-6: App.tsx の useAppStore 直接インライン使用（タスクスコープ外）

- ファイル: `apps/desktop/src/renderer/App.tsx` L58-82
- 内容: `useAppStore((state) => state.xxx)` の直接呼び出しが多数存在。個別セレクタ（P31 対応パターン）との不統一
- 機能影響: なし（`useEffect` 依存配列への直接含有がなく無限ループは発生しない）
- 推奨対応: 別タスクで App.tsx の store アクセスを個別セレクタに移行
- 備考: タスクスコープ外の既存コードのため今回タスクでの修正は対象外

---

### M-7: viewHistory 蓄積による localStorage データ肥大（設計上の注意点）

- 関連コード: `apps/desktop/src/renderer/store/slices/navigationSlice.ts` L38-45
- 内容: AgentView ↔ skillAnalysis の `setCurrentView("agent")` 往復により viewHistory が無限に push される。`persist` の `partialize` 対象に `currentView` は含まれるが `viewHistory` は含まれないため、実際には localStorage には保存されない（persist 対象外）。ただし セッション中のメモリ上の蓄積は続く。
- 機能影響: なし（`length-2` 参照の正確性には影響しない）
- 推奨対応: viewHistory に上限（例: 最大50件）を設けるか、`goBack()` 使用時のみに蓄積を制限する設計変更を検討
- 備考: 機能影響がないため優先度低

---

## 対応方針サマリー

| ID  | 優先度              | 今回タスク対応 | 未タスク化 |
| --- | ------------------- | -------------- | ---------- |
| M-1 | 低（best practice） | 不要           | 推奨       |
| M-2 | 低（best practice） | 不要           | 推奨       |
| M-3 | 低（best practice） | 不要           | 推奨       |
| M-4 | 低（best practice） | 不要           | 推奨       |
| M-5 | 低（スコープ外）    | 対象外         | 推奨       |
| M-6 | 低（スコープ外）    | 対象外         | 推奨       |
| M-7 | 低（機能影響なし）  | 不要           | 要検討     |

全 MINOR 指摘は機能影響なし。05-task-execution.md の規則に従い、全件を未タスク仕様書に変換した後、Phase 11 へ進む。
