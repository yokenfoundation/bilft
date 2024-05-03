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
    <main>
      <section>
        <div className="px-6 py-4 flex flex-row gap-5 items-center">
          <img
            src="https://img.freepik.com/free-photo/vertical-closeup-shot-grey-cat-staring-camera-with-its-green-eyes_181624-45908.jpg?size=626&ext=jpg&ga=GA1.1.553209589.1714435200&semt=ais"
            className="w-12 aspect-square rounded-full object-cover"
          />
          <div className="flex flex-col">
            <p className="font-bold font-inter text-[20px] leading-6">Jane</p>
            <p className="text-[15px] font-inter leading-[22px]">Member since Jan 2021</p>
          </div>
        </div>

        <div className="mx-4 mt-4 relative">
          <svg
            className="absolute text-accent left-0 top-0"
            width="21"
            height="20"
            viewBox="0 0 21 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 0.04006C4.46481 4.16015 5.65964 5.81985 5.65964 19.9819C20.3365 16.2557 21.9956 13.836 19.8257 7.41852C11.0669 2.45015 2.95905 -0.37397 0 0.04006Z"
              fill="currentColor"
            />
          </svg>
          <div className="px-4 py-2 rounded-3xl ml-1 bg-accent min-h-[48px]">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Molestias explicabo nam optio. Cumque minima eius
            incidunt vero, animi, quia perspiciatis dignissimos ducimus itaque quis fugiat error maxime. Molestiae, iure
            officia.
          </div>
        </div>
      </section>
      <LoadingIndicator context={context} hidden={!context.loading.active()} />
      <Profile context={context}></Profile>
    </main>
  );
};

export default Application;
