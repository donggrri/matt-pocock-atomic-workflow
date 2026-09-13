---
description: g-workflow Phase 2. PLAN을 TASKS로 쪼갠 뒤 기본은 execute→review 자동.
argument-hint: "[slug | 태스크만]"
---
`atomic-pocock-workflow` 스킬과 스킬 디렉터리의 `reference.md`를 읽고 Phase 2를 수행한다. 「태스크만」이 아니면 기본 파이프라인으로 구현·리뷰까지 이어간다.

Pi 세션이다. `TASKS-*.md`가 없고 PLAN이 있으면 `subagent`로 `g-tasker`를 `async: true`로 띄운다. task 첫 줄에 `atomic-pocock-workflow`·`to-tickets` 경로를 적는다. PLAN도 없으면 Phase 1부터 기본 파이프라인. 산출물은 여전히 `TASKS-<slug>.md`다. 이슈 트래커에 올리지 마라.

슬러그/힌트: ${@:-현재 PLAN}

커밋하지 않는다. 한국어로 항목 수와 이어서 돌릴 워커를 보고한다.
