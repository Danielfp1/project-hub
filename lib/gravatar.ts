import type { ProfileData } from "@gravatar-com/hovercards";

export type { ProfileData };

export const GRAVATAR_PROFILE_SLUG = "danielfp";
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
  const response = await fetch(GRAVATAR_PROFILE_URL, {
    next: { revalidate: 3600 },
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Failed to load Gravatar profile (${response.status})`);
  }

  const data = (await response.json()) as GravatarProfileResponse;
  return mapGravatarProfile(data);
}
