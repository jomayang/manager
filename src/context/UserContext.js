import { createContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../config/SupabaseClient';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState();
  const navigate = useNavigate();
  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: dataAuth, error: errorAuth } = await supabase.auth.getSession();
        if (dataAuth) {
          console.log('session:', dataAuth);
          if (dataAuth.session === null) navigate('/login', { replace: true });
          setUser(dataAuth.session.user);
        }
        if (errorAuth) {
          console.log('something wrong with user', errorAuth);
        }
      } catch (error) {
        console.log('error catched', error);
      }
    };
    getUser();
  }, []);
  return <UserContext.Provider value={{ user }}>{children}</UserContext.Provider>;
};
