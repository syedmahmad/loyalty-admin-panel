"use client"
import React, { useEffect } from "react";
import AuthWrapper from "../../login/_components/AuthWrapper";
import { useQuery } from "@tanstack/react-query";
import { GET, POST } from "@/utils/AxiosUtility";
import TableLoader from "@/components/loaders/TableLoader";
import NotFound from "@/components/errors/404";
import UnsubscribePage from "./MainPage";
import { useSearchParams } from "next/navigation";

const MainLayout = () => {
  const searchParams = useSearchParams();
  const number = searchParams.get('number');
  const email = searchParams.get('email');
  const [userEmail, setUserEmail] = React.useState(null);
  const [userNumber, setUserNumber] = React.useState(null);
  let decryptedNumber: any = null;
  let decryptedEmail: any = null;

  useEffect(() => {
    const getUserData = async () => {
      let userData;
      if (!number && !email) return;

      if (number && !email) {
        decryptedNumber = await GET(`/unsubscribe/decrypted-user/${number}`);
        if (decryptedNumber?.status === 200) {
          userData = await GET(`${process.env.NEXT_PUBLIC_USER_INFO_ENDPOINT}/profile/get-user/${decryptedNumber?.data.data}`);
        }
      }
        
      if (email && !number) {
        decryptedEmail = await GET(`/unsubscribe/decrypted-user/${email}`);
        if (decryptedEmail?.status === 200) {
          userData = await GET(`${process.env.NEXT_PUBLIC_USER_INFO_ENDPOINT}/profile/get-user/${decryptedEmail?.data.data}`);
          
        }
        
      }
      if (userData?.status === 404) {
        return;
      }
       
      if (userData?.data) {
        setUserEmail(userData?.data?.data?.EmailAddress ?? decryptedEmail?.data.data);
        setUserNumber(userData?.data?.data?.MobileNumber ?? decryptedNumber?.data.data);
      }
    }

    getUserData();
  }, []);

  const getAllPreviousUnsubscribeData = useQuery({
    queryKey: ["get-all-previous-unsubscribe-data"],
    queryFn: async () => await GET(`/unsubscribe/all-previous?number=${number}&email=${email}`),
  });

  const emailCategoryQuery = useQuery({
    queryKey: ["get-email-category-data"],
    queryFn: async () => await GET("/categories/email"),
  });

  const smsCategoryQuery = useQuery({
    queryKey: ["get-sms-category-data"],
    queryFn: async () => await GET("/categories/sms"),
  });

  const whatsappCategoryQuery = useQuery({
    queryKey: ["get-whatsapp-category-data"],
    queryFn: async () => await GET("/categories/whatsapp"),
  });

  if (
    emailCategoryQuery.isPending ||
    smsCategoryQuery.isPending ||
    whatsappCategoryQuery.isPending ||
    getAllPreviousUnsubscribeData.isPending
  )
    return <TableLoader />;

  if (getAllPreviousUnsubscribeData.error || getAllPreviousUnsubscribeData.data?.status === 404 || emailCategoryQuery.error || emailCategoryQuery.data?.status === 404 || smsCategoryQuery.error || smsCategoryQuery.data?.status === 404 || whatsappCategoryQuery.error || whatsappCategoryQuery.data?.status === 404)
    return <NotFound />;

  return (
    <AuthWrapper>
      <UnsubscribePage
        emailCategories={emailCategoryQuery?.data?.data}
        smsCategories={smsCategoryQuery?.data?.data}
        whatsappCategories={whatsappCategoryQuery?.data?.data}
        resp={getAllPreviousUnsubscribeData?.data?.data}
        number={number}
        email={email}
        userEmail={userEmail}
        userNumber={userNumber}
      />
    </AuthWrapper>
  )
}

export default MainLayout;