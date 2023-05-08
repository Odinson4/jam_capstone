import '../styles/globals.css';
import type { AppProps } from 'next/app'
import { useEffect, useState } from 'react'
// import Navbar from '../components/Navbar'


export default function App({ Component, pageProps }: AppProps) {

  const [currUser, setCurrUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [folders, setFolders] = useState([]);
  const [blocks, setBlocks] = useState([]);



  useEffect(() => {
    fetch('/is_logged_in')
      .then((r) => r.json())
      .then((data) => {
        setLoggedIn(data.loggedIn);
      })
      .catch((error) => {
        console.error('Error checking login status:', error);
      });
  }, []);

  useEffect(() => {
    fetch('/users')
      .then((r) => {
        if (!r.ok) {
          throw new Error(`HTTP error ${r.status}`);
        }
        return r.json();
      })
      .then((data) => {
        setUsers(data);
      })
      .catch((error) => {
        console.error('Error fetching users:', error);
      });
  }, []);

  useEffect(() => {
    fetch('/logged_user')
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Failed to fetch logged user');
        }
      })
      .then((data) => {
        setCurrUser(data);
      })
      .catch((error) => {
        console.error('Error fetching logged user:', error);
      });
  }, []);



  // useEffect(() => {
  //   fetch('/folders')
  //     .then((r) => {
  //       if (!r.ok) {
  //         throw new Error('Something went wrong')
  //       }
  //       return r.json()
  //     })
  //     .then((data) => {
  //       setFolders(data);
  //     })
  //     .catch((error) => {
  //       console.log('Error fetching folders', error)
  //     }
  //     )
  // }, [])



  return (
    <>
      <Component {...pageProps} blocks={blocks} folders={folders} currUser={currUser}
        loggedIn={loggedIn} users={users} />
    </>
  );
}