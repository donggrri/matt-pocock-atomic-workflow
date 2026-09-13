---
description: g-workflow Phase 1. PLAN 작성 후 막힌 질문 없으면 task→execute→review 자동.
argument-hint: "[intent | 계획만]"
---
`atomic-workflow` 스킬을 먼저 읽고 Phase 1을 수행한 뒤, 막힌 질문이 없으면 기본 파이프라인으로 나머지를 자동 진행한다.

이건 Pi 세션이다. Cursor 전용 도구(`rename_chat`, `move_agent_to_root`)는 쓰지 마라. CLI 워커를 직접 설치하거나 `agy`/`codex`를 인자 없이 실행하지 마라.

제품 기능이면 워크스페이스 루트에 `PLAN-<slug>.md`, 워크플로 자체(g-workflow·스킬·커맨드·패키지) 수정·검토면 `~/.pi/agent/g-workflow/PLAN-<slug>.md`를 쓴다. 홈·스킬·제품 루트를 서로 혼용하지 않는다.

그 외:
1. 코드·문서·기존 EXPLORE/PLAN/TASKS를 읽는다. `EXPLORE-*.md`가 있으면 사전 탐색 결과를 계획에 즉시 반영한다.
2. 사용자가 이미 계획을 줬거나 `PLAN-*.md`가 있으면 저장/재사용하고 `g-planner`를 건너뛴다. 아니면 `subagent`로 `g-planner`를 `async: true`로 띄운다. task 첫 줄에 `atomic-workflow`·`codebase-design` 경로를 적는다. 사용자를 그릴하지 마라.
3. 막힌 질문(보안·범위·데이터 손실)이 있거나 인자에 「계획만」이 있으면 구현으로 넘어가지 않는다.
4. 그 외에는 SKILL의 **기본 파이프라인**대로 `g-tasker` → 항목별 `g-worker` → `g-reviewer`를 `async: true`로 이어서 띄운다. 항목 `done`은 이 세션이 다시 실행한다.
5. xAI/agy 쿼터 부족은 `fallbackModels`가 처리한다. 수동으로 모델을 갈아끼우지 말고, 폴백이 실패하면 그 사실을 보고한다.

의도: ${@:-현재 대화의 요청}

커밋·푸시하지 않는다. 한국어로 요약한다.
