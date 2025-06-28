import { createContext, useState } from "react";

export const UserContext = createContext();

export default function UserContextProvider({ children }) {
  const [userID, setUserId] = useState();
  return (
    <UserContext.Provider value={{ userID, setUserId }}>
      {children}
    </UserContext.Provider>
  );
}
