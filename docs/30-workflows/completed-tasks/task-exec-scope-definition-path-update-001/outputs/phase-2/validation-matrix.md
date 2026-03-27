# Validation Matrix

| AC   | evidence                | command / review                                     |
| ---- | ----------------------- | ---------------------------------------------------- | ---------------------------------------------------------- |
| AC-1 | target path decision    | `find docs/30-workflows -name 'scope-definition.md'` |
| AC-2 | row insertion           | `rg -n "execution-capability.ts" <target>`           |
| AC-3 | existing rows preserved | `rg -n "auth-mode.ts                                 | RuntimePolicyResolver.ts" <target>`+`git diff -- <target>` |
| AC-4 | blocker policy          | Phase 3 gate / manual review                         |
