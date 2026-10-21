import type { Metadata } from "next";
import { PublicChat } from "./PublicChat";

export const metadata: Metadata = { title: "Talk to Mavi · meduSAAS" };

export default function TalkPage() {
  return <PublicChat />;
}
