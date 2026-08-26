# comment — 도메인 개요

## 정의

**댓글(Comment)** 은 방문자가 특정 작업물(Work)에 남기는 짧은 글이다. 로그인 없이 닉네임+비밀번호로 작성/삭제하며, 사장님은 관리자 권한으로 답글·숨김·삭제한다.

## 분류

**지원 도메인(Supporting)**. 핵심은 아니지만 후기·소통 콘텐츠로 SEO와 신뢰도에 기여.

## 유비쿼터스 언어

| 용어 | 정의 |
|---|---|
| Comment | 댓글 엔티티. Work에 종속 |
| Author | 닉네임 + 비밀번호(해시). 계정 아님 |
| Owner Reply | `is_owner = true`. 관리자가 작성. "광고나라" 뱃지 |
| Hidden | 관리자가 숨김. 목록에서 제외, 데이터는 보존 |
| Rate Limit | 같은 IP 해시로 1분 3건, 1일 30건 |
| Honeypot | 봇 탐지용 숨김 필드. 값이 있으면 조용히 거부 |

## 애그리거트

```
Comment (root, 독립 애그리거트 — Work와 별도 트랜잭션)
├─ id, workId
├─ nickname (1~20자)
├─ passwordHash (bcrypt, 비로그인 작성자만)
├─ body (1~500자, 플레인 텍스트)
├─ isOwner
├─ isHidden
├─ ipHash (sha256(ip + salt), 30일 후 null 처리 가능)
└─ createdAt
```

### 불변식
1. `isOwner = true` 인 댓글은 `passwordHash`가 null (관리자 세션으로만 삭제).
2. `isOwner = false` 인 댓글은 `passwordHash` 필수.
3. `body`는 HTML 불허 — 저장 시 플레인 텍스트, 렌더 시 escape + 줄바꿈만 유지.
4. 대댓글(스레드) 없음. 답글은 동일 목록에 시간순으로 표시.

## 유스케이스

| 유스케이스 | 액터 | 규칙 |
|---|---|---|
| `listComments(workId)` | 공개 | `isHidden = false`, 오래된 순(대화 흐름) |
| `createComment(workId, nickname, password, body, honeypot)` | 방문자 | honeypot 비어있음, rate limit, zod 검증, bcrypt 해시, Work가 published |
| `deleteOwnComment(id, password)` | 방문자 | bcrypt 검증 성공 시 hard delete |
| `replyAsOwner(workId, body)` | 관리자 | `isOwner = true` |
| `hideComment(id)` / `unhideComment(id)` | 관리자 | |
| `deleteComment(id)` | 관리자 | hard delete |

## 도메인 이벤트
| 이벤트 | 소비자 |
|---|---|
| `CommentCreated` | `/works/[slug]` revalidate, (v2) 사장님 알림 |
| `CommentDeleted` / `CommentHidden` | revalidate |

## 관계
- → work: `work_id` FK, cascade delete. published가 아닌 Work엔 작성 불가.
- → admin: 관리자 유스케이스 가드.

## 보안 정책
- 쓰기는 모두 **서버 액션**(service role) 경유. anon 키로 직접 insert 불가.
- 비밀번호는 bcrypt cost 10. 평문 로그 금지.
- IP는 해시로만 저장. 원문 IP 저장 안 함.
- 스팸 심화 시 Cloudflare Turnstile 추가 (옵션 플래그).
