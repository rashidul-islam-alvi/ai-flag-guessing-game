import Chat from "@/components/chat";
import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen">
      <h1 className="text-3xl font-bold text-center py-6">Flag Identifier</h1>
      <Chat />
    </main>
  );
}
