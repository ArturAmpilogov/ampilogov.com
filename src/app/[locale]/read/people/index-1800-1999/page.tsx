import { redirect } from "next/navigation";
import { localizeHref } from "@/i18n/routing";
import { toLocale } from "@/i18n/config";

export default async function OldPeopleIndexRedirect({ params }: { params: Promise<{ locale: string }> }) {
  redirect(localizeHref(toLocale((await params).locale), "/people"));
}
