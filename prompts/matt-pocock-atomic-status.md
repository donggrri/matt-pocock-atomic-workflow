---
description: matt-pocock-atomic-workflow 진행 상태를 보고한다.
---
`matt-pocock-atomic-workflow` 스킬을 읽고 상태만 보고한다.

파일을 고치거나 커밋하지 마라. 서브에이전트를 띄우지 마라.

1. `.docs/<slug>/`(`.docs/*/`), `git worktree list` 형제 경로의 `.docs/*/`, 하네스 `docs/<slug>/`(`%USERPROFILE%/.pi/agent/matt-pocock-atomic-workflow/docs/<slug>/` 또는 Cursor `.cursor/.../docs/<slug>/`)에서 `EXPLORE-*.md`, `PLAN-*.md`, `TASKS-*.md`, `REVIEW-*.md`를 찾는다. 루트·홈에 남은 레거시 평탄 파일이 있으면 언급하되 자동 이동하지 않는다.
2. `%USERPROFILE%/.pi/agent/matt-pocock-atomic-workflow/runs/` 로그도 본다.
3. 없으면 「활성 워크플로 없음. `/matt-pocock-atomic-explore` 또는 `/matt-pocock-atomic-plan`으로 시작한다」.
4. 있으면 슬러그, 단계 상태(EXPLORE/PLAN/TASKS/REVIEW), 체크 비율, worker, 막힘, 다음에 칠 커맨드 하나만 한국어로 안내한다.
