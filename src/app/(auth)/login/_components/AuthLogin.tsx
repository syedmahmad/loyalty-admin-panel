'use client';

import React, {useCallback} from 'react';
import Link from 'next/link';

// material-ui
import {Button, Checkbox, FormControlLabel, Grid, Stack, Typography} from '@mui/material';

// third party

// project import
import AnimateButton from '@/components/@extended/AnimateButton';
import {useRouter} from "next/navigation";

// assets

// ============================|| JWT - LOGIN ||============================ //

const AuthLogin = () => {
    // const [checked, setChecked] = React.useState(false);

    const router = useRouter()

    const [showPassword, setShowPassword] = React.useState(false);
    // const handleClickShowPassword = () => {
    //     setShowPassword(!showPassword);
    // };

    // const handleMouseDownPassword = (event: React.SyntheticEvent) => {
    //     event.preventDefault();
    // };

    const onLoginButtonClickHandler = useCallback(() => {
        const url = new URL(process.env.NEXT_PUBLIC_CENTRALIZED_LOGIN_URL as string);
        url.searchParams.set('redirectUri', `${window.location.origin}/petromin-auth`);
        router.push(url.href);
        window.location.href = url.href;
    }, [])

    return (
        <>
            {/*<Formik*/}
            {/*  initialValues={{*/}
            {/*    email: 'admin@petromin.com',*/}
            {/*    password: '123456',*/}
            {/*    submit: null*/}
            {/*  }}*/}
            {/*  validationSchema={Yup.object().shape({*/}
            {/*    email: Yup.string().email('Must be a valid email').max(255).required('Email is required'),*/}
            {/*    password: Yup.string().max(255).required('Password is required')*/}
            {/*  })}*/}
            {/*  onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {*/}
            {/*    try {*/}
            {/*      // await login(values.email, values.password);*/}
            {/*      // if (scriptedRef.current) {*/}
            {/*      //   setStatus({ success: true });*/}
            {/*      //   setSubmitting(false);*/}
            {/*      // }*/}
            {/*    } catch (err: any) {*/}
            {/*      // console.error(err);*/}
            {/*      // if (scriptedRef.current) {*/}
            {/*      //   setStatus({ success: false });*/}
            {/*      //   setErrors({ submit: err.message });*/}
            {/*      //   setSubmitting(false);*/}
            {/*      // }*/}
            {/*    }*/}
            {/*  }}*/}
            {/*>*/}
            {/*  {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (*/}
            {/*    <form noValidate onSubmit={handleSubmit}>*/}
            {/*      <Grid container spacing={3}>*/}
            {/*        <Grid item xs={12}>*/}
            {/*          <Stack spacing={1}>*/}
            {/*            <InputLabel htmlFor="email-login">Email Address</InputLabel>*/}
            {/*            <OutlinedInput*/}
            {/*              id="email-login"*/}
            {/*              type="email"*/}
            {/*              value={values.email}*/}
            {/*              name="email"*/}
            {/*              onBlur={handleBlur}*/}
            {/*              onChange={handleChange}*/}
            {/*              placeholder="Enter email address"*/}
            {/*              fullWidth*/}
            {/*              error={Boolean(touched.email && errors.email)}*/}
            {/*            />*/}
            {/*            {touched.email && errors.email && (*/}
            {/*              <FormHelperText error id="standard-weight-helper-text-email-login">*/}
            {/*                {errors.email}*/}
            {/*              </FormHelperText>*/}
            {/*            )}*/}
            {/*          </Stack>*/}
            {/*        </Grid>*/}
            {/*        <Grid item xs={12}>*/}
            {/*          <Stack spacing={1}>*/}
            {/*            <InputLabel htmlFor="password-login">Password</InputLabel>*/}
            {/*            <OutlinedInput*/}
            {/*              fullWidth*/}
            {/*              error={Boolean(touched.password && errors.password)}*/}
            {/*              id="-password-login"*/}
            {/*              type={showPassword ? 'text' : 'password'}*/}
            {/*              value={values.password}*/}
            {/*              name="password"*/}
            {/*              onBlur={handleBlur}*/}
            {/*              onChange={handleChange}*/}
            {/*              endAdornment={*/}
            {/*                <InputAdornment position="end">*/}
            {/*                  <IconButton*/}
            {/*                    aria-label="toggle password visibility"*/}
            {/*                    onClick={handleClickShowPassword}*/}
            {/*                    onMouseDown={handleMouseDownPassword}*/}
            {/*                    edge="end"*/}
            {/*                    color="secondary"*/}
            {/*                  >*/}
            {/*                    {showPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}*/}
            {/*                  </IconButton>*/}
            {/*                </InputAdornment>*/}
            {/*              }*/}
            {/*              placeholder="Enter password"*/}
            {/*            />*/}
            {/*            {touched.password && errors.password && (*/}
            {/*              <FormHelperText error id="standard-weight-helper-text-password-login">*/}
            {/*                {errors.password}*/}
            {/*              </FormHelperText>*/}
            {/*            )}*/}
            {/*          </Stack>*/}
            {/*        </Grid>*/}

            {/*        <Grid item xs={12} sx={{ mt: -1 }}>*/}
            {/*          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>*/}
            {/*            <FormControlLabel*/}
            {/*              control={*/}
            {/*                <Checkbox*/}
            {/*                  checked={checked}*/}
            {/*                  onChange={(event) => setChecked(event.target.checked)}*/}
            {/*                  name="checked"*/}
            {/*                  color="primary"*/}
            {/*                  size="small"*/}
            {/*                />*/}
            {/*              }*/}
            {/*              label={<Typography variant="h6">Keep me sign in</Typography>}*/}
            {/*            />*/}
            {/*            <Link href="/forgot-password" color="text.primary">*/}
            {/*              Forgot Password?*/}
            {/*            </Link>*/}
            {/*          </Stack>*/}
            {/*        </Grid>*/}
            {/*        {errors.submit && (*/}
            {/*          <Grid item xs={12}>*/}
            {/*            <FormHelperText error>{errors.submit}</FormHelperText>*/}
            {/*          </Grid>*/}
            {/*        )}*/}
            {/*        <Grid item xs={12}>*/}
            {/*          <AnimateButton>*/}
            {/*            <Button disableElevation disabled={isSubmitting} fullWidth size="large" type="submit" variant="contained" color="primary">*/}
            {/*              Login*/}
            {/*            </Button>*/}
            {/*          </AnimateButton>*/}
            {/*        </Grid>*/}
            {/*      </Grid>*/}
            {/*    </form>*/}
            {/*  )}*/}
            {/*</Formik>*/}
                <Grid item xs={12}>
                <AnimateButton>
                    <Button disableElevation fullWidth size="large" type="submit" variant="contained" color="primary" onClick={onLoginButtonClickHandler}>
                        Login
                    </Button>
                </AnimateButton>
            </Grid>
            <Grid item xs={12} sx={{mt: 1}}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                    <Stack/>
                    <Link href="/forgot-password" color="primary">
                        Forgot Password?
                    </Link>
                </Stack>
            </Grid>
        </>
    );
};

export default AuthLogin;
