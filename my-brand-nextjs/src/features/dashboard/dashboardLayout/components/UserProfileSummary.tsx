import React from "react";
import Image from "next/image";

const UserProfileSummary: React.FC = () => (
  <div className="bg-white shadow-lg rounded-xl p-6 flex items-center space-x-4">
    <Image
      src="/images/mypic.png"
      alt="User Avatar"
      width={64}
      height={64}
      className="rounded-full object-cover"
    />
    <div>
      <div className="font-bold text-lg text-gray-900">Admin User</div>
      <div className="text-gray-500">Super Admin</div>
    </div>
  </div>
);

export default UserProfileSummary;
