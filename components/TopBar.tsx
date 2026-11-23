import Link from "next/link";
import { Cup } from "./Cup";
import { LogoutButton } from "./LogoutButton";

export function TopBar({ owner }: { owner: boolean }) {
  return (
    <header>
      <div className="topbar">
        <div className="wrap">
          <Link href="/" className="logo">
            <Cup color="#b6f03c" size={30} label="" />
            <span>SLUSH CLUB</span>
          </Link>
          {owner && <LogoutButton />}
        </div>
      </div>
      <svg className="drip" viewBox="0 0 1200 38" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 0 H1200 V8 C1170 8 1168 30 1150 30 C1132 30 1134 8 1100 8 C1050 8 1060 22 1030 22 C1000 22 1010 8 960 8 C930 8 935 34 910 34 C885 34 890 8 860 8 C800 8 820 18 790 18 C760 18 770 8 720 8 C690 8 700 28 670 28 C640 28 650 8 600 8 C560 8 570 20 545 20 C520 20 530 8 480 8 C450 8 455 32 430 32 C405 32 410 8 380 8 C330 8 345 18 315 18 C285 18 300 8 250 8 C220 8 225 26 200 26 C175 26 180 8 150 8 C110 8 120 18 95 18 C70 18 80 8 40 8 C20 8 0 8 0 8 Z" />
      </svg>
    </header>
  );
}
