"use client";

import { useLayoutEffect, useRef } from "react";
import { GRAVATAR_FALLBACK_AVATAR, type ProfileData } from "@/lib/gravatar";

const DARK_CARD_CLASS = "gravatar-hovercard--dark";

type GravatarCardProps =
  | { profile: ProfileData; error?: false }
  | { profile?: undefined; error: true };

export function GravatarCard({ profile, error }: GravatarCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    let cancelled = false;

    void import("@gravatar-com/hovercards").then(({ Hovercards }) => {
      if (cancelled || !containerRef.current) {
        return;
      }

      const card = error
        ? Hovercards.createHovercardError(
            GRAVATAR_FALLBACK_AVATAR,
            "Não foi possível carregar o perfil do Gravatar.",
            { additionalClass: DARK_CARD_CLASS },
          )
        : Hovercards.createHovercard(profile, {
            additionalClass: DARK_CARD_CLASS,
          });

      containerRef.current.replaceChildren(card);
    });

    return () => {
      cancelled = true;
      container.replaceChildren();
    };
  }, [error, profile]);

  return (
    <div
      ref={containerRef}
      className="flex min-h-[273px] w-[336px] justify-center"
    />
  );
}
