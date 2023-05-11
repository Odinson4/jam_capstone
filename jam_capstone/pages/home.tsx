import type { NextPage } from "next";
import dynamic from "next/dynamic";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import 'tailwindcss/tailwind.css';



const EditorBlock = dynamic(() => import("../components/EditorBlock"), {
  ssr: false,
});

interface HomeProps {
  currUser: any;
  loggedIn: boolean;
}

const Home: NextPage<HomeProps> = ({ currUser, loggedIn }) => {
  const [data, setData] = useState<any | undefined>();

  return (
    <>
      <div>
        <Sidebar
          loggedIn={loggedIn}
          currUser={currUser}
        />
        <EditorBlock
          data={data}
          onChange={setData}
          currUser={currUser}
          holder="editorjs-container"
        />
      </div>
    </>

  );
};


export default Home;
