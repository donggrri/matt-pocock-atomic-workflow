---
description: atomic-pocock-workflow 진행 상태를 보고한다.
---
`atomic-pocock-workflow` 스킬을 읽고 상태만 보고한다.

파일을 고치거나 커밋하지 마라. 서브에이전트를 띄우지 마라.

1. 현재 루트와 `git worktree list` 형제 경로에서 `EXPLORE-*.md`, `PLAN-*.md`, `TASKS-*.md`, `REVIEW-*.md`를 찾는다.
2. `%USERPROFILE%/.pi/agent/atomic-pocock-workflow/runs/` 로그도 본다.
3. 없으면 「활성 워크플로 없음. `/g-explore` 또는 `/g-plan`으로 시작한다」.
4. 있으면 슬러그, 단계 상태(EXPLORE/PLAN/TASKS/REVIEW), 체크 비율, worker, 막힘, 다음에 칠 커맨드 하나만 한국어로 안내한다.
