'use client';
import { globalUser } from "@/config/UserContext";
const TFAPage = () => {
  const user = globalUser();
  console.log(user);

  return (
  <>
    {user ? (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {user.email}</div>
    ) :(
      <>Bye</>
    )}
  </>
)
};

export default TFAPage;