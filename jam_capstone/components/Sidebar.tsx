import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/router";

interface HomeProps {
  loggedIn: boolean;
  currUser: any;
  folders: Folder[];
}

interface Folder {
  name: string;
  blocks: any[];
}

interface User {
  id: number;
  username: string;
  email: string;
  password: string;
}

const Sidebar = ({ currUser, loggedIn }: HomeProps) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [folderMenuOpen, setFolderMenuOpen] = useState(false);
  const router = useRouter();


  const handleToggleFolderDropdown = () => {
    setFolderMenuOpen(!folderMenuOpen);
  };



  const handleToggleDropdown = () => {
    setUserMenuOpen(!userMenuOpen);
    setShowEditForm(false);
  };

  const handleLogout = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const res = await fetch("/logout", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (res.ok) {
      setUser(null);
      if (router.pathname !== "/") {
        router.push("/");
      }
    } else {
      console.error(res.status);
    }
  };

  const fetchUser = async () => {
    try {
      const res = await fetch(`/users/${currUser.id}`);
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [currUser]);

  const handleShowForm = () => {
    setShowEditForm(!showEditForm);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    const payload = {
      username: event.currentTarget.username?.value,
      // add other properties here
    };

    try {
      const res = await fetch(`/users/${currUser.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        console.log("Data was successfully updated");
        const myForm = document.getElementById("myForm") as HTMLFormElement;
        myForm.reset();
        setShowEditForm(false);
        // fetchUser();

        // Execute another fetch here
        const anotherRes = await fetch(`/users/${currUser.id}`);
        if (anotherRes.ok) {
          const anotherData = await anotherRes.json();
          // Do something with the data
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div>
      <nav className="fixed top-0 z-50 w-full bg-white border-b border-blue-800 dark:bg-blue-800 dark:border-blue-800">
        <div className="px-3 py-3 lg:px-5 lg:pl-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-start">
              <button
                data-drawer-target="logo-sidebar"
                data-drawer-toggle="logo-sidebar"
                aria-controls="logo-sidebar"
                type="button"
                className="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
              >
                <span className="sr-only">Open sidebar</span>
                <svg
                  className="w-6 h-6"
                  aria-hidden="true"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    clipRule="evenodd"
                    fillRule="evenodd"
                    d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"
                  ></path>
                  <path
                    d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"
                  ></path>
                </svg>
              </button>
              {/* <Image
                src="/images/jamhigh.png"
                alt="Logo"
                width={100}
                height={100}
                style={{ width: "80px", height: "80px", margin: "10px" }}
                className="h-10 m-3"
              /> */}
              <span className="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap dark:text-white">

              </span>
            </div>
            <div className="flex items-center">
              <div className="flex items-center ml-3">
                <div>
                  <button
                    type="button"
                    className="flex text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
                    aria-expanded="false"
                    data-dropdown-toggle="dropdown-user"
                    onClick={handleToggleDropdown} // Call handleToggleDropdown when clicked
                  >
                    <span className="sr-only">Open user menu</span>
                    <Image
                      className="w-12 h-12 rounded-full"
                      src="https://flowbite.com/docs/images/people/profile-picture-5.jpg"
                      alt="user photo"
                      width={40}
                      height={40}
                    />
                  </button>

                </div>
                <div className={`z-50 ${userMenuOpen ? 'block' : 'hidden'} my-4 text-base list-none bg-white divide-y divide-gray-100 rounded shadow dark:bg-gray-700 dark:divide-gray-600`} id="dropdown-user" style={{ position: 'absolute', top: '100%', right: 0 }}>
                  <div className="px-4 py-3" role="none">
                    <p className="text-sm text-gray-900 dark:text-white" role="none">
                      {currUser?.username}
                    </p>
                    <p className="text-sm font-medium text-gray-900 truncate dark:text-gray-300" role="none">
                      {currUser?.email}
                    </p>
                  </div>
                  <ul className="py-1" role="none">
                    <li>
                      <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white"
                        onClick={handleShowForm} // Call handleShowForm when clicked
                        role="menuitem"
                      >
                        Settings
                      </a>
                    </li>
                    {showEditForm && (
                      <form
                        id="myForm"
                        onSubmit={handleSubmit}
                        style={{ padding: "5px" }}
                      >
                        <div className="relative z-0 w-full mb-6 group">
                          <input
                            type="text"
                            name="username"
                            id="username"
                            className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                            placeholder=" "
                            required
                          />
                          <label
                            htmlFor="username"
                            className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                          >
                            Update Username
                          </label>
                        </div>

                        <div>
                          <button
                            type="submit"
                            className="w-full px-4 py-2 text-sm font-medium tracking-wide text-white capitalize transition-colors duration-200 transform bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:bg-blue-700"
                          >
                            Save
                          </button>

                        </div>
                      </form>
                    )}


                    <li>
                      <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white"
                        onClick={handleLogout}
                        role="menuitem"
                      >
                        Sign out
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <aside id="logo-sidebar" className="fixed top-0 left-0 z-40 w-64 h-screen pt-20 transition-transform -translate-x-full bg-white border-r border-blue-400 sm:translate-x-0 dark:bg-blue-800 dark:border-blue-800" aria-label="Sidebar">
        <div className="h-full px-3 pb-4 overflow-y-auto bg-white dark:bg-blue-800">
          <ul className="space-y-2 font-medium">
            <li>
              <Image
                src="/images/jamhigh.png"
                alt="Logo"
                width={100}
                height={100}
                style={{ width: "150px", height: "150px", margin: "30px", padding: "20px", border: "1px solid white", borderRadius: "10px" }}
                className="h-10 m-3"
              />
            </li>
            <li>
              <a href="#" className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
                <svg aria-hidden="true" className="w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M16.6666 5.83333H8.33328L6.66661 4.16667H3.33328C2.40661 4.16667 1.66661 4.90667 1.66661 5.83333L1.66661 14.1667C1.66661 15.0933 2.40661 15.8333 3.33328 15.8333H16.6666C17.5933 15.8333 18.3333 15.0933 18.3333 14.1667V7.5C18.3333 6.57333 17.5933 5.83333 16.6666 5.83333ZM16.6666 14.1667H3.33328V7.5H16.6666L16.6666 14.1667Z" />
                </svg>
                <span className="ml-3">Folders</span>
              </a>
              <button
                data-drawer-target="folder-sidebar"
                data-drawer-toggle="folder-sidebar"
                aria-controls="folder-sidebar"
                type="button"
                className="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
                onClick={() => setFolderMenuOpen(!folderMenuOpen)}
              >
                <span className="sr-only">Open folder menu</span>
                <svg
                  className="w-6 h-6"
                  aria-hidden="true"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    clipRule="evenodd"
                    fillRule="evenodd"
                    d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"
                  ></path>
                  <path
                    d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"
                  ></path>
                </svg>
              </button>

            </li>
          </ul>
        </div>
      </aside>
    </div>
  );
};



export default Sidebar;