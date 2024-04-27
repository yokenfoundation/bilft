import Styled from "styled-components";
import React from "react";
import type { ApplicationContext } from "@/context/context";
import WebApp from "@twa-dev/sdk";

const DOMProfileWriteForm = Styled.section`
`;

interface IProfileWriteForm {
  id: string;
  context: ApplicationContext;
}

const ProfileWriteForm: React.FC<IProfileWriteForm> = (p) => {
  let id = p.id;
  if (id.startsWith("id")) {
    id = id.slice(2);
  }

  return (
    <DOMProfileWriteForm>
      <header>
        <h3>Write a note</h3>
      </header>
      <form id="send-data">
        <div className="form-group">
          <textarea id="textarea" placeholder="Text your note here" cols={30} rows={5} name="content"></textarea>
        </div>
      </form>
    </DOMProfileWriteForm>
  );
};

export default ProfileWriteForm;
