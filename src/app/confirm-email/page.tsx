 "use client";

 import Link from 'next/link';
 import { MailCheck } from 'lucide-react';
 
 export default function ConfirmEmailPage() {
   return (
     <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
       <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md text-center">
         <div className="flex justify-center">
           <MailCheck className="w-16 h-16 text-green-600" />
         </div>
         <h1 className="text-2xl font-bold text-gray-900">Confirm Your Email</h1>
         <p className="text-gray-600">
           We've sent a confirmation link to your email address. Please click the link in the email to complete your registration.
         </p>
         <p className="text-sm text-gray-500">
           If you don't see the email, please check your spam folder.
         </p>
         <div>
           <Link href="/signin" className="font-medium text-green-600 hover:underline">
             Back to Sign In
           </Link>
         </div>
       </div>
     </div>
   );
 }