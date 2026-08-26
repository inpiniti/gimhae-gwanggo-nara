"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createComment } from "@/lib/domain/comment/actions";
import { ko } from "@/lib/i18n/ko";

const t = ko.comment;

/** 비로그인 댓글 폼: 닉네임 + 비밀번호 + 내용 + honeypot (docs/domain/comment/prd.md CM-2) */
export function CommentForm({ workId }: { workId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [body, setBody] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    setError(null);
    start(async () => {
      const res = await createComment({ workId, nickname, password, body, website });
      if (res.ok) {
        toast.success(t.posted);
        setBody("");
        setPassword("");
        router.refresh();
      } else {
        setError(res.error);
      }
    });
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="flex flex-col gap-2 rounded-2xl bg-secondary p-3"
    >
      <div className="grid grid-cols-2 gap-2">
        <Input
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder={t.nickname}
          maxLength={20}
          autoComplete="nickname"
          required
          className="h-11 rounded-xl bg-card"
        />
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t.password}
          minLength={4}
          maxLength={20}
          autoComplete="new-password"
          required
          className="h-11 rounded-xl bg-card"
        />
      </div>
      {/* honeypot — 사람은 보지 못함 */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={t.placeholder}
        rows={3}
        maxLength={500}
        required
        className="rounded-xl bg-card"
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground tabular-nums">{body.length}/500</span>
        {error && <span className="text-xs text-destructive">{error}</span>}
        <button
          type="submit"
          disabled={pending}
          className="h-11 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          {pending ? t.posting : t.submit}
        </button>
      </div>
    </form>
  );
}
