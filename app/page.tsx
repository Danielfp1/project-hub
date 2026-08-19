import { GravatarCard } from "@/components/GravatarCard";
import { getGravatarProfile } from "@/lib/gravatar";

export const revalidate = 3600;

export default async function Home() {
  try {
    const profile = await getGravatarProfile();

    return (
      <main className="flex min-h-full flex-1 items-center justify-center p-6">
        <GravatarCard profile={profile} />
      </main>
    );
  } catch {
    return (
      <main className="flex min-h-full flex-1 items-center justify-center p-6">
        <GravatarCard error />
      </main>
    );
  }
}
