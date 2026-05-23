
import ProfileForm from "@/components/profile/ProfileForm";
import { useAuth } from "@/components/auth/AuthProvider";
import { Navigate } from "react-router-dom";

const Profile = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/auth" />;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-foreground">My Profile</h1>
      <ProfileForm />
    </div>
  );
};

export default Profile;
