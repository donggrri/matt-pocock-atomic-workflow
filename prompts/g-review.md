---
description: matt-pocock-atomic-workflow Phase 4. REVIEW-<slug>.md 작성과 테스트 대조.
argument-hint: "[slug]"
---
`matt-pocock-atomic-workflow` 스킬과 스킬 디렉터리의 `testing.md`를 읽고 Phase 4를 수행한다.

Pi 세션이다. 남은 구현이 있으면 기본 파이프라인으로 그 항목부터 돌린 다음 리뷰한다. 그 외에는 `subagent`로 `g-reviewer`를 `async: true`로 띄운다. task 첫 줄에 `matt-pocock-atomic-workflow`·`code-review` 경로를 적는다. 손자 에이전트를 시키라고 하지 마라. 산출물은 여전히 `REVIEW-<slug>.md`다.

대상: ${@:-현재 TASKS}

실패한 테스트나 의미 있는 survived mutation을 통과로 쓰지 마라. 커밋하지 마라. 다음이 커밋이면 `/g-commit`을 안내한다.
