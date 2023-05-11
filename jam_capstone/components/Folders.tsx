import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import EditorBlock from "./EditorBlock";


interface HomeProps {
  loggedIn: boolean;
  currUser: any;
  folders: Folder[];

}

interface Folder {
  name: string;
  blocks: any[];
  id: number;
}

interface User {
  id: number;
  username: string;
  email: string;
  password: string;
}

const Folders = ({ currUser, folders }: HomeProps) => {
  const router = useRouter();
  const [selectedFolder, setSelectedFolder] = useState<number | null>(null);
  const [isFolderOpen, setIsFolderOpen] = useState<boolean>(false);
  const [userfolders, setUserfolders] = useState<Folder[]>([]);


  const handleToggleDropdown = () => {
    setIsFolderOpen(!isFolderOpen);
  };

  useEffect(() => {
    const user_id = currUser?.id;

    if (user_id) {
      fetch(`/folders?user_id=${user_id}`)
        .then((r) => {
          if (!r.ok) {
            throw new Error("Something went wrong");
          }
          return r.json();
        })
        .then((parsedData) => {
          setUserfolders(parsedData);
          console.log("parsedData", parsedData);
        })
        .catch((error) => {
          console.log("Error fetching blocks", error);
        });
    }
  }, [currUser]);


  // useEffect(() => {
  //   const fetchFolders = async () => {
  //     try {
  //       const res = await fetch(`/folders?userId=${currUser.id}`);
  //       if (res.ok) {
  //         const data = await res.json();
  //         setUserfolders(data.folders);
  //       }
  //     } catch (error) {
  //       console.error(error);
  //     }
  //     console.log("userfolders", userfolders);
  //     console.log("folders", folders)
  //     console.log("currUser", currUser)

  //   };
  //   fetchFolders();
  // }, []);

  const handleFolderSelect = (id: number) => {
    setSelectedFolder(id);
  };

  return (
    <li>
      {folders.map((folder) => (
        <li key={folder.id}>
          <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white" onClick={() => handleFolderSelect(folder.id)}>
            <i className="far fa-folder"></i>
            {folder.name}
          </a>
        </li>
      ))}
    </li>
  );
};

export default Folders;
