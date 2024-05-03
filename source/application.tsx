import React, { useEffect } from "react";
import Profile from "./pages/profile";
import WebApp from "@twa-dev/sdk";
import LoadingIndicator from "./components/loadingIndicator";
import { useApplicationContext } from "./context/context";

const Application: React.FunctionComponent = () => {
  const context = useApplicationContext();
  useEffect(() => {
    WebApp.ready();
  }, []);

  return (
    <main className="application">
      <section className="px-6 py-4 flex flex-row gap-5 items-center">
        <img
          src="https://img.freepik.com/free-photo/vertical-closeup-shot-grey-cat-staring-camera-with-its-green-eyes_181624-45908.jpg?size=626&ext=jpg&ga=GA1.1.553209589.1714435200&semt=ais"
          className="w-12 aspect-square rounded-full object-cover"
        />
        <div className="flex flex-col">
          <p className="font-bold font-inter text-[20px] leading-6">Jane</p>
          <p className="text-[15px] font-inter leading-[22px]">Member since Jan 2021</p>
        </div>
      </section>
      <LoadingIndicator context={context} hidden={!context.loading.active()} />
      <Profile context={context}></Profile>
    </main>
  );
};

export default Application;
