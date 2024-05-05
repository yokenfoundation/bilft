import React, { useEffect, useState, type ReactNode } from "react";
import WebApp from "@twa-dev/sdk";

import TerminalContainer from "@/components/terminalContainer";
import { type ApplicationContext } from "@/context/context";
import { useMethod } from "@/api/api";

import ProfileHeader from "@/components/profileHeader";
import ProfileDetails from "@/components/profileDetails";
import ProfileWriteForm from "@/components/profileWriteForm";
import NotesTimeline from "@/components/notesTimeline";
import { getProfileId } from "@/common";

interface IProfile {
  context: ApplicationContext;
}

const Profile: React.FC<IProfile> = (p) => {
  const [id, setID] = useState(getProfileId);
  const [data, fetch] = useMethod("/board/resolve", { value: id });

  let name: string | undefined;
  if (data && "name" in data) {
    name = data.name;
  }

  let idstr = id;
  if (idstr.startsWith("id")) {
    idstr = idstr.slice(2);
  }

  useEffect(() => {
    fetch();
  }, [id]);

  const children: ReactNode[] = [];
  children.push(<ProfileHeader id={idstr} name={name} context={p.context}></ProfileHeader>);

  if (data && "error" in data) {
    children.push(
      <section id="header-error">
        <div id="alert" className="terminal-alert terminal-alert-error"></div>
      </section>,
    );
  } else if (data) {
    WebApp.expand();

    children.push(<ProfileDetails profile={data.profile} context={p.context}></ProfileDetails>);
    children.push(<ProfileWriteForm id={idstr} context={p.context}></ProfileWriteForm>);
    children.push(<NotesTimeline board={data.id} initial={data.notes} context={p.context}></NotesTimeline>);
  }

  return <TerminalContainer {...{ context: p.context }}>{children}</TerminalContainer>;
};

export default Profile;
