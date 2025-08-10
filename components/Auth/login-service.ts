// components/Auth/login-service.ts
// This module handles user login functionality for the Vivo Sales Dashboard application.
// It fetches user data from the API and stores it in cookies and local storage.
import { API_AUTHORIZATION, API_BASE_URL } from "@/lib/constants";
import { VivoUser } from "@/types";

interface LoginResponse {
  "@odata.context": string;
  value: VivoUser[];
}


export const loginUser = async (username: string, password: string) => {
  try {  
    const url = `${API_BASE_URL}/Vivousers?$filter=Bitsn_UserName eq '${username}'`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${API_AUTHORIZATION}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const data: LoginResponse = await response.json();

    if (!data.value || data.value.length === 0) {
      throw new Error("User not found");
    }

    const userData = data.value[0];
    if (userData.Password && userData.Password !== password) {
      throw new Error("Invalid credentials");
    }

    storeUserData(userData);
    return userData;
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
};

export const storeUserData = (userData: VivoUser) => {
  const authData = {
    "@odata.etag": userData["@odata.etag"], 
    username: userData.Bitsn_UserName,
    name: userData.Name,
    role: userData.Role_Name,
     region: userData.Region_Name,
    region_code: userData.Region_Code,
    outlet_code: userData.Outlet_Code,
    outlet: userData.Outlet_Name,
    token: btoa(`${userData.Bitsn_UserName}:${userData.Password}`),
  };


  document.cookie = `vivoUser=${encodeURIComponent(
    JSON.stringify(authData)
  )}; path=/; max-age=${7 * 24 * 60 * 60};`;

  localStorage.setItem("vivoUser", JSON.stringify(authData));
  sessionStorage.setItem("vivoUserData", JSON.stringify(userData));
};

