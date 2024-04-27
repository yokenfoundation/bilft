import Styled from "styled-components";
import React from "react";
import type { ApplicationContext } from "@/context/context";
import WebApp from "@twa-dev/sdk";

const DOMProfileHeader = Styled.section`
`;

interface IProfileHeader {
  id: string;
  name?: string;
  context: ApplicationContext;
}

const ProfileHeader: React.FC<IProfileHeader> = (p) => {
  const isme = `${WebApp.initDataUnsafe.user?.id ?? ""}` === p.id;
  const name = isme ? "me" : p.name ? p.name : `id${p.id}`;
  const href = `https://t.bilft.com/?id=${p.id}`;

  return (
    <DOMProfileHeader>
      <div className="terminal-nav">
        <header className="terminal-logo">
          <div className="logo terminal-prompt">
            <a id="iuser" href={href} className="no-style">
              bilft@{name}
            </a>
          </div>
        </header>
      </div>
    </DOMProfileHeader>
  );
};

export default ProfileHeader;
