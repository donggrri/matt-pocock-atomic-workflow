---
description: g-workflow Phase 2. PLAN을 TASKS-<slug>.md로 쪼갠다.
argument-hint: "[slug]"
---
`~/.agents/skills/atomic-workflow/SKILL.md`와 `reference.md`를 읽고 Phase 2를 수행한다.

Pi 세션이다. `TASKS-*.md`가 없고 PLAN이 있으면 `subagent`로 `g-tasker`를 `async: true`로 띄우고 완료를 기다린다. PLAN도 없으면 Phase 1부터 한다.

슬러그/힌트: ${@:-현재 PLAN}

구현·커밋하지 않는다. 한국어로 항목 수와 다음 커맨드를 보고한다.
