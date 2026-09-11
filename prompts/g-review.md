---
description: g-workflow Phase 4. REVIEW-<slug>.md 작성과 테스트 대조.
argument-hint: "[slug]"
---
`~/.agents/skills/atomic-workflow/SKILL.md`와 `testing.md`를 읽고 Phase 4를 수행한다.

Pi 세션이다. 남은 구현이 있으면 리뷰 전에 그 사실을 말한다. 그 외에는 `subagent`로 `g-reviewer`를 `async: true`로 띄우고 완료를 기다린다.

대상: ${@:-현재 TASKS}

실패한 테스트나 의미 있는 survived mutation을 통과로 쓰지 마라. 커밋하지 마라. 다음이 커밋이면 `/g-commit`을 안내한다.
