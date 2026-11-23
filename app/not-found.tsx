import Link from "next/link";
import { Cup } from "@/components/Cup";

export default function NotFound() {
  return (
    <main className="login">
      <div className="panel">
        <Cup color="#9aa4b2" size={80} label="" />
        <h1>Melted.</h1>
        <p>This slushie doesn&apos;t exist, or its owner stopped sharing it.</p>
        <Link href="/" className="btn mango">Go home</Link>
      </div>
    </main>
  );
}
