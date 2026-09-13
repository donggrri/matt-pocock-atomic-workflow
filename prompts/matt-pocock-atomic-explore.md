---
description: matt-pocock-atomic-workflow Phase 0. 코드베이스 및 기술 사전 탐색 후 EXPLORE-<slug>.md 작성.
argument-hint: "[intent | 탐색 주제]"
---
`matt-pocock-atomic-workflow` 스킬을 먼저 읽고 Phase 0(탐색/Recon)을 수행한다.

이건 Pi 세션이다. Cursor 전용 도구(`rename_chat`, `move_agent_to_root`)는 쓰지 마라. CLI 워커를 직접 설치하거나 `agy`/`codex`를 인자 없이 실행하지 마라.

제품 기능이면 워크스페이스 루트에 `EXPLORE-<slug>.md`, 워크플로 자체(matt-pocock-atomic-workflow·스킬·커맨드·패키지) 수정·검토면 `~/.pi/agent/matt-pocock-atomic-workflow/EXPLORE-<slug>.md`를 쓴다. 홈·스킬·제품 루트를 서로 혼용하지 않는다.

그 외:
1. 기존 코드, 문서, 설정, 기존 `EXPLORE-*.md` / `PLAN-*.md`를 확인한다.
2. 사용자의 탐색 주제나 의도를 바탕으로 `subagent`로 `explorer`를 `async: true`로 띄운다. task 첫 줄에 `matt-pocock-atomic-workflow` 경로를 적는다.
3. `explorer`가 대상 파일, 핵심 코드/인터페이스, 아키텍처 흐름, 리스크를 분석하여 `EXPLORE-<slug>.md`를 작성한다.
4. 코드를 수정하거나 커밋·푸시하지 않는다.
5. xAI/agy 쿼터 부족은 `fallbackModels`가 처리한다. 폴백이 실패하면 그 사실을 보고한다.
6. 완료 후 탐색 결과 핵심을 한국어로 요약하고, 이어서 `/matt-pocock-atomic-plan`을 실행할 수 있도록 안내한다.

의도: ${@:-현재 대화의 요청}

한국어로 요약한다.
