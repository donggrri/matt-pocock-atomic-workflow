---
description: g-workflow Phase 1. PLAN-<slug>.md 작성. Pi에서는 g-planner 서브에이전트 사용.
argument-hint: "[intent]"
---
`~/.agents/skills/atomic-workflow/SKILL.md`를 먼저 읽고 Phase 1을 수행한다.

이건 Pi 세션이다. Cursor 전용 도구(`rename_chat`, `move_agent_to_root`)는 쓰지 마라. CLI 워커를 직접 설치하거나 `agy`/`codex`를 인자 없이 실행하지 마라.

제품 기능이면 워크스페이스 루트에 `PLAN-<slug>.md`, 워크플로 자체(g-workflow·스킬·커맨드·패키지) 수정·검토면 `~/.pi/agent/g-workflow/PLAN-<slug>.md`를 쓴다. 홈·스킬·제품 루트를 서로 혼용하지 않는다.

그 외:
1. 코드·문서·기존 PLAN/TASKS를 읽는다.
2. 범위가 한두 파일이 아니면 `subagent`로 `g-planner`를 `async: true`로 띄우고 완료를 기다린다. 작으면 이 세션에서 템플릿대로 `PLAN-<slug>.md`를 쓴다.
3. 막힌 질문(보안·범위·데이터 손실)이 있으면 구현으로 넘어가지 않는다.
4. xAI/agy 쿼터 부족은 `fallbackModels`가 처리한다. 수동으로 모델을 갈아끼우지 말고, 폴백이 실패하면 그 사실을 보고한다.

의도: ${@:-현재 대화의 요청}

커밋·푸시하지 않는다. 한국어로 요약한다.
