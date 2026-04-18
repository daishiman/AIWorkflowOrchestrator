# Phase 7 Output: トレーサビリティレポート

## 要件 → 設計 → テスト → 実装

| 要件（AC）                    | 設計（Phase 2）                   | テスト（Phase 4）  | 実装（Phase 5）            |
| ----------------------------- | --------------------------------- | ------------------ | -------------------------- |
| AC-1: 13 phase 骨格           | validation-and-regenerate-plan.md | validator コマンド | — (仕様書側で解消)         |
| AC-2: 4分類 MECE              | merge-policy-matrix.md            | TC-4-02            | .gitattributes             |
| AC-3: custom/built-in 整合    | merge-policy-matrix.md            | TC-4-01            | setup-merge-drivers.sh     |
| AC-4: canonical/mirror        | subagent-lane-plan.md             | TC-4-04            | — (follow-up)              |
| AC-5: deterministic topic-map | validation-and-regenerate-plan.md | TC-4-03            | generate-index.js 日付除去 |
| AC-6: EVALS schema 不変       | merge-policy-matrix.md G4         | TC-4-05            | consumer-audit-decision.md |
