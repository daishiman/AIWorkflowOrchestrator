# Phase 3 トレーサビリティ表

| AC    | Phase 1                               | Phase 2                                                   | 実装対象                                  | 検証対象                          |
| ----- | ------------------------------------- | --------------------------------------------------------- | ----------------------------------------- | --------------------------------- |
| AC-01 | `requirements-definition.md` FR-01/04 | `architecture-design.md`, `ui-state-matrix.md`            | `HistorySearchView` / timeline components | view test / screenshot            |
| AC-02 | FR-02/03                              | `architecture-design.md`                                  | `HistorySearchBar`                        | view test                         |
| AC-03 | FR-05/06                              | `navigation-link-matrix.md`, `timeline-grouping-rules.md` | chat/file/skill cards                     | view test / manual                |
| AC-04 | FR-11/12/13/14                        | `data-contract-delta.md`                                  | slice / handler / preload types           | slice test / IPC test / typecheck |
| AC-05 | NFR-01〜06                            | `ui-state-matrix.md`                                      | observer hook / empty/error states        | hook test / a11y / screenshot     |
| AC-06 | Phase 1 sources                       | `aiworkflow-spec-extraction-matrix.md`                    | Phase 12 docs sync                        | validators / doc review           |
