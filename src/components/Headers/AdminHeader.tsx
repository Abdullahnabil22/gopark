import { useAuth } from "../../hooks/useAuth";
import { MdDocumentScanner } from "react-icons/md";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import BaseHeader from "./BaseHeader";

export default function AdminHeader() {
  const { user, logout } = useAuth();

  const mobileAdditionalContent = (
    <>
    <Button variant="primary" onClick={logout}>
        Logout
      </Button>
    </>
  );

  const rightContent = (
    <>
      <Badge className="bg-green-100 text-green-800 text-sm lg:text-base">
        {user?.username}
      </Badge>
      <Button variant="primary" onClick={logout}>
        Logout
      </Button>
    </>
  );

  return (
    <BaseHeader
      icon={MdDocumentScanner}
      title="Admin Dashboard"
      subtitle="System Management & Control"
      rightContent={rightContent}
      additionalContent={mobileAdditionalContent}
    />
  );
}
