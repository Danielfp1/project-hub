import type { ProfileData } from "@gravatar-com/hovercards";

export type { ProfileData };

export const GRAVATAR_PROFILE_SLUG = "danzfigueiredo";
const GRAVATAR_PROFILE_URL = `https://api.gravatar.com/v3/profiles/${GRAVATAR_PROFILE_SLUG}`;
export const GRAVATAR_FALLBACK_AVATAR =
  "https://0.gravatar.com/avatar/beffe9caedeb68d727bdbe98714b3cd426f92172a3bc339ea7a1a3fe91f254e4?s=256";

interface GravatarVerifiedAccount {
  service_type: string;
  service_label: string;
  service_icon: string;
  url: string;
  is_hidden: boolean;
}

interface GravatarProfileResponse {
  hash: string;
  avatar_url: string;
  profile_url: string;
  display_name: string;
  location?: string;
  description?: string;
  job_title?: string;
  company?: string;
  header_image?: string;
  hide_default_header_image?: boolean;
  background_color?: string;
  verified_accounts?: GravatarVerifiedAccount[];
  contact_info?: ProfileData["contactInfo"];
  payments?: ProfileData["payments"];
}

/** Snapshot local; usado quando a API falha. Atualizar manualmente se o perfil mudar. */
const GRAVATAR_PROFILE_SNAPSHOT: GravatarProfileResponse = {
  hash: "beffe9caedeb68d727bdbe98714b3cd426f92172a3bc339ea7a1a3fe91f254e4",
  display_name: "Daniel Figueiredo Pereira",
  profile_url: "https://gravatar.com/danzfigueiredo",
  avatar_url:
    "https://0.gravatar.com/avatar/beffe9caedeb68d727bdbe98714b3cd426f92172a3bc339ea7a1a3fe91f254e4",
  location: "Goiânia, Goiás, Brasil",
  description: "Desenvolvedor",
  job_title: "Desenvolvedor Web",
  company: "",
  header_image:
    "url('https://2.gravatar.com/userimage/19726103/3555e4dfe322d74f57a6c7db903ca72c?size=1024') no-repeat 50% 79% / 100%",
  hide_default_header_image: false,
  background_color: "#2e3440",
  verified_accounts: [
    {
      service_type: "bluesky",
      service_label: "Bluesky",
      service_icon: "https://gravatar.com/icons/bluesky.svg",
      url: "https://bsky.app/profile/dan-figueiredo.dev.br",
      is_hidden: false,
    },
    {
      service_type: "github",
      service_label: "GitHub",
      service_icon: "https://gravatar.com/icons/github.svg",
      url: "https://github.com/Danielfp1",
      is_hidden: false,
    },
    {
      service_type: "gitlab",
      service_label: "GitLab",
      service_icon: "https://gravatar.com/icons/gitlab.svg",
      url: "https://gitlab.com/Danielfp1",
      is_hidden: false,
    },
    {
      service_type: "linkedin",
      service_label: "LinkedIn",
      service_icon: "https://gravatar.com/icons/linkedin.svg",
      url: "https://www.linkedin.com/in/danielfp1",
      is_hidden: false,
    },
  ],
  contact_info: {
    email: "danielfp.pc@gmail.com",
  },
  payments: {
    links: [
      {
        label: "PayPal",
        url: "https://www.paypal.com/donate/?hosted_button_id=D9NLNSTRYPJBL",
      },
    ],
    crypto_wallets: [],
  },
};

export function mapGravatarProfile(data: GravatarProfileResponse): ProfileData {
  const avatarUrl = data.avatar_url.includes("?")
    ? data.avatar_url
    : `${data.avatar_url}?s=256`;

  return {
    hash: data.hash,
    avatarUrl,
    profileUrl: data.profile_url,
    displayName: data.display_name,
    location: data.location,
    description: data.description,
    jobTitle: data.job_title,
    company: data.company,
    headerImage: data.header_image,
    hideDefaultHeaderImage: data.hide_default_header_image,
    backgroundColor: data.background_color,
    verifiedAccounts: data.verified_accounts?.map((account) => ({
      type: account.service_type,
      label: account.service_label,
      icon: account.service_icon,
      url: account.url,
      isHidden: account.is_hidden,
    })),
    contactInfo: data.contact_info,
    payments: data.payments,
  };
}

export async function getGravatarProfile(): Promise<ProfileData> {
  try {
    const response = await fetch(GRAVATAR_PROFILE_URL, {
      next: { revalidate: 3600 },
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Failed to load Gravatar profile (${response.status})`);
    }

    const data = (await response.json()) as GravatarProfileResponse;
    return mapGravatarProfile(data);
  } catch {
    return mapGravatarProfile(GRAVATAR_PROFILE_SNAPSHOT);
  }
}
