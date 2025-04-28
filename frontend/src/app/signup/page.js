'use client';

import { Suspense } from 'react';
import Signup from '../../components/Signup';
import Footer from '../../components/Footer';

const SignupPage = () => {
  return (
    <>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">Loading...</div>}>
        <Signup />
      </Suspense>
      <Footer />
    </>
  );
};

export default SignupPage; 