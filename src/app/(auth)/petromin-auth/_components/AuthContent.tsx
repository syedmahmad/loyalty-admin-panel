"use client";

import {CircularProgress, Stack, Typography} from "@mui/material";
import AuthBackground from "@/assets/images/auth/AuthBackground";
import MainCard from "@/components/MainCard";
import {Suspense, useCallback, useEffect, useRef, useState} from "react";
import {useRouter, useSearchParams} from "next/navigation";
import {POST} from "@/utils/AxiosUtility";
import {dispatch} from "@/store";
import {setUserLogin} from "@/store/reducers";

const DEFAULT_MESSAGE = "Verifying your identity";

const AuthContent = () => {

    const router = useRouter();
    const ref = useRef<boolean>(false);

    const [state, setState] = useState({
        message: DEFAULT_MESSAGE,
        isLoading: true,
    });

    const searchParams = useSearchParams();

    const validateToken = useCallback(async () => {
        const token = searchParams.get('token');
        if (token) {
            try {
                await POST("users/validateToken", {
                    token
                },  {
                    withCredentials: true, // 👈 critical for cookies
                }).then((response: any) => {
                    setState({
                        message: "Successfully authenticated",
                        isLoading: false
                    });
                    if (response?.data?.token) {
                        dispatch(setUserLogin(response.data));
                        // localStorage.setItem('token', response.data.token);
                        setTimeout(() => {
                            router.push('/clients');    
                        }, 1000);
                    }
                }).catch((err: any) => {
                    setState({
                        message: "Failed to authenticate! Please contact to Admin.",
                        isLoading: false
                    });

                    setTimeout(() => {
                        router.push('/logout');
                    }, 1000)

                })
            } catch (error) {
                setState({
                    message: "Failed to authenticate! Please contact to Admin.",
                    isLoading: false
                });
            }
        }
    }, [])

    useEffect(() => {
        if (ref.current) {
            return;
        } else {
            (async () => await validateToken())();
            ref.current = true;
        };

    }, []);

    return (
        <Suspense>
            <Stack
                sx={{width: "100vw", height: "100vh"}}
            >
                <AuthBackground/>
                <MainCard
                    sx={{
                        width: `100%`,
                        maxWidth: "420px",
                        aspectRatio: 1,
                        margin: "auto",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <Stack sx={{
                        alignItems: "center",
                        justifyContent: "center",
                    }}>
                        {state.isLoading ? <CircularProgress size="3rem"/> : <></>}
                        <Typography
                            variant="h4"
                            sx={{mt: 2}}>
                            {state.message}
                        </Typography>
                        <Typography
                            variant="h4"
                            sx={{mt: 2}}>
                            {state.message === 'Successfully authenticated' ? 'wait... redirecting you to access app.' : null }
                        </Typography>
                    </Stack>
                </MainCard>
            </Stack>
        </Suspense>
    )
}

export default AuthContent;