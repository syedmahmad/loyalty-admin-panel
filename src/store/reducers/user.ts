import {createSlice} from "@reduxjs/toolkit";

const initialState = () => {

    const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem("user") || "null") : null

    return ({
        token: typeof window !== 'undefined' ? localStorage.getItem("token") : null,
        ...(user || {}),
        user_role: user?.user_role || [],
        user_privileges: user?.user_privileges || [],
    });
}

const getPrivilegeObject = (user_privileges = [] as string[]
) =>
    user_privileges?.reduce((acc: object, item: string) => ({
        ...acc,
        [item]: true
    }), {});

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUserLogin: (state, action) => {

            const privileges = getPrivilegeObject(action.payload.user?.user_privileges)

            localStorage.setItem("token", action.payload.token);
            // Set the cookie with JavaScript for 100 years.
            document.cookie = `token=${action.payload.token}; path=/; max-age=${60 * 60 * 24 * 365 * 100}; secure; samesite=strict`;
    
            localStorage.setItem("user", JSON.stringify({...action.payload?.user, privileges}));

            return {
                ...state,
                ...(action.payload?.user || {}),
                token: action.payload.token,
                user_role: action.payload?.user?.user_role || [],
                user_privileges: action.payload?.user?.user_privileges || [],
                privileges
            }
        },
        setUserLogout: (state) => {
            state.token = null;
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            document.cookie = `token=; path=/; max-age=0; secure; samesite=strict;`;
        }
    }
})

export default userSlice.reducer;

export const {setUserLogin, setUserLogout} = userSlice.actions;