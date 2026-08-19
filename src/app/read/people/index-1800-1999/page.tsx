import { redirect } from "next/navigation";

export default function OldPeopleIndexRedirect() {
  redirect("/people");
}
