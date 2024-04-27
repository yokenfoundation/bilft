import Styled from "styled-components";
import React from "react";
import type { ApplicationContext } from "@/context/context";
import WebApp from "@twa-dev/sdk";
import type model from "@/api/model";

const DOMProfileDetails = Styled.section`
  margin-bottom: var(--global-line-height);
`;

interface IProfileDetails {
  profile?: model.BoardProfile;
  context: ApplicationContext;
}

const ProfileDetails: React.FC<IProfileDetails> = (p) => {
  const profile = p.profile;
  if (!profile) {
    return <DOMProfileDetails></DOMProfileDetails>;
  }

  return (
    <DOMProfileDetails>
      <div className="terminal-alert">
        <div className="terminal-media">
          <div className="terminal-media-left">
            <div className="terminal-avatarholder">
              <img id="header-profile-avatar" src={profile.photo ?? ""} width="50" height="50" alt="Avatar" />
            </div>
          </div>
          <div className="terminal-media-body">
            <div className="terminal-media-heading">{profile.title}</div>
            <div className="terminal-media-content">{profile.description ?? ""}</div>
          </div>
        </div>
      </div>
    </DOMProfileDetails>
  );
};

export default ProfileDetails;
